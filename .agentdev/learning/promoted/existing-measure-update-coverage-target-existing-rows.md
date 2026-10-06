# UPDATE 対象の既存 REQ 行を coverage・check の機械実行対象へ含める

## 背景

Definition PR 3489 の品質検査記録が「traceability check: missing-design 0 件（対象: REQ-053-041〜048、REQ-053-016、REQ-053-032）」と記録しながら、case-ready STEP-2 で merge 後 canonical に対する同対象の機械実行で missing-design 2件（REQ-053-016、REQ-053-032）を検出した（Issue 3486・PR 3489・merge 7f278d81）。両行は既存行で design 対応 0 relations（sidecar・inline とも design role 不在）が merge 前から存在し、本 Case が UPDATE 対象行として check 対象に含めたことで初めて機械検出された。case-ready は差し戻し契約に従い case-open へ差し戻して停止した。

## 問題

PR 側の coverage --req 実行対象が新規行（041〜048）に限定され、UPDATE 対象の既存行（016/032）の design 対応欠落を品質検査記録が検出できなかった。Definition Package の品質検査の対象行集合規定に「UPDATE 対象行を coverage・check の機械実行対象へ含める」ことと、「design 対応 0 件の既存行を UPDATE 対象にする場合は design 宣言追加を同一 Package へ含める」ことが規定されていない。

## 望ましい変更

case-open Design（Definition Package 生成・品質検査）へ UPDATE 対象行を coverage --req / check --req の機械実行対象へ含める対象行集合規定を設ける。case-ready の definition-acceptance.md に STEP-2 機械実行対象（merge 後 canonical での全対象行）を明示する。

## 対象範囲

### 対象

- `docs/designs/workflows/case-open.md`（Definition Package 生成・品質検査の対象行集合規定。パスは候補）
- `src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md`（STEP-2 機械実行対象の明示）

### 対象外

- traceability check の missing-design 検出基準（現行どおり）
- 既存行の design 対応欠落の是正（REQ-053-016/032 は本 Case で解消済み）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/workflows/case-open.md（Definition Package 生成節） | UPDATE 対象行を機械実行対象へ含める規定 |
| 配布skill reference | src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md | STEP-2 機械実行対象の明示 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: case-ready STEP-2 の missing-design ゲート（merge 後 canonical での機械実行、今回機能）、CR-001 design 対応事前確認
- **ギャップ分類**: fix gap
- **ギャップ詳細**: PR 側品質検査の対象行集合（coverage/check の対象行規定）と UPDATE 時の design 宣言追加包含規定が case-open 側にない。検出が case-ready STEP-2 に一本化され工程手戻りが大きい

## 制約

- case-ready STEP-2 ゲート（merge 後 canonical 再実行）は現行どおり維持する（前置確認の追加が対象）
- UPDATE 操作の semantics は現行どおり

## 受け入れ条件

- [ ] case-open Design に UPDATE 対象行を coverage/check 対象へ含める規定が明記される
- [ ] design 対応 0 件の既存行を UPDATE する場合の design 宣言追加包含が明記される

## 元learning item / 根拠

- **要約**: Definition PR の品質検査記録は coverage 対象外の既存行の missing-design を検出できず case-ready STEP-2 で表面化する。UPDATE 対象行の機械実行対象包含で前置化できる（1件）
- **根拠**: Issue 3486・PR 3489（merge 7f278d81、REQ-053-016/032 の design role 不在、coverage 実測 0 relations）
- **再発条件**: 既存 REQ 行を UPDATE 操作対象に含む Definition の case-open 生成・case-ready 受入
- **横展開可能性**: UPDATE 操作を伴う全 Definition Package（潜在欠落の表面化を構成欠漏として扱う観点は汎用）

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
