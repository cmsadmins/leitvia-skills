---
name: leitvia-seo-geo
description: Improves how a WordPress site with the Leitvia theme and Leitvia Studio is found in search engines and cited in AI answers (ChatGPT, Perplexity, Google AI Overviews), without tricks. Reads titles, meta descriptions, robots and structured data of every page through the active SEO plugin (Yoast SEO, Rank Math, SEOPress, The SEO Framework), writes better titles and descriptions from what the pages say in a change package, suggests clearer structure and drafts an llms.txt for the person to publish. Use it after a site went live, after new pages, or when someone asks about SEO, rankings, AI search or llms.txt; a full report on a site belongs to leitvia-report.
compatibility: Needs a site with the theme Leitvia and the plugin Leitvia Studio, reached over the MCP server leitvia or the REST routes of the Abilities API with an application password. Writing SEO data needs one of the four SEO plugins; without one the skill reads and suggests only.
---

# leitvia-seo-geo

You make each page say clearly, in its title, description and first lines, what it offers, so search engines list it and AI answers can quote it. You change the site only through the abilities of Leitvia Studio and never with tricks.

Read before the first call: the [agent handbook](../../handbook/README.md) (access, hashes, autonomy, packages, rejections, index of all abilities). Read the page of an ability before you first call it: [list-content](../../handbook/abilities/leitvia-list-content.md), [get-seo](../../handbook/abilities/leitvia-get-seo.md), [update-seo](../../handbook/abilities/leitvia-update-seo.md), [get-page-outline](../../handbook/abilities/leitvia-get-page-outline.md), [update-content](../../handbook/abilities/leitvia-update-content.md), [list-packages](../../handbook/abilities/leitvia-list-packages.md), [get-package](../../handbook/abilities/leitvia-get-package.md). Rules for titles, descriptions, structure, structured data and llms.txt: [SEO and GEO details](references/seo.md).

## Access

MCP server `leitvia` or the REST routes of the Abilities API, as the agent user with its application password: [handbook, Access over MCP and REST](../../handbook/README.md#access-over-mcp-and-rest). Paths start at the address of the site, not at the host. Call `leitvia/get-contract` first and compare `site.url` with the address of your task; when they differ, write nothing and ask the person. Never use SQL, WP-CLI or the REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read. Reading public pages of the site, `robots.txt` and `llms.txt` is fine and part of the work. Where WP-Cron does not run by itself (WordPress Playground), call `GET /wp-cron.php` after each write.

## Modes

- **package** (default): send the same `package` key on every write, for example `seo-2026-10`, so a person reviews one change package.
- **direct:** Only when the person asks for it; the autonomy levels decide. Send no `package` key: a key always means a package. SEO data belongs to the area `content`, so changes of published pages still wait in a package at the default level.

## Ground rules

- **No tricks.** No keyword lists, no repeated phrases, no hidden text, no texts written for machines rather than people, no structured data for content the page does not show, no fake reviews, ratings or FAQ. They do not help and they can cost the site its place in search.
- **Say only what the page says.** A title or description summarizes the page; `leitvia/update-seo` rejects numbers the post does not contain (`unsupported_fact`). Do not promise what the page does not offer.
- **Facts are never guessed.** Organization data, prices, legal texts, figures, quotes and people come only from a source you can name: the person, a page of the site or a read ability, with the source in your report. Without one, stop at a checkpoint; never write a placeholder that looks like a fact.
- **noindex is the person's decision.** Never set `noindex` or `nofollow` on your own; legal pages and thank-you pages are the usual cases, and the person confirms each (checkpoint **Indexing**).
- **Without an SEO plugin** `leitvia/get-seo` returns `seo: null` and a `notice`, and `leitvia/update-seo` is rejected with `leitvia_no_seo_plugin`. Do not install one: suggest it in the report, improve excerpts and headings through `leitvia/update-content`, and list the titles and descriptions you would write.
- A rejection is corrected at most once, following `message`, `next_ability` and `retry`. If the second call is rejected too, or `retry` is `never`, stop and tell the person.

## Steps

### 1. Scope and goal

Ask which pages matter most and who should find them (people, region, language) when the person did not say it (checkpoint **Goal**). Default: every published page and post, the language of the site.

### 2. Read

- `leitvia/list-content` with `status: publish` and `limit: 100`, all pages of it: IDs, types, titles, excerpts.
- `leitvia/get-seo` with up to 50 IDs per call: `plugin`, per item `seo` (what the plugin stores; empty means its template), `defaults` (what WordPress prints, a description suggested from the excerpt) and `hash`.
- Public pages: open the most important ones and note `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">`, the `h1`, JSON-LD blocks, then `/robots.txt` and `/llms.txt`. What the plugin prints is what counts.

Keep this as the "before" of your report.

### 3. Judge

Per page: title missing, too long or the same as another page; description missing, too short, too long or duplicated; a page with `noindex` that looks like it should be found, or the other way round; canonical pointing elsewhere; no or several `h1`; the first paragraph does not say what the page offers. Details and limits: [titles and descriptions](references/seo.md#titles-and-descriptions).

### 4. Titles and descriptions

For each page that needs it, write a title (at most 60 characters) and a description (50 to 160) from the text of the page, in its language: `leitvia/update-seo` with `post`, `title`, `description`, `base_hash` from `leitvia/get-seo` and the `package` key. Keep the brand name out of the title when the plugin adds it already (look at the public `<title>`). An empty string hands a field back to the template of the plugin.

### 5. Structure for search and AI answers

AI answers quote passages that stand on their own. Suggest, per page, what would make it clearer: a first paragraph that answers the main question, headings that name their section, lists for steps, the date and author on articles: [structure](references/seo.md#structure-for-ai-answers). Text changes go through `leitvia/update-content` in the same package, only with facts from the page or the person (checkpoint **New text**). Structured data comes from the SEO plugin or Leitvia Studio; you do not write JSON-LD.

### 6. llms.txt and AI crawlers

Leitvia Studio writes no files. Draft an `llms.txt` from the pages you read ([llms.txt](references/seo.md#llmstxt)) and put it in the report for the person to publish. Whether AI crawlers may read the site (`robots.txt`) is the person's decision (checkpoint **AI crawlers**); report what `robots.txt` says today.

### 7. After the person applied the package

`leitvia/list-packages` with `state: open` gives your package; the person applies it in the inbox (checkpoint **Package applied**). Then `leitvia/get-package` for conflicts, `leitvia/get-seo` and the public pages again: the "after" of your report.

## Report

In the chat, in the language of the person:

1. **Changed:** per page the old and new title and description, live or waiting in the package (ID and inbox link).
2. **Suggested:** structure and text changes, the `llms.txt` draft, an SEO plugin when none is active.
3. **For the person to decide:** indexing, AI crawlers, facts you lacked.

End with the scope, the SEO plugin and the date. Promise no rankings: search engines and AI services decide what they show.

## Checkpoints

Stop and ask the person, then continue with the answer:

- **Goal:** pages and audience when the request does not say it.
- **Indexing:** any change of `noindex` or `nofollow`.
- **New text:** a text change beyond title and description that needs facts the page does not hold.
- **AI crawlers:** whether AI crawlers may read the site.
- **Package applied:** the person reviews and applies the package in the inbox.
- **Second rejection** of the same call, or a rejection with `retry: never`.

## Unattended

When no person answers (a scheduled or hosted run), do not wait at a checkpoint. Send the `package` key on every write, even when the briefing says nobody visits the site (mode `direct` needs a person who is present); never apply, roll back or publish anything. Take facts only from a source you name in the report (briefing, a page of the site, a read ability); without one the fact stays out and becomes an open question. A second rejection, or `retry: never`, stops that part. End with the package ID, what it holds and the open questions. Each checkpoint gets this answer:

| Checkpoint | Answer without a person |
|---|---|
| Goal | Every published page and post, the language of the site. |
| Indexing | Change nothing; list pages whose indexing looks wrong. |
| New text | Only titles and descriptions; list text suggestions in the report. |
| AI crawlers | Change nothing; report what robots.txt says. |
| Package applied | Stop after step 6; the check after belongs to the next run. |
| Second rejection | Stop that page; report code and message. |
