# leitvia/list-blocks

Generated from Leitvia Studio 1.3.7. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**List blocks.** Returns the block catalog of Leitvia Studio and its add-ons with attribute schema and usage rules. With post_type only the blocks the editor allows for that post type.

MCP tool `leitvia-list-blocks`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `post_type` | string, max length `20` |  | Limit to the blocks allowed for this post type. |

Output: `blocks` array of object { name\*, title\*, description\*, category\*, parent\*, ancestor\*, supports\*, attributes\*, innerBlocks\*, usage\*, owner\*, extension }.
