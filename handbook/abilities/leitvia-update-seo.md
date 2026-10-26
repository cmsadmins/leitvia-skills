# leitvia/update-seo

Generated from Leitvia Studio 1.3.3. Do not edit. Group: Maintain. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Update SEO data.** Writes SEO title, meta description and robots of one post through the active SEO plugin. It covers posts, pages and entries in Yoast SEO, Rank Math, SEOPress or The SEO Framework; without one of them it is rejected with leitvia_no_seo_plugin. Read the post with leitvia/get-seo first and send its hash as base_hash. A title has at most 60 characters, a description 50 to 160; an empty string hands the field back to the template of the plugin. Say only what the page says: every number in title or description must appear in the title, excerpt or content of the post. Autonomy and change packages work as for leitvia/update-content; a live write gets a change package for leitvia/rollback.

MCP tool `leitvia-update-seo`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `post` | integer, min `1` | yes |  |
| `title` | string, max length `200` |  |  |
| `description` | string, max length `500` |  |  |
| `noindex` | boolean |  | Keep the page out of search results. false hands it back to the default of the plugin. |
| `nofollow` | boolean |  | Ask search engines not to follow the links of the page. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
