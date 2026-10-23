#!/usr/bin/env node
/**
 * Plays the steps of each skill scenario against a fresh WordPress Playground and checks the end state. No language
 * model: the scenario lists the ability calls a skill would make.
 *
 *   node packages/leitvia-skills/tests/run-scenarios.mjs [--port <n>] [--boot-timeout <s>] [--playground-arg <arg> ...] [<folder or file> ...]
 *   node packages/leitvia-skills/tests/run-scenarios.mjs --expect-only --url <url> [--password <p>] [--capture <name>=<value> ...] [<folder or file> ...]
 *
 * Without filters it runs every scenario under packages/leitvia-skills/scenarios/. Each scenario gets its own site from
 * dev/playground/start.mjs (about a minute) with its setup steps appended to the blueprint. Calls go to the REST route
 * of the Abilities API as the user agent with the application password of that site; a step with user admin acts as the
 * person at a checkpoint (applying a change package) with .cache/playground/admin-password.txt, which the setup of the
 * scenario writes to /leitvia-run/admin-password.txt. --expect-only checks only the
 * end state of a site that is already running, for example after an agent run; the password comes from --password,
 * LEITVIA_AGENT_PASSWORD or .cache/playground/agent-password.txt, and --capture gives the values that {{capture.<name>}}
 * in the end state checks would otherwise take from the steps (IDs of the posts and blocks the agent worked on). Exit
 * code 1 when a scenario fails. A scenario with source gets that folder of tests/fixtures/ served over HTTP while it runs,
 * at {{source}}; {{fixture:<path>}} is the Base64 of a file under tests/fixtures/. --playground-arg passes an argument
 * on to dev/playground/start.mjs for every site, for example --playground-arg=--pro to test an add-on with its own
 * scenarios, which may live outside this package. --boot-timeout gives a site with long setup steps more than the
 * default 180 seconds to start.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual, parseArgs } from 'node:util';

const root = resolve( dirname( fileURLToPath( import.meta.url ) ), '../../..' );
const scenarios = join( root, 'packages/leitvia-skills/scenarios' );
const fixtures = join( root, 'packages/leitvia-skills/tests/fixtures' );
const annotations = new Map(
	JSON.parse( readFileSync( join( root, 'packages/leitvia-skills/handbook/abilities.json' ), 'utf8' ) )
		.abilities.map( ( ability ) => [ ability.name, ability.annotations ] )
);

const { values, positionals } = parseArgs( {
	allowPositionals: true,
	options: {
		port: { type: 'string', default: '9400' },
		'expect-only': { type: 'boolean', default: false },
		url: { type: 'string' },
		password: { type: 'string' },
		capture: { type: 'string', multiple: true, default: [] },
		'playground-arg': { type: 'string', multiple: true, default: [] },
		'boot-timeout': { type: 'string', default: '180' },
	},
} );
if ( values[ 'expect-only' ] && ! values.url ) {
	console.error( '--expect-only needs --url <url> of the running site.' );
	process.exit( 2 );
}

const files = select( positionals );
if ( ! files.length ) {
	console.log( 'No scenarios.' );
	process.exit( 0 );
}

let failed = 0;
for ( const file of files ) {
	const name = relative( scenarios, file ).replaceAll( '\\', '/' );
	const scenario = JSON.parse( readFileSync( file, 'utf8' ) );
	const started = Date.now();
	const tags = scenario.tags?.length ? ` [${ scenario.tags.join( ', ' ) }]` : '';
	let site;
	let source;
	let errors;
	try {
		source = scenario.source ? await serve( join( fixtures, scenario.source ) ) : null;
		site = values[ 'expect-only' ] ? running() : await boot( scenario.setup ?? [] );
		errors = await play( site, scenario, source?.url );
	} catch ( error ) {
		errors = [ String( error?.stack ?? error ) ];
	} finally {
		await site?.stop?.();
		source?.server.close();
	}
	const seconds = ( ( Date.now() - started ) / 1000 ).toFixed( 1 );
	console.log( `${ errors.length ? 'FAIL' : 'ok  ' } ${ name }${ tags } (${ seconds } s)` );
	if ( errors.length ) {
		failed++;
		console.log( errors.map( ( error ) => `  ${ error.replaceAll( '\n', '\n  ' ) }` ).join( '\n' ) );
	}
}
console.log( `${ files.length - failed } of ${ files.length } scenarios passed.` );
process.exit( failed ? 1 : 0 );

/**
 * Scenario files under the given folders or files, all without filters.
 *
 * @param {string[]} filters Paths relative to the working directory or to scenarios/.
 * @return {string[]} Sorted absolute paths.
 */
function select( filters ) {
	const walk = ( path ) => ( statSync( path ).isDirectory()
		? readdirSync( path ).flatMap( ( entry ) => walk( join( path, entry ) ) )
		: [ path ] );
	const all = ( filters.length ? filters : [ scenarios ] ).flatMap( ( filter ) => {
		const path = [ resolve( filter ), resolve( scenarios, filter ), resolve( root, filter ) ].find( existsSync );
		if ( ! path ) {
			throw new Error( `No scenario at ${ filter }` );
		}
		return walk( path );
	} );
	return [ ...new Set( all ) ].filter( ( path ) => path.endsWith( '.json' ) && ! path.endsWith( 'scenario.schema.json' ) ).sort();
}

/**
 * The site of --expect-only.
 *
 * @return {{url: string, password: string}} Site.
 */
function running() {
	const file = join( root, '.cache/playground/agent-password.txt' );
	const password = values.password ?? process.env.LEITVIA_AGENT_PASSWORD ?? ( existsSync( file ) ? readFileSync( file, 'utf8' ).trim() : '' );
	return { url: values.url.replace( /\/$/, '' ), password };
}

/**
 * Starts a fresh Playground with the setup steps of the scenario and waits until it is ready.
 *
 * @param {Object[]} setup Extra blueprint steps.
 * @return {Promise<{url: string, password: string, stop: Function}>} Site.
 */
async function boot( setup ) {
	const dir = mkdtempSync( join( tmpdir(), 'leitvia-scenario-' ) );
	const steps = join( dir, 'steps.json' );
	writeFileSync( steps, JSON.stringify( setup ) );
	const child = spawn( process.execPath, [ join( root, 'dev/playground/start.mjs' ), '--port', values.port, '--steps', steps, ...values[ 'playground-arg' ] ], { cwd: root, stdio: [ 'ignore', 'pipe', 'pipe' ] } );
	let log = '';
	const stop = () => new Promise( ( done ) => {
		rmSync( dir, { recursive: true, force: true } );
		if ( null !== child.exitCode ) {
			return done();
		}
		child.once( 'exit', () => done() );
		if ( 'win32' === process.platform ) {
			// Windows has no SIGINT for child processes; kill the tree, or the Playground server keeps the port.
			spawnSync( 'taskkill', [ '/pid', String( child.pid ), '/T', '/F' ] );
		} else {
			child.kill( 'SIGINT' );
		}
	} );
	await new Promise( ( done, fail ) => {
		const timer = setTimeout( () => fail( new Error( `Playground not ready after ${ values[ 'boot-timeout' ] } s:\n${ log.slice( -2000 ) }` ) ), Number( values[ 'boot-timeout' ] ) * 1000 );
		const read = ( chunk ) => {
			log += chunk;
			if ( log.includes( 'Leitvia Playground ready' ) ) {
				clearTimeout( timer );
				done();
			}
		};
		child.stdout.on( 'data', read );
		child.stderr.on( 'data', read );
		child.once( 'exit', ( code ) => {
			clearTimeout( timer );
			fail( new Error( `Playground exited with ${ code }:\n${ log.slice( -2000 ) }` ) );
		} );
	} ).catch( async ( error ) => {
		await stop();
		throw error;
	} );
	const password = readFileSync( join( root, '.cache/playground/agent-password.txt' ), 'utf8' ).trim();
	return { url: `http://127.0.0.1:${ values.port }`, password, stop };
}

/**
 * Serves a folder of static files on a free port of 127.0.0.1, index.html for a folder.
 *
 * @param {string} dir Folder.
 * @return {Promise<{url: string, server: Object}>} Address and server.
 */
async function serve( dir ) {
	const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'application/xml' };
	const server = createServer( ( request, response ) => {
		const path = resolve( dir, `.${ decodeURIComponent( new URL( request.url, 'http://source' ).pathname ) }` );
		const file = existsSync( path ) && statSync( path ).isDirectory() ? join( path, 'index.html' ) : path;
		if ( ! file.startsWith( dir ) || ! existsSync( file ) ) {
			response.writeHead( 404 ).end();
			return;
		}
		response.writeHead( 200, { 'Content-Type': types[ file.slice( file.lastIndexOf( '.' ) ) ] ?? 'application/octet-stream' } ).end( readFileSync( file ) );
	} );
	await new Promise( ( done ) => server.listen( 0, '127.0.0.1', done ) );
	return { url: `http://127.0.0.1:${ server.address().port }`, server };
}

/**
 * Runs the steps, then the end state checks.
 *
 * @param {{url: string, password: string}} site     Site.
 * @param {Object}                           scenario Scenario.
 * @return {Promise<string[]>} Errors, empty when the scenario passed.
 */
async function play( site, scenario, source ) {
	// --capture page=12 gives the number 12, --capture link=p:0.1 the string.
	const capture = { source, ...Object.fromEntries( values.capture.map( ( pair ) => {
		const [ key, ...rest ] = pair.split( '=' );
		const value = rest.join( '=' );
		return [ key, /^\d+$/.test( value ) ? Number( value ) : value ];
	} ) ) };
	if ( ! values[ 'expect-only' ] ) {
		for ( const [ index, step ] of scenario.steps.entries() ) {
			const input = fill( step.input ?? {}, capture );
			const response = await call( site, step.ability, input, step.user );
			let errors;
			if ( step.expectError ) {
				errors = response.body?.code === step.expectError ? [] : [ `code: expected ${ step.expectError }, got ${ JSON.stringify( response.body?.code ) }` ];
			} else {
				errors = response.status >= 400 ? [ `status ${ response.status }` ] : compare( response.body, step.expect );
			}
			if ( errors.length ) {
				return [ report( `step ${ index + 1 }`, step.ability, input, response, errors ) ];
			}
			for ( const [ key, path ] of Object.entries( step.capture ?? {} ) ) {
				capture[ key ] = at( response.body, path );
			}
		}
	}
	const errors = [];
	for ( const [ index, check ] of scenario.expect.entries() ) {
		if ( check.url ) {
			const response = await fetch( site.url + check.url );
			const html = await response.text();
			const h1 = ( html.match( /<h1[\s>]/gi ) ?? [] ).length;
			const found = [];
			if ( response.status !== ( check.status ?? 200 ) ) {
				found.push( `status: expected ${ check.status ?? 200 }, got ${ response.status }` );
			}
			if ( undefined !== check.h1 && h1 !== check.h1 ) {
				found.push( `h1: expected ${ check.h1 }, got ${ h1 }` );
			}
			for ( const text of check.contains ?? [] ) {
				if ( ! html.includes( text ) ) {
					found.push( `contains: ${ JSON.stringify( text ) } is missing` );
				}
			}
			for ( const text of check.absent ?? [] ) {
				if ( html.includes( text ) ) {
					found.push( `absent: ${ JSON.stringify( text ) } is on the page` );
				}
			}
			if ( found.length ) {
				errors.push( `expect ${ index + 1 }: GET ${ check.url }\n${ found.join( '\n' ) }` );
			}
			continue;
		}
		const input = fill( check.input ?? {}, capture );
		const response = await call( site, check.ability, input );
		const found = response.status >= 400 ? [ `status ${ response.status }` ] : compare( response.body, check.expect );
		if ( found.length ) {
			errors.push( report( `expect ${ index + 1 }`, check.ability, input, response, found ) );
		}
	}
	return errors;
}

/**
 * Calls an ability over REST with the method its annotations demand: readonly GET, destructive and idempotent DELETE,
 * otherwise POST. After a write it runs WP-Cron by hand (Playground does not spawn it), so the check after the write
 * lands in the audit log.
 *
 * @param {{url: string, password: string}} site    Site.
 * @param {string}                           ability Ability name.
 * @param {Object}                           input   Input.
 * @param {string}                           user    agent, or admin for a person at a checkpoint.
 * @return {Promise<{method: string, status: number, body: *}>} Response.
 */
async function call( site, ability, input, user = 'agent' ) {
	const flags = annotations.get( ability );
	if ( ! flags ) {
		throw new Error( `${ ability } is not in handbook/abilities.json` );
	}
	let method = 'POST';
	if ( flags.readonly ) {
		method = 'GET';
	} else if ( flags.destructive && flags.idempotent ) {
		method = 'DELETE';
	}
	let url = `${ site.url }/wp-json/wp-abilities/v1/abilities/${ ability }/run`;
	const password = 'agent' === user ? site.password : readFileSync( join( root, `.cache/playground/${ user }-password.txt` ), 'utf8' ).trim();
	const init = { method, headers: { Authorization: `Basic ${ Buffer.from( `${ user }:${ password }` ).toString( 'base64' ) }` } };
	if ( 'POST' === method ) {
		init.headers[ 'Content-Type' ] = 'application/json';
		init.body = JSON.stringify( { input } );
	} else if ( Object.keys( input ).length ) {
		url += `?${ query( 'input', input ) }`;
	}
	const response = await fetch( url, init );
	const text = await response.text();
	let body = text;
	try {
		body = JSON.parse( text );
	} catch {}
	if ( 'GET' !== method ) {
		await fetch( `${ site.url }/wp-cron.php` ).then( ( cron ) => cron.text() );
	}
	return { method, status: response.status, body };
}

/**
 * PHP style query string: input[a]=1&input[b][0]=x.
 *
 * @param {string} prefix Key.
 * @param {*}      value  Value.
 * @return {string} Query string.
 */
function query( prefix, value ) {
	if ( value && 'object' === typeof value ) {
		return Object.entries( value ).map( ( [ key, item ] ) => query( `${ prefix }[${ key }]`, item ) ).join( '&' );
	}
	return `${ encodeURIComponent( prefix ) }=${ encodeURIComponent( String( value ) ) }`;
}

/**
 * Replaces {{capture.name}}. A string that is only the placeholder takes the captured value with its type.
 *
 * @param {*}      value   Input.
 * @param {Object} capture Captured values.
 * @return {*} Filled input.
 */
function fill( value, capture ) {
	if ( 'string' === typeof value ) {
		const whole = value.match( /^\{\{capture\.([\w-]+)\}\}$/ );
		if ( whole ) {
			return capture[ whole[ 1 ] ];
		}
		const file = value.match( /^\{\{fixture:([\w./-]+)\}\}$/ );
		if ( file ) {
			return readFileSync( join( fixtures, file[ 1 ] ) ).toString( 'base64' );
		}
		return value.replace( /\{\{capture\.([\w-]+)\}\}/g, ( _, key ) => String( capture[ key ] ) ).replaceAll( '{{source}}', String( capture.source ) );
	}
	if ( Array.isArray( value ) ) {
		return value.map( ( item ) => fill( item, capture ) );
	}
	if ( value && 'object' === typeof value ) {
		return Object.fromEntries( Object.entries( value ).map( ( [ key, item ] ) => [ key, fill( item, capture ) ] ) );
	}
	return value;
}

/**
 * Value at a dot path; items.length works on arrays.
 *
 * @param {*}      value Response.
 * @param {string} path  Dot path.
 * @return {*} Value or undefined.
 */
function at( value, path ) {
	return path.split( '.' ).reduce( ( current, key ) => ( null === current || undefined === current ? undefined : current[ key ] ), value );
}

/**
 * Differences between a response and the expected fields.
 *
 * @param {*}      body   Response.
 * @param {Object} expect Dot path to value or { $gte | $lte | $exists | $match }.
 * @return {string[]} Differences.
 */
function compare( body, expect = {} ) {
	const errors = [];
	for ( const [ path, want ] of Object.entries( expect ) ) {
		const got = at( body, path );
		const operator = want && 'object' === typeof want && ! Array.isArray( want ) && Object.keys( want )[ 0 ]?.startsWith( '$' ) ? Object.keys( want )[ 0 ] : null;
		const ok = {
			$gte: () => got >= want.$gte,
			$lte: () => got <= want.$lte,
			$exists: () => ( undefined !== got ) === want.$exists,
			$match: () => new RegExp( want.$match ).test( String( got ) ),
		}[ operator ]?.() ?? ( ! operator && isDeepStrictEqual( got, want ) );
		if ( ! ok ) {
			errors.push( `${ path }: expected ${ JSON.stringify( want ) }, got ${ JSON.stringify( got ) }` );
		}
	}
	return errors;
}

/**
 * Call, response and difference of a failed check.
 *
 * @param {string}   where    Step or expect.
 * @param {string}   ability  Ability.
 * @param {Object}   input    Input.
 * @param {Object}   response Response.
 * @param {string[]} errors   Differences.
 * @return {string} Report.
 */
function report( where, ability, input, response, errors ) {
	return [
		`${ where }: ${ response.method } ${ ability } ${ JSON.stringify( input ) }`,
		`response ${ response.status }: ${ JSON.stringify( response.body ).slice( 0, 2000 ) }`,
		...errors.map( ( error ) => `diff ${ error }` ),
	].join( '\n' );
}
