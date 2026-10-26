# leitvia/update-template-part

Generated from Leitvia Studio 1.3.4. Do not edit. Group: Set up. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Update template part.** Replaces a template part of the contract, such as header, footer or sidebar, with a pattern made for its area or with changed block markup. Part names come from leitvia/get-contract, patterns from leitvia/list-patterns. The change publishes the part, a draft one too: core shows no draft part, so where the area level is draft it waits in a change package. The base hash is the hash of the template part. No ability returns this hash: send base_hash empty and repeat the call once with current_hash from leitvia_stale_hash.

MCP tool `leitvia-update-template-part`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `part` | string, pattern `^[a-z0-9-]+$` | yes |  |
| `pattern` | string |  |  |
| `content` | string, min length `1` |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
