# @timbenniks/turbo-project

Go from zero to a fully deployed full-stack app in one command.

`turbo-project` is an interactive CLI that scaffolds a complete project, provisions infrastructure, and leaves you ready to `npm run dev` — no manual wiring required.

## Quick Start

```bash
npx @timbenniks/turbo-project
```

The wizard collects the full plan first, checks only the tools needed for the
steps you selected, then executes the setup.

You can also skip prompts with flags:

```bash
npx @timbenniks/turbo-project --name my-app
```

## What You Get

Depending on what you select, `turbo-project` can set up:

- **Next.js 16** with TypeScript and Tailwind CSS v4
- **shadcn/ui** components using the stable default scaffold, with optional custom preset support
- **Drizzle ORM** with a starter schema and config
- **Neon** serverless Postgres database, provisioned and connected
- **Vercel** project linked to your repo with automatic deployments
- **GitHub** repository (optional, public or private)
- **Environment variables** synced to `.env.local`
- **AGENTS.md** so LLM coding assistants understand your project out of the box

```
my-app/
├── app/                # Next.js App Router
├── components/         # shadcn/ui components
├── db/
│   └── schema.ts       # Drizzle schema (starter file)
├── drizzle.config.ts   # Drizzle config (reads DATABASE_URL)
├── .env.local          # Neon connection strings (auto-generated)
├── AGENTS.md           # LLM-friendly project documentation
├── README.md           # Project readme
└── ...                 # Standard Next.js files
```

Every step is optional. You can scaffold a fresh project, or skip scaffolding
and run selected setup steps against an existing directory with the same name.

## How It Works

1. **Wizard** — Collects project name and optional setup steps
2. **Conditional preflight** — Checks only the CLIs required by selected steps
3. **Scaffold** — Optionally runs `shadcn init` with defaults or a custom preset
4. **Drizzle** — Optionally installs Drizzle and writes starter database files
5. **Git + GitHub** — Optionally initializes git, creates a remote, and pushes
6. **Vercel + Neon** — Optionally links Vercel, provisions Neon, and pulls env vars
7. **Documentation** — Optionally generates `AGENTS.md` and `README.md`

If a selected step fails after creating a new project, the CLI removes the local
project directory so you do not end up with a half-finished local scaffold. If
you chose to run against an existing directory, it will not delete that
directory.

## Prerequisites

| Tool | Required | Install |
|------|----------|---------|
| [Node.js](https://nodejs.org/) v18+ | Yes | [nodejs.org](https://nodejs.org/) |
| [Git](https://git-scm.com/) | Only for Git/GitHub/final commit | [git-scm.com](https://git-scm.com/downloads) |
| [Vercel CLI](https://vercel.com/docs/cli) | Only for Vercel/Neon/env vars | `npm i -g vercel` |
| [GitHub CLI](https://cli.github.com/) | Only for GitHub repo creation | [cli.github.com](https://cli.github.com/) |

The CLI reports missing tools after you confirm the plan, so skipped steps do
not require their tools to be installed.

## Customizing shadcn/ui

By default, `turbo-project` uses shadcn/ui's built-in defaults. If you already have a working preset ID, pass it with `--preset`:

```bash
npx @timbenniks/turbo-project --name my-app --preset yourPresetId
```

If the custom preset cannot be applied, the CLI retries with shadcn defaults so project creation can continue.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| ORM | Drizzle |
| Database | Neon (serverless Postgres) |
| Hosting | Vercel |

## Contributing

```bash
git clone https://github.com/timbenniks/Turbo-Project.git
cd Turbo-Project
npm install
npm run build
npx .
```

## License

MIT
