---
name: leitvia-page
description: Compose a page on a WordPress site with the Leitvia theme and Leitvia Studio from a goal and content points. Plans the outline from the page frames of the design contract, picks patterns by their composition metadata, fills every text, link and image, scores the composition and builds the page through the Leitvia abilities. Use when someone asks for a new landing page, service page, about page, contact page or any page built from sections.
compatibility: Needs a site with the theme Leitvia and the plugin Leitvia Studio, reached over the MCP server leitvia or the REST routes of the Abilities API with an application password.
---

# leitvia-page

You turn a goal and a few content points into a page that reads as designed: a clear opening, sections that alternate in tone and layout, one accent at most, real texts and real links. You build it only through the Leitvia abilities. The agent handbook (`handbook/README.md` in this package) lists every ability with its input, output and rejections; read its sections on access, hashes, autonomy and rejections once before your first call.

## Access

- **MCP:** server `leitvia` at `POST /wp-json/leitvia-studio/v1/mcp`. Call `initialize` first and send its `Mcp-Session-Id` header plus `MCP-Protocol-Version` (for example `2025-06-18`) on every further request, or the server answers 400. Tool names use a hyphen where the ability has a slash: `leitvia-plan-page` for `leitvia/plan-page`.
- **REST:** `/wp-json/wp-abilities/v1/abilities/<name>/run`. Read abilities take GET with `?input[goal]=...`, all abilities this skill writes with take POST with the body `{"input": {...}}`.
- Paths start at the address of the site, not at the host: on `https://example.org/club/` the MCP server is `https://example.org/club/wp-json/leitvia-studio/v1/mcp`. Call `leitvia/get-contract` first and compare `site.url` with the address of your task; when they differ, write nothing and ask the person.
- Sign in with HTTP Basic auth as the agent user and its application password. Never use SQL, WP-CLI or the REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read: the abilities give you every ID, hash and status you need. Reading public pages of the site is fine.
- On a site where WP-Cron does not run by itself (WordPress Playground), call `GET /wp-cron.php` after each write, so the checks after the write land in the audit log.

## Modes

- **direct:** The autonomy levels of the site decide. With the default levels a new page is created as a draft; it goes live only when the owner set the area `content` to `autonomous`. Send no `package` key: a key always means a package.
- **package:** send the same `package` key on every write of the task (for example `landing-bike-repair`), so a person reviews one change package in the inbox of Leitvia Studio. Use it on live sites unless the person asked for direct work. With a key nothing goes live, whatever the autonomy levels allow.

The result of every write says what happened in `mode`: `live`, `draft`, `package` or `unchanged`. Report it as it is; never claim a page is live when the result says `draft` or `package`.

## Steps

### 1. Clarify the brief

Collect, before any call: the goal of the page (what should a visitor do), the content points, the audience, the language of the page, the links the buttons should lead to, and the images you may use. Facts you do not have stay open questions (see Texts). Then read:

- `leitvia/get-contract`: `pageFrames` (frame types, their template and slots), `compositionRules`, `templates`, `roles` and `blockStyles`.
- `leitvia/list-patterns`: filter by `role`, `tone` or `layout`; each item has `composition`, `images`, `useWhen`, `avoidWhen`, `status` and `replacedBy`. Use only patterns with `status` `approved`: `leitvia/compose-page` refuses a Lab pattern (`block:<ID>`) in draft or review with `leitvia_pattern_not_approved`.

### 2. Plan the outline

Call `leitvia/plan-page` with `goal`, `points` and `frame` (`home`, `service`, `about`, `contact`, `article`). Without an AI connector the plan comes from the rules of the contract (`source: rules`) and is the same for the same input; that is normal, not a fault. Leave `ai` false unless the person wants the goal and points sent to the AI provider the site owner set up.

The plan gives per section the pattern, its role, its slot, text lengths (`length.heading`, `length.text` in characters) and the points it carries. Treat it as a first outline, not as the answer. Replace a planned section when:

- it needs facts nobody gave you: prices (`leitvia/offer-pricing-3`, `leitvia/content-price-list`), figures (`leitvia/content-stats`), customer quotes and testimonials (`leitvia/content-quote`, `leitvia/proof-testimonial`), logos, team members;
- it has texts you cannot replace (see Texts), for example a caption;
- its `avoidWhen` matches your content, or it needs an image you do not have.

Pick the replacement with the same `role` from `leitvia/list-patterns`, and prefer the one whose `tone` and `layout` differ from both neighbors. Show the outline (section, pattern, what it says) to the person before you build: checkpoint **Outline confirmed**.

### 3. Score before you build

Call `leitvia/check-composition` with the pattern slugs in page order and the `template` of the frame. The rules of the contract:

- no two neighbors with the same layout and tone (`noAdjacentRepeat`);
- a break at least every three sections: an image, accent or ink tone, a full bleed layout or `leitvia/content-quote` (`breakWithin`, `breakWhen`);
- accent sections at least two sections apart (`accentMinGap`), and in practice one accent band per page;
- at most two sections of the same density in a row (`maxDensityRun`);
- a hero only as the first section and only on a template without a printed title (`heroFirstOnly`, `heroTemplate`);
- at most `maxSections` sections; frames (header, footer) do not count.

The page starts at 100 and loses the points in `compositionRules.scoring` per finding. `min_score` (80 by default) is the score below which a write is held for a person.

Below `min_score`: revise the outline **once**. Use `suggestions`: each names the section index and up to three patterns of the same role that remove the finding (`replace_with`); take the first one whose needs you can meet (an image, facts). Score the revised outline again. Score two outlines, the first and the revision, not a series of variants in search of a higher score; a revision at or above `min_score` is the outline you show. Still below `min_score`: stop and show the person both outlines with their findings. Never pad a page with sections it does not need to raise the score.

The narrative order of the roles is `hook`, `context`, `proof`, `detail`, `offer`, `close` (`compositionRules.narrative`): open with the promise, explain, prove, go into detail, make the offer, close with the next step. Section padding already follows the density of each pattern; do not change spacing.

### 4. Fill the sections

For each section call `leitvia/get-pattern` and read its markup. Edits address blocks by path ID: `p:0` is the root block of the pattern, `p:0.1` its second child, `p:0.3.0` the first child of the fourth child, counted over blocks only (block comments, not HTML elements). One edit per block, with:

- `text`: plain text of a paragraph, heading, list item or button. Setting the text of a paragraph that holds a link drops the link; write a sentence that stands on its own.
- `url`: the link of a button.
- `image`: `{ "id": <attachment>, "alt": "..." }` or `{ "id": <attachment>, "decorative": true }` for an image or cover block.

See Texts, Links and Images below before you write the edits.

### 5. Build the page

Call `leitvia/compose-page` with `title`, `frame`, `sections` (`pattern` and `edits` each), `base_hash: ""`, an optional `slug`, and `package`. `template` only when the person asked for another page template of the contract (for example `page-docs`); `kind` only for legal, editorial, contact or authors pages. Each section keeps `metadata.patternName`, so the composition can be checked later.

Templates and the h1:

- `page-landing` (frames `home`, `service`, `about`) prints no title: the hero carries the only h1.
- `page` (frame `contact`) prints the title as h1: start the content with h2 and do not use a hero.
- `page-docs` prints the title as h1 and a page list.
- A page needs exactly one h1; the structure check rejects a write with none or several.
- Width and edge come from the template (`layout` in the contract): head and running text start on one left edge, the wide edge, at most `contentSize` wide. Never center running text and never set `align`, `contentSize` or a max width on a block; `wide` and `full` come with the patterns for media, grids and bands.

On a rejection follow its `message` and `next_ability` and correct the call **once** (`retry: once`). A second rejection of the same call, or any `retry: never`, is a checkpoint: stop and tell the person the code and message. `leitvia_rate_limited` means wait `after:<seconds>` and repeat.

### 6. Check the result

- `GET /wp-cron.php` where WP-Cron does not run by itself.
- `leitvia/check-composition` with `post` set to the new page: the score must match the score of the outline.
- `leitvia/get-page-outline` with `post`: status, template and the sections.
- `leitvia/audit-site` for published pages: pass the ID before the page as `after` and `limit: 1`, or page through with `next`. The page needs no findings.
- When the page is live, open its public URL and check that it answers 200 and has one h1.

Report: page ID, URL, `mode` of the write, score, open findings, the open questions from your texts and the package ID if there is one.

## Texts

- Replace every sample text of every pattern you use. Sample copy left on a page publishes fiction: invented names, figures, addresses, phone numbers and quotes.
- Never invent facts. Prices, legal texts (imprint, privacy, terms, withdrawal, accessibility statement), organization data (company name, address, phone, e-mail, register numbers, opening hours), figures, testimonials and team members come from the person. Missing facts are a visible question in your report, not a placeholder on the page.
- A pattern with more slots than you have facts (a strip of five items for four points, a step the briefing does not describe) gets a pattern with fewer slots, or the slot repeats a fact the person gave you. Never fill it with an assumption about the business, even one you flag in the report.
- Some blocks hold text you cannot change with an edit: a caption, or a text with more than one link. Use those patterns only when their sample text fits, otherwise choose another pattern of the same role. The attribution of a quote (`cite`) and the question of a details block (`summary`) take a `text` edit at the quote or details block itself.
- Keep to the text lengths of the plan; a hero heading of 120 characters breaks the layout the pattern was made for.
- Write in the language of the page. In German headings, compound words longer than about 18 characters need soft hyphens (U+00AD) at the joints, or they overflow at 320 px.
- A page in another language than the site needs its own document language. Core has no setting per page; tell the person, who decides on a language plugin.
- Never put review notes or HTML comments into block markup. Open questions go into your report.

## Links

- Every link and button needs a real target: a page of the site, an `https` URL, `mailto:` or `tel:`. A link to `#` is rejected by the link text check; so is link text that does not name its target.
- Button texts name the action and the target ("Book a repair by e-mail", not "Click here").
- A text with one link, such as a contact line "Write to hello@example.com", keeps its link: send `text`, `link_text` (the part that stays linked) and `url` in one edit. A text that would drop a link with a real target is rejected with `leitvia_invalid_input`; a sample link to `#` may be replaced by plain text.
- Only link to pages that exist. When a target page is missing, build it first or ask.

## Images

- Images come from the media library. Add one with `leitvia/add-media` (Base64 data with a file name, or a URL of this site) and an `alt` that describes it, or `decorative: true` when the text around it carries the meaning. URLs of other hosts are rejected and never fetched. A file the person handed you goes over REST: a short script reads it, encodes it and posts `{"input": {"data": ..., "filename": ..., "alt": ...}}`, so the Base64 never passes through your own output. Look at the image before you write its alt text; when it does not show what the briefing says, ask instead of describing the briefing.
- Use the attachment ID in the `image` edit with the same alt text or `decorative: true` (stored as `metadata.leitviaDecorative`). An image without alt and without that flag is rejected.
- Sample images of a pattern come with a sample alt text that describes the sample picture. Replace the image, or choose a pattern without an image slot.
- `images` in `leitvia/list-patterns` gives aspect ratio and recommended size per slot.

## After the page exists

Later changes go through `leitvia/update-content` (texts, title, button links of several blocks), `leitvia/update-block` (attributes, one image) and `leitvia/set-alt-text`, each with the `hash` of `leitvia/get-page-outline` as `base_hash`. To change the order or the set of sections, compose a new page and let the person swap them. New section designs belong to the skill `leitvia-pattern`.

## Checkpoints

Stop and ask the person, then continue with the answer:

- **Brief unclear:** goal, audience, language or link targets are missing.
- **Outline confirmed:** show the sections with pattern and content before `leitvia/compose-page`.
- **Facts from the person:** prices, legal texts, organization data, figures, quotes and team members. The pipeline also holds writes of the content kinds `prices`, `legal` and `organization` at least as suggestions for a person.
- **Score still too low:** below `min_score` after the one revision.
- **Second rejection** of the same call, or a rejection with `retry: never`.
- **Held for a person:** the result says `package` or `draft` and the person expected a live page. Give the package ID; a person applies it in the inbox.
