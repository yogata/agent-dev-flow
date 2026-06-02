# 完了報告フォーマット

各コマンド完了時の報告フォーマットを定義する。

## 必須フォーマット宣言

全agentdevコマンドは完了報告時に**必ず**本ファイルの該当セクションのフォーマットを使用すること。独自フォーマットの使用は禁止する（SHALL）。各セクションのコードブロック内の変数（`{...}`）のみを実際の値に置換して出力すること。

### 汎用締め文の禁止

完了報告では以下の汎用締め文を禁止する（MUST NOT）:
- 「次にやるべきことがあれば指示してください」
- 「他にご要望があればお知らせください」
- 「何かあればお気軽にどうぞ」
- その他、ユーザーへの次回アクション委譲を促す汎用的な文言

**理由**: 各コマンドの完了報告には `completion-reports.md` で定義された具体的な `次のコマンド` または終端として明示的な完了宣言が含まれるため、汎用締め文は不要であり、フォーマット統一を損なう。

## 完了報告出力順序ルール

全agentdevコマンドの完了報告ステップにおいて、以下の順序を**必ず**守ること。

1. **TodoWrite更新（先）**: TodoWriteの「完了報告」項目を `completed` に更新する
2. **完了報告テキスト（後）**: 本スキルの完了報告フォーマットに従ったテキストを出力する
3. **中間出力の禁止**: TodoWrite更新と完了報告テキストの間に、他の中間出力（ログ・進捗報告・確認メッセージ等）を挟まない

**適用対象**: req-define, req-save, case-open, case-run, case-run (Epic Orchestrator), case-close, case-update, intake-capture, intake-from-github, intake-review, intake-promote, backlog-review, backlog-save, learning-refine, learning-promote, integrity-check の全完了報告ステップ

**理由**: 完了報告テキストがユーザーに最後に表示されることで、最終結果の視認性が向上する

## 共通必須フィールド定義

各variantファイルは以下の6フィールドを**すべて**含むこと（MUST）:

| # | フィールド | 説明 |
|---|-----------|------|
| 1 | 完了コマンド | 実行したコマンドのフルパス（例: `/agentdev/case-close`） |
| 2 | 対象 | 操作対象の識別子（Issue番号、PR番号、ファイルパス等） |
| 3 | 結果 | 実行結果の詳細。コマンド固有の項目を含む |
| 4 | 検証結果 | `✅ OK` / `⚠️ 注意` / `❌ NG` のいずれか |
| 5 | git 永続化 | commit hash, push成否、または「該当なし」 |
| 6 | 次のコマンド | 後続コマンドのフルパス、または「なし」（終端コマンドの場合） |

## Variant Registry

各コマンドのvariantファイルは `completion-reports/{command}/{variant}.md` に配置する。

| コマンド | Variant | ファイルパス | 選択条件 |
|----------|---------|-------------|----------|
| req-define | feature | `req-define/feature.md` | work_type: feature, scale: standard |
| req-define | feature-epic | `req-define/feature-epic.md` | work_type: feature, scale: large (Epic) |
| req-define | lightweight | `req-define/lightweight.md` | work_type: bugfix / maintenance / docs_chore |
| req-save | standard | `req-save/standard.md` | SPLITなし、DOC-MAP更新なし |
| req-save | split-detected | `req-save/split-detected.md` | SPLIT検出時 |
| req-save | docmap-updated | `req-save/docmap-updated.md` | DOC-MAP更新あり |
| req-save | docmap-not-needed | `req-save/docmap-not-needed.md` | DOC-MAP確認・更新不要 |
| req-save | epic | `req-save/epic.md` | Epic規模判定時 |
| case-open | standard | `case-open/standard.md` | 通常のIssue作成 |
| case-open | epic | `case-open/epic.md` | Epic Issue作成時 |
| case-run | standard | `case-run/standard.md` | 通常のcase-run完了 |
| case-run-epic | all-success | `case-run-epic/all-success.md` | Epic全子Issue成功 |
| case-run-epic | partial-fail | `case-run-epic/partial-fail.md` | Epic部分失敗・スキップあり |
| case-run-epic | all-fail | `case-run-epic/all-fail.md` | Epic全子Issue失敗 |
| case-update | body | `case-update/body.md` | `--body` 更新 |
| case-update | comment | `case-update/comment.md` | `--comment` 追加 |
| case-update | req | `case-update/req.md` | `--req` 更新 |
| case-update | review-ng | `case-update/review-ng.md` | `--review-ng` 報告 |
| case-close | standard | `case-close/standard.md` | 全系統成功 |
| case-close | agentdev-push-failed | `case-close/agentdev-push-failed.md` | GitHub完了 / .agentdev push失敗 |
| case-close | worktree-cleanup-failed | `case-close/worktree-cleanup-failed.md` | ブランチ・worktree削除失敗 |
| intake-capture | standard | `intake-capture/standard.md` | 常にこのvariant |
| intake-from-github | standard | `intake-from-github/standard.md` | 常にこのvariant |
| intake-review | standard | `intake-review/standard.md` | 常にこのvariant |
| intake-promote | standard | `intake-promote/standard.md` | 常にこのvariant |
| backlog-review | standard | `backlog-review/standard.md` | 全artifact分析・承認成功 |
| backlog-review | partial | `backlog-review/partial.md` | 部分成功（矛盾検出あり） |
| backlog-review | zero-promoted | `backlog-review/zero-promoted.md` | promoted artifact 0件 |
| backlog-save | standard | `backlog-save/standard.md` | 全RU生成成功 |
| backlog-save | partial | `backlog-save/partial.md` | 部分成功（RU生成失敗あり） |
| backlog-save | zero-draft | `backlog-save/zero-draft.md` | status: reviewed の draft 0件 |
| learning-refine | standard | `learning-refine/standard.md` | 常にこのvariant |
| learning-promote | standard | `learning-promote/standard.md` | 常にこのvariant |
| integrity-check | standard | `integrity-check/standard.md` | 常にこのvariant |
| req-restructure-review | standard | `req-restructure-review/standard.md` | 常にこのvariant |

### フォーマット共通ルール（case-run-epic）

case-run-epic variant のテーブル列セマンティクス:

- 状態値: `✅ 完了` / `❌ 失敗` / `⏭ スキップ` の3種類
- PR列: 成功時はPR番号リンク、失敗・スキップ時は `—`
- 備考列: 成功時は `—`、失敗時はエラー概要、スキップ時は依存先Wave番号
- Wave列: Wave番号（Epic本文の実行順序テーブルに対応）
- 集約行: 成功・失敗・スキップ件数のサマリー

### git 永続化セクションのルール

- learning-refine, learning-promote, case-close, intake-capture, intake-from-github, intake-review, intake-promote の完了報告に git 永続化セクションを含める
- 変更なしの場合は「変更なし（commit/push スキップ）」と表示する
- push 失敗時は「push: 失敗」と表示し、完了報告全体を ⚠️ に変更する
