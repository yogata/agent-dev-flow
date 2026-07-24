---
draft_type: req_draft
topic_slug: req-cross-reference-integrity
status: saved
spec_actions_consumed: true
created_at: 2026-07-23T00:00:00+09:00
source_rus: [RU-0014, RU-0023, RU-0024]
agentdev_handoff: true
---

# draft-data

```yaml
work_type: maintenance
scale: standard

summary: |
  C4 は、REQ-0146 の参照意味不一致と現行 SPEC の工程固有識別子を扱う。
  REQ-0146-011 を識別子中心評価へ更新し、前工程完了度は REQ-0146-016 として分離する（RU-0014）。
  20 SPEC の工程固有識別子を除去し、安定根拠（REQ/ADR）へ置換する（RU-0024）。
  RU-0023 の関連情報セクション追加要求は現行3セクション契約（REQ-0101-070、patterns.md、doc_requirement.md）により superseded として除外する。skill 側（agentdev-req-file-manager/SKILL.md、matching-and-merge.md）に残る旧記述のみ OU-006 で是正する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    source_ru: RU-0014
    content: |
      QG-4 の識別子中心評価は、ファイルパス、REQ ID、NG ID、IR ID 等の識別子を主評価値とし、件数や行数等の実測値を補助値として扱う。
      REQ-0146-011 はこの振る舞いを表す要件とする。
  - id: AG-002
    source_ru: RU-0014
    content: |
      case-open は子 Issue 本文に前工程完了度を記録し、後続工程が前工程の完了状態を確認できる。
      この契約は REQ-0146-011 から分離した REQ-0146-016 とする。
  - id: AG-003
    source_ru: RU-0014
    content: |
      QG-4 観点9 の運用実例集は REQ-0146-011 と意味を一致させる。
      REQ-0146-011 の意味不一致を説明する暫定注記は削除する。

  - id: AG-008
    source_ru: RU-0024
    content: |
      RU-0024 が列挙する 20 SPEC の現行基準本文から、AG-001 から AG-019、および RU-20260722-01、RU-20260722-02 の工程固有識別子を除去する。
      選択肢 A を採用し、機械的置換を基本とする。
  - id: AG-009
    source_ru: RU-0024
    content: |
      工程固有識別子の除去後も、各 SPEC の現在契約、主論理区分、正規所有対象は失わない。
      現行の根拠が必要な箇所は REQ または accepted ADR の安定 ID を用い、経緯だけを示す識別子は削除する。
  - id: AG-010
    source_ru: RU-0024
    content: |
      responsibility-boundary-purification.md 自身に残る横断是正由来の工程固有識別子を除去する。
      自己言及的な例外を設けず、他の 19 SPEC と同じ基準で扱う。

  - id: AG-013
    source_ru: RU-0023
    content: |
      agentdev-req-file-manager の SKILL.md と references/matching-and-merge.md に残る関連情報セクション前提、ADR 逆参照前提を現行3セクション契約（REQ-0101-070、patterns.md、doc_requirement.md）へ是正する。
      RU-0023 由来の追加要求（AG-004）は現行契約により superseded だが、skill 側の旧記述のみ残存するため OU-006 で実施する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0146.md
    target_req: REQ-0146
    target_area: "## 要件"
    source_items: [AG-001, AG-002]
    content: |
      ## 要件

      | ID | 要件 |
      |----|------|
      | REQ-0146-003 | case-open は draft/RU 削除 commit 後に即時 push する（case-run 引き継ぎでの pull 失敗防止） |
      | REQ-0146-004 | case-auto 委譲契約 MUST NOT DO は「実質的 SPEC/REQ/ADR 内容編集禁止（lifecycle 状態遷移 draft→accepted は除く）」である |
      | REQ-0146-005 | case-close は squash merge 後ローカル先行 commit を検出し、内容重複確認後に reset する（git pull --ff-only 失敗の防止） |
      | REQ-0146-006 | git-common-procedures.md は squash merge 後分岐ハンドリング手順（log/diff/reset）を含む |
      | REQ-0146-007 | req-define は実行主体分類表（adapter skill / command / subagent / harness）を必須項目として含む |
      | REQ-0146-008 | 3層検出構造（機械=docs-check+IR / 意味=inspect-skills / 査読=doc-writing）の責務分担が SPEC 化されている |
      | REQ-0146-009 | `agentdev-doc-writing` SKILL は査読観点の横断適用指針を含む |
      | REQ-0146-010 | epic-wave-model.md は OU 属性「前工程完了度: 完全完了/検証のみ/補完あり」3段階分類を定義する |
      | REQ-0146-011 | QG-4 の横断評価は、識別子を主評価値、実測値を補助値とする運用実例に基づき、評価対象を安定して特定すること |
      | REQ-0146-012 | subagent-protocol.md は前工程完了度に応じた振る舞い指針（検証のみでも acceptance criteria 順位検証は必須等）を明示する |
      | REQ-0146-013 | command-authoring SKILL は「サブセクション化 vs リスト1行追記」の判断基準（情報量、独立性、将来拡張見込み）を明示する |
      | REQ-0146-014 | バッチ Issue 運用は OU ごとの完了判定追跡性を確保する（sub-issue 分離または Issue 本体の完了判定表） |
      | REQ-0146-015 | QG-4（最終受け入れ判定）で完了条件が横断評価を含む場合、PR が一部ファイル修正の時は「PR 対象範囲 vs 全体」の判定ルールを qg-4-final-acceptance.md reference の判定マトリクスに基づき適用すること。識別子中心評価（REQ-0146-011）の運用実例集を同 reference に蓄積し、主評価値（識別子）と補助値（実測値）の使い分けを明確にすること |
      | REQ-0146-016 | case-open は子 Issue 本文に前工程完了度を記録し、後続工程が前工程の完了状態を確認できること |

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/quality/quality-gates.md
    target_spec: docs/specs/quality/quality-gates.md
    target_area: "## QG-4: Final Acceptance Gate"
    source_items: [AG-003]
    condition: "quality-gates.md に REQ-0146-011 の直接参照を追加または更新する場合のみ実施する。"
    implementation_targets:
      - src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
    content: |
      ## QG-4: Final Acceptance Gate

      ### 目的

      case-close で PR マージ前に、最終受け入れ状態を確認する。
      Issue 完了条件チェックボックスの全達成、CI 通過、ドキュメント整合性を検証する。

      ### 配置

      - **case-close**: 前提確認（Step 2）、docs 検証（Step 3, 3-1）。PR / CI / Issue チェックボックスを対象に完了証拠を確認。

      ### pass / fail 基準

      - **pass**: 完了条件チェックボックスが全て `[x]`、CI 通過、docs 整合性確認済み。マージ可能。
      - **fail**: 未達チェックボックスが残る、CI 失敗、docs 不整合あり。構造化エラーで停止。

      ### 完了条件チェックボックス評価

      QG-4 は Issue 本文の完了条件セクションのチェックボックスを品質ゲートとして評価する。
      識別子中心評価（REQ-0146-011）を主評価値とし、件数や行数などの実測値は補助値として扱う。
      未達項目は case-run への差し戻し（G08）、または intake への逃がし禁止（G16）として扱う。

      ### 詳細

      判定基準、検査観点の詳細は `agentdev-quality-gates` スキルの `references/qg-4-final-acceptance.md` を参照。識別子中心評価の運用実例集は同 reference が蓄積し、REQ-0146-011 と意味を一致させる。

      #### test strategy 処理完了確認

      全 test strategy 項目が合格済みまたは Findings 記録済みであることを確認する。
      未処理の test strategy 項目が残る場合、完了扱いとしない。

  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_spec: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "## REQ/SPEC 記述基準"
    source_items: [AG-008, AG-009]
    content: |
      ## REQ/SPEC 記述基準

      REQ 記述と SPEC 記述の内容基準、learning/intake 由来変更の分類、分類根拠の伝播を規定する（ADR-0139）。

      ### REQ 記述基準: ステークホルダー視点と4妥当性基準

      REQ 記述はステークホルダー視点に従うこと（REQ-0101-079）。REQ 候補要件行は次の4妥当性基準を満たすこと:

      | 妥当性基準 | 内容 |
      |---|---|
      | 要求元ステークホルダー特定 | 要求する主体（利用者、運用者、開発者、外部システム等）を特定できること |
      | 観測可能成果 | ステークホルダーが得る成果または回避できる問題を説明できること |
      | 内部実装非依存 | 成果物内部を知らなくても達成を観測できること |
      | 要求文存立 | 内部構成を変更しても要求文が成立すること |

      安定契約例外（REQ-0101-069）に該当する要件行候補は、上記4妥当性基準を満たさなくても REQ に要約として記述できる。詳細は `../foundations/document-model.md`「安定契約の例外」を参照。

      ### learning/intake 由来変更の変更種別分類

      learning/intake 成果物から後続工程（RU、req-define、spec-save）へ引き継ぐ変更種別を次の8種別で分類する（REQ-0136-033）:

      | 変更種別 | 内容 | REQ 拡張候補 |
      |---|---|---|
      | 新しい利用者要求 | 既存REQ が要求を保持していない新しいステークホルダー要求 | ○（REQ 作成または拡張） |
      | 外部契約変更 | 利用者から見える外部契約の変更 | ○（REQ 作成または拡張） |
      | バリエーション追加 | 既存要求を満たすバリエーション追加 | ×（SPEC 拡張） |
      | エッジケース | エッジケース対応 | ×（SPEC 拡張） |
      | パラメータ調整 | retry 回数、timeout、閾値、重み等の調整 | ×（パラメータSPEC 拡張） |
      | 不適合修正 | 既存REQ/SPEC への不適合修正 | ×（SPEC 修正） |
      | 内部再構成 | 外部挙動を変えない内部再構成 | ×（SPEC 再構成） |
      | 文書訂正 | 文書記述の訂正 | ×（文書修正） |

      REQ 拡張を候補とするのは「新しい利用者要求」または「外部契約変更」に該当する場合のみとする。それ以外は既存 REQ が要求を既に保持している限り REQ を拡張しない。

      ### 分類根拠の引き継ぎ要件

      learning/intake 成果物から後続工程（RU、req-define、spec-save）へ引き継ぐ分類根拠を次の8項目とする（REQ-0136-033）:

      | 分類根拠 | 内容 |
      |---|---|
      | 変更の性質 | 新しい利用者要求/外部契約変更/バリエーション/エッジケース/パラメータ調整/不適合修正/内部再構成/文書訂正のいずれか |
      | REQ影響の有無 | 既存REQ への影響有無 |
      | 対象ステークホルダー | 変更が影響するステークホルダー |
      | 利用者から見える変更の有無 | 利用者から観測可能な変更か否か |
      | SPEC論理区分 | 挙動SPEC/カタログSPEC/横断契約SPEC/パラメータSPEC/実装詳細SPEC のいずれか |
      | 正規所有対象 | 対象 command、skill、workflow、品質ルール、整合性ルール等 |
      | 追記先を選択した理由 | 当該追記先を選んだ根拠 |
      | 根拠となる観測事実 | 変更が必要となった観測事実（CI 失敗、誤検出、エッジケース発見等） |

      分類根拠は soft-contract（ADR-0124）として追加情報扱いとし、欠落時は unknown 既定値で警告する後方互換運用をとる。具体的なフィールド名、enum 表現、シリアライズ形式は `artifact-contracts.md`「分類根拠伝播契約」で定義する。

  - id: ACT-SPEC-026
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_spec: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "## SKILL 構造（概要節/機能節役割分担）"
    source_items: [AG-008, AG-009]
    content: |
      ## SKILL 構造（概要節/機能節役割分担）

      SKILL.md の節構成は以下の役割分担に従う。

      | 節 | 役割 | 内容 |
      |---|---|---|
      | 概要節（`# {スキル名}` 直下、`## 目的` 等） | 入口 | スキルの役割、位置づけを簡潔に導入。機能説明の詳細は含まない |
      | 機能節（`## 責務`, `## USE FOR`, `## 担当` 等） | 新情報追加 | 概要節で触れない具体的な対象、対象外、查読観点、判定基準を詳細に記述 |

      **禁止パターン**: 概要節に機能節と同じ内容の詳細説明を含め、機能節で再説明する重複構造。
      SKILL.md 査読時（`agentdev-doc-writing`）に概要節と機能節の重複を検出し、概要節を簡潔な導入へ縮退するよう指示する。

      **適用対象**: `src/opencode/skills/agentdev-*/SKILL.md`（配布 agentdev-* skill 全件）。件数は固定値を埋め込まず、実ディレクトリ構成により動的に追従する（旧「全27ファイル」等の固定件数は構成変更時に陳腐化するため廃止）。

      ### SKILL.md 原本節フォーマット（REFERENCE関係）

      SKILL.mdは対応するSPECへの参照、SKILL.md自身の実行入口としての責務、extensionとの補完関係を示す。

      1. 対応するSPECへの参照リンクを持つ。
      2. SPECを正規原本、SKILL.mdを実行入口と補完情報保持文書とするREFERENCE関係を宣言する。
      3. extensionは標準SKILL.mdを上書きせず、プロジェクト固有情報だけを追加することを宣言する。

      SKILL.mdはSPEC内容を再記述せず、実行時に必要な入口、トリガー、参照資料、補完情報だけを保持する。
      ### U-012 解消パターン（extensionとSKILL.mdの関係）

      - **正規原本**: 対応するSPEC
      - **実行入口**: 標準SKILL.md
      - **プロジェクト固有補完**: extension

      同じ内容をSPEC、SKILL.md、extensionへ重複記載しない。SKILL.mdはSPECを参照し、extensionは標準SKILL.mdの固定知識外にあるプロジェクト固有情報だけを提供する。

  - id: ACT-SPEC-027
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_spec: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "## SKILL.md概要節と機能節の役割分担"
    source_items: [AG-008, AG-009]
    content: |
      ## SKILL.md概要節と機能節の役割分担

      SKILL.mdの概要節は入口として役割と利用条件を簡潔に示し、機能節は具体的な対象、対象外、判断基準、参照先を追加する。概要節と機能節の重複は`agentdev-doc-writing`の恒常的な査読対象とする。

      査読対象の分類は重複度合いと文書影響度に基づく。固定件数、実施順序、段階的スケジュール、個別ファイル一覧は本SPECに保持しない（固定件数埋め込みを全件禁止）。

  - id: ACT-SPEC-007
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/artifact-responsibilities.md
    target_spec: docs/specs/responsibilities/artifact-responsibilities.md
    target_area: "### 操作 skill 正規所有者台帳"
    source_items: [AG-008, AG-009]
    content: |
      ### 操作 skill 正規所有者台帳

      各操作 skill の責務と対象外を正規所有者台帳として定義する。REQ/ADR/SPEC 操作と文書種別横断検証の正規所有者を一つに定め、責務重複を防ぐ。

      正規所有の単位は「安定した関心キー」である（REQ-0119-038、ADR-0139）。REQ-0119-033「責務ごとに最も安定した最小の定義元を正規とする」の延長であり、適用条件を精緻化する。1ファイルが複数関心を参照することは許容するが、正規定義だけを単一所有とし、同一仕様関心について複数 SPEC が正規所有者を主張しない。

      #### 関心キーの定義（ADR-0139）

      | 項目 | 内容 |
      |---|---|
      | 関心キー | SPEC が正規所有する仕様関心を一意に識別する文字列。command 名、skill 名、workflow 名、品質ルール名、整合性ルール名等の所有責務に基づく |
      | 安定性基準 | 最も安定した最小の定義元を選定する（REQ-0119-033）。仕様変更時に限定された影響範囲で済む所有責務単位を選ぶ |
      | 重複検出 | 同一関心キーに対する複数 SPEC の正規所有宣言を重複として検出する。重複検出は frontmatter または冒頭宣言節で宣言された関心キーを横断検索することで機械判定可能とする |
      | 命名規則 | 関心キーは所有責務に基づく安定した名前とする。内部的な実装ファイル名、一時的な作業名は関心キーに使用しない |

      #### 操作 skill の正規所有者一覧

      | skill | 責務 | 対象外 |
      |---|---|---|
      | `agentdev-req-file-manager` | REQ 作成、APPEND、UPDATE、REQ 番号採番、要件行 ID 採番、REQ 固有整合性確認、REQ 固有 script 呼出契約 | ADR 操作、SPEC 操作、内容推論、ファイル編集を実行しない（所有者の案内のみ） |
      | `agentdev-adr-file-manager` | ADR 作成、APPEND、UPDATE、ADR 番号採番、ADR 固有整合性確認、ADR 固有 script 呼出契約 | REQ 操作、SPEC 操作、内容推論 |
      | `agentdev-spec-file-manager` | SPEC 作成、更新、配置先判断、target_area による更新判断、SPEC ライフサイクル規則の適用と整合性確認、SPEC 固有 script の選択と呼出契約 | REQ 操作、ADR 操作、SPEC 内容の新規推論、accepted 昇格判断（case-close 責務、ADR-0123 / REQ-0136-024 準拠）、ユーザー承認、commit、push、共通 script の重複実行 |
      | `agentdev-doc-diagnostics` | docs 横断診断カテゴリ、共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティング | 診断対象の修正、promote 判断、REQ/SPEC/RU 保存、commit、push、Issue/PR 操作、REQ 固有 SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 診断（`agentdev-req-structure-diagnostics`）、文意品質診断（`agentdev-doc-writing`）、探索順（`agentdev-doc-map`） |
      | `agentdev-artifact-validation` | 文書種別横断の決定的検証 script、共有 lib、公開検証契約、JSON 結果契約（`check-frontmatter-consistency`、`check-entry-existence`、`check-change-impact` とそれらが利用する共有 lib、対応 test） | REQ/ADR/SPEC 固有の内容判断、ファイル編集、保存、ユーザー承認、commit、push、REQ 番号/ADR 番号/要件行 ID の採番、target_area の検索 |

      **重複なし確認**:

      - `agentdev-spec-file-manager` は `agentdev-req-file-manager`（REQ 操作）、`agentdev-adr-file-manager`（ADR 操作）と責務重複しない（SPEC 操作のみを所有）
      - `agentdev-doc-diagnostics` は `agentdev-doc-writing`（文意品質）、`agentdev-doc-map`（探索順）、`agentdev-req-structure-diagnostics`（REQ 固有 SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）と責務重複しない（横断編成と結果統合のみを所有）
      - `agentdev-artifact-validation` は内容判断、編集、保存を行わず、利用側（`agentdev-req-file-manager`、`agentdev-adr-file-manager`、`agentdev-spec-file-manager`、各 command）は公開検証契約のみへ依存する

  - id: ACT-SPEC-008
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/artifact-contracts.md
    target_spec: docs/specs/responsibilities/artifact-contracts.md
    target_area: "## スキル粒度契約"
    source_items: [AG-008, AG-009]
    content: |
      ## スキル粒度契約

      Skill は以下の条件を全て満たす単位とする（REQ-0103-100）。

      | 条件 | 説明 |
      |------|------|
      | 同一関心 | 解決対象の問題領域が同一 |
      | 同一責任境界 | 担う責任の範囲が同一 |
      | 同一判断モデル | 判断の仕組み、基準が同一 |
      | 矛盾しない `USE FOR` / `DO NOT USE FOR` | 全ての `USE FOR` が同一判断モデルに属し、`DO NOT USE FOR` と矛盾しない |

      - 複数の `USE FOR` があっても、同一判断モデル、同一責任境界に属する場合は同一 Skill として扱う（REQ-0103-101）。
      - 複数の `USE FOR` が異なる判断モデル、入力、出力、責任境界を持つ場合は、`DO NOT USE FOR` が同じであっても Skill 分割候補とする（REQ-0103-102）。
      - 異なる判断モデル、入力、出力、責任境界を持つ内容は Skill 分割候補として扱うこと。

      ### SKILL.md サイズと内容基準（REQ-0103-037）

      - 200行を超える SKILL.md は責務集中、不要な手順、例、作業履歴の混入について確認すること
      - 200行を超えることだけを不合格理由にしないこと。責務上の根拠があれば維持を認める
      - SKILL.md に移動済み Step、統合済み Step、将来候補、作業履歴を示す節を残さないこと
      - 詳細な判定表、スキーマ、例、失敗時手順は必要な場合に限り当該 skill 自身の reference へ配置すること（REQ-0103-036）

  - id: ACT-SPEC-028
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/artifact-contracts.md
    target_spec: docs/specs/responsibilities/artifact-contracts.md
    target_area: "## Script 所有権と委譲契約"
    source_items: [AG-008, AG-009]
    content: |
      ## Script 所有権と委譲契約

      各 script の正規所有者を文書種別ごとに定義する（REQ-0103-159、REQ-0136-029）。同一 script または共有 lib を複数 skill へ複製せず、正規所有者を一つに定める。

      | script 種別 | 正規所有者 skill | 対象 |
      |---|---|---|
      | REQ 番号採番、要件行 ID 採番、REQ 固有検証 | `agentdev-req-file-manager` | REQ 操作に固有の決定的処理 |
      | ADR 番号採番、ADR 固有検証 | `agentdev-adr-file-manager` | ADR 操作に固有の決定的処理 |
      | SPEC 固有処理（target_area 見出し検索、SPEC 固有整合性確認） | `agentdev-spec-file-manager` | SPEC 操作に固有の決定的処理 |
      | 文書種別横断の共通検証（frontmatter 整合性、エントリ存在確認、変更範囲検証）と共有 lib | `agentdev-artifact-validation` | 複数文書種別で共有する決定的検証と共有ライブラリ、対応 test |

      **委譲規則**:

      - 兄弟 skill と command は所有者 skill の内部 script パスを直接 import またはパス参照しない
      - 利用側は所有者 skill の公開操作契約（操作名、入力、JSON 結果契約、エラー契約）へ委譲する
      - 所有者 skill の SPEC または reference のみが内部 script の物理パスと I/O 詳細を保持する
      - 同一 script または共有 lib を複製しない（REQ-0103-006「Script は決定的: テスト可能、再現可能」の延長）
      - 新規 script 追加時は所有者候補を文書種別で判定し、既存所有者との重複を確認する

      本契約は Command → Skill → Script の依存方向を維持し、新規 ADR を作成せず ADR-0107（Command/Skill/Template/Script 責任分界）の適用条件の精緻化として扱う（REQ-0119-033 準拠）。

  - id: ACT-SPEC-029
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/artifact-contracts.md
    target_spec: docs/specs/responsibilities/artifact-contracts.md
    target_area: "## 分類根拠伝播契約"
    source_items: [AG-008, AG-009]
    content: |
      ## 分類根拠伝播契約

      learning/intake → RU → req-define → spec-save の各工程間で引き継ぐ分類根拠フィールドを定義する（REQ-0136-033、ADR-0139）。SPEC ファイルが主論理区分・正規所有対象を宣言する形式（frontmatter フィールド名、冒頭宣言節フォーマット）の正規所有者は `../foundations/document-model.md`「SPEC 宣言形式」とし、本節は工程間伝播フィールドの schema を正規所有する。両者は `spec_logical_division`、`canonical_owner` のフィールド名を共有し、工程間で同一の名前を用いる。

      ### 伝播フィールド一覧

      | フィールド | 型 | 内容 | soft-contract 扱い |
      |---|---|---|---|
      | change_nature | enum | 変更の性質: `new_user_requirement`、`external_contract_change`、`variation_addition`、`edge_case`、`parameter_adjustment`、`nonconformance_fix`、`internal_restructuring`、`document_correction` のいずれか | 欠落時は `unknown` で警告 |
      | req_impact | enum | REQ影響の有無: `yes`、`no`、`unknown` | 欠落時は `unknown` で警告 |
      | target_stakeholder | string | 変更が影響するステークホルダー（利用者、運用者、開発者、外部システム等） | 欠落時は `unknown` で警告 |
      | user_visible_change | enum | 利用者から見える変更の有無: `yes`、`no`、`unknown` | 欠落時は `unknown` で警告 |
      | spec_logical_division | enum | SPEC論理区分: `behavior`、`catalog`、`cross_cutting_contract`、`parameter`、`implementation_detail`、`unknown` のいずれか | 欠落時は `unknown` で警告 |
      | canonical_owner | string | 正規所有対象（対象 command、skill、workflow、品質ルール、整合性ルール等の関心キー） | 欠落時は `unknown` で警告 |
      | destination_selection_reason | string | 追記先を選択した理由 | 欠落時は `unknown` で警告 |
      | observed_evidence | string | 根拠となる観測事実（CI 失敗、誤検出、エッジケース発見等） | 欠落時は `unknown` で警告 |

      ### soft-contract 運用（ADR-0124 準拠）

      - 分類根拠は soft-contract（ADR-0124）として追加情報扱いとする
      - 厳格なスキーマ検証、JSON Schema、バリデータを導入しない
      - 欠落時は `unknown` 既定値で警告を出し、処理を継続する（後方互換）
      - 既存の採用済み成果物、RU、req_draft を欠落により拒否しない
      - 具体的なシリアライズ形式は各工程の成果物形式（RU frontmatter、draft-data YAML、SPEC frontmatter 等）に従う

      ### 各工程での扱い

      | 工程 | 入力 | 出力 |
      |---|---|---|
      | learning-promote | 学びから change_nature、observed_evidence を推定 | 採用済み成果物（promoted artifact）に分類根拠を添付 |
      | intake-promote | inbox item から change_nature、observed_evidence を推定 | 採用済み成果物に分類根拠を添付 |
      | backlog-review | 採用済み成果物から読取、`tentative_classification` と併せて RU frontmatter へ記録 | RU frontmatter に `tentative_classification` と分類根拠を記録 |
      | req-define | RU の分類根拠を暫定入力とし、最終分類を自身で確定 | draft-data の artifact_actions、operation_units に最終分類根拠を反映 |
      | spec-save | draft-data の分類根拠を読取、配置一貫性検証の入力とする | 配置一貫性検証結果を commit message、完了報告に反映 |

      ### REQ 拡張可否判定ルール

      change_nature が `new_user_requirement` または `external_contract_change` の場合のみ、REQ の作成または拡張を候補とする（REQ-0136-033）。それ以外の change_nature は、既存 REQ が要求を既に保持している限り REQ を拡張せず、SPEC 等への配置を検討する。

  - id: ACT-SPEC-009
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/learning-promote.md
    target_spec: docs/specs/commands/learning-promote.md
    target_area: "## 変更種別分類"
    source_items: [AG-008, AG-009]
    content: |
      ## 変更種別分類

      learning 成果物から RU へ引き継ぐ変更種別を定義する（REQ-0136-033、ADR-0139）。learning-promote は採用済み成果物を生成する際、各問題クラスに基づき次の8変更種別のいずれかを付与する。変更種別は分類根拠フィールド `change_nature` として RU へ伝播され、req-define が REQ 拡張可否を判定する入力となる。

      ### 変更種別と REQ 拡張可否

      | 変更種別 | 内容 | REQ 拡張候補 |
      |---|---|---|
      | new_user_requirement（新しい利用者要求） | 既存REQ が要求を保持していない新しいステークホルダー要求 | ○（REQ 作成または拡張） |
      | external_contract_change（外部契約変更） | 利用者から見える外部契約の変更 | ○（REQ 作成または拡張） |
      | variation_addition（バリエーション追加） | 既存要求を満たすバリエーション追加 | ×（SPEC 拡張） |
      | edge_case（エッジケース） | エッジケース対応 | ×（SPEC 拡張） |
      | parameter_adjustment（パラメータ調整） | retry 回数、timeout、閾値、重み等の調整 | ×（パラメータSPEC 拡張） |
      | nonconformance_fix（不適合修正） | 既存REQ/SPEC への不適合修正 | ×（SPEC 修正） |
      | internal_restructuring（内部再構成） | 外部挙動を変えない内部再構成 | ×（SPEC 再構成） |
      | document_correction（文書訂正） | 文書記述の訂正 | ×（文書修正） |

      REQ 拡張を候補とするのは `new_user_requirement` または `external_contract_change` のみ。それ以外は既存 REQ が要求を既に保持している限り REQ を拡張しない（REQ-0136-033）。判定の最終確定は req-define が行う（REQ-0102-087）。

      ### 分類根拠の引き継ぎ

      learning-promote は change_nature と併せて、observed_evidence（根拠となる観測事実）、target_stakeholder、user_visible_change 等の分類根拠（`../responsibilities/artifact-contracts.md`「分類根拠伝播契約」参照）を RU へ伝播させる。分類根拠は soft-contract（ADR-0124）とし、欠落時は unknown 既定値で警告する。

  - id: ACT-SPEC-010
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/intake-promote.md
    target_spec: docs/specs/commands/intake-promote.md
    target_area: "## 変更種別分類"
    source_items: [AG-008, AG-009]
    content: |
      ## 変更種別分類

      intake 成果物から RU へ引き継ぐ変更種別を定義する（REQ-0136-033、ADR-0139）。intake-promote は採用 item を採用済み成果物（promoted artifact）へ整形する際、各 item に基づき次の8変更種別のいずれかを付与する。変更種別は分類根拠フィールド `change_nature` として RU へ伝播され、req-define が REQ 拡張可否を判定する入力となる。learning-promote.md「変更種別分類」と整合する。

      ### 変更種別と REQ 拡張可否

      | 変更種別 | 内容 | REQ 拡張候補 |
      |---|---|---|
      | new_user_requirement（新しい利用者要求） | 既存REQ が要求を保持していない新しいステークホルダー要求 | ○（REQ 作成または拡張） |
      | external_contract_change（外部契約変更） | 利用者から見える外部契約の変更 | ○（REQ 作成または拡張） |
      | variation_addition（バリエーション追加） | 既存要求を満たすバリエーション追加 | ×（SPEC 拡張） |
      | edge_case（エッジケース） | エッジケース対応 | ×（SPEC 拡張） |
      | parameter_adjustment（パラメータ調整） | retry 回数、timeout、閾値、重み等の調整 | ×（パラメータSPEC 拡張） |
      | nonconformance_fix（不適合修正） | 既存REQ/SPEC への不適合修正 | ×（SPEC 修正） |
      | internal_restructuring（内部再構成） | 外部挙動を変えない内部再構成 | ×（SPEC 再構成） |
      | document_correction（文書訂正） | 文書記述の訂正 | ×（文書修正） |

      REQ 拡張を候補とするのは `new_user_requirement` または `external_contract_change` のみ。それ以外は既存 REQ が要求を既に保持している限り REQ を拡張しない（REQ-0136-033）。判定の最終確定は req-define が行う（REQ-0102-087）。

      ### 分類根拠の引き継ぎ

      intake-promote は change_nature と併せて、observed_evidence（根拠となる観測事実）、target_stakeholder、user_visible_change 等の分類根拠（`../responsibilities/artifact-contracts.md`「分類根拠伝播契約」参照）を RU へ伝播させる。分類根拠は soft-contract（ADR-0124）とし、欠落時は unknown 既定値で警告する。

  - id: ACT-SPEC-011
    artifact: spec
    operation: spec-update
    target: docs/specs/local/audit-ledger-lifecycle.md
    target_spec: docs/specs/local/audit-ledger-lifecycle.md
    target_area: "# 監査台帳ライフサイクル SPEC"
    source_items: [AG-008, AG-009]
    content: |
      # 監査台帳ライフサイクル SPEC

      > 本 SPEC は docs/specs/workflows/backlog-artifact-lifecycle.md へ統合済みであり、現行契約としては参照しないこと。履歴参照用途。

      one-time 監査成果物（監査台帳、照合表、一時分析ファイル等）のライフサイクルを一般化し、生成、参照、フェーズ参照化、廃棄の各段階で満たすべき条件を定義する。フェーズ横断の進捗管理台帳として恒久化せず、一定の完了条件を満たした時点で廃棄する運用を確立する。

      第1フェーズ監査台帳（`.agentdev/drafts/audit-ledger-governance-system-audit.md`）の廃棄条件を汎化したものであり、将来の監査フェーズ運用のモデルを提供する。

  - id: ACT-SPEC-030
    artifact: spec
    operation: spec-update
    target: docs/specs/local/audit-ledger-lifecycle.md
    target_spec: docs/specs/local/audit-ledger-lifecycle.md
    target_area: "## 既知の適用例"
    source_items: [AG-008, AG-009]
    content: |
      ## 既知の適用例

      | 監査台帳 | 適用フェーズ | 廃棄条件 | 状態 |
      |---------|-------------|----------|------|
      | `audit-ledger-governance-system-audit.md` | Phase 1（監査）、Phase 2（再編実施） | Phase 2 完了時。Phase 3 用入力への移管確認完了後 | 廃棄条件確定済、Phase 2 完了時に廃棄予定 |

  - id: ACT-SPEC-031
    artifact: spec
    operation: spec-update
    target: docs/specs/local/audit-ledger-lifecycle.md
    target_spec: docs/specs/local/audit-ledger-lifecycle.md
    target_area: "## 関連情報"
    source_items: [AG-008, AG-009]
    content: |
      ## 関連情報

      - 関連 REQ: REQ-0104（Workflow / Command Protocol）、REQ-0114（case-auto 最大自走モード）
      - 関連 SPEC: `docs/specs/workflows/backlog-artifact-lifecycle.md`（RU / 採用済み成果物 / draft lifecycle）
      - 根拠監査台帳項目: 計画 Section 5.3、Section 10

  - id: ACT-SPEC-012
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/_template.md
    target_spec: docs/specs/commands/_template.md
    target_area: "## command SPEC と command 定義の対応付け（REQ-0143-005）"
    source_items: [AG-008, AG-009]
    content: |
      ## command SPEC と command 定義の対応付け（REQ-0143-005）

      command SPEC は command 定義ファイル（`src/opencode/commands/agentdev/*.md`）の Step 番号を複製せず、以下の軸で command 定義と対応付ける（REQ-0143-005）。

      | 対応付け軸 | 記述内容 |
      |---|---|
      | 公開目的 | command が解決するユーザー関心 |
      | 入力 | 入力成果物、引数、参照専用入力 |
      | 成果物 | 出力成果物、状態遷移 |
      | 許可される副作用 | ファイル作成、更新、外部 API 呼出 |
      | 安全境界 | G02 等のファイル操作制約、責務範囲 |
      | 承認境界 | ユーザー確認を要する判断 |
      | 停止状態 | 異常時、未解決時、ユーザー判断待ちの状態 |
      | 必須順序 | 成果物、安全性、外部契約へ影響する順序（順序を変えると成果物または安全性が変わるもののみ） |
      | 利用 skill 責務 | command が利用する skill 名と委譲する責務 |

      Step 番号を持たない command SPEC（読み取り専用、分類系）は対応付けの対象外とし、その旨を当該 SPEC に文書化する。詳細は `../authoring/command-file-format.md`「command SPEC と command 定義の対応付け（REQ-0143-005）」を参照。

  - id: ACT-SPEC-013
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/spec-save.md
    target_spec: docs/specs/commands/spec-save.md
    target_area: "## 配置一貫性検証"
    source_items: [AG-008, AG-009]
    content: |
      ## 配置一貫性検証

      spec-save は SPEC ファイル保存に先立ち、対象 SPEC の主論理区分・正規所有対象と保存内容の整合を「配置一貫性検証」として検証する（REQ-0136-034、ADR-0139）。配置一貫性検証は確定済み分類・所有情報と保存先の整合確認であり、「内容品質の再査読」ではない（REQ-0136-030 との整合）。内容品質は引き続き req-define QG-1 の責務である。

      ### 検証項目

      | 検証項目 | 内容 | 不一致検出時 |
      |---|---|---|
      | 論理区分整合 | 変更の論理区分（artifact_action が示す SPEC 論理区分）と対象 SPEC の主論理区分が整合する | 保存を停止し、分類または追記先の再判定へ戻す |
      | 所有対象整合 | 変更の所有対象（artifact_action が示す正規所有対象）と対象 SPEC の正規所有対象が整合する | 同上 |
      | 別所有SPEC 不存在 | 同一関心の別の正規所有 SPEC が存在しない（REQ-0119-038 違反でない） | 同上 |
      | 横断SPEC 不当配置 不存在 | command 固有仕様を不当に横断 SPEC へ配置していない | 同上 |
      | パラメータ不当混入 不存在 | パラメータ変更を不当に挙動説明またはカタログへ混入させていない（REQ-0155-009 準拠） | 同上 |
      | accepted 間分界矛盾 不存在 | accepted SPEC 間で責任分界が矛盾しない | 同上 |

      不一致を検出した場合、保存せず、分類または追記先の再判定へ戻す。

      ### 強制ゲート（保存拒否）の有効化条件

      強制ゲート（保存拒否条件: 重複所有、配置不一致）は SPEC 宣言形式（主論理区分、正規所有対象）の定義完了後に有効化する（REQ-0136-035）。宣言形式の定義は `../foundations/document-model.md`「SPEC 宣言形式」を正規所有者とし、`../responsibilities/artifact-contracts.md`「分類根拠伝播契約」の伝播フィールド名（`spec_logical_division`、`canonical_owner`）と一致させる。

      ### 段階適用

      宣言未完了の既存 SPEC は警告モードで経過観察する（後方互換期間）。段階適用は次の5ステップとする:

      | ステップ | 内容 |
      |---|---|
      | (a) 宣言形式定義 | SPEC frontmatter または冒頭宣言節で主論理区分・正規所有対象の宣言形式を定義する（完了: `../foundations/document-model.md`「SPEC 宣言形式」） |
      | (b) 警告モード棚卸し | 既存 SPEC を警告モードで棚卸し、宣言形式の適用状況を把握する |
      | (c) 重複解消 | 同一関心キーに対する複数正規所有宣言を解消する |
      | (d) 新規/変更 SPEC 強制 | 新規作成、または変更がある SPEC に対して配置一貫性検証を強制する |
      | (e) 全件強制 | 全 SPEC に対して配置一貫性検証を強制する |

      bootstrap 問題（宣言前に強制すると既存 SPEC 処理不能）を避けるため、強制は段階的に有効化する。各ステップの移行条件、タイミングは別途 inspect/backlog 経由で判断する。

      ### 検証と内容品質の責務分離

      配置一貫性検証は配置先の整合確認であり、内容品質の再査読ではない。内容品質は req-define QG-1 の責務（REQ-0136-030）。spec-save が配置一貫性検証で不一致を検出した場合、保存を停止するが、内容品質の再評価は実施しない。

  - id: ACT-SPEC-032
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/spec-save.md
    target_spec: docs/specs/commands/spec-save.md
    target_area: "## targeted docs guard (REQ-0158-003)"
    source_items: [AG-008, AG-009]
    content: |
      ## targeted docs guard (REQ-0158-003)

      SPEC保存工程では、変更されたSPECと連動する`docs/specs/README.md`、`docs/DOC-MAP.md`を`check_changed_docs.ts --workflow spec-save`で検査する。

      検査は以下を含む。

      - SPEC frontmatter必須項目
      - status値`draft`、`accepted`、`superseded`の妥当性
      - `superseded`時の`superseded_by`必須性
      - `superseded_by`保持SPECの通常内容検査対象外判定
      - SPEC READMEのstatus同期
      - SPECドメイン分類、リンク、DOC-MAP更新要否
      - command/skill/integrity SPECと対応原本・catalog・rule file・scriptの整合

      strict failureが存在する場合は修正して再実行する。

  - id: ACT-SPEC-014
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    target_spec: docs/specs/commands/req-define.md
    target_area: "## 現在の動作（oracle/explore 抽象化後）"
    source_items: [AG-008, AG-009]
    content: |
      ## 現在の動作（oracle/explore 抽象化後）

      - Step 1: セッションコンテキスト検知（引数なし単体実行時のみ）（当該セッション履歴、現在コンテキストを Requirement Source 候補として評価）
      - Step 2: 明示入力ファイル読込（指定時）（RU 自動検出を含む）
      - Step 3: 壁打ち対話（`agentdev-req-analysis` に従い深掘り）
       - Step 3-1: 前工程からの引き継ぎ判定（`agentdev_handoff: true` フラグ処理）
      - Step 4: 既存REQ照合（`agentdev-req-file-manager` 照合方法論）
       - Step 4-1: 定量的データ検証（`glob docs/requirements/REQ-*.md` で AGENTS.md 記載レンジと照合）
       - Step 4-2: SPLIT 予兆計測（既存REQの健全性メトリクス計測）
      - Step 5: 要件展開（`agentdev-req-analysis` 分析観点）
       - Step 5-1: 変更影響候補抽出
        - RU 由来キーワード抽出 + glob/grep 前処理によるサブエージェント調査委譲スコープの絞り込み（REQ-0102-072）。絞り込みはサブエージェント調査委譲の調査優先対象リストのみに適用（ヒントでありハードフィルタではない）し、実ファイル列挙（REQ-0102-002）の完全性は維持する
       - Step 5-2: 分類ゲート（REQ-0155-004 最終分類確定ステップ）（変更後仕様 or 反映作業、REQ/SPEC 境界判定）。RU 入力の暫定分類（backlog-review が `tentative_classification` に付与）が存在する場合、`docs/specs/foundations/document-model.md` の文書7分類モデルに照らして最終分類を確定し暫定分類を上書きする。確定時のバリデーション（暫定分類の7値チェック、フィールド欠落時の停止、最終分類上書き値の7値チェック）は後述「tentative_classification 最終確定のバリデーション（REQ-0155-008）」に定める
       - Step 5-3: 文書分類妥当性検証（SPEC 分離基準違反残留検出）
        - Step 5-4: ADR要否確認ゲート（`agentdev-architecture-advisory` 経由でアーキテクチャ助言サブエージェントへ委譲）
        - アーキテクチャ助言サブエージェントへの入力標準テンプレート使用 + 出力 4 ラベル構造要求（REQ-0102-073）。ラベル構造は soft-contract（ADR-0124）とし、分類権限は親が保持する
       - Step 5-5: 実行主体分類表（REQ-0146-007）（委譲契約を定義する場合、実行主体分類表（adapter skill / command / subagent / harness）を必須とする（`docs/specs/workflows/delegation-contracts.md` 参照））。委譲を含まない要件では省略可
       - Step 5-6: Test strategy 定義（要件展開内）
        - 各 test strategy 項目を verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素構造として定義
        - on_failure（不合格時の処置）を持たない検証項目は test strategy に含めない
        - 項目識別子: TS-NNN 形式（NNNは3桁ゼロ埋め連番）
        - 各項目属性: id（TS-NNN）、target_item（AG-* への参照）、verification、pass_criteria、on_failure
        - on_failure アクション種別: fix-and-reverify（実装を修正して再検証）/ record-in-findings（Findings に out-of-scope として記録）の2値
      - Step 6: ADR判断（`agentdev-adr-guidelines`）
       - Step 6-1: 既存ADR重複確認
       - Step 6-2: ADR禁止ゲート
       - Step 6-3: ADR判断根拠記録
       - Step 6-4: 作業手段ADR拒否ゲート
       - Step 6-5: ADR 番号指定形式（`new:{topic-slug}` 形式）
      - Step 7: 要件doc生成（テンプレート: `templates/req-define/req-draft.md`）
       - Step 7-1: 定義完全性ゲート（QG-1）
       - Step 7-2: operation_units 生成
       - Step 7-3: artifact_actions 生成
       - Step 7-4: draft-data test_strategy 生成（各項目の5属性をYAML形式で格納）
      - Step 8: work_type 判定（bugfix/feature/maintenance/docs_chore）
      - Step 9: Scale判断（featureのみ、`agentdev-workflow-lifecycle`）
       - Step 9-1: 実装スコープシグナル確認
      - Step 10: ドラフト保存（`.agentdev/drafts/req-draft-{topic-slug}.md`）
       - Step 10-1: 実装詳細の分離
       - Step 10-2: auto_gate完了ゲート（auto_gate.auto_ready:false または未解決 item 残存時、stop_reasons を提示し解消方策を壁打ちで合意）。解消時は auto_ready:true に更新。ユーザーが明示的に false 選択時は conflict_resolutions に記録し継続。未解決のままの場合は壁打ちへ差し戻し。
      - Step 11: 要件doc確認（ユーザー提示のみ、承認は求めない）
       - Step 11-1〜11-6: 複数RU受付、統合/分離判定、出力生成、Epic規模検出、Wave候補記録、OU 構造検証
      - Step 12: 完了報告（work_type 別テンプレート選択）

      req-define は command 定義（src/opencode/commands/agentdev/req-define.md）と Step 番号を複製せず、公開目的、入力、成果物、許可される副作用、安全境界、承認境界、停止状態、必須順序、利用 skill 責務によって対応付ける（REQ-0143-005）。
      詳細は `command-file-format.md`「command SPEC と command 定義の対応付け（REQ-0143-005）」参照。

      ### tentative_classification 最終確定のバリデーション（REQ-0155-008）

      Step 5-2 が backlog-review 付与の暫定分類（`tentative_classification`）を最終分類として確定（上書き）する際、以下を検証すること:

      1. 暫定分類が REQ-0155-003 の7値のいずれかであること。7値以外の場合、確定を停止し理由を提示すること
      2. フィールドが欠落している場合、暫定分類未付与として確定を停止し、backlog-review への差し戻しを提示すること
      3. 最終分類への上書き値も7値のいずれかであること

      7値の定義、検出時の具体的挙動は backlog-review.md「tentative_classification フィールド仕様」を参照すること。

  - id: ACT-SPEC-033
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    target_spec: docs/specs/commands/req-define.md
    target_area: "## REQ影響判定とSPEC正規所有者確定"
    source_items: [AG-008, AG-009]
    content: |
      ## REQ影響判定とSPEC正規所有者確定

      req-define は backlog-review の暫定分類（`tentative_classification`）を暫定入力とし、最終分類を自身で確定する（REQ-0102-087、ADR-0139）。

      ### 最終分類確定ステップで判定する項目

      req-define は次の7項目を判定し、`artifact_actions`、`operation_units` へ反映する:

      | 判定項目 | 内容 |
      |---|---|
      | 新しいステークホルダー要求か | 既存REQ が要求を保持していない新しい要求か |
      | 既存REQ が要求を既に保持しているか | 同一関心が既存REQ に存在するか |
      | 利用者から見える外部契約が変わるか | 外部契約変更（change_nature: `external_contract_change`）に該当するか |
      | REQ の作成・更新が必要か | 上記3項目から REQ 作成・更新要否を確定 |
      | SPEC の論理区分 | REQ-0155-009 の5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）のいずれか |
      | 正規所有者 | 対象 command、skill、workflow、品質ルール、整合性ルール等の関心キー（REQ-0119-038） |
      | 正規追記先 | 既存 SPEC のどの領域へ追記するか（target_area、target_spec） |

      ### REQ 影響なし時の取扱い

      REQ 影響なしと確定した変更からは `artifact_actions` の `artifact: req` エントリを生成しない（REQ-0102-088）。代わりに `artifact: spec` エントリのみを生成し、SPEC への配置のみを行う。

      ### 分類根拠の引き継ぎ

      req-define は RU から引き継いだ分類根拠（`artifact-contracts.md`「分類根拠伝播契約」参照）を暫定入力とし、最終分類を確定した上で draft-data へ反映する。分類根拠の soft-contract 運用（欠落時 unknown 既定値、警告）は ADR-0124 に従う。

      ### tentative_classification との関係

      backlog-review が付与する `tentative_classification`（REQ-0155-003 の7値）は暫定値であり、req-define が最終分類を上書きする。最終分類確定時のバリデーション（7値チェック、フィールド欠落時の停止、上書き値の7値チェック）は前述「tentative_classification 最終確定のバリデーション」に従う。

      ### Step 3 構造的分析フレーム先行手順（REQ-0102-083, REQ-0102-084, REQ-0102-085）

      Step 3（壁打ち対話）の開始時に、入力（RU、セッションコンテキスト、明示入力ファイル）の構造を入力データの性質に応じた分析フレームで先行して整理し、個別論点の深掘り前に全体構造をユーザーに提示する。

      #### 分析フレームの選択

      入力データの性質に応じて以下のフレームから選択する:

      | 入力データの性質 | 推奨フレーム |
      |---|---|
      | 複数RU・複数改善候補 | 対象×変更種別の二軸マトリクス |
      | 既存要件との照合が必要 | 既有件化/未要件化/SPEC配置の3分類表 |
      | 修正要否の判定 | 実装面/SPEC面の両面分析表 |

      上記は推奨例であり、入力データの性質に応じて適切なフレームを選択する。分析フレームは個別論点の深掘りに先行して提示する。

      #### 二項選択回答規定

      ユーザーが二項選択（「AかBか」）を求めた質問に対し、「混在」「要確認」単独の回答を出力しない。件数と根拠でいずれかを明示して回答する。両選択肢に該当する場合は、それぞれの件数と根拠を明示して両方を提示する。

      #### 実装/SPEC両面分析規定

      修正の要否を検討する際、実装面（ソースコード、スクリプト、スキル定義ファイル等の変更）と SPEC 面（docs/specs/ 配下の文書変更）の両面を分析し、各面の修正対象と修正内容を明示する。片面のみの分析で修正要否を断定しない。

      #### agentdev-req-analysis SKILL 連携

      上記手順の詳細（質問運用ルール、分析フレーム選択基準）は `agentdev-req-analysis` SKILL（`src/opencode/skills/agentdev-req-analysis/SKILL.md`）の「質問運用ルール」「要件分析観点」セクションに反映する。本 SPEC は手順の要件を定義し、SKILL は実装詳細を定義する（原本src→配置先.opencode の文書間投影規則に準拠）。

  - id: ACT-SPEC-034
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    target_spec: docs/specs/commands/req-define.md
    target_area: "## draft-data test_strategy フィールドスキーマ"
    source_items: [AG-008, AG-009]
    content: |
      ## draft-data test_strategy フィールドスキーマ

      要件定義で test_strategy（テスト戦略）を定義する場合のシリアライズ形式を定義する。

      ### test_strategy 項目構造

      各 test strategy 項目は以下の5属性を持つ:

      | 属性 | 型 | 説明 | 例 |
      |------|------|------|----|
      | id | string | TS-NNN 形式（NNNは3桁ゼロ埋め連番） | `TS-001` |
      | target_item | string | AG-* への参照 | `AG-NNN` |
      | verification | string | 検証手順 | `check_integrity.ts を実行する` |
      | pass_criteria | string | 合格基準 | `エラー 0 件で完了すること` |
      | on_failure | string | 不合格時の処置 | `実装を修正して再検証する` |

      ### YAML 表現形式

      ```yaml
      test_strategy:
        - id: TS-001
          target_item: AG-NNN
          verification: |
            検証手順の記述
          pass_criteria: |
            合格基準の記述
          on_failure: |
            不合格時の処置の記述
      ```

      ### on_failure アクション種別

      | 種別 | 説明 | 選択基準 |
      |------|------|---------|
      | fix-and-reverify | 実装を修正して再検証する | 修正可能な実装不良の場合 |
      | record-in-findings | Findings に out-of-scope として記録する | スコープ外または修正困難な事象の場合 |

  - id: ACT-SPEC-015
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/backlog-review.md
    target_spec: docs/specs/commands/backlog-review.md
    target_area: "## tentative_classification と分類根拠伝播"
    source_items: [AG-008, AG-009]
    content: |
      ## tentative_classification と分類根拠伝播

      backlog-review は採用済み成果物の分析時に tentative_classification（暫定分類）と分類根拠を RU へ付与して伝播させる（REQ-0136-033、ADR-0139）。分類根拠は learning/intake 成果物から後続工程（req-define、spec-save）へ引き継がれる情報であり、本 SPEC は backlog-review での扱いを規定する。

      ### 伝播させる分類根拠フィールド

      backlog-review は採用済み成果物から読み取った次の分類根拠を RU frontmatter へ記録する。詳細なフィールド定義は `../responsibilities/artifact-contracts.md`「分類根拠伝播契約」を参照。

      - change_nature（変更の性質: 8種別のいずれか）
      - req_impact（REQ影響の有無）
      - target_stakeholder（対象ステークホルダー）
      - user_visible_change（利用者可視変更の有無）
      - spec_logical_division（SPEC論理区分: 5区分のいずれか）
      - canonical_owner（正規所有対象）
      - destination_selection_reason（追記先選択理由）
      - observed_evidence（観測根拠）

      ### tentative_classification との関係

      tentative_classification（REQ-0155-003 の7値）は文書種別の暫定分類であり、分類根拠は分類判断の根拠情報である。両者は併存し、req-define が最終分類を確定する際の入力となる。

      ### 後方互換運用

      分類根拠は soft-contract（ADR-0124）として扱い、欠落時は unknown 既定値で警告する後方互換運用をとる。分類根拠が欠落した旧 RU も unknown 既定値で受け入れる。欠落により RU を拒否しない。具体的なシリアライズ形式は `artifact-contracts.md`「分類根拠伝播契約」に従う。

      ### 暫定扱いの明記

      backlog-review が付与する tentative_classification および分類根拠は暫定（tentative）扱いであり、req-define が最終確定する（REQ-0102-087）。backlog-review 自体は最終分類を確定しない。

  - id: ACT-SPEC-016
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/_template.md
    target_spec: docs/specs/skills/_template.md
    target_area: "## skill SPEC の記述中心"
    source_items: [AG-008, AG-009]
    content: |
      ## skill SPEC の記述中心

      skill SPEC は提供する判断、USE FOR、DO NOT USE FOR、入力、出力、副作用、不変条件、reference 選択条件、所有 script、検証条件を中心に記述する。操作手順、例、作業履歴の列挙を必須としない。

      - 200行を超える SKILL.md は責務集中、不要な手順、例、作業履歴の混入について確認する（REQ-0103-037）
      - 200行を超えることだけを不合格理由にしない。責務上の根拠があれば維持を認める
      - 異なる判断モデル、入力、出力、責任境界を持つ内容は skill 分割候補として扱う
      - 所有 script は公開検証契約（agentdev-artifact-validation 経由等）として宣言し、内部パスは references/ に限定する

  - id: ACT-SPEC-017
    artifact: spec
    operation: spec-update
    target: docs/specs/foundations/document-model.md
    target_spec: docs/specs/foundations/document-model.md
    target_area: "## SPEC 内部論理区分"
    source_items: [AG-008, AG-009]
    content: |
      ## SPEC 内部論理区分

      SPEC は文書種別として維持し、内部を以下の論理区分で整理する（REQ-0155-001, REQ-0155-009, ADR-0139）。各区分の規範は各レポジトリの document-model.md が定義する。
      従来の3層ディレクトリ構造（commands/skills/workflows/直下）を維持しつつ、各 SPEC ファイルの内容がいずれの論理区分に属するかを明確にする。
      論理区分は5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）とし、パラメータ責務を実装詳細から区別する（REQ-0155-009）。

      | 論理区分 | 記述対象 | 代表例 |
      |---|---|---|
      | 挙動SPEC | コマンド、スキル、ワークフローの振る舞い、入出力、副作用、停止条件 | commands/req-define.md、skills/`agentdev-req-analysis`.md |
      | カタログSPEC | スキーマ、enum、判定表、ルールカタログ、テンプレート種別 | integrity-rule-catalog.md、req-impact-map.md |
      | 横断契約SPEC | 複数コマンド、スキルにまたがる共通契約 | workflows/workflow-contracts.md、workflows/delegation-contracts.md |
      | パラメータSPEC | retry 回数、timeout、閾値、重み、優先順位、上限、下限、fallback、許容範囲等のパラメータ責務 | 散在（各 SPEC 内のパラメータ節、専用パラメータ SPEC 等） |
      | 実装詳細SPEC | 内部アルゴリズム、実装詳細（パラメータ責務は除く） | req-health-metrics.md、quality-gates.md |

      パラメータ責務（retry 回数、timeout、閾値、重み、優先順位、上限、下限、fallback、許容範囲等）は実装詳細SPEC から区別し、パラメータSPEC として独立区分を与える。パラメータは単一の全体パラメータファイルへ集約せず、対象 command、skill、workflow、品質ルール、整合性ルール等の所有責務に基づいて配置先を決定する。

      1つの SPEC ファイルが複数の論理区分にまたがる場合、主たる区分（主論理区分）を frontmatter または冒頭宣言節で識別可能にする（REQ-0156-013）。複数論理区分を含む SPEC は主論理区分と従属する区分を判別できる状態にする。論理区分は物理的なディレクトリ分離を意味せず、既存3層構造内での内容整理のための区分である。
      従来の workflows/ 層が横断契約 SPEC に対応する。

      各 SPEC は frontmatter または冒頭宣言節で正規所有対象（対象 command、skill、workflow、品質ルール、整合性ルール等の所有責務、関心キー）を識別可能にする（REQ-0156-013）。正規所有の単位は「安定した関心キー」であり、1ファイルが複数関心を参照することは許容するが、正規定義だけを単一所有とし、同一仕様関心について複数 SPEC が正規所有者を主張しない（REQ-0119-038）。主論理区分・正規所有対象の宣言形式（frontmatter フィールド名、冒頭宣言節フォーマット）は後述「SPEC 宣言形式」節で定義し、本ファイル（document-model.md）を正規所有者とする。フィールド名は `../responsibilities/artifact-contracts.md`「分類根拠伝播契約」の伝播フィールド（`spec_logical_division`、`canonical_owner`）と一致させ、工程間での突合を可能にする。

  - id: ACT-SPEC-018
    artifact: spec
    operation: spec-update
    target: docs/specs/foundations/design-principles.md
    target_spec: docs/specs/foundations/design-principles.md
    target_area: "## 7. 受け入れ条件中心の責務分離"
    source_items: [AG-008, AG-009]
    content: |
      ## 7. 受け入れ条件中心の責務分離

      command は高位実行骨格だけでなく、公開成果物、権限境界（安全境界、承認境界）、停止条件、必須順序（成果物、安全性、外部契約へ影響する順序）、利用 skill 名と委譲責務を所有するものとして定義する。
      skill、reference、script、REQ、SPEC の配置原則を、正規所有者、手段の自由度、受け入れ条件、決定的処理の観点で同期する。

      ### 配置原則の同期

      | 成果物 | 配置原則 |
      |---|---|
      | command | 公開目的、入力、成果物、許可副作用、安全境界、承認境界、停止条件、必須順序、利用 skill 責務を所有。結果へ影響しない内部手順、探索順、詳細分類表、重複例、ツール固有の引数、他 skill の内部参照、内部 Step/Section/Phase/見出し、ハーネス固有の起動方法、待機時間、並列度、再試行条件は所有しない |
      | skill | 同一判断モデル、同一責任境界を共有する再利用可能な判断・操作契約を所有。SKILL.md は使用条件、対象外、入力、出力、副作用、主要な不変条件、必要な reference の選択条件を中心とする |
      | reference | 詳細な判定表、スキーマ、例、失敗時手順は必要な場合に限り当該 skill 自身の reference へ配置 |
      | script | 決定的処理（採番、構文解析、見出し検索、整合性検査）を所有。操作責任を持つ skill の配下に配置し、同一 script を複数 skill へ複製しない |
      | REQ | 外部から観測できる振る舞い、公開成果物、ドメイン状態、安全境界、承認境界、停止条件、後続工程との安定した接続契約、ハーネス非依存の恒久的制約へ限定 |
      | SPEC | 現在の振る舞い、スキーマ、判定規則、状態遷移、実装上必要な順序とパラメータを所有。command SPEC は command の Step 番号を複製せず、成果物、副作用、停止状態、必須順序によって command と対応付ける（REQ-0143-005） |

      ### ハーネス純化の回帰基準

      REQ-0162、ADR-0136、REQ-0103-163 が定めるハーネス責務と配布物責務の分離を回帰基準として維持する。配布 command、skill、reference、docs にハーネス固有の待機時間、並列度、再試行、起動引数を残さない。実行エージェントの選定、起動方法、実行制御パラメータはハーネス側文書（`AGENTS.md`、`references/<harness>.md`）が所有する。

  - id: ACT-SPEC-019
    artifact: spec
    operation: spec-update
    target: docs/specs/authoring/command-file-format.md
    target_spec: docs/specs/authoring/command-file-format.md
    target_area: "## command SPEC と command 定義の対応付け（REQ-0143-005）"
    source_items: [AG-008, AG-009]
    content: |
      ## command SPEC と command 定義の対応付け（REQ-0143-005）

      command SPEC（`docs/specs/commands/*.md`）は command 定義ファイル（`src/opencode/commands/agentdev/*.md`）の Step 番号を複製せず、公開目的、入力、成果物、許可される副作用、安全境界、承認境界、停止状態、必須順序、利用 skill 責務によって command 定義と対応付ける（REQ-0143-005）。
      Step 番号一致を要求する旧規則（REQ-0143-004）は2026-07-22に廃止し、成果物、副作用、停止状態、必須順序による対応付け規則へ置き換えた。Step 番号は command 定義の実装詳細属であり、command SPEC が公開契約を独立に記述する構造を維持するため、SPEC 側での複製を求めない。

      **対応付けの軸**:

      - **公開目的**: command が解決するユーザー関心、入力、成果物
      - **許可される副作用**: command 実行時に許可されるファイル作成、更新、外部 API 呼出
      - **安全境界**: command が越えてはならない責務範囲（G02 等のファイル操作制約）
      - **承認境界**: ユーザー確認を要する判断、停止条件
      - **停止状態**: 異常時、未解決時、ユーザー判断待ちの状態
      - **必須順序**: 成果物、安全性、外部契約へ影響する順序（順序を変えると成果物または安全性が変わるもののみ）
      - **利用 skill 責務**: command が利用する skill 名と委譲する責務

      **適用対象**: `docs/specs/commands/*.md` の全 command SPEC（`_template.md` を含む）。Step 番号を持たない command SPEC（読み取り専用、分類系の `inspect-skills.md`、`inspect-promote.md`、`inspect-extensions.md` 等で `### Step N` 見出しを使用しない SPEC）は対応付けの対象外とし、その旨を当該 SPEC に文書化する（REQ-0143-005）。これらの SPEC は対応する command 定義ファイルと比較すべき Step 番号構成を持たないため、対応付け検証の対象とならない。

      **検証**: 各 command/SPEC ペアについて、SPEC が公開目的、入力、成果物、許可される副作用、安全境界、承認境界、停止状態、必須順序、利用 skill 責務の各軸で command 定義と整合することを確認する。Step 番号の不一致は違反として扱わず、公開契約の欠落、相互矛盾を違反として扱う。

  - id: ACT-SPEC-020
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-spec-file-manager.md
    target_spec: docs/specs/skills/agentdev-spec-file-manager.md
    target_area: "# agentdev-spec-file-manager SPEC"
    source_items: [AG-008, AG-009]
    content: |
      # agentdev-spec-file-manager SPEC

      SPEC ファイルの作成、更新、配置先判断、target_area 処理、SPEC 固有整合性確認、SPEC 固有 script の選択と呼出契約を担う操作用 skill の仕様を定める。

      > **リポジトリ内部設計文書**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である。
      > 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0103, ADR-0104）。

  - id: ACT-SPEC-035
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-spec-file-manager.md
    target_spec: docs/specs/skills/agentdev-spec-file-manager.md
    target_area: "## 参照する references"
    source_items: [AG-008, AG-009]
    content: |
      ## 参照する references

      - spec-save.md（command 手順）の SPEC 操作 Step
      - artifact-contracts.md「Script 所有権と委譲契約」
      - artifact-responsibilities.md「操作 skill 正規所有者台帳」

  - id: ACT-SPEC-021
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-artifact-validation.md
    target_spec: docs/specs/skills/agentdev-artifact-validation.md
    target_area: "# agentdev-artifact-validation SPEC"
    source_items: [AG-008, AG-009]
    content: |
      # agentdev-artifact-validation SPEC

      複数文書種別で共有する決定的検証 script、共有ライブラリ、公開検証契約、JSON 結果契約を担う検証 skill の仕様を定める。

      > **リポジトリ内部設計文書**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である。
      > 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0103, ADR-0104）。

  - id: ACT-SPEC-036
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-artifact-validation.md
    target_spec: docs/specs/skills/agentdev-artifact-validation.md
    target_area: "## 参照する references"
    source_items: [AG-008, AG-009]
    content: |
      ## 参照する references

      - artifact-contracts.md「Script 所有権と委譲契約」
      - artifact-responsibilities.md「操作 skill 正規所有者台帳」
      - req-save.md、spec-save.md（共通検証 script 呼出 Step）

  - id: ACT-SPEC-037
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-artifact-validation.md
    target_spec: docs/specs/skills/agentdev-artifact-validation.md
    target_area: "## 現在の動作"
    source_items: [AG-008, AG-009]
    content: |
      ## 現在の動作

      - 所有 script（`check-frontmatter-consistency.ts`、`check-entry-existence.ts`、`check-change-impact.ts`）は `src/opencode/skills/agentdev-artifact-validation/scripts/` 配下に配置する
      - script は決定的（純粋関数）、テスト可能（`tests/*.test.ts`）とする
      - I/O は argv/stdin で入力を受け取り、stdout で JSON 結果を返す（REQ-0103-160）
      - 利用側 command、skill（`agentdev-req-file-manager`、`agentdev-adr-file-manager`、`agentdev-spec-file-manager`、`req-save`、`spec-save` 等）は内部 script パスを直接参照せず、本 skill の公開検証契約へ委譲する
      - 同一 script または共有 lib を複数 skill へ複製しない

  - id: ACT-SPEC-038
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-artifact-validation.md
    target_spec: docs/specs/skills/agentdev-artifact-validation.md
    target_area: "## 境界"
    source_items: [AG-008, AG-009]
    content: |
      ## 境界

      REQ 固有 script は `agentdev-req-file-manager`、ADR 固有 script は `agentdev-adr-file-manager`、SPEC 固有 script は `agentdev-spec-file-manager` が所有する。利用側は本 skill の内部 script を直接参照せず、公開検証契約へ委譲する。同一 script または共有 lib を複製しない。

  - id: ACT-SPEC-039
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-artifact-validation.md
    target_spec: docs/specs/skills/agentdev-artifact-validation.md
    target_area: "## 検証観点"
    source_items: [AG-008, AG-009]
    content: |
      ## 検証観点

      - 公開検証契約の安定性（操作名、入力、JSON 結果契約、エラー契約が変更されないこと）
      - script の決定性（同じ入力に対して同じ結果を返すこと）
      - 共有 lib のテスト可能性（`tests/*.test.ts` が通過すること）
      - 利用側 command、skill に内部 script パス参照がないこと
      - 同一 script の複製がないこと

  - id: ACT-SPEC-040
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-artifact-validation.md
    target_spec: docs/specs/skills/agentdev-artifact-validation.md
    target_area: "## See Also"
    source_items: [AG-008, AG-009]
    content: |
      ## See Also

      - [agentdev-req-file-manager.md](agentdev-req-file-manager.md)（REQ 操作 skill、REQ 固有 script 所有）
      - [agentdev-adr-file-manager.md](agentdev-adr-file-manager.md)（ADR 操作 skill、ADR 固有 script 所有）
      - [agentdev-spec-file-manager.md](agentdev-spec-file-manager.md)（SPEC 操作 skill、SPEC 固有 script 所有）
      - REQ-0103-159（script 所有権の責務別配置）
      - REQ-0136-029（決定的処理の script 委譲）

  - id: ACT-SPEC-022
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-doc-diagnostics.md
    target_spec: docs/specs/skills/agentdev-doc-diagnostics.md
    target_area: "# agentdev-doc-diagnostics SPEC"
    source_items: [AG-008, AG-009]
    content: |
      # agentdev-doc-diagnostics SPEC

      docs 横断の診断カテゴリ、共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティングを担う診断判断 skill の仕様を定める。

      > **リポジトリ内部設計文書**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である。
      > 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0103, ADR-0104）。

  - id: ACT-SPEC-041
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-doc-diagnostics.md
    target_spec: docs/specs/skills/agentdev-doc-diagnostics.md
    target_area: "## 参照する references"
    source_items: [AG-008, AG-009]
    content: |
      ## 参照する references

      - inspect-docs.md（command 手順）の診断実行 Step
      - artifact-responsibilities.md「操作 skill 正規所有者台帳」
      - artifact-contracts.md「サブエージェント委譲契約」（finding 出力契約）

  - id: ACT-SPEC-023
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/responsibility-boundary-purification.md
    target_spec: docs/specs/responsibilities/responsibility-boundary-purification.md
    target_area: "## 横断的再評価基準"
    source_items: [AG-008, AG-009, AG-010]
    content: |
      ## 横断的再評価基準

      現行 REQ 群、現行 SPEC 群を新基準（ステークホルダー視点、4妥当性基準、SPEC 5区分論理、関心キー所有、分類根拠伝播）で横断的に再評価する基準を定める（ADR-0139）。本節は基準定義までを対象とし、全件再評価の実施は別途 case-open/case-run 工程で行う。

      ### REQ 再評価基準（ステークホルダー視点、4妥当性基準）

      現行 REQ 全件について、REQ-0101-079（ステークホルダー視点、4妥当性基準）に基づく再評価を実施する。要件行単位で次を判定する:

      | 評価観点 | 適合基準 |
      |---|---|
      | 要求元ステークホルダー特定 | 主語または文脈から要求元ステークホルダーを特定できる |
      | 観測可能成果 | ステークホルダーが得る成果または回避できる問題を説明できる |
      | 内部実装非依存 | 成果物内部を知らなくても達成を観測できる |
      | 要求文存立 | 内部構成を変更しても要求文が成立する |

      安定契約例外（REQ-0101-069）に該当する要件行は再評価の対象外とする。

      ### SPEC 再評価基準（主論理区分、正規所有対象、重複責務、実装/履歴混入）

      現行 SPEC 全件について、主論理区分、正規所有対象、重複責務、不適切な実装計画または履歴記述の評価を実施する:

      | 評価観点 | 適合基準 |
      |---|---|
      | 主論理区分 | REQ-0155-009 の5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）のいずれかが frontmatter または冒頭宣言節で宣言されている |
      | 正規所有対象 | 対象 command、skill、workflow、品質ルール、整合性ルール等の関心キーが宣言されている（REQ-0156-013、REQ-0119-038） |
      | 重複責務 | 同一関心キーに対する複数 SPEC の正規所有宣言がない |
      | 実装/履歴混入 | 実装計画、マイルストーン、完了履歴が SPEC へ混入していない |

      ### パターンベース是正の指針

      横断的再評価は局所的な文言修正ではなく、同型の責任分界違反を全現行 REQ/SPEC へ横断適用するパターンベース是正とする。同型違反の検出→是正候補のリストアップ→個別 case（Issue/PR）での実施、という流れで行う。

      ### 後方互換運用

      分類メタデータ（主論理区分、正規所有対象、分類根拠）の宣言は段階適用とする（REQ-0136-035）。宣言形式未完了の既存 SPEC は警告モードで経過観察し、欠落により拒否しない（soft-contract、ADR-0124）。既存の採用済み成果物、RU、req_draft を宣言欠落により拒否しない。

  - id: ACT-SPEC-024
    artifact: spec
    operation: spec-update
    target: docs/specs/quality/spec-health-metrics.md
    target_spec: docs/specs/quality/spec-health-metrics.md
    target_area: "## SPEC 横断診断"
    source_items: [AG-008, AG-009]
    content: |
      ## SPEC 横断診断

      SPEC 健全性診断は行数・status・配置に加え、主論理区分・正規所有対象（REQ-0156-013、REQ-0119-038）に基づく次の検出パターンを追加する（REQ-0108-285、ADR-0139）。

      ### 検出パターン

      | パターン | 内容 |
      |---|---|
      | 主論理区分不明SPEC | 宣言節（frontmatter または冒頭宣言節）不在、または REQ-0155-009 が定義する5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）のいずれにも該当しない |
      | 正規所有対象不明SPEC | 関心キー宣言不在（REQ-0156-013、REQ-0119-038 違反） |
      | 所有権重複 | 複数 SPEC が同一関心キーの正規所有を主張（REQ-0119-038 違反） |
      | 論理区分不当混在 | 1 SPEC に主従判別不能な複数区分が混在（REQ-0156-013 違反） |
      | 所有先なしパラメータ群 | パラメータSPEC の正規所有者が不在 |
      | 実装/履歴混入 | SPEC に実装計画、マイルストーン、完了履歴が混入（REQ-0101-060 違反） |
      | REQ 規範重複 | SPEC 記述が REQ 要件と重複 |
      | accepted 間分界不一致 | 複数 accepted SPEC 間で所有権が矛盾 |
      | 実装-SPEC 所有不一致 | 実装側（src/opencode/）の所有者が SPEC 宣言と不一致 |

      ### 後方互換運用

      宣言形式（主論理区分、正規所有対象）が未定義の既存 SPEC は警告モードで経過観察する（REQ-0136-035）。強制ゲート（保存拒否条件: 重複所有、配置不一致）は SPEC 宣言形式の定義完了後に有効化し、段階適用（宣言形式定義 → 警告モード棚卸し → 重複解消 → 新規/変更 SPEC 強制 → 全件強制）とする。

      ### 機械化境界

      上記検出パターンの機械判定可能範囲（frontmatter 宣言不在検出、所有権重複検出等）は docs-check が担う。文脈解釈を要する判定（論理区分不当混在、REQ 規範重複等）は inspect-docs / `agentdev-doc-writing` が担う（3層検出構造、REQ-0108-254）。本 SPEC は検出パターンの定義のみを提供し、各実装を規定しない。

  - id: ACT-SPEC-025
    artifact: spec
    operation: spec-update
    target: docs/specs/quality/req-health-metrics.md
    target_spec: docs/specs/quality/req-health-metrics.md
    target_area: "## REQ 横断診断"
    source_items: [AG-008, AG-009]
    content: |
      ## REQ 横断診断

      REQ 健全性診断は行数・関心数に加え、ステークホルダー視点（REQ-0101-079）と SPEC 分離基準（REQ-0101-068）に基づく次の検出パターンを追加する（REQ-0108-284、ADR-0139）。

      ### 検出パターン

      | パターン | 内容 | SPLIT シグナル計算への反映 |
      |---|---|---|
      | ステークホルダー不在要件 | 主語がステークホルダーでなく内部成果物、または要求元ステークホルダーが不明（REQ-0101-079 違反） | SPEC 分離基準違反シグナルと同様に +1 |
      | 内部成果物主語要件 | 内部成果物（command、skill、script、ファイル）だけを主語とする要件 | +1 |
      | パラメータ主題要件 | パス、フィールド、enum、閾値、内部アルゴリズムを主題とする要件（REQ-0101-068 SPEC 分離基準違反） | SPEC 分離基準違反シグナルとして既存 +1 |
      | 作業履歴主題要件 | 作業履歴または是正結果を主題とする要件 | +1 |
      | 要件行なしREQ | 要件テーブルが空、または目的・適用範囲のみで要件行を持たない現行 REQ | 計測不能として警告（シグナル加算対象外） |

      ### 安定契約例外の扱い

      安定契約例外（REQ-0101-069）に該当する要件行は、上記検出パターンの対象外とする。例外該当判定は REQ-0101-069 の安定契約一覧（公開 command 名、公開入口、ドメイン状態の位置づけ、他 command との接続契約、利用者に見える分類体系、安全境界、停止条件の大枠、後続工程が依存する安定した外部契約）に従う。

      ### 機械化境界

      上記検出パターンの機械判定可能範囲（固有名詞主語検出、 SPEC 分離基準キーワード検出等）は docs-check が担う。文脈解釈を要する判定は inspect-docs / `agentdev-doc-writing` が担う（3層検出構造、REQ-0108-254）。本 SPEC は検出パターンの定義のみを提供し、各実装を規定しない。

conflict_resolutions:
  - id: CR-001
    conflict: "REQ-0146-015 が REQ-0146-011 を識別子中心評価として参照する一方、現 REQ-0146-011 は前工程完了度を規定する。"
    resolution: "REQ-0146-011 を識別子中心評価へ更新し、前工程完了度は REQ-0146-016 として分離する。"
  - id: CR-004
    conflict: "RU-0024 は工程固有識別子を残したまま例外を許容するか、全対象を置換するかを選ぶ。"
    resolution: "選択肢 A を採用する。REQ-0101-060 に従い 20 SPEC の現行基準本文から工程固有識別子を除去し、必要な意味は現行 REQ/ADR の安定 ID または現在契約の散文へ置換する。"
  - id: CR-005
    conflict: "ADR-0139 は REQ/SPEC の意味分類と正規所有対象を定め、C4 の REQ 構成規約、検査規則、現行 SPEC の記述が混在しうる。"
    resolution: "RU-0023 の関連情報セクション追加は superseded_by_current_contract として除外する。REQ 構成の安定契約は REQ-0101-070（現行3セクション）が所有する。skill 側（agentdev-req-file-manager/SKILL.md、matching-and-merge.md）に残る関連情報セクション前提は OU-006 で是正する。RU-0024 の工程固有識別子除去は 20 SPEC へ適用する。"
  - id: CR-006
    conflict: |
      RU-0021 は REQ-0158 の composite-id 化・形式統一を要件化したが、REQ-0158 は RU-20260721-03 により retire 済み（docs/requirements/retired/REQ-0158.md）。内容は REQ-0108 等に統合済み。REQ-0101-072「retired REQ を標準構成変更の適用対象外」に照らし、retired REQ への composite-id 化は意味をなさない。
    resolution: |
      RU-0021 を本ドラフトから除外する。RU-0021 の横断確認（composite-id 導入前 REQ の横展、旧形式参照確認）は別途 inspect-docs/requirements-review で処理する。ユーザー合意（選択肢4）に基づく。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0014
    source_actions: [ACT-REQ-001, ACT-SPEC-001]
    target_req: REQ-0146
    target_artifacts:
      - docs/requirements/REQ-0146.md
      - docs/specs/quality/quality-gates.md
      - src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-005
    source_ru: RU-0024
    source_actions: [ACT-SPEC-006, ACT-SPEC-007, ACT-SPEC-008, ACT-SPEC-009, ACT-SPEC-010, ACT-SPEC-011, ACT-SPEC-012, ACT-SPEC-013, ACT-SPEC-014, ACT-SPEC-015, ACT-SPEC-016, ACT-SPEC-017, ACT-SPEC-018, ACT-SPEC-019, ACT-SPEC-020, ACT-SPEC-021, ACT-SPEC-022, ACT-SPEC-023, ACT-SPEC-024, ACT-SPEC-025, ACT-SPEC-026, ACT-SPEC-027, ACT-SPEC-028, ACT-SPEC-029, ACT-SPEC-030, ACT-SPEC-031, ACT-SPEC-032, ACT-SPEC-033, ACT-SPEC-034, ACT-SPEC-035, ACT-SPEC-036, ACT-SPEC-037, ACT-SPEC-038, ACT-SPEC-039, ACT-SPEC-040, ACT-SPEC-041]
    target_artifacts:
      - docs/specs/foundations/document-model.md
      - docs/specs/responsibilities/document-type-responsibilities.md
      - docs/specs/responsibilities/artifact-responsibilities.md
      - docs/specs/responsibilities/artifact-contracts.md
      - docs/specs/commands/learning-promote.md
      - docs/specs/commands/intake-promote.md
      - docs/specs/local/audit-ledger-lifecycle.md
      - docs/specs/commands/_template.md
      - docs/specs/commands/spec-save.md
      - docs/specs/commands/req-define.md
      - docs/specs/commands/backlog-review.md
      - docs/specs/skills/_template.md
      - docs/specs/foundations/design-principles.md
      - docs/specs/authoring/command-file-format.md
      - docs/specs/skills/agentdev-spec-file-manager.md
      - docs/specs/skills/agentdev-artifact-validation.md
      - docs/specs/skills/agentdev-doc-diagnostics.md
      - docs/specs/responsibilities/responsibility-boundary-purification.md
      - docs/specs/quality/spec-health-metrics.md
      - docs/specs/quality/req-health-metrics.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: epic
    result: {}

  - ou_id: OU-006
    source_ru: RU-0023
    target_artifacts:
      - src/opencode/skills/agentdev-req-file-manager/SKILL.md
      - src/opencode/skills/agentdev-req-file-manager/references/matching-and-merge.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-0146-011 と qg-4-final-acceptance.md 観点9を読み、識別子を主評価値、実測値を補助値として扱う同一の意味を確認する。
    pass_criteria: |
      REQ-0146-011 が前工程完了度を主題にせず、QG-4 観点9との参照意味が一致する。
    on_failure: |
      fix-and-reverify: REQ-0146-011 または観点9の表現を修正し、両者を再読して意味の一致を確認する。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-0146 の要件テーブルを確認し、前工程完了度の契約が REQ-0146-016 に一度だけ記録されていることを確認する。
    pass_criteria: |
      REQ-0146-016 が存在し、REQ-0146-011 と同じ主題を重複して保持しない。
    on_failure: |
      fix-and-reverify: 要件行の主題と番号を修正し、重複と欠落の両方を再確認する。
  - id: TS-003
    target_item: AG-003
    verification: |
      quality-gates.md の QG-4 節と qg-4-final-acceptance.md 観点9を確認する。
    pass_criteria: |
      REQ-0146-011 の意味不一致を説明する暫定注記がなく、QG-4 の詳細参照が更新後の要件と矛盾しない。
    on_failure: |
      fix-and-reverify: 参照先または注記を修正し、QG-4 の仕様と実行時 reference を再確認する。
  - id: TS-008
    target_item: AG-008
    verification: |
      RU-0024 が列挙する 20 SPEC を対象に、AG-001 から AG-019、RU-20260722-01、RU-20260722-02 の残留を再検索する。
    pass_criteria: |
      現行基準本文に工程固有識別子が 0 件であり、置換後も各節が現在契約として読める。
    on_failure: |
      record-in-findings: 置換すると現行契約の根拠を失う箇所は、残留識別子、必要な安定 REQ/ADR 根拠、候補文を Findings に記録して個別判断へ分離する。
  - id: TS-009
    target_item: AG-009
    verification: |
      20 SPEC の置換箇所を読み、主論理区分、正規所有対象、検査責務の根拠が工程由来の ID に依存していないことを確認する。
    pass_criteria: |
      ADR-0139 の正規所有モデルに必要な意味が現行 REQ/ADR の安定 IDまたは現在契約の散文で保持される。
    on_failure: |
      fix-and-reverify: 失われた根拠を現行 REQ/ADR または現在契約の散文で補い、工程固有識別子を再導入せずに再確認する。
  - id: TS-010
    target_item: AG-010
    verification: |
      responsibility-boundary-purification.md の横断的再評価基準とパターンベース是正の指針を確認する。
    pass_criteria: |
      同ファイルに AG-* または RU-20260722-* が残らず、自己言及的な免除もない。
    on_failure: |
      fix-and-reverify: 自己参照として残る工程由来の表現を現在契約の説明へ置換し、20 SPEC の再検索を再実行する。

  - id: TS-012
    target_item: AG-013
    verification: |
      `src/opencode/skills/agentdev-req-file-manager/SKILL.md` と `src/opencode/skills/agentdev-req-file-manager/references/matching-and-merge.md` を読み、関連情報セクション前提と ADR 逆参照前提が現行3セクション契約（目的・要件・適用範囲）へ是正されていることを確認する。
    pass_criteria: |
      両ファイルに `## 関連情報` セクション必須化、REQ 間双方向参照、ADR 逆参照の前提が残らないこと。
      現行 REQ 標準構成（REQ-0101-070、patterns.md）と矛盾しないこと。
    on_failure: |
      fix-and-reverify: 残存する関連情報セクション前提を除去または現行契約へ是正し、両ファイルを再読して矛盾がないことを確認する。

case_open_hints:
  epic_needed: true
  epic_slug: backlog26-rus-integrated
  adr_0139_alignment: |
    REQ-0146 は QG-4 識別子中心評価の安定契約を所有する。
    20 SPEC は各 SPEC の現在契約を所有し、工程固有識別子を除去して安定根拠（REQ/ADR）へ置換する。
    skill 側（agentdev-req-file-manager）に残る関連情報セクション前提は現行3セクション契約へ是正する。
    この分離は ADR-0139 の REQ/SPEC 意味分類と安定した関心キーによる正規所有モデルに従う。
  decomposition:
    - ou_id: OU-001
      scope: "REQ-0146-011 の意味修正、REQ-0146-016 の分離、QG-4 観点9の同期"
    - ou_id: OU-005
      scope: "20 SPEC の工程固有識別子除去"
    - ou_id: OU-006
      scope: "agentdev-req-file-manager/SKILL.md と matching-and-merge.md の関連情報セクション前提是正"
  wave_hints:
    - wave: 1
      targets: [OU-001]
      rationale: "REQ-0146 の意味修正と QG-4 観点9の同期は独立した前提整備。"
    - wave: 2
      targets: [OU-006]
      rationale: "skill 側の旧契約是正は独立ファイルで並列可能。"
    - wave: 3
      targets: [OU-005]
      rationale: "20 SPEC の工程固有識別子除去。OU-001 と OU-006 完了後に実施することが推奨だが、必須依存ではない。"
  excluded_rus:
    - ru_id: RU-0021
      reason: REQ-0158 retired により本ドラフト対象外。別途 inspect-docs/requirements-review で処理。
    - ru_id: RU-0023
      reason: 関連情報セクション追加要求は現行3セクション契約（REQ-0101-070、patterns.md、doc_requirement.md）により superseded。skill 側の旧記述是正のみ OU-006 で実施。

# review_dispositions: covered/rejected/superseded 等の分類と証跡。
# 実行対象外とした AG/ACT/OU/TS の追跡性を確保する（共通方針1、共通方針3）。
review_dispositions:
  - id: RD-001
    source_ru: RU-0023
    source_item: AG-004
    disposition: superseded
    reason_code: superseded_by_current_contract
    reason: 関連情報セクション追加要求は、後続で承認・反映された現行3セクション契約（REQ-0101-070、patterns.md、doc_requirement.md）により失効。RU-0023 を「skill是正要求」と読み替えるのではなく、現行契約で superseded として扱う。skill 側の旧記述是正のみ OU-006 で実施。related_removed_items 中の historical ACT-SPEC-026 は RU-0023 由来の旧 ACT であり、現行 ACT-SPEC-026（document-type-responsibilities.md `## SKILL 構造` 由来）とは別物。
    evidence:
      - path: docs/requirements/REQ-0101.md
        section: "REQ-0101-070"
        checked_at_commit: null
      - path: docs/specs/foundations/patterns.md
        section: "REQ セクション構成"
        checked_at_commit: null
      - path: src/opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md
        section: "テンプレート全体"
        checked_at_commit: null
    related_removed_items: [AG-005, AG-006, AG-007, AG-011, AG-012, "ACT-REQ-003〜ACT-REQ-020", ACT-SPEC-002, ACT-SPEC-003, ACT-SPEC-004, ACT-SPEC-005, "historical ACT-SPEC-026 (RU-0023 related_information action, retired)", OU-002, OU-003, OU-004, TS-004, TS-005, TS-006, TS-007, TS-011]
```

# summary

REQ-0146-011 を識別子中心評価へ更新し、前工程完了度を REQ-0146-016 として分離する。QG-4 観点9の暫定注記を削除し、REQ-0146-011 と意味を一致させる。

20 SPEC の工程固有識別子を除去し、現行 REQ と accepted ADR の安定 ID または現在契約の散文へ置換する。

RU-0023 の関連情報セクション追加要求は現行3セクション契約により superseded として除外し、skill 側の旧記述のみ OU-006 で是正する。

クラスタ全体の scale は standard（18 REQ 横断削除で縮小）。auto_ready は true（review_dispositions スキーマ適用完了、ACT-SPEC-017 の stale_target 判定は document-model.md `## SPEC 内部論理区分` の実在確認により取り消し、対象を 20 SPEC へ復元済み）。
