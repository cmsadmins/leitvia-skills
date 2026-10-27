# leitvia/get-pattern

Generated from Leitvia Studio 1.3.8. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Get pattern.** Returns one pattern of the theme or of Leitvia Studio with its markup, metadata and the first 20 posts and templates that use it (more is true when there are further ones).

MCP tool `leitvia-get-pattern`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `slug` | string, min length `1`, max length `200` | yes | Pattern slug from list-patterns, for example leitvia/hero-split-image, or block:\<ID> for a Lab pattern. |

Output: `slug` string; `content` string; `usage` object { items, more }.
