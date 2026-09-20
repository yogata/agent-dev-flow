# DEC-012 relations 追記に伴う Decision Map（手動テーブル）反映の実施タイミング未定義

## 対象

`docs/decisions/README.md` の Decision Map（手動テーブル・AUTOGEN 対象外）と第10段要件doc の TS-003。

## 観測された不整合

第10段（Extensions・Case #3029）の要件doc TS-003 は「Decision Map（手動テーブル）へ DEC-012 行の関係更新を反映すること」を完了条件に含むが、draft artifact_actions は ACT 3 件（docs/decisions/DEC-012.md・docs/designs/foundations/project-extensions.md・docs/designs/skills/agentdev-project-extensions.md）のみを宣言し decisions/README.md の編集を含まない。このため Definition PR #3030 だけでは TS-003 の当該項目を満たせず、反映の実施タイミング（Definition PR・case-close docs commit・別途）が確定していない。

## 発見経路と証跡

- case-open Case #3029 の実行中（Root Case 本文候補生成時の test_strategy 投影）、TS-003 と artifact_actions の対象範囲突合で検出。
- 現行 Decision Map に DEC-012 行は存在しない（relations 追記前後とも）。
- Definition PR #3030 は docs 3 files のみで decisions/README.md を含まない（commit ce9b2a96・diff +60/−1）。

## 影響候補

- case-run（verify-only closure）での TS-003 評価時に当該項目が未達となり、fix-and-reverify 判断を迫られる可能性。
- Decision Map と frontmatter relations の乖離が続く期間、README の手動テーブルが Decision 関係の参照点として機能しない。

## 提案（修正候補）

- 第10段のいずれかの工程（case-ready 受入時の追加コミット、または case-close の docs commit〔OU-002 crosswalk executed 化と同一 commit〕）で Decision Map へ DEC-012 行 2 件（DEC-006・DEC-036 への relates-to）を反映する。
- または要件doc 整備時に TS 完了条件と artifact_actions 対象の一致確認を徹底し、対象外ファイルを要する完了条件が ACT を伴わず残る状態を防ぐ。

## 出典

- case-open Case #3029 / Definition PR #3030 の実行（2026-09-20、case-auto 第10段委譲実行）
- 発見時の canonical 基準 commit: 861a5430（v4-dev）
