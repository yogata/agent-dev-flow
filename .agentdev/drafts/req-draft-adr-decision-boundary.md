# Draft: ADR意思決定境界の制度化と再発防止

## 目的

ADRが「意思決定（あるべき状態）」を記述する文書であり、削除・廃止・移行・完全削除などの作業手段を主題としないという境界を、作成・更新・検査の各入口に制度化する。これにより、作業手段を主題にした不適切なADRの再発を防止する。

## 要件

| ID | 要件 |
|---|---|
| REQ-0101-NEW-1 | accepted ADRは、将来の構造・責務境界・運用原則などの「あるべき状態」を意思決定として記述する |
| REQ-0101-NEW-2 | accepted ADRに、削除・廃止・移行・統合・再構築・完全削除そのものを主題にしたADRが存在しない |
| REQ-0101-NEW-3 | 過去の判断を現行基盤から外す場合、新規ADRではなく既存ADRのstatus遷移（retire/supersede）で処理する |
| REQ-0101-NEW-4 | 新規ADRは、旧判断を置き換える新しい「あるべき状態」の意思決定が存在する場合のみ作成する |
| REQ-0108-NEW-1 | integrity/docs-checkがaccepted ADRのタイトル・本文に作業手段（削除・廃止・移行・完全削除）の混入を検出する |
| REQ-0108-NEW-2 | integrity/docs-checkがretired ADRの現行基盤参照を検出する |
| REQ-0108-NEW-3 | integrity/docs-checkがaccepted ADRとretired ADRのindex整合性を検査する |
| REQ-0101-NEW-5 | req-defineのADR作成可否ゲートが、作業手段を主題にしたADR候補を拒否する |
| REQ-0101-NEW-6 | agentdev-adr-guidelinesがADR作成可・不可の明示的条件を定義する（「微妙な場合はADR側に寄せる」趣旨の記述は今回の基準と矛盾しない） |
| REQ-0101-NEW-7 | agentdev-adr-file-managerが、単なる廃止・削除・移行を新規ADRではなくretire/supersedeで扱う基準を定義する |
| REQ-0101-NEW-8 | docs/specsの文書種別責務境界が「ADRはwhy/decision、SPECはcurrent architecture/what is、REQは満たすべき要件」という役割分担を反映し、矛盾しない |

## 適用範囲

- **対象**:
  - REQ-0101（文書・REQ管理基準）: ADR文書種別定義の強化
  - REQ-0108（docs-check / Validation）: ADR主題妥当性の継続検出
  - `src/opencode/commands/agentdev/req-define.md`: ADR作成可否ゲート
  - `src/opencode/skills/agentdev-adr-guidelines/SKILL.md`: ADR作成可否条件
  - `src/opencode/skills/agentdev-adr-file-manager/SKILL.md`: retire/supersede基準
  - `docs/specs/*`: 文書種別責務境界
  - integrity rule catalog / integrity contracts: ADR主題妥当性検査
- **対象外**:
  - 既存ADR群の個別棚卸し・retire・本文再構成（→ OU-1）
  - `docs/adr/retired/`配下の歴史記録本文の書き換え
  - コード実装そのもの
  - 未合意の個別ADR採否判断の確定

## Requirement Source

- RU-20260615-02（ADR意思決定境界の制度化と再発防止）
- session:2026-06-15-adr-decision-boundary-review

## 関連ドキュメント更新候補

| 対象 | 分類 | 根拠 |
|---|---|---|
| REQ-0101 | 直接更新 | ADR文書種別定義への境界追加 |
| REQ-0108 | 直接更新 | integrity検査観点の追加 |
| `src/opencode/commands/agentdev/req-define.md` | 直接更新 | ADR作成可否ゲートの追加 |
| `src/opencode/skills/agentdev-adr-guidelines/SKILL.md` | 直接更新 | 作成可否条件の更新 |
| `src/opencode/skills/agentdev-adr-file-manager/SKILL.md` | 直接更新 | retire/supersede基準の追加 |
| `docs/specs/document-model.md` | 更新候補 | 文書種別責務境界の反映 |
| `docs/specs/integrity-rule-catalog.md` | 更新候補 | ADR主題妥当性ルールの追加 |
| `docs/specs/integrity-contracts.md` | 更新候補 | ADR検査契約の追加 |

## draft-meta

```yaml
work_type: feature
req-operation: UPDATE
target-req:
  - REQ-0101
  - REQ-0108
adr-required: true
adr-subject: 文書種別の記述対象境界
adr-shared-with: [OU-5]
topic-slug: adr-decision-boundary
scale: standard
status: draft
source-ru: RU-20260615-02
```

## ADR判断

### ADR禁止ゲート検証

ADR候補: 「文書種別の記述対象境界」

| 禁止基準 | 該当 | 理由 |
|---|---|---|
| 仕様変更のみ・技術的決定ない | No | 全文書種別の記述対象方式を決定するアーキテクチャ判断 |
| command動作仕様の定義 | No | command仕様より上位の文書体系判断 |
| workflow定義・状態遷移 | No | 文書ライフサイクルを超える判断 |
| 命名規約・directory規約 | No | 規約レベルではなく原理レベル |
| 運用ルールの変更 | No | 運用ルールを超える体系判断 |
| template形式・入出力形式 | No | 形式レベルではない |
| 非技術的合意事項 | No | 文書システムアーキテクチャの技術的判断 |

**結論**: ADR禁止ゲートを通過。ADR作成必要。

### ADR判断根拠

- **判断結果**: ADR作成必要（単一ADR、OU-5と共有）
- **ADR主題**: 文書種別の記述対象境界
- **適用基準**:
  - アーキテクチャ変更: 全文書種別（ADR/REQ/SPEC/guide）の記述対象方式を決定
  - 複数システム影響: REQ/ADR/SPEC/command/skill/integrityに影響
  - 長期間有効: 将来の全文書作成を制約する判断
  - 過去の前例: ADR-0110（requirements/views廃止）・ADR-0113（review系コマンド完全削除）が作業手段を主題にした不適切ADRの例
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
