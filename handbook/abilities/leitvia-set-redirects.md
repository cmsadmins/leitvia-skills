# leitvia/set-redirects

Generated from Leitvia Studio 1.3.52. Do not edit. Group: Set up. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Set redirects.** Sets the permanent redirects (301) of moved addresses, for a migration or a new structure. Rows of from, a path of this site such as /old-page/, and to, a path of this site or an https address. The list replaces the saved one (at most 500 rows, read the current one with leitvia/get-seo); an empty list removes all. A request of a from path goes to its target before the page loads; query strings and a trailing slash do not matter. Rows that lead back to a path they passed (a loop) are refused, as are the start page as from and a target equal to its from. Inactive while an SEO plugin is active, which brings its own redirects. base_hash is empty. Like every setting it waits in a change package for a person.

MCP tool `leitvia-set-redirects`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `redirects` | array of object { from\*, to\* }, max items `500` | yes | Every redirect of the site; the list replaces the saved one. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
