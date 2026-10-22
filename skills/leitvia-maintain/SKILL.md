---
name: leitvia-maintain
description: Maintains an existing WordPress site with the Leitvia theme and Leitvia Studio through the leitvia abilities only. Audits the published content, repairs broken internal links, sets missing alt text, replaces deprecated patterns and fixes outdated texts, bundles every write of one maintenance run into one change package and reports the findings before and after with a link to the package. Rolls a package back only when a person asks. Use it for a regular maintenance run or when someone reports broken links, missing alt text or outdated sections; accessibility beyond these checks belongs to leitvia-a11y.
compatibility: Needs a site with the theme Leitvia and the plugin Leitvia Studio, reached over the MCP server leitvia or the REST routes of the Abilities API with an application password.
---

# leitvia-maintain

A maintenance run takes a site that already works and leaves it in a better state: audit, fixes per area, one change package for a person, a report with the findings before and after. You change the site only through the abilities of Leitvia Studio. How to call them, hashes, autonomy levels, change packages and rejections: [agent handbook](../../handbook/README.md). Read its sections "Access over MCP and REST", "Write results" and "Rejections" before the first call.

## Access

- **MCP:** server `leitvia` at `POST /wp-json/leitvia-studio/v1/mcp`. Call `initialize` first and send its `Mcp-Session-Id` header plus `MCP-Protocol-Version` (for example `2025-06-18`) on every further request, or the server answers 400. Tool names use a hyphen where the ability has a slash: `leitvia-audit-site` for `leitvia/audit-site`.
- **REST:** `/wp-json/wp-abilities/v1/abilities/<name>/run`. Read abilities take GET with `?input[after]=...`, the write abilities of this skill take POST with the body `{"input": {...}}`.
- Paths start at the address of the site, not at the host: on `https://example.org/club/` the MCP server is `https://example.org/club/wp-json/leitvia-studio/v1/mcp`. Call `leitvia/get-contract` first and compare `site.url` with the address of your task; when they differ, write nothing and ask the person.
- Sign in with HTTP Basic auth as the agent user and its application password. Never use SQL, WP-CLI or the REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read: the abilities give you every ID, hash and status you need. Reading public pages of the site is fine.
- On a site where WP-Cron does not run by itself (WordPress Playground), call `GET /wp-cron.php` after each write.

## Modes

- **package** (default for maintenance): send the same `package` key on every write of the run, for example `maintenance-2026-10`. One run, one key, one package for a person.
- **direct:** Only when the person asks for it. The autonomy levels decide what goes live. Send no `package` key: a key always means a package.

Corrections (links, alt text) belong to the area `corrections`, which is `autonomous` by default. With a `package` key every write waits in the package, corrections included. In mode `direct` you send no key: a correction the level lets go live goes live, and Studio records it as an applied package of its own (the `package` of the result), so it can be rolled back; a write the level holds back waits in a package of its own. Report both: the open packages and the corrections that went live.

## Ground rules

- Read before write. Take post IDs, block IDs and hashes from the abilities, never from memory.
- **Several writes to one post** in the same package build on each other: each write sends the `hash` of `leitvia/get-page-outline` as usual, changes the post as your earlier writes in the package left it, and the person applies them in order. Combine the changes of one post in one call where the ability allows it anyway (`leitvia/update-content` takes up to 50 blocks; `leitvia/repair-links` repairs all links of a post at once).
- **Only what a write brings counts.** Every write runs the content checks over the full post, but findings the post already had (a skipped heading level, an image without alt text elsewhere) do not block it. A write that adds a finding or makes one worse is rejected with `leitvia_check_failed` and names it.
- A rejection is corrected at most once, following `message`, `next_ability` and `retry`. If the second call is rejected too, or `retry` is `never`, stop and tell the person.
- Never change prices, legal texts or organization data on your own. The pipeline holds the content kinds `prices`, `legal` and `organization` for a person anyway; the facts come from the person.
- Never write review notes or HTML comments into content. Open questions go into the report.

## Steps

### 1. Audit

Call `leitvia/audit-site` with `limit: 20` and page through with `after` set to `next` until `next` is `null`. Each item has `post`, `type`, `title`, `slug`, `kind` and `findings` (`check`, `severity`, `block`, `message`, `fix`). Keep this list: it is the "before" of your report.

Sort the findings by area. `check` holds the name of the check with the prefix `leitvia/`, which the table leaves out:

| Check | Area | Ability |
|---|---|---|
| `broken-link` | internal links | `leitvia/repair-links` |
| `alt-text` | alt text | `leitvia/set-alt-text` |
| `link-text` | link texts and `#` links | `leitvia/update-block` (one link), `leitvia/update-content` (several texts) |
| `deprecated-pattern` | sections | `leitvia/replace-pattern` |
| `headings`, `page-structure` | structure | skill `leitvia-a11y` |
| `content-tokens`, `token-drift`, `content-contrast` | design | skill `leitvia-design` or a person |
| `composition` | page composition | skill `leitvia-page` |
| `page-kind`, `block-validity` | needs a person | report only |

### 2. Broken links

`broken-link` findings name each internal link in the content of a post that leads to no page of the site, or to the old address of a renamed post. The audit requests nothing; external links are not checked, list them in the report as not checked.

Repair them per post with one call of `leitvia/repair-links`: `post`, `base_hash` (the `hash` of `leitvia/get-page-outline`), `auto: true` for links to the old address of a renamed post (WordPress keeps the old slugs of posts, not of pages), and `links` with `from` and `to` pairs for the rest. The `to` of a pair is an address you checked on the public site: it answers 200 and is the page the link text names. When no page fits, ask the person (checkpoint **Link targets**). The result lists `repaired`, `external` and `unresolved`; `leitvia_invalid_input` with reason `nothing_to_repair` means nothing was left to repair.

The audit covers the content of posts, not header, footer or navigation. Open the public pages and check the internal links there once (GET, no external links). Broken links in the header, footer or navigation: report them; they need `leitvia/update-navigation` or `leitvia/update-template-part` in the area `design`, which a person decides.

### 3. Alt text

For each `alt-text` finding read the block with `leitvia/get-block` (`post`, `block`): `attributes.id` is the attachment, `inner_html` holds the image URL. Look at the image and its place on the page and write the alt text yourself: what the image shows that matters here, in one short sentence, in the language of the page, without "image of". An image that only decorates, because the text around it carries the meaning, gets no description: mark it with `leitvia/update-block` and `image: { "id": <attachment>, "decorative": true }`.

Call `leitvia/set-alt-text` with `image`, `alt`, `post`, `block` and the `hash` of the post as `base_hash`. Without `post` and `block` it sets the alt text of the attachment in the media library only, which fixes no page. When the AI plugin of WordPress offers the ability `ai/alt-text-generation` and the person agreed that images go to the AI provider of the site, you may use it for a first draft; read and correct the draft before you send it.

### 4. Deprecated patterns

For each `deprecated-pattern` finding: `leitvia/get-page-outline` for the `hash`, then `leitvia/replace-pattern` with `post` and `base_hash` (all deprecated sections of the post in one call). Texts and button links move to the replacement in order per block type; plain text only, inline links in paragraphs do not move. Read the outline of the result in the package diff (`leitvia/get-package`) and name in the report what the person should compare. `leitvia_no_replacement` (`retry: never`): the pattern has no replacement; ask the person (checkpoint **Section without replacement**).

### 5. Outdated content

Texts go stale: figures copied from another source (counts, versions, test numbers), dates, opening hours, names of people who left. Compare them only with a source the person named or a read ability of the site (for example `leitvia/get-contract` or `total` of `leitvia/list-patterns` for figures about the theme). Change a text with `leitvia/update-content` (`post`, `base_hash`, `blocks` with `block` and `text`, `url` for buttons); a text that holds a link keeps it only when the new text still contains the old link text, otherwise use `leitvia/update-block` with `link_text`. Markers that a decision is open (`CHECK:`, `TODO`, `Lorem ipsum`, the sample texts of patterns) are no fix for you: list them in the report until a person resolves them.

### 6. The package

Every write of the run carries the same `package` key. After the last write:

- `leitvia/list-packages` with `state: open`: your package with its operations.
- `leitvia/get-package` with `id`: the diff per operation. Check that every operation does what you meant.
- Do not call `leitvia/apply-package` for operations of areas that are not `autonomous` for you; it answers `leitvia_needs_human`, whose `data.inbox` is the link for the person.

The person reviews the package in the inbox of Leitvia Studio: `/wp-admin/admin.php?page=leitvia-studio-inbox&package=<id>`. Checkpoint **Package applied**.

### 7. After the person applied it

- `GET /wp-cron.php` where WP-Cron does not run by itself.
- `leitvia/list-packages` with `state: applied`, and `leitvia/get-package`: operations with a `conflict` were not written because someone changed the post in between. Read the post again and repeat that change once in a new run; never force it.
- `leitvia/audit-site` again over all pages: the "after" of your report.
- Request the repaired links again; each answers 200.

## Rollback

Roll back only when a person asks for it, never to tidy up your own run.

1. `leitvia/list-packages` with `state: applied`: find the package the person means and confirm it with them.
2. `leitvia/rollback` with `id`. It restores the snapshots of every applied operation, newest first.
3. `leitvia_rollback_conflict` (`retry: never`): someone changed a post after the package was applied. Nothing was rolled back. `data.conflicts` lists per operation both hashes and the `diff` (what changed since). Show the person the diff and stop; never overwrite a change of a person, and never rebuild the old state by hand.
4. `leitvia_needs_human`: the operations belong to an area that is not `autonomous` for you; the person rolls back in the inbox.

## Report

Write the report in the chat, in the language of the person:

1. **Package:** ID, state and the inbox link `/wp-admin/admin.php?page=leitvia-studio-inbox&package=<id>`; plus the IDs of corrections that went live on their own.
2. **Before and after:** per post the findings of the first audit and of the audit after the package was applied (or "waiting for the package" until then), counted per check.
3. **Fixed:** per post what you changed (links from and to, alt texts, replaced patterns, texts).
4. **Open with reason:** findings no ability can fix, broken links in template parts, external links not checked, conflicts.
5. **Questions for the person:** link targets, facts, open markers.

## Checkpoints

Stop and ask the person, then continue with the answer:

- **Link targets:** a broken link has no address that clearly fits its text.
- **Section without replacement:** `leitvia_no_replacement`.
- **Facts from the person:** prices, legal texts, organization data or figures without a source.
- **Package applied:** the person reviews and applies the package in the inbox before you audit again.
- **Rollback confirmed:** the person names the package to roll back.
- **Second rejection** of the same call, or a rejection with `retry: never`.
