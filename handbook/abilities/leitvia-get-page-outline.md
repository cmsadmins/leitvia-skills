# leitvia/get-page-outline

Generated from Leitvia Studio 1.3.29. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Get page outline.** Returns a post as a compact block tree: per block the ID, name, pattern, the first 80 characters of text (with text_hash of the whole text when it is longer), the link targets of the block itself (links, only when it has any), for image and cover blocks the image with attachment ID, alt text and decorative mark, size, hash and children. Blocks without a stable ID have a path ID such as p:0.2.1 until the next save. Use the document hash as base_hash for changes and get-block for full attributes.

MCP tool `leitvia-get-page-outline`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `post` | integer, min `1` | yes | Post ID. |

Output: `id` integer; `type` string; `hash` string; `title` string; `status` string; `template` string; `kind` string; `blocks` array of object { text_hash, image }.
