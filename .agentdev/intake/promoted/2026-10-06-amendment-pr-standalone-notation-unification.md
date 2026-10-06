# 採用済み成果物: 「Amendment PR」単体表記の表記統一対象採否（REQ 行・test 期待値の連鎖を含む範囲確定）

## 観測内容

用語統一 Case #3500（PR #3505、merge commit 9fbbbc4a）で「Definition PR」→「設計PR」、「Definition Amendment PR」→「設計修正PR」、「実装 PR」→「実装PR」を置換したが、略記「Amendment PR」単体表記が置換対象語（完全一致の固定置換）に含まれず未処置のまま残存した。

adversarial-review による実測（2026-10-07）: **46 箇所 / 15 ファイル**に残存。主要箇所:

- src/common/commands/agentdev/case-auto.md:10
- docs/designs/workflows/v4-lifecycle-state-machine.md:49, 61, 69
- src/common/skills/agentdev-workflow-case-revise/SKILL.md（7 箇所）、references/definition-revision.md（4 箇所）、references/handoff-and-update.md:27
- **docs/requirements/REQ-062.md:23, 33（REQ-062-003 の REQ 行自体が「Amendment PR を作成せず」と規定）**
- docs/designs/foundations/system.md:172-177、docs/designs/commands/case-revise.md:25-36、docs/designs/skills/agentdev-git-worktree.md:27
- case-auto-recovery.md:81、root-case-report.md template:20、workflow-case-auto/SKILL.md:104
- vocabulary-management.yaml:11、document-type-responsibilities.md:330（語彙管理規定自身）
- **scripts/self/release/case-revise-definition-revision.test.ts（多数。:70, :126, :150, :185-194 が「Amendment PR」表記を期待値として pin）**

## 影響

- 「設計修正PR」へ統一済みの概念を略記で参照する現行文書が残存し、表記統一の網羅性が完全でない
- prh 固定置換辞書（.agentdev/config/plugins/agentdev-textlint-guard-prh.yml:18-24）は完全形 3 語のみ登録のため、略記単体は置換候補として指摘されず将来の執筆で再び増殖し得る
- **統一実施時の連鎖**: REQ-062-003 の REQ 行変更（Definition 変更・再合意プロセスを伴う）と test 期待値変更（case-revise-definition-revision.test.ts）が必要になり得る。「軽微な docs 直 save」では完結しない範囲を含む。履歴成果物の旧表現は document-type-responsibilities.md:330・REQ-083-003 により置換対象外

## 課題（統合先・現行状態の明記）

1. 「Amendment PR」単体表記を表記統一対象へ含めるか（「設計修正PR」へ置換）、または略記を許容するかの採否判断
2. 採用する場合の対象範囲は実測 15 ファイル 46 箇所（REQ-062-003 行・test 期待値 pin の連鎖を含む。REQ 行変更を伴う場合は req-define での再合意が必要）
3. prh 辞書への略記登録の要否（将来の増殖防止）

## 既存要件との関連

- REQ-083-003（docs/requirements/REQ-083.md:18「対象成果物の現行名称は「設計PR」「設計修正PR」とし、「Draft Definition PR」を使用しない」。ただし「Amendment PR」単体の可否は REQ では未規定 — 本 item の採否判断事項）
- REQ-062-003（「Amendment PR」用語を用いる現行 REQ 行）
- document-type-responsibilities.md 用語政策（:330 履歴成果物の旧表現は置換対象外）
- prh 辞書（agentdev-textlint-guard-prh.yml）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-06-amendment-pr-standalone-notation-unification.md`（分類採用により削除済み）
- PR #3505 本文「Findings/ Capture候補」、Case #3500・PR #3505（9fbbbc4a）・fix PR #3506（cd14227e）
- adversarial-review Stream A/B 実測（46 箇所/15 ファイル・prh 辞書登録内容・REQ-062-003 行・test pin 確認、2026-10-07）
