# leitvia/get-site-health

Generated from Leitvia Studio 1.3.55. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Get site health.** Returns the versions of WordPress, PHP, the theme and the plugins and the updates WordPress knows of, read from its last update check; nothing is requested. mcp says whether MCP clients reach the server of Leitvia Studio (ready), its address (url) and, when not, why (reason, such as the plugin MCP Adapter missing): report that to the person and go on over the REST API. Needs a user who may view the Site Health checks, usually an administrator, or the agent role.

MCP tool `leitvia-get-site-health`, REST GET. Annotations: readonly true, destructive false, idempotent true.

No input.

Output: object.
