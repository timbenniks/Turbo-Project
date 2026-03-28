import gradient from "gradient-string";
import boxen from "boxen";

const title = "  TURBO PROJECT";
const tagline = "  Your speedy companion for full-stack scaffolding";

export function showBanner(): void {
  const coloredTitle = gradient(["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff"])(
    title
  );

  const coloredTagline = gradient(["#4d96ff", "#6bcb77"])(tagline);

  console.log(`\n  ${coloredTitle}\n  ${coloredTagline}\n`);
}
