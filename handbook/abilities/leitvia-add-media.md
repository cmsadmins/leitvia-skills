# leitvia/add-media

Generated from Leitvia Studio 1.3.1. Do not edit. Group: Build. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Add media.** Adds an image to the media library from a URL of this site or as Base64 data up to 5 MB, with alt text or marked as decorative. URLs of other hosts are rejected; nothing is fetched from them. base_hash is empty. Images already in the library are used by their ID in compose-page and update-block.

MCP tool `leitvia-add-media`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `url` | string, format `uri` |  |  |
| `data` | string, max length `6990512` |  |  |
| `filename` | string, max length `200` |  |  |
| `title` | string, max length `200` |  |  |
| `alt` | string, max length `500` |  |  |
| `decorative` | boolean |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
