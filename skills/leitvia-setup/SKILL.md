---
name: leitvia-setup
description: Sets up a WordPress site with the Leitvia theme and Leitvia Studio from a briefing, through the leitvia abilities only. Picks a site recipe (company, shop, blog, publication, documentation), applies content model, style variation, header, footer, navigation and base pages, and hands everything to a person as a change package. Use it for a new site or a fresh start of an existing one; brand colors and fonts belong to leitvia-design, single pages to leitvia-page.
---

# leitvia-setup

Turn a briefing into a working site: recipe, style variation, header, footer, navigation and the base pages, ready for a person to review. You change the site only through the abilities of Leitvia Studio.

Read before the first call: the [agent handbook](../../handbook/README.md) (access, hashes, autonomy, packages, rejections, index of all abilities). Read the page of an ability before you first call it: [get-contract](../../handbook/abilities/leitvia-get-contract.md), [list-recipes](../../handbook/abilities/leitvia-list-recipes.md), [get-content-model](../../handbook/abilities/leitvia-get-content-model.md), [define-content-type](../../handbook/abilities/leitvia-define-content-type.md), [apply-recipe](../../handbook/abilities/leitvia-apply-recipe.md), [compose-page](../../handbook/abilities/leitvia-compose-page.md), [get-package](../../handbook/abilities/leitvia-get-package.md), [get-page-outline](../../handbook/abilities/leitvia-get-page-outline.md), [update-content](../../handbook/abilities/leitvia-update-content.md), [audit-site](../../handbook/abilities/leitvia-audit-site.md), [list-packages](../../handbook/abilities/leitvia-list-packages.md), for a shop [create-product](../../handbook/abilities/leitvia-create-product.md). Statuses of a recipe run, shop sites and what a recipe does not cover: [recipe details](references/recipe.md). Format of own content types: [content model](references/content-model.md).

## Ground rules

- Write only through `leitvia/*` abilities. No SQL, no WP-CLI, no REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read. Reading public pages of the site and of the operator's other sites is allowed.
- The site is the one at the address of your task, which in a multisite network can have a path (`https://example.org/club/`); every path starts there, not at the host. Call `leitvia/get-contract` first and compare `site.url` with that address; when they differ, write nothing and ask the person.
- Mode `package` is the default for a live site: send the same `package` key on every write of the task, for example `setup-2026-10`. Use mode `direct` only when a person is present and says the site is not live yet; the drafts it leaves are theirs to publish.
- **Facts are never guessed.** Organization data, prices, legal texts, figures, quotes and people come only from a source you can name: the person, a page of the site or a read ability, with the source in your report. Without one, stop at a checkpoint; never write a placeholder that looks like a fact.
- Here that covers company name, address, register entries, VAT ID, managing directors, data protection officer, server location and retention periods.
- Take numbers about the site (patterns, page frames, variations, template parts) from `leitvia/get-contract` and `leitvia/list-patterns` (`total`), never from prose, marketing pages or memory.
- A rejection is corrected at most once, following `message`, `next_ability` and `retry`. If the second call is rejected too, stop and ask the person. The round of an empty `base_hash` with `leitvia_stale_hash` is protocol, not a rejection.

## Workflow

### 1. Read the briefing and ask

Before any call that writes, collect the answers to these questions. Ask only what the briefing leaves open.

1. Who operates the site (legal entity)? Does the operator have legal pages elsewhere (imprint, privacy policy, accessibility statement) that this site should reuse?
2. Who supplies the legal texts? You draft structure, never the legal content.
3. Which URLs must stay fixed because other sites already link to them (for example `/legal-notice/` or `/privacy-policy/`)? Slugs of a recipe are not sacred; fixed links are.
4. Is the site live (mode `package`) or a fresh install nobody visits yet (mode `direct`)?
5. Which kind of site: company, shop, blog, publication or documentation? A shop needs WooCommerce active before you start.

When the operator has legal pages elsewhere, fetch them, copy the facts verbatim and compare the facts of the pages with each other (name, address, contact on imprint versus privacy policy). Report every contradiction to the person; never decide which one is right.

Checkpoint "Briefing confirmed".

### 2. Read the site

- `leitvia/get-contract`: page frames, template parts, style variations, contrast pairs.
- `leitvia/list-recipes`: name, pages, `available` and `reason`. A recipe with `available: false` names the plugin it needs; tell the person, do not install plugins.
- `leitvia/get-content-model` when the briefing asks for own content types (team, events, courses): add them with `leitvia/define-content-type` (post types, fields, select options, relations, taxonomies; format and a complete example: [content model](references/content-model.md)) in the same package; their entries come after the package was applied, from `leitvia-page`, `leitvia-migrate` or `leitvia-news`.

### 3. Choose the recipe

Pick the recipe whose `description` and `pages` fit the briefing:

| Briefing | Recipe |
|---|---|
| Company, agency, freelancer | `leitvia/company` |
| Online shop with WooCommerce | `leitvia/shop` |
| Personal or team blog | `leitvia/blog` |
| Magazine, newsroom | `leitvia/publication` |
| Product or project documentation | `leitvia/documentation` |

Tell the person which pages the recipe creates and which slugs they get. If a fixed slug from step 1 differs, the page has to be created by hand with `leitvia/compose-page` and `slug` before the recipe runs (the recipe keeps pages of the same kind or slug).

Checkpoint "Recipe chosen".

### 4. Apply the recipe

Call `leitvia/apply-recipe` with `recipe` and your `package` key. With a key nothing goes live: every part lands in that one change package, whatever the autonomy of the site allows. In mode `direct` send no key; then the autonomy levels decide and what they hold back still lands in one package. With the default levels new pages become drafts the person publishes. The person rejects a package left by a switch to `package`. Read the `steps` of the result (statuses: [recipe details](references/recipe.md#status-of-a-step)). For a shop, create the products of the briefing with `leitvia/create-product` and the same key; they need nothing from the package ([shop sites](references/recipe.md#shop-sites)).

The recipe pages carry the sample texts of their patterns. Read the diff with `leitvia/get-package` and list every sample text with its page before the person applies the package ([recipe details](references/recipe.md#sample-texts-of-the-recipe)). Tell the person what the package contains and that it needs their decision in the inbox of Leitvia Studio.

Checkpoint "Package applied".

### 5. Confirm the setup after the package was applied

After the person applied the package, call `leitvia/apply-recipe` once more with the same key. It must report `package: 0` and only `exists` or `unchanged` (or `unavailable` for parts the site lacks); that is your proof the setup is complete, and its `steps` hold the IDs of the pages (`target.post`). Anything else means an operation of the package stayed open: read it with `leitvia/get-package` and report it.

### 6. Legal pages

Recipe legal pages (imprint, privacy policy, terms, withdrawal) contain placeholder text that says it is a placeholder. Replace it only with text the person supplied:

1. Find the page ID in the `steps` of the recipe run (`target.post`) and read it with `leitvia/get-page-outline`; its `hash` is the `base_hash`.
2. Write the supplied text with `leitvia/update-content` (block IDs from the outline) and the same `package` key. Legal pages always land in a package (content kind `legal`), whatever the area allows. Copy each sentence character for character, punctuation included: no reformatting into labels, no merged or split sentences. A fact that is still missing (VAT ID, e-mail, phone) stays out of the page; never write "still open" or similar onto a legal page, list it in your report.
3. Until the person supplies the texts, keep the placeholders and list the open pages in your report. Never publish a shop or site as finished while a legal placeholder is visible.

Checkpoint "Legal texts supplied by the human".

### 7. Check the result

- `leitvia/audit-site` (pass `next` as `after` until `next` is null): every item without findings, except `legal-placeholder` on legal pages whose texts the person has not supplied yet (list them as open).
- Fetch the public URL of every page the recipe created and the front page: status 200 and exactly one `h1`. A 404 often means the page waits in a package or stayed a draft.
- `leitvia/list-packages` with `state` `open`: empty when the person applied everything.
- For a shop, the WooCommerce pages and the privacy options: [recipe details](references/recipe.md#shop-sites). Tell the person what a recipe does not cover (avatars, page language, admin settings): [recipe details](references/recipe.md#what-a-recipe-does-not-cover). No ability sets the site title and tagline; propose both from the briefing in your report.

## Checkpoints

Stop and wait for the person at each of these points. Report what you did, what is open and the exact question.

1. **Briefing confirmed:** operator, kind of site, mode, fixed slugs and who supplies legal texts are answered.
2. **Recipe chosen:** the person agreed to the recipe and the list of pages and slugs it creates.
3. **Legal texts supplied by the human:** imprint, privacy policy and, for shops, terms and withdrawal text come from the person, verbatim. Without them the placeholders stay and the site is not finished.
4. **Package applied:** the person reviewed and applied the change package in the inbox. Confirm the setup afterwards (step 5); the package of the legal texts is the same checkpoint.
5. **Shop settings** (recipe `leitvia/shop`): the person set up WooCommerce as [shop sites](references/recipe.md#shop-sites) lists it. No ability does it; until then the checkout cannot take an order.

Also stop after the second rejection of the same call, and whenever two sources of the operator contradict each other.

## Unattended

When no person answers (a scheduled or hosted run), do not wait at a checkpoint. Send the `package` key on every write, even when the briefing says nobody visits the site (mode `direct` needs a person who is present); never apply, roll back or publish anything. Take facts only from a source you name in the report (briefing, a page of the site, a read ability); without one the fact stays out and becomes an open question. A second rejection, or `retry: never`, stops that part. End with the package ID, what it holds and the open questions. Each checkpoint gets this answer:

| Checkpoint | Answer without a person |
|---|---|
| Briefing confirmed | Take operator, kind of site and fixed URLs from the briefing only; mode is `package`, whatever the briefing says about visitors. When the kind of site is missing, stop. |
| Recipe chosen | The recipe the table of step 3 names for the kind of site in the briefing; when two fit, stop. |
| Legal texts supplied by the human | Keep the placeholders; list the legal pages as open. |
| Package applied | Stop after step 4; the package waits for a person. Steps 5 to 7 belong to the next run. |
| Shop settings | List the shop settings of [shop sites](references/recipe.md#shop-sites) as steps of the person. |
| Contradicting sources | Write neither value; list both with their sources. |

Steps only a person can do go into the report as a list: [new-site, steps of the person](../../workflows/new-site.md#steps-of-the-person). A briefing that asks for an invented site is the source of its invented content: [invented sites](../../workflows/new-site.md#invented-sites).
