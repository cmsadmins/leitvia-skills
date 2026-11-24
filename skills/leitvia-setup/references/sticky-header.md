# Sticky header

The header stays at the top of the screen by default, on every screen; no recipe and no step is needed for it. Change it only when the briefing asks, with one block style of the theme on the outermost group of the header part, the group named Header, through `leitvia/update-template-part`:

- `is-style-scrolling-header`: the header scrolls with the page. For a header that should stay in the flow, or when the person asks for it.
- `is-style-sticky-header-desktop`: sticks from 600 px wide only. For headers with several rows or a large logo.
- `is-style-sticky-header-mobile`: sticks below 600 px wide only, where the row with logo and menu button stays in reach.
- `is-style-sticky-header`: on every screen, the same as no style.

Read the part with `leitvia/get-block` on its root block, add the class to `className` of that group and to the class list of its `div`, change nothing else, and send the markup as `content` with the `package` key. Header parts live in the area `design`, so a person decides.

The theme keeps it accessible by itself: in windows lower than 500 px or not wider than 320 px, at 200 % zoom, with enlarged text and in print the header scrolls away, and focused elements and jump targets stop below it (WCAG 2.4.11). With Leitvia Studio a header taller than a quarter of the window scrolls away as well. On phones a service bar on top (`header-utility`) scrolls away and only the row below it sticks; keep the bar the first block of the group named Header, or the whole header sticks. The row needs no compact variant: nothing shrinks or hides on scroll, so do not add a script or classes for that.

## Header over the stage

On a site whose pages open with a full-width photo cover, the header can lie over the photo until the page moves: add `is-style-overlay-header` to the same group (it keeps sticking, `sticky-header` is the default and needs no class); with `sticky-header-desktop` or `sticky-header-mobile` both go space separated in one `className` edit, also in `leitvia/update-template-part` with `pattern` and `edits`. Landing pages show the breadcrumbs below the header; over such a cover they take the text color of the stage. It needs Leitvia Studio, which measures the header, and browsers with scroll-driven animations; others keep the header with its ground. Give those covers a dimming of 60 % or more (block style Inverse), and a dark logo `is-style-on-dark`. For a sober technical or corporate menu, the navigation block of the header takes `is-style-uppercase` (items in capitals, typed in normal case).

## Logo in the header

A logo with a line of small text (a name with a subline) is hard to read at the width that fits beside the menu button on a phone. Give the `core/site-logo` block of the header the block style `is-style-large-on-desktop` and the width it should have from 1024 px up, about 1.4 times the phone width (260 px on a phone becomes 360). Below 1024 px the theme shows it at 70 %. On a dark band it keeps `is-style-on-dark` as a second class. Both go through an edit of `leitvia/update-template-part` (with `pattern` and `edits`) or `leitvia/update-block` at the ID of the logo: `"attributes": { "width": 360, "className": "is-style-large-on-desktop" }` (width 20 to 600 px), no markup of your own. In a footer the same edit sets the logo width, for example to the height the brand asks for.

## Navigation in the header

Menu items change with `leitvia/update-navigation`, which leaves the header as it is. When you send a header part as `content`, keep the `core/navigation` block of the theme pattern with all its attributes, above all `"submenuVisibility":"click"`, `overlay` and `ariaLabel`; change only the items. `leitvia/update-template-part` puts back these settings where the new navigation lacks them, but a value you send stays.
