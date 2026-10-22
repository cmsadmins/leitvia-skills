---
name: leitvia-design
description: Derives a Leitvia token set from a brand (colors, fonts, radii, spacing, logo) and activates it through the leitvia abilities only. Maps brand values to the color roles of the design contract, computes every contrast pair before writing, fixes a contrast rejection itself once, and hands the set to a person as a change package. Use it when a site should carry a brand; site structure belongs to leitvia-setup, pages to leitvia-page.
---

# leitvia-design

Bring a brand onto a Leitvia site as a token set: one DTCG document with every role of the design contract, checked for contrast, activated by a person. You change the site only through the abilities of Leitvia Studio; how to call them, hashes, packages and rejections: [agent handbook](../../handbook/README.md).

## Ground rules

- Write only through `leitvia/*` abilities. No CSS, no child theme, no SQL, no WP-CLI, no REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read.
- The site is the one at the address of your task, which in a multisite network can have a path (`https://example.org/club/`); every path starts there, not at the host. Call `leitvia/get-contract` first and compare `site.url` with that address; when they differ, write nothing and ask the person.
- Token sets and their activation are in the area `design`, which by default only suggests: every write lands in a change package for a person. Send one `package` key for the task, for example `brand-2026-10`.
- Values come from the brand source the person names (style guide, design file, existing site). Never guess a brand color or font. A value you cannot find is a question to the person.
- Roles, slugs and the contrast pairs come from `leitvia/get-contract`, never from memory or from files of the theme.
- A rejection is corrected once. If the corrected call is rejected again, stop and ask the person.

## Workflow

### 1. Collect the brand

Ask for, or read from the source the person named: colors with their intended use, fonts (family, weights, license, whether the files are available), radii (fields, buttons), spacing grid, logo files for light and dark backgrounds. Write down brand rules that are not values, for example "the accent color is never a large surface" or "headings bold".

Checkpoint "Brand confirmed".

### 2. Read the site

- `leitvia/get-contract`: `roles` (every color, font size, font family, spacing, radius and shadow slug), `pairs` (foreground, background, minimum ratio, optional `ring`).
- `leitvia/get-tokens`: the current `document` (start from it), `sets` (existing token sets) and `contrast` (findings of the current palette).
- The front page: its `--wp--preset--color--*` and `--wp--preset--font-family--*` values are what visitors see. When they differ from the `document`, tell the person which values differ and ask which ones to keep before you write; never build a set on values the site does not show.

### 3. Map brand values to roles

Copy the `document` of `leitvia/get-tokens` and change only `$value` entries. Keep every slug; unknown slugs are rejected and missing ones too.

| Role | Typical brand value |
|---|---|
| `surface`, `surface-alt` | Page background and a tinted band |
| `ink`, `ink-muted` | Text and secondary text |
| `accent`, `on-accent` | Brand color for links and buttons, and the text on it |
| `stroke` | Borders and rules |
| `focus` | Keyboard focus ring |
| `success`, `warning`, `danger` | Status colors |

Format: colors as `{"colorSpace": "srgb", "components": [r, g, b], "hex": "#rrggbb"}` with components from 0 to 1; dimensions as `{"value": 1.5, "unit": "rem"}`; `clamp()` values through `$extensions` `com.leitvia` `css`, fluid font sizes through `com.leitvia` `fluid`, as in the document you started from.

A brand color that fits no role (for example a second orange for print) stays out of the set; mention it in the `$description` of the set.

### 4. Compute every contrast pair before writing

For every entry of `pairs`, compute the WCAG 2.2 ratio of `fg` on `bg`: relative luminance L of each color (sRGB channel c from 0 to 1, linear `c / 12.92` when c is at most 0.04045, else `((c + 0.055) / 1.055) ^ 2.4`; L = 0.2126 R + 0.7152 G + 0.0722 B), ratio = (L1 + 0.05) / (L2 + 0.05) with L1 the lighter one. A pair with `ring` passes when the better of `fg` on `bg` and `ring` on `bg` reaches `min`, and `fg` on `ring` reaches 3:1 (the double focus ring).

Check all pairs, not only the ones the brand guide mentions. Brand guides often list a muted text or border color that fails on the brand's own background.

### 5. Create the token set

Call `leitvia/create-token-set` with `title`, `document`, empty `base_hash` and your `package` key.

When it is rejected with `leitvia_check_failed`, each finding names the pair, the ratio and the minimum (`accent on surface: 2.90:1, needs 4.5:1`) and a `fix`. Correct exactly once:

1. Change the brand side of the pair (usually `accent`, `ink-muted` or `stroke`), not `surface` or `ink`, unless the person said otherwise.
2. Keep the hue, darken on light surfaces, lighten on dark ones, in small steps until every failing pair of the finding list reaches its minimum by your own computation. One new value often fixes several findings (accent on surface, on surface-alt, on-accent on accent).
3. Send the corrected document once. Tell the person which value replaced which and the ratios it reaches.

If the second call is rejected too, stop at checkpoint "Contrast correction accepted" with both finding lists. Findings with severity `warning` (for example `font_not_bundled`) do not block; report them.

Checkpoint "Contrast correction accepted" whenever you changed a brand value.

### 6. Activate

The new set exists only after the person applied the package of step 5 (checkpoint "Package applied"). Then:

1. `leitvia/get-tokens`: take the `id` of the new set from `sets` (status `inactive`).
2. `leitvia/activate-token-set` with `set`, empty `base_hash` and the same `package` key. When the site already has global styles the call is rejected with `leitvia_stale_hash`; repeat it once with `current_hash` from the rejection.
3. The activation lands in a new package. Checkpoint "Package applied" again.

### 7. Verify on the front end

After the person applied the activation:

- `leitvia/get-tokens`: `source` is `set`, `active` is the ID of your set, `drift` is false, `contrast` is empty.
- Fetch the front page and check that the CSS custom properties carry your values, for example `--wp--preset--color--accent` with your accent hex. On some sites global styles written without a signed in user were not found again and the site silently fell back to the theme default; only the front end proves the brand is live.
- `leitvia/audit-site`: no new findings.

## Fonts

Studio ships the faces of a token set only when the theme bundles that family. A brand font the theme does not bundle gives the warning `font_not_bundled` and falls back to the system font. Uploading font files goes through the Font Library of WordPress (Appearance, Editor, Typography), which is a task for the person; check the font license first. Until then set the font stack with the brand family first and a generic family last.

## What a token set cannot carry

Tell the person; there is no ability for these:

- Font weights per heading level and the layout widths (content and wide size) are not part of the token format. A brand that wants bold headings or another page width needs a person in the Site Editor.
- The logo: setting the site logo is an admin setting. Before you hand over an SVG logo, read it and confirm it holds no `<script>` element and no event attribute (`onload`, `onclick` and so on). After the person set it, check on the front end that the logo image has a width and a height; SVG files without size information can render 0 px wide.
- Brand rules about composition, for example "accent never as a section background", are not a contrast question. Pass them on to `leitvia-page` and check the front end for `has-accent-background-color` on sections.

## Checkpoints

Stop and wait for the person at each of these points. Report the values, the computed ratios and the exact question.

1. **Brand confirmed:** colors with their use, fonts, radii, spacing and logo come from the source the person named.
2. **Contrast correction accepted:** you changed a brand value to meet a contrast pair; the person agrees to the new value (or the second attempt failed and you show both finding lists).
3. **Package applied:** the person applied the package with the token set, and later the package with the activation, in the inbox of Leitvia Studio.

Also stop after the second rejection of the same call.
