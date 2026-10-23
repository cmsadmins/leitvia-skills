# Fixes, manual tests and the statement

Details for `leitvia-a11y`. Read "Fixes" before step 3, "Manual tests" for the third part of the report, "Accessibility statement" when that page is in scope.

## Fixes

Read the post with `leitvia/get-page-outline` (`hash`, block IDs) and the block with `leitvia/get-block` (attributes, markup). Then:

- **Alt text:** write it yourself from what the image shows and why it is on the page: one short sentence in the language of the page, no "image of", no file names. Text in an image belongs into the alt text. `leitvia/set-alt-text` with `image` (the `attributes.id` of the block), `alt`, `post`, `block` and `base_hash`. When the AI plugin of WordPress offers the ability `ai/alt-text-generation` and the person agreed that images go to the AI provider of the site, use it for a first draft and correct it before you send it.
- **Decorative images:** an image whose meaning the text around it already carries gets an empty alt and the mark: `leitvia/update-block` with `image: { "id": <attachment>, "decorative": true }`.
- **Link texts:** the link text names the target. For a text with one link use `leitvia/update-block` with `text` (the whole new text), `link_text` (the part that stays linked) and `url` when the target changes. A link to `#` needs the real target; when you cannot find it on the site, ask (checkpoint **Link targets**).
- **Empty headings:** give them text with `leitvia/update-content` (`blocks` with `block` and `text`), or ask the person what the section is about.
- **Heading levels:** a skipped level or a second h1 gets the level that fits the outline: `leitvia/update-block` with `attributes: { "level": <n> }` (1 to 6), for example h3 after h1 becomes h2. Work from the top of the page down, so each fix sees the level before it. A heading that is missing altogether needs its text from the person.

## What the abilities cannot fix

- **Landmarks and the h1 of a template:** template work for a person in the Site Editor.
- **Classic content, Custom HTML blocks, blocks of other plugins:** report them; agents may not write them.
- **Palette contrast:** skill `leitvia-design`.

## Manual tests

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

## Accessibility statement

A page with the page kind `accessibility` is a legal text: changes wait for a person, and its content comes from the person. Derive the state of the site from the site: what you found, what stays open, which manual tests are missing. Do not copy the test report of the theme into it. Leave legal statements (enforcement body, contact for feedback) to the person.
