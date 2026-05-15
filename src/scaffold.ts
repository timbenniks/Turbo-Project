import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";

const TIMEOUT = 5 * 60 * 1000; // 5 minutes

export interface ScaffoldResult {
  targetDir: string;
  presetApplied: boolean;
}

function runShadcnInit(projectName: string, preset?: string): void {
  const args = [
    "--yes",
    "shadcn@latest",
    "init",
    "--name",
    projectName,
    "--yes",
  ];

  if (preset) {
    args.push("--preset", preset, "--template", "next");
  } else {
    args.push("--defaults");
  }

  execFileSync("npx", args, { stdio: "inherit", timeout: TIMEOUT });
}

export function runScaffold(projectName: string, preset?: string): ScaffoldResult {
  const targetDir = path.resolve(process.cwd(), projectName);

  if (existsSync(targetDir)) {
    p.log.error(
      `Directory ${pc.bold(projectName)} already exists. Pick a different name or remove it first.`
    );
    process.exit(1);
  }

  if (!preset) {
    runShadcnInit(projectName);
    return { targetDir, presetApplied: false };
  }

  try {
    runShadcnInit(projectName, preset);
    return { targetDir, presetApplied: true };
  } catch (error) {
    rmSync(targetDir, { recursive: true, force: true });
    p.log.warn(
      `Could not apply shadcn/ui preset ${pc.bold(preset)}. Retrying with shadcn defaults.`
    );
    runShadcnInit(projectName);
    return { targetDir, presetApplied: false };
  }
}
