# Leitvia Skills

Agent skills and workflows for WordPress sites with the theme Leitvia and the plugin Leitvia Studio. They teach an AI coding agent (Claude Code, Codex CLI, Gemini CLI, Cursor, GitHub Copilot and other agents that read Agent Skills) how to set up, design, build, maintain, check and migrate such a site, write its news, improve how it is found and report on it, with a person at each checkpoint or unattended. The agent works only through the abilities of Leitvia Studio, so every change passes the same checks, autonomy levels, snapshots and change packages as in the backend.

## What is inside

| Folder | Content |
|---|---|
| `skills/` | Ten skills in the Agent Skills format, one folder each with a short `SKILL.md` and, under `references/`, the details it names when they are needed: `leitvia-setup`, `leitvia-design`, `leitvia-page`, `leitvia-pattern`, `leitvia-maintain`, `leitvia-a11y`, `leitvia-migrate`, `leitvia-news`, `leitvia-seo-geo`, `leitvia-report`. |
| `workflows/` | `new-site`, `maintenance-cycle` and `migrate-site`: several skills in a row with fixed checkpoints and a mode chosen at the start. |
| `handbook/` | The agent handbook, generated from Leitvia Studio: `README.md` (rules and an index of all abilities), one page per ability under `abilities/`, every rejection in `rejections.md`, and the abilities with their schemas in `abilities.json`. A skill loads the rules and only the pages of the abilities it calls. |
| `.claude-plugin/` | The manifests that let Claude Code install the package as a plugin. |
| `scenarios/`, `tests/`, `tools/` | Test scenarios, their runner and the handbook generator, for development. Agents do not need them. |

Each skill stops at checkpoints and asks the person: before the first write, before anything goes live, for facts only the person knows (legal texts, prices, organization data), and after a rejection it could not fix in one attempt. When no person answers (a scheduled or hosted run), the section Unattended of each skill gives every checkpoint its answer: writes only into a change package, facts only from a named source, open questions in the report, nothing live.

## 1. Prepare the site

- WordPress 7.1 or later and PHP 8.2 or later, with HTTPS. Application passwords of WordPress work only over HTTPS (or on a local development site).
- The theme **Leitvia** and the plugin **Leitvia Studio**. Both are submitted to WordPress.org and not listed there yet. Until they are, install the zips from the releases of [cmsadmins/leitvia](https://github.com/cmsadmins/leitvia/releases) and [cmsadmins/leitvia-studio](https://github.com/cmsadmins/leitvia-studio/releases) under **Appearance, Themes, Add New, Upload Theme** and **Plugins, Add New, Upload Plugin**. Once listed, search for them on the same screens.
- For MCP: the plugin **MCP Adapter** 0.7 from WordPress.org. Without it the agent uses the REST API, see step 2.

With WP-CLI on the server, the bootstrap in [workflows/new-site.md](workflows/new-site.md#bootstrap-the-operator-or-the-runner-before-the-agent) does this step and creates the agent user of step 2. For a test site on your own machine the same section starts WordPress Playground from a blueprint, without a server.

### Test site with WordPress Playground

For a test or demo run on your own machine, without a server, the Playground CLI (`@wp-playground/cli`, needs Node.js) starts a site from a blueprint. Save as `blueprint.json`:

```json
{
	"$schema": "https://playground.wordpress.net/blueprint-schema.json",
	"preferredVersions": { "php": "8.3", "wp": "latest" },
	"constants": { "WP_ENVIRONMENT_TYPE": "local" },
	"siteOptions": { "permalink_structure": "/%postname%/" },
	"steps": [
		{ "step": "installTheme", "themeData": { "resource": "url", "url": "https://github.com/cmsadmins/leitvia/releases/download/1.2.4/leitvia-1.2.4.zip" }, "options": { "activate": true } },
		{ "step": "installPlugin", "pluginData": { "resource": "url", "url": "https://github.com/cmsadmins/leitvia-studio/releases/download/1.3.5/leitvia-studio-1.3.5.zip" }, "options": { "activate": true } },
		{ "step": "installPlugin", "pluginData": { "resource": "url", "url": "https://downloads.wordpress.org/plugin/mcp-adapter.0.7.1.zip" }, "options": { "activate": true } },
		{ "step": "installPlugin", "pluginData": { "resource": "wordpress.org/plugins", "slug": "woocommerce" }, "options": { "activate": true } },
		{ "step": "runPHP", "code": "<?php require_once '/wordpress/wp-load.php'; $id = wp_insert_user( array( 'user_login' => 'leitvia-agent', 'display_name' => 'Leitvia agent', 'user_email' => 'agent@example.org', 'user_pass' => wp_generate_password( 32 ), 'role' => 'leitvia_agent' ) ); $created = WP_Application_Passwords::create_new_application_password( $id, array( 'name' => 'leitvia agent' ) ); file_put_contents( '/leitvia-run/agent-password.txt', $created[0] );" }
	]
}
```

Leave out the WooCommerce step for a site without a shop. Then start the server with an empty folder `run` next to the blueprint; the application password lands in `run/agent-password.txt`:

```sh
npx @wp-playground/cli@latest server --port=9481 --blueprint=blueprint.json --mount-dir ./run /leitvia-run --login
```

- `WP_ENVIRONMENT_TYPE` `local` lets application passwords work without HTTPS. Use it only on a site of your own machine.
- On Windows use `--mount-dir <host> <vfs>` (the colon of `C:` breaks `--mount`) with a Windows path as host (`C:/Users/me/run`, not `/c/Users/me/run`); in Git Bash set `MSYS_NO_PATHCONV=1`, or Git Bash rewrites `/leitvia-run`.
- The site lives in memory and is gone when the server stops. WP-Cron does not run by itself there (call `GET /wp-cron.php` after writes), and every call takes a few seconds.
- Shop: WooCommerce cannot reserve stock on the SQLite database of Playground, so an order of a product with stock management fails with `woocommerce_product_not_enough_stock`. Create test products without `stock`. Placing an order takes up to a minute or more; give browser tests a long timeout.
- `--login` signs you in as `admin` in the browser for the [steps of the person](workflows/new-site.md#steps-of-the-person). In another browser or a script, Playground's `admin` signs in with the password `password`.

## 2. Connect the agent to the site

### Agent user and application password

In the backend open **Leitvia Studio, Agents** (`/wp-admin/admin.php?page=leitvia-studio-agents`):

1. Create an agent. Studio creates a WordPress user with the role for agents and its first application password.
2. Copy the password now; it is shown once. You can create a new one or revoke all of them on the same page.
3. Set how far agents may go on their own in each area (content, corrections, structure, design). Plugins, users and settings stay locked for agents.

Every call of the agent runs as this user and is logged under its name. Give each agent a user of its own.

The examples below read the credentials from the environment variable `LEITVIA_AUTH`, the Base64 value of `<login>:<application password>`:

```sh
export LEITVIA_AUTH="$(printf '%s' 'agent-login:abcd efgh ijkl mnop qrst uvwx' | base64)"
```

Keep the password out of files you commit and out of chats.

### MCP server

With MCP Adapter active, Leitvia Studio runs the MCP server `leitvia` at `https://example.org/wp-json/leitvia-studio/v1/mcp` (transport: streamable HTTP). On a site of a multisite network in a subdirectory the path starts at the site: `https://example.org/club/wp-json/leitvia-studio/v1/mcp`. Replace `example.org` with your site in each example.

**Claude Code**, from the project folder:

```sh
claude mcp add --transport http leitvia https://example.org/wp-json/leitvia-studio/v1/mcp --header "Authorization: Basic $LEITVIA_AUTH"
```

This stores the expanded value in your local Claude Code configuration. To keep it in the environment only, use `.mcp.json` in the project:

```json
{
	"mcpServers": {
		"leitvia": {
			"type": "http",
			"url": "https://example.org/wp-json/leitvia-studio/v1/mcp",
			"headers": { "Authorization": "Basic ${LEITVIA_AUTH}" }
		}
	}
}
```

**Codex CLI**, in `~/.codex/config.toml` or `.codex/config.toml` of a trusted project:

```toml
[mcp_servers.leitvia]
url = "https://example.org/wp-json/leitvia-studio/v1/mcp"
env_http_headers = { "Authorization" = "LEITVIA_AUTH_HEADER" }
```

with `export LEITVIA_AUTH_HEADER="Basic $LEITVIA_AUTH"`.

**Gemini CLI**, in `~/.gemini/settings.json` or `.gemini/settings.json` of the project:

```json
{
	"mcpServers": {
		"leitvia": {
			"httpUrl": "https://example.org/wp-json/leitvia-studio/v1/mcp",
			"headers": { "Authorization": "Basic $LEITVIA_AUTH" }
		}
	}
}
```

**Cursor**, in `.cursor/mcp.json` of the project or `~/.cursor/mcp.json`:

```json
{
	"mcpServers": {
		"leitvia": {
			"url": "https://example.org/wp-json/leitvia-studio/v1/mcp",
			"headers": { "Authorization": "Basic ${env:LEITVIA_AUTH}" }
		}
	}
}
```

Other agents take the same URL and header in their own MCP configuration.

The tools of the server carry the names of the abilities with a hyphen: `leitvia-get-contract` for `leitvia/get-contract`. Ask the agent to call it first; the answer names the site (`site.url`), so you see the connection works and points to the right site.

### REST instead of MCP

Without MCP Adapter, or when your agent has no MCP client, every ability runs over the REST API of WordPress at `/wp-json/wp-abilities/v1/abilities/<name>/run`, with the same user and application password (HTTP Basic auth). Read abilities take GET with the input as query arguments, the others POST with the body `{"input": {...}}`:

```sh
curl -H "Authorization: Basic $LEITVIA_AUTH" "https://example.org/wp-json/wp-abilities/v1/abilities/leitvia/get-contract/run"
```

The agent handbook explains the method of each ability. Tell the agent to use REST when it has no MCP server `leitvia`; the skills describe both ways.

## 3. Install the skills

The skills link to the handbook at `../../handbook/README.md`, so `handbook` and `workflows` must sit next to the folder that holds the skills. Both ways below keep that layout.

### Claude Code: as a plugin

```sh
claude plugin install leitvia-skills --marketplace cmsadmins/leitvia-skills
```

This needs Claude Code 2.1.292 or later; inside a session, `/plugin install leitvia-skills --marketplace cmsadmins/leitvia-skills` works from 2.1.275. On older versions add the marketplace first:

```sh
claude plugin marketplace add cmsadmins/leitvia-skills
claude plugin install leitvia-skills@leitvia
```

The plugin brings skills, handbook and workflows in one folder. Its skills appear as `/leitvia-skills:leitvia-setup` and so on. `--scope project` turns the plugin on for everyone in the repository. `claude plugin update leitvia-skills@leitvia` fetches a new release.

### Every agent: copy the folders

Get the package with `git clone --depth 1 https://github.com/cmsadmins/leitvia-skills.git` or from the release zip, then copy `skills`, `handbook` and `workflows` into the parent folder of the skills folder your agent reads.

| Agent | For one project | For all projects |
|---|---|---|
| Codex CLI | `.agents/skills/` | `~/.agents/skills/` |
| Gemini CLI | `.agents/skills/` or `.gemini/skills/` | `~/.agents/skills/` or `~/.gemini/skills/` |
| Cursor | `.agents/skills/`, `.cursor/skills/` or `.claude/skills/` | `~/.agents/skills/` or `~/.cursor/skills/` |
| GitHub Copilot | `.agents/skills/`, `.github/skills/` or `.claude/skills/` | `~/.agents/skills/` or `~/.copilot/skills/` |
| Antigravity CLI | `.agents/skills/` | `~/.gemini/antigravity-cli/skills/` |
| Claude Code without the plugin | `.claude/skills/` | `~/.claude/skills/` |

One copy in `.agents/` serves Codex CLI, Gemini CLI, Cursor, GitHub Copilot and Antigravity CLI in a project:

```sh
mkdir -p .agents
cp -r leitvia-skills/skills leitvia-skills/handbook leitvia-skills/workflows .agents/
```

For all projects use `~/.agents/` in the same way. For Claude Code without the plugin:

```sh
mkdir -p ~/.claude
cp -r leitvia-skills/skills leitvia-skills/handbook leitvia-skills/workflows ~/.claude/
```

Installers that take single skill folders, such as `npx skills add`, leave out `handbook` and `workflows`; copy those two next to the skills folder afterwards. Restart the agent after copying; it lists the skills by name, for example `leitvia-setup`.

## 4. First task

Name the task and the site; the agent picks the skill from its description. Start with a read: "Call leitvia/get-contract on https://example.org and tell me what the site offers." For a longer task point it to a workflow, for example: "Follow workflows/new-site.md for https://example.org, mode package." With the Claude Code plugin the workflows lie in the plugin folder, `~/.claude/plugins/cache/leitvia/leitvia-skills/<version>/workflows/`; `claude plugin list` shows the version.

Each workflow asks for the mode at the start:

- **package:** every write of the task goes into one change package, whatever the autonomy levels allow. Nothing changes on the site until a person reviews the package in **Leitvia Studio, Inbox** (block diff and preview) and applies it.
- **direct:** only with a person present; the autonomy levels of the site decide what goes live, and with the default levels new pages, header, footer and navigation stay drafts the person publishes. Legal texts, prices, slugs and organization data still wait in a package for a person. Unattended runs always use mode package.

## Privacy

Leitvia Studio and these skills send nothing to anyone. The agent reads content of your site (texts, settings, image addresses) and sends it to the provider of the AI model the agent uses, which you choose and configure in the agent. Check that provider's terms before you connect a site with personal data, and give the agent user only the autonomy you want. Images go to an AI service only through the AI plugin of WordPress and after the person agreed at the checkpoint.

## Limits

- No plugins, users, themes or WordPress settings: the area `admin` stays locked for agents. Installing plugins, switching the theme and changing settings are checkpoints for a person.
- No SQL, no WP-CLI and no REST routes of WordPress core from a skill, not even for reading; only the abilities of Leitvia Studio and the public pages of the site.
- Automated checks find a part of the barriers of a site, not all. The skills never call a site accessible or compliant.
- Working on several sites at once and moving changes from a staging site to the live site are part of Leitvia Pro and not in this package.

## Documentation and license

Documentation: https://leitvia.com/docs/

GPL 2.0 or later, like the theme and the plugin; see `LICENSE`. Made by CMS ADMINS.
