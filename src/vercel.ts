import { execFileSync } from "node:child_process";

const TIMEOUT = 2 * 60 * 1000; // 2 minutes

export function linkVercelProject(projectDir: string): void {
  execFileSync("vercel", ["link", "--yes"], {
    cwd: projectDir,
    stdio: "inherit",
    timeout: TIMEOUT,
  });
}

export function addNeonIntegration(
  projectDir: string,
  projectName: string
): void {
  execFileSync("vercel", ["integration", "add", "neon", "--name", `${projectName}-db`], {
    cwd: projectDir,
    stdio: "inherit",
    timeout: TIMEOUT,
  });
}

export function pullEnvVars(projectDir: string): void {
  execFileSync("vercel", ["env", "pull", ".env.local"], {
    cwd: projectDir,
    stdio: "inherit",
    timeout: TIMEOUT,
  });
}
