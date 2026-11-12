# check_integrity.test.ts の IR-045 fixture 参照残置（IR-045 は欠番・移管由来の語彙参照）

## 観測事実

- Case #4026 Wave 1（PR #4039）の検証で、check_integrity.test.ts 内に IR-045 の fixture 参照が残置していることを観測（IR-045 は欠番・IR-045 移管由来の語彙参照が残る）。
- PR #4039 本文 Findings で別処理候補として申告済み。

## 具体的な修正対象

- check_integrity.test.ts の IR-045 fixture 参照を現行の移管先規則（IR-045 移管先の IR ID・語彙）へ更新するか、fixture を廃止する。
- IR-069（req-number-gap-recorded）の欠番記録との整合を確認する。

## 関連

- Case #4026・PR #4039 本文 Findings / Capture候補（DEL-4029-1）
- scripts/.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts・IR-069
