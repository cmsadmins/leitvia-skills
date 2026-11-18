# leitvia/add-media

Generated from Leitvia Studio 1.3.47. Do not edit. Group: Build. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Add media.** Adds an image to the media library from a URL of this site or as Base64 data up to 5 MB, with alt text or marked as decorative. It also takes a WebVTT file with captions for a video (.vtt, UTF-8, starts with WEBVTT, no alt text) and a video hosted on this site, MP4 (H.264) or WebM up to 50 MB, with poster and caption instead of alt text. It needs the right to upload files. URLs of other hosts are rejected; nothing is fetched from them. base_hash is empty. Images already in the library are used by their ID in compose-page and update-block, a WebVTT file by its ID in tracks of update-block, a video by its ID and URL in a core/video.

MCP tool `leitvia-add-media`, REST POST. Annotations: readonly false, destructive false, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `url` | string, format `uri` |  |  |
| `data` | string, max length `69905072` |  |  |
| `filename` | string, max length `200` |  |  |
| `title` | string, max length `200` |  |  |
| `alt` | string, max length `500` |  |  |
| `decorative` | boolean |  |  |
| `poster` | integer, min `1` |  | Video only: attachment ID of an image of the media library that shows before the video plays, a still of it. Also set it as poster of the core/video. |
| `caption` | string, max length `2000` |  | Video only: what the video shows, in plain text, as caption of the file in the media library. A video without speech needs this text on the page as well. |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
