# leitvia/check-composition

Generated from Leitvia Studio 1.1.0. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Check composition.** Scores a page against the composition rules of the contract: pass pattern slugs in page order (block:\<ID> for a Lab pattern; only approved ones count as known), or a post ID to read the sections of a saved page from metadata.patternName. Returns the findings (rule and 0-based section index), the score from 100 down, the minimum score for autonomous writes and per finding up to three patterns that would fix it.

MCP tool `leitvia-check-composition`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `slugs` | array of string, max length `100`, max items `40` |  |  |
| `post` | integer, min `1` |  |  |
| `template` | string, max length `100` |  | Template slug, for example page-landing; for a post its saved template is used. |

Output: `sections` array of string; `issues` array of object { rule, index, message }; `score` integer; `min_score` integer; `suggestions` array of object.
