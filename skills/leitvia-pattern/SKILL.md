---
name: leitvia-pattern
description: Build a new section pattern or a variant of an existing one on a WordPress site with the Leitvia theme and Leitvia Studio, strictly from the design contract (color roles, spacing and type presets, block styles), and hand it to a person for review in the Lab. Also replaces deprecated patterns on pages. Use when no existing pattern fits a section a page needs, when someone asks for a pattern variant, or when an audit reports deprecated patterns.
compatibility: Needs a site with the theme Leitvia and the plugin Leitvia Studio, reached over the MCP server leitvia or the REST routes of the Abilities API with an application password.
---

# leitvia-pattern

A pattern is a reusable section of block markup. New patterns start in the Lab of Leitvia Studio as a draft; a person reviews and approves them. You build them only through the Leitvia abilities and only from the design contract, so they fit every token set and style variation of the site.

Read before the first call: the [agent handbook](../../handbook/README.md) (access, hashes, autonomy, packages, rejections, index of all abilities). Read the page of an ability before you first call it: [get-contract](../../handbook/abilities/leitvia-get-contract.md), [list-patterns](../../handbook/abilities/leitvia-list-patterns.md), [get-pattern](../../handbook/abilities/leitvia-get-pattern.md), [list-blocks](../../handbook/abilities/leitvia-list-blocks.md), [create-pattern](../../handbook/abilities/leitvia-create-pattern.md), [vary-pattern](../../handbook/abilities/leitvia-vary-pattern.md), [get-page-outline](../../handbook/abilities/leitvia-get-page-outline.md), [replace-pattern](../../handbook/abilities/leitvia-replace-pattern.md). Markup rules and how to replace deprecated patterns: [markup details](references/markup.md).

## Access

MCP server `leitvia` or the REST routes of the Abilities API, as the agent user with its application password: [handbook, Access over MCP and REST](../../handbook/README.md#access-over-mcp-and-rest). Paths start at the address of the site, not at the host. Call `leitvia/get-contract` first and compare `site.url` with the address of your task; when they differ, write nothing and ask the person. Never use SQL, WP-CLI or the REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read: the abilities give you every ID, hash and status you need. Where WP-Cron does not run by itself (WordPress Playground), call `GET /wp-cron.php` after each write.

## Modes

- **direct:** The autonomy levels decide. Lab patterns belong to the area `structure`; with the default level a new pattern is saved as a draft. Send no `package` key: a key always means a package.
- **package:** send the same `package` key on every write of the task, so a person reviews one change package. With a key nothing goes live, whatever the autonomy levels allow.

## Ground rules

- **Facts are never guessed.** Organization data, prices, legal texts, figures, quotes and people come only from a source you can name: the person, a page of the site or a read ability, with the source in your report. Without one, stop at a checkpoint; never write a placeholder that looks like a fact.
- Texts and images that stay fixed in a pattern on every page are facts of this kind: they come from the person.

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

Start from the markup of the closest existing pattern and follow every [markup rule](references/markup.md#markup-rules): colors only as roles from `pairs`, spacing and sizes only as presets, never raw values, block styles of the contract, attribute keys in the order the editor saves them, one root block with `metadata.name`, width only through `align`, headings from h2, real link targets, images from the media library, no scripts or Custom HTML, every text editable by a page edit.

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

`leitvia/audit-site` reports pages with deprecated patterns; `leitvia/replace-pattern` swaps them per post with the replacement the contract names. Steps and the case without a replacement: [markup details](references/markup.md#replace-deprecated-patterns).

## Checkpoints

Stop and ask the person, then continue with the answer:

- **Need confirmed:** no existing pattern or edit covers the section.
- **Fixed texts and images:** texts and images that will stay in the pattern on every page come from the person.
- **Second rejection** of the same call, or a rejection with `retry: never`.
- **Review in the Lab:** the person reviews the draft, moves it to review and approves it. Do not use a draft pattern on live pages before that.
- **Deprecated without replacement:** `leitvia_no_replacement`.

## Unattended

When no person answers (a scheduled or hosted run), do not wait at a checkpoint. Send the `package` key on every write, even when the briefing says nobody visits the site (mode `direct` needs a person who is present); never apply, roll back or publish anything. Take facts only from a source you name in the report (briefing, a page of the site, a read ability); without one the fact stays out and becomes an open question. A second rejection, or `retry: never`, stops that part. End with the package ID, what it holds and the open questions. Each checkpoint gets this answer:

| Checkpoint | Answer without a person |
|---|---|
| Need confirmed | Build only when step 1 found no pattern and no page edit that fits; report the candidates you rejected and why. |
| Fixed texts and images | Fixed texts only from the briefing; otherwise leave the slot for a page edit, never a sample text. |
| Second rejection | Stop this pattern; report code, message and findings. |
| Review in the Lab | Expected: the pattern stays a draft in the package; no page uses it in this run. |
| Deprecated without replacement | Leave the section as it is; list post and pattern. |
