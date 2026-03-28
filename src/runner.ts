import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import type { WizardResult } from "./wizard.js";
import { runScaffold } from "./scaffold.js";
import { setupDrizzle } from "./drizzle.js";
import { initGit, createGitHubRepo } from "./git.js";
import { linkVercelProject, addNeonIntegration, pullEnvVars } from "./vercel.js";
import { writeAgentsMd } from "./agents.js";
import { writeProjectReadme } from "./readme.js";

export async function runSteps(result: WizardResult): Promise<string> {
  const s = p.spinner();
  const projectDir = path.resolve(process.cwd(), result.projectName);

  // Step 1: Scaffold
  s.start("Scaffolding Next.js project with shadcn/ui...");
  try {
    runScaffold(result.projectName, result.preset);
    s.stop("Project scaffolded.");
  } catch (error) {
    s.stop("Scaffolding failed.");
    try {
      rmSync(projectDir, { recursive: true, force: true });
    } catch {}
    p.log.error(
      `shadcn init failed. Make sure the preset ID "${result.preset}" is valid.`
    );
    p.log.message(`  Browse presets: https://ui.shadcn.com/create`);
    process.exit(1);
  }

  // Step 2: Drizzle
  s.start("Installing Drizzle ORM + Neon driver...");
  try {
    setupDrizzle(projectDir);
    s.stop("Drizzle ORM configured.");
  } catch (error) {
    s.stop("Drizzle setup failed.");
    p.log.error("Failed to install Drizzle packages. Check npm output above.");
    process.exit(1);
  }

  // Step 3: Git init
  s.start("Initializing git repository...");
  try {
    initGit(projectDir);
    s.stop("Git repository initialized.");
  } catch (error) {
    s.stop("Git init failed.");
    p.log.error("Failed to initialize git. Check that git is installed.");
    process.exit(1);
  }

  // Step 4: GitHub repo
  if (result.createGitHubRepo) {
    s.start(`Creating ${result.repoVisibility} GitHub repo...`);
    try {
      createGitHubRepo(projectDir, result.projectName, result.repoVisibility);
      s.stop("GitHub repo created and pushed.");
    } catch (error) {
      s.stop("GitHub repo creation failed.");
      p.log.error(
        "Failed to create GitHub repo. Make sure you're authenticated with `gh auth login`."
      );
      process.exit(1);
    }
  }

  // Step 5: Vercel link
  s.start("Linking Vercel project...");
  try {
    linkVercelProject(projectDir);
    s.stop("Vercel project linked.");
  } catch (error) {
    s.stop("Vercel link failed.");
    p.log.error(
      "Failed to link Vercel project. Make sure you're authenticated with `vercel login`."
    );
    process.exit(1);
  }

  // Step 6: Neon database
  s.start("Provisioning Neon database...");
  try {
    addNeonIntegration(projectDir, result.projectName);
    s.stop("Neon database provisioned.");
  } catch (error) {
    s.stop("Neon provisioning failed.");
    p.log.error(
      "Failed to add Neon integration. You can add it manually: `vercel integration add neon`"
    );
    process.exit(1);
  }

  // Step 7: Pull env vars
  s.start("Pulling environment variables...");
  try {
    pullEnvVars(projectDir);
    s.stop("Environment variables saved to .env.local.");
  } catch (error) {
    s.stop("Env pull failed.");
    p.log.error(
      "Failed to pull env vars. You can do it manually: `vercel env pull .env.local`"
    );
    process.exit(1);
  }

  // Step 8: Write docs
  s.start("Generating AGENTS.md and README.md...");
  try {
    writeAgentsMd(projectDir, result.projectName);
    writeProjectReadme(projectDir, result.projectName);
    s.stop("Documentation generated.");
  } catch (error) {
    s.stop("Documentation generation failed.");
    p.log.error("Failed to write AGENTS.md or README.md.");
    process.exit(1);
  }

  // Step 9: Final commit
  s.start("Committing documentation...");
  try {
    execFileSync("git", ["add", "-A"], { cwd: projectDir, stdio: "ignore", timeout: 30_000 });
    execFileSync("git", ["commit", "-m", "Add AGENTS.md, README.md, and Drizzle config"], {
      cwd: projectDir,
      stdio: "ignore",
      timeout: 30_000,
    });

    if (result.createGitHubRepo) {
      execFileSync("git", ["push"], { cwd: projectDir, stdio: "ignore", timeout: 60_000 });
    }

    s.stop("Final commit pushed.");
  } catch (error) {
    s.stop("Final commit failed.");
    p.log.warn("Could not create final commit. You can commit manually.");
  }

  return projectDir;
}
