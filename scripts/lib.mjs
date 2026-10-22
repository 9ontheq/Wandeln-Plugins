// Shared by validate.mjs and build-index.mjs. Node built-ins only, so CI
// needs no install step.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const PLUGINS_DIR = "plugins";
export const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/;
export const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
export const GITHUB_NAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
/// What Wandeln can run (scripts.rs / plugins.rs), minus .exe: binaries
/// can't be reviewed.
export const SCRIPT_EXTENSIONS = [".ps1", ".bat", ".cmd", ".py", ".js"];
export const TYPES = ["palette", "bar"];
export const REQUIRES = ["python", "node"];
export const MAX_FILE_BYTES = 256 * 1024;
export const MAX_PLUGIN_BYTES = 1024 * 1024;

export function pluginIds() {
  return readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** Every file under a plugin folder, relative to it. */
export function pluginFiles(id) {
  const out = [];
  const walk = (rel) => {
    for (const e of readdirSync(join(PLUGINS_DIR, id, rel), { withFileTypes: true })) {
      const path = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(path);
      else out.push(path);
    }
  };
  walk("");
  return out;
}

export function fileSize(id, file) {
  return statSync(join(PLUGINS_DIR, id, file)).size;
}

/** Parsed plugin.json, or a thrown Error with a readable message. */
export function readManifest(id) {
  let text;
  try {
    text = readFileSync(join(PLUGINS_DIR, id, "plugin.json"), "utf8");
  } catch {
    throw new Error("plugin.json is missing");
  }
  try {
    return JSON.parse(text.replace(/^﻿/, ""));
  } catch (err) {
    throw new Error(`plugin.json is not valid JSON: ${err.message}`);
  }
}
