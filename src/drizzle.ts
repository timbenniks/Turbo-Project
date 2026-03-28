import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const drizzleConfig = `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`;

const schemaStarter = `import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Add your schema definitions here.
// Example:
//
// export const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   name: text("name").notNull(),
//   email: text("email").notNull().unique(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });
`;

export function setupDrizzle(projectDir: string): void {
  execSync("npm install drizzle-orm @neondatabase/serverless", {
    cwd: projectDir,
    stdio: "inherit",
  });

  execSync("npm install -D drizzle-kit", {
    cwd: projectDir,
    stdio: "inherit",
  });

  writeFileSync(path.join(projectDir, "drizzle.config.ts"), drizzleConfig);

  const dbDir = path.join(projectDir, "db");
  mkdirSync(dbDir, { recursive: true });
  writeFileSync(path.join(dbDir, "schema.ts"), schemaStarter);
}
