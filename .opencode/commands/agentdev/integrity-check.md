---
description: AgentDevFlow artifact 整合性検査
agent: sisyphus
implementation_pattern: read-only-diagnostic
load_skills:
  - agentdev-integrity
  - agentdev-workflow-reporting
---

# Artifact 整合性検査

AgentDevFlow 管理下の artifact（REQ、ADR、skill、command、spec）の整合性を検査し、結果をレポートとして出力する read-only コマンド。

## 基本原則: Read-Only 制約

検査対象 artifact を変更しない。許容する新規作成は `.agentdev/integrity/reports/` のレポート生成と `.agentdev/intake/inbox/` の intake item（ユーザー承認時のみ）。

## Input

なし（コマンド実行時に全 artifact を自動スキャン）

## Output

- `.agentdev/integrity/reports/YYYY-MM-DD-integrity-report.md` — 検出結果レポート
- `.agentdev/intake/inbox/YYYY-MM-DD-integrity-{issue-slug}.md` — intake item（MAY、ユーザー承認時のみ）

## Steps

1. **スクリプト実行**: `agentdev-integrity` の検査スクリプト（`scripts/check_integrity.ts`）を実行。検査カテゴリ・対象パス・検出結果の分類は `agentdev-integrity` SKILL.md の検査カテゴリ定義に準拠
   - 検査カテゴリ: REQ frontmatter ↔ ファイル名、ADR ↔ REQ 相互参照、Skill ↔ load_skills 参照、Command-map ↔ 実体、旧 namespace 残存、完了報告フォーマット、DOC-MAP 存在性・参照整合性、Views 残存、README ↔ ファイル整合性
   - Finding 分類: `document-drift` / `broken-reference` / `obsolete-structure` / `canonical-conflict` / `workflow-gap` / `integrity-rule-gap`（`agentdev-integrity` SKILL.md 参照）
   - Finding ルート: `intake` / `learning` / `intake+learning` / `req-define` / `none`

2. **レポート確認**: スクリプト出力のレポート（`.agentdev/integrity/reports/YYYY-MM-DD-integrity-report.md`）をユーザーに提示。レポート形式は `agentdev-integrity` SKILL.md のレポート Schema に準拠

3. **Intake Item 作成（MAY）**: ユーザーが intake item 化を指示した問題のみ、`.agentdev/intake/inbox/YYYY-MM-DD-integrity-{issue-slug}.md` に保存。形式は `/agentdev/intake-capture` に従う。同名衝突時は連番付与。ユーザーがスキップ → レポートのみで終了

4. **Git 永続化（条件付き）**: intake item 作成時のみ `agentdev-git-worktree` の domain state 永続化（references/git-common-procedures.md Section 2）に従い commit/push。`git add` は `.agentdev/intake/` 配下のみ。integrity report は commit 対象外

5. **完了報告**: `agentdev-workflow-reporting` の完了報告variantに従って出力。variant: completion-reports/integrity-check/standard.md

## Guardrails

- G01: 検査対象 artifact を変更しない。レポート・intake item の新規作成のみ許容
- G02: `git` コマンドは intake item 作成時にのみ `.agentdev/intake/` 配下に限定
- G03: finding は intake 対象（原則）。learning item の直接作成は行わない（MUST NOT）
- G04: finding 分類・ルートを付与すること（REQ-0101）
- G05: ユーザーの承認なしに intake item を作成しない（MAY）
- G06: `gh` コマンドは使用しない
- G07: `agentdev-req-analysis`（manual reference）の要件分析手法を参照して REQ フィールド検査
- G08: `agentdev-adr-guidelines`（manual reference）の ADR 構造定義を参照して ADR フィールド検査
