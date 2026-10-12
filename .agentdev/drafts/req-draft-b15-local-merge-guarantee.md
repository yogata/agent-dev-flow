---
draft_type: req_draft
topic_slug: b15-local-merge-guarantee
status: draft
created_at: 2026-10-13T05:59:29+09:00
---

<!-- req_draft 形式。Case #3654 (Epic: 工程遷移と変更駆動経路の併存) の B15 (TS-012) 受入検証で
 発見されたローカル版マージ取り込み保証の未達を是正する、既存合意条件のみの引き継ぎ draft である。
 新規要求・新規範を含まない (監督指示 2026-10-13: 元 req-define → case-auto の未達処理)。 -->

# draft-data

```yaml
work_type: fix

scale: standard

summary: |-
  Case #3654 の B15 (TS-012) 受入検証において、ローカル版マージ取り込み保証が既存合意 (REQ-009-033、local-case-file Design「マージ結果の記録方針」、RU-0002 B15 合格条件) に届かないことが実証された (検証用 consumer 環境での観測: pr_merge がローカル Git 取り込みの実在を確認せず merged:true を返却、必須記録項目のコミットハッシュを記録しない、ローカル版 case-close の取り込み実行手順が workflow に不在。これにより B15 の不合格反例「Local記録PASSだがGit変更が存在しない」が拒否されない)。
  本 draft は上記未達の是正のみを対象とし、REQ/Decision の変更を含まない。Design (local-case-file) への 1 文の明確化 (Tool の VERIFY 範囲) を伴うが、これは既存「マージ結果の記録方針」節の実装手段の明確化であり、実装修正に内包して処理する。
  是正の分岐成果 (PR #3669、fix/issue-3654、6 コミット) は既に存在し、正規工程 (case-run) で受領する。工程確立の読み戻しまで PR の統合を保留している。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      B15 合格条件 (RU-0002 原文、変更なし): 4操作と工程遷移が両版の正規利用経路から実行可能であり、Local の成功報告を実Git結果なしに確定しない。不合格反例「Local記録PASSだがGit変更が存在しない」が拒否されること。
  - id: AG-002
    content: |-
      REQ-009-033 (既存、変更なし): マージ結果セクションにローカルGit上の取り込み結果を記録し、失敗、未完了時は status を blocked に更新する。
  - id: AG-003
    content: |-
      local-case-file Design「マージ結果の記録方針」(既存、変更なし): 取り込みの実行主体はローカル版 case-close (GitHub PR 取り込みは実行しない)。必須記録項目は実行した操作、関連するコミットハッシュ、実行日時、結果。Tool は記録に際し関連コミットハッシュのローカル Git 実在を確認 (VERIFY) する。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/local/local-case-file.md
    target_design:
      operation: update
      domain: local
      slug: local-case-file
    target_area: マージ結果の記録方針（role: case）
    source_items: [AG-003]
    content: |-
      【更新要綱】「マージ結果の記録方針」節へ 1 文追加: ローカル版 Tool はマージ結果の記録に際し、関連コミットハッシュのローカル Git 上の実在を確認（VERIFY）してから記録する。実在しないコミットハッシュでは記録せず失敗する。既存契約の実装手段の明確化であり、新規範を追加しない。分岐成果 PR #3669 (コミット 4ecef050) で実施済み、case-run で受領する。

operation_units: []

result: {}

realization_actions:
  - id: RA-001
    title: ローカル版マージ取り込み保証の実装修正
    responsibility: |-
      runner-local.ts prMerge の commitHash 必須化とコミット実在 VERIFY (git cat-file -t、引数配列呼出、シェル不使用、fail-closed)、マージ結果レコードへのコミットハッシュ・ブランチ情報記録、case-close workflow (pr-merge-and-conflict reference へのローカル版取り込み手順節 + SKILL 最小言及) の追記 (取り込み実行主体=case-close、ハッシュ実測、失敗・未完了時 blocked + ## 残課題)、local/README.md の Design 整合 (旧記述「status は active のまま維持」の REQ-009-033 との矛盾解消を含む)、ガイド (consumer-project-setup.md、glossary.md) の旧パス (src/opencode-local/) 是正、テスト追加 (欠落拒否・実在 PASS 記録・不在拒否とファイル未変更・二重記録拒否)。
    intent: AG-001、AG-002、AG-003 を実装で成立させる。
    existing_work: |-
      分岐成果として実施済み: PR #3669 (base=main, head=fix/issue-3654)、コミット ff5564a3 / 19cfa730 / 110fb74f / 5e067352 / 4ecef050 / 138bae25、検証 46+154 pass・typecheck 0・配布境界 (変更由来) 0・textlint (変更分) 0。工程確立の読み戻しまで統合を保留中。case-run で当該成果を受領し、不足があれば再開する。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002, AG-003]

test_strategy:
  - id: TS-001
    target_item: AG-003（Tool のコミット実在 VERIFY、必須記録項目）
    verification: bun test src/common/tools/agentdev-gh/local/ を実行し、commitHash 欠落拒否・実在コミットで PASS 記録 (ハッシュ記録込み)・存在しないコミットで拒否かつファイル未変更・二重記録拒否を確認する。
    pass_criteria: 全テスト pass。実在しないコミットハッシュでは何も書き込まれない (fail-closed)。
    on_failure: fix-and-reverify
  - id: TS-002
    target_item: AG-001（B15 不合格反例の拒否）
    verification: 隔離検証環境 (temp 内検証用リポジトリ) で B15 の不合格反例を再実証する。(i) ローカル Git 上に取り込みを実行しコミットハッシュを実測して pr_merge へ渡した場合は merged:true とハッシュ記録が成立すること。(ii) 取り込みを行わず (実在しないコミットハッシュで) pr_merge を呼んだ場合は operation-failed で拒否されローカルIssueファイルが未変更であること。(iii) 任意の既存コミットを渡す構成では、case-close のローカル版手順が対象変更の取り込み結果 (コミット内容) との意味上の突合を含むこと。(iv) case-close ローカル版手順に従った失敗時は status blocked と ## 残課題記録で完了扱いにしないこと。証拠を C:/Users/ogatay/AppData/Local/hermes/cache/scratch/ 配下へ保存する。
    pass_criteria: 不合格反例「Local記録PASSだがGit変更が存在しない」が構造的に拒否されること。GitHub 版の挙動に影響しないこと。
    on_failure: fix-and-reverify
  - id: TS-003
    target_item: RA-001（検証スイートの再実行）
    verification: bun test src/common/tools/agentdev-gh/ (契約テスト含む)、typecheck、配布境界 checker (--profile source、変更由来違反 0)、textlint (変更 md) を実行する。
    pass_criteria: 変更由来の違反 0。pre-existing 違反は変更外として区別記録する。
    on_failure: fix-and-reverify

case_open_hints:
  epic_needed: false
  decomposition: |-
    実装修正のみの standard Case として確立する (文書系の操作単位なし、realization_actions RA-001 を実装単位とする)。既存 Root Case #3654 は closed (終端状態) であり再オープンしない。本 draft は B15 未達是正のための独立 standard Case として Root Case を新規確立する (元 req-define → case-auto の未達処理であり、別 Root の乱造ではない)。Definition 段階の実変更は Design 1 文の明確化 (ACT-DESIGN-001、実装修正に内包、分岐成果 4ecef050 で実施済み) のみであり、case-open は既存分岐成果との重複 PR を作成しない。分岐成果 PR #3669 (fix/issue-3654) は case-run で受領する。対象要件行は REQ-009-033 (既存) であり、当該行の既存トレーサビリティ対応に影響しないことを確認する。
  wave_hints: []
```

# summary

<!-- 人間可読サマリー。後続工程の原本としては扱われない。処理の原本は上記 # draft-data YAML ブロックである。 -->

Case #3654 の B15 (TS-012) 受入検証で発見されたローカル版マージ取り込み保証の未達 (pr_merge のコミット実在確認なし・case-close のローカル版取り込み手順不在・REQ-009-033 の blocked 遷移機会不在) を、既存合意条件 (B15 合格条件、REQ-009-033、local-case-file Design) の範囲内で是正する。分岐成果 PR #3669 を case-run で受領する。
