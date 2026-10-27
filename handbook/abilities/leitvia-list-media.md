# leitvia/list-media

Generated from Leitvia Studio 1.3.7. Do not edit. Group: Read. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**List media.** Lists the media library, newest first: ID, URL, file name, MIME type, file size in bytes, alt text, width, height and hash (the base_hash for leitvia/set-alt-text). Filter by search text, MIME type (image, image/png or application/pdf) and uploaded after a date.

MCP tool `leitvia-list-media`, REST GET. Annotations: readonly true, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `search` | string, max length `100` |  |  |
| `mime` | string, pattern `^[a-z]+(/[a-z0-9.+-]+)?$` |  |  |
| `after` | string, pattern `^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?$` |  | Date in the time zone of the site, YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS. |
| `limit` | integer, min `1`, max `100` |  |  |
| `page` | integer, min `1` |  |  |

Output: `items` array of object; `total` integer; `pages` integer.
