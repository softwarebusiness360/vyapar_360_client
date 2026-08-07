import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "src/index.css"), "utf8");
const api = fs.readFileSync(path.join(root, "src/design-system/index.js"), "utf8");

const requiredTokens = [
  "--bg-base", "--bg-surface", "--bg-elevated", "--line",
  "--ink-primary", "--ink-secondary", "--ink-muted", "--brand", "--brand-hover",
];
const requiredPrimitives = [
  ".card-surface", ".card-hover", ".btn-primary", ".btn-ghost",
  ".input-field", ".tag", ".divider-x", ".glass", ".grain",
];
const requiredExports = [
  "Logo", "ThemeToggle", "Modal", "StatusBadge", "UpgradeGate",
  "Container", "PublicFooter", "NavDrawer", "NavToggle", "PublicHeader",
];

const failures = [];
for (const token of requiredTokens) {
  if (!css.includes(token)) failures.push(`missing global token ${token}`);
}
for (const primitive of requiredPrimitives) {
  if (!css.includes(primitive)) failures.push(`missing global primitive ${primitive}`);
}
for (const name of requiredExports) {
  if (!new RegExp(`\\b${name}\\b`).test(api)) failures.push(`missing public export ${name}`);
}

const featureRoot = path.join(root, "src/features");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});
for (const file of walk(featureRoot).filter((value) => value.endsWith(".css"))) {
  const source = fs.readFileSync(file, "utf8");
  if (/(^|\n)\s*:root\b|data-theme\s*=|\[data-theme/.test(source)) {
    failures.push(`feature-local theme declaration ${path.relative(root, file)}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Global design-system contract valid.");
