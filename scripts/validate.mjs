// CI check for plugin PRs (and a local check: `node scripts/validate.mjs`).
// Validates every plugin's format, and — when BASE_SHA is set (CI) — that
// the PR touches exactly one plugin and, for an existing plugin, warns when
// the PR author isn't the plugin's author. Never executes plugin code.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname, join } from "node:path";
import {
  GITHUB_NAME_PATTERN,
  ID_PATTERN,
  MAX_FILE_BYTES,
  MAX_PLUGIN_BYTES,
  PLUGINS_DIR,
  REQUIRES,
  SCRIPT_EXTENSIONS,
  TYPES,
  VERSION_PATTERN,
  fileSize,
  pluginFiles,
  pluginIds,
  readManifest,
} from "./lib.mjs";

const errors = [];
const warnings = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);

// ---- per-plugin format ------------------------------------------------------

const keywords = new Map();
const manifests = new Map();

for (const id of pluginIds()) {
  if (!ID_PATTERN.test(id)) fail(id, "folder name must be lowercase letters, digits and hyphens (2–40 characters)");

  let m;
  try {
    m = readManifest(id);
  } catch (err) {
    fail(id, err.message);
    continue;
  }
  manifests.set(id, m);

  if (m.id !== id) fail(id, `id in plugin.json ("${m.id}") must match the folder name`);
  for (const key of ["name", "command", "description", "author", "version"]) {
    if (typeof m[key] !== "string" || !m[key].trim()) fail(id, `${key} is required`);
  }
  if (m.type !== undefined && !TYPES.includes(m.type)) fail(id, `type must be ${TYPES.join(" or ")}`);
  if (typeof m.author === "string" && !GITHUB_NAME_PATTERN.test(m.author)) fail(id, "author must be a GitHub username");
  if (typeof m.version === "string" && !VERSION_PATTERN.test(m.version)) fail(id, "version must look like 1.0.0");
  if (m.keyword !== undefined) {
    if (typeof m.keyword !== "string" || !/^\S{1,20}$/.test(m.keyword)) {
      fail(id, "keyword must be at most 20 characters with no spaces");
    } else if (keywords.has(m.keyword)) {
      fail(id, `keyword "${m.keyword}" is already used by ${keywords.get(m.keyword)}`);
    } else {
      keywords.set(m.keyword, id);
    }
  }
  if (m.interval !== undefined) {
    if (m.type !== "bar") fail(id, "interval is only for type: bar");
    else if (!Number.isInteger(m.interval) || m.interval < 2) fail(id, "interval must be an integer of at least 2 (seconds)");
  }
  if (m.requires !== undefined && (!Array.isArray(m.requires) || m.requires.some((r) => !REQUIRES.includes(r)))) {
    fail(id, `requires may only contain ${REQUIRES.join(", ")}`);
  }

  const files = pluginFiles(id);
  if (typeof m.command === "string") {
    if (m.command.includes("/") || m.command.includes("\\") || m.command.startsWith(".")) {
      fail(id, "command must be a plain file name in the plugin folder");
    } else if (!files.includes(m.command)) {
      fail(id, `command file ${m.command} is missing`);
    } else if (!SCRIPT_EXTENSIONS.includes(extname(m.command).toLowerCase())) {
      fail(id, `command must be one of ${SCRIPT_EXTENSIONS.join(" ")}`);
    }
  }
  if (!files.includes("README.md")) fail(id, "README.md is required");

  let total = 0;
  for (const file of files) {
    const size = fileSize(id, file);
    total += size;
    if (size > MAX_FILE_BYTES) fail(id, `${file} is over 256 KB`);
    const ext = extname(file).toLowerCase();
    const isImage = [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext);
    if (!isImage && readFileSync(join(PLUGINS_DIR, id, file)).includes(0)) {
      fail(id, `${file} looks binary (scripts and text only)`);
    }
    if ([".exe", ".dll", ".msi", ".scr", ".com", ".vbs", ".lnk"].includes(ext)) fail(id, `${file} is a file type that isn't accepted`);
  }
  if (total > MAX_PLUGIN_BYTES) fail(id, "plugin is over 1 MB in total");
}

// ---- PR scope (CI only) -------------------------------------------------------

const base = process.env.BASE_SHA;
if (base) {
  const changed = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  const outside = changed.filter((f) => !f.startsWith(`${PLUGINS_DIR}/`));
  if (outside.length) errors.push(`only files under plugins/ may be changed: ${outside.join(", ")}`);
  const touched = [...new Set(changed.filter((f) => f.startsWith(`${PLUGINS_DIR}/`)).map((f) => f.split("/")[1]))];
  if (touched.length > 1) errors.push(`a pull request may change only one plugin (${touched.join(", ")})`);

  const author = process.env.PR_AUTHOR;
  for (const id of touched) {
    let before = null;
    try {
      before = JSON.parse(execFileSync("git", ["show", `${base}:${PLUGINS_DIR}/${id}/plugin.json`], { encoding: "utf8" }));
    } catch {
      // New plugin.
    }
    const now = manifests.get(id);
    if (!before) {
      if (now && author && now.author !== author) {
        errors.push(`${id}: author of a new plugin ("${now.author}") must be the PR author (${author})`);
      }
      continue;
    }
    if (author && before.author !== author) {
      warnings.push(`${id}: changed by someone other than its author (${before.author}) — check the author agrees`);
    }
    if (now && before.author !== now.author) warnings.push(`${id}: author changed from ${before.author} to ${now.author}`);
    if (now && now.version === before.version) errors.push(`${id}: bump version when updating`);
  }
}

// ---- report -----------------------------------------------------------------

for (const w of warnings) console.log(`::warning::${w}`);
for (const e of errors) console.log(`::error::${e}`);
if (errors.length) {
  console.log(`\n${errors.length} problem(s) found`);
  process.exit(1);
}
console.log(`OK (${manifests.size} plugins)`);
