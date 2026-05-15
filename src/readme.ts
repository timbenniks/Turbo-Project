import { writeFileSync } from "node:fs";
import path from "node:path";
import type { WizardResult } from "./wizard.js";

type ReadmeOptions = Pick<
  WizardResult,
  "setupDrizzle" | "provisionNeon" | "linkVercel"
>;

export function writeProjectReadme(
  projectDir: string,
  projectName: string,
  options: ReadmeOptions
): void {
  const stackRows = [
    "| Framework | Next.js 16 |",
    "| Language | TypeScript |",
    "| Styling | Tailwind CSS v4 |",
    "| Components | shadcn/ui |",
    options.setupDrizzle ? "| ORM | Drizzle |" : null,
    options.provisionNeon ? "| Database | Neon (serverless Postgres) |" : null,
    options.linkVercel ? "| Hosting | Vercel |" : null,
  ]
    .filter(Boolean)
    .join("\n");

  const database = options.setupDrizzle
    ? `## Database

\`\`\`bash
# Generate migrations after schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Push schema directly (dev only)
npx drizzle-kit push

# Open Drizzle Studio
npx drizzle-kit studio
\`\`\`

Schema definitions live in \`db/schema.ts\`.
`
    : "";

  const deployment = options.linkVercel
    ? `## Deployment

Deployed automatically via Vercel on push to main.
`
    : "";

  const content = `# ${projectName}

Built with [turbo-project](https://github.com/timbenniks/Turbo-Project).

## Tech Stack

| Layer | Technology |
|-------|-----------|
${stackRows}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start the dev server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

${database}${deployment}`;

  writeFileSync(path.join(projectDir, "README.md"), content);
}
