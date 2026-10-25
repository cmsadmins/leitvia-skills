# SEO and GEO details

Load this file when the skill names it. It holds the rules behind steps 3 to 6 of [leitvia-seo-geo](../SKILL.md).

## Titles and descriptions

| Field | Rule |
|---|---|
| Title | At most 60 characters, the main topic first, unique on the site. Name what the page offers, not "Home" or "Welcome". The SEO plugin usually adds the site name; do not add it twice. |
| Description | 50 to 160 characters, one or two full sentences that say what a visitor finds and why it helps. Unique per page. No list of keywords, no quotation marks around the whole text. |
| Language | The language of the page. A page in German gets a German title, whatever the language of the person. |
| Numbers | Only numbers the page holds: prices, years, counts. `leitvia/update-seo` rejects the others with `unsupported_fact`. |

Search engines may still show another text when theirs fits a search better; a good description makes that rarer, never impossible.

Fields `leitvia/get-seo` reads but `leitvia/update-seo` does not write: canonical, Open Graph title, description and image, focus keyword and schema type. Report problems with them for the person to fix in the SEO plugin. A canonical that points to another page is often deliberate (a copy of a page); ask before you call it a mistake.

Common findings and what to do:

| Finding | Do |
|---|---|
| Two pages with the same title | Give each the topic that sets it apart. |
| Description empty | Write one from the first paragraph; the plugin would otherwise take any text of the page. |
| Description from `defaults` only (no plugin) | List it as a suggestion; WordPress prints no meta description by itself. |
| `noindex` on a page that should be found | Checkpoint Indexing; never change it on your own. |
| Legal page, search page or thank-you page indexed | Same checkpoint; many sites keep them out of search. |

## Structure for AI answers

AI search (Google AI Overviews, ChatGPT search, Perplexity, Copilot) quotes short passages that make sense alone. What helps, all of it also good for people:

- The first paragraph answers the main question of the page in two or three sentences: who offers what, where, for whom.
- Headings name their section ("Prices for a bike service", not "More"). One `h1`, then `h2` and `h3` in order.
- Steps as numbered lists, comparisons as tables, facts with their unit and date.
- Articles show their date and author; keep both visible.
- Names stay the same everywhere: the organization, products and places as on the imprint.
- Questions people ask may become headings, answered right below, when the page really answers them. No invented FAQ.

Structured data: with an SEO plugin, the plugin prints it (its settings decide the types). Without one, Leitvia Studio can print `BlogPosting` or `NewsArticle` with the organization as publisher on posts and `ProfilePage` on author pages, when its setting for structured data is on; `defaults.schema` of `leitvia/get-seo` names what a post gets. Never add JSON-LD in content blocks.

## llms.txt

`llms.txt` is a proposed plain text file at the root of a site (`/llms.txt`) that tells language models what the site is and which pages matter. Not every AI service reads it; it costs little and harms nothing. Leitvia Studio does not write it; the person or the host puts the file on the server, or uses a plugin that serves it.

Draft from pages you read, in Markdown:

```
# Name of the organization

> One sentence: what the organization offers, where and for whom.

## Main pages

- [Services](https://example.org/services/): what is offered, with prices
- [About](https://example.org/about/): team and history

## Optional

- [News](https://example.org/news/): recent articles
```

Only published pages that should be found, each with a short note from its description. No pages with `noindex`, no private data.

## AI crawlers

`robots.txt` decides which crawlers may read the site, AI crawlers included (for example `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `Google-Extended`, `ClaudeBot`). Blocking them keeps the site out of the answers of those services; allowing them lets the services use the texts. That is a decision of the person about their content. Report what `robots.txt` says today and what each choice means; change nothing.
