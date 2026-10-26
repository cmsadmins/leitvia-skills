# leitvia/audit-site

Generated from Leitvia Studio 1.3.5. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Audit site.** Runs the content checks (headings, alt text, link text, block validity, tokens, contrast, one h1 and landmarks) over published content, at most 20 posts per call in ID order. Also reports classic content without blocks, deprecated patterns, preset slugs missing from the active tokens, internal links that lead to no page or to the old address of a renamed post, pages that look like legal texts without a page kind, and placeholders left on legal pages: square brackets such as [Organization name] and sentences that say they are a placeholder, as the recipes write them. Pass next as after for the following page; next is null at the end.

MCP tool `leitvia-audit-site`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `after` | integer, min `0`, default `0` |  | Start after this post ID, the next value of the previous call. |
| `limit` | integer, min `1`, max `20`, default `10` |  | Posts per call. |

Output: `items` array of object; `next` integer or null.
