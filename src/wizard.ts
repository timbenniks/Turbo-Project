import * as p from "@clack/prompts";
import pc from "picocolors";

export interface WizardOptions {
  name?: string;
  preset?: string;
}

export interface WizardResult {
  projectName: string;
  scaffoldProject: boolean;
  preset?: string;
  setupDrizzle: boolean;
  initGit: boolean;
  createGitHubRepo: boolean;
  repoVisibility: "public" | "private";
  linkVercel: boolean;
  provisionNeon: boolean;
  pullEnvVars: boolean;
  writeDocs: boolean;
  finalCommit: boolean;
}

export async function runWizard(options: WizardOptions): Promise<WizardResult> {
  const result = await p.group(
    {
      projectName: () =>
        options.name
          ? Promise.resolve(options.name)
          : p.text({
              message: "What is your project name?",
              placeholder: "my-awesome-app",
              validate: (value) => {
                if (!value.trim()) return "Project name is required";
                if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) && !/^[a-z0-9]$/.test(value))
                  return "Use lowercase letters, numbers, and dashes (cannot start/end with dash)";
                if (value.length > 100) return "Name too long (max 100 characters)";
              },
            }),

      scaffoldProject: () =>
        p.confirm({
          message: "Scaffold a new Next.js project with shadcn/ui?",
          initialValue: true,
        }),

      preset: () => {
        if (!options.preset) return Promise.resolve(undefined);

        const preset = options.preset.trim();
        if (!/^[a-zA-Z0-9_-]+$/.test(preset)) {
          p.log.error(
            "Preset ID should only contain letters, numbers, dashes, and underscores"
          );
          process.exit(1);
        }

        return Promise.resolve(preset);
      },

      setupDrizzle: () =>
        p.confirm({
          message: "Set up Drizzle ORM?",
          initialValue: true,
        }),

      initGit: () =>
        p.confirm({
          message: "Initialize a local git repository?",
          initialValue: true,
        }),

      createGitHubRepo: ({ results }) =>
        !results.initGit
          ? Promise.resolve(false)
          : p.confirm({
              message: `Create a GitHub repo for ${pc.cyan(results.projectName as string)}?`,
              initialValue: false,
            }),

      repoVisibility: ({ results }) =>
        !results.createGitHubRepo
          ? Promise.resolve("private" as const)
          : p.select({
              message: "Repository visibility?",
              initialValue: "private" as const,
              options: [
                { value: "private" as const, label: "Private" },
                { value: "public" as const, label: "Public" },
              ],
            }),

      linkVercel: () =>
        p.confirm({
          message: "Link a Vercel project?",
          initialValue: true,
        }),

      provisionNeon: ({ results }) =>
        !results.linkVercel
          ? Promise.resolve(false)
          : p.confirm({
              message: "Provision a Neon database through Vercel?",
              initialValue: true,
            }),

      pullEnvVars: ({ results }) =>
        !results.linkVercel
          ? Promise.resolve(false)
          : p.confirm({
              message: "Pull Vercel environment variables to .env.local?",
              initialValue: true,
            }),

      writeDocs: () =>
        p.confirm({
          message: "Generate AGENTS.md and README.md?",
          initialValue: true,
        }),

      finalCommit: ({ results }) =>
        !results.initGit
          ? Promise.resolve(false)
          : p.confirm({
              message: "Create a final commit after setup?",
              initialValue: true,
            }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      },
    }
  );

  p.note(
    [
      `${pc.bold("Project:")}      ${result.projectName}`,
      `${pc.bold("Scaffold:")}     ${result.scaffoldProject ? "Yes" : "No, use existing directory"}`,
      `${pc.bold("Preset:")}       ${result.preset ?? "shadcn defaults"}`,
      `${pc.bold("Drizzle:")}      ${result.setupDrizzle ? "Yes" : "No"}`,
      `${pc.bold("Git:")}          ${result.initGit ? "Yes" : "No"}`,
      `${pc.bold("GitHub repo:")}  ${result.createGitHubRepo ? `Yes (${result.repoVisibility})` : "No"}`,
      `${pc.bold("Vercel:")}       ${result.linkVercel ? "Yes" : "No"}`,
      `${pc.bold("Neon DB:")}      ${result.provisionNeon ? "Yes" : "No"}`,
      `${pc.bold("Env vars:")}     ${result.pullEnvVars ? "Yes" : "No"}`,
      `${pc.bold("Docs:")}         ${result.writeDocs ? "Yes" : "No"}`,
      `${pc.bold("Final commit:")} ${result.finalCommit ? "Yes" : "No"}`,
    ].join("\n"),
    "Here's the plan"
  );

  const confirmed = await p.confirm({
    message: "Look good? Let's build it!",
    initialValue: true,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  return result as WizardResult;
}
