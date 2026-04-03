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
    "shadcn/ui preset ID",
    "b5KJfbd9k"
  )
  .action(async (options) => {
    showBanner();

    p.intro("Let's scaffold your project!");

    const { ghAvailable } = runPreflight();

    const result = await runWizard({
      name: options.name,
      preset: options.preset,
      ghAvailable,
    });

    const { gitHubUrl } = await runSteps(result);

    p.note(
      [
        `Project:     ${result.projectName}`,
        `GitHub:      ${gitHubUrl ?? "skipped"}`,
        `Vercel:      linked`,
        `Database:    Neon (provisioned)`,
        `Env vars:    .env.local`,
        `Docs:        AGENTS.md, README.md`,
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
