# leitvia/list-patterns

Generated from Leitvia Studio 1.3.3. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**List patterns.** Lists the patterns of the theme, of Leitvia Studio and of its add-ons (source addon) with composition metadata, image slots, when to use and avoid them, lab status and the replacement of deprecated ones, followed by the Lab patterns (slug block:\<ID>, source lab) with their lab status, version and document hash, and the composition of the theme pattern they vary. Only approved Lab patterns count as known in check-composition. Filter by role, tone, layout or category; at most 50 per page. Markup and usage come from get-pattern.

MCP tool `leitvia-list-patterns`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `role` | string, max length `100` |  | Filter by this value of the composition metadata. |
| `tone` | string, max length `100` |  | Filter by this value of the composition metadata. |
| `layout` | string, max length `100` |  | Filter by this value of the composition metadata. |
| `category` | string, max length `100` |  | Filter by pattern category. |
| `page` | integer, min `1`, default `1` |  |  |
| `per_page` | integer, min `1`, max `50`, default `20` |  |  |

Output: `items` array of object; `total` integer; `pages` integer.
