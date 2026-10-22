// Writes index.json: one entry per plugin, for the website and anything
// else that wants the list. Run by .github/workflows/index.yml on main.
import { writeFileSync } from "node:fs";
import { pluginFiles, pluginIds, readManifest } from "./lib.mjs";

const REPO = "9ontheq/Wandeln-Plugins";

const plugins = [];
for (const id of pluginIds()) {
  let m;
  try {
    m = readManifest(id);
  } catch {
    continue;
  }
  plugins.push({
    id,
    name: m.name,
    type: m.type ?? "palette",
    keyword: m.keyword ?? null,
    description: m.description ?? "",
    author: m.author,
    version: m.version,
    requires: m.requires ?? [],
    url: `https://github.com/${REPO}/tree/main/plugins/${id}`,
    files: pluginFiles(id).map((f) => `https://raw.githubusercontent.com/${REPO}/main/plugins/${id}/${f}`),
  });
}

writeFileSync("index.json", `${JSON.stringify({ version: 1, plugins }, null, 2)}\n`);
console.log(`index.json: ${plugins.length} plugins`);
