---
name: leitvia-migrate
description: Moves a WordPress site from a classic theme to the Leitvia theme through the leitvia abilities only. Takes an inventory of pages, posts, menus, widgets and brand, leaves the theme switch to a person, hands the brand to leitvia-design, translates the classic HTML of every page and post into core blocks (paragraph, heading, list, image with alt text, table, quote, embed behind the consent placeholder) without losing a word or an image, rebuilds the main menu with its submenus and bundles every write into one change package. Use it when a site with classic content (no blocks) moves to Leitvia; readers for page builders and ACF blocks are not part of it.
compatibility: Needs a site with the plugin Leitvia Studio, before the switch with its classic theme and after it with the theme Leitvia, reached over the MCP server leitvia or the REST routes of the Abilities API with an application password.
---

# leitvia-migrate

A migration takes a site built with a classic theme and the classic editor and leaves it on Leitvia with the same content as blocks: same pages, same URLs, same texts and images, the same menu, the brand as a token set. You change the site only through the abilities of Leitvia Studio. How to call them, hashes, autonomy levels, change packages and rejections: [agent handbook](../../handbook/README.md). Read its sections "Access over MCP and REST", "Write results" and "Rejections" before the first call. Block markup for each kind of classic HTML: [block markup](references/block-markup.md).

## Access

- **MCP:** server `leitvia` at `POST /wp-json/leitvia-studio/v1/mcp`. Call `initialize` first and send its `Mcp-Session-Id` header plus `MCP-Protocol-Version` (for example `2025-06-18`) on every further request, or the server answers 400. Tool names use a hyphen where the ability has a slash: `leitvia-get-block` for `leitvia/get-block`.
- **REST:** `/wp-json/wp-abilities/v1/abilities/<name>/run`. Read abilities take GET with `?input[post]=...`, the write abilities of this skill take POST with the body `{"input": {...}}`.
- Paths start at the address of the site, not at the host: on `https://example.org/club/` the MCP server is `https://example.org/club/wp-json/leitvia-studio/v1/mcp`. While the classic theme is active, `leitvia/get-contract` answers `leitvia_no_contract`; compare the address of your task with `home` of the public `GET /wp-json/` instead. After the switch call `leitvia/get-contract` and compare `site.url`. When the addresses differ, write nothing and ask the person.
- Sign in with HTTP Basic auth as the agent user and its application password. Never use SQL, WP-CLI or the REST routes of WordPress core (`/wp-json/wp/v2/...`), not even to read: the abilities give you every ID, hash and status you need. Reading public pages of the site is fine and part of the inventory.
- On a site where WP-Cron does not run by itself (WordPress Playground), call `GET /wp-cron.php` after each write.

## Modes

- **package** (default): send the same `package` key on every write of the migration, for example `migrate-2026-10`, so a person reviews one change package.
- **direct:** Only when the person asks for it; the autonomy levels decide. Pages and posts are in the area `content` (`draft` by default), so changes to published content wait in the package either way. Send no `package` key: a key always means a package.

## Ground rules

- **Nothing gets lost.** Every sentence, list item, table cell, link and image of a post is in its block version. Compare before you write (step 4). When you cannot place something, stop and ask; never drop it quietly.
- **No classic block and no Custom HTML.** The pipeline refuses `core/freeform` and `core/html` from agents (`leitvia_unsafe_content`). Every piece of HTML becomes a registered block; the table in step 4 names the block for each tag.
- **Themes and plugins belong to people.** The area `admin` is locked for agents. The theme switch, activating Leitvia Studio and every plugin change are checkpoints.
- **Same URLs.** Keep titles, slugs, parent pages and post dates. A slug change is a URL change; it is not part of a migration.
- **One write per post.** Send the whole new content of a post in one `leitvia/update-content` call. A later write to the same post in the same package builds on it and is applied after it.
- A rejection is corrected at most once, following `message`, `next_ability` and `retry`. If the second call is rejected too, or `retry` is `never`, stop and tell the person.
- Never write review notes or HTML comments into content. Open questions go into the report.

## Steps

### 1. Inventory

Do this while the classic theme is still active: after the switch its menus, widgets and Customizer output no longer show on the public pages.

- **Pages and posts:** `leitvia/audit-site` with `limit: 20`, page through with `after` set to `next` until `next` is `null`. Every item whose findings hold the check `classic-content` is a post to migrate. The audit covers published content; ask the person about drafts and scheduled posts you should move too, and read them by ID.
- **Content per post:** `leitvia/get-page-outline` shows classic content as a single block `p:0` named `core/freeform`. `leitvia/get-block` with `block: "p:0"` returns the raw `post_content` in `inner_html`, with shortcodes unrendered and without the paragraphs WordPress adds when it renders, and in `attachments` the attachment `id` and `url` of each image in it that belongs to the site. Open the public page too: it shows what shortcodes render to.
- **Menus:** read the navigation of the public pages, usually `<nav>` in the header with nested `<ul>`: label, target and level of each item. Note menus in the footer or sidebar separately.
- **Widgets:** text, links and images in sidebars and footer areas of the public pages. List them; they move only where the person says (step 6).
- **Brand:** site title, logo (`img.custom-logo`), colors the Customizer prints into the page (`body.custom-background`, header text color, link and button colors in the theme stylesheet), fonts. Write down the values with their use.
- **Things this skill does not move:** shortcodes, forms and blocks of other plugins, page builders, ACF blocks, custom post types without an editor. List each with the posts that use it.

Show the person the inventory as a table: posts with their kind of content (images, tables, embeds, shortcodes), menus with their items, widgets, brand values, open items. Checkpoint **Inventory confirmed**.

### 2. Theme switch

The person switches the theme; you cannot and may not. Tell them both ways:

- WP-CLI on the server: `wp theme activate leitvia` (with `wp plugin activate leitvia-studio` when Studio is not active yet).
- Backend: Appearance, Themes, Leitvia, Activate.

Checkpoint **Theme switch**. Then call `leitvia/get-contract`; it must answer with the contract of Leitvia, and `site.url` must match the address of the site. On the first visit after the switch WordPress turns the classic menu into a navigation menu for the header; step 5 replaces its items.

### 3. Brand as token set

Hand the brand values of the inventory to the skill `leitvia-design`; it maps them to the color roles of the contract, checks contrast and puts the token set into a package. Typical mapping: page background to `surface`, text color of the old header and body to `ink`, link and button color to `accent`. A logo goes into the header through `leitvia-design` and its checkpoints. When the person wants to keep the brand for later, skip this step and say so in the report.

### 4. Translate the content

For each post: `leitvia/get-block` with `block: "p:0"` (keep `document_hash` and `attachments`), translate `inner_html` into block markup, compare, write.

| Classic HTML | Block |
|---|---|
| Text separated by an empty line, `<p>` | `core/paragraph`; a single line break inside stays as `<br>` |
| Inline `<a>`, `<strong>`, `<em>`, `<code>`, `<br>` | Stay inside the paragraph, heading, list item or cell |
| `<h1>` to `<h6>` | `core/heading`. The template prints the title as h1: an h1 in the content becomes h2, and a skipped level moves up (h3 after the title becomes h2). Name each changed level in the report |
| `<ul>`, `<ol>` with `<li>` | `core/list` (`ordered` for `<ol>`) with one `core/list-item` per item; nested lists stay nested |
| `<img>` | `core/image` with `id` from `attachments` of `get-block` (the entry with this `url`), `src` and `alt` as in the source, character for character (`url` of `attachments` only finds the ID), `align` from `alignleft`, `aligncenter`, `alignright` |
| `[caption]<img> Text[/caption]` | `core/image` with the text as `<figcaption>` |
| `[gallery ids="1,2,3"]` | `core/gallery` with one `core/image` per ID |
| `<table>` | `core/table`; a first row of bold cells or `<th>` becomes `<thead>` with `<th>` |
| `<blockquote>` | `core/quote` with a paragraph inside; a `<cite>` becomes the citation |
| `<iframe>` of a video or audio service, a bare URL on its own line, `[embed]` | `core/embed` with the public URL of the item (YouTube `https://www.youtube.com/watch?v=<id>` for `/embed/<id>` of youtube.com or youtube-nocookie.com, Vimeo `https://vimeo.com/<id>` for `player.vimeo.com/video/<id>`). Leitvia Studio puts it behind the consent placeholder |
| `<hr>` | `core/separator` |
| `<pre>`, `<pre><code>` | `core/preformatted` or `core/code` |
| `<!--more-->` | `core/more` |

Images:

- An image without alt text gets one: one short sentence from what the image shows and why it is on the page, using caption and text around it. An image that only decorates gets an empty alt and `"metadata":{"leitviaDecorative":true}` on the block. List every alt text you wrote in the report.
- An image from another host is not fetched (`leitvia/add-media` refuses other hosts) and must not load from there. Ask the person for the file and add it with `leitvia/add-media` as Base64 data, or leave it out with their consent (checkpoint **Open items**).

Everything else, such as `<script>`, `<style>`, `<form>`, inline `style` attributes, shortcodes of other plugins and markup of page builders, has no block in this skill. Stop at checkpoint **Open items** and let the person decide; never wrap it in a Custom HTML or classic block.

**Compare before you write.** Strip the tags of the source (the text of a caption counts, shortcode brackets do not) and of your block markup, collapse whitespace and compare: the two texts are the same, word for word. The images are the same attachments, in the same order. Links point to the same targets. Only alt texts you added and heading levels you moved may differ, and both go into the report.

**Write:** `leitvia/update-content` with `post`, `content` (the whole new block markup), `base_hash` (the `document_hash`) and the `package` key. The result has `mode: package`.

**Sample of three first:** translate and write three posts with different content (one with images, one with a table, one with an embed when the site has them), then stop at checkpoint **Sample of three**: the person checks the diff with `leitvia/get-package` or in the inbox. Change your translation where they ask, then do the rest.

Rejections:

- `leitvia_unsafe_content` with `reason` `html_block` or `classic_block`: a `core/html` or `core/freeform` block slipped into the markup (`target.block` names it). Replace it with the core block of the table and send again.
- `leitvia_unsafe_content` with `reason` `markup`: an attribute or tag the content may not hold (an event handler, a script URL, a `style` with unsafe content). Remove it; when the content needs it, checkpoint **Open items**.
- `leitvia_check_failed`: the findings name the block and the check (alt text, link text, heading levels). Fix them and send again.
- `leitvia_stale_hash`: the post changed since you read it. Read it again with `leitvia/get-block`, translate the current state, send once more.

### 5. Navigation

Rebuild the main menu of the inventory with `leitvia/update-navigation`: `items` with `label` and `url` per entry, one level of sub `items`. Use paths of this site (`/about-us/`) for its own pages; external links need `https`. A deeper level or more than 30 items: ask the person how to fold it (checkpoint **Open items**). The menu WordPress made on the first visit has a hash no ability returns: send `base_hash` empty, take `current_hash` from the rejection `leitvia_stale_hash` and send once more with it. Send the `package` key.

Footer and sidebar menus are links in template parts; offer them to the person and change them with `leitvia/update-template-part` only on their word.

### 6. Widgets and leftovers

Widgets do not move by themselves. For each widget of the inventory the person decides: into a page, into the footer (`leitvia/update-template-part`), or gone. Do what they decide with the `package` key.

### 7. After the person applied the package

`leitvia/list-packages` with `state: open` gives your package; the person applies it at `/wp-admin/admin.php?page=leitvia-studio-inbox&package=<id>` (checkpoint **Package applied**). Then:

- `GET /wp-cron.php` where needed, `leitvia/get-package` for conflicts.
- `leitvia/audit-site` again: no item may still report `classic-content`.
- Each migrated page in the browser: the texts of the inventory are there, images load, the embed shows the consent placeholder, the menu shows its submenus.
- Run the skill `leitvia-a11y` over the migrated pages.

## Report

Write the report in the chat, in the language of the person:

1. **Migrated:** per post the blocks it has now, alt texts you wrote, heading levels you moved, and the package (ID and inbox link).
2. **Navigation and brand:** the menu as it is now; the token set package from `leitvia-design` or that the brand waits.
3. **Open:** per post or widget what did not move and why (shortcode of a plugin, form, image from another host, page builder, decision of the person pending).
4. **Next:** the `leitvia-a11y` report, and what only a person can test (videos, forms of other plugins).

## Checkpoints

Stop and ask the person, then continue with the answer:

- **Inventory confirmed:** pages, posts, menus, widgets, brand values and open items are complete.
- **Theme switch:** the person activates Leitvia (and Leitvia Studio); you check with `leitvia/get-contract`.
- **Sample of three:** the person checked three translated posts before you write the rest.
- **Open items:** content without a block in this skill, images from other hosts, menus deeper than one sub level, widgets.
- **Package applied:** the person reviews and applies the package in the inbox.
- **Second rejection** of the same call, or a rejection with `retry: never`.
