#!/usr/bin/env node
/**
 * Builds the agent handbook from handbook/abilities.json, the dump of the abilities of Leitvia Studio (npm run
 * playground -- --dump): handbook/README.md (rules and the index of all abilities), handbook/rejections.md and one
 * page per ability under handbook/abilities/, so a skill loads only the abilities it calls. Texts of abilities and
 * inputs come from Studio; change them there.
 *
 *   node packages/leitvia-skills/tools/build-handbook.mjs           writes the handbook
 *   node packages/leitvia-skills/tools/build-handbook.mjs --check   exits with 1 when a file is out of date or left over
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GROUPS = {
	read: [ 'Read', 'Read abilities change nothing. Call them first: they return the IDs, block IDs and hashes the write abilities need.' ],
	setup: [ 'Set up', 'Content model, design tokens, style variation, template parts, navigation and recipes.' ],
	build: [ 'Build', 'Pages from patterns, single blocks, Lab patterns and media.' ],
	maintain: [ 'Maintain', 'Texts, links, alt text, deprecated patterns, products and change packages of existing content.' ],
};

const LEVELS = {
	locked: 'Agents may not change the area. Every write is rejected with `leitvia_locked`.',
	suggest: 'Every write lands in a change package for a person to decide.',
	draft: 'New posts are created as drafts and drafts change directly. Changes that visitors would see (published posts, terms, options) land in a change package.',
	autonomous: 'Writes go live. A write with warnings among its findings lands in a change package.',
};

const AREAS = {
	content: 'Pages, posts and media.',
	corrections: 'Small fixes such as alt text and internal links.',
	structure: 'Content model, navigation, Lab patterns and sections of pages.',
	design: 'Token sets, global styles and template parts.',
	admin: 'Plugins, users and settings. Always locked.',
	products: 'Products, product categories and tags of the shop.',
};

const KINDS = {
	prices: 'Pricing blocks, price columns of comparison tables and product prices. Prices in plain text are not detected.',
	legal: 'Pages with a legal page kind (imprint, privacy, terms, withdrawal, accessibility) and the privacy policy page.',
	slugs: 'A changed slug, which changes a URL.',
	organization: 'Site options such as the site title, the logo and the reading settings.',
	tax: 'Tax status and tax class of products.',
	shipping: 'Shipping class of products.',
};

/**
 * The HTTP method of the REST route of an ability, from its annotations (rule of the Abilities API in core).
 *
 * @param {Object} annotations Annotations of the ability.
 * @return {string} GET, DELETE or POST.
 */
export function method( annotations ) {
	if ( annotations.readonly ) {
		return 'GET';
	}
	return annotations.destructive && annotations.idempotent ? 'DELETE' : 'POST';
}

/**
 * A JSON schema as a short text: type, enums written out, limits, and the keys of objects with * for required ones.
 *
 * @param {Object} schema JSON schema.
 * @return {string} Text.
 */
export function type( schema = {} ) {
	if ( schema.enum ) {
		return `one of ${ schema.enum.map( ( value ) => `\`${ value }\`` ).join( ', ' ) }`;
	}
	const types = [ schema.type ].flat().filter( Boolean );
	let text = types.length ? types.join( ' or ' ) : 'any';
	if ( types.includes( 'array' ) && schema.items ) {
		text = `array of ${ type( schema.items ) }`;
	} else if ( types.includes( 'object' ) && schema.properties && Object.keys( schema.properties ).length ) {
		const required = schema.required ?? [];
		text = `object { ${ Object.keys( schema.properties ).map( ( key ) => key + ( required.includes( key ) ? '*' : '' ) ).join( ', ' ) } }`;
	}
	const limits = [
		[ 'minimum', 'min' ],
		[ 'maximum', 'max' ],
		[ 'minLength', 'min length' ],
		[ 'maxLength', 'max length' ],
		[ 'minItems', 'min items' ],
		[ 'maxItems', 'max items' ],
		[ 'format', 'format' ],
		[ 'pattern', 'pattern' ],
	].filter( ( [ key ] ) => undefined !== schema[ key ] ).map( ( [ key, label ] ) => `${ label } \`${ schema[ key ] }\`` );
	if ( undefined !== schema.default ) {
		limits.push( `default \`${ JSON.stringify( schema.default ) }\`` );
	}
	return [ text, ...limits ].join( ', ' );
}

/**
 * Text from Studio for Markdown: < and * escaped, so block:<ID> stays text and required keys stay unformatted.
 *
 * @param {string} text Text.
 * @return {string} Escaped text.
 */
function escape( text ) {
	return String( text ?? '' ).replace( /[<*]/g, '\\$&' );
}

/**
 * Text for a table cell.
 *
 * @param {string} text Text.
 * @return {string} Escaped text without line breaks.
 */
function cell( text ) {
	return escape( text ).replace( /\s*\n\s*/g, ' ' ).replace( /\|/g, '\\|' );
}

/**
 * Throws when the dump names a value the handbook has no text for, so a new level, area, kind or group is not
 * documented silently wrong.
 *
 * @param {Object}   texts  Texts by value.
 * @param {string[]} values Values of the dump.
 * @param {string}   what   Name for the error.
 */
function known( texts, values, what ) {
	const missing = values.filter( ( value ) => ! texts[ value ] );
	if ( missing.length ) {
		throw new Error( `No handbook text for the ${ what } ${ missing.join( ', ' ) }. Add it to tools/build-handbook.mjs.` );
	}
}

/**
 * The handbook as Markdown files.
 *
 * @param {Object} dump Content of handbook/abilities.json.
 * @return {Object<string, string>} Markdown with LF line ends by path below handbook/.
 */
export function handbook( dump ) {
	const { abilities, rejections, autonomy } = dump;
	known( GROUPS, abilities.map( ( ability ) => ability.group ), 'group' );
	known( LEVELS, autonomy.levels, 'level' );
	known( AREAS, Object.keys( autonomy.defaults ), 'area' );
	known( KINDS, autonomy.kinds, 'kind' );

	// The output of most write abilities is the result of the pipeline; describe it once.
	const counts = new Map();
	for ( const ability of abilities.filter( ( item ) => ! item.annotations.readonly ) ) {
		const json = JSON.stringify( ability.output_schema );
		counts.set( json, ( counts.get( json ) ?? 0 ) + 1 );
	}
	const result = [ ...counts ].sort( ( a, b ) => b[ 1 ] - a[ 1 ] )[ 0 ]?.[ 0 ];
	const output = ( schema ) => {
		if ( JSON.stringify( schema ) === result ) {
			return 'the write result';
		}
		const properties = Object.entries( schema?.properties ?? {} );
		return properties.length ? properties.map( ( [ key, value ] ) => `\`${ key }\` ${ type( value ) }` ).join( '; ' ) : type( schema );
	};

	const lines = [
		'# Leitvia agent handbook',
		'',
		`Generated from Leitvia Studio ${ dump.studio ?? 'unknown' }. Do not edit.`,
		'',
		`Everything an agent needs to work on a WordPress site with Leitvia Studio through its ${ abilities.length } abilities: how to call them, how hashes, autonomy and change packages work, what a rejection means and what each ability takes and returns. Agents change the site only through these abilities: no SQL, no REST routes of WordPress core (not even to read), no WP-CLI. Reading public pages of the site is allowed. Read this file before the first call; it holds the rules every skill relies on and the index of all abilities.`,
		'',
		'## Access over MCP and REST',
		'',
		'Sign in as a WordPress user that may edit posts, with an application password (HTTP Basic auth). Use a user of its own for the agent; every call is logged under that user.',
		'',
		'**Which site.** Every path below starts at the address of the site, not at the host. A site of a multisite network in a subdirectory has a path: on `https://example.org/club/` the MCP server is `https://example.org/club/wp-json/leitvia-studio/v1/mcp`, and `/wp-json/` straight after the host reaches another site of the network. Call `leitvia/get-contract` first: `site.url` is the address of the site the connection works on and `site.rest` its REST base. Compare `site.url` with the address of your task before the first write and stop when they differ. An application password that Leitvia Studio created in a network works on its own site only; another site answers 401.',
		'',
		'**MCP.** The server `leitvia` answers at `POST /wp-json/leitvia-studio/v1/mcp` when the plugin MCP Adapter 0.7 is active. Send `initialize` first; its response carries the header `Mcp-Session-Id`. Every further request sends that header and `MCP-Protocol-Version` (for example `2025-06-18`), otherwise the server answers with 400. `tools/list` lists the abilities; a tool is named like its ability with a hyphen in place of the slash (`leitvia-get-contract` for `leitvia/get-contract`). `tools/call` takes the input of the ability as `arguments`. A rejection comes back as a tool result with `isError` true whose text is JSON with `code`, `message` and `data`.',
		'',
		'**REST.** Every ability runs at `/wp-json/wp-abilities/v1/abilities/<name>/run`, for example `/wp-json/wp-abilities/v1/abilities/leitvia/get-contract/run`. The HTTP method follows the annotations: read only abilities take GET, abilities that are destructive and idempotent take DELETE, all others POST. GET and DELETE send the input as query arguments (`?input[post]=12`, lists as `input[upsells][]=4&input[upsells][]=7`), POST sends it as JSON body `{"input": {…}}`. Another method gets 405.' + ( abilities.some( ( ability ) => 'DELETE' === method( ability.annotations ) ) ? ' Long texts make long URLs under DELETE; send them over MCP instead.' : '' ) + ' A rejection is an error response with `code`, `message` and `data`; the HTTP status is `data.status`.',
		'',
		'Each ability below names its MCP tool and its REST method.',
		'',
		'## Read before write',
		'',
		'Read first, then write. The read abilities return what a write needs: post IDs, block IDs from `leitvia/get-page-outline`, pattern slugs from `leitvia/list-patterns`, blocks and their attributes from `leitvia/list-blocks`, page frames, color roles and template parts from `leitvia/get-contract`, and the hash of every target. Plan a page with `leitvia/plan-page` and score it with `leitvia/check-composition` before you build it. After a write, read the target again or use the `hash` of the write result for the next change.',
		'',
		'The checks after a write (links, contrast) run as a WP-Cron event. On a site where WP-Cron does not run by itself, such as WordPress Playground, call `GET /wp-cron.php` after writes; the result lands in the audit log.',
		'',
		'## Hashes and base_hash',
		'',
		'Every write ability requires `base_hash`: the hash of the target as you last read it, 16 hex characters. Before it writes, the pipeline compares it with the current hash of the target; when someone changed the target in between, the write is rejected with `leitvia_stale_hash`, which carries `current_hash`. Read the target again and repeat the change on the current state, once.',
		'',
		'- A new object (a new page, pattern, token set or image) has no hash: send an empty `base_hash`.',
		'- A post, page, attachment, navigation menu or template part: `hash` of `leitvia/get-page-outline`, which is also `document_hash` of `leitvia/get-block`. Block hashes are for comparing blocks; `base_hash` is always the hash of the whole document.',
		'- A product: `hash` of `leitvia/get-product` or `leitvia/list-products`. A product category or tag: the hash of the term from the same abilities.',
		'- Targets no read ability returns a hash for (global styles, the content model, a menu or template part whose ID you do not know): send an empty `base_hash`, take `current_hash` from the rejection `leitvia_stale_hash` and repeat the call once with it.',
		'',
		'The result of a write carries the new `hash`; use it as `base_hash` of the next change of the same target.',
		'',
		'## Write results',
		'',
		'Most write abilities return the result of the pipeline:',
		'',
		'| Field | Meaning |',
		'|---|---|',
		'| `mode` | `live` (written and visible), `draft` (written as a draft), `package` (stored in a change package for a person), `unchanged` (the target already had this state; nothing was written or stored) |',
		'| `level` | autonomy level that applied |',
		'| `kinds` | content kinds the change touches |',
		'| `target` | the object, for example `{"post": 12}` |',
		'| `hash` | hash of the target after the write |',
		'| `package` | ID of the change package, 0 for none |',
		'| `snapshot` | ID of the snapshot a rollback restores, 0 for none |',
		'| `findings` | warnings of the checks; errors reject the write. Only findings the write brings or makes worse count; findings the target already had do not block it |',
		'| `report` | further data of some abilities |',
		'',
		'## Autonomy levels and content kinds',
		'',
		'The site owner sets how far agents may go per area. The pipeline takes the level of the area of a write:',
		'',
		'| Level | Effect on a write |',
		'|---|---|',
		...autonomy.levels.map( ( level ) => `| \`${ level }\` | ${ cell( LEVELS[ level ] ) } |` ),
		'',
		'Default levels per area (profile standard; the site owner can change them):',
		'',
		'| Area | Default | What it covers |',
		'|---|---|---|',
		...Object.entries( autonomy.defaults ).map( ( [ area, level ] ) => `| \`${ area }\` | \`${ level }\` | ${ cell( AREAS[ area ] ) } |` ),
		'',
		'Some content kinds lower the level to at most `suggest`, whatever the area allows, unless a person unlocked the kind in the settings. The result lists them in `kinds`.',
		'',
		'| Kind | Covers |',
		'|---|---|',
		...autonomy.kinds.map( ( kind ) => `| \`${ kind }\` | ${ cell( KINDS[ kind ] ) } |` ),
		'',
		'Changes of site options land in a change package unless the user may manage options. Agents can neither raise a level nor unlock a kind; tell the person when the work needs it.',
		'',
		'## Mode package',
		'',
		'Every write ability takes `package`, a key of the task of at most 64 characters. A write with a key always ends up in the change package of that key, even where the level of its area would let it go live; the result returns the package ID in `package`, and a person reviews and applies the package in the inbox of Leitvia Studio. Send the same key on every write of one task, for example `homepage-2026-10`, so the person gets one package instead of many. Without a key the levels decide, and every write they hold back gets a package of its own. The same change sent twice is stored once. Several writes of one task to the same post, option or term build on each other: send the hash you read as usual; the later write changes the target as the earlier ones in the package left it and always waits in the package, and applying writes them in order.',
		'',
		'`leitvia/list-packages` lists your packages, `leitvia/get-package` shows the diff per operation. Agents may apply (`leitvia/apply-package`) and roll back (`leitvia/rollback`) only operations whose level is `autonomous`; everything else is `leitvia_needs_human` and waits for a person.',
		'',
		'## Rejections',
		'',
		'A rejection carries `code`, a `message` that says how to fix it, and `data` with `status` (HTTP), `reason`, `target`, `next_ability` (the ability to call next, empty for none) and `retry`, plus details such as `current_hash` or `findings` where they apply.',
		'',
		'| Retry | What the agent does |',
		'|---|---|',
		...rejections.retry.map( ( rule ) => `| \`${ rule }\` | ${ cell( {
			once: 'Correct the call once, following message and `next_ability`. If the second call is rejected too, stop and ask a person.',
			never: 'Do not repeat the call. Stop and tell the person the message; it needs a person or a different approach.',
			'after:<seconds>': 'Wait the given seconds, then repeat the same call.',
		}[ rule ] ?? '' ) } |` ),
		'',
		'Every rejection of Leitvia Studio with its code, HTTP status, retry rule, next ability and message: [rejections.md](rejections.md). Read it when a rejection is unclear; the rejection itself already carries all of this.',
		'',
		'## Abilities',
		'',
		'Each ability has a page of its own with its inputs and output, named after its MCP tool: `abilities/<tool>.md`, for example [`abilities/leitvia-get-contract.md`](abilities/leitvia-get-contract.md). Read the pages of the abilities you call, not all of them.',
		'',
	];

	const files = {
		'rejections.md': [
			'# Rejections',
			'',
			`Generated from Leitvia Studio ${ dump.studio ?? 'unknown' }. Do not edit. What a retry rule means: [agent handbook](README.md#rejections).`,
			'',
			'Every rejection of Leitvia Studio with its retry rule and next ability. Messages with `%s` or `%d` get a value at run time; codes with several rows come from several places.',
			'',
			'| Code | HTTP | Retry | Next ability | Message |',
			'|---|---|---|---|---|',
			...( rejections.cases ?? [] ).map( ( item ) => `| \`${ item.code }\` | ${ item.status ?? 'varies' } | ${ item.retry ? `\`${ item.retry }\`` : 'varies' } | ${ item.next_ability.length ? item.next_ability.map( ( name ) => ( name ? `\`${ name }\`` : 'none' ) ).join( ' or ' ) : 'set at run time' } | ${ cell( item.message ?? 'Built at run time; read the message.' ) } |` ),
			'',
		].join( '\n' ),
	};
	for ( const [ group, [ title, intro ] ] of Object.entries( GROUPS ) ) {
		const members = abilities.filter( ( ability ) => group === ability.group );
		if ( ! members.length ) {
			continue;
		}
		lines.push( `### ${ title }`, '', intro, '', '| Ability | REST | What it does |', '|---|---|---|' );
		lines.push( ...members.map( ( ability ) => `| [\`${ ability.name }\`](${ page( ability.name ) }) | ${ method( ability.annotations ) } | ${ cell( summary( ability.description ) ) } |` ), '' );
		for ( const ability of members ) {
			const { readonly, destructive, idempotent } = ability.annotations;
			const properties = Object.entries( ability.input_schema?.properties ?? {} );
			const required = ability.input_schema?.required ?? [];
			const text = [
				`# ${ ability.name }`,
				'',
				`Generated from Leitvia Studio ${ dump.studio ?? 'unknown' }. Do not edit. Group: ${ title }. How to call abilities, hashes, autonomy and rejections: [agent handbook](../README.md).`,
				'',
				`**${ escape( ability.label ) }.** ${ escape( ability.description ) }`,
				'',
				`MCP tool \`${ ability.name.replace( '/', '-' ) }\`, REST ${ method( ability.annotations ) }. Annotations: readonly ${ readonly }, destructive ${ destructive }, idempotent ${ idempotent }.${ ability.requires ? ` Only registered while ${ ability.requires.join( ', ' ) } is active.` : '' }`,
				'',
			];
			if ( properties.length ) {
				text.push( '| Input | Type | Required | Description |', '|---|---|---|---|' );
				text.push( ...properties.map( ( [ key, schema ] ) => `| \`${ key }\` | ${ cell( type( schema ) ) } | ${ required.includes( key ) ? 'yes' : '' } | ${ cell( schema.description ) } |` ), '' );
			} else {
				text.push( 'No input.', '' );
			}
			const shared = JSON.stringify( ability.output_schema ) === result;
			text.push( `Output: ${ escape( output( ability.output_schema ) ) }.${ shared ? ' Its fields: [Write results](../README.md#write-results).' : '' }`, '' );
			files[ page( ability.name ) ] = text.join( '\n' );
		}
	}
	files[ 'README.md' ] = lines.join( '\n' ).replace( /\n+$/, '\n' );
	return files;
}

/**
 * Path of the page of an ability below handbook/, named after its MCP tool.
 *
 * @param {string} name Ability name.
 * @return {string} For example abilities/leitvia-get-contract.md.
 */
export function page( name ) {
	return `abilities/${ name.replace( '/', '-' ) }.md`;
}

/**
 * First sentence of a description without remarks in parentheses, for the index.
 *
 * @param {string} description Description.
 * @return {string} Sentence.
 */
function summary( description ) {
	const text = String( description ?? '' ).replace( /\s*\([^()]*\)/g, '' );
	return text.match( /^[\s\S]*?[.!?](?=\s|$)/ )?.[ 0 ] ?? text;
}

if ( process.argv[ 1 ] === fileURLToPath( import.meta.url ) ) {
	const dir = fileURLToPath( new URL( '../handbook/', import.meta.url ) );
	const files = handbook( JSON.parse( readFileSync( join( dir, 'abilities.json' ), 'utf8' ) ) );
	mkdirSync( join( dir, 'abilities' ), { recursive: true } );
	const pages = readdirSync( join( dir, 'abilities' ), { withFileTypes: true } ).filter( ( entry ) => entry.isFile() ).map( ( entry ) => `abilities/${ entry.name }` );
	if ( process.argv.includes( '--check' ) ) {
		const read = ( path ) => {
			try {
				return readFileSync( join( dir, path ), 'utf8' );
			} catch {
				return null;
			}
		};
		const stale = [ ...Object.keys( files ).filter( ( path ) => read( path ) !== files[ path ] ), ...pages.filter( ( path ) => ! files[ path ] ) ];
		if ( stale.length ) {
			console.error( `Out of date in packages/leitvia-skills/handbook/: ${ stale.join( ', ' ) }. Run node packages/leitvia-skills/tools/build-handbook.mjs.` );
			process.exit( 1 );
		}
	} else {
		pages.filter( ( path ) => ! files[ path ] ).forEach( ( path ) => rmSync( join( dir, path ) ) );
		for ( const [ path, text ] of Object.entries( files ) ) {
			writeFileSync( join( dir, path ), text );
		}
	}
}
