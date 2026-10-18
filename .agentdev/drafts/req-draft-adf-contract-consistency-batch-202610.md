---
draft_type: req_draft
topic_slug: adf-contract-consistency-batch-202610
status: draft
created_at: 2026-10-18T03:30:00+09:00
source_rus: [RU-0230, RU-0231, RU-0232, RU-0233, RU-0234, RU-0235]
---

<!-- req_draft テンプレート
 このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
 後続工程（case-open/ case-ready/ case-revise/ case-auto/ case-run/ case-close）が参照する
 原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
 soft contract（生成元側標準）であり、LLM 推論経由で消費される。
 厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、Definition 構成（artifact_actions の有無等）から各コマンドが導出する
work_type: maintenance

# scale: standard / large（全 work_type で設定可。未設定の場合は standard 準拠）
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: 本 draft は RU-0230 から RU-0235 までの6件に対応し、case-ready STEP-7 canonical 再取得の分岐検出と既存手順への正規接続、case-open STEP-4 DefinitionEdit 入力組立の newText 行構造事前検証、Case 直下の子 Issue のタイトル書式 `[Case #<親番号>] 主題` の定義、system.md 一覧表 phase-artifacts-update 行の出力欄の正本契約への整合、REQ-112 のテンプレート案内コメント3箇所の除去、local-case-file.md の実装済み作業指示の現行形への書き換えを合意した。REQ 保存は REQ-061 と REQ-030 への各1行追加および REQ-100 と REQ-112 の更新、Design 保存は5ファイル（case-ready.md、case-open.md、issue-title-policy.md、system.md、local-case-file.md）の更新である。case-open Design の covers 更新には traceability sidecar の design ロール同期（REQ-030-024 両方向一致）を伴う。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  - id: AG-001
    content: case-ready は STEP-7 の canonical 再取得で fetch または ff-only merge が失敗した場合、ローカル main と origin/main の分岐の有無（ahead/behind の件数とコミット一覧）を検出し、その事実を報告 JSON の該当 step の detail に反映すること。検出は報告に限り、script は分岐を自動解消しないこと（Case #3776 で手動適用された復帰を恒常化する）。
  - id: AG-002
    content: 分岐の解消は agentdev-git-worktree の「Squash merge 後分岐ハンドリング手順」（git-common-procedures.md）に従うこと。既存手順の処理分岐（完全重複は reset --hard、部分重複は soft reset または手動解決提案、独立変更はユーザー報告）を変更・緩和しないこと。独立変更に該当する場合は自動 rebase・自動 reset を行わずユーザー判断を要求すること。remote-tracking ref 消失ケース（既存手順の手順0）との整合を保持し、readiness-and-cleanup.md の既存条項（reset --hard 等の履歴操作の前に状態確認）を維持した上で、分岐ハンドリングは前置確認の後段に接続すること。case-close STEP-4-3 からの既存参照を変更しないこと。
  - id: AG-003
    content: case-open は STEP-4 機械工程で DefinitionEdit の入力 JSON を組立後、各編集の newText の行構造（oldText から newText への行区切りの保全）を、oldText 末尾の行末改行の有無に依存しない方法で機械検証する事前確認を経て投入すること。事前確認に不合格の編集を含む入力は適用せず fail-closed で報告すること。当該確認は適用後の受入検査（REQ-030-027 の verbatim 包含突合）を代替しないこと（Case #3779 の行区切り欠落適用の再発防止）。
  - id: AG-004
    content: 行構造の事前検証は script（prepare_definition_pr.ts）の入力検証として実装し、不合格入力の拒否は既存の入力検証契約（終了コード 1）に従うこと。事前検証は既存の事後機構（verbatim 包含突合、traceability check）を代替せず前置する位置づけで追加すること。
  - id: AG-005
    content: Case 直下の子 Issue（Epic を構成しない OU 単位並列構成）のタイトル書式を `[Case #<親番号>] 主題` と定義すること（<親番号> は親 Root Case の Issue 番号。ローカル版は既存ローカル Issue 番号をゼロ埋めなしで使用）。役割別書式判定表に同役割の書式行を追加し、親番号の例外文言は親識別子表示（`[Epic #<親番号>]`、`[Case #<親番号>]`）へ一般化すること。OU 番号・実行順序の情報はタイトルへ含めないこと（タイトルから除く情報の OU 羅列・進行状況除外に整合）。適用は GitHub・ローカル版（agentdev_gh local）の両起票経路とローカル版 case file の title フィールドに及ぶこと（case-file.md から issue-title-policy Design への委譲構造は現状維持とし、書式を重複定義しないこと）。
  - id: AG-006
    content: system.md 一覧表の phase-artifacts-update 行の出力欄を出力契約の条件付き表記（記録の保存先〔外部戻り入力存在時は受領記録、直接採用時は採否記録〕）へ整合させること。出力契約の正本は agentdev-workflow-phase-artifacts-update SKILL.md の公開操作契約であり、本件で正本側は変更しないこと。
  - id: AG-007
    content: REQ-112.md のテンプレート案内コメント `<!-- 【必須】 -->` 3箇所（目的節直下、要件節直下、適用範囲節直下）を除去すること。上記以外の REQ-112 本文（行・節構成・文言）は変更しないこと。4列要件表とぶら下がり段落は本件の対象外とし、採否の判断をしないこと。
  - id: AG-008
    content: local-case-file.md のコメント読み替えの role 分岐節末尾（共通メタデータ表の comment_seq と機械可読定義の更新に関する段落）および role ごとの必須項目・状態値・許可操作の検証節内（case-schema 機械可読定義の更新方針段落）の、実装済み作業を未実施として含意する命令形記述を現行設計の記述へ書き換えること。記述内容そのもの（comment_seq の仕様、case-schema 機械可読定義の構成）は変更しないこと。
  - id: AG-009
    content: RU-0234 および RU-0235 の付属候補（テンプレート残骸コメント検出、Design 本文の命令形作業指示検出の docs-check ルール）は本件の要件化対象外とし、必要になった時点で独立した要件として育成すること。本 draft の受け入れ条件へは含めないこと。
  - id: AG-010
    content: system.md 一覧表の他行（他 command の出力欄記述）に同一種の正本契約との文言ずれが波及していないかの確認は、本 Case の検証（TS-004）の範囲で実施すること。本 draft の保存対象は phase-artifacts-update 行に限ること。

# artifact_actions: REQ/Decision/Design への保存対象を1つの配列に統合
# 1 action = 1 artifact × 1 editing concern
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-061.md
    source_items: [AG-001, AG-002]
    content: |
      REQ-061 要件表への追加行（REQ-061-051 行の直後、表の連続性を維持し空行を挟まない）:

      | REQ-061-052 | case-ready は STEP-7 の canonical 再取得で fetch または ff-only merge が失敗した場合、ローカル main と origin/main の分岐の有無（ahead/behind の件数とコミット一覧）を検出し、その事実を報告 JSON の該当 step の detail に反映すること。分岐の解消は agentdev-git-worktree の squash merge 後分岐ハンドリング手順に従い、既存手順の処理分岐（完全重複・部分重複・独立変更）を変更しないこと。独立変更に該当する場合は自動 rebase・自動 reset を行わずユーザー判断を要求すること |

      適用仕様: oldText = REQ-061-051 行全体（ファイル内一意、grep 検証済み: 1件）、newText = REQ-061-051 行全体 + 改行 + 上記追加行。
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-030.md
    source_items: [AG-003, AG-004]
    content: |
      REQ-030 要件表への追加行（REQ-030-029 行の直後、表の連続性を維持し空行を挟まない）:

      | REQ-030-030 | case-open は STEP-4 機械工程で DefinitionEdit の入力 JSON を組立後、各編集の newText の行構造（oldText から newText への行区切りの保全）を、oldText 末尾の行末改行の有無に依存しない方法で機械検証する事前確認を経て投入すること。事前確認に不合格の編集を含む入力は適用せず fail-closed で報告すること。当該確認は適用後の受入検査（REQ-030-027 の verbatim 包含突合）を代替しないこと |

      適用仕様: oldText = REQ-030-029 行全体（ファイル内一意、grep 検証済み: 1件）、newText = REQ-030-029 行全体 + 改行 + 上記追加行。
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-100.md
    source_items: [AG-005]
    content: |
      REQ-100 の5編集（いずれも組立検査合格済み: pre/post checks all_ok、script evidence 記録）。

      編集1（要件表 REQ-100-001 行、書式列挙への Case 直下子 Issue の追加）:
      - oldText: 「Epic 配下の子 Issue は `[Epic #<親番号>] Wave-N: 主題`（N は所属 Epic 内の Wave 番号、<親番号> は親 Epic の Issue 番号。ローカル版は既存ローカル Issue 番号をゼロ埋めなしで使用）、追跡Issueは」
      - newText: 「Epic 配下の子 Issue は `[Epic #<親番号>] Wave-N: 主題`（N は所属 Epic 内の Wave 番号、<親番号> は親 Epic の Issue 番号。ローカル版は既存ローカル Issue 番号をゼロ埋めなしで使用）、Case 直下の子 Issue（Epic を構成しない OU 単位並列構成）は `[Case #<親番号>] 主題`（<親番号> は親 Root Case の Issue 番号。ローカル版は既存ローカル Issue 番号をゼロ埋めなしで使用）、追跡Issueは」

      編集2（REQ-100-005 行内の親番号例外文言の一般化）:
      - oldText: 「ただし親 Issue 番号は子 Issue タイトル先頭の `[Epic #<親番号>]` 表示に限り例外として含めること」
      - newText: 「ただし親 Issue 番号は子 Issue タイトル先頭の親識別子表示（`[Epic #<親番号>]`、`[Case #<親番号>]`）に限り例外として含めること」

      編集3（適用範囲 対象行の書式列挙の反映）:
      - oldText: 「役割別書式（`[Epic #<親番号>] Wave-N: 主題` 形式の子 Issue タイトルを含む）」
      - newText: 「役割別書式（`[Epic #<親番号>] Wave-N: 主題` 形式および `[Case #<親番号>] 主題` 形式の子 Issue タイトルを含む）」

      編集4（REQ-100-004 行、主語の Epic 配下への限定。RU-0232 の整合判断に基づく波及対応）:
      - oldText: 「| REQ-100-004 | 子 Issue のタイトルは親 Epic 識別子（`[Epic #<親番号>]`）と確定済みの所属 Wave を先頭に置くこと。」
      - newText: 「| REQ-100-004 | Epic 配下の子 Issue のタイトルは親 Epic 識別子（`[Epic #<親番号>]`）と確定済みの所属 Wave を先頭に置くこと。」

      編集5（REQ-100-006 行、case-ready の付与義務の確定構造対応化。RU-0232 の整合判断に基づく波及対応）:
      - oldText: 「case-ready は確定構造に沿って接頭辞を更新し子 Issue へ親 Epic 識別子と Wave を含むタイトルを付与すること。」
      - newText: 「case-ready は確定構造に沿って接頭辞を更新し、子 Issue へ確定構造に応じる親識別子を含むタイトル（Epic 構成時は親 Epic 識別子と Wave、Case 直下並列構成時は `[Case #<親番号>]`）を付与すること。」
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-112.md
    source_items: [AG-007]
    content: |
      REQ-112 の3編集（各セクション直下のテンプレート案内コメント行の除去。組立検査合格済み、行数変化は各 -1。コメント行のみの oldText は3箇所に出現し非一意のため、見出し行を含む oldText で一意化する）。

      編集1（## 目的の直下）: oldText = 「## 目的\n<!-- 【必須】 -->\n」→ newText = 「## 目的\n」。
      編集2（## 要件の直下）: oldText = 「## 要件\n<!-- 【必須】 -->\n」→ newText = 「## 要件\n」。
      編集3（## 適用範囲の直下）: oldText = 「## 適用範囲\n<!-- 【必須】 -->\n」→ newText = 「## 適用範囲\n」。

      上記以外の本文は変更しない。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-ready
    target_area: 機械工程の script 呼び出し契約（RU-0162）
    source_items: [AG-001, AG-002]
    content: |
      case-ready.md の2編集。

      編集1（covers design コメント行、REQ-061-052 の追加。ファイル内一意、grep 検証済み: 1件）:
      - oldText: 「<!-- ADF-COVERS(design): REQ-061-010, REQ-061-019, REQ-061-021, REQ-061-038, REQ-061-023, REQ-061-029, REQ-061-030, REQ-061-033, REQ-061-034, REQ-061-035, REQ-061-039, REQ-061-040, REQ-061-047, REQ-061-048, REQ-061-049, REQ-061-050, REQ-061-051, REQ-035-012, REQ-035-018 -->」
      - newText: 「<!-- ADF-COVERS(design): REQ-061-010, REQ-061-019, REQ-061-021, REQ-061-038, REQ-061-023, REQ-061-029, REQ-061-030, REQ-061-033, REQ-061-034, REQ-061-035, REQ-061-039, REQ-061-040, REQ-061-047, REQ-061-048, REQ-061-049, REQ-061-050, REQ-061-051, REQ-061-052, REQ-035-012, REQ-035-018 -->」

      編集2（### 機械工程の script 呼び出し契約（RU-0162）節、既存 bullet（case-open Design と同一規律）の直後に bullet 1行を挿入。anchor bullet はファイル内一意、grep 検証済み: 1件）:
      挿入行: 「- canonical 再取得の fetch・ff-only merge が失敗した場合は、ローカル main と origin/main の分岐の有無（ahead/behind の件数とコミット一覧）を検出し、報告 JSON の該当 step detail へ反映する。script は分岐を自動解消せず、解消は agentdev-git-worktree の「Squash merge 後分岐ハンドリング手順」（git-common-procedures.md）に従う（REQ-061-052）。同手順の処理分岐（完全重複・部分重複・独立変更）と case-close STEP-4-3 からの既存参照を変更しない」
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: 機械工程の script 呼び出し契約（RU-0162）
    source_items: [AG-003, AG-004]
    content: |
      case-open.md の2編集と traceability sidecar の1編集（REQ-030-024 両方向一致対応）。

      編集1（covers design コメント行、REQ-030-030 の追加。ファイル内一意、grep 検証済み: 1件）:
      - oldText: 「<!-- ADF-COVERS(design): REQ-030-025, REQ-030-026, REQ-030-028, REQ-030-029 -->」
      - newText: 「<!-- ADF-COVERS(design): REQ-030-025, REQ-030-026, REQ-030-028, REQ-030-029, REQ-030-030 -->」

      編集2（### 機械工程の script 呼び出し契約（RU-0162）節、前置作成の委譲を述べる既存 bullet（L88）の直後に bullet 1行を挿入。anchor bullet はファイル内一意、grep 検証済み: 1件）:
      挿入行: 「- DefinitionEdit の入力 JSON 組立後、各編集の newText の行構造（oldText から newText への行区切りの保全）を、oldText 末尾の行末改行の有無に依存しない方法で機械検証する事前確認を script 入力検証として経る。行区切りの連結など事前確認に不合格の編集を含む入力は fail-closed で拒否する。当該確認は適用後の verbatim 包含突合（REQ-030-027）を代替しない（REQ-030-030）」

      編集3（traceability sidecar、REQ-030-024 両方向一致の維持。anchor 2行連結はファイル内一意、grep 検証済み: 1件）:
      - 対象: traceability/agentdev-workflow-case-open.yaml（design ロール節）
      - oldText: 「    - REQ-030-029\n    - REQ-083-002」
      - newText: 「    - REQ-030-029\n    - REQ-030-030\n    - REQ-083-002」
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: issue-title-policy
    target_area: 役割別書式（判定表）
    source_items: [AG-005]
    content: |
      issue-title-policy.md の6編集（編集1・2・5 は挿入型のため anchor 一意性を grep 検証済み: 各1件。編集3・4・6 は組立検査合格済み）。

      編集1（## 役割別書式（判定表）の表、Epic 配下の子 Issue 行の直後に表行を1行挿入）:
      挿入行: 「| Case 直下の子 Issue（Epic を構成しない OU 単位並列構成） | `[Case #<親番号>] 主題` | case-ready が Case 直下の子 Issue を作成する時点（<親番号> = 親 Root Case の Issue 番号。順序・実行制御の情報は含めない） |」

      編集2（## 役割別書式（判定表）の節末尾箇条書き、「Wave-N の N は所属表示」bullet の直後に bullet 1行を挿入）:
      挿入行: 「- `[Case #<親番号>]` は表示用の親 Case 識別子である。親子関係・実行可否の正は Root Case 本文の実行構成であり、タイトル解析から親子関係・実行順序を決定しない。OU 番号・実行順序の情報はタイトルへ含めない（「タイトルから除く情報」の OU 羅列・進行状況除外に従う）」

      編集3（## タイトルから除く情報、例外文言の一般化）:
      - oldText: 「親 Issue 番号の除去は子 Issue タイトル先頭の `[Epic #<親番号>]` 表示に限り例外とする。」
      - newText: 「親 Issue 番号の除去は子 Issue タイトル先頭の親識別子表示（`[Epic #<親番号>]`、`[Case #<親番号>]`）に限り例外とする。」

      編集4（## 付与と更新の場面、case-ready 行の書式列挙の拡張）:
      - oldText: 「子 Issue へ `[Epic #<親番号>] Wave-N: 主題` を付与する（issue_create / issue_update の既存経路を使用）。」
      - newText: 「子 Issue へ `[Epic #<親番号>] Wave-N: 主題`（Epic 構成時）または `[Case #<親番号>] 主題`（Case 直下並列構成時）を付与する（issue_create / issue_update の既存経路を使用）。」

      編集5（## 生成例、ローカル版 Epic 例の直後に例示2行を挿入）:
      挿入行1: 「- `[Case #3586] 取り込み済み検出事項の再発防止を整理する`（GitHub 版。親 Root Case #3586 の直下の子 Issue。Epic を構成しない OU 単位並列構成）」
      挿入行2: 「- `[Case #42] 取り込み済み検出事項の再発防止を整理する`（ローカル版。親 `issue-0042` の直下の子 Issue。親番号はゼロ埋めなしの既存ローカル番号）」

      編集6（## Wave 投影、先頭 bullet の Epic 配下への限定と Case 直下の併記。RU-0232 の整合判断に基づく波及対応。組立検査合格済み）:
      - oldText: 「- 子 Issue には確定済みの所属 Wave を `[Epic #<親番号>] Wave-N: 主題` の形式で先頭に置いて統一する」
      - newText: 「- Epic 配下の子 Issue には確定済みの所属 Wave を `[Epic #<親番号>] Wave-N: 主題` の形式で先頭に置いて統一する。Case 直下の子 Issue（Epic を構成しない OU 単位並列構成）は Wave を持たず `[Case #<親番号>] 主題` を用いる（役割別書式（判定表）参照）」
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: system
    target_area: 一覧表
    source_items: [AG-006]
    content: |
      system.md の1編集（### 一覧表、phase-artifacts-update 行の出力欄。組立検査合格済み）。

      - oldText: 「衝突・未確認・保存失敗の区別、受領記録の保存先） | phase（工程駆動） |」
      - newText: 「衝突・未確認・保存失敗の区別、記録の保存先〔外部戻り入力存在時は受領記録、直接採用時は採否記録〕） | phase（工程駆動） |」
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: local-case-file
    target_area: コメント読み替えの role 分岐
    source_items: [AG-008]
    content: |
      local-case-file.md の2編集（いずれも組立検査合格済み）。

      編集1（## コメント読み替えの role 分岐、節末尾の3行段落を1行へ現行化）:
      - oldText: 「共通メタデータ表へ `comment_seq`（数値、任意、コメント採番の最高水位標）を追加する。\n`src/common/tools/agentdev-gh/local/case-schema/` の機械可読定義（case-file.md、headings.yaml 等）を\n本拡張へ合わせて更新する。」
      - newText: 「共通メタデータ表は `comment_seq`（数値、任意、コメント採番の最高水位標）を持つ。`src/common/tools/agentdev-gh/local/case-schema/` の機械可読定義（case-file.md、headings.yaml 等）は本拡張に合わせて更新済みである。」

      編集2（## role ごとの必須項目・状態値・許可操作の検証、更新方針段落の現行化）:
      - oldText: 「case-schema 機械可読定義の更新方針: `src/common/tools/agentdev-gh/local/case-schema/rules/` の機械可読定義（frontmatter.yaml、status.yaml、labels.yaml、headings.yaml）を共通メタデータと role 条件付きスキーマへ拡張する。role ごとの値域・必須項目を定義へ反映し、本 Design と矛盾しないことを検証する。」
      - newText: 「case-schema 機械可読定義: `src/common/tools/agentdev-gh/local/case-schema/rules/` の機械可読定義（frontmatter.yaml、status.yaml、labels.yaml、headings.yaml）は共通メタデータと role 条件付きスキーマへ拡張されており、role ごとの値域・必須項目を定義に反映して本 Design と矛盾しないことを検証する。」

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: RU-0232 の解決方向は「判定表への書式行追加」と「明示対象外宣言の追加」の2経路が併記されていた。
    resolution: 書式行追加を採用した。Case #3758 で Case 直下子 Issue の起票需要が実在し（主題のみ + 本文 Parent 行の暫定運用）、単一参照点としての網羅性回復が本来の目的であるため。対象外宣言は網羅性欠落を温存する経路であり却下した。
  - id: CR-002
    conflict: RU-0230 の実現先候補は「readiness-and-cleanup.md の前置規律追記」「script への分岐検出組込み」「両方」が併記されていた。
    resolution: 両方を採用した。検出と報告は機械的に決定的であるため script（accept_definition_checks.ts）が担い、解消の判断は既存手順（agentdev-git-worktree の分岐ハンドリング手順）が担う責務分離とし、reference はその接続規律を明記する。script のみでは手順接続が不明となり、reference のみでは毎回の手動検出判断に依存するため。
  - id: CR-003
    conflict: RU-0231 の実現先は「definition-pr-and-idempotency.md の手順追記」と「script（prepare_definition_pr.ts）への入力検証組込み」の要否が req-define の判断に委ねられていた。
    resolution: 両方を採用した。手順のみでは組立ミスが機械検出されず、script のみでは手順規律が不在となるため。RU の制約（oldText 末尾の行末改行の有無に依存しない確認方法の明示、既存入力検証契約に従う拒否）は両面で充足される。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-0001
    source_ru: RU-0230
    target_req: REQ-061
    target_design: docs/designs/commands/case-ready.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-0002
    source_ru: RU-0231
    target_req: REQ-030
    target_design: docs/designs/commands/case-open.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-0003
    source_ru: RU-0232
    target_req: REQ-100
    target_design: docs/designs/workflows/issue-title-policy.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-0004
    source_ru: RU-0233
    target_design: docs/designs/foundations/system.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-0005
    source_ru: RU-0234
    target_req: REQ-112
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-0006
    source_ru: RU-0235
    target_design: docs/designs/local/local-case-file.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。3要素（verification / pass_criteria / on_failure）必須
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      src/common/skills/agentdev-workflow-case-ready/scripts/tests/accept_definition_checks.test.ts を拡張し、bun test で実行する。fakeRunner に ff-only merge 失敗と rev-list/merge-base 応答を注入し、(a) 分岐検出結果（ahead/behind 件数とコミット一覧）が報告 JSON の該当 step detail へ出力されること、(b) git runner の呼び出し履歴に reset/rebase 系の自動解消操作が含まれないこと、(c) 既存の3テスト（fetch と ff-only merge での削除 commit、ff-only 失敗時の削除 commit 不実施、標準エラー全文保存）が維持されることを確認する。あわせて readiness-and-cleanup.md に分岐検出時の既存手順（agentdev-git-worktree「Squash merge 後分岐ハンドリング手順」）への接続規律と、独立変更時にユーザー判断を要求する文言が存在することを確認する。
    pass_criteria: |
      上記 (a)(b)(c) がすべて成立すること。報告 JSON の detail に分岐状態が機械判別可能な形で含まれること。既存テストが1件も削除・変更されずに通過すること（テスト追随制約）。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する。既存テストを削除して通過させることは RU-0230 の制約違反のため許容しない）。
  - id: TS-002
    target_item: AG-003
    verification: |
      src/common/skills/agentdev-workflow-case-open/scripts/tests/prepare_definition_pr.test.ts の入力検証 describe を拡張し、bun test で実行する。(a) oldText 末尾に行末改行を含まない前提で組み立てられた行区切り欠落の newText（REQ 行 ID が同一行に連結される入力）が入力検証で終了コード 1 により拒否されること、(b) 行構造が保全された正規入力が受理されること、(c) 行末改行の有無両パターンで検証結果が変わらないこと、(d) 既存の入力検証テストと REQ 行編集適用テストが維持されることを確認する。あわせて definition-pr-and-idempotency.md の STEP-4 手順に事前確認条項が存在すること、および traceability sidecar（traceability/agentdev-workflow-case-open.yaml）の design ロールに REQ-030-030 が反映され inline covers と両方向で一致すること（REQ-030-024、Definition PR の traceability check で検証）を確認する。
    pass_criteria: |
      上記 (a)〜(d) がすべて成立すること。拒否が報告 JSON を伴わない既存入力検証契約（stderr + exit 1）に従うこと。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する）。
  - id: TS-003
    target_item: AG-005
    verification: |
      文書整合の機械検査（grep）。(a) issue-title-policy.md の判定表に Case 直下の子 Issue 行が存在すること、(b) 例外文言・付与と更新の場面・生成例の各所で `[Case #<親番号>]` 表記が存在し相互に書式が一致すること、(c) REQ-100 の編集5箇所（REQ-100-001、REQ-100-004、REQ-100-005、REQ-100-006、適用範囲）が反映され、REQ-100-004/REQ-100-006 が Epic 配下・確定構造応答の文言へ限定されていること（新書式との矛盾残存の検出）、Wave 投影節が Epic 配下への限定と Case 直下の併記になっていること、(d) `Task:` 形式を推奨する記述が増えていないこと、(e) 配布 skill・script 側（src/common/skills/**、src/common/tools/**）に `[Case #` 書式の重複定義（ハードコード）が存在しないことを確認する。
    pass_criteria: |
      上記 (a)〜(e) がすべて成立し、判定表の書式 `[Case #<親番号>] 主題` と REQ-100-001 の列挙・生成例の実例が一字句レベルで一致すること。REQ-100 全行と issue-title-policy.md 全体に新書式と矛盾する無条件の Epic/Wave 付与要求が残存しないこと。
    on_failure: |
      fix-and-reverify（文書不整合であるため修正して再検証する）。
  - id: TS-004
    target_item: AG-006
    verification: |
      system.md の一覧表 phase-artifacts-update 行の出力欄が条件付き表記（記録の保存先〔外部戻り入力存在時は受領記録、直接採用時は採否記録〕）へ更新されていることを確認する。あわせて一覧表の他行について、出力欄記述と各 command の正本契約（command README または Workflow Skill の公開操作契約）に同一種の無条件表記と正本の不整合が存在しないことを突合で確認する（AG-010）。
    pass_criteria: |
      phase-artifacts-update 行の表記が更新され、行内の入力欄（直接採用に言及）と出力欄の不整合が解消していること。他行の突合結果（不整合なし、または検出行とその正本）が記録されていること。
    on_failure: |
      他行に不整合を検出した場合は record-in-findings（他行は本件の保存対象外のため findings に記録し、必要になった時点で独立して育成する）。phase-artifacts-update 行自体の不備は fix-and-reverify。
  - id: TS-005
    target_item: AG-007
    verification: |
      grep による機械検査。(a) docs/requirements/REQ-112.md で `【必須】` の出現が 0 件であること、(b) docs/requirements/ 全域で `<!-- 【必須】 -->` 出現が 0 件であること（テンプレート本体 src/common/skills/agentdev-req-file-manager/templates/ は管理対象外として除外明示）、(c) REQ-112.md の行数変化がコメント行除去による -3 のみであること（本文の行・節構成・文言が不変であること）。
    pass_criteria: |
      上記 (a)(b)(c) がすべて成立すること。
    on_failure: |
      fix-and-reverify（表層修正の欠落または過剰削除であるため修正して再検証する）。
  - id: TS-006
    target_item: AG-008
    verification: |
      (a) local-case-file.md の対象2箇所に「〜を追加する」「〜を更新する」の未実施を含意する命令形が残存しないこと、(b) 現行形化された記述が実装実体（src/common/tools/agentdev-gh/local/case-schema/case-file.md の comment_seq 定義、case-schema/rules/ 配下の frontmatter.yaml、status.yaml、labels.yaml、headings.yaml の4ファイル）と一致することを突合で確認する。
    pass_criteria: |
      上記 (a)(b) がともに成立し、記述内容（comment_seq の仕様、case-schema 機械可読定義の構成列挙）に変更がないこと。
    on_failure: |
      fix-and-reverify（表現の現行化不足または実装実体との不整合であるため修正して再検証する）。

# realization_actions: 実現面の変更方針（ドメイン中立契約）
realization_actions:
  - id: RA-001
    concern: case-ready canonical 再取得の分岐検出の実装
    responsibility: accept_definition_checks.ts の canonical-and-cleanup phase において、fetch・ff-only merge 失敗時にローカル main と origin/main の分岐状態（ahead/behind 件数とコミット一覧の取得コマンド実行）を検出し、報告 JSON の該当 step detail へ反映する。検出は報告に限り、分岐の解消操作（reset、rebase、merge）は実行しない。exitCategory の union 変更は不要で detail 構造の拡張により対応する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（git fetch は L546、ff-only merge は L556、失敗分岐は L547-572、報告 JSON 構造は L99-108）
      - src/common/skills/agentdev-workflow-case-ready/scripts/tests/accept_definition_checks.test.ts（fakeRunner 注入構造 L92-95、既存3テスト L224-236、L238-244、L359-373）
      - 動作参照: agentdev-git-worktree/references/git-common-procedures.md の Squash merge 後分岐ハンドリング手順（L521-586）
    intent: 分岐状態が報告 JSON だけで機械判別可能になり、実行側の手動検出判断を排除する。Case #3776 で手動適用された復帰経路を恒常化する。
    verification_refs: [TS-001]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: case-ready STEP-7 手順書への分岐ハンドリング接続規律の追記
    responsibility: readiness-and-cleanup.md の STEP-7 canonical 再取得手順に、script の分岐検出報告を受けた場合の正規手順（agentdev-git-worktree の Squash merge 後分岐ハンドリング手順への接続）を前置規律として追記する。既存条項（reset --hard 等の履歴操作前の状態確認）は維持し、分岐ハンドリングは前置確認の後段に接続する。remote-tracking ref 消失ケース（既存手順の手順0）との整合を明記する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md（STEP-7 canonical 再取得手順）
      - src/common/skills/agentdev-git-worktree/references/git-common-procedures.md（L521-586、手順本文は変更しない）
    intent: script の検出結果から既存の恒久手順への正規接続を確立し、case-close STEP-4-3 と同一の手順資産を再利用する。
    verification_refs: [TS-001]
    source_items: [AG-002]
  - id: RA-003
    concern: prepare_definition_pr.ts の入力検証への newText 行構造検証の組込み
    responsibility: prepare_definition_pr.ts の validateInput に、definitionEdits 各編集の行構造事前検証（oldText と newText を行配列化し、newText の行列が oldText の行構造と追加行から矛盾なく構成されることの検証。oldText 末尾の行末改行の有無に依存しない方法）を追加する。不合格入力は既存の入力検証契約（stderr + 終了コード 1）で拒否する。適用時点（worktree 作成後）で初めて失敗する現行構造（副作用後に失敗）を入力検証時点の拒否へ前倒しする。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（DefinitionEdit 型 L75-82、validateInput L177-182、applyDefinitionEdit L405-415、入力検証失敗経路 main catch L726-732）
      - src/common/skills/agentdev-workflow-case-open/scripts/tests/prepare_definition_pr.test.ts（入力検証 describe L121-177、REQ 行編集の適用 L179-195）
    intent: Case #3779 の行区切り欠落（oldText 末尾改行なし前提の見落としによる REQ 行 ID 同一行連結）を適用前に機械拒否し、事後検知（traceability check）頼みの経路を断つ。
    verification_refs: [TS-002]
    source_items: [AG-003, AG-004]
  - id: RA-004
    concern: definition-pr-and-idempotency.md の STEP-4 手順への事前確認条項の追記
    responsibility: definition-pr-and-idempotency.md の STEP-4 機械工程の入力 JSON 組立条項に、組立後の各 DefinitionEdit の newText 行構造の機械検証（行数整合の確認方法を含む）を前置確認として追記する。既存の事後機構（verbatim 包含突合、traceability check）を代替しない位置づけを明記する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（STEP-4 機械工程・入力 JSON 組立条項）
    intent: script 入力検証と手順規律の両面で行構造保全を担保し、組立ミスの流入経路を手順面でも封じる。
    verification_refs: [TS-002]
    source_items: [AG-003, AG-004]
  - id: RA-005
    concern: Case 直下子 Issue 書式の起票経路への適用
    responsibility: 実現面の変更は不要である。書式の正は issue-title-policy Design が単一参照点として所有し、case-ready の子 Issue 起票（issue_create / issue_update 経由、ローカル版は case file の title フィールド）は判定表の役割行に従って書式を適用する構造が既存であるため、Design 更新により起票経路の振る舞いが駆動される。起票処理側に書式の重複定義（ハードコード）が存在しないことを本 Case の実装確認に含める。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-ready/（実行構造確定と子 Issue 起票）
      - src/common/tools/agentdev-gh/local/（ローカル版 case file の title フィールド）
    intent: 書式定義の単一参照点を維持したまま、両起票経路（GitHub・ローカル版）へ新書式を適用する。
    verification_refs: [TS-003]
    source_items: [AG-005]
  - id: RA-006
    concern: corpus 表層修正（REQ-112 残骸除去、local-case-file.md 現行化）の検証手段
    responsibility: 実現面の変更は不要である（対象は正規文書の表層修正）。検証は grep による出現件数検査と、local-case-file.md の記述と実装実体（case-schema/case-file.md、case-schema/rules/ 配下4ファイル）との突合で完結する。docs-check ルール化は AG-009 の判断により本件の対象外とする。
    ownership_hints:
      - docs/requirements/REQ-112.md（L11、L16、L25 のコメント行）
      - docs/designs/local/local-case-file.md（L173-175、L181）
      - src/common/tools/agentdev-gh/local/case-schema/case-file.md（L33 の comment_seq 定義）
      - src/common/tools/agentdev-gh/local/case-schema/rules/（frontmatter.yaml、status.yaml、labels.yaml、headings.yaml）
    intent: 表層修正の完了を機械的に検証可能とし、docs-check ルールの要否判断を将来の独立要件に分離する。
    verification_refs: [TS-005, TS-006]
    source_items: [AG-007, AG-008, AG-009]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0230
    source_item: RU-0230
    disposition: covered
    reason_code: fully_reflected
    reason: |
      要件化の方向（実現先候補・制約・受け入れ条件）をすべて反映した。実現先は第一候補（readiness-and-cleanup.md の前置規律）と第二候補（script の分岐検出と報告 JSON detail 反映）の組合せ（CR-002）とし、git-common-procedures.md 側は手順本文不改変・参照元追記のみの RU 記載に従い ACT-DESIGN-001 編集2 の参照明記で対応した。制約（処理分岐不変、テスト追随、状態確認条項維持、remote-tracking ref 消失整合）は AG-002・TS-001・RA-001/002 に反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0230.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0231
    source_item: RU-0231
    disposition: covered
    reason_code: fully_reflected
    reason: |
      要件化の方向（手順明記と script 組込みの両面、CR-003）と制約（事後機構の前置、行末改行非依存の確認方法、既存入力検証契約）を AG-003/004・ACT-REQ-002・ACT-DESIGN-002・RA-003/004・TS-002 に反映した。RU が判断材料とした learning deferred 内の近縁エントリ（definitionEdits 重複による旧文不在 fail）は、req-define のガードレール（deferred.md 直読禁止）により本工程では直接参照せず、case 実行時の判断材料として RU 本文の参照情報で保持する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0231.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0232
    source_item: RU-0232
    disposition: covered
    reason_code: fully_reflected
    reason: |
      解決方向の2経路を CR-001 として解消（書式行追加を採用）し、適用面（GitHub・ローカル版両経路、case file title フィールド）と整合判断（REQ-100-001/-004/-005/-006、主題原則、Wave 投影、除外情報、ローカル版親番号）を AG-005・ACT-REQ-003（5編集）・ACT-DESIGN-003（6編集）に反映した。Wave 投影・REQ-100-004/006 との整合は adversarial-review で波及漏れを検出し、Epic 配下への限定編集として組込んだ。
    evidence:
      path: .agentdev/backlog/req-units/RU-0232.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0233
    source_item: RU-0233
    disposition: covered
    reason_code: fully_reflected
    reason: |
      修正方向の選択肢 (a)（system.md 側を出力契約の条件付き表記へ整合）と (b)（粒度を保った別表現）を比較し、(b) 相当の表現（記録の保存先〔外部戻り入力存在時は受領記録、直接採用時は採否記録〕）で一覧表の要約粒度を維持しつつ正本契約と整合させた（ACT-DESIGN-004）。正本（phase-artifacts-update SKILL.md 公開操作契約）は不変。波及確認は AG-010・TS-004 として case 検証に含めた。
    evidence:
      path: .agentdev/backlog/req-units/RU-0233.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0234
    source_item: RU-0234
    disposition: covered
    reason_code: fully_reflected
    reason: |
      対象（`<!-- 【必須】 -->` 3箇所の除去、本文不変）を ACT-REQ-004・TS-005 に反映した。コメント行単独の oldText はファイル内3出現で非一意のため、見出し行を含む oldText に一意化してある（adversarial-review 指摘対応、DefinitionEdit 一意性契約との整合）。明示対象外（4列要件表、ぶら下がり段落）は AG-007 に対象外として明記した。docs-check ルール候補は AG-009 の判断で本件対象外とし、RU の不変条件（独立 route としない）に従い受け入れ条件への拡張は行わなかった。
    evidence:
      path: .agentdev/backlog/req-units/RU-0234.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0235
    source_item: RU-0235
    disposition: covered
    reason_code: fully_reflected
    reason: |
      実現先（local-case-file.md の対象2箇所、記述内容不変・表現のみ現行化）を AG-008・ACT-DESIGN-005・TS-006 に反映した。RU の例示（現行形への書き換え例）に従い、comment_seq の仕様記述と case-schema 機械可読定義の構成列挙は原文どおり保持した。docs-check ルール候補は AG-009 と同様に本件対象外とした。
    evidence:
      path: .agentdev/backlog/req-units/RU-0235.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

# assembly_evidence: 局所修正・追記の組立検査証拠（assemble-draft-section v0.1.0、検査のみでリポジトリ未変更、
# heading_match: exact-after-normalization、scan_scope: 対象セクション内、全操作 pre/post checks all_ok）
# 挿入型編集（REQ 表行追加2件、covers 行2件、bullet・表行・生成例挿入5件）と traceability sidecar design ロール追加1件は
# 同 script の表現範囲外のため grep による anchor 一意性検証（各1件）を各 action content に記録した
assembly_evidence:
  - id: AE-01
    op: REQ-100 REQ-100-001 行の書式列挙置換
    target_file: docs/requirements/REQ-100.md
    target_content_sha256: 5461869aebf357bb889647abf14e4f4a05ebf9cd42cf97bfa9679014a2b3421a
    check_scope: {heading: 要件, start_line: 14, end_line: 26}
    execution_conditions: {operation: replace, edit_sha256: b4d238b24345b9e4c3b8116d8d86ed8c828c070174fd37af33d767def78fe07c, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-17T18:09:56.221Z"
  - id: AE-02
    op: REQ-100 REQ-100-005 行の例外文言置換
    target_file: docs/requirements/REQ-100.md
    target_content_sha256: 5461869aebf357bb889647abf14e4f4a05ebf9cd42cf97bfa9679014a2b3421a
    check_scope: {heading: 要件, start_line: 14, end_line: 26}
    execution_conditions: {operation: replace, edit_sha256: f677bc00146b910b17abe52786f2e95a9d98d038eab4f85f6431f681ce3ed93e, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-17T18:09:56.307Z"
  - id: AE-03
    op: REQ-100 適用範囲 対象行の書式列挙置換
    target_file: docs/requirements/REQ-100.md
    target_content_sha256: 5461869aebf357bb889647abf14e4f4a05ebf9cd42cf97bfa9679014a2b3421a
    check_scope: {heading: 適用範囲, start_line: 27, end_line: 31}
    execution_conditions: {operation: replace, edit_sha256: 558593f4ab096f1e33dd9321df6a832aeadfe6be79f9991c1ee305c38d1c8a6b, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-17T18:09:56.404Z"
  - id: AE-04
    op: REQ-112 目的節コメント行除去
    target_file: docs/requirements/REQ-112.md
    target_content_sha256: fdd3c0fb19a86d9b54a51a38cbbfe55670d9619c6a3f768a281c4b7c7edc0ce4
    check_scope: {heading: 目的, start_line: 10, end_line: 14}
    execution_conditions: {operation: replace, edit_sha256: 7d8f128700e4f6c61e9a805a0f91ea7328055914f1971adaed5cb4493259e338, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 0, removed: 1}
    executed_at: "2026-10-17T18:09:56.489Z"
  - id: AE-05
    op: REQ-112 要件節コメント行除去
    target_file: docs/requirements/REQ-112.md
    target_content_sha256: fdd3c0fb19a86d9b54a51a38cbbfe55670d9619c6a3f768a281c4b7c7edc0ce4
    check_scope: {heading: 要件, start_line: 15, end_line: 23}
    execution_conditions: {operation: replace, edit_sha256: 7ba101d4561779dc43918d07735c62118476d4ad641d42c1ac9da7f35495fe3b, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 0, removed: 1}
    executed_at: "2026-10-17T18:09:56.588Z"
  - id: AE-06
    op: REQ-112 適用範囲節コメント行除去
    target_file: docs/requirements/REQ-112.md
    target_content_sha256: fdd3c0fb19a86d9b54a51a38cbbfe55670d9619c6a3f768a281c4b7c7edc0ce4
    check_scope: {heading: 適用範囲, start_line: 24, end_line: 31}
    execution_conditions: {operation: replace, edit_sha256: c4747da64c7119c777446cae5ed49877d45cdaa54c096fa98bf2ad33ba579959, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 0, removed: 1}
    executed_at: "2026-10-17T18:11:12.912Z"
  - id: AE-07
    op: issue-title-policy 例外文言置換（タイトルから除く情報）
    target_file: docs/designs/workflows/issue-title-policy.md
    target_content_sha256: 29e758fe8e567a944eb707914da4420f992a833a5a713172002a8d7bf6c31bfe
    check_scope: {heading: タイトルから除く情報, start_line: 57, end_line: 62}
    execution_conditions: {operation: replace, edit_sha256: e2d508d5c285c5e1b7fbfc259d908443b94d77c2cbc71100d0f45d4b505cc515, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-17T18:11:13.402Z"
  - id: AE-08
    op: issue-title-policy case-ready 行の書式列挙置換（付与と更新の場面）
    target_file: docs/designs/workflows/issue-title-policy.md
    target_content_sha256: 29e758fe8e567a944eb707914da4420f992a833a5a713172002a8d7bf6c31bfe
    check_scope: {heading: 付与と更新の場面, start_line: 63, end_line: 72}
    execution_conditions: {operation: replace, edit_sha256: 683d363e4ea1c2840857d85ef872f7b0bd02a5e0f879dbef8af5d2f1896ab11f, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-17T18:12:26.706Z"
  - id: AE-09
    op: system.md 一覧表 phase-artifacts-update 行出力欄置換
    target_file: docs/designs/foundations/system.md
    target_content_sha256: 6345daecbdf8f433c0b9867f57681f2a04f1d5c0eb9453dcfbb126ce76a0c16f
    check_scope: {heading: 一覧表, start_line: 119, end_line: 146}
    execution_conditions: {operation: replace, edit_sha256: 8347787250cb1e86b4b60934dcb976b65a87135e006ea0681f64747d2e62b269, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-17T18:11:54.353Z"
  - id: AE-10
    op: local-case-file.md role 分岐節末尾段落の現行化
    target_file: docs/designs/local/local-case-file.md
    target_content_sha256: 8709c2f151a6014acdce3b13f08d6ea5a780f9b8635f7a29aadbecc725a8d5a7
    check_scope: {heading: コメント読み替えの role 分岐, start_line: 159, end_line: 176}
    execution_conditions: {operation: replace, edit_sha256: 4995d6e78e719cd6821a3fe9f3f4fcd19b7a2e12952d8bda10370bc2a2e32fd6, expected_old_count: 1}
    diff_compact: {changed_lines_count: 3, added: 1, removed: 3}
    executed_at: "2026-10-17T18:11:54.437Z"
  - id: AE-11
    op: local-case-file.md 検証節の更新方針段落の現行化
    target_file: docs/designs/local/local-case-file.md
    target_content_sha256: 8709c2f151a6014acdce3b13f08d6ea5a780f9b8635f7a29aadbecc725a8d5a7
    check_scope: {heading: role ごとの必須項目・状態値・許可操作の検証, start_line: 177, end_line: 182}
    execution_conditions: {operation: replace, edit_sha256: b7960871d057058c50b084a9b9b0c99a874b22de70c5d2715f53b8a5dd23cd3c, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-17T18:11:54.525Z"
  - id: AE-12
    op: REQ-100 REQ-100-004 行の Epic 配下への限定（adversarial-review 対応）
    target_file: docs/requirements/REQ-100.md
    target_content_sha256: 5461869aebf357bb889647abf14e4f4a05ebf9cd42cf97bfa9679014a2b3421a
    check_scope: {heading: 要件, start_line: 14, end_line: 26}
    execution_conditions: {operation: replace, edit_sha256: 422eb139967d815bd880c3b76e1f45bc230294618551a244d39c534364f8a321, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-17T18:31:32.186Z"
  - id: AE-13
    op: REQ-100 REQ-100-006 行の確定構造対応化（adversarial-review 対応）
    target_file: docs/requirements/REQ-100.md
    target_content_sha256: 5461869aebf357bb889647abf14e4f4a05ebf9cd42cf97bfa9679014a2b3421a
    check_scope: {heading: 要件, start_line: 14, end_line: 26}
    execution_conditions: {operation: replace, edit_sha256: fa418e32f5a5e35fb378ee22c07009d8aeadd69957a31942902baa1c6c14af7f, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-17T18:31:32.274Z"
  - id: AE-14
    op: issue-title-policy Wave 投影 先頭 bullet の Epic 配下限定と Case 直下併記（adversarial-review 対応）
    target_file: docs/designs/workflows/issue-title-policy.md
    target_content_sha256: 29e758fe8e567a944eb707914da4420f992a833a5a713172002a8d7bf6c31bfe
    check_scope: {heading: Wave 投影, start_line: 48, end_line: 56}
    execution_conditions: {operation: replace, edit_sha256: 5cd429a0005444a7f0a4d86b63ab584f9cf9d3b51e0adb0b7cf09896928e5ab5, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-17T18:31:32.355Z"

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: false
  decomposition: 6 OU は相互非依存で、各 OU は単一関心・少数ファイル（最大5ファイル）に収まる。OU 単位 Issue 並列構成（Epic なし）の前例（Case #3758）を参考に、case-open が単一 Issue または OU 並列構成を決定できる。script 変更を伴う OU-0001/OU-0002 は case 実行自身が TS-001/TS-002 の検証対象となる点を考慮すること。
  wave_hints:
    - 全 OU が相互非依存のため並列実行可能。ただし OU-0001 と OU-0002 はテスト実行（bun test）を伴うため、検証環境の直列化要否は case-open の判断に委ねる。
```

# summary

RU-0230〜RU-0235 の6要件単位に対応する要件ドラフト。case-ready の canonical 再取得分岐ハンドリング接続（REQ-061-052 追加、case-ready Design 更新、script 分岐検出）、case-open の DefinitionEdit 行構造事前検証（REQ-030-030 追加、case-open Design 更新、script 入力検証組込み）、Case 直下子 Issue のタイトル書式 `[Case #<親番号>] 主題` の定義（REQ-100 と issue-title-policy Design の更新）、system.md 一覧表の出力欄整合、REQ-112 のテンプレート残骸コメント除去、local-case-file.md の現行形化を、REQ 4件・Design 5件の保存操作と6個の検証戦略・6個の実現方針として構造化した。
