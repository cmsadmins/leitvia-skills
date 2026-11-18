# leitvia/update-block

Generated from Leitvia Studio 1.3.48. Do not edit. Group: Build. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Update block.** Changes one block found by its ID or path ID: attributes from the block catalog and the level of a heading, the text of a paragraph, heading, list item or button, the citation of a quote, the summary of a details block, the link of a button or of the one link in a text (link_text names the linked part), or the image of an image or cover block with alt text. add_link sets a new link on a passage of a text, caption the caption of an image, video, audio, gallery, table or embed, anchor the HTML anchor of a block with the support anchor (unique on the page), columns the column count of a grid (group or post template with the layout grid). A timeline entry takes date, dateLabel and heading as attributes. Attributes that a static block keeps in its markup, such as prefix, value, suffix and label of a counter, change like any other. query of a core/query merges into its settings. tracks of a core/video replaces its text tracks: each names a WebVTT file from leitvia/add-media by id, with kind, srclang and label. A spotlight point moves with attributes x and y in percent. The effect on scroll (leitviaAnimation, leitviaMotion) changes on every block that has it, core blocks and saved markup included, since only the block comment changes. Static markup is rebuilt with the HTML API; changes it cannot rebuild safely are rejected with leitvia_static_markup. Read the post with leitvia/get-page-outline first and send its hash as base_hash; get-block shows the current attributes. For several text changes in one post use leitvia/update-content.

MCP tool `leitvia-update-block`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `block` | string, min length `1`, max length `200` | yes | Block ID or path ID from the outline. |
| `text` | string, max length `5000` |  | Plain text of a paragraph, heading, list item or button, the citation of a quote or the summary of a details block. |
| `link_text` | string, min length `1`, max length `500` |  | Part of text that stays linked when the text holds a link, such as the mail address in a contact line. Without it the link stays around its old text, and a text without that is refused unless the link only points to #. |
| `url` | string, max length `2000` |  | Link of a button, or of the one link in a paragraph, heading or list item (mailto: and tel: work too). "" removes the saved link of a button whose link a binding fills; the binding stays. |
| `add_link` | object { text\*, url\* } |  | New link around a passage of a paragraph, heading, list item, citation or summary, as text with the exact words and url. Other links and inline formatting stay; the first place outside a link counts. |
| `caption` | string, max length `1000` |  | Caption of an image, video, audio, gallery, table or embed as plain text; empty removes it. |
| `anchor` | string or null, max length `100` |  | HTML anchor (id) of a block with the support anchor, unique on the page, such as contact-form for links to #contact-form; empty or null removes it. |
| `columns` | integer, min `1`, max `6` |  | Column count of a grid: a group or post template with the layout grid, such as the cards of a teaser pattern. Four cards take 2: with 4 a narrower window still wraps to 3 + 1. |
| `image` | object { id\*, alt, decorative } |  |  |
| `attributes` | object |  | Attributes from leitvia/list-blocks; for a core/heading its level, 1 to 6; for a core/query query with perPage, pages, offset, postType, order, orderBy, sticky and inherit (perPage counts with inherit false); for a core/video tracks, each with id, kind, srclang and label; for a leitvia/timeline-item date (YYYY, YYYY-MM or YYYY-MM-DD, empty for a free label), dateLabel and heading; leitviaAnimation and leitviaMotion on every block that lists them, also next to other attributes (null removes either); className (is-style-\<name>, null removes the style and keeps other classes) on every core block with registered block styles; align on every block whose supports.align in leitvia/list-blocks names the value (null removes it); on core/image also width, height, aspectRatio, scale, sizeSlug, linkDestination, href, lightbox (null removes one). null for an attribute the block does not have changes nothing. |
| `post` | integer, min `1` | yes | Post ID from leitvia/list-content. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
