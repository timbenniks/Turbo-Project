import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import type { WizardResult } from "./wizard.js";

interface Tool {
  name: string;
  command: string;
  installHint: string;
  required: boolean;
}

const toolRegistry: Record<string, Tool> = {
  node: {
    name: "node",
    command: "node --version",
    installHint: "https://nodejs.org/",
    required: true,
  },
  npx: {
    name: "npx",
    command: "npx --version",
    installHint: "Comes with Node.js — reinstall Node if missing",
    required: true,
  },
  npm: {
    name: "npm",
    command: "npm --version",
    installHint: "Comes with Node.js — reinstall Node if missing",
    required: true,
  },
  git: {
    name: "git",
    command: "git --version",
    installHint: "https://git-scm.com/downloads",
    required: true,
  },
  vercel: {
    name: "vercel",
    command: "vercel --version",
    installHint: "npm i -g vercel",
    required: true,
  },
  gh: {
    name: "gh",
    command: "gh --version",
    installHint: "https://cli.github.com/",
    required: true,
  },
};

const baselineTools: Tool[] = [toolRegistry.node, toolRegistry.npx];

function isAvailable(command: string): boolean {
  try {
    execSync(command, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export interface PreflightResult {
  ghAvailable: boolean;
}

function uniqueTools(tools: Tool[]): Tool[] {
  return Array.from(new Map(tools.map((tool) => [tool.name, tool])).values());
}

function toolsForPlan(plan: WizardResult): Tool[] {
  const tools = [...baselineTools];

  if (plan.scaffoldProject) tools.push(toolRegistry.npx);
  if (plan.setupDrizzle) tools.push(toolRegistry.npm);
  if (plan.initGit || plan.finalCommit) tools.push(toolRegistry.git);
  if (plan.createGitHubRepo) tools.push(toolRegistry.gh);
  if (plan.linkVercel || plan.provisionNeon || plan.pullEnvVars) {
    tools.push(toolRegistry.vercel);
  }

  return uniqueTools(tools);
}

function validateProjectDirectory(plan: WizardResult): void {
  const targetDir = path.resolve(process.cwd(), plan.projectName);
  const exists = existsSync(targetDir);

  if (plan.scaffoldProject && exists) {
    p.log.error(
      `Directory ${pc.bold(plan.projectName)} already exists. Pick a different name or skip scaffolding to use it.`
    );
    process.exit(1);
  }

  if (!plan.scaffoldProject && !exists) {
    p.log.error(
      `Directory ${pc.bold(plan.projectName)} does not exist. Enable scaffolding or create it first.`
    );
    process.exit(1);
  }
}

export function runPreflight(plan?: WizardResult): PreflightResult {
  const missing: Tool[] = [];
  let ghAvailable = false;
  const tools = plan ? toolsForPlan(plan) : baselineTools;

  if (plan) {
    validateProjectDirectory(plan);
  }

  p.log.message(`Checking required tools: ${tools.map((tool) => tool.name).join(", ")}`);

  for (const tool of tools) {
    const available = isAvailable(tool.command);

    if (tool.name === "gh") {
      ghAvailable = available;
    }

    if (!available && tool.required) {
      missing.push(tool);
    }
  }

  if (missing.length > 0) {
    p.log.error(pc.red("Missing required tools:"));
    for (const tool of missing) {
      p.log.message(`  ${pc.bold(tool.name)} — install: ${pc.cyan(tool.installHint)}`);
    }
    process.exit(1);
  }

  if (!plan && !ghAvailable) {
    p.log.warn(
      `${pc.yellow("gh")} (GitHub CLI) not found — GitHub repo creation will be skipped.\n  Install: ${pc.cyan("https://cli.github.com/")}`
    );
  }

  return { ghAvailable };
}
