# Block edits

Details for `leitvia-page`, `leitvia-maintain` and `leitvia-a11y`. Read this when a change goes beyond the text of a block.

- **A new link on words of a text:** `add_link` with `text` (the exact words of one run of text) and `url`, per block in `leitvia/update-block` or `leitvia/update-content`. Other links and inline formatting stay; the first place outside a link counts. `url` alone only changes the link a text has.
- **Publish a draft:** `leitvia/update-content` with `status: "publish"` and the `package` key, like any change. At a level below `autonomous` it waits for a person. `future` needs a `date` in the future; without a date of its own the post gets the date of publishing.
- **Text attributes of static blocks:** `leitvia/update-block` with `attributes` changes prefix, value, suffix and label of `leitvia/counter`, and any text attribute whose element the block has. An optional part that is empty, other than on the counter, is refused with `leitvia_static_markup`.
- **Posts per page of a list:** `leitvia/update-block` on the `core/query` block with `attributes: { "query": { "perPage": 6 } }`. Keys you leave out stay. `perPage` counts with `inherit` false.
- **Another pattern for a section:** `leitvia/replace-pattern` with `block` (a top-level ID from the outline), `pattern` and `edits` as in `leitvia/compose-page`. Texts and button links of the old section move over first, the edits win; `carry: false` keeps the texts of the pattern. Set an anchor again with an `anchor` edit.
- **Page under another page:** `parent` of `leitvia/update-content`, `0` for the top level. It changes the address like a slug; point old links to it with `leitvia/repair-links` and `from` and `to`.
- **Remove a page or post:** `leitvia/trash-content`. It always waits for a person and stays restorable. Refused for the front page, the posts page, the privacy page and a page with subpages; `notice` names the pages that link to it.
- **Map (`leitvia/map`):** set `lat`, `lng`, `zoom` (1 to 19), `height`, `heading`, `linkText` and `markers` (each `title`, `address`, `lat`, `lng`) as `attributes` of `insert` or of `leitvia/update-block`; the list of places is built again. `markers` replaces the list, so send it on every insert, or the sample place stays. `text` is the heading.
- **Bound button:** a button whose `url` a binding fills (`metadata.bindings.url`, for example the button of a job posting) takes no new link. `url: ""` removes only its saved link, the binding stays; change the value at its source.
- **Caption:** `caption` on `leitvia/update-block` or per block in `leitvia/update-content`, plain text, on images, videos, audio, galleries, tables and embeds. An empty string removes it.

## Captions of a video

A video with speech needs captions (WCAG 1.2.2):

1. `leitvia/add-media` with `data` (Base64) and `filename` ending in `.vtt`: UTF-8, first line `WEBVTT`. No alt text. It needs the right to upload files, and the result gives the attachment ID in `target.post`; in a package, in `applied.post` of `leitvia/get-package` once it is applied.
2. `leitvia/update-block` on the `core/video` block with `attributes: { "tracks": [ { "id": <attachment>, "kind": "captions", "srclang": "de", "label": "Deutsch" } ] }`. The list replaces the tracks of the video, an empty list removes them. Only WebVTT files of the library count.

The file must lie on this site, or browsers do not load it.
