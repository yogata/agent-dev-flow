# 他配布 Workflow Skill 文言への旧機構文言残存のフォローアップ（Case #3968 対象外の corpus 確認事項）

## 観測事実

- Case #3968（DEL-3968-1・PR #3974 本文 Findings/intake 候補）で、機械検索により src/common/skills/agentdev-workflow-case-open/SKILL.md（L80・L107）、agentdev-workflow-case-run/SKILL.md（L102・L150）、agentdev-workflow-case-close/SKILL.md（L96-128）、agentdev-workflow-case-close/scripts/README.md（L7）に旧機構文言（作成ヘルパー・台帳・作成先拒否・作成時機械登録）の残存を検出した。
- 本 Issue の対象範囲は adapter SKILL 文言のみ（停止条件により adapter SKILL 以外の配布スキル文言への拡大禁止）であり、検出事項の処置対象外として親 Epic へ報告済み。
- case-close 実行時点（merge 後 main 5c472052d）の追跡実測: src/common/skills・src/opencode・.opencode 実体・scripts の *.md で旧機構語句（作成ヘルパー・作成先拒否・作成時機械登録・evaluateCreationDestination・verification-resources-ledger）の grep が 0 件（#3966/#3967/#3969 の merge 分で解消済みの可能性）。

## 確認事項

- promote 判断で、検出時点（DEL-3968-1）と現行（5c472052d）の差分を踏まえ解消済み確認または残存箇所の特定を行う。
- 撤去系文言の担当実現単位（RU-0270 撤去系・RA-002〔#3970〕/RA-006〔#3971〕等）の Wave 内存在確認は Epic #3964 側の判断事項として報告済み。

## 関連

- Case #3968・PR #3974 本文 Findings/intake 候補・Epic #3964
- RU-0270・REQ-118（検証に伴う一時資材の取扱いと後片付け責任）
