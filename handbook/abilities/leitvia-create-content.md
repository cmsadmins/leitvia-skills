# leitvia/create-content

Generated from Leitvia Studio 1.3.7. Do not edit. Group: Build. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Create content.** Creates a post, a page or an entry of the content model from block markup or patterns; base_hash is empty. Post types come from leitvia/get-content-model, sections work as in leitvia/compose-page. The content runs through the same checks as leitvia/update-content. Terms take IDs, names or slugs; only tags and other flat taxonomies get new terms. Fields follow the content model; required fields must be set before publishing. The featured image needs alt text (leitvia/set-alt-text) or the decorative mark, or names the file of an image that waits in the same package from leitvia/add-media. The status is capped by the autonomy level. ai_generated adds a visible note to the text.

MCP tool `leitvia-create-content`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `post_type` | string | yes | post, page or a post type of the content model. |
| `title` | string, min length `1`, max length `200` | yes |  |
| `content` | string, min length `1` |  | Block markup; not together with sections. |
| `sections` | array of object { pattern\*, edits }, min items `1`, max items `30` |  |  |
| `excerpt` | string, max length `1000` |  |  |
| `slug` | string, pattern `^[a-z0-9-]+$` |  |  |
| `parent` | integer, min `1` |  | ID of the parent entry of the same hierarchical post type. |
| `date` | string, pattern `^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?$` |  | Date in the time zone of the site, YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS. |
| `template` | string |  | Template of the contract: page templates such as page-docs for pages, single templates for the other types. |
| `kind` | one of `imprint`, `privacy`, `terms`, `withdrawal`, `accessibility`, `editorial`, `contact`, `authors` |  | Kind of a page. |
| `terms` | object |  | Terms by taxonomy, such as {"category": ["News"], "post_tag": ["events", 12]}: IDs as numbers, names or slugs as text. They replace the terms of that taxonomy. |
| `fields` | object |  | Values of the fields and relations of the content model by meta key; null empties a field. |
| `featured_image` | object { id, decorative, file } |  |  |
| `status` | one of `draft`, `publish`, `future` |  |  |
| `comment_status` | one of `open`, `closed` |  | Whether visitors may comment; without it a new post takes the default of the site. |
| `ai_generated` | boolean |  | Whether AI wrote the text; it then shows a note that says so. |
| `sources` | array of string, max length `2000`, format `uri`, max items `20` |  | URLs of the sources of the text, stored with it. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
