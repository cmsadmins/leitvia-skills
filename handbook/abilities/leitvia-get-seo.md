# leitvia/get-seo

Generated from Leitvia Studio 1.3.28. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Get SEO data.** Returns the SEO data of posts, pages and entries from the active SEO plugin. Supported are Yoast SEO, Rank Math, SEOPress and The SEO Framework. Per item: title, meta description, canonical, noindex, nofollow, Open Graph title, description and image, focus keyword and schema type. schema_type is the article type Leitvia Studio prints for a post (NewsArticle or BlogPosting), null where it prints none. indexable says whether the site is open to search engines, news_sitemap is the address of the news sitemap of Leitvia Studio or null, organization holds the address, phone and email of leitvia/set-organization. An empty value means the plugin falls back to its template. defaults holds what WordPress itself would print and a description suggested from the excerpt; without an SEO plugin plugin names Leitvia Studio, with an unsupported one seo is null, and notice says why. hash is the base_hash of leitvia/update-seo. IDs that are no readable content come back under skipped.

MCP tool `leitvia-get-seo`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `posts` | array of integer, min `1`, min items `1`, max items `50` | yes |  |

Output: `plugin` object { key, name, writable }; `notice` string; `items` array of object { post, type, status, title, url, hash, seo, defaults, schema_type }; `skipped` array of integer; `indexable` boolean; `news_sitemap` string or null.
