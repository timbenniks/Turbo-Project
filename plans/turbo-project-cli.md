# Plan: turbo-project CLI

> Source PRD: https://github.com/timbenniks/Turbo-Project/issues/1

## Architectural decisions

Durable decisions that apply across all phases:

- **Package name**: `@timbenniks/turbo-project` on npm
- **Invocation**: `npx @timbenniks/turbo-project` — no subcommands, default action is the wizard
- **Optional flags**: `--name <name>`, `--preset <id>` to skip those prompts
- **Language**: TypeScript, compiled to JS for distribution
- **Entry point**: `bin/turbo-project.ts` → compiled to `dist/bin/turbo-project.js`
- **Module structure**: Each concern in its own file under `src/` — banner, wizard, preflight, scaffold, drizzle, git, vercel, agents, readme, runner
- **Package manager**: npm throughout (for the scaffolded project)
- **External CLI dependencies**: `node`, `npx` (required), `vercel` (required), `gh` (required only if user opts into GitHub)
- **Neon provisioning**: Exclusively via `vercel integration add neon` — no `neonctl`
- **Drizzle config**: Reads `DATABASE_URL` from environment
- **Mascot**: ASCII turbo-snail rendered with gradient-string + boxen

---

## Phase 1: Skeleton CLI + Banner

**User stories**: 3

### What to build

Set up the npm package with `package.json`, TypeScript config, and build pipeline. Create the commander entry point that does nothing but display the turbo-snail mascot banner (ASCII art + gradient-string + boxen) and exit. Wire up the `bin` field in `package.json` so `npx .` works locally during development.

### Acceptance criteria

- [ ] `npm run build` compiles TypeScript to `dist/`
- [ ] `npx .` in the repo root displays the turbo-snail banner in the terminal with gradient colors inside a box
- [ ] `--help` shows usage info with package name and description
- [ ] `--version` shows the package version

---

## Phase 2: Preflight + Interactive Wizard

**User stories**: 2, 4, 5, 6, 7, 20

### What to build

Add preflight checks that verify required CLIs are available (`node`, `npx`, `vercel`) and report missing ones with install instructions. Build the @clack/prompts wizard flow that collects: project name (text input), shadcn preset ID (text input with default `b5KJfbd9k`, hint showing `https://ui.shadcn.com/create`), whether to create a GitHub repo (confirm), and if yes, public or private (select). At the end, display a summary of the collected choices and ask for confirmation. If the user says no or cancels at any point, exit gracefully. No actual execution yet — just collect and confirm inputs.

### Acceptance criteria

- [ ] CLI exits with clear error message and install instructions if `vercel` is not found
- [ ] CLI exits with clear error message if `gh` is not found but user opts into GitHub repo creation
- [ ] Wizard collects project name, preset ID, GitHub preference, and visibility
- [ ] Preset prompt shows the shadcn create URL as a hint
- [ ] Summary of all choices is displayed before confirmation
- [ ] Ctrl+C at any prompt exits gracefully with a cancellation message
- [ ] `--name` and `--preset` flags skip their respective prompts

---

## Phase 3: Scaffold + Drizzle Setup

**User stories**: 1, 8, 9, 10, 11, 21

### What to build

Implement the scaffold module that runs `npx shadcn@latest init --preset <id> --template next` in a new directory named after the project. Implement the Drizzle module that installs `drizzle-orm`, `drizzle-kit`, and `@neondatabase/serverless` via npm, then writes a `drizzle.config.ts` (reading `DATABASE_URL` from env) and a placeholder `db/schema.ts`. Wire both into the runner with @clack/prompts `tasks()` or spinner for progress feedback. After this phase, running the CLI end-to-end produces a real Next.js project with Drizzle ready to go.

### Acceptance criteria

- [ ] Running the CLI creates a new directory with the project name
- [ ] The directory contains a scaffolded Next.js project with shadcn/ui, TypeScript, and Tailwind v4
- [ ] `drizzle-orm`, `drizzle-kit`, and `@neondatabase/serverless` are in `package.json` dependencies
- [ ] `drizzle.config.ts` exists and reads `DATABASE_URL` from `process.env`
- [ ] `db/schema.ts` exists as a starter file
- [ ] Progress is shown via spinners/tasks during scaffolding and installation
- [ ] Errors during scaffolding or installation are caught and reported clearly

---

## Phase 4: Git + GitHub

**User stories**: 12, 13

### What to build

Implement the git module that initializes a git repo in the scaffolded project and makes an initial commit. If the user opted into GitHub, run `gh repo create` with the chosen visibility (public/private), set the remote, and push. Wire into the runner after the scaffold + drizzle step.

### Acceptance criteria

- [ ] The scaffolded project has a `.git` directory with an initial commit
- [ ] If GitHub was selected, a repo exists on GitHub with the correct visibility
- [ ] The local repo has `origin` set to the GitHub repo and the initial commit is pushed
- [ ] If GitHub was skipped, the project still has a local git repo with an initial commit
- [ ] Errors (e.g., gh auth expired) are caught and reported with actionable messages

---

## Phase 5: Vercel + Neon + Env Vars

**User stories**: 14, 15, 16, 19

### What to build

Implement the Vercel module that creates a Vercel project (linked to the GitHub repo if one was created). Provision a Neon database via `vercel integration add neon`. Pull environment variables down to `.env.local` via `vercel env pull`. Wire into the runner after the git step. Handle errors at each sub-step with clear messages (e.g., "Vercel auth expired — run `vercel login` and try again").

### Acceptance criteria

- [ ] A Vercel project is created and linked to the scaffolded project
- [ ] If a GitHub repo exists, the Vercel project is connected to it for automatic deployments
- [ ] A Neon database is provisioned via the Vercel integration
- [ ] `.env.local` exists with `DATABASE_URL` and other Neon connection variables
- [ ] Each sub-step (project creation, Neon provisioning, env pull) shows progress
- [ ] Failures at any sub-step produce clear error messages with suggested manual fixes

---

## Phase 6: AGENTS.md + README.md + Final Polish

**User stories**: 17, 18, 22

### What to build

Implement the agents module that writes `AGENTS.md` to the scaffolded project root, describing: the tech stack, database schema location (`db/schema.ts`), how to add tables and run migrations with `drizzle-kit`, the `DATABASE_URL` convention, and dev commands. Implement the readme module that writes `README.md` with the project name, stack description, and setup/dev instructions. Make a final git commit with these files. Display an outro summary showing everything that was created and next steps (e.g., `cd <project> && npm run dev`). Also add a `README.md` to the CLI tool repo itself describing the open-source project, features, and usage.

### Acceptance criteria

- [ ] `AGENTS.md` exists in the scaffolded project with accurate stack description, schema guidance, and migration commands
- [ ] `README.md` exists in the scaffolded project with project name, stack overview, and dev instructions
- [ ] A final git commit includes both documentation files
- [ ] The CLI displays an outro summary listing everything created (project, repo, Vercel project, Neon DB) and next steps
- [ ] The CLI tool's own repo has a `README.md` describing the tool, its features, installation, and usage
