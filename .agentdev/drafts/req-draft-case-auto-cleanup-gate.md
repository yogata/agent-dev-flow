# Draft: case-auto Epic flow クリーンアップゲート

## 目的

case-auto（/agentdev/case-auto）でEpic flow（scale=large）を実行した際、case-openの共通終了処理（Step 17〜18-2: コメント追加・ドラフト削除・RU削除・完了報告）がスキップされず確実に実行されることを保証する。また、Epic Issueのキュー処理開始前にクリーンアップ検証ゲートを配置し、ドラフト・RUファイルの残存を検出した場合に停止する。

## 要件

| ID | 要件 |
|---|---|
| REQ-0104-NEW-1 | case-open.mdの共通終了処理（Step 17〜18-2）がStandard flowとEpic flowの全フロー共通処理として独立セクションに分離されている |
| REQ-0104-NEW-2 | case-open.mdのEpic flowセクション完了後に共通終了処理（Step 17〜18-2）を実行する旨の明示的ルーティングがある |
| REQ-0104-NEW-3 | case-open.mdのStep 18（ドラフト削除）・18-1（RU削除）にStandard/Epic全フロー共通である旨の注記がある |
| REQ-0114-NEW-1 | case-auto.mdのEpic Issue分岐ロジックで"case-open相当処理"に共通終了処理（コメント追加・ドラフト削除・RU削除・完了報告）が含まれる |
| REQ-0114-NEW-2 | case-auto.mdにEpic Issue Step 4-1キュー処理開始前のクリーンアップ検証ゲートがある |
| REQ-0114-NEW-3 | クリーンアップ検証ゲートがドラフトファイル（.agentdev/drafts/req-draft-*.md）の残存を検出した場合に停止する |
| REQ-0114-NEW-4 | クリーンアップ検証ゲートがRUファイル（.agentdev/backlog/req-units/RU-*.md）の残存を検出した場合に停止する |
| REQ-0114-NEW-5 | クリーンアップ検証ゲートの実行結果がcase-auto完了報告（Step 8）に含まれる |

## 適用範囲

- **対象**:
  - REQ-0104（Workflow / Command Protocol）: case-open共通終了の位置づけ・全フロー共通処理の定義
  - REQ-0114（/agentdev/case-auto 最大自走モード）: case-auto分岐ロジック・クリーンアップ検証ゲート
  - `src/opencode/commands/agentdev/case-open.md`: セクション構造修正（共通終了の分離・Epic flowからのルーティング明記）
  - `src/opencode/commands/agentdev/case-auto.md`: 分岐ロジック修正・検証ゲート追加
- **対象外**:
  - case-run, case-closeの手順変更
  - 過去のファイル削除漏れの遡及修正（手動削除で都度対応）
  - 実装コードの変更（本要件はreq-define → req-save → case-open → case-runで実装する）

## Requirement Source

- RU-20260615-03（case-auto Epic flow での case-open 共通終了スキップ防止）
- session:2026-06-15-case-auto-cleanup-gap

## 関連ドキュメント更新候補

| 対象 | 分類 | 根拠 |
|---|---|---|
| REQ-0104 | 直接更新 | 共通終了処理の全フロー共通位置づけ |
| REQ-0114 | 直接更新 | case-auto分岐ロジック・検証ゲート |
| `src/opencode/commands/agentdev/case-open.md` | 直接更新 | セクション構造修正 |
| `src/opencode/commands/agentdev/case-auto.md` | 直接更新 | 分岐ロジック・検証ゲート |

## draft-meta

```yaml
work_type: feature
work_type_note: bugfixから昇格（REQ-0104, REQ-0114修正を伴うため）
req-operation: UPDATE
target-req:
  - REQ-0104
  - REQ-0114
adr-required: false
topic-slug: case-auto-cleanup-gate
scale: standard
status: saved
source-ru: RU-20260615-03
```

## ADR判断

### ADR禁止ゲート検証

本OUはADR閾値未満。対象はcommand動作仕様の修正とworkflow定義の明確化であり、アーキテクチャ変更ではない。

- 該当: command動作仕様の定義（case-open.md, case-auto.md）、workflow定義の明確化
- 分類先: REQ更新候補

**結論**: ADR不要。

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
  - saved_req_docs: [REQ-0104, REQ-0114]
  - ou_to_req_mapping: { OU-3: [REQ-0104-045-047, REQ-0114-059-063] }
  - source_ru_to_ou_mapping: { RU-20260615-03: OU-3 }
  - case_open_input: { draft_path: .agentdev/drafts/req-draft-case-auto-cleanup-gate.md, ou_id: OU-3, req_files: [docs/requirements/REQ-0104.md, docs/requirements/REQ-0114.md] }

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
