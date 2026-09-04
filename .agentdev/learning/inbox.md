# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-04: worktree での git stash pathspec 失敗と誤 pop リスク

- **問題事象**: worktree サブディレクトリで `git stash push -- <相対 pathspec>` が `:(prefix:...)` 解決エラーで失敗した。`;` 連結の後続 `git stash pop` が実行され、既存 stash の適用が conflict を起こし得た（本実行で発生・`git reset --merge` で復旧、既存 stash エントリは kept のまま未破壊）
- **発生局面**: case-run 委譲（Epic #2553 Wave 2 / Issue #2555 / PR #2577、OU-002 実装時）
- **検知方式**: stash push の失敗後も pop が走ったことで検知
- **根本原因**: worktree 配下では相対 pathspec の `:(prefix:)` 解決が機能しないケースがあり `git stash push` が失敗する。`;` 連結は直前コマンドの失敗にかかわらず後続を実行するため、意図しない stash が pop される
- **自律対応内容**: `git reset --merge` で conflict 状態を復旧。stash エントリは破壊しなかった
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（git 操作手順の教訓）
- **横展開観点**: worktree 内で stash 系 git 操作を行う全 workflow（case-run / case-close / agentdev-git-worktree 連携）に共通
- **再発条件**: worktree サブディレクトリでの stash push + pathspec 指定、かつ `;` 連結または失敗を無視する pop
- **予防策候補**: stash 系は `&&` 連結する。pathspec は worktree root から指定する。`git stash push` の成功確認を pop の事前条件にする
- **想定反映先**: agentdev-git-worktree skill の git 操作知識、または learning-promote での分類
- **関連**: PR #2577 本文 Findings セクションからの capture 回収（case-close STEP-6）
- **タグ**: #git #worktree #stash #case-run

---

## 2026-09-04: gate 違和解消の exemption が並行 checker に波及せず、case-run の再検証範囲を超えて collateral が残存

- **問題事象**: E4-1 配布依存境界 gate 違反（ADF-COVERS 宣言行 2 行の IR-059 concrete-id 誤検出）の解消として detector-level exemption を実装した PR で、同一宣言行が (1) 並行する IR-055 checker の新規 delta NG 2 件、(2) traceability check の malformed-declaration 1 件（回帰テストのフィクスチャ文字列）として検出され続けた。case-run の fix-and-reverify は違反していた gate の detector 再実行のみで、sibling checker の再実行を行わなかったため、collateral は case-close の独立再検査で初めて検出された
- **発生局面**: case-close 再実行（Epic #2556 Wave 2 / Issue #2558 / PR #2578・commit 82186d71 の E4-1 exemption 実装後）
- **検知方式**: case-close QG-4 独立再検査での traceability check / check_integrity 再実行（検証差分の 新規 分類として記録）
- **根本原因**: 宣言行・宣言形式文字列を「検査対象宣言」として扱う exemption が checker ごとに独立実装されており（配布境界 detector のみ適用済み）、case-run の fix-and-reverify 契約が「当該 gate の再検証」のみを要求し sibling checker の再実行を含まない
- **自律対応内容**: case-close で新規 3 件を検証差分 新規 として記録し、intake inbox へ capture（merge gate 判定には影響しないため close は継続）
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（checker 間の exemption 整合は現行契約の範囲内で未規定）
- **横展開観点**: 検出系 checker が複数あるリポジトリで「ある checker の false positive への exemption 実装」を行う全 case-run / fix-and-reverify に共通。exemption 実装後は同系統の検査対象宣言を扱う全 checker（IR-055・traceability corpus 走査等）を再実行する
- **再発条件**: 宣言・メタデータ形式の文字列を配布物へ追加する実装で、複数 checker が同一文字列を異なる観点（distribution boundary / runtime reference / 宣言 corpus）で走査する構成
- **予防策候補**: fix-and-reverify の検証範囲に「変更ファイルが走査対象になる checker の再実行」を含める。exemption 実装 PR の検証手順に sibling checker の delta 確認を追加
- **想定反映先**: agentdev-workflow-orchestration（self-healing loop の検証範囲定義）、または intake 経由での checker 整備 RU 化
- **関連**: #2558 対応記録コメント（検証差分 新規 3 件）・intake inbox の IR-055 補足・traceability malformed フィクスチャ item
- **タグ**: #integrity #exemption #case-run #case-close #checker-integration

---

## 2026-09-04: Date.parse は存在しない日付を繰り越し解釈し、NaN 判定ではカレンダー妥当性を検出できない

- **問題事象**: `Date.parse("2026-02-30")` が Bun 1.3.6 で NaN にならず、繰り越し日付として有効と判定される。NaN 判定のみの日付妥当性検査では存在しない日付（月日がカレンダー不整合）を検出できない
- **発生局面**: case-run 委譲（Issue #2562 / PR #2581、OU-009 knowledge frontmatter 検査 checker 実装時。TS-009 の 1 回目 bun test 3 fail で検出）
- **検知方式**: カレンダー不備 fixture（2026-02-30）の検出漏れテスト失敗
- **根本原因**: `Date.parse` は日付フィールドを正規化して繰り越す仕様であり、月末日数の検証を行わない。形式一致（YYYY-MM-DD パターン）と「存在する日付であること」は別問題
- **自律対応内容**: 月末日数による自前検証へ修正（`new Date(Date.UTC(year, month, 0)).getUTCDate()`）。fix-and-reverify で 2 回目 32 pass / 0 fail
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（checker 実装の詳細。patterns Design への機械判定形式追記候補は intake inbox に回収済み）
- **横展開観点**: 日付文字列の妥当性検査を実装・レビューする全局面（frontmatter、ログ、日付系 fixture）に共通
- **再発条件**: `Date.parse` や `new Date(str)` の非 NaN 判定を「日付として存在する」ことの検査に使用する
- **予防策候補**: 形式検査（正規表現）に加え、年月日を数値分解して月末日数で検査する。繰り越し解釈が意図の場面を除き、Date.parse を日付存在性検査に使わない
- **想定反映先**: integrity checker 系の実装知識、learning-promote での分類
- **関連**: PR #2581 本文 Findings セクションからの capture 回収（case-close STEP-6）
- **タグ**: #javascript #date-validation #checker #bun

---

## 2026-09-04: Windows の bun checker stdout を PowerShell パイプへ渡すと cp932 再解釈で JSON パースが壊れる

- **問題事象**: checker（bun 実行）の stdout を PowerShell パイプ（`| node -` 経由の JSON パース等）へ渡すと、cp932 解釈による制御文字混入で JSON パースが失敗する。既存知識 `docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md`（stdout ロス）と近縁だが現象は別（エンコーディング再解釈）。stdout 自体は正常に出力されている
- **発生局面**: case-close QG-4 独立再検証（Issue #2561 / PR #2582、OU-006 検査定義 yaml 読込統合。旧新 checker の --json 出力比較を PowerShell パイプで行おうとした際）
- **検知方式**: JSON パース失敗と出力ファイルの破綻からの切り分け
- **根本原因**: Windows のコンソール コードページ（cp932）を介したパイプ再解釈で、UTF-8 バイト列が文字化け・制御文字混入する
- **自律対応内容**: spawnSync(encoding: "utf8") 経由で stdout を直接取得し、writeFileSync(utf8) でファイル化してから正規化比較する方式へ変更。QG-4 出力形式比較（REQ-047-005 不変確認）を完遂
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（検証手段の実行上の注意。恒久文書化候補は intake inbox に回収）
- **横展開観点**: Windows + bun 環境で checker / CLI の JSON 出力をパイプやリダイレクトで処理する全検証（QG、docs-check、case-run の検証手順）に共通
- **再発条件**: checker stdout を PowerShell パイプ・ファイル リダイレクト経由でテキスト処理に渡す
- **予防策候補**: 機械的な出力比較は spawnSync(encoding: "utf8") で直接取得する。パイプを使う場合は事前に chcp 65001 を設定する
- **想定反映先**: docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md の近縁現象追記候補（intake 経由）、検証手順の実装知識
- **関連**: PR #2582 本文 Findings / Capture候補 セクションからの capture 回収（case-close STEP-6）
- **タグ**: #windows #encoding #checker #bun #verification

---

## 2026-09-04: worktree 作成直後は scripts パッケージの node_modules が存在せず tsc/test が環境エラーになる

- **問題事象**: worktree 内で `bun run tsc --noEmit` や一部契約テスト（zod 依存の walk_enumeration_contract 等）が、`@types/bun`・`zod` 等の node_modules 欠落による型・依存未解決エラーで失敗する（実装差分なしの環境要因エラー）
- **発生局面**: case-run 委譲（Issue #2564 / PR #2585、OU-011 traceability check CLI の root 明示・cwd 依存排除の実装・検証時。検証差分「修正済み」2 件の要因）
- **検知方式**: tsc --noEmit の node types 未解決エラーと契約テストの zod 依存未解決エラー
- **根本原因**: git worktree は git 管理対象のみを引き継ぐため、.gitignore 対象の node_modules は worktree ごとに再インストールが必要
- **自律対応内容**: 該当パッケージで `bun install` を実行して解消し、検証を再実行
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（検証環境の整備手順の教訓）
- **横展開観点**: worktree で依存解決を伴う検証（tsc・bun test・lint）を実行する全 workflow（case-run / case-close / 実行担当サブエージェント）に共通
- **再発条件**: worktree 作成直後に依存解決を伴う検証を事前整備なしで実行する
- **予防策候補**: worktree 作成後の依存整備（`bun install`）を検証手順の事前ステップに組み込む
- **想定反映先**: agentdev-git-worktree の worktree 作成後手順知識、learning-promote での分類
- **関連**: PR #2585 本文 Findings セクションからの capture 回収（case-close STEP-6）
- **タグ**: #worktree #node_modules #bun #environment

---

## 2026-09-04: stdout 証跡 checker 群の多くは CommonJS 形式 API を含み、安定実行経路（ESM import 経由）では ReferenceError で実行不能

- **問題事象**: repo-agentdev-integrity の checker 群の多くが CommonJS 形式 API を含み、`node --experimental-strip-types` の ESM 経路（モジュール import 経由・安定実行経路の標準）では ReferenceError で実行不能であることを実証過程で確認した。`check_distribution_boundary.ts` / `check_extensions.ts` は `require.main === module`（ESM で ReferenceError）、`check_changed_docs.ts` / `check_knowledge_docs.ts` は `require("path")` / `require("fs")` 等を使用。`check_content_corruption.ts`（`import.meta.main` 判定・require 不使用）のみ import 経路で実行可能
- **発生局面**: case-run 委譲（Issue #2573 / PR #2586、OU-023 stdout 証跡 checker の安定実行経路反映・実行境界実証時）
- **検知方式**: import 経由での checker 実行実証中の ReferenceError
- **根本原因**: ESM のモジュール解決では `require` / `require.main` が未定義のため、CommonJS 形式 API を含む checker は import 経路で起動できない
- **自律対応内容**: import 経路で実行可能な `check_content_corruption.ts` を実行境界実証に使用。CommonJS 形式 checker の CLI 実行は stdout flush 保証を伴う例外経路（bun run + node spawnSync による stdout 分離取得・UTF-8 退避）で運用継続
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（実行環境の互換性情報。安定実行経路と例外経路の契約は checker 実行契約 Design「安定実行経路」節で定義済み）
- **横展開観点**: 安定実行経路（import 標準）で checker を実行する全 workflow（case-run / case-close / docs-check 系検証）と、新規 checker 実装時の実行経路互換性に共通
- **再発条件**: `require` / `require.main` を含む checker を import 経由（`node --experimental-strip-types`）で実行する
- **予防策候補**: 新規 checker は `import.meta.main` 判定 + `node:` 組み込みモジュール import で実装する。既存 checker の ESM 互換化の要否は intake item「checker 群の ESM 互換化候補」で追跡
- **想定反映先**: docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md の近縁現象追記候補（intake 経由）、checker 実装ガイド、learning-promote での分類
- **関連**: PR #2586 本文 Findings / Capture候補 セクションからの capture 回収（case-close STEP-6）
- **タグ**: #checker #esm #node #windows #verification

---

## 2026-09-04: worktree の per-skill node_modules は git 管理外のため引き継がれず、bun test 単独実行が zod 未解決で失敗する（bun run では成功する非対称）

- **問題事象**: worktree 環境では `src/opencode/skills/agentdev-project-extensions/scripts/node_modules`（zod / typescript 等、git 管理外の per-skill node_modules）が引き継がれず、`bun test ./.opencode/...` 単独実行が `Cannot find package 'zod'` で失敗する。bun run によるスクリプト直接実行では zod 解決が成功する非対称性も観測
- **発生局面**: case-run 委譲（Issue #2560 / PR #2587、OU-004 check_extensions baseline SPEC 整合の実装・検証時）
- **検知方式**: bun test 単独実行の zod 未解決エラー
- **根本原因**: REQ-018 worktree fallback は src/opencode tree（git 資産）が SoT だが node_modules は非 git 資産のため fallback 対象外。per-skill node_modules は worktree ごとに再整備が必要
- **自律対応内容**: main 側 node_modules への junction 作成（検証後削除）で暫定対応し、bun test 15 pass / 0 fail を達成
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（検証環境の整備手順の教訓）
- **横展開観点**: worktree で checker 系テスト検証を行う全 workflow（case-run / case-close / 実行担当サブエージェント）に共通。「worktree 作成直後の node_modules 欠落」（PR #2585 由来エントリ）の近縁現象で、対象が per-skill node_modules である点と junction 対応の有効性が追加知見
- **再発条件**: worktree で per-skill node_modules 依存の bun test を事前整備なしで単独実行する
- **予防策候補**: worktree での checker 系テスト検証は junction 作成（検証後削除）または該当 skill ディレクトリでの `bun install` を検証手順の事前ステップに組み込む
- **想定反映先**: agentdev-git-worktree の worktree 作成後手順知識、learning-promote での分類（PR #2585 由来エントリとの統合候補）
- **関連**: PR #2587 本文 Findings / Capture候補 セクションからの capture 回収（case-close STEP-6）
- **タグ**: #worktree #node_modules #zod #bun #environment

---

## 2026-09-04: ng-baseline additions manifest の bucket key は実行結果 message との完全一致が必要で、manifest 化対象は prefix 無しの新規 NG から選ぶのが正手順

- **問題事象**: additions manifest 作成時の bucket key（category/check/file/evidence）が実行結果 message と完全一致しないと baseline 登録が効かない。baseline 登録済み bucket は demote 済み message（`[baseline-known...]` prefix 付き）で出力されるため、demote 済み出力を evidence に転記しても一致しない（本検証で観測・確認済み）
- **発生局面**: case-run 委譲（Issue #2560 / PR #2587、OU-004 の CLI update フロー検証時）
- **検知方式**: manifest による update → demote フロー検証中の baseline 登録不発
- **根本原因**: demotion 後の出力は prefix 付与で message が変化するため、出力結果をそのまま evidence に使うと bucket key がズレる
- **自律対応内容**: manifest 化の対象を prefix 無しの新規 NG（`--json` 出力の生 failures）から選ぶ手順で再検証し、update → demote → strict pass フローを合格
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（baseline 運用の手順知見。SPEC どおりの動作）
- **横展開観点**: ng-baseline additions manifest を作成する全運用（check_integrity / check_extensions / learning-promote での baseline 更新提案）に共通
- **再発条件**: demote 済み出力（prefix 付き message）を evidence に手書き転記して manifest を作成する
- **予防策候補**: additions manifest は `--json` 出力の生 failures から bucket key を機械的に生成する。手書き転記を避ける
- **想定反映先**: integrity-contracts baseline 運用契約の手順補足、check_extensions ヘルプ・ドキュメント、learning-promote での分類
- **関連**: PR #2587 本文 Findings / Capture候補 セクションからの capture 回収（case-close STEP-6）
- **タグ**: #integrity #ng-baseline #baseline #checker #verification

---

## 2026-09-04: traceability check の corpus 走査はテストフィクスチャのダミー宣言を malformed 検出し続ける（複数 Case で再観測される誤検出）

- **問題事象**: traceability check の宣言 corpus 走査が `distribution-boundary.test.ts` L1367 の回帰テストフィクスチャ（エスケープ済みダミー宣言 `REQ-\u0030\u0031`）を malformed-declaration として検出し続ける。base 由来の既存検出であり当該修正と無関係だが、REQ スコープの check を実行するたび fail 1 件として出続ける
- **発生局面**: case-close 再実行（Issue #2567 / PR #2588、E4-1 gate 停止解消後の QG-4 独立再検査。REQ-053-023 スコープ）
- **検知方式**: traceability check の fail 1 件（base 由来・既出の再観測。検証差分の 既出 分類として記録）
- **根本原因**: corpus 走査が scripts 配下 .ts を含み、テストフィクスチャの宣言形式ダミー文字列を実宣言と区別しない（除外設計が未整備）
- **自律対応内容**: base 由来の既出検出として既存 intake item との重複確認を行い、新規 item は作成せず本 entry で再観測を記録。マージ判定には影響しないことを確認して継続
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（誤検出の追跡は既存 intake item で実施済み）
- **横展開観点**: REQ スコープの traceability check を実行する全 workflow（case-run / case-close の QG-4 独立再検査）で同検出が繰り返し検証差分に現れる。fail 1 件の常時混入は新規検出との区別を毎回必要とする
- **再発条件**: distribution-boundary.test.ts を含む corpus で traceability check を実行する
- **予防策候補**: テストフィクスチャのダミー宣言を検出対象外とする除外設計（既存 intake item の処分候補を参照）
- **想定反映先**: 既存 intake item 2026-09-04-traceability-malformed-fixture-2558 との duplicate 統合（learning-promote で処分）
- **関連**: 既存 intake item 2026-09-04-traceability-malformed-fixture-2558（PR 2578 / Issue 2558 由来・同一根拠の初回 capture）。本 entry は PR 2588 本文 Findings セクションからの capture 回収（case-close STEP-6）による第 2 観測記録
- **タグ**: #integrity #traceability #false-positive #test-fixture #case-close