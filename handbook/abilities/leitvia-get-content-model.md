# leitvia/get-content-model

Generated from Leitvia Studio 1.3.4. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Get content model.** Returns the content model declaration: post types, taxonomies, fields, relations and site settings with their definitions, never content. valid is false when the declaration fails the schema and nothing of it is registered.

MCP tool `leitvia-get-content-model`, REST GET. Annotations: readonly true, destructive false, idempotent true.

No input.

Output: `declaration` object; `valid` boolean; `error` string.
