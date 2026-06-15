# Draft: REQ authoring policy 再発防止強化

## 目的

REQ作成・保存・統合・昇格の各入口で「状態要件」と「反映作業」の分離を強制し、移行・変更・再定義・削除・改名・移管・除去などの作業手段がactive REQの要件行として保存されることを防止する。これにより、既存REQの修正だけでなく、将来のREQ生成・保存・統合・昇格の全入口で状態要件のみを保持する状態を継続的に維持する。

## 要件

| ID | 要件 |
|---|---|
| REQ-0102-NEW-1 | active REQは現在満たすべき状態・振る舞い・制約のみを保持する |
| REQ-0102-NEW-2 | 移行・変更・再定義・削除・改名・移管・除去などの作業手段をactive REQの要件行として保存しない |
| REQ-0102-NEW-3 | 作業手段はcase / Issue / 受け入れ条件 / 作業記録で扱い、active REQの要件行に混入しない |
| REQ-0102-NEW-4 | req-defineが入力内容を状態要件と反映作業に分離する責務を持つ |
| REQ-0102-NEW-5 | req-saveが反映作業のみの要件行が残る場合に保存を停止する責務を持つ |
| REQ-0102-NEW-6 | backlog-reviewがpromoted artifactをRU化する際に作業手段を要件化しない責務を持つ |
| REQ-0102-NEW-7 | inspect-promoteがinspect findingを要件化する際に作業手段を要件行へ混入させない責務を持つ |
| REQ-0102-NEW-8 | 要件分析・REQ作成支援skillが状態要件と反映作業の分離基準を判断基準として持つ |
| REQ-0102-NEW-9 | integrityがactive REQのtitle / 目的 / 要件行 / 適用範囲 / README active indexに作業手段語が混入していないかを検査対象とする |
| REQ-0102-NEW-10 | README active indexが作業名ではなく責務・状態・制約名を保持する契約になっている |
| REQ-0102-NEW-11 | SPECにREQ文書のtitle / purpose / requirement rows / scopeのcontent contractが定義されている |

## 適用範囲

- **対象**:
  - REQ-0102（要件定義・保存）: 全active REQに適用される状態要件化ルールの定義
  - `src/opencode/commands/agentdev/req-define.md`: 状態要件と反映作業の分離ゲート
  - `src/opencode/commands/agentdev/req-save.md`: 反映作業のみ要件行の保存停止ゲート
  - `src/opencode/commands/agentdev/backlog-review.md`: RU化時の作業手段除外
  - `src/opencode/commands/agentdev/inspect-promote.md`: finding要件化時の作業手段除外
  - `src/opencode/skills/agentdev-req-analysis/SKILL.md`: 状態要件と反映作業の分離基準
  - `docs/specs/*`: REQ文書のcontent contract
  - integrity rule catalog / integrity contracts: 作業手段語混入検査
  - `docs/requirements/README.md`: active indexの命名契約
- **対象外**:
  - active REQ全件の本文修正そのもの（→ OU-4-A/B/C）
  - retired REQ本文の修正
  - 実際のintegrity script実装修正
  - ADR/SPEC/command/skillの具体的差分作成

## Requirement Source

- RU-20260615-05（REQ authoring policy の再発防止強化）
- session:2026-06-15-req-authoring-policy-recurrence-prevention

## 関連ドキュメント更新候補

| 対象 | 分類 | 根拠 |
|---|---|---|
| REQ-0102 | 直接更新 | 状態要件化ルールの定義 |
| `src/opencode/commands/agentdev/req-define.md` | 直接更新 | 分離ゲートの追加 |
| `src/opencode/commands/agentdev/req-save.md` | 直接更新 | 保存停止ゲートの追加 |
| `src/opencode/commands/agentdev/backlog-review.md` | 直接更新 | RU化時の作業手段除外 |
| `src/opencode/commands/agentdev/inspect-promote.md` | 直接更新 | finding要件化時の除外 |
| `src/opencode/skills/agentdev-req-analysis/SKILL.md` | 直接更新 | 分離基準の追加 |
| `docs/specs/document-model.md` | 更新候補 | REQ content contract定義 |
| `docs/specs/integrity-rule-catalog.md` | 更新候補 | 作業手段語検査ルール |
| `docs/specs/integrity-contracts.md` | 更新候補 | REQ検査契約 |
| `docs/requirements/README.md` | 更新候補 | active index命名契約 |

## draft-meta

```yaml
work_type: feature
req-operation: UPDATE
target-req:
  - REQ-0102
adr-required: true
adr-subject: 文書種別の記述対象境界
adr-shared-with: [OU-2]
topic-slug: req-authoring-policy
scale: standard
status: saved
source-ru: RU-20260615-05
```

## ADR判断

### ADR禁止ゲート検証

ADR候補: 「文書種別の記述対象境界」（OU-2と共有）

| 禁止基準 | 該当 | 理由 |
|---|---|---|
| 仕様変更のみ・技術的決定ない | No | 全文書種別の記述対象方式を決定するアーキテクチャ判断 |
| command動作仕様の定義 | No | command仕様より上位の文書体系判断 |
| workflow定義・状態遷移 | No | 文書ライフサイクルを超える判断 |
| 命名規約・directory規約 | No | 規約レベルではなく原理レベル |
| 運用ルールの変更 | No | 運用ルールを超える体系判断 |
| template形式・入出力形式 | No | 形式レベルではない |
| 非技術的合意事項 | No | 文書システムアーキテクチャの技術的判断 |

**結論**: ADR禁止ゲートを通過。ADR作成必要（OU-2と共有、単一ADR）。

### ADR判断根拠

- **判断結果**: ADR作成必要（単一ADR、OU-2と共有）
- **ADR主題**: 文書種別の記述対象境界
- **適用基準**:
  - アーキテクチャ変更: 全文書種別（ADR/REQ/SPEC/guide）の記述対象方式を決定
  - 複数システム影響: REQ/ADR/SPEC/command/skill/integrityに影響
  - 長期間有効: 将来の全文書作成を制約する判断
- **決定内容**:
  - ADR は意思決定と理由を記録する
  - REQ は現在満たすべき状態・振る舞い・制約を記録する
  - SPEC は現行アーキテクチャと契約を記録する
  - 作業手段・移行手順・削除手順・改名手順は、case / Issue / PR / 作業記録で扱う
  - 過去判断を現行基盤から外すだけなら、新規ADRではなく retire / supersede で扱う
- **実効ルール配置**: ADRだけに閉じず、REQ / SPEC / command / skill / integrity / README に分担反映する

## operation_units

### OU-1: ADR全体棚卸し
- source_ru: RU-20260615-01
- target_req: REQ-0101
- operation: UPDATE
- work_type: maintenance
- scale: standard
- depends_on: []
- recommended_order: 1
- issue_policy: single
- result:

### OU-2: ADR意思決定境界の制度化
- source_ru: RU-20260615-02
- target_req: REQ-0101, REQ-0108
- operation: UPDATE
- work_type: feature
- scale: standard
- depends_on: [OU-1]
- recommended_order: 2
- issue_policy: single
- result:

### OU-3: case-auto Epic flow クリーンアップゲート
- source_ru: RU-20260615-03
- target_req: REQ-0104, REQ-0114
- operation: UPDATE
- work_type: feature
- scale: standard
- depends_on: []
- recommended_order: 1
- issue_policy: single
- result:

### OU-4-A: active REQ 全面作り直し
- source_ru: RU-20260615-04
- target_req: REQ-0103, REQ-0108, REQ-0112, REQ-0115, REQ-0119, REQ-0123, REQ-0124
- operation: UPDATE
- work_type: maintenance
- scale: large
- depends_on: [OU-2, OU-5]
- recommended_order: 3
- issue_policy: epic-child
- result:

### OU-4-B: active REQ 大幅修正
- source_ru: RU-20260615-04
- target_req: REQ-0101, REQ-0104, REQ-0105, REQ-0106, REQ-0107, REQ-0109, REQ-0113, REQ-0114, REQ-0120, REQ-0121
- operation: UPDATE
- work_type: maintenance
- scale: large
- depends_on: [OU-4-A]
- recommended_order: 4
- issue_policy: epic-child
- result:

### OU-4-C: active REQ 小規模修正 + index整合
- source_ru: RU-20260615-04
- target_req: REQ-0102, REQ-0110, REQ-0116, REQ-0117, REQ-0118, docs/requirements/README.md
- operation: UPDATE
- work_type: maintenance
- scale: standard
- depends_on: [OU-4-B]
- recommended_order: 5
- issue_policy: epic-child
- result:

### OU-5: REQ authoring policy 再発防止強化
- source_ru: RU-20260615-05
- target_req: REQ-0102
- operation: UPDATE
- work_type: feature
- scale: standard
- depends_on: [OU-2]
- recommended_order: 2
- issue_policy: single
- result:
    saved_req: [REQ-0102]
    operations:
      - UPDATE REQ-0102-006: active REQ全体の状態要件化スコープ拡張
      - UPDATE REQ-0102-007: 作業手段語拡張（移行・再定義・改名・移管・除去追加）
      - APPEND REQ-0102-049: 作業手段の移送先（case/Issue/作業記録）
      - APPEND REQ-0102-050: skill分離基準
    adr: ADR-0103（既存ADR重複確認により新規作成不要、REQ-0101-051準拠）
    source_ru_mapping: { RU-20260615-05: [UPDATE 006, 007, APPEND 049, 050] }
    skipped_new: [NEW-4(008と重複), NEW-5(009/010と重複), NEW-6〜11(他システム対象・関連doc更新候補)]

## execution_groups

### EG-1: ADR意思決定境界（棚卸し+制度化）
- id: EG-1
- type: wave
- purpose: ADR文書種別の記述対象境界を確立し、既存ADRの棚卸しと再発防止基盤を構築する
- included_ou: [OU-1, OU-2]
- rationale: OU-1(棚卸し)とOU-2(制度化)は同一メタ原則に基づく。OU-2はOU-1の結果を参照するため逐次実行が望ましい

### EG-2: case-auto修正
- id: EG-2
- type: standalone
- purpose: case-auto Epic flowでのクリーンアップスキップを修正する
- included_ou: [OU-3]
- rationale: 独立したbugfix(REQ修正のためfeature昇格)。EG-1と並行実行可能

### EG-3: active REQ状態要件化（Epic）
- id: EG-3
- type: epic
- purpose: active REQ全件(22件)を作業手段要件から状態要件へ変換する
- included_ou: [OU-4-A, OU-4-B, OU-4-C]
- rationale: 22件のREQ修正を全面作り直し(7件)→大幅修正(10件)→小規模修正+index(5件)の順に分解。A→B→Cの逐次依存

### EG-4: REQ作成ポリシー強化
- id: EG-4
- type: standalone
- purpose: REQ authoring policyの再発防止基盤を構築する
- included_ou: [OU-5]
- rationale: 機能追加として独立実行。EG-1(OU-2)の完了後に実行することが望ましい。EG-3(OU-4)はOU-5の完了後に開始
