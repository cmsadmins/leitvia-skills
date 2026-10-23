# Texts, links and images

Details for `leitvia-page`. Read it before you write the edits of step 4.

## Texts

- Replace every sample text of every pattern you use. Sample copy left on a page publishes fiction: invented names, figures, addresses, phone numbers and quotes.
- A pattern with more slots than you have facts (a strip of five items for four points, a step the briefing does not describe) gets a pattern with fewer slots, or the slot repeats a fact the person gave you. Never fill it with an assumption about the business, even one you flag in the report.
- Some blocks hold text you cannot change with an edit: a caption, or a text with more than one link. Use those patterns only when their sample text fits, otherwise choose another pattern of the same role. The attribution of a quote (`cite`) and the question of a details block (`summary`) take a `text` edit at the quote or details block itself.
- Keep to the text lengths of the plan; a hero heading of 120 characters breaks the layout the pattern was made for.
- Write in the language of the page. In German headings, compound words longer than about 18 characters need soft hyphens (U+00AD) at the joints, or they overflow at 320 px.
- A page in another language than the site needs its own document language. Core has no setting per page; tell the person, who decides on a language plugin.
- Never put review notes or HTML comments into block markup. Open questions go into your report.

## Links

- Every link and button needs a real target: a page of the site, an `https` URL, `mailto:` or `tel:`. A link to `#` is rejected by the link text check; so is link text that does not name its target.
- Button texts name the action and the target ("Book a repair by e-mail", not "Click here").
- A text with one link, such as a contact line "Write to hello@example.com", keeps its link: send `text`, `link_text` (the part that stays linked) and `url` in one edit. A text that would drop a link with a real target is rejected with `leitvia_invalid_input`; a sample link to `#` may be replaced by plain text.
- Only link to pages that exist. When a target page is missing, build it first or ask.

## Images

- Images come from the media library. Add one with `leitvia/add-media` (Base64 data with a file name, or a URL of this site) and an `alt` that describes it, or `decorative: true` when the text around it carries the meaning. URLs of other hosts are rejected and never fetched.
- A file the person handed you goes over REST: a short script reads it, encodes it and posts `{"input": {"data": ..., "filename": ..., "alt": ...}}`, so the Base64 never passes through your own output.
- Look at the image before you write its alt text; when it does not show what the briefing says, ask instead of describing the briefing.
- Use the attachment ID in the `image` edit with the same alt text or `decorative: true` (stored as `metadata.leitviaDecorative`). An image without alt and without that flag is rejected.
- Sample images of a pattern come with a sample alt text that describes the sample picture. Replace the image, or choose a pattern without an image slot.
- `images` in `leitvia/list-patterns` gives aspect ratio and recommended size per slot.
