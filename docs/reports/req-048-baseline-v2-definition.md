---
id: BASELINE-REQ048-V2-DEFINITION
title: "REQ-048 再構築 Baseline V2 定義基盤（OU-006 / WP-06 Phase A）"
status: accepted
created: 2026-09-05
baseline_for: REQ-048（再構築版） / DEC-027
source_issue: "#2603 (OU-006 / WP-06 Baseline Documentation Reframe)"
parent_epic: "#2596 (REQ-048 再構築)"
---

<!-- ADF-COVERS(verification): REQ-048-015, REQ-048-016 -->
# REQ-048 再構築 Baseline V2 定義基盤（OU-006 / WP-06 Phase A）

## 本 Report の位置づけ

本 Report は REQ-048 再構築 Epic（#2596）の Wave 6（OU-006 / WP-06）で整備した Baseline V2 の定義基盤である。
Baseline V2 の測定（後続 Epic #2597、OU-007）は本 Report の定義に従う。
本 Report は既存成果物種別（Report）への保存であり、測定専用の新規成果物種別、実行履歴 DB、恒久 checker、公開入口を新設しない（REQ-048-016、DEC-027 決定6、DEC-001 決定4）。
定義の所有は Report 側に置き、将来の機械化は定義を変更せずに手順をスクリプト化する形で行う（docs/reports/req-048-reanalysis-baseline.md の境界条項と同一の枠組み）。

## 1. Baseline V2 の定義

Baseline V2 とは、「本要件再構築時点の GitHub 最新 ADF control plane」である。

- 対象は REQ-048 再構築（Epic #2596）完了時点で main ブランチへ統合済みの ADF 配布物（command、skill、template）、docs（REQ、Decision、Design、Report）、repo-local 検査基盤の全体である
- 機構の追加量ではなく、当該時点の control plane が備える統制・補助機構の集合を対象とする（DEC-027）
- Legacy Baseline（2026-08-22 の改善前分析、docs/reports/req-048-reanalysis-baseline.md）とは実行単位の定義と測定単位が異なる別系統の基線である

## 2. baseline commit SHA 固定手順

Baseline V2 の測定は、測定実行時の GitHub 最新 default branch（origin/main）commit SHA を固定記録することで再現可能にする。
Phase C（structural redundancy 縮小、Wave 5 Issue #2602 / PR #2615）を測定前に実施済みであるため、original start commit と structurally normalized commit のどちらを baseline としたかを次の手順で固定記録する。

1. 測定実行時に `git fetch origin main` を実行し、`git rev-parse origin/main` で GitHub 最新 default branch SHA を取得する
2. 取得した SHA が structurally normalized commit の子孫であることを `git merge-base --is-ancestor <structurally-normalized-SHA> origin/main` で確認する。子孫でない場合、Phase C が未反映の baseline となり本手順の前提が崩れるため、測定を開始せずその判断を測定 Report に記録する
3. baseline の選択は「structurally normalized commit を含む測定時 origin/main」で確定する。original start commit は構造差の説明のための参照値であり、baseline とはしない
4. 測定 Report に次の3点を固定記録する。取得した baseline SHA、子孫確認の結果、実行日時

### 本定義時点の参照値（2026-09-05 固定）

| 項目 | commit SHA | 内容 |
|---|---|---|
| original start commit | `94746a33fb3e2160ceeb677d44a1fceac4232ce6` | REQ-048 再構築自走の起点（Wave 1 監査 BASELINE-REQ048-V2-AUDIT と同一値） |
| structurally normalized commit | `a0b5ac82c776a714c133c8245fce90c99dd1a836` | Phase C（structural redundancy 縮小、Issue #2602 / PR #2615）の main 統合コミット |
| 本定義時点の origin/main | `ea635c1b03fe41c6c5a0c738c16642e792e28567` | 本 Report 作成時に `git fetch origin main` 後 `git rev-parse origin/main` で取得。structurally normalized commit の子孫 |

選択: Phase C を Baseline V2 測定前に実施済みであるため、baseline は structurally normalized commit（`a0b5ac82...`）を含む測定時 origin/main とする。
original start commit を baseline とした場合、Phase C による構造変化（adf_pr、adf_result 等の field 廃止）が測定対象から欠け、OU-002〜005 の縮小の効果が Baseline V2 側へ帰属しない。

## 3. 測定指標

Baseline V2 の測定で用いる評価軸と指標の定義は REQ-048 が正である。本 Report は評価軸と観測対象の対応を整理する。

| 評価軸 | 対応 REQ 行 | 観測対象の概要 |
|---|---|---|
| Outcome | REQ-048-006 | 実行が達成した成果（result 契約の4状態、PR 作成の成否等） |
| Efficiency | REQ-048-006、REQ-048-007 | wall-clock、token（input、output、cache read、cache write を性質別に区別）、tool call、同一 path 再読込、子実行間の同一 path 再読込、source / projection 重複参照 |
| Quality | REQ-048-006、REQ-048-008 | 工程ごとの incremental value（当該工程で初めて確認された actionable finding の比較） |
| Autonomy | REQ-048-006、REQ-048-009 | human intervention、user-decision-required、blocked、failed、delegation-unavailable、self-heal、stop、resume の区別 |
| Control / Coordination | REQ-048-006、REQ-048-010 | 処理区分（Context / Exploration、Implementation、Review、Verification、Orchestration / Recovery）への対応付け、並列実行の追加 token、重複作業、競合、fan-in 後修正 |
| Observation Tax | REQ-048-005 | 観測・統制機構自身の cost / redundancy（token、wall-clock、tool call、重複読み書き、orchestration、maintenance / contract complexity）。DEC-027 決定2の Benefit / Cost 対比較の Cost 側に対応 |

指標の算出方法は REQ-048 の各行定義に従い、実験の登録形式・測定手続きの詳細は Design が所有する（DEC-027 決定6）。
本 Report は指標の追加定義をしない。

## 4. 比較可能範囲・非比較範囲の境界

### 比較可能範囲

- Baseline V2 と、Baseline V2 以降に同一の指標定義で実施した測定・実験結果の比較
- 同一の実行単位定義（委譲単位識別子、実行識別情報に基づく機械対応付け）で算出した指標同士の比較
- Benefit / Cost の対比較（DEC-027 決定2）における Baseline V2 測定値の使用

### 非比較範囲

- Legacy Baseline（2026-08-22 の改善前分析、97論理実行単位、総計約 67.9 億トークン等の実測値）との直接比較。実行単位の定義、token の性質構成、機械対応付けの availability が異なるため、数値の単純比較は行わない
- 新しい評価指標を Legacy Baseline の実測値へ遡って適用する retro-fit。行わない
- Baseline V2 と Phase C より前の構造（original start commit 時点）の機構集合との比較。構造差は Wave 1〜5 の監査・実施記録を参照して説明し、測定値の直接比較に代えない

## 5. 検証対応

本 Report は REQ-048-015（Legacy Baseline の保持、定義的性質の明示、比較可能範囲と非比較範囲の区別）と REQ-048-016（評価結果の既存成果物への保存）の検証対応として、再枠付け済み Legacy Baseline 資料（docs/reports/req-048-reanalysis-baseline.md）と本 Report の読み戻し検証（Issue #2603 テスト戦略 TS-005）を対応付ける。
