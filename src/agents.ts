import { writeFileSync } from "node:fs";
import path from "node:path";
import type { WizardResult } from "./wizard.js";

type AgentsOptions = Pick<
  WizardResult,
  "setupDrizzle" | "provisionNeon" | "linkVercel"
>;

export function writeAgentsMd(
  projectDir: string,
  projectName: string,
  options: AgentsOptions
): void {
  const stack = [
    "- **Framework:** Next.js 16 (App Router)",
    "- **Language:** TypeScript",
    "- **Styling:** Tailwind CSS v4",
    "- **Components:** shadcn/ui primitives",
    options.setupDrizzle ? "- **ORM:** Drizzle ORM" : null,
    options.provisionNeon
      ? "- **Database:** Neon (serverless Postgres), connected via Vercel integration"
      : null,
    options.linkVercel ? "- **Hosting:** Vercel" : null,
  ]
    .filter(Boolean)
    .join("\n");

  const structure = [
    "- `app/` - Next.js App Router pages and layouts",
    "- `components/` - shadcn/ui and custom components",
    options.setupDrizzle ? "- `db/schema.ts` - Drizzle ORM schema definitions" : null,
    options.setupDrizzle ? "- `drizzle.config.ts` - Drizzle Kit configuration" : null,
    options.provisionNeon ? "- `.env.local` - Environment variables (DATABASE_URL, etc.)" : null,
  ]
    .filter(Boolean)
    .join("\n");

  const database = options.setupDrizzle
    ? `## Database

### Connection

The database connection string is stored in the \`DATABASE_URL\` environment variable.${
        options.provisionNeon
          ? " It is set by the Vercel + Neon integration and pulled to `.env.local` for local development."
          : ""
      }

The Neon serverless driver (\`@neondatabase/serverless\`) is installed for use with Drizzle ORM.

### Schema

Define your database tables in \`db/schema.ts\`. Example:

\`\`\`ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
\`\`\`

### Migrations

\`\`\`bash
npx drizzle-kit generate
npx drizzle-kit migrate
npx drizzle-kit push
npx drizzle-kit studio
\`\`\`
`
    : "";

  const deployment = options.linkVercel
    ? `## Deployment

The project is deployed automatically via Vercel on push to the main branch.
`
    : "";

  const content = `# AGENTS.md

This file describes the project setup for LLM coding assistants.

## Tech Stack

${stack}

## Project Structure

${structure}

${database}## Development

\`\`\`bash
npm run dev
\`\`\`

${deployment}`;

  writeFileSync(path.join(projectDir, "AGENTS.md"), content);
}
