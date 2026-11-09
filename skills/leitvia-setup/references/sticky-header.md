# Sticky header

No recipe makes the header sticky; it scrolls with the page by default. When the briefing asks for a header that stays at the top (a shop whose cart and search should stay at hand, long product or news pages), give the outermost group of the header part, the group named Header, one block style of the theme with `leitvia/update-template-part`:

- `is-style-sticky-header`: on every screen.
- `is-style-sticky-header-desktop`: from 600 px wide only. For headers with several rows or a large logo.
- `is-style-sticky-header-mobile`: below 600 px wide only.

Read the part with `leitvia/get-block` on its root block, add the class to `className` of that group and to the class list of its `div`, change nothing else, and send the markup as `content` with the `package` key. Header parts live in the area `design`, so a person decides.

The theme keeps it accessible by itself: in windows lower than 500 px or not wider than 320 px, at 200 % zoom, with enlarged text and in print the header scrolls away, and focused elements and jump targets stop below it (WCAG 2.4.11). With Leitvia Studio a header taller than a quarter of the window scrolls away as well. A calm site (a practice, a law firm) keeps the default.

## Navigation in the header

Menu items change with `leitvia/update-navigation`, which leaves the header as it is. When you send a header part as `content`, keep the `core/navigation` block of the theme pattern with all its attributes, above all `"submenuVisibility":"click"`, `overlay` and `ariaLabel`; change only the items. `leitvia/update-template-part` puts back these settings where the new navigation lacks them, but a value you send stays.
