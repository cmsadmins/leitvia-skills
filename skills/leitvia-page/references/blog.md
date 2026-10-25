# Blog or journal

Details for `leitvia-page`. Read it when the briefing asks for a blog, a journal or a news section. Posts themselves are written with `leitvia-news` or `leitvia/create-content`.

## What the theme already does

The blog needs no pattern and no page content of yours. The theme templates show:

- **Overview** (`home`): the h1 and lead of the blog, the sticky post as a wide band, then ten posts per page with date, linked title, excerpt and a "Continue reading" link, and numbered pages with previous and next links. With a posts page set, the h1 is the title of that page and the lead its excerpt.
- **Category, tag and date archives** (`archive`): title, the description of the term, a grid of posts with images. **Author pages** (`author`): name, the biographical info of the profile, the posts.
- **Post page** (`single`): category, title, excerpt, byline with author, dates and reading time, featured image, content, tags, an author box, previous and next post, up to three related posts from the same categories, and comments only while they are open or exist.

## Set up a journal

1. Ask the person for the name ("Journal"), one sentence on what it covers, the categories with a description each, and whether readers may comment.
2. Create the page with `leitvia/create-content`: `post_type` `page`, `title` the name, `excerpt` the sentence, `content` the same sentence as one paragraph. Once it is the posts page, WordPress shows the overview there instead of the page content.
3. The posts page is a reading setting. On a new site the recipe sets it (`leitvia/apply-recipe`, recipe `publication` with its page `news`); on an existing site no ability sets it: list it as a step of the person, "Settings, Reading: Your homepage displays a static page, Posts page: Journal".
4. Link the page in the navigation with `leitvia/update-navigation`.
5. Posts get one category each, `comment_status` as the person decided, a featured image with alt text (it appears on the archive grid and in the band of the sticky post) and an excerpt of one or two sentences. Category descriptions and the biographical info of authors are set by the person in WordPress; ask for them, an empty description leaves the archive without a lead.
6. On the home page, point to the journal with `leitvia/teaser-posts-list` or `leitvia/teaser-posts-grid`; their heading names the journal.

Check the result on the public URLs: the overview, one category archive, one author page and one post, each with one h1.
