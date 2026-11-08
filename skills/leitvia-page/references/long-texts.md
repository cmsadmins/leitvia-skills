# Long texts

Details for `leitvia-page`, `leitvia-news` and `leitvia-migrate`. A page or post of about 1500 words or more is read in parts: readers jump to what they need and come back. Give it a form that helps them, whoever wrote the words.

- **Table of contents** near the top: the block `leitvia/table-of-contents` (`levels` `[2, 3]` by default). It lists the headings when the page renders, so it needs no edits later. One per page.
- **Fact box** at the top, before the first section: the key facts of the topic as a short list or a table of two columns inside a group with the style `note`. For a travel destination these are country, season, where to stay or park, costs; for a guide what you need and how long it takes. Facts only from a source you can name.
- **A heading at least every 300 words.** An `h2` that names its section, `h3` below it; never skip a level. Turn a long paragraph into a list only where the text already counts things up.
- **Reading breaks** between sections: a tip of the author, an image or a quote, never two of them in a row and never in place of a heading.
- **Author tip:** the pattern `leitvia/content-author-tip` (group style `tip`, round portrait, name, a short quote). Create it once as a synced pattern with the real portrait and name of the author (`leitvia/create-pattern` with `synced: true`, see [leitvia-pattern](../../leitvia-pattern/SKILL.md)) and place it every three to five sections of a long guide as `<!-- wp:block {"ref":<ID>} /-->`. Without a real portrait and name of the author, leave the tip out.
- **Many images in a row:** a section with more than three images uses a scroll gallery block when `leitvia/list-blocks` lists one (images next to a box that stays in view), otherwise a `core/gallery`. Never a long run of single image blocks.

Check before you report: count the words between two headings in the outline from `leitvia/get-page-outline`; no stretch over 300 words.
