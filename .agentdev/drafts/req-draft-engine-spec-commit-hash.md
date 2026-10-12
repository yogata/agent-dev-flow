---
draft_type: req_draft
topic_slug: engine-spec-commit-hash
status: draft
created_at: 2026-10-13T09:05:00+09:00
---

<!-- req_draft 形式。是正 Case #3670 (PR #3669、5958fe7e) の spec 側追随不足を是正する、
 既存合意条件のみの引き継ぎ draft である。新規要求・新規範を含まない。 -->

# draft-data

```yaml
work_type: fix

scale: standard

summary: |-
  是正 Case #3670 で実施したローカル版マージ取り込み保証の実装修正 (runner-local.ts prMerge の commitHash 必須化・コミット実在 VERIFY) に対し、engine 側の入力契約 (specs-pr.ts prMergeSpec、contracts.ts) が追随していないことが受入義務補完の正規 workflow 通し (DEL-REV-B1213-WF) で発見された。specs-pr.ts の prMergeSpec は commitHash を未知フィールドとして拒否し (checkUnknownFields の許容リストが operation/number/method のみ)、buildRequest も number/method のみを伝播する。このため engine 正規呼び出し経路 (agentdev_gh Tool) からローカル版 pr_merge へ commitHash を渡すことができず、必ず失敗する。#3670 の完了条件 AG-002/AG-003「Tool の記録保証」が正規呼び出し経路から利用できない状態であり、同 Case 是正の未完了部分である。
  本 draft は上記 spec 側追随のみを対象とし、REQ/Decision の変更を含まない。Design (custom-tool-contracts) への入力契約の明記 (1 文) を伴うが、これは既存「両版等価性」と local-case-file Design「マージ結果の記録方針」の実装手段の明確化である。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      #3670 完了条件 AG-002/AG-003 (既存合意、変更なし): pr_merge はコミット実在 VERIFY を通過した場合のみマージ結果を記録し、記録に実測コミットハッシュを含める。この保証が engine 正規呼び出し経路 (specs-pr.ts → contracts.ts → runner) から機能すること。engine 経由で commitHash 付き pr_merge が runner へ到達し、ローカル版でマージ結果が記録されること。
  - id: AG-002
    content: |-
      local-case-file Design「マージ結果の記録方針」(既存、変更なし): ローカル版 Tool はマージ結果の記録に際し、関連コミットハッシュのローカル Git 上の実在を確認 (VERIFY) してから記録する。実在しないコミットハッシュでは記録せず失敗する。
  - id: AG-003
    content: |-
      custom-tool-contracts Design の両版等価性 (既存、変更なし): 両版は操作名、入力構造、出力構造を同値とする。物理写像に起因する差異は Design が例外として明示する (既存の isDraft 等のパターンに従う)。pr_merge の commitHash はローカル版の取り込み確認情報であり、両版共通の入力契約に含めつつ、ローカル版では必須として検証し、GitHub 版では受理してマージ動作には使用しない。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 対象操作の境界（初期セット）
    source_items: [AG-003]
    content: |-
      【更新要綱】pr_merge の入力契約の明記を追加: pr_merge はローカル版の取り込み確認情報として commitHash (文字列) を受理する。ローカル版では必須として検証し (実在確認)、GitHub 版では受理してマージ動作には使用しない。既存の両版等価性と local-case-file Design「マージ結果の記録方針」の実装手段の明確化であり、新規範を追加しない。

operation_units: []

result: {}

realization_actions:
  - id: RA-001
    title: engine 入力契約の commitHash 伝播
    responsibility: |-
      specs-pr.ts prMergeSpec の validate に commitHash (文字列) を許容フィールドとして追加し、buildRequest が args へ commitHash を伝播するように修正する。contracts.ts の GhToolRequest の pr_merge 型へ commitHash を追加する。GitHub 版 runner (runner-cli.ts) が args.commitHash を安全に無視することを確認する (未知 args で失敗する場合は受理のみ追加)。テスト更新: specs・契約テストへ commitHash 付き (Local 版で必須検証に到達)・なし (GitHub 版従来どおり) のケースを追加し、既存テストを維持する。
    intent: AG-001、AG-002、AG-003 を engine 正規呼び出し経路で成立させる。
    existing_work: |-
      なし (本次正で新規実装)。参照: runner-local.ts prMerge は 5958fe7e で commitHash 必須化・実在 VERIFY 済み (変更不要)。case-close workflow のローカル版取り込み手順も 5e067352/c0e06249 で実装済み (変更不要)。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002, AG-003]

test_strategy:
  - id: TS-001
    target_item: RA-001（入力契約の伝播とテスト維持）
    verification: bun test src/common/tools/agentdev-gh/ (契約テスト・specs テストを含む全体) を実行し、commitHash 付き pr_merge リクエストが validate を通過し buildRequest の args に commitHash が含まれること、commitHash なし (GitHub 版従来呼び出し) も引き続き通過すること、操作カタログ (16操作) の固定が維持されることを確認する。
    pass_criteria: 全テスト pass。カタログの変更なし。
    on_failure: fix-and-reverify
  - id: TS-002
    target_item: AG-001（engine 正規経路からローカル版 pr_merge の機能)
    verification: 隔離検証環境 (C:/Users/ogatay/AppData/Local/hermes/cache/scratch/ 配下の検証用リポジトリ・ローカルIssue) で、engine 正規経路 (specs → contracts → runner-local) を通した pr_merge を実行する。(i) 実在コミットハッシュ付きで呼んだ場合に runner の実在 VERIFY を通過しマージ結果が記録されること。(ii) commitHash なしで呼んだ場合にローカル版の必須検証で拒否されること。(iii) 存在しないコミットハッシュで operation-failed となること。証拡を scratch 配下へ保存する。
    pass_criteria: engine 正規経路から #3670 の AG-002/AG-003 保証が機能すること。
    on_failure: fix-and-reverify
  - id: TS-003
    target_item: RA-001（検証スイート)
    verification: typecheck (agentdev-gh package)、配布境界 checker (--profile source、変更由来違反 0)、実ファイル確認 (specs-pr.ts・contracts.ts・Design の ACT-DESIGN-001 反映) を実行する。
    pass_criteria: 変更由来の違反 0。
    on_failure: fix-and-reverify

case_open_hints:
  epic_needed: false
  decomposition: |-
    実装修正のみの standard Case として確立する (ACT-DESIGN-001 の Design 1 文を実装修正に内包、realization_actions RA-001 を実装単位とする)。是正 Case #3670 は closed (終端状態) であり再オープンしない。本 draft は #3670 是正の spec 側追随不足 (未完了部分) の是正であり、元 req-define → case-auto の未達処理として独立 standard Case を新規確立する (別 Root の乱造ではない)。先行分岐成果は存在しないため、case-open は通常経路で Root Case を確立し、実装は case-run で実施する。対象要件行は既存 (REQ-009-033 への追加影響なし)、新規 REQ 行を生じない。
  wave_hints: []
```

# summary

<!-- 人間可読サマリー。後続工程の原本としては扱われない。処理の原本は上記 # draft-data YAML ブロックである。 -->

是正 Case #3670 (PR #3669、5958fe7e) の spec 側追随不足 (engine specs-pr.ts が commitHash を拒否・非伝播、正規呼び出し経路からローカル版 pr_merge が機能しない) を、既存合意条件 (#3670 AG-002/003、local-case-file Design、custom-tool-contracts 両版等価性) の範囲内で是正する。
