# leitvia/update-navigation

Generated from Leitvia Studio 1.1.1. Do not edit. Group: Set up. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Update navigation.** Replaces the links of a navigation menu, by default the one published last, which headers without a chosen menu show. Send items (with one level of sub items) or block markup of navigation links, submenus, page lists and mega menus. Links point to this site, use https, mailto: or tel:, and need a text that names their target. The base hash is the hash of the menu, empty when the site has none. No ability returns this hash: send base_hash empty and repeat the call once with current_hash from leitvia_stale_hash.

MCP tool `leitvia-update-navigation`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `navigation` | integer, min `1` |  |  |
| `items` | array of object { label\*, url\*, items }, min items `1`, max items `30` |  |  |
| `content` | string, min length `1` |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
