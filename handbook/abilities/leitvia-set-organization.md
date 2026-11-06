# leitvia/set-organization

Generated from Leitvia Studio 1.3.29. Do not edit. Group: Set up. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Set organization details.** Sets address, phone and email of the organization. Leitvia Studio adds them to its structured data while no SEO plugin is active; the name and the logo stay those of the site. Only the fields you send change, an empty string clears one. leitvia/get-seo returns the current values. base_hash is empty. Use only facts the person gave or the site shows. Like every setting it waits in a change package for a person.

MCP tool `leitvia-set-organization`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `street` | string |  |  |
| `postal_code` | string |  |  |
| `city` | string |  |  |
| `country` | string, pattern `^([A-Z]{2})?$` |  |  |
| `phone` | string |  |  |
| `email` | string |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
