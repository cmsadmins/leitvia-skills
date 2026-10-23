# Recipe run, shop sites and limits

Details for `leitvia-setup`. Read the part you need: the step statuses when you read the result of `leitvia/apply-recipe`, the shop part when the recipe is `leitvia/shop`, the limits before your report.

## Status of a step

`leitvia/apply-recipe` returns `steps`, one per part of the recipe:

| Status | Meaning |
|---|---|
| `live` | Written and visible. |
| `draft` | Written as a draft; a person publishes it. |
| `package` | Waits in the change package (ID in `package` of the result). |
| `exists` | The page or setting is already there; nothing changed. |
| `waiting` | Needs a page that is neither on the site nor in the package (`page_missing`), or a parent page. |
| `rejected`, `unavailable` | Read `code` and `message`; report it. |

The recipe runs content model, token set, style variation, header and footer, pages, navigation, reading settings and the options that save data, each through its own ability.

Settings that point to recipe pages (front page, privacy policy page, terms page of the shop) wait in the same package and get the ID of their page when the person applies it, so one package covers the whole setup. You cannot apply operations of areas that are not autonomous; `leitvia/apply-package` answers `leitvia_needs_human` and that is expected.

## Sample texts of the recipe

Recipe pages, header and footer are built from patterns and carry their sample texts: invented names, addresses, phone numbers, prices, figures and quotes. Read the diff of the package (`leitvia/get-package`) and list every such text with its page before the person applies it, so they know what goes live. Replacing them is work for `leitvia-page` and the person's facts after the setup, not a reason to rebuild the recipe by hand. On a site that is already live, ask whether the package should wait until those texts are replaced.

## Shop sites

- WooCommerce must be active before `leitvia/apply-recipe` with `leitvia/shop`; otherwise the recipe is `unavailable` with the reason. Installing plugins is a task for the person.
- The recipe switches off order attribution, usage tracking, marketplace suggestions and remote logging of WooCommerce (options in the package). Confirm in the final recipe run that these steps report `exists`.
- The shop, cart, checkout and account pages come from WooCommerce itself. Check that they answer 200 after setup; the recipe adds `shop` to the navigation only when that page is published.
- Prices, taxes and shipping are not part of setup. Products belong to the person or to later tasks.

## What a recipe does not cover

Tell the person about these points; there is no ability for them:

- Avatars: WordPress loads avatars from Gravatar, a third party, unless the person switches avatars off in Settings, Discussion. Recommend switching them off.
- A page in another language than the site needs its own document language; core has no per-page setting.
- Plugins, users, the site title, the logo and the permalink structure are admin settings for the person.
