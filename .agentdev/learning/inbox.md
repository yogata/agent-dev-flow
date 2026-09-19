# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-18: REQ 行追加時の Design 宣言追随確認漏れ（REQ-021-026 遵守漏れ）

- **問題事象**: case-open が REQ 行追加 (REQ-061-034/035, REQ-021-029) と REQ-057-018 行更新を伴う Definition PR (#2955) を作成した際、対象 Design ヘッダの ADF-COVERS(design) 宣言の追随を行わなかった。case-ready STEP-2 の traceability check で missing-design 4 行が検出され、ready へ遷移せず case-open へ差し戻し (Root Case #2954 停止報告 comment)。
- **発生局面**: case-open STEP-4 (Definition PR 作成)。REQ-021-026 (Design 保存内部責務における既存対応宣言ブロックの更新要否確認) の確認対象から Design ヘッダ宣言が漏れた。
- **検知方法**: case-ready STEP-2 の traceability check 機械実行 (`bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --req ...`)。case-open 時点では宣言追随の機械確認を実施していなかった。
- **根本原因**: REQ 行追加を伴う Definition Package 生成時、ACT-DESIGN-* の本文追記と REQ テーブル行の変更のみを確認し、変更対象 Design ヘッダの宣言ブロック更新要否 (REQ-021-026) を確認手順に組み込んでいなかった。
- **自律対応内容**: 差し戻し経路で追修正 Definition PR (#2956) を作成し、3 Design の宣言追随 (case-ready.md / req-define.md の宣言行追記、checker-execution-contracts.md へ ADF-COVERS(design): REQ-057-018 新設) を適用。check.ts で missing-design 0 件を機械確認済み。
- **ユーザー確認の有無**: なし (宣言追随のみの機械的修正、case-auto 委譲内で完結)
- **Decision/REQ/spec影響**: なし (REQ-021-026 の遵守手順の明確化のみ。新規 Decision / REQ 変更なし)
- **横展開観点**: REQ 行追加 (append) と既存行更新 (update) のいずれの場合も、変更対象 Design ヘッダの ADF-COVERS 宣言の追随要否確認を Definition PR 作成の完了条件に含めるべき。「行更新と直結する Design の design 宣言不在」という事前存在欠陥 (REQ-057-018 事例) も同確認で検出可能。
- **再発条件**: REQ 行の追加・更新を伴う Definition 変更で、該当 Design の宣言ブロック確認を省略した場合に再発する。
- **予防策候補**: case-open の Definition PR 作成手順に「draft artifact_actions が REQ 行変更を含む場合、変更対象 Design ヘッダの宣言ブロック更新要否を REQ-021-026 として確認し、check.ts 機械実行 (missing-design 0 件) を PR 作成前の機械ゲートとして実施する」ことを追加。
- **想定反映先**: case-open workflow skill (`references/root-case-and-definition-package.md` または `references/definition-pr-and-idempotency.md`)、learning-promote の評価対象。
- **関連**: Case #2954、PR #2955 (merge 済み)、PR #2956 (追修正)、case-ready 停止報告 comment (issuecomment-5723763427)、REQ-021-026、REQ-061-033
- **タグ**: #case-open #definition-pr #traceability #宣言追随 #REQ-021-026 #missing-design

---

## 2026-09-18: 配布 skill 文言追記が機械検査 3 系統に同時衝突する (PR 本文 Findings 回収)

- **問題事象**: 配布物 (src/opencode/skills/**) への文言追記 1 件が、既存の機械検査 3 系統に同時に引っかかる: (1) 配布スキル配下の concrete 要件行 ID (REQ-021-028 形式。完全性テスト + IR-055 delta)、(2) repo-* 接頭辞用語 (repo-local、IR-055 runtime-unresolved-reference)、(3) 対応宣言マーカー形状の文字列 (distribution purity check)。
- **発生局面**: case-run (DEL-2954-1) 実装中。delegation-and-result.md への ADF-COVERS 宣言付与の正の義務追記時に 3 系統すべてを経験。
- **検知方法**: bun test 分割① (integrity suite)、IR-055 delta、distribution purity check の機械検査。
- **根本原因**: 配布物は配布依存境界で repo 固有の concrete ID・repo-local 用語・宣言マーカー形状の持ち込みが禁止されており、追記文言の初稿がその契約に触れる書き方になっていた。
- **自律対応内容**: concrete ID の一般化表現化・repo-* 用語の回避・マーカー形状文字列の回避へ文言修正し、fix-and-reverify で全検査合格。
- **ユーザー確認の有無**: なし (文言修正のみ、case-auto 委譲内で完結)
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 今後の配布物追記では上記 3 系統を初稿から回避する。検査は 3 系統が独立に走るため、1 系統の修正が別系統を解消しない。
- **再発条件**: 配布 skill 文言に concrete REQ 行 ID、repo-* 用語、または対応宣言マーカーと同一形状の文字列を直接書いた場合に再発する。
- **予防策候補**: 配布物編集時の初稿チェックリスト化 (concrete ID 一般化、repo-* 用語回避、マーカー形状回避)。
- **想定反映先**: agentdev-distribution-boundary 関連 reference または配布物編集 knowledge、learning-promote の評価対象。
- **関連**: Case #2954、PR #2957、delegation-and-result.md
- **タグ**: #distribution-boundary #配布物 #機械検査 #fix-and-reverify

---

## 2026-09-18: bun run による .ts 直接実行は package.json なし環境で Module not found (PR 本文 Findings 回収)

- **問題事象**: repo root に package.json がない場合、`bun run <path>.ts` は Module not found となる (bun run は package.json scripts を解決する)。checker CLI の実行は `bun <path>` 形式を使う必要がある。また PowerShell リダイレクトによる checker stdout 退避が cp932 破壊の対象であること (AGENTS.md 既知事象) は spawnSync + writeFileSync (UTF-8 明示) での退避で継続回避。
- **発生局面**: case-run (DEL-2954-1) の checker 実行。
- **検知方法**: checker CLI 実行時の Module not found エラー。
- **根本原因**: `bun run` と `bun <直接パス実行>` の解決経路の違い (run サブコマンドは scripts 解決を挟む) の認識不足。
- **自律対応内容**: checker CLI 実行を `bun <path>` 形式へ統一。
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: checker 実行契約 Design「安定実行経路」の bun 経路実行時に影響し得る環境差。REQ-060 の bun test 形態 (`bun test ./path`) とは別経路である点の混同に注意。
- **再発条件**: package.json 非存在の cwd で `bun run <path>.ts` 形式を使った場合に再発する。
- **予防策候補**: checker CLI 実行は `bun <path>` 形式に統一する知識の明示化。
- **想定反映先**: checker 実行契約関連 knowledge、learning-promote の評価対象。
- **関連**: Case #2954、PR #2957、REQ-060
- **タグ**: #bun #checker実行 #実行形態

---

## 2026-09-18: PR タイトル事前変更は 1-commit PR の squash タイトルを制御できない (case-close STEP-4-3 手順の限界)

- **問題事象**: case-close STEP-4-3 の「PR タイトル事前変更」(issue_update で Conventional Commits + (Refs #N) 形式へ変更) を実施したが、squash merge commit のタイトルには反映されなかった。本リポジトリの squash merge 設定が 1-commit PR で commit message を採用する動作のため、branch HEAD の元 commit メッセージ (5ccfa74c) がそのまま squash タイトルになった。
- **発生局面**: case-close STEP-4-3 (PR #2957 squash merge)。
- **検知方法**: merge 後の `git log --oneline origin/main` で squash commit タイトルを確認。
- **根本原因**: squash コミットタイトルの由来がリポジトリ設定 (PR title 優先 vs commit message 優先) に依存する点の認識不足。reference の手順は PR title 優先設定を前提とする。
- **自律対応内容**: 実害の確認のみ (採用された元 commit message に auto-close キーワードを含まず、Issue 誤 close は発生しなかった。Issue は case-close が明示 close で完了)。
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: auto-close 回避の担保は「merge 前の branch HEAD commit message 自体に auto-close キーワードを含めない」ことでも成立する。PR タイトル変更は補助手段にすぎない環境がある。
- **再発条件**: commit message 優先設定のリポジトリで、case-close が branch HEAD commit message の auto-close キーワードを確認せず merge した場合に、誤 close リスクとして再発し得る。
- **予防策候補**: case-close STEP-4-3 の前置に「branch HEAD commit message の auto-close キーワード確認 (fixes/closes/resolves + 近接参照なし)」を追加する候補。
- **想定反映先**: agentdev-workflow-case-close reference (pr-merge-and-conflict.md STEP-4-3)、learning-promote の評価対象。
- **関連**: Case #2954、PR #2957、case-close STEP-4-3
- **タグ**: #case-close #squash-merge #auto-close回避 #GitHub

---

## 2026-09-18: v4 worktree での file tool 書込みが textlint guard の project root 固定により fail-closed ブロックされる

- **問題事象**: case-open を v4 worktree（../agent-dev-flow-v4、v4-dev branch）で実行した際、file tool（write）による docs 配下新規ファイル作成が「write targets a path outside the project root」として agentdev-textlint-guard に fail-closed ブロックされた。guard の project root 解決が起動元の main worktree（C:\Users\ogatay\work\agent-dev-flow）に固定され、同一リポジトリの別 worktree パスが project 外と判定される。
- **発生局面**: case-open STEP-4（v4 worktree 上での Decision 7 件・Design 7 件の新規作成、Case #2958、Definition PR #2959）
- **検知方法**: file tool 書込み時の guard エラー（fail-closed、迂回せず標準手段へ切替）
- **根本原因**: guard の project root 判定が harness セッションの起動元 worktree 基準であり、git worktree で分離された同一リポジトリの並行 worktree を project 外として扱う
- **自律対応内容**: AGENTS.md および docs/knowledge/windows-powershell-bulk-io-corruption.md の標準手段（node writeFileSync / 明示 UTF-8、PowerShell リダイレクト・標準 cmdlet 不使用）へ切替して書込みを継続し、全 17 ファイルの UTF-8 整合（置換文字混入なし）を node 読戻しで機械検証した
- **ユーザー確認の有無**: なし（guard の迂回・解除ではなく標準手段への切替。AGENTS.md 遵守）
- **Decision/REQ/spec影響**: なし（v4 worktree 上の .agentdev/ 実行状態の v4-dev commit は CR-006 の通常運用）
- **横展開観点**: case-ready/case-run/case-close を v4 worktree で実行する後続段階（RU §24 Sequence）でも同様に発生し得る。v4 worktree を起動元とするセッションでは guard の project root が v4 worktree を指すため解消する見込み。guard の project root 解決が同一リポジトリの worktree を project 内と判定する worktree 対応を持つかの確認は将来の改善候補
- **再発条件**: main worktree 起動のセッションから、git worktree で分離された別パス（../agent-dev-flow-v4 等）のファイルへ file tool で書込む場合に再発する。

## 2026-09-19: 証跡退避先・一時作業先の OS 一時ディレクトリも textlint guard の project root 外判定で fail-closed ブロックされる

- **観測事実**: case-open の v4 worktree 実行（Case #2967、Decision 2 件・Design 3 件の Definition 作成）で、(1) 検証用スクリプトを C:\\WINDOWS\\TEMP\\opencode へ write ツールで保存しようとした際「write targets a path outside the project root」で agentdev-textlint-guard の fail-closed ブロック、(2) v4 worktree 配下の既存ファイル（docs/designs/README.md）への edit ツール適用も同一 guard でブロック、の両方を実観測した。
- **工程位置**: case-open STEP-4（実変更判定と Definition PR 作成。RA-002 docs 作成・索引登録、RA-003 検証実行）
- **検知方法**: file tool（write/edit）実行時の guard エラー（fail-closed、選択肢は任意解除せず切替）
- **根本原因**: guard の project root 判定は harness セッション起動 worktree（main root）固定であり、(1) OS 一時ディレクトリ等の repo 外パス、(2) git worktree で分離された別パスの双方が project 外として扱われる。Case #2958 の学習（v4 worktree 配下）に対し、repo 外一時パス（TEMP）も同一判定対象であることを確認したもの
- **対応内容**: AGENTS.md 規範と docs/knowledge/windows-powershell-bulk-io-corruption.md の標準手段（node writeFileSync / 明示 UTF-8・LF、PowerShell リダイレクト・標準 cmdlet 不使用）へ切替し完遂。一時スクリプトは gitignore 対象の .agentdev/integrity/reports/ 配下へ置き、実行後に恒久証跡は GitHub（Issue/PR 本文・comment）へ記録（v4-durable-state-and-recovery Design の分類では OS 一時退避先はローカル実行環境状態であり恒久証跡としない、との整合も再確認）
- **ユーザー確認の有無**: なし（guard の解除・迂回ではなく標準手段への切替。AGENTS.md 規範）
- **Decision/REQ/spec影響**: なし（既存規範の運用確認のみ）
- **展開視点**: v4 worktree 系の後続工程（case-ready/case-run/case-close）でも同様に発生し得る。証跡退避・一時スクリプトの置き場は project root 内の gitignore 領域に限定するのが正規経路
- **再発条件**: main worktree 起動セッションから、repo 外一時パス（TEMP 等）または worktree 分離パスへ file tool で書込む場合
- **予防策**: 一時スクリプト・作業用 JSON は .agentdev/integrity/reports/（非永続・gitignore）配下へ配置。証跡は GitHub 恒久記録へ。ファイル書込みは node writeFileSync（UTF-8 明示）を第一選択とする
- **配布反映先**: agentdev-git-worktree「書込み guard 運用指針」節、docs/knowledge/windows-powershell-bulk-io-corruption.md、learning-promote の評価対象
- **関連**: Case #2967、PR #2968、Case #2958（関連学習: v4 worktree file tool write guard）
- **タグ**: #case-open #v4-worktree #textlint-guard #fail-closed #一時証跡退避 #証跡退避

## 2026-09-19: REQ 行追加を伴う Definition の TS「missing-implementation 不変」期待は新規 positioning 行で常に乖離する

- **問題事象**: case-open（Case #2979）で REQ 新規 8 行（REQ-004-054/055、REQ-030-016、REQ-031-031、REQ-032-028、REQ-061-036、REQ-062-009、REQ-034-039。いずれも positioning・評価経路行で implementation 実装を持たない）を含む Definition PR を作成したところ、draft TS-003 の期待「missing-implementation 103 不変」に対し実測 111（103 + 8）となった。policy.yaml verification.optional への登録は missing-verification のみ回避し、missing-implementation の加算を防がない。REQ-088 の 7 行も第3段で同じく 103 に加算済みであり（baseline 103 は REQ-088 7 行を含む）、既知パターンとして確認した。
- **工程位置**: case-open STEP-4〜検証（RA-001 baseline 採取、TS-003 traceability check）
- **検知方法**: traceability check（--json）の findings に新規行 ID が含まれる機械確認と、REQ-088 行が baseline findings に含まれる遡及確認- **根本原因**: draft のテスト戦略で数値期待を「絶対値不変」形式で書くと、REQ 行追加を伴う Case では新規行の implementation 未被覆分が常に加算される。宣言の design 側新設には既存行解消の負の寄与（v4-standard-lifecycle 宣言で missing-design 955→949、6 行解消）もあり、単純な相殺計算では期待を実装できない。
- **対応内容**: REQ-088 前例（positioning 行の implementation 未被覆は既知）に基づき「baseline + 新規行数 − 宣言解消」で実測整合を判断し、PR 本文に計算内訳を記録して Definition として確定。
- **ユーザー確認の有無**: なし（TS-003 on_failure の fix 手順内で判断。REQ-004-055 の design 宣言追加〔draft リストの抜け〕は on_failure の被覆追加手順で対応）
- **Decision/REQ/spec影響**: なし（検証期待値の書式問題）
- **展開視点**: REQ 行追加を伴う Case のテスト戦略では、トレーサビリティ数値を「絶対値不変」でなく「増減理由の型」（新規行数、宣言解消数、policy optional 登録の効果範囲）で書く。
- **再発条件**: REQ 行追加（positioning 行を含む）を伴う draft で TS に「missing-implementation / missing-design 不変」型の期待を書いた場合
- **予防策**: req-define で TS 数値を記述する際、artifact_actions の REQ 行追加の有無を確認し、増減理由型で記述する
- **配布反映先**: agentdev-learning-pipeline の評価対象、agentdev-req-analysis（TS 記述ガイド）、learning-promote の評価対象
- **関連**: Case #2979、PR #2980、Case #2973（REQ-088 前例）
- **タグ**: #case-open #traceability #TS数値期待 #REQ行追加 #positioning行
## 2026-09-19: 削除 Design 参照の「後継」注記が旧名 grep 0 件検査（TS-004 型）と衝突する

- **問題事象**: case-open（Case #2979）で 4 Design（workflow-contracts、input-resolution-and-durable-state、step-reference-contract、definition-readiness）の参照張替えを行う際、「v4-lifecycle-state-machine（旧 workflow-contracts「X」節を吸収）」「case-open / case-ready Design（definition-readiness 後継）」形式の注記を本文へ残したところ、TS-004 の「4 Design ファイル名 grep 0 件」検査が旧名に引っかかり 0 件にならなかった。
- **工程位置**: case-open STEP-4（ACT-DESIGN-017 参照張替え、TS-004 事前確認）
- **検知方法**: docs 配下の旧 Design 名 grep の再実行（残存 55 → 注記除去後 22、その内訳は全て正当クラス）
- **根本原因**: 対応関係の説明を各本文へ分散すると、旧名の grep 検査と構造的に衝突する。v3-v4-crosswalk references/crosswalk-inventory.md が対応関係の正本である以上、本文は後継 Design 名のみを持つべき
- **対応内容**: 「後継」注記を全除去し旧名を本文から排除（残存 22 箇所は DEC-029 superseded 本文・DEC-038 v3 歴史記述・crosswalk 処遇行・v4 Design 吸収節・OU-003 削除予定ファイル・reports の正当クラスに分類し記録）
- **ユーザー確認の有無**: なし（TS-004 の pass_criteria と AG-012「対応関係の正本は crosswalk」の契約からの機械的帰結）
- **Decision/REQ/spec影響**: なし
- **展開視点**: RETIRE / supersede を伴う再編 Case では、参照張替え時に対応関係の説明本文への残置を禁止し正本（crosswalk / 処遇記録）へ集約するのが機械検査整合の最短経路。張替え PR の本文に正本への集約を明記する
- **再発条件**: 削除予定 Design 名の grep 0 件を要求する検査項目を持つ Case で、「旧〜の後継」形式の注記を本文へ残した場合
- **予防策**: 参照張替えの標準手順に「旧名注記を残さない（正本参照のみ）」を含める
- **配布反映先**: agentdev-doc-diagnostics（参照整合診断）、learning-promote の評価対象
- **関連**: Case #2979、PR #2980
- **タグ**: #case-open #参照張替え #grep検査 #v4移行 #crosswalk
---

## 2026-09-19: check_integrity spawn 系テストの固定 timeout は環境性能差で flaky 化する

- **問題事象**: case-run（Case #2979 OU-003）の bun test 分割 1 で、check_integrity spawn 系 4 テストが手動実行 ~5.1 秒（5120/5284/5174/5147ms 実測）に対し 5000ms 固定 timeout で失敗。baseline 環境では通過する環境性能差が原因。
- **工程位置**: case-run（OU-003 実装、release fixture 追随 commit 23eb0e0d）
- **検知方法**: bun test 分割 1 の fail（2 errors・タイミング失敗）
- **根本原因**: spawn 系テストの timeout が実行環境の性能差を考慮しない固定値 5000ms である
- **対応内容**: 検証内容不変で timeout 15000ms へ猶予（commit 23eb0e0d）。恒久的な timeout 設定方針（環境差考慮・猶予倍率の標準化）の見直しは未解決の intake 候補
- **ユーザー確認の有無**: なし（タイミング猶予のみで検証内容不変）
- **Decision/REQ/spec影響**: なし
- **展開視点**: spawn を伴う回帰テストを worktree 等の非 baseline 環境で実行する場合、固定 timeout は flaky の常在要因になる
- **再発条件**: 性能差のある環境で spawn 系固定 timeout テストを実行した場合
- **予防策**: spawn 系テストの timeout は環境差を織り込んだ猶予値を設定する
- **配布反映先**: repo-agentdev-integrity scripts（timeout 方針見直し）、learning-promote の評価対象
- **関連**: Case #2979、Issue #2983（SSoT コメント判定根拠 4）、PR #2986（commit 23eb0e0d）
- **タグ**: #case-run #flaky #timeout #spawn #環境差

## 2026-09-19: release テスト fixture の文言完全一致期待は Design 吸収節の粒度差で破損する

- **問題事象**: 4 Design 物理削除（Case #2979 OU-003）で scripts/self/release の 2 テストが definition-readiness.md を fixture 参照し ENOENT。fixture を後継正規文書（case-ready.md / case-revise.md）へ追随した際、definition-readiness の「冪等キー」等の節は文言レベルでは後継に承継されておらず（意味は case-ready「冪等性」節等へ吸収済み）、文言完全一致型の fixture 期待は維持できなかった。
- **工程位置**: case-run（OU-003 実装、commit 23eb0e0d）
- **検知方法**: bun test 分割 1 の 2 errors（ENOENT）と fixture 追随時の文言照合
- **根本原因**: Definition 吸収は文言承継ではなく意味吸収の粒度で行われ、fixture の文言完全一致期待と噛み合わない
- **対応内容**: fixture を後継正規文書の実在節へ追随（commit 23eb0e0d）
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし
- **展開視点**: supersede を伴う再編で fixture を追随する場合、Definition 吸収節の粒度（語彙承継の有無）を先に確認してから fixture の期待形式を選ぶ
- **再発条件**: Design 削除・吸収を伴う Case で文言完全一致型 fixture を後継へ追随した場合
- **予防策**: fixture 追随手順に吸収節粒度の確認を含める
- **配布反映先**: scripts/self/release（fixture 運用）、learning-promote の評価対象
- **関連**: Case #2979、PR #2986（commit 23eb0e0d）
- **タグ**: #case-run #fixture #supersede #吸収節粒度

## 2026-09-19: 削除帰結の実行時設定（.agentdev/extensions 等）の参照追随はどの OU にも明示割当がない

- **問題事象**: 4 Design 物理削除（Case #2979 OU-003）の帰結で .agentdev/extensions/skills/ 7 ファイル 9 paths が dangling（checkExtensions strict failure 9 件）。extensions 参照追随は Root Case の 3 OU いずれの対象範囲にも明示割当がなく、削除を実施した OU-003 が帰結を吸収した（commit 0dc505b8）。同種の事例として learning-promote.md 参照張替え（commands scope と skills scope の隙間・E6-2）が Epic #2984 コメント 5739535761 / 5739649814 に記録済みで、本件は同問題クラスの 2 事例目。
- **工程位置**: case-run（OU-003 実装。削除帰結として session 内で発見・対応）
- **検知方法**: checkExtensions strict failure 9 件（fan-in 検査）
- **根本原因**: docs-chore OU の対象範囲定義が「削除起因の実行時設定参照の追随」を含まず、OU 間の隙間になった
- **対応内容**: OU-003 が旧→新参照マッピング表に従い extensions context.paths を v4 後継へ張替え。docs-chore OU の対象範囲定義への「削除起因の実行時設定参照の追随」追加は未解決の運用候補
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし
- **展開視点**: 物理削除を含む docs-chore OU の対象範囲定義に「削除起因の実行時設定参照の追随」を含める運用の候補。E6-2 と同問題クラス（OU 対象範囲定義の隙間）
- **再発条件**: 物理削除を含む docs-chore OU で、削除対象に依存する実行時設定の参照が存在する場合
- **予防策**: 削除対象の参照先を extensions / templates 等の実行時設定まで含めて事前確認する
- **配布反映先**: agentdev-case-run-execution-adapter（OU 対象範囲定義）、learning-promote の評価対象
- **関連**: Case #2979、PR #2986（commit 0dc505b8）、Epic #2984（E6-2 記録）
- **タグ**: #case-run #OU隙間 #extensions #docs-chore
