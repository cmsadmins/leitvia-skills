# News brief, duplicate check and post format

Details for `leitvia-news`. Read "News brief" before the first run, "Duplicate check" before you choose a topic, "Post format" before you write.

## News brief

The operator keeps the brief in a file next to the task (for example `news-brief.md`) or names it in the task. The skill reads it on every run and never changes it.

| Field | Example | Required |
|---|---|---|
| Topics | "Repairs and maintenance of city bikes", "cycling in Leipzig" | yes |
| Sources | `https://example.org/feed/`, `https://city.example/press/` (feeds or pages) | yes |
| Language | `en-GB` | yes |
| Cadence | one post per week | yes |
| Audience and tone | owners of everyday bikes; plain, friendly, no hype | no |
| Category and tags | category `News`, tags from the topic | no |
| Length | 300 to 600 words | no |
| Avoid | competitors by name, prices, medical advice | no |

A topic or a source outside the brief is not used. A brief without topics or sources: stop (checkpoint **Brief**).

## Duplicate check

1. Existing posts: `leitvia/list-content` with `post_type` `post` (or the type of the brief), `status` `any` and `after` set to a date about a year back lists published posts, drafts and scheduled posts, newest first, with `title`, `date`, `excerpt`, `terms` and `package` (the open change package a draft waits in). Page with `page` while `pages` is larger. The first item with `status` `publish` in the news category gives the date of the latest news post. Drafts that wait only in a package as new posts do not exist yet: `leitvia/list-packages` with `state: open` and `leitvia/get-package` show their titles.
2. A candidate is a duplicate when an existing post or a waiting draft covers the same event or claim, even with other words: same source URL, same named event, product, date or figure. Compare the meaning, not only the title.
3. Duplicates are dropped and named in the report. When every candidate is a duplicate, write nothing in this run.

## Sources

- Read the source items of the brief that are newer than the last post of the site. Use only items you could open and read in full; a teaser or a headline alone is no source.
- Every fact of the post (names, dates, figures, quotes) comes from a source item you list under the post. A fact in no source stays out.
- Quote at most two short sentences per source, marked as a quote with the source named. The rest is your own wording; never copy paragraphs.
- Sources behind a paywall or login, and sources that forbid reuse, are not used.

## Post format

- Title: names the news, at most 70 characters, no clickbait.
- First paragraph: what happened, when, where, why it matters to the audience of the brief.
- Body: short paragraphs with h2 subheadings where the post is longer than 300 words; only core blocks (`core/paragraph`, `core/heading`, `core/list`, `core/quote`, `core/image` from the media library, `core/embed`).
- Sources: a heading "Sources" and a list with one link per source item (title of the item, publisher, date).
- AI notice: `ai_generated` true on `leitvia/create-content`. Studio then shows a note before the text that AI wrote it, in the language of the site; a person removes it after their own review by deleting the custom field `leitvia_ai_generated`. Do not add a notice of your own to the content.
- Excerpt: one or two sentences, at most 160 characters.
- No images unless the brief names an image source the operator may use; an image from a news source is never copied.
