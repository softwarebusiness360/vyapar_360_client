import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const featureRoot = path.join(root, "src/features");
const files = [];
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
  const next = path.join(directory, entry.name);
  if (entry.isDirectory()) walk(next);
  else if (/\.(?:js|jsx)$/.test(next) && !next.includes(".test.")) files.push(next);
});
walk(featureRoot);

const forbidden = [["vendor", "customer"], ["customer", "vendor"], ["restaurant", "salon"], ["salon", "restaurant"]];
const violations = [];
for (const file of files) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const source = fs.readFileSync(file, "utf8");
  const imports = [...source.matchAll(/(?:from\s+|import\s*\()["']([^"']+)["']/g)].map((match) => match[1]);
  for (const [owner, other] of forbidden) {
    if (!relative.split("/").includes(owner)) continue;
    for (const specifier of imports) {
      if (specifier.split("/").includes(other)) violations.push({ file: relative, owner, forbidden: other, specifier });
    }
  }
}
if (violations.length) {
  console.error(JSON.stringify(violations, null, 2));
  process.exit(1);
}
console.log(`Feature boundaries valid (${files.length} files checked).`);
