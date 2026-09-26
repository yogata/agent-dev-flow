#### DB-01: 配布 skill reference 中の gh CLI 直接呼出記述（IR-053）
- **category**: 配布物統合性（gh-direct-invocation、check_integrity WARNING 取り込み）
- **target**: src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md:67、src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md:58
- **evidence**: Direct gh CLI invocation 'gh issue list' detected — route via the agentdev_gh Custom Tool（IR-053、v2:REQ-0152-001）
- **severity**: medium / **confidence**: high
- **source_of_truth**: IR-053（gh 直接呼出禁止、agentdev_gh Tool 経由）
- **recommended_route**: intake
- **ng_classification**: pre-existing

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: 併合 promote（ユーザー承認 Q4）。2026-09-25 F-13 と統合（F-13 defer は本 promote で解消）。REQ-092-003 による contingency の Tool 第一・例外条件は確定済みで F-13 の待ち条件は充足。修正方向: IR-053 例外登録 / issue-operation-safety.md・definition-pr-and-idempotency.md 記述修正。注記: REQ-092-003 は既存（新設ではなく関連付けの新規性）
- 後続: backlog-review による RU 化

## 併合元 (2026-09-25 F-13)

### F-13: 配布 reference 中の gh CLI 直呼び記述（IR-053）

- id: F-13
- category: 横断契約矛盾（GitHub I/O の正規経路委任）
- target: src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md:51、src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md:58
- evidence: 「`gh issue list --search …` の形式で手動読取し」等。ただし直前に「operation-failed 時限定の補完手段」「書込み系は引き続き Tool 正規経路に限定」との限定付き。check_integrity IR-053 WARNING 2 件
- severity: medium
- confidence: medium（機械検出の再現は確実。違反か意図された例外かは規則側の判断）
- source_of_truth: IR-053 ルールと REQ-011-001（GitHub I/O は Custom Tool 委任）
- recommended_route: intake（IR-053 の例外条項化または記述の Tool 経由への変更）
- ng_classification: pre-existing
- notes: 両記述とも読取系 fallback に限定した contingency 手順として意図的に書かれている。検出ルール側の例外定義不足の可能性
