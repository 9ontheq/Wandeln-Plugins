# Wandeln Plugins

**English** | [日本語](README.ja.md)

Community plugins for [Wandeln](https://wandeln.app). Plugins are small scripts
that add commands and search providers to the palette, or items to the top bar.

> [!WARNING]
> Plugins run as scripts on your PC. Everything here is read by a maintainer
> before it is merged, but please look over a plugin's script before you
> install it.

## Installing a plugin

1. Open the plugin's folder under [`plugins/`](plugins) and download all of its files.
2. Put them in a folder with the same name under:
   ```
   %APPDATA%\app.wandeln\plugins\<id>\
   ```
   (Settings → Plugins → "Open folder" takes you there.)
3. Press "Reload" in Settings → Plugins.

A machine-readable list of all plugins is published as
[`index.json`](https://raw.githubusercontent.com/9ontheq/Wandeln-Plugins/index/index.json)
and rebuilt on every merge.

## Publishing a plugin

Submissions are made through pull requests.

1. Fork this repository.
2. Create `plugins/<id>/` containing:
   - `plugin.json` (see below)
   - the script itself
   - `README.md` — what it does, how to use it, what it needs. Screenshots welcome.
3. Open a pull request and fill in the checklist.
4. Once the automated checks pass, a maintainer reads the script and merges it.

Updates follow the same flow — bump `version`. If you want to change someone
else's plugin, please check with its author first (CI flags edits by anyone
other than the author).

### plugin.json

The keys Wandeln itself reads are described in the [plugin spec](SPEC.md).
This repository additionally requires `id`, `author`, `version` and `description`.

```json
{
  "id": "case",
  "name": "Change case",
  "type": "palette",
  "keyword": "case",
  "command": "case.py",
  "description": "Converts the typed text to UPPER, lower or Title case and copies it.",
  "author": "your-github-name",
  "version": "1.0.0",
  "requires": ["python"]
}
```

| Key | Required | Description |
| --- | --- | --- |
| `id` | yes | Same as the folder name. Lowercase letters, digits and hyphens, 2–40 characters |
| `name` | yes | Display name |
| `type` | | `"palette"` (default) or `"bar"` |
| `keyword` | | Trigger keyword for search plugins. Must be unique across plugins |
| `command` | yes | Script file in the plugin folder |
| `description` | yes | One or two sentences shown in the list |
| `author` | yes | Your GitHub username |
| `version` | yes | `1.0.0` style |
| `interval` | | Bar plugins only: refresh interval in seconds (2 or more) |
| `requires` | | Runtimes needed: `"python"` / `"node"` |

### Not accepted

- Executables or other binaries (`.exe`, `.dll`, …) — they can't be reviewed.
  Scripts must be `.ps1`, `.bat`, `.cmd`, `.py` or `.js`.
- Files over 256 KB, or plugins over 1 MB in total.
- Code that downloads and runs other code, or obfuscated code.
- Network access or file changes that the description doesn't mention.
- Pull requests that add or change more than one plugin (please split them).

## License

Plugins submitted here are published under this repository's [LICENSE](LICENSE) (MIT).
