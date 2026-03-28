# @timbenniks/turbo-project

A whimsical CLI tool that scaffolds your entire full-stack project in one command. Meet the turbo-snail — your speedy companion for going from zero to deployed.

## What it does

`turbo-project` runs an interactive wizard that sets up a complete project with your preferred stack:

- **Next.js 16** with TypeScript and Tailwind v4
- **shadcn/ui** primitives (with customizable presets)
- **Drizzle ORM** with Neon serverless Postgres
- **Vercel** project with automatic deployments
- **Neon** database provisioned and connected
- **GitHub** repo (optional, public or private)

All wired together with environment variables synced locally, ready to `npm run dev`.

## Features

- Interactive wizard powered by [@clack/prompts](https://github.com/bombshell-dev/clack) — no flags to memorize
- Preflight checks for required tools (`vercel`, `gh`) with clear install instructions
- Customizable shadcn/ui preset (default or bring your own from [ui.shadcn.com/create](https://ui.shadcn.com/create))
- Drizzle ORM setup with `drizzle.config.ts` and starter `db/schema.ts`
- GitHub repo creation with visibility choice (public/private)
- Vercel project creation linked to your GitHub repo
- Neon Postgres database provisioned via the Vercel integration
- Environment variables pulled to `.env.local` automatically
- `AGENTS.md` generated for LLM coding assistants to understand the project
- `README.md` generated with stack overview and dev instructions
- Fun turbo-snail mascot with gradient colors

## Usage

```bash
npx @timbenniks/turbo-project
```

Or with flags to skip prompts:

```bash
npx @timbenniks/turbo-project --name my-app --preset b5KJfbd9k
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Vercel CLI](https://vercel.com/docs/cli) — `npm i -g vercel`
- [GitHub CLI](https://cli.github.com/) — only needed if you want to create a GitHub repo

## What gets scaffolded

```
my-app/
├── app/              # Next.js app directory
├── components/       # shadcn/ui components
├── db/
│   └── schema.ts     # Drizzle schema (starter file)
├── drizzle.config.ts # Drizzle config (reads DATABASE_URL)
├── .env.local        # Neon connection strings (auto-generated)
├── AGENTS.md         # LLM-friendly project documentation
├── README.md         # Project readme
└── ...               # Standard Next.js files
```

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| ORM | Drizzle |
| Database | Neon (serverless Postgres) |
| Hosting | Vercel |

## Development

```bash
# Clone the repo
git clone https://github.com/timbenniks/Turbo-Project.git
cd Turbo-Project

# Install dependencies
npm install

# Build
npm run build

# Test locally
npx .
```

## License

MIT
