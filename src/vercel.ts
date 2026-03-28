import { execSync } from "node:child_process";

export function linkVercelProject(projectDir: string): void {
  execSync("vercel link --yes", {
    cwd: projectDir,
    stdio: "inherit",
  });
}

export function addNeonIntegration(
  projectDir: string,
  projectName: string
): void {
  execSync(`vercel integration add neon --name ${projectName}-db`, {
    cwd: projectDir,
    stdio: "inherit",
  });
}

export function pullEnvVars(projectDir: string): void {
  execSync("vercel env pull .env.local", {
    cwd: projectDir,
    stdio: "inherit",
  });
}
