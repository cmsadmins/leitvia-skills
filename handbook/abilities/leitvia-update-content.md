# leitvia/update-content

Generated from Leitvia Studio 1.3.31. Do not edit. Group: Maintain. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Update content.** Updates title, excerpt, slug, date, status, author, terms, fields, featured image, comment status and the texts and button links of several blocks of one post in one operation, blocks found by their ID from the outline. Per block, url changes the one link of a text too, link_text names the part that stays linked, add_link sets a new link on a passage and caption the caption of a figure, as in leitvia/update-block. status publishes a draft, schedules it (future, with a date) or takes a post back to draft or pending; like every change it follows the autonomy level, so at a lower level it waits in a change package, and publishing needs the right to publish when it is applied. Terms, fields, featured image and template follow the rules of leitvia/create-content; terms replace those of their taxonomy, and template switches the post to another template of the contract (page-landing for a page). Instead of blocks, content replaces the whole content with block markup, for example to turn classic content into blocks; the new content may hold no classic block. Read the post with leitvia/get-page-outline first and send its hash as base_hash. A slug change is a URL change and lands at most as a suggestion; after one, leitvia/repair-links with auto points the links of other posts to the new address. For attributes or images of a block use leitvia/update-block.

MCP tool `leitvia-update-content`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `post` | integer, min `1` | yes |  |
| `title` | string, min length `1`, max length `200` |  |  |
| `excerpt` | string, max length `1000` |  |  |
| `slug` | string, pattern `^[a-z0-9-]+$` |  |  |
| `blocks` | array of object { block\*, text, link_text, url, add_link, caption }, max items `50` |  |  |
| `content` | string, min length `1` |  | Block markup that replaces the whole content; not together with blocks. |
| `date` | string, pattern `^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?$` |  | Date in the time zone of the site, YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS. |
| `status` | one of `draft`, `pending`, `publish`, `future` |  | New status of the post; future needs a date in the future. |
| `author` | integer, min `1` |  | User ID of the author, as author in leitvia/list-content shows it; the user must be able to edit this post type. Without it a new post belongs to the user who writes it. An author without a display name of their own shows as the name of the site, never as the login. |
| `terms` | object |  | Terms by taxonomy, such as {"category": ["News"], "post_tag": ["events", 12]}: IDs as numbers, names or slugs as text. They replace the terms of that taxonomy. |
| `fields` | object |  | Values of the fields and relations of the content model by meta key; null empties a field. |
| `featured_image` | object { id, decorative } |  |  |
| `comment_status` | one of `open`, `closed` |  | Whether visitors may comment; without it a new post takes the default of the site. |
| `template` | string, pattern `^[a-z0-9-]\*$` |  | Template of the contract: a page template for pages, a single template for the other types. Empty or default: the standard template. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
