# Blog or journal

Details for `leitvia-page`. Read it when the briefing asks for a blog, a journal or a news section. Posts themselves are written with `leitvia-news` or `leitvia/create-content`.

## What the theme already does

The blog needs no pattern of yours. The theme templates show:

- **Overview** (`home`): the h1 and lead of the blog, the sticky post as a wide band, then ten posts per page with date, linked title, excerpt and a "Continue reading" link, and numbered pages with previous and next links. With a posts page set, the h1 is the title of that page, the lead its excerpt, and its featured image and content follow above the posts.
- **Category, tag and date archives** (`archive`): title, the description of the term, a grid of posts with images. **Author pages** (`author`): name, the biographical info of the profile, the posts.
- **Post page** (`single`): category, title, excerpt, byline with author, dates and reading time, featured image, content, tags, an author box, previous and next post, up to three related posts from the same categories, and comments only while they are open or exist.

## Set up a journal

1. Ask the person for the name ("Journal"), one sentence on what it covers, the categories with a description each, and whether readers may comment.
2. Create the page with `leitvia/create-content`: `post_type` `page`, `title` the name, `excerpt` the sentence. A featured image and content of the page show above the posts; content that only repeats the excerpt stays out.
3. The posts page is a reading setting. The recipe `publication` sets it with its page `news`; for any other site call [`leitvia/set-posts-page`](../../../handbook/abilities/leitvia-set-posts-page.md) with the ID of the page, once the page exists (a page that waits in a package needs that package applied first). It waits in a change package for a person, and it takes effect with a static front page.
4. Link the page in the navigation with `leitvia/update-navigation`.
5. Posts get an `author` (user ID, as `author` in `leitvia/list-content` shows it) when a person named one. An author whose display name is still the login shows as first and last name, else as the name of the site, and has no author page; only the person can set the display name in the profile, so ask for it when the blog names its authors. Posts get one category each, `comment_status` as the person decided, a featured image with alt text (it appears on the archive grid and in the band of the sticky post) and an excerpt of one or two sentences. Category descriptions and the biographical info of authors are set by the person in WordPress; ask for them, an empty description leaves the archive without a lead.
6. On the home page, point to the journal with `leitvia/teaser-posts-list` or `leitvia/teaser-posts-grid`; their heading names the journal.

## News section

A blog with news for Google News and AI answers needs a few things more; `leitvia-news` and `leitvia-seo-geo` check them.

1. **Editorial page:** a page with `leitvia/create-content`, `kind` `editorial`: who writes, how sources are checked, how corrections and AI texts are handled, all from the person. The person picks it in Leitvia Studio as the editorial page (`editorial_page`); Studio then links it in the author box and names it as `publishingPrinciples` in the structured data.
2. **Categories:** two to six, each with a description. The overview shows them as chips; more than six make the row hard to scan, one makes it useless.
3. **Featured images:** every post has one, at least 1200 px wide, fit for a 16:9 crop, with alt text. The newest post leads the card grid with it.
4. **Authors:** real names with a biographical info in the profile, set by the person. The author box and the author page show it.
5. **Imprint and contact** pages exist and are linked in the footer.
6. **Visible to search engines:** in Settings, Reading, "Discourage search engines" is unticked once the site is live, a step of the person.

Check the result on the public URLs: the overview, one category archive, one author page and one post, each with one h1.
