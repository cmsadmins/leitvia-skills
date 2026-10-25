# Token format, contrast and limits

Details for `leitvia-design`. Read "Format" before you change a `$value`, "Contrast" before you create the set, "Fonts" and "Limits" before your report.

## Roles

| Role | Typical brand value |
|---|---|
| `surface`, `surface-alt` | Page background and a tinted band |
| `ink`, `ink-muted` | Text and secondary text |
| `accent`, `on-accent` | Brand color for links and buttons, and the text on it |
| `stroke` | Borders and rules |
| `focus` | Keyboard focus ring |
| `success`, `warning`, `danger` | Status colors |

## Format

Copy the `document` of `leitvia/get-tokens` and change only `$value` entries. Keep every slug; unknown slugs are rejected and missing ones too.

Colors as `{"colorSpace": "srgb", "components": [r, g, b], "hex": "#rrggbb"}` with components from 0 to 1; dimensions as `{"value": 1.5, "unit": "rem"}`; `clamp()` values through `$extensions` `com.leitvia` `css`, fluid font sizes through `com.leitvia` `fluid`, as in the document you started from.

## Contrast

For every entry of `pairs`, compute the WCAG 2.2 ratio of `fg` on `bg`: relative luminance L of each color (sRGB channel c from 0 to 1, linear `c / 12.92` when c is at most 0.04045, else `((c + 0.055) / 1.055) ^ 2.4`; L = 0.2126 R + 0.7152 G + 0.0722 B), ratio = (L1 + 0.05) / (L2 + 0.05) with L1 the lighter one. A pair with `ring` passes when the better of `fg` on `bg` and `ring` on `bg` reaches `min`, and `fg` on `ring` reaches 3:1 (the double focus ring).

Check all pairs, not only the ones the brand guide mentions. Brand guides often list a muted text or border color that fails on the brand's own background.

When `leitvia/create-token-set` is rejected with `leitvia_check_failed`, each finding names the pair, the ratio and the minimum (`accent on surface: 2.90:1, needs 4.5:1`) and a `fix`. Correct exactly once:

1. Change the brand side of the pair (usually `accent`, `ink-muted` or `stroke`), not `surface` or `ink`, unless the person said otherwise.
2. Keep the hue, darken on light surfaces, lighten on dark ones, in small steps until every failing pair of the finding list reaches its minimum by your own computation. One new value often fixes several findings (accent on surface, on surface-alt, on-accent on accent).
3. Send the corrected document once. Tell the person which value replaced which and the ratios it reaches.

Findings with severity `warning` (for example `font_not_bundled`) do not block; report them.

## Fonts

Studio ships the faces of a token set only when the theme bundles that family. Bundled today: Newsreader, Inter Tight, IBM Plex Sans and IBM Plex Mono from the theme and its style variations, Libre Franklin and Young Serif from Leitvia Studio; all are served from the site, no other host. A brand font the theme does not bundle gives the warning `font_not_bundled` and falls back to the system font. Uploading font files goes through the Font Library of WordPress (Appearance, Editor, Typography), which is a task for the person; check the font license first. Until then set the font stack with the brand family first and a generic family last.

## Limits

Tell the person; there is no ability for these:

- Font weights per heading level and the layout widths (content and wide size) are not part of the token format. A brand that wants bold headings or another page width needs a person in the Site Editor.
- The logo: setting the site logo is an admin setting. Before you hand over an SVG logo, read it and confirm it holds no `<script>` element and no event attribute (`onload`, `onclick` and so on). After the person set it, check on the front end that the logo image has a width and a height; SVG files without size information can render 0 px wide.
- Brand rules about composition, for example "accent never as a section background", are not a contrast question. Pass them on to `leitvia-page` and check the front end for `has-accent-background-color` on sections.
