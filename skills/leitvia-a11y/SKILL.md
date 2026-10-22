---
name: leitvia-a11y
description: Checks a WordPress site with the Leitvia theme and Leitvia Studio against WCAG 2.2 AA and BITV 2.0 as far as abilities and public pages allow, fixes what the leitvia abilities can fix (alt text, link texts, empty headings, heading levels, decorative images) in a change package, and reports in three parts what was fixed, what stays open and why, and what only a person can test (screen readers, plain language, videos, forms of other plugins). Never declares a site accessible. Use it after a site or page was built or changed, before a release, or when someone asks for an accessibility check; colors of the palette belong to leitvia-design.
compatibility: Needs a site with the theme Leitvia and the plugin Leitvia Studio, reached over the MCP server leitvia or the REST routes of the Abilities API with an application password.
---

# leitvia-a11y

You check a site for barriers, remove the ones the abilities can remove and say clearly which ones remain and which ones no tool can judge. You change the site only through the abilities of Leitvia Studio. How to call them, hashes, autonomy levels, change packages and rejections: [agent handbook](../../handbook/README.md). Read its sections "Access over MCP and REST", "Write results" and "Rejections" before the first call.

## Access

- **MCP:** server `leitvia` at `POST /wp-json/leitvia-studio/v1/mcp`. Call `initialize` first and send its `Mcp-Session-Id` header plus `MCP-Protocol-Version` (for example `2025-06-18`) on every further request, or the server answers 400. Tool names use a hyphen where the ability has a slash: `leitvia-audit-site` for `leitvia/audit-site`.
- **REST:** `/wp-json/wp-abilities/v1/abilities/<name>/run`. Read abilities take GET with `?input[post]=...`, the write abilities of this skill take POST with the body `{"input": {...}}`.
- Paths start at the address of the site, not at the host: on `https://example.org/club/` the MCP server is `https://example.org/club/wp-json/leitvia-studio/v1/mcp`. Call `leitvia/get-contract` first and compare `site.url` with the address of your task; when they differ, write nothing and ask the person.
- Sign in with HTTP Basic auth as the agent user and its application password. Never use SQL, WP-CLI or the REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read: the abilities give you every ID, hash and status you need. Reading public pages of the site is fine and part of the check.
- On a site where WP-Cron does not run by itself (WordPress Playground), call `GET /wp-cron.php` after each write.

## Modes

- **package** (default): send the same `package` key on every write of the check, for example `a11y-2026-10`, so a person reviews one change package.
- **direct:** Only when the person asks for it; the autonomy levels decide. Send no `package` key: a key always means a package.

In mode `package` every fix waits in the package, alt text included. In mode `direct` you send no key: alt text belongs to the area `corrections` (`autonomous` by default) and goes live with its own recorded package, text changes on published pages wait in a package. Report both.

## Ground rules

- **Never call a site accessible, barrier free or compliant.** Automated checks find a part of the barriers. Without the tests of a person (see step 6) the report says "no automatically detectable barriers on the checked pages", nothing more.
- **Several writes to one post** in the same package build on each other: each write sends the `hash` of `leitvia/get-page-outline` as usual, changes the post as your earlier writes in the package left it, and the person applies them in order. Several text fixes of one post still fit into one `leitvia/update-content` call.
- **Only what a write brings counts.** Every write runs the content checks over the full post, but findings the post already had do not block it. A write that adds a finding or makes one worse is rejected with `leitvia_check_failed` and names it.
- A rejection is corrected at most once, following `message`, `next_ability` and `retry`. If the second call is rejected too, or `retry` is `never`, stop and tell the person.
- The theme comes with its own test report; it covers the theme, not the content of this site. Judge the site by what you find on the site.

## Steps

### 1. Scope

Ask which pages to check when the person did not say it; default is every published page and post. Note the language of the site and of each page.

### 2. Automated checks

- `leitvia/audit-site` with `limit: 20`, page through with `after` set to `next` until `next` is `null`. `check` holds the name of the check with the prefix `leitvia/`; the checks that matter here:

| Check | WCAG | What it finds |
|---|---|---|
| `headings` | 1.3.1, 2.4.6 | empty headings, skipped levels, an h1 in content when the template prints the title as h1 |
| `page-structure` | 1.3.1 | not exactly one h1 per page, missing header, main or footer |
| `alt-text` | 1.1.1 | images without alt, alt that is a file name, empty alt without the decorative mark |
| `link-text` | 2.4.4 | empty links, links to `#`, link texts such as "click here", "read more", "hier" |
| `content-contrast` | 1.4.3 | text and background roles of a block that are no pair of the contract and miss 4.5:1 |

- `leitvia/get-tokens`: `contrast` lists the pairs of the active palette that miss their minimum. Fixing the palette is a design change: hand it to the skill `leitvia-design`, do not change colors in content.
- Public pages: open each page of the scope and check what the audit does not see, because it comes from the template or a plugin: `<html lang>` matches the language of the page, `<title>` names the page, exactly one `h1`, every `img` has `alt`, every link and button has a name, the skip link is the first focusable element. Findings in header, footer or navigation belong to the template parts; a person decides on them.

Keep this list: it is the "before" of your report.

### 3. Fix through the pipeline

Read the post with `leitvia/get-page-outline` (`hash`, block IDs) and the block with `leitvia/get-block` (attributes, markup). Then:

- **Alt text:** write it yourself from what the image shows and why it is on the page: one short sentence in the language of the page, no "image of", no file names. Text in an image belongs into the alt text. `leitvia/set-alt-text` with `image` (the `attributes.id` of the block), `alt`, `post`, `block` and `base_hash`. When the AI plugin of WordPress offers the ability `ai/alt-text-generation` and the person agreed that images go to the AI provider of the site, use it for a first draft and correct it before you send it.
- **Decorative images:** an image whose meaning the text around it already carries gets an empty alt and the mark: `leitvia/update-block` with `image: { "id": <attachment>, "decorative": true }`.
- **Link texts:** the link text names the target. For a text with one link use `leitvia/update-block` with `text` (the whole new text), `link_text` (the part that stays linked) and `url` when the target changes. A link to `#` needs the real target; when you cannot find it on the site, ask (checkpoint **Link targets**).
- **Empty headings:** give them text with `leitvia/update-content` (`blocks` with `block` and `text`), or ask the person what the section is about.
- **Heading levels:** a skipped level or a second h1 gets the level that fits the outline: `leitvia/update-block` with `attributes: { "level": <n> }` (1 to 6), for example h3 after h1 becomes h2. Work from the top of the page down, so each fix sees the level before it. A heading that is missing altogether needs its text from the person.

In mode `package`, send every write with the `package` key of the check.

### 4. What the abilities cannot fix

- **Landmarks and the h1 of a template:** template work for a person in the Site Editor.
- **Classic content, Custom HTML blocks, blocks of other plugins:** report them; agents may not write them.
- **Palette contrast:** skill `leitvia-design`.

### 5. After the person applied the package

`leitvia/list-packages` with `state: open` gives your package; `leitvia_needs_human` from `leitvia/apply-package` carries the inbox link in `data.inbox`. The person applies it at `/wp-admin/admin.php?page=leitvia-studio-inbox&package=<id>` (checkpoint **Package applied**). Then `GET /wp-cron.php` where needed, `leitvia/get-package` for conflicts, `leitvia/audit-site` and the public pages again: the "after" of your report.

### 6. What only a person can test

No ability and no automated check decides these. List each one that applies to the checked pages, with the page:

- **Screen readers:** reading order, names, roles and states as heard with NVDA and Firefox, VoiceOver and Safari, TalkBack on Android.
- **Keyboard and focus** across the whole page, including menus, dialogs and widgets of other plugins.
- **Meaning of alt texts and link texts:** whether your texts say what matters on this page.
- **Plain language and easy-to-read language** (Leichte Sprache): whether the texts are understandable for the audience, and whether the site needs an easy-to-read version (BITV 2.0 asks public bodies for one).
- **Language changes** inside a text: passages in another language need `lang` on their element, which no ability sets.
- **Videos and audio:** captions, audio description, transcripts; media embedded from other hosts also need a consent placeholder.
- **Forms of other plugins** (contact forms, newsletter, shop checkout): labels, error messages, keyboard use; the checks of Studio do not see them.
- **Documents:** PDF and office files linked from the pages.
- **Zoom and reflow:** 200 % text zoom and 400 % zoom at 320 px width on the real content.

### 7. Accessibility statement

A page with the page kind `accessibility` is a legal text: changes wait for a person, and its content comes from the person. Derive the state of the site from the site: what you found, what stays open, which manual tests are missing. Do not copy the test report of the theme into it. Leave legal statements (enforcement body, contact for feedback) to the person.

## Report

Write the report in the chat, in the language of the person, in three parts, after the package and the checked pages:

1. **Fixed:** per page what you changed, with the check it answers, and whether it is live or waits in the package (ID and inbox link).
2. **Open, with the reason:** per page each finding you did not fix and why: no ability for it (templates, classic content, blocks of other plugins), needs facts from the person, palette for `leitvia-design`.
3. **Only a person can test:** the list of step 6 for the checked pages.

End with the scope (pages, date, language) and the sentence that the report covers automated checks only.

## Checkpoints

Stop and ask the person, then continue with the answer:

- **Scope:** pages to check when the request does not say it.
- **Link targets:** a link to `#` or a vague link whose target you cannot tell.
- **AI for alt text:** before images go to the AI provider of the site.
- **Package applied:** the person reviews and applies the package in the inbox.
- **Second rejection** of the same call, or a rejection with `retry: never`.
- **Accessibility statement:** facts and legal statements come from the person.
