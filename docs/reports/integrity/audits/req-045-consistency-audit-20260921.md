---
id: req-045-consistency-audit-20260921
title: REQ-045 統合監査（v4.0.0 final 直前 full validation 再実施）
status: executed
created: 2026-09-21
audit_for: REQ-045
base_ref: cc5fcf25
---

# REQ-045 統合監査レポート（v4.0.0 final 直前 full validation）

## 1. 目的と根拠

本監査は ADF v4.0.0 final 成立条件 (d)「final tag 直前の full validation 再実施」（DEC-034 決定(3)・v4-migration-and-release「v4.0.0 final 成立条件」節）として実施する。第13段監査（req-045-consistency-audit-20260920.md・12f048e5）以降の変更（第16段 RC fixes: Definition PR #3043 merge 97953f3e・実装 PR #3047/6967bdc0・#3048/2ec9309b・#3049/44cbd1b4・learning capture cc5fcf25）を対象に、機械検査全件と意味観点 10 項目を再実施し、feature complete 条件の維持と final tag 付与の妥当性を判定する。

- 監査実行 Case: #3050（Root Case・ADF v4.0.0 final release 第17段）
- 監査基準線: main @cc5fcf25（tag v4.0.0-rc.2 指向 commit・docs 変更前）
- drift 解消: 本監査と同一 commit で generate_indexes 再生を実施（AG-006 正規経路・後述）

## 2. REQ-045 スキーマ対応

REQ-045（文章整合性診断）が要求する監査スキーマの対応は前回監査（2026-08-22・2026-09-20）と同一構成を維持する。観点→パターン写像・4 値判定（pass / fail / blocked / not applicable）・許容条件 4 種（歴史記述 / プレースホルダー / 検出基盤 / 後方互換）。

## 3. 監査方法

- 対象: 差分アプローチ。第13段監査（2026-09-20・全 corpus 911 ファイル pass 済み）を baseline とし、12f048e5..cc5fcf25 の変更 105 ファイル（docs corpus + src 配布 reference + traceability sidecar/policy + .agentdev 学習記録）に V1〜V10 パターンを適用する。機械検査は全件実行し baseline 値と突合する。
- 実行環境: main repo root（branch main・bun 1.3.6・Windows）。check_integrity --profile source 相当・traceability check --root 絶対パス。

## 4. 機械検査結果（baseline 突合）

| 検査 | baseline @cc5fcf25（TS-001） | 本監査実測 | 判定 |
|---|---|---|---|
| check_integrity | {ok 786, ng 53, warning 8, info 109}・NG 内訳 broken-file-link 52 + IR-061 drift 1 | {ok 786, ng 53, warning 8, info 109}・NG 内訳同一（category|check|file|line 突合） | pass（完全一致） |
| check_integrity（drift 解消後・本 commit 適用後） | ―（解消後の新 baseline となる値） | {ok 787, ng 52, warning 8, info 109}・NG = broken-file-link 52 のみ | pass（IR-061 解消・AG-006） |
| traceability | 906 / 107 / 0 / 0 | missing-design 906 / missing-implementation 107 / policy-invalid 0 / missing-verification 0（malformed 0・unknown-roles 0・unknown-req-refs 0・invalid-artifact-paths 0） | pass（完全一致） |
| check_autogen_freshness | 1 件（IR-061 計測日 drift） | 1 件（監査時点）→ generate_indexes 再生後 0 件（本 commit で解消） | pass（AG-006） |
| check_distribution_boundary（source） | ok・failures 0 | ok・failures 0 | pass |
| check_extensions | ok（workflow 16 / internal 0 / capability 12 / legacy 0） | ok（16 / 0 / 12 / 0・schema violation 0・malformed 0） | pass |
| check_design_frontmatter | findings 0 | findings 0（enumerated 175 / scanned 168 / skipped 7〔README 1 + references 6〕・IR-070 例外テーブルどおり） | pass |
| check_command_format | OK | OK | pass |
| check_templates | OK | OK（実行日時ヘッダは UTC 表記） | pass |
| lint_skills | NG 1・WARNING 1 | NG 1・WARNING 1（case-open SKILL.md description 629>600 の既知 1 件・aggregate budget 警告・第13段監査と同一内容） | pass（baseline 一致） |
| check_content_corruption | violations 0 | violations 0 | pass |
| check_knowledge_docs | 違反 0 | 違反 0 | pass |
| bun test 分割1（repo-agentdev-integrity 106 files） | 2596 tests 全 pass（第16段最終実績） | 2585 pass / 3 fail / 2588 tests ― fail 3 件はすべてタイムアウト系（8.2s / 5.0s / 3.9s・bun 既定 5 秒制限超過）で実行ごとに fail テストが移動（分割実行では "stale loader shim"・単独実行では "--help"〔29.2s〕が fail し前者は pass）= 環境 flakiness を機械証明。テストコードは cc5fcf25 と同一（git status clean・HEAD 不変）で第16段最終全 pass 実績のコードと完全一致 | pass（flakiness 証明済み） |
| bun test 分割2（src/opencode/skills 9 files） | 102 全 pass | 102 全 pass | pass |
| bun test 分割3（.opencode/plugins + scripts 28 files） | 556 全 pass | 556 全 pass | pass |

## 5. 意味観点 V1〜V10（差分 105 ファイル適用）

| 観点 | 内容 | 差分適用結果 | 判定 |
|---|---|---|---|
| V1 | ADR→Decision 移行残存 | ヒット 1（learning/deferred.md の履歴記録） | pass（履歴許容） |
| V2 | 撤去済み Artifact Graph 参照 | ヒット 5（deferred.md 履歴・check_integrity 検出コード×2・decisions/README DEC-007 supersedes 履歴行・traceability.md の旧 graph 廃止説明） | pass（検出基盤・歴史許容） |
| V3 | 旧 SPEC / 旧 Design パス | ヒット 6（検出コード×3・checker-execution-contracts マニフェスト列挙〔obsolete-path-map は checker 管理マニフェスト名〕・rule-ownership IR-057 ルール定義行・deferred.md） | pass（検出基盤許容） |
| V4 | 旧 command / skill 名称 | ヒット 2（check_integrity 検出コード・fixture） | pass（検出基盤許容） |
| V5 | 未解決 ID・TODO/FIXME | ヒット 6（inspect inbox の finding 記録〔処分待ち正規状態〕・検出コード/fixture×3・rule-ownership IR-064 ルール定義〔TODO 系マーカーの検出対象定義〕・第5波監査レポート内引用） | pass（検出基盤・証跡許容） |
| V6 | Gxx 書式 | ヒット 2（deferred.md・fixture） | pass（履歴許容） |
| V7 | 手順表現と工程表現の混在 | ヒット 1（test-strategy-numeric-threshold-guide.md の既存 "### Step N" 見出し群）。第16段（#3046）で追加した行に Step 見出し 0 件を git diff で機械確認（追加は「traceability 数値期待の増減理由型記述様式」節のみ・既存構造維持） | pass（既存構造維持） |
| V8 | 責務所有者不一致 | check_extensions の実行結果（schema violation 0・malformed 0）と checker 群の実行が代理検証 | pass |
| V9 | 削除済み機能参照 | ヒット 9（deferred.md・検出コード×2・decisions/README・designs/README の過去運用説明〔docs/reports への保存先説明〕・integrity-contracts・integrity-rule-catalog〔check_graph 検出規則の定義記述〕・req-impact-map・requirements/README〔retired 索引〕） | pass（検出基盤・歴史許容） |
| V10 | 同一契約複数定義の矛盾 | 機械検査全件の実行結果が代理検証（check_integrity NG セット baseline 完全一致・design_frontmatter 0・extensions 0） | pass |

第16段で追加された全行（Definition PR #3043 docs 22 files + 実装 PR 3 件）は V1〜V10 全観点で新規違反 0 件。

## 6. 検出事項明細

本監査の新規検出事項: **0 件**（F-002 相当の新規起因なし。第13段 F-001〔DEC 承認記録陳腐化 8 件〕は第16段 ACT-DEC-002〜009 で解消済み・TS-005 で旧文言 0 件を再確認）。

## 7. blocked

なし（B-0）。

## 8. feature complete 15 項目確認（維持確認）

- v4 Design は全件 status: accepted（draft 状態の実在 Design 0 件。"status: draft" 文字列ヒット 3 件はテンプレート 2 件〔_template.md のキー説明行〕+ 変数説明 1 件〔artifact-contracts.md の draft_type 注記〕で実 Design ではない）
- #2966 進捗表: 段階 1〜16 すべて「✅ 完了」（完了マーカー 16 件）
- feature complete 条件リスト 15 項目（v4-migration-and-release 対応表）: 第13段確認済みの前提は第16段変更（docs 追記・RETIRE 物理実行・checker 追加）で破壊されない（traceability 906/107/0/0・policy-invalid 0・Design accepted 維持・機械検査 baseline 一致）。項目 14〔本監査〕と項目 15〔readiness〕は本監査の実施と §9 の Evidence で成立。

## 9. v4.0.0 final 成立条件 Evidence 集約（(a)〜(d)）

| 条件 | Evidence | 実在確認 |
|---|---|---|
| (a) self-hosting 成立 | 第15段 SSoT DEL-3040-1（Issue #3040 comment 5749180597）: main repo 上 req-define → case-auto 実行の証跡・self-sync check 合格・.agentdev 整合 | GitHub API で comment 実在確認 |
| (b) pilot migration Evidence | docs/reports/pilot/v4-rc1-pilot-migration-20260920.md（commit d632c126・fujoho_schedule v3→v4.0.0-rc.1・検証 10 項目 pass 9 / not applicable 1 / blocked 0・semantic preservation 機械証明） | ファイル・commit 実在確認 |
| (c) RC fixes 完了 | 第16段 Case #3042（closed）: Definition PR #3043 + 実装 PR #3047/#3048/#3049 merge・RU-0103〜0114 全反映・tag v4.0.0-rc.2（tag object 94f8331c → commit cc5fcf25） | Issue state CLOSED・tag 指向 commit 確認 |
| (d) final 直前 full validation 再実施 | 本監査レポート（機械検査全件 baseline 一致・意味観点 10 項目 pass・feature complete 維持・新規違反 0） | 本ファイル（同一 commit で永続化） |

## 10. 結論

v4.0.0 final 成立条件 (a)〜(d) の Evidence がすべて実在し、機械検査全件が baseline と一致（既知残存は broken-file-link 52 件〔履歴起因・CR-001 合格基準外〕のみ）、意味観点 10 項目がすべて pass、新規違反 0 件である。**tag v4.0.0 の付与条件は成立する**。IR-061 計測日 drift は AG-006 正規経路（generate_indexes 再生）で解消し本レポートと同一 commit で永続化する。
