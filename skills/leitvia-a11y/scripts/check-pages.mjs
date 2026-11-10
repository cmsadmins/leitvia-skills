#!/usr/bin/env node
/**
 * Checks the public pages of a site in one browser and writes one JSON report.
 *
 *   node check-pages.mjs --site https://example.org [paths or URLs ...] [options]
 *
 * Pages: the paths or URLs given, the lines of --pages <file> (a path, optionally followed by the URL of the old page),
 * or with --sitemap every address of /wp-sitemap.xml. Each page loads once; then the same tab resizes to
 * 1920, 1440, 390 and 320 px and checks:
 *
 * - overflow: the page is wider than the window (all widths), with the elements that stick out
 * - squeezed: p, li and headings in main with fewer than 25 characters per line or narrower than 20 ch (1920, 1440)
 * - axe: WCAG 2.2 A and AA rules of axe-core with reduced motion (1440 and 390)
 * - foreignHosts: requests to other hosts before any consent, after scrolling the page once (lazy images, embeds)
 * - httpErrors, brokenImages, h1 (not exactly one), shortcodes (text such as [vc_row] in the content), redirect
 * - words, links: with --old <address> (same paths) or an old URL per line, the words and links of the old page that
 *   the new one lacks; text in closed details and text shown only on wide screens counts
 *
 * Options: --pages <file>, --sitemap, --old <address>, --old-selector <css> (content of the old page, default main,
 * then #content, .entry-content, body), --allow <host> (repeatable; allowed other hosts, subdomains included; the
 * subdomains of the site count as its own), --concurrency <n> (pages in parallel, default 4), --out <file> (default
 * check-pages.json), --shots <dir> (JPEG screenshots at 1920, 1440 and 390 px of pages with findings), --all-shots.
 * Folder protection: LEITVIA_HTTP_AUTH="user:password" in the environment, never on the command line; it goes only to
 * the site itself.
 * Needs playwright and axe-core: npm install --no-save playwright axe-core && npx playwright install chromium
 * Exit code 0 without findings, 1 when a page has a finding or could not be checked (error), 2 when the run could not
 * start (usage, no pages, sitemap not readable, no browser); then --out is not written.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values: opt, positionals } = parseArgs( {
	allowPositionals: true,
	options: {
		site: { type: 'string' },
		pages: { type: 'string' },
		sitemap: { type: 'boolean', default: false },
		old: { type: 'string' },
		'old-selector': { type: 'string', default: 'main, #content, .entry-content, body' },
		allow: { type: 'string', multiple: true, default: [] },
		concurrency: { type: 'string', default: '4' },
		out: { type: 'string', default: 'check-pages.json' },
		shots: { type: 'string' },
		'all-shots': { type: 'boolean', default: false },
	},
} );

const fail = ( message ) => {
	console.error( message );
	process.exit( 2 );
};
if ( ! opt.site || ! URL.canParse( opt.site ) || ( opt.old && ! URL.canParse( opt.old ) ) ) {
	fail( 'Usage: node check-pages.mjs --site https://example.org [paths ...] [--pages file] [--sitemap] [--old https://old.example.org]' );
}
// A report of an earlier run must never pass for this one.
rmSync( opt.out, { force: true } );

const resolve = ( name ) => {
	for ( const base of [ join( process.cwd(), 'package.json' ), import.meta.url ] ) {
		try {
			return createRequire( base ).resolve( name );
		} catch {}
	}
	return null;
};
const playwright = resolve( 'playwright' ) ?? resolve( '@playwright/test' );
const axePath = resolve( 'axe-core/axe.min.js' );
if ( ! playwright || ! axePath ) {
	fail( 'Needs playwright and axe-core: npm install --no-save playwright axe-core && npx playwright install chromium' );
}
const loaded = await import( pathToFileURL( playwright ).href );
const { chromium } = loaded.chromium ? loaded : loaded.default;
const axeSource = readFileSync( axePath, 'utf8' );

const site = new URL( opt.site );
const auth = process.env.LEITVIA_HTTP_AUTH?.split( ':' );
// Only for the site itself, never for the old site or other hosts.
const httpCredentials = auth ? { username: auth[ 0 ], password: auth.slice( 1 ).join( ':' ), origin: site.origin } : undefined;
const allowed = [ site.hostname, ...opt.allow ];
const own = ( host ) => allowed.some( ( a ) => host === a || host.endsWith( `.${ a }` ) );
const WIDTHS = [ 1920, 1440, 390, 320 ];
const AXE_AT = [ 1440, 390 ];
const SQUEEZE_AT = [ 1920, 1440 ];
const SHOT_AT = [ 1920, 1440, 390 ];

const browser = await chromium.launch().catch( ( error ) => fail( `No browser: ${ error.message.split( '\n' )[ 0 ] }. Run npx playwright install chromium` ) );

async function sitemap() {
	const context = await browser.newContext( { httpCredentials } );
	const locs = async ( url ) => {
		const response = await context.request.get( url );
		if ( ! response.ok() ) {
			fail( `Sitemap ${ url } answers ${ response.status() }` );
		}
		// Plain or CDATA, as SEO plugins write it.
		return [ ...( await response.text() ).matchAll( /<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)/g ) ].map( ( [ , loc ] ) => loc.replaceAll( '&amp;', '&' ) );
	};
	const found = [];
	for ( const loc of await locs( new URL( '/wp-sitemap.xml', site ).href ) ) {
		found.push( ...( loc.endsWith( '.xml' ) ? await locs( loc ) : [ loc ] ) );
	}
	await context.close();
	return found;
}

const pagesFile = () => {
	try {
		return readFileSync( opt.pages, 'utf8' ).split( /\r?\n/ );
	} catch ( error ) {
		return fail( `Pages file: ${ error.message }` );
	}
};
const lines = [ ...positionals, ...( opt.pages ? pagesFile() : [] ),...( opt.sitemap ? await sitemap() : [] ) ]
	.map( ( line ) => line.trim() )
	.filter( ( line ) => line && ! line.startsWith( '#' ) );
const targets = [ ...new Map( lines.map( ( line ) => {
	const [ path, oldUrl ] = line.split( /\s+/ );
	if ( ! URL.canParse( path, site ) || ( oldUrl && ! URL.canParse( oldUrl ) ) ) {
		fail( `Not an address: ${ line }` );
	}
	const url = new URL( path, site );
	// The path of the page goes after the address of the old site, path prefix included.
	const old = oldUrl ?? ( opt.old && opt.old.replace( /\/$/, '' ) + url.pathname + url.search );
	return [ url.href, { url: url.href, old } ];
} ) ).values() ];
if ( ! targets.length ) {
	fail( 'No pages to check: give paths, --pages <file> or --sitemap' );
}

// Runs in the page: what the current width shows.
function layout( { squeeze } ) {
	const width = document.documentElement.clientWidth;
	const name = ( el ) => el.tagName.toLowerCase() + ( el.id ? `#${ el.id }` : '' ) + [ ...el.classList ].slice( 0, 2 ).map( ( c ) => `.${ c }` ).join( '' );
	const result = { overflow: [], squeezed: [] };
	if ( document.documentElement.scrollWidth > width + 1 ) {
		// Content of a scroll or clip container (a wide table in its figure, a slider) does not widen the page.
		const clipped = ( el ) => {
			for ( let up = el.parentElement; up && up !== document.body; up = up.parentElement ) {
				if ( 'visible' !== getComputedStyle( up ).overflowX ) {
					return true;
				}
			}
			return false;
		};
		// Boxes past the edge, and boxes whose text runs out of them (a long word or address).
		const wide = [ ...document.body.querySelectorAll( '*' ) ].filter( ( el ) => {
			const r = el.getBoundingClientRect();
			return r.width > 0 && ( r.right > width + 1 || ( el.scrollWidth > el.clientWidth + 1 && el.clientWidth && 'visible' === getComputedStyle( el ).overflowX ) ) && ! clipped( el );
		} );
		// The innermost of them: their containers only pass the overflow on.
		result.overflow = wide.filter( ( el ) => ! wide.some( ( other ) => other !== el && el.contains( other ) ) ).slice( 0, 5 ).map( ( el ) => `${ name( el ) } ${ Math.round( Math.max( el.getBoundingClientRect().right - width, el.scrollWidth - el.clientWidth ) ) }px: ${ el.textContent.trim().slice( 0, 40 ).replace( /\s+/g, ' ' ) }` );
		result.overflow.unshift( `scrollWidth ${ document.documentElement.scrollWidth } > ${ width }` );
	}
	if ( squeeze ) {
		const canvas = document.createElement( 'canvas' ).getContext( '2d' );
		const block = 'p, div, ul, ol, li, h1, h2, h3, h4, h5, h6, figure, table';
		for ( const el of document.querySelectorAll( 'main p, main li, main h1, main h2, main h3, main h4, main h5, main h6' ) ) {
			const text = el.innerText.trim();
			const r = el.getBoundingClientRect();
			// Only text blocks with enough text to wrap; a list item holding blocks is checked through them.
			if ( text.length < 40 || ! r.width || el.querySelector( block ) || el.closest( 'nav, [hidden], [aria-hidden="true"]' ) ) {
				continue;
			}
			const style = getComputedStyle( el );
			canvas.font = `${ style.fontWeight } ${ style.fontSize } ${ style.fontFamily }`;
			const ch = r.width / canvas.measureText( '0' ).width;
			// Line boxes of the text itself, so padding and hard breaks (an address) do not count as wrapping.
			const range = document.createRange();
			range.selectNodeContents( el );
			const tops = [ ...range.getClientRects() ].filter( ( rect ) => rect.width ).map( ( rect ) => rect.top ).sort( ( a, b ) => a - b );
			const lineCount = tops.filter( ( top, i ) => ! i || top - tops[ i - 1 ] > parseFloat( style.fontSize ) / 2 ).length;
			const wraps = lineCount - text.split( '\n' ).length;
			// The last line of a paragraph is short; count it as half a line.
			const perLine = text.replace( /\n/g, '' ).length / Math.max( 1, lineCount - 0.5 );
			// Headings run large, so for them only the width counts.
			if ( ch < 20 || ( wraps >= 2 && perLine < 25 && ! /^H\d$/.test( el.tagName ) ) ) {
				result.squeezed.push( `${ name( el ) } ${ Math.round( r.width ) }px ${ Math.round( ch ) }ch, ${ Math.round( perLine ) } chars per line: ${ text.slice( 0, 50 ).replace( /\s+/g, ' ' ) }` );
			}
		}
	}
	return result;
}

// Runs in the page: words and links of the content area, with every details block open (answers of a FAQ count).
function content( selector ) {
	document.querySelectorAll( 'details' ).forEach( ( details ) => ( details.open = true ) );
	const root = selector.split( ',' ).map( ( s ) => document.querySelector( s.trim() ) ).find( Boolean ) ?? document.body;
	return {
		text: root.innerText,
		links: [ ...root.querySelectorAll( 'a[href]' ) ].map( ( a ) => a.href ),
	};
}

const words = ( text ) => ( text.toLowerCase().match( /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu ) ?? [] );
const count = ( list ) => list.reduce( ( map, w ) => map.set( w, ( map.get( w ) ?? 0 ) + 1 ), new Map() );
const linkKey = ( href, hosts ) => {
	try {
		const u = new URL( href );
		u.hash = '';
		return hosts.includes( u.hostname ) ? ( u.pathname.replace( /\/$/, '' ) || '/' ) + u.search : u.href;
	} catch {
		return href;
	}
};

async function settle( page ) {
	await page.evaluate( () => new Promise( ( done ) => requestAnimationFrame( () => requestAnimationFrame( done ) ) ) );
}

async function check( { url, old } ) {
	const started = Date.now();
	const foreign = new Set();
	const httpErrors = [];
	const result = { url, findings: {} };
	const add = ( key, list ) => list.length && ( result.findings[ key ] = [ ...( result.findings[ key ] ?? [] ), ...list ] );
	let context;
	try {
		// bypassCSP: axe goes into the page as an inline script, which a strict policy would block.
		context = await browser.newContext( { httpCredentials, bypassCSP: true, reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } } );
		const page = await context.newPage();
		page.on( 'request', ( request ) => {
			const u = new URL( request.url() );
			if ( u.protocol.startsWith( 'http' ) && ! own( u.hostname ) ) {
				foreign.add( u.hostname );
			}
		} );
		page.on( 'response', ( response ) => response.status() >= 400 && httpErrors.push( `${ response.status() } ${ response.url() }` ) );
		const response = await page.goto( url, { waitUntil: 'load', timeout: 60000 } );
		result.status = response?.status();
		add( 'redirect', page.url() === url ? [] : [ page.url() ] );
		// Scroll once through the page, so lazy images and embeds load as for a visitor; at most 40 screens, so an
		// endless feed cannot hold the run.
		await page.evaluate( async () => {
			for ( let y = 0, step = 0; y < document.documentElement.scrollHeight && step < 40; y += innerHeight, step++ ) {
				scrollTo( 0, y );
				await new Promise( ( done ) => setTimeout( done, 60 ) );
			}
			scrollTo( 0, 0 );
		} );
		await page.waitForLoadState( 'networkidle', { timeout: 5000 } ).catch( () => {} );
		await page.addScriptTag( { content: axeSource } );
		const shots = [];
		for ( const width of WIDTHS ) {
			await page.setViewportSize( { width, height: width < 800 ? 844 : 900 } );
			await settle( page );
			const seen = await page.evaluate( layout, { squeeze: SQUEEZE_AT.includes( width ) } );
			add( 'overflow', seen.overflow.map( ( line ) => `${ width }: ${ line }` ) );
			add( 'squeezed', seen.squeezed.map( ( line ) => `${ width }: ${ line }` ) );
			if ( AXE_AT.includes( width ) ) {
				const violations = await page.evaluate( async () => ( await window.axe.run( document, {
					runOnly: { type: 'tag', values: [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa' ] },
					resultTypes: [ 'violations' ],
				} ) ).violations.map( ( v ) => `${ v.id } (${ v.impact }, ${ v.nodes.length }): ${ v.nodes.slice( 0, 3 ).map( ( n ) => n.target.join( ' ' ) ).join( ' | ' ) }` ) );
				add( 'axe', violations.map( ( line ) => `${ width }: ${ line }` ) );
			}
			if ( opt.shots && SHOT_AT.includes( width ) ) {
				shots.push( [ width, await page.screenshot( { fullPage: true, type: 'jpeg', quality: 50, scale: 'css' } ) ] );
			}
		}
		// Text checks last, at 1440 and with every details block open: text hidden on phones or in closed details counts.
		await page.setViewportSize( { width: 1440, height: 900 } );
		const mine = await page.evaluate( content, 'main, body' );
		const facts = await page.evaluate( () => ( {
			h1: document.querySelectorAll( 'h1' ).length,
			broken: [ ...document.images ].filter( ( img ) => img.complete && img.currentSrc && ! img.naturalWidth ).map( ( img ) => img.currentSrc ),
		} ) );
		add( 'h1', 1 === facts.h1 ? [] : [ `${ facts.h1 } h1` ] );
		add( 'brokenImages', facts.broken );
		add( 'shortcodes', [ ...new Set( mine.text.match( /\[\/?[a-z][a-z0-9_-]*(?:\s[^\]\n]*)?\]/g ) ?? [] ) ] );
		add( 'httpErrors', httpErrors );
		add( 'foreignHosts', [ ...foreign ] );
		if ( old ) {
			const oldPage = await context.newPage();
			await oldPage.route( /\.(png|jpe?g|gif|webp|avif|svg|woff2?|ttf|mp4|webm)(\?|$)/i, ( route ) => route.abort() );
			const oldResponse = await oldPage.goto( old, { waitUntil: 'domcontentloaded', timeout: 60000 } );
			if ( ! oldResponse?.ok() ) {
				add( 'old', [ `${ oldResponse?.status() } ${ old }: not compared` ] );
			} else {
				const theirs = await oldPage.evaluate( content, opt[ 'old-selector' ] );
				const have = count( words( mine.text ) );
				const missing = [ ...count( words( theirs.text ) ) ].filter( ( [ w, n ] ) => ( have.get( w ) ?? 0 ) < n ).map( ( [ w, n ] ) => `${ w } ${ n - ( have.get( w ) ?? 0 ) }x` );
				const hosts = [ site.hostname, new URL( old ).hostname ];
				const links = new Set( mine.links.map( ( href ) => linkKey( href, hosts ) ) );
				add( 'words', missing );
				add( 'links', [ ...new Set( theirs.links.map( ( href ) => linkKey( href, hosts ) ) ) ].filter( ( key ) => ! links.has( key ) ) );
			}
		}
		if ( opt.shots && ( opt[ 'all-shots' ] || Object.keys( result.findings ).length ) ) {
			mkdirSync( opt.shots, { recursive: true } );
			const { pathname, search } = new URL( url );
			const slug = ( pathname + search ).replace( /^\/|\/$/g, '' ).replaceAll( '/', '_' ).replace( /[^a-z0-9_]+/gi, '-' ) || 'home';
			result.shots = shots.map( ( [ width, image ] ) => {
				const file = join( opt.shots, `${ slug }-${ width }.jpg` );
				writeFileSync( file, image );
				return file;
			} );
		}
	} catch ( error ) {
		result.error = error.message.split( '\n' )[ 0 ];
	}
	await context?.close();
	result.ms = Date.now() - started;
	return result;
}

const started = Date.now();
const results = new Array( targets.length );
let next = 0;
await Promise.all( Array.from( { length: Math.max( 1, Math.min( Number( opt.concurrency ) || 4, targets.length ) ) }, async () => {
	while ( next < targets.length ) {
		const index = next++;
		results[ index ] = await check( targets[ index ] );
		const r = results[ index ];
		console.log( `${ r.error ? 'ERROR' : Object.keys( r.findings ).join( ',' ) || 'ok' } ${ r.status ?? '' } ${ r.ms }ms ${ r.url }${ r.error ? ` ${ r.error }` : '' }` );
	}
} ) );
await browser.close();

const failed = results.filter( ( r ) => r.error || Object.keys( r.findings ).length );
const summary = { site: site.href, pages: results.length, withFindings: failed.length, ms: Date.now() - started, widths: WIDTHS };
writeFileSync( opt.out, `${ JSON.stringify( { ...summary, results }, null, '\t' ) }\n` );
console.log( `${ results.length } pages, ${ failed.length } with findings, ${ summary.ms }ms, ${ opt.out }` );
process.exit( failed.length ? 1 : 0 );
