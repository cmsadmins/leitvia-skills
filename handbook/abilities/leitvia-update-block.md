# leitvia/update-block

Generated from Leitvia Studio 1.3.3. Do not edit. Group: Build. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

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

Output: the write result. Its fields: [Write results](../README.md#write-results).
