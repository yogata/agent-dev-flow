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

## 2026-09-19: 張替えリンクの相対パス誤りが check_integrity 新增 NG として検出（Case #2988 case-open）

- **問題事象**: Definition PR の docs 参照張替えで、v4-runtime-execution-model への新規リンク 2 箇所（case-close.md・system.md）を相対パス ../workflows/v4-runtime-execution-model.md で作成した。同 Design の実際の配置は foundations/ 配下であり、check_integrity の designs-relative-link-existence 2 件 + broken-file-link 2 件（合計 ng 54 → 58）として検出された。
- **発生局面**: case-open STEP-4（Definition PR 搭載 docs 編集の AG-015 語 3 種張替え）。
- **検知方法**: commit → 検証 → push の順序で実施した check_integrity --json summary の baseline 比較（baseline v4-dev @a3a3b981 {ok 794, ng 54, warning 3} に対し {ok 793, ng 58, warning 3}）。
- **根本原因**: 張替え先 Design 名（v4-runtime-execution-model）は foundations/ 配下である一方、張替え元の epic-wave-model が workflows/ 配下であったため、旧パスのディレクトリ部分を無意識に踏襲した。リンク先名とリンク先配置ディレクトリの対応を確認する手順が張替え作業に含まれていなかった。
- **自律対応内容**: fix commit d92d1add（case-close.md は ../foundations/ へ、system.md は同階層表記へ修正）。fix-and-reverify 正規経路で check_integrity 再実行し baseline 完全一致（{ok 794, ng 54, warning 3}・新增 0）へ復帰。
- **ユーザー確認の有無**: なし（機械検出 → 機械的修正）。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: 参照張替え（ref remap）系の作業では、張替え後リンクの「対象ファイル配置ディレクトリと相対パスの整合」を編集 script 内の assert に含めるか、張替えリストに絶対配置（docs/designs/foundations 等の実パス）を明記して作成すべき。commit → 検証 → push の順序（check_changed_docs が diff を持つ条件）と check_integrity baseline 比較の組み合わせが本種の欠陥を高確度で捕捉する。

## 2026-09-19: pwsh パイプ経由の bun script JSON 出力解析での文字化け（Case #2988 case-open）

- **問題事象**: inspect_cross_dependencies.ts の stdout JSON を pwsh パイプで node -e に渡して JSON.parse したところ、日本語メッセージのエンコード変換破損により Bad control character で parse 失敗した。
- **発生局面**: case-open STEP-5（横断依存検査の機械的比較）。
- **検知方法**: JSON.parse 例外（SyntaxError: Bad control character in string literal）。
- **根本原因**: pwsh のパイプはネイティブ出力をエンコード変換して渡すため、UTF-8 バイト列が破損する（docs/knowledge/windows-powershell-bulk-io-corruption.md のパイプ版事象の再確認）。
- **自律対応内容**: engine を import する薄い wrapper（x-dep-run.mts）を作成し、報告 JSON を fs.writeFileSync でファイルへ書かせてから読み取る方式へ切替。正常に解析できた。
- **ユーザー確認の有無**: なし。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: bun/node スクリプトの構造化出力（JSON）を後段で解析する場合は、pwsh パイプを介さずファイル書込み経由で受け渡すのが正規手段。 PowerShell リダイレクト（>）と同様にパイプ経由の受け渡しも破損対象であることを実証。

## 2026-09-19: 共有 v4 worktree への write/edit ツール書込みが guard fail-closed ブロック（Case #2997 case-open）

- **問題事象**: v4 worktree（../agent-dev-flow-v4）の docs ファイル編集を write ツール（一時 node スクリプト配置）と edit ツール（per-line replace）の両方で試みたところ、agentdev-textlint-guard が両方とも project root（main worktree）外への書込みとして fail-closed ブロックした。read ツールと bash は通るため、ツール系の project root 解決が main worktree 固定であることが原因。
- **発生局面**: case-open STEP-3/4（Definition Package の 13 ACT ファイル編集）。実装先が共有 v4 worktree である構成（RA-003 実行セッション cwd = main worktree 固定・junction 構造保護）で発生。
- **検知方法**: write/edit ツールの fail 応答（agentdev-textlint-guard: edit targets a path outside the project root; blocked per fail-closed）。
- **根本原因**: ファイル操作ツール（write/edit）の project root 判定はセッション起動 cwd（main worktree）に固定され、共有 worktree 絶対パスが常に root 外と判定される。bash 経由の node は guard 対象外であった。
- **自律対応内容**: AGENTS.md 規定の標準手段（node readFileSync/writeFileSync・UTF-8 BOM なし LF）へ切替。置換文字列は全て draft ファイルからの機械抽出（byte-exact）または Unicode エスケープで構築し、PowerShell クォート問題と cp932 再符号化リスクの両方を回避。各置換は出現数 assert 付きで fail-closed 検証し、TS-001 の要件行差分 0 検証と接続文 byte-exact 照合で確認した。
- **ユーザー確認の有無**: なし（標準手段への切替は AGENTS.md と worktree-operations.md 書込み guard 運用指針の規定経路）。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: 共有 v4 worktree を編集対象とする workflow では、ファイル操作ツール（write/edit）は最初から使用せず bash 経由 node スクリプト（出現数 assert 付き replace + UTF-8 明示）を第一手段とするのが効率的。draft からの byte-exact 抽出と出現数 assert の組み合わせは文字化けと部分適用の両方を機械的に防止する。guard の fail-closed 性質は正しく機能しており、迂回（guard 設定変更等）ではなく標準手段への切替を維持する。

---

## 2026-09-19: check_distribution_boundary への契約外 --base-ref/--head-ref 指定は repoRoot 誤解釈で fail-closed になる（Case #2997 境界委譲）

- **問題事象**: check_changed_docs 由来のオプション習慣で check_distribution_boundary に --base-ref / --head-ref を渡したところ、両オプションは同 checker の CLI 契約（[--profile P] [--json] [--save-baseline|--delta] [--exemptions] [repoRoot]・exit 0/1/2）に存在せず、値が repoRoot 位置に誤解釈されて検査が fail-closed 失敗した。
- **工程位置**: case-close 前段の境界委譲（Epic #3001 Wave fan-in 検査。Case #2997 第6段）
- **検知方法**: checker 実行時の fail-closed 応答（契約外フラグの実証）
- **根本原因**: checker 間の CLI 契約の取り違え。--base-ref は check_changed_docs の契約オプションであり、check_distribution_boundary には存在しない。未知フラグは値ごと位置引数（repoRoot）へ落ちる
- **対応内容**: 正規形 `--profile source` + repoRoot 位置引数で再実行し合格（failures 0・scanned 342）
- **ユーザー確認の有無**: なし（正規 CLI 契約への切替のみ）
- **Decision/REQ/spec影響**: なし
- **横展開観点**: checker CLI は checker ごとに契約が独立しており、同名オプションの存在は checker 間で互換ではない。契約外フラグがエラーにならず位置引数へ誤解釈される経路は、fail-closed な exit 契約があるため誤検査の隠蔽には至らないが、実行コマンドは usage / CLI 契約コメントからの複写を第一とする
- **再発条件**: check_changed_docs の --base-ref 習慣を check_distribution_boundary 実行へ持ち込んだ場合
- **予防策**: checker 実行コマンド列は実装の usage コメント（check_distribution_boundary_cli.ts 冒頭）から複写し、記憶から組み立てない
- **配布反映先**: docs/designs/integrity/checker-execution-contracts.md 関連 knowledge、learning-promote の評価対象
- **関連**: Case #2997、Epic #3001、check_distribution_boundary_cli.ts、docs/designs/integrity/distribution-boundary.md
- **タグ**: #case-close #distribution-boundary #CLI契約 #fail-closed #checker実行

## 2026-09-19: bun test のディレクトリ filter は `./` なしの深い .opencode パスでサイレント 0 件一致になる

- **問題事象**: bun 1.3.6 で `bun test .opencode/skills/repo-agentdev-integrity/scripts/` を実行すると「filters did not match any test files」（exit 1・995 files searched）となり、テストが 1 件も実行されなかった。同一コマンド形式の `bun test src/opencode/skills/` と `bun test .opencode/plugins/ ./scripts/` は正常に一致するため、失敗に気づきにくい。`./` 付きの `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/` では 2558 pass（exit 0）。
- **工程位置**: case-open STEP-4 検証（Case #3004 Definition PR commit 後の bun test 3 分割）
- **検知方法**: bun test 標準出力に pass/fail 行が現れないこと（フィルタ不一致メッセージの確認）
- **根本原因**: bun test の位置引数 filter とパス先頭形式の解決差異。REQ-060（repo root 起 cwd・`./` 付きパス指定）の規定は本挙動の回避則でもあるが、`./` なしでも一致するディレクトリが存在するため規定から外れても偶然成功し、深い .opencode 配下のパスでのみ顕在化した
- **対応内容**: `./` 付き形式へ統一して再実行し 2558 pass を確認。Root Case #3004 の case-open 検証記録節と Definition PR 本文の判断記録に実行形態を記録
- **ユーザー確認の有無**: なし（REQ-060 準拠への切替のみ）
- **Decision/REQ/spec影響**: なし（REQ-060 の遵守強化）
- **展開視点**: bun test の filter 不一致は「0 テスト実行」で失敗するため、pass 数 0 と全 pass を取り違えない。検証記録には pass 数まで含めて記録する
- **再発条件**: `./` なしの深いパス（.opencode 配下のサブディレクトリ等）を bun test の filter に使った場合
- **予防策**: bun test のパス指定は常に `./` 付き（REQ-060）で統一し、実行後に pass/fail 行を目視または機械確認する
- **配布反映先**: learning-promote の評価対象、REQ-060 関連 knowledge
- **関連**: Case #3004、PR #3005、REQ-060
- **タグ**: #case-open #bun #bun-test #REQ-060 #検証

## 2026-09-19: agentdev_gh issue_create の長文本文は作成直後の read-back で構造検証する（改行誤記の混入）

- **問題事象**: agentdev_gh issue_create で Root Case 本文（約 90 行の日本語 Markdown）を作成した際、冒頭の `Tracking: #2966` 直後の改行が `\nn`（stray n 1 文字）となり「n## 概要」という崩れた見出しで作成された。Tool の VERIFY は書込み成功の検証であり、本文内容の意図検証は行われない
- **工程位置**: case-open STEP-2（Root Case 確立。Case #3004）
- **検知方法**: issue_create 直後に issue_read で本文を読み戻した際の構造確認（見出し行の先頭確認）
- **根本原因**: 長文本文の手組み立て時にエスケープ列 `\n\n` の入力ミス。Tool 側検証は存在性・状態のみで内容の正しさは保証しないため、作成者側の read-back が唯一の検知経路
- **対応内容**: issue_read の戻り本文を正として stray n の 1 箇所のみ修正した同一本文で issue_update を再実行し、再度 read-back で修正確認
- **ユーザー確認の有無**: なし（作成直後の自己訂正）
- **Decision/REQ/spec影響**: なし
- **展開観点**: 実行識別情報（adf_case キー・バリュー行）を含む本文は機械解析対象となるため、見出し・キー行の崩れは後続工程（case-ready の機械解析）に影響し得る。長文 body の issue_create / issue_update では「作成 → read-back → 必要なら最小差分で再更新」を標準サイクルにする
- **再発条件**: 手組み立ての長文 Markdown を Tool 引数として渡す場合
- **予防策**: issue_create 後は必ず issue_read で本文 read-back し、見出し行（## で始まる行）と key-value 行の構造を確認してから次工程へ進む
- **配布反映先**: agentdev-issue-management（Issue 操作後 VERIFY 手順）、learning-promote の評価対象
- **関連**: Case #3004、agentdev_gh
- **タグ**: #case-open #agentdev_gh #read-back #Issue本文 #VERIFY

## 2026-09-20: bun test の件数サマリーは stderr 出力（stdout capture だけでは証跡ファイルが空になる）

- **問題事象**: bun test の実行結果（`2558 pass` / `Ran 2558 tests across 105 files` 等のサマリー行）は stderr へ出力される。node の execFileSync（stdout のみ返却）で証跡ファイルへ保存すると本文が `bun test v1.3.6` のみになり、pass 件数の証跡が残らない（終了コード 0 で全 pass の事実のみ得られる）
- **工程位置**: case-open STEP-4 検証（Case #3011 Definition PR commit 7642962f 後の bun test 3 分割）
- **検知方法**: 保存した証跡ファイルの内容確認（サマリー行不在）
- **根本原因**: bun test がテスト進行・結果を stderr 経路で出力する仕様に対し、キャプチャ実装が stdout のみを前提としていた
- **対応内容**: spawnSync で stdout と stderr を連結して証跡保存する方式へ変更し、3 分割（2558/102/550）の件数証跡を取得
- **ユーザー確認の有無**: なし（証跡取得方式の修正のみ）
- **Decision/REQ/spec影響**: なし（REQ-060 の実行形態規定（repo root 起 cwd・`./` 付き）は不変。出力経路の話であり実行形態の話ではない）
- **展開観点**: bun test の件数を完了条件・PR 本文の検証記録に使う検証系は、stdout のみキャプチャする実装だと件数根拠を失う。checker CLI（stdout JSON）と test runner（stderr サマリー）で出力経路が異なる点の混同に注意
- **再発条件**: execFileSync 等の stdout のみ返却する API で bun test を実行し証跡保存する場合
- **予防策**: bun test の証跡保存は spawnSync + (stdout + stderr) 連結で実装する
- **配布反映先**: 検証運用（Case の case-open/case-run 検証記録）、learning-promote の評価対象
- **関連**: Case #3011、bun test、REQ-060
- **タグ**: #bun-test #stderr #証跡 #検証運用

## 2026-09-20: write tool の guard は承認済み temp dir 含む project root 外を fail-closed block する（node -e + PS ヒアドキュメントで大規模編集を実行）

- **問題事象**: v4 worktree 外へ大規模編集スクリプトを退避しようと `C:\WINDOWS\TEMP\opencode` 配下へ write tool で書き出したところ、agentdev-textlint-guard が「write targets a path outside the project root; blocked per fail-closed」で block した。AGENTS.md の指針（v4 worktree 内の file/edit/write block・node writeFileSync 標準手段）は worktree 内を語るが、実効 guard は outside-project-root 全般に及ぶ
- **工程位置**: case-open STEP-4（Case #3011 Definition 適用スクリプトの組み立て）
- **検知方法**: write tool 実行時の guard block エラー
- **根本原因**: harness の write guard 設定が project root 外の書込みを一律 fail-closed としており、temp dir の事前承認とは独立に作用する
- **対応内容**: スクリプトをファイル化せず、PowerShell 単一引用符ヒアドキュメント（@'...'@）を node -e の引数として渡す方式で編集スクリプトを直接実行した。単一引用符ヒアドキュメントは変数展開・バックティックエスケープなしで JS 本文（日本語・改行含む）を素通しし、node が受け取る時点で UTF-16 引数のため cp932 再符号化の経路も通らない。41 files / +376 行の適用をこの方式で完遂し、事後の UTF-8 健全検査（BOM なし・LF・U+FFFD なし）で破損なしを確認
- **ユーザー確認の有無**: なし（実行手段の切替のみ）
- **Decision/REQ/spec影響**: なし（guard の fail-closed 維持は正規運用。block 解除・迂回ではなく標準手段への切替）
- **展開観点**: v4 worktree 等で file/edit/write tool が block される環境で大規模一括編集を行う場合、スクリプトのファイル退避を前提とせず node -e + PS 単一引用符ヒアドキュメントで直接実行できる。長文でも実用可能（本次 40+ 編集を単一セッションで適用）
- **再発条件**: project root 外への write tool 実行（temp dir でも発生）
- **予防策**: 大規模編集は node -e ヒアドキュメント方式を第一候補にする。スクリプトファイルの退避が必要な場合は v4 worktree 内の gitignore 領域（.agentdev/integrity/reports 等）を用いる
- **配布反映先**: agentdev-git-worktree（worktree-operations の書込み guard 運用指針）、learning-promote の評価対象
- **関連**: Case #3011、agentdev-textlint-guard、AGENTS.md 書込み標準手段
- **タグ**: #write-guard #fail-closed #node-e #ヒアドキュメント #worktree運用

## 2026-09-20: squash merge commit の committer date が deriveMeasureDateFromLastCommit の期待値を反転させ AUTOGEN drift を生む

- **問題事象**: 境界 case-close（Case #3011 第8段・子 Issue 実装 PR #3018/#3021/#3020/#3019 の squash merge 後 fan-in 検査）で check_autogen_freshness が AUTOGEN 計測日 drift（req-health-metrics ブロック）を検出した。AUTOGEN 計測日の導出（generate_indexes.ts deriveMeasureDateFromLastCommit）は git log -1 --format=%cI（committer date 基準）で対象ドキュメント群の最終コミット日付を取るが、GitHub 側で実行した squash merge commit の committer date は merge 実行時刻（サーバー時刻）に置き換わるため、merge 前に記録していた計測日と導出期待値の日付が反転し、ドキュメント群に実変更がなくても鮮度違反となった。
- **工程位置**: case-close 境界（Epic #3017 Wave 1 fan-in green 判定。Definition PR #3012 の 5 REQ 目的節接続が docs/requirements/** に触れた squash merge 21434202 後）
- **検知方法**: check_autogen_freshness の鮮度違反検出（fan-in green 判定時の機関検査）
- **根本原因**: 計測日導出の %cI（committer date）と、GitHub squash merge が merge commit に付与する committer date（merge 実行時刻）の組み合わせ。ローカル検証時点の committer date と GitHub merge 時の committer date が日付境界をまたいで乖離すると、AUTOGEN ブロック記録の計測日が導出値と一致しなくなる（author date ではなく committer date 基準である点が本件の要因）
- **対応内容**: AUTOGEN 計測日再生成 commit 1befae99（chore(indexes): AUTOGEN 計測日再生成）で drift を解消し、autogen violations 0・fan-in green を回復した。
- **ユーザー確認の有無**: なし（機械検出 → 計測日再生成の正規経路）
- **Decision/REQ/spec影響**: なし（AUTOGEN 鮮度 gate 仕様は不変。運用知見）
- **展開観点**: GitHub 側 squash merge を経るワークフロー（case-close 境界）では、merge をまたぐ fan-in 検査で committer date 起点の drift が構造的に発生し得る。計測日導出を author date 基準へ切り替えるか merge commit を除外するかは恒久検討候補（現行は merge 後の計測日再生成で運用解消）
- **再発条件**: AUTOGEN 計測日ブロックを持つ対象ドキュメント群への最終コミットが GitHub squash merge となり、その committer date が記録済み計測日と日付境界をまたいで反転する場合
- **予防策**: squash merge を伴う境界 close の fan-in 検査では check_autogen_freshness を必ず実行し、drift 検出時は計測日再生成（generate_indexes）で解消してから green 判定する
- **配布反映先**: integrity/autogen-freshness-gate Design・index-auto-generation Design（計測日導出基準の明示候補）、learning-promote の評価対象
- **関連**: Case #3011、Epic #3017、fan-in fix 1befae99、check_autogen_freshness.ts、generate_indexes.ts（deriveMeasureDateFromLastCommit）
- **タグ**: #case-close #squash-merge #AUTOGEN #committer-date #fan-in #autogen-freshness

---

## 2026-09-20: Aborted 中断復帰時の編集漏れ照合は instruction 粒度で行う必要がある

- **問題事象**: case-open 委譲が Root Case 作成・docs 編集 (22 files 変更 + 新規 1) まで完了した後に Session error: Aborted で中断した。冪等再実行時に永続状態 (Root Case Issue・worktree 差分・draft) から再開点を再構成して残工程を完走したが、draft artifact_actions (ACT 15) と実差分の全項目突合で編集漏れ 2 件を検出した (capture-boundaries.md の v4 接続節・検出事項プロトコル帰属宣言追記が未実施〔See Also 張替えのみ実施済み〕、新規 Loop Design の AG-011 先送り記録段落の欠落)。
- **発生局面**: case-open STEP-3〜4 での中断 → 冪等再実行 (STEP-1 引き継ぎ判定による再開点再構成)。
- **検知方法**: draft の artifact_actions instruction と git diff の突合をファイル単位でなく instruction 要件単位 (追記べき節・宣言・参照張替えの別) で実施したことにより検出。
- **根本原因**: 中断時点の編集完了度はファイル単位の近似で判断されやすいが、同一ファイル内の複数 instruction (例: See Also 張替えは済み・節追記は未実施) は部分的に完了し得る。復帰時の照合を「差分ファイルの存在」のみで行うと instruction 粒度の漏れを見逃す。
- **自律対応内容**: 漏れ 2 件を node writeFileSync (UTF-8 明示) で補完し、commit (99777c7a) → 検証 (check_integrity {ok 792, ng 54, warning 3, info 109}・traceability 942/111/0/0・bun test 3 分割 2558/102/550・ADF-COVERS エントリ比較で追加 49・削除 0 の機械証明) → push → Definition PR #3023 作成 → Root Case #3022 本文への PR 番号埋め戻しまで完走。Root Case 本文の充実度も issue_read で節単位確認した。
- **ユーザー確認の有無**: なし (冪等再実行委譲内で完結)
- **Decision/REQ/spec影響**: なし (DEC-011「STEP resume point と会話記憶非依存」の実効確認事例。新規 Decision / REQ 変更なし)
- **横展開観点**: 中断復帰時の再開点再構成は「永続状態の存在確認」だけでは不十分で、正本 (draft の artifact_actions instruction・Issue 本文の必要節) と実差分の要件単位突合が必要。編集途中の Aborted はどの instruction 境界でも起こり得る。
- **再発条件**: 長時間委譲が GitHub 書込み・worktree 編集の途中で中断し、再実行時に差分ファイルの存在確認のみで編集完了と判断した場合に再発する。
- **予防策候補**: case-open 冪等再実行 (STEP-1) の再開手順に「draft artifact_actions の instruction 粒度照合」を明示する (resume protocol の照合単位をファイル単位から instruction 単位へ引き上げ)。
- **想定反映先**: agentdev-workflow-case-open skill (references/handoff.md または references/definition-pr-and-idempotency.md の冪等再実行節)、learning-promote の評価対象。
- **関連**: Case #3022、Definition PR #3023、commit 99777c7a、draft req-draft-adf-v4-loop.md (AG-007 / AG-011 / ACT-DESIGN-003)
- **タグ**: #case-open #冪等再実行 #resume #Aborted復帰 #instruction粒度照合

---

## 2026-09-20: agentdev_gh issue_update の labels 明示渡しは tracking Issue で read-back 検証を失敗させうる（Case #3036 case-close）

- **問題事象**: tracking Issue（#2966・role tracking）への issue_update で labels を現行値どおり明示渡ししたところ、GitHub 側には本文が正しく反映されている（issue_read で確認）にもかかわらず Tool の read-back 検証が verification-incomplete（fail-closed・retryable false）を 2 回連続で返した。同一本文で labels 引数を省略した再実行では検証付き成功が返った。
- **発生局面**: case-close（Case #3036 第13段・#2966 段階一覧表 13 行の完了更新）
- **検知方法**: issue_update の verification-incomplete 応答と、issue_read による独立 read-back との突合（本文適用済み・検証のみ不一致）
- **根本原因**: （推定）tracking role の Issue は tracking 軸の物理ラベル写像を Tool 内部で管理しており、labels の明示渡しが検証パスと干渉する。case role の Issue（#3036・labels [feature] 明示渡しで成功）では発生せず、tracking 軸ラベル管理が関与する場合に特徴的
- **自律対応内容**: issue_read で耐久状態の正確性を独立確認した上で、labels を省略した冪等再実行で検証付き成功を取得（本文は無変更・適用済み状態を再確認）
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし（agentdev-issue-tracking「物理ラベル写像の再実装は Tool 内実装の責務」の運用確認知見）
- **横展開観点**: tracking Issue の本文のみ更新では labels 引数を渡さず、ラベル操作が必要な場合は trackingState / kind の論理値で指示する。検証失敗時に GitHub 側適用状態を issue_read で独立確認してから冪等再実行する二段構えが安全
- **再発条件**: tracking role の Issue へ labels を明示渡して issue_update する場合
- **予防策候補**: 本文のみの issue_update では labels 引数を省略する（不変ラベルは Tool が保持する）
- **想定反映先**: agentdev-issue-tracking（Issue 操作手順の labels 取扱い）、learning-promote の評価対象
- **関連**: Case #3036、#2966、agentdev_gh、comment 5748406773
- **タグ**: #agentdev_gh #issue_update #labels #tracking #read-back検証 #fail-closed

---

## 2026-09-20: agentdev_gh issue_update labels 明示渡しの read-back 検証失敗は tracking Issue で再発する（Case #3038 case-close・既存学びの再発実績）

- **問題事象**: tracking Issue（#2966・role tracking）の段階一覧表第14段行更新で labels を現行値どおり明示渡して issue_update したところ、GitHub 側には本文が正しく反映された（直後の issue_read で本文・他行・labels すべて意図どおり確認）にもかかわらず Tool の read-back 検証が verification-incomplete（fail-closed・retryable false）を返した。Case #3036 close 時（2026-09-20・inbox 既存エントリ「labels 明示渡しは tracking Issue で read-back 検証を失敗させうる」）の同現象の再発（2 Case 目・通算 3 回）。
- **発生局面**: case-close（Case #3038 第14段・#2966 段階一覧表 14 行の完了更新）
- **検知方法**: issue_update の verification-incomplete 応答と、issue_read による独立 read-back との突合（本文適用済み・検証のみ不一致）
- **根本原因**: （既存エントリと同一推定）tracking role の Issue は tracking 軸の物理ラベル写像を Tool 内部で管理しており、labels の明示渡しが検証パスと干渉する。既存学びは inbox に蓄積済みだが skill・手順へ昇華される前のため予防策（labels 省略）が実行時に参照されず、同一操作形態で再発した
- **自律対応内容**: 今回は再実行せず、独立 issue_read で durable state（本文意図どおり・他行他節不変・labels 不変）の正確性を確認して完結と判断（本文は適用済み・再書込は冗長）。#3036 事例の「labels 省略冪等再実行で検証付き成功を取得」と合わせ、検証失敗時は「まず独立 read-back → 適用済みなら再実行不要・未適用なら labels 省略で冪等再実行」の分岐が確立した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（agentdev-issue-tracking「物理ラベル写像の再実装は Tool 内実装の責務」の運用確認知見の追実績）
- **横展開観点**: tracking Issue の本文のみ更新では labels 引数を渡さない（予防）に加え、検証失敗時の復帰手順（独立 read-back → 適用済みなら完了・未適用なら labels 省略冪等再実行）を二段構えで運用する。同一セッション内の case role 本文更新（#3038・labels [feature] 明示渡し）では発生せず tracking 軸特性が維持されていることも確認
- **再発条件**: tracking role の Issue へ labels を明示渡して issue_update する場合（学びの昇華前に同一操作形態を踏んだ場合）
- **予防策候補**: 本文のみの issue_update では labels 引数を省略する（不変ラベルは Tool が保持する）。再発 2 Case・通算 3 回のため learning-promote での早期昇華候補
- **想定反映先**: agentdev-issue-tracking（Issue 操作手順の labels 取扱い）、「agentdev_gh 標準呼出形式」の labels 明示規定への tracking 例外、learning-promote の評価対象
- **関連**: Case #3038、Case #3036（既存学び・comment 5748406773）、#2966、agentdev_gh
- **タグ**: #agentdev_gh #issue_update #labels #tracking #read-back検証 #fail-closed #再発
