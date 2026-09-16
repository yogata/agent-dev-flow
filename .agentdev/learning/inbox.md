# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

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
