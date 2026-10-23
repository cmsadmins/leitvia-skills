---
name: leitvia-news
description: Writes a regular news post for the blog of a WordPress site with the Leitvia theme and Leitvia Studio, for example once a week, through the leitvia abilities only. Takes topics and sources from a news brief of the operator, checks candidates against the posts the site already has, writes the post from sources it lists under the post, marks it as written by AI and leaves it as a draft in a change package for a person. Use it for scheduled news runs or when someone asks for a news post from given sources; pages belong to leitvia-page.
compatibility: Needs a site with the theme Leitvia and the plugin Leitvia Studio, reached over the MCP server leitvia or the REST routes of the Abilities API with an application password. Steps 2 and 5 need leitvia/list-content and leitvia/create-content (Leitvia Studio after 1.0.0).
---

# leitvia-news

One run, at most one post: find what is new in the sources of the brief, drop what the site already covered, write a short post with its sources and an AI notice, and leave it as a draft in a change package. Nothing is published by this skill.

Read before the first call: the [agent handbook](../../handbook/README.md) (access, hashes, autonomy, packages, rejections, index of all abilities). Read the page of an ability before you first call it: [get-contract](../../handbook/abilities/leitvia-get-contract.md), [list-content](../../handbook/abilities/leitvia-list-content.md), [create-content](../../handbook/abilities/leitvia-create-content.md), [list-packages](../../handbook/abilities/leitvia-list-packages.md), [get-package](../../handbook/abilities/leitvia-get-package.md). The brief, the duplicate check, the sources and the post format: [news details](references/brief.md).

## Access

MCP server `leitvia` or the REST routes of the Abilities API, as the agent user with its application password: [handbook, Access over MCP and REST](../../handbook/README.md#access-over-mcp-and-rest). Paths start at the address of the site, not at the host. Call `leitvia/get-contract` first and compare `site.url` with the address of your task; when they differ, write nothing and ask the person. Never use SQL, WP-CLI or the REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read. Reading public pages of the site and of the sources in the brief is fine. Where WP-Cron does not run by itself (WordPress Playground), call `GET /wp-cron.php` after each write.

## Modes

- **package** (the only mode of this skill): send one `package` key per run, for example `news-2026-43` (year and week), on every write. The post is created as a draft in that package; a person reviews, publishes or rejects it in the inbox of Leitvia Studio.

## Ground rules

- **Facts are never guessed.** Organization data, prices, legal texts, figures, quotes and people come only from a source you can name: the person, a page of the site or a read ability, with the source in your report. Without one, stop at a checkpoint; never write a placeholder that looks like a fact.
- In a news post the source of every fact is a source item of the brief, listed under the post. Quotes are short, marked and attributed; the rest is your own wording.
- At most one post per run, and never one that covers what the site already has (duplicate check).
- Every post is created with `ai_generated` true, so Studio shows readers a note that AI wrote it.
- Never publish, never change or delete existing posts, never schedule.
- A rejection is corrected at most once, following `message`, `next_ability` and `retry`. If the second call is rejected too, or `retry` is `never`, stop and tell the person.

## Steps

### 1. Read the brief

Read the news brief of the operator: topics, sources, language, cadence and the optional fields ([news brief](references/brief.md#news-brief)). Missing topics or sources: checkpoint **Brief**.

### 2. Read the site

- `leitvia/get-contract`: `site.url` and `site.language`.
- Existing posts and waiting drafts for the duplicate check, and the date of the latest post: [duplicate check](references/brief.md#duplicate-check).
- When the latest news post is younger than the cadence of the brief allows (a weekly brief and a news post from three days ago), write nothing and report it. A news post is a post in the category of the brief, or, without a category, a post with a list of sources; the sample post of WordPress and other posts do not count.

### 3. Collect candidates

Read the sources of the brief and note items newer than the latest post that fit a topic of the brief, each with URL, title, publisher and date ([sources](references/brief.md#sources)). Drop duplicates. Pick the one candidate that matters most to the audience of the brief; with none left, write nothing and report why.

### 4. Write the post

Write title, excerpt and content as block markup following the [post format](references/brief.md#post-format): the news first, short paragraphs, a list of sources with links. Check every fact against its source item once more before you write.

### 5. Create the draft

Call `leitvia/create-content` with `post_type` `post` (or the type of the content model the brief names, with its `fields`), `title`, `content`, `excerpt`, `slug`, `terms` (category and tags from the brief by name; a category must exist, new tags are created), `status` `draft`, `ai_generated` true, `sources` (the URLs), empty `base_hash` and the `package` key. A category that does not exist (`leitvia_invalid_input`, reason `term`): send the call once more without it and name the category in the report.

### 6. Check and report

- `leitvia/list-packages` with `state: open` and `leitvia/get-package`: the package holds exactly one operation, the draft.
- Report: package ID and inbox link `/wp-admin/admin.php?page=leitvia-studio-inbox&package=<id>`, title, the sources, the duplicates you dropped with the post they match, and open questions.

## Checkpoints

Stop and ask the person, then continue with the answer:

- **Brief:** topics or sources are missing, or a source asks for a login.
- **No news:** every candidate is a duplicate, or the cadence says it is too early. Report it; nothing to write.
- **Facts from the person:** a fact the post needs is in no source item.
- **Second rejection** of the same call, or a rejection with `retry: never`.
- **Package applied:** a person reviews the draft, publishes or rejects it.

## Unattended

When no person answers (a scheduled or hosted run), do not wait at a checkpoint. Send the `package` key on every write, also in mode `direct`; never apply, roll back or publish anything. Take facts only from a source you name in the report (briefing, a page of the site, a read ability); without one the fact stays out and becomes an open question. A second rejection, or `retry: never`, stops that part. End with the package ID, what it holds and the open questions. Each checkpoint gets this answer:

| Checkpoint | Answer without a person |
|---|---|
| Brief | Stop; report what the brief lacks. |
| No news | Write nothing; report the candidates and why each was dropped. |
| Facts from the person | Leave the fact out; when the post makes no sense without it, write nothing. |
| Second rejection | Stop; report code and message. |
| Package applied | Expected: the draft waits in the package; the run ends with the report. |
