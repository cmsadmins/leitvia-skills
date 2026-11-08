# Imported inline style and plugin blocks

Details for step 4 of `leitvia-migrate`, next to the [tag to block table](translate.md#tag-to-block).

Content that carries style from an old editor is translated by hand with this table; a missing reader for it is no reason to stop (a reader that needs a license the site lacks changes nothing: the table applies, no abort).

| Source | Block |
|---|---|
| Text marker with a hex color | Highlight without a color (the theme style for it where the theme has one); the hex color is not taken over |
| Font size in `px` | The nearest size preset of the theme |
| Radius `0px` | Left out |
| Spacer between or inside columns | `blockGap` or a spacing preset of the columns |
| `style` on `<img>` | Left out |
| Map block of another plugin (for example Google Maps) | `leitvia/map` (consent placeholder from Studio), address or coordinates from the attributes of the source block; never taken over unchanged |

List each dropped style in the report.

