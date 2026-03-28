import { execSync } from "node:child_process";
import * as p from "@clack/prompts";
import pc from "picocolors";

interface Tool {
  name: string;
  command: string;
  installHint: string;
  required: boolean;
}

const tools: Tool[] = [
  {
    name: "node",
    command: "node --version",
    installHint: "https://nodejs.org/",
    required: true,
  },
  {
    name: "npx",
    command: "npx --version",
    installHint: "Comes with Node.js — reinstall Node if missing",
    required: true,
  },
  {
    name: "git",
    command: "git --version",
    installHint: "https://git-scm.com/downloads",
    required: true,
  },
  {
    name: "vercel",
    command: "vercel --version",
    installHint: "npm i -g vercel",
    required: true,
  },
  {
    name: "gh",
    command: "gh --version",
    installHint: "https://cli.github.com/",
    required: false,
  },
];

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

export function runPreflight(): PreflightResult {
  const missing: Tool[] = [];
  let ghAvailable = false;

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

  if (!ghAvailable) {
    p.log.warn(
      `${pc.yellow("gh")} (GitHub CLI) not found — GitHub repo creation will be skipped.\n  Install: ${pc.cyan("https://cli.github.com/")}`
    );
  }

  return { ghAvailable };
}
