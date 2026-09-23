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

---

## worktree で check_integrity（source profile）の ng は junction 未伝播の環境依存として由来分類する

- **問題事象**: check_integrity（source profile）を worktree で実行すると、`.opencode/plugins/` 配下 junction 未伝播により repo-local-plugin-projection-symmetry の ng 2 件（projection missing・shim missing）が環境依存として出力される
- **発生局面**: 実装（Case #3088 case-run 検証。PR #3097 品質メトリクス収集中）
- **検知方法**: check_integrity --profile source の ng 計数と main root 再実行結果との突合（worktree cwd: ng 2 / main root: ng 0）
- **根本原因**: `.opencode/plugins` の junction が worktree へ未伝播の構造的制約により、projection 対称性検査が worktree 環境では不足状態を正しく報告する（検査の誤検出ではなく環境差の正検出）
- **自律対応内容**: main root で同 check を実行して ng 0 を機械確認し、由来分類（環境依存・当該変更起因でない）を突合して検証差分へ記録。worktree 内結果と main root 実体からの結果は検証種別ごとに分離記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree 実行時の check_integrity 結果解釈手順（main root 再実行による由来分類突合）が実用的。本件は PR 本文の Findings / Capture候補（learning）から case-close が回収
- **再発条件**: worktree cwd で check_integrity（source profile）を実行した場合
- **予防策候補**: worktree 実行時の check_integrity 結果の解釈手順（main root 突合による由来分類）を知識化する
- **想定反映先**: docs/knowledge/ 配下（worktree checker 実行の知識文書）または agentdev-git-worktree worktree-operations.md の checker 実行手順節周辺
- **関連**: Case #3088、PR #3097 検証差分
- **タグ**: `#check_integrity` `#worktree` `#junction` `#由来分類`

---

## bash から checker の --root に backslash パスを渡すと escape 解釈で破損し traceability check が見かけ上 missing を返す

- **問題事象**: bash セッションから traceability check に `--root C:\Users\...`（backslash 含む生パス）を渡すと、シェルの escape 解釈でパスが破損（`C:Users...`）し、対応宣言が 1 件も走査されない状態で missing-design / missing-implementation / missing-verification の 3 fail が返る
- **発生局面**: 運用（case-close STEP-2/3 の QG-4 トレーサビリティ独立再検査。Case #3088 case-close 再開実行）
- **検知方法**: 同一コマンドを forward slash 形式（`C:/Users/...`）で再実行したところ pass 9 / fail 0 となり、worktree 起点でも同値（pass 9 / fail 0）を確認。case-run の記録値との突合で破損パス実行が誤判定の原因と特定
- **根本原因**: bash は backslash を escape 文字として解釈するため、引用符なしの Windows 形式パスは引数段階で破損する。チェッカー側は破損パスを root として空コーパスを走査し、fail-closed 契約どおり missing を返す（チェッカー異常ではない）
- **自律対応内容**: forward slash 形式への統一で解消。main root 起点と worktree HEAD 起点の両方で pass 9 / fail 0 を再取得し、durable state 上で解消済みの対象行を本変更起因の失敗と誤判定していないことを確認して対応記録コメントへ補足記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Windows 環境で bash 経由の checker 実行パス指定は forward slash 形式（または引用符付き）に統一する。記録値との突合は「durable state 上で解消済みの対象行を誤失敗扱いしない」崩し手として有効
- **再発条件**: bash から Windows 形式（backslash）パスを引用符なしで checker のパス引数へ渡した場合
- **予防策候補**: checker 実行コマンド例のパス表記を forward slash 形式に統一する旨を実行手順例へ明記する
- **想定反映先**: .opencode/skills/agentdev-git-worktree/references/worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」節の例示補足
- **関連**: Case #3088、PR #3097、agentdev-traceability check CLI
- **タグ**: `#bash` `#Windows` `#パス指定` `#traceability`

---

## Windows node fs.symlinkSync の相対 target は dest ディレクトリ基準で解決される（worktree junction 依存整備の誤リンク）

- **問題事象**: Windows + node での junction 作成（worktree 依存整備の正規手段）で fs.symlinkSync に相対パス target を渡すと、cwd 基準ではなく dest ディレクトリ基準で絶対パス解決され、二重ネストの誤リンク先になる。本実行では worktree 側 junction が誤解決し stat ENOENT → TIM テスト 7 件 fail を一時的に誘発した（絶対パス指定で解消）
- **発生局面**: 実装（Case #3084。PR #3096 Findings learning 候補から回収）
- **検知方法**: worktree 側 junction の stat ENOENT と TIM テスト 7 件 fail の発生確認
- **根本原因**: fs.symlinkSync の相対 target は dest ディレクトリ基準で解決される。worktree 依存整備手順の junction 作成例は cwd 基準相対指定（cmd /c mklink /J）で書かれており、node 経由の場合の解決基準差異が手順記述にない
- **自律対応内容**: 絶対パス指定で junction を再作成し、同一 worktree で TIM テストを再実行して 7 件 fail の解消を確認（整備前後の結果は混在させていない）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存手順の実行形態差異の知見記録のみ）
- **横展開観点**: node 経由で junction/symlink を作る手順は dest ディレクトリ基準の解決を前提に絶対パス指定する。cmd /c mklink /J と fs.symlinkSync の解決基準差異は手順記述時に明記する
- **再発条件**: fs.symlinkSync に相対パス target を渡して junction を作成した場合
- **予防策候補**: worktree 依存整備手順の junction 作成例に node 経由の場合の絶対パス指定を追記
- **想定反映先**: agentdev-git-worktree references worktree-operations.md の bun test 実行環境前提（junction 作成例）
- **関連**: Case #3084、PR #3096、worktree 依存整備
- **タグ**: `#junction` `#symlink` `#windows` `#worktree`

---

## harness 制約下の case-run 委譲では実行担当接合を委譲実行者のプロセス内直接実装として履行し能力検出に基づく接合判定の記録が必要

- **問題事象**: 実行担当サブエージェント型の起動手段が研究系 agent に限定されたハーネスでは、adapter 委譲契約（agentdev-case-run-execution-adapter）の実行担当接合がそのままでは起動できない。即 delegation-unavailable と判断すると契約を満たせない
- **発生局面**: 実装（case-run STEP-S4 委譲起動時の能力検出。Case #3086 / PR #3093 Findings learning 候補から回収）
- **検知方法**: STEP-S4 委譲起動時の能力検出（実行担当サブエージェント型の起動手段が研究系 agent に限定されていることの確認）
- **根本原因**: ハーネスの能力差。委譲起動手段が制限された環境では委譲契約の接合形態をその前提に合わせて選択する必要がある
- **自律対応内容**: adapter 委譲契約の実行担当接合を委譲実行者のプロセス内直接実装として履行。result 4状態契約・3点ゲート・PR 本文 SSoT 契約は同一契約で self-applied して遵守した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（委譲契約自体の変更は不要。harness 差異の運用知見）
- **横展開観点**: 委譲起動手段が制限されたハーネスでの case-run 実行時は、即 delegation-unavailable と判断せず、harness の能力検出結果に基づく接合判定とその記録が必要
- **再発条件**: 実行担当サブエージェント型の起動手段が制限された harness で case-run の委譲を実行する場合
- **予防策候補**: agentdev-case-run-execution-adapter の reference に harness 能力検出結果に基づく接合判定（起動手段不在時のプロセス内直接実装 + 契約 self-apply の記録）の経路を明記
- **想定反映先**: .opencode/skills/agentdev-case-run-execution-adapter/references/（委譲実行手順の harness 差異節）
- **関連**: Case #3086、PR #3093（Findings learning 候補から回収）
- **タグ**: `#case-run` `#委譲` `#harness制約` `#adapter`

---

## worktree での bun test 3-split 実行は並行マージによる IR-055 baseline 更新の未追随で delta guard 疑似 fail を出す（由来分類は baseline 再現確認で機械確定）

- **問題事象**: case-close の full integrity suite（bun test 3-split）を PR HEAD worktree で実行したところ、IR-055 delta guard（配布物に新規 delta 違反なし）が Expected 0 / Received 8 で fail。本 PR は docs guide のみ変更で配布物を変更していない
- **発生局面**: 実装（case-close STEP-3 full integrity suite。Case #3086 case-close 実行中）
- **検知方法**: 分割①の 1 fail（check_integrity.test.ts IR-055 delta guard）と違反 8 件の抽出（いずれも本 PR 未変更の配布物ファイル）
- **根本原因**: 並行 sibling case-close（Case #3085、main merge 610fafd5）が IR-055 baseline に 8 件を baseline-known 登録済みで、worktree HEAD は分岐時点の旧 baseline（generated_at 2026-09-15）のまま。worktree の追随不足により baseline-known 判定が効かず「new (delta from baseline)」と誤分類される
- **自律対応内容**: 3 点の証拠で環境依存と由来分類した。①単独再実行で再現（151 pass/1 fail）、②baseline commit（分岐点 b2e74364）の main root 変更ゼロ実行で 0 fail（152 pass）、③worktree の baseline を main 正規版へ一時差し替えた同一テストで 0 fail（152 pass、検証後復元）。由来不明 0 件で suite を受理
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree 起点の integrity suite 実行では、並行 main 進行による baseline 系 durable state の追随差を fail 由来分類の前提に入れる。QG-4「durable state 上で解消済みの対象を本変更起因の失敗と誤判定しない」の実手順として baseline 差し替え再実行が決定的証拠になる
- **再発条件**: 並行セッションが IR-055 baseline（または同種 baseline 系ファイル）を更新した commit が main にマージした後、旧 baseline のままの worktree で delta guard を含む suite を実行した場合
- **予防策候補**: bun test 3-split の worktree 実行手順に、baseline 系 fail 発生時の由来分類手順（単独再実行 → baseline commit main root 再現確認 → baseline 差し替え再実行〔検証後復元〕）を明記
- **想定反映先**: agentdev-quality-gates references qg-4-final-acceptance.md「fail 由来分類」節、agentdev-git-worktree worktree-operations.md の bun test 実行環境前提
- **関連**: Case #3086、Case #3085（baseline 更新元 main merge 610fafd5）、.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json
- **タグ**: `#IR-055` `#baseline` `#worktree` `#由来分類` `#bun-test`
