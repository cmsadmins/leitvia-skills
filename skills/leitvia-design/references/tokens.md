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

A dark set (`surface` darker than `ink`) keeps inverse bands dark, also on a light variation.

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

A token set gets font faces when its first family is available on the site. Bundled today: Newsreader, Inter Tight, IBM Plex Sans and IBM Plex Mono from the theme and its style variations, Libre Franklin and Young Serif from Leitvia Studio. A family in the Font Library of the site counts too. All of them are served from the site, no other host. Any other family gives the warning `font_not_bundled` and falls back to the system font.

A brand font that is not bundled is a step of the person or the operator, no ability uploads files of this kind:

1. Ask whether the license allows self-hosting and for the files as WOFF2, one per weight and style.
2. Before the token set is activated, the person uploads them, or the operator runs the [commands](../../../workflows/new-site-operator.md#brand-fonts). Never link a font CDN.
3. Keep the family name of the upload as the first entry of the stack and a generic family last. The name decides: `font_not_bundled` disappears from the check of the next `leitvia/create-token-set` once it matches.
4. Fonts uploaded after the activation need the set activated again, because the faces are copied into the global styles at that moment. Then check that the front page requests fonts only from the site.

## Limits

Tell the person; there is no ability for these:

- Font weights per heading level and the layout widths (content and wide size) are not part of the token format. A brand that wants bold headings or another page width needs a person in the Site Editor.
- The logo: setting the site logo is an admin setting, and it needs a raster image. WordPress refuses SVG uploads, for administrators too, `leitvia/add-media` takes JPEG, PNG, GIF, WebP and AVIF, and Leitvia has no SVG sanitizer; do not suggest a plugin that lifts the limit. From an SVG, render a PNG with a transparent background at twice the display width or more: 400 px wide covers the header patterns (`width` up to 200), 960 px the masthead. Add it with `leitvia/add-media`, name it to the person for the site logo, and afterwards check on the front end that the logo image has a width and a height.
- A light logo for dark bands: on an Inverse band the Site Logo block takes the block style On dark band, which draws a transparent logo in white (the pattern `leitvia/footer-mega` has it). When the brand has its own light file in several colors, add it with `leitvia/add-media` and write a `core/image` block linked to the start page in place of the Site Logo block with `leitvia/update-template-part`.
- Brand rules about composition, for example "accent never as a section background", are not a contrast question. Pass them on to `leitvia-page` and check the front end for `has-accent-background-color` on sections.
