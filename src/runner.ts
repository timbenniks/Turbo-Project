import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import type { WizardResult } from "./wizard.js";
import { runScaffold } from "./scaffold.js";
import { setupDrizzle } from "./drizzle.js";
import { initGit, createGitHubRepo, getGitHubUsername } from "./git.js";
import { linkVercelProject, addNeonIntegration, pullEnvVars } from "./vercel.js";
import { writeAgentsMd } from "./agents.js";
import { writeProjectReadme } from "./readme.js";

export interface RunResult {
  projectDir: string;
  gitHubUrl: string | null;
}

function logStep(message: string): void {
  p.log.message(`  ${message}`);
}

function cleanupProject(projectDir: string, shouldCleanup: boolean): void {
  if (!shouldCleanup) return;

  try {
    rmSync(projectDir, { recursive: true, force: true });
    p.log.warn(`Removed incomplete project directory: ${projectDir}`);
  } catch {
    p.log.warn(`Could not remove incomplete project directory: ${projectDir}`);
  }
}

export async function runSteps(result: WizardResult): Promise<RunResult> {
  const s = p.spinner();
  const projectDir = path.resolve(process.cwd(), result.projectName);
  const shouldCleanupOnFailure = result.scaffoldProject;

  // Step 1: Scaffold
  if (result.scaffoldProject) {
    s.start("Scaffolding Next.js project with shadcn/ui...");
    logStep(
      result.preset
        ? `Running shadcn init with custom preset ${result.preset}.`
        : "Running shadcn init with shadcn defaults."
    );
    try {
      const scaffold = runScaffold(result.projectName, result.preset);
      s.stop(
        scaffold.presetApplied
          ? "Project scaffolded with custom preset."
          : "Project scaffolded with shadcn defaults."
      );
    } catch (error) {
      s.stop("Scaffolding failed.");
      cleanupProject(projectDir, shouldCleanupOnFailure);
      p.log.error("shadcn init failed. Check the npm and shadcn output above.");
      if (result.preset) {
        p.log.message(
          `  The custom preset "${result.preset}" was tried first, then shadcn defaults were tried.`
        );
      }
      process.exit(1);
    }
  } else {
    p.log.message(`Skipping shadcn scaffold. Using existing directory: ${projectDir}`);
    if (!existsSync(projectDir)) {
      p.log.error(`Project directory does not exist: ${projectDir}`);
      process.exit(1);
    }
  }

  // Step 2: Drizzle
  if (result.setupDrizzle) {
    s.start("Installing Drizzle ORM + Neon driver...");
    logStep("Installing runtime packages: drizzle-orm, @neondatabase/serverless.");
    logStep("Installing dev package: drizzle-kit.");
    logStep("Writing drizzle.config.ts and db/schema.ts.");
    try {
      setupDrizzle(projectDir);
      s.stop("Drizzle ORM configured.");
    } catch (error) {
      s.stop("Drizzle setup failed.");
      cleanupProject(projectDir, shouldCleanupOnFailure);
      p.log.error("Failed to install Drizzle packages. Check npm output above.");
      process.exit(1);
    }
  } else {
    p.log.message("Skipping Drizzle ORM setup.");
  }

  // Step 3: Git init
  if (result.initGit) {
    s.start("Initializing git repository...");
    logStep("Running git init, git add -A, and the initial commit.");
    try {
      initGit(projectDir);
      s.stop("Git repository initialized.");
    } catch (error) {
      s.stop("Git init failed.");
      cleanupProject(projectDir, shouldCleanupOnFailure);
      p.log.error("Failed to initialize git. Check that git is installed and configured.");
      process.exit(1);
    }
  } else {
    p.log.message("Skipping local git initialization.");
  }

  // Step 4: GitHub repo
  let gitHubUrl: string | null = null;
  if (result.createGitHubRepo) {
    s.start(`Creating ${result.repoVisibility} GitHub repo...`);
    logStep("Running gh repo create with origin remote and push enabled.");
    try {
      createGitHubRepo(projectDir, result.projectName, result.repoVisibility);
      const username = getGitHubUsername();
      gitHubUrl = username ? `https://github.com/${username}/${result.projectName}` : null;
      s.stop("GitHub repo created and pushed.");
    } catch (error) {
      s.stop("GitHub repo creation failed.");
      cleanupProject(projectDir, shouldCleanupOnFailure);
      p.log.error(
        "Failed to create GitHub repo. Make sure you're authenticated with `gh auth login`."
      );
      process.exit(1);
    }
  } else {
    p.log.message("Skipping GitHub repository creation.");
  }

  // Step 5: Vercel link
  if (result.linkVercel) {
    s.start("Linking Vercel project...");
    logStep("Running vercel link --yes.");
    try {
      linkVercelProject(projectDir);
      s.stop("Vercel project linked.");
    } catch (error) {
      s.stop("Vercel link failed.");
      cleanupProject(projectDir, shouldCleanupOnFailure);
      p.log.error(
        "Failed to link Vercel project. Make sure you're authenticated with `vercel login`."
      );
      process.exit(1);
    }
  } else {
    p.log.message("Skipping Vercel project link.");
  }

  // Step 6: Neon database
  if (result.provisionNeon) {
    s.start("Provisioning Neon database...");
    logStep(`Running vercel integration add neon --name ${result.projectName}-db.`);
    try {
      addNeonIntegration(projectDir, result.projectName);
      s.stop("Neon database provisioned.");
    } catch (error) {
      s.stop("Neon provisioning failed.");
      cleanupProject(projectDir, shouldCleanupOnFailure);
      p.log.error(
        "Failed to add Neon integration. You can add it manually: `vercel integration add neon`"
      );
      process.exit(1);
    }
  } else {
    p.log.message("Skipping Neon database provisioning.");
  }

  // Step 7: Pull env vars
  if (result.pullEnvVars) {
    s.start("Pulling environment variables...");
    logStep("Running vercel env pull .env.local.");
    try {
      pullEnvVars(projectDir);
      s.stop("Environment variables saved to .env.local.");
    } catch (error) {
      s.stop("Env pull failed.");
      cleanupProject(projectDir, shouldCleanupOnFailure);
      p.log.error(
        "Failed to pull env vars. You can do it manually: `vercel env pull .env.local`"
      );
      process.exit(1);
    }
  } else {
    p.log.message("Skipping environment variable pull.");
  }

  // Step 8: Write docs
  if (result.writeDocs) {
    s.start("Generating AGENTS.md and README.md...");
    logStep("Writing AGENTS.md.");
    logStep("Writing README.md.");
    try {
      writeAgentsMd(projectDir, result.projectName, result);
      writeProjectReadme(projectDir, result.projectName, result);
      s.stop("Documentation generated.");
    } catch (error) {
      s.stop("Documentation generation failed.");
      cleanupProject(projectDir, shouldCleanupOnFailure);
      p.log.error("Failed to write AGENTS.md or README.md.");
      process.exit(1);
    }
  } else {
    p.log.message("Skipping documentation generation.");
  }

  // Step 9: Final commit
  if (result.finalCommit) {
    s.start("Creating final setup commit...");
    logStep("Running git add -A and git commit for selected setup changes.");
    try {
      execFileSync("git", ["add", "-A"], { cwd: projectDir, stdio: "inherit", timeout: 30_000 });
      execFileSync("git", ["commit", "-m", "Apply selected turbo-project setup"], {
        cwd: projectDir,
        stdio: "inherit",
        timeout: 30_000,
      });

      if (result.createGitHubRepo) {
        logStep("Pushing final commit to GitHub.");
        execFileSync("git", ["push"], { cwd: projectDir, stdio: "inherit", timeout: 60_000 });
      }

      s.stop(result.createGitHubRepo ? "Final commit pushed." : "Final commit created.");
    } catch (error) {
      s.stop("Final commit failed.");
      p.log.warn("Could not create final commit. You can commit manually.");
    }
  } else {
    p.log.message("Skipping final setup commit.");
  }

  return { projectDir, gitHubUrl };
}
