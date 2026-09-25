# 既存対策の更新: agentdev_jev observation_write completion モードの schema 表示と実装乖離の明示化

## 背景

case-ready workflow STEP-5 の Jev 先行評価の観測完成書込み（Case #3139・observationId case-ready-3139-standard-epic）で、agentdev_jev observation_write の completion 書込み（observationId 指定・partial 記録の完成）に、ツール schema 定義の observation 必須フィールド群（workflow、judgmentKind、subject、provider、requestedModel、sourceRevision、outcome、durationMs、inputs、judgments[].confidence 等の run-level フィールド）を含む payload を送ったところ「unknown completion observation field: durationMs」（順に confidence、inputs、judgmentKind も同様）の invalid_input で拒否が連続した。
実際の受理条件は schemaVersion + judgments[].llmFinalJudgment / llmTreatment（judgmentId 付き）の最小 payload のみで、run-level フィールドは evaluate 時点で partial 記録へ既に書き込まれているため不要。4回の invalid_input 試行後に最小 payload で成功した。
根本原因は、completion モード（observationId あり）のバリデーションが「追記許容フィールド = LLM final-judgment 関連のみ」の厳密 allowlist で実装されているのに対し、公開 schema 定義は run-level 必須フィールドを含む完全 observation 形を required として表示しており、両者の乖離が呼出側に伝わらないことにある。

## 問題

Custom Tool の completion / idempotent 追記系操作において、公開 schema 定義（入力 schema の required 表示）と実装の受理条件（completion allowlist）の乖離が呼出側に伝わらない。
呼出側は schema required 表示を信用して完全 observation を送り、invalid_input（retryable: false）の連続拒否に至る。この乖離は Jev 以外の 2段階書込み系操作でも再現し得る。

## 望ましい変更

observation_write completion モードの入力 schema を「llmFinalJudgment / llmTreatment 追記専用」へ明示分離する修正（Custom Tool 内部実装の責務）を候補とする。

- completion モードの入力 schema 表示に、run-level フィールドが evaluate 時点で partial 記録へ書き込み済みであり追記不要である旨を明示する。
- 呼出側運用として、completion / idempotent 追記系操作は schema 定義の required 表示を信用せず partial レコードの実物と差分比較で必要フィールドを特定する知見を運用文書へ反映する候補。

## 対象範囲

### 対象

- Custom Tool agentdev_jev の observation_write completion モードの入力 schema 表示と実装の整合
- 2段階書込み系操作の schema 表示規約の確認

### 対象外

- docs/designs/responsibilities/custom-tool-contracts.md「Jev 先行評価」節への Design 契約の重複追加（ユーザー決定〔2026-09-25〕により冗長な Design 追加はしない。同節は 2段階書込みと llmFinalJudgment / llmTreatment 追記完成 mode を既に規定〔custom-tool-contracts.md:86 実読確認済み〕）
- evaluate / observation_write の書込み先・観測 JSON 形式（REQ-090-006）の変更
- 部分レコードの機械判別可能な完了状態 field の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Custom Tool | src/opencode/tools/agentdev-jev/（observation_write 入力 schema 定義。req-define が該当実装を特定） | completion モード入力 schema の追記専用への明示分離（内部実装の責務） |
| Design | docs/designs/responsibilities/custom-tool-contracts.md | 追記完成 mode の許容フィールド明示の要否判断（重複追加ではなく既記述の明確化のみに限る） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: docs/designs/responsibilities/custom-tool-contracts.md:86（2段階書込み〔観測の永続化〕: evaluate が partial 作成・observation_write が LLM final-judgment field 追記で完成させる規定。実読確認済み）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: Design 契約は追記完成 mode を規定するが、Tool の公開 schema 定義（入力 schema の required 表示）が completion モードでも完全 observation 形を required 表示しており、schema 表示と実装 allowlist の乖離が契約文面でも Tool schema 表示でも明示されていない。

## 制約

- ユーザー決定（2026-09-25）により、Design 契約の冗長な追加記述は行わない（custom-tool-contracts.md が追記完成 mode を既規定のため）。処分は schema 表示と実装の乖離の解消に限定する。
- Tool の公開契約は provider・SDK 非依存を維持する。
- 実施する場合の修正は Tool 内部実装（schema 表示）の責務であり、Workflow 層の変更を伴わない。

## 受け入れ条件

- [ ] observation_write completion モードの入力 schema 表示と実装 allowlist の乖離が解消（または明示化）されている
- [ ] completion モードで run-level フィールドが追記不要である旨が呼出側から判別可能である
- [ ] custom-tool-contracts.md に契約と矛盾する重複記述が追加されていない

## 元learning item / 根拠

- **要約**: agentdev_jev observation_write の completion モードは LLM final-judgment フィールドのみ受理し schema 表示の run-level 必須フィールドは拒否される（schema 表示と実装の乖離）。ユーザーHITL承認（2026-09-25）により既存対策の更新として確定（冗長な Design 追加なし）。
- **根拠**: Case #3139 の実観測。「unknown completion observation field: durationMs / confidence / inputs / judgmentKind」の invalid_input（retryable: false）連続 4回後、最小 payload（schemaVersion + judgments[].{judgmentId, llmFinalJudgment, llmTreatment}）で成功。partial レコード JSON（.agentdev/jev-observations/case-ready-3139-standard-epic.json）を直接読取して既存フィールド群との差分比較で必要フィールドを特定。workflow 成功に支障なし（観測記録は completed で完成・partial からの差分追記は idempotent）。
- **再発条件**: observation_write completion モードで schema required 表示どおりの完全 observation を送る場合に毎回再発。
- **横展開可能性**: 2段階書込み・idempotent 追記系の Custom Tool 操作全般に共通する schema 表示規律の知見。この乖離は Jev 以外の同種操作でも再現し得る。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug（schema 表示と実装の乖離解消）
- **関連Issue**: Case #3139
