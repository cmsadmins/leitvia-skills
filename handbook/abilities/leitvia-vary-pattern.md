# leitvia/vary-pattern

Generated from Leitvia Studio 1.3.1. Do not edit. Group: Build. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Vary pattern.** Creates a variant of a Lab pattern (block:\<ID>) or a theme pattern (slug) as a draft in the Lab, from new markup or from the original with edits at block IDs; base_hash is empty. Originals come from leitvia/list-patterns, block IDs for edits from leitvia/get-pattern.

MCP tool `leitvia-vary-pattern`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `original` | string | yes |  |
| `title` | string, max length `200` |  |  |
| `content` | string, min length `1` |  |  |
| `edits` | array of object { block\*, text, link_text, url, image }, max items `50` |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
