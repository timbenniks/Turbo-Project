#!/usr/bin/env node

import { Command } from "commander";
import * as p from "@clack/prompts";
import { showBanner } from "../src/banner.js";
import { runPreflight } from "../src/preflight.js";
import { runWizard } from "../src/wizard.js";
import { runSteps } from "../src/runner.js";

const program = new Command();

program
  .name("turbo-project")
  .description(
    "A whimsical CLI that scaffolds your full-stack project in one command"
  )
  .version("0.1.0")
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

    const projectDir = await runSteps(result);

    p.note(
      [
        `Project:     ${result.projectName}`,
        `GitHub:      ${result.createGitHubRepo ? `https://github.com/${result.projectName}` : "skipped"}`,
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
