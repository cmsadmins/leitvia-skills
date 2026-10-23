# leitvia/define-content-type

Generated from Leitvia Studio 1.1.0. Do not edit. Group: Set up. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Define content type.** Adds or replaces entries of the content model (postTypes, taxonomies, relations, settings) and keeps the others. Read the declaration with leitvia/get-content-model first. The base hash is the hash of the content model. No ability returns this hash: send base_hash empty and repeat the call once with current_hash from leitvia_stale_hash. showInAbilities stays a decision of a person: agents may not set it.

MCP tool `leitvia-define-content-type`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `declaration` | object | yes | Content model declaration with the entries to add or replace, see leitvia/get-content-model. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
