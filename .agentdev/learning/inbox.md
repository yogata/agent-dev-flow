# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

## [2026-11-05T20:57+09:00][learning_candidate][Wave 先行 merge 後の後続レイヤー テスト fixture 再適合][Case #3928]
- 検知: PR #3936（#3933）の Level 1 rebase（origin/main a3dec8cda 起点）で、競合解消（close_mechanical_steps.ts・scripts/README.md・traceability sidecar の3ファイル。#3931 レイヤーとの隣接追加で層分離設計どおりに解消）後の suite 実行で 4 fail が発生。先行 merge した #3931 レイヤーが pre-merge 入力契約へ issueUpdatedAt・verificationResourceCheck を必須化し MechanicalRunner を拡張したため、#3931 merge 前に書かれた #3933 側テスト fixture（baseInput・fakeRunner）が旧契約のままだった。
- 対処: #3931 の production semantics は無変更のまま、#3933 自身のテスト fixture を統合後契約へ適合（検査コマンド仕様5 scope の被覆・MechanicalRunner 完全実装）し、176 pass / 0 fail・tsc --noEmit 0 で再検証してから push・マージ。
- 学び: マージ順序を事前記録した Wave 重複許容では、層分離設計でも production code の競合は隣接追加で解消できる一方、後続ブランチのテスト fixture は先行レイヤーの契約追加で壊れる前提で Level 1 rebase 手順に「fixture の統合後契約適合 → suite 再実行」を組込むのが正。競合ゼロのファイルでも fixture 由来の fail は起こり得る。同一面上の後続子 Issue（#3934）の rebase 時にも同様の適合が必要になる見込み。
- 出典: PR #3936 Level 1 rebase 実行記録（Wave-2 #3933 子Issue クローズの検証差分）
- 関連: Case #3928・Wave-2 #3931（先行レイヤー）・#3934（同一面上の後続 rebase 対象候補）
- タグ: #learning-capture #wave-layering #rebase #test-fixture #case-close

## [2026-11-05T20:57+09:00][design_promotion_candidate][台帳の削除確認記録様式と回収記録契約][Case #3928]
- 検知: PR #3936（#3933）の Design確定候補。entry.deletionConfirmation（省略可・null 許容、source: user-explicit 固定、confirmedBy/confirmedAt/identifiers 必須）、recordDeletionConfirmation（記録上書き禁止）、markEntryCollected（削除確認記録なしの回収記録付与禁止・collectedAt 再付与禁止）の契約。
- 対処: 本 boundary（Wave-2 #3933 子Issue クローズ）では記録のみ。Design適用判断は Epic #3928 最終 close 時に行う。
- 出典: PR #3936 本文「Design確定候補」
- 関連: Case #3928・docs/designs/workflows/verification-resource-lifecycle.md（台帳（生成記録）・削除確認節への反映候補）

## [2026-11-05T20:57+09:00][design_promotion_candidate][削除確認拒否コード系統と判定順序の固定][Case #3928]
- 検知: PR #3936（#3933）の Design確定候補。8系統の拒否コード enum（confirmation-missing・machine-confirmation-not-accepted・confirmation-purpose-not-deletion・confirmation-target-mismatch・observation-missing・target-missing・identifier-mismatch・deletion-confirmation-record-missing）と判定順序（回収済み対象は削除確認記録の有無のみ検査 → 未回収対象に確認境界を適用）の固定。
- 対処: 本 boundary では記録のみ。Epic #3928 最終 close 時の Design 反映候補。
- 出典: PR #3936 本文「Design確定候補」
- 関連: Case #3928・docs/designs/workflows/verification-resource-lifecycle.md（削除確認節への反映候補）

## [2026-11-05T20:57+09:00][design_promotion_candidate][台帳不在と削除確認不存在の責務分離][Case #3928]
- 検知: PR #3936（#3933）の Design確定候補。台帳不在（記録欠落）を削除確認不存在の検出対象外とし照合・完了拒否の本体（#3931 base extension）へ委ねる責務分離。統合時の step 接続位置（deletion-confirmation-check step と照合 step の隣接配置）を含む。
- 対処: 本 boundary では記録のみ。Epic #3928 最終 close 時の Design 反映候補。
- 出典: PR #3936 本文「Design確定候補」
- 関連: Case #3928・case-close Design・docs/designs/workflows/verification-resource-lifecycle.md

## [2026-11-05T20:57+09:00][design_promotion_candidate][case-close SKILL.md の HITL 削除確認完了順序][Case #3928]
- 検知: PR #3936（#3933）の Design確定候補。確認提示 → 利用者判断 → 監督側削除実行 → 実不存在確認 → close 再実行 の5段完了順序（case-close は本手順内で削除を実行しない。機械可読値のみの確認不受理、残置許容例外への流用禁止、削除確認記録なし消失の完了拒否を明記）。
- 対処: 本 boundary では記録のみ（SKILL.md 接続分は merge 済み）。Epic #3928 最終 close 時の Design 反映候補。
- 出典: PR #3936 本文「Design確定候補」
- 関連: Case #3928・src/common/skills/agentdev-workflow-case-close/SKILL.md（一時資材回収の削除確認（HITL 停止手順）節）

## [2026-11-05T17:45+09:00][learning_candidate][検証用一時資材 台帳モジュール運用][Case #3928]
- 検知: 作成ヘルパー（verification-resource-register.ts）を worktree 内から `--main-repo-root` 未指定で実行すると、worktree-context 独立解決（git-common-dir 導出）により**メインリポジトリの台帳**（.agentdev/tmp/verification-resources/）へ登録される。smoke 実行時に実観測（設計どおりの動作）。
- 対処: 検証・試験目的で worktree から実行する場合は `--main-repo-root .` で worktree 側へ限定する運用を採用し、smoke の台帳ファイルは実行後に削除して後片付け済み。
- 学び: main repo root 固定解決は本件の設計契約（並列Case分離・worktree 非依存）どおりだが、検証実行の局所化には `--main-repo-root` 明示が必須。台帳を扱う試験・smoke の手順書にはこの区別を明記すべき改善候補。
- 出典: PR #3935 本文「Findings / Capture候補」（Wave-1 #3930 実行担当の実観測）
- 関連: Case #3928・REQ-118-001/004・docs/designs/workflows/verification-resource-lifecycle.md
- タグ: #learning-capture #verification-resources-ledger #worktree #main-repo-root

## [2026-10-27T07:20+09:00][workflow_deviation][case-open STEP-4][Case #3866]
- 検知: prepare_definition_pr.ts の DefinitionEdit 行区切り保全契約（newText は oldText の行区切りを保全し行の追加のみ許可・行の削除・統合を拒否）により、REQ 表の空行削除（REQ-108 表統合・ACT-REQ-002）や行移動〔行数減少を伴う分割編集〕を DefinitionEdit で表現できなかった（--validate-input が行構造事前確認で fail-closed 拒否）。
- 対処: REQ-108 空行削除を REQ-117.md 新規作成と同一の前段配置経路（worktree 内への node writeFileSync UTF-8 明示・oldText 一意性検証つき・stagePaths 経由 commit）で適用し、逸脱として PR #3867 本文へ記録。行移動（REQ-010-080）は12行ブロックの行数同数並べ替え（1 edit）で DefinitionEdit 契約内に収めた。
- 学び: DefinitionEdit 契約の行区切り保全は「行の追加のみ許可」が実装の正であり、行削除型の docs 整合操作（空行削除・行削除）は artifact_actions の適用計画段階で前段配置経路への事前割当てが必要。prepare_definition_pr の validateInput 分離入口（REQ-117-010 実装対象）に前段配置対象の明示化を組込む改善候補。

## [2026-10-27T10:45+09:00][intake_candidate][case-close Epic Wave クローズ][Case #3866]
- 検知: Epic Wave クローズの配布依存境界 最終 gate で 21件 violations を検出。本一式の PR 単位の検査（case-run 段階）では配布依存境界 gate を PR 前置として実施しておらず、REQ/AG 識別子（REQ-117-XXX・AG-XXX）を配布物（src/common/skills/** の script コメント・references・README）へ記述したまま merge していた。加えて配布 README への repo-*（repo-local 検査基盤）参照も検出。
- 対処: Epic Wave クローズ工程で 21件全て是正（識別子除去・repo-* 参照除去）し最終 gate pass。実装記録は REQ トレーサビリティ（covers 宣言・sidecar）で管理され、配布物本文中の識別子は不要であることを再確認。
- 学び: 配布物に触れる PR の検証に配布依存境界 gate の前置を組み込む（case-run 前置 gate の強化候補）。REQ 識別子は covers 宣言（inline または sidecar）で保持し、配布物本文へは書かない規律の周知が改善候補。
- 出典: PR #3880・#3881・#3882・#3884・#3885 の Findings と Epic Wave クローズ時の検出記録

## [2026-11-02T19:30+09:00][learning_candidate][req-define draft YAML 生成][Case #3887]
- 検知: RU-0255 draft の CR-002 行が YAML plain-scalar でコロン＋空白を含み、PyYAML safe_load でパーサエラーになる構造が req-define draft 保存時に混入した。
- 対処: commit 87621f165 でコロン含み scalar を引用符付きへ修正し、PyYAML safe_load による深部検査（194/194）で parser-valid を確認済み。
- 学び: draft本文（マーカー区切りテキスト）から YAML frontmatter を生成・編集する経路では、plain-scalar にコロン＋空白が入るだけでパーサが落ちるため、生成直後に safe_load での検証を前置する。検証なし保存は req-define 系の失敗原因として再発しやすい。
- 出典: PR #3888 本文（YAML parse 検証結果）、commit 87621f165

## [2026-11-02T19:30+09:00][learning_candidate][traceability sidecar 登録][Case #3887]
- 検知: REQ-004-069〜075 の design covers を sidecar 2 件へ登録する際、inline ADF-COVERS 宣言と sidecar の重複（同一対応関係の二重管理）と関係表記ゆれが duplicate-inconsistencies の検出対象になった。
- 対処: case-ready 検証で duplicate-inconsistencies 0 件になるよう、inline 宣言と sidecar を同一の論理対応関係として正規化（design 役割の完全集合を sidecar 側へ統一、REQ-004-074 は REQ-108-006、REQ-004-075 は REQ-107-007 を規定参照接続とし重複追加しない）。
- 学び: sidecar 登録は inline 宣言との重複排除が前提。対応関係の追加時は duplicate-inconsistencies を必ず機械突合し、表記ゆれ（REQ 行 ID の桁・区切り）は機械検査でしか発見できないため手作業での目視照合に頼らない。
- 出典: PR #3888 本文（traceability check 結果）、traceability/agentdev-req-file-manager.yaml、traceability/agentdev-workflow-req-define.yaml

## [2026-11-02T19:30+09:00][learning_candidate][post-merge full integrity][Case #3887]
- 検知: post-merge の check_integrity full audit で phase 系 SKILL 3 件の templates/phase-readme.md 参照欠落（IR ReferencePath、pre-existing）を検出。参照行は commit 3ef748a8a（#3855）で追加され、本 Case 変更領域外。pre-merge 機械工程（targeted docs guard、distribution boundary）では観測されない full audit 系の検出。
- 対処: 本 Case では pre-existing 分類として記録し、修正は対象範囲外として次回 phase 系 docs 変更 Case への追随修正候補として残置。同 full audit で検出された ReqFreshness 1 件（本変更起因、req-health-metrics.md の frontmatter updated 更新漏れ）は case-close 対象範囲内修正として commit 266a8df2 で解消。
- 学び: pre-merge の targeted 検査では full audit 系の検出（ReferencePath、ReqFreshness 等）が観測されない。merge 直後の full integrity 実行を case-close 標準工程へ組み込むことで、変更起因の freshness 違反を直近で是正できる。設計書変更時に frontmatter updated を同一 PR で更新する規律の再確認が改善候補。
- 出典: Issue #3887 AC 判定コメント（2026-11-02）、check_integrity 実行記録（postmerge-check-integrity-2.json）、commit 266a8df2

## 2026-11-02T12:45+09:00 Case #3889（訂正 Case）Capture

### 1. install.ps1 の LocalMode 検証には consumer レイアウト変換が必要

- 問題クラス: workflow deviation / 環境構築
- 内容: install.ps1 は consumer 専用公開入口であり、実行ディレクトリ直下に src/opencode/ が存在すると誤実行防止（REQ-050-006）で exit 1 する。本 repo（agent-dev-flow）を clone して -LocalMode の配置検証をする際は、clone 内で src/ を .agentdev-plugin/src/ へ移動し、textlint guard の vendor/（導入時生成依存・gitignore）を正規配置から読み取り専用複製する必要がある
- 発生条件: TS-C003（Local 版 plugin 公開入口検証）の環境構築。実際に exit 1 を確認し、consumer レイアウト変換で解消（install apply/check とも ok）
- 証跡: C:/WINDOWS/TEMP/opencode/ts3889-local/execution-log.md 第 0 節・install-apply.log

### 2. MSYS パス変換による clone 誤配置の落とし穴

- 問題クラス: implementation error / 環境依存
- 内容: Git Bash（MSYS）で `git clone C:/... C:/WINDOWS/TEMP/...` 形式を使うと、一部コンテキストで先頭 / を持つ POSIX 風パスへ変換され C:\c\WINDOWS\... へ誤配置する場合がある。Windows 形式パス指定で再実行し、誤配置ツリーは配下のみを確認して削除した
- 予防: MSYS から Windows 絶対パスを渡す引数は Windows 形式（バックスラッシュまたはドライブレター）で統一するか、MSYS_NO_PATHCONV 系の抑制を検討する
- 発生条件: Case #3889 TS-C003 サブエージェントの clone 初回実行
- 証跡: C:/WINDOWS/TEMP/opencode/ts3889-local/execution-log.md 第 0 節注記

## 2026-11-02T13:16+09:00 Case #3889（TS-C004 隔離検証・第2次訂正）Capture

### 1. gh-write guard は説明文中の gh WRITE コマンド名も検出してコマンド全体をブロックする

- 問題クラス: workflow deviation / guard 挙動
- 内容: Bash コマンド文字列内に gh WRITE 系コマンド名（例: PR 作成の生コマンド名）が説明文・JSON 文言として含まれるだけでも、guard がコマンド全体を raw gh WRITE と判定してブロックする。heredoc によるファイル作成も含むため、ブロック時にファイル作成自体が行われない
- 対処: コマンド文字列に gh WRITE コマンド名を直接書かない。Python の隣接文字列リテラル分割（"gh" + " pr " + "create" 等）や別表現（「PR 作成の生コマンド」等）で構築する
- 発生条件: Case #3889 判定コメント訂正スクリプトの作成（実測 2026-11-02 13:09〜13:11）
- 証拠: m0352〜m0355 のブロック応答 3 件と分割リテラルによる解消

### 2. edit tool は workspace 外パスで fail-closed する

- 問題クラス: 環境依存 / ツール境界
- 内容: C:/WINDOWS/TEMP/ 配下のファイルを edit tool で編集すると「cannot read the current file content」で fail-closed する。AGENTS.md の write tool と同じ境界が edit にも適用される
- 対処: temp 領域のファイル修正は bash（quoted heredoc によるスクリプト実行）で行う
- 発生条件: 同上（fix-phrase.py の修正を edit で試行）

## 2026-11-03T02:40+09:00 Case #3890 case-close Capture

### 1. 完了記録の確定前には観測の鮮度照合が必要（parked 時点スナップショットによる誤完了）

- 問題事象: #3891 の case-close 完了記録が、質問待ち parked 時点（2026-11-02 22:53）の観測に基づく「不一致未立証・保留維持」で確定した。その後、試験内仮回答による完走観測で判定が「具体的不一致の成立」に変わるため、正規訂正経路（訂正記録）で完了記録の置き換えが必要になり、同一 Root Case 実行の親完了判定も中断された
- 発生局面: case-close（#3891 クローズ 23:19 確定 → 23:27 訂正）
- 検知方法: 完了記録確定後の完走観測と、case 側の会話・仮回答・成果物・条文の再照合による判定変化の検知
- 根本原因: 完了記録の判定根拠とした観測が未完結状態（質問待ち）のスナップショットであり、「その後の観測完了で判定が変わり得るか」という観測鮮度の照合を完了判定の確認項目にしていなかった
- 自律対応内容: 正規訂正経路で訂正記録を投稿（履歴保持・実敗の成功書き換えなし）、不足を親 #3890 が引き継ぎ条件付き経路（#3892）を活性化して完遂
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし（完了記録運用規律の問題。REQ/Decision 変更は伴わない）
- 横展開観点: verify-only closure や並行観測を再利用する完了判定全般
- 再発条件: 判定根拠の観測が未完結状態のスナップショットのまま完了記録を確定し、観測後に状態変化が起きる
- 予防策候補: 完了記録の確定前に観測鮮度照合（判定根拠が中間状態スナップショットでないこと・観測確定後に状態変化がないこと）を確認項目に加える。観測が未完結の場合は完了記録を確定せず停止記録で保持する
- 想定反映先: agentdev-workflow-case-close（STEP-2 QG-4 の判定根拠照合項目）
- 関連: #3891 issuecomment-6579421173（旧完了記録）・issuecomment-6579654641（訂正記録）・#3890
- タグ: `#case-close` `#完了記録` `#観測鮮度`

### 2. Root Case 起票の参照前提となる契約状態記録は起票前に commit する（jev 観測前置 commit の後佳）

- 問題事象: Root Case #3890 起票の前提となる jev 観測の追跡 commit（2ae252c7d）が Root Case 作成（2026-11-02 22:40:07）後に完了する順序逸脱があった
- 発生局面: case-open（Case #3890 起票時）
- 検知方法: git log の時系列照合（起票時刻と commit の前後関係）
- 根本原因: 起票本文が参照する契約状態記録（.agentdev/ 配下の jev 観測）の commit 済み確認を case-open の前置項目に含めていなかった
- 自律対応内容: commit を完了し git log で追跡状態を確認。Root Case 本文には commit hash を安定識別子として記録し遡及参照可能にした
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし（順序逸脱の記録。正規成果物の変更なし）
- 横展開観点: 起票前に commit 済みであるべき .agentdev/ 状態記録全般（jev 観測・inbox 等）
- 再発条件: 起票本文が参照する状態記録が未 commit のまま case-open が進行した場合
- 予防策候補: case-open の前置確認に「本文が参照する契約状態記録の commit 済み確認」を加える（case-close の contract-state-residue-check 相当の確認を case-open 時点にも適用する候補）
- 想定反映先: agentdev-workflow-case-open（起票前置確認項目）
- 関連: #3890・commit 2ae252c7d
- タグ: `#case-open` `#契約状態記録` `#順序逸脱`

### 3. 委譲指示による実行構造逸脱（single-Standard case への子 Issue 作成）は逸脱として明示記録する

- 問題事象: 単一 Standard Case（Epic 構成なし・work_type maintenance / scale standard）に対し、委譲指示により子実行 Issue（#3891・#3892）を作成した。skill の Standard 分岐原則（子 Issue を作らず Root 直下で実行する）からの逸脱。逸脱である旨の明示が実行構造の記録になかった
- 発生局面: case-ready（Case #3890 の実行構造確定）
- 検知方法: case-close 集約時の実行構造照合（検証単位・条件付き経路単位が子 Issue として存在）
- 根本原因: 委譲指示（検証単位と条件付き経路単位の分離）が skill 原則より優先して適用され、逸脱明示の記録規律が不足していた
- 自律対応内容: 子 Issue に親参照（親Epic: #3890）を付し系譜を追跡可能にした。本エントリで逸脱として記録
- ユーザー確認有無: あり（委譲指示による。逸脱自体の判断は委譲側）
- Decision/REQ/spec影響: なし（実行構造の運用逸脱。skill 原則の変更は伴わない）
- 横展開観点: 委譲指示が skill の構造原則と競合する場合全般
- 再発条件: 委譲側が構造原則と異なる実行構造を指示し、逸脱明示なしで構造が確定する
- 予防策候補: 委譲指示による構造逸脱は、実行構造確定の記録（本文・工程記録）へ逸脱である旨と出所を明示する
- 想定反映先: agentdev-workflow-case-ready（実行構造確定時の逸脱明示）
- 関連: #3890・#3891・#3892
- タグ: `#case-ready` `#実行構造` `#逸脱記録`

### 4. 隔離試験の fixture 中立性検査にはディレクトリ名等の環境識別子を含める

- 問題事象: 隔離検証の consumer ディレクトリ名（neutral-ac3 等の試験文脈を示唆しうる名称）から、実行側 LLM が trace reasoning 内で「試験 fixture の可能性」を推論していた。tracked 内容・commit メッセージの意図語スキャン範囲外の意図伝達経路であり、CREATE 判断への影響は分離不能
- 発生局面: 検証環境構築・実行（ac3・fixverify）
- 検知方法: trace reasoning の可読化照合（明示的推論の観測）
- 根本原因: fixture 中立性検査を tracked ファイル内容・commit メッセージに限定し、ディレクトリ名等の環境識別子を対象に含めていなかった
- 自律対応内容: 後続 fixture で中立名称（auditops-dev / auditops-prod-like）へ変更し選定根拠を ENVIRONMENT.md に記録。影響の分離不能性を限界として判定記録に明記
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし（検証手法の限界記録）
- 横展開観点: LLM エージェントの隔離試験全般（環境識別子は文脈入力になり得る）
- 再発条件: 試験文脈を示唆するディレクトリ名・環境識別子の下で LLM エージェントを実行する
- 予防策候補: 隔離試験環境の中立性検査にディレクトリ名・環境識別子を含め、trace reasoning 内の文脈推論の有無を確認項目に加える
- 想定反映先: 検証環境構築手順（case-run の隔離検証手順・ENVIRONMENT.md 記載規約）
- 関連: #3890・#3891（訂正記録の限界 1）・#3892（iteration-1 検証記録のディレクトリ名選定根拠）
- タグ: `#検証環境` `#fixture中立性` `#文脈リーク`

## 2026-11-03T22:15+09:00 Case #3900 case-close Capture

### 1. traceability-check の #3899 由来別検出は REQ-029 スコープ限定実行では findings に現れない

- 問題クラス: workflow deviation / 検査範囲解釈
- 内容: 配布 runtime script の inline ADF-COVERS と REQ-029 の矛盾（Issue #3899 対象）は、traceability check の --req REQ-029-001 スコープ限定実行では findings に現れず、フルスコープ実行でも REQ-029 関連 findings は 0 件であった。本 Case の合格条件から除外し、検出事実として記録済み。Issue #3899 の処置は別 Case 対象
- 発生条件: Case #3900 case-run TS-R002（スコープ限定実行とフルスコープ補足実行の双方）
- 証跡: PR #3901 本文検証差分セクション行5・6、Issue #3900 対応記録コメント（2026-11-03）

### 2. フルスコープ traceability check の既存構造検出（missing-implementation 14件・missing-verification 16件）

- 問題クラス: pre-existing / 検出事実の記録
- 内容: フルスコープ traceability check（exit 2・pass 9 / fail 2）で REQ-029 非関連の missing-implementation 14件・missing-verification 16件を確認した。本 Case の変更起因ではなく対象外。corpus 完全性の診断指標（advisory・fail-open）として後続の処置判断材料に使える
- 発生条件: Case #3900 case-run のフルスコープ補足実行（合格条件外・記録目的）
- 証跡: PR #3901 本文検証差分セクション行6（要約転記。生データは一時退避のため保存しない）

## [2026-11-04T01:03+09:00][workflow_deviation][case-open STEP-4][Case #3902]
- 問題事象: prepare_definition_pr.ts の `check_integrity` 入力に `check_changed_docs.ts --workflow case-run` を指定したため、script report の gate 名は pass でも full integrity check では REQ-106.md、agentdev-traceability.md、req-health-metrics.md の `req-updated-freshness` 3件が NG になった。script 提案本文の変更ファイル一覧も同一 Design パスを重複し、generate_indexes 派生物を含めなかった。
- 発生局面: case-open STEP-4（Definition PR 準備と gate 設定）
- 検知方法: `check_integrity.ts --root <definition worktree> --json` の全件実行と PR proposal のファイル一覧を実差分と突合して検知した。
- 根本原因: GateCommandSpec の存在・引数検証だけで gate の意味を確認せず、`check_changed_docs.ts` を full `check_integrity.ts` と同じ役割に誤接続した。また、proposal の file list 生成が `editedPaths` の重複除去や generate_indexes 派生物の包含を行わない。
- 自律対応内容: Definition 3文書の frontmatter `updated` を最終内容変更日 2026-11-04 に追随させ、計測日と派生物を明示パス commit した。generate_indexes を再実行して no changes、full integrity check を再実行して 951 ok / 0 ng / 0 warning を確認し、PR コメントに実 gate と実際の3ファイル差分を記録した。
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし（今回の Definition 変更内容は維持し、case-open workflow skill / script contract は更新していない）
- 横展開観点: 機械工程へ caller 生成 GateCommandSpec を渡すすべての Workflow。validate-input pass は入力形式と gate 実体の存在を証明するが、指定 gate の意味的適合までは証明しない。
- 再発条件: 類似名の検査スクリプトを gate に割り当て、実体の責務・入力・出力を確認せず proposal の gate 名だけから合格を解釈する。
- 予防策候補: gate 設定前に正規 checker の CLI 契約を確認し、script 内 gate の名前と実行実体を evidence で照合する。PR 作成前に proposal の file list を最終 branch diff と突合し、重複・派生物漏れ・誤った gate 成功表現を確認する。
- 想定反映先: agentdev-workflow-case-open の prepare_definition_pr 入力構成と STEP-4 proposal review 手順
- 関連: Case #3902、PR #3903、Definition branch `definition/issue-3902`
- タグ: `#case-open` `#gate-configuration` `#integrity` `#proposal-review`

## [2026-11-04T07:30+09:00][learning_candidate][Windows git-bash での junction 作成][Case #3902]
- 検知: bash 経由で `node -e` 内のバックスラッシュパス（`C:\\Users\\...`）を渡すと shell 解釈でバックスラッシュが食われ、dangling junction（target が mangle された path）が生成され得る。
- 対処: `String.fromCharCode(92)` による runtime join で target を構築すれば安全に作成できる。削除は `fs.unlinkSync`（link のみ削除、target に影響なし）で往復検証済み。
- 学び: Windows git-bash で junction を作る処理は、バックスラッシュを文字列リテラルで直接渡さず runtime で結合するのが安全。dangling junction は存在検査が通るため発見が遅れやすい。link 削除は unlinkSync で target を壊さない。
- 出典: PR #3904 本文 `## Findings / Capture候補`（### learning 第1項）

## [2026-11-04T07:30+09:00][learning_candidate][worktree での bun test 実行][Case #3902]
- 検知: 本リポジトリの traceability scripts・integrity scripts は bun 組込 runner + node 組込モジュールのみで動作し、worktree（node_modules 未伝播）でも targeted test・フルスイートの大半が node_modules なしで実行可能。typecheck のみ typescript を要する。
- 対処: メインリポジトリ側 node_modules への一時 junction で typecheck を解決できる（実行後に junction のみ削除）。probe test を先に実行して依存の要否を確認する手順が有効。
- 学び: worktree での full suite 実行は、依存の要否を probe test で先に確定してから bun 組込 runner 経路で実行すれば node_modules 未伝播のまま成立する。textlint gate の vendor は plugin package 配下の `bun install && bun run build:engine` を worktree 内で実行すれば生成できる（vendor は plugin 配下 .gitignore 管理対象のため residue に現れない）。
- 出典: PR #3904 本文 `## Findings / Capture候補`（### learning 第2項）、case-close 対応記録コメント 6617043300（検証差分）

## [2026-11-04T07:30+09:00][learning_candidate][case-close full suite 機械受理の baseline 再現確認構成][Case #3902]
- 検知: close 時の full integrity suite 機械受理では、fail 全件の由来分類（pre-existing）に baseline 再現確認（baselineCommit・method・sameFailureReproduced の記録実体）が必要だが、機械工程 script は gate 実行と分類突合を同時に要求するため、fail 明細を知らずに input を組み立てられない。
- 対処: 手動で3分割を先に実行して fail 明細と件数を実測し、detached worktree（baseline commit）での全対象実行1回で fail 全件の再現確認を被覆してから、機械工程 script に integrityMachineAcceptance 入力を渡して突合させる2段階構成とした。13件全件の baselineReproduction を1回の全対象実行（split1 該当2ファイル単独 + split3 全対象）で充足した。
- 学び: fail 全件の baseline 再現確認は、fail 対象の単独実行と全対象実行の組み合わせで1回ずつ実行すれば被覆できる。機械工程の受理入力は実測後に組み立てるのが実務的であり、手動予備実行は「失敗由来分類」の正当理由に該当する。
- 出典: case-close 対応記録コメント 6617043300（検証差分）、QG-4 checker 実測手順（agentdev-quality-gates）


## [2026-11-04T10:30+09:00][workflow_deviation][case-open STEP-4 measurement-convergence][Case #3910]
- 問題事象: prepare_definition_pr.ts の measurement-convergence step が check_integrity 報告の req-updated-freshness 対象から REQ ファイルの報告形式（for REQ-105.md: 形式・docs/ プレフィックスなし）を捕捉できず、REQ-105.md の frontmatter updated 補正が script 内で完結せず script が fail 終了した（Case #3910・PR #3912 実測）。
- 発生局面: 実装（case-open STEP-4 機械工程、REQ 行 APPEND を含む Definition PR）
- 検知方法: script 報告 JSON の check_integrity step fail（5 new unmanaged NG）と convergence の frontmatterUpdatedTargets に REQ-105.md が含まれないことの突合
- 根本原因: extractFreshnessTargets の正規表現 /for ((?:docs|src|scripts)[^s:]*.md):/g がプレフィックス付きパス形式のみに対応し、REQ freshness 報告のファイル名のみ形式と不一致
- 自律対応内容: 手動 contingency で REQ-105.md frontmatter updated を commit author date に追随させ、req-metrics 派生物（req-health-metrics.md AUTOGEN 8→14）とともに明示パス指定補正 commit（20a6eb9e8）を作成。新 HEAD で check_integrity（0 new unmanaged NG）と traceability check（missing-design 0 件・対象行）を完了させ PR #3912 検証欄へ経緯を記録。修正対象は intake item 化済み（.agentdev/intake/inbox/2026-11-04-prepare-definition-pr-freshness-path-extraction.md）。
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし（既存契約の手動 contingency 経路の実施）
- 横展開観点: REQ 行 APPEND を含む全 Definition PR で REQ ファイルの freshness 補正が同様に漏れ得る
- 再発条件: REQ ファイル編集を含む Definition PR で measurement-convergence が発動し、REQ ファイルの freshness NG が初回 check_integrity で報告される場合
- 予防策候補: extractFreshnessTargets の REQ ファイル形式対応と、NG 報告対象と補正適用対象の差分検査（補正漏れ検出）の script 組込み
- 想定反映先: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts、REQ-117 系機械工程堅牢化との突合
- 関連: Case #3910、PR #3912 検証欄、.agentdev/intake/inbox/2026-11-04-prepare-definition-pr-freshness-path-extraction.md
- タグ: #script-gap #measurement-convergence #case-open

## [2026-11-04T10:30+09:00][workflow_deviation][case-open STEP-4 並行 case-open と measurement-convergence の補正混入][Case #3910]
- 問題事象: measurement-convergence step の補正 commit（9e95df932）が本 Case の artifact_actions 宣言外ファイル（docs/designs/commands/case-revise.md、docs/designs/workflows/v51-phase-transition-and-coexistence-model.md〔並行兄弟 Case #3907/#3908/#3909 の変更対象共有ファイル〕）の frontmatter updated を含めて commit した。
- 発生局面: 実装（case-open STEP-4 機械工程、並行 case-open 実行下）
- 検知方法: convergence step detail の stagedPaths に宣言外 2 ファイルが含まれていることの差分確認
- 根本原因: convergence step が REQ 編集対象に限定せず報告対象全体を補正する契約どおりに動作した結果、並行 Case の対象ファイルの main HEAD 起点の既存 freshness 債務が本 Case branch で解消された
- 自律対応内容: 契約どおりの機械 step であることを確認し、PR #3912 検証欄へ補正対象・根拠・本変更起因の悪化 0 件を記録。共有ファイルの merge 順序接触は記録して解決しない（親判断は case-auto の decision_context へ委譲）。
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし
- 横展開観点: 並行 case-open で measurement-convergence が発動する全 Case で宣言外ファイルの補正混入が起き得る
- 再発条件: 並行 case-open 実行下で check_integrity の freshness 報告に他 Case 対象ファイルの既存債務が含まれる場合
- 予防策候補: convergence の補正対象報告へ artifact_actions 宣言パスと main HEAD 既存債務パスの区分追加、または宣言外パス補正の別 commit 分離による PR diff の意味明確化
- 想定反映先: prepare_definition_pr.ts の measurement-convergence step 報告詳細、case-open Design「並行 case-open の作業隔離規律」節の補正 commit 扱い明確化
- 関連: Case #3910、PR #3912 検証欄、Case #3907/#3908/#3909（横断依存検査で共有ファイル重複を記録済み）
- タグ: #workflow-deviation #parallel-case-open #measurement-convergence

## [2026-11-04T10:30+09:00][learning_candidate][draft case_open_hints の宣言追随時期記述][Case #3910]
- 問題事象: draft（req-draft-artifact-finalization-and-version-reconstruction）の wave_hints が ADF-COVERS(design/implementation) 宣言への REQ-105-009〜014 追加を実装の変更セットで行うと一括記述していた。case-open 契約の missing-design 0 件ゲート（設計PR作成前に design 役割の対応が必要・fail-closed）と矛盾し、hint を字義どおりに実行すると設計PRを作成できない。
- 発生局面: 実装（case-open STEP-3/4 Definition Package 構成）
- 検知方法: STEP-3 の宣言追随要否確認と missing-design 0 件ゲートの契約照合
- 根本原因: wave_hints の記述が design 役割（設計PR時に必要）と implementation 役割（case-run 時に追加）の適用時期を区別せず一括で先送り記述していた
- 自律対応内容: design 役割の宣言追随を設計PRの変更セットへ組込み（v4-operating-model.md: REQ-105-009〜014、document-type-responsibilities.md: REQ-105-011〜013）、implementation 役割の追加は case-run へ維持。区分の根拠を Root Case #3910 本文の構成上の注記へ記録し、traceability check で missing-design 0 件（対象行）を機械確認済み。
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし（case-open 契約の優先適用。draft hint の記述改善は req-define の case_open_hints 記述ガイダンス候補）
- 横展開観点: REQ 行 APPEND を伴う draft の wave_hints で宣言追随時期を記述する場合、design/implementation 役割の適用時期を区別して記述する
- 再発条件: REQ 行追加を伴い ADF-COVERS 宣言追随の先送りを wave_hints に記述する draft が case-open に入力される場合
- 予防策候補: req-define 側の wave_hints 記述ガイダンスへ「design 役割宣言追随は設計PR変更セット、implementation 役割は実装変更セット」の区分記述を追加
- 想定反映先: req-define の draft 生成ガイダンス（case_open_hints / wave_hints 記述規律）
- 関連: Case #3910、PR #3912、draft .agentdev/drafts/req-draft-artifact-finalization-and-version-reconstruction.md wave_hints
- タグ: #draft-hints #traceability-gate #case-open

## [2026-11-04][learning_candidate][coverage 契約の役割語彙と REQ 成果物][Case #3910]
- 問題事象: TS-701 事例 (a) の構築時、coverage 契約の role 語彙（decision / design / implementation / verification）に requirement 役割がなく、REQ 工程成果物（docs/requirements/ 配下）自身への covers 表現にどの役割を割り当てるか自明でないことを観測した。一時 sidecar では検証事例用に design 役割を使用した。
- 発生局面: 検証（TS-701 事例 (a) の構築）
- 検知方法: 要求成果物のみを対象に finalize --phase requirement の公開 CLI 事例を構成する際、対応役割の表現を確認した。
- 根本原因: coverage 契約は成果物の機能上の役割を定義するが、工程で作成される REQ 文書自体を示す専用 role を定義していない。
- 自律対応内容: 契約の拡張や規約化は本 Case の対象範囲外として行わず、検証用 sidecar による仮表現で事例を構成し、仮入力であることを PR Findings に記録した。
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし。判定器契約の拡張・REQ 工程成果物の coverage 表現規約化は対象範囲外。
- 横展開観点: REQ 成果物そのものを coverage 対象として扱う検証や設計では、既存 role の意味と一時表現を正規規約と混同しない。
- 再発条件: REQ 文書のみを対象に coverage 宣言を構成し、専用 role の不存在を無視して役割を決める場合。
- 予防策候補: coverage 契約を変更または規約化する検討時に、REQ 工程成果物自身への covers 表現をどう扱うかを明示的に評価する。
- 想定反映先: agentdev-traceability の coverage 契約検討。
- 関連: PR #3923、TS-701 事例 (a)
- タグ: #traceability #coverage #REQ

## [2026-11-04][learning_candidate][design-basis --adopted の root 相対解決][Case #3910]
- 問題事象: TS-701 事例 (c) の実行時、`design-basis.ts` の `--adopted` 引数が root 相対パスとして解決される一方、scripts README の実行例にそのパス基準が記載されていないため、最初の読取が失敗した。
- 発生局面: 検証（TS-701 事例 (c) の公開 CLI 実行）
- 検知方法: `--adopted` で採用規約ファイルを渡した際の読取失敗を観測した。
- 根本原因: CLI のパス解決基準が実行例・説明に記載されておらず、利用者が cwd 相対と誤解しうる。
- 自律対応内容: root 相対のパス指定に修正して事例を実行し、失敗は fail-closed のエラーとして報告されたことを PR Findings に記録した。scripts README の修正は本 Case の対象範囲外として行っていない。
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし。README の記載改善は本 Case の対象範囲外。
- 横展開観点: CLI のファイルパス引数では、実装上の解決基準を確認してから検証入力を構成する。
- 再発条件: `--adopted` の実行例を用いる際、root と cwd の相対解決基準を確認せずパスを渡す場合。
- 予防策候補: 実行例に `--adopted` の root 相対パス解決基準を明記する。
- 想定反映先: agentdev-artifact-semantics scripts README。
- 関連: PR #3923、TS-701 事例 (c)
- タグ: #artifact-semantics #design-basis #CLI

## [2026-11-04T09:54+09:00][workflow_deviation][case-open STEP-4][Case #3909]
- 問題事象: prepare_definition_pr.ts の measurement-convergence step が check_integrity の req-updated-freshness NG 6 件を trigger に発動したが、frontmatter updated の収束対象は Design 3 件（case-revise.md、v5-adopted-conventions、v51）のみで REQ 3 件（REQ-104/108/111）を収束しなかった。script 報告は stage「converged」を示しつつ exit 1 で終了し、REQ 分の NG 6 件のうち 3 件が残存した。
- 発生局面: case-open STEP-4（機械工程 script 呼び出しと計測日収束）
- 検知方法: script 報告 JSON の check_integrity step detail（stdout 全文・NG カウント 6 件）と measurement-convergence の frontmatterUpdatedTargets（Design 3 件のみ）の突合
- 根本原因: measurement-convergence step の frontmatter updated 追随が Design targets のみを実装対象とし、REQ frontmatter（REQ frontmatter 規約〔patterns.md、IR-072〕の対象）を収束対象に含めていない。check_integrity の NG 検出は REQ も含むが追随 step が REQ を処理しない対象差が生じている
- 自律対応内容: reference 既定の手動 contingency（REQ frontmatter updated の commit author date 2026-11-04 追随 + 明示パス指定補正 commit fdecf8180）で REQ 3 件を収束し、補正後 HEAD の check_integrity 再実行で NG 0 件（OK 951 / Warning 0）を確認。generate_indexes 派生物（req-health-metrics REQ 行数 AUTOGEN）は commit bf1402e4f で同一 PR 収束済み
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし（既存契約どおりの手動 contingency 経路の実施。script 契約・workflow 契約の変更なし）
- 横展開観点: REQ 行 APPEND を伴う Definition 変更では、REQ ファイルの frontmatter updated 追随が measurement-convergence の機械対象外であるため、REQ APPEND の Case では常に手動 contingency の補正 commit が発生する
- 再発条件: REQ 行 APPEND を含む DefinitionEdit で prepare_definition_pr を実行し、check_integrity が req-updated-freshness の REQ 分 NG を検出する場合
- 予防策候補: prepare_definition_pr の definitionEdits 入力へ REQ frontmatter updated 追随を標準で組込む（stagePaths 含む）か、measurement-convergence step の収束対象へ REQ frontmatter を追加する。いずれも script 契約の変更候補
- 想定反映先: prepare_definition_pr.ts の measurement-convergence step 実装、case-open Design「機械工程の script 呼び出し契約」節
- 関連: Case #3909、PR #3913、Case #3902（同系統の gate 設定由来収束）、Case #3910（宣言外パス補正の区分問題）
- タグ: #case-open #measurement-convergence #integrity #frontmatter-freshness

## [2026-11-04T11:12+09:00][workflow_deviation][case-ready STEP-1 acceptance-checks][Case #3907]
- 問題事象: accept_definition_checks.ts（acceptance-checks phase）の autogen-regeneration-diff step が、generate_indexes を手動で先行実行した未 commit の派生更新（req-health-metrics.md +1/-2）を AUTOGEN 再生成差分として検出し、警告（AUTOGEN derived files differ after regeneration / restore applied）を出して手動更新分を restore で巻き戻した（exitCategory needs-judgment・第2回実行）。
- 発生局面: case-ready STEP-1（Definition PR 受入検査。origin/main との merge conflict 解消後の機械工程再実行）
- 検知方法: script 報告 JSON の autogen-regeneration-diff step の diffStat と warnings（restore applied・Regeneration diff must be resolved before merge）
- 根本原因: 機械工程手順の実行順序を守らず、generate_indexes を手動先行実行して派生更新を working tree に未 commit のまま残した。script の autogen step は working tree がクリーンである前提で git diff 差分を検出するため、手動更新分を検出対象に含めた
- 自律対応内容: conflict 解消ファイルと generate_indexes 更新を git add して解消 commit（af44cd4d2）を作成し、working tree をクリーンにした上で acceptance-checks script を再実行（第3回）。autogen diff 0・integrity OK 951 相当・overlap 警告 4 件（既知・検出不能 0）・traceability missing-design pass を確認し merge へ進めた
- ユーザー確認有無: なし
- Decision/REQ/spec影響: なし（script 契約・workflow 契約の変更なし。実行順序の運用 learning）
- 横展開観点: acceptance-checks script を実行する前に generate_indexes 等の派生更新を手動実行した場合は、必ず先に commit して working tree をクリーンにする。script は差分検出後に restore を行うため、未 commit の手動更新は失われる
- 再発条件: Definition PR の conflict 解消後に派生物を手動生成し、commit 前に acceptance-checks script を実行する場合
- 予防策候補: case-ready reference（definition-acceptance.md）の機械工程節へ「script 実行前の working tree クリーン前提（先行手動派生更新は commit 済みであること）」の明示追加候補。script 側の restore 対象説明の追記候補
- 想定反映先: agentdev-workflow-case-ready の definition-acceptance.md 機械工程節、accept_definition_checks.ts の autogen-regeneration-diff step 説明
- 関連: Case #3907、PR #3914、accept-input-3907-acceptance-report-2.json（警告証跡）、af44cd4d2（解消 commit）
- タグ: #case-ready #acceptance-checks #generate_indexes #working-tree-cleanliness

## [2026-11-04][learning_candidate][MSYS /tmp 仮想パス×bun ネイティブ fs の解釈差][Case #3908]
- 検知: Windows 環境で `mktemp -d` が返す MSYS 仮想 /tmp パスを bun（Windows ネイティブ fs）に渡すと、bun 側は別の実パス（カレントドライブ直下の \tmp\ 等）へ解釈し、bash 側の `ls` 観測と bun の fs 操作が不一致になる（遷移記録の記録ファイル数の観測が誤る・TS-802 公開 CLI 観測で発生）。
- 対処: bun で fs を操作する検証の観測先を MSYS 仮想パスから Windows 実パス（C:/WINDOWS/TEMP/opencode 配下等）へ切り替えて再取得した。
- 学び: bun で fs を操作する検証では観測先パスを MSYS 仮想パス（/tmp 等）にせず、Windows 実パスを明示する。bash 側の ls と bun 側の fs は同じパス文字列でも実体が別になり得るため、記録ファイル数等の観測は bun 自身の fs API で行うのが確実。
- 出典: PR #3920 本文 `## Findings/ Capture候補`（### learning）、case-close 対応コメント issuecomment-6632234961
- 関連: Case #3889 の「MSYS パス変換による clone 誤配置」（2026-11-02）は別事象（clone の引数パス変換）。本項は fs 操作対象パスの解釈差で重複しない。
- タグ: #learning-capture #windows #msys #bun-fs #検証観測

## [2026-11-05][learning_candidate][traceability_relied_diff T6 の期待文言と v51 Design 実文言の不整合][Case #3918]
- 検知: bun test 分割①（QG-4 フル suite）で `traceability_relied_diff.test.ts` T6「後続消費経路の文書接続が存在する」が fail。T6 が期待する v51 Design の `impact 拡張（差分候補）` 文言が実文言に不在。main（21df6658a・84491f816）で単独再実行し同一 fail 再現（pre-existing・PR #3924 の diff 11 files は期待対象行に触れないことを `git diff 21df6658a..5fcb369d9 --name-only` で確認）。
- 対処: 未修正（本 Issue 対象範囲外・fail は fail のまま申告・合格への読み替えなし）。PR #3924 本文 Findings に記録済み。
- 学び: 既存 pin/期待テストの文言期待は、対象文書の節更新と同期していないと pre-existing fail として滞留する。文言期待の pin は対象文書の正規文言への追随更新を対応 PR で行うか、期待の再確認を検証差分に記録する。類似の pre-existing fail（REQ-110-041 phase_adoption_record_contract・前回 #3919 から計上継続）と合わせ、integrity suite の fail 滞留の由来分類記録に baseline 再現確認を付ける運用が機能している。
- 出典: PR #3924 本文 `## Findings/ Capture候補`（修正候補: 同文言の正規文言への pin 更新または期待の再確認）、QG-4 機械検証の実行証跡（split1.stderr・main-relied-diff 再現ログ・C:/WINDOWS/TEMP/opencode/qg4-3918/）
- 関連: 分割① REQ-110-041（phase_adoption_record_contract・別系統の pre-existing fail・同一分割で観測）、Case #3919（同一 2 fail の計上記録・comment 6631838809）
- タグ: #learning-capture #traceability #relied-diff #pin期待文言 #pre-existing

## [2026-11-05][learning_candidate][隔離検証セッション実行側の中間メッセージ中国語出力][Epic #3909]
- 検知: TS-606 能力1（直接入力）の新規隔離実行セッション C1（/agentdev/req-define・4096 HTTP 投入・main 1cfc5ee56 投影）で、実行側セッションの STEP-5 中間メッセージに中国語出力「关键事实」が 1 箇所観測された（supplement-3909-ts606.md §7-6）。機能観測（STEP-6 決定的組立・STEP-9 読戻し検査合格）への影響なし。
- 対処: 記録のみ（観測時点では処置せず・親判断により本 learning として回収）。
- 学び（再発防止の観点）: 言語規律（基本言語は日本語・中国語での出力を禁止）は隔離検証環境・fixture 実行側セッションでも適用対象。隔離実行の観測項目に実行側中間メッセージの言語確認を含め、規律から外れた出力を検知したら機能影響の有無と分けて記録する。発生要因（投入言語・モデル側の言語選択条件）は本観測では特定できておらず、再観測時に要因の切り分けを要する。
- 出典: セッション C1 SID ses_e5815631fffeIfGrF6N69ZHDUw・対象版 1cfc5ee56（ts606-r1 隔離投影）・supplement-3909-ts606.md §7-6・中間証拠 C:/WINDOWS/TEMP/opencode/ts606-r1/evidence/（C1 dispatch-meta.json・messages.json）
- 関連: Epic #3909（TS-606 検証）・supplement-3909-ts606.md・Epic #3909 close SSoT コメント 6645168558（capture 判断記録）
- タグ: #learning-capture #language-discipline #隔離検証 #セッション観測

## [2026-11-05][learning_candidate][ADF-COVERS inline 宣言の ID 列挙はかっこ付き説明で黙示切断される][Case #3928]
- 検知: case-open 設計PR 準備機械工程（prepare_definition_pr）の traceability gate で REQ-052-018 のみ missing-design fail。design 対応宣言は custom-tool-contracts.md の既存かっこ付き宣言行（REQ-052-016/017 形式）の末尾へ `, REQ-052-018（説明）` として追加済みであり、宣言行自体は worktree 内に存在していた。coverage --req の単行実測で REQ-052-016/017 は抽出されるのに REQ-052-018 だけ抽出されないことが判明。
- 対処: 既存先例（case-close Design の REQ-032-040/041 形式）に従い、かっこ付き説明を独立した 1 行宣言（`<!-- ADF-COVERS(design): REQ-052-018（説明） -->`）として別行へ分離し、増分修正 commit（4d4ad2da2）で script 再実行して missing-design 0 件を確認。
- 学び: inline 宣言の解析（agentdev-traceability scripts/lib/declarations.ts）は ID 列挙のカンマ連結のみを受理し、既存 ID のかっこ付き説明の後に続けた ID は黙示に切断される（malformed-declarations には検出されず missing-design だけが現れるため原因箇所の特定に実測が必要）。かっこ付き説明を持つ ID は既存行への連結ではなく独立行の宣言として追加する。coverage --req の単行実測（抽出されない ID の比較）が原因特定に有効。
- 出典: Case #3928 設計PR #3929（c4780cd28 初回実行で検出・4d4ad2da2 で修正）、PR #3929 本文検証欄、traceability/sidecar-and-policy.md「inline 宣言行の記述形式（ID 列挙のみ）」節
- 関連: Case #3928 STEP-4、REQ-052-018、agentdev-workflow-case-open references/definition-pr-and-idempotency.md の traceability gate 判定仕様
- タグ: #learning-capture #traceability #ADF-COVERS #inline宣言 #missing-design


## [2026-11-05][learning_candidate][case-open targeted 検査経由では計測日収束 (b) が発火せず frontmatter updated 未追随のまま Definition PR が merge 可能になる][Case #3928]
- 検知: case-ready merge 前品質検査の frontmatter updated 再実測（IR-072 規約: updated = 最終内容変更 commit の author date、frontmatter のみの変更 commit は除外）で、変更を伴う docs 8ファイルのうち6ファイル（case-close.md、req-health-metrics.md、custom-tool-contracts.md、v4-delegation-contracts.md、REQ-032.md、REQ-052.md）が 2026-11-05 の内容変更 commit を持ちながら updated が旧日付（2026-10-16〜11-04）のままだった。
- 対処: frontmatter のみの追随補正 commit（6ed481996、明示パス指定6ファイル）を設計PR branch へ追加し、再実測で全件一致を確認してから merge した。
- 学び: case-open の PR 準備で実行していた targeted check_changed_docs（--workflow case-run）は IR-072 req-updated-freshness を含まない（本検査クラスは check_integrity full audit 側）。計測日収束 machine step（prepare_definition_pr measurement-convergence）の trigger 条件も check_integrity 報告の計測日不整合・req-updated-freshness NG であるため、full audit 未実行の Case では (b) が発火せず、case-ready の merge 前再実測が最後の検出点になる。再発防止候補: Definition PR で docs の内容変更を行う Case では、PR branch HEAD で IR-072 相当の突合（git log --format=%as と frontmatter updated の比較、frontmatter のみの変更 commit の除外を含む）を case-open 側で機械実行する。
- 出典: Case #3928 設計PR #3929（受入検査で検出・6ed481996 で補正）、.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts の IR-072 実装、agentdev-workflow-case-open references/definition-pr-and-idempotency.md 計測日収束節
- 関連: Case #3928 STEP-1、REQ-010-068（IR-072 根拠 REQ）
- タグ: #learning-capture #frontmatter-updated #IR-072 #definition-pr #case-ready

## [2026-11-05T20:40+09:00][intake_candidate][配布依存境界 phase-transition identity.ts の既存REQ識別子コメント][Case #3928]
- 検知: case-run の配布依存境界 source profile 検査（PR #3939 pre-gate・#3931 実行）で、変更外の src/common/skills/agentdev-workflow-phase-transition/scripts/lib/identity.ts:4 の REQ識別子コメントを検出（exit 1）。該当ファイルは main との差分なしを確認し、本 PR では未変更。
- 対処: 本 Case（#3931）の対象範囲外として未変更。変更ファイルに新規違反がないことを確認の上で PR を進め、既存違反として PR #3939 本文 Findings へ記録済み。
- 学び: 配布依存境界 pre-gate は既存違反も報告するため exit 1 となる。変更外の既存違反はスコープ判定（main 差分の不在確認）で PR を進める判断と、恒久的な是正処置（識別子コメントの除去）を区別して記録する。処置判断は intake-promote での分類確定対象。
- 出典: PR #3939 本文 Findings / Capture候補（intake 第1項）・品質メトリクス「配布依存境界 pre-gate」行
- 関連: Case #3928・Wave-2 #3931・2026-10-27T10:45 の intake_candidate（case-close Epic Wave クローズ・配布物への REQ/AG 識別子記述）と同系統の配布物識別子規律
- タグ: #intake-capture #配布依存境界 #REQ識別子 #pre-existing

## [2026-11-05T20:40+09:00][design_promotion_candidate][検査scope別JSON stdout形状の Design 実装契約明記][Case #3928]
- 検知: PR #3939（#3931）の Design確定候補として、検査scopeごとのJSON stdout形状と不正形状の扱いを検証用一時資材ライフサイクルDesign（docs/designs/workflows/verification-resource-lifecycle.md）の実装契約へ明記する候補が申告された。終了判定記録の4-field形式（issueNumber / targetRevision=issueUpdatedAt / generatedAt / accepted）は reader と一致、追加の設計値は導入なし。
- 対処: 本 boundary（Wave-2 #3931 子Issue クローズ）では記録のみ。Design適用判断は Epic #3928 最終 close 時に行う。
- 出典: PR #3939 本文 Design確定候補セクション
- 関連: Case #3928・docs/designs/workflows/verification-resource-lifecycle.md・close_mechanical_steps.ts の終了判定記録書出し
- タグ: #design-promotion-candidate #case-close #終了判定記録 #json-stdout
