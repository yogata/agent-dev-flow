# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## agentdev_gh issue_list の全件走査で safety page limit に到達し state/search フィルタ必須を確認

- **問題事象**: agentdev_gh issue_list 操作で state を指定せず search のみで既存 Case 冪等検出を実行したところ、リポジトリの Issue 総数が多く「issue_list reached the safety page limit (10 pages of 100)」の operation-failed（retryable）が返った。ヒット有無の確認目的でも全ページ走査が発生する
- **発生局面**: 実装（case-open STEP-5 冪等検出の既存 Root Case 検索。Case #3080 実行中）
- **検知方法**: agentdev_gh issue_list 操作の operation-failed 応答（safety page limit メッセージ、contingency に gh CLI 読み取り fallback 提示）
- **根本原因**: issue_list は search 条件がヒットしなくても filter に一致する Issue をページング全走査するため、state 未指定（open + closed 全件）では大規模リポジトリで安全上限に到達する。filter を絞らずに広い検索を行った呼出側の使い方が直接原因
- **自律対応内容**: state: open を付与して再実行し、同一 search 条件で空結果を取得して冪等検出を完了した。gh CLI への切替は不要だった（1回目の再試行で解消）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Tool の公開契約変更は不要。使用側の運用知見）
- **横展開観点**: agentdev_gh issue_list の全呼び出し箇所（case-open STEP-5、case-ready、issue workflow 等）で state/search/labels フィルタを必須運用とする。冪等検出は open 状態のみで足りる Case 群が多い
- **再発条件**: Issue 数が大きいリポジトリ（1000 件超相当）で issue_list を state なし・search なしまたは広義 search で呼び出した場合
- **予防策候補**: workflow reference の冪等検出手順に「issue_list には state フィルタを付与する」旨を明記する。Tool 応答の contingency に filter 絞り込みヒントを含める
- **想定反映先**: src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（GitHub I/O 失敗時切替継続手順の周辺）、その他 issue_list を使う workflow skill references
- **関連**: .agentdev/integrity/reports/cross-dependency-input-3080.json、Case #3080、Definition PR #3081
- **タグ**: `#agentdev-gh` `#issue_list` `#冪等検出` `#ページ上限`

---

## PowerShell WriteLine の CRLF 出力が bash パイプ受信の行指向処理を破壊する

- **問題事象**: PowerShell `[Console]::WriteLine` は CRLF を出力し、bash の `$(...)` パイプ受信では行末 CR が残って `base64 -d` 等の行指向処理が失敗する。末尾行のみ CR が剥がれて一部成功するため検出が遅れる
- **発生局面**: 実装（TS-004 導入検証の HKCU 環境変数列挙実測。Case #3080 case-run 実行中）
- **検知方法**: 列挙エントリのデコード失敗（14 変数中 13 エントリが失敗）
- **根本原因**: `[Console]::WriteLine` の CRLF 出力（コンソール標準の行末が LF 前提の bash パイプと不整合）
- **自律対応内容**: `[Console]::OpenStandardOutput()` への LF 付きバイト直書きへ修正し、fix-and-reverify で列挙完全性を 0 malformed に解消
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: `docs/knowledge/windows-powershell-bulk-io-corruption.md` の隣接系統（PowerShell 経由の外部連携処理全般）。本 Case の知識文書（supervisor-bridge-credential-supply.md）にも回避策を記載済み。learning inbox への昇格候補として PR 本文に記録されたものを case-close が回収
- **再発条件**: PowerShell 標準出力を bash 側の行指向ツールへパイプする全処理
- **予防策候補**: PowerShell から外部へ stdout を渡す場合は `[Console]::OpenStandardOutput()` + LF 付きバイト書き出しを標準手段とする旨を windows-powershell-bulk-io-corruption.md 系の知識へ追記する
- **想定反映先**: docs/knowledge/windows-powershell-bulk-io-corruption.md（隣接系統の追記候補）
- **関連**: PR #3082 検証差分 TS-004、docs/knowledge/supervisor-bridge-credential-supply.md
- **タグ**: `#windows` `#PowerShell` `#CRLF` `#bash連携`

---

## worktree で bun test フル suite 正規形（3 cwd 分割）は .opencode/plugins 未伝播のため分割実行への代替が必要

- **問題事象**: bun test フル suite 正規形（3 cwd 分割実行）の分割③ `bun test ./.opencode/plugins/ ./scripts/` は、worktree に `.opencode/plugins` が未伝播（junction 非伝播の構造的制約）のためそのままでは成立しない
- **発生局面**: 実装（TS-001 bun test フル suite 実行。Case #3080 case-run / case-close 実行中）
- **検知方法**: worktree 上で分割③の plugins 経路が対象欠落となる件数突合での判別
- **根本原因**: `.opencode/plugins` の junction が worktree へ伝播しない構造的制約
- **自律対応内容**: scripts 経路（worktree）と plugins 経路（main root）への分割実行に代替し、環境ラベル（実行環境・実施範囲）を記録して worktree-run と main-run の混在を回避
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（QG-4 bun test 正規形契約は plugins 未実施を未実行対象として扱う運用注記と整合。正規形を変更しない）
- **横展開観点**: REQ-060 / QG-4 bun test 正規形の worktree 適用時の標準知見。case-close の QG-4 機械受理基準（件数突合・環境ラベル）で実施範囲を判別可能にする運用が有効
- **再発条件**: worktree 上で 3 cwd 分割実行の分割③を実行する全 Case
- **予防策候補**: case-run / case-close の bun test 正規形 reference に「worktree での分割③は plugins 経路を main root から実行し環境ラベルで記録する」代替手順を明記する
- **想定反映先**: .opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（worktree 環境差の運用注記周辺）
- **関連**: PR #3082 検証差分、QG-4 bun test フル suite 正規形
- **タグ**: `#bun-test` `#worktree` `#正規形` `#分割実行`

---

## traceability sidecar と inline ADF-COVERS の同一 artifact × 同一 role 二重宣言は duplicate-inconsistencies を起こす

- **問題事象**: traceability sidecar と inline ADF-COVERS の同一 artifact × 同一 role の二重宣言は、REQ セット不一致として duplicate-inconsistencies を起こす
- **発生局面**: 実装（traceability sidecar 作成。Case #3080 case-run 実行中）
- **検知方法**: traceability check の duplicate-inconsistencies finding
- **根本原因**: 同一対応関係が複数情報源に分散すると、check が表現形式を区別せず突合するためセット不一致として検出される
- **自律対応内容**: 単一情報源への集約（inline 既存なら inline 追加、sidecar なら sidecar のみ）に修正。role が違えば（implementation と verification）同一 artifact で併存可能
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の同一論理対応関係の取り扱い契約「sidecar と inline declaration を同じ論理的な対応関係として突合」の帰結）
- **横展開観点**: トレーサビリティ対応宣言を書く全工程（req-define、case-open、case-run、inspect 系）での宣言配置ルールとして横展開可能
- **再発条件**: 同一 artifact に sidecar と inline の両方で同一 role の対応関係を宣言した場合
- **予防策候補**: 宣言追加時に「同一 artifact × 同一 role は単一情報源のみ」というルールを agentdev-traceability の sidecar / policy authoring 手順へ明記する
- **想定反映先**: .opencode/skills/agentdev-traceability/SKILL.md または references（sidecar authoring 手順）
- **関連**: PR #3082、traceability/supervisor-bridge.yaml
- **タグ**: `#traceability` `#sidecar` `#ADF-COVERS` `#二重宣言`

---

## worktree での bun test 依存整備は junction 2 ディレクトリで足りる（削除は node fs.rmdirSync が確実）

- **問題事象**: worktree での bun test 実行には gitignore 対象 node_modules が未伝播のため依存解決失敗が発生する。また検証後の junction 削除は Git Bash の rmdir では「Not a directory」で拒否され、PowerShell Remove-Item は NonInteractive モードで確認プロンプトが出て失敗する
- **発生局面**: 実装（TS-001 bun test 実行の依存整備。Case #3080 case-run / case-close 実行中）
- **検知方法**: 依存解決失敗の fail、junction 削除コマンドの失敗応答
- **根本原因**: 依存解決に必要な package 境界は 2 箇所（agentdev-project-extensions/scripts と repo-* プレフィックス検査基盤 scripts）に限られる。Windows junction の削除はファイルシステム種別に依存したコマンド差分がある
- **自律対応内容**: junction 2 ディレクトリ（`.opencode/skills/repo-agentdev-integrity/scripts/node_modules` と `src/opencode/skills/agentdev-project-extensions/scripts/node_modules`、いずれも main 側実体への junction）の作成で整備し、検証後の削除は node `fs.rmdirSync` を使用（main 側実体は不変）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（QG-4 依存パッケージ前置契約の許容手段 2〔junction 作成〕の実運用確認）
- **横展開観点**: worktree 上で bun test を実行する全 Case の依存整備・後始末の標準手順として横展開可能
- **再発条件**: worktree で bun test を依存未整備のまま実行した場合、または junction を Git Bash / PowerShell 標準コマンドで削除しようとした場合
- **予防策候補**: junction 削除は node `fs.rmdirSync` を標準手段とする旨を agentdev-git-worktree の worktree 構造的制約 reference へ追記する
- **想定反映先**: .opencode/skills/agentdev-git-worktree/references/worktree-operations.md（worktree 構造的制約・依存整備の節）
- **関連**: PR #3082 検証差分、QG-4 依存パッケージ前置
- **タグ**: `#bun-test` `#worktree` `#junction` `#依存整備`

---

## agentdev_gh は harness 起動環境でリポジトリ解決が壊れていると全操作が fail-closed 不能になる（AGENTDEV_GH_REPO 起動環境設定が対処）

- **問題事象**: agentdev_gh の全操作（読み取り・書込みとも）が config-uninterpretable「cannot resolve the target repository」で確定失敗した。detail は「AGENTDEV_GH_REPO environment variable (not set)」「gh repo view exitCode=66」「stderr cause: (empty)」。同一セッションの bash からは `gh repo view` が正常（yogata/agent-dev-flow を返し exit 0）、`bun -e` からの spawnSync('gh') も status 0 で正常であり、呼出引数側の誤りではない
- **発生局面**: 運用（case-auto stage-1 case-open の並列委譲実行。RU-0123 draft の Root Case 確立 STEP-2 直前の冪等検出）
- **検知方法**: agentdev_gh issue_list 操作の config-uninterpretable（retryable: false）応答（3回同一失敗で確定的と判断）
- **根本原因**: harness プロセス（OpenCode サーバ）の起動環境に AGENTDEV_GH_REPO が未設定であり、かつ harness プロセス内の spawnSync('gh') が exit 66・stderr 空で失敗する（bash 経由では再現しないプロセス環境差。PATH 解決差や shim 差が疑われるが harness 内からは詳細不明）。plugin はリポジトリ解決を環境変数 → gh repo view の順で行い、解決不能時は全操作を fail-closed で失敗させる（仕様どおりの動作）
- **自律対応内容**: (1) 同一操作の再試行2回（同失敗）、(2) bash セッションへの AGENTDEV_GH_REPO export（Tool プロセスへは継承されず無効と実証）、(3) bun spawnSync 実証による bash 正常・harness 異常の切り分け、(4) 冪等検出のみ skill 契約どおり gh CLI 読取 fallback で完了（open Case Issue 0 件、open PR 0 件を確認）。書込み操作は raw gh 代替を禁止契約により行わず、Root Case 作成を停止して報告
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（plugin の fail-closed 契約と gh 読取 fallback 契約は仕様どおり機能。起動環境の運用問題であり契約変更不要）
- **横展開観点**: agentdev_gh を使う全 workflow（case-open/ready/run/close、issue、intake-from-github 等）で同様の全操作不能が起こり得る。読取 fallback は冪等検出限定で書込みは代替不能のため、バッチ投入前の前提として「harness プロセスと同一環境で gh 解決が通ること、または AGENTDEV_GH_REPO 設定済みであること」の疎通確認が有効
- **再発条件**: AGENTDEV_GH_REPO 未設定の launcher で harness を起動し、かつ harness プロセス環境で gh 実行解決が壊れている場合の全 agentdev_gh 呼出
- **予防策候補**: case-auto の投入前前提確認に「agentdev_gh の軽量 read 操作1件による解決疎通確認」を追加する。launcher 側は plugin README の導線（AGENTDEV_GH_REPO を起動環境へ設定）に従う
- **想定反映先**: docs/guides/consumer-project-setup.md「AGENTDEV_GH_REPO の起動環境設定」節（自ホスト環境での周知追記候補）、agentdev-workflow-case-auto（投入前前提確認の追加候補）
- **関連**: .opencode/plugins/agentdev-gh-tool/plugin.ts（resolveRepoFromGh、defaultResolveRepo）、.agentdev/drafts/req-draft-checker-base-ref-help-wording.md（RU-0123。Root Case 未作成のまま停止）
- **タグ**: `#agentdev-gh` `#リポジトリ解決` `#fail-closed` `#起動環境` `#AGENTDEV_GH_REPO`

---

## 並行 Case の共有 worktree で branch 混入を検知したら隔離 worktree で差分を再構成する

- **問題事象**: 複数の並行 case-open が同じ worktree を共有し、別 Case のコミットが Definition branch の親履歴へ混入した。共有 worktree は別委譲による checkout・commit の影響も受け、対象 Case 専用 branch を保証できなかった
- **発生局面**: 運用（case-open STEP-4 Definition PR 作成、Case #3087 / RU-0127）
- **検知方法**: `git log` で Definition branch の親コミットが別 Case #3088 の commit `cb59cb4e` と判明し、main 起点との差分に別 Case の履歴が含まれることを確認
- **根本原因**: 並行 Case の branch / checkout / commit 操作が共有 worktree と共有 git checkout 状態に対して行われ、個別の委譲作業境界が git worktree によって隔離されていなかった
- **自律対応内容**: 汚染 branch を PR に使用せず、main 起点の `.worktrees/3087-chore` 隔離 worktree を作成し、対象ファイルだけを含む自分の commit の差分を cherry-pick して、branch 差分が `docs/requirements/REQ-001.md` のみに限定されることを確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行時の並列作業境界に関する知見。現時点では正規成果物の変更判断をしない）
- **横展開観点**: 同一バッチ内で複数 Case が git 操作を行うすべての並行委譲に適用する。Issue ごとの作業ディレクトリと branch を共有 checkout から分離する
- **再発条件**: 複数委譲が同時に同一 worktree / checkout で branch 切替、編集、commit を行う場合
- **予防策候補**: case-open の Definition branch 作成を Case 専用 worktree 内で行い、PR 作成前に `merge-base` と `diff --stat` を検査して対象 Case の artifact path 以外の commit / file が含まれないことを確認する
- **想定反映先**: `agentdev-workflow-case-open` の branch / worktree 運用手順、および `case-auto` 並列 stage の委譲境界
- **関連**: Case #3087、Case #3088、Definition PR #3091、`definition/issue-3087`、`907a081e`、`a50ff629`
- **タグ**: `#parallel-case` `#worktree` `#branch-isolation` `#case-open`

---

## worktree 内 checker 直接実行は junction 伝播なしで完結した

- **問題事象**: なし（観察。worktree 環境での checker 実行・baseline 再生成が main-root fallback なしで完結したことの実証）
- **発生局面**: 実装（Case #3085 IR-055 baseline 更新。worktree .worktrees/3085-refactor からの worktree-direct 実行）
- **検知方法**: checker --json の environment.junctionPropagation = absent-skills-dir-fallback / executionRoot = worktree の計測値
- **根本原因**: 該当なし（worktree の .opencode/skills 配下は junction 未伝播でも、checker 自体は worktree 内実体で動作する）
- **自律対応内容**: checker 実行（--json）と baseline 再生成（--update-ir055-baseline）をすべて worktree 内で完結させ、main-root --root fallback 経路を不使用のまま全検証を合格させた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree で動く checker の実行経路選定時に main-root fallback を前提にしない。IR-055 の検査対象は src/opencode/commands|skills（SoT 側）に固定されるため projection 参照差が再生成結果へ混入しない設計である点も根拠
- **再発条件**: 該当なし（予防知見）
- **予防策候補**: なし
- **想定反映先**: worktree での checker 実行手順を記す skill references（実行経路選択の補強根拠）
- **関連**: Case #3085、PR #3095
- **タグ**: `#worktree` `#checker実行` `#junction`

---

## IR-055 baseline entry は file×pattern 単位で count 集約される（entries 数と検出件数は別指標）

- **問題事象**: なし（観察。同一行の同一 pattern 複数出現は count=2 の 1 entry に機械統合されるため、entries 増分と検出件数増分が一致しない）
- **発生局面**: 実装（Case #3085。pr_desc.md:39 の同一行 2 検出が count=2 の 1 entry に統合。entries 17 → 24 に対し検出 28 → 36）
- **検知方法**: baseline 更新前後の entries 数（17 → 24）と violations 数（28 → 36）の突合
- **根本原因**: baseline schema が file×pattern 単位の count 集約を持つため
- **自律対応内容**: entries 数と検出件数を別指標として記録し、8検出 → 追加 7 entries の対応を説明付きで記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: baseline の ratchet 検証（純追加確認）では entries 差分と検出件数差分の両方を突合する
- **再発条件**: 複数回出現する同一 pattern を含む差分の baseline 登録を件数比較だけで判断した場合
- **予防策候補**: baseline 更新の記録テンプレートに entries 数と検出件数の両方の記載を必須化
- **想定反映先**: docs/designs/integrity/integrity-contracts.md「RuntimeReference baseline 運用手順」周辺の記録様式
- **関連**: Case #3085、PR #3095、.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json
- **タグ**: `#IR-055` `#baseline` `#ratchet`

---

## bun test の summary（Ran N tests / pass fail 件数）は stderr へ出力される（stdout 退避のみでは件数突合不能）

- **問題事象**: bun test の実行証跡を stdout リダイレクトのみで退避したところ、ファイル容量 27 bytes でほぼ空となり「Ran N tests across M files」の件数突合に必要な summary が得られなかった
- **発生局面**: 運用（case-close QG-4 観点10 フル suite 3-split 実行。main root、bun 直接実行）
- **検知方法**: 退避 stdout ファイルの件数突合 grep が空になり、summary が stderr 側に出力されていることを確認
- **根本原因**: bun test はテスト結果 summary を stderr へ書く。stdout のみの退避では fail 詳細・件数が失われる
- **自律対応内容**: stdout / stderr を分離併退避する正規形（QG-4 bun test 実行形態契約どおり）で再取得し、3 分割合計 3294 pass / 0 fail / 145 files の件数突合を完了
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存契約「証跡の stdout・stderr 分離併退避」の正当性を実機で再確認したのみ）
- **横展開観点**: QG-4 機械受理基準の件数突合・fail 由来分類は stderr 退避ファイルが前提。agentdev-quality-gates の bun test 正規形参照時に stdout 単独退避をしない
- **再発条件**: bun test の証跡を stdout リダイレクトのみで取得した場合
- **予防策候補**: bun test 実行手順のサンプルコマンドに 2> stderr.txt を常時含める
- **想定反映先**: agentdev-quality-gates/references/qg-4-final-acceptance.md「証跡の stdout・stderr 分離併退避」節（既定どおりであることの実証記録）
- **関連**: Case #3085、QG-4 観点10、bun test 3 cwd 分割実行
- **タグ**: `#bun-test` `#QG-4` `#証跡` `#stderr`

---

## check_changed_docs.ts の node --experimental-strip-types 経路が CJS/ESM 混在で不通（bun run 経路へ迂回）

- **問題事象**: check_changed_docs.ts を node --experimental-strip-types で起動すると require is not defined in ES module scope で失敗する（scripts 側 package.json が type: module の一方でスクリプト内が CJS require 混在）
- **発生局面**: 実装（Case #3083。PR #3094 Findings learning 候補から回収）
- **検知方法**: checker 実行時の例外メッセージ確認（require is not defined in ES module scope）
- **根本原因**: scripts 側 package.json type: module とスクリプト内 CJS require 混在により、checker 実行契約 Design「安定実行経路」の node 経路が本スクリプトに対して不通
- **自律対応内容**: bun run 経路（spawnSync + stdout UTF-8 退避で flush 損失を防御）に迂回して targeted docs guard を合格
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（node 経路の復旧または経路記述の更新候補として本 entry に記録するのみ）
- **横展開観点**: node --experimental-strip-types 経路を安定実行経路として記述する checker は、CJS require 混在スクリプトでの動作確認を経路記述時に実施する
- **再発条件**: type: module 配下のスクリプトに CJS require が混在したまま node 経路で起動した場合
- **予防策候補**: check_changed_docs.ts の require を ESM import へ移行、または checker 実行契約の経路記述を bun run 経路へ更新
- **想定反映先**: checker 実行契約と検出基盤規則 Design「安定実行経路」節の経路記述更新
- **関連**: Case #3083、PR #3094、.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts
- **タグ**: `#checker` `#node-strip-types` `#bun-run` `#ESM`
