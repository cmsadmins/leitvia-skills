# Block markup for classic HTML

Markup that `leitvia/update-content` accepts as `content`, one example per kind of classic HTML. Blocks are separated by an empty line. Keep the texts, link targets, image IDs and sources of the source; only the wrapping changes.

## Paragraph and heading

```html
<!-- wp:paragraph -->
<p>For larger orders write to <a href="mailto:orders@example.org">orders@example.org</a> two days ahead.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Why it takes so long</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Rye</h3>
<!-- /wp:heading -->
```

## List

```html
<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list"><!-- wp:list-item -->
<li>Shape the rye loaves.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Heat the stone oven to 260 degrees.</li>
<!-- /wp:list-item --></ol>
<!-- /wp:list -->
```

Without `{"ordered":true}` and with `<ul class="wp-block-list">` for a bulleted list.

## Image, with caption, decorative

`id` is the N of `wp-image-N` in the source.

```html
<!-- wp:image {"id":4,"sizeSlug":"large","linkDestination":"none","align":"center"} -->
<figure class="wp-block-image aligncenter size-large"><img src="https://example.org/wp-content/uploads/sourdough-loaf.png" alt="A round sourdough loaf with a dark crust on a wooden board" class="wp-image-4"/></figure>
<!-- /wp:image -->

<!-- wp:image {"id":5,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://example.org/wp-content/uploads/stone-oven.png" alt="The stone oven of the bakery" class="wp-image-5"/><figcaption class="wp-element-caption">The stone oven at four in the morning</figcaption></figure>
<!-- /wp:image -->

<!-- wp:image {"id":7,"sizeSlug":"large","linkDestination":"none","metadata":{"leitviaDecorative":true}} -->
<figure class="wp-block-image size-large"><img src="https://example.org/wp-content/uploads/divider.png" alt="" class="wp-image-7"/></figure>
<!-- /wp:image -->
```

## Table

```html
<!-- wp:table -->
<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr><th>Day</th><th>Shop</th></tr></thead><tbody><tr><td>Saturday</td><td>7:00 to 14:00</td></tr></tbody></table></figure>
<!-- /wp:table -->
```

## Quote

```html
<!-- wp:quote -->
<blockquote class="wp-block-quote"><!-- wp:paragraph -->
<p>The oven tells you when it is ready, not the clock.</p>
<!-- /wp:paragraph --><cite>Head baker</cite></blockquote>
<!-- /wp:quote -->
```

## Embed

The public URL of the video, not the URL of the iframe. Leitvia Studio shows the consent placeholder in its place until the visitor agrees.

```html
<!-- wp:embed {"url":"https://www.youtube.com/watch?v=aqz-KE-bpKQ","type":"video","providerNameSlug":"youtube","responsive":true,"className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">
https://www.youtube.com/watch?v=aqz-KE-bpKQ
</div></figure>
<!-- /wp:embed -->
```

For Vimeo: `"providerNameSlug":"vimeo"`, class `is-provider-vimeo wp-block-embed-vimeo`, URL `https://vimeo.com/<id>`.

## Separator, code, more

```html
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->

<!-- wp:code -->
<pre class="wp-block-code"><code>flour 1000 g, water 700 g</code></pre>
<!-- /wp:code -->

<!-- wp:more -->
<!--more-->
<!-- /wp:more -->
```
