---
id: BASELINE-REQ048-V2-MEASUREMENT
title: "REQ-048 再構築 Baseline V2 測定（OU-007 / WP-07 Phase B）"
status: accepted
created: 2026-09-05
baseline_for: REQ-048（再構築版） / DEC-027
source_issue: "#2604 (OU-007 / WP-07 Baseline V2 Measurement)"
parent_epic: "#2597 (REQ-048 再構築・測定・実験系)"
---

<!-- ADF-COVERS(verification): REQ-048-015, REQ-048-016 -->
# REQ-048 再構築 Baseline V2 測定（OU-007 / WP-07 Phase B）

## 本 Report の位置づけ

本 Report は、`docs/reports/req-048-baseline-v2-definition.md` の定義基盤に従う Baseline V2 の測定手順と、現時点で GitHub から観測できる測定結果を保存する関連 Report である。測定専用の新しい成果物種別、実行履歴 DB、恒久 checker、公開入口は追加しない。

Legacy Baseline（`docs/reports/req-048-reanalysis-baseline.md`）の実測値と定義は変更しない。本 Report と Legacy Baseline の数値を直接比較せず、Baseline V2 と同じ手順で測定した後続結果との比較に限定する。

## 1. baseline commit SHA 固定記録

定義 Report §2 の手順に従い、測定開始時に `origin/main` を取得した。

| 項目 | 結果 |
|---|---|
| baseline SHA | `66a62cd782ae9d9e40bce47816622e9e3128e65a` |
| structurally normalized commit | `a0b5ac82c776a714c133c8245fce90c99dd1a836` |
| 子孫確認 | PASS。`git merge-base --is-ancestor a0b5ac82c776a714c133c8245fce90c99dd1a836 origin/main` の終了コード 0 |
| 実行日時 | 2026-09-04T20:11:36Z（UTC） |
| 取得コマンド | `git fetch origin main`、`git rev-parse origin/main`、`git merge-base --is-ancestor <structurally-normalized-SHA> origin/main` |

したがって、本測定の Baseline V2 は Phase C の構造的縮小を含む測定時点の `origin/main` である。

## 2. 測定手順の定義

### 2.1 評価軸と観測方法

評価軸は Baseline V2 定義 Report §3 と REQ-048 に従い、単一指標で判断しない。

| 評価軸 | 観測方法 |
|---|---|
| Outcome | Issue の完了状態、Epic の子 Issue 状態、PR の作成・統合結果、result 4状態を対応付ける |
| Efficiency | wall-clock、token の性質別値、tool call、同一 path 再読込、子実行間の同一 path 再読込、source / projection 重複参照を harness 生実行履歴から取得する |
| Quality | PR 本文と Issue コメントの検証記録から、工程で初めて確認された actionable finding を新規、修正済み、既出、撤回、無効に分類して incremental value を比較する |
| Autonomy | human intervention、user-decision-required、blocked、failed、delegation-unavailable、self-heal、stop、resume を Issue コメント、PR、Epic 状態から区別する |
| Control / Coordination | 各処理を処理区分へ対応付け、並列実行の追加 token、重複作業、競合、fan-in 後修正を比較する |
| Observation Tax | 観測・統制機構自身の token、wall-clock、tool call、重複読み書き、orchestration、maintenance / contract complexity を記録する |

### 2.2 指標の取得源と測定方法

| 指標 | 取得源 | 測定方法 | 本測定での状態 |
|---|---|---|---|
| wall-clock | harness 生実行履歴 | 実行単位ごとの開始・終了時刻の差を算出する | harness データ未永続化のため測定不能 |
| input token、output token、cache read、cache write | harness 生実行履歴 | 4性質を分けて実行単位ごとに集計する | harness データ未永続化のため測定不能 |
| tool call | harness 生実行履歴 | 実行単位、処理区分、tool 種別ごとに数える | harness データ未永続化のため測定不能 |
| 同一 path 再読込、子実行間の同一 path 再読込 | harness の read 履歴 | path を正規化し、同一実行単位内と子実行間で重複を数える | harness データ未永続化のため測定不能 |
| source / projection 重複参照 | harness の read 履歴 | 対応する source と projection の参照を正規化 path 単位で対応付ける | harness データ未永続化のため測定不能 |
| 実行識別情報 field 数 | GitHub Issue / PR 本文 | 構造化識別情報セクションの `adf_` key を数える | 測定可能 |
| 検証差分セクション存在率 | GitHub PR 本文 | `検証差分` または同義の `検証記録` 見出しの有無を数える | 測定可能 |
| Issue コメント数、PR コミット数 | GitHub API | `gh issue view` と `gh pr view` の配列長を数える | 測定可能 |

token は input、output、cache read、cache write を区別する。単純合算値は参考値に留め、Cost の判断には用いない。

### 2.3 処理区分の定義と対応付け

| 処理区分 | 定義 |
|---|---|
| Context / Exploration | Issue、REQ、Decision、Design、Report、README、リポジトリ状態を読み、実行対象を確認する処理 |
| Implementation | 正規成果物または実装対象を変更する処理 |
| Review | adversarial-review、code review、品質判断など、変更の妥当性を審議する処理 |
| Verification | test strategy、docs-check、integrity suite、品質ゲートなど、結果を検証する処理 |
| Orchestration / Recovery | Wave 制御、委譲の fan-out / fan-in、再開、blocker 処理、競合解消、失敗回復の処理 |

対応付けは、委譲単位識別子 `DEL-{N}-{seq}` ごとに、委譲実行ログと PR 本文の検証記録にある「実行工程」を処理区分へ割り当てて行う。harness の時系列履歴が取得できる場合は tool call の時刻で区分境界を補う。取得できない場合は PR と Issue の記録から判定し、区分ごとの時間や token を推定しない。

### 2.4 Observation Tax の測定方法

Observation Tax は、観測のために必要な作業を通常の便益と分離し、対象作業の回数と、取得可能な場合の token、wall-clock、tool call、重複読み書きを記録する。契約や checker の保守は maintenance / contract complexity として別に記録する。

## 3. Observation Tax の明示

| 項目 | 現在の状態 | Wave 5（#2602 / PR #2615）との関係 |
|---|---|---|
| correlation text 生成 | 継続。実行識別情報 4 field と委譲識別情報ブロックを作成する | 縮小後の field 集合へ整理済み |
| self-reference backfill | 削減済み。PR #2612 では PR 本文更新手段がなく `adf_pr: N/A` となった | `adf_pr`、`adf_result`、`adf_phase`、`adf_upstream_confirmed`、`adf_parent` を削除。`adf_child` と `adf_delegation_purpose` を統合し、`adf_case` と `adf_execution_unit` を縮小 |
| PR / Issue extra update | 継続。Issue コメントによる SSoT 記録、Epic 状態更新が対象 | 削減対象外 |
| verification diff 生成 | 継続。PR 本文の検証差分 5分類表が対象 | 削減対象外 |
| structured handoff 構築 | 継続。実行識別情報と委譲識別情報ブロックが対象 | 縮小後の field 集合を対象とする |
| contract test / checker 保守 | 継続。契約テスト 2本と integrity suite の保守が対象 | 削減対象外 |
| telemetry 契約起因の実行失敗 | サンプル不足。本測定範囲で発生例を確認できず、発生しないとは断定しない | 削減済みとは扱わない |

## 4. 測定可能な実測

### 4.1 対象と証跡

対象は Epic A #2596 の Wave 1〜6、Issue #2598〜#2603、PR #2611〜#2616 である。GitHub の読み取り操作だけを用い、他 Issue、PR の書き込み操作は行っていない。

実行したコマンドは次のとおりである。

```text
git fetch origin main
git rev-parse origin/main
git merge-base --is-ancestor a0b5ac82c776a714c133c8245fce90c99dd1a836 origin/main
gh issue view {N} --json number,state,comments --jq '{number: .number, state: .state, comment_count: (.comments | length)}'
gh pr view {N} --json number,commits --jq '{number: .number, commit_count: (.commits | length)}'
gh pr view {N} --json body --jq .body
```

`{N}` は Issue では 2598〜2603、PR では 2611〜2616 に置き換えた。PR 本文は UTF-8 で読み、`adf_` key と `##` 見出しを正規表現で抽出した。baseline SHA と取得日時は §1 に固定記録した。

### 4.2 実測結果

#### 構造化識別情報 field 数

| Wave | PR | field 数 | field 集合 |
|---|---:|---:|---|
| 1 | #2611 | 6 | `adf_case`、`adf_pr`、`adf_execution_unit`、`adf_delegation`、`adf_result`、`adf_harness_ref` |
| 2 | #2612 | 6 | `adf_case`、`adf_pr`、`adf_execution_unit`、`adf_delegation`、`adf_result`、`adf_harness_ref` |
| 3 | #2613 | 5 | `adf_case`、`adf_pr`、`adf_execution_unit`、`adf_delegation`、`adf_result` |
| 4 | #2614 | 7 | `adf_case`、`adf_phase`、`adf_execution_unit`、`adf_delegation`、`adf_pr`、`adf_result`、`adf_harness_ref` |
| 5 | #2615 | 4 | `adf_case`、`adf_execution_unit`、`adf_delegation`、`adf_harness_ref` |
| 6 | #2616 | 4 | `adf_case`、`adf_execution_unit`、`adf_delegation`、`adf_harness_ref` |

Wave 1〜4 の平均は 6.0 field、Wave 5〜6 は 4 field である。Wave 5 前後で、PR 本文の field 数は平均比で約 33% 減少した。これは構造の観測値であり、Efficiency の token や wall-clock の削減量ではない。

#### backfill と本文セクション

| 観測項目 | 結果 |
|---|---|
| `adf_pr` backfill | PR #2612 に「PR 作成後埋め戻し規約あり。本実行環境では PR 本文更新手段が無いため N/A 記録」とある。Wave 5 の `adf_pr` 廃止後は、この backfill は不要になった |
| 検証差分または検証記録 | 5/6 PR。#2613 は該当見出しなし、#2612 は `検証記録` の名称で記録 |
| Findings / Capture候補 | 6/6 PR |
| Design確定候補 | 5/6 PR。#2616 は該当見出しなし |

#### Issue と PR の観測数

| 対象 | 観測値 |
|---|---:|
| Issue コメント数 #2598、#2599、#2600、#2601、#2602、#2603 | 1、1、1、1、1、2、合計 7 |
| PR コミット数 #2611、#2612、#2613、#2614、#2615、#2616 | 1、1、4、1、1、1、合計 9 |
| Outcome | Issue 6/6 が completed、PR 6/6 が作成済み。Epic の子 Issue 6件も completed |

### 4.3 解釈の境界

上記は GitHub 成果物から取得できる構造観測値であり、harness の実行コストを表すものではない。field 数、コメント数、コミット数を token、wall-clock、tool call の代理値として扱わない。Baseline V2 以降の同一実行単位定義と同一測定手順による結果とのみ比較する。

## 5. サンプル不足の明記

本測定の委譲単位は Epic A の 6件である。30〜50 execution units は運用蓄積の目安であり、本 Issue の完了条件ではないが、分布、平均、削減効果を断定するにはサンプル不足である。特に telemetry 契約起因の実行失敗は本範囲で発生例を確認できず、発生しないとは断定しない。

## 6. observability gap と整備項目

| gap | 影響する指標 | 整備項目 |
|---|---|---|
| harness テレメトリが測定 Report として永続化されていない | wall-clock、token 4性質、tool call、path 再読込、source / projection 重複参照 | harness 側の message、part、tool call、token 生成元情報を、実行単位とともに読み取り専用で取得できる手順を整備する |
| harness session 識別子が取得できない | 実行単位と session の対応付け、Autonomy、処理区分 | 委譲実行時に harness session 識別子を取得できる手段を整備する。ADF 側の新しい必須 field は追加しない |
| 処理区分の時系列境界が GitHub から得られない | 区分別 wall-clock、区分別 token、Control / Coordination | harness の時系列履歴を分析時に読み取り、委譲単位と処理区分へ対応付ける |
| GitHub の Issue / PR timestamp が処理時間を表さない | wall-clock | harness の実行開始・終了時刻を分析時に取得する |

現状、`adf_harness_ref` は本対象 PR 6件すべてで `N/A` であり、harness 依存指標の測定可能状態は整っていない。これらの gap は ADF 側に新規永続 state、公開入口、workflow gate を追加せず、harness 側の既存生実行履歴を分析時に読み取る方向で扱う。

## 7. 検証対応

本 Report は、測定手順、測定可能な GitHub 観測値、observability gap、サンプル不足を既存 Report に保存することで REQ-048-016 の検証対応を示す。REQ-048-015 については、Legacy Baseline の実測値と定義を変更せず、Baseline V2 定義 Report §4 の比較可能範囲と非比較範囲を維持した。

本 Report の読み戻しでは、次の3点を確認できる。

1. 測定可能な状態と observability gap が保存されている。
2. 評価軸、指標定義、処理区分、Observation Tax を含む再現可能な測定手順が保存されている。
3. 6 execution units はサンプル不足であり、harness 指標と telemetry 契約起因の実行失敗を断定していない。

測定手順の定義は本 Report が所有し、分析スクリプト、公開入口、恒久 checker、新規永続 state は追加していない。
