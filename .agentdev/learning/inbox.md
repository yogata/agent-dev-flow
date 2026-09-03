# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---
## 2026-09-02: worktree/junction なし環境の IR-068 環境依存 fail は由来分類（環境ラベル併記）を PR 本文へ記録する

- **問題事象**: worktree 環境（.opencode/ junction 未伝播）では IR-068 skill-projection-manifest 検査が manifest↔src 差分 4件（japanese-tech-writing manifest-only、3 skill src-only）を NG として報告する。checker 自身が環境判定 INFO を併記しており、本来の変更起因の検出と混在し得る
- **発生局面**: case-run の bun test ①（integrity suite）実行時
- **検知方法**: PR #2525 の case-run で IR-055 baseline delta 検証を stash 比較で実施した際、環境依存 fail の由来を分類した
- **根本原因**: worktree 内で junction が伝播しない環境差があり、checker の配布スコープ走査が main 環境と異なる
- **自律対応内容**: 環境ラベル（worktree / junction なし）を PR 本文の検証差分へ併記し、環境依存 fail の由来分類を記録する運用を実例化した
- **ユーザー確認の有無**: なし（エージェント自律）
- **ADR/REQ/spec影響**: なし（運用実例の記録。checker 側の環境差吸収は別途判断）
- **横展開観点**: IR-055/IR-068 以外の worktree 環境依存検査（docs-check 検査群）にも同様の環境ラベル併記を適用可能
- **再発条件**: worktree 内での integrity suite 実行時に毎回発生
- **予防策候補**: 検証環境の記録と再現条件を PR 本文へ記録する運用のテンプレート化（検証差分セクションの環境ラベル欄）
- **想定反映先**: agentdev-workflow-orchestration（検証結果記録規約）、learning-pipeline
- **関連**: PR #2525、#2501、intake inbox「2026-09-01-worktree-junction-skill-projection-manifest-diffs」
- **タグ**: #worktree #junction #ir-068 #環境依存 #検証記録

---
## 2026-09-02: harness 異常終了後の PR 再利用時は PR 本文置換ができずコメントを SSoT とする

- **問題事象**: 初回委譲（DEL-2509-1）が harness 異常終了で中断した後、再委譲（DEL-2509-2）が残留 commit を利用して同一 PR を完成させたが、PR 本文の実行識別情報・検証差分は旧版（検証未実施状態を示す）のまま残った。PR 本文の更新は Custom Tool（agentdev_gh）の操作契約に pr edit が存在せず、gh-write-guard fail-closed により生 gh pr edit も不可
- **発生局面**: case-run 再委譲 → case-close（PR マージ前の SSoT 確認）
- **検知方法**: case-close が PR 本文と PR コメントの乖離を検知（Epic #2504 Wave 1、Issue #2509）
- **根本原因**: PR 本文置換の操作契約不在（fail-closed 設計）と、委譲異常終了時に PR 本文が旧版のまま残留する構造
- **自律対応内容**: DEL-2509-2 完了報告コメント（検証結果の SSoT）を正として処理し、case-close の対応記録コメントへ「コメント正・本文は archive」の正規記録を実施して虚偽記載状態を解消した
- **ユーザー確認の有無**: なし（handoff コンテキストで判断方針を事前指示され、case-close 責務として判断）
- **ADR/REQ/spec影響**: なし（運用知見。case-close command Design の PR 本文とコメントの乖離時の扱い明記が将来候補）
- **横展開観点**: case-run の再委譲手順（case-run command Design）に「PR 再利用時は実行識別情報の乖離を完了報告コメントへ明示」を追記可能
- **再発条件**: harness 異常終了後に PR を再利用して継続実行する場合
- **予防策候補**: case-run の委譲 handoff に「PR 本文の実行識別情報更新可否」の確認ステップ追加。case-close に「PR 本文とコメントの乖離検知」チェックの恒久化
- **想定反映先**: case-run command Design（再委譲手順）、case-close command Design（乖離時の扱い）、agentdev-gh（pr edit 契約の要否判断）
- **関連**: PR #2522、Issue #2509、Epic #2504
- **タグ**: #case-run #再委譲 #gh-write-guard #pr-comment-ssot #fail-closed

---
## 2026-09-02: REQ-057-005 確定後は ADF-COVERS 宣言を PR 本文へ記載せず docs 配下正規成果物へ配置する

- **問題事象**: 従来、PR 本文冒頭へ ADF-COVERS 宣言を記載する運用が混在していた。REQ-057-005（ADF-COVERS 宣言の正規配置は docs 配下の正規成果物）の確定後は、docs 配下外の PR 本文への宣言記載は正規配置と矛盾し、traceability の宣言完全性の二重情報源になる
- **発生局面**: case-run の REQ-057 OU-003（Issue #2510）実装時の配置判断
- **検知方法**: REQ-057-005 の実装対応宣言を traceability-model.md へ配置した時点で、PR 本文記載運用との矛盾に PR #2528 が言及
- **根本原因**: 宣言の正規配置先が REQ 側で未確定の間に、PR 本文への便宜的记忆が慣行として残存していた
- **自律対応内容**: PR #2528 から ADF-COVERS 宣言を PR 本文へ記載しない判断を実例化し、実装対応宣言を docs 配下正規成果物（traceability-model.md、verification-scope-catalog.md、integrity-contracts.md、docs/designs/README.md）へ配置した
- **ユーザー確認の有無**: なし（エージェント自律）
- **ADR/REQ/spec影響**: なし（REQ-057-005 の既定どおりの運用確定。新規 Decision は不要）
- **横展開観点**: PR 本文への宣言記載を行う既有 PR（Wave 1 以前）は過去記録として維持し、遡及削除はしない。以降の新規 PR は docs 配下正規配置のみ
- **再発条件**: 宣言の正規配置方針を知らない委譲先が PR 本文へ宣言を記載する場合
- **予防策候補**: case-run 委譲 handoff のテンプレートに「宣言は docs 配下正規成果物へ配置（PR 本文記載禁止）」の明示追加
- **想定反映先**: agentdev-traceability（宣言配置ガイダンス）、case-run command Design（委譲 handoff 項目）
- **関連**: PR #2528、Issue #2510、Epic #2504
- **タグ**: #adf-covers #traceability #宣言配置 #pr-本文 #req-057

---
## 2026-09-02: 委譲コンテキストの概要記述が Issue 本体と乖離する場合は SSoT 再構成契約（Issue 本文・Epic 分解表・REQ 行の永続状態3点一致）で特定する

- **問題事象**: 委譲コンテキスト（structured_context・ENVIRONMENT NOTES）の概要記述が Issue #2517 本体と乖離していた事象: 委譲 prompt 側の概要に本 Issue の内容ではなく別 Issue（#2521・OU-014 ID 衛生ガイダンス・REQ-057-019 系・skill-authoring SKILL.md 追記）の内容が記載されていた
- **発生局面**: case-run 委譲 → case-close（Epic #2505 Wave 1）
- **検知方法**: SSoT 再構成契約（Issue 本体・Epic 分解表・REQ 行の永続状態3点一致）により #2517 は REQ-057-020（OU-015・pr_desc.md 変更）と特定して実施できた
- **根本原因**: case-run orchestration の委譲 prompt 概要生成が Issue 本体から乖離する（概要生成の出典が Issue 本体でない・手動記述混入の可能性）
- **自律対応内容**: 永続状態3点一致で対象 Issue の正しい内容を特定し、乖離した概要記述に従わず実施した。乖離事象を PR 本文の learning 候補として記録
- **ユーザー確認の有無**: なし（エージェント自律）
- **ADR/REQ/spec影響**: なし（既存 SSoT 再構成契約の適用実例。新規規約は不要）
- **横展開観点**: 概要記述と永続状態が乖離する全委譲（Wave 並列で複数 Issue が同時進行する場合特にリスク大）に適用可能
- **再発条件**: 委譲 prompt の概要が手動または別 Issue 由来で生成される場合
- **予防策候補**: case-run orchestration の委譲 prompt 概要生成を Issue 本文からの機械抽出に限定する
- **想定反映先**: case-run command Design（委譲 prompt 生成規約）、agentdev-workflow-orchestration
- **関連**: PR #2531、Issue #2517、Epic #2505
- **タグ**: #case-run #委譲コンテキスト #ssot #issue-乖離 #epic-2505

---
## 2026-09-02: req-save で REQ 行の是正（文書品質是正等）を実施した場合は ADF-COVERS(implementation) 宣言の付与を確認する

- **問題事象**: REQ-057-013（REQ 文書の表記・文意）の implementation 宣言が corpus に存在せず、traceability check の missing-implementation が継続検出される。実装自体（REQ-004:67・REQ-006:27-32・REQ-036:10,41 の文書品質是正）は req-save a2adf328 で完了済みだが、是正時に対応宣言が付与されていなかった
- **発生局面**: req-save（文書品質是正の artifact_actions 実行）→ 後続 case-run の traceability check
- **検知方法**: PR #2536 の case-run で traceability check --req REQ-057-012,REQ-057-013 が missing-implementation（REQ-057-013）を検出
- **根本原因**: req-save の是正実行時に、修正した REQ ファイルへの ADF-COVERS(implementation) 宣言付与が artifact_actions の確認対象に入っていない
- **自律対応内容**: 宣言の即時付与は case の対象外のため実施せず、learning として回収。なお REQ-057-013 は状態要件であり、宣言先は REQ-057.md 自体ではなく是正対象ファイル（REQ-004.md・REQ-006.md・REQ-036.md）である点に注意
- **ユーザー確認の有無**: なし（エージェント自律）
- **ADR/REQ/spec影響**: なし（宣言付与運用の漏れ是正。REQ-057-005 の正規配置方針と矛盾しない）
- **横展開観点**: req-save 経由の REQ ファイル修正を伴う全 artifact_actions に適用可能。REQ-057-012/014 のように case-run で付与する形態（PR #2536/#2535 で解消）と req-save で付与する形態の分担整理の材料
- **再発条件**: req-save の artifact_actions で REQ ファイル本文を修正し、対応宣言の付与確認が行われない場合
- **予防策候補**: req-save の検証工程に「修正 REQ ファイルへの implementation 宣言付与確認」ステップの追加候補
- **想定反映先**: agentdev-req-file-manager（宣言付与確認）、agentdev-traceability（check の代替経路案内）
- **関連**: PR #2536、Issue #2519、Epic #2505、req-save a2adf328
- **タグ**: #traceability #adf-covers #req-save #宣言付与漏れ #req-057-013

---
## 2026-09-03: 配布物の不在 ID 参照残骸の是正は現行 REQ 番号への置換でなく概念名参照へ（REQ-029 との交点）

- **問題事象**: 不在 ID 参照残骸（センチネル S-08/S-09）を是正する際、現行 REQ 番号（REQ-001-018、REQ-036 等）へ置換すると REQ-029 配布依存境界（配布物への concrete-id 禁止）に抵触する。二重制約の存在を事前に把握しないと自然な修正先で境界違反を生む
- **発生局面**: Issue #2538（PR #2539）の case-run センチネル S-08/S-09 是正時
- **検知方法**: 配布依存境界 最終 gate（check_distribution_boundary.ts --profile source）の concrete_id_hits 検出と、実行経過での暫定導入→撤回の過程
- **根本原因**: 参照残骸の自然な修正先が「現行 ID への置換」と思いがちだが、配布物は REQ/Decision の具体 ID 参照を禁じる境界契約と共存する
- **自律対応内容**: 不在 ID 参照残骸除去の形へ確定し、概念名（「文書品質契約の肯定文規定」「inspect ライフサイクル」等）での参照へ表現を統一した。具体 ID は docs 側正規文書に集約
- **ユーザー確認の有無**: なし（エージェント自律）
- **ADR/REQ/spec影響**: なし（REQ-029 / REQ-053-005 の既定適用。新規 Decision 不要）
- **横展開観点**: 配布物の規範参照全般に適用可能（具体 ID は docs 側に集約する運用）
- **再発条件**: 配布物内の ID 参照残骸を修正する場合
- **予防策候補**: センチネル検査 Design の S-08/S-09 項目に「置換先は概念名参照」の注意追記候補
- **想定反映先**: docs/designs/integrity/prose-quality-sentinel-checks.md（S-08/S-09 の検出方式補足）、agentdev-doc-writing
- **関連**: PR #2539、Issue #2538
- **タグ**: #req-029 #配布依存境界 #センチネル #参照残骸 #概念名参照

---
## 2026-09-03: checker CLI は bun + Windows で process.exit により stdout が失われることがありモジュール import 経由が安定

- **問題事象**: `check_distribution_boundary_cli.ts` を bun で実行すると process.exit により stdout（JSON レポート）が失われることがある（Windows + bun 1.3.6 で再現）
- **発生局面**: Issue #2538（PR #2539）の case-run 配布依存境界検証時
- **検知方法**: CLI 実行の stdout 欠落を観測し、モジュール import 経由（node --experimental-strip-types）で再検証して安定出力を確認
- **根本原因**: bun の process.exit タイミングと stdout フラッシュの競合（環境差）
- **自律対応内容**: stdout 証跡退避の代替経路としてモジュール import 経由を使用し、実行経路と結果を PR 本文へ記録
- **ユーザー確認の有無**: なし（エージェント自律）
- **ADR/REQ/spec影響**: なし（checker 実行契約への実行経路追記候補の知見）
- **横展開観点**: process.exit を呼ぶ checker CLI 全般で同様の環境差が発生し得る
- **再発条件**: Windows + bun で exit code を持つ checker CLI を実行する場合
- **予防策候補**: checker 実行契約と検出基盤規則（docs/designs/integrity/checker-execution-contracts.md）に安定実行経路（モジュール import 経由）を追記
- **想定反映先**: agentdev-workflow-case-close（STEP-3 docs 検証）、checker-execution-contracts.md
- **関連**: PR #2539、Issue #2538
- **タグ**: #checker #bun #windows #stdout #実行経路

---
## 2026-09-03: agentdev_gh の pr_read 応答に PR 本文が含まれない場合は読み取り系 gh CLI へフォールバックする

- **問題事象**: Custom Tool agentdev_gh の pr_read 操作が title/state/mergeable のみを返し PR 本文（body）を含まないため、PR 本文を SSoT とする case-close の Capture 回収・検証差分読取が Tool 単独で完結しない。pr_mergeable も verification-incomplete で読み戻しが不完備になる事象を同時観測
- **発生局面**: Issue #2538（PR #2539）の case-close STEP-1 情報収集時
- **検知方法**: pr_read 応答の body 欠落を観測。委譲契約の「読み取り系 gh は可」範囲内で gh pr view --json body,files へフォールバックして SSoT 読取を完了
- **根本原因**: pr_read 操作契約の応答フィールドに body が含まれない（環境依存で欠落する）構造。読み戻し検証が不完備のまま fallback 情報（canContinue: true）を返す設計
- **自律対応内容**: 読み取り系 gh CLI へフォールバックし、PR 本文・変更ファイル一覧の取得を完了。破壊的操作は Custom Tool 委譲の契約を維持
- **ユーザー確認の有無**: なし（エージェント自律）
- **ADR/REQ/spec影響**: なし（Custom Tool 操作契約の知見）
- **横展開観点**: pr_mergeable / issue_read 等の他操作でも読み戻し不完備は起こり得る。fallback 手順の一般化候補
- **再発条件**: pr_read の応答で PR 本文を必要とする工程（case-close STEP-1 情報収集、STEP-6 Capture 回収等）
- **予防策候補**: Custom Tool 操作契約（docs/designs/responsibilities/custom-tool-contracts.md）に pr_read 応答の body 含有保証を明記、または case-close workflow 手順へ読み取り系 gh フォールバックを明記
- **想定反映先**: agentdev-workflow-case-close（STEP-1 Input Resolution）、custom-tool-contracts.md
- **関連**: PR #2539、Issue #2538
- **タグ**: #agentdev-gh #pr-read #fallback #操作契約 #読み戻し

---
## 2026-09-03: $PSScriptRoot 自己解決型スクリプトの挙動テストは一時リポジトリ内コピーの実行が必須

- **問題事象**: stale クリーンアップ挙動テスト初回実行時、self-sync 系テストが一時リポジトリではなく本体 worktree の `scripts/self-sync.ps1` を実行し、本体 `.opencode/`（worktree 側）へ junction 群を作成した。事故物は削除済みで、メインリポジトリ作業ツリーへの影響なし（`.opencode/*` は gitignore 対象、git status 変化なし）
- **発生局面**: case-run の TS-001 状態遷移テスト（一時リポジトリ上での検証）初回実行時
- **検知方法**: テスト対象スクリプトが `$PSScriptRoot` から自己リポジトリを解決する構造であることに起因する junction 作成先の観測
- **根本原因**: `$PSScriptRoot` で自己位置からリポジトリルートを解決するスクリプトは、本体リポジトリ内のスクリプトをそのまま実行すると本体 `.opencode/` へ副作用を書く。一時環境を構築しても本体側スクリプトを実行すれば自己解決は本体を向く
- **自律対応内容**: 一時リポジトリ内にコピーしたスクリプトを実行する形へテストを修正済み（PR #2541）
- **ユーザー確認の有無**: なし（エージェント自律）
- **ADR/REQ/spec影響**: なし（テスト実行手法の知見）
- **横展開観点**: `$PSScriptRoot` / `$MyInvocation` 等で自己位置を解決する配布スクリプト（install.ps1、self-sync.ps1 等）全般に適用可能
- **再発条件**: 自己解決型スクリプトを一時環境でテストする際に本体側実行パスを使った場合
- **予防策候補**: 挙動テストは常に「一時リポジトリ内にコピーしたスクリプト」を実行する規約化。テストの冒頭でスクリプト解決パスのアサーションを置く
- **想定反映先**: scripts/self/release/stale-cleanup-behavior.Tests.ps1（実装済み）、install-script-usability Design（テスト実行留意点の追記候補）
- **関連**: PR #2541、Issue #2540
- **タグ**: #psscriptroot #テスト #一時リポジトリ #副作用 #install-script

---
## 2026-09-03: Windows junction の削除失敗は主要な手法では注入困難（失敗経路検証は実ファイルロックで代替）

- **問題事象**: TS-004 (3) の削除失敗注入について、子プロセスの CWD ロック（junction 内 Set-Location）、junction 自体への DELETE deny（icacls）、親への DELETE_CHILD deny、DELETE アクセスの no-share ハンドル保持のいずれも junction の rmdir をブロックできなかった（Windows 11 / pwsh 7.6 環境）
- **発生局面**: case-run の TS-004 (3) 削除失敗の判別可能な報告（REQ-058-011）検証時
- **検知方法**: 4 手法の注入を順に試行し、いずれも rmdir 成功で失敗状態を作れないことを観測
- **根本原因**: junction の削除は reparse point の解除であり、通常のディレクトリ/ファイルのロック機構が効きにくい。ターゲット側のロックは junction 削除に影響しない
- **自律対応内容**: 削除失敗注入は stale plugin loader shim（実ファイル、`FileShare.None` ロック）で構成した。stale 管理投影物種別横断で「失敗時は記録して続行し、判別可能な終了コードで終える」同一経路のため契約検証としては等価
- **ユーザー確認の有無**: なし（エージェント自律）
- **ADR/REQ/spec影響**: なし（検証手法の知見。REQ-058-011 の検証手段構成は PR 本文へ記録済み）
- **横展開観点**: junction の削除失敗テストを設計する場合は実ファイルロックで代替するか、reparse point 特有の失敗経路（破損した reparse data 等）を別途検討する必要がある
- **再発条件**: junction の削除失敗をテストで再現しようとした場合
- **予防策候補**: junction 削除失敗の単独検証手段が必要な場合は失敗注入を契約に含めず、実装レベルのユニットテスト（削除関数のモック）で担保する
- **想定反映先**: runtime-package-boundary Design（検証手法の留意点候補）、REQ-058 関連の将来テスト
- **関連**: PR #2541、Issue #2540
- **タグ**: #junction #削除失敗 #テスト注入 #windows #ts-004
