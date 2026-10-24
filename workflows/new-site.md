# Workflow: new-site

From a briefing to a finished site with the Leitvia theme and Leitvia Studio: setup, brand, extra pages, accessibility check. The workflow chains four skills and stops at fixed checkpoints; each skill keeps its own rules and checkpoints. How to call the abilities, hashes and rejections: [agent handbook](../handbook/README.md).

Chain: [leitvia-setup](../skills/leitvia-setup/SKILL.md), then [leitvia-design](../skills/leitvia-design/SKILL.md), then [leitvia-page](../skills/leitvia-page/SKILL.md), then [leitvia-a11y](../skills/leitvia-a11y/SKILL.md).

## Bootstrap (the operator or the runner, before the agent)

An empty WordPress installation has neither the theme nor Leitvia Studio, and installing them is no ability: the area `admin` stays locked for agents. The operator, or the script that starts an unattended run, prepares the site once with WP-CLI on the server (WordPress 7.1 or later, PHP 8.2 or later, HTTPS):

```sh
wp theme install https://github.com/cmsadmins/leitvia/releases/download/1.0.2/leitvia-1.0.2.zip --activate
wp plugin install https://github.com/cmsadmins/leitvia-studio/releases/download/1.1.1/leitvia-studio-1.1.1.zip --activate
wp plugin install https://downloads.wordpress.org/plugin/mcp-adapter.0.7.1.zip --activate
wp user create leitvia-agent agent@example.org --role=leitvia_agent --display_name="Leitvia agent"
wp user application-password create leitvia-agent "leitvia agent" --porcelain
```

Once the theme and Leitvia Studio are listed on WordPress.org, `wp theme install leitvia --activate` and `wp plugin install leitvia-studio --activate` replace the first two lines. Keep MCP Adapter at 0.7, the version Leitvia Studio supports. The last command prints the application password once; store it as `LEITVIA_AUTH` (Base64 of `leitvia-agent:<password>`) for the agent, never in a file you commit. For a shop also `wp plugin install woocommerce --activate` before the run. The agent itself never runs WP-CLI; its first call is `leitvia/get-contract`, which proves the bootstrap worked.

## Choose the mode at the start

Ask the person once, before the first write, and keep the answer for the whole workflow.

- **package** (default for a site that is live or has visitors): choose one key for the task, for example `new-site-2026-10`, and send it as `package` on every write of every step. A write with a key always lands in the change package of that key; nothing goes live, whatever the autonomy levels of the site allow. Writes that need an object the package creates (texts on a page of the package, the activation of a new token set) come after the checkpoint **Package applied**; the same key then starts the next package.
- **direct** (only when the person says nobody visits the site yet): send no key, the autonomy levels of the site decide. Legal texts, prices, slugs and organization data stay a proposal all the same: send these writes with a key, so they wait in a package for the person.

In both modes Leitvia Studio itself writes nothing outside the abilities, and every rejection is corrected at most once (follow `message`, `next_ability` and `retry`); a second rejection of the same call, or `retry: never`, is a checkpoint: stop and show the person the rejection.

When no person answers, the workflow runs in several unattended runs with the same key. Each checkpoint takes the answer of the section Unattended of its skill, and every write carries the key. A run ends at the next checkpoint "Package applied" with its report. The next run starts with `leitvia/list-packages`: while the package of the key is still `open`, it reports that it waits and writes nothing; once a person applied it, the run goes on with the step after that checkpoint. Nothing goes live without a person applying a package.

## Steps

### 1. Setup

- **Skill:** leitvia-setup, steps 1 to 4.
- **Input:** the briefing of the person.
- **Writes:** `leitvia/apply-recipe` with the recipe and, in mode `package`, the key. Settings that point to recipe pages (front page, privacy policy page) wait in the same package and are set when it is applied.
- **Checkpoints:** "Briefing confirmed": "Is this right: operator <name>, kind of site <kind>, mode <mode>, fixed URLs <list>, legal texts from <person>?" Then "Recipe chosen": "I will use the recipe <name>. It creates the pages <titles> with the addresses <slugs>. Shall I apply it?"

### 2. Brand

- **Skill:** leitvia-design, steps 1 to 5.
- **Input:** the brand source the person names in the briefing (style guide, design file, existing site), the contract from step 1.
- **Writes:** `leitvia/create-token-set` with the same key. Skip the step when the person has no brand yet and say so in the report.
- **Checkpoint:** "Contrast correction accepted", only when you changed a brand value: "Your accent <old> misses <pair> (<ratio>). <new> reaches <ratio>. May I use <new>?"

### 3. Extra pages

- **Skill:** leitvia-page.
- **Input:** pages the briefing asks for beyond the recipe, with goal and content points; the page frames and patterns of the contract.
- **Writes:** `leitvia/compose-page` with the same key. Only approved patterns; a Lab pattern in draft or review is refused with `leitvia_pattern_not_approved`.
- **Checkpoint:** "Outline confirmed": "This is the outline of <page>: <sections with pattern and content>. Shall I build it?"

### 4. Review of the package

- `leitvia/list-packages` with `state: open` shows exactly one package with your key; `leitvia/get-package` with its `id` lists every operation with its diff and the `preview` link.
- **Checkpoint "Package applied":** "Package <id> holds <n> changes: <short list>. Please review it in the inbox at `/wp-admin/admin.php?page=leitvia-studio-inbox&package=<id>` (block diff and preview) and apply it. Shall I wait?" Do not continue before the person applied it.
- After it is applied: `leitvia/apply-recipe` with the same recipe and key reports `package: 0` and only `exists` (leitvia-setup, step 5).

### 5. Legal texts and activation

- **Skills:** leitvia-setup step 6 (legal texts), leitvia-design step 6 (activate the token set).
- **Input:** page IDs from the check run of step 4, the ID of the new token set from `leitvia/get-tokens`, texts the person supplied verbatim.
- **Writes:** `leitvia/update-content` on the legal pages and `leitvia/activate-token-set`, both with the key; they form the second package.
- **Checkpoints:** "Legal texts supplied by the human": "Please send the texts of imprint and privacy policy (and for a shop terms and withdrawal). Until then the placeholders stay and the site is not finished." Then "Package applied" for the second package, with the same question as in step 4.

### 6. Accessibility check

- **Skill:** leitvia-a11y.
- **Input:** every published page of the site after step 5.
- **Writes:** fixes with the same key, a third package when there is anything to fix.
- **Checkpoints:** "Link targets", "AI for alt text" and "Package applied" of the skill, with the questions it names.

## Report

Give the person, in their language: the packages with ID, state and inbox link; the pages with their public addresses; the findings of the accessibility check before and after; what stays open (legal texts, links you could not resolve, tests only a person can do). Never call the site accessible or finished while a legal placeholder is visible.

## Checkpoints

1. **Briefing confirmed** and **Recipe chosen** (step 1).
2. **Contrast correction accepted** (step 2, only when a brand value changed).
3. **Outline confirmed** per extra page (step 3).
4. **Package applied** after steps 3, 5 and 6.
5. **Legal texts supplied by the human** (step 5).
6. **Second rejection** of the same call, or a rejection with `retry: never`, in any step.
