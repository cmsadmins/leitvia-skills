# Contact form

Details for `leitvia-page`. Read this when visitors should write from a page.

A page that takes messages uses the pattern `leitvia-studio/cta-contact-form` in the `actions` slot of the frame `contact`, or at the close of a service page. It holds the block `leitvia/contact-form` (name, email, message, sent with `wp_mail()`), so no plugin is needed. `leitvia/cta-contact` only lists ways to reach the person. Never write a form as HTML; `leitvia/wizard` only sends URL parameters.

- After the page exists, set the attributes of the block with `leitvia/update-block`: `recipient` (never printed on the page, empty: the administration email of the site), `subject`, `buttonText`, `successMessage`. Empty texts are the translated defaults. Ask the person which address gets the messages.
- Keep `privacyNote` true: it links the privacy policy page. The privacy policy must name the form.
- Send one test message before the site goes live, or ask the person to: a site without working mail shows the visitor an error.
- Other fields, uploads or stored entries need a form plugin, which only a person installs; wrap it in `leitvia/form-errors`.
