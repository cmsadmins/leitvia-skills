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

## Mega menu

For a main item with many sub pages (services in four groups, a shop with lines), build a mega menu instead of a long submenu, in two steps and the same `package` key:

1. Panel: `leitvia/update-template-part` with `part` `mega-menu-<name>` (for example `mega-menu-services`) and a pattern of `megaMenu.patterns` from `leitvia/get-contract`: `leitvia-studio/mega-menu-columns` (three columns, each headed by an icon and a title linked to the overview of its topic, entries of a link and one sentence, a line of links below) or `leitvia-studio/mega-menu-columns-card` (the same with a card in an accent frame for the offer that stands out). Change texts, links and icons with `edits` at the block IDs of `leitvia/get-pattern`; `remove` or `repeat` a column for two to four. Add-ons may register further panel patterns; they appear in `megaMenu.patterns`.
2. Item: `leitvia/update-navigation` with an item `{ "label": "Services", "url": "/services/", "type": "mega", "panel": "mega-menu-services" }`. `url` is required: the overview page is the link of the item without JavaScript and for search engines. The panel needs to exist first; `megaMenu.panels` lists them with their hash.

The item is a link with a button beside it (`aria-expanded`), Escape closes the panel and returns focus, hover opens it only after a pause. Without JavaScript the panel links stay in the page and open with the focus. In the mobile overlay the panel is an accordion and each column head its second level. `leitvia/audit-site` reports a panel without links, links to `#`, an item whose panel is gone or that has no `url`, and the findings add-ons add for a panel.

## Icons in the menu

`icon` puts an icon of the icon set (the `enum` of the attribute `icon` of `leitvia/icon` in `leitvia/list-blocks`) before the text of an item or sub item of `leitvia/update-navigation`, and of a mega menu item. It is decorative and hidden from screen readers, so the text still names the target; it takes the accent color and the line width of the token `iconStroke`. At most one icon per item, and only where every item of the row can have one, for example the three audiences of a company; column heads of a panel carry their icon in the pattern. Check at 1024 px that the row still fits on one line, else leave the icons out.

## Service bar over the stage

`header-utility` (service bar above logo and menu) works with every sticky style and with `is-style-overlay-header`: the bar keeps its dark ground, the row below lies over the cover.
