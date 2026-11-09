# Page widths

Details for `leitvia-design`, read when a brand wants another text or page width.

The optional group `size` sets the text width and the wide width of every page: `size.content` (30 to 80 rem) and `size.wide` (60 to 100 rem), as dimensions in rem, `size.content` never wider than `size.wide`. Leave the group out to keep the widths of the theme (37 rem text, 80 rem wide); `leitvia/get-tokens` shows it only when a set changed them. Errors: `leitvia_studio_dtcg_size_range`, `leitvia_studio_dtcg_size_order`.

```json
"size": { "content": { "$type": "dimension", "$value": { "value": 80, "unit": "rem" } }, "wide": { "$type": "dimension", "$value": { "value": 80, "unit": "rem" } } }
```

A brand with many photos may set `size.content` up to `size.wide`: text, the end of a post and image bands then share one grid. The line length is then the decision of the brand; tell the person that lines get long and propose a larger `fontSize.body` with wide text. Keep the default for text-heavy brands.
