# Recipe run, shop sites and limits

Details for `leitvia-setup`.

## Status of a step

`leitvia/apply-recipe` returns `steps`, one per part of the recipe:

| Status | Meaning |
|---|---|
| `live` | Written and visible. |
| `draft` | Written as a draft; a person publishes it. |
| `package` | Waits in the change package (ID in `package` of the result). |
| `exists` | Already there, or changed since the recipe wrote it (an active token set counts for the variation); nothing changed. |
| `unchanged` | Variation, template part or navigation already hold what the recipe writes; nothing changed. |
| `waiting` | Needs a page that is neither on the site nor in the package (`page_missing`), or a parent page. |
| `rejected`, `unavailable` | Read `code` and `message`; report it. |

The recipe runs content model, token set, style variation, header and footer, pages, navigation, reading settings and the options that save data, each through its own ability. The footer links the pages the recipe names for it (the legal pages included), not the sample links of its pattern.

Settings that point to recipe pages (front page, privacy policy page, terms page of the shop) wait in the same package and get the ID of their page when the person applies it, so one package covers the whole setup. You cannot apply operations of areas that are not autonomous; `leitvia/apply-package` answers `leitvia_needs_human` and that is expected.

## Sample texts of the recipe

Recipe pages, header and footer are built from patterns and carry the sample texts of their patterns (names, addresses, prices, quotes). Legal pages and, in the recipe `leitvia/shop`, About and Contact hold only placeholders that say so; the home page and the footer still carry sample texts. Read the diff of the package (`leitvia/get-package`) and list every such text with its page before the person applies it, so they know what goes live. After it was applied, read header and footer with `leitvia/get-page-outline` (the template part ID is `target.post` of the step `templateParts` in the confirmation run, setup step 5): `links` of each block shows where it leads, and a link to `#` or to a page the site lacks is a finding to fix with `leitvia/update-template-part`. New links (accessibility statement, overview pages): edit the `markup` of `leitvia/get-block` on the root block of the part, send it as `content`. Replacing them is work for `leitvia-page` after the setup, not a reason to rebuild the recipe by hand. On a site that is already live, ask whether the package should wait until those texts are replaced.

## Shop sites

- WooCommerce must be active before `leitvia/apply-recipe` with `leitvia/shop`; otherwise the recipe is `unavailable` with the reason. Installing plugins is a task for the person.
- The recipe switches off order attribution, usage tracking, marketplace suggestions and remote logging of WooCommerce (options in the package). The final recipe run reports these steps as `exists`.
- The shop, cart, checkout and account pages come from WooCommerce itself. Check that they answer 200 after setup; the recipe adds `shop` to the navigation only when that page is published.
- Products: `leitvia/create-product` per product (simple products: texts, prices, SKU, stock, categories, image), with the same `package` key. Categories can be named; a new name creates the category. A long description in plain text becomes paragraph blocks (a blank line starts a new one); send block markup when it needs headings or lists. A product with a price always waits for a person (content kind `prices`). Prices, SKUs and stock come from the briefing or the person, never from a guess. Images from `leitvia/add-media` need a second package: `leitvia/update-product`.
- Vouchers and other goods without shipping: no ability marks a product as virtual; the person ticks "Virtual" in WooCommerce, otherwise the checkout charges shipping for them.
- The home page hero shows the newest product in stock: create that product last.
- In WordPress Playground (SQLite) every order of a product with `stock` fails with `woocommerce_product_not_enough_stock`; leave `stock` out there.
- Shop settings are the person's (checkpoint "Shop settings"): at least one payment method (for a test shop "Cash on delivery" or "Direct bank transfer", no real payment), the store address, the currency, whether prices include tax and which tax rates apply, and a shipping zone with at least one shipping method (flat rate, free shipping or local pickup), in WooCommerce, Settings (`/wp-admin/admin.php?page=wc-settings`). Without a payment method or a shipping method for the address the checkout cannot take an order. For Germany the store country needs the state (`DE:DE-SN`); WooCommerce ignores a bare `DE` and taxes come out wrong. Site visibility must be "Live": a new WooCommerce hides the shop as "Coming soon". With "Prices include tax", WooCommerce adds tax to the cost of a flat rate: for 5.90 gross at 19 % enter 4.958 as cost. List them in the report; no ability changes them.

## What a recipe does not cover

Tell the person about these points; there is no ability for them:

- Product reviews are on in WooCommerce; whether visitors may review is the person's choice (Settings, Products).
- Avatars come from Gravatar, a third party; recommend switching them off in Settings, Discussion.
- A page in another language than the site needs its own document language; core has no per-page setting.
- Plugins, users, the site title and tagline, the logo and the permalink structure are admin settings for the person. Propose site title and tagline from the briefing.
- The sample post "Hello world!" and the "Sample Page" of a new WordPress stay; no ability deletes content. Ask the person to delete them.
- No recipe creates an accessibility statement. Build it with `leitvia/compose-page`, `frame` `contact` (the frame the recipes use for legal pages), `kind` `accessibility` and the pattern `leitvia/page-accessibility-statement`; its content is a legal text from the person (skill `leitvia-a11y`). Its placeholders in square brackets, such as `[Organization name]`, stay until the person supplies the facts; `leitvia/audit-site` lists each with the check `legal-placeholder`, an open point for the report.
