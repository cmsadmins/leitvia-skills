# Composition rules and templates

Details for `leitvia-page`. Read "Rules" when you score an outline, "Templates and the h1" before you build.

## Rules

`leitvia/check-composition` scores an outline with the rules of the contract (`compositionRules`):

- no two neighbors with the same layout and tone (`noAdjacentRepeat`);
- a break at least every three sections: an image, accent or ink tone, a full bleed layout or `leitvia/content-quote` (`breakWithin`, `breakWhen`);
- accent sections at least two sections apart (`accentMinGap`), and in practice one accent band per page;
- at most two sections of the same density in a row (`maxDensityRun`);
- a hero only as the first section and only on a template without a printed title (`heroFirstOnly`, `heroTemplate`);
- at most `maxSections` sections; frames (header, footer) do not count.

The page starts at 100 and loses the points in `compositionRules.scoring` per finding. `min_score` (80 by default) is the score below which a write is held for a person.

The narrative order of the roles is `hook`, `context`, `proof`, `detail`, `offer`, `close` (`compositionRules.narrative`): open with the promise, explain, prove, go into detail, make the offer, close with the next step. Section padding already follows the density of each pattern; do not change spacing.

## Patterns that need facts

Replace a planned section when it needs facts nobody gave you: prices (`leitvia/offer-pricing-3`, `leitvia/content-price-list`), figures (`leitvia/content-stats`), customer quotes and testimonials (`leitvia/content-quote`, `leitvia/proof-testimonial`), logos, team members.

## Templates and the h1

- `page-landing` (frames `home`, `service`, `about`) prints no title: the hero carries the only h1.
- `page` (frame `contact`) prints the title as h1: start the content with h2 and do not use a hero.
- `page-docs` prints the title as h1 and a page list.
- A page needs exactly one h1; the structure check rejects a write with none or several.
- Width and edge come from the template (`layout` in the contract): head and running text start on one left edge, the wide edge, at most `contentSize` wide. Never center running text and never set `align`, `contentSize` or a max width on a block; `wide` and `full` come with the patterns for media, grids and bands.

## Edits

Edits address blocks by path ID: `p:0` is the root block of the pattern, `p:0.1` its second child, `p:0.3.0` the first child of the fourth child, counted over blocks only (block comments, not HTML elements). One edit per block, with:

- `text`: plain text of a paragraph, heading, list item or button. Setting the text of a paragraph that holds a link drops the link; write a sentence that stands on its own.
- `url`: the link of a button.
- `image`: `{ "id": <attachment>, "alt": "..." }` or `{ "id": <attachment>, "decorative": true }` for an image or cover block.

## After the page exists

Later changes go through `leitvia/update-content` (texts, title, button links of several blocks), `leitvia/update-block` (attributes, one image) and `leitvia/set-alt-text`, each with the `hash` of `leitvia/get-page-outline` as `base_hash`. To change the order or the set of sections, compose a new page and let the person swap them. New section designs belong to the skill `leitvia-pattern`.
