# Animation on scroll

Details for `leitvia-pattern` and `leitvia-page`. Read it before you give a block an effect, or when an audit or a person asks about motion.

Leitvia Studio gives every block the attribute `leitviaAnimation`, core blocks included: `none` (the default), `fade`, `rise` or `stagger`. The block appears once when it is clearly in view, in 800 ms on a soft curve (GSAP power3.out): `fade` fades it in, `rise` fades it in while it moves up 2.5rem, `stagger` does the same as `rise` for each direct child, each when it comes into view itself; children that come into view together (a row of columns on a large screen) start 100 ms apart up to the sixth, stacked children on a phone one by one. Only the block comment carries the value; the saved HTML stays as it is, and Studio adds the classes `has-lv-animation is-lv-animation-<effect>` on the front end. The block `leitvia/reveal` (attribute `effect`) uses the same style and script. The attribute is missing on blocks without markup of their own and on the navigation: `core/html`, `core/shortcode`, `core/freeform`, `core/block`, `core/pattern`, `core/template-part`, `core/post-content`, `core/navigation` and its links, `core/page-list`, `leitvia/reveal`, `leitvia/mega-menu` and a few more. `leitvia/list-blocks` lists it, with its description, in the attributes of the blocks of its catalog.

What a visitor sees: the script hides only blocks that start below the visible area when the page loads; what is in view stays as it is, so nothing flickers and LCP and CLS do not change. A hidden block starts once a fifth of it is above a line 12 % over the bottom edge of the window; a block taller than the window starts once a third of the window height of it is in view. Keyboard focus inside a hidden block and a jump to an anchor (the target and everything above it) show it at once, without the effect. Without JavaScript, with reduced motion (`prefers-reduced-motion: reduce`), in print and in the editor every block is simply there. It works in all current browsers.

## Markup

The value goes into the block comment, nothing else changes:

```html
<!-- wp:group {"metadata":{"name":"Services"},"leitviaAnimation":"rise","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|xl","bottom":"var:preset|spacing|xl"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--xl);padding-bottom:var(--wp--preset--spacing--xl)">...</div>
<!-- /wp:group -->

<!-- wp:columns {"leitviaAnimation":"stagger","align":"wide"} -->
<div class="wp-block-columns alignwide">...</div>
<!-- /wp:columns -->

<!-- wp:leitvia/icon-list {"icon":"circle-check","leitviaAnimation":"stagger","fontSize":"lead"} -->
```

Key order as the editor saves it: `leitviaAnimation` comes after the attributes of the block itself (`icon`, `verticalAlignment`, `postType`), after `lock` and `metadata`, and before every attribute of the block supports: `align`, `className`, `style`, the colors, `fontSize`, `fontFamily`, `layout` and `anchor`. Leave out `"leitviaAnimation":"none"`, it is the default and the editor does not save it. A value other than the four is ignored on the front end. As everywhere, copy the order from markup the editor saved and never sort keys.

## When to use it

- **Sparingly.** On a home page three to six sections at most, on other pages one or two, many pages none. Never every section: motion on every block distracts and slows reading.
- **Never in the first screen.** No effect on the hero, the first section after it or the block that holds the largest image or heading of the first view (LCP). On a short screen the second section is already in the first view.
- **Never** on the header, the navigation, forms, notices and messages (form errors, announcement bar, consent, alerts), legal texts or content a visitor needs right away (opening hours of today, prices next to a checkout, a warning).
- **Calls to action never wait.** No effect on a buttons block or a band whose purpose is the button; in a `stagger` the main button is never one of the later children. A closing band with a call to action stays still.
- **One effect per section,** on its root block or on its grid, not on both and not nested. Text sections: `rise` or `fade`. Cards, icon lists, columns, feature groups, bento and pricing grids: `stagger` on the block whose direct children are the cards or items (`core/columns`, `leitvia/icon-list`, the grid group), not on the outer band.
- **Calm sectors** such as a law firm, a medical practice, a public authority, an insurer or a funeral home: `fade` only, or no animation at all. When in doubt, none.
- **Tone of the brand:** lively brands (a restaurant, an agency, a shop for young buyers) may use `rise` and `stagger`; a site that reads quiet stays quiet.

## Accessibility

- Motion never carries information: the content, its order and its meaning are the same without the effect. Never write a text that refers to the motion ("see the points appear").
- Reduced motion, no JavaScript and print show everything at once; that is the state to judge contrast, reading order and focus in, and the state an accessibility check sees.
- The effect runs once and lasts 800 ms (WCAG 2.2.2 needs no pause button for it). There is no hover or scroll linked motion; nothing flashes (2.3.1).
- A hidden block shows itself when it gets focus, so keyboard users never land in invisible content (2.4.7, 2.4.11).

## Through the abilities

- **New pattern or variant:** set `leitviaAnimation` in the markup of `leitvia/create-pattern`, or of `leitvia/vary-pattern` with a full `content`. `edits` of a variant cannot set it.
- **New page:** `leitvia/compose-page` keeps the attribute the patterns carry; its edits (text, link, image) cannot add or remove it. Pick a pattern that already has the effect, or a variant with it.
- **Existing page:** `leitvia/update-block` with `attributes: { "leitviaAnimation": "rise" }` works only on catalog blocks that render on the server or save no markup of their own, for example `leitvia/rating` or `leitvia/icon`. It refuses every other block: core blocks such as `core/group`, `core/columns`, `core/cover` or `core/paragraph` with `leitvia_invalid_input` (the block or the attribute is not in the block catalog), Studio blocks with saved markup such as `leitvia/icon-list`, `leitvia/timeline`, `leitvia/pricing` or `leitvia/feature-group` with `leitvia_static_markup`. Do not retry these. The way that works is `leitvia/update-content` with `content`: the `markup` of `leitvia/get-block` for every top-level block in order, with the attribute added to the comment of the block that gets the effect, and the `hash` of `leitvia/get-page-outline` as `base_hash`. It replaces the whole content, so send it with your `package` key.

More effects (zoom, slide, wipe, blur), two strengths through a second attribute `leitviaMotion` (`subtle`, `bold`), a site setting for motion and `update-block` on static blocks are planned for a later Studio version. Until `leitvia/list-blocks` lists them, they do not exist: never write `leitviaMotion` or another value of `leitviaAnimation`.
