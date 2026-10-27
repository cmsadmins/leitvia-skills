# leitvia/set-alt-text

Generated from Leitvia Studio 1.3.7. Do not edit. Group: Maintain. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

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

Output: the write result. Its fields: [Write results](../README.md#write-results).
