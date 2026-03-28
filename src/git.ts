import { execSync } from "node:child_process";

export function initGit(projectDir: string): void {
  execSync("git init", { cwd: projectDir, stdio: "ignore" });
  execSync("git add -A", { cwd: projectDir, stdio: "ignore" });
  execSync('git commit -m "Initial commit from turbo-project"', {
    cwd: projectDir,
    stdio: "ignore",
  });
}

export function createGitHubRepo(
  projectDir: string,
  projectName: string,
  visibility: "public" | "private"
): void {
  execSync(
    `gh repo create ${projectName} --${visibility} --source=. --remote=origin --push`,
    { cwd: projectDir, stdio: "inherit" }
  );
}
