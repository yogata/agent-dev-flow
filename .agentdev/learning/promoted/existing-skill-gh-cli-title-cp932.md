# gh CLI --title 引数の Windows cp932 化けと REST API PATCH 標準化

## 背景

Windows 環境で `gh issue create --title "日本語タイトル"` 等の `--title` 引数（inline `--input` 含む）が cp932（Windows-31J）で解釈され、GitHub 上の Issue/PR タイトルが mojibake する。Section 2 Step 0 のコンソールエンコーディング初期化（3行）を実行しても改善しない。Draft 6 case-open で Epic #1845 タイトルが mojibake し、REST API PATCH で修正した。Draft 7-8 で標準運用化した。

## 問題

gh CLI の `--title` / inline `--input` 引数パーサーが Windows ACP（cp932）で文字列を decode する仕様。PowerShell 側の Console encoding 設定（Step 0 の3行初期化）では gh CLI 内部の引数 decode に影響しない。`--body-file` は正常（file bytes を UTF-8 として取り扱う）。

## 望ましい変更

`agentdev-gh-cli` references/standard-procedures.md において、(1) Windows 環境では `--title` / inline `--input` を使用せず `--body-file` または `gh api --input <utf8-file>` を使用する手続きを標準化、(2) title 修正が必要な場合は REST API PATCH（`gh api -X PATCH /repos/{owner}/{repo}/issues/{N}` へ UTF-8 JSON body を `--input` file 経由で送信）を標準手続き化する。

## 対象範囲

### 対象

- `agentdev-gh-cli` references/standard-procedures.md Section 2, Section 4 の各操作手続き（Issue 作成、PR 作成、Epic 作成等で `--title` を使用する手続き）

### 対象外

- `--body-file` 手続き（既に UTF-8 BOM なしで正常動作）
- READ 手続き（Node.js execSync で cp932 影響なし）
- ローカル版（gh CLI を使用しないため対象外）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` | (1) Windows 環境で `--title` / inline `--input` 使用を禁止し `--body-file` / `gh api --input` を推奨、(2) title 修正が必要な場合の REST API PATCH 標準手続きを追記 |

## 既存対策確認

- **確認結果**: 既存対策一部あり（不完全）
- **該当ファイル**: `docs/specs/skills/agentdev-gh-cli.md` L79-106（WRITE 手続きの Windows encoding 初期化必須化、REQ-011-009）、`src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` L47-48, L52-60
- **ギャップ分類**: fix gap
- **ギャップ詳細**: standard-procedures.md L47-48, L52-60 で Section 2 Step 0 コンソールエンコーディング初期化（3行）を必須化済み。ただし本学び事象は Step 0 を実行しても `--title` cp932 化けが解消しないことを実証済み。Step 0 では解決しない境界ケースの明示、`--body-file` / REST API PATCH 標準手続き化が未記載

## 制約

- 既存の Section 2 Step 0 コンソールエンコーディング初期化（REQ-011-009）を維持する（Step 0 自体は `--body-file` 経由の本文 I/O で有効）
- `--body-file` 規定、`[System.IO.File]::WriteAllText`（UTF-8 BOM なし）規定との両立関係を維持する
- 本対応は standard-procedures.md の手続き追記のみ。新規ツール導入は行わない
- ローカル版は対象外（gh CLI を使用しない）

## 受け入れ条件

- [ ] `agentdev-gh-cli` references/standard-procedures.md で Windows 環境の `--title` / inline `--input` 使用が禁止され、`--body-file` / `gh api --input` が推奨されていること
- [ ] title 修正が必要な場合の REST API PATCH 標準手続き（`gh api -X PATCH /repos/{owner}/{repo}/issues/{N}` + UTF-8 JSON `--input` file）が明記されていること
- [ ] 既存の Step 0 コンソールエンコーディング初期化（REQ-011-009）との関係が明確にされていること（Step 0 は本文 I/O で有効、`--title` は別問題）

## 元learning item / 根拠

- **要約**: gh CLI --title 引数は Windows cp932 化けし、Step 0 でも解消しない。REST API PATCH で回避可能
- **根拠**: Draft 6 Epic #1845 タイトルが cp932 化け。Step 0 実行済みでも解消せず。ASCII 仮 title → REST API PATCH で修正。Draft 7-8 で標準運用化
- **再発条件**: Windows 環境で gh CLI の `--title` / inline `--input` 引数へ日本語を渡す全操作
- **横展開可能性**: 全 gh WRITE 操作で `--title` / inline `--input` を使用する手続き。Windows 環境全般。非 Windows では発生しない

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, windows, gh-cli
- **関連Issue**: Draft 6 Epic #1845 mojibake 事象、Draft 7-8 での REST API PATCH 標準運用化
