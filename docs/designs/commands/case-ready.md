---
title: case-ready Design
status: accepted
created: 2026-09-14
updated: "2026-10-09"
---

<!-- ADF-COVERS(design): REQ-021-024 -->
<!-- ADF-COVERS(design): REQ-012-031（保存実体節が Definition 保存時点での設計根拠対応の未成立は保存を阻害しないことの design 対応） -->
<!-- ADF-COVERS(design): REQ-004-061 -->
<!-- ADF-COVERS(design): REQ-061-003 -->
<!-- ADF-COVERS(design): REQ-061-010, REQ-061-019, REQ-061-021, REQ-061-038, REQ-061-023, REQ-061-029, REQ-061-030, REQ-061-033, REQ-061-034, REQ-061-035, REQ-061-039, REQ-061-040, REQ-061-047, REQ-061-048, REQ-035-012, REQ-035-018 -->
<!-- ADF-COVERS(design): REQ-061-041, REQ-061-042, REQ-017-021, REQ-017-022, REQ-017-023, REQ-061-043, REQ-061-044, REQ-061-045, REQ-061-046, REQ-030-023 -->
<!-- ADF-COVERS(implementation): REQ-103-014 -->

# case-ready Command Design

本 Design が定義する case-ready は公開 command ではなく内部 lifecycle 段階である。公開 UX は要求入口（req-define、backlog-auto）と標準実行コマンド case-auto へ収斂しており、本段階は case-auto の orchestration から駆動される。本 Design は内部 lifecycle 段階の契約を定める正規文書である。
## 目的

case-ready の公開契約（入出力、副作用、安全性、承認境界、停止条件、順序契約）を定義する。case-ready は Definition の受入と実行準備完了への状態遷移を所有する主フローコマンドである（REQ-061）。

## 公開 interface

- 入力: Root Case（Issue 番号または URL）、関連する req_draft（存在する場合）、設計PR（存在する場合）
- 出力: ready 状態の Root Case、確定済み execution contract、実行構造（Standard は Root Case 単一 execution unit、Epic は Child Issue と Wave / 依存構造）
- 副作用: 設計PRの merge、REQ / Decision / Design の保存（Capability Skill 委譲）、Decision の accepted 遷移、Child Issue / Wave の作成、draft / RU の削除、Root Case の ready 遷移

## 内部構成

- Definition 受入: 設計PRの忠実性確認（req-define 合意内容との投影検査）、整合性検査、品質検査、merge 前の Draft 状態確認（pr_read の isDraft、REQ-061-032）。人間に留保された判断（REQ-096-005）の新規確定が不要で、既存の正規契約から導出できる解消と委譲された裁量の範囲内の判断（作業仮定の明示を含む）である場合は追加承認なしで自動確定・merge。人間に留保された判断（REQ-096-005）を新規に確定する必要がある場合、または既存の安全境界が要求する操作承認を要する場合は停止し HITL とする（REQ-061-003）。人間判断への移送の判定は語の使用（新しい Decision、意味変更、対象範囲の確定、意味的な不整合の解消）だけで行わず、当該判断が REQ-096-005 の留保事項に該当するか否かで行う。判断の難易度、確信度、評価器間の不一致、結果状態、唯一解でないことだけを理由として人間判断へ移送しない（REQ-096-003、REQ-096-004、REQ-096-006）。停止理由は REQ-096-012 の原因分類へ対応させる。proposed Decision の受理評価は REQ-061-021 の導出ベース判定を維持する
- overlap 突合（REQ-061-039）: 設計PR受入は、draft の宣言変更ファイル集合（artifact_actions の target 集合）と pr_changed_files 実報告の差分検査（overlap 突合）を含む。スタック構造（PR が兄弟 Case の commit を含む）や宣言・実報告の乖離を検出した場合は警告し、隔離 worktree での差分再構成手順に従って救済する。実効 squash diff が自 Case 分に収まった場合もスタック検出の警告は省略しない（スタック底が最後 merge の場合に空 diff / 同一領域競合となるリスクのため）
- 保存実体: REQ / Decision / Design の保存は req-file-manager、decision-file-manager、design-file-manager、artifact-validation へ委譲する。case-ready 自身は保存手続きを実装しない。REQ の保存では設計根拠対応が未成立の要件行が残っても保存を失敗させない（REQ-012-031。設計根拠対応の成立判定は ready 遷移ゲートの責務）
- canonical 再取得: merge 後に canonical Definition を再取得し、traceability check を機械実行する（REQ-061-023）。check は inline declaration と top-level `traceability/` 配下の sidecar を同じ論理的な対応関係へ正規化した対応関係全体を検査対象とする。プロジェクトの採用した工程・成果物規約が要求する設計根拠対応の欠落（missing-design）を検出した場合は case-open への差し戻し経路を扱う
- Design 対応ゲート: 対象 Definition の要件行ごとに、プロジェクトの採用した工程・成果物規約が要求する設計根拠対応（独立 Design 文書を必須とする採用の場合は Design 対応 1 件以上）が存在することを ready 遷移の必要条件とする（REQ-021-024、REQ-061-023。欠落残存時は ready へ遷移させない）。判定条件の前提となる工程・成果物規約は、採用済み規約から解決する（`../foundations/v5-adopted-conventions.md`）。採用宣言が存在しない間は移行期デフォルト（REQ-105-008）として当該プロジェクトの現に実効している運用を用い、採用機構の実装前でも判定経路は一意に解決する。verification policy（`traceability/policy.yaml`）との整合も同一の check で検証し、verification policy の不正を検出した場合は ready へ遷移させない
- 検証対応の作成責務: required 行の verification 対応の作成・更新は case-run が担い、missing-verification を含む対応完全性の最終検査は case-close の QG-4 が担う（REQ-021-015、REQ-021-018）。case-ready の ready 遷移条件に verification 対応の完全性を含めない。policy の既定値は required であり、optional は policy の明示指定のみで成立する。新規要件行を含む Definition は、その行の verification 対応が case-run で作成される前の状態で ready を通過できる
- 実行契約の確定: canonical Definition の確定後に、対象範囲（対象要件、主な変更対象、対象外）、関連 REQ/Decision/Design への必要な参照、実現方針（再判断してはならない合意がある場合のみ）、完了条件（条件、検証方法、合格条件、達成状態のチェックボックス形式と必要な品質検証の統合）を Issue 本文の対応する章へ確定する（REQ-017-001〜005）。work_type、scale、ユーザー明示 review 発動契約、Issue 構成の分類を Issue 本文の正規契約として確定しない
- 実行構造確定: 連結成分、3軸判断、単独根の Standard 化、構成検証（Epic サイズ上限、意味的依存の維持〔DAG 整合〕、全 operation_unit の Wave 割当）、子 Issue 確定後の変更対象重複検出（詳細は本 Design「v3 epic-wave-model Design からの吸収」節）。Epic の実行構成（子 Issue、Wave、意味的依存、子状態）は一つの表（`| Wave | Issue | 前提 | 状態 |`）として確定する。Wave は意味的依存 DAG のみから構成され、Wave サイズに実行時並列数・同時実行上限を適用しない（DEC-041、REQ-061-010、REQ-061-038）
- 横断依存検査: canonical Definition と未クローズ Case 群の同一パス重複・共有領域（トレーサビリティポリシー、sidecar 等）への登録重複需要の検出（警告+HITL 3選択肢、警告は ready 遷移判定を変更しない。REQ-061-029〜031）
- クリーンアップ: 成功後に draft / RU を削除する（blocked / failed / 中断時は保持）。設計PR を merge した Case では、merge 完結後に agentdev-git-worktree の手順に従い設計側 worktree（`.worktrees/{N}-definition`）を削除し、ローカル設計系ブランチ（`definition/issue-{N}`）を squash merge 後の条件付き -D 判定を経て削除する。実変更なし（設計PR 不在）の Case ではこの削除をスキップする。削除失敗時は警告表示して停止する

## 停止条件

- 対象設計PRが GitHub Draft PR（isDraft: true）の場合（pr_merge を実行せず blocked で停止。draft 解除の自動実行や正規 Tool 外の操作による復旧は行わない。REQ-061-032）
- 設計PRの CI / 品質検査失敗（ready 不遷移、既存 PR 保持で再実行可能）
- 人間に留保された判断（REQ-096-005）の新規確定が必要、または既存の安全境界が要求する操作承認を要する場合（HITL。REQ-061-003）
- canonical Definition の要件行に、プロジェクトの採用した工程・成果物規約が要求する設計根拠対応が欠落する行が残る場合（missing-design 検出、ready 不遷移、case-open への差し戻し。REQ-021-024）
- `traceability/policy.yaml` の不正を check が検出した場合（ready 不遷移。required 行の verification 対応欠落（missing-verification）は case-close の QG-4 最終完全性検査の対象であり、ready 不遷移条件に含めない）
- 構成検証の上限超過または構成不備
- proposed Decision の受理が正規契約から導出できず受理評価を確定できない（proposed のまま ready 不遷移。REQ-061-021 の導出ベース判定を維持）

## 冪等性

再実行時は merge 済み Definition、既存 Child Issue、既存 Wave / 依存構造、Decision 受理記録を再利用し、不足分のみ処理する。merge は巻き戻さない。

## v3 epic-wave-model Design からの吸収

本 Design は case-ready 構成判断基準、Wave 構成ルール、execution_unit 構成の依存ヒントと子 Issue 確定後の変更対象重複検出契約（REQ-061-019、REQ-031-027、REQ-035-012）を所有する。

- Wave 構成ルール: 必須依存（意味的依存）で結合した連結成分を Epic 候補とし、技術的依存（L0-L3）は Wave 構成のための情報として連結成分計算から外す。Wave は Epic 内の子 Issue 間の意味的依存 DAG からのみ構成される Epic Issue の実行構成から読み取る内部構造であり、Epic サイズ上限のみを上限とし子 Issue 数の Wave 上限を持たない（REQ-035-006、REQ-061-010、REQ-061-038、REQ-061-047）。Wave 構成は同一の意味的依存関係入力から決定的に導出され、実行上限の数値に依存しない（DEC-041）。Wave 割当は子 Issue 間意味的依存 DAG のトポロジカルレベル割当（各子 Issue の Wave 番号 = 前提列 DAG における最長経路深さ）と一致することを前提とし、依存エッジが存在しない子 Issue 集合はすべて同一 Wave に割り当てる（単一 Wave 前提。依存 0 件なら Wave 数 1 が機械的に導出される）。主題的近さ、ファイル重複、マージ順序の望ましさを Wave 分割の理由として採用せず、これらを理由とする構成は構成検証の最小性検査（REQ-061-048）で拒否する。最小性検査の回帰条件は scripts/self/release/wave-composition-purity.test.ts が機械検査として保持する。機械的判定手順は workflows/references/execution-unit-construction.md
- 子 Issue 確定後の変更対象重複検出契約: 同一 Wave 内の子 Issue 間の主な変更対象（子 Issue が実行単位として所有する宣言）の重複検出を子 Issue 確定時に実施し、検出結果を実行・統合時の競合リスク情報として Epic の実行構成・Wave 記録へ記録・引き渡す（REQ-061-019、REQ-035-012）。処置は変更対象分割・重複許容（衝突解消の担当とマージ順序の事前記録を含む）とし、Wave 分離を処置に含めない。ファイル重複のみを理由とした Wave 分離を行わず、検出不能の報告義務は維持する（取得不能を無変更・無重複と扱わない）。依存ヒント（同一ファイル衝突の抑制ヒント）は競合リスク信号であり Wave 分離の判断材料としない。実行側の正規所有者表明は case-run Design 吸収節（REQ-031-027）

## Decision受理評価時の承認記録整合

Decision受理評価でstatusをacceptedへ遷移させる際は、承認記録節がacceptedの現状と整合するかを確認する。proposed前提の記述が残る場合は、同じ保存工程で現状整合化する。

## 受け入れ義務の実行構成への投影完全性（REQ-061-041/042、REQ-017-021〜023、RU-20261004-08）

Definition 受入と実行構成確定における受け入れ義務保存の実行時投影。

- 設計PR受入の忠実性確認は、req-define での最新合意内容との照合を含む。必須受け入れ義務の欠落・縮小・反転を検出した場合は merge しない。
- 実行契約・実行構成の確定時、対象要件行と受け入れ義務が各実行単位（Standard Case では対象 Case、Epic では各 Child 実行単位または Epic 横断最終検証義務）のいずれかに対応付けられていることを確認する。対応先のない義務が存在する場合は投影不完全として実行準備完了（ready 遷移）としない。
- 完了条件は各条件について検証義務（何を証明するか、どの範囲で成立するか、いかなる反例で不合格か）と検証手段（具体的なテスト・コマンド等）を区別して Issue 本文へ確定する。
- 実行契約を生成した合意の変更が発生し影響する場合は、当該実行契約への反映と読み戻し確認が成立するまで、旧実行契約に基づく新規 dispatch または最終受け入れを行わない。

## Definition 適用直前の対象セクション照合

Definition 保存内部責務（case-ready / case-revise）は、draft の artifact_actions（append / update）を適用する直前に、組立時に使用した対象セクション・anchor・旧文と適用先の現状を照合する。

- 一致する場合のみ適用する。不一致の場合は古い全文で新しい編集を上書きせず、差異を示して影響する変更・判断を再確認させる
- 対象外のリポジトリ全体の版変更だけで全件を無効化しない。判断根拠となった契約（REQ・Design・Decision）の変更は本文一致とは別に再評価する
- 見出しの一致判定は完全一致のみとし、前方一致で類似する別見出しを選ばない（target-area-matching の規律と一致）

## 機械工程の script 呼び出し契約（RU-0162）

case-ready の機械工程（設計PRの忠実性・整合性・品質検査の実行、overlap 突合、AUTOGEN 対象 block の再生成差分検出、traceability check、merge 後の canonical 再取得、draft/RU 削除の git rm と明示パス指定 commit）は、工程別 script 1 回の呼び出しに束ねる。GitHub I/O（pr_read、pr_merge、Issue 本文更新）は Custom Tool agentdev_gh の境界を維持する。REQ/Decision/Design の保存実体（Capability Skill 委譲による保存手続き）は本 script の対象外とし、保存責務の委譲構造を変更しない。

- 入力 JSON / 報告 JSON / 終了コードの契約、品質ゲートの script 内実行（省略禁止）、inspect_cross_dependencies.ts と同じ作り（共通基盤不作成）、意味判断のモデル担当は、case-open Design「機械工程の script 呼び出し契約（RU-0162）」節と同一の規律に従う
- 報告 JSON には検査結果、再生成差分、警告、提案する Issue/PR 本文を含め、モデルは報告 JSON の意味レビューと agentdev_gh による I/O 実行のみを担う
- workflow skill 参照文面は script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
