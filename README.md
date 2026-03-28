# @timbenniks/turbo-project

Go from zero to a fully deployed full-stack app in one command.

`turbo-project` is an interactive CLI that scaffolds a complete project, provisions infrastructure, and leaves you ready to `npm run dev` — no manual wiring required.

## Quick Start

```bash
npx @timbenniks/turbo-project
```

That's it. The wizard handles everything else.

You can also skip prompts with flags:

```bash
npx @timbenniks/turbo-project --name my-app --preset b5KJfbd9k
```

## What You Get

In under two minutes, `turbo-project` sets up:

- **Next.js 16** with TypeScript and Tailwind CSS v4
- **shadcn/ui** components via a customizable preset
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

## How It Works

1. **Preflight** — Checks that required tools are installed (`node`, `git`, `vercel`, optionally `gh`)
2. **Wizard** — Prompts for project name, shadcn/ui preset, and GitHub preferences
3. **Scaffold** — Runs `shadcn init` with your chosen preset and Next.js template
4. **Drizzle** — Installs `drizzle-orm`, `drizzle-kit`, and the Neon serverless driver
5. **Git + GitHub** — Initializes a repo, optionally creates a GitHub remote and pushes
6. **Vercel + Neon** — Creates a Vercel project, provisions a Neon database, pulls env vars
7. **Documentation** — Generates `AGENTS.md` and `README.md` with your stack details

## Prerequisites

| Tool | Required | Install |
|------|----------|---------|
| [Node.js](https://nodejs.org/) v18+ | Yes | [nodejs.org](https://nodejs.org/) |
| [Git](https://git-scm.com/) | Yes | [git-scm.com](https://git-scm.com/downloads) |
| [Vercel CLI](https://vercel.com/docs/cli) | Yes | `npm i -g vercel` |
| [GitHub CLI](https://cli.github.com/) | No | [cli.github.com](https://cli.github.com/) |

The GitHub CLI is only needed if you want to create a GitHub repo during setup. Everything else works without it.

## Customizing the Preset

By default, `turbo-project` uses the shadcn/ui preset `b5KJfbd9k`. You can create your own preset at [ui.shadcn.com/create](https://ui.shadcn.com/create) and pass it during setup — the wizard will prompt you, or use the `--preset` flag.

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
