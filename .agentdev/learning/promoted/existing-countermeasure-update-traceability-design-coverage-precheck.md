# 既存対策の更新: 意味変更対象 REQ 行の design 対応事前確認（case-ready ゲート停止の予防手順）

## 背景

Case #3123（Definition PR #3124 merge 後の case-ready STEP-2 canonical 再取得）で、traceability check の missing-design fail（exit 2）により workflow 契約（STEP-2 差し戻し分岐・fail-closed・手動判断での代替禁止）に従い case-open 差し戻し・ready 未遷移で停止した。
欠落は pre-merge baseline（7847b412）で既に存在する既知の design 対応欠落（REQ-031-030: Design 対応 0 件）であり、本 Case 由来の増分はなかった。lifecycle gate completeness は対象要件行 scope で fail-closed であり、baseline 既知の例外は契約上 missing-verification にしかない。
REQ-034-025/028/044/045 の新規行は case-open の missing-design 0 件ゲートを通過したが、意味変更行 REQ-031-030 には増分ベースの判定で適用されなかった（比較: 兄弟 Case 新設の REQ-031-033 は case-run.md Design の design 対応 1 件を持つ）。

## 問題

req-define / case-open の Definition Package 生成時に「既存行の意味変更」を対象とする場合、当該行（新規行に加え意味変更行）の現行 design 対応有無の確認が手順に組込まれていない。
baseline で design 対応 0 件の既存 REQ 行を対象に含む Definition Case は case-ready の lifecycle gate completeness で必ず停止し得る（corpus の missing-design 既知債務 877 行の範囲で発生余地がある）。

## 望ましい変更

req-define / case-open の Definition Package 生成手順に、「対象行の design 対応事前確認（traceability coverage --req）と欠落時の artifact_actions 組込み」ステップを追加する。

- 対象行の特定: 新規行に加え意味変更する既存行。
- 確認方法: `coverage --req <対象行ID>` による design 対応有無の実査（欠落時は欠落が baseline 既知であることの確認を含む）。
- 欠落時の処置: Definition 内で design 対応追加（例: 実現 Design の ADF-COVERS(design) 宣言追記）を artifact_actions に含めて合意する。

## 対象範囲

### 対象

- req-define / case-open の Definition Package 生成手順（workflow skill reference・Design の手順記述）
- case-ready STEP-2 の lifecycle gate completeness との接続（事前確認がゲート通過の前提になる旨の注記）

### 対象外

- case-ready の lifecycle gate completeness 契約自体の変更（現行契約の正しい適用。ゲート契約変更は別 Case）
- traceability check / coverage の実装変更
- REQ-031-030 自体の design 対応追加（本学びの対象 Case の範囲外）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-workflow-req-define/references/（該当 reference。req-define が特定） | Definition Package 生成手順への「対象行 design 対応事前確認」ステップ追記 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/SKILL.md | STEP-2/STEP-3 の Definition Package 生成における意味変更行の coverage 確認注記 |
| Design | docs/designs/commands/case-open.md | 意味変更行の design 対応事前確認と欠落時 artifact_actions 組込みの手順記述 |

## 既存対策確認

- **確認結果**: 既存対策あり（case-open の missing-design 0 件ゲート、case-ready の lifecycle gate completeness、agentdev-traceability の check/coverage）
- **該当ファイル**: src/opencode/skills/agentdev-traceability/（check.ts、coverage、references/check-interpretation.md〔実在確認済み・completeness の 2 層解釈〕）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: case-open の missing-design 0 件ゲートは増分ベース（新規行のみ）の判定であり、意味変更行の baseline 既知 design 対応欠落を Definition 計画時に検出・対処する手順が存在しない。結果として欠落行を含む Case は case-ready の lifecycle gate（対象行 scope・fail-closed）で必ず停止する。

## 制約

- case-ready の lifecycle gate completeness の fail-closed 契約と手動判断での代替禁止は維持する（本学びは契約変更ではなく手順の事前整備）。
- baseline 既知の missing-design は本手順で design 対応追加を合意するか、Case 範囲から外す判断を Definition Package に明示して合意する。
- Case #3123 は merge 巣き戻しを行わず（resume protocol）、DEC-042 proposed 維持・draft 保持で停止した実績がある（停止時の扱いは既存 resume 契約に従う）。

## 受け入れ条件

- [ ] Definition Package 生成手順に意味変更対象行の design 対応事前確認ステップ（coverage --req）が追加されている
- [ ] 欠落検出時の artifact_actions 組込み（design 対応追加の合意）の手順が明記されている
- [ ] 事前確認を行わない Case が case-ready ゲートで停止し得る旨の注意書きが手順側に存在する

## 元learning item / 根拠

- **要約**: baseline 既知 missing-design 行を意味変更する Definition Case が case-ready lifecycle gate で必ず停止する構造的予防手順の欠落。
- **根拠**: Case #3123（Definition PR #3124 merge 後）の実停止事象。traceability check `--req REQ-034-025,REQ-034-028,REQ-034-044,REQ-034-045,REQ-031-030` の missing-design fail（exit 2）、coverage.ts による REQ-031-030 の design 0 件 / implementation 3 件実査、pre-merge baseline 7847b412 での同一検出再現。Root Case #3123 本文へ停止理由・証跡・再開条件を記録済み。
- **再発条件**: baseline で design 対応 0 件の既存 REQ 行を対象に含む Definition Case が case-ready に到達した場合に毎回再発し得る（corpus の missing-design 既知債務 877 行の範囲で発生余地がある）。
- **横展開可能性**: req-define / case-open 経由で既存行を意味変更する全 Case に共通する手順ギャップ。traceability を使用するワークフロー全体で再利用可能。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation（手順追記）
- **関連Issue**: Case #3123（PR #3124）
