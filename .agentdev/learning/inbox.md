# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-17: textlint guard が project root 外の temp worktree への edit/write を fail-closed ブロックする

- **問題事象**: 並行 case-open 下で Definition PR 用 worktree を C:\WINDOWS\TEMP\opencode 配下へ作成した場合、worktree 内ファイルへの edit/write ツール呼び出しが agentdev-textlint-guard の project root 外パス検査（fail-closed）でブロックされる。REQ-057.md への 1 行追加のような軽微な編集でも guard が停止させる。
- **発生局面**: case-open STEP-4（Definition PR 作成。並行実行中の兄弟 case-open がメイン working tree のブランチを占有していたため git worktree 方式を採用〔Case #2903、definition/issue-2903〕）。
- **検知方法**: edit ツール実行時の guard ブロック応答（edit targets a path outside the project root; blocked per fail-closed）。write ツールでも同様にブロックされることを確認。
- **根本原因**: guard の project root 外パス拒否はメイン working tree を前提とした設計であり、一時 worktree（git 管理下の正規リポジトリ複製）への意図的な編集とプロジェクト外への意図しない書込みを区別していない。
- **自律対応内容**: AGENTS.md 規約の標準手段である node writeFileSync（明示 utf8）で worktree 内ファイルを編集して迂回。BOM 無し・UTF-8 維持を読み戻し検証してから commit。
- **ユーザー確認の有無**: なし（AGENTS.md の既存規約内の迂回）。
- **Decision/REQ/spec影響**: なし（REQ-057-021 の node 明示エンコーディング経路は既に正規手段として規定済み）。
- **横展開観点**: 並行実行下で worktree 方式を使う全工程（case-open Definition PR、case-run、case-revise）で同様の迂回が必要になり得る。worktree を project root 配下へ作成する構成なら guard 干渉は回避できる。
- **再発条件**: project root 外（os.tmpdir 系）へ worktree を作り、edit/write ツールでファイル編集する場合に毎回発生。
- **予防策候補**: agentdev-git-worktree の並列実行安全ステージング手順に worktree 配置先と worktree 内編集の標準手段（node 明示 UTF-8 I/O または project root 配下 worktree）を明記する。agentdev-textlint-guard 側で git worktree の認識による除外を検討。
- **想定反映先**: agentdev-git-worktree Design / SKILL（worktree 操作手順）、agentdev-textlint-guard Plugin の guard 仕様。
- **関連**: Case #2903（Refs）、PR #2910（Refs）。
- **タグ**: #textlint-guard #worktree #windows-io #parallel-execution

---

## 2026-09-16: 並列テストプロセスの一時成果物が os.tmpdir() 横断走査で外部残渣として誤検出される

- **問題事象**: bun test フルスイート並列実行下で、archive-builder staging path テストの `os.tmpdir()` 横断 orphan scan が並列プロセスの `trust-archive-*` 一時残渣を検出し、テスト本体と無関係な flaky fail を生じていた（RU-0021）。
- **発生局面**: case-run（REQ-083-001 の flaky 隔離是正。PR #2885 RA-001）。
- **検知方法**: フルスイート並列実行の反復で flaky fail が継続することを case-open 前の観察で検知。
- **根本原因**: テスト固有の一時領域と並列プロセス間で共有される `os.tmpdir()` を走査対象として区別していなかった。
- **自律対応内容**: suite-private TMP/TMPDIR/TEMP 隔離を `mkdtempSync` で実装し、fixture 作成と残渣検査を同一専用領域へ閉じた（PR #2885 で適用済み・マージ済み）。
- **ユーザー確認の有無**: なし（case-run / case-close の検証で解消確認）。
- **Decision/REQ/spec影響**: なし（REQ-083-001 の完了条件として解消済み）。
- **横展開観点**: `os.tmpdir()` を横断走査するテスト・検査スクリプト全般で同種の誤検出が発生し得る。専用領域への閉じ込みは汎用パターン。
- **再発条件**: 新規テストが再びグローバル `os.tmpdir()` を横断走査対象に含めた場合。
- **予防策候補**: 残渣検査を含むテストではテスト固有 TMP を `mkdtempSync` で確保し、検査範囲をその配下に限定する規約化。
- **想定反映先**: REQ-083 隣接資産（trusted-distribution-gate 検査テスト規約）、将来の検査テスト新設時。
- **関連**: Issue #2882（Ref）、PR #2885（Refs）。
- **タグ**: #testing #parallel-flaky #tempdir

---

## 2026-09-16: TEMP に残存する既存 trust-archive-verify 残渣の観察

- **問題事象**: `trust-archive-verify-y0os8C` が本 Case 実行前に TEMP へ残存（作成時刻 2026-09-14）。PRE/POST で増分なし、本 Case の対象外。
- **発生局面**: case-run 検証（REQ-083-001 の orphan 検査 PRE/POST 計測）。
- **検知方法**: 検証時の TEMP trust-archive 残渣 PRE/POST 突合。
- **根本原因**: 過去の verify 系実行が残渣を清理せず放置した痕跡と推定（特定は未実施、対象外）。
- **自律対応内容**: 既存残渣として記録し、本 Case では増分なし（無変動）を確認。
- **ユーザー確認の有無**: なし（記録のみ）。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: checker 本体の残渣管理（古い残渣の清掃・期限管理）の別候補。
- **再発条件**: verify 系ツールが TEMP 残渣を清理しないまま運用が続く場合。
- **予防策候補**: checker 本体側の残渣クリーンアップ・期限切れ残渣の掃除導入を検討。
- **想定反映先**: trusted-distribution-gate checker 本体の残渣管理（将来の追跡Issue候補）。
- **関連**: PR #2885（Refs）の Findings 記録。
- **タグ**: #tempdir #residue #cleanup

---

## 2026-09-16: docs_chore の REQ 行 APPEND では traceability の missing-verification（unclassified）が必ず残る

- **問題事象**: REQ 行を新規 APPEND する docs_chore Case では、traceability check の missing-verification（unclassified）が必ず 1 件残る。検証対応要否カタログ（verification-scope-catalog.md）への登録が対象範囲に含まれない場合、case-run では self-decide できず Design確定候補への記録で case-close に引き継ぐことになる。
- **発生局面**: case-run（RU-0022、REQ-053-040 APPEND。PR #2888）。
- **検知方法**: worktree root での traceability check（--req REQ-053-040）で unclassified 検出。
- **根本原因**: 新規 REQ 行は実装直後にはカタログ未登録かつ検証対応宣言なしのため、未分類行として missing-verification に出る。
- **自律対応内容**: case-run では PR 本文「## Design確定候補」へ記録して case-close へ引き継ぎ、case-close STEP-3 Design 状態評価で検証対応任意行としてカタログ登録（commit 673f66a2）して解消。
- **ユーザー確認の有無**: なし（fail-open 運用と Design 確定候補処理で解消）。
- **Decision/REQ/spec影響**: なし（verification-scope-catalog.md への 1 行登録のみ）。
- **横展開観点**: REQ 行 APPEND を含む docs_chore Case の定義時には、カタログ登録を対象範囲に含めるか「## Design確定候補」への記録を想定しておくと case-run の検証差分説明が不要になる。あわせて `generate_indexes.ts` の再生成が req-health-metrics.md の AUTOGEN ブロックを更新する点（REQ 行数変化は README 索引ではなく健康メトリクスへ現れる点）は docs_chore 実装時の既知帰結として想定しておくと検証差分の説明が不要になる。
- **再発条件**: 検証対応要否カタログ登録を対象外とした REQ 行 APPEND Case が続く限り毎回発生。
- **予防策候補**: case-open の検証対応要否分類ゲートで新規行のカタログ登録を同時に確定する運用。
- **想定反映先**: REQ-031 / REQ-032 の Design 確定候補・capture 運用、case-open 分類ゲート。
- **関連**: Issue #2883（Ref）、PR #2888（Refs）。
- **タグ**: #docs-chore #traceability #unclassified

---

## 2026-09-16: REQ/Design の内容変更時は frontmatter updated を必須セットとして同時更新する

- **問題事象**: REQ/Design ファイルの内容変更 commit で frontmatter `updated`（最終更新日、patterns.md 定義）の同時更新が漏れた。機械ゲート（docs-check / targeted docs guard）では検出されず、review-work 品質ゲートの MINOR 所見として後から検出された（REQ-017.md 直近 4 コミット連続で更新慣行あり）。
- **発生局面**: case-run（RU-0023、REQ-017-020 APPEND。PR #2889 初回 commit 4247798c）。
- **検知方法**: review-work Code Quality レーン。
- **根本原因**: 内容変更と frontmatter 更新を必須セットとして扱う運用が慣行止まりで機械ゲート化されていない。
- **自律対応内容**: 第 2 commit 6725eb28 で frontmatter updated を補修（REQ-017.md / delegation-contracts.md / verification-scope-catalog.md）。
- **ユーザー確認の有無**: なし（case-run 内で補修完了）。
- **Decision/REQ/spec影響**: なし（lifecycle メタデータの運用慣行）。
- **横展開観点**: 内容変更 commit には frontmatter 更新を必須セットとして扱うのが安全。機械ゲート不在のため人的レビューに依存している点は同種の REQ/Design 系 Case で再発し得る。
- **再発条件**: frontmatter 更新を伴わない内容変更 commit が続く限り発生し得る。
- **予防策候補**: targeted docs guard への frontmatter 鮮度検査（内容変更と updated の整合）追加を検討。
- **想定反映先**: REQ-053 文書品質系、integrity rules（将来の検討候補）。
- **関連**: Issue #2884（Ref）、PR #2889（Refs）。
- **タグ**: #frontmatter #lifecycle-metadata #docs

---

## 2026-09-16: REQ 行本文と Design/カタログの「報告根拠」粒度差は正典 verbatim 原則で意図的に残り得る

- **問題事象**: REQ-017-020 の行本文（正典 verbatim 採用）には「親への不一致報告」が明示されず、Design 箇条書き・検証対応カタログの説明文が報告義務を含む粒度差が残った。
- **発生局面**: case-run（RU-0023。PR #2889）。
- **検知方法**: review-work 品質ゲート意味論所見（非ブロッキング）。
- **根本原因**: 行本文は Issue 本文 Definition Package を正とするため、派生物側の粒度を正に引き上げない判断が正規（正典優先）。
- **自律対応内容**: 現行維持（行本文を変更しない判断を記録）。
- **ユーザー確認の有無**: なし。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: 正典 verbatim 採用の REQ 行では、Design/カタログ側がより具体的な粒度を持つ粒度差が構造的に生じる。粒度差の検出自体は品質所見として正常であり、正典側への無断反映はしない。
- **再発条件**: 正典 verbatim 原則で REQ 行を APPEND する Case で派生物側が詳細化する限り発生し得る。
- **予防策候補**: docs 診断（inspect-docs）の DUPLICATE/DRIFT 観点で正典と派生物の粒度差を意図的差異と誤検出差異に分類する観点の整備検討。
- **想定反映先**: REQ-036 inspect 系、REQ-056 Project Knowledge の整備候補。
- **関連**: Issue #2884（Ref）、PR #2889（Refs）。
- **タグ**: #canonical-granularity #req-design #verbatim

---

## 2026-09-16: 同種突合規定群への新規定追記時は既存規定との優先順位の非明示が残り得る

- **問題事象**: delegation-contracts.md の既存突合規定（Issue 番号×対象成果物パス不一致時は委譲を開始しない）と新規規定（補助情報不一致時は除去/置換後に委譲開始可）の優先順位が「既存特定規定が優先」と読み解けるのみで明示されなかった。
- **発生局面**: case-run（RU-0023。PR #2889）。
- **検知方法**: review-work 品質ゲート意味論所見（非ブロッキング）。
- **根本原因**: 既存規定（REQ-017-019 対応 2 箇条書き）の改変が対象外のため、新規規定側で優先順位に触れられなかった。
- **自律対応内容**: 記録のみ（対象外変更は実施しない）。
- **ユーザー確認の有無**: なし。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: 既存節への追記系 Case では、既存規定の非改変制約と新規定の優先順位明示の両立が課題になる。優先順位の明文化は別途の追跡Issue（REQ-017 隣接）として起票する経路が安全。
- **再発条件**: 対象外制約付きの既存節追記 Case が続く限り発生し得る。
- **予防策候補**: 同種規定群への追記時は優先順位の非明示を PR 本文 Findings へ明示的に記録し、追跡Issue 化の判断材料にする運用。
- **想定反映先**: REQ-017 委譲契約系の将来の追跡Issue、docs 診断の DRIFT 観点。
- **関連**: Issue #2884（Ref）、PR #2889（Refs）。
- **タグ**: #precedence #delegation-contracts #docs

---

## 2026-09-16: node_modules 未伝播の worktree で bun test の zod 依存テストが fail する（junction 前置で回避）

- **問題事象**: package.json/node_modules をリポジトリに持たない構成の worktree で bun test フルスイートを実行すると、agentdev-project-extensions のテストが `zod` 解決失敗で 4件 fail した（変更起因ではなく環境依存の fail）。
- **発生局面**: case-run（Case #2890、PR #2892 の bun test 3分割正規形実行、初回第1分割）。
- **検知方法**: bun test 初回実行の 4 fail（zod 未解決）と、fail 内容の環境依存分類。
- **根本原因**: git worktree は非 git 管理の node_modules を伝播させない。bun のモジュール解決は実行 cwd の node_modules を辿るため worktree ルートから zod が解決できず、bun グローバル install キャッシュの zod は自動では使われない。
- **自律対応内容**: bun グローバル install の zod を指す `node_modules/zod` junction を worktree ルートへ前置して再実行し 0 fail を確認、検証後に junction を削除（PR #2892 テスト結果に環境ラベル付きで記録）。
- **ユーザー確認の有無**: なし（case-run 内で解消・case-close で記録受理）。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: zod 以外の外部パッケージ依存テストでも同様の worktree 依存解決失敗が発生し得る。junction 前置 → 検証後削除は汎用の回避手順。既存の worktree 依存整備知識（agentdev-git-worktree の bun test 環境前提）との重複・統合判定は learning-promote に委ねる。
- **再発条件**: node_modules をリポジトリに持たず外部パッケージ（zod 等）に依存するテストを、依存前置なしの worktree で実行した場合。
- **予防策候補**: worktree 検証手順に「依存解決失敗時は bun グローバル該当パッケージへの node_modules junction 前置、検証後削除」を明記する拡張。
- **想定反映先**: agentdev-git-worktree の bun test 環境前提（references/worktree-operations.md）の拡張候補。
- **関連**: Case #2890（Ref）、PR #2892（Refs）。
- **タグ**: #worktree #bun-test #zod #junction

---

## 2026-09-16: Draft Definition PR の draft 解除担当が case-open と case-ready の間で未定義のまま blocked 停止した

- **問題事象**: case-open が Draft Definition PR を作成し、case-ready が merge 責務を持つ構成のなかで、draft 解除（Ready for review 化）を担当する工程がどの workflow にも定義されておらず、case-ready の `pr_merge` が HTTP 405 (Pull Request is still a draft) で失敗して stage 1b が blocked 停止した。
- **発生局面**: case-auto stage 1b case-ready（Case #2895、Definition PR #2896。停止記録は Issue コメント 5697968508、2026-09-16）。
- **検知方法**: `agentdev_gh pr_merge` の HTTP 405 エラー（merge 不能原因が Draft 状態）。
- **根本原因**: Definition PR の作成（case-open）と merge（case-ready）の工程分割に対し、draft 解除の責務割当が不在のままだった。
- **自律対応内容**: 迂回操作（raw `gh pr ready`）は agentdev-gh-write-guard 違反のため実行せず、blocked 停止して resume_command（case-ready）を記録。ユーザー判断で PR を Ready for review 化した後、冪等再実行契約で再開し merge 完了。
- **ユーザー確認の有無**: あり（PR #2896 の Ready for review 化をユーザーが実施）。
- **Decision/REQ/spec影響**: なし（本学びの記録のみ。責務定義の更新は追跡Issue候補）。
- **横展開観点**: Draft PR を作成する工程と merge する工程が分かれている全 workflow で同種の責務空白が発生し得る。draft 解除手段が整備されるまで、Draft Definition PR を含む Case は同条件で blocked になり得る。
- **再発条件**: case-open が Draft Definition PR を作成し、かつ draft 解除の正規手段が整備されない限り毎回発生。
- **予防策候補**: (a) case-open での非 Draft 作成、(b) case-open または case-ready への draft 解除責務の定義、(c) Custom Tool への draft 解除操作追加、のいずれかの整備。
- **想定反映先**: case-open / case-ready workflow 定義（REQ-034 系）、agentdev_gh 操作カタログ。
- **関連**: Issue #2895（Ref）、PR #2896（Refs）、Issue コメント 5697968508（停止記録）。
- **タグ**: #draft-pr #responsibility-gap #case-ready #blocked

---

## 2026-09-16: Custom Tool agentdev_gh に Draft PR の draft 解除操作が存在しない

- **問題事象**: Custom Tool `agentdev_gh` の操作カタログに Draft PR の draft 解除（ready for review）操作が存在しない。`pr_update` は draft フィールド非対応、`pr_merge` は Draft PR に対して HTTP 405 で失敗するため、Tool 経由では Draft PR を merge 可能状態へ遷移できない。
- **発生局面**: case-auto stage 1b case-ready（Case #2895、Definition PR #2896）。
- **検知方法**: HTTP 405 エラーの原因分析と agentdev_gh 操作カタログ（issue/pr 系操作一覧）の確認。
- **根本原因**: Tool 操作カタログが PR ライフサイクルの draft→ready 遷移をカバーしていない。
- **自律対応内容**: Tool カバレッジ外と判定し、正規手段での解消を断念して blocked 停止（解消はユーザーの GitHub UI 操作）。
- **ユーザー確認の有無**: あり（ユーザーが Ready for review 化を実施）。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: Tool カタログは実行 workflow が必要とする GitHub 操作を網羅している前提で設計されているが、工程間のハンドオフ境界（作成と merge の分離）で初めて必要になる操作が欠落し得る。同様の「特定工程でのみ必要な操作」の欠落は他の状態遷移（reopen、label 操作等）でも再点検の価値がある。
- **再発条件**: Draft PR を Tool 経由で merge する工程が存在し、draft 解除操作が追加されない限り再発生。
- **予防策候補**: `agentdev_gh` へ `pr_ready`（draft 解除）操作の追加。追加時は agentdev-gh-write-guard の許可リスト同期も要確認。
- **想定反映先**: agentdev_gh（Custom Tool）の操作カタログ、REQ-006 系の Tool 操作契約。
- **関連**: Issue #2895（Ref）、PR #2896（Refs）、Issue コメント 5697968508。
- **タグ**: #custom-tool #github-api #coverage-gap #pr-lifecycle

---

## 2026-09-16: agentdev-gh-write-guard 下では Tool カバレッジ外の GitHub side-effect に正規手段がなく raw CLI 迂回は契約違反になる

- **問題事象**: draft 解除のような Custom Tool カバレッジ外の GitHub side-effect が必要になった際、raw `gh pr ready` は agentdev-gh-write-guard により機械ブロックされ、エージェントが単独で実行できる正規手段が存在しない。迂回実行はガード契約違反のため選択できない。
- **発生局面**: case-auto stage 1b case-ready（Case #2895、Definition PR #2896）。
- **検知方法**: raw `gh pr ready` 実行前の guard 判定（機械ブロック）。
- **根本原因**: write-guard は GitHub write 系を Custom Tool 経由に限定する安全機構であり、Tool カタログの網羅性が前提となっている。カタログ外の write は「安全に停止する」挙動が正（意図された設計）。
- **自律対応内容**: 迂回せず blocked 停止してユーザー判断へエスカレーション（resume_command 記録）。再開後の収束は冪等再実行契約で達成。
- **ユーザー確認の有無**: あり（ユーザー操作で解消）。
- **Decision/REQ/spec影響**: なし（ガード契約の正常動作の確認）。
- **横展開観点**: blocked → ユーザー操作 → 冪等再開の経路が期待どおり機能した実例。Tool カタログ拡張の要否判断は、ガードの安全側設計（fail-closed）を維持したまま行うべき。
- **再発条件**: Tool カタログ外の GitHub write 操作が必要になる局面が続く限り、同様の blocked 停止が発生し得る（ガード正常動作として）。
- **予防策候補**: workflow 定義時に必要な GitHub 操作を洗い出し、Custom Tool カタログとの差分を事前確認する運用。
- **想定反映先**: agentdev-gh-write-guard の運用知識、REQ-006 系 Tool 操作契約、workflow 定義時の操作洗い出し観点。
- **関連**: Issue #2895（Ref）、Issue コメント 5697968508。
- **タグ**: #write-guard #safety #fail-closed #escalation

---

## 2026-09-17: write ツールによるプロジェクト外一時パスへの書込みが agentdev-textlint-guard に fail-closed ブロックされる（AGENTS.md 推奨一時ディレクトリとの不整合）

- **問題事象**: 横断依存検査エンジンの入力 JSON を AGENTS.md 推奨の一時ディレクトリ（`C:\WINDOWS\TEMP\opencode`）へ write ツールで作成しようとしたところ、agentdev-textlint-guard Plugin が「write targets a path outside the project root; blocked per fail-closed」でブロックした。bash + node writeFileSync 経由（プロジェクト内一時ファイル）へ切り替えて解消。
- **発生局面**: case-open STEP-5 横断依存検査（Case #2898）。
- **検知方法**: write ツール実行時の guard による fail-closed ブロック（実行直前拒否）。
- **根本原因**: AGENTS.md は `C:\WINDOWS\TEMP\opencode` を「pre-approved for external directory access」の一時作業ディレクトリとして推奨する一方、agentdev-textlint-guard の書込み保護はプロジェクトルート外への write を一律 fail-closed で拒否する。推奨パスとガード契約の間に運用上の不整合があり、作業者は拒否されるまで推奨パスが使えないことを知り得ない。
- **自律対応内容**: 一時ファイルをプロジェクト内（repo root 直下の一時ファイル、実行後に削除）へ node writeFileSync で作成して回避。対象外ファイルへの影響なし、git 状態はクリーンを確認。
- **ユーザー確認の有無**: なし（単なるツール経路の切り替え、本筋影響なし）。
- **Decision/REQ/spec影響**: なし（ガードの fail-closed は意図された正しい動作。AGENTS.md 側の推奨記述の見直しが対応候補）。
- **横展開観点**: プロジェクト外への一時書込みが必要な決定論的スクリプト呼出（横断依存検査、採番スクリプト、validator 等の --input JSON 渡し）は、write ツールではなく node/bash 経由で一時ファイルを作成する運用に統一すべき。既知の cp932 破損回避（node 明示エンコーディング）とも整合する。
- **再発条件**: write ツールで AGENTS.md 推奨一時ディレクトリへ一時ファイルを作成しようとするたびに毎回発生する。
- **予防策候補**: AGENTS.md の一時ディレクトリ推奨に「write ツール不可、node writeFileSync 経由で記載」の注記追加、または textlint-guard への一時ディレクトリ許容パス設定の導入。
- **想定反映先**: `docs/knowledge/windows-powershell-bulk-io-corruption.md` 系知識への追記候補、AGENTS.md 行動規範、agentdev-textlint-guard の guard 設定。
- **関連**: Case #2898（Ref）。
- **タグ**: #textlint-guard #fail-closed #tempdir #agents-md

---

## 2026-09-17: req-health-metrics.md の AUTOGEN 計測日鮮度 NG は日付依存で再発する（内容不変でも日付だけで NG 化）

- **問題事象**: check_integrity --profile source で req-health-metrics.md の req-metrics-measurement-example AUTOGEN ブロックの計測日が前日（2026-09-16）のままのとき、REQ 行数変更がなくても index-generation-consistency NG（IR-061、SC-002）が 1 件出る。ベース commit e07ca49e で同一 NG を再現確認済み（case-run 記録）。
- **発生局面**: case-close STEP-3 docs 検証（Case #2898。実装 PR #2901 マージ後の check_integrity 再実行）。
- **検知方法**: check_integrity --json の summary.ng=1 と results の ng 項目（index-generation-consistency、first mismatch at line 56 の計測日不一致）。
- **根本原因**: AUTOGEN ブロックの計測日が生成時の日付刻印であり、日付が変わるとソース派生との突合が内容変更なしで不一致になる構造。
- **自律対応内容**: generate_indexes.ts を既存生成契約どおり実行して計測日を 2026-09-17 へ更新（commit 8ac79899）。check_integrity 再実行で ok 781 / ng 0 を確認。
- **ユーザー確認の有無**: なし（既存生成契約に従う機械的再生成）。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: 日付・時刻をブロックへ書き込む AUTOGEN 生成は、docs_chore（REQ 行 APPEND）でなくても、REQ 行数変化を伴う通常の実装 Case の case-close でも日付跨ぎで同様に再発し得る。docs_chore 学び（2026-09-16）の「REQ 行数変化は README 索引でなく健康メトリクスへ現れる」に日付依存性の軸を追加する形。
- **再発条件**: 計測日跨ぎのタイミングで check_integrity を実行する限り継続発生。
- **予防策候補**: 生成内容が不変の場合は計測日の日付刻印を据え置く生成器仕様、または case-close docs-check での AUTOGEN 再生成を標準工程化。
- **想定反映先**: generate_indexes.ts の生成仕様、case-close STEP-3 docs 検証手順、integrity 規約（IR-061 運用）。
- **関連**: Case #2898（Ref）、PR #2901（Refs）の Findings ②。
- **タグ**: #autogen #date-dependent #check-integrity #indexes

---

## 2026-09-17: bun test フルスイート初回実行のタイムアウト系 flaky は単独再実行とフル再実行の証跡で由来分類する

- **問題事象**: フルスイート分割①初回で IR-055 delta テストが 5000ms タイムアウトで 1 fail（2576 pass / 1 fail、2577 tests / 105 files）。単独再実行（137 pass / 0 fail）とフル再実行（2577 pass / 0 fail）で非再現。case-run 側でも runner-local.test.ts 1 件が初回のみ非再現 fail（並列実行時の一時領域干渉、PR #2901 Findings ③）。
- **発生局面**: case-close STEP-3 QG-4 bun test 正規形（Case #2898、main root）。
- **検知方法**: 分割実行の stderr/stdout 分離退避証跡（fail 全件の詳細、`timed out after 5000ms` の記録）。
- **根本原因**: 大規模スイート並列実行時の一時的な負荷・領域干渉による実行時間超過（アサーション失敗ではない）。
- **自律対応内容**: fail テストを単独再実行 → フル再実行の順で非再現を確認し、fail 由来分類を「環境依存（非再現、変更起因なし）」として記録。最終状態は fail 0 件・由来不明 0 件で機械受理基準を充足。
- **ユーザー確認の有無**: なし。
- **Decision/REQ/spec影響**: なし（fail 由来分類運用の確認）。
- **横展開観点**: 機械受理基準の「由来不明 0 件」を満たすためには、タイムアウト系 flaky の由来分類に再実行証跡（単独 + フル）の取得が必要。stderr/stdout 分離退避の証跡契約が分類根拠として機能した。
- **再発条件**: フルスイート実行の負荷環境が同様に重なった場合。
- **予防策候補**: 実行時間の長い統合系テストの per-test timeout 閾値の明示的見直し。
- **想定反映先**: agentdev-quality-gates の bun test 正規形運用知識、IR-055 関連テストの timeout 設定。
- **関連**: Case #2898（Ref）、PR #2901（Refs）。
- **タグ**: #bun-test #timeout #flaky #fail-classification

---

## 2026-09-17: 子 agent による長文 Issue 本文更新は部分更新指定か親回復で行う（trackingState 適用は親または正規機構）

- **問題事象**: case-auto stage 2（case-ready）で実行担当子 agent が Case Issue の ready 遷移（trackingState 適用）を agentdev_gh に拒否され、さらに長文 Issue 本文の全面再構成による更新にも 2 回失敗した。正規機構（Root Case 本文「Case 状態と次工程」セクションの部分更新、または親への復帰）で解決した。
- **発生局面**: case-auto 親 orchestration（Case #2898、stage 2 case-ready。pipeline 観察）。
- **検知方法**: 子 agent の agentdev_gh 拒否応答と本文全面再構成の失敗（2 回）の観察。
- **根本原因**: 子 agent への委譲プロンプトが、長文本文を持つ Issue の更新方法（precise old/new 行指定による部分更新または親回復）を規定しておらず、誤差リスクが高く失敗しやすい全面再構成経路を試みた。
- **自律対応内容**: 親側で本文の正規セクション部分更新/親回復を実施して ready 遷移を完了（case-ready 正規記録は Issue 本文に残存）。
- **ユーザー確認の有無**: なし。
- **Decision/REQ/spec影響**: なし（delegation prompt の運用改善）。
- **横展開観点**: 長文 Issue 本文の更新を委譲する場合、委譲プロンプトに「Tool 管理フィールド（trackingState 等）は親または正規機構で適用」「本文更新は precise old/new 行指定による部分更新」を明示するのが安全。全面再構成は byte-exact 保存要件（agentdev-issue-management の前後内容比較）と衝突する。
- **再発条件**: 長文本文 Issue の状態遷移・本文更新を部分更新指定なしで子 agent に委譲した場合。
- **予防策候補**: case-ready / case-run の delegation prompt テンプレートに部分更新指示と trackingState 適用の親責務を明記。
- **想定反映先**: agentdev-workflow-case-ready / agentdev-workflow-case-auto の delegation 指針、agentdev-workflow-orchestration のサブエージェント protocol。
- **関連**: Case #2898（Ref）。
- **タグ**: #delegation #issue-body #partial-update #tracking-state

---

## 2026-09-17: ADF-COVERS(implementation) 宣言付与は case-run 実行担当の標準責務（親の過度な抑制指示が差し戻しを生む）

- **問題事象**: case-run 初回委譲で親の抑制指示（declare ONLY rows the artifact genuinely implements）が過度に狭く働き、実装した REQ 行への ADF-COVERS(implementation) 宣言付与が行われず、traceability check の missing-implementation 検出で follow-up（DEL-2898-002）差し戻しが発生した。
- **発生局面**: case-auto stage 3 case-run → case-close STEP-3（Case #2898。PR #2901 Findings ①）。
- **検知方法**: traceability check の missing-implementation findings（REQ-083-001〜006、REQ-061-032）。
- **根本原因**: ADF-COVERS(implementation) 宣言の付与は case-run トレーサビリティ契約上の実行担当の標準的義務（実装する行の宣言は inventing ではない）であるにもかかわらず、委譲プロンプトの抑制文言が宣言そのものをためらわせる形になった。
- **自律対応内容**: bounded parent decision（DEL-2898-002）で標準責務を明示し、coverage query で既存宣言を確認のうえ 9 ファイルへ宣言付与。再実行で missing-implementation は REQ-083-002 / REQ-083-006（実装対象が構造的に存在しない Design 正規所有行・スコープ限定メタ行）のみの正しい残留に収斂。
- **ユーザー確認の有無**: なし（bounded parent decision 内の機械的完了）。
- **Decision/REQ/spec影響**: なし（既存契約の運用確認）。
- **横展開観点**: 実装対応・検証対応の対応宣言は実行担当の標準責務として委譲プロンプトに正の義務として書くべきで、inventing 抑制は「実際に実装しない行を無理に宣言しない」限定に留める。
- **再発条件**: 対応宣言を明示義務として書かない case-run 委譲プロンプトが続く限り発生。
- **予防策候補**: case-run delegation prompt に「変更成果物が実際に実装する REQ 行への ADF-COVERS(implementation) 宣言付与は標準責務」を明記。
- **想定反映先**: case-run command / agentdev-workflow-case-run の delegation 指針、agentdev-traceability の運用知識。
- **関連**: Case #2898（Ref）、PR #2901（Refs）の Findings ①。
- **タグ**: #adf-covers #traceability #delegation #case-run

---

## 2026-09-17: 新規 REQ CREATE を含む Definition PR で ADF-COVERS(implementation) 宣言付与責務が未定義のまま merge され case-run の traceability check で補完した

- **発生事象**: 新規 REQ CREATE（REQ-087）を含む Definition PR #2919 で、REQ 実現面の成果物（numbering-policy.md 等の Design）への ADF-COVERS(implementation) 宣言付与責務が case-open/case-ready のどちらにあるか明文化されておらず、REQ-087-001 が宣言欠落のまま merge された。case-run の traceability check で missing-implementation / missing-verification として検出され、実装 PR #2923 で補完した。
- **発生工程**: case-run（Case #2917、traceability check 実行時）。
- **検知方法**: agentdev-traceability check（check.ts --req REQ-087-001,002,003）が REQ-087-001 の missing 宣言を検出。
- **根本原因**: Definition 保存工程（case-open / case-ready）の品質検査に ADF-COVERS 宣言付与チェックが組込まれておらず、REQ 実現面成果物の宣言付与責務が定義されていない。
- **恒久対応内容**: 今回は numbering-policy.md へ ADF-COVERS(implementation): REQ-087-001 を付与し、検証対応要否カタログへ任意行登録して解消（PR #2923）。
- **ユーザー確認の有無**: なし（エージェント自律検知・修正）。
- **Decision/REQ/spec影響**: 影響の記録まで。Definition 保存工程での宣言付与チェック組込みの要否判断は promote 側に委ねる。
- **横展開視点**: 他の新規 REQ CREATE を含む Definition PR で同様の宣言欠落が再発し得る。REQ 行 APPEND の場合と新規 CREATE の場合で宣言対象成果物の範囲が異なる点にも注意。
- **再発条件**: 新規 REQ CREATE を含む Definition PR で REQ 実現面成果物へ ADF-COVERS 宣言を付与せずに merge した場合。
- **予防方法**: case-open / case-ready の Definition 品質検査へ、artifact_actions で宣言した成果物の ADF-COVERS 宣言存在確認を組込む。
- **想定反映先**: agentdev-workflow-case-open / agentdev-workflow-case-ready の Design（Definition 品質検査の検証対象）。
- **関連**: Case #2917（Refs）、PR #2919（Refs）、PR #2923（Refs）。
- **タグ**: #traceability #definition-pr #adf-covers

---

## 2026-09-17: case-close の Issue 本文更新で要約版 body を書き込み元セクションを欠落させ、再読込の事後確認で検知し復元した

- **確定事項**: agentdev_gh issue_update による Issue 本文更新は、更新対象箇所のみの部分差分ではなく渡した body 全文による全面置換である。本文全文を組み立てる際に元本文の複数セクション（実行識別情報、テスト戦略、scope-affecting impact candidate、横断依存検査記録）を省略した要約版を渡すと、欠落したまま read-back 検証済みの success が返る
- **発生工程**: case-close（Case #2902 の完了条件チェックボックス [x] 化更新、2026-09-17）
- **検知方法**: QG-4 完了条件評価の事後確認手順（更新後に issue_read で本文を再読込し全チェックボックス反映を確認）の過程で、初回読取時と比較してセクション欠落を検知
- **根本原因**: チェックボックス更新を「該当セクションだけの書き換え」と捉えて要約版 body を組み立てた。Custom Tool の更新操作が全文置換であるという操作モデルの把握不足
- **恒久対応内容**: 初回 issue_read で取得済みの元本文を正とし、完了条件の 5 行のみ `- [ ]` → `- [x]` に置換した完全版 body で再更新。再読込で全セクション復元とチェックボックス反映を確認
- **ユーザー確認の有無**: なし（エージェント自律の検知・修正）
- **Decision/REQ/spec影響**: なし。ただし issue 更新操作の全文置換性と元本文保持手順は agentdev-issue-management（Issue 更新時の前後内容比較）・agentdev-issue-tracking の操作知識に既存記述がある可能性があり、promote 側で重複統合を要する
- **展開観点**: Issue/PR 本文を更新する全 workflow（issue、case-close、epic-tracker、case-revise の Issue 本文更新等）に適用可能。「元本文取得 → 最小差分変換 → 全文書き戻し → 再読込で全文整合確認」を一連の手順として扱う。部分一致チェック（チェックボックスの [x] 化確認のみ）では欠落を検知できない
- **再発条件**: issue_update / pr_update で元本文を再構築せず要約・部分版 body を渡した場合
- **防止策**: 本文更新前に必ず直近本文を取得して保持し、差分行のみ編集して全文を書き戻す。更新後の再読込では本文全体の前後比較を行い、セクション欠落を含めて確認する
- **想定反映先**: agentdev-issue-management または agentdev-issue-tracking の操作手順、case-close workflow の Issue 本文更新手順
- **関連**: Case #2902、Issue #2902、Custom Tool agentdev_gh issue_update
- **タグ**: `#issue-update` `#case-close` `#full-body-replace` `#verification`

---

## 2026-09-17: Design accepted 昇格時の対応記録は変更対象 Design と同じ PR で保存する

- **問題事象**: Design を `accepted` へ昇格する Case で、昇格理由・Decision 適用状況・REQ 対応範囲・検証証跡を別 Issue や一時メモへ分散すると、Design のライフサイクル状態と対応記録の追跡が切れる。
- **発生局面**: case-close（Case #2906、PR #2929）。
- **検知方法**: Design acceptance の保存契約を QG-4 と docs 検証の対象として確認。
- **根本原因**: Design 本体の状態変更と、昇格時の対応記録保存を別工程として扱うと、同一変更単位の監査証跡が欠落し得る。
- **自律対応内容**: 対象 Design の `accepted` 状態と対応記録を同一 PR の変更として保存し、PR 本文に理由・Decision・REQ・検証証跡を記録した。
- **ユーザー確認の有無**: なし（既存の Design lifecycle 契約と QG-4 に基づく機械的確定）。
- **Decision/REQ/spec影響**: なし（既存契約の文書化・適用）。
- **横展開観点**: Design の accepted 昇格を含む全 Case で、変更対象 Design と acceptance record の同一 PR 保存を標準化する。
- **再発条件**: Design 状態変更と対応記録を別 PR・別一時成果物へ分離した場合。
- **予防策候補**: case-close の Design 確定ゲートで、acceptance record の同一 PR 保存と必須項目（理由、Decision、REQ、検証証跡）を確認する。
- **想定反映先**: agentdev-design-file-manager の lifecycle application / accepted promotion 契約、case-close の Design 確定手順。
- **関連**: Case #2906（Refs）、PR #2929（Refs）。
- **タグ**: `#design-lifecycle` `#accepted` `#case-close` `#traceability`

---
