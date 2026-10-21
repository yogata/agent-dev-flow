---
draft_type: req_draft
topic_slug: docs-japanese-quality-correction-execution
status: draft
created_at: "2026-10-21T14:28:00+09:00"
source_rus:
  - RU-0244
---

<!-- req-define が生成した構造化引き継ぎ成果物。原本の情報源は # draft-data 内の YAML ブロック。 -->

# draft-data

```yaml
work_type: docs_chore

scale: large

summary: >-
  2026-10-21 に docs/ 配下 428 ファイル全件について実施した日本語文章品質検査の確定指摘（作業一覧 959 行）に基づき、
  既存 REQ-094（REQ-094-013 を含む）と REQ-001-017〜019 を docs へ適用して是正する。
  文章の表層の可読性を上げる一方で、意味・要件・契約・履歴を一切変えない。
  作業一覧 959 行を全件処理する（現行 857 行=確定誤記 6＋書き換え対象 738＋確認事項 113、歴史文書 102 行=確定誤記 3＋言い回し 88 対象外＋確認事項 11）。
  確定誤記として修正する行は計 9 行・対象文字列 12 箇所（現行 document-model.md 702 行「追跠」を含む。歴史文書は docmap-reference-audit.md 91・274・549 行の「下遊」→「下流」3 箇所のみ）、確認事項 124 行は照合結果に応じて修正または報告に残す。
  新規の品質基準は作らない（既存要件の適用是正・反映作業。REQ/Decision/Design の保存操作なし）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      作業一覧（.agentdev/tmp/docs-japanese-quality-worklist-2026-10-21.csv。2026-10-21 第三次訂正版〔document-model.md
      指摘行の分割・再分類を反映〕。機械集計で検証済み: 総 959 行=現行文書の指摘 857 行＋歴史文書 102 行、
      出現ファイル 376〔=428 検査ファイル−指摘なし 52〕）を全件処理の対象とすること。
      現行文書 857 行は確定誤記 6 行・書き換え対象 738 行（定型 382＋文脈依存 356）・確認事項 113 行、
      歴史文書 102 行は確定誤記 3 行・言い回し 88 行（対象外）・確認事項 11 行。
      確定誤記として修正する行は計 9 行（現行 6、歴史文書 3）で、対象文字列は合計 12 箇所であること
      （現行 docs/designs/commands/case-run.md 391 行の「候選」は同一行に 4 箇所、
      docs/designs/foundations/document-model.md 702 行の「追跠」は 1 箇所〔468・567・689 行は言い回し行であり
      確定誤記ではない。実ファイル検証済み: 「追跠」出現は 702 行のみ〕）。
      歴史文書の確定誤記は docs/reports/integrity/docmap-reference-audit.md 91・274・549 行の「下遊」を「下流」に直す
      3 箇所のみ（同ファイルの「下遊」出現は計 3 箇所と実ファイル検証済み）であること。
      実施順序は仕分けの確度順（確定誤記 → 語彙の置換〔J01 中心〕 → 文脈確認を要する書き換え〔J02/J03/J05/J06〕）とし、
      確認事項は原本・実装・過去の記録と照合し、意味が確定した後に処遇を決めること。
      着手前に、指摘のあった行が現行版でも同じ内容かを確認し、すでに変わっているものを作業一覧から除外または更新すること
      （2026-10-20 版検査と最新 main との差分確認。修正計画書〔.agentdev/tmp/docs-japanese-quality-fix-plan-2026-10-21.md〕段階 0-3、前提 §1。
      RU Source Summary が是正の全体方針の正として同計画書を参照）。
  - id: AG-002
    content: >-
      確認事項 124 行（現行文書 113 行、歴史文書 11 行）は、原本・実装・過去の記録と照合して原意を確認し、
      意味が確定した後に処遇を決めること。現行文書では、意味が確定して適用条件を保てるものだけ修正すること。
      歴史文書では、意味が分かっただけでは修正せず、読みを誤らせる確定誤記と確認できた場合のみ修正すること
      （REQ-094-013。例: docs/requirements/retired/REQ-092.md 11 行の「推送」は、確定誤記の証拠が確認できない限り修正しない）。
      文書間の不整合や仕様判断に当たるもの（REQ 番号の桁数の食い違い等）は修正せず、報告に列挙して人間判断へ残すこと。
  - id: AG-003
    content: >-
      修正の前後で REQ-094-011 の意味保全（義務の強さ・条件・適用範囲・状態・履歴）が保たれていること。
      書き換え対照（原文・修正文・理由）を記録として残すこと。
  - id: AG-004
    content: >-
      歴史文書（docs/requirements/retired/ 配下の廃止済み要件、docs/reports/ 配下の監査・実行記録、置換・廃止済みの決定文書。
      作業一覧の歴史文書列=yes）には確定誤記のみを修正すること（REQ-094-013。2026-10-21 PR #3836 で main 反映済み）。
      歴史文書の確定誤記は 3 行（docs/reports/integrity/docmap-reference-audit.md 91・274・549 行の「下遊」を「下流」に直す
      同一一字修正の 3 箇所）のみ。
      言い回し 88 行は対象外、確認事項 11 行は確定誤記と確認できない限り変更しないこと。
  - id: AG-005
    content: >-
      識別子・状態値・パス・正式名称は変更しないこと（REQ-094-006/007）。
      意味・義務の強さ・条件・適用範囲・状態・履歴を変更しないこと（REQ-094-011）。
  - id: AG-006
    content: >-
      自動生成ブロック（AUTOGEN）の生成物を直接編集しないこと。生成元（文書のメタデータ・本文）か生成処理（generate_indexes）の
      どちらを直すのかを特定して対応すること。特定・対応が今回の範囲で完了しないものは直接編集せず報告に残すこと。
  - id: AG-007
    content: >-
      語彙の置換対応は、語彙レジストリ実体対照表（docs/designs/authoring/vocabulary-registry.md）への登録と
      機械検査（textlint）の検出対象追加（プロジェクト用語 prh 辞書）を含むこと（REQ-094-012: 一括修正のみで完了しない）。
      固定置換は REQ-094-009 の安全基準（文脈によって意味の変わらない語に限定）に従うこと。
  - id: AG-008
    content: >-
      対象外とすること: src/ 配下の Markdown（今回の検査・作業一覧に含まれない）、指摘のなかった 52 ファイルの逐語校閲、
      コード（src/**/*.ts 等）の変更、新規の検査機構の実装（textlint 規則の追加は語彙対照表への登録と
      プロジェクト用語 prh 辞書の範囲に限る）。
  - id: AG-009
    content: >-
      textlint 最終検査（agentdev-textlint-guard gate.ts、用途=最終検査）が ok=true であること。
      索引を再生成し、差分が意図した修正の範囲に収まること。
      修正前に機械検査を 1 回実行して現状を記録し、既知の違反と今回の修正で増える違反を区別できること
      （修正計画書段階 0-5。受け入れ条件 6 の判定基準として必要）。
  - id: AG-010
    content: >-
      作業一覧 959 行すべてについて、実施済み・修正対象外・確認事項として報告に残す、のいずれかの処遇が件数一致で記録されていること。
      確定誤記 9 行（対象文字列 12 箇所）と書き換え対象 738 行を処理し、確認事項 124 行は照合後に修正または報告へ残すこと。
      歴史文書の言い回し 88 行は修正しないこと。文書間不整合・仕様判断案件が修正されず、報告に列挙されていること。
      完了報告では、自ツールの検査結果と利用者が確認する面を区別して述べること（修正計画書段階 5-4）。

artifact_actions: []
# REQ/Decision/Design への保存操作なし（既存 REQ-094・REQ-001-017〜019 の適用是正・反映作業。
# Jev 先行評価 2 件〔既存REQ照合・最終分類〕とも REQ操作なし・反映作業帰属で確定。第三次訂正版入力で再評価済み
# 〔20261021T065536Z-a612・20261021T065536Z-6066〕）。
# 後続工程の分岐は artifact_actions の不在により direct_case（REQ 保存なし・設計PRなし）となる。

conflict_resolutions:
  - id: CR-001
    conflict: >-
      RU-0244 frontmatter の agentdev_handoff: true と、本件を現在プロジェクトの通常要件doc（docs_chore）として
      定義することの関係。
    resolution: >-
      対象は docs/ 配下（現行プロジェクト文書）の日本語文章品質是正であり、AgentDevFlow 本体・配布 command/skill/template/script
      の不具合・改善点（配布物改善）ではないため、draft への agentdev_handoff: true は引き継がない。
      RU の同フラグは session 由来 RU 生成契約（generation_stage: pre-req-define の supervisor による引継ぎ生成）の記録であり、
      RU 8 セクションが所有する合意内容（対象・対象外・決定的受け入れ条件）には影響しない。
  - id: CR-002
    conflict: 歴史文書を修正対象に含めるか（修正計画書の判断点①）。
    resolution: >-
      利用者の確定判断（2026-10-21）により「確定誤記のみ直す」。読みを誤らせる字面の誤りだけを修正し、言い回しの改善はしない。
      REQ-094-013 として main 反映済み（ac5cbbbfa、PR #3836）。後続コマンドは同じ内容をユーザーへ再確認しない。
  - id: CR-003
    conflict: 進行の単位（修正計画書の判断点②）。
    resolution: >-
      利用者の確定判断（2026-10-21）により「確度順の段階方式」（誤記 → 語彙 → 文脈依存の書き換え）。
      後続コマンドは同じ内容をユーザーへ再確認しない。
  - id: CR-004
    conflict: 手順（修正計画書の判断点③）。
    resolution: >-
      利用者の確定判断（2026-10-21）により「本修正計画を要件化（RU 化）してから実行する」。本 draft がその要件化に当たる。
      後続コマンドは同じ内容をユーザーへ再確認しない。
  - id: CR-005
    conflict: >-
      2026-10-21 の仕分け計数訂正（RU-0244 修正版と作業一覧 CSV 更新）による旧集計との食い違い。
      旧: 実施対象 867 行（現行 856＋歴史文書確定誤記 11）、確認事項 119 行（現行 109＋歴史 10）、
      歴史文書言い回し系 89 行、指摘なしファイル約 150。
    resolution: >-
      訂正版（RU-0244 修正版・更新後 CSV。機械集計で検証済み）を正とする: 現行 856 行=確定誤記 6＋書き換え対象 737＋確認事項 113、
      歴史文書 100 行=確定誤記 1（docs/reports/integrity/docmap-reference-audit.md 549 行「下遊」→「下流」のみ）＋言い回し 88（対象外）
      ＋確認事項 11、確定誤記として修正する行は計 7 行、確認事項は 124 行（現行 113＋歴史 11）、指摘なし 52 ファイル。
      後続コマンドは同じ内容をユーザーへ再確認しない。
  - id: CR-006
    conflict: >-
      2026-10-21 の第二次訂正（歴史文書 docs/reports/integrity/docmap-reference-audit.md の原本確認により、
      同ファイルの「下遊」誤記が 91・274 行にも存在することが追加検出された）。第一次訂正後の計数
      （総 956 行、確定誤記 7 行・歴史文書 1 行〔549 行のみ〕）は本訂正により置き換えられる。
    resolution: >-
      第二次訂正版（RU-0244 修正版・更新後 CSV。機械集計と実ファイル検証済み: 同ファイルの「下遊」出現は 91・274・549 行の計 3 箇所）を正とする:
      総 958 行=現行 856＋歴史文書 102、確定誤記として修正する行は計 9 行（現行 6、歴史文書 3）で対象文字列は合計 12 箇所
      （docs/designs/commands/case-run.md 391 行の「候選」4 箇所を含む）。CR-005 の計数は旧集計として改訂履歴に保持する。
      後続コマンドは同じ内容をユーザーへ再確認しない。
  - id: CR-007
    conflict: >-
      2026-10-21 の第三次訂正（docs/designs/foundations/document-model.md の取りまとめ指摘行の分割・再分類）。
      第二次訂正後の計数（総 958 行、現行 856 行=誤記 6＋書き換え 737＋確認 113、document-model.md の確定誤記は 468 行と配置）
      は本訂正により置き換えられる。
    resolution: >-
      第三次訂正版（RU-0244 修正版・更新後 CSV。機械集計と実ファイル検証済み）を正とする: document-model.md の指摘は
      J01 書き換え対象-定型の取りまとめ行（468・567・689・702 行）、J07 言い回し行（468・567・689 行。うち 567・689 の
      2 行は前版で J07 言い回し対象外だった追加取り込み）、J07 確定誤記行（702 行「追跠」1 箇所のみ。実ファイル検証済み:
      「追跠」出現は 702 行のみ、468・567・689 行になし）へ分割。結果、書き換え対象 737→738 行、現行 856→857 行、
      総 959 行。確定誤記は計 9 行・12 箇所で不変（document-model.md の誤記行配置が 468→702 へ訂正）。
      CR-005・CR-006 の計数は旧集計として改訂履歴に保持する。後続コマンドは同じ内容をユーザーへ再確認しない。
  - id: CR-008
    conflict: >-
      2026-10-21 の事実訂正。draft の調整事項が「REQ-094.md は本 Case では適用基準であり編集対象ではない」と記載していたが、
      現行作業一覧（順序 387: docs/requirements/REQ-094.md 20 行、J02、書き換え対象-文脈依存）により同ファイルは編集対象である。
    resolution: >-
      作業一覧を行権威として、docs/requirements/REQ-094.md 20 行（REQ-094-003 行の J02 書き換え）を本 Case の修正対象とする
      （対象から除外しない。計数・仕分けは不変: 現行 857 行の書き換え対象 738 行に当初から含まれる）。
      同ファイルは PR #3837（6 行付近への ADF-COVERS implementation marker 追加のみ。利用者が worktree diff で確認済み）でも
      変更されており、変更行は異なるが、当該ファイルを編集する Case は PR #3837 の状態を読み戻し、marker を保全した上で
      （preserve / merge / rebase）本 Case の修正を適用すること。REQ-094-011 の意味保全は他行と同様に適用する。
      後続コマンドは同じ内容をユーザーへ再確認しない。
  - id: CR-009
    conflict: >-
      2026-10-21 の行参照訂正。第三次訂正時点の作業一覧で document-model.md の J01 書き換え対象-定型行は
      「468・567・689・702 行」の取りまとめ行として記録されていたが、現行作業一覧の同行の正確な対象行は
      22・24・41・49・188・193・253・255・273・324・325・328・329・330・333・409・654・656・663・667・683 行である。
    resolution: >-
      現行作業一覧を行権威として、document-model.md の J01 行の対象行を上記 21 行の一覧へ訂正する
      （言い回しのみの行であり、J07 言い回し行〔468・567・689 行〕および J07 確定誤記行〔702 行〕とは別行）。
      CR-007 の「468・567・689・702 行を含む J01 取りまとめ行」の記述は当時の作業一覧の記録として改訂履歴に保持する。
      計数（総 959 行・現行 857・書き換え 738・確定誤記 9 行 12 箇所）・仕分け・対象範囲はすべて不変。
      後続コマンドは同じ内容をユーザーへ再確認しない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0244
    # REQ/Design 保存操作なし（direct_case）。artifact_actions が空のため target_req/target_design/operation の
    # REQ 操作値は設定しない（REQ-094・REQ-001-017〜019 は更新対象ではなく適用基準）。
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      作業一覧 CSV（959 行）を読み込み、着手前差分確認の結果（除外・更新の記録）を突合する。
      959 行全行の処遇記録（実施済み/修正対象外/確認事項として報告残留）を集計する。
      処理行 747 行（確定誤記 9＋書き換え対象 738、確定誤記の対象文字列は合計 12 箇所）の実施の記録（書き換え対照・コミット）が
      確度順（確定誤記 → J01 語彙 → J02/J03/J05/J06 文脈確認）に従っていることを確認する。
    pass_criteria: >-
      処遇記録の件数が 959 行と件数一致している（着手前差分確認で除外・更新した行はその記録により置き換えられて説明されている）。
      確定誤記 9 行（12 箇所）と書き換え対象 738 行が処理済みである。
      実施順序が確度順に従っている、または意思のある逸脱が記録されている。
    on_failure: >-
      fix-and-reverify。未実施・記録漏れの行を特定して実施し、処遇記録を修正の上 再集計する。
      着手前差分確認により意図的に除外した行は除外記録として残す。
  - id: TS-002
    target_item: AG-002
    verification: >-
      確認事項 124 行（現行 113 行＋歴史文書 11 行）の処遇を、照合根拠（原本・実装・過去の記録のどれで意味を確定したか）と
      ともに処遇記録から確認する。歴史文書 11 行の処遇が「確定誤記と確認できた場合を除き不変」になっていることを確認する。
      文書間不整合・仕様判断案件の列挙を報告で確認する。
    pass_criteria: >-
      124 行全行に処遇（修正実施 or 報告残留）が付いている。歴史文書行は確定誤記と確認できた行を除き修正されていない。
      文書間不整合・仕様判断案件は修正されず報告に列挙されている。
    on_failure: >-
      fix-and-reverify。修正し過ぎた行は意味保全を確認の上 差し戻す。未処遇の行は照合を実施して処遇を確定する。
  - id: TS-003
    target_item: AG-003
    verification: >-
      書き換え対照（原文・修正文・理由）が実施した全修正行について記録されていることを確認する。
      抽出した複数ファイルについて、対照の原文が修正前コミットの実文と一致することを突合する。
    pass_criteria: >-
      対照記録が実施分を網羅し、義務の強さ・条件・適用範囲・状態・履歴の変化を含む修正が 0 件である。
    on_failure: >-
      fix-and-reverify。意味変化を検出した行は元の意味を保持する修正へやり直し、対照記録を更新する。
  - id: TS-004
    target_item: AG-004
    verification: >-
      処遇記録の歴史文書行（歴史文書列=yes、100 行）の処遇を確認し、変更差分に現れた歴史文書ファイルの修正行を抽出する。
    pass_criteria: >-
      歴史文書の修正が確定誤記 3 行（docs/reports/integrity/docmap-reference-audit.md 91・274・549 行「下遊」→「下流」の 3 箇所）のみである。
      言い回し 88 行は不変であり、確認事項 11 行は確定誤記と確認できた行を除き不変である。
    on_failure: >-
      fix-and-reverify。確定誤記以外の歴史文書変更を差し戻し、処遇記録を修正する。
  - id: TS-005
    target_item: AG-005
    verification: >-
      書き換え対照と変更差分から、識別子・状態値・パス・正式名称（コマンド名・Skill 名・API 名・YAML/JSON キー・列挙値・
      環境変数・ファイル名・コード上の識別子・外部製品・サービス・標準仕様の正式名称）の変更が 0 件であることを確認する。
    pass_criteria: 該当する変更が 0 件である。
    on_failure: >-
      fix-and-reverify。検出した変更を原表記へ復元し、対照記録を更新する。
  - id: TS-006
    target_item: AG-006
    verification: >-
      AUTOGEN ブロック（AUTOGEN:BEGIN/END で囲まれた領域）の差分を抽出し、生成処理（索引再生成）による差分のみで
      あることを確認する。生成物への手書き差分の有無を確認する。
    pass_criteria: >-
      AUTOGEN ブロックへの手書き差分が 0 件（差分は再生成によるもののみ）である。
      生成元・生成処理の特定が今回の範囲で完了しない案件は直接編集されず報告に残っている。
    on_failure: >-
      fix-and-reverify。直接編集を差し戻し、生成元または生成処理を修正して再生成する。
  - id: TS-007
    target_item: AG-007
    verification: >-
      語彙レジストリ実体対照表（docs/designs/authoring/vocabulary-registry.md）への登録内容と
      プロジェクト用語 prh 辞書（src/opencode/plugins/agentdev-textlint-guard/rules/default-prh.yml）の追加内容を確認する。
      textlint を実行し、追加した語彙が検出可能であることを確認する。
    pass_criteria: >-
      実施した語彙置換の対応が対照表に登録され、機械検査の検出対象に追加されている。
      固定置換は REQ-094-009 の安全基準（文脈によって意味の変わらない語に限定）に従っている。
    on_failure: >-
      fix-and-reverify。登録漏れの語彙を登録し、安全基準外の固定置換を規則から除去して再検証する。
  - id: TS-008
    target_item: AG-008
    verification: >-
      変更差分のファイル一覧が src/ 配下（prh 辞書を除く）を含まないこと、作業一覧の指摘なしファイルへの
      意図しない変更がないこと（索引再生成等の派生変更を除く）を確認する。
      textlint 規則の追加が prh 辞書の範囲に収まっていることを確認する。
    pass_criteria: >-
      src/ 配下の変更が prh 辞書（default-prh.yml）以外 0 件である。指摘なしファイルへの非派生変更が 0 件である。
    on_failure: >-
      fix-and-reverify。範囲外の変更を差し戻し、差分一覧を再確認する。
  - id: TS-009
    target_item: AG-009
    verification: >-
      agentdev-textlint-guard gate.ts（用途=最終検査）を実行する（実行には plugin 依存の事前生成が必要。
      src/opencode/plugins/agentdev-textlint-guard/ で bun install && bun run build:engine）。
      索引を再生成し差分を確認する。修正前に記録した機械検査の現状記録と比較し、新規違反の有無を確認する。
    pass_criteria: >-
      gate.ts が ok=true である。索引差分が意図した修正の範囲に収まる。既知違反の基準記録分を除き新規違反が 0 件である。
    on_failure: >-
      fix-and-reverify。違反を修正して再実行する。生成処理起因の場合は生成元を修正し再生成する。
  - id: TS-010
    target_item: AG-010
    verification: >-
      件数一致の処遇記録（作業一覧 959 行すべて）と完了報告（文書間不整合・仕様判断案件の列挙、
      自ツールの検査結果と利用者が確認する面の区別）の完備を確認する。
    pass_criteria: >-
      959 行すべての処遇（実施済み・修正対象外・確認事項として報告残留）が件数一致で記録されている。
      報告に列挙事項と利用者の確認手段が明記されている。
    on_failure: >-
      fix-and-reverify。処遇記録・報告を補完して再確認する。

realization_actions:
  - id: RA-001
    concern: docs/ 現行文書の指摘修正（857 行）と確認事項の照合・修正
    responsibility: >-
      docs/ 配下の現行文書（要件・Decision・Design・ガイド等）について、作業一覧の指摘に基づく表層修正を
      意味保全（REQ-094-011）の下で実施する。各文書の正規所有権は既存の文書種別責務のまま変更しない。
    ownership_hints:
      - ".agentdev/tmp/docs-japanese-quality-worklist-2026-10-21.csv（作業一覧。個別指摘の原文・行番号の正）"
      - "docs/designs/responsibilities/document-type-responsibilities.md（用語政策節）"
      - "docs/requirements/REQ-094.md（是正の基準。REQ-001-017〜019 を含む適用基準）"
    intent: 文章表層の可読性向上（意味・契約・履歴は不変）
    verification_refs:
      - TS-001
      - TS-002
      - TS-003
      - TS-005
    source_items:
      - AG-001
      - AG-002
      - AG-003
      - AG-005
  - id: RA-002
    concern: 歴史文書の確定誤記修正（3 行・3 箇所）
    responsibility: >-
      docs/requirements/retired/、docs/reports/、置換・廃止済みの決定文書について、確定誤記のみを修正する（REQ-094-013）。
      修正は docs/reports/integrity/docmap-reference-audit.md 91・274・549 行「下遊」→「下流」の 3 行（3 箇所）のみ。
      言い回し 88 行は対象外、確認事項 11 行は確定誤記と確認できない限り変更せず、処遇記録へ残す。
    ownership_hints:
      - ".agentdev/tmp/docs-japanese-quality-worklist-2026-10-21.csv（歴史文書列=yes の行）"
    intent: 読みを誤らせる字面の誤りのみ是正し、歴史記録の内容は不変とする
    verification_refs:
      - TS-004
    source_items:
      - AG-004
  - id: RA-003
    concern: 語彙レジストリ実体対照表への登録と prh 辞書への検出対象追加
    responsibility: >-
      語彙置換の対応を docs/designs/authoring/vocabulary-registry.md（語彙レジストリ実体対照表）へ登録し、
      src/opencode/plugins/agentdev-textlint-guard/rules/default-prh.yml（プロジェクト用語 prh 辞書）へ検出対象を追加する
      （REQ-094-012 の継続適用仕組み）。登録する個別語彙対は実行時に確定する。
    ownership_hints:
      - "docs/designs/authoring/vocabulary-registry.md"
      - "src/opencode/plugins/agentdev-textlint-guard/rules/default-prh.yml"
      - "docs/designs/responsibilities/document-type-responsibilities.md（用語政策節）"
    intent: 一括修正のみで完了しない再発防止（機械検査での検出を可能にする）
    verification_refs:
      - TS-007
    source_items:
      - AG-007
  - id: RA-004
    concern: 索引の再生成と AUTOGEN 整合の維持
    responsibility: >-
      AUTOGEN ブロック（README 索引等）を生成処理（generate_indexes）で再生成し、差分が意図した修正の範囲に収まることを
      確認する。生成物の直接編集は行わない。生成元・生成処理の特定が範囲内で完了しない案件は報告へ残す。
    ownership_hints:
      - "docs/designs/integrity/index-auto-generation.md（索引類自動生成 Design）"
      - "docs/README.md、docs/requirements/README.md、docs/decisions/README.md、docs/designs/README.md（AUTOGEN 対象）"
    intent: 修正に伴う索引の追従と、生成元と生成物の整合維持
    verification_refs:
      - TS-006
      - TS-009
    source_items:
      - AG-006
      - AG-009
  - id: RA-005
    concern: textlint 最終検査の実行環境条件と基準記録
    responsibility: >-
      textlint 最終検査（agentdev-textlint-guard gate.ts、用途=最終検査）の実行には plugin 依存の事前生成
      （src/opencode/plugins/agentdev-textlint-guard/ で bun install && bun run build:engine）が必要である。
      修正前に機械検査を 1 回実行して現状を記録し、既知違反と新規違反を区別する。検査実行の正は textlint 共通基盤。
    ownership_hints:
      - "docs/designs/quality/textlint-quality-runtime.md（検査実行の正）"
      - "README.md 開発者セットアップ節（依存生成手順）"
    intent: 検証の実行可能性（production-equivalent verification）と新規違反 0 件判定の基準確保
    verification_refs:
      - TS-009
    source_items:
      - AG-009

review_dispositions:
  - id: RD-001
    source_ru: RU-0244
    source_item: "RU-0244（logical_key: docs-japanese-quality-correction-execution）"
    disposition: covered
    reason_code: agreed_and_structured
    reason: >-
      RU 全体（必須 8 セクション。2026-10-21 第三次訂正版）を draft の agreed_items・conflict_resolutions・realization_actions・
      case_open_hints へ構造化して反映した。合意内容・対象・対象外・決定的受け入れ条件は省略・弱化・反転していない
      （第三次訂正版 CSV 機械集計により件数を検証済み: 959 行=現行 857〔誤記 6＋書き換え 738＋確認 113〕＋歴史文書 102〔誤記 3＋言い回し 88＋確認 11〕、
      処理行 747〔誤記 9・12 箇所＋書き換え 738〕、確認事項 124 行、指摘なし 52 ファイル）。
    evidence:
      path: ".agentdev/backlog/req-units/RU-0244.md"
      section: 全体（8 セクション）
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []
# 局所修正・追記の組立対象（artifact_actions の append/update）なし。

case_open_hints:
  epic_needed: false
  decomposition: >-
    単一 OU（単独根のため Standard flow）。実行は修正計画書の段階構成を参考にする:
    段階 0（着手前差分確認・仕分け確認・機械検査の現状記録） → 段階 1（確定誤記） → 段階 2（語彙の置換と対照表登録） →
    段階 3（文脈確認を要する書き換え。ディレクトリ単位バッチ、requirements → decisions → designs → guides/knowledge → reports の
    優先順位） → 段階 4（自動生成部分） → 段階 5（最終検証）。
    段階分割・並列実行・コミット粒度は RU が Case の実装計画へ委譲しており、単一 Issue 内のバッチ実行か Epic 分割かは
    case-open が実行契約で決定する。
  wave_hints: []
  input_dependencies: >-
    作業一覧 CSV と修正計画書は .agentdev/tmp/ 配下の実行中データ（コミットしない。RU 依存関係節）。
    是正完了後に削除してよいが、Case 実行中は保持すること。処遇記録・書き換え対照・完了報告は Case の PR・Issue・
    完了報告経路（case-close）に残す。
  coordination_notes: >-
    利用者提供情報（2026-10-21、req-define 再検証時点で最新化）: Case #3835 は closed（2026-10-21T22:40:33+09:00）、
    PR #3837 は main へマージ済み（squash merge 2f7e1a14c）。docs/requirements/REQ-094.md は本 Case の対象領域（docs/**）と
    重複する編集対象であること（作業一覧 順序 387: REQ-094-003 行、J02、書き換え対象-文脈依存。対象から除外しない）。
    PR #3837 の ADF-COVERS(implementation) marker は main の REQ-094.md 8 行目に取り込み済みであり、この挿入により
    REQ-094-003 行は作業一覧作成時の 20 行から 22 行へ移動している。当該ファイルを編集する Case は、着手前差分確認（AG-001）で
    最新の行位置を特定し、marker を削除しないこと。Case #3835 の QG-4 判断（REQ-094-013 の検証義務の形式）は利用者判断として
    REQ-103 先例形式（policy optional 登録 + 一回限り検証 sidecar・記録）で確定・適用済み（判断変更記録: Issue #3835
    コメント 6316714690）であり、本 Case への未解決の制約は残っていない。
    作業一覧上の docs/designs/foundations/document-model.md 指摘は、J01 書き換え対象-定型の取りまとめ行
    （22・24・41・49・188・193・253・255・273・324・325・328・329・330・333・409・654・656・663・667・683 行。
    責務マトリックス等の語彙を中心とする言い回しのみの行）、J07 言い回し行（468・567・689 行）、
    J07 確定誤記行（702 行「跠」1 箇所のみ）の 3 行として分割されている
    （実ファイル検証済み。「跠」出現は 702 行のみ、正表記は「追跡」。行番号・行分類の正は作業一覧 CSV）。
```

# summary

本 draft は RU-0244（2026-10-21 supervisor 保存、合意確定済み、同日第三次訂正版）を要件化したものである。docs/ 全体の日本語文章品質是正を、既存 REQ-094（REQ-094-013 含む）と REQ-001-017〜019 の適用として実行する（新規の品質基準は作らない。REQ/Decision/Design の保存操作なし、direct_case 経路）。

- 作業一覧 959 行を全件処理（現行 857=確定誤記 6＋書き換え対象 738＋確認事項 113、歴史文書 102=確定誤記 3＋言い回し 88 対象外＋確認事項 11）。確定誤記として修正する行は計 9 行・対象文字列 12 箇所（case-run.md 391 行「候選」4 箇所、document-model.md 702 行「跠」→「追跡」1 箇所を含む。468・567・689 行は言い回し行で確定誤記ではない）。歴史文書は docmap-reference-audit.md 91・274・549 行「下遊」→「下流」の 3 箇所のみ（実ファイル検証済み）。
- 確認事項 124 行（現行 113＋歴史 11）: 現行は意味確定かつ適用条件保持なら修正、歴史は読みを誤らせる確定誤記と確認できた場合のみ修正（retired/REQ-092.md 11 行「推送」は証拠確認まで修正しない）。指摘のなかった 52 ファイルの逐語校閲は対象外。
- 意味保全（REQ-094-011）と書き換え対照の記録、識別子・正式名称の不変（REQ-094-006/007）を遵守する。
- 語彙置換は対照表登録と prh 辞書追加までを含む（REQ-094-012）。AUTOGEN 生成物の直接編集は禁止。
- 最終検査は textlint gate.ts（ok=true）と索引再生成差分で判定する。

改訂経緯: ①第一次訂正（CR-005。旧: 実施対象 867 行・確認事項 119 行・歴史言い回し 89 行・指摘なし約 150 ファイル → 956 行体系〔処理行 744〕・確認事項 124 行・言い回し 88 行・指摘なし 52 ファイル）②第二次訂正（CR-006。docmap-reference-audit.md 原本確認により 91・274 行の「下遊」を追加検出。956/誤記 7 行/歴史 1 行 → 958 行/誤記 9 行〔12 箇所〕/歴史 3 行、処理行 746）③第三次訂正（CR-007。document-model.md の取りまとめ指摘行を言い回し行〔468・567・689〕と確定誤記行〔702「跠」〕へ分割。958/書き換え 737 → 959 行/書き換え 738、処理行 747。誤記は 9 行・12 箇所で不変）④事実訂正（CR-008。REQ-094.md 20 行〔順序 387〕が編集対象であることを調整事項へ反映。PR #3837 は同ファイルの別行変更のため編集前に状態を読み戻し marker を保全して重ねる。計数・仕分けは不変）⑤行参照訂正（CR-009。document-model.md J01 行の対象行を 21 行一覧〔22〜683 行〕へ訂正。計数・仕分け・対象範囲は不変）。旧計数・旧行参照は改訂履歴（CR-005〜CR-009）にのみ保持。既存 draft を同一ファイルで更新（2 つ目の RU/draft は作成していない）。

STEP-8 adversarial-review は初回（2 独立ストリーム 対論、convergence audit 完了）と第一次〜第三次訂正の差分に絞った再審議を実施済み。反映内容: AG-002 の歴史文書確認事項に対する REQ-094-013 準拠の限定、AG-009 への修正前機械検査現状記録の追加、AG-001 の着手前差分確認の出典明示、case_open_hints の入力依存・調整事項（Case #3835 blocked／PR #3837 の REQ-094.md 重複／document-model.md 指摘行の分割分類）の記録、処遇3分類（実施済み・修正対象外・確認事項として報告残留）・「推送」例示の反映。撤回: 報告保存先の AG 化（case-close 標準経路へ委譲）。Case #3835 の QG-4 判断は本 draft では推測も迂回もしない。

Jev 先行評価 2 件（既存REQ照合・要件展開分類）は REQ操作なし・反映作業帰属で確定。観測: 初回 20261021T052406Z-447c・20261021T052538Z-5435、第一次訂正版 20261021T060722Z-5c26・20261021T061048Z-23d6、第二次訂正版 20261021T063839Z-adb3・20261021T063839Z-2a01、第三次訂正版 20261021T065536Z-a612・20261021T065536Z-6066（.agentdev/jev-observations/）。

再検証（2026-10-21 req-define 再実行、Case #3835 完走後）: RU-0244 本体（合意確定済み、第三次訂正版）との全計数突合を機械集計で再実施し、総 959 行＝現行 857〔確定誤記 6＋書き換え対象-定型 382＋文脈依存 356＋確認事項 113〕＋歴史文書 102〔確定誤記 3＋言い回し対象外 88＋確認事項 11〕、出現ファイル 376（＝428−52）すべて一致。主要対象の main 上の実在を確認（docmap-reference-audit.md 91・274・549 行「下遊」3 箇所、document-model.md 702 行「跠」1 箇所、case-run.md 391 行「候選」同一行 4 箇所、REQ-094.md 8 行 marker・32 行 REQ-094-013）。coordination_notes の Case #3835・PR #3837 の状態記述のみ最新化（closed・マージ済みへ。REQ-094-003 行は 20→22 行へ移動、着手前差分確認で特定）。合意内容・計数・仕分け・要件行・test_strategy は不変でそのまま採用。
