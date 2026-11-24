# leitvia/set-page-structure

Generated from Leitvia Studio 1.3.52. Do not edit. Group: Maintain. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).

**Set page structure.** Sets what a page is within the site, for breadcrumbs, structured data, llms.txt and the composition check. frame is the type of a page frame of the contract (hub for the overview of a topic, audience, service), so check-composition counts the sections that frame requires or recommends; compose-page sets it too. hub is the ID of the overview page the page belongs to: pages keep flat addresses, and the breadcrumbs (block and BreadcrumbList) show Home, the hub of the hub, the hub and the page; the hub wins over a parent page, and a page without a hub keeps the trail of its parents. service is what the page offers: name, description, price as a number, currency (EUR), vat_included (false for a net price) and unit (per month); with a price Leitvia Studio prints a Service with an Offer and a UnitPriceSpecification, without an SEO plugin. max_price makes the price a range (from price up to max_price, an AggregateOffer); offers lists the packages of the service, each with name, price and optional max_price (its price is a range), description and unit (up to 10), printed as one Offer per package in an AggregateOffer with the lowest price and the highest of all prices and ranges, and price may then stay empty. Use only what the page itself says. An empty string, 0 or null clears a field. Read the page with leitvia/get-page-outline first and send its hash as base_hash; autonomy and change packages work as for leitvia/update-content.

MCP tool `leitvia-set-page-structure`, REST POST. Annotations: readonly false, destructive false, idempotent true.

| Input | Type | Required | Description |
|---|---|---|---|
| `post` | integer, min `1` | yes | ID of a page from leitvia/list-content. |
| `frame` | string, max length `40` |  | Type of a page frame of the contract, for example hub; empty clears it. |
| `hub` | integer, min `0` |  | ID of the published overview page above this page; 0 clears it. |
| `service` | object { name\*, description, price, currency, vat_included, unit, max_price, offers } |  |  |
| `base_hash` | string | yes | Hash of the target as last read; empty for a new object. |
| `package` | string, max length `64` |  | Key of the task: a write with a key always goes into the change package of that key, even where the autonomy would allow it live, and operations with the same key share that package. |

Output: the write result. Its fields: [Write results](../README.md#write-results).
