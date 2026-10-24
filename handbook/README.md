# Leitvia agent handbook

Generated from Leitvia Studio 1.1.1. Do not edit.

Everything an agent needs to work on a WordPress site with Leitvia Studio through its 41 abilities: how to call them, how hashes, autonomy and change packages work, what a rejection means and what each ability takes and returns. Agents change the site only through these abilities: no SQL, no REST routes of WordPress core (not even to read), no WP-CLI. Reading public pages of the site is allowed. Read this file before the first call; it holds the rules every skill relies on and the index of all abilities.

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

Every rejection of Leitvia Studio with its code, HTTP status, retry rule, next ability and message: [rejections.md](rejections.md). Read it when a rejection is unclear; the rejection itself already carries all of this.

## Abilities

Each ability has a page of its own with its inputs and output, named after its MCP tool: `abilities/<tool>.md`, for example [`abilities/leitvia-get-contract.md`](abilities/leitvia-get-contract.md). Read the pages of the abilities you call, not all of them.

### Read

Read abilities change nothing. Call them first: they return the IDs, block IDs and hashes the write abilities need.

| Ability | REST | What it does |
|---|---|---|
| [`leitvia/audit-site`](abilities/leitvia-audit-site.md) | GET | Runs the content checks over published content, at most 20 posts per call in ID order. |
| [`leitvia/check-composition`](abilities/leitvia-check-composition.md) | GET | Scores a page against the composition rules of the contract: pass pattern slugs in page order, or a post ID to read the sections of a saved page from metadata.patternName. |
| [`leitvia/get-block`](abilities/leitvia-get-block.md) | GET | Returns one block of a post by its ID or path ID with all attributes, its own markup, the attachments of the images in that markup, its hash, the IDs of its children and the document hash. |
| [`leitvia/get-content-model`](abilities/leitvia-get-content-model.md) | GET | Returns the content model declaration: post types, taxonomies, fields, relations and site settings with their definitions, never content. |
| [`leitvia/get-contract`](abilities/leitvia-get-contract.md) | GET | Returns the site this connection works on and the design contract of the active theme: version, rules, color roles, contrast pairs, composition rules, page frames, template parts, templates, block styles and style variations. |
| [`leitvia/get-package`](abilities/leitvia-get-package.md) | GET | Returns a change package with its operations: status, the post each applied operation wrote, conflicts and, for open operations, a block diff against the current state. |
| [`leitvia/get-page-outline`](abilities/leitvia-get-page-outline.md) | GET | Returns a post as a compact block tree: per block the ID, name, pattern, the first 80 characters of text, size, hash and children. |
| [`leitvia/get-pattern`](abilities/leitvia-get-pattern.md) | GET | Returns one pattern of the theme or of Leitvia Studio with its markup, metadata and the first 20 posts and templates that use it. |
| [`leitvia/get-product`](abilities/leitvia-get-product.md) | GET | Returns one product or variation: texts, images with alt text, categories and tags with their hash, attributes, price, tax and shipping class, stock status, merchandising and the hash to use as base_hash. |
| [`leitvia/get-site-health`](abilities/leitvia-get-site-health.md) | GET | Returns the versions of WordPress, PHP, the theme and the plugins and the updates WordPress knows of, read from its last update check; nothing is requested. |
| [`leitvia/get-tokens`](abilities/leitvia-get-tokens.md) | GET | Returns the active design tokens as a DTCG document, the token sets with their status, the active style variations, whether the global styles drifted from the active set and the contrast findings of the current palette. |
| [`leitvia/list-blocks`](abilities/leitvia-list-blocks.md) | GET | Returns the block catalog of Leitvia Studio and its add-ons with attribute schema and usage rules. |
| [`leitvia/list-content`](abilities/leitvia-list-content.md) | GET | Lists posts, pages and entries of the content model, newest first, with hash, terms and the open package that waits for each. |
| [`leitvia/list-media`](abilities/leitvia-list-media.md) | GET | Lists the media library, newest first: ID, URL, file name, alt text, width, height and hash. |
| [`leitvia/list-packages`](abilities/leitvia-list-packages.md) | GET | Lists your change packages, newest first: ID, title, key, state, operations per status and a preview link. |
| [`leitvia/list-patterns`](abilities/leitvia-list-patterns.md) | GET | Lists the patterns of the theme, of Leitvia Studio and of its add-ons with composition metadata, image slots, when to use and avoid them, lab status and the replacement of deprecated ones, followed by the Lab patterns with their lab status, version and document hash, and the composition of the theme pattern they vary. |
| [`leitvia/list-products`](abilities/leitvia-list-products.md) | GET | Lists the products of the shop, 20 per page, with title, type, status, price, stock status, featured flag and hash, plus all product categories with their hash. |
| [`leitvia/list-recipes`](abilities/leitvia-list-recipes.md) | GET | Lists the site recipes of Leitvia Studio and its add-ons with owner, pages and whether the plugins they require are active. |
| [`leitvia/plan-page`](abilities/leitvia-plan-page.md) | GET | Proposes a page for a goal and content points: page frame, template, the patterns in page order with role, slot, text lengths and the points each section carries, and the composition score. |

### Set up

Content model, design tokens, style variation, template parts, navigation and recipes.

| Ability | REST | What it does |
|---|---|---|
| [`leitvia/activate-token-set`](abilities/leitvia-activate-token-set.md) | POST | Writes the presets of a token set into the global styles of the active theme. |
| [`leitvia/apply-recipe`](abilities/leitvia-apply-recipe.md) | POST | Sets up the site from a recipe of leitvia/list-recipes: content model, token set, style variation, header and footer, pages from patterns, navigation, reading settings and options that save data. |
| [`leitvia/create-token-set`](abilities/leitvia-create-token-set.md) | POST | Creates a token set from a DTCG document. |
| [`leitvia/define-content-type`](abilities/leitvia-define-content-type.md) | POST | Adds or replaces entries of the content model and keeps the others. |
| [`leitvia/set-variation`](abilities/leitvia-set-variation.md) | POST | Applies a style variation of the contract to the global styles of the active theme: a full variation replaces them, a colors or typography variation replaces only its part. |
| [`leitvia/update-navigation`](abilities/leitvia-update-navigation.md) | POST | Replaces the links of a navigation menu, by default the one published last, which headers without a chosen menu show. |
| [`leitvia/update-template-part`](abilities/leitvia-update-template-part.md) | POST | Replaces a template part of the contract, such as header, footer or sidebar, with a pattern made for its area or with changed block markup. |

### Build

Pages from patterns, single blocks, Lab patterns and media.

| Ability | REST | What it does |
|---|---|---|
| [`leitvia/add-media`](abilities/leitvia-add-media.md) | POST | Adds an image to the media library from a URL of this site or as Base64 data up to 5 MB, with alt text or marked as decorative. |
| [`leitvia/compose-page`](abilities/leitvia-compose-page.md) | POST | Creates a page from patterns in the order of a page frame of the contract. |
| [`leitvia/create-content`](abilities/leitvia-create-content.md) | POST | Creates a post, a page or an entry of the content model from block markup or patterns; base_hash is empty. |
| [`leitvia/create-pattern`](abilities/leitvia-create-pattern.md) | POST | Creates a pattern in the Lab as a draft with version 0.1.0 from block markup; base_hash is empty. |
| [`leitvia/update-block`](abilities/leitvia-update-block.md) | POST | Changes one block found by its ID or path ID: attributes from the block catalog and the level of a heading, the text of a paragraph, heading, list item or button, the citation of a quote, the summary of a details block, the link of a button or of the one link in a text, or the image of an image or cover block with alt text. |
| [`leitvia/vary-pattern`](abilities/leitvia-vary-pattern.md) | POST | Creates a variant of a Lab pattern or a theme pattern as a draft in the Lab, from new markup or from the original with edits at block IDs; base_hash is empty. |

### Maintain

Texts, links, alt text, deprecated patterns, products and change packages of existing content.

| Ability | REST | What it does |
|---|---|---|
| [`leitvia/apply-package`](abilities/leitvia-apply-package.md) | POST | Applies the open operations of a change package, all or the listed ones. |
| [`leitvia/repair-links`](abilities/leitvia-repair-links.md) | POST | Repairs internal links of one post: from pairs of old and new link, or with auto through the old slugs WordPress keeps for redirects. |
| [`leitvia/replace-pattern`](abilities/leitvia-replace-pattern.md) | POST | Replaces the sections of one post that use a deprecated pattern with the replacement the contract names, all of them or the one section given by block. |
| [`leitvia/rollback`](abilities/leitvia-rollback.md) | POST | Rolls back the applied operations of a change package from their snapshots. |
| [`leitvia/set-alt-text`](abilities/leitvia-set-alt-text.md) | POST | Sets the alt text of an image: without post and block on the attachment in the media library, with post and block on one image or cover block that shows the image. |
| [`leitvia/set-merchandising`](abilities/leitvia-set-merchandising.md) | POST | Sets the featured flag, the upsells, the cross-sells and the sort order of one product. |
| [`leitvia/update-content`](abilities/leitvia-update-content.md) | POST | Updates title, excerpt, slug, date, terms, fields, featured image, comment status and the texts and button links of several blocks of one post in one operation, blocks found by their ID from the outline. |
| [`leitvia/update-product`](abilities/leitvia-update-product.md) | POST | Updates texts, status, images, categories and tags of one product or variation, and its prices, tax and shipping class. |
| [`leitvia/update-product-category`](abilities/leitvia-update-product-category.md) | POST | Updates name, description, parent and image of a product category, or name and description of a product tag. |
