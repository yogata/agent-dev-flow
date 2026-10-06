# traceability 対応宣言の inline×sidecar 同一集合維持を宣言追加手順へ前置する

## 背景

同一論理関係（artifact × role）に inline ADF-COVERS 宣言と traceability sidecar が並存する場合、traceability check は両情報源の REQ 集合完全一致を要求する（duplicate-inconsistencies 検査）。REQ 行の対応宣言追加を片側（sidecar のみ、または inline のみ）で行うと集合差分が即時 fail する事象が、case-run（sidecar 単独追加、Issue 3460・PR 3478）と case-open（inline 単独追加、Case 3501・PR 3503）の両方向で発生した。いずれも対側へ同一 REQ を追記して集合一致させることで解消した。

## 問題

対応宣言の追加手順に「同一 artifact × role の対側情報源（inline/sidecar）の存在確認と同一集合反映」が明示されていない。検出器（duplicate-inconsistencies）は存在して merge 前の最終 check で確実に fail するが、追加時点での前置確認がないため、検出までの hand-back コストが発生する。

## 望ましい変更

sidecar 対応宣言追加手順と case-open の宣言追随手順に、対側情報源の存在確認と同一集合維持を前置確認として明示する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-traceability/references/sidecar-and-policy.md`（対応宣言追加手順）
- `src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md`（STEP-3 手順 3・4 の ADF-COVERS 宣言追随手順）

### 対象外

- traceability check の duplicate-inconsistencies 検査ロジック（現行どおり）
- inline declaration 優先規則（現行どおり）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-traceability/references/sidecar-and-policy.md | 対応宣言追加時の対側 inline 宣言存在確認と同一集合反映の前置 |
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md | STEP-3 宣言追随確認に sidecar design セクション有無の事前確認と同一集合維持を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: traceability check（duplicate-inconsistencies 検査）、agentdev-traceability references/sidecar-and-policy.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 検出 check は存在するが、宣言追加手順側の対側確認・同一集合反映の規律が明示されていない

## 制約

- inline declaration 優先規則、集合完全一致契約は現行どおり変更しない
- 宣言追加先の正規判断（標準宣言先 sidecar 契約）は case-open Design が所有する

## 受け入れ条件

- [ ] sidecar-and-policy.md の対応宣言追加手順に対側情報源の存在確認と同一集合反映が明記される
- [ ] case-open STEP-3 の宣言追随手順に sidecar design セクション有無の事前確認が明記される

## 元learning item / 根拠

- **要約**: traceability inline×sidecar 二重宣言は集合完全一致契約で即検出される。追加時の対側同一集合維持が手順に明示されていない（2件）
- **根拠**: Issue 3460・PR 3478（sidecar 単独追加で duplicate-inconsistencies 2件、inline 追記で解消）、Case 3501・PR 3503（inline 単独追加で集合不一致、sidecar design セクション追記で解消）
- **再発条件**: inline 宣言が既存の artifact へ sidecar 経由（または逆）で対応宣言を追加する変更
- **横展開可能性**: REQ 行追加を伴う全 Case の対応宣言追加

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
