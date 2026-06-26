# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## gh pr merge --delete-branch が worktree 活動中ブランチで local/remote 削除を巻き込み失敗

- **問題事象**: `gh pr merge <N> --squash --delete-branch` 実行時、対象ブランチがアクティブな worktree（`.worktrees/<N>-feature`）に checkout されていると、local branch 削除ステップが `cannot delete branch 'X' used by worktree at '...'` で失敗し、後続の remote branch 削除も巻き込まれて実行されなかった。GitHub 側の PR マージ自体は成功するが、remote branch が GitHub に残存した。
- **発生局面**: レビュー（case-close のブランチ削除ステップ）
- **検知方法**: `gh pr merge` のエラーメッセージと、事後の `gh api repos/.../branches/<branch>` で branch が 404 にならないことによる残存確認
- **根本原因**: `--delete-branch` は local→remote の順で削除を試みる。local 削除が worktree 占有エラーで失敗すると全体が中断され、remote 削除フェーズに到達しない。Step 7 の手順では worktree 削除が branch 削除より前に来るべきだが、`gh pr merge --delete-branch` は Step 4（マージ）で同時に削除を試みるため順序が逆転する。
- **自律対応内容**: worktree を `git worktree remove` で先に削除してから、`git push origin --delete <branch>` で remote branch を明示削除し、`git fetch --prune origin` で remote-tracking ref を整理した。local branch は `git branch -D` で削除済み（squash merge 後のため `-D` 必要）。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。case-close.md Step 4 と Step 7 の手順は正しい順序（Step 4 でマージ、Step 7 で worktree→branch 削除）を規定済み。本件は `gh pr merge --delete-branch` を Step 4 で使った結果の副作用であり、手順違反ではない。
- **横展開観点**: `gh pr merge --delete-branch` を worktree 運用環境で使う場合、`--delete-branch` を付けず Step 7 で明示削除する方が堅牢。または worktree を先に削除してからマージする順序も検討できるが、マージ失敗時のフォールバック（Step 4-2 rebase）と干渉するため、`--delete-branch` なし運用が安全。
- **再発条件**: case-close Step 4 で `gh pr merge --squash --delete-branch` を実行し、かつ対象ブランチがアクティブ worktree に checkout されている場合。
- **予防策候補**: case-close の PR マージ手続きを `gh pr merge <N> --squash`（`--delete-branch` なし）に統一し、branch 削除は Step 7 で worktree 削除後に明示実行する。
- **想定反映先**: `agentdev-gh-cli` 標準手続き（PR merge）、`case-close` Step 4 の `gh pr merge` 呼び出し箇所
- **関連**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`, `src/opencode/commands/agentdev/case-close.md` Step 4/7, PR #1143, Issue #1141
- **タグ**: `#git` `#gh-cli` `#worktree` `#ワークアラウンド`

## Issue 本文の事前状態記載が実装時点と乖離し、既解消 NG が残存NGとして列挙されていた

- **問題事象**: Issue #1145 の完了条件・課題セクションに「事前状態 ok 294 / ng 4 / warning 10」と「安定 NG 4件」が記載されていたが、case-run 実施時に check_integrity.ts を実行すると実測は「ok 206 / ng 2 / warning 13」であり、列挙された 4 NG のうち 2 件（case-run-execution-adapter reference path、japanese-tech-writing skill prefix）は既に別 commit（18643295, 574db1d0）で解消済みだった。Issue は case-open 時点の正しい状態を記載していたが、その後の check_integrity.ts 本体改修（f329537d IR-045 削除、IR-044 exemption 機械化等）により検出結果が変化し、Issue が陳腐化していた。
- **発生局面**: 実装（case-run の前提確認フェーズ）
- **検知方法**: case-run での check_integrity.ts 実行結果と Issue 本文の事前状態記載の突き合わせ。PR 本文 `## Findings / Capture候補` に数値差異と既解消 2件の経緯を記録。
- **根本原因**: Issue 本文（case-open 成果物）に check_integrity.ts の実行時点スナップショットを記載しているが、その後の check_integrity.ts 本体改修で検出結果が変動しても Issue 本文は追従更新されない。docs-check 対象 SPEC/実装の進化と Issue 事前状態記載の間に同期仕組みがない。
- **自律対応内容**: 既解消 2件（NG-1, NG-2）は本 case-run では触らず、未解消 2件（NG-3, NG-4）のみ修正対象とした。PR 本文の Findings セクションに「Issue 記載 4 NG のうち 2件は既解消、2件を本 PR で修正」と明記し、事前状態の数値差異（294/4/10 → 206/2/13）の原因も記録した。case-close の完了報告コメントでも 4 NG の解消経緯を表形式で明示した。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。本件は手続きの不備ではなく、Issue 事前状態の陳腐化という運用上の現象。case-open が記載すべき事前状態の粒度・更新タイミングに SPEC 上の規定なし。
- **横展開観点**: case-open で check_integrity.ts の実行結果（絶対件数）を Issue 本文に記載する場合、実装時点（case-run）での再計測結果と乖離するリスクが常にある。件数ではなく「解消すべき NG の識別子（ファイル・行・ルール）」を主情報とし、件数は参考値とする運用が陳腐化に強い。
- **再発条件**: case-open で check_integrity.ts の絶対件数を事前状態として Issue 本文に記載し、case-open から case-run の間に check_integrity.ts 本体が改修された場合。
- **予防策候補**: (a) case-open の事前状態記載を「NG 識別子リスト」中心にし、件数は補助情報とする、(b) case-run 開始時に Issue 事前状態を再計測して差異があれば Findings に記録する手順を明文化する（現在は case-run の自律判断に委ねられている）。
- **想定反映先**: `case-open` コマンド（事前状態記載フォーマット）、`case-run` コマンド（前提確認フェーズでの再計測・差異記録）
- **関連**: Issue #1145, PR #1147, commits 18643295 (#1126), 574db1d0, f329537d, `docs/specs/integrity-rule-catalog.md`
- **タグ**: `#docs-check` `#issue-staleness` `#case-open` `#case-run` `#事前状態`

## 複合ラベルの duty keyword 是正では読点（、）ではなく中黒（・）を使用する

- **問題事象**: case-close.md G21 の capture 責務 duty keyword「回収・保存」が読点表記「回収、保存」になっており、check_integrity.ts の `duties["case-close.md"].dutyKeyword`（値: `回収・保存`）と不一致のため command-capture-duty NG が報告されていた。文書是正で読点（、）を中黒（・）に修正して解消した。
- **発生局面**: 実装（case-run での文書是正）
- **検知方法**: check_integrity.ts の command-capture-duty ルールによる検出。NG メッセージから該当 duty keyword と期待値を特定。
- **根本原因**: 複合ラベル（複数の責務を1語で表す duty keyword）の区切り文字が読点と中黒のどちらかについて、文書作成時に規定が曖昧だった。check_integrity.ts 側は中黒（`・`）を期待しているが、case-close.md 本文は読点（`、`）を使用していた。日本語の複合語区切りには読点と中黒の両方が使われ得るため、機械的検出と文書表記の不一致が生じた。
- **自律対応内容**: case-close.md G21 の「回収、保存」を「回収・保存」に修正（中黒化）。check_integrity.ts の dutyKeyword 期待値と完全一致させることで NG を解消。PR 本文で「回収・保存」は capture 責務の複合ラベルであり、流動的並列（OU-001 読点化対象）ではないことを明記した。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。check_integrity.ts の dutyKeyword 定義が正（single source of truth）であり、文書側を是正するのが正しい方向。
- **横展開観点**: 他のコマンド（case-run, req-save 等の G21相当箇所）でも duty keyword が複合ラベルの場合、中黒表記を使用すべき。読点は「流動的並列」（プロセス段階の列挙等）に使い、中黒は「複合ラベル」（1語として固定の責務名）に使うという使い分け規約を文書化すると再発防止になる。
- **再発条件**: 複合ラベル duty keyword を読点区切りで文書に記載し、check_integrity.ts が中黒を期待している場合。
- **予防策候補**: (a) duty keyword の区切り文字規約（読点=流動的並列、中黒=複合ラベル）を `integrity-rule-catalog.md` または `japanese-tech-writing` スキルに明文化する、(b) 新規コマンド追加時に duty keyword を check_integrity.ts と文書で同時設定するチェックリストを設ける。
- **想定反映先**: `integrity-rule-catalog.md`（duty keyword 区切り文字規約）、`japanese-tech-writing` スキル（複合ラベルの中黒使用）
- **関連**: Issue #1145, PR #1147, `src/opencode/commands/agentdev/case-close.md` G21, `scripts/check_integrity.ts` dutyKeyword 定義
- **タグ**: `#docs-check` `#duty-keyword` `#文書是正` `#中黒` `#複合ラベル`

## PR #1122 の「X-6 = 0 件」宣言が再 grep 確認不備で 5 件残存していた

- **問題事象**: PR #1122 は X-6（「において」）について「7 ディレクトリ完全対応、残存 0 件」と宣言してマージされたが、PR #1163 の inspect-docs 再実行カタログで 5 件の残存を検出した。コミットログ照合の結果、5 件中 4 件（REQ-0102.md L83、req-define.md SPEC L81、spec-save.md SPEC L50、spec-save.md command L169）は PR #1122 以前から存在し、1 件（backticks-identifier-threshold.md L12）は spec-save コミット 465d9047（2026-06-25、PR #1122 merge 後）で新規発生。PR #1122 の完了宣言は不正確だった。
- **発生局面**: レビュー（OU-003 inspect-docs 再実行による裏付けカタログ生成）
- **検知方法**: PR #1163 の inspect-docs 機械判定アルゴリズム（`mechanical-replacement-rules.md`）による「において」の grep 再実行。検出件数と PR #1122 宣言値（0 件）の突き合わせ。
- **根本原因**: `mechanical-replacement-rules.md`「再現性の担保」節 Step 3-4（再 grep 0 件確認、REQ-0153 で必須化済み）が PR #1122 の完了宣言時に実行されなかった可能性。PR 完了宣言と機械的検証の連動が機能しなかった。
- **自律対応内容**: PR #1163 の Findings セクションに 5 件の残存（4 件 PR #1122 以前由来 + 1 件以後由来）をコミットログ照合で裏付け付きで記録し、AG-010 是正時に 5 件すべてを機械置換（`において`→`で`）で対応するよう明記した。本 case-close では intake F-1 としても分離回収。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。REQ-0153 で「再 grep 0 件確認」はすでに必須化済み。本件は REQ-0153 適用の運用徹底を要する事例であり、SPEC/REQ の新規改廃を要さない。
- **横展開観点**: 機械横断修正を伴う PR の完了宣言時には、`mechanical-replacement-rules.md` Step 3-4 の再 grep 0 件確認を case-run/case-close のどちらかで必ず実行し、PR 本文 Findings に 0 件確認結果を記録する運用の徹底が必要。case-close の QG-3/QG-4 検査項目に「再 grep 結果の記録」を組み込む拡張が有効。
- **再発条件**: 機械横断置換を伴う PR で、`mechanical-replacement-rules.md` Step 3-4（再 grep 0 件確認）を省略して完了宣言した場合。
- **予防策候補**: (a) case-close QG-4 の test strategy 処理完了確認に「機械横断置換を伴う PR は再 grep 0 件確認結果を Findings に記録すること」を検査項目として追加する、(b) `mechanical-replacement-rules.md` Step 3-4 を case-run の test-fix ループに組み込み PR 本文に自動記録する仕組みを設ける。
- **想定反映先**: `agentdev-quality-gates`（QG-4 検査項目拡充）、`agentdev-doc-writing`（`mechanical-replacement-rules.md` Step 3-4 の case-run 連動）
- **関連**: Issue #1162, PR #1163, PR #1122, 既知 L-012（再 grep 0 件確認）を補強する追加事例、REQ-0153、commit 465d9047、`src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md`
- **タグ**: `#inspect-docs` `#機械横断修正` `#完了宣言` `#再grep確認` `#宣言不一致`

## gh CLI の日本語出力を PowerShell で捕获すると stdout encoding 不一致で mojibake し書き戻しで本文破損

- **問題事象**: case-close Step 2（QG-4 完了条件チェックボックス更新）で `gh issue view 1164 --json body -q .body` で Issue 本文を PowerShell に取り込んだ際、stdout エンコーディングが既定（日本語 Windows では cp932/Shift-JIS 扱い）となり、UTF-8 の日本語本文が mojibake 化した。その後 `-replace` で ASCII パターンのみ置換して `gh issue edit --body-file` で書き戻したところ、GitHub 上の Issue 本文が mojibake 状態で上書き破損した（ASCII パターン3件は置換成功、日本語パターン1件は未置換で残）。VERIFY 再読込で破損を検知。
- **発生局面**: 完了処理（case-close Step 2 QG-4、Issue 本文読込・更新）
- **検知方法**: 書き戻し後の VERIFY 再読込（`gh issue view` 再取得）で、`unchecked=1 checked=3` となり想定（4項目すべて `[x]`）と不一致。本文ダンプで日本語が `縺ョも�E` 状の mojibake であることを確認。
- **根本原因**: PowerShell（Windows）でネイティブコマンド `gh` の stdout を取り込む際、`[Console]::OutputEncoding` が既定でシステムロケール（cp932）扱いとなり、UTF-8 バイト列を cp932 として誤デコードする。L-005（Write ツール既存 UTF-8 ファイル cp932 化）と同根の Windows PowerShell + UTF-8 非互換事象だが、Write ツールではなく gh CLI stdout 経路で発生する点が異なる。`-replace` で ASCII のみのパターンは元バイト列でも一致するため置換成功、日本語文字を含むパターンは mojibake バイト列と一致せず未置換。
- **自律対応内容**: (1) 破損検知後、セッション内会話から取得済みのクリーンな元本文を `Write` ツール（新規ファイル作成時は UTF-8 で書出すため安全、L-005 適用範囲外）で一時ファイルに出力し、4項目すべて `[x]` に反転済みの本文を再構築。(2) `gh issue edit --body-file` 実行前に `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` および `$OutputEncoding = [System.Text.Encoding]::UTF8` を設定してから再度実行。(3) VERIFY 再読込で mojibake 解消・4項目すべて `[x]` を確認。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。本件は実行環境のエンコーディング設定に起因する運用事象であり、SPEC/REQ/ADR の新規改廃を要さない。L-005（Write ツール既存 UTF-8 ファイル cp932 化）の知見を gh CLI stdout 経路に拡張適用する事例。
- **横展開観点**: PowerShell（Windows）で `gh` CLI の JSON 出力（`--json`/`-q .field`）から日本語本文を取り込むすべての処理（`gh issue view`、`gh pr view`、`gh issue edit --body-file` 前の読込等）で同様の mojibake リスクがある。`agentdev-gh-cli` skill の references/standard-procedures.md（Windows 標準版実装手順）、verify.md（VERIFY 手順）が該当経路。
- **再発条件**: PowerShell（Windows、特に日本語ロケール環境）で `[Console]::OutputEncoding` を UTF-8 に設定せずに `gh` CLI の日本語を含む JSON 出力を取り込み、そのデータを加工して GitHub へ書き戻す場合。
- **予防策候補**: (a) `agentdev-gh-cli` skill の standard-procedures.md / verify.md に「PowerShell 実行時は gh CLI 呼出し前に `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` を設定する」旨の標準手順を明記する、(b) verify.md の再読込 VERIFY 手順に「書き戻し後は mojibake チェック（日本語文字の健全性確認）を含める」ことを検査項目として追加する。
- **想定反映先**: `agentdev-gh-cli`（references/standard-procedures.md の Windows 手順、references/verify.md の再読込 VERIFY 検査項目）
- **関連**: Issue #1164, PR #1165, L-005（Write ツール既存 UTF-8 ファイル cp932 化、`src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`）、`src/opencode/skills/agentdev-gh-cli/references/verify.md`
- **タグ**: `#gh-cli` `#encoding` `#powershell` `#mojibake` `#verify` `#windows`

## SUB-D 網羅検証で gloss 形式 `日本語（英語）` を「推奨訳語置換済」と扱う判定規則

- **問題事象**: `integrity-rule-catalog.md` の SUB-D 網羅検証（OU-005 #1167）で `baseline`, `provider`, `variant`, `fixture` 候補語を grep 抽出した際、`基準（baseline）`、`種別パス（variant path）`、`有効なテストデータ（valid fixture）` 等、日本語主語 + 英語 gloss 形式のインスタンスが多数出現した。これらを「未置換の散文普通名詞」と誤認し再置換すると、gloss 情報の欠落、重複、または PR #1084 前例との不整合を生じる。
- **発生局面**: 実装（SUB-D per-instance 判定フェーズ）
- **検知方法**: PR #1084 `valid fixture→有効なテストデータ（valid fixture）` 前例出力形式と照合し、gloss 形式が既に PR #1084 出力形式と合致することを確認。判定結果を PR #1177 本文の per-instance 判定表に明記。
- **根本原因**: SUB-D 網羅検証は候補語の bare 英語出現を grep で抽出するため、`日本語（英語）` 形式も候補に含まれる。これを「未置換」と扱うか「推奨訳語置換済」と扱うかの判定規則が明文化されておらず、運用者の判断に委ねられやすいため。
- **自律対応内容**: gloss 形式 `日本語（英語）` を「推奨訳語置換済」として再置換対象外に分類。gloss は識別子（`baseline.json`、`baseline_status`、artifact list 値等）へのクロスリファレンス機能を保持するため英語括弧を維持したまま日本語を主語とする形式を尊重。PR #1177 で再置換対象外とした 8 インスタンス（L279/282/291/427/431/775/915/1210、うち L1210 は PR #1084 由来）に本規則を適用。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。`docs/specs/backticks-identifier-threshold.md`（#1164 accepted）は gloss 形式を明示的に扱っていないが、機械判定閾値（backtick 必須/任意）とは独立した運用規則であり、SPEC 本文の改廃を要さない。
- **横展開観点**: 他 SPEC ファイル（`mechanical-replacement-rules.md`、`runtime-package-boundary.md` 等）や `docs/specs/` 全般で SUB-D 検証を実施する場合に同規則を適用可能。`document-type-responsibilities.md` 訳語表の全エントリを網羅対象とする独立 OU（intake inbox 参照）でも適用対象。
- **再発条件**: SUB-D 網羅検証で候補語 grep を実行し、`日本語（英語）` gloss 形式インスタンスが含まれる場合。
- **予防策候補**: SUB-D 検証手順（`docs/specs/backticks-identifier-threshold.md` 適用ガイド等）に「gloss 形式 `日本語（英語）` は『推奨訳語置換済』として再置換対象外とする」旨の運用規則を明文化する。
- **想定反映先**: `docs/specs/backticks-identifier-threshold.md`（境界ケース実例の追記、case-close Step 3-2 (c) 見送り候補として既記録）、または新規 SPEC（表記是正運用規則集）の検討
- **関連**: Issue #1167, PR #1177, PR #1084（前例）, `docs/specs/integrity-rule-catalog.md` L279/282/291/427/431/775/915/1210, `docs/specs/backticks-identifier-threshold.md`
- **タグ**: `#sub-d` `#表記是正` `#backticks` `#gloss` `#translation`

## case-open の direct scope 外明記と Issue 完了条件の表現が乖離し QG-4 で調整が必要になった

- **問題事象**: RU-0002（REQ-0156）の case-open で case_open_hints に「既存SPECの段階移送（inspect/backlog 経由）は別 Issue / 別 Wave（direct scope 外）」と明記したが、Issue #1212 の完了条件 REQ-0156-005/006/008 は「移送が段階的かつ個別に行われていること」「参照先が移送単位で更新されていること」「integrity/rules/ サブディレクトリが存在し」と構造の存在を要求する表現のまま残存した。case-close（QG-4）で完了条件を評価する際、direct scope 外要件が未達として検出される潜在的乖離が生じた。
- **発生局面**: 完了処理（case-close Step 2 QG-4 完了条件評価）
- **検知方法**: case-run 工程3 の PR 本文 Findings F-001 として記録。case-close で完了条件 [x] 化の際に方針解釈が必要なことが顕在化。
- **根本原因**: case-open の case_open_hints は direct scope 外を明記するが、Issue 完了条件（REQ から機械生成）は direct scope 外要件を除外せず、構造存在要求の表現を維持する。case_open_hints と Issue 完了条件の間に同期仕組みがない。
- **自律対応内容**: 親エージェントが解決方針を確定（REQ-0156-005/006/008 の本来の意図は「SPEC 規範化（方針記載）」であり、実際の移送・分割は別 Issue）。case-close で「方針が SPEC に記載されていること」を達成基準として [x] 化し、follow-up Issue #1214 を作成して実移送・分割を参照。
- **ユーザー確認有無**: あり（親エージェントが解決方針を確定）
- **ADR/REQ/spec影響**: なし。case-open/case-auto の手続き上の留意点であり、SPEC/REQ/ADR の新規改廃を要さない。
- **横展開観点**: case-open で direct scope 外要件を完了条件に含める場合、完了条件を達成可能な表現（方針記載等）に調整すべき。または case-open が direct scope 外要件を明示的に完了条件から除外する運用。case-auto で case_open_hints と完了条件の整合性をチェックする仕組みが有効。
- **再発条件**: case-open で direct scope 外要件を完了条件に含め、完了条件が構造存在要求の表現のまま残存する場合。
- **予防策候補**: (a) case-open で direct scope 外要件の完了条件を「方針記載」等の達成可能な表現に調整する、(b) case-auto で case_open_hints と完了条件の整合性をチェックするステップを追加する。
- **想定反映先**: `case-open` コマンド（完了条件調整）、`case-auto` コマンド（整合性チェック）
- **関連**: Issue #1212, PR #1213, follow-up Issue #1214, RU-0002 case_open_hints
- **タグ**: `#case-open` `#case-auto` `#direct-scope` `#完了条件` `#整合性`
