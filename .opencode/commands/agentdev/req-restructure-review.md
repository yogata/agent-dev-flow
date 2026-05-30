---
description: REQ体系の健全性を診断し、再構成の推奨アクションを提示する
agent: prometheus
load_skills:
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
  - agentdev-no-ai-slop-writing
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

各 REQ ファイルについて以下を確認する:

- **(a) frontmatter `id` 一意性**: active/retired を通じて `id` の重複がないか
- **(b) frontmatter `id` ↔ ファイル名**: ファイル名 `REQ-{NNNN}.md` の `{NNNN}` と frontmatter の `id` 値が一致するか
- **(c) 相互参照の存在確認**: REQ本文・ADR・specs で参照されている REQ ID が実在するか

### 3. 第一参照導線確認

REQ体系の第一参照導線を確認する:

- **(a) DOC-MAP 導線**: `docs/DOC-MAP.md` から active REQ への導線が正しいか
- **(b) README 導線**: `README.md` のワークフロー入口テーブルが現行コマンドと一致するか
- **(c) requirements/README.md 導線**: REQ インデックスが active/retired の実体と一致するか

### 4. active/retired/世代境界確認

REQ の active/retired/世代境界の整合性を確認する:

- **(a) retired にのみ存在する ID**: mapping-table に記録されているか
- **(b) active/retired の二重存在**: 同一 ID が両方に存在していないか
- **(c) 100s番台境界**: 世代変更（例: 0100番台→0200番台）がREQ-0109の基準に従っているか

### 5. 6観点診断

収集した artifact を以下の6観点で診断する:

| 観点 | 診断内容 |
|------|----------|
| **SPLIT** | 単一REQが複数の独立した関心事を含んでおり、分割が適切か |
| **MERGE** | 複数のREQが密接に関連しており、統合が適切か |
| **MOVE** | REQの内容が別の文書種（specs/guides/ADR）に移動すべきか |
| **DUPLICATE** | REQ間またはREQと他文書で内容が重複しているか |
| **RETIRE** | active REQのうち、retire すべき（現行仕様として不要な）ものがないか |
| **DRIFT** | REQ本文と実体（specs/実装/コマンド）の間に乖離がないか |

### 6. 未処理artifact確認

未処理の intake/learning/RU が存在する場合、その存在と影響のみを報告する:

- **(a) intake inbox**: `.agentdev/intake/inbox/` に未処理 item が存在するか
- **(b) learning inbox**: `.agentdev/learning/inbox.md` に未処理 entry が存在するか
- **(c) promoted artifact**: `.agentdev/intake/promoted/`, `.agentdev/learning/promoted/` に未処理 artifact が存在するか
- **(d) RU**: `.agentdev/backlog/req-units/` に未処理 RU が存在するか

存在する場合は件数と診断への潜在的影響を提示する。処理は行わない。

### 7. 診断結果の出力

診断結果を以下の構成でユーザーに提示する:

1. **診断サマリ**: スキャン対象の件数、各観点の結果概要
2. **問題候補**: 各観点で検出された問題候補（REQ ID、観点、問題の概要）
3. **推奨アクション**: 問題に対する推奨対応（req-define での再壁打ち、retire、MERGE 等）
4. **req-define入力案**: 再構成が必要な場合、req-define で壁打ちすべき内容のドラフト（REQ ID 単位）

### 8. 完了報告

完了報告 → `agentdev-workflow-reporting` の完了報告フォーマット（completion-reports.md → req-restructure-review 完了時）に従って出力

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
