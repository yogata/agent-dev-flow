---
id: req-045-consistency-audit-20260920
title: "現行成果物体系の整合性網羅監査（第2回・v4 full validation）"
status: final
created: "2026-09-20"
audit_for: REQ-045
base_ref: "cbb3a637（v4-dev HEAD・第13段 Definition merge 後）"
---

## 1. 目的と根拠

本監査は REQ-045（現行成果物体系の整合性網羅監査）の実行契約に基づく第2回網羅監査であり、ADF v4 移行 Sequence 第13段（full validation）の OU-002 として実施した。第1回監査（req-045-consistency-audit-20260822.md・base_ref 当時の v3 体系）以降に実施された第4〜13段の変更（v4-dev branch）を対象に、現行成果物体系全体と現在の正規契約との不一致を 10 監査観点（REQ-045-002）で判定する。

同時に DEC-034 決定(3) の feature complete 条件リスト 15 項目（docs/designs/foundations/v4-migration-and-release.md「feature complete 条件リスト」節・第13段で Design 展開済み）の成立確認を本レポートに統合する（項目 14 の確認手段として本監査レポートが指定されている）。

監査基準 commit は cbb3a637（第13段 Definition PR #3037 squash merge 後の v4-dev HEAD）であり、機械検査の baseline は 158c3519（第12段 close 後）である。

## 2. REQ-045 スキーマ対応

| REQ 行 | 本監査での対応 |
|---|---|
| REQ-045-001（監査対象範囲） | §3 対象領域表のとおり。docs 6 領域（requirements/designs/decisions/reports/guides/knowledge + ルート直下）・src/opencode 5 領域（skills/commands/tools/plugins ほか）・.opencode 2 領域・.agentdev/extensions・scripts を走査（927 ファイル） |
| REQ-045-002（10 監査観点） | §5 意味観点判定表（V1〜V10） |
| REQ-045-003（4 値判定の記録） | §5・§9（全対象領域を pass/fail/blocked/not applicable のいずれかで判定・blocked 0 件） |
| REQ-045-004（検出事項の 7 証拠項目） | §6 検出事項明細（F-001） |
| REQ-045-005（問題クラス集約） | §6 問題クラス PC-001（同一原因由来の集約） |
| REQ-045-006（現行概念と歴史的参照の区別） | §3 許容条件 4 種（歴史参照/プレースホルダー/検出基盤/後方互換）による分類。§5 各観点の判定根拠に適用条件を明記 |
| REQ-045-007（blocked の扱い） | §7 blocked 項目 0 件・独断確定なし |
| REQ-045-008（未監査項目なし） | §9 領域別判定マトリクスで全領域の判定を記録・未監査項目 0 件 |
| REQ-045-009（保存形式・引継ぎ） | 本レポートが問題クラス・判定区分・証拠項目を含む形式で保存される。§10 引継ぎ集計（intake 起票・case-close OU-003） |

## 3. 監査方法

### 3.1 対象領域とファイル数

| 領域 | ファイル数 | 備考 |
|---|---|---|
| docs/requirements | 67 | retired/ 8 件を含む（歴史参照領域） |
| docs/designs | 175 | integrity/rules（検出基盤定義）を含む |
| docs/decisions | 39 | superseded 3 件を含む（歴史記録） |
| docs/reports | 31 | 監査証跡（歴史参照領域） |
| docs/guides / docs/knowledge / docs ルート直下 | 12 + 11 + α | README 等 |
| src/opencode/skills | 231 | 配布 Skill 定義群 |
| src/opencode/commands | 34 | 配布 command 定義群 |
| src/opencode/tools・plugins・agent ほか | 85 | |
| .opencode/skills / .opencode/plugins | 192 + 5 | worktree 投影（distribution 検査と突合） |
| .agentdev/extensions | 28 | 拡張 yaml |
| scripts | 17 | consumer スクリプト群（第12段 inventory ツールを含む） |
| 合計 | 927 | md/ts/json/yaml |

### 3.2 機械検査（10 検査 + bun test 3 分割）

/repo/docs-check と同構成の機械検査を cwd = v4 worktree root で実行し、baseline（@158c3519）と突合した。結果は §4 のとおり。

### 3.3 意味観点（10 観点）の走査方法

各観点を決定的パターンマッチで走査し、ヒットを「第13段 diff 追加行」「現行契約領域」「歴史・検出基盤領域」に分離して判定した。

- 第13段 diff（158c3519..cbb3a637・docs 3 files +28/−2）の追加 28 行: 全観点パターンヒット 0 件（第13段変更は監査観点上クリーン）
- 現行契約領域（docs/requirements〔retired を除く〕・src/opencode/skills・src/opencode/commands・.agentdev/extensions・.opencode/skills）: ヒットを個別精査
- 歴史・検出基盤領域（docs/decisions の superseded・retired REQ・docs/reports・docs/designs/integrity/rules）: REQ-045-006 の許容条件で分類

### 3.4 4 値判定と許容条件

判定は pass / fail / blocked / not applicable の 4 値とし、pass 判定には次の許容条件を適用した（REQ-045-006）。

1. **歴史参照**: superseded Decision・retired REQ・監査レポートなど、履歴記録としての言及
2. **プレースホルダー**: テンプレート・例示（example.md・{command-name} 等）の実行時配布対象外の記述
3. **検出基盤**: integrity rule 定義（IR-066 等）・検出キーワード列挙など、検出側の定義としての言及
4. **後方互換**: 廃止を宣言する現行契約文（「〜しない」「〜廃止する」の否定形規定）

## 4. 機械検査結果（baseline @158c3519 突合）

| 検査 | 実行コマンド（cwd = v4 worktree root） | 結果 | baseline 突合 |
|---|---|---|---|
| check_integrity | `bun .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --root . --json` | {ok 791, ng 54, warning 8, info 109} | NG セット 54 件が baseline と完全一致（check+file+message 突合・両方向差分 0・新增 0） |
| traceability | `bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root C:\Users\ogatay\work\agent-dev-flow-v4 --json` | missing-design 942 / missing-implementation 111 / policy-invalid 0 / missing-verification 0・malformed 0・unknown-roles 0・unknown-req-refs 0・invalid-artifact-paths 0 | 942/111/0/0 完全一致 |
| check_changed_docs（design-save） | `bun .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow design-save --base-ref 158c3519 --json --root .` | failures 0 / warnings 0 | — |
| check_changed_docs（req-save） | `bun .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow req-save --base-ref 158c3519 --json --root .` | failures 0 / warnings 0 | — |
| check_autogen_freshness | `bun .opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts --json --root .` | findings_count 0 | 一致 |
| check_distribution_boundary | `bun .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts --profile source --json` | ok true・failures 0（scanned 342） | 一致 |
| check_extensions | `bun .opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts` | ok true（workflow 16 / internal 0 / capability 12 / legacy 0） | 一致 |
| check_command_format | `bun .opencode/skills/repo-agentdev-integrity/scripts/check_command_format.ts` | OK | 一致 |
| check_templates | `bun .opencode/skills/repo-agentdev-integrity/scripts/check_templates.ts` | OK 63 | 一致 |
| lint_skills | `bun .opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts` | NG 1（case-open description 629 chars > 600）・WARNING 1（aggregate budget 17886 > 17150） | baseline で完全同一（@158c3519 再実行で NG 1・WARNING 1・同一内容を確認・新增 0） |
| check_content_corruption | `bun .opencode/skills/repo-agentdev-integrity/scripts/check_content_corruption.ts` | ok true・scanned 213・violations 0（broken-link 0・broken-code-span 0・broken-emphasis 0） | 一致 |
| check_knowledge_docs | `bun .opencode/skills/repo-agentdev-integrity/scripts/check_knowledge_docs.ts` | exit 0（違反なし） | 一致 |
| bun test 分割1 | 105 test ファイル列挙指定（`./` 付き相対パス） | 2550 tests・2547 pass・3 fail | 3 fail は環境 flakiness（下記） |
| bun test 分割2 | `bun test ./src/opencode/skills/` | 102 tests / 9 files 全 pass | 一致 |
| bun test 分割3 | `bun test ./.opencode/plugins/ ./scripts/` | 556 tests / 28 files 全 pass | 一致 |

bun test 分割1 の 3 fail の機械証明（REQ-045-008 の完全性のため記録）:

1. `check_reference_paths.test.ts` の `checkScriptTemplateReferencePaths > ng result file field contains source file path`（8281ms・タイムアウト系）: 単独実行で 30/30 pass を 2 回連続確認（5.97s・6.24s・テストコードは baseline から不変）
2. `check_test_impact.test.ts`（unnamed ×2）: `git init -q` の失敗と EBUSY（Windows ファイルロック）: 単独実行で 10/10 pass
3. テストコード不変の機械証明: `git diff 158c3519..cbb3a637 -- src/ .opencode/ scripts/` が空

分割1 のテスト総数 2558→2550 の差（−8）は check_test_impact の beforeAll 失敗による 10 テスト未実行（−10 + 2 unnamed 計上）で完全説明される（case-ready 受入検査で実証済みの同一事象）。

## 5. 意味観点判定（V1〜V10・REQ-045-002）

| 観点 | 判定 | 判定根拠 |
|---|---|---|
| V1: ADR から Decision への移行残存 | pass | 現行契約領域（requirements・skills・commands・extensions）で ADR-NNN 識別子・docs/adr/ パス・agentdev-adr-* 名称のヒット 0 件。ヒット 173/83/31 件は DEC-009（移行決定の記録）・integrity/rules（検出基盤）・docs/reports（監査証跡）に全て分類（許容条件 1・3） |
| V2: 撤去済み Artifact Graph への現行参照 | pass | 現行 REQ のヒットは REQ-012-048 のみで「`.agentdev/graph/` のような派生 Graph を標準動作の必須入力または必須生成物と**せず**」という廃止宣言の現行契約文（許容条件 4）。他は retired REQ・DEC-007 superseded 記録・IR-066 定義（許容条件 1・3） |
| V3: 旧 SPEC または旧 Design パス | pass | 現行 REQ（retired を除く）で docs/specs/ パスのヒット 0 件。ヒット 376 件は IR-066 等の検出基盤定義・retired REQ-013・監査レポート（許容条件 1・3） |
| V4: 旧 command または旧 skill 名称 | pass | 現行契約領域で agentdev-doc-map 等の旧名称ヒットは retired/REQ-013 のみ（許容条件 1） |
| V5: 未解決 ID と未解決プレースホルダー | pass | TODO/FIXME/TBD ヒット 41 件は REQ-008（決定的マーカー検査の検出語定義）・intake-extraction.md（検出キーワード列挙）・designs/commands/req-define.md（禁止事項を述べる文中の引用）で、いずれも検出基盤または規範文（許容条件 3）。現行コード・現行契約文の未解決マーカー残置なし |
| V6: ガードレール識別体系の整合（旧 Gxx 連番残存） | pass | Gxx ヒット 21 件は REQ-051（Gxx 連番制度の廃止要件）・DEC-022（廃止決定の記録）・command-file-format.md（廃止済み説明）・監査レポートで、現行契約としての Gxx 連番依存なし（許容条件 1・4） |
| V7: 手順表現と工程表現の混在 | pass | `### Step N` 形式ヒット 24 件は learning-capture references/example.md（学び抽出 13 フィールド形式の実例・例示資料）など参照資料に限定され、STEP model を正とする現行 Workflow Skill・command 定義群での手順表現の混在なし（許容条件 2・第1回監査と同一判定） |
| V8: 責務所有者の不一致 | pass | 機械検査による代理確認: check_command_format OK・check_extensions ok（16/0/12/0・workflow/internal/capability の分類整合）・check_templates OK 63・lint_skills の NG 1 は baseline 既知（description 長・責務不一致ではない） |
| V9: 削除済み機能への現行参照 | pass | DOC-MAP・check_graph・tombstone ヒット 279 件は requirements/README の retired 行（retired 索引としての正規記録）・retired REQ-013・DEC の廃止決定記録で、現行動作としての参照なし（許容条件 1） |
| V10: 同一契約の複数箇所定義による矛盾 | pass | 機械検査による代理確認: check_integrity NG セット baseline 完全一致（新增 0）・check_autogen_freshness 0（AUTOGEN 管理領域の重複定義なし）・check_distribution_boundary failures 0（source と投影の不一致なし） |

## 6. 検出事項明細

### F-001: DEC 承認記録節の受理後陳腐化記述（8 件）

- **対象ファイル**: docs/decisions/DEC-031.md・DEC-032.md・DEC-033.md・DEC-034.md・DEC-035.md・DEC-037.md・DEC-038.md・DEC-039.md
- **該当箇所**: 各ファイル「承認記録」節の第 1 文（DEC-031: L36・DEC-032: L39・DEC-033: L37・DEC-034: L41・DEC-035: L30・DEC-037: L38・DEC-038: L54・DEC-039: L61）
- **現在の記述**: 「本 Decision は proposed のままで維持する（REQ-030-005）。accepted への状態遷移は case-ready の Decision 受理評価が実行する。」
- **正と判断した根拠**: 各 Decision の frontmatter status はすべて accepted であり（第3段受理 commit 0d991aa6 で一括受理）、本文承認記録節の proposed 前提の記述と矛盾している。REQ-030-005 の契約（case-ready 受理評価による accepted 遷移）自体は正しいが、遷移完了後の現状記述として陳腐化している。第13段で DEC-036 の同一形式記述を現状整合化した（Definition PR #3037・ACT-DEC-001）が、他 8 件は合意範囲外として本監査での検出に分離された
- **問題クラス**: PC-001（同一原因由来・第3段受理時に status のみ遷移し承認記録節本文が proposed 前提のまま残置）
- **修正候補**: DEC-036 と同一様式の現状整合化（各 1 行の文言更新・決定本文・frontmatter 不変）
- **再発防止可能性**: 中（受理評価の自動化時に本文の現状整合を含める運用規定、または受理記述を frontmatter status 参照形式にする Design 変更。intake 起票後の採用判断で確定）

### 問題クラス一覧

| クラス | 内容 | 検出数 | 深刻度 |
|---|---|---|---|
| PC-001 | DEC 承認記録節の受理後陳腐化記述（同一原因由来） | 8 件（F-001） | 低（意味の誤解リスク・動作影響なし） |

## 7. blocked 項目

なし（B-NN 0 件）。正規契約が確定できず独断確定を要しない事項は発生しなかった。

## 8. feature complete 15 項目確認記録（DEC-034 決定(3)・TS-004）

| # | 条件項目 | 判定 | 確認証跡 |
|---|---|---|---|
| 1 | v4 model canonical 確定 | 成立 | 第1〜3段完了（#2958/#2967/#2973 closed・PR #2959/#2968/#2974 merged・crosswalk executed 行） |
| 2 | Runtime | 成立 | 第2段完了（v4-runtime-execution-model accepted・#2967・crosswalk） |
| 3 | 文書運用 | 成立 | 第3段完了（REQ/DEC/Design accepted 状態・DEC-031〜039 accepted〔F-001 は本文陳腐化のみで status 契約は充足〕・v4 Design accepted） |
| 4 | req-define 相当入口 | 成立 | 第4段完了（v4-standard-lifecycle accepted・#2979・2 入口モデル実装 PR #2985〜#2987） |
| 5 | case-auto 相当 orchestration | 成立 | 第4段完了（内部 lifecycle 回収・v4-standard-lifecycle） |
| 6 | work_type/scale/Epic/Wave | 成立 | 第5段完了（#2988・REQ 10 行更新・execution-unit-construction v4 再編） |
| 7 | Collaboration Loop | 成立 | 第9段完了（v4-collaboration-loop accepted・#3022） |
| 8 | Quality/Evidence/Gate | 成立 | 第6段完了（v4-quality-gate-model accepted・#2997） |
| 9 | Traceability | 成立 | 第7段完了（v4-traceability-model accepted・#3004） |
| 10 | Skill 再編 | 成立 | 第8段完了（#3011・v4-delegation-contracts・34 Design v4 責務分類節） |
| 11 | Extensions | 成立 | 第10段完了（#3029 closed・v4-responsibility-boundaries・crosswalk f3884738） |
| 12 | adapter | 成立 | 第11段完了（#3031 closed・v4-responsibility-boundaries・crosswalk 6f210347） |
| 13 | migration mechanism | 成立 | 第12段完了（#3033 closed・v4-migration-and-release「標準 migration pattern」節 5 節・inventory ツール実装 PR #3035・crosswalk 158c3519） |
| 14 | automated validation | 成立 | 本監査（機械検査 10 種 + bun test 3 分割・baseline 突合新增 0・意味観点 10 項目 pass・本レポートの保存） |
| 15 | self-hosting 開始可能 | 成立 | 項目 1〜14 の成立に加え、bootstrap self-hosting readiness の確認: v4 worktree 上で case-* workflow 群（第10〜13段の Case 実行そのもの）が稼働済み・inventory ツールが v4 状態走査で動作（TS-005 @cbb3a637 実測・368 行レポート出力・読み取り専用副作用ゼロ実証済み）・self-sync/check スクリプト群が移行前提構成で実在（cutover 第14段の正規実行は本リスト対象外） |

備考: 項目 15 の「実行は cutover 後の self-hosting + pilot 段階が所有」であるため、本確認は readiness（開始可能状態の確認）までをいい、pilot 実行（第15段）を含まない。

## 9. 領域別判定マトリクス

| 領域 | V1 | V2 | V3 | V4 | V5 | V6 | V7 | V8 | V9 | V10 | 総合 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| docs/requirements（retired を除く） | pass | pass（REQ-012-048 は廃止宣言） | pass | pass | pass（検出語定義のみ） | pass（REQ-051 は廃止規定） | pass | pass | pass | pass | pass |
| docs/requirements/retired | n/a（歴史） | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a（歴史参照領域） |
| docs/designs（integrity/rules を除く） | pass | pass | pass | pass | pass | pass（廃止説明のみ） | pass | pass | pass | pass | pass |
| docs/designs/integrity/rules | n/a（検出基盤） | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a（検出基盤定義） |
| docs/decisions（accepted・F-001 対象を除く） | pass（移行記録は許容） | pass（superseded 記録は許容） | pass | pass | pass | pass（廃止記録は許容） | pass | pass | pass（廃止記録は許容） | pass | pass |
| docs/decisions（F-001 対象 8 件） | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass（F-001 は観点 V1〜V10 のいずれにも該当しない status 本文矛盾として §6 で集約。10 観点単体では新規違反なし） |
| docs/reports | n/a（監査証跡） | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a（歴史参照領域） |
| docs/guides / docs/knowledge | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| src/opencode/skills・commands・tools・plugins | pass（ヒット 0） | pass | pass | pass | pass | pass | pass（example.md は例示） | pass（機械検査代理） | pass | pass（機械検査代理） | pass |
| .opencode/skills・plugins（投影） | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass（distribution failures 0） | pass |
| .agentdev/extensions | pass | pass | pass | pass | pass | pass | pass | pass（check_extensions ok） | pass | pass | pass |
| scripts | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass（inventory ツール稼働実証） | pass |

未監査項目: 0 件（REQ-045-008 充足）。

## 10. 引継ぎ集計

| 項目 | 引継ぎ先 | 内容 |
|---|---|---|
| F-001（PC-001・DEC 8 件の承認記録節陳腐化） | intake 起票（.agentdev/intake/inbox/・case-run capture 責務） | DEC-036 と同一様式の現状整合化 8 件。採用・処分は intake-promote が所有 |
| crosswalk 全行 executed 検証 | case-close（OU-003） | L42（REQ-045）・L43（REQ-046）の executed 化 + planned 残行の確認・無割当行の keep/executed 処遇 |
| 監査レポート本文 | 本ファイル（docs/reports/integrity/audits/req-045-consistency-audit-20260920.md） | TS-007 の保存物。feature complete 15 項目確認記録（§8）を含む |
| #2966 段階 13 行の更新 | case-close | 単一書き手原則 |

## 11. 結論

REQ-045 の 10 監査観点はすべて pass（blocked 0・未監査 0）。機械検査は baseline と NG セット完全一致（新增 0）。検出事項は F-001（PC-001・8 件・深刻度低）の 1 件で、intake 起票に分離する。feature complete 条件リスト 15 項目はすべて成立し、v4.0.0-rc.1 cutover（第14段）の前提条件（feature complete → full validation）が満たされたことを本レポートをもって確認する。

（了）
