import { writeFileSync } from "node:fs";
import path from "node:path";

export function writeAgentsMd(projectDir: string, projectName: string): void {
  const content = `# AGENTS.md

This file describes the project setup for LLM coding assistants.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui primitives
- **ORM:** Drizzle ORM
- **Database:** Neon (serverless Postgres), connected via Vercel integration
- **Hosting:** Vercel

## Project Structure

- \`app/\` — Next.js App Router pages and layouts
- \`components/\` — shadcn/ui and custom components
- \`db/schema.ts\` — Drizzle ORM schema definitions
- \`drizzle.config.ts\` — Drizzle Kit configuration
- \`.env.local\` — Environment variables (DATABASE_URL, etc.)

## Database

### Connection

The database connection string is stored in the \`DATABASE_URL\` environment variable. It is automatically set by the Vercel + Neon integration and pulled to \`.env.local\` for local development.

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

Generate migrations after changing the schema:

\`\`\`bash
npx drizzle-kit generate
\`\`\`

Apply migrations to the database:

\`\`\`bash
npx drizzle-kit migrate
\`\`\`

Push schema changes directly (development only):

\`\`\`bash
npx drizzle-kit push
\`\`\`

Open Drizzle Studio to browse the database:

\`\`\`bash
npx drizzle-kit studio
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Deployment

The project is deployed automatically via Vercel on push to the main branch.
`;

  writeFileSync(path.join(projectDir, "AGENTS.md"), content);
}
