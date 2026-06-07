---
description: REQ体系の健全性を診断し、再構成の推奨アクションを提示する
agent: prometheus
---

# REQ再構成レビュー

REQ体系の健全性を6観点（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）で診断し、再構成の推奨アクションを提示する read-only 診断コマンド。

## 基本原則: 診断専用（Read-Only）

**診断のみを実行し、一切の副作用を伴わない。**

- ✅ 診断結果の提示（問題候補・推奨アクション・req-define入力案）
- ✅ ユーザーへの対話的な結果説明
- ❌ ファイルの変更・作成・削除（REQ、ADR、mapping-table、DOC-MAP、README 等）
- ❌ GitHub Issue/PR の作成・更新
- ❌ worktree/ブランチの作成
- ❌ retired ファイルの移動
- ❌ mapping-table の更新
- ❌ intake/learning/RU の処理

## Input

- なし（コマンド実行時に全対象 artifact を自動スキャン）

## Output

- 診断結果（セッション内テキスト出力のみ、ファイル出力なし）
  - 最小限の診断結果サマリ
  - 問題候補リスト
  - 推奨アクション
  - req-define入力案（必要な場合のみ）

### 出力禁止（MUST NOT）

- 完全な移行リスト
- 全ファイル変更候補
- mapping-table の完全ドラフト
- Issue/PR 本文の完全版

## Steps

### 1. スキャン対象の収集

以下の artifact を収集する:

| カテゴリ | 対象パス | 収集方法 |
|----------|----------|----------|
| active REQ ファイル | `docs/requirements/REQ-*.md` | `glob` |
| retired REQ ファイル | `docs/requirements/retired/REQ-*.md` | `glob` |
| mapping-table | `docs/requirements/mapping-table.md` | `Read` |
| DOC-MAP | `docs/DOC-MAP.md` | `Read` |
| README | `README.md` | `Read` |
| requirements README | `docs/requirements/README.md` | `Read` |
| .opencode 設定 | `.opencode/commands/**/*.md`, `.opencode/skills/*/SKILL.md` | `glob` |
| guides | `docs/guides/*.md` | `glob` |
| specs | `docs/specs/*.md` | `glob` |
| ADR ファイル | `docs/adr/ADR-*.md` | `glob` |

各ファイルの内容を `Read` tool で読み込む。ファイルが存在しないカテゴリは空として扱い、警告を出力する。

### 2. REQ参照ID整合性確認

診断ロジックは `agentdev-workflow-lifecycle` skill の `references/restructure-judgment-logic.md` の「Step 2: REQ参照ID整合性確認」を参照

### 3. 第一参照導線確認

診断ロジックは `agentdev-workflow-lifecycle` skill の `references/restructure-judgment-logic.md` の「Step 3: 第一参照導線確認」を参照

### 4. active/retired/世代境界確認

診断ロジックは `agentdev-workflow-lifecycle` skill の `references/restructure-judgment-logic.md` の「Step 4: active/retired/世代境界確認」を参照

### 5. 6観点診断

診断ロジック・検出シグナル・シグナル閾値は `agentdev-workflow-lifecycle` skill の `references/restructure-judgment-logic.md` の「Step 5: 6観点診断」を参照

### 6. 未処理artifact確認

診断ロジックは `agentdev-workflow-lifecycle` skill の `references/restructure-judgment-logic.md` の「Step 6: 未処理artifact確認」を参照

### 7. 診断結果の出力

出力構成・問題候補出力スキーマは `agentdev-workflow-lifecycle` skill の `references/restructure-judgment-logic.md` の「Step 7: 診断結果の出力」を参照

### 8. 完了報告

完了報告 → 完了報告templateに従って出力。template: .opencode/commands/agentdev/templates/req-restructure-review/standard.md

## Guardrails

### Read-Only 制約
- G01: ファイルを変更・作成・削除しない（REQ-0109-013）。診断結果はセッション内テキスト出力のみ
- G02: GitHub Issue/PR を作成・更新しない（REQ-0109-013）
- G03: worktree/ブランチを作成しない（REQ-0109-013）
- G04: retired ファイルの移動・mapping-table の更新を行わない（REQ-0109-013）

### 出力制約
- G05: 出力は最小限の診断結果・問題候補・推奨アクション・req-define入力案に限定する（REQ-0109-017）。完全な移行リスト・全ファイル変更候補・mapping-table完全ドラフト・Issue/PR本文は出力しない（REQ-0109-018）

### 処理委譲制約
- G06: intake item の処理・learning refine/promote・RU 生成・promoted artifact の直接処理を行わない（REQ-0109-020）。未処理 artifact は存在と影響のみ報告する（REQ-0109-019）

### 実行制約
- G07: `git` コマンドは実行しない（コミット・プッシュ禁止）。git永続化なし

### 100s番号ポリシー（観察のみ）
- G08: 100s桁の番号付与は active set の世代変更時のみ。通常の APPEND/UPDATE は既存の active REQ 番号を維持する（REQ-0109-021）。診断として観察・報告するのみで、番号の変更は行わない

## Error Handling

| エラー | 対処 |
|--------|------|
| スキャン対象ディレクトリが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| mapping-table が存在しない | Step 4 をスキップし、警告を出力 |
| DOC-MAP が存在しない | Step 3-a をスキップし、警告を出力 |
| .agentdev/ 配下が存在しない | Step 6 をスキップし、「未処理artifact確認: 対象なし」と報告 |
