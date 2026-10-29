# Texts, links and images

Details for `leitvia-page`. Read it before you write the edits of step 4.

## Texts

- Replace every sample text of every pattern you use. Sample copy left on a page publishes fiction: invented names, figures, addresses, phone numbers and quotes.
- A pattern with more slots than you have facts (a strip of five items for four points, a step the briefing does not describe) gets a pattern with fewer slots, or the slot repeats a fact the person gave you. Never fill it with an assumption about the business, even one you flag in the report.
- Some blocks hold text you cannot change with an edit: a caption, or a text with more than one link. Use those patterns only when their sample text fits, otherwise choose another pattern of the same role. The attribution of a quote (`cite`) and the question of a details block (`summary`) take a `text` edit at the quote or details block itself.
- Keep to the text lengths of the plan; a hero heading of 120 characters breaks the layout the pattern was made for.
- Write in the language of the page. Leitvia hyphenates German headings and wraps a word longer than the line, so long compound words need no soft hyphens; pages in easy language keep words whole.
- A page in another language than the site needs its own document language. Core has no setting per page; tell the person, who decides on a language plugin.
- Never put review notes or HTML comments into block markup. Open questions go into your report.

## Links

- Every link and button needs a real target: a page of the site, an `https` URL, `mailto:` or `tel:`. A link to `#` is rejected by the link text check; so is link text that does not name its target.
- Button texts name the action and the target ("Book a repair by e-mail", not "Click here").
- A text with one link, such as a contact line "Write to hello@example.com", keeps its link: send `text`, `link_text` (the part that stays linked) and `url` in one edit. A text that would drop a link with a real target is rejected with `leitvia_invalid_input`; a sample link to `#` may be replaced by plain text.
- A text without a link cannot get one by an edit (`leitvia_static_markup`). For a new link, such as an e-mail address in a contact paragraph, send the whole content with `leitvia/update-content` and `content`, the paragraph written as `<p>Write to <a href="mailto:hello@example.org">hello@example.org</a>.</p>`, or use a pattern whose block already has a link.
- Only link to pages that exist. When a target page is missing, build it first or ask.

## Images

- Images come from the media library. Add one with `leitvia/add-media` (Base64 data with a file name, or a URL of this site) and an `alt` that describes it, or `decorative: true` when the text around it carries the meaning. URLs of other hosts are rejected and never fetched.
- A file the person handed you goes over REST: a short script reads it, encodes it and posts `{"input": {"data": ..., "filename": ..., "alt": ...}}`, so the Base64 never passes through your own output.
- Look at the image before you write its alt text; when it does not show what the briefing says, ask instead of describing the briefing.
- Use the attachment ID in the `image` edit with the same alt text or `decorative: true` (stored as `metadata.leitviaDecorative`). An image without alt and without that flag is rejected.
- Sample images of a pattern come with a sample alt text that describes the sample picture. Replace the image, or choose a pattern without an image slot.
- `images` in `leitvia/list-patterns` gives aspect ratio and recommended size per slot.

## Files to download

- Files are not uploaded by an ability: `leitvia/add-media` takes images only. Use files the person put into the media library and find them with `leitvia/list-media` (`mime` `application/pdf`, or `application` for every document); each item has `url`, `filename`, `mime` and `filesize` in bytes. A file that is missing is an open question, never a link to `#`.
- Use `leitvia/content-downloads`: one list item per file. Its `text` edit holds the link text and one sentence about the file, with `link_text` the part that stays linked and `url` the file URL: `{"block": "p:0.2.0", "text": "Price list 2026 (PDF, 180 KB) All plans and services with prices excluding VAT.", "link_text": "Price list 2026 (PDF, 180 KB)", "url": "<url>"}`. The list style puts the link on its own line.
- The link text names the file, its format in capitals and its size, rounded: KB below 1 MB, MB with one decimal above. Keep each link text unique on the page. Remove list items you have no file for, or choose another pattern; never keep a sample item.
- One file inside running text needs no pattern: link it in the sentence with the same text, "the price list (PDF, 180 KB)".

## Videos

- `leitvia/add-media` takes images only: use a video the person put into the media library (`leitvia/list-media`, `mime` `video`); a missing one is an open question.
- Use `leitvia/content-video`. Its transcript holds one list item per scene in the words on screen; without the script of the video, ask. Spoken words also need captions in a text track, a task for the person.
- Its video block is empty and its caption takes no edit: after composing, send the whole content with `leitvia/update-content`, the video with attachment `id`, `src`, `controls` and a caption. Never `autoplay`.
