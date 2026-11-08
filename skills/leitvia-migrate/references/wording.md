# Wording stays, form is new

Details for `leitvia-migrate`, for classic content and for a [source outside this site](external.md). It adds to [compare before you write](translate.md#compare-before-you-write).

A migration keeps the words of the source and gives them a new form. Sentences are never reworded, shortened or extended, and style and spelling of the source stay, its mistakes included (list them in the report). Allowed: structure, lists and tables made from enumerations the text already has, moving sections, and the blocks of the [tag to block table](translate.md#tag-to-block). Long posts get the form of [long texts](../../leitvia-page/references/long-texts.md): table of contents, fact box from facts the source states, reading breaks. A heading you wrote yourself, where the source had none, is marked in the report as a suggestion for the person.

Fixed step before the person reviews the package (checkpoints **Sample of three** and **Package applied**): compare source and target of every page as plain text, without markup and whitespace. Save the public page of the source and of the target (the preview of the package) as `source.html` and `target.html`, cut both to the main content, and run:

```bash
diff <(sed 's/<[^>]*>//g' source.html | tr -s '[:space:]' ' ') <(sed 's/<[^>]*>//g' target.html | tr -s '[:space:]' ' ')
```

The only differences allowed are the headings marked as suggestions, the fact box, alt texts and the entries of the table of contents; each one goes into the report. Any other difference is fixed before the review.
