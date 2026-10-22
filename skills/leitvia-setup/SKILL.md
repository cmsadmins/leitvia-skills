---
name: leitvia-setup
description: Sets up a WordPress site with the Leitvia theme and Leitvia Studio from a briefing, through the leitvia abilities only. Picks a site recipe (company, shop, blog, publication, documentation), applies content model, style variation, header, footer, navigation and base pages, and hands everything to a person as a change package. Use it for a new site or a fresh start of an existing one; brand colors and fonts belong to leitvia-design, single pages to leitvia-page.
---

# leitvia-setup

Turn a briefing into a working site: recipe, style variation, header, footer, navigation and the base pages, ready for a person to review. You change the site only through the abilities of Leitvia Studio. How to call them (MCP server `leitvia` or REST), hashes, autonomy levels, change packages and rejections: [agent handbook](../../handbook/README.md). Read its sections "Access over MCP and REST" and "Rejections" before the first call.

## Ground rules

- Write only through `leitvia/*` abilities. No SQL, no WP-CLI, no REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read. Reading public pages of the site and of the operator's other sites is allowed.
- The site is the one at the address of your task, which in a multisite network can have a path (`https://example.org/club/`); every path starts there, not at the host. Call `leitvia/get-contract` first and compare `site.url` with that address; when they differ, write nothing and ask the person.
- Mode `package` is the default for a live site: send the same `package` key on every write of the task, for example `setup-2026-10`. Use mode `direct` only when the person says the site is not live yet.
- Never invent facts about the operator: company name, address, register entries, VAT ID, managing directors, data protection officer, server location, retention periods. Every fact you cannot confirm from a source the person named becomes a visible question to the person, never a placeholder that looks like a fact.
- Take numbers about the site (patterns, page frames, variations, template parts) from `leitvia/get-contract` and `leitvia/list-patterns` (`total`), never from prose, marketing pages or memory.
- A rejection is corrected at most once, following `message`, `next_ability` and `retry`. If the second call is rejected too, stop and ask the person.

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
- `leitvia/get-content-model` when the briefing asks for own content types.

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

Call `leitvia/apply-recipe` with `recipe` and your `package` key. With a key nothing goes live: every part lands in that one change package, whatever the autonomy of the site allows. In mode `direct` send no key; then the autonomy levels decide and what they hold back still lands in one package. It runs content model, token set, style variation, header and footer, pages, navigation, reading settings and the options that save data, each through its own ability. Read the `steps` of the result:

| Status | Meaning |
|---|---|
| `live` | Written and visible. |
| `draft` | Written as a draft; a person publishes it. |
| `package` | Waits in the change package (ID in `package` of the result). |
| `exists` | The page or setting is already there; nothing changed. |
| `waiting` | Needs a page that is neither on the site nor in the package (`page_missing`), or a parent page. |
| `rejected`, `unavailable` | Read `code` and `message`; report it. |

Recipe pages, header and footer are built from patterns and carry their sample texts: invented names, addresses, phone numbers, prices, figures and quotes. Read the diff of the package (`leitvia/get-package`) and list every such text with its page before the person applies it, so they know what goes live; replacing them is work for `leitvia-page` and the person's facts after the setup, not a reason to rebuild the recipe by hand. On a site that is already live, ask whether the package should wait until those texts are replaced.

Settings that point to recipe pages (front page, privacy policy page, terms page of the shop) wait in the same package and get the ID of their page when the person applies it, so one package covers the whole setup. Review the package with `leitvia/get-package` and tell the person what it contains and that it needs their decision in the inbox of Leitvia Studio. You cannot apply operations of areas that are not autonomous; `leitvia/apply-package` answers `leitvia_needs_human` and that is expected.

Checkpoint "Package applied".

### 5. Confirm the setup after the package was applied

After the person applied the package, call `leitvia/apply-recipe` once more with the same key. It must report `package: 0` and only `exists` (or `unavailable` for parts the site lacks); that is your proof the setup is complete, and its `steps` hold the IDs of the pages (`target.post`). Anything else means an operation of the package stayed open: read it with `leitvia/get-package` and report it.

### 6. Legal pages

Recipe legal pages (imprint, privacy policy, terms, withdrawal) contain placeholder text that says it is a placeholder. Replace it only with text the person supplied:

1. Find the page ID in the `steps` of the recipe run (`target.post`) and read it with `leitvia/get-page-outline`; its `hash` is the `base_hash`.
2. Write the supplied text with `leitvia/update-content` (block IDs from the outline) and the same `package` key. Legal pages always land in a package (content kind `legal`), whatever the area allows. Copy each sentence character for character, punctuation included: no reformatting into labels, no merged or split sentences. A fact that is still missing (VAT ID, e-mail, phone) stays out of the page; never write "still open" or similar onto a legal page, list it in your report.
3. Until the person supplies the texts, keep the placeholders and list the open pages in your report. Never publish a shop or site as finished while a legal placeholder is visible.

Checkpoint "Legal texts supplied by the human".

### 7. Check the result

- `leitvia/audit-site` (pass `next` as `after` until `next` is null): every item without findings.
- Fetch the public URL of every page the recipe created and the front page: status 200 and exactly one `h1`. A 404 often means the page waits in a package or stayed a draft.
- `leitvia/list-packages` with `state` `open`: empty when the person applied everything.

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

## Checkpoints

Stop and wait for the person at each of these points. Report what you did, what is open and the exact question.

1. **Briefing confirmed:** operator, kind of site, mode, fixed slugs and who supplies legal texts are answered.
2. **Recipe chosen:** the person agreed to the recipe and the list of pages and slugs it creates.
3. **Legal texts supplied by the human:** imprint, privacy policy and, for shops, terms and withdrawal text come from the person, verbatim. Without them the placeholders stay and the site is not finished.
4. **Package applied:** the person reviewed and applied the change package in the inbox. Confirm the setup afterwards (step 5); the package of the legal texts is the same checkpoint.

Also stop after the second rejection of the same call, and whenever two sources of the operator contradict each other.
