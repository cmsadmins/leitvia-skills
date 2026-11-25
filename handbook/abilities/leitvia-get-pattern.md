# leitvia/get-pattern

Generated from Leitvia Studio 1.3.59. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Get pattern.** Returns one pattern of the theme or of Leitvia Studio with its markup, metadata and the first 20 posts and templates that use it (more is true when there are further ones). Template patterns come with their templateTypes, patterns for a template part area that the list leaves out (such as the panels of a mega menu, megaMenu.patterns of leitvia/get-contract) with their blockTypes; the path IDs of their blocks (p:0.1.2) are those of the edits of leitvia/update-template-part.

MCP tool `leitvia-get-pattern`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `slug` | string, min length `1`, max length `200` | yes | Pattern slug from list-patterns, for example leitvia/hero-split-image, or block:\<ID> for a Lab pattern. |

Output: `slug` string; `content` string; `usage` object { items, more }.
