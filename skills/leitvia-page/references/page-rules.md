# Page rules

Details for `leitvia-page`. Read this before you report a page as done.

- A block without server rendering keeps its content in its saved HTML. Use a pattern that holds it, or copy `example` from `leitvia/list-blocks`; a self-closing counter, bento, timeline, marquee, spotlight or reveal is rejected. Figures that count up come from `leitvia-studio/content-stats-counter`.
- Steps and phases use `leitvia/content-steps`, dated milestones `leitvia-studio/content-timeline`. Never build them from a list.
- Measure in the browser, not from the file: images meant to match, such as two portraits, must come out at the same rendered width and height. Compare `getBoundingClientRect()` at 1400 and 390 px.
- A row never leaves an orphan: four items in a row of three end as 3 + 1. Use two by two, or change the number of items with `remove` or `repeat`.
- Sections must differ visibly across the whole page, by tone, layout and image. A page of equal bands passes the score and still reads as one block: look at the full page before you report it.
- A dark footer counts as a neighbor: after a band on ink or inverse, Footer mega shows only a hairline as a seam, so close such pages on `surface` or `surface-alt`.
- Headings break only at soft hyphens (`hyphens: manual`). Long German words in narrow columns need `&shy;`, otherwise `overflow-wrap` breaks them in the middle of a word. Paragraphs, lists and table cells hyphenate on their own in the language of the page.
- A full-width band as the last section meets the footer on every page template, so no strip of page background stays under it. Its own padding gives the space.
- The button of a header stays reachable at every width, below 600 px at the end of the menu.
