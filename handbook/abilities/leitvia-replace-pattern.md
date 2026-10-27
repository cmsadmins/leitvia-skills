# leitvia/replace-pattern

Generated from Leitvia Studio 1.3.6. Do not edit. Group: Maintain. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Replace deprecated pattern.** Replaces the sections of one post that use a deprecated pattern (metadata.patternName) with the replacement the contract names, all of them or the one section given by block. leitvia/audit-site reports the posts that use deprecated patterns; the base hash is the hash of the post from leitvia/get-page-outline. Texts and button links move over in order per block type. A section without replacement is rejected with leitvia_no_replacement.

MCP tool `leitvia-replace-pattern`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `post` | integer, min `1` | yes |  |
| `block` | string, min length `1`, max length `200` |  | Block ID or path ID of a top-level section from the outline. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
