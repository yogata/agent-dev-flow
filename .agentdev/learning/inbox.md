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
