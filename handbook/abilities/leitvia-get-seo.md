# leitvia/get-seo

Generated from Leitvia Studio 1.3.1. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Get SEO data.** Returns the SEO data of posts, pages and entries from the active SEO plugin. Supported are Yoast SEO, Rank Math, SEOPress and The SEO Framework. Per item: title, meta description, canonical, noindex, nofollow, Open Graph title, description and image, focus keyword and schema type. An empty value means the plugin falls back to its template. defaults holds what WordPress itself would print and a description suggested from the excerpt; without a supported plugin seo is null and notice says why. hash is the base_hash of leitvia/update-seo. IDs that are no readable content come back under skipped.

MCP tool `leitvia-get-seo`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `posts` | array of integer, min `1`, min items `1`, max items `50` | yes |  |

Output: `plugin` object { key, name, writable }; `notice` string; `items` array of object { post, type, status, title, url, hash, seo, defaults }; `skipped` array of integer.
