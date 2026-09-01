# req-save 実行時の AUTOGEN 対象索引再生成前置の明文化

## 背景

REQ 行 append を伴う req-save 実行の際、AUTOGEN 対象索引（docs/requirements/README.md、req-health-metrics.md の計測例等）の同 commit 再生成が手順側で明確でなく、2回（PR #2390 / commit 340e7304、PR #2423 / commit 301cdc90）にわたり main の索引鮮度ずれが発生した。2回目は再発として明示記録されており、工程未組込みのままでは再発がほぼ確実。

## 問題

- req-save Workflow Skill の手順に AUTOGEN 対象索引の再生成前置が存在しない
- checker-execution-contracts.md、index-auto-generation.md にも工程連動の再生成前置規定がない
- REQ 行 append 後の鮮度検査（REQ-010-059 gate）が下流工程まで失敗残留する

## 望ましい変更

req-save Workflow Skill の REQ ファイル適用後の手順に「AUTOGEN 対象索引の同 commit 再生成」を前置明記する。AG-009(a)（OU-008、Issue #2386 領域）の計画と重複しない範囲で手順側のみ修正する。

## 対象範囲

### 対象

- src/opencode/skills/agentdev-workflow-req-save/（該当 STEP への前置明記）
- docs/designs/integrity/checker-execution-contracts.md（AG-009(a) 領域との整合注記）

### 対象外

- gate 仕様自体の変更（REQ-010-059 は不変）
- AG-009(a) の本体実装

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | src/opencode/skills/agentdev-workflow-req-save/SKILL.md | REQ 行 append を伴う実行時の AUTOGEN 再生成前置を手順に明記 |
| spec | docs/designs/integrity/checker-execution-contracts.md | 工程連動の再生成前置と AG-009(a) 領域との整合注記 |

## 既存対策確認

- **確認結果**: 既存対策なし
- **該当ファイル**: なし（req-save Workflow Skill 配下に AUTOGEN/generate_indexes/鮮度の記載ゼロを grep 実証）
- **ギャップ分類**: 対策不存在
- **ギャップ詳細**: AG-009(a)＝OU-008、Issue #2386 領域として計画は存在するが未実装

## 制約

- AG-009(a) の進行と重複・矛盾しない範囲で手順側のみ修正する
- 鮮度検査の gate 仕様（REQ-010-059）は変更しない

## 受け入れ条件

- [ ] req-save 手順に AUTOGEN 対象索引の再生成前置が明記されている
- [ ] REQ 行 append を伴う req-save 実行時に鮮度検査 exit 0 を確認できる
- [ ] AG-009(a) の計画領域と重複・矛盾がない

## 元learning item / 根拠

- **要約**: REQ 行 append を伴う req-save での AUTOGEN 索引再生成漏れ（2回発生、1回は再発明示）
- **根拠**: 「REQ 行 append を伴う req-save では AUTOGEN 索引の同 commit 再生成が必要」「REQ 行 append を伴う req-save での AUTOGEN 再生成漏れが再発（req-save @301cdc90）」— 8軸評価 30/40（発生2・反映先明確5・再発可能性5）
- **再発条件**: REQ 行 append の req-save で AUTOGEN 再生成を省略
- **横展開可能性**: AUTOGEN 対象索引全般（docs 配布物の機械生成領域）に適用可

## 推奨Issue分類

- **分類**: maintenance
- **推奨ラベル**: maintenance, workflow
- **関連Issue**: Issue #2386 領域（AG-009(a)）
