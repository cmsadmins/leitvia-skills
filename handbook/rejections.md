# Rejections

Generated from Leitvia Studio 1.3.1. Do not edit. What a retry rule means: [agent handbook](README.md#rejections).

Every rejection of Leitvia Studio with its retry rule and next ability. Messages with `%s` or `%d` get a value at run time; codes with several rows come from several places.

| Code | HTTP | Retry | Next ability | Message |
|---|---|---|---|---|
| `leitvia_ai_failed` | 502 | `never` | set at run time | The AI provider refused or failed the request. An administrator checks the connector under Settings, Connectors; until then, call again with ai set to false. |
| `leitvia_ai_invalid_response` | 502 | `once` | set at run time | The AI model answered with data that does not match the expected format. Try once more, or call again with ai set to false. |
| `leitvia_ai_invalid_response` | 502 | `once` | set at run time | The AI model named no pattern of this site. Try once more, or call again with ai set to false. |
| `leitvia_ai_not_approved` | 503 | `never` | set at run time | The AI provider could not be reached, or an administrator has not approved this request for the connector yet. When the AI plugin is active, an administrator approves pending connector requests in its settings; until then, call again with ai set to false. |
| `leitvia_ai_timeout` | 504 | `once` | set at run time | The AI provider did not answer within %d seconds. Try once more, or call again with ai set to false. |
| `leitvia_ai_unavailable` | 424 | `never` | set at run time | AI is not available on this site: it needs WordPress with the AI client, AI switched on and a connector with a text model set up by an administrator under Settings, Connectors. Call again with ai set to false for a plan without AI. |
| `leitvia_check_failed` | 422 | `once` | `leitvia/set-alt-text` | A product image needs alt text that describes it. Set it with leitvia/set-alt-text and try again. |
| `leitvia_check_failed` | 422 | `once` | set at run time | Checks found problems. Fix them as each finding suggests and try again. |
| `leitvia_check_failed` | 422 | `once` | none | Checks found problems. Fix them as each finding suggests and try again. |
| `leitvia_check_failed` | 422 | `once` | `leitvia/set-alt-text` | The featured image needs alt text that describes it. Set it with leitvia/set-alt-text, or mark the image as decorative. |
| `leitvia_check_failed` | 422 | `once` | none | The image needs alt text that describes it, or mark it as decorative. |
| `leitvia_cli_no_user` | 401 | `never` | none | This command acts as a user; run with --user=\<agent or admin>. |
| `leitvia_deprecated_pattern` | 422 | `once` | `leitvia/get-pattern` | The pattern is deprecated. Use its replacement instead. |
| `leitvia_execution_failed` | 500 | `never` | none | The change could not be saved; nothing was changed. Try again later. |
| `leitvia_execution_failed` | 500 | `never` | none | The file could not be saved; nothing was changed. Try again later. |
| `leitvia_forbidden` | 403 | `never` | none | Agents change the site through the %s abilities only. |
| `leitvia_forbidden` | 403 | `never` | none | Sign in as a user who may edit content. |
| `leitvia_forbidden` | 403 | `never` | `leitvia/list-packages` | This change package belongs to someone else. |
| `leitvia_forbidden` | 403 | `never` | none | Your user may not assign terms of this taxonomy. |
| `leitvia_forbidden` | 403 | `never` | none | Your user may not change this object. |
| `leitvia_forbidden` | 403 | `never` | none | Your user may not create change packages. |
| `leitvia_forbidden` | 403 | `never` | none | Your user may not publish this. |
| `leitvia_forbidden` | 403 | `never` | none | Your user may not read the versions of this site. |
| `leitvia_forbidden` | 403 | `never` | none | Your user may not read this token set. |
| `leitvia_forbidden_field` | 403 | `once` | none | Agents may not set showInAbilities. Whether content is open to AI abilities is the decision of a person; remove the field and try again. |
| `leitvia_foreign_host` | 422 | `once` | none | Media from other hosts is not fetched. Send the file as Base64 data instead. |
| `leitvia_import_conflict` | 409 | `never` | none | Targets changed on this site since the package was made. Nothing was imported; compare and export again. |
| `leitvia_invalid_input` | 422 | `once` | set at run time | Built at run time; read the message. |
| `leitvia_invalid_input` | 422 | `never` | none | No link needs or allows a repair. The report lists external links and internal links that could not be resolved. |
| `leitvia_invalid_input` | 400 | `once` | `leitvia/list-patterns` | Pass pattern slugs, or a post whose sections come from patterns. |
| `leitvia_invalid_input` | 400 | `once` | `leitvia/get-contract` | The contract has no page frame of this type. |
| `leitvia_invalid_package` | 400 | `never` | none | Built at run time; read the message. |
| `leitvia_locked` | 403 | `never` | none | Agents may not change this area. A person can change the autonomy settings. |
| `leitvia_media_missing` | 422 | `never` | `leitvia/add-media` | The file of a new image is not on this site any more. Add the image again with leitvia/add-media, then export. |
| `leitvia_media_missing` | 409 | `never` | none | The image this content uses is not applied yet. Apply the image first. |
| `leitvia_needs_human` | 403 | `never` | none | A person has to decide on these operations in the inbox. Apply only operations whose area is autonomous for you. |
| `leitvia_no_contract` | 409 | `never` | none | The active theme has no valid Leitvia contract. Activate the Leitvia theme or fix its contract file. |
| `leitvia_no_replacement` | 422 | `never` | `leitvia/list-patterns` | There is no deprecated pattern with an available replacement here. Choose a pattern and change the section by hand or with leitvia/compose-page. |
| `leitvia_no_seo_plugin` | 422 | `never` | `leitvia/update-content` | No SEO plugin Leitvia Studio can write to is active (Yoast SEO, Rank Math, SEOPress or The SEO Framework). Change the excerpt with leitvia/update-content instead, or ask a person to install one. |
| `leitvia_not_found` | 404 | `once` | `leitvia/get-page-outline` | The page has no block with this ID. Read the page outline for the current IDs. |
| `leitvia_not_found` | 404 | `once` | `leitvia/get-page-outline` | There is no block with this ID. Read the outline for the current IDs. |
| `leitvia_not_found` | 404 | `once` | `leitvia/list-patterns` | There is no pattern with this slug. List the patterns for the current slugs. |
| `leitvia_not_found` | 404 | `once` | `leitvia/get-page-outline` | There is no top-level section with this ID. Read the outline for the current IDs. |
| `leitvia_out_of_scope` | 403 | `never` | none | Agents may not change this object. Only published or draft content of the allowed post types is open to them. |
| `leitvia_out_of_scope` | 403 | `never` | none | Agents may not read this object. Only published or draft content of the allowed post types is open to them. |
| `leitvia_out_of_scope` | 403 | `never` | none | Agents may not see or change this object. Only products, product categories and tags are open to them, never orders, refunds, coupons or customers. |
| `leitvia_out_of_scope` | 403 | `once` | none | Agents may not set this status. Use draft, pending or publish. |
| `leitvia_package_closed` | 409 | `never` | `leitvia/get-package` | The change package is %s; this step is not possible in that state. |
| `leitvia_page_missing` | 409 | `never` | none | The page this setting points to is not applied yet. Apply the page first. |
| `leitvia_pattern_not_approved` | 422 | `once` | `leitvia/list-patterns` | The Lab pattern is not approved yet. Use an approved pattern, or ask a person to approve this one in the Lab. |
| `leitvia_rate_limited` | 429 | `after:<seconds>` | none | Too many calls. Try again in %d seconds. |
| `leitvia_recipe_unavailable` | 422 | `never` | `leitvia/list-recipes` | Built at run time; read the message. |
| `leitvia_rollback_conflict` | 409 | `never` | `leitvia/get-package` | Someone changed the content after the package was applied. Nothing was rolled back; compare the changes and decide by hand. |
| `leitvia_stale_hash` | 409 | `once` | none or `leitvia/get-page-outline` | The target changed since it was read. Read it again and repeat the change on the current state. |
| `leitvia_static_markup` | 422 | `once` | `leitvia/compose-page` | This change needs markup that cannot be rebuilt safely. Insert the pattern again with leitvia/compose-page, or change a block that supports it. |
| `leitvia_too_large` | 413 | `once` | none | The change is too large to compare (more than %d KB). Split it into smaller changes. |
| `leitvia_unknown_package` | 404 | `never` | `leitvia/list-packages` | There is no change package with this ID. List the packages and use one of them. |
| `leitvia_unknown_pattern` | 404 | `once` | `leitvia/list-patterns` | There is no pattern with this name for this template part. List the patterns of its area and use one of them. |
| `leitvia_unknown_pattern` | 404 | `once` | `leitvia/list-patterns` | There is no pattern with this name. List the patterns and use one of them. |
| `leitvia_unknown_recipe` | 404 | `once` | `leitvia/list-recipes` | There is no recipe with this name. List the recipes and use one of them. |
| `leitvia_unsafe_content` | 422 | `once` | `leitvia/list-blocks` | The content holds markup agents may not write: scripts, event attributes, Custom HTML blocks, classic blocks or Base64 data. Use registered blocks and media from the library. |
