---
title: "IR-073: untracked-residue"
status: accepted
created: 2026-10-22
updated: 2026-10-22
---

# IR-073: untracked-residue

<!-- ADF-COVERS(design): REQ-010-084 -->

| Field | Value |
|-------|-------|
| rule_id | IR-073 |
| description | リポジトリの未追跡かつ gitignore 管理対象外のファイル・ディレクトリの残存を検出する恒常検査である（REQ-010-084 準拠の新規検査クラス、Case #3841）。許容は gitignore（正規の非追跡領域宣言）と承認一覧（baselines/ng-baseline.json。既存の ng-baseline 機構と同一の物理実体で管理する category/check/file/evidence/count/provenance/reason の恒久承認記録）で管理し、承認一覧対象外の検出は NG として終了コードを駆動し、承認済み検出は承認記録（`[baseline-known provenance=...]` 付き info）として報告にとどめる。承認の追加は検出契機ごとに人間の運用判断による明示承認（provenance 付き baseline 登録）として記録され、検査実行が承認を自動追加しない |
| severity | strict |
| category | repository-state-drift |
| detection_method | `check_integrity.ts`（`checkUntrackedResidue`）による検出。`git ls-files --others --exclude-standard`（repo root 実行）で未追跡かつ gitignore 管理対象外のファイルを再帰列挙し、ディレクトリ残存は配下ファイルの検出として扱う。`--directory` は無視対象のみを含むディレクトリまで列挙するため使用しない。git 作業ツリーでない環境では info で skip する（検査が原理的に成立しないため、IR-072 の git 履歴不在時 info スキップと同一扱い）。検出報告のメッセージには gitignore 追加の提案（正当な非追跡領域のため）と承認一覧登録手順の案内を含む。承認済み検出の demote は main の `applyNgBaseline`（bucket: category=UntrackedResidue / check=untracked-residue / file=対象パス / evidence 空値）により行う |
| affected_artifacts | [リポジトリ全体（git 作業ツリー）] |
| related_req | [REQ-010-084] |
| related_design | [../checker-execution-contracts.md, ../integrity-rule-catalog.md] |
| gate_level | full-audit |
| false_positive_risk | 低。gitignore 管理対象外の未追跡ファイルのみを計上するため、正規の非追跡領域宣言（gitignore）済みパスは検出しない。 checker 自身の報告ファイル出力先（`.agentdev/integrity/reports/`）等の検査基盤由来パスは gitignore 宣言済みのため検出しない。導入時点の対象リポジトリに未追跡残存が既存する場合は導入直後の自己適用で NG が発生し得る（本 Case の対象リポジトリ baseline は未追跡 0 件であることを Case #3841 で確認済み。検出時は gitignore 追加または承認一覧登録を人間の運用判断で処置する） |
| regression_test | `check_integrity.test.ts` describe "IR-073 untracked-residue (REQ-010-084)"。陽性例（repo root 直下と `.agentdev` 配下非契約パスの未追跡残存を NG 検出）・許容例（gitignore 管理対象の `.agentdev/tmp/` は検出しない）・承認例（ng-baseline.json 承認一覧登録分は `[baseline-known provenance=...]` 付き info として承認記録報告し NG にしない。未承認残存は NG のまま終了コードを駆動）・案内例（検出報告に gitignore 追加提案と承認一覧登録手順の案内を含む）・クリーン状態例（未追跡残存 0 件時は ok 報告）の fixture（git init + base commit + 残存 seed） |
| finding_route | intake |
| triage_action | 正規の非追跡領域であれば `.gitignore` への追加を提案し、恒久的な許容であれば provenance 付きで承認一覧（baselines/ng-baseline.json）へ人間の運用判断で明示登録する。それ以外は commit して git 管理状態へ置く。本検査が承認を自動追加することはない |
| last_verified | 2026-10-22 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | 未追跡かつ gitignore 管理対象外のファイル・ディレクトリが承認一覧対象外に残存しないこと | strict fail（検出 1 件ごとに 1 finding。終了コード駆動） |
| 2 | 承認一覧（ng-baseline.json、provenance 付き恒久承認記録）に登録済みの検出は承認記録として報告し、NG にしないこと | 設計要件 |
| 3 | 検査実行が承認を自動追加しないこと（承認追加は検出契機ごとの人間の明示承認） | 設計要件 |
| 4 | git 作業ツリーでない環境では info スキップとすること（fail にしない） | 設計要件 |
| 5 | 検出報告に gitignore 追加の提案と承認一覧登録手順の案内を含めること | 設計要件 |

## exemption（許容条件）

| 対象 | 理由 |
|------|------|
| gitignore（正規の非追跡領域宣言）対象パス | gitignore 管理対象は本検査の検出対象外（`--exclude-standard` が除外） |
| 承認一覧（baselines/ng-baseline.json）登録パス | provenance 付き恒久承認記録。承認済み検出は承認記録として報告にとどめる |
| git 作業ツリーでない環境 | 検査自体が成立しないため info スキップ |

## baseline 運用

承認一覧は既存の ng-baseline 機構と同一の物理実体（baselines/ng-baseline.json）で管理する（REQ-010-084 の単一物理実体要件）。bucket は category=UntrackedResidue / check=untracked-residue / file=対象パス / evidence 空値で、count、provenance、reason を必須とする。承認の追加は `--update-ng-baseline` と additions manifest（provenance / reason 必須、fail-closed）または手動編集のいずれかで行い、検査実行が承認を自動追加しない。導入時点で対象リポジトリの未追跡残存が 0 件である baseline（Case #3841 で確認済み）を前提とするため、初期承認登録は不要である。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [checker-execution-contracts.md](../checker-execution-contracts.md)（REQ-010-084 の design 対応）
- [IR-072-req-updated-freshness.md](IR-072-req-updated-freshness.md)（git 履歴不在時 info スキップの前例）
