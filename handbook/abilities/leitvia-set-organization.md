# leitvia/set-organization

Generated from Leitvia Studio 1.3.52. Do not edit. Group: Set up. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Set organization details.** Sets the details of the organization behind the site: kind of business (type, Organization or a type of LocalBusiness; type falls back to Organization), address, phone, email, founding date (founding_date, YYYY, YYYY-MM or YYYY-MM-DD), founder or owner (founder, a person, printed as schema.org founder), the copyright line of the footer (copyright_since, the first year as YYYY, and copyright_holder, the name after the years; the theme Leitvia then shows the first year, a dash, the current year and the holder), area served (area_served, places), opening hours (opening_hours, rows of days with opens and closes as HH:MM, only printed for a local business), profiles on other sites (same_as, https addresses) and the rating on a review site (aggregate_rating: value 1 to 5, count of reviews, source_url where it is shown, confirmed true only after a person checked it there; printed as aggregateRating and allowed as a star in SEO titles only when confirmed, with count and source; null removes it). Leitvia Studio prints them as structured data on the front page and as publisher of posts while no SEO plugin is active; the name and the logo stay those of the site. Only the fields you send change, an empty string or an empty list clears one. leitvia/get-seo returns the current values. base_hash is empty. Use only facts the person gave or the site shows; never guess opening hours. Like every setting it waits in a change package for a person.

MCP tool `leitvia-set-organization`, REST POST. Annotations: readonly false, destructive true, idempotent false.

| Input | Type | Required | Description |
|---|---|---|---|
| `type` | one of `Organization`, `LocalBusiness`, `HomeAndConstructionBusiness`, `GeneralContractor`, `Electrician`, `Plumber`, `HVACBusiness`, `RoofingContractor`, `HousePainter`, `AutoRepair`, `Restaurant`, `Store`, `HealthAndBeautyBusiness`, `LodgingBusiness` |  |  |
| `street` | string |  |  |
| `postal_code` | string |  |  |
| `city` | string |  |  |
| `country` | string, pattern `^([A-Z]{2})?$` |  |  |
| `phone` | string |  |  |
| `email` | string |  |  |
| `founding_date` | string, pattern `^(\d{4}(-(0[1-9]\|1[0-2])(-(0[1-9]\|[12]\d\|3[01]))?)?)?$` |  |  |
| `founder` | string, max length `200` |  |  |
| `copyright_since` | string, pattern `^(\d{4})?$` |  |  |
| `copyright_holder` | string, max length `200` |  |  |
| `area_served` | array of string, max items `50` |  |  |
| `opening_hours` | array of object { days\*, opens\*, closes\* }, max items `14` |  |  |
| `same_as` | array of string, pattern `^https://`, max items `50` |  |  |
| `aggregate_rating` | object { value\*, count\*, source_url\*, confirmed\* } |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
