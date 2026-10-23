# Wandeln Plugins

[English](README.md) | **日本語**

[Wandeln](https://wandeln.app) のコミュニティプラグイン集です。
プラグインは、パレットにコマンドや検索を追加したり、トップバーに項目を追加したりする小さなスクリプトです。

> [!WARNING]
> プラグインはあなたの PC 上でスクリプトとして実行されます。ここに載っているものはメンテナーが中身を読んでからマージしていますが、
> 入れる前に一度スクリプトに目を通してください。

## プラグインを入れる

1. [`plugins/`](plugins) から使いたいプラグインのフォルダを開き、中のファイルを全部ダウンロードします。
2. 同じ名前のフォルダを作って、次の場所に置きます。
   ```
   %APPDATA%\app.wandeln\plugins\<id>\
   ```
   (設定 → プラグイン →「フォルダを開く」で開けます)
3. 設定 → プラグイン の「再読み込み」を押します。

全プラグインの一覧は
[`index.json`](https://raw.githubusercontent.com/9ontheq/Wandeln-Plugins/index/index.json)
にもまとまっています(マージのたびに自動更新)。

## プラグインを公開する

プルリクエストで受け付けています。

1. このリポジトリを Fork します。
2. `plugins/<id>/` を作り、次のファイルを入れます。
   - `plugin.json`(下記)
   - スクリプト本体
   - `README.md` — 何ができるか、使い方、必要なもの。スクリーンショットがあれば歓迎です
3. プルリクエストを作り、チェックリストを埋めます。
4. 自動チェックが通ったあと、メンテナーがスクリプトを読んでからマージします。

更新も同じ流れで、`version` を上げてください。他の人のプラグインを直す場合は、先に作者に確認してください
(作者以外による変更は自動チェックで警告されます)。

### plugin.json

Wandeln 本体が読むキーは [プラグイン仕様](SPEC.md)(英語)を参照してください。
このリポジトリではさらに `id`・`author`・`version`・`description` が必須です。

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

| キー | 必須 | 内容 |
| --- | --- | --- |
| `id` | ○ | フォルダ名と同じ。英小文字・数字・ハイフン、2〜40文字 |
| `name` | ○ | 表示名 |
| `type` | | `"palette"`(省略時)または `"bar"` |
| `keyword` | | 検索型の起動キーワード。他のプラグインと重複不可 |
| `command` | ○ | フォルダ内のスクリプト |
| `description` | ○ | 一覧に出る説明(1〜2文) |
| `author` | ○ | あなたの GitHub ユーザー名 |
| `version` | ○ | `1.0.0` 形式 |
| `interval` | | bar のみ。更新間隔(秒、2以上) |
| `requires` | | 必要なもの: `"python"` / `"node"` |

### 受け付けないもの

- `.exe` や `.dll` などのバイナリ(中身を確認できないため)。スクリプトは `.ps1` `.bat` `.cmd` `.py` `.js` のみ
- 256 KB を超えるファイル、合計 1 MB を超えるプラグイン
- 別のコードをダウンロードして実行するもの、難読化されたコード
- 説明に書かれていない通信やファイル操作をするもの
- 1 つのプルリクエストで複数のプラグインを追加・変更するもの(分けてください)

## ライセンス

投稿されたプラグインは、このリポジトリの [LICENSE](LICENSE)(MIT)で公開されます。
