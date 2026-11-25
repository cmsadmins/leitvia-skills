# leitvia/update-template-part

Generated from Leitvia Studio 1.3.58. Do not edit. Group: Set up. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Update template part.** Replaces a template part of the contract, such as header, footer or sidebar, with a pattern made for its area or with changed block markup. Part names come from leitvia/get-contract; with Polylang \<part>-\<language> (header-de) is the part the theme shows for that language and is created in the area of its part. A panel of a mega menu is a part named mega-menu-\<name> (or one listed under megaMenu.panels of leitvia/get-contract), created in the area Mega menu on the first write; fill it with a pattern of megaMenu.patterns and edits, then link it with leitvia/update-navigation (type mega, panel). Patterns come from leitvia/list-patterns; edits change the pattern at block IDs of leitvia/get-pattern first, as the sections of leitvia/compose-page do, so a footer or header needs no markup of its own. The change publishes the part, a draft one too: core shows no draft part, so where the area level is draft it waits in a change package. The base hash is the hash of the template part. leitvia/get-contract returns it per part under hashes.templateParts.

MCP tool `leitvia-update-template-part`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `part` | string, pattern `^[a-z0-9-]+$` | yes | Name of a template part from leitvia/get-contract, such as header or footer, or of a mega menu panel, such as mega-menu-services. |
| `pattern` | string |  |  |
| `edits` | array of object { block\*, text, link_text, url, add_link, caption, anchor, table, columns, image, video, remove, repeat, move, position, insert, attributes }, max items `250` |  | Only with pattern: edits at block IDs of the pattern, as in the sections of leitvia/compose-page. |
| `content` | string, min length `1` |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
