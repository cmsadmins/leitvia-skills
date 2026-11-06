# Block edits

Details for `leitvia-page`, `leitvia-maintain` and `leitvia-a11y`. Read this when a change goes beyond the text of a block.

- **A new link on words of a text:** `add_link` with `text` (the exact words of one run of text) and `url`, per block in `leitvia/update-block` or `leitvia/update-content`. Other links and inline formatting stay; the first place outside a link counts. `url` alone only changes the link a text has.
- **Publish a draft:** `leitvia/update-content` with `status: "publish"` and the `package` key, like any change. At a level below `autonomous` it waits for a person. `future` needs a `date` in the future; without a date of its own the post gets the date of publishing.
- **Text attributes of static blocks:** `leitvia/update-block` with `attributes` changes prefix, value, suffix and label of `leitvia/counter`, and any text attribute whose element the block has. An optional part that is empty, other than on the counter, is refused with `leitvia_static_markup`.
- **Posts per page of a list:** `leitvia/update-block` on the `core/query` block with `attributes: { "query": { "perPage": 6 } }`. Keys you leave out stay. `perPage` counts with `inherit` false.
- **Caption:** `caption` on `leitvia/update-block` or per block in `leitvia/update-content`, plain text, on images, videos, audio, galleries, tables and embeds. An empty string removes it.

## Captions of a video

A video with speech needs captions (WCAG 1.2.2):

1. `leitvia/add-media` with `data` (Base64) and `filename` ending in `.vtt`: UTF-8, first line `WEBVTT`. No alt text. It needs the right to upload files, and the result gives the attachment ID in `target.post`; in a package, in `applied.post` of `leitvia/get-package` once it is applied.
2. `leitvia/update-block` on the `core/video` block with `attributes: { "tracks": [ { "id": <attachment>, "kind": "captions", "srclang": "de", "label": "Deutsch" } ] }`. The list replaces the tracks of the video, an empty list removes them. Only WebVTT files of the library count.

The file must lie on this site, or browsers do not load it.
