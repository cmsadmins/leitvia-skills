# leitvia/compose-page

Generated from Leitvia Studio 1.3.9. Do not edit. Group: Build. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Compose page.** Creates a page from patterns in the order of a page frame of the contract. Plan it with leitvia/plan-page first; base_hash is empty for the new page. Per section only texts (also quote citations and details summaries), links and images at block IDs of the pattern outline can change; a text that would drop a link is refused. Each section keeps metadata.patternName (core/block/\<ID> for a Lab pattern). Unknown patterns are rejected with a pointer to leitvia/list-patterns, deprecated ones with their replacement, Lab patterns that are not approved (also through a part) with leitvia_pattern_not_approved. Later changes go through leitvia/update-content and leitvia/update-block.

MCP tool `leitvia-compose-page`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `title` | string, min length `1`, max length `200` | yes |  |
| `frame` | string | yes | Type of a page frame from pageFrames in the contract, for example home or service. |
| `sections` | array of object { pattern\*, edits }, min items `1`, max items `30` | yes |  |
| `kind` | one of `imprint`, `privacy`, `terms`, `withdrawal`, `accessibility`, `editorial`, `contact`, `authors` |  |  |
| `slug` | string, pattern `^[a-z0-9-]+$` |  |  |
| `parent` | integer, min `1` |  | ID of the parent page. |
| `template` | string |  | Page template of the contract instead of the one of the frame, for example page-docs. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
