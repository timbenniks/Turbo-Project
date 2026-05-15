#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Command } from "commander";
import * as p from "@clack/prompts";
import { showBanner } from "../src/banner.js";
import { runPreflight } from "../src/preflight.js";
import { runWizard } from "../src/wizard.js";
import { runSteps } from "../src/runner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "../../package.json"), "utf-8"));

const program = new Command();

program
  .name("turbo-project")
  .description(
    "A whimsical CLI that scaffolds your full-stack project in one command"
  )
  .version(pkg.version)
  .option("-n, --name <name>", "Project name")
  .option(
    "-p, --preset <id>",
    "Optional shadcn/ui preset ID. If omitted, shadcn defaults are used."
  )
  .action(async (options) => {
    showBanner();

    p.intro("Let's scaffold your project!");

    const result = await runWizard({
      name: options.name,
      preset: options.preset,
    });

    runPreflight(result);

    const { gitHubUrl } = await runSteps(result);

    p.note(
      [
        `Project:     ${result.projectName}`,
        `Scaffold:    ${result.scaffoldProject ? "created" : "skipped"}`,
        `Drizzle:     ${result.setupDrizzle ? "configured" : "skipped"}`,
        `Git:         ${result.initGit ? "initialized" : "skipped"}`,
        `GitHub:      ${gitHubUrl ?? "skipped"}`,
        `Vercel:      ${result.linkVercel ? "linked" : "skipped"}`,
        `Database:    ${result.provisionNeon ? "Neon provisioned" : "skipped"}`,
        `Env vars:    ${result.pullEnvVars ? ".env.local" : "skipped"}`,
        `Docs:        ${result.writeDocs ? "AGENTS.md, README.md" : "skipped"}`,
        "",
        `Next steps:`,
        `  cd ${result.projectName}`,
        `  npm run dev`,
      ].join("\n"),
      "All done!"
    );

    p.outro("Happy building!");
  });

program.parse();
