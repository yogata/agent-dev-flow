# STEP-3 / STEP-4: 配布物整合性検査・検出事項出力・永続化（distribution-check-and-output）

> 本 reference は `agentdev-workflow-inspect-docs` SKILL.md の Control Plane STEP-3、STEP-4 詳細である。
> read-only-diagnostic型のため resume point を持たない。

## 開始条件

- STEP-3: STEP-2 の文書種別別意味診断の完了
- STEP-4: STEP-1〜3 の診断結果の確定

## 結果

- 配布物整合性診断結果、docs-check route 候補、未処理 artifact 確認結果
- 検出事項ファイル（`.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md`）
- `.agentdev/inspect/` 配下の commit/push、完了報告

## 手順

### STEP-3-1: 配布物整合性検査

配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`）について、docs-spec-rebuild-integrity Design（extension 経由）が定義する検査パターンに従い、構文健全性（frontmatter 重複、見出し重複、Markdown 構文破損、存在しない command 参照、エンコーディング不整合）、文意保持（壊れた括弧、壊れた参照表現、主語/目的語欠落文）、責務整合（command 本体と Design 間の責務説明照合、case-open/run/close/auto の責務境界一致）を診断する。
`agentdev-req-structure-diagnostics` 参照。

存在しない command 参照の検出は、README listing と command 本文の相互参照について存在しない command を指す参照を検出事項とし、実在する command 参照は検出対象外とする（docs-spec-rebuild-integrity Design 構文健全性検査準拠）。

エンコーディング不整合の検出は、配布物 Markdown の UTF-8 BOM 付きファイルと単一ファイル内の CRLF/LF 混在を検出事項とし、BOM なし UTF-8 かつ単一改行コードで構成されたファイルは検出対象外とする（同上）。

### STEP-3-2: docs-check route 判定

意味的疑いのうち機械的検査に落とせるものを docs-check ルール／検査データ候補として提示する。

### STEP-3-3: 未処理 artifact 確認

`agentdev-req-structure-diagnostics` 参照。

### STEP-4-1: 検出事項出力

検出事項を `.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md` へ出力する。
source-of-truth priority: 現行 REQ > 承認済み ADR > Design > guides。
NG 分類（false positive/ pre-existing/ 今回修正対象）は docs-spec-rebuild-integrity Design（extension 経由）の NG 分類表に従い、各検出事項に分類、理由、後続対象を付ける。

### STEP-4-2: 実行前同期（git pull --ff-only）

- `git pull --ff-only` を実行する
- **失敗時**: 共通 template（`.opencode/commands/agentdev/templates/common/git-error-messages.md`）の該当形式で表示して停止する（自動解消しない）

### STEP-4-3: .agentdev/inspect/ 変更の commit と push

`agentdev-git-worktree` の「ドメイン状態永続化プロシージャ」（並列実行安全ステージングプロシージャ含む）に従い、`.agentdev/inspect/` 配下の変更を commit/ push する。
commit message は `chore(agentdev): capture inspect-docs finding`（Conventional Commits 形式）。
変更なし時は commit/push せず完了報告で「変更なし」と報告する。
push 失敗時は同プロシージャの構造化エラー形式で停止する（完了扱いにしない）。

### STEP-4-4: 完了報告

完了報告 template（`.opencode/commands/agentdev/templates/inspect-docs/standard.md`）に従って出力する。

## エラー処理

| エラー | 対処 |
|--------|------|
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| `git pull --ff-only` 失敗 | git-error-messages 共通 template の該当形式で表示して停止 |
| push 失敗 | ドメイン状態永続化プロシージャの構造化エラー形式で停止（完了扱いにしない） |

## 関連 STEP

- 前: STEP-2（scan-and-doc-diagnostics）
- 次: なし（workflow 終了）

## 関連 Capability Skill

- `agentdev-req-structure-diagnostics`: 配布物整合性検査、未処理 artifact 確認の判定ロジック
- `agentdev-doc-diagnostics`: finding 出力契約、NG 分類
- `agentdev-git-worktree`: ドメイン状態永続化プロシージャ
- `agentdev-conventional-commits`: commit message 規約
- `agentdev-project-extensions`: docs-spec-rebuild-integrity Design の extension 経由解決

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G01（`.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成のみ例外許可、他のファイル変更禁止）
- G02（GitHub Issue/PR を作成、更新しない）
- G03（worktree/ブランチを作成しない）
- G04（intake/learning/RU の処理を行わない）
