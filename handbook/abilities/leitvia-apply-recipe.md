# leitvia/apply-recipe

Generated from Leitvia Studio 1.1.0. Do not edit. Group: Set up. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Apply recipe.** Sets up the site from a recipe of leitvia/list-recipes: content model, token set, style variation, header and footer, pages from patterns, navigation, reading settings and options that save data. Each part runs through its own ability with the autonomy level of its area; what may not go live lands in one change package, and with a package key everything does. Settings that point to a page waiting in that package (front page, privacy policy page) are set when the package is applied. Pages that exist and header or footer changed since are kept, so the recipe can run again after the package was applied. Review the package with leitvia/get-package.

MCP tool `leitvia-apply-recipe`, REST POST. Annotations: readonly false, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `recipe` | string | yes | Name from leitvia/list-recipes, for example leitvia/blog. |
| `package` | string, max length `64` |  | Key of the task: every part goes into the change package of that key, nothing goes live. |

Output: `recipe` string; `package` integer; `steps` array of object.
