---
draft_type: req_draft
topic_slug: tim-verification-scope-differentiation
status: saved
created_at: "2026-08-21T17:35:00+09:00"
source_rus: []
---

# 要件doc: 検証対応の完全性規則の区分適用への修正

本文は要件定義の要約である。機械消費対象は draft-data ブロック。

## 背景

Epic #2358 Wave 4（Issue #2362）の棚卸しで、全現行要件 685 行のうち 513 行について恒常的な検証手段が実在しないことが実証された。これらは主にエージェントの実行時振る舞いを規定する要件行（ワークフロー振る舞い行）であり、REQ-021-020 が定める検証手段と検証実行結果の分離原則に照らすと、実行時検証（Issue/PR/QG が保持）で担保する性質である。実装対応の全行必須（REQ-012-029）は維持したまま、検証対応の必須範囲を検証対応必須区分の要件行へ限定する。

本修正は case-auto 実行（2026-08-21）の Wave 4 blocked に対するユーザー判断（区分適用案の承認）に由来する。

## 合意内容（要約）

- 検証対応の完全性規則を区分適用へ修正する（実装対応の全行必須は維持）
- 要否区分は Design が所有する機械判定可能なカタログで宣言し、未登録行は必須とする（安全側既定）
- check は検証対応の欠落を必須行のみ計上する
- REQ-001-045（完全性台帳）は TIM の完全性規則と check へ移行したため廃止する（git 履歴で v3.0.0 一回限り機構と確認済み）

```yaml
draft-data:
  work_type: feature
  scale: standard
  summary: |
    検証対応の完全性規則を区分適用へ修正する。Epic #2358 Wave 4（Issue #2362）の棚卸しで、エージェントの実行時振る舞いを規定する要件行に恒常的な検証手段が実在しないことが実証された（513行）。REQ-021-020 の検証手段と検証実行結果の分離原則に整合させ、検証対応の必須範囲を検証対応必須区分の要件行へ限定する。要否区分は Design が所有する検証対応要否カタログで機械判定可能に宣言し、未登録行は必須として扱う（安全側既定）。実装対応の全行必須は維持する。あわせて DEC-017 決定1・決定4 を区分適用へ修正し、実装対応先が実在しない REQ-001-045（完全性台帳）を廃止する。通常Case、feature / standard、main。
  auto_gate:
    auto_ready: true
    unresolved_questions: []
    unresolved_conflicts: []
    out_of_repo_operations: []
    stop_reasons: []
  agreed_items:
    - id: AG-001
      content: |
        検証対応の完全性規則を区分適用へ修正する。要件行を「検証対応必須行」と「検証対応任意行」に区分し、任意行はエージェントの実行時振る舞いを規定する要件行とする。実装対応は全現行要件行で1件以上必須とし現行規則（REQ-012-029）を維持する。検証対応は必須行のみ1件以上を必須とし、任意行は Design 対応と同じ任意扱い（欠けても不完全と判定しない）とする。任意行も検証対応を宣言でき、宣言されたものは整合性検査の対象となる。要否区分は Design が所有する検証対応要否カタログ（docs/designs/foundations/references/verification-scope-catalog.md、要件行IDの列挙または同一REQファイル内の範囲表現）で宣言し、機械判定可能な形式とする。カタログに未登録の要件行は検証対応必須として扱う（安全側既定）。任意行の検証は REQ-021-020 の分離原則により Issue/PR/QG が扱う実行時検証へ委ねられる。カタログは REQ-012-050 が禁止する「移行専用の恒久例外台帳」ではなく、現行要件行の性質宣言を所有するモデル要素であり、旧要件の除外（legacy モード）を行わない。513行のカタログ登録は Issue #2362 の移行作業で行う。
    - id: AG-002
      content: |
        agentdev-traceability の check を区分に対応させる。検証対応の欠落（missing-verification）の計上対象を検証対応必須行（カタログ登録による任意行を除く）へ限定する。実装対応の欠落（missing-implementation）の計上対象は全現行要件行で維持する。不正な対応宣言、未知の成果物役割、存在しない要件への参照、対応宣言の根拠箇所を取得できない状態の各検査は区分の影響を受けない。カタログの解析（範囲表現の展開、存在しない要件行へのカタログ参照の検出）は決定的に行う。
    - id: AG-003
      content: |
        REQ-001-045（完全性台帳）を廃止する。git 履歴で完全性台帳は v3.0.0 移行（commit 9952ec63）の一回限りの機構であり、現リポジトリに恒常的な実装対応先が存在しないことを確認済み。再構築時の完全性担保は TIM の完全性規則（REQ-012）と check が担うため、後継措置は不要。廃止は要件行の削除により行い、REQ-001-046/047 の規定どおり本文中に履歴節を設けず、経緯は DEC-017 の結果影響へ記録する。
  artifact_actions:
    - id: ACT-REQ-001
      artifact: req
      operation: update
      target: docs/requirements/REQ-012.md
      source_items: [AG-001, AG-002]
      content: |
        要件行2行を置換し、frontmatter の updated を "2026-08-21" へ更新する。
        1. REQ-012-030 を以下へ置換:
           各現行要件のうち検証対応必須の要件行について、その要件を検証する検証手段が1件以上明示的に対応付けられていること。エージェントの実行時振る舞いを規定する要件行（検証対応任意行）は検証対応を必須とせず、欠けても検証対応の欠落と判定しないこと。要否区分は Design が所有する検証対応要否カタログで機械判定可能に宣言し、未登録の要件行は検証対応必須として扱うこと（検証手段と検証実行結果の分離は REQ-021）
        2. REQ-012-047 を以下へ置換:
           check は、少なくとも不正な対応宣言、未知の成果物役割、存在しない要件への参照、実装対応の欠落、検証対応の欠落（検証対応必須の要件行のみ計上）、対応宣言の根拠箇所を取得できない状態を決定的に検査できること
    - id: ACT-REQ-002
      artifact: req
      operation: update
      target: docs/requirements/REQ-001.md
      source_items: [AG-003]
      content: |
        要件行 REQ-001-045 を削除する。frontmatter の updated を "2026-08-21" へ更新する。履歴注記は REQ-001-046/047 の規定により本文へ追記しない（経緯は DEC-017 結果影響へ記録）。
    - id: ACT-DEC-001
      artifact: decision
      operation: update
      target: docs/decisions/DEC-017.md
      source_items: [AG-001, AG-003]
      content: |
        3点を変更する。
        1. 決定1 の「各現行要件へ実装成果物と検証手段を各1件以上直接対応付ける。Design 対応は任意、Decision は標準成果物型に含めない。」を「各現行要件へ実装成果物を1件以上直接対応付ける。検証手段は Design が所有する要否区分により検証対応が必須となる要件行について1件以上直接対応付ける（エージェントの実行時振る舞いを規定する要件行の検証対応は任意）。Design 対応は任意、Decision は標準成果物型に含めない。」へ置換
        2. 決定4 の「全現行要件の実装対応・検証対応が成立し check の未解決不合格が0件となった後に」を「全現行要件の実装対応と検証対応必須行の検証対応が成立し check の未解決不合格が0件となった後に」へ置換
        3. 結果影響へ1行追記:
           - REQ-001-045（完全性台帳）は v3.0.0 移行の一回限りの機構であり、再構築時の完全性担保は TIM の完全性規則（REQ-012）と check が担うため廃止した
    - id: ACT-DESIGN-001
      artifact: design
      operation: update
      target_design:
        operation: update
        domain: foundations
        slug: traceability-model
      target_area: "## 対応関係の完全性規則"
      source_items: [AG-001, AG-002]
      content: |
        ## 対応関係の完全性規則

        - 実装対応は全要件行で1件以上を必須とする
        - 検証対応は検証対応必須の要件行について1件以上を必須とする
        - 検証対応の要否区分は、検証対応任意行（エージェントの実行時振る舞いを規定する要件行）を列挙する「検証対応要否カタログ」（[references/verification-scope-catalog.md](references/verification-scope-catalog.md)）で宣言する
        - カタログは要件行IDの列挙または同一REQファイル内の範囲表現で機械判定可能に保持し、未登録の要件行は検証対応必須として扱う（安全側既定）。カタログは移行専用の例外台帳ではなく現行要件行の性質宣言であり、旧要件の除外を行わない
        - 任意行の判定基準は、恒続的な成果物（構造、データ、整合性、検査器、テスト）として検証可能な対象を持つかを目安とする。持たず、実行時の品質ゲートやレビューで検証する性質の行を任意行とする（機械判定条件ではなく判定を支援する記述である）
        - 実装対応0件は実装対応の欠落として個別に検出する
        - 検証対応0件は検証対応必須行のみ検証対応の欠落として個別に検出する
        - Design 対応0件のみを理由に不完全と判定しない
        - Design 対応のみが存在する要件を、実装済みまたは検証済みと判定しない
    - id: ACT-DESIGN-002
      artifact: design
      operation: create
      target_design:
        operation: create
        domain: foundations
        slug: verification-scope-catalog
      source_items: [AG-001, AG-002]
      content: |
        docs/designs/foundations/references/verification-scope-catalog.md を新規作成する（Design references。親 Design の完全性規則節から参照される。references 同伴ファイルは designs README 一覧へ登録しない）。

        # 検証対応要否カタログ

        トレーサビリティモデル（[traceability-model.md](../traceability-model.md)）「対応関係の完全性規則」が所有する、検証対応の要否区分カタログ。

        ## 形式

        - 1行1エントリとする
        - エントリは `REQ-{NNNN}-{MMM}`（単一要件行）または `REQ-{NNNN}-{MMM}..REQ-{NNNN}-{MMM}`（同一REQファイル内の範囲）で記述する
        - エントリに登録された要件行は検証対応任意行（エージェントの実行時振る舞いを規定する要件行）である
        - エントリには任意で説明文を後置できる（check は説明文を解釈しない）
        - 未登録の要件行は検証対応必須行として扱う（安全側既定）

        ## 任意行エントリ

        （初期は空とする。全任意行の登録は Issue #2362 の移行作業で行う）
  operation_units:
    - ou_id: OU-001
      target_req: REQ-012
      target_design:
        operation: update
        domain: foundations
        slug: traceability-model
      operation: update
      scale: standard
      depends_on: []
      recommended_order: 1
      issue_policy: single
      result:
        saved_req_docs: [REQ-012]
  req_save_result:
    saved_req_docs: [REQ-001, REQ-012]
    updated_decisions: [DEC-017]
    artifact_action_results:
      ACT-REQ-001: "applied: REQ-012 update（REQ-012-030/REQ-012-047 の2行置換。frontmatter updated は 2026-08-21 が既存値のため変更なし）"
      ACT-REQ-002: "applied: REQ-001 update（REQ-001-045 要件行の削除、frontmatter updated 2026-08-20 から 2026-08-21 へ更新。履歴注記の本文追記なし）"
      ACT-DEC-001: "applied: DEC-017 update（決定1・決定4 の置換、結果影響へ REQ-001-045 廃止の1行追記）"
    design_save_pending_actions: [ACT-DESIGN-001, ACT-DESIGN-002]
  test_strategy:
    - id: TS-001
      target_item: AG-001/AG-003
      verification: req-save/design-save 実行後、REQ-012-030/047 の置換、REQ-001 から REQ-001-045 の削除、DEC-017 決定1/決定4 と結果影響の置換・追記、Design 完全性規則節の置換、カタログファイルの新規作成を確認する。
      pass_criteria: 実装対応の全行必須維持、検証対応の区分適用、安全側既定（未登録=必須）、REQ-012-050 の禁止事項（移行専用恒久例外台帳・legacy モード）との不抵触がすべて反映されている。
      on_failure: fix-and-reverify（draft 側 content を修正して再実行）。
    - id: TS-002
      target_item: AG-002
      verification: Case 完了時に、check がカタログを解釈して検証対応の欠落を必須行のみへ計上することをテストで検証する。
      pass_criteria: カタログ登録行の検証対応0件が欠落として計上されず、未登録行の検証対応0件が欠落として計上されること。範囲表現が正しく展開されること。存在しない要件行へのカタログ参照が検出されること。
      on_failure: fix-and-reverify。
  case_open_hints:
    epic_needed: false
    decomposition: 単一 Issue（OU-001、Standard flow）。スコープ: agentdev-traceability の check への区分対応（カタログ解析・範囲展開・存在しない要件行参照の検出・missing-verification 計上限定）とテスト追加、変更後 REQ-012-030/047 への対応宣言更新。REQ-001-045 の廃止は req-save 適用済み（Case 追加作業なし）。513行のカタログ登録は Issue #2362 の移行作業（本 Issue スコープ外）。カタログの初期ファイルは design-save で作成済み。
```

## adversarial_review_result（経路A）

- 実施日: 2026-08-21。2独立 stream（モデル・要件整合 / 運用・移行）+ 戦略メタ反証 + convergence audit
- 争点: 10件（合意 8、限定合意 2、撤回 0）
- accepted findings: (1) Design 完全性規則節へ任意行判定基準の目安一文を追加（ACT-DESIGN-001 へ反映済み）(2) case_open_hints へ REQ-001-045 廃止の関連情報明記（反映済み）
- unresolved: なし（auto_gate auto_ready: true を維持）

## 備考

- REQ-001 への単行削除（ACT-REQ-002）は OU-001 の Issue スコープ外で req-save が適用する。REQ-001 単独の Case は作らない（変更が1行で、Case で追加実装・検証すべき対象が存在しないため）。
- traceability-model.md の status は本修正では変更しない（design-save の G06 既存扱い。変更内容は Case での check 実装・テストで検証される）。
