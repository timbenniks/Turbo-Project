import { execFileSync } from "node:child_process";

const TIMEOUT = 60 * 1000; // 60 seconds

export function initGit(projectDir: string): void {
  execFileSync("git", ["init"], { cwd: projectDir, stdio: "ignore", timeout: TIMEOUT });
  execFileSync("git", ["add", "-A"], { cwd: projectDir, stdio: "ignore", timeout: TIMEOUT });
  execFileSync("git", ["commit", "-m", "Initial commit from turbo-project"], {
    cwd: projectDir,
    stdio: "ignore",
    timeout: TIMEOUT,
  });
}

export function createGitHubRepo(
  projectDir: string,
  projectName: string,
  visibility: "public" | "private"
): void {
  execFileSync(
    "gh",
    [
      "repo",
      "create",
      projectName,
      `--${visibility}`,
      "--source=.",
      "--remote=origin",
      "--push",
    ],
    { cwd: projectDir, stdio: "inherit", timeout: TIMEOUT }
  );
}
