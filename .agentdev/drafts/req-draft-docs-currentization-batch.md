---
draft_type: req_draft
topic_slug: docs-currentization-batch
status: draft
created_at: 2026-10-13T12:50:00Z
source_rus: [RU-0214, RU-0215, RU-0216, RU-0217, RU-0218, RU-0219, RU-0220]
---

<!-- req_draft テンプレート準拠（src/common/commands/agentdev/templates/req-define/req-draft.md）。
     Batch A: docs-currentization。7 RU の統合 draft。 -->

# draft-data

```yaml
work_type: docs_chore

scale: standard

summary: >
  docs 現行化バッチ（RU-0214〜RU-0220、7件統合）。REQ-006 の superseded DEC-029 参照是正（RU-0214）、
  v4-traceability-model の covers 注記と本文実体の所在整合（RU-0215）、docs/README・guides/README への
  accepted v5/v5.1 基盤導線追加（RU-0216）、v51 Design 2件の削除済み RU 現在形参照の永続成果物への付け替え（RU-0217）、
  phase 5コマンド実装済みに伴う案内・正規文書・Inventory の現行化（RU-0218）、glossary・語彙レジストリの
  Wave 定義現行化と phase 用語追加（RU-0219）、IR-072 frontmatter 進行と commitHash 例外列挙追記（RU-0220）を
  単一の docs_chore Case として一括是正する。REQ 要件行の追加・意味変更はなく、全変更は既存正規文書の
  反映作業（表現是正・現行化・参照付け替え・frontmatter 進行）である。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      REQ-006.md:38（適用範囲セクション）の「Definition 保存工程（case-ready / case-revise 内部責務。
      DEC-029）」の参照を DEC-033 へ置換する。:38 は歴史的引用ではなく現行の責務範囲の記述であり
      （適用範囲の現行宣言として機能）、REQ-006 内の他箇所（:12）が DEC-033 参照で統一済みである事実と
      DEC-029 の frontmatter（status: superseded / superseded_by: DEC-033）を根拠とする統一漏れの解消である。
  - id: AG-002
    content: >
      docs/designs/foundations/v4-traceability-model.md:11 の REQ-106/107 implementation covers 注記の
      範囲括弧書きを、本文実体の実際の所在に合わせて修正する。語義（標準関係・構造/意味分離）は本 Design
      本文の v5 語義更新節が所有し、REQ-106 の差分影響評価の構成実体は agentdev-traceability Design の
      impact 拡張節（実在確認済み :55）が、その利用側接続は case-revise Design（covers 実在確認済み :9）が
      所有する。covers 行自体の REQ-106/107 帰属は変更しない（他2ファイルとの重複 covers は許容）。
  - id: AG-003
    content: >
      docs/README.md と docs/guides/README.md の「現在像への導線」節へ、現行実行契約の正（v4）との併記形式で、
      accepted な v5 基盤（REQ-104〜109、DEC-053〜056）および v5.1（REQ-110/111、DEC-057/058）への導線行を
      追加する。配置は既存の手動導線セクション構成（索引自動生成対象外の手動 bullet 群）に従う。
      DEC-055 の v4 実行上の正当性（現行実行契約維持）と v5 基盤の確定状態の案内を分けて表記する。
  - id: AG-004
    content: >
      docs/designs/workflows/v51-phase-driven-collaboration-model.md:70 の「RU-0002 が所有する
      v4-standard-lifecycle 更新と整合させる」を、永続成果物への参照へ付け替える: v4-standard-lifecycle の
      工程駆動対応行（:69-71。RU-0002 由来の更新は本体反映済みを実確認）＋v4-v5-crosswalk の処遇記録
      ＋DEC-057/058 承認記録。RU-0002 は出所の履歴注記としてのみ言及する（case-ready 成功後の削除済み
      正当状態、REQ-008-010）。
  - id: AG-005
    content: >
      docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:54 の「RU-0002 の B01〜B16 と
      B16 能力群対応表、および TS-001〜TS-014 を検証時参照として用いる」を、REQ-111 の受け入れ条件
      （REQ-111-001〜013）＋v4-v5-crosswalk の処遇記録＋DEC-057/058 承認記録への参照へ付け替える。
      RA 表の TS-001〜TS-014 列は削除済み一時成果物 RU-0002 出所の検証項目番号として出所の履歴注記に留める。
  - id: AG-006
    content: >
      同ファイル:60（RA-003 行）の「RU-0001からの統合接続」を「工程駆動コラボレーションモデル（REQ-110）
      からの統合接続」へ付け替える（RU-0001 は REQ-110 受け入れ条件の出所 RU であり、永続成果物は REQ-110）。
  - id: AG-007
    content: >
      docs/guides/artifacts-and-state.md:147 の工程駆動実行の記述から「（将来実装予定）」を除去し、
      実装済みを現在形で表記する。後段の「後継経路の実現・採用まで現行の変更駆動経路が正」の記述は維持する。
  - id: AG-008
    content: >
      docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:14 を部分現行化する。
      公開操作の最終名（phase 系 5 コマンド。src/common/commands/agentdev/ 配下に実在、root README 索引 18
      コマンドに掲載）と保存方式（.agentdev/phase/ 配下の保存状態。identity.yaml・themes.md・pending.md・
      received/・README.md が実在）は実装・公開済みとして現在形化する。Capability Skill 等の具体的なスキル構成の
      分担と個別 command Design の整備は未整備の実測（docs/designs/commands/ に phase-*.md 不在）であるため、
      意図する限定内容として明記した上で後続設計に委ねる記述を保持する（限定内容の明記と現行化の使い分け）。
  - id: AG-009
    content: >
      同ファイル:50 の「具体的な公開名と保存実装は後続の実現設計で確定する」を現行化する。
      公開名（phase 系 5 公開操作）と保存実装（.agentdev/phase/ 配下の保存状態）は確定済みである。
      「既存 case 系実行契約および REQ-009/106/107/109 の契約を重複定義しない」は維持する。
  - id: AG-010
    content: >
      .agentdev/README.md 状態表の phase 行から「操作の実装は後続 Wave で導入」の文言を除去し、
      4 操作の実装済みを現在形で表記する（producer 列の記述を「工程駆動の4操作と工程遷移の実装」とする）。
  - id: AG-011
    content: >
      docs/designs/foundations/system.md の現行化。:104 の件数宣言「公開 Command（13件）」を 18 件へ現行化する
      （root README 索引 18 コマンドと一致）。一覧表（### 一覧表）へ /agentdev/third-party-sync 行と phase 系
      5 コマンド行（phase-tasks-create、phase-tasks-update、phase-artifacts-update、phase-review、phase-transition）
      を追加する（表列構造 4 列・列順は既存行と同一）。各コマンドの 11 分析軸詳細節の追加は対象外とする
      （owner 判断事項として review_dispositions に記録）。
  - id: AG-012
    content: >
      docs/guides/glossary.md:75 の Wave 定義を DEC-055 の定義（意味的な依存関係のまとまり。
      DEC-033 の Wave＝実行スケジューリング単位の規定を部分置換済み、accepted 実確認）へ現行化する。
      v4-standard-lifecycle 側の語彙（:24,73 の旧定義）は v4-v5-crosswalk 管理下の意図的管理
      （REQ-035-006 処遇記録の棚卸し対象）であるため本件の対象外とする。
  - id: AG-013
    content: >
      docs/guides/glossary.md の「コマンド」表へ phase 系 5 コマンド（phase-tasks-create、phase-tasks-update、
      phase-artifacts-update、phase-review、phase-transition）の行を追記する（既存 13 公開コマンド全掲載の
      事実との整合。読み方列は既存样式に従う）。
  - id: AG-014
    content: >
      工程駆動系中核用語（工程駆動実行、変更駆動、検討テーマ、テーマ正本、外部AI検討、工程遷移、後継経路）を
      glossary と語彙レジストリ実体（.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md。
      repo-local で投影対象外のため当該パスが正）へ追加する。選別根拠: REQ-110/111・DEC-057/058 で導入された
      docs 横断の頻出語であり、変更駆動との用語混同が docs 全体で生じ得る中核概念である（REQ-094 用語選択基準の
      頻出性・混乱回避軸に適合）。用語の区別軸データは repo-local 実体対照表の責務である（vocabulary-registry
      Design 自体は変更しない。同 Design の対象外規定 :89）。
  - id: AG-015
    content: >
      新規コマンド・新 REQ 主要語彙と glossary の差分検査（網羅検査）の docs-check ルール候補の検討と記録を
      行う。検討結果（本 draft 記録）: 候補は「公開コマンド一覧（root README 索引・src/common/commands 突合）
      と glossary コマンド表の差分検出」および「新 REQ 冒頭の主要語と glossary 登録語の差分検出」の2系統。
      機械検査ルールの実装は本件では行わない（docs 修正と異なるコード変更を伴い docs_chore バッチの性質から
      外れる。別 intake・要件として育成可能な候補として記録する）。
  - id: AG-016
    content: >
      本バッチで本文変更する全 REQ/Design ファイル（docs/requirements/REQ-006.md、
      docs/designs/foundations/v4-traceability-model.md、docs/designs/workflows/v51-phase-driven-collaboration-model.md、
      docs/designs/workflows/v51-phase-transition-and-coexistence-model.md、docs/designs/foundations/system.md、
      docs/designs/local/local-case-file.md、docs/designs/responsibilities/custom-tool-contracts.md）の
      frontmatter updated を Definition 保存実行日（YYYY-MM-DD）へ進行する。custom-tool-contracts.md は
      例外リスト追記（AG-017）の後に進行する。保存後に check_integrity（IR-072 req-updated-freshness）を
      再実行し該当ファイルの NG 解消を復帰確認する。
  - id: AG-017
    content: >
      docs/designs/responsibilities/custom-tool-contracts.md:71 の両版等価性の例外明示リスト（現行3件:
      追跡Issue 通常ラベル非許容、case 再オープン拒否、isDraft 値差異）へ、4件目として「pr_merge の入力契約に
      起因する受理条件差（ローカル版は commitHash を取り込み確認情報として必須検証〔実在確認〕し、GitHub 版は
      受理してマージ動作に使用しない。:48 の宣言に対応）」を追記する。修正は一意（例外リストへの追記のみ）。
  - id: AG-018
    content: >
      commitHash 契約の REQ 源明示の検討。docs/requirements/ 全文検索の結果、commitHash・取り込み確認を
      規定する REQ 要件行は存在しない。推定されていた REQ-111-011 は「工程駆動の4操作と工程遷移」をスコープとし、
      変更駆動（case-close）経路の pr_merge 契約とは scope が不一致であるため REQ 源とは認定しない
      （機能的に関連する突合義務の上位ではあるが源宣言は不適）。よって REQ 源の注記は付さない
      （根拠なしの参照付与による誤トレース防止）。検討記録は本項および CR-003 に保持する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-006.md
    target_area:
    source_items: [AG-001, AG-016]
    canonical_owner: REQ-006
    content: |
      変更1（機械置換手順・適用範囲セクション。組立検査済み、assembly_evidence AE-001 参照）。
      旧文:
        - 工程横断 capture 責務（Definition 保存工程（case-ready / case-revise 内部責務。DEC-029）、case-open、case-close の自工程 deviation capture と case-auto の保存結果参照・件数集計のみ。deviation は capture-boundaries.md の Split Rule で intake/learning へ振り分け、agentdev-learning-capture skill または agentdev-intake-pipeline へ委譲して保存する）
      新文:
        - 工程横断 capture 責務（Definition 保存工程（case-ready / case-revise 内部責務。DEC-033）、case-open、case-close の自工程 deviation capture と case-auto の保存結果参照・件数集計のみ。deviation は capture-boundaries.md の Split Rule で intake/learning へ振り分け、agentdev-learning-capture skill または agentdev-intake-pipeline へ委譲して保存する）
      変更2（frontmatter）: updated: 2026-10-08 を Definition 保存実行日（YYYY-MM-DD）へ進行。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/foundations/v4-traceability-model.md
    target_design:
      operation: update
      domain: foundations
      slug: v4-traceability-model
    target_area:
    source_items: [AG-002, AG-016]
    canonical_owner: v4-traceability-model Design
    content: |
      変更1（covers コメント行の行単位置換。対象位置は見出し外のため組立検査器の見出し結合対象外。
      旧文の存在と一意性は Read 実査で確認済み）。
      旧文:
      <!-- ADF-COVERS(implementation): REQ-106-001, REQ-106-002, REQ-106-003, REQ-106-004, REQ-106-005, REQ-106-006, REQ-106-007, REQ-106-008, REQ-106-009, REQ-107-001, REQ-107-002, REQ-107-003, REQ-107-004, REQ-107-005, REQ-107-006, REQ-107-007, REQ-107-008（v5 変更影響・追跡品質検証の設計・構成実体は本 Design 本文の v5 語義更新節が所有する） -->
      新文:
      <!-- ADF-COVERS(implementation): REQ-106-001, REQ-106-002, REQ-106-003, REQ-106-004, REQ-106-005, REQ-106-006, REQ-106-007, REQ-106-008, REQ-106-009, REQ-107-001, REQ-107-002, REQ-107-003, REQ-107-004, REQ-107-005, REQ-107-006, REQ-107-007, REQ-107-008（v5 変更影響・追跡品質検証の語義は本 Design 本文の v5 語義更新節が所有し、REQ-106 の差分影響評価の構成実体は agentdev-traceability Design の impact 拡張節が、その利用側接続は case-revise Design が所有する） -->
      変更2（frontmatter）: updated を Definition 保存実行日（YYYY-MM-DD）へ進行。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-driven-collaboration-model
    target_area: "## 実行主体と責務境界"
    source_items: [AG-004, AG-016]
    canonical_owner: v51-phase-driven-collaboration-model Design
    content: |
      ## 実行主体と責務境界

      テーマ形成・更新、成果物反映の公開操作とWorkflow Skill群は個別の責務に分ける。テーマ正本の管理と外部検討の持出し・戻り受理はCapability Skillが所有する。各公開コマンド、Workflow Skill、Capability Skill、adapter、subagent、harness の具体的な分担は各成果物の設計時に定める。

      保存・確定経路の所有境界は変更駆動では case-ready / case-revise が所有する。工程駆動ルートの経路別所有境界とDesignのdraftからacceptedへの昇格は、v4-standard-lifecycle の工程駆動対応行（REQ-111、v51-phase-transition-and-coexistence-model 参照）および v4-v5-crosswalk の処遇記録と整合させる。本 Design はその境界を再定義しない。出所: 一時成果物 RU-0002 は case-ready 成功後に削除済みであり、出所記録は v4-v5-crosswalk と DEC-057/058 承認記録に残る。

      （frontmatter updated を Definition 保存実行日へ進行）
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-transition-and-coexistence-model
    target_area: "## 目的と適用範囲"
    source_items: [AG-008, AG-016]
    canonical_owner: v51-phase-transition-and-coexistence-model Design
    content: |
      ## 目的と適用範囲

      本 Design は REQ-111 が定める工程遷移、独立レビュー、有限作業、変更駆動との併存に関する内部設計の要綱を示す。公開操作の最終名（phase-tasks-create、phase-tasks-update、phase-artifacts-update、phase-review、phase-transition）と保存方式（.agentdev/phase/ 配下の保存状態）は実装・公開済みである。Capability Skill 等の具体的なスキル構成の分担と個別 command Design の整備は確定していない部分であり、外部動作と検証義務を保つ範囲で後続設計に委ねる。

      （本ファイルの ACT-DESIGN-003/004/005 の3アクション適用後に frontmatter updated を Definition 保存実行日へ進行）
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-transition-and-coexistence-model
    target_area: "## 実行主体と責務境界"
    source_items: [AG-009]
    canonical_owner: v51-phase-transition-and-coexistence-model Design
    content: |
      ## 実行主体と責務境界

      | 操作 | 実行主体分類 | 責務境界 |
      |---|---|---|
      | 独立レビュー | Workflow Skill と GitHub／Local の公開入口 | Skill が所見区分と意味評価を担い、入口は両版の正規利用経路へ接続する。レビューは工程完了ゲートにしない |
      | 工程遷移 | 公開操作（command／adapter）と harness の状態保存 | 利用者が遷移を決定し、操作は正規状態の一回記録、再開、失敗報告を担う |
      | 確定済み設計からの実装接続 | case 系 workflow、実行担当 subagent、harness | 既存 case 実行契約を再利用し、最新リポジトリの実変更と検証証拠を確認する |

      公開名（phase 系 5 公開操作）と保存実装（.agentdev/phase/ 配下の保存状態）は確定済みである。既存 case 系実行契約および REQ-009/106/107/109 の契約を重複定義しない。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-transition-and-coexistence-model
    target_area: "## 検証時参照"
    source_items: [AG-005, AG-006]
    canonical_owner: v51-phase-transition-and-coexistence-model Design
    content: |
      ## 検証時参照

      REQ-111 の受け入れ条件（REQ-111-001〜013）、v4-v5-crosswalk の処遇記録、および DEC-057/058 の承認記録を検証時参照として用いる。実現面の責務は次の RA を保ち、検証は REQ-111 の各受け入れ条件の合格条件と反例を確認する。次表の TS-001〜TS-014 は削除済み一時成果物 RU-0002 出所の検証項目番号であり、出所の履歴注記として保持する。

      | realization action | 保持する実現責務 | 対応する検証 |
      |---|---|---|
      | RA-001 | 独立レビュー Workflow Skill と GitHub／Local 公開入口 | TS-001、TS-012 |
      | RA-002 | 利用者判断による遷移、永続状態、一回実行、取消、後続・前置関係の解決 | TS-002〜TS-005、TS-012 |
      | RA-003 | 有限な作業の終了、確定設計からの実装接続、変更駆動4経路・7能力群の独立維持、工程駆動コラボレーションモデル（REQ-110）からの統合接続 | TS-006〜TS-013 |
      | RA-004 | README、コマンド索引・リファレンス、選択ガイド、状態モデルの案内整合 | TS-014 |
      | RA-005 | v4-standard-lifecycle の経路別所有境界と crosswalk の処遇記録 | TS-014 |

      これは恒久的な全版台帳や各条件の個別通し試験を新設するものではない。複数条件で同じ実利用証拠を用いる場合も、各受け入れ条件の要求結果と証明範囲を確認する。
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/foundations/system.md
    target_design:
      operation: update
      domain: foundations
      slug: system
    target_area: "### 一覧表"
    source_items: [AG-011, AG-016]
    canonical_owner: system Design
    content: |
      ### 一覧表

      | Command | 主入力 | 主出力 | workflow 系統 |
      |---|---|---|---|
      | `/agentdev/req-define` | セッション会話 / RU | 要件doc（draft） | req/case |
      | case-open（内部 lifecycle 段階） | 要件doc | GitHub Issue | case-auto 駆動 |
      | case-ready（内部 lifecycle 段階） | Root Case Issue | ready 状態の Root Case + 実行構造（REQ/Decision/Design ファイル保存を含む） | case-auto 駆動 |
      | case-revise（内部 lifecycle 例外経路段階） | 再合意済み Definition 差分（draft） | 設計修正PR + case-ready 引き継ぎ | case-auto 例外経路解決駆動 |
      | case-run（内部 lifecycle 段階） | Issue | 実装済みブランチ + PR | case-auto インライン実行 |
      | case-close（内部 lifecycle 段階） | Issue + PR | マージ済み + クローズ済み | case-auto 駆動 |
      | `/agentdev/case-auto` | 要件doc / Issue番号 | マージ済み + クローズ済み | req/case |
      | `/agentdev/intake-capture` | 手動入力 | `inbox/` item | intake |
      | `/agentdev/intake-from-github` | クローズ済み Issue/PR | `inbox/` item | intake |
      | `/agentdev/intake-promote` | inbox item | `promoted/` 成果物 | intake |
      | `/agentdev/learning-promote` | `inbox.md` + `deferred.md` | `promoted/` 成果物 | learning |
      | `/agentdev/backlog-review` | `promoted/` 成果物 | `RU-*.md` | backlog |
      | `/agentdev/backlog-auto` | なし（durable state から解決） | 検出事項、採用済み成果物、`RU-*.md` | backlog |
      | `/agentdev/inspect-docs` | docs 全体スキャン | 検出事項 | inspect |
      | `/agentdev/inspect-skills` | Command/Skill 定義 | 検出事項 | inspect |
      | `/agentdev/inspect-promote` | 検出事項 | 採用済み成果物 | inspect |
      | `/agentdev/issue` | 自然言語による課題管理の指示 | 追跡Issue の作成・更新・検索・参照（Tool 操作契約経由） | 横断（課題管理） |
      | `/agentdev/third-party-sync` | 対象 Skill 名（省略時は全件）、dry-run 指定 | 取得結果報告（対象一覧、取得成否、配置パス、管理外衝突の検出状況） | third-party |
      | `/agentdev/phase-tasks-create` | 自然言語による形成指示（工程目的、対象範囲、既知制約） | テーマ初回形成の結果（テーマ識別と一覧、参考候補と既知の必須事項の区別） | phase（工程駆動） |
      | `/agentdev/phase-tasks-update` | 自然言語による更新指示（追加・具体化・分割・統合・廃止） | テーマ更新の結果（変更理由、旧新対応、未決事項の引継ぎ） | phase（工程駆動） |
      | `/agentdev/phase-artifacts-update` | 自然言語による反映指示と戻り入力 | 反映の結果（反映した項目と反映先、衝突・未確認・保存失敗の区別、受領記録の保存先） | phase（工程駆動） |
      | `/agentdev/phase-review` | 自然言語によるレビュー・全体像の指示 | 4区分（確定違反・証拠不足・推測・未採用改善候補）に分けた所見と工程全体像（セッション内出力） | phase（工程駆動） |
      | `/agentdev/phase-transition` | 自然言語による遷移の指示 | 遷移の記録結果（記録先、後続工程の解決結果、前工程の過去工程化の伝達） | phase（工程駆動） |

      （frontmatter updated を Definition 保存実行日へ進行。セクション content はモデル生成。
      表列構造の突合（4列・列順）と旧表の一意性は Read 実査と組立検査器 pre 検査（assembly_evidence AE-008）で確認済み）
  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target: docs/designs/foundations/system.md
    target_design:
      operation: update
      domain: foundations
      slug: system
    target_area:
    source_items: [AG-011]
    canonical_owner: system Design
    content: |
      変更（件数宣言行の行単位置換。組立検査済み、assembly_evidence AE-007 参照）。
      旧文:
      公開 Command（13件）と内部 lifecycle 段階（case-* 5 段階）の Workflow Architecture Inventory を恒久カタログとして統合する。
      新文:
      公開 Command（18件）と内部 lifecycle 段階（case-* 5 段階）の Workflow Architecture Inventory を恒久カタログとして統合する。
  - id: ACT-DESIGN-008
    artifact: design
    operation: update
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area:
    source_items: [AG-017]
    canonical_owner: custom-tool-contracts Design
    content: |
      変更（例外明示リストへの行単位追記。対象位置は「GitHub版 / Local版等価性:」ラベル配下の最終 bullet
      （:71）の直後。当該位置に Markdown 見出しが存在しないため組立検査器の見出し結合対象外。
      旧文の存在は Read 実査で確認済み）。
      追記する新行（:71 の bullet の直後に1行追加）:
      - pr_merge の入力契約に起因する受理条件差（ローカル版は commitHash を取り込み確認情報として必須検証〔実在確認〕し、GitHub 版は受理してマージ動作に使用しない。:48 の宣言に対応）は、本 Design が例外として明示する
      （frontmatter updated の進行は ACT-DESIGN-010 で本追記の適用後に行う）
  - id: ACT-DESIGN-009
    artifact: design
    operation: update
    target: docs/designs/local/local-case-file.md
    target_design:
      operation: update
      domain: local
      slug: local-case-file
    target_area:
    source_items: [AG-016]
    canonical_owner: local-case-file Design
    content: |
      変更（frontmatter updated の行単位置換。対象位置は frontmatter のため組立検査器の見出し結合対象外。
      旧文の存在は Read 実査で確認済み）。
      旧文: updated: 2026-10-04
      新文: updated: （Definition 保存実行日。YYYY-MM-DD）
  - id: ACT-DESIGN-010
    artifact: design
    operation: update
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area:
    source_items: [AG-016]
    canonical_owner: custom-tool-contracts Design
    content: |
      変更（frontmatter updated の行単位置換。ACT-DESIGN-008 の追記適用後に実施する）。
      旧文: updated: 2026-10-07
      新文: updated: （Definition 保存実行日。YYYY-MM-DD）

conflict_resolutions:
  - id: CR-001
    conflict: >
      RU-0218 s6 の選択事項「限定内容の明記 vs 現行化」（artifacts-and-state.md:147、
      v51-phase-transition:14,50、.agentdev/README.md phase 行の各記述の扱い）。
    resolution: >
      記述ごとに証拠で使い分ける。公開操作名と保存方式は実装・公開済み（コマンド5件実在、
      .agentdev/phase/ 保存状態実在、root README 索引 18 コマンド）であるため :147・:50・.agentdev/README は
      完全に現行化する。Capability Skill 等のスキル構成分担と個別 command Design は未整備の実測
      （docs/designs/commands/ に phase-*.md 不在）であるため :14 のみ限定内容を明記して保持する。
      REQ-111-011 の Local 版検証義務は本記述群の限定内容には含まれない（工程駆動の実行経路の話であり
      表現の限定根拠ではない）ため限定に採用しない。
  - id: CR-002
    conflict: >
      RU-0219 s3 の選択事項「Wave 定義の現行化 vs 移行期注記付与」。
    resolution: >
      現行化を採用する（DEC-055 定義へ更新、移行期注記は付さない）。根拠: DEC-055 は accepted であり
      DEC-033 の Wave 規定を部分置換済み、glossary は crosswalk 管理外の案内層であり基準に矛盾しない現行定義を
      示すべきである。v4-standard-lifecycle 側の旧語彙は crosswalk 管理下の意図的管理のため対象外（触れない）。
  - id: CR-003
    conflict: >
      RU-0220 s9 附随の「commitHash 契約の REQ 源（REQ-111-011 と推定）の明示」の要否。
    resolution: >
      REQ 源の注記は付さない。根拠: docs/requirements/ 全文検索で commitHash・取り込み確認を規定する REQ 行は
      存在しない。REQ-111-011 は工程駆動スコープであり pr_merge（変更駆動 case-close 経路）の契約と scope 不一致
      （機能的に関連する突合義務の上位ではあるが源宣言には不適）。根拠なしの参照付与は誤トレースを生むため
      行わない。検討記録は AG-018 に保持する。
  - id: CR-004
    conflict: >
      RU-0217 の横断是正候補2件（checker-execution-contracts.md:22 の RU-0004/RU-0007 言及、
      design-health-metrics.md:55 の RU-0001 AG-002 言及）を本件に含めるか。
    resolution: >
      本バッチ対象外とする。両候補とも影響小（:22 は背景説明・連携注記、:55 は pre-existing の出所注記型）であり、
      covers・現在形所有の宣言ではない。候補として review_dispositions（RD-001/RD-002）に記録し、
      v51 Design 2件の付け替え実績（RU を履歴注記化する様式）を横断適用する際の参照事例とする。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0214
    target_req: REQ-006
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0215
    target_design: docs/designs/foundations/v4-traceability-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    source_ru: RU-0217
    target_design: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-004
    source_ru: RU-0217, RU-0218
    target_design: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-005
    source_ru: RU-0218
    target_design: docs/designs/foundations/system.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
  - ou_id: OU-006
    source_ru: RU-0220
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
  - ou_id: OU-007
    source_ru: RU-0220
    target_design: docs/designs/local/local-case-file.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      rg "DEC-029" docs/requirements/REQ-006.md が 0件であること、および rg "DEC-033" docs/requirements/REQ-006.md が
      2件以上（:12 と :38）であることを確認する。あわせて REQ-006 の frontmatter updated が Definition 保存実行日へ
      進行していることを確認する。検索網羅範囲は修正対象列挙（REQ-006.md 単一ファイル）と一致する。
    pass_criteria: |
      REQ-006.md 内の DEC-029 参照が 0件、DEC-033 参照が 2件以上、frontmatter updated が保存実行日であること。
    on_failure: |
      fix-and-reverify: 置換漏れまたは updated 進行漏れを修正し、同一検証を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/designs/foundations/v4-traceability-model.md:11 を読み戻し、旧括弧文言「設計・構成実体は本 Design 本文の
      v5 語義更新節が所有する」が 0件であること、新注記が語義所有（本 Design）＋構成実体所在
      （agentdev-traceability impact 拡張節・case-revise Design）の3者分担を述べていることを確認する。
    pass_criteria: |
      旧文言 0件、新注記 1件、3者分担の記述が存在すること。
    on_failure: |
      fix-and-reverify: 注記を修正し、読み戻し確認を再実行する。
  - id: TS-003
    target_item: AG-003
    verification: |
      docs/README.md と docs/guides/README.md の「現在像への導線」節を読み戻し、v5 基盤
      （REQ-104〜109、DEC-053〜056）と v5.1（REQ-110/111、DEC-057/058）への導線行が存在し、
      リンク先ファイル（docs/requirements/REQ-104.md〜REQ-111.md、docs/decisions/DEC-053.md〜DEC-058.md）が
      実在することを確認する。
    pass_criteria: |
      2ファイルとも導線行を持ち、記載リンク先が全て実在すること。
    on_failure: |
      fix-and-reverify: 導線行またはリンク先を修正し、再実行する。
  - id: TS-004
    target_item: AG-005
    verification: |
      rg "RU-0002 が所有する|RU-0002 の B01|RU-0001からの統合接続" を修正対象2ファイル
      （docs/designs/workflows/v51-phase-driven-collaboration-model.md、docs/designs/workflows/v51-phase-transition-and-coexistence-model.md）
      に実行し 0件であることを確認する（検索網羅範囲は修正対象列挙と一致）。
      付け替え先（v4-standard-lifecycle 工程駆動対応行、docs/designs/foundations/references/v4-v5-crosswalk.md、
      docs/decisions/DEC-057.md・DEC-058.md、REQ-111-001〜013）の実在を確認する。
      出所履歴注記（RU-0002 出所の検証項目番号である旨）が :54 付近に維持されていることを読み戻しで確認する。
    pass_criteria: |
      現在形の所有・参照表現 0件、出所履歴注記の維持、付け替え先の全件実在。
    on_failure: |
      fix-and-reverify: 参照付け替えを修正し、同一検証を再実行する。
  - id: TS-005
    target_item: AG-007
    verification: |
      rg "将来実装予定|後続設計が確定|後続の実現設計で確定|後続 Wave で導入" を修正対象3ファイル
      （docs/guides/artifacts-and-state.md、docs/designs/workflows/v51-phase-transition-and-coexistence-model.md、
      .agentdev/README.md）に実行し 0件であることを確認する（検索網羅範囲は修正対象列挙と一致。
      root README・command-selection.md は修正対象外であり検索範囲に含めない）。
      :14 の新文が限定内容（スキル構成分担と command Design 未整備）を明記していることを読み戻しで確認する
      （限定消失リスク R2 の検証）。
    pass_criteria: |
      旧表記 0件、:14 に限定内容の明記が存在すること。
    on_failure: |
      fix-and-reverify: 表記を修正し、再実行する。
  - id: TS-006
    target_item: AG-011
    verification: |
      docs/designs/foundations/system.md を読み戻し、(1) :104 の件数宣言が「公開 Command（18件）」であること、
      (2) 一覧表に /agentdev/third-party-sync 行と phase 系 5 コマンド行が追加され既存 17 行が無変更であること、
      (3) 表列構造が 4 列・既存と同一列順であること、を確認する。さらに root README のコマンド索引（18コマンド）と
      一覧表の公開コマンド行の突合を行い、件数が一致することを確認する（索引・件数同期リスク R4 の検証）。
    pass_criteria: |
      宣言 18件、行追加 6行、既存行無変更、README 索引との件数一致。
    on_failure: |
      fix-and-reverify: 一覧表または件数宣言を修正し、突合を再実行する。
  - id: TS-007
    target_item: AG-012
    verification: |
      docs/guides/glossary.md の Wave 定義行を読み戻し、DEC-055 の定義（意味的な依存関係のまとまり）と一致し、
      旧定義文「依存関係と並列実行可能性を表す実行スケジューリング単位」が 0件であることを確認する。
      docs/designs/workflows/v4-standard-lifecycle.md の Wave 行（crosswalk 管理下）が無変更であることを確認する
      （語彙伝播リスク R3 の検証。対象外ファイルの保護確認）。
    pass_criteria: |
      glossary 定義が DEC-055 と一致、旧定義 0件、v4-standard-lifecycle 無変更。
    on_failure: |
      fix-and-reverify: 定義を修正し、再実行する。
  - id: TS-008
    target_item: AG-013
    verification: |
      docs/guides/glossary.md のコマンド表に phase 系 5 コマンド行が存在し、root README 索引の 18 公開コマンドが
      コマンド表に全て掲載されることを突合する。AG-014 の用語 7 件（工程駆動実行、変更駆動、検討テーマ、テーマ正本、
      外部AI検討、工程遷移、後継経路）が glossary と語彙レジストリ実体
      （.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md）の双方に登録されていることを
      確認する。
    pass_criteria: |
      phase 5行の追加、18 公開コマンドの全掲載、7 用語の双方登録。
    on_failure: |
      fix-and-reverify: 欠落行・欠落語を追加し、突合を再実行する。
  - id: TS-009
    target_item: AG-015
    verification: |
      本 draft の AG-015 に docs-check ルール候補の検討結果（2系統の候補と実装不採用の根拠）が記録されていることを
      確認する（記録存在確認。機械検査ルールの実装は本件対象外のため成果物検証は行わない）。
    pass_criteria: |
      検討結果の記録が存在し、候補内容と不採用根拠が明示されていること。
    on_failure: |
      fix-and-reverify: 検討記録を追記し、再確認する。
  - id: TS-010
    target_item: AG-016
    verification: |
      実行順序を守る（同一ファイル競合・IR-072 再違反リスク R5/R6 の検証）:
      (1) custom-tool-contracts.md:71 付近に commitHash 受理条件差の例外行が追記されていることを読み戻し確認する
      （AG-017。修正対象列挙: custom-tool-contracts.md）、(2) その後に本バッチ全対象7ファイルの frontmatter updated
      が Definition 保存実行日へ進行していることを確認する、(3) 最後に check_integrity（IR-072
      req-updated-freshness）を再実行し、local-case-file.md と custom-tool-contracts.md が NG 0件であることを
      確認する。
    pass_criteria: |
      例外行の追記 1件、7ファイルの updated 進行、IR-072 該当2ファイル NG 0件。
    on_failure: |
      fix-and-reverify: updated 進行漏れ・追記漏れを修正し、check_integrity を再実行する。

realization_actions:
  - id: RA-001
    concern: docs/README.md・docs/guides/README.md への v5/v5.1 基盤導線追加
    responsibility: 案内層（guide・README）の現行化。基準（REQ/DEC）を複製せず導線のみを提供する
    ownership_hints: ["docs/README.md「現在像への導線」節", "docs/guides/README.md「現在像への導線」節"]
    intent: accepted v5 基盤と v5.1 への到達可能性を入口 README で確保する
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-002
    concern: docs/guides/artifacts-and-state.md:147 の「（将来実装予定）」除去
    responsibility: 案内層の現行化（実装済み機能の文書追随）
    ownership_hints: ["docs/guides/artifacts-and-state.md フェーズ体系節"]
    intent: 工程駆動実行の実装状態の現在性を README・案内間で統一する
    verification_refs: [TS-005]
    source_items: [AG-007]
  - id: RA-003
    concern: .agentdev/README.md phase 行の実装状態現行化
    responsibility: domain state README の現行化
    ownership_hints: [".agentdev/README.md 状態表 phase 行"]
    intent: 実装済みの工程駆動保存状態の案内を現在形に統一する
    verification_refs: [TS-005]
    source_items: [AG-010]
  - id: RA-004
    concern: glossary の語彙現行化（Wave 定義・コマンド表・用語追加）
    responsibility: 案内層の語彙整備（REQ-094 用語選択基準に従う）
    ownership_hints: ["docs/guides/glossary.md コマンド表", "docs/guides/glossary.md Epic 関連節（Wave 行）", "docs/guides/glossary.md 分類、状態節（工程駆動系用語の追加先候補）"]
    intent: glossary を現行語彙（DEC-055・REQ-110/111）へ追随させる
    verification_refs: [TS-007, TS-008]
    source_items: [AG-012, AG-013, AG-014]
  - id: RA-005
    concern: 語彙レジストリ実体への工程駆動系用語登録
    responsibility: repo-local 語彙実体対照表の内容管理（vocabulary-registry Design の対象外規定どおり実体側の責務）
    ownership_hints: [".opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md（repo-local・投影対象外のため当該パスが正）"]
    intent: 語彙検出ルール群（IR-050/051 等）が参照する実体に工程駆動系語彙を登録する
    verification_refs: [TS-008]
    source_items: [AG-014]
  - id: RA-006
    concern: docs-check 差分検査ルール候補の検討と記録（実装は対象外）
    responsibility: ルール候補の検討記録のみ。機械検査ルールの実装は別要件として育成可能な候補
    ownership_hints: ["docs-check（REQ-010 系）への将来ルール候補。本件では draft 記録（AG-015）まで"]
    intent: 新規コマンド・新 REQ 主要語彙と glossary の追随漏れを将来機械検出可能にするための候補を確定させる
    verification_refs: [TS-009]
    source_items: [AG-015]

review_dispositions:
  - id: RD-001
    source_ru: RU-0217
    source_item: 横断是正候補1（checker-execution-contracts.md:22 の RU-0004/RU-0007 言及）
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      背景説明・連携注記型であり現在形の所有・参照宣言ではない。影響小のため本バッチ対象外。
      v51 2件の付け替え実績を横断適用する際の参照事例として CR-004 に記録。
    evidence:
      path: docs/designs/integrity/checker-execution-contracts.md
      section: ":22（連携注記）"
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0217
    source_item: 横断是正候補2（design-health-metrics.md:55 の RU-0001 AG-002 言及）
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      pre-existing の出所注記型であり影響小。本バッチ対象外。CR-004 に記録。
    evidence:
      path: docs/designs/quality/design-health-metrics.md
      section: ":55（出所注記）"
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0218
    source_item: system.md への工程駆動の節追加（11 分析軸詳細節）
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      owner 判断事項であり、本バッチは件数宣言の現行化と一覧表行追加に限定する。節追加は別要件として育成可能。
    evidence:
      path: docs/designs/foundations/system.md
      section: "## Workflow Architecture Inventory"
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0219
    source_item: docs-check 差分検査ルールの実装
    disposition: partially_covered
    reason_code: implementation_out_of_scope
    reason: |
      ルール候補の検討と記録（AG-015）は採用。機械検査ルールの実装は docs 修正と異なるコード変更を伴うため
      本 docs_chore バッチでは不採用とし、別 intake・要件として育成可能な候補として記録する。
    evidence:
      path: null
      section: AG-015（本 draft 内の検討記録）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0218
    source_item: phase 系 5 コマンドの command Design 未整備（DS12 附随観察）
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      command Design の新規作成は docs 現行化の範囲を超える本体整備であり、DS11（本件）の処置と連動して
      将来判断する。:14 の限定明記（AG-008）が現状の正しい表現を保持する。
    evidence:
      path: docs/designs/commands
      section: "phase-*.md 不在（実在確認済み）"
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - id: AE-001
    target_file: docs/requirements/REQ-006.md
    target_content_sha256: 13a5cca47af650c1c3d6b6aeded81d00921792816b3845ad24c676eeecfbb6ef
    check_scope: { heading: "## 適用範囲", start_line: 35, end_line: 52 }
    execution_conditions: { operation: replace, edit_sha256: f0ed02165485ed2bc1260c81e499371cc8ab7f62d10e78a01dabc5dd70f736c9, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: 2026-10-13T12:44:26.449Z
    result_affecting_references: { heading_match_rule: search-target-area.ts compatible exact match, scan_scope: target section only }
  - id: AE-002
    target_file: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_content_sha256: 216009ff3719a2652d37c80ce23b7bf17d28e24185db5f64a644cfa855419d15
    check_scope: { heading: "## 実行主体と責務境界", start_line: 66, end_line: 71 }
    execution_conditions: { operation: replace, edit_sha256: 7fa04c24498cd7416f30086e5d84db554149ff0d972419c7a0a76131d9081739, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: 2026-10-13T12:44:49.358Z
    result_affecting_references: { heading_match_rule: search-target-area.ts compatible exact match, scan_scope: target section only }
  - id: AE-003
    target_file: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    target_content_sha256: ddc94eb9acc4c5edb3020f6a12790d29d40dd818e87c05f08a6e4c6e2b276a0f
    check_scope: { heading: "## 目的と適用範囲", start_line: 12, end_line: 15 }
    execution_conditions: { operation: replace, edit_sha256: ffac3af832a16d4146d92e20662090713c26c97976298715a279e8d66e4b8484, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: 2026-10-13T12:44:49.371Z
    result_affecting_references: { heading_match_rule: search-target-area.ts compatible exact match, scan_scope: target section only }
  - id: AE-004
    target_file: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    target_content_sha256: ddc94eb9acc4c5edb3020f6a12790d29d40dd818e87c05f08a6e4c6e2b276a0f
    check_scope: { heading: "## 実行主体と責務境界", start_line: 42, end_line: 51 }
    execution_conditions: { operation: replace, edit_sha256: 220889f398b253757fe00b22a6baf6bf66d70372e5aa80417713455ab3be2d98, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: 2026-10-13T12:44:49.417Z
    result_affecting_references: { heading_match_rule: search-target-area.ts compatible exact match, scan_scope: target section only }
  - id: AE-005
    target_file: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    target_content_sha256: ddc94eb9acc4c5edb3020f6a12790d29d40dd818e87c05f08a6e4c6e2b276a0f
    check_scope: { heading: "## 検証時参照", start_line: 52, end_line: 65 }
    execution_conditions: { operation: replace, edit_sha256: 837af37be1a153bad0364fb7c5c53adcfcc08e3b20ba2fa0319c418f71a87ef4, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: 2026-10-13T12:45:08.218Z
    result_affecting_references: { heading_match_rule: search-target-area.ts compatible exact match, scan_scope: target section only }
  - id: AE-006
    target_file: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    target_content_sha256: ddc94eb9acc4c5edb3020f6a12790d29d40dd818e87c05f08a6e4c6e2b276a0f
    check_scope: { heading: "## 検証時参照", start_line: 52, end_line: 65 }
    execution_conditions: { operation: replace, edit_sha256: c718ceb2370e9e784dd4d06327c56002437d503442cdc3eb35ba250075f24a10, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: 2026-10-13T12:45:08.228Z
    result_affecting_references: { heading_match_rule: search-target-area.ts compatible exact match, scan_scope: target section only }
  - id: AE-007
    target_file: docs/designs/foundations/system.md
    target_content_sha256: 69683f749ade5188a455885a64ded688de00391ea2bdf2d56f73667bae4f134a
    check_scope: { heading: "## Workflow Architecture Inventory", start_line: 102, end_line: 403 }
    execution_conditions: { operation: replace, edit_sha256: c395ac82bafbea996d15bbf29b2ca936f6c11be16eb87485f903ec3b72ade66e, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: 2026-10-13T12:45:08.234Z
    result_affecting_references: { heading_match_rule: search-target-area.ts compatible exact match, scan_scope: target section only }
  - id: AE-008
    target_file: docs/designs/foundations/system.md
    target_content_sha256: 69683f749ade5188a455885a64ded688de00391ea2bdf2d56f73667bae4f134a
    check_scope: { heading: "### 一覧表", start_line: 119, end_line: 140 }
    execution_conditions:
      operation: replace
      expected_old_count: 1
      outcome: rejected_by_checker
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 1, all_ok: false } }
    diff_compact: { changed_lines_count: 0, added: 0, removed: 0 }
    executed_at: 2026-10-13T12:46:30.000Z
    note: >
      一覧表への6行挿入は新表が旧表を含む（superset）ため replace の post 検査（old_text_removed）が失敗し
      組立検査器が拒否した（ok: false、非ゼロ終了。適用抑止どおり）。append は節末尾への空行挟み追記となり
      表の連続性を分断するため使用しない。pre 検査（target_unique 1件、旧表全文の一意性 expected_old_count=1）
      は合格済み。ACT-DESIGN-006 のセクション content はモデル生成とし、Read 実査による表列構造突合
      （4列・列順一致）を以て検査の代替記録とする。
    result_affecting_references: { heading_match_rule: search-target-area.ts compatible exact match, scan_scope: target section only }
  - id: AE-009
    target_file: （複数。見出し外の対象行編集の検査免除記録）
    target_content_sha256: null
    check_scope: { heading: null, start_line: 0, end_line: 0 }
    execution_conditions:
      operation: exempt
      scope: >
        covers コメント行（v4-traceability-model.md:11）、frontmatter 行（REQ-006.md、local-case-file.md:5、
        custom-tool-contracts.md:5）、custom-tool-contracts.md:71 付近の例外リスト追記は、対象位置に
        Markdown 見出しが存在しないため見出し結合型の組立検査器の適用対象外である。
        旧文の存在・一意性は Read 実査で確認し、旧文全文を各 ACT content に記録した。
        glossary・README 等の RA 対象は artifact_actions 外のため組立検査対象外。
    checker: { name: manual-read-inspection, version: "req-define-batch-a", settings: { verification: full-read } }
    checks_summary: { pre: { count: 1, all_ok: true }, post: { count: 0, all_ok: true } }
    diff_compact: { changed_lines_count: 0, added: 0, removed: 0 }
    executed_at: 2026-10-13T12:50:00Z
    result_affecting_references: { heading_match_rule: n/a, scan_scope: target file full read }

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints:
    - "v51-phase-transition-and-coexistence-model.md への RU-0217（検証時参照節 :54,60）と RU-0218（目的と適用範囲 :14・実行主体と責務境界 :50）の編集は本 draft では OU-004 の単一保存操作へ集約済み。RU-0217/RU-0218 が別 Case に分割される場合は同一ファイル競合を避けるため同一 Wave への並列割当を禁止し順次実行すること"
    - "RU-0220 の custom-tool-contracts.md は例外リスト追記（ACT-DESIGN-008）を先に適用し frontmatter updated 進行（ACT-DESIGN-010）を最後に実施すること（IR-072 再違反防止。TS-010 の実行順序）"
    - "RU-0217 の TS-001〜TS-014 履歴注記は RU-0208（REQ-110 test strategy 表、別 draft・別バッチ）の成果物との連動留意。必須依存ではないため depends_on は設定しない"
    - "OU-001〜OU-007 と RA 群（guide・README・語彙）は相互に技術的依存を持たず並列実行可能。上記2件の順序制約のみ遵守"
```

# summary

Batch A（docs-currentization）: 7 RU を統合した docs_chore・standard の draft。
REQ 保存操作 1 件（REQ-006 参照是正）、Design 保存操作 10 件（7 ファイル）、実現面変更 6 件
（README 2 件・guide 2 件・語彙実体・ルール候補検討記録）から構成する。
壁打ちの選択事項 4 件（現行化 vs 限定明記、Wave 現行化 vs 移行期注記、REQ 源明示、横断候補取り込み）は
いずれも実ファイル・DEC・REQ 全文検索の証拠で確定し（CR-001〜004）、ユーザー判断事項は残っていない。
STEP-8 adversarial-review の accepted finding 4 件（updated 進行の全対象化、用語選別根拠の明記、
RD-004 の育成経路明記、CR-003 の補強）は本文へ反映済み。
