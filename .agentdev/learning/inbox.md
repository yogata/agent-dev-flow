# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-11: baseline-known 違反の一般化置換語彙が検出パターンに該当し新規違反を生む

- **問題事象**: IR-055 baseline-known strict 違反の一般化置換において、置換後の語彙「repo-local」が `repo-*` 検出パターンに該当し、新規 strict 違反として検出された（worktree-operations.md L131）
- **発生局面**: case 2766（配布物内部参照の一般化・是正）の case-run 実装・検証時
- **検知方法**: IR-055 再検査（check_integrity.ts --json）の新規違反検出
- **根本原因**: 一般化表現の語彙選択が検出器のパターン定義と突合されていなかった
- **自律対応内容**: 「本体リポジトリ専用の整合性検査 skill」へ再置換し、再検査で新規違反 0 を確認（fix-and-reverify 1 回で解消）
- **ユーザー確認の有無**: なし（自律修正）
- **Decision/REQ/spec影響**: なし（運用上の注意）
- **横展開観点**: baseline 運用を持つ他の検査器（IR-059 等）の解消作業でも同様に発生し得る
- **再発条件**: baseline-known 違反の置換解消時に、置換語彙を検出器パターンと突合せずに採用した場合
- **予防策候補**: 一般化表現の語彙選択時に検出器パターンとの突合を事前に行う、または置換後に検査を必ず再実行して新規違反 0 を確認する
- **想定反映先**: 配布依存境界系検査の運用ガイド（docs/designs/integrity/distribution-boundary.md 関連）または IR-055 triage 運用の注意書き
- **関連**: case 2766 / PR 2767
- **タグ**: #ir-055 #baseline #一般化置換

---

## 2026-09-11: worktree 内の .opencode/skills/ は junction 未伝播のため skill 実行は SoT パス起点で行う

- **問題事象**: worktree 内の `.opencode/skills/` は junction 未伝播のため `repo-agentdev-integrity` 以外の skill 実行が worktree 配置では不可能（traceability 等）
- **発生局面**: case 2766 の case-run / case-close 検証実行時
- **検知方法**: worktree 内での skill スクリプト実行時に配置欠落として検知
- **根本原因**: Windows junction が `git worktree add` で新 worktree へ伝播しない
- **自律対応内容**: `repo-agentdev-integrity` 以外の skill 実行（traceability check.ts 等）を `src/opencode/skills/`（SoT パス）起点で実行して回避
- **ユーザー確認の有無**: なし（既知回避の適用）
- **Decision/REQ/spec影響**: なし（検証実行手順の注意）
- **横展開観点**: worktree 隔離して検証する全 workflow（case-run / case-close）で共通
- **再発条件**: worktree 内で `.opencode/skills/` 配下の skill スクリプトを直接実行しようとした場合
- **予防策候補**: worktree 内検証では SoT パス（`src/opencode/skills/`）起点の実行を標準手順として明記する
- **想定反映先**: agentdev-git-worktree の references（worktree-operations.md）または検証系 workflow の手順書
- **関連**: case 2766 / PR 2767
- **タグ**: #worktree #junction #検証実行

---

## 2026-09-11: integrity scripts の CWD 起点実行で環境依存 fail が発生し正規実行点は repo root

- **問題事象**: repo-agentdev-integrity の scripts dir を cwd とした `bun test` 実行で 8 fail / 4 errors が発生した。全件が環境依存（CWD 相対パス起因 4 fail、worktree の node_modules 欠落起因 4 errors）であり当該変更起因の違反は 0 件
- **発生局面**: case 2768（textlint Design 2点補強検証）の case-run 委譲 DEL-2768-1 における full integrity suite 実行時
- **検知方法**: integrity suite 初回実行の fail / error 検出と由来分類（CWD 相対パスは repo root を cwd とした単独再実行で 22 pass / 0 fail を確認して切り分け）
- **根本原因**: integrity 系テストが repo root 相対パス（`path.join("src", ...)` 等）を読む前提に対し、実行 cwd の規定が実行者側で守られていなかった（scripts dir を cwd にした）
- **自律対応内容**: repo root を cwd としたフル再実行で 2565 pass / 0 fail を確認。node_modules 欠落は当該 package dir（agentdev-project-extensions/scripts）で `bun install` を実行して解消（install 後の `git status --porcelain` は空を確認）
- **ユーザー確認の有無**: なし（自律修正）
- **Decision/REQ/spec影響**: なし（検証実行手順の注意）
- **横展開観点**: repo root 相対パスを前提とする他の検査系スクリプト・テスト全般で同様に発生し得る。worktree で検証する場合の node_modules 有無も同時リスク
- **再発条件**: repo root 以外（scripts dir 等）を cwd として integrity suite を実行した場合、または worktree で node_modules 未解決のまま suite を実行した場合
- **予防策候補**: integrity suite の正規実行点（cwd = repo root）を実行形態契約として明文化し、worktree 実行時は事前に `bun install` を行う手順を添える
- **想定反映先**: repo-agentdev-integrity skill の bun test 実行形態契約（references）または case-close workflow の full integrity suite 実行 reference（docs-and-design-promotion.md）
- **関連**: case 2768（Issue 2768、verify-only closure のため PR なし）
- **タグ**: #integrity #cwd依存 #bun-test #worktree

---

## 2026-09-11: verify-only case では3検査を実行証跡として実 case と同水準で実行・記録すると検証完了の根拠が再現可能になる

- **問題事象**: 変更ゼロの verify-only case では PR・carrier commit が存在しないため、検証完了の証跡が会話上のみで消えると PR-less closure の処分判断（QG-4 判定）の根拠が恒久記録から追跡できなくなる
- **発生局面**: case 2769（配布物変更直後の commit 前3検査工程の Design 明文化検証）の case-run / case-close 実行時
- **検知方法**: case-run result blocked（verify-only 契約適用）での PR-less closure 処分依頼を case-close 側が受けた際の証跡確認
- **根本原因**: verify-only case の検証証跡の恒久記録方法が手順として明文化されておらず、#2768 で確立した前例（SSoT コメントへの実行コマンド列付き記録）の運用依存だった
- **自律対応内容**: case-run 側が3検査（配布依存境界・IR-055・traceability）と integrity suite を実 case と同水準で実行し、実行コマンド・結果（new_delta 0、新規違反 0 件、2565 pass / 0 fail 等）を SSoT コメントへ記録。case-close 側はその SSoT を QG-4 判定根拠として参照し、Design 実記述の独立再確認と併せて完了判定した
- **ユーザー確認の有無**: なし（#2768 確立済み working assumption の同一適用を case-auto bounded parent decision で記録）
- **Decision/REQ/spec影響**: なし（運用上の注意。PR-less closure は carrier commit 捏造を却下した作業仮定として記録）
- **横展開観点**: 変更ゼロの docs_chore case 全般、および検証のみで完了する maintenance case で共通
- **再発条件**: verify-only case で検証コマンドと結果を SSoT コメントへ記録せずに処分判断だけを行った場合
- **予防策候補**: verify-only case では検証実行コマンド列と結果を SSoT コメントに残す（実行コマンド列はそのまま再実行手順になる）運用を標準化する
- **想定反映先**: case-run / case-close の verify-only 契約関係の Design 手順（将来的な明文化候補。intake/learning promote 経由で評価）
- **関連**: case 2769（Issue 2769、verify-only closure のため PR なし）/ 前例 case 2768
- **タグ**: #verify-only #実行証跡 #SSoT #PR-less-closure

---

## 2026-09-11: 自己ホスト投影は junction であるため配布ソース src/ のみ編集で配布整合が成立し、worktree 検証では投影不在を前提に依存を整備する

- **問題事象**: 自己ホスト投影 `.opencode/skills/agentdev-*`（IO_REPARSE_TAG_MOUNT_POINT、`src/opencode/skills` 配下への投影）は git 非追跡のため、worktree では junction が作られず投影自体が不在になる。投影の存在を前提に「src と .opencode の両方を編集する」運用をとると、worktree では投影がなく編集対象が半分存在しない状態になり、逆に main では junction が src への同一実体のため二重編集になる
- **発生局面**: case 2771（traceability 解析コアへの対象外判定実装）の case-run / case-close 実行時
- **検知方法**: PR 本文 Findings での自己ホスト投影の実体機構報告。case-close 側の worktree 検証（traceability 単体テスト・full integrity suite）で junction 不在の worktree 上でも追跡ファイルのみの検査が完結することを確認
- **根本原因**: 投影機構の実態（junction・git 非追跡）と「両方編集」の慣行的運用の乖離。配布整合は src（配布ソース）と .opencode（junction 投影）の同一性で担保されるため、src 編集のみで成立する
- **自律対応内容**: PR は配布ソース src/ のみ編集で配布整合を成立させた。worktree 検証では scripts/node_modules をメイン側実体へ junction 張りして typecheck を実行（.gitignore 済み）。case-close は worktree 側で bun install（integrity scripts 側 node_modules 復元）を実施して full suite 正規形 3 分割実行を完遂
- **ユーザー確認の有無**: なし（PR 本文 Findings 記録済み知見の case-close での確認）
- **Decision/REQ/spec影響**: なし（運用上の注意）
- **横展開観点**: src/opencode/skills/** を変更する case 全般、および worktree 上で integrity suite / traceability 検査を実行する case-close / case-run 全般
- **再発条件**: worktree で .opencode/skills/agentdev-* 投影の存在を前提に検査・編集を行った場合、または main 側 junction を二重編集対象とみなした場合
- **予防策候補**: 実装 case の変更対象が配布ソース面の場合は src/ のみを編集対象とし、.opencode 側は junction による同一実体であることを確認する。worktree 検証時は追跡ファイルのみの検査対象であること、依存は bun install またはメイン側 node_modules への junction（検証後削除）で整備する
- **想定反映先**: case-run / case-close の worktree 検証手順、agentdev-git-worktree の worktree 構造的制約（junction 伝播状態の環境ラベル記録）
- **関連**: case 2771（Issue 2771 / PR 2772）、case 2766（同様の worktree 検証経路）
- **タグ**: #junction #自己ホスト投影 #worktree #配布整合

---

## 2026-09-11: テスト fixture 内の宣言マーカー形状は正規宣言位置のコメント形式で書かないと旧パーサが偽宣言として計上し REQ カバレッジを汚染する

- **問題事象**: escape 隠蔽回帰テスト用の fixture 文字列リテラル内の宣言マーカー形状が、旧宣言パーサ（行単位文字列一致）で正規宣言として誤計上され、REQ カバレッジに偽の対応関係が混入していた（実 corpus で偽宣言 15 件。fixture 由来の偽の実装宣言が REQ-057-013 のカバレッジを誤魔化していた）
- **発生局面**: case 2771（対象外判定実装）の case-run 検証時。実 corpus 全走査の新旧パーサ差分確認で発覚
- **検知方法**: TS-001 検出縮退確認（旧 422 件 → 新 407 件の差分 15 件の由来分類。全件がテスト内文字列リテラル由来の偽宣言であることを確認）
- **根本原因**: 宣言パーサが正規宣言位置を識別せず行単位の文字列一致で判定していた構造的欠陥。fixture は「検査器が検出してはならないもの」を表現するため本質的に非正規位置の形状を含むが、旧パーサはそれを区別できなかった
- **自律対応内容**: 対象外判定（正規宣言位置: .md は HTML コメント完結行、.ts は行頭 `//` コメント行のみ解析対象）の実装で偽宣言 15 件が計上対象から除外され、REQ-057-013 の本来の missing-implementation が正当計上（81 → 82 件）になった。fixture 自体は正規位置（コメント）形式へ移設して回帰検証能力を維持
- **ユーザー確認の有無**: なし（機械的検証と突合で確定）
- **Decision/REQ/spec影響**: REQ-057-013 の missing-implementation 計上変化は coverage の正当化であり REQ/Design 変更は不要
- **横展開観点**: 検査器のテスト fixture を含む全テストコード。検査器が文字列パターン照合である場合、fixture 内のパターン文字列は検出対象から除外される形式（正規位置コメント等）で書くのが安全
- **再発条件**: 文字列照合系検査器の fixture に検出対象パターンを非正規位置（文字列リテラル等）のまま配置した場合
- **予防策候補**: fixture 内のパターン文字列は正規宣言位置のコメント形式で書く、または escape・分割で形状一致を避ける運用を検査器契約に明記する
- **想定反映先**: traceability-model / agentdev-traceability Design の fixture 記述規約（将来的な明文化候補。intake/learning promote 経由で評価）
- **関連**: case 2771（Issue 2771 / PR 2772、REQ-057-013 計上の元事象）
- **タグ**: #fixture #偽カバレッジ #宣言パーサ #traceability

---

## 2026-09-11: Bun.build 焼き付きパスは文字列リテラル内でバックスラッシュ2連エスケープ形で現れるため検出 regex には4連が必要

- **問題事象**: Bun.build が焼き付ける `require.resolve` 展開パス（Windows 絶対パス）が JS 文字列リテラル内にバックスラッシュ 2 連（`C:\\Users\\...`）のエスケープ形で現れるため、検出用正規表現を regex レベルのバックスラッシュ 2 連（`\\`）で書くと生パス（1 連区切り）にしか一致せず、焼き付きパスを見逃してサイレント pass した（実装初版で実際に見逃しを確認）
- **発生局面**: case 2775（vendored engine bundle 再生成 build スクリプトへの焼き付き絶対パス検出・無害化自己検査追加）の case-run 実装初版の bundle 再生成検証時
- **検知方法**: fixture ネガティブテスト（tests/absolute-path-guard.test.ts）が焼き付きパス fixture の非検出を検知（検出されない自己検査は合格としない契約に基づく fail）
- **根本原因**: 文字列リテラル内のエスケープ 2 連がさらに bundle 出力面（JSON 等）では 4 連に段階化される多段エスケープ構造に対し、regex を 1 段の想定で設計した
- **自律対応内容**: 検出正規表現を regex レベルのバックスラッシュ 4 連（`\\\\`）へ修正し、fixture ネガティブテスト（3 形態検出・誤検出 0・無害化・unresolved・実 bundle 残存 0）で恒久防止（fix-and-reverify 1 回で解消）
- **ユーザー確認の有無**: なし（自律修正）
- **Decision/REQ/spec影響**: なし（実装初期バグ修正と恒久テスト追加）
- **横展開観点**: bundle / JSON / ソースコード内の文字列リテラルに焼き付く Windows 絶対パスを検出する処理全般（エスケープ段数は対象面ごとに異なる）
- **再発条件**: Windows 絶対パスを文字列リテラル経由で検出する正規表現を、検出対象面のエスケープ段数の考慮なしに書いた場合
- **予防策候補**: 検出対象の形状（エスケープ段数）を fixture で固定し、ネガティブテストで実検出（サイレント pass 不許可）を保証する
- **想定反映先**: build/absolute-path-guard.ts の検出 regex 契約（コメント化）、または offline bundle 運用知識への注意書き（learning-promote 経由で評価）
- **関連**: case 2775（Issue 2775 / PR 2776）
- **タグ**: #bun-build #require-resolve #正規表現エスケープ #ネガティブテスト

---

## 2026-09-12: bun test の fail 行が CR/ANSI 上書きで log ファイルに残らない環境があり junit reporter での構造取得が fail 差分分離に有効

- **問題事象**: `bun test` の出力をリダイレクトで log ファイルへ保存した際、fail 行が CR（キャリッジリターン）/ ANSI エスケープの上書き描画により log ファイル上に実質残らず、base と現行の fail 差分を目視で分離できなかった
- **発生局面**: case 2777（checker の worktree SoT fallback 実装）の case-run 検証時。base（2486 pass / 4 fail / 4 errors）と変更後（2488 pass / 4 fail / 4 errors）の fail 差分分離が必要だった
- **検知方法**: log ファイル内に fail 行が存在しない（tail で最終集計行のみ確認できる）ことを異常として検知
- **根本原因**: bun test の進捗表示が CR 上書き + ANSI カラーコード前提の形式で出力され、非 TTY（リダイレクト）環境でも上書き前の fail 行が保存されない場合がある
- **自律対応内容**: `--reporter=junit --reporter-outfile` で構造化出力を取得し、python ElementTree で XML 解析して fail ケース名を機械的に抽出。base と現行の fail 差分を確実に分離できた（結果: 差分 0 を確認）
- **ユーザー確認の有無**: なし（機械的検証で確定）
- **Decision/REQ/spec影響**: なし（検証手段の工夫で対応）
- **横展開観点**: bun test の結果を証跡として保存する全検証工程（case-run / case-close の QG 検証、CI 代替のローカル検証）
- **再発条件**: 非 TTY 環境で bun test の標準出力を証跡保存に使う場合
- **予防策候補**: fail 差分が必要な検証では最初から junit reporter を使用する。標準出力の tail 集計行だけを証跡としない
- **想定反映先**: checker-execution-contracts.md の bun test 実行形態契約への補足（learning-promote 経由で評価）
- **関連**: case 2777（Issue 2777 / PR 2778）
- **タグ**: #bun-test #junit-reporter #ログ取得 #証跡

---

## 2026-09-12: worktree 内での bun test は repo root 起 cwd で実行する（scripts 配下 cwd では REPO_ROOT 解決系テストが誤動作する）

- **問題事象**: worktree 内で `bun test` を integrity scripts 配下（`.opencode/skills/repo-agentdev-integrity/scripts`）を cwd として実行すると、REPO_ROOT を上方向解決するテスト（issue_tracking_list 等）が誤動作する
- **発生局面**: case 2777 の case-close 独立再検証時。前例 OU-1〜7 で同一の確認歴がある再現性ある事象
- **検知方法**: scripts 配下 cwd 実行で REPO_ROOT 解決系テストが期待と異なる結果を返すことを確認
- **根本原因**: テストが repo root を cwd からの相対解決で求める実装になっており、scripts 配下 cwd では repo root が正しく解決されない
- **自律対応内容**: repo root 起 cwd で `bun test ./.opencode/skills/repo-agentdev-integrity/scripts` を実行する形に統一（case-run / case-close 両工程で同一形）。本 case でも 2488 pass / 4 fail / 4 errors をこの形で取得
- **ユーザー確認の有無**: なし（前例追認）
- **Decision/REQ/spec影響**: なし（既知の実行形態契約の再確認）
- **横展開観点**: repo 内テストスクリプト全般。cwd 起点で repo root を解決するテストは repo root 起 cwd で実行する
- **再発条件**: scripts 配下やサブディレクトリを cwd として bun test を起動した場合
- **予防策候補**: 実行形態契約（repo root 起 cwd + 対象パス明示）を検証手順のテンプレートへ明記し、逸脱時に REPO_ROOT 解決系テストの失敗から気付けるようにする
- **想定反映先**: checker-execution-contracts.md の bun test 実行形態契約（既存規約の運用徹底。learning-promote 経由で評価）
- **関連**: case 2777（Issue 2777 / PR 2778）、前例 case 2766 / 2771 / 2775（同一確認）
- **タグ**: #bun-test #cwd #REPO_ROOT #worktree

---

## 2026-09-12: IR-062 系 fixture テストは checker を fixture root 配下へ複製して spawn する方式が既存規約で fallback 判定は fixture 内 src/opencode/skills の有無で制御できる

- **問題事象**: junction 前提検査（IR-062 reference-path-existence 等）の fixture テストで、fallback 挙動（junction 不在時の SoT 直参照）をどう再現・制御するかが課題になった
- **発生局面**: case 2777 の TS-002 fixture テスト実装時（case-run）
- **検知方法**: 既存 fixture 規約（copyScripts）の調査と fallback 判定条件の実装照合
- **根本原因**: 該当なし（設計知見の蓄積。問題ではなく方式の確立）
- **自律対応内容**: checker を fixture root 配下へ複製して spawn する既存規約（copyScripts）を踏襲し、fixture 内 `src/opencode/skills` の有無で fallback 判定を制御する方式で 2 件のテスト（fallback 発動 + junction 存在時非 fallback 負例）を実装。30/30 pass を確認
- **ユーザー確認の有無**: なし（実装で確定）
- **Decision/REQ/spec影響**: なし（テスト実装方式の知見）
- **横展開観点**: junction / 投影ディレクトリを前提とする検査器のテスト全般。環境差（junction 伝播の有無）を fixture で再現する際の制御点は投影元ディレクトリの存在有無に置く
- **再発条件**: fallback の有無を含む検査器挙動を fixture で検証する場合
- **予防策候補**: fixture の directory 構成で環境差を表現する規約（copyScripts + src 配置制御）を検査器テストの標準パターンとして維持する
- **想定反映先**: checker-execution-contracts.md または agentdev-git-worktree-test-fallback Design の fixture 規約（learning-promote 経由で評価）
- **関連**: case 2777（Issue 2777 / PR 2778）
- **タグ**: #fixture #copyScripts #IR-062 #fallback

---

## 2026-09-12: bun test のファイル単体指定は .opencode/... 形式だと no test files matched になるため ./.opencode/... 付き相対パスで指定する

- **問題事象**: `bun test <path>` に `.opencode/...` 形式（`./` なし）のパスフィルタを渡すと tests の探索対象と一致せず「no test files matched」となり、テストが 1 件も実行されない
- **発生局面**: case 2779 の恒久検証手段（generate_indexes.test.ts 単体実行）実行時（case-run / case-close）
- **検知方法**: bun test 出力の「no test files matched」と ran 0 tests 系メッセージ
- **根本原因**: bun test のパスフィルタは相対パス（`./` 付き）として解決されるのに対し、`./` なしの `.opencode/...` 表記は探索対象のパス解決と一致しない
- **自律対応内容**: ファイル単体実行時は `./.opencode/...` 形式で指定する運用に統一。case 2779 では `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.test.ts` → 40 pass / 0 fail を取得（case-run / case-close 両工程で同結果）
- **ユーザー確認の有無**: なし（前例追認）
- **Decision/REQ/spec影響**: なし（既知の bun test 実行形態契約の細分化）
- **横展開観点**: repo 内テストスクリプトのファイル単体実行全般。ディレクトリ一括実行は repo root 起 cwd + `./.opencode/...` 形式（case 2777 の前例と同一方向）
- **再発条件**: `.opencode/...` 形式（`./` なし）で bun test にファイルパスを渡した場合
- **予防策候補**: bun test 実行形態契約に「ファイル単体指定は `./` 付き相対パス」を明記し、no test files matched 出力を検知条件にする
- **想定反映先**: checker-execution-contracts.md の bun test 実行形態契約（learning-promote 経由で評価）
- **関連**: case 2779（Issue 2779 / PR 2780）、case 2777（repo root 起 cwd 契約の前例）
- **タグ**: #bun-test #パスフィルタ #cwd

---
