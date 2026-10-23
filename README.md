# Leitvia Skills

Agent skills and workflows for WordPress sites with the theme Leitvia and the plugin Leitvia Studio. They teach an AI coding agent (Claude Code, Codex CLI, Gemini CLI, Cursor) how to set up, design, build, maintain, check and migrate such a site and write its news, with a person at each checkpoint or unattended. The agent works only through the abilities of Leitvia Studio, so every change passes the same checks, autonomy levels, snapshots and change packages as in the backend.

## What is inside

| Folder | Content |
|---|---|
| `skills/` | Eight skills in the Agent Skills format, one folder each with a short `SKILL.md` and, under `references/`, the details it names when they are needed: `leitvia-setup`, `leitvia-design`, `leitvia-page`, `leitvia-pattern`, `leitvia-maintain`, `leitvia-a11y`, `leitvia-migrate`, `leitvia-news`. |
| `workflows/` | `new-site`, `maintenance-cycle` and `migrate-site`: several skills in a row with fixed checkpoints and a mode chosen at the start. |
| `handbook/` | The agent handbook, generated from Leitvia Studio: `README.md` (rules and an index of all abilities), one page per ability under `abilities/`, every rejection in `rejections.md`, and the abilities with their schemas in `abilities.json`. A skill loads the rules and only the pages of the abilities it calls. |
| `scenarios/`, `tests/`, `tools/` | Test scenarios, their runner and the handbook generator, for development. Agents do not need them. |

Each skill stops at checkpoints and asks the person: before the first write, before anything goes live, for facts only the person knows (legal texts, prices, organization data), and after a rejection it could not fix in one attempt. When no person answers (a scheduled or hosted run), the section Unattended of each skill gives every checkpoint its answer: writes only into a change package, facts only from a named source, open questions in the report, nothing live.

## Requirements

- WordPress 7.1 or later and PHP 8.2 or later, with the theme **Leitvia** and the plugin **Leitvia Studio**. Until both are listed on WordPress.org, install the zips from the releases of [cmsadmins/leitvia](https://github.com/cmsadmins/leitvia/releases) and [cmsadmins/leitvia-studio](https://github.com/cmsadmins/leitvia-studio/releases).
- For MCP: the plugin **MCP Adapter** 0.7 from WordPress.org. Without it the agent uses the REST API, see below.
- HTTPS on the site. Application passwords of WordPress work only over HTTPS (or on a local development site).
- An agent that reads Agent Skills: Claude Code, Codex CLI, Gemini CLI or Cursor.

## Connect the agent to the site

### 1. Agent user and application password

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

### 2. MCP server

With MCP Adapter active, Leitvia Studio runs the MCP server `leitvia` at `https://example.org/wp-json/leitvia-studio/v1/mcp` (transport: streamable HTTP). On a site of a multisite network in a subdirectory the path starts at the site: `https://example.org/club/wp-json/leitvia-studio/v1/mcp`. Replace `example.org` with your site in each example.

**Claude Code**, from the project folder:

```sh
claude mcp add --transport http leitvia https://example.org/wp-json/leitvia-studio/v1/mcp --header "Authorization: Basic $LEITVIA_AUTH"
```

or in `.mcp.json` of the project:

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

**Codex CLI**, in `~/.codex/config.toml`:

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

The tools of the server carry the names of the abilities with a hyphen: `leitvia-get-contract` for `leitvia/get-contract`. Ask the agent to call it first; the answer names the site (`site.url`), so you see the connection works and points to the right site.

### 3. REST instead of MCP

Without MCP Adapter, or when your agent has no MCP client, every ability runs over the REST API of WordPress at `/wp-json/wp-abilities/v1/abilities/<name>/run`, with the same user and application password (HTTP Basic auth). Read abilities take GET with the input as query arguments, the others POST with the body `{"input": {...}}`:

```sh
curl -H "Authorization: Basic $LEITVIA_AUTH" "https://example.org/wp-json/wp-abilities/v1/abilities/leitvia/get-contract/run"
```

The agent handbook explains the method of each ability. Tell the agent to use REST when it has no MCP server `leitvia`; the skills describe both ways.

## Install the skills

Get the package (from the release zip or with `git clone https://github.com/cmsadmins/leitvia-skills.git`) and copy the folders `skills`, `handbook` and `workflows` so that `handbook` and `workflows` sit next to the skills folder: the skills link to `../../handbook/README.md`.

| Agent | For one project | For all projects |
|---|---|---|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex CLI | `.agents/skills/` | `~/.agents/skills/` |
| Gemini CLI | `.agents/skills/` | `~/.gemini/skills/` |
| Cursor | `.agents/skills/` or `.cursor/skills/` | |

Example for a project, Codex CLI, Gemini CLI and Cursor:

```sh
mkdir -p .agents
cp -r leitvia-skills/skills leitvia-skills/handbook leitvia-skills/workflows .agents/
```

Example for Claude Code in all projects:

```sh
mkdir -p ~/.claude/skills
cp -r leitvia-skills/skills/* ~/.claude/skills/
cp -r leitvia-skills/handbook leitvia-skills/workflows ~/.claude/
```

Cursor also reads `.claude/skills/`, so one copy there serves Claude Code and Cursor. Restart the agent after copying; it lists the skills by name, for example `leitvia-setup`.

## Use

Name the task and the site; the agent picks the skill from its description. For a longer task point it to a workflow, for example: "Follow workflows/new-site.md for https://example.org, mode package." Each workflow asks for the mode at the start:

- **package:** every write of the task goes into one change package, whatever the autonomy levels allow. Nothing changes on the site until a person reviews the package in **Leitvia Studio, Inbox** (block diff and preview) and applies it.
- **direct:** the autonomy levels of the site decide what goes live. Legal texts, prices, slugs and organization data still wait in a package for a person.

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
