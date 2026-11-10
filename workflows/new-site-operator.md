# Workflow new-site: steps of the operator

Details for the operator of [new-site](new-site.md): what happens on the server with WP-CLI, which the agent never does.

## JSON error answers of the REST API

Every rejection of an ability is an answer with a 4xx status and a JSON body (`code`, `message`, `data`). A web server that replaces it with an error page of its own hides every rejection from the agent, which then sees only HTML. nginx does this with `fastcgi_intercept_errors on`, which ISPConfig sets when "Own error pages" is on for the website (`errordocs=1`): turn that option off for the site, or set `fastcgi_intercept_errors off;` for `/wp-json/`. Check it before the first run:

```sh
curl -s https://<site>/wp-json/wp/v2/nonexistent
```

The answer must be JSON with `"code":"rest_no_route"` and status 404 (`curl -s -o /dev/null -w '%{http_code}' <url>` prints the status), not an HTML page.

## Brand fonts

A family that is not bundled comes into the Font Library of WordPress, on the site itself. Leitvia Studio then gives a token set the faces of that family, no font CDN is involved. The agent cannot do this: the routes need `edit_theme_options`. Run it before the token set is activated, with an application password of an administrator, once per family and once per file:

```sh
curl -u '<admin>:<password>' https://<site>/wp-json/wp/v2/font-families \
  -F theme_json_version=3 \
  -F 'font_family_settings={"name":"Brand Sans","slug":"brand-sans","fontFamily":"\"Brand Sans\", sans-serif"}'
# id of the answer:
curl -u '<admin>:<password>' https://<site>/wp-json/wp/v2/font-families/<id>/font-faces \
  -F theme_json_version=3 \
  -F 'font_face_settings={"fontFamily":"Brand Sans","fontWeight":"400","fontStyle":"normal","src":"file-0"}' \
  -F file-0=@brand-sans-400.woff2
```

A variable font is one file with `"fontWeight":"100 900"`. Check the license before you upload.

## A second language (Polylang)

No ability sets the language of a post or links translations. With Polylang, which the theme supports, a second language comes about in three parts:

1. The agent builds the pages of the second language like any other page, with `leitvia/compose-page` and slugs of their own (for example `leistungen` next to `services`), in the same package.
2. After the package was applied, the operator runs a script with WP-CLI that adds the languages, gives every post without a language the default one, sets the second language on the new pages and links each pair (`pll_set_post_language`, `pll_save_post_translations`). The model is `site/leitvia.com/polylang.php` in the Leitvia monorepo (`wp eval-file polylang.php <folder>`), which reads the pairs from a table of slugs.
3. Header and footer: while Polylang shows a language other than its default, the theme looks for the template part `<slug>-<language>` (for example `header-de`, `footer-de`) and shows it in place of `<slug>`; without one the part of the default language stays. The agent writes them with `leitvia/update-template-part` and `part` set to `header-de` (a pattern of the area, or `content`), in the same package, once the language exists in Polylang; the part is created in the area of its base part. Without the agent the operator creates them with WP-CLI, as `site/leitvia.com/import.sh` does (`part_upsert <slug> <title> <area>`). The navigation of the second language is a menu of its own.

## Pages of a legal plugin (Germanized)

WooCommerce Germanized, common in German shops, prints notes with links next to prices, in the cart and at the checkout: shipping costs, payment methods, how reviews are checked. It takes the target of each link from its settings; without a page there the link stays in the page with an empty address, which `leitvia/audit-site` reports as `empty-link` with the class it comes from. No ability changes plugin settings. Once the pages exist (the agent writes them like any page, a person applies the package), assign them in WooCommerce, Settings, Germanized, Legal, or with WP-CLI:

```sh
wp option list --search='woocommerce_*_page_id' --fields=option_name,option_value
wp option update woocommerce_shipping_costs_page_id <page ID>
```

Set every page option the list shows empty or 0 (for example `woocommerce_payment_methods_page_id`, `woocommerce_review_authenticity_page_id`), then run `leitvia/audit-site` again: no `empty-link` may remain on the product pages.

## Scripts of plugins from other providers

Leitvia Studio holds back a script until the visitor allows its category, `statistics` or `marketing`, when the filter `leitvia_studio_consent_scripts` names it by host (subdomains included) or by script handle. The script stays in the page as `type="text/plain"`, so the browser asks the host nothing; once the category is allowed, Studio runs it, its inline scripts and the scripts that depend on it in their order. Visitors allow and revoke in the block `leitvia/consent-settings` on the privacy policy page, a consent manager with the event `leitvia:consent-granted`. Find the hosts in the source of a page (`<script src=`) or the network tab of the browser, then add a small mu-plugin, for example `wp-content/mu-plugins/consent-scripts.php`:

```php
<?php
add_filter( 'leitvia_studio_consent_scripts', fn( array $entries ) => array_merge( $entries, array(
	array( 'host' => 'widgets.example.com', 'category' => 'marketing' ),
	array( 'handle' => 'example-stats', 'category' => 'statistics' ),
) ) );
```

Name every such provider, its purpose and its privacy policy in the privacy policy of the site. Load a page in a private window afterwards: the network tab shows no request to the host until the category is allowed.

Not covered: scripts a plugin echoes itself instead of enqueuing them, script modules, iframes, images and fonts that a plugin loads from another host. A loader that puts the URL together at run time, or a script that calls the host with `fetch`, is caught only by its handle: enter the handle, not the host. Check the network tab; for a plugin that still asks the host, ask its vendor for a consent option, or replace it.
