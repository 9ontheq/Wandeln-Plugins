# Wandeln plugin spec

Plugins are script extensions that add palette commands or top-bar items.
Dropping a folder in place is all it takes.

## Location

```
%APPDATA%\app.wandeln\plugins\<plugin>\plugin.json
```

Settings → Plugins → "Open folder" opens it (and creates it if missing).
After adding or changing a plugin, reopen the palette or press "Reload" in Settings.

## plugin.json

```json
{
  "name": "Translate",
  "type": "palette",
  "keyword": "tr",
  "command": "tr.py",
  "description": "Optional"
}
```

| Key | Required | Description |
| --- | --- | --- |
| `name` | yes | Name shown in the palette and Settings |
| `type` | | `"palette"` (default) or `"bar"` |
| `keyword` | | Makes it a search plugin; without it, it's a one-shot command |
| `command` | yes | Script in the plugin folder |
| `description` | | Description |
| `interval` | | Bar only: refresh interval in seconds. Default 60, minimum 2 |

Supported scripts: `.ps1` (PowerShell), `.bat` / `.cmd`, `.exe`,
`.py` (needs `python` on PATH), `.js` (needs `node` on PATH).
The working directory is the plugin folder. No console window is shown.
`.ps1` files may be saved as UTF-8 (with or without BOM) or Shift-JIS.
`$PSScriptRoot` isn't available — use the working directory (`Get-Location`) instead.

(This repository does not accept `.exe` plugins; see the README.)

## One-shot commands (no keyword)

Search for the plugin's `name` in the palette and press Enter to run it with
no arguments. Output is ignored.

## Search plugins (with keyword)

Typing `keyword`, a space and some text in the palette runs the script and
lists its results.

- The text is passed both as the first argument and in the `WANDELN_QUERY` environment variable.
- The script is stopped if it doesn't finish within 5 seconds.
- Write standard output as UTF-8 (`.ps1` output is UTF-8 automatically; `.py` gets `PYTHONIOENCODING=utf-8`).

Output format:

```json
{
  "items": [
    { "title": "Shown text", "subtitle": "Optional", "action": { "type": "copy", "value": "Text to copy" } }
  ]
}
```

| action.type | On Enter |
| --- | --- |
| `copy` | Copies `value` to the clipboard |
| `open` | Opens `value` (URL, file or folder) |
| `run` | Runs the same script with `value` as the first argument (output ignored) |

If the output isn't JSON, each line becomes a `copy` item.

## Bar plugins (`"type": "bar"`)

Items shown on the top bar. After adding one and pressing "Reload", it appears
in Settings → Widgets (right zone, disabled) under its name; enable and place it
like any other widget.

The script runs with no arguments every `interval` seconds (5-second timeout)
and its output is displayed:

```json
{ "text": "Shown text", "tooltip": "Optional, on hover", "action": { "type": "open", "value": "https://..." } }
```

- `action` takes the same `copy` / `open` / `run` types and runs on click (after `run` the item refreshes immediately).
- If the output isn't JSON, the first line is the text and the remaining lines are the tooltip.
- Empty text hides the item.

## Examples

See [`plugins/case`](plugins/case) (search plugin, Python) and
[`plugins/uptime`](plugins/uptime) (bar plugin, PowerShell).
