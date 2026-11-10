# Shop

Details for the inventory of `leitvia-migrate` when the site runs WooCommerce.

## Product attributes

The global attributes keep the names the old product pages show. A name in `leitvia/list-product-attributes` that differs (an attribute set up again as `Color` where the old shop said `Farbe`) gets the old one with `leitvia/update-product-attribute`: `name`, `values` and `order` as the old pages list them, with the `package` key. A missing attribute or value is for the person.
