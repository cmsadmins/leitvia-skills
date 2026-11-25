# leitvia/set-llms

Generated from Leitvia Studio 1.3.57. Do not edit. Group: Set up. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Set llms.txt and AI crawlers.** Sets llms.txt, the file at the root of the site that tells AI assistants what the site is about, and whether robots.txt lets AI crawlers in. llms.txt is built on each request: the site name, summary (at most 500 characters, empty for the tagline), the pages with the page frame hub, the pages with a service and price (leitvia/set-page-structure) and the extra pages of pages (IDs, published). enabled switches the file off and on, ai_crawlers false disallows the crawlers of AI search and assistants in robots.txt (default true, they may crawl as every other crawler). Without an SEO plugin and only on a site open to search engines: otherwise the setting is saved and notice says what holds the file back, get-seo shows llms.requested, llms.enabled and llms.held_back. Only the fields you send change. base_hash is empty. Like every setting it waits in a change package for a person.

MCP tool `leitvia-set-llms`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `enabled` | boolean |  |  |
| `summary` | string, max length `500` |  |  |
| `pages` | array of integer, min `1`, max items `50` |  |  |
| `ai_crawlers` | boolean |  | false disallows the crawlers of AI search and assistants in robots.txt. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
