import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";

export function runScaffold(projectName: string, preset: string): string {
  const targetDir = path.resolve(process.cwd(), projectName);

  if (existsSync(targetDir)) {
    p.log.error(
      `Directory ${pc.bold(projectName)} already exists. Pick a different name or remove it first.`
    );
    process.exit(1);
  }

  execSync(
    `npx shadcn@latest init --preset ${preset} --template next --name ${projectName} --yes`,
    { stdio: "inherit" }
  );

  return targetDir;
}
