---
id: CLEANUP-REQ048-DEAD-RESPONSIBILITY
title: "REQ-048 再構築 Dead Responsibility Cleanup 記録（OU-013 / WP-10）"
status: accepted
created: 2026-09-05
baseline_for: REQ-048 / DEC-027
source_issue: "#2610"
parent_epic: "#2597"
---

<!-- ADF-COVERS(verification): REQ-048-013, REQ-048-016 -->
# REQ-048 再構築 Dead Responsibility Cleanup 記録（OU-013 / WP-10）

## 本 Report の位置づけ

本 Report は REQ-048 再構築・測定・実験系 Epic（#2597）の Wave 7（OU-013 / WP-10、Issue #2610）で実施した、Dead Responsibility Cleanup（削除判定の落とし先実行）の記録である。実行時点で確定済みの削除判定のみを処理対象とし、対象スコープ（対象と対象外）の明示、削除済み機構の全使用箇所確認証跡、判定結果を記録する。

削除そのものを成功条件としない（DEC-027、REQ-048-013）。確定していない削除判定の実行は本 Case の対象外である。本 Report は既存の REQ、Decision、Design、配布物を変更しておらず、cleanup 実行結果の記録と残存確認のみを行う（REQ-048-016）。

## 1. 対象スコープ（対象と対象外）

### 1.1 対象（実行時点で確定済みの判定）

correlation field derivability 監査（`docs/reports/req-048-correlation-derivability-audit.md`、以下 derivability 監査）§6 decision で確定した判定のうち、構造的冗長性に基づく次の9判定を対象とする。いずれも Wave 5（Issue #2602、PR #2615、merge a0b5ac82、OU-005）で実施済みである。したがって本 cleanup における対象への作業は、新規削除の実行ではなく、実施済み判定の残存参照確認と同期漏れの有無判定である。

| 判定 | field | derivability 監査 §6 の判断 | 実施状況 |
|---|---|---|---|
| DELETE | `adf_phase` | `case-open` 固定の定数 | Wave 5 で削除済み |
| DELETE | `adf_upstream_confirmed` | 相関 field ではなく handoff 情報 | Wave 5 で削除済み |
| DELETE | `adf_pr` | PR API 番号との自己参照 | Wave 5 で削除済み |
| DELETE | `adf_result` | PR の存在から `completed-pr` を導出 | Wave 5 で削除済み（result 4状態契約自体は維持） |
| DELETE | `adf_parent` | delegation ID と親工程から導出 | Wave 5 で削除済み |
| MERGE | `adf_child` | `adf_delegation_id` と同値 | Wave 5 で統合済み |
| MERGE | `adf_delegation_purpose` | REQ-048-010 の処理区分評価へ統合 | Wave 5 で統合済み |
| NARROW | `adf_case` | Parent / Refs からの導出へ寄せる | Wave 5 で縮小実施済み |
| NARROW | `adf_execution_unit` | 自己参照を縮小し flow 判別を canonical relation 置換へ確認 | Wave 5 で縮小実施済み |

KEEP 判定3点（`adf_delegation`、`adf_delegation_id`、`adf_harness_ref`）は現行 baseline に維持される field であり、本 cleanup の作業対象から外れる（維持対象として明示）。

### 1.2 対象外

| 対象外 | 根拠 |
|---|---|
| 実験 G1〜G4 の empirical 判定（C1 検証差分、C2 structured handoff、C3 source / projection 再参照、C4 Review / Verification 実行条件） | 実験の実行・判定は後続実証Case候補へ分離済みで未実行であり、実行時点で empirical 判定は存在しない（Issue #2610 scope-affecting impact candidate、Epic #2597 scope-affecting impact candidate） |
| R-S1 Epic 状態件数サマリ、R-S2 `adf_execution_unit` の flow 判別部分、R-S3 `adf_case` の Standard flow 自己参照部分 | 削減候補ランキング §4.2 の「残存する導出可能候補」であり「候補」であって確定 DELETE 判定ではない。R-S2、R-S3 は Wave 5 で縮小実施済みの残置部分で、残置理由（直接 join と flow 判別の便益）が同 Report に記録済み |
| DEC-001 決定3 hard governance 8点 | hard governance（工程停止を要求する機械的強制）は DEC-001 決定3 で8点に限定されており、縮小評価の対象外として維持する |
| KEEP 判定 field（`adf_delegation`、`adf_delegation_id`、`adf_harness_ref`） | derivability 監査 §6 で KEEP 判定。再委譲 sequence を含む委譲相関と任意付加情報として現行 baseline の構成要素 |

## 2. 全使用箇所の確認証跡

### 2.1 確認方法

削除済み field 7種（DELETE 5: `adf_phase`、`adf_upstream_confirmed`、`adf_pr`、`adf_result`、`adf_parent`。MERGE 2: `adf_child`、`adf_delegation_purpose`）について、2026-09-05 に worktree 全域で grep を実行した。

- パターン: `adf_phase\b|adf_upstream_confirmed\b|adf_pr\b|adf_result\b|adf_parent\b|adf_child\b|adf_delegation_purpose\b`（単語境界付き正規表現。`adf_property` 等の部分一致誤検出を防ぐ）
- スコープ: worktree 全域（docs/、src/opencode/、.opencode/、.agentdev/ を含む）
- 判定対象の区別: `docs/reports/req-048-*.md` 内の言及は本 Epic の監査・測定記録（歴史的記録）であり対象外とする。`.agentdev/` 配下の learning inbox 等の歴史記録も対象外とする。配布物（`src/opencode/**`、`.opencode/**`）と `docs/designs/**` のヒットを判定対象とする

### 2.2 実測ヒット数

全域 grep の結果、統合パターンにヒットしたのは7ファイルのみであった。field 別の実測ヒット数は次のとおりである。

| field | 全域ヒット数 | `docs/reports` 内（歴史的記録・対象外） | `src/opencode/**` | `.opencode/**` | `docs/designs/**` |
|---|---|---|---|---|---|
| `adf_phase` | 14件 / 5ファイル | 13件 | 0件 | 0件 | 1件 |
| `adf_upstream_confirmed` | 12件 / 5ファイル | 11件 | 0件 | 0件 | 1件 |
| `adf_pr` | 23件 / 7ファイル | 22件 | 0件 | 0件 | 1件 |
| `adf_result` | 21件 / 6ファイル | 20件 | 0件 | 0件 | 1件 |
| `adf_parent` | 13件 / 5ファイル | 12件 | 0件 | 0件 | 1件 |
| `adf_child` | 14件 / 5ファイル | 13件 | 0件 | 0件 | 1件 |
| `adf_delegation_purpose` | 9件 / 4ファイル | 9件 | 0件 | 0件 | 0件 |

配布物側は、`src/opencode/` 全体と `.opencode/` 全体に対して統合パターンを個別に実行した結果、いずれも 0件 であった。`.agentdev/` 配下にもヒットはなかった（全域 grep のヒット7ファイルは上記の docs 側のみ）。

### 2.3 ヒット内容の分類

`docs/reports` 内のヒット（6ファイル、対象外の根拠: 本 Epic の監査・測定・ランキング記録そのもの）:

| ファイル | ヒットの性格 |
|---|---|
| `req-048-correlation-derivability-audit.md` | derivability 監査本体。判定の根拠記録（§6 decision 表、§4 判定等） |
| `req-048-candidate-ranking.md` | 削減候補ランキング。Wave 5 実施済み判定の実測値記録（§4.1） |
| `req-048-baseline-v2-audit.md` | Baseline V2 監査。縮小後 field 集合の監査記録 |
| `req-048-baseline-v2-measurement.md` | Baseline V2 測定。field 数の実測記録（PR 本文 field 6から4への減少等） |
| `req-048-baseline-v2-definition.md` | Baseline V2 定義。baseline 期間定義の根拠として「`adf_pr`、`adf_result` 等の field 廃止」を説明（L48） |
| `req-048-reanalysis-baseline.md` | 再分析 baseline。旧運用の実例記録として「`adf_pr` は作成後埋め戻しで確定」を記述（L97） |

`docs/designs` 内のヒットは `docs/designs/workflows/workflow-contracts.md` L394-395 の1か所に6 field が集中する:

> テンプレート種別と Parent 関係から機械判別できる。導出可能な固定値、自己参照値、同値 key（adf_phase、adf_upstream_confirmed、adf_pr、adf_result、委譲ブロックの adf_parent、adf_child）は field 集合から除去する。委譲目的は処理区分評価へ統合し、親子実行関係は委譲単位識別子と構造化文脈から導出する。

該当箇所を含む「ADF 実行識別情報の記録契約」セクションの最終更新コミットは a0b5ac82（Wave 5、PR #2615、OU-005）であり、git log で確認した。つまりこの記述は Wave 5 の縮小実施と同一変更で更新された baseline 宣言部分である。

## 3. 判定・結果

§2 の証跡に対する判定:

| ヒット箇所 | 区分 | 判定 |
|---|---|---|
| `docs/reports` 6ファイル（計 100 件） | (b) 歴史的・説明目的の言及 | 除去不要。本 Epic の監査・測定・ランキング記録そのものであり、判定経緯と実測値の SSoT。除去すると判定の根拠と履歴が失われる |
| `workflow-contracts.md` L394-395 | (b) 歴史的・説明目的の言及 | 除去不要。廃止 field を「field 集合から除去する」と規定する正の規範宣言そのものであり、廃止 field を現行の必須 field として要求していない。Wave 5 の縮小実施と同一変更で記述された。削除すると Design 側の「何を field 集合から除去したか」の規範記述が消失する |
| `src/opencode/**`、`.opencode/**` | (a) Wave 5 の同期漏れ | 該当なし。0件であり同期漏れは存在しない |

結論を明記する。

**該当なし（新規削除対象なし）**。Wave 5（PR #2615）で実施済みの DELETE 5 / MERGE 2 / NARROW 2 について、配布物への残存参照は 0件 で同期漏れはなく、実行時点で確定済みかつ未実施の削除判定は存在しない。確定していない判定（G1〜G4 の empirical 判定、R-S1〜S3）は §1.2 のとおり対象外であり、実行しない（DEC-027、Issue #2610 scope-affecting impact candidate）。

したがって本 PR では `src/opencode`、`.opencode` 配布物、Design、REQ、Decision の変更は行わない。本 Report の追加のみを変更単位とする。Epic #2597 の全 Wave 完了に伴う最終評価と Issue 完了条件チェックボックスの評価は case-close の責務である。

## 4. 検証記録

### 4.1 TS-013B 読み戻し検証

Report 保存後に本ファイルを読み戻し、次を確認する。

| 確認項目 | 結果 | 証拠 |
|---|---|---|
| 対象スコープ（対象と対象外）の明示 | 合格 | 本 Report §1.1、§1.2 |
| 全使用箇所の確認証跡（判定が「該当なし」の場合はその記録） | 合格 | 本 Report §2（実測ヒット数）、§3（該当なしの明記） |
| 削除実施時の docs-check 合格 | 該当なし（削除実施なし）。参考として docs-check を実行し §4.2 に記録 | 本 Report §4.2 |

### 4.2 検証差分

| 実行工程 | 検証種別 | 検証結果 | 新規 | 修正済み | 既出 | 撤回 | 無効 |
|---|---|---|---|---|---|---|---|
| case-run | 契約テスト `tim_declarations_contract.test.ts` | 23 pass、0 fail、52 expect、1 file | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | docs-check（変更文書限定検査） | failures 0 / warnings 0。coupled files に `docs/README.md` を含め確認（doc_map_update_required: false） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | エンコーディング検証（新規 Report） | BOM なし、CR なしを node で確認（UTF-8、LF のみ） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | 配布依存境界検査（check_distribution_boundary --profile source） | 実施不要。`src/opencode` 変更なし（§3 判定） | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |

実行コマンドは次のとおりである。

```text
bun test ./.opencode/skills/repo-agentdev-integrity/scripts/tim_declarations_contract.test.ts
bun run ./.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-run --files docs/reports/req-048-dead-responsibility-cleanup.md
node -e "const b=require('fs').readFileSync('docs/reports/req-048-dead-responsibility-cleanup.md'); console.log('BOM:', b.length>=3 && b[0]===0xEF && b[1]===0xBB && b[2]===0xBF, 'CR:', b.includes(13))"
```
