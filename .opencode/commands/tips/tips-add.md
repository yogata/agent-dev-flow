---
description: 学びをinbox.mdに追記する
agent: sisyphus
load_skills:
  - tips-capture
---

# 学びの追記

確認済みの学び（Tips）を `docs/tips/inbox.md` に追記します。

**このコマンドは保存専用です。** 情報の収集・昇華判定・ADR/REQ/spec反映判断は行いません。

> **注意**: 本コマンドは旧4フィールドインターフェース（タイトル・タグ・内容のみ）の保存用です。13フィールド形式の構造化エントリは `tips-capture` スキルが直接 `inbox.md` に書き込むため、本コマンドを経由しません。

## Input

- `$1` — タイトル（必須）
- `$2` — タグ（オプション、カンマ区切りで複数指定可能）
  - 例: `typescript`, `nextjs,react`, `supabase,auth,security`
- コンテンツ — 旧4フィールド形式の本文（タイトル + タグ + 内容のみ）

## Output

- `docs/tips/inbox.md` に追記された学びエントリ（旧4フィールド形式）

---

## Steps

### 1. 現在日時の取得

`Get-Date -Format "yyyy-MM-dd"`

### 2. inbox.mdの存在確認と自動作成

`Test-Path docs/tips/inbox.md`

- ファイルがない場合 → 自動で作成:
  1. `docs/tips/` ディレクトリが存在しない場合は作成: `New-Item -ItemType Directory -Path docs/tips -Force`
  2. ヘッダー付き inbox.md を作成:

  ```markdown
  # 学び・教訓

  このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
  まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

  ---
  ```

  3. archive.md も存在しない場合は同様にヘッダー付きで作成

### 3. フィールド形式の検証

受け取ったコンテンツが旧4フィールド形式（タイトル・タグ・内容）であることを確認します。13フィールド形式のエントリは `tips-capture` スキルが直接 `inbox.md` に書き込むため、本コマンドでは処理しません。

### 4. inbox.mdへの追記

以下のフォーマットで `docs/tips/inbox.md` の先頭（ヘッダー直後）に追記します:

```markdown
## YYYY-MM-DD: タイトル

{コンテンツ本文}

- **タグ**: #xxx #yyy

---
```

**追記位置**: ヘッダー（最初の`---`で囲まれた部分）の直後に挿入

### 5. 完了報告

- 追記したタイトル
- 追記したタグ一覧
- ファイルパス: `docs/tips/inbox.md`

---

## Guardrails

### 品質ゲート
- G01: `inbox.md` が存在しない場合、自動でヘッダー付き `inbox.md`（と `archive.md`）を作成する
- G02: タイトルが未指定の場合はエラー終了する（「タイトルを指定してください」）
- G03: 旧4フィールド形式ではない場合はエラー終了する（「旧4フィールド形式のコンテンツが必要です」）

---

## 使用例

`/tips-add "Supabase RLSポリシーのデバッグ方法" "supabase,rls,debug"`
→ 旧4フィールド形式の学びをinbox.mdに追記

`/tips-add "Next.js App Routerのキャッシュ制御"`
→ タグなしでinbox.mdに追記

> **注意**: 13フィールド形式の構造化エントリは `tips-capture` スキルが直接 `inbox.md` に書き込みます。本コマンドは旧4フィールド形式のみ対応です。
