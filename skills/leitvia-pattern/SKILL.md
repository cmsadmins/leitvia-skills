---
name: leitvia-pattern
description: Build a new section pattern or a variant of an existing one on a WordPress site with the Leitvia theme and Leitvia Studio, strictly from the design contract (color roles, spacing and type presets, block styles), and hand it to a person for review in the Lab. Also replaces deprecated patterns on pages. Use when no existing pattern fits a section a page needs, when someone asks for a pattern variant, or when an audit reports deprecated patterns.
compatibility: Needs a site with the theme Leitvia and the plugin Leitvia Studio, reached over the MCP server leitvia or the REST routes of the Abilities API with an application password.
---

# leitvia-pattern

A pattern is a reusable section of block markup. New patterns start in the Lab of Leitvia Studio as a draft; a person reviews and approves them. You build them only through the Leitvia abilities and only from the design contract, so they fit every token set and style variation of the site. The agent handbook (`handbook/README.md` in this package) lists every ability with its input, output and rejections.

## Access

- **MCP:** server `leitvia` at `POST /wp-json/leitvia-studio/v1/mcp`. Call `initialize` first and send its `Mcp-Session-Id` header plus `MCP-Protocol-Version` (for example `2025-06-18`) on every further request, or the server answers 400. Tool names use a hyphen where the ability has a slash: `leitvia-create-pattern` for `leitvia/create-pattern`.
- **REST:** `/wp-json/wp-abilities/v1/abilities/<name>/run`. Read abilities take GET with `?input[role]=...`, the write abilities of this skill take POST with the body `{"input": {...}}`.
- Paths start at the address of the site, not at the host: on `https://example.org/club/` the MCP server is `https://example.org/club/wp-json/leitvia-studio/v1/mcp`. Call `leitvia/get-contract` first and compare `site.url` with the address of your task; when they differ, write nothing and ask the person.
- Sign in with HTTP Basic auth as the agent user and its application password. Never use SQL, WP-CLI or the REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read: the abilities give you every ID, hash and status you need.
- On a site where WP-Cron does not run by itself (WordPress Playground), call `GET /wp-cron.php` after each write.

## Modes

- **direct:** The autonomy levels decide. Lab patterns belong to the area `structure`; with the default level a new pattern is saved as a draft. Send no `package` key: a key always means a package.
- **package:** send the same `package` key on every write of the task, so a person reviews one change package. With a key nothing goes live, whatever the autonomy levels allow.

## Steps

### 1. Check the need

A new pattern is the last resort. First look for one that fits:

- `leitvia/list-patterns` with `role`, `tone` or `layout` (the `composition` metadata), or `category`. Read `description`, `useWhen`, `avoidWhen`, `images` and `status` of each candidate; skip deprecated ones (`replacedBy` set).
- `leitvia/get-pattern` shows the markup and where the pattern is used.

Then decide:

- A pattern fits: use it with the skill `leitvia-page`; no new pattern.
- A pattern fits except for its texts, links or images: a page edit does that, no new pattern.
- A pattern fits in structure but needs other fixed texts or a different image for reuse: a variant (step 3).
- Nothing fits: a new pattern (step 2).

Tell the person which existing patterns you looked at and why they do not fit: checkpoint **Need confirmed**.

### 2. Write new markup

Read `leitvia/get-contract` (`roles.color`, `pairs`, `blockStyles`, `compositionRules.sectionPadding`) and `leitvia/list-blocks` (blocks and attributes you may use). Take the markup of the closest existing pattern from `leitvia/get-pattern` as the starting point, and change structure and texts from there. Rules:

- **Colors only as roles:** `backgroundColor` and `textColor` attributes with role slugs such as `surface`, `surface-alt`, `ink`, `ink-muted`, `accent`, `on-accent`, and the matching classes (`has-ink-background-color`). Text and background must form a pair from `pairs` in the contract or reach 4.5:1 in the active palette; the role descriptions name the usual combinations (a dark band is `ink` with `surface` text). Accent is for one band per page at most. Roles name a job, not a lightness: in a dark palette `ink` is the light text color, so a pair from the contract keeps its contrast in every palette. Judge contrast from `pairs`, `inversePairs` and `leitvia/get-tokens`, not from the names of the roles.
- **Spacing, sizes and fonts only as presets:** `var:preset|spacing|l` in attributes and `var(--wp--preset--spacing--l)` in the saved style, font sizes by slug (`fontSize: "lead"`). The outer padding follows the density of the section: `compositionRules.sectionPadding` (airy `xxl`, regular `xl`, dense `l`).
- **Never raw values:** no hex colors, no px values, no `!important`, no numbered presets such as `--wp--preset--font-size--2-xl`. The token check rejects them with `leitvia_check_failed`. No custom CSS and no inline styles beyond what the block editor saves for presets.
- **Block styles** from `blockStyles` in the contract (for example `is-style-eyebrow` on a paragraph, `is-style-outline` on a button) instead of own classes.
- **One root block** (usually a group with `align: full`) with a readable `metadata.name`, so the editor and the Lab show what the section is.
- **Width and edge** (`layout` in the contract): text that is not centered as a whole starts at the wide edge like the page head, so inside a full-width band it sits in a block with `align: wide`. Width only through `align` and the layout of the block, never through `contentSize`, a max width or margins of your own.
- **Headings** start at h2. Only a hero carries an h1, and a page has one hero at most.
- **Links** need real targets in reusable patterns too: no `#`. Use a button whose link the page edit sets, or leave the link out.
- **Images** from the media library only, with an alt text that fits every page the pattern will appear on, or `metadata.leitviaDecorative` with an empty alt. Add them with `leitvia/add-media`.
- **Never** scripts, event attributes, Custom HTML blocks, classic blocks or Base64 data; they are rejected with `leitvia_unsafe_content`. No HTML comments besides block delimiters: between blocks they turn into classic content, inside a block they break it.
- Keep every text editable by a page edit: paragraphs, headings, list items, buttons, the `cite` of a quote and the `summary` of a details block, each with at most one link. Captions cannot be changed later through `leitvia/compose-page`.

Create it with `leitvia/create-pattern`: `title`, `content`, `base_hash: ""`, `package`, and `synced: true` only when every page should show the same content (for example opening hours kept in one place).

### 3. Vary an existing pattern

`leitvia/vary-pattern` with `original` set to a slug from `leitvia/list-patterns` or `block:<ID>` of a Lab pattern, a `title`, and either `edits` (path IDs from the markup of `leitvia/get-pattern`, as in the skill `leitvia-page`) or a full new `content` that follows the rules of step 2. Variants are made from the original, never from another variant. The variant starts as a draft in the Lab.

### 4. Handle rejections

The write result or the rejection lists `findings` with check, block path and a fix. Correct the markup **once** following each fix (for example `#1a1a1a` on a dark band becomes `backgroundColor: "ink"` with `textColor: "surface"`) and call again. A second rejection, or any `retry: never`, is a checkpoint.

### 5. Check the result

- `GET /wp-cron.php` where WP-Cron does not run by itself.
- `leitvia/get-page-outline` with `post` set to the `target.post` of the write: type `wp_block`, status, title and the block tree.
- A page can use it only after a person approved it in the Lab: `leitvia/compose-page` refuses a Lab pattern in draft or review, or with a part that is not approved, with `leitvia_pattern_not_approved`. `leitvia/check-composition` likewise counts only an approved Lab pattern as known, with the composition of the theme pattern it varies; until then it is `unknownPattern`. Say so in your report instead of working around it.
- `leitvia/list-patterns` lists the Lab patterns after those of the theme and of Studio, as `block:<ID>` with `status`, `version` and `hash`.

Report: pattern ID, title, `mode` of the write, which rules you followed for colors and spacing, and what the person should look at in the review.

### 6. Review in the Lab

Every new pattern and variant starts with Lab status `draft` and version 0.1.0. A person moves it to `review`, then to `approved`, in the Lab of Leitvia Studio; agents cannot change the Lab status. The Lab rates a page by the least mature pattern it uses, so a draft pattern marks every page that uses it as draft. Checkpoint **Review in the Lab**.

## Replace deprecated patterns

When a person deprecates a pattern and names its replacement, `leitvia/audit-site` reports the pages that still use it, and `leitvia/compose-page` rejects it with `leitvia_deprecated_pattern` and `replaced_by`.

1. `leitvia/audit-site`, page through with `next`; note the posts with deprecated patterns.
2. Per post `leitvia/get-page-outline` for the `hash` and the section IDs.
3. `leitvia/replace-pattern` with `post`, `base_hash` and optionally `block` for one section. Texts and button links move to the replacement in order per block type; check the result with `leitvia/get-page-outline` and fix moved texts with `leitvia/update-content`.
4. `leitvia_no_replacement` (`retry: never`): the section has no replacement. Stop and ask the person which pattern should take its place; a new page with `leitvia/compose-page` is the way to rebuild it.

## Checkpoints

Stop and ask the person, then continue with the answer:

- **Need confirmed:** no existing pattern or edit covers the section.
- **Fixed texts and images:** texts and images that will stay in the pattern on every page come from the person.
- **Second rejection** of the same call, or a rejection with `retry: never`.
- **Review in the Lab:** the person reviews the draft, moves it to review and approves it. Do not use a draft pattern on live pages before that.
- **Deprecated without replacement:** `leitvia_no_replacement`.
