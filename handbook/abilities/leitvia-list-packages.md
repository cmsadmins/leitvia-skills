# leitvia/list-packages

Generated from Leitvia Studio 1.3.10. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**List change packages.** Lists your change packages, newest first: ID, title, key, state (open, applied, partial, rejected, rolled_back), operations per status and a preview link.

MCP tool `leitvia-list-packages`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `state` | one of `open`, `applied`, `partial`, `rejected`, `rolled_back` |  |  |

Output: array of object.
