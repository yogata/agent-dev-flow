# Parent 配置・Epic 追跡テーブル正規形の SPEC 側正典化の要否（SPEC確定候補）

## 観測内容

Parent 先頭行配置・分解テーブル {wave}-{seq} 形式の正規形は現在テンプレートコメント（issue_desc_child.md / issue_desc_epic.md）と agentdev-epic-tracker references に一元化済みである。構造契約として agentdev-workflow-templates SPEC または epic-wave-model SPEC へ正規記載するか否かが未確定である。

## 影響

- テンプレートコメント・references が事実上の正典である状態が続き、SPEC 側との二重管理・乖離リスクが残る

## 課題

spec-save 経由で正典化の要否を判断する。正典化する場合は正規所有者（テンプレート選定規則は workflow-templates、Wave 構成は epic-wave-model）を尊重して配置を決める。

## 既存要件・成果物との関連

- 現行正典: issue_desc_child.md / issue_desc_epic.md テンプレートコメント、agentdev-epic-tracker references
- 正典化候補: agentdev-workflow-templates SPEC、epic-wave-model SPEC

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2152 (Issue #2141 / OU-007, Epic #2134 Wave 2) SPEC確定候補 セクション 2
- 元 item: intake-2026-08-16-spec-cand-parent-epic-table-canonicalization.md
