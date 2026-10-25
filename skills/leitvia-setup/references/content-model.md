# Content model declaration

Details for `leitvia-setup`, step 2. Read it before the first `leitvia/define-content-type`. The schema of Leitvia Studio and its checks on the server are the source of this page; a rejection `leitvia_check_failed` names the path (`/postTypes/course/fields/course_level`) and the rule.

## Example: courses with an instructor

```json
{
	"version": 1,
	"postTypes": {
		"course": {
			"label": "Courses",
			"singularLabel": "Course",
			"public": true,
			"slug": "course",
			"supports": [ "title", "editor", "excerpt", "thumbnail" ],
			"icon": "dashicons-welcome-learn-more",
			"fields": {
				"course_date": { "type": "date", "label": "Date", "required": true },
				"course_start": { "type": "time", "label": "Start time" },
				"course_duration": { "type": "text", "label": "Duration", "maxLength": 60 },
				"course_price": { "type": "number", "label": "Price in euros", "min": 0 },
				"course_seats": { "type": "integer", "label": "Free places", "min": 0, "max": 30 },
				"course_level": {
					"type": "select",
					"label": "Level",
					"options": { "beginner": "Beginner", "intermediate": "Intermediate", "advanced": "Advanced" }
				}
			}
		},
		"instructor": {
			"label": "Instructors",
			"singularLabel": "Instructor",
			"public": true,
			"slug": "instructor",
			"supports": [ "title", "editor", "thumbnail" ],
			"fields": {
				"instructor_craft": { "type": "text", "label": "Craft", "maxLength": 80 }
			}
		}
	},
	"taxonomies": {
		"course_topic": { "label": "Topics", "singularLabel": "Topic", "public": true, "slug": "topic", "postTypes": [ "course" ] }
	},
	"relations": {
		"course_instructor": { "label": "Instructor", "from": "course", "to": "instructor" }
	}
}
```

An entry of it with `leitvia/create-content`: `"post_type": "course"`, `"fields": {"course_date": "2026-11-14", "course_start": "10:00", "course_level": "beginner", "course_seats": 8, "course_instructor": [42]}`, `"terms": {"course_topic": ["Bookbinding"]}`.

## Sections

`version` is required and always `1`. The others are optional: `postTypes`, `taxonomies`, `relations`, `settings`. `leitvia/define-content-type` adds or replaces entries by their key and keeps the others; an entry you send replaces that entry whole, so send all its fields.

### postTypes

Key: 2 to 20 characters, `a-z`, `0-9`, `_`, starting with a letter, not starting with `wp_`.

| Key | Meaning |
|---|---|
| `label`, `singularLabel` | Required. Plural and singular name, no `<` or `>`. |
| `description` | Up to 500 characters. |
| `public` | Default false: no URL, only editors read the entries. True gives entry pages at `/<slug>/<entry>/`. |
| `hasArchive` | Only with `public`: an archive at `/<slug>/`. Leave it off when a page lists the entries ([entries](../../leitvia-page/references/entries.md#slugs)). |
| `slug` | URL part, `a-z`, `0-9`, `-`; default the key. Public types and taxonomies need different slugs. |
| `hierarchical` | Entries have parents, like pages. |
| `supports` | Any of `title`, `editor`, `author`, `thumbnail`, `excerpt`, `comments`, `revisions`, `page-attributes`. Default `title`, `editor`. A featured image needs `thumbnail`. |
| `icon` | A Dashicon, `dashicons-<name>`. |
| `fields` | Fields of the entries, see below. |
| `repeaters` | Rows of a sub type per entry (an agenda of an event): key, `postType`, `label`, `singularLabel`, `fields`. |
| `showInAbilities` | Set only by a person, see below. |

### Fields

Key: 3 to 64 characters, `a-z`, `0-9`, `_`, starting with a letter; prefix it with the type (`course_date`). Query words of WordPress such as `title`, `name`, `type`, `status`, `order` or `year` are rejected as keys of types, taxonomies, fields and relations.

| Type | Value in `fields` of create-content | Extra keys |
|---|---|---|
| `text`, `textarea` | Text | `maxLength` |
| `email`, `url` | An e-mail address, a URL | |
| `integer`, `number` | A number | `min`, `max` |
| `boolean` | `true` or `false` | |
| `select` | One key of `options` | `options` (required): `{"<key>": "<label>"}`, keys `a-z`, `0-9`, `_`, `-` |
| `date` | `YYYY-MM-DD` | |
| `datetime` | `YYYY-MM-DDTHH:MM:SS` | |
| `time` | `HH:MM` | |
| `image` | Attachment ID of the media library | |

Every field takes `label` (required), `description` and `required`. A required field must have a value before an entry is published; a draft may leave it empty. There is no type for prices or currencies: use `number`; the page adds the currency with the binding argument `suffix` ([entries](../../leitvia-page/references/entries.md#values-of-fields-on-the-front-end)).

### taxonomies

Key: 2 to 32 characters, same characters as post types. Required: `label`, `singularLabel`, `postTypes` (post types of the model, or `post`). Optional: `public`, `hierarchical`, `slug`, `description`. Flat taxonomies (the default) get new terms by name from create-content; hierarchical ones take existing terms only.

### relations

A link from entries of one type to entries of another, stored on the `from` type as a list of IDs. Key like a field key; it must not equal a field key of the `from` type. Required: `label`, `from` (a type of the model), `to` (a type of the model, or a public type such as `page`). `multiple: true` allows more than one target; without it at most one. In create-content the relation is a field: `"course_instructor": [42]`.

### settings

Values of the whole site, such as a phone number, by key with the field keys above. `bindable: true` lets blocks show the value to visitors.

## showInAbilities

Agents may not set `showInAbilities`; a declaration that holds it is rejected with `leitvia_forbidden_field`. The abilities of Leitvia Studio (create-content, list-content, update-content and the others) reach every type of the content model without it. The flag only opens a type to abilities outside Leitvia, of WordPress itself or other plugins; that is a decision of the person and no step of a Leitvia workflow.

## Hash

No ability returns the hash of the content model. Send `base_hash` empty, take `current_hash` from the rejection `leitvia_stale_hash` and send the call again with it. That round is the protocol, not a rejection; a rejection after it may still be corrected once.
