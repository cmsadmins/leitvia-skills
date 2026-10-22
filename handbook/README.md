# Leitvia agent handbook

Generated from Leitvia Studio 1.0.0. Do not edit.

Everything an agent needs to work on a WordPress site with Leitvia Studio through its 37 abilities: how to call them, how hashes, autonomy and change packages work, what a rejection means and what each ability takes and returns. Agents change the site only through these abilities: no SQL, no write routes of WordPress core, no WP-CLI. Reading public pages of the site is allowed.

## Access over MCP and REST

Sign in as a WordPress user that may edit posts, with an application password (HTTP Basic auth). Use a user of its own for the agent; every call is logged under that user.

**Which site.** Every path below starts at the address of the site, not at the host. A site of a multisite network in a subdirectory has a path: on `https://example.org/club/` the MCP server is `https://example.org/club/wp-json/leitvia-studio/v1/mcp`, and `/wp-json/` straight after the host reaches another site of the network. Call `leitvia/get-contract` first: `site.url` is the address of the site the connection works on and `site.rest` its REST base. Compare `site.url` with the address of your task before the first write and stop when they differ. An application password that Leitvia Studio created in a network works on its own site only; another site answers 401.

**MCP.** The server `leitvia` answers at `POST /wp-json/leitvia-studio/v1/mcp` when the plugin MCP Adapter 0.7 is active. Send `initialize` first; its response carries the header `Mcp-Session-Id`. Every further request sends that header and `MCP-Protocol-Version` (for example `2025-06-18`), otherwise the server answers with 400. `tools/list` lists the abilities; a tool is named like its ability with a hyphen in place of the slash (`leitvia-get-contract` for `leitvia/get-contract`). `tools/call` takes the input of the ability as `arguments`. A rejection comes back as a tool result with `isError` true whose text is JSON with `code`, `message` and `data`.

**REST.** Every ability runs at `/wp-json/wp-abilities/v1/abilities/<name>/run`, for example `/wp-json/wp-abilities/v1/abilities/leitvia/get-contract/run`. The HTTP method follows the annotations: read only abilities take GET, abilities that are destructive and idempotent take DELETE, all others POST. GET and DELETE send the input as query arguments (`?input[post]=12`, lists as `input[upsells][]=4&input[upsells][]=7`), POST sends it as JSON body `{"input": {…}}`. Another method gets 405. A rejection is an error response with `code`, `message` and `data`; the HTTP status is `data.status`.

Each ability below names its MCP tool and its REST method.

## Read before write

Read first, then write. The read abilities return what a write needs: post IDs, block IDs from `leitvia/get-page-outline`, pattern slugs from `leitvia/list-patterns`, blocks and their attributes from `leitvia/list-blocks`, page frames, color roles and template parts from `leitvia/get-contract`, and the hash of every target. Plan a page with `leitvia/plan-page` and score it with `leitvia/check-composition` before you build it. After a write, read the target again or use the `hash` of the write result for the next change.

The checks after a write (links, contrast) run as a WP-Cron event. On a site where WP-Cron does not run by itself, such as WordPress Playground, call `GET /wp-cron.php` after writes; the result lands in the audit log.

## Hashes and base_hash

Every write ability requires `base_hash`: the hash of the target as you last read it, 16 hex characters. Before it writes, the pipeline compares it with the current hash of the target; when someone changed the target in between, the write is rejected with `leitvia_stale_hash`, which carries `current_hash`. Read the target again and repeat the change on the current state, once.

- A new object (a new page, pattern, token set or image) has no hash: send an empty `base_hash`.
- A post, page, attachment, navigation menu or template part: `hash` of `leitvia/get-page-outline`, which is also `document_hash` of `leitvia/get-block`. Block hashes are for comparing blocks; `base_hash` is always the hash of the whole document.
- A product: `hash` of `leitvia/get-product` or `leitvia/list-products`. A product category or tag: the hash of the term from the same abilities.
- Targets no read ability returns a hash for (global styles, the content model, a menu or template part whose ID you do not know): send an empty `base_hash`, take `current_hash` from the rejection `leitvia_stale_hash` and repeat the call once with it.

The result of a write carries the new `hash`; use it as `base_hash` of the next change of the same target.

## Write results

Most write abilities return the result of the pipeline:

| Field | Meaning |
|---|---|
| `mode` | `live` (written and visible), `draft` (written as a draft), `package` (stored in a change package for a person), `unchanged` (the target already had this state; nothing was written or stored) |
| `level` | autonomy level that applied |
| `kinds` | content kinds the change touches |
| `target` | the object, for example `{"post": 12}` |
| `hash` | hash of the target after the write |
| `package` | ID of the change package, 0 for none |
| `snapshot` | ID of the snapshot a rollback restores, 0 for none |
| `findings` | warnings of the checks; errors reject the write. Only findings the write brings or makes worse count; findings the target already had do not block it |
| `report` | further data of some abilities |

## Autonomy levels and content kinds

The site owner sets how far agents may go per area. The pipeline takes the level of the area of a write:

| Level | Effect on a write |
|---|---|
| `locked` | Agents may not change the area. Every write is rejected with `leitvia_locked`. |
| `suggest` | Every write lands in a change package for a person to decide. |
| `draft` | New posts are created as drafts and drafts change directly. Changes that visitors would see (published posts, terms, options) land in a change package. |
| `autonomous` | Writes go live. A write with warnings among its findings lands in a change package. |

Default levels per area (profile standard; the site owner can change them):

| Area | Default | What it covers |
|---|---|---|
| `content` | `draft` | Pages, posts and media. |
| `corrections` | `autonomous` | Small fixes such as alt text and internal links. |
| `structure` | `draft` | Content model, navigation, Lab patterns and sections of pages. |
| `design` | `suggest` | Token sets, global styles and template parts. |
| `admin` | `locked` | Plugins, users and settings. Always locked. |
| `products` | `draft` | Products, product categories and tags of the shop. |

Some content kinds lower the level to at most `suggest`, whatever the area allows, unless a person unlocked the kind in the settings. The result lists them in `kinds`.

| Kind | Covers |
|---|---|
| `prices` | Pricing blocks, price columns of comparison tables and product prices. |
| `legal` | Pages with a legal page kind (imprint, privacy, terms, withdrawal, accessibility) and the privacy policy page. |
| `slugs` | A changed slug, which changes a URL. |
| `organization` | Site options such as the site title, the logo and the reading settings. |
| `tax` | Tax status and tax class of products. |
| `shipping` | Shipping class of products. |

Changes of site options land in a change package unless the user may manage options. Agents can neither raise a level nor unlock a kind; tell the person when the work needs it.

## Mode package

Every write ability takes `package`, a key of the task of at most 64 characters. A write with a key always ends up in the change package of that key, even where the level of its area would let it go live; the result returns the package ID in `package`, and a person reviews and applies the package in the inbox of Leitvia Studio. Send the same key on every write of one task, for example `homepage-2026-10`, so the person gets one package instead of many. Without a key the levels decide, and every write they hold back gets a package of its own. The same change sent twice is stored once. Several writes of one task to the same post, option or term build on each other: send the hash you read as usual; the later write changes the target as the earlier ones in the package left it and always waits in the package, and applying writes them in order.

`leitvia/list-packages` lists your packages, `leitvia/get-package` shows the diff per operation. Agents may apply (`leitvia/apply-package`) and roll back (`leitvia/rollback`) only operations whose level is `autonomous`; everything else is `leitvia_needs_human` and waits for a person.

## Rejections

A rejection carries `code`, a `message` that says how to fix it, and `data` with `status` (HTTP), `reason`, `target`, `next_ability` (the ability to call next, empty for none) and `retry`, plus details such as `current_hash` or `findings` where they apply.

| Retry | What the agent does |
|---|---|
| `once` | Correct the call once, following message and `next_ability`. If the second call is rejected too, stop and ask a person. |
| `never` | Do not repeat the call. Stop and tell the person the message; it needs a person or a different approach. |
| `after:<seconds>` | Wait the given seconds, then repeat the same call. |

Every rejection of Leitvia Studio with its retry rule and next ability. Messages with `%s` or `%d` get a value at run time; codes with several rows come from several places.

| Code | HTTP | Retry | Next ability | Message |
|---|---|---|---|---|
| `leitvia_ai_failed` | 502 | `never` | set at run time | The AI provider refused or failed the request. An administrator checks the connector under Settings, Connectors; until then, call again with ai set to false. |
| `leitvia_ai_invalid_response` | 502 | `once` | set at run time | The AI model answered with data that does not match the expected format. Try once more, or call again with ai set to false. |
| `leitvia_ai_invalid_response` | 502 | `once` | set at run time | The AI model named no pattern of this site. Try once more, or call again with ai set to false. |
| `leitvia_ai_not_approved` | 503 | `never` | set at run time | The AI provider could not be reached, or an administrator has not approved this request for the connector yet. When the AI plugin is active, an administrator approves pending connector requests in its settings; until then, call again with ai set to false. |
| `leitvia_ai_timeout` | 504 | `once` | set at run time | The AI provider did not answer within %d seconds. Try once more, or call again with ai set to false. |
| `leitvia_ai_unavailable` | 424 | `never` | set at run time | AI is not available on this site: it needs WordPress with the AI client, AI switched on and a connector with a text model set up by an administrator under Settings, Connectors. Call again with ai set to false for a plan without AI. |
| `leitvia_check_failed` | 422 | `once` | `leitvia/set-alt-text` | A product image needs alt text that describes it. Set it with leitvia/set-alt-text and try again. |
| `leitvia_check_failed` | 422 | `once` | set at run time | Checks found problems. Fix them as each finding suggests and try again. |
| `leitvia_check_failed` | 422 | `once` | none | Checks found problems. Fix them as each finding suggests and try again. |
| `leitvia_check_failed` | 422 | `once` | none | The image needs alt text that describes it, or mark it as decorative. |
| `leitvia_cli_no_user` | 401 | `never` | none | This command acts as a user; run with --user=\<agent or admin>. |
| `leitvia_deprecated_pattern` | 422 | `once` | `leitvia/get-pattern` | The pattern is deprecated. Use its replacement instead. |
| `leitvia_execution_failed` | 500 | `never` | none | The change could not be saved; nothing was changed. Try again later. |
| `leitvia_execution_failed` | 500 | `never` | none | The file could not be saved; nothing was changed. Try again later. |
| `leitvia_forbidden` | 403 | `never` | none | Agents change the site through the %s abilities only. |
| `leitvia_forbidden` | 403 | `never` | none | Sign in as a user who may edit content. |
| `leitvia_forbidden` | 403 | `never` | `leitvia/list-packages` | This change package belongs to someone else. |
| `leitvia_forbidden` | 403 | `never` | none | Your user may not change this object. |
| `leitvia_forbidden` | 403 | `never` | none | Your user may not create change packages. |
| `leitvia_forbidden` | 403 | `never` | none | Your user may not publish this. |
| `leitvia_forbidden` | 403 | `never` | none | Your user may not read this token set. |
| `leitvia_forbidden_field` | 403 | `once` | none | Agents may not set showInAbilities. Whether content is open to AI abilities is the decision of a person; remove the field and try again. |
| `leitvia_foreign_host` | 422 | `once` | none | Media from other hosts is not fetched. Send the file as Base64 data instead. |
| `leitvia_import_conflict` | 409 | `never` | none | Targets changed on this site since the package was made. Nothing was imported; compare and export again. |
| `leitvia_invalid_input` | 422 | `once` | set at run time | Built at run time; read the message. |
| `leitvia_invalid_input` | 422 | `never` | none | No link needs or allows a repair. The report lists external links and internal links that could not be resolved. |
| `leitvia_invalid_input` | 400 | `once` | `leitvia/list-patterns` | Pass pattern slugs, or a post whose sections come from patterns. |
| `leitvia_invalid_input` | 400 | `once` | `leitvia/get-contract` | The contract has no page frame of this type. |
| `leitvia_invalid_package` | 400 | `never` | none | Built at run time; read the message. |
| `leitvia_locked` | 403 | `never` | none | Agents may not change this area. A person can change the autonomy settings. |
| `leitvia_media_missing` | 422 | `never` | `leitvia/add-media` | The file of a new image is not on this site any more. Add the image again with leitvia/add-media, then export. |
| `leitvia_needs_human` | 403 | `never` | none | A person has to decide on these operations in the inbox. Apply only operations whose area is autonomous for you. |
| `leitvia_no_contract` | 409 | `never` | none | The active theme has no valid Leitvia contract. Activate the Leitvia theme or fix its contract file. |
| `leitvia_no_replacement` | 422 | `never` | `leitvia/list-patterns` | There is no deprecated pattern with an available replacement here. Choose a pattern and change the section by hand or with leitvia/compose-page. |
| `leitvia_not_found` | 404 | `once` | `leitvia/get-page-outline` | The page has no block with this ID. Read the page outline for the current IDs. |
| `leitvia_not_found` | 404 | `once` | `leitvia/get-page-outline` | There is no block with this ID. Read the outline for the current IDs. |
| `leitvia_not_found` | 404 | `once` | `leitvia/list-patterns` | There is no pattern with this slug. List the patterns for the current slugs. |
| `leitvia_not_found` | 404 | `once` | `leitvia/get-page-outline` | There is no top-level section with this ID. Read the outline for the current IDs. |
| `leitvia_out_of_scope` | 403 | `never` | none | Agents may not change this object. Only published or draft content of the allowed post types is open to them. |
| `leitvia_out_of_scope` | 403 | `never` | none | Agents may not read this object. Only published or draft content of the allowed post types is open to them. |
| `leitvia_out_of_scope` | 403 | `never` | none | Agents may not see or change this object. Only products, product categories and tags are open to them, never orders, refunds, coupons or customers. |
| `leitvia_out_of_scope` | 403 | `once` | none | Agents may not set this status. Use draft, pending or publish. |
| `leitvia_package_closed` | 409 | `never` | `leitvia/get-package` | The change package is %s; this step is not possible in that state. |
| `leitvia_page_missing` | 409 | `never` | none | The page this setting points to is not applied yet. Apply the page first. |
| `leitvia_pattern_not_approved` | 422 | `once` | `leitvia/list-patterns` | The Lab pattern is not approved yet. Use an approved pattern, or ask a person to approve this one in the Lab. |
| `leitvia_rate_limited` | 429 | `after:<seconds>` | none | Too many calls. Try again in %d seconds. |
| `leitvia_recipe_unavailable` | 422 | `never` | `leitvia/list-recipes` | Built at run time; read the message. |
| `leitvia_rollback_conflict` | 409 | `never` | `leitvia/get-package` | Someone changed the content after the package was applied. Nothing was rolled back; compare the changes and decide by hand. |
| `leitvia_stale_hash` | 409 | `once` | none or `leitvia/get-page-outline` | The target changed since it was read. Read it again and repeat the change on the current state. |
| `leitvia_static_markup` | 422 | `once` | `leitvia/compose-page` | This change needs markup that cannot be rebuilt safely. Insert the pattern again with leitvia/compose-page, or change a block that supports it. |
| `leitvia_too_large` | 413 | `once` | none | The change is too large to compare (more than %d KB). Split it into smaller changes. |
| `leitvia_unknown_package` | 404 | `never` | `leitvia/list-packages` | There is no change package with this ID. List the packages and use one of them. |
| `leitvia_unknown_pattern` | 404 | `once` | `leitvia/list-patterns` | There is no pattern with this name for this template part. List the patterns of its area and use one of them. |
| `leitvia_unknown_pattern` | 404 | `once` | `leitvia/list-patterns` | There is no pattern with this name. List the patterns and use one of them. |
| `leitvia_unknown_recipe` | 404 | `once` | `leitvia/list-recipes` | There is no recipe with this name. List the recipes and use one of them. |
| `leitvia_unsafe_content` | 422 | `once` | `leitvia/list-blocks` | The content holds markup agents may not write: scripts, event attributes, Custom HTML blocks, classic blocks or Base64 data. Use registered blocks and media from the library. |

## Abilities

### Read

Read abilities change nothing. Call them first: they return the IDs, block IDs and hashes the write abilities need.

| Ability | Label | REST |
|---|---|---|
| [`leitvia/audit-site`](#leitviaaudit-site) | Audit site | GET |
| [`leitvia/check-composition`](#leitviacheck-composition) | Check composition | GET |
| [`leitvia/get-block`](#leitviaget-block) | Get block | GET |
| [`leitvia/get-content-model`](#leitviaget-content-model) | Get content model | GET |
| [`leitvia/get-contract`](#leitviaget-contract) | Get contract | GET |
| [`leitvia/get-package`](#leitviaget-package) | Get change package | GET |
| [`leitvia/get-page-outline`](#leitviaget-page-outline) | Get page outline | GET |
| [`leitvia/get-pattern`](#leitviaget-pattern) | Get pattern | GET |
| [`leitvia/get-product`](#leitviaget-product) | Get product | GET |
| [`leitvia/get-tokens`](#leitviaget-tokens) | Get tokens | GET |
| [`leitvia/list-blocks`](#leitvialist-blocks) | List blocks | GET |
| [`leitvia/list-packages`](#leitvialist-packages) | List change packages | GET |
| [`leitvia/list-patterns`](#leitvialist-patterns) | List patterns | GET |
| [`leitvia/list-products`](#leitvialist-products) | List products | GET |
| [`leitvia/list-recipes`](#leitvialist-recipes) | List recipes | GET |
| [`leitvia/plan-page`](#leitviaplan-page) | Plan page | GET |

#### leitvia/audit-site

**Audit site.** Runs the content checks (headings, alt text, link text, block validity, tokens, contrast, one h1 and landmarks) over published content, at most 20 posts per call in ID order. Also reports classic content without blocks, deprecated patterns, preset slugs missing from the active tokens, internal links that lead to no page or to the old address of a renamed post, and pages that look like legal texts without a page kind. Pass next as after for the following page; next is null at the end.

MCP tool `leitvia-audit-site`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `after` | integer, min `0`, default `0` |  | Start after this post ID, the next value of the previous call. |
| `limit` | integer, min `1`, max `20`, default `10` |  | Posts per call. |

Output: `items` array of object; `next` integer or null.

#### leitvia/check-composition

**Check composition.** Scores a page against the composition rules of the contract: pass pattern slugs in page order (block:\<ID> for a Lab pattern; only approved ones count as known), or a post ID to read the sections of a saved page from metadata.patternName. Returns the findings (rule and 0-based section index), the score from 100 down, the minimum score for autonomous writes and per finding up to three patterns that would fix it.

MCP tool `leitvia-check-composition`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `slugs` | array of string, max length `100`, max items `40` |  |  |
| `post` | integer, min `1` |  |  |
| `template` | string, max length `100` |  | Template slug, for example page-landing; for a post its saved template is used. |

Output: `sections` array of string; `issues` array of object { rule, index, message }; `score` integer; `min_score` integer; `suggestions` array of object.

#### leitvia/get-block

**Get block.** Returns one block of a post by its ID or path ID with all attributes, its own markup, the attachments of the images in that markup, its hash, the IDs of its children and the document hash. Classic content without blocks is one block p:0 named core/freeform.

MCP tool `leitvia-get-block`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `post` | integer, min `1` | yes | Post ID. |
| `block` | string, min length `1`, max length `200` | yes | Block ID from the page outline. |

Output: `id` string; `id_stable` boolean; `name` string; `attributes` object; `inner_html` string; `attachments` array of object { id, url }; `hash` string; `children` array of string; `document_hash` string.

#### leitvia/get-content-model

**Get content model.** Returns the content model declaration: post types, taxonomies, fields, relations and site settings with their definitions, never content. valid is false when the declaration fails the schema and nothing of it is registered.

MCP tool `leitvia-get-content-model`, REST GET. Annotations: readonly true, destructive false, idempotent true.

No input.

Output: `declaration` object; `valid` boolean; `error` string.

#### leitvia/get-contract

**Get contract.** Returns the site this connection works on (address, REST base, name, language, whether it is part of a multisite network) and the design contract of the active theme: version, rules, color roles, contrast pairs, composition rules, page frames, template parts, templates, block styles and style variations. Compare site.url with the address of your task before the first write. Patterns come from list-patterns, blocks from list-blocks.

MCP tool `leitvia-get-contract`, REST GET. Annotations: readonly true, destructive false, idempotent true.

No input.

Output: `site` object { url\*, rest\*, name\*, language\*, multisite\* }; `version` string; `contract` object { rules, roles, pairs, compositionRules, pageFrames, templateParts, templates, blockStyles, variations }.

#### leitvia/get-package

**Get change package.** Returns a change package with its operations: status, conflicts and, for open operations, a block diff against the current state (per block added, removed, moved or changed with text before and after and the changed attributes).

MCP tool `leitvia-get-package`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | integer, min `1` | yes | Change package ID. |

Output: object.

#### leitvia/get-page-outline

**Get page outline.** Returns a post as a compact block tree: per block the ID, name, pattern, the first 80 characters of text, size, hash and children. Blocks without a stable ID have a path ID such as p:0.2.1 until the next save. Use the document hash as base_hash for changes and get-block for full attributes.

MCP tool `leitvia-get-page-outline`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `post` | integer, min `1` | yes | Post ID. |

Output: `id` integer; `type` string; `hash` string; `title` string; `status` string; `template` string; `kind` string; `blocks` array of object.

#### leitvia/get-pattern

**Get pattern.** Returns one pattern of the theme or of Leitvia Studio with its markup, metadata and the first 20 posts and templates that use it (more is true when there are further ones).

MCP tool `leitvia-get-pattern`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `slug` | string, min length `1`, max length `200` | yes | Pattern slug from list-patterns, for example leitvia/hero-split-image, or block:\<ID> for a Lab pattern. |

Output: `slug` string; `content` string; `usage` object { items, more }.

#### leitvia/get-product

**Get product.** Returns one product or variation: texts, images with alt text, categories and tags with their hash, attributes, price (read only), tax and shipping class, stock status, merchandising and the hash to use as base_hash. No sales, order or customer figures.

MCP tool `leitvia-get-product`, REST GET. Annotations: readonly true, destructive false, idempotent true. Only registered while woocommerce is active.

| Input | Type | Required | Description |
|---|---|---|---|
| `product` | integer, min `1` | yes |  |

Output: `id` integer; `type` string; `title` string; `description` string; `short_description` string; `images` array of object; `categories` array of object; `tags` array of object; `attributes` array of object; `price` object; `stock_status` string; `hash` string.

#### leitvia/get-tokens

**Get tokens.** Returns the active design tokens as a DTCG document (of the active token set, else of the current global styles), the token sets with their status, the active style variations, whether the global styles drifted from the active set and the contrast findings of the current palette.

MCP tool `leitvia-get-tokens`, REST GET. Annotations: readonly true, destructive false, idempotent true.

No input.

Output: `active` integer; `source` one of `set`, `global_styles`; `document` object; `sets` array of object { id, title, status, modified }; `variations` array of string; `drift` boolean; `contrast` array of object.

#### leitvia/list-blocks

**List blocks.** Returns the block catalog of Leitvia Studio and its add-ons with attribute schema and usage rules. With post_type only the blocks the editor allows for that post type.

MCP tool `leitvia-list-blocks`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `post_type` | string, max length `20` |  | Limit to the blocks allowed for this post type. |

Output: `blocks` array of object { name\*, title\*, description\*, category\*, parent\*, ancestor\*, supports\*, attributes\*, innerBlocks\*, usage\*, owner\*, extension }.

#### leitvia/list-packages

**List change packages.** Lists your change packages, newest first: ID, title, key, state (open, applied, partial, rejected, rolled_back), operations per status and a preview link.

MCP tool `leitvia-list-packages`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `state` | one of `open`, `applied`, `partial`, `rejected`, `rolled_back` |  |  |

Output: array of object.

#### leitvia/list-patterns

**List patterns.** Lists the patterns of the theme, of Leitvia Studio and of its add-ons (source addon) with composition metadata, image slots, when to use and avoid them, lab status and the replacement of deprecated ones, followed by the Lab patterns (slug block:\<ID>, source lab) with their lab status, version and document hash, and the composition of the theme pattern they vary. Only approved Lab patterns count as known in check-composition. Filter by role, tone, layout or category; at most 50 per page. Markup and usage come from get-pattern.

MCP tool `leitvia-list-patterns`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `role` | string, max length `100` |  | Filter by this value of the composition metadata. |
| `tone` | string, max length `100` |  | Filter by this value of the composition metadata. |
| `layout` | string, max length `100` |  | Filter by this value of the composition metadata. |
| `category` | string, max length `100` |  | Filter by pattern category. |
| `page` | integer, min `1`, default `1` |  |  |
| `per_page` | integer, min `1`, max `50`, default `20` |  |  |

Output: `items` array of object; `total` integer; `pages` integer.

#### leitvia/list-products

**List products.** Lists the products of the shop, 20 per page, with title, type, status, price (read only), stock status, featured flag and hash, plus all product categories with their hash. Filter by category or search text. Orders, coupons and customers are never listed.

MCP tool `leitvia-list-products`, REST GET. Annotations: readonly true, destructive false, idempotent true. Only registered while woocommerce is active.

| Input | Type | Required | Description |
|---|---|---|---|
| `category` | integer, min `1` |  |  |
| `search` | string, max length `100` |  |  |
| `page` | integer, min `1` |  |  |

Output: `products` array of object; `total` integer; `pages` integer; `categories` array of object.

#### leitvia/list-recipes

**List recipes.** Lists the site recipes of Leitvia Studio and its add-ons with owner, pages and whether the plugins they require are active.

MCP tool `leitvia-list-recipes`, REST GET. Annotations: readonly true, destructive false, idempotent true.

No input.

Output: array of object { name, owner, label, title, description, requires, pages, available, reason }.

#### leitvia/plan-page

**Plan page.** Proposes a page for a goal and content points: page frame, template, the patterns in page order with role, slot, text lengths and the points each section carries, and the composition score. Without AI the plan follows the page frames, examples and composition rules of the contract and is the same for the same input. With ai set to true the AI connector the site owner set up in WordPress refines it; the goal, the points and pattern names with their metadata are sent to that provider. Writes nothing; build the page with leitvia/compose-page.

MCP tool `leitvia-plan-page`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `goal` | string, min length `1`, max length `500` | yes |  |
| `points` | array of string, max length `300`, max items `20` |  |  |
| `frame` | one of `home`, `service`, `article`, `about`, `contact` |  | Type of a page frame; without it the frame named in the goal, else home. |
| `ai` | boolean, default `false` |  | Refine the plan through the AI connector of the site. Sends the goal, the points and pattern names to that provider. |

Output: `frame` string; `template` string; `sections` array of object; `score` integer; `issues` array of object; `source` one of `rules`, `ai`; `dropped` array of string.

### Set up

Content model, design tokens, style variation, template parts, navigation and recipes.

| Ability | Label | REST |
|---|---|---|
| [`leitvia/activate-token-set`](#leitviaactivate-token-set) | Activate token set | POST |
| [`leitvia/apply-recipe`](#leitviaapply-recipe) | Apply recipe | POST |
| [`leitvia/create-token-set`](#leitviacreate-token-set) | Create token set | POST |
| [`leitvia/define-content-type`](#leitviadefine-content-type) | Define content type | POST |
| [`leitvia/set-variation`](#leitviaset-variation) | Set style variation | POST |
| [`leitvia/update-navigation`](#leitviaupdate-navigation) | Update navigation | POST |
| [`leitvia/update-template-part`](#leitviaupdate-template-part) | Update template part | POST |

#### leitvia/activate-token-set

**Activate token set.** Writes the presets of a token set into the global styles of the active theme. The set ID comes from leitvia/create-token-set or the sets of leitvia/get-tokens. The base hash is the hash of the global styles. No ability returns this hash: send base_hash empty and repeat the call once with current_hash from leitvia_stale_hash.

MCP tool `leitvia-activate-token-set`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `set` | integer, min `1` | yes |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/apply-recipe

**Apply recipe.** Sets up the site from a recipe of leitvia/list-recipes: content model, token set, style variation, header and footer, pages from patterns, navigation, reading settings and options that save data. Each part runs through its own ability with the autonomy level of its area; what may not go live lands in one change package, and with a package key everything does. Settings that point to a page waiting in that package (front page, privacy policy page) are set when the package is applied. Pages that exist and header or footer changed since are kept, so the recipe can run again after the package was applied. Review the package with leitvia/get-package.

MCP tool `leitvia-apply-recipe`, REST POST. Annotations: readonly false, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `recipe` | string | yes | Name from leitvia/list-recipes, for example leitvia/blog. |
| `package` | string, max length `64` |  | Key of the task: every part goes into the change package of that key, nothing goes live. |

Output: `recipe` string; `package` integer; `steps` array of object.

#### leitvia/create-token-set

**Create token set.** Creates a token set from a DTCG document. Start from the document leitvia/get-tokens returns; base_hash is empty for the new set. It must compile against the contract and pass every token set check; contrast findings name the failing pair and the ratio it needs. Activate it with leitvia/activate-token-set.

MCP tool `leitvia-create-token-set`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `title` | string, min length `1`, max length `200` | yes |  |
| `document` | object | yes | DTCG token document, as leitvia/get-tokens returns it. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/define-content-type

**Define content type.** Adds or replaces entries of the content model (postTypes, taxonomies, relations, settings) and keeps the others. Read the declaration with leitvia/get-content-model first. The base hash is the hash of the content model. No ability returns this hash: send base_hash empty and repeat the call once with current_hash from leitvia_stale_hash. showInAbilities stays a decision of a person: agents may not set it.

MCP tool `leitvia-define-content-type`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `declaration` | object | yes | Content model declaration with the entries to add or replace, see leitvia/get-content-model. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/set-variation

**Set style variation.** Applies a style variation of the contract to the global styles of the active theme: a full variation replaces them, a colors or typography variation replaces only its part. Names come from the style variations of leitvia/get-contract. The base hash is the hash of the global styles. No ability returns this hash: send base_hash empty and repeat the call once with current_hash from leitvia_stale_hash.

MCP tool `leitvia-set-variation`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `variation` | string, pattern `^[a-z0-9-]+$` | yes |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/update-navigation

**Update navigation.** Replaces the links of a navigation menu, by default the one published last, which headers without a chosen menu show. Send items (with one level of sub items) or block markup of navigation links, submenus, page lists and mega menus. Links point to this site, use https, mailto: or tel:, and need a text that names their target. The base hash is the hash of the menu, empty when the site has none. No ability returns this hash: send base_hash empty and repeat the call once with current_hash from leitvia_stale_hash.

MCP tool `leitvia-update-navigation`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `navigation` | integer, min `1` |  |  |
| `items` | array of object { label\*, url\*, items }, min items `1`, max items `30` |  |  |
| `content` | string, min length `1` |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/update-template-part

**Update template part.** Replaces a template part of the contract, such as header, footer or sidebar, with a pattern made for its area or with changed block markup. Part names come from leitvia/get-contract, patterns from leitvia/list-patterns. The base hash is the hash of the template part. No ability returns this hash: send base_hash empty and repeat the call once with current_hash from leitvia_stale_hash.

MCP tool `leitvia-update-template-part`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `part` | string, pattern `^[a-z0-9-]+$` | yes |  |
| `pattern` | string |  |  |
| `content` | string, min length `1` |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

### Build

Pages from patterns, single blocks, Lab patterns and media.

| Ability | Label | REST |
|---|---|---|
| [`leitvia/add-media`](#leitviaadd-media) | Add media | POST |
| [`leitvia/compose-page`](#leitviacompose-page) | Compose page | POST |
| [`leitvia/create-pattern`](#leitviacreate-pattern) | Create pattern | POST |
| [`leitvia/update-block`](#leitviaupdate-block) | Update block | POST |
| [`leitvia/vary-pattern`](#leitviavary-pattern) | Vary pattern | POST |

#### leitvia/add-media

**Add media.** Adds an image to the media library from a URL of this site or as Base64 data up to 5 MB, with alt text or marked as decorative. URLs of other hosts are rejected; nothing is fetched from them. base_hash is empty. Images already in the library are used by their ID in compose-page and update-block.

MCP tool `leitvia-add-media`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `url` | string, format `uri` |  |  |
| `data` | string, max length `6990512` |  |  |
| `filename` | string, max length `200` |  |  |
| `title` | string, max length `200` |  |  |
| `alt` | string, max length `500` |  |  |
| `decorative` | boolean |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/compose-page

**Compose page.** Creates a page from patterns in the order of a page frame of the contract. Plan it with leitvia/plan-page first; base_hash is empty for the new page. Per section only texts (also quote citations and details summaries), links and images at block IDs of the pattern outline can change; a text that would drop a link is refused. Each section keeps metadata.patternName (core/block/\<ID> for a Lab pattern). Unknown patterns are rejected with a pointer to leitvia/list-patterns, deprecated ones with their replacement, Lab patterns that are not approved (also through a part) with leitvia_pattern_not_approved. Later changes go through leitvia/update-content and leitvia/update-block.

MCP tool `leitvia-compose-page`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `title` | string, min length `1`, max length `200` | yes |  |
| `frame` | string | yes | Type of a page frame from pageFrames in the contract, for example home or service. |
| `sections` | array of object { pattern\*, edits }, min items `1`, max items `30` | yes |  |
| `kind` | one of `imprint`, `privacy`, `terms`, `withdrawal`, `accessibility`, `editorial`, `contact`, `authors` |  |  |
| `slug` | string, pattern `^[a-z0-9-]+$` |  |  |
| `parent` | integer, min `1` |  | ID of the parent page. |
| `template` | string |  | Page template of the contract instead of the one of the frame, for example page-docs. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/create-pattern

**Create pattern.** Creates a pattern in the Lab as a draft with version 0.1.0 from block markup; base_hash is empty. Blocks and their attributes come from leitvia/list-blocks. The checks run on its markup, design tokens included. To build on an existing pattern use leitvia/vary-pattern.

MCP tool `leitvia-create-pattern`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `title` | string, min length `1`, max length `200` | yes |  |
| `content` | string, min length `1` | yes |  |
| `synced` | boolean |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/update-block

**Update block.** Changes one block found by its ID or path ID: attributes from the block catalog and the level of a heading, the text of a paragraph, heading, list item or button, the citation of a quote, the summary of a details block, the link of a button or of the one link in a text (link_text names the linked part), or the image of an image or cover block with alt text. Static markup is rebuilt with the HTML API; changes it cannot rebuild safely are rejected with leitvia_static_markup. Read the post with leitvia/get-page-outline first and send its hash as base_hash; get-block shows the current attributes. For several text changes in one post use leitvia/update-content.

MCP tool `leitvia-update-block`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `block` | string, min length `1`, max length `200` | yes | Block ID or path ID from the outline. |
| `text` | string, max length `5000` |  | Plain text of a paragraph, heading, list item or button, the citation of a quote or the summary of a details block. |
| `link_text` | string, min length `1`, max length `500` |  | Part of text that stays linked when the text holds a link, such as the mail address in a contact line. Without it the link stays around its old text, and a text without that is refused unless the link only points to #. |
| `url` | string, max length `2000` |  | Link of a button, or of the one link in a paragraph, heading or list item (mailto: and tel: work too). |
| `image` | object { id\*, alt, decorative } |  |  |
| `attributes` | object |  | Attributes from leitvia/list-blocks; for a core/heading its level, 1 to 6. |
| `post` | integer, min `1` | yes |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/vary-pattern

**Vary pattern.** Creates a variant of a Lab pattern (block:\<ID>) or a theme pattern (slug) as a draft in the Lab, from new markup or from the original with edits at block IDs; base_hash is empty. Originals come from leitvia/list-patterns, block IDs for edits from leitvia/get-pattern.

MCP tool `leitvia-vary-pattern`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `original` | string | yes |  |
| `title` | string, max length `200` |  |  |
| `content` | string, min length `1` |  |  |
| `edits` | array of object { block\*, text, link_text, url, image }, max items `50` |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

### Maintain

Texts, links, alt text, deprecated patterns, products and change packages of existing content.

| Ability | Label | REST |
|---|---|---|
| [`leitvia/apply-package`](#leitviaapply-package) | Apply change package | POST |
| [`leitvia/repair-links`](#leitviarepair-links) | Repair links | POST |
| [`leitvia/replace-pattern`](#leitviareplace-pattern) | Replace deprecated pattern | POST |
| [`leitvia/rollback`](#leitviarollback) | Roll back change package | POST |
| [`leitvia/set-alt-text`](#leitviaset-alt-text) | Set alt text | POST |
| [`leitvia/set-merchandising`](#leitviaset-merchandising) | Set merchandising | POST |
| [`leitvia/update-content`](#leitviaupdate-content) | Update content | POST |
| [`leitvia/update-product`](#leitviaupdate-product) | Update product | POST |
| [`leitvia/update-product-category`](#leitviaupdate-product-category) | Update product category | POST |

#### leitvia/apply-package

**Apply change package.** Applies the open operations of a change package, all or the listed ones. Find the package with leitvia/list-packages and check its diff with leitvia/get-package first. Each operation checks its base hash; one whose target changed stays open with a conflict, the others are written with snapshot and audit entry. Agents may only apply operations whose autonomy level is autonomous.

MCP tool `leitvia-apply-package`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | integer, min `1` | yes | Change package ID. |
| `operations` | array of integer, min `1` |  | Operation IDs to apply; empty or missing for every open operation. |

Output: object.

#### leitvia/repair-links

**Repair links.** Repairs internal links of one post: from pairs of old and new link, or with auto through the old slugs WordPress keeps for redirects. The base hash is the hash of the post from leitvia/get-page-outline. Only links of this site change. External links are never requested, only listed in the report, as are internal links that lead nowhere and cannot be resolved.

MCP tool `leitvia-repair-links`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `post` | integer, min `1` | yes |  |
| `links` | array of object { from\*, to\* }, max items `50` |  |  |
| `auto` | boolean |  | Find links to posts whose slug changed and point them to the current address. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/replace-pattern

**Replace deprecated pattern.** Replaces the sections of one post that use a deprecated pattern (metadata.patternName) with the replacement the contract names, all of them or the one section given by block. leitvia/audit-site reports the posts that use deprecated patterns; the base hash is the hash of the post from leitvia/get-page-outline. Texts and button links move over in order per block type. A section without replacement is rejected with leitvia_no_replacement.

MCP tool `leitvia-replace-pattern`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `post` | integer, min `1` | yes |  |
| `block` | string, min length `1`, max length `200` |  | Block ID or path ID of a top-level section from the outline. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/rollback

**Roll back change package.** Rolls back the applied operations of a change package from their snapshots. Package IDs come from leitvia/list-packages. If anyone changed a target since, nothing is rolled back and leitvia_rollback_conflict lists both hashes and the diff. Agents may only roll back operations whose autonomy level is autonomous.

MCP tool `leitvia-rollback`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | integer, min `1` | yes | Change package ID. |

Output: object.

#### leitvia/set-alt-text

**Set alt text.** Sets the alt text of an image: without post and block on the attachment in the media library (base_hash of the attachment), with post and block on one image or cover block that shows the image (base_hash of the post). leitvia/get-page-outline returns both hashes, for the attachment with its ID as post. leitvia/audit-site reports missing alt text. Call it once per place, with the same package key. The alt text check applies.

MCP tool `leitvia-set-alt-text`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `image` | integer, min `1` | yes | Attachment ID of the image. |
| `alt` | string, min length `1`, max length `500` | yes |  |
| `post` | integer, min `1` |  |  |
| `block` | string, min length `1`, max length `200` |  | Block ID or path ID of the image or cover block from the outline. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/set-merchandising

**Set merchandising.** Sets the featured flag, the upsells, the cross-sells and the sort order of one product. The lists replace the current ones. Read the product with leitvia/get-product first and send its hash as base_hash; product IDs come from leitvia/list-products.

MCP tool `leitvia-set-merchandising`, REST POST. Annotations: readonly false, destructive true, idempotent false. Only registered while woocommerce is active.

| Input | Type | Required | Description |
|---|---|---|---|
| `product` | integer, min `1` | yes |  |
| `featured` | boolean |  |  |
| `upsells` | array of integer, min `1`, max items `20` |  |  |
| `cross_sells` | array of integer, min `1`, max items `20` |  |  |
| `menu_order` | integer |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/update-content

**Update content.** Updates title, excerpt, slug and the texts and button links of several blocks of one post in one operation, blocks found by their ID from the outline. Instead of blocks, content replaces the whole content with block markup, for example to turn classic content into blocks; the new content may hold no classic block. Read the post with leitvia/get-page-outline first and send its hash as base_hash. A slug change is a URL change and lands at most as a suggestion; after one, leitvia/repair-links with auto points the links of other posts to the new address. For attributes or images of a block use leitvia/update-block.

MCP tool `leitvia-update-content`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `post` | integer, min `1` | yes |  |
| `title` | string, min length `1`, max length `200` |  |  |
| `excerpt` | string, max length `1000` |  |  |
| `slug` | string, pattern `^[a-z0-9-]+$` |  |  |
| `blocks` | array of object { block\*, text, url }, max items `50` |  |  |
| `content` | string, min length `1` |  | Block markup that replaces the whole content; not together with blocks. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/update-product

**Update product.** Updates texts, status, images, categories and tags of one product or variation, and its prices, tax and shipping class. Read the product with leitvia/get-product first and send its hash as base_hash. Images need alt text (set it with leitvia/set-alt-text first). Changes to prices, taxes or shipping land at most as a suggestion unless a person unlocked them.

MCP tool `leitvia-update-product`, REST POST. Annotations: readonly false, destructive true, idempotent false. Only registered while woocommerce is active.

| Input | Type | Required | Description |
|---|---|---|---|
| `product` | integer, min `1` | yes |  |
| `title` | string, min length `1`, max length `200` |  |  |
| `description` | string, max length `20000` |  |  |
| `short_description` | string, max length `5000` |  |  |
| `status` | one of `draft`, `pending`, `publish` |  |  |
| `image` | integer, min `0` |  | Attachment ID of an image with alt text, 0 to remove. |
| `gallery` | array of integer, min `1`, max items `20` |  |  |
| `categories` | array of integer, min `1`, max items `20` |  |  |
| `tags` | array of integer, min `1`, max items `20` |  |  |
| `regular_price` | string, max length `20`, pattern `^([0-9]+([.][0-9]+)?)?$` |  | Price as a decimal number with a dot, empty for none. A price change lands at most as a suggestion. |
| `sale_price` | string, max length `20`, pattern `^([0-9]+([.][0-9]+)?)?$` |  | Price as a decimal number with a dot, empty for none. A price change lands at most as a suggestion. |
| `tax_status` | one of `taxable`, `shipping`, `none` |  |  |
| `tax_class` | string, max length `200` |  |  |
| `shipping_class` | integer, min `0` |  | Term ID of the shipping class, 0 for none. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.

#### leitvia/update-product-category

**Update product category.** Updates name, description, parent and image of a product category, or name and description of a product tag. Use the hash of the term from list-products or get-product as base_hash. The image needs alt text.

MCP tool `leitvia-update-product-category`, REST POST. Annotations: readonly false, destructive true, idempotent false. Only registered while woocommerce is active.

| Input | Type | Required | Description |
|---|---|---|---|
| `term` | integer, min `1` | yes |  |
| `name` | string, min length `1`, max length `200` |  |  |
| `description` | string, max length `5000` |  |  |
| `parent` | integer, min `0` |  |  |
| `image` | integer, min `0` |  | Attachment ID of an image with alt text, 0 to remove. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result.
