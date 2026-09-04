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
---

## 2026-09-04: bun test の位置引数フィルタは Windows worktree の dotfile 配下ディレクトリで ./ prefix 付き正規形でのみマッチする

- **問題事象**: Windows worktree 上で bun test の位置引数フィルタ（.opencode/skills/配下ディレクトリ）は、./ なし相対指定・バックスラッシュ区切り・ディレクトリ名部分一致のいずれでも dotfile 配下ディレクトリにマッチせず、QG-4 正規形の ./ prefix 付き形式（bun test ./.opencode/skills/<dir>/・cwd=リポジトリルート）でのみマッチした。手順からの逸脱（cwd 変更やフィルタ短縮）は ENOENT 系の偽 fail を生む
- **発生局面**: case-run 委譲（Issue #2569 / PR #2591、OU-018 integrity suite 正規形実行時）
- **検知方法**: bun test 単独実行が対象テストへマッチせず即終了する観測（正規形では 2549 tests / 102 files が計上される対比で確認）
- **根本原因**: bun test の位置引数フィルタのパスマッチは cwd 相対の指定形式に依存し、Windows のパス区切りと dotfile 開始ディレクトリ（.opencode）の組み合わせでは ./ prefix 付きの正規形のみが一意に解決される
- **自律対応内容**: QG-4 正規形どおり ./ prefix 付き・cwd=リポジトリルートで実行し直し、正規計上（2549 tests / 102 files）を取得して case-close の QG-4 独立再検証を完遂した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（既存の bun test 実行形態契約どおりの実行で解消する環境知識）
- **横展開観点**: worktree 上で bun test を位置引数フィルタ付きで実行する全 workflow（case-run / case-close の QG-4 正規形実行・検証サブエージェント）に共通。正規形からの逸脱指定による偽 fail を由来分類で除外する判定材料になる
- **再発条件**: Windows worktree で ./ なしの bun test .opencode/... 指定、バックスラッシュ区切り指定、ディレクトリ名短縮フィルタを用いた場合
- **予防策候補**: bun test 実行形態契約（QG-4 正規形）の ./ prefix 必須を Windows 環境向け注記として明文化する
- **想定反映先**: agentdev-quality-gates の QG-4 正規形注記・docs/knowledge の Windows 系知識文書（learning-promote で判定）
- **関連**: PR 2591 本文 Findings / Capture候補（learning）からの capture 回収（case-close STEP-6）
- **タグ**: #bun #test #windows #worktree #qg4

---

## 2026-09-04: 配布ソース面パス列挙を含む補助ファイルの Write は配布依存境界 pre-write gate に fail-closed ブロックされる

- **問題事象**: PR 変更ファイル一覧（src/opencode/** 配布ソース面パス 92 件）を一時領域（C:\WINDOWS\TEMP\opencode）へ .txt として書き出そうとしたところ、`agentdev-distribution-boundary-guard: blocked write (producer-internal reference in distributed text artifact)` の fail-closed ブロックが発生した（inspection error: gate-not-passed）
- **発生局面**: case-close STEP-3 targeted docs guard の --files 引数ファイル事前生成時（Issue #2570 / PR #2593、OU-020 ADR 用語棚卸し case-close）
- **検知方法**: Write ツールの失敗応答（gate ブロックメッセージ）
- **根本原因**: 配布ソース面パス列挙を本文に含むテキストは、配布物テキストアーティファクトの producer-internal reference として pre-write gate の内容ベース検査対象になり得る。一時領域・.txt 拡張子でもブロックされる
- **自律対応内容**: ファイル書き出しを中止し、`gh pr diff --name-only` の出力を PowerShell 配列へ直接読み込んで --files に渡す方式へ変更（一時ファイル不要化）して targeted docs guard を完遂
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（検証補助ファイルの生成手順の教訓。gate は仕様どおり fail-closed 動作）
- **横展開観点**: targeted docs guard 等の --files に配布ソース面パスを渡す検証（case-run STEP-S5 / case-close STEP-3・E4-1 配布依存境界 gate）に共通
- **再発条件**: 配布ソース面パス列挙を含む補助ファイルを Write 系ツールで作成する
- **予防策候補**: --files 等のパス列挙は一時ファイル化せずコマンド出力（gh pr diff --name-only、git diff --name-only）を配列へ直接読み込む。書き出す場合は配布ソース面パス列挙を含まない形式にする
- **想定反映先**: integrity checker 実行手順の補助ファイル生成知識、docs/knowledge の Windows 系知識文書、learning-promote で分類
- **関連**: Issue 2570 対応記録コメント（case-close STEP-6 学び検知）
- **タグ**: #integrity #distribution-boundary #pre-write-gate #case-close #verification

---

## 2026-09-05: integrity suite の cwd 依存と bun test の dot ディレクトリ既定探索による実行手順分断

- **現象**: integrity suite（repo-agentdev-integrity scripts）の一部テストが `path.join("src", ...)` の repo-root カレント前提で、scripts dir カレント実行では ENOENT fail となる。一方 repo-root カレントの `bun test` は既定探索が dot ディレクトリ（.opencode）配下を拾わず、収集 0 件となる
- **状況/文脈**: case-run TS-005（Issue 2594 / PR 2595、traceability REQ-ID 桁幅緩和 Case）
- **検知方法**: bun test 実行時の ENOENT fail とテスト収集 0 件の観察
- **根本原因**: cwd 依存テストと bun の既定テスト探索仕様（dot ディレクトリ無視）の組合せで、実行手順が一意に定まっていない
- **応急/対応内容**: `./` プレフィックス付きの明示ファイル列挙（102ファイル）で repo-root カレント実行して回避
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（実行手順標準化は後続候補）
- **展開視点**: 恒久検証手段の実行コマンド明記・cwd 非依存化が候補（bun test 実行形態契約との整合確認を含む）
- **再現条件**: scripts dir カレントで bun test 実行、または repo-root カレントで引数なし bun test 実行
- **予防策**: 検証手順ドキュメントへ実行コマンド（cwd と引数形式）を明記し、テストの cwd 前提を排除する
- **横展開候補**: agentdev-quality-gates（bun test 実行形態契約の運用注記）、learning-promote で標準化 RU 判定
- **関連**: PR 2595 本文 Findings セクションからの capture 回収（case-close STEP-6）
- **タグ**: #test #bun #integrity #case-run #verification
---

## 2026-09-05: PR 本文取得のツールギャップ時の gh 読み取り系フォールバックと Windows 出力退避の文字化け回避

- **現象**: case-close の capture 入力源として必要な PR 本文が agentdev_gh pr_read では title/state/mergeable の compact summary のみで取得できない。また Windows の PowerShell 経由で gh stdout を Out-File 退避すると cp932 解釈で UTF-8 本文が文字化けする
- **状況/文脈**: case-close STEP-6 capture 回収（Issue 2594 / PR 2595）。pr_mergeable も verification-incomplete で失敗し、Tool 側 contingency の gh 読み取り系フォールバックが提示された
- **検知方法**: pr_read 応答に body フィールドが無いことの確認、Out-File 退避ファイルの文字化け確認
- **根本原因**: pr_read の応答契約は compact summary 前提で body 取得を含まない。PowerShell のコンソールエンコーディング（cp932）が gh の UTF-8 出力を破壊する
- **応急/対応内容**: Tool contingency に従い gh CLI 読み取り系（gh pr view --json body,mergeable）を node の execFileSync（encoding utf8）経由で実行し、writeFileSync utf8 で退避して文字化けを回避
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（POL-gh-io-delegation の読み取り系フォールバックは Tool 側 contingency が明示許可）
- **展開視点**: Windows + gh の出力退避は PowerShell cmdlet 経由でなく node / [System.IO.File] の明示 UTF-8 経由に統一する規約化が候補
- **再現条件**: Windows コンソールで gh pr view を実行し Out-File / Set-Content で退避した場合
- **予防策**: gh 出力の退避は node execFileSync + writeFileSync(utf8) を標準手順とする
- **横展開候補**: docs/knowledge/windows-powershell-bulk-io-corruption.md の知見拡張（コンソール出力系への適用）、learning-promote で判定
- **関連**: Issue 2594 対応記録コメント（case-close STEP-6 学び検知）
- **タグ**: #gh #windows #encoding #case-close #tool-fallback

---

## 2026-09-05: worktree 内変更の targeted docs guard は main repo から --root + --files 併用で検査できる

- **現象**: worktree 環境では targeted docs guard の `--base-ref origin/main` モードに加え、main repo から `--root <worktreeパス>` + `--files <変更ファイル>` を併用する方式で worktree 内変更を検査できた（check_changed_docs.ts は `--root` と `--files` の併用を受理）
- **状況/文脈**: case-run 委譲（Epic #2596 Wave 1 / Issue #2598 / PR #2611、OU-001 監査 Report の targeted docs guard 実行時）。worktree への junction 未伝播のため worktree 側からの bun 実行ができない構成
- **検知方法**: junction 未伝播環境での case-run 実行時、guard を main repo 側から `--root` + `--files` モードで実行して代替（failures 0、warnings 0）
- **根本原因**: worktree と main repo のスクリプト実体参照が junction 非伝播環境で断絶する（既知構成）。guard 自体のモードは併用を受理する
- **応急/対応内容**: main repo から `--root` + `--files` 併用で実行し、docs/README.md 連動検査込みで合格
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（実行手順の代替経路。Targeted Docs Guard 実装詳細の運用注記候補）
- **展開視点**: junction 未伝播環境の case-run / case-close での targeted docs guard 代替手順として再利用可能
- **再現条件**: worktree 内の変更を targeted docs guard で検査する際、worktree 側から実行できない環境
- **予防策**: bun test 実行形態契約・Targeted Docs Guard 実装詳細へ `--root` + `--files` 併用モードの運用注記を追加する候補
- **横展開候補**: agentdev-quality-gates（実行形態契約の運用注記）、learning-promote で標準化判定
- **関連**: PR #2611 本文 Findings セクションからの capture 回収（case-close STEP-6）
- **タグ**: #docs-check #worktree #targeted-docs-guard #case-run #verification

---

## 2026-09-05: 契約テスト2本は main repo untracked 実体であり worktree から起動できない

- **現象**: repo-agentdev-integrity の契約テスト2本（execution_ident_contract.test.ts、verification_diff_contract.test.ts）は main repo `.opencode/skills/repo-agentdev-integrity/scripts/` 配下の untracked 実体であり、worktree からは参照・起動できない（既知の junction 未伝播構成）
- **状況/文脈**: case-run 委譲（Issue #2598 / PR #2611、OU-001 の契約テスト現行監査時）。Report 第2節に「起点比較不能（git 管理外）」として記録済み
- **検知方法**: worktree からの起動不能と git 管理外による差分判定不能の確認
- **根本原因**: テスト実体が untracked で git 管理外のため、worktree（別 checkout）に存在しない
- **応急/対応内容**: 本件は監査（読み取り専用）のため main repo から読取のみで対応。実装変更は無し
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし。OU-003（#2600）での契約テスト更新時に実行環境の確認が必要（bun test 実行は main repo カレント前提）
- **展開視点**: 契約テスト・恒久検証手段を実行する工程（case-run / case-close / docs-check）は実行環境の構成（untracked 実体の所在）を実行前に確認する
- **再現条件**: worktree 配下から repo-agentdev-integrity scripts 配下のテストを起動する場合
- **予防策**: テスト更新タスク（OU-003）の実行計画に実行環境（main repo カレント）の明示を含める
- **横展開候補**: agentdev-quality-gates（bun test 実行形態契約の前提補足）、learning-promote で判定
- **関連**: PR #2611 本文 Findings セクションからの capture 回収（case-close STEP-6）
- **タグ**: #integrity #bun #worktree #repo-agentdev-integrity #case-run

---

## 2026-09-05: bun run 経由の process.exit() CLI は stdout flush が破棄され出力が空になる

- **現象**: bun run で実行する process.exit() を呼ぶ CLI（check_distribution_boundary_cli.ts）が、パイプ・リダイレクト・通常出力のいずれでも stdout 内容が空になる
- **状況/文脈**: case-run 委譲（Epic #2596 Wave 2 / Issue #2599 / PR #2612、OU-002 同期義務の配布依存境界検査実行時）
- **検知方法**: checker の stdout が空であることの確認
- **根本原因**: bun 環境で process.exit() の終了タイミングにより stdout flush が完了しない
- **応急/対応内容**: 結果判定は EXIT コード（0 ok / 1 violation / 2 error）で行い、node 経由の実行を検討
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（checker 実行契約の安定実行経路に既存知見あり。運用注記への追記候補）
- **展開視点**: checker 実行契約（checker 実行契約と検出基盤規則 Design）の「安定実行経路」節との整合確認が候補
- **再現条件**: Windows + bun で bun run により process.exit() を呼ぶ CLI を実行して stdout を取得する場合
- **予防策**: exit code が意味を持つ checker の結果判定は EXIT コード基準とするか、node 経由の実行を標準とする
- **横展開候補**: agentdev-quality-gates（checker 実行手順）、learning-promote で判定
- **関連**: PR #2612 本文 Findings セクションからの capture 回収（case-close STEP-6）
- **タグ**: #bun #checker #stdout #distribution-boundary #case-run

---

## 2026-09-05: IR-067 は plain な REQ-NNN-NNN を REQ 行引用として検出するため対応表の旧行 ID は code span で記録する

- **現象**: IR-067（referenced-req-row-existence）が docs 本文内の plain な REQ-NNN-NNN を REQ 行引用として検出し、旧→新行対応表のような歴史参照テーブルで旧行 ID が Phantom 参照（NG）として誤検出された
- **状況/文脈**: case-run 委譲（Epic #2596 Wave 2 / Issue #2599 / PR #2612、verification-scope-catalog.md の旧→新行対応表保存時）
- **検知方法**: docs-check（check_integrity.ts）の IR-067 NG 検出（fix-and-reverify で解消）
- **根本原因**: IR-067 の検出対象が code span・括弧等を除いた plain テキストであり、歴史参照と現行引用の区別がない
- **応急/対応内容**: 対応表内の旧行 ID を plain から code span へ変更し、IR-067 新規 NG 4件を解消（検出→修正→再検証合格）
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（IR ルール詳細の正規免除経路（様式例示）の活用）
- **展開視点**: 歴史参照テーブル（対応表、旧参照の記録）を含む成果物の執筆規約への追記候補
- **再現条件**: docs 本文に plain な REQ-NNN-NNN（存在しない行 ID）を記録した場合
- **予防策**: 旧行 ID 等の歴史参照は code span で記録する執筆規約を明文化する
- **横展開候補**: agentdev-doc-writing（執筆規範）、learning-promote で判定
- **関連**: PR #2612 本文 Findings セクションからの capture 回収（case-close STEP-6）
- **タグ**: #integrity #ir067 #docs-check #case-run #verification

---

## 2026-09-05: REQ 行全面再構築時の旧行 ID 参照 Report 更新は最終 Wave の完了条件に含めると検証コストが下がる

- **現象**: REQ 行の全面再構築（旧行廃止）時、既存 Report 内の ADF-COVERS 宣言が旧行 ID を参照したままだと、tim_declarations コーパス検査（unknown-req-refs）とトレーサビリティ check が fail する。covers 棚卸し同期義務が管理対象だが、Wave 1 で固定された baseline report 等の Report は後続 Wave が更新する順序依存が生じ、その間 integrity suite に既知 fail が残存する
- **状況/文脈**: case-run 委譲（Epic #2596 Wave 3 / Issue #2600 / PR #2613、OU-003 契約テスト再構成時の観察）
- **検知方法**: integrity suite 残存 1 fail（TIM 宣言コーパス unknown-req-refs、req-048-reanalysis-baseline.md L11-12 の旧行 ID 参照）の AG-010 分離（base 11667477 でも再現する pre-existing の確認）
- **根本原因**: 旧行 ID 参照の Report 更新がどの Wave にも完了条件として割り当てられておらず、Wave 間の順序依存により既知 fail が中間 Wave に残存する設計
- **応急/対応内容**: 既知 fail として分離記録し、OU-006（#2603）の同期義務で解消予定。本 PR での新規対応は無し（MUST NOT 対象ファイル）
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（REQ 再構築系 Case の Wave 設計の教訓）
- **展開視点**: REQ 再構築系 Case では「旧行 ID 参照の Report 更新を最終 Wave の完了条件に含める」設計が検証コストを下げる
- **再現条件**: REQ 行の全面再構築で旧行を廃止しつつ、旧行 ID を covers 宣言で参照する Report が中途 Wave で未更新のまま残る場合
- **予防策**: REQ 再構築系 Epic の Wave 計画時に、旧行 ID 参照 Report の covers 付替を最終 Wave の完了条件へ明示的に組み込む
- **横展開候補**: agentdev-workflow-case-open / Epic Wave 設計（RU → Epic 分解時の同期義務割り当て）、learning-promote で判定
- **関連**: PR #2613 本文 Findings / Capture候補 セクションからの capture 回収（case-close STEP-6）
- **タグ**: #integrity #traceability #req-restructure #epic-wave #case-run

---

## 2026-09-05: worktree で integrity suite を実行する際は agentdev-project-extensions/scripts 側の bun install（zod）が前提になる

- **現象**: worktree で repo-agentdev-integrity integrity suite を実行する場合、.opencode/skills/repo-agentdev-integrity/scripts に加えて src/opencode/skills/agentdev-project-extensions/scripts の bun install（zod 依存）が前提となる。zod 未解決のままだと、環境依存 fail 4件 / errors 4件（Cannot find package 'zod'）が integrity suite に混入する
- **状況/文脈**: case-run 委譲（Epic #2596 Wave 5 / Issue #2602 / PR #2615、OU-005 縮小実施時の検証実行）
- **検知方法**: integrity suite 実行時の環境依存 fail / errors の分離（zod 未解決による Cannot find package エラーの識別）
- **根本原因**: worktree は node_modules を引き継がないため、スクリプト実行に必要な依存解決がスキルごとのディレクトリ単位で必要になる。依存前提が複数ディレクトリに分散している
- **応急/対応内容**: .opencode/skills/repo-agentdev-integrity/scripts と src/opencode/skills/agentdev-project-extensions/scripts の両方で bun install を事前実行し、環境依存 fail を消滅させてから既知 fail 判定を実施
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（検証実行環境の運用教訓）
- **展開視点**: integrity suite の既知 fail 分離判定の前に、実行環境の依存解決状態を先に潰す。環境依存 fail は既知 fail 判定を妨げる
- **再現条件**: 新規 worktree で bun install を行わず integrity suite を実行した場合
- **予防策**: worktree で integrity suite を実行する場合の手順に、両スクリプトディレクトリの bun install を前提手順として明記する（PR #2615 テスト結果セクションに記録済み）
- **横展開候補**: repo-agentdev-integrity（実行手順の依存前提明記）、agentdev-quality-gates（bun test 実行形態契約の依存解決前提）、learning-promote で判定
- **関連**: PR #2615 本文 Findings / Capture候補 セクションからの capture 回収（case-close STEP-6）
- **タグ**: #integrity #bun #zod #worktree #environment-dependency

---

## 2026-09-05: bun test のレポートは stderr に流れるため証跡退避は stdout だけではゼロになる

- **現象**: bun test の実行結果（Ran N tests across M files、pass/fail 行）が stdout にほぼ出ない（27バイトのバージョン行のみ）。stdout のみを fs.writeFileSync で退避する実装だと N/M 件数突合に必要な証跡がゼロになる。spawnSync で stderr も併せて退避したところ、404KB のレポート（2556 pass / 0 fail、Ran 2556 tests across 102 files）を取得できた
- **状況/文脈**: case-close（Epic #2596 Wave 6 / Issue #2603 / PR #2616、マージ後同一 tree での full integrity suite 最終再実行）
- **検知方法**: checker コマンドの stdout 証跡退避形式に従い stdout を退避したが、退避ファイルがバージョン行のみであることを長さ検査で検知
- **根本原因**: bun test はレポータ出力の流れ先が stdout ではなく stderr。checker 実行契約の stdout 証跡退避を stdout 単独で実装すると、bun test の場合だけ証跡が欠落する
- **応急/対応内容**: spawnSync の stdout と stderr を両方 fs.writeFileSync（UTF-8）で退避し、連結テキストに対して Ran/pass/fail の正規表現突合を実施（exit status 0、2556 pass / 0 fail を確認）
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（checker 実行契約「stdout 証跡退避形式」の運用上の補完情報。checker-execution-contracts Design の「Windows + bun 環境で process.exit の終了タイミングにより stdout レポートが失われることがある」の具体例）
- **展開視点**: exit code が意味を持つ checker コマンドの証跡退避は、stdout / stderr 両方を対象にする。N/M 件数突合等の後段突合は、退避済み証跡が空でないことを最初に検査する
- **再現条件**: Windows 環境で spawnSync 経由の bun test を実行し、stdout のみを退避した場合
- **予防策**: 検証コマンドの stdout 証跡退避形式の実装を stdout/stderr 併存退避に統一し、証跡の空検査を突合の前提手順とする
- **横展開候補**: agentdev-quality-gates（bun test 実行形態契約の証跡退避手順補完）、repo-agentdev-integrity（checker 実行手順）、learning-promote で判定
- **関連**: PR #2616 の case-close 対応記録コメント（テスト結果セクション。merge commit 152ba3b5 と同一 tree での最終再実行）
- **タグ**: #integrity #bun #stderr #verification #case-close

---

## 2026-09-05: Baseline V2 初回測定の委譲単位は6件でサンプル不足。断定を避け運用蓄積後に同一手順で再測定する

- **現象**: Baseline V2 測定（OU-007）の委譲単位は6件で、30〜50 execution units の運用蓄積目安に対してサンプル不足。harness telemetry 指標（wall-clock、token 4性質、tool call、path 再読込、source / projection 重複参照）と telemetry 契約起因の実行失敗は本測定範囲で断定せず、分布・平均・削減効果も断定しない
- **状況/文脈**: case-run 委譲（Epic #2597 Wave 1 / Issue 2604 / PR 2617、OU-007 Baseline V2 Measurement）
- **検知方法**: 測定 Report §5 サンプル不足の明記と Report §6 observability gap（harness テレメトリ未永続化、`adf_harness_ref` が対象 PR 6件すべて N/A）の確認
- **根本原因**: harness telemetry が測定 Report として永続化されておらず、GitHub 読み取りのみの測定は構造観測値（field 数、backfill、コメント/コミット数、Outcome）に限定される
- **応急/対応内容**: サンプル不足を Report に明記し断定を回避。測定可能な GitHub 構造観測値のみ実測記録し、Wave 5 前後の field 数比較（平均 6.0 → 4 field、約33%減）は構造の観測値として位置づけた
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（AG-002 完了条件限定により、測定手順の存在と再現可能性をもって合格。実測蓄積は運用サイクル依存）
- **展開視点**: 運用蓄積後に同一手順（Report §2 測定手順・baseline SHA 固定記録）で再測定する。OU-008 以降の Wave 実行で観測サンプルは自然増加する
- **再現条件**: 30〜50 execution units 未満の委譲単位数で測定分布・平均・削減効果を断定する場合
- **予防策**: 測定 Report にサンプル数と断定可能範囲を明記し、断定は運用蓄積後へ繰り延べる
- **横展開候補**: agentdev-workflow-case-auto（Wave 実行後の再測定トリガ候補）、learning-promote で判定
- **関連**: PR 2617 本文 Findings / Capture候補 セクション（learning）からの capture 回収（case-close STEP-6）
- **タグ**: #measurement #baseline-v2 #sample-size #observability #case-run

---

## 2026-09-05: agentdev_gh pr_create が invalid-input で失敗した場合のリトライで PR 作成を完遂。失敗詳細は委譲の一時情報として失われる

- **現象**: case-run 委譲内で agentdev_gh の pr_create 操作が invalid-input 系の失敗応答を返した。リトライにより PR 2620（Issue 2607 対応）の作成を完遂した
- **状況/文脈**: case-run 委譲（Epic #2597 Wave 4 / Issue 2607 / PR 2620、OU-010 Experiment G2 実験定義）。失敗時の入力詳細は委譲内の一時情報であり、PR 本文の Findings / Capture候補は「該当なし」となった
- **検知方法**: case-close STEP-6 の学び検知（PR 本文 Findings が該当なしでも、本 Case 実行過程で検知した学びの有無を自律判断。inbox.md 重複確認のうえ新規追記）
- **根本原因**: invalid-input 応答の具体的な違反箇所（どのパラメータが Tool 操作契約の要求を満たさなかったか）は委譲コンテキスト外に残らず特定不能。capture 境界（PR 本文のみが入力源）では委譲内失敗の詳細は構造的に永続化されない
- **応急/対応内容**: リトライで PR 作成を完遂。本 entry で現象と capture 構造上の失われ方を記録
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（Tool 操作契約の運用上の知見）
- **展開視点**: 委譲側での失敗・リトライの詳細を永続化する唯一の経路は、case-run 側が検証差分または Findings へ記録すること。失敗応答の detail 記録をリトライの前提手順に含める候補
- **再現条件**: pr_create の入力が Tool 操作契約の要求を満たさない場合
- **予防策**: pr_create 失敗時は失敗応答の detail を記録してからリトライする。リトライ成功時に失敗原因と対処を PR 本文 Findings へ記録する
- **横展開候補**: agentdev-workflow-orchestration（委譲失敗の記録経路）、agentdev-workflow-case-run（Findings 記録の網羅性）、learning-promote で判定
- **関連**: Issue 2607 対応記録コメント（case-close STEP-6 学び検知）
- **タグ**: #github #tool-fallback #pr-create #case-run #case-close

---

## 2026-09-05: check_distribution_boundary.ts は --base-ref を持たず、未定義 flag 付き呼び出しは positional repoRoot 誤解釈の fail-closed になる

- **現象**: check_changed_docs.ts と同じ要領で check_distribution_boundary.ts に `--base-ref main` を渡すと、CLI は未知の flag を無視して `main` を positional repoRoot として解釈し、存在しないパスの読み込みで `fail-closed: distribution targets file is missing` を出して exit 2 となった。エラーメッセージが yaml ファイル欠落を示すため、実際の原因（引数契約の取り違え）と切り分けに一手間必要だった
- **状況/文脈**: case-close STEP-3 配布依存境界 最終 gate 実行時（Issue 2608 / PR 2621、OU-011 Experiment G3 定義）。targeted docs guard（--base-ref 対応）との契約混同が発端
- **検知方法**: exit 2 と fail-closed メッセージに対し、同ファイルの存在確認（bun fs.existsSync = true）を行ったことで「パス欠落ではなく引数解釈の問題」と切り分け
- **根本原因**: checker ごとに CLI 契約が異なる（check_changed_docs.ts は --workflow/--files/--base-ref、check_distribution_boundary.ts は --profile と positional repoRoot のみ）。未知の flag と値の組を CLI がエラーにせず沈黙して位置引数へ混ぜる設計が誤用を検知しにくくする
- **応急/対応内容**: CLI 契約（usage コメント・ヘルプ）を確認のうえ `--profile source .`（positional repoRoot）で再実行し、既知 baseline（concrete-id 13件、PR 変更ファイルへの検出なし）との一致を確認して gate を完遂
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（checker 実行手順の運用知見。gate は fail-closed どおりの動作）
- **展開視点**: checker 実行前に usage（ヘルプまたはスクリプト先頭の契約コメント）で flag 集合を確認する手順化が候補。未知 flag の fail-fast 化は checker 側の改善候補
- **再現条件**: check_distribution_boundary.ts へ `--base-ref` 等の未定義 flag と値を渡した場合（STRIP_VALUE_FLAGS 外の値が positional に混入する）
- **予防策**: 同系 checker 間で引数形式を推測して流用しない。実行前に `--help` またはスクリプト先頭の CLI 契約コメントで flag 集合を確認する
- **横展開候補**: repo-agentdev-integrity（checker CLI 契約一覧の整備）、agentdev-quality-gates（checker 実行手順の usage 確認注記）、learning-promote で判定
- **関連**: Issue 2608 対応記録コメント（case-close STEP-6 学び検知）
- **タグ**: #checker #cli #distribution-boundary #case-close #verification
