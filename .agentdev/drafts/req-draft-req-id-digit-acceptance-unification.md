---
draft_type: req_draft
topic_slug: req-id-digit-acceptance-unification
status: draft
created_at: "2026-10-26"
source_rus: []
---

# draft-data

```yaml
status: draft
work_type: feature
scale: standard
summary: |
  ADF標準生成と後続処理のID桁数不整合の是正（2026-10-26利用者合意4点・実行指示「進めて」）。
  受理検査の桁数上限を撤廃し、表示ゼロ埋め（最小幅・切詰めなし）と受理検証を分離する。
  REQ操作なし・Design/Decision行帰属で確定。新規Decision、numbering-policy・document-model・
  patterns・req-file-manager Design・install-script-usability機械工程節・IR-067/069の改訂と、
  実現面（桁数一般化・抽出統一・検出パターン・テスト）を保持する。
  旧ドラフト req-draft-install-prerequisite-acceptance-f1b-revision.md は本ドラフトで
  HQ-001/HQ-002が解決・記述単位が拡大したため superseded-by 本ドラフト（削除しない）。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

input_resolution:
  authoritative_input: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-req-id-consistency-20261026.md
  source_kind: explicit_read_only_correction_with_user_execution_instruction
  read_complete: true
  approval_basis: "確定入力 5〜16行（利用者原文と合意4点）、19行（実行指示「進めて。進捗状況を報告して」）、35〜63行（実施範囲と再開点）。監査メモ adf-req-numbering-rule-audit-20261026.md 29〜33行（ADF内部不整合の判定）。"
  policy_resolution:
    - "旧ドラフト HQ-001/HQ-002（検査入力の解決源とinstaller transport、bare check 既定挙動）は利用者の明示実行指示と合意4点4（通常の導入確認を毎回エージェント事前準備に依存させない）により解決。機械probe自己完結・Case非依存fixture・no-agent-prep-presumption。再質問しない。"
    - "既存の4系統読取専用調査事実（親が検証済み）を信頼し再調査しない。"
  scope: "受理検査の桁数上限撤廃（表示padとの分離）、採番・読取・参照検査・後続工程の一致、既存Case #3862義務の保持、新規Decision記録。"
  preserved:
    - "Case #3862（open/blocked）のTS-001〜006完了条件は Definition PR #3863 確定から変更しない。PR #3864（open）とworktree .worktrees/3862-fix・3862-review と5系統FAIL所見（義務として）は保持する。"
    - "staff-schedule-cfの4桁IDは当時の規則適合（監査メモ29〜33行）。改番しない。作成タスクを桁数違反として扱わない。"
    - "Case #3850 は再開しない。F1(a)(c)、F2〜F4の有効成果は保持。他プロジェクト・サーバー・リリースには触れない。"
    - "既存ID・参照の無断改番・正規化をしない。"
  self_hosting:
    applicable: true
    result: "consumer からの引継ぎ停止は適用しない。agentdev_handoff:true は生成しない。"
  out_of_scope:
    - "F1(a)残課題（reqRowIdPattern解決経路の契約化、代替経路充足手順の契約化、ゲート集合選択の構成可能性）は別正式単位の候補であり本ドラフトで扱わない。reqRowIdPattern入力フィールド自体は許容書式内でのproducer追加検査として現状維持。"
    - "別の必須導入工程への検査移動案は候補に留まり採用されていない。通常checkのagent事前準備必須化は承認されていない。"
    - "既存baseline failure 11件（出典: PR #3864 本文の検証記録「scripts 337 pass / 11 fail」および correction comment #6401169974）の修正は原条件と切り分けて本ドラフトの対象外。"
    - "既存baseline failure 11件の修正（原条件と切り分け）。"

prior_assessment_correction:
  - id: PAC-003
    corrected_claim: "旧ドラフトの HQ-001/HQ-002（解決源・transport・bare check既定挙動の未決）"
    correction: |
      利用者の明示実行指示と合意4点により解決。解決源はCase非依存fixture（有効書式のREQ行IDサンプル・
      実在するゲート実行体参照・解決可能パス）で機械probe自己完結、agent事前準備前提なし。
      本ドラフトの artifact_actions ACT-DESIGN-005 に反映済み。旧質問の再提示は行わない。

agreed_items:
  - id: AG-001
    content: |
      受理検査から不必要な固定桁数制約（3桁固定・4桁固定・\d{3,4} 型上限）を撤廃する。
      採番・読取・参照検査・後続工程の扱いを一致させる。受理検査は REQ- 接頭辞・ハイフン区切り・
      数値セグメント（REQ番号と行番号の2セグメント）・各セグメント最小1桁という形式妥当性のみを
      要求し、桁数上限を設けない。
  - id: AG-002
    content: |
      表示上のゼロ埋め（pad3/pad4 等）は最小幅の表示規則（切詰めなし）であり、受理上限として
      機能させない。既存ID・参照の無断改番・正規化を行わない。staff-schedule-cf の4桁IDは
      当時の規則に適合するため改番せず、作成タスクを桁数違反として扱わない。
  - id: AG-003
    content: |
      標準の採番結果を後続処理へ渡す回帰試験を成立させ、桁数が増えた場合（5桁以上のREQ部、
      4桁以上の行部）も確認する。不正形式（誤接頭辞・非数値・区切り欠落・空セグメント）は
      引き続き拒否する。
  - id: AG-004
    content: |
      導入前に不整合を発見する要求（REQ-009-053）は保持する。通常の導入確認を毎回
      エージェントの事前準備に依存させない。検査入力はCase非依存の値（有効書式のREQ行ID
      サンプル、実在するゲート実行体参照、解決可能パス）で機械probeとして自己完結する。
      Case固有フィールド（PR番号、ブランチ、definitionEdits、unclosed_cases 等）を
      導入時に要求しない。TS-001〜006 と未解消の5系統レビュー所見を義務として失わない。
      fixture正例を実際条件受入へ置換しない。

artifact_actions:
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: "new:req-id-digit-acceptance-unification"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ---
      title: "要件ID桁数の受理上限撤廃と表示ゼロ埋め・受理検証の分離"
      status: proposed
      created: "2026-10-26"
      updated: "2026-10-26"
      related_reqs: [REQ-004, REQ-009, REQ-012, REQ-051]
      ---

      # Decision: 要件ID桁数の受理上限撤廃と表示ゼロ埋め・受理検証の分離

      ## 決定

      識別子（REQ 番号、要件行 ID。DEC・IR 番号の受理検査も同様）の受理検査から桁数上限
      （3桁固定、4桁固定、\d{3,4} 型の上限を含む）を撤廃する。特に要件 ID（REQ 番号・要件行 ID）は
      標準採番出力と後続受理が任意桁数で一致することを要求する。
      受理検査が要求するのは次の形式妥当性のみとする: `REQ-` 接頭辞、ハイフン区切り、数値セグメント、
      各セグメント最小1桁。表示上のゼロ埋め（3桁・4桁等の pad 指定）は最小幅の表示規則であり切詰めを行わず、
      受理上限として機能させない。既存ID・参照の無断改番・正規化は行わない。

      ## 背景

      2026-10-26 の利用者合意4点。ADF標準（req-file-manager SKILL の4桁 pad 規定、alloc-composite-id の pad4 出力）
      が生成する4桁ID（staff-schedule-cf REQ-0063-004、導入版 d8cd309b5）を、定義PR準備が3桁固定で拒否した
      実例がある。これはADF内部の生成規則と後続受理条件の不整合であり、導入先独自形式の問題ではない。

      ## 代替案と選択根拠

      1. 3桁限定を4桁限定へ変更 — 却下。上限の位置を変えるだけで、5桁以上の採番で不整合が再発する
      2. 3〜4桁受理への拡張 — 却下。同上。桁数が増えた場合に再び詰む
      3. 受理上限の撤廃と表示・受理の分離（採用）— 標準採番出力と後続受理が任意桁数で一致し、
         表示規則と受理規則が独立する。既存corpus（3桁）と実例（4桁）と将来の増桁を単一規則で扱える

      ## 判断根拠

      - 利用者合意4点（2026-10-26 確定入力 12〜16行）と実行指示（19行）
      - 既存 REQ 行は桁数上限を規定しておらず、上限は Decision 層の現行 corpus 事実記述（DEC-001、DEC-009。
        意味的不変のため直接編集せず、本 Decision が新規に上限撤廃を記録する）と Design 層に所在
      - 妥当性検査（接頭辞・区切り・数値・最小1桁）の維持により、偽ID受理を防ぐ
      - 既存ID・参照の無断改番禁止により、既存成果（3桁corpus・staff-schedule-cf 4桁）を保持する

      ## 影響

      numbering-policy・document-model・patterns・req-file-manager 系の記述統一、参照検査実装
      （traceability・case-open/close scripts・integrity checker・textlint・generate_indexes）の
      桁数一般化、artifact-validation lib と req-file-manager の抽出統一。
      IR-067 の旧4桁帯除外（設計要件4、v2 歴史帯）は本 Decision により変更しない。
      桁数上限の撤廃により、旧4桁帯の裸ID（例: REQ-0136-029）が受理層で形式妥当として通ることは
      意図された挙動である（受理は形式のみを検査し、実在性は IR-067・参照実在検査が扱う。本記述は
      将来のレビューで退行と誤読されないための明示）。

      ## 関連する決定

      - DEC-001、DEC-009（現行 corpus の ID 形式記述。意味変更は行わないため relates-to として参照する）
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/foundations/numbering-policy.md
    target_area: "## 識別子形式"
    source_items: [AG-001, AG-002]
    content: |
      ## 識別子形式

      | 種別 | 形式 | 表示 | 接頭辞 |
      |------|------|------|--------|
      | REQ | `REQ-{NNN}` | 3桁ゼロ埋め（最小幅。切詰めしない） | `REQ-` |
      | Decision | `DEC-{NNN}` | 3桁ゼロ埋め（最小幅。切詰めしない） | `DEC-` |
      | IR | `IR-{NNN}` | 3桁ゼロ埋め（最小幅。切詰めしない） | `IR-` |

      表示のゼロ埋めは最小幅の表示規則であり、受理検査の桁数上限として機能させない。識別子の受理検査は、
      接頭辞、区切り、数値セグメント、各セグメント最小1桁という形式妥当性のみを要求し、桁数上限を設けない
      （「要件ID桁数の受理上限撤廃と表示ゼロ埋め・受理検証の分離」Decision 参照）。

      要件行 ID（`REQ-{NNN}-{MMM}`）は REQ 識別子を前置し、REQ 内の要件行連番を付ける。
      詳細は `agentdev-req-file-manager` SKILL が定める。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/foundations/document-model.md
    target_area: "## 設定規則"
    source_items: [AG-001, AG-002]
    content: |
      ## 設定規則

      | 規則 | 内容 |
      |---|---|
      | REQ ID | 安定ID。表示はゼロ埋め（最小幅、切詰めしない）とし、受理検査に桁数上限を設けない。現行・廃止を問わず再利用しない |
      | Decision ID | 3桁ゼロ埋め（最小幅、切詰めしない）。状態はfrontmatterで管理する |
      | Design配置 | `docs/designs/**/*.md` |
      | Design status | `draft`、`accepted` の2値。status欠落は`accepted`相当。確定時の昇格はcase-closeが行う |
      | Guides配置 | `docs/guides/*.md` |
      | 廃止REQ | 物理削除を第一選択とし、履歴参照用途に限定してretired配下への移動も選択できる |
      | 廃止Decision | 物理削除を第一選択とし、履歴参照用途に限定してretired配下への移動も選択できる |
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/foundations/patterns.md
    target_area: "## REQ frontmatter 規約"
    source_items: [AG-001, AG-002]
    content: |
      ## REQ frontmatter 規約

      REQ文書のfrontmatterは以下のフィールドを持つ。

      ```yaml
      ---
      id: REQ-{NNN}
      title: {領域タイトル}
      created: {YYYY-MM-DD}
      updated: {YYYY-MM-DD}
      ---
      ```

      - 許可フィールドは`id`、`title`、`created`、`updated`だけとする。
      - `id`は`REQ-{NNN}`、要件行IDは`REQ-{NNN}-{MMM}`形式とする。表示のゼロ埋めは最小幅（切詰めしない）であり、受理検査に桁数上限を設けない。
      - REQ 本文を変更する際は frontmatter `updated` を変更日へ進行させる。機械検査（check_integrity の updated 鮮度突合）がこれを検証する。

      ### REQ セクション構成

      ```markdown
      ## 目的

      {この領域の要件が存在する理由}

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-{NNN}-001 | {検証可能な要件} |

      ## 適用範囲

      - **対象**: ...
      - **対象外**: ...
      ```

      REQファイルは`## 目的`、`## 要件`、`## 適用範囲`の3セクションだけを持つ。
      `## 関連情報`、`## Requirement Source`、`## Update Notes`、`## 関連ドキュメント更新候補`、変更履歴節は持たない。

      - 要件は検証可能な必達要件（満たす必要がある要件）として記述する。推奨、任意、将来候補は要件行に含めない。FR/NFR の区別を持たない
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-req-file-manager.md
    target_area: "## 現在の動作"
    source_items: [AG-001, AG-002]
    content: |
      ## 現在の動作

      - REQ-{NNN} 形式でゼロ埋め採番（最小幅の表示。受理検査に桁数上限を設けない。SKILL の4桁記述は表示の代表例であり受理上限ではない）
      - 要件行は「変更後に満たすべき振る舞い、制約、状態」のみ記述
      - 実装指示は要件行に含めない
      - bugfix では REQ ファイルを作成しない
      - 旧 REQ 群（v2:REQ-0001〜0050）は2026-07-20に物理削除済みであり、履歴資料は tag `v2.11.0` で参照する。現行判断の根拠としない
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/local/install-script-usability.md
    target_area: "### 機械工程 script の実行時前提の導入時検証（REQ-009-053）"
    source_items: [AG-004]
    content: |
      ### 機械工程 script の実行時前提の導入時検証（REQ-009-053）

      check モードは静的構成検査に加えて、配布物の主要な機械工程 script（定義PR準備、定義PR受入検査、クローズ機械工程、横断依存検査）の実行時前提の不一致を導入時に検出する。検証は各 script の副作用のない入力検証 dry-run 入口（入力 JSON の検証のみを行い、worktree 作成・ファイル変更・ゲート実行を行わない入口）または同等の手段によって行い、check モードの非破壊契約（REQ-050-005）を維持する。

      - 検証対象 script の範囲と各 script の dry-run 入口の仕様は配布 skill の script 契約（scripts/README.md 等）が所有し、本節は検出契機と報告形式を定める
      - 検出した前提の不一致（必須ゲートの不在、入力書式の不整合、解決不能なパス形式等）は既存の divergence 報告形式で報告し、check の終了コードに反映する。検証自体の実行失敗（script の不在、入口契約の不整合）は検証不能として報告し、成功扱いとしない
      - dry-run 入口を持たない機械工程 script に対しては、入力検証相当の検証方法（入力 JSON の契約検証、依存ツールの存在確認）を script 契約に定めてから check の検証対象へ組み込む

      - 検査入力は、配布先の実際の consumer 条件のうち書式・存在・パス条件の水準を表現する fixture で構成する: 有効な書式の REQ 行 ID のサンプル（Case 非依存の値）、consumer 配置に実在するゲート実行体の参照、解決可能なパス。Case 固有のフィールド（PR 番号、ブランチ、definitionEdits、unclosed_cases 等）を導入時に要求せず、検査自体をエージェントの事前準備に依存させない（機械的な probe として自己完結する）。空 JSON の受理拒否、bun の起動、script ファイルの存在、対象集合が空の入力の受理を、実行時前提の検証成立の証拠としない。入力書式の契約は script 契約の既定に従う
      - 検証は前提が揃う正例と前提を欠く負例の対照で成立を確認する。不足条件は隔離複写または fixture で構成し、producer 正本を移動・削除せず、管理対象ファイルを変更しない（REQ-050-005）
      - 機械工程検査節の検出結果は節見出しと検証対象ごとの結果行で判読可能に報告する。終了コードへの反映と divergence の統一集約（本節の既存規定）を維持しつつ、機械工程検査節は installer 全体の他の divergence の有無に依存せず節単独で検出結果を判読できる
      - 検査入力 JSON の一時配置は対象 script 契約の置き場所指針に従う。横断依存検査の検査入力は workspace 外一時領域へ置かず、project root 内の契約に従う位置へ置く
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md
    target_area: "# IR-067: referenced-req-row-existence"
    source_items: [AG-001]
    content: |
      ---
      title: "IR-067: referenced-req-row-existence"
      status: accepted
      created: 2026-08-22
      updated: 2026-10-26
      ---

      # IR-067: referenced-req-row-existence

      | Field | Value |
      |-------|-------|
      | rule_id | IR-067 |
      | description | docs 本文が引用する階層 REQ 行 ID（`REQ-NNN-NNN`、現行番号帯。桁数上限なし。旧4桁番号帯 `REQ-NNNN-NNN`〔0141 未満〕は設計要件4により検出対象外を維持）の実在性を機械検査する。引用先の行 ID が docs/requirements の要件行テーブルに存在しない場合（ファントム引用: 未コミット草案番号の引用残存、要件分割前の旧行 ID 残存）に検出する。テンプレート・例示のプレースホルダー（`REQ-010-NNN`、`REQ-{NNNN}-{NNN}` 等の非数字形式）は正規表現上マッチせず誤検出しない（REQ-010-065 許容条件準拠、REQ-010-069） |
      | severity | strict |
      | category | document-drift |
      | detection_method | `check_integrity.ts`（`checkReferencedReqRowExistence`）による走査。(1) `docs/requirements/*.md` と `retired/*.md` の表行（`\|` 先頭行）から行 ID インデックスを構築、(2) docs 本文（docs/designs、docs/requirements、docs/decisions、docs/guides、src/common、.opencode/commands、.agentdev/extensions、ルート README.md、docs/README.md）の引用を突合する。階層 ID 検索の3点設計（checker-execution-contracts Design）: v2: プレフィックス許容、表行先頭出現を実在の正とする、前置一致除外（旧4桁番号帯 `REQ-NNNN-NNN` は検出対象外。現行帯内の増桁は前置一致誤検出しない解析で扱う） |
      | affected_artifacts | [docs/designs/**, docs/requirements/*.md, docs/decisions/*.md, docs/guides/*.md, src/common/**, .opencode/commands/**, .agentdev/extensions/**, README.md, docs/README.md] |
      | related_req | [REQ-010-069, REQ-010-065, REQ-010-068] |
      | related_design | [../integrity-rule-catalog.md, ../checker-execution-contracts.md] |
      | gate_level | full-audit |
      | false_positive_risk | 中。履歴・様式領域を免除する: `v2:` プレフィックス付き歴史識別子、code span / code block、テンプレート領域（`_template.md`、`templates/`）、IR ルール説明文（v2:REQ-0145-015）、AUTOGEN ブロック（checker-execution-contracts 検出対象除外規定）、retired ディレクトリ、`docs/reports/`。導入時点の既知違反（要件分割由来の旧行 ID 引用）は NG baseline で管理する |
      | regression_test | `check_integrity.test.ts` describe "IR-067 referenced-req-row-existence (REQ-010-069, Issue #2383 (a))"。正常例（実在行 ID の引用）・違反例（ファントム行 ID）・境界例（v2: プレフィックス・プレースホルダー・旧4桁番号帯・code span）・許容例（_template.md・AUTOGEN ブロック・IR ルール説明文）・再現例（PR 2284 ファントム引用パターン）の 5 種 fixture |
      | finding_route | intake |
      | triage_action | 新規検出（baseline 超過分）は引用先の再同定（現行要件行への置換、または履歴注記化・削除）。旧4桁番号帯（`REQ-0136-029` 等、F-04）は本ルールの検出対象外である（0141 未満の v2 歴史帯） |
      | last_verified | 2026-08-22 |

      ## 検査項目

      | # | 検査項目 | 失敗時 |
      |---|----------|--------|
      | 1 | 引用された行 ID（`REQ-NNN-NNN`）が docs/requirements の要件行テーブル（現行または retired）に実在すること | strict fail |
      | 2 | 行 ID インデックスは表行（`\|` 先頭行）から構築され、本文言及を実在扱いにしないこと（定義と引用の区別） | 設計要件 |
      | 3 | プレースホルダー様式例示（非数字形式）を誤検出しないこと（REQ-010-065） | 設計要件 |
      | 4 | 過去版 REQ の参照は `v2:REQ-{0141+}-{NNN}` 形式を正とし、裸 4 桁表記（`REQ-0136-029` 等）は検出対象とする。ただし IR-067 の旧 4 桁帯検出除外規則（0141 未満）は維持する | 設計要件 |

      ## exemption（許容条件）

      | 対象 | 理由 |
      |------|------|
      | `v2:REQ-NNN-NNN` プレフィックス付き | 歴史識別子（旧番号帯の正規参照形式） |
      | `REQ-010-NNN`、`REQ-{NNNN}-{NNN}` 等の非数字形式 | プレースホルダー様式例示（REQ-010-065 許容条件。正規表現上マッチしない） |
      | code span / fenced code block 内 | 様式例示 |
      | `_template.md`、`src/common/commands/agentdev/templates/`、`src/common/skills/*/templates/` | テンプレート領域 |
      | `docs/designs/integrity/rules/IR-*.md` | 例示用 ID を含む自己参照的資料（v2:REQ-0145-015、他検出関数と同一） |
      | AUTOGEN ブロック内の行 | 機械生成領域（checker-execution-contracts 検出対象除外規定） |
      | `docs/requirements/retired/`、`docs/decisions/retired/`、`docs/reports/` | 履歴領域 |
      | 旧4桁番号帯 `REQ-NNNN-NNN`（v2: なし、0141 未満） | 検出対象外（前置一致除外。F-04 是正は OU-007 スコープ） |

      ## baseline 運用

      導入時点の既知違反（要件分割由来の旧行 ID 引用）は NG baseline additions（provenance `issue-2383-ir067-initial-baseline`）で管理する。baseline に登録された既知違反の消化後は baseline 登録を解除し、docs/designs・docs/decisions を含む本文全走査で全件 strict 適用を継続する。baseline 登録後、新規のファントム引用（未コミット草案番号の混入等）は即時に strict fail として検出する。

      ## See Also

      - [integrity-rule-catalog.md](../integrity-rule-catalog.md)
      - [rule-ownership.md](../rule-ownership.md)
      - [checker-execution-contracts.md](../checker-execution-contracts.md)（階層 ID 検索の3点設計、検出対象除外規定）
  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target: docs/designs/integrity/rules/IR-069-req-number-gap-recorded.md
    target_area: "# IR-069: req-number-gap-recorded"
    source_items: [AG-001]
    content: |
      ---
      title: "IR-069: req-number-gap-recorded"
      status: accepted
      created: 2026-09-17
      updated: 2026-10-26
      ---

      # IR-069: req-number-gap-recorded

      | Field | Value |
      |-------|-------|
      | rule_id | IR-069 |
      | description | REQ 番号（現行採番帯。桁数上限なし。旧4桁帯 v2:REQ-01XX は検出対象外）の実体（active + retired）から欠番を算出し、`docs/requirements/README.md` と `docs/README.md` の両「欠番」明記と突合する。帯中（末尾予約枠を除く）の欠番が README 2件のいずれかで「欠番」を含む本文行（AUTOGEN 外）の REQ-NNN 単体または REQ-NNN〜REQ-NNN 範囲で明記されていない場合、無記録欠番として検出する。範囲明記の全番号が実体を持つ場合は陳腐化した欠番明記として検出する（REQ-010-070、Case #2917、RU-0034） |
      | severity | strict（無記録欠番・陳腐化範囲明記ともに strict） |
      | category | document-drift |
      | detection_method | `check_integrity.ts`（`checkReqNumberGapRecorded`）による実体列挙と README 明記の突合。(1) `docs/requirements/REQ-{NNN}.md`（現行採番帯。旧4桁帯 v2:REQ-01XX は対象外）と `docs/requirements/retired/REQ-{NNN}.md` から実在番号集合を列挙する（retired 番号は欠番ではない）。(2) [1..最大番号] の欠番を算出し、最大番号の直前開区間（第2最大実在番号と最大番号の間）を末尾予約枠として許容する。(3) 両 README の「欠番」を含む行（AUTOGEN ブロック内を除外）から REQ-NNN 単体（実体不在のもの）と REQ-NNN〜REQ-NNN 範囲を明記主張として抽出する。実体が存在する単体トークン（採番由来などの文脈言及）は主張として扱わない。(4) 帯中の欠番が当該 README の主張でカバーされない場合、連番単位に集約して無記録欠番として strict fail する。(5) 範囲主張の全番号が実在する場合、陳腐化した欠番明記として strict fail する |
      | affected_artifacts | [docs/requirements/REQ-*.md, docs/requirements/retired/REQ-*.md, docs/requirements/README.md, docs/README.md] |
      | related_req | [REQ-010-068, REQ-010-070] |
      | related_design | [../integrity-rule-catalog.md, ../../foundations/numbering-policy.md, ../checker-execution-contracts.md] |
      | gate_level | full-audit |
      | false_positive_risk | 低。検査対象は現行採番帯（桁数上限なし）に限定し、旧4桁帯（v2:REQ-01XX）は検出しない。最大番号直前の末尾予約枠（並行 Case の共有予約・採番返却の過渡帯。REQ-083〜096 共有予約枠運用）は許容し、予約枠解消（当該番号の実体化または恒久欠番確定）後に帯中欠番として検出対象へ移行する。README の AUTOGEN ブロック内の言及は機械生成領域のため明記として数えない。実在番号の単体トークンは文脈言及として主張扱いしない（例: 「REQ-082 採番時」の REQ-082）。fixture リポジトリ（旧帯の番号のみ、または単一現行番号）は帯空または末尾予約枠のみとなり検出しない |
      | regression_test | `check_integrity.test.ts` describe "IR-069 req-number-gap-recorded (REQ-010-070, Case #2917)"。正常例（帯中欠番の両 README 明記）・違反例（無記録欠番・陳腐化範囲明記）・境界例（AUTOGEN 内のみの明記・旧帯混在）・許容例（retired 番号・文脈言及）・再現例（RU-0034 形状: 帯中予約欠番の無記録 + 末尾予約枠の過渡帯許容）の 5 種 fixture。加えて describe "broken-req-ref range-span exemption (v2:REQ-0108-194, Case #2917)"（帯表現端点の broken-req-ref 除外と範囲外単独参照の継続検出） |
      | finding_route | intake |
      | triage_action | 無記録欠番は `numbering-policy.md`「既知の欠番」への記録と README 2件への「欠番」明記（AUTOGEN 外の本文行、REQ 接頭辞付きの単体または範囲表記）で解消する。陳腐化した範囲明記は実体の採番状態に合わせて範囲を修正する。末尾予約枠に属する番号は予約枠解消のタイミング（当該番号の実体化または恒久欠番確定）で既知欠番記録へ移行する |
      | last_verified | 2026-09-17 |

      ## 検査項目

      | # | 検査項目 | 失敗時 |
      |---|----------|--------|
      | 1 | 帯中の欠番（末尾予約枠を除く）が `docs/requirements/README.md` の「欠番」を含む本文行（AUTOGEN 外）で明記されていること | strict fail |
      | 2 | 帯中の欠番が `docs/README.md` の「欠番」を含む本文行（AUTOGEN 外）で明記されていること | strict fail |
      | 3 | 欠番明記の範囲主張（REQ-NNN〜REQ-NNN）の全番号が実体を持たないこと（陳腐化した範囲明記の検出） | strict fail |
      | 4 | retired 配下の REQ 番号は欠番として扱わないこと | 設計要件 |
      | 5 | 最大番号直前の末尾予約枠は「欠番」明記なしで許容すること（過渡帯の info 可視化） | 設計要件 |
      | 6 | 検査対象を現行採番帯（桁数上限なし）に限定し、旧4桁帯（v2:REQ-01XX）を検出しないこと | 設計要件 |

      ## numbering-policy との関係

      欠番の維持・明記義務は `numbering-policy.md`「欠番の扱い」「既知の欠番」が正規所有する。本ルールは同 Design が要求する「各 README、索引類で『欠番』として明記し、実体不在と整合する」状態の機械検証を担う。採番例外（ユーザー裁定による番号指定）の規定自体は numbering-policy「新規採番」が所有し、本ルールは採番結果としての欠番状態のみを検査する。

      ## exemption（許容条件）

      | 対象 | 理由 |
      |------|------|
      | 旧4桁 REQ 番号帯（v2:REQ-01XX） | 過去版の番号体系。現行採番帯の採番規則の対象外 |
      | `retired/` 配下の REQ 番号 | 廃止済み識別子は実在として扱う（廃止は欠番を生じない、numbering-policy「廃止時の扱い」） |
      | 最大番号直前の末尾予約枠 | 並行 Case の共有予約・採番返却の過渡帯（REQ-083〜096 共有予約枠運用）。恒久欠番と機械的に区別できないため info で可視化のみ行う |
      | README の AUTOGEN ブロック内の言及 | 機械生成領域。手書きの明記は再生成で失われるため明記として数えない（明記は AUTOGEN 外の本文に置く） |
      | 「欠番」行上の実在番号の単体トークン | 採番由来などの文脈言及（例: 「REQ-082 採番時」）。実体不在の単体トークンのみ明記主張として扱う |

      ## baseline 運用

      導入時点（Case #2917、2026-09-17）の現行リポジトリは、REQ-063〜REQ-081（19連番）が README 2件に明記済み、REQ-084〜REQ-086 が末尾予約枠（共有予約枠 REQ-083〜096 の未使用・返却枠）として本ルールの検出対象外である。既知違反は存在しないため NG baseline の追加登録は行わない。予約枠解消後も実体化しない番号が残る場合は、numbering-policy「既知の欠番」への記録と README 明記を追加して解消する。

      ## See Also

      - [integrity-rule-catalog.md](../integrity-rule-catalog.md)
      - [rule-ownership.md](../rule-ownership.md)
      - [../../foundations/numbering-policy.md](../../foundations/numbering-policy.md)（採番規則・欠番維持の正規所有者）
      - [checker-execution-contracts.md](../checker-execution-contracts.md)（checker 共通実行契約）

gate_results:
  step_1: "completed: 確定入力63行と監査メモ40行の全文読込、行番号引用の実測照合（5〜16・19行、35〜63行）。"
  step_2: "completed: 利用者合意4点を AG-001〜004 へ忠実に対応付け。既存Case #3862・PR #3864・worktree・5系統FAIL所見の保持を確認。self-hosting例外確認。"
  step_3: "completed: 既存REQ照合は REQ操作なし で確定（観測 20261026T044415Z-ec41。references ハッシュ実測照合、HEAD e16674747 一致）。REQ-001 内「桁」0件、REQ-012.md:50 は文字列形式を要件で固定しないと明文化、REQ-051 も桁数上限に不触れ。"
  step_4: "completed: 最終分類は Design行・分離true（観測 20261026T044524Z-b76a。step3-observation reference digest の計算漏れ誤記をドラフト内で開示済み、前提のprovenanceは観測1本体で検証済み）。5観点境界リスク分析を実施し test_strategy へ投影。IR-044/055/071/072 のルール文書桁数言及ゼロを実測確認（改訂不要・case-run で文言整合確認）。design対応事前確認: 既存REQ行の意味変更なしのため coverage 実査不要。"
  step_5: "completed: Decision required_new を確定。重複確認（docs/decisions の「桁数」言及実測0件。DEC-001:104・DEC-009:36/93 は corpus 事実記述であり意味的不変）、Decision 禁止ゲート（仕様変更であり作業手段のDecision化ではない）、architecture-advisory 委譲実施（4ラベル構造。ブロッカーなし）。"
  step_6_qg1: "completed: 必須fields到達、execution_groups 不含、artifact_actions content 完全確定（決定的マーカーなし）、test_strategy 3要素完全（TS-001〜010）、5観点→test_strategy 投影完全。QG-1 合格。"
  step_7: "completed: work_type=feature（bugfix + Decision必要時は feature 昇格ルール〔draft-generation.md 110行〕の適用。新規 Decision ACT-DEC-001 あり）。scale=standard（単一主題の機械的統一訂正、Epic分解不要、large昇格シグナルなし）。"
  step_8: "completed: adversarial-review 発動（default-on）。3系統並行（architecture-advisory ses_e896d166effeqSH8nVbVTMxg4S〔4ラベル構造・ブロッカーなし〕、契約整合 ses_e896d1681ffe6xqcXOSR0h68Dq〔REQUEST-CHANGES essential 1件〕、実効性 ses_e896d15efffe3YDRSj6pPImQdk〔REQUEST-CHANGES essential 3件〕）。対称的相互反証・Reviewee counter-challenge・戦略メタ反証（3系統とも桁数撤廃ポリシー・受理意味論仕様・Case #3862義務保持・IR-067/069文言改訂への根本異議なし。essential は網羅性・内部整合・検証力の補完のみ）・convergence・反映後 convergence audit を実施。反映: ACT-DESIGN-003 target_area を実在見出し「## REQ frontmatter 規約」へ修正し REQ セクション構成節を content へ包含、RA-004 の虚偽参照修正と check_test_impact.ts:87・:2163・current_refs.ts:3 追記、TS-008 へ textlint suppress・generate_indexes 行カウント追加、Decision 本文の識別子スコープ一致・updated・関連する決定節・影響節 v2受理層注記、AG-001 セグメント数明示、「11件」出典補記（PR #3864 検証記録）、RA-003 パス修正と idPattern 扱い、RA-004 辞書式ハザード文言、install-script-usability 空行復元、assembly_evidence 行範囲修正。unresolved なユーザー判断事項なし。"
  step_9: "completed: 本ドラフトを保存し読み戻し完結性確認（fenced YAML 閉包・標準14 fields・決定的マーカーなし・文字化けなし）と YAML 構造機械検証（pyyaml）を実施。明示パス指定 commit で永続化（draft ファイルのみ。スイープstageなし、ステージ済み他者変更を含まない。Jev 観測 JSON は commit 対象外として残置）。"
  step_10_11: "completed: 要件doc提示と完了報告（feature standard。完了報告テンプレート選択は work_type・scale に応じ feature.md 種別で提示）。"
  jev:
    invoked: true
    observations:
      - id: "20261026T044415Z-ec41"
        kind: existing-req-matching
        disposition: "採用。references ハッシュ実測照合（6件すべて記録値と一致、HEAD e16674747 と一致）し provenance 完全を確認。REQ操作なし/確認不要を採用（confidence 1）。"
      - id: "20261026T044524Z-b76a"
        kind: expansion-final-classification
        disposition: "採用（判断根拠に透明性の注記付き）。Design行/分離true、confidence 1。step3-observation reference の digest が観測1 JSON 実ハッシュ（4883a238be00643f4726c3bad6f7fc434f5a51bfe287243c1e5c54838fde48d6）と一致せず（評価入力構成時の計算漏れによる誤記）。観測は手編集せず保持し、前提（観測1の finalResult: REQ操作なし）の provenance は観測1本体で検証済み。他の5 references は実ハッシュと一致を確認済み。新規 questionIds（-20261026 接尾）で semantic subject 変更に対応。"
    api_failure: null
    reason: "公開Tool（agentdev_jev）の evaluate と observation_write を所定経路で実行。LLM推論は評価結果・確率分布・confidence を含む従来の判断材料で実施し、最終判断は両評価とも evaluator 結果と一致。"
    failure_policy: "評価器障害時は判定未確定停止と依存後続抑止（DEC-052）。API失敗なしのため適用機会なし。"

important_change_notice:
  emitted_before_this_write: true
  reference: "本実行の新規ドラフト作成直前の利用者向け実行出力通知。REQ操作なし・Design/Decision行帰属・新規Decision・Design/IR改訂・実現面変更方針・確定事項と未決なしを説明。旧ドラフト（f1b-revision）の HQ-001/HQ-002 が利用者の明示実行指示と合意4点で解決したことを記録し再質問しない。"

conflict_resolutions:
  - "DEC-001・DEC-009 の「現行…3桁ID」記述は現行 corpus の事実記述であり、既存IDを改番しないため事実として真のまま残す（accepted Decision の意味的不変、REQ-001-056〜060）。桁数上限の撤廃は新規 Decision で記録する。docs/decisions 配下の桁数言及は実測 0 件で重複なし。"

operation_units:
  - ou_id: OU-001
    target_req: null
    target_design: "docs/designs/local/install-script-usability.md、docs/designs/foundations/numbering-policy.md、docs/designs/foundations/document-model.md、docs/designs/foundations/patterns.md、docs/designs/skills/agentdev-req-file-manager.md、docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md、docs/designs/integrity/rules/IR-069-req-number-gap-recorded.md、new Decision"
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    classification_basis: |
      既存REQ照合は REQ操作なし で確定（観測 20261026T044415Z-ec41。references ハッシュ実測照合済み、
      HEAD e16674747 一致）。最終分類は Design行・分離true（観測 20261026T044524Z-b76a）。
      桁数規定は Decision 層の現行 corpus 事実記述と Design 層に所在し、REQ 行への新規作成・意味変更は不要。

result: {}

realization_actions:
  - id: RA-001
    concern: 受理検査の桁数一般化（単一実装への統一）
    responsibility: |
      REQ 行IDの受理検査は単一の共通実装が所有する。definition-traceability-gate.ts の isReqRowId を
      桁数上限なし（REQ- 接頭辞＋ハイフン区切り＋数値セグメント＋各セグメント最小1桁）へ一般化し、
      prepare_definition_pr・accept_definition_checks はこれを再利用する。close_mechanical_steps の
      --req 独自パターン copy は共通ヘルパーへ統一する（KNOWN_GATE_ARG_CONTRACTS --req 契約3スクリプト）。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-open/scripts/lib/definition-traceability-gate.ts:72"
      - "prepare_definition_pr.ts:389、accept_definition_checks.ts:254、close_mechanical_steps.ts:274"
    intent: |
      標準採番出力（任意桁数）が受理され、不正形式（誤接頭辞・非数値・区切り欠落・空セグメント）は
      拒否される。未解析部分的一致（REQ-0063-0123 から REQ-0063-012 の抽出）を排除し、
      前置一致を誤検出しない。5桁以上REQ部・4桁以上行部を可視化する。
    verification_refs: [TS-007, TS-008]
    source_items: [AG-001, AG-003]
  - id: RA-002
    concern: traceability lib・shared_area_registration の桁数一般化
    responsibility: traceability と横断依存検査の ID 解析は同一受理意味論に従う。
    ownership_hints:
      - "src/common/skills/agentdev-traceability/scripts/lib/（requirements.ts:24/27、verification_scope.ts:30、sidecar.ts:50、declarations.ts:52、inventory.ts:79）"
      - "src/common/skills/agentdev-workflow-case-open/scripts/lib/shared_area_registration.ts:11/52/93/98/104/109（rowNumber・prefix・expandSpan guard の増桁対応）"
    intent: 全パーサが同じ受理意味論（上限なし・最小1桁・非曖昧抽出）で動作する。
    verification_refs: [TS-007, TS-008]
    source_items: [AG-001, AG-003]
  - id: RA-003
    concern: req-file-manager と artifact-validation の抽出統一
    responsibility: |
      採番・読取側（req-file-manager）と検証側（artifact-validation）の ID 抽出を単一意味論へ統一する。
      artifact-validation の FIXED-4（extractReqNumber /^REQ-(\d{4})$/、fs-helpers）は現行3桁 corpus を
      スキップする latent no-op であり、req-file-manager 側の実装と統一する（共有単一ソースへの寄せは
      case-run の実装詳細とする）。check-req-row-existence の DEFAULT_ID_PATTERN 一般化に伴い、
      stdin の idPattern オーバーライド経路は既定パターン一般化と許容書式内で互換を維持する
      （producer 固有の reqRowIdPattern フィールドは out_of_scope の現状維持）。
    ownership_hints:
      - "src/common/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts:39、frontmatter.ts:49/63、fs-helpers.ts:12、alloc-req-number.ts:69"
      - "src/common/skills/agentdev-artifact-validation/scripts/lib/frontmatter.ts:49、lib/fs-helpers.ts:12、src/check-req-row-existence.ts:55-56（DEFAULT_ID_PATTERN。stdin idPattern オーバーライド入力 :47 あり）"
    intent: 全抽出が標準採番出力と同一の受理意味論で動作する。
    verification_refs: [TS-007, TS-009]
    source_items: [AG-001, AG-003]
  - id: RA-004
    concern: integrity checker の検出パターン整合
    responsibility: |
      ルール文言と検出実装の整合。IR-044 の req-spec table row FIXED-4-3（現行3桁 corpus にマッチしない
      dead check）を修正。IR-055・IR-071・IR-072・retired-link（:1922、retired 一次参照走査 :2163）、
      range-staleness（:4882/4935。増桁時に文字列比較を数値比較へ置換する辞書式ハザード対応を含む）、
      current_refs（current_refs.ts:3）、テスト影響 gate（check_test_impact.ts:87 の REQ_ID_PATTERN）、
      IR-069 帯文言対応、IR-025（DEC 側）の影響確認。IR-067/069 は現行帯（桁数上限なし）・
      v2歴史帯除外維持の文言改訂に実装を整合させる。
    ownership_hints:
      - ".opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts:1922、2163、4882、4935、586、6942、7095、7348、7352、10326、10760、10979、11079"
      - ".opencode/skills/repo-agentdev-integrity/scripts/check_test_impact.ts:87（REQ_ID_PATTERN 3桁固定）"
      - ".opencode/skills/repo-agentdev-integrity/scripts/current_refs.ts:3（\\bREQ-\\d{3,4}\\b）"
      - "docs/designs/integrity/rules/IR-044/055/067/069/071/072 のルール文書（IR-067/069 の改訂は artifact_actions。IR-044/055/071/072 は桁数言及なしのため case-run 実装時に文言整合の要否を確認し必要時のみ改訂）"
    intent: dead check の解消と検出bandの現行帯整合（桁数上限なし・v2歴史帯除外維持）。
    verification_refs: [TS-009, TS-008]
    source_items: [AG-001, AG-003]
  - id: RA-005
    concern: textlint suppress と generate_indexes の桁数整合
    responsibility: 表行 suppress と行カウントの受理意味論統一。
    ownership_hints:
      - "src/opencode/plugins/agentdev-textlint-guard/lib/inspect.ts:128（3桁固定 suppress の一般化。4桁行の false positive 解消）"
      - 'generate_indexes.ts:1044（行部 \d{3} 固定の一般化。collectReqFiles:654 は既に桁数非依存）'
    intent: 4桁以上の行が suppress・カウントから漏れない。
    verification_refs: [TS-007, TS-009]
    source_items: [AG-001]
  - id: RA-006
    concern: install.ps1 probe とテスト更新
    responsibility: |
      worktree install.ps1 probe の fixture REQ行ID（REQ-001-001 リテラルと3〜4桁コメント）を新受理意味論に
      整合する。テスト更新と新規回帰テスト（5桁req+4桁row受理、mis-parse排除、corpus非退行、改番なし）を追加。
      tim_declarations_contract.test.ts:54 の3桁限定契約 copy、workflow_body_contract.test.ts:210 の
      concrete-id detector 契約の整合。
    ownership_hints:
      - ".worktrees/3862-fix scripts/install.ps1:857（probeReqId）とコメント"
      - "src/common/skills/**/tests（traceability_integration、declarations、alloc round-trip、tim_declarations_contract、workflow_body_contract）"
    intent: 新受理意味論が全テスト契約と一致する。
    verification_refs: [TS-007, TS-008, TS-009, TS-010]
    source_items: [AG-001, AG-003]
  - id: RA-007
    concern: SKILL・references・docstring の記述整合
    responsibility: |
      req-file-manager SKILL 17行・numbering-and-validation.md 10行等の記述を表示pad（最小幅）と受理上限
      撤廃の文言へ統一する。既存の「桁数を固定しない許容書式」語彙（case-open.md:105、artifact-validation
      Design:48、save-procedure.md:54、workflow scripts docstrings）を正として伝播させる。
    ownership_hints:
      - "src/common/skills/agentdev-req-file-manager/SKILL.md:17、references/numbering-and-validation.md:10,49,119"
      - "docs/designs/commands/case-open.md:105（既存語彙の正例）"
    intent: 採番・読取・検証の記述が単一の受理意味論で一致する。
    verification_refs: [TS-007, TS-009]
    source_items: [AG-001, AG-002]

test_strategy:
  - id: TS-001
    target_item: AG-004
    verification: |
      機械工程4本の実consumer条件fixture入力で正負対照検証を実行する。正例は必須ゲート実行体が
      存在する参照・有効なREQ行ID・解決可能なパス・非空のshared_areasとし、負例は必須ゲート実行体不在・
      不正REQ行ID・存在しないshared_areaファイルとする。検証専用経路で実行し実行系副作用を起動しない。
    pass_criteria: |
      正例で各scriptの検証経路が合格する。負例は該当divergence報告と非ゼロ終了を得る。
      空JSONの受理拒否、bunの起動、scriptファイルの存在、対象集合空のok:trueを受入証拠にしない。
    on_failure: |
      fix-and-reverify。検査節の検査入力構成・応答解析・検証専用経路を修正して再検証する。
      本訂正の対象に関する不合格をFindingsへ移すだけで完了扱いにしない。
  - id: TS-002
    target_item: AG-004
    verification: |
      元repoの公開入口 scripts/install.ps1 -Mode check をgit初期化済みの隔離consumer相当環境で実行する。
      完全provisions正例（Case非依存の値で機械probe自己完結）と前提のみを欠く負例を対照実行する。
      producer正本の移動・削除は行わない。
    pass_criteria: |
      正例で機械工程検査節が前提成立を報告しinstaller全体がexit 0で受入する。負例（前提のみ欠落）で
      機械工程検査節が該当divergenceを報告しinstaller全体が非ゼロ終了する。検証前後でproducer正本・
      管理対象内容・ディレクトリ状態が同一。
    on_failure: |
      fix-and-reverify。隔離環境構成・検査節の検出・報告を修正して再検証する。
  - id: TS-003
    target_item: AG-004
    verification: |
      検証専用経路がworktree作成・ゲート実行・git/gh操作を起動しないことを、PATH分離したgit/gh shim
      （呼出しを記録し、呼出し検出時に失敗する）による実行時確認で必須に検証する。前後の管理対象内容と
      ディレクトリ状態の同一性も併せて確認する。
    pass_criteria: shim記録でgit/gh/worktree/ゲート実行の起動が実行時にゼロ。前後で管理対象内容とディレクトリ状態が同一。
    on_failure: fix-and-reverify。検証経路の切断点・経路構成を修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      Windows形式とGit Bash形式のパス受理、および既存受理REQ行ID形式（3・4桁を含む）の非退行を正例で確認する。
      Git Bash形式はinstall.ps1経由ではなく対象scriptへの直接呼出しで検査する。
    pass_criteria: |
      既存の受理形式が全て受理され続ける。既存受理から拒否への退行が発生しない。
    on_failure: fix-and-reverify。パス解決・REQ行ID契約の扱いを修正して再検証する。
  - id: TS-005
    target_item: AG-004
    verification: |
      機械工程検査節の節別報告（節見出しと検証対象ごとの結果行）とinstaller全体の終了コード・divergence
      統一集約を区別し、節単独で検出結果を判読できることを確認する。
    pass_criteria: 機械工程検査節の検出結果がinstaller全体の他のdivergenceの有無に依存せず判読できる。統一集約と終了コード反映の既存契約は維持される。
    on_failure: fix-and-reverify。節別報告形式を修正して再検証する。
  - id: TS-006
    target_item: AG-004
    verification: |
      機械工程検査の検査入力JSONとfixtureの配置が対象script契約の置き場所指針に従うことを確認する。
      横断依存検査の現行script契約はworkspace外一時領域禁止・project root内限定である。
    pass_criteria: 検査入力配置がscript契約の置き場所指針に従い（workspace外一時領域不使用・project root内の契約位置）、install.ps1の検査入力配置箇所が適合済みである。
    on_failure: fix-and-reverify。検査入力の配置を契約指針へ修正して再検証する。
  - id: TS-007
    target_item: AG-003
    verification: |
      標準採番出力（alloc-composite-id 等）の5桁REQ部＋4桁行部のIDが、validate-input（定義PR準備）、
      traceability parse（requirements・sidecar・declarations・inventory）、declaration parse（ADF-COVERS）、
      policy round-trip（採番→読取→検査→後続工程）を通じて受理されることを回帰テストで確認する。
      不正形式（誤接頭辞・非数値・区切り欠落・空セグメント）が拒否されることも確認する。
    pass_criteria: |
      標準出力の任意桁数IDが後続処理全段で受理される。不正形式は全段で拒否される。
      3・4桁既存IDの受理が退行しない。
    on_failure: fix-and-reverify。受理検査・パーサの桁数扱いを修正して再検証する。
  - id: TS-008
    target_item: AG-003
    verification: |
      未解析部分的一致（mis-parse）の排除を回帰テストで確認する: REQ-0063-0123 が REQ-0063-012 として
      抽出されない（行部4桁の部分一致禁止）、REQ-12345-001（5桁REQ部）が全parser（validate-input、
      traceability、declaration、sidecar、integrity checker、textlint suppress 走査、generate_indexes
      行カウント）で可視（検証・検出・索引・suppress・カウントの対象）である。4桁以上のREQ行ID表が
      textlint の prh suppress と generate_indexes の行カウントから漏れないことを含める。
    pass_criteria: |
      REQ-0063-0123 の REQ-0063-012 誤抽出がゼロ。REQ-12345-001 が全parserで検出・検証・索引の対象に
      なり、4桁以上のREQ行ID表が textlint suppress と generate_indexes 行カウントから漏れない。
    on_failure: fix-and-reverify。正規表現のアンカー・非曖昧抽出・suppress・カウントを修正して再検証する。
  - id: TS-009
    target_item: AG-002
    verification: |
      既存corpusの非退行を確認する: REQ-001..116 の3桁IDと全既存参照の同一性（byte-level 変更なし）、
      integrity suites（baseline 合格）、既存テストスイートのbaseline維持。既存baseline failure（11件）は
      原条件と切り分けて扱う。
    pass_criteria: |
      既存ID・参照に変更がないこと（diff なし）。integrity suites がbaseline（既知 failure 11件。出典:
      PR #3864 検証記録）で合格し、新規failが発生しない。
    on_failure: fix-and-reverify。影響する検出パターン・抽出を修正して再検証する。
  - id: TS-010
    target_item: AG-002
    verification: |
      本repo内で改番が発生しないことを確認する: REQ-001..116 のファイル名・frontmatter id・要件行IDに
      変更がないこと（diff 検査）。staff-schedule-cf は本repoの対象外であり、本repo内のno-renumberのみを
      検証する。
    pass_criteria: 本repo内でREQ番号・行ID・参照の改番・正規化がゼロ。
    on_failure: fix-and-reverify。改番・正規化を伴う変更を取り消して再検証する。

review_dispositions:
  - id: RD-001
    source_item: input-lines-5-19
    disposition: covered
    reason_code: adopted_as_policy
    reason: |
      利用者原文と実行指示は auto_gate の policy_resolution と AG-001〜004 へ採用済み。
      合意4点は決定的マーカーなしで artifact_actions・realization_actions・test_strategy へ反映済み。
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-req-id-consistency-20261026.md
      section: 利用者の原文と今回の実行許可
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_item: input-lines-35-51
    disposition: covered
    reason_code: verified_and_projected
    reason: |
      監督による実施範囲の構成は入力解決（scope・preserved・out_of_scope）と
      realization_actions・test_strategy へ反映済み。既存Case #3862との区別（39〜41行）、
      制約移設で終わらない修正（41行）、表示と受理の区別（42行）、変更影響追跡（43行）、
      検証要件（45〜51行）を保持。
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-req-id-consistency-20261026.md
      section: 監督による実施範囲の構成
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_item: audit-memo-lines-29-37
    disposition: covered
    reason_code: adjudicated_background
    reason: |
      監査メモの判定（ADF内部不整合・作成タスク非違反）は AG-002 と conflict_resolutions へ記録済み。
      作成セッションの手順適合性の別判定（33行）は本ドラフトの対象外（入力33行で今回の桁数修正に
      全履歴再監査を前置しないと確定）。
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/adf-req-numbering-rule-audit-20261026.md
      section: 判定、ADFへの還元に関する意味
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - note: |
      本ドラフトは新規作成（全面モデル生成）であり、決定的組立スクリプトを不使用。
      artifact_actions の content に引用する現行セクションは、対象ファイル実読取
      （numbering-policy.md 識別子形式 24〜33行、document-model.md 設定規則 350〜360行、
      patterns.md REQ frontmatter 規約 22〜63行〔REQ セクション構成節を含む。STEP-8 指摘 F1 の
      target_area 修正に伴い追加〕、agentdev-req-file-manager.md 現在の動作 38〜44行、
      install-script-usability.md 機械工程節 124〜135行〔131行目の空行を含めて逐語保持〕、
      IR-067/IR-069 全文）から逐語転記し、変更箇所のみ編集した。
      STEP-8 adversarial review（advisory ses_e896d166effeqSH8nVbVTMxg4S、契約整合
      ses_e896d1681ffe6xqcXOSR0h68Dq、実効性 ses_e896d15efffe3YDRSj6pPImQdk）の反映を含む。
      実対象への適用は case-revise / case-ready の Definition 保存内部責務。

case_open_hints:
  jev:
    observations:
      - id: "20261026T044415Z-ec41"
        kind: existing-req-matching
        disposition: "採用。references ハッシュ実測照合（numbering-policy・REQ-009・REQ-004・DEC-001・DEC-009・install-script-usability が記録値と一致、HEAD e16674747 一致）し provenance 完全を確認。REQ操作なし/確認不要を採用。"
      - id: "20261026T044524Z-b76a"
        kind: expansion-final-classification
        disposition: |
          採用（判断根拠に透明性の注記付き）。Design行/分離true、confidence 1。
          step3-observation reference の digest が観測1 JSON 実ハッシュ
          （4883a238be00643f4726c3bad6f7fc434f5a51bfe287243c1e5c54838fde48d6）と
          一致せず（評価入力構成時の計算漏れによる誤記）。観測は手編集せず保持し、
          前提（観測1の finalResult: REQ操作なし）の provenance は観測1本体で検証済み。
          他の6 references は実ハッシュと一致を確認済み。
  decision_record: |
    Decision 判断: required_new（新規 Decision で桁数上限撤廃ポリシーを記録）。
    重複確認: docs/decisions 配下の「桁数」言及は実測 0 件で重複なし。
    DEC-001/DEC-009 は現行 corpus の事実記述であり直接編集不可（意味的不変）。
    禁止ゲート: 仕様変更（受理検査の撤廃）であり作業手段の Decision 化ではない。
    番号指定形式: new:{topic-slug}。architecture-advisory 委譲の結果は本ドラフト保存前の review で記録。
  evidence_keep: |
    PR #3864（open）と worktree .worktrees/3862-fix・3862-review、5系統FAIL所見（fake all-trace gate specs、
    固定REQ001/README substitutes、空 condition_b・detection_unavailable 受理、ancestor junction
    workspace-escape、cleanup failure silence、filename-only snapshots/untracked-git comparison、
    --req duplicate invalid-ID tests）は義務として保持する。本ドラフトの修正はこれらを解消しない限り
    受入としない。Case #3850・staff-schedule-cf・他プロジェクト・release は untouched。
  consumption_route: "case-revise（Case #3862 Definition amendment）→ case-ready（execution contract 再確定）→ readback 後 partial dispatch。旧ドラフト req-draft-install-prerequisite-acceptance-f1b-revision.md は superseded-by 本ドラフト（削除しない）。"
```

# summary

本ドラフトはID桁数不整合是正（Case #3862 amendment、case-revise消費用）の正式ドラフトであり、
受理検査の桁数上限撤廃と表示・受理の分離（新規Decision）、Design/IRルール改訂、実現面の桁数一般化、
Case #3862のTS-001〜006義務保持を確定する。前ドラフトのHQ-001/HQ-002は利用者の明示実行指示と
合意4点で解決済み。Jev観測2件のうち観測2のstep3-observation digest誤記を開示済み。
