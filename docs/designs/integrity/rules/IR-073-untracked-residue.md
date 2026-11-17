---
title: "IR-073: untracked-residue"
status: accepted
created: 2026-10-22
updated: "2026-11-18"
detection_method_class: machine-check
implementation_path: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
verification_path: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts
---

# IR-073: untracked-residue

<!-- ADF-COVERS(design): REQ-010-084 -->

| Field | Value |
|-------|-------|
| rule_id | IR-073 |
| description | リポジトリの未追跡かつ gitignore 管理対象外のファイル・ディレクトリの残存を検出する恒常検査である（REQ-010-084 準拠の新規検査クラス、Case #3841）。許容は gitignore（正規の非追跡領域宣言）で管理し、検出は全件を NG として終了コードを駆動する（baseline による承認一覧の運用は撤廃済み。検出違反は gitignore 追加または commit による直接解消で扱う） |
| severity | strict |
| category | repository-state-drift |
| detection_method | `check_integrity.ts`（`checkUntrackedResidue`）による検出。`git ls-files --others --exclude-standard`（repo root 実行）で未追跡かつ gitignore 管理対象外のファイルを再帰列挙し、ディレクトリ残存は配下ファイルの検出として扱う。`--directory` は無視対象のみを含むディレクトリまで列挙するため使用しない。git 作業ツリーでない環境では info で skip する（検査が原理的に成立しないため、IR-072 の git 履歴不在時 info スキップと同一扱い）。検出報告のメッセージには gitignore 追加の提案（正当な非追跡領域のため）を含む |
| affected_artifacts | [リポジトリ全体（git 作業ツリー）] |
| related_req | [REQ-010-084] |
| related_design | [../checker-execution-contracts.md, ../integrity-rule-catalog.md] |
| gate_level | full-audit |
| false_positive_risk | 低。gitignore 管理対象外の未追跡ファイルのみを計上するため、正規の非追跡領域宣言（gitignore）済みパスは検出しない。 checker 自身の報告ファイル出力先（`.agentdev/integrity/reports/`）等の検査基盤由来パスは gitignore 宣言済みのため検出しない。導入時点の対象リポジトリに未追跡残存が既存する場合は導入直後の自己適用で NG が発生し得る（本 Case の対象リポジトリ baseline は未追跡 0 件であることを Case #3841 で確認済み。検出時は gitignore 追加または commit を人間の運用判断で処置する） |
| regression_test | `check_integrity.test.ts` describe "IR-073 untracked-residue (REQ-010-084)"。陽性例（repo root 直下と `.agentdev` 配下非契約パスの未追跡残存を NG 検出）・許容例（gitignore 管理対象の `.agentdev/tmp/` は検出しない）・案内例（検出報告に gitignore 追加提案を含む）・クリーン状態例（未追跡残存 0 件時は ok 報告）の fixture（git init + base commit + 残存 seed） |
| finding_route | intake |
| triage_action | 正規の非追跡領域であれば `.gitignore` への追加を提案し、恒久的な許容であれば `.gitignore` 宣言へ人間の運用判断で明示登録する。それ以外は commit して git 管理状態へ置く |
| last_verified | 2026-10-22 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | 未追跡かつ gitignore 管理対象外のファイル・ディレクトリが残存しないこと | strict fail（検出 1 件ごとに 1 finding。終了コード駆動） |
| 2 | 検出は全件を NG として報告し、免除・降格を行わないこと | 設計要件 |
| 3 | 許容の追加（`.gitignore` への追加）は人間の運用判断による明示判断であり、検査実行が許容を自動追加しないこと | 設計要件 |
| 4 | git 作業ツリーでない環境では info スキップとすること（fail にしない） | 設計要件 |
| 5 | 検出報告に gitignore 追加の提案を含めること | 設計要件 |

## exemption（許容条件）

| 対象 | 理由 |
|------|------|
| gitignore（正規の非追跡領域宣言）対象パス | gitignore 管理対象は本検査の検出対象外（`--exclude-standard` が除外） |
| 検査基盤由来パス（`.agentdev/integrity/reports/` 等） | gitignore 宣言済みのため検出対象外 |
| git 作業ツリーでない環境 | 検査自体が成立しないため info スキップ |

## baseline 運用（撤廃済み）

baseline による既知違反の免除管理・delta 運用は撤廃済みである（REQ-010-074/079、Epic #4126 Phase 4）。導入時点の既知違反は全件解消済みであり、現行の検出違反は免除せず対象側の直接修正で即時解消する。新規違反は strict fail として失敗する。
## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [checker-execution-contracts.md](../checker-execution-contracts.md)（REQ-010-084 の design 対応）
- [IR-072-req-updated-freshness.md](IR-072-req-updated-freshness.md)（git 履歴不在時 info スキップの前例）
