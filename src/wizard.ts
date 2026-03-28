import * as p from "@clack/prompts";
import pc from "picocolors";

export interface WizardOptions {
  name?: string;
  preset?: string;
  ghAvailable: boolean;
}

export interface WizardResult {
  projectName: string;
  preset: string;
  createGitHubRepo: boolean;
  repoVisibility: "public" | "private";
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
                if (!/^[a-z0-9-]+$/.test(value))
                  return "Use lowercase letters, numbers, and dashes only";
              },
            }),

      preset: () =>
        options.preset && options.preset !== "b5KJfbd9k"
          ? Promise.resolve(options.preset)
          : p.text({
              message: `shadcn/ui preset ID ${pc.dim(`(browse: https://ui.shadcn.com/create)`)}`,
              placeholder: "b5KJfbd9k",
              defaultValue: "b5KJfbd9k",
              initialValue: options.preset ?? "b5KJfbd9k",
            }),

      createGitHubRepo: ({ results }) =>
        !options.ghAvailable
          ? Promise.resolve(false)
          : p.confirm({
              message: `Create a GitHub repo for ${pc.cyan(results.projectName as string)}?`,
              initialValue: true,
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
      `${pc.bold("Preset:")}       ${result.preset}`,
      `${pc.bold("GitHub repo:")}  ${result.createGitHubRepo ? `Yes (${result.repoVisibility})` : "No"}`,
      `${pc.bold("Vercel:")}       Yes`,
      `${pc.bold("Neon DB:")}      Yes`,
      `${pc.bold("Drizzle ORM:")} Yes`,
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
