# inspect-docs finding 20260908T120350Z

> /agentdev/inspect-docs（backlog-auto stage 1）2026-09-08 実行分。本日の Epic #2686 系（agentdev_gh 操作契約 16操作刷新、REQ-011-022..030 行更新、Comment 操作移行）後の docs 全体・配布物の意味整合性診断結果。既存 inbox 3ファイル（20260822T080133Z、20260901T120043Z、20260907T012032Z の defer 残置分）には触れていない。

## サマリ

- スキャン対象: REQ 58件（現行 47 + retired 11）、Decision 26件、Design 125件（designs/ 配下 md、_template 含む）、guides 12件、docs/README.md・ルート README.md、配布物 231ファイル（src/opencode/commands/agentdev/、src/opencode/skills/、node_modules 除く）
- 検出事項: 5件（F-01: high、F-02: medium、F-03: medium、F-04: medium、F-05: low）
- high severity: 2件（F-01 配布物 skill と現行 REQ/Design の契約矛盾、F-02 同系統の残置記述）

## 検出事項リスト

### F-01: agentdev-issue-tracking SKILL の issue_list 絞り込み記述が現行 Tool 契約と矛盾（本日更新の REQ-011-022 / 16操作カタログに反する）

- **category**: 横断契約矛盾 / DRIFT（上位 REQ・Design を正とした配布物の矛盾）
- **target**: src/opencode/skills/agentdev-issue-tracking/SKILL.md:60, 66, 91, 100
- **evidence**: L66「labels・search パラメータは Tool が invalid-input として拒否するため指定せず、結果の絞り込みは応答一覧をクライアント側で行う」および L60/91/100「role 単位で列挙。絞り込みは応答一覧をクライアント側で行う」。一方で REQ-011-022（2026-09-08 更新）は「Issue 一覧・検索（role、kind、state 等による絞り込みを含む構造化結果）」を操作契約に要求し、accepted Design custom-tool-contracts.md は「フィルタ可能な軸（state、labels 等）はサーバ側絞り込みクエリへ推送し」を定める。実体も矛盾: contracts.ts issue_list 入力は role/kind/state/trackingState/labels/search を受理し（specs-issue.ts L529-591）、plugin.ts は labels（「Labels accepted by issue_create, issue_update, and issue_list」）と search（「Title substring filter for issue_list」）を公開スキーマへ含め、plugin.test.ts L103 が全フィルタ指定の要求を正当要求として検証する。ローカル版 README も「role/kind/trackingState/state/labels/search による絞り込み」と記載
- **severity**: high
- **confidence**: high（公開スキーマ・実行時 validator・テストの機械的照合で確定）
- **source_of_truth**: REQ-011-022（現行 REQ）＞ custom-tool-contracts.md（accepted Design）＞ contracts.ts / plugin.ts（実体）
- **recommended_route**: 意味診断検出事項（req-define 再壁打ちまたは case-update で SKILL の標準呼出形式節を現行契約へ現行化）。docs-check ルール候補: 配布物 skill の Tool 操作パラメータ言及と公開スキーマ（plugin.ts / contracts.ts）の機械照合
- **ng_classification**: 今回修正対象（要ヒューマンレビュー: 当該文言自体は #2646 由来の残置だが、本日 #2692 が本 SKILL を更新した際に残存し、同日更新の REQ-011-022・16操作カタログとの矛盾が顕在化した）
- **notes**: 同一文書内で L52 の issue_create「labels は必須引数」記述は現行契約と整合しており、L66 のみ旧契約の記述が残存

### F-02: agentdev-workflow-issue SKILL にも同系統の「絞り込みはクライアント側」記述が残置

- **category**: 横断契約矛盾 / DRIFT（F-01 と同根）
- **target**: src/opencode/skills/agentdev-workflow-issue/SKILL.md:71
- **evidence**: L71「`issue_list`（role 単位で列挙。絞り込みは応答一覧をクライアント側で行う）で既存追跡Issueを検索し」。Tool は kind/state/trackingState/labels/search による絞り込みを操作契約として提供する（REQ-011-022、custom-tool-contracts.md、plugin 公開スキーマ）
- **severity**: medium
- **confidence**: high
- **source_of_truth**: REQ-011-022 ＞ custom-tool-contracts.md ＞ 実体（F-01 と同一）
- **recommended_route**: 意味診断検出事項（F-01 と一括で現行化）
- **ng_classification**: 今回修正対象（要ヒューマンレビュー、F-01 と同根の経緯）
- **notes**: 本 SKILL は comment_create / comment_list への移行済みで操作名側は現行契約に整合

### F-03: agentdev-gh Local 実装 README の操作契約記述が実装・Design に対して陳腐化（issue_comment 温存記述・pr_read 全文返却・#2688 未解決表現）

- **category**: DRIFT（accepted Design 正本と実体側記述の乖離）
- **target**: src/opencode-local/agentdev-gh/README.md:4, 26, 31
- **evidence**: L4「同一の操作契約（`src/opencode/tools/agentdev-gh/contracts.ts` の16操作 + 温存中の `issue_comment`）」と L26 の `issue_comment` 読み替え行（旧 `### {日時}` 形式）に対し、runner-local.ts の操作ディスパッチは16操作のみで issue_comment を実装しない（contracts.ts も issue_comment を含まない）。L31 pr_read「body としてローカルIssue全文を返す（body の論理範囲の直列化は #2688 が確定する）」に対し、実装は serializePrBody による3セクション（マージ前確認 / Design確定候補 / Findings / Capture候補）直列化を返し（runner-local.ts L1230-1239、L1285）、accepted Design local-case-file.md も同範囲を定義済み。参照先 #2688 は #2694（commit dad9a860）で完了済み
- **severity**: medium
- **confidence**: high（ディスパッチ網羅と実装戻り値の機械的確認）
- **source_of_truth**: docs/designs/local/local-case-file.md（accepted Design）＞ custom-tool-contracts.md ＞ runner-local.ts（実体）
- **recommended_route**: 意味診断検出事項（README の3行を現行の16操作・Comment CRUD・論理 PR 本文契約へ現行化）
- **ng_classification**: 今回修正対象（本日 #2694 の Local 実装刷新で実装が新契約へ一致した一方、README の旧記述が更新されず残存）
- **notes**: 対象は docs/ 配下ではない実装付随 README だが、REQ-011-024（GitHub 版とローカル版の同一上位操作契約）の DRIFT 観点で検出

### F-04: case-schema/case-file.md（運用参照資料）が正本 Design と矛盾（旧操作名 issue_comment 残存・PR 系操作列挙に pr_update 欠落）

- **category**: DRIFT（正本 Design との矛盾、自己宣言違反）
- **target**: src/opencode-local/agentdev-gh/case-schema/case-file.md:71, 75
- **evidence**: L71 の PR 系操作列挙「pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable」に pr_update が欠落（正本 local-case-file.md L141 は pr_update を含む）。L75「issue_comment の読み書きは、対象ローカルIssueの role により読み替え先を分岐する」は廃止済み旧操作名（正本同 L150 は「Comment 操作（comment_create、comment_list、comment_update、comment_delete）の読み替え先は role により分岐」）。本ファイル冒頭は「本ファイルは運用参照資料であり、Design と矛盾してはならない」と自己宣言
- **severity**: medium
- **confidence**: high
- **source_of_truth**: docs/designs/local/local-case-file.md（accepted Design、冒頭で正本と宣言）
- **recommended_route**: 意味診断検出事項（F-03 と一括で現行化）
- **ng_classification**: 今回修正対象
- **notes**: Comment 物理形式（`### c{NN}`、commentId、comment_seq）の記述自体は正本と整合しており、旧記述の残置が局所的な箇所のみ

### F-05: custom-tool-contracts.md の issue_comment「一時的に温存する」条項が遷移完了後も残置（cleanup 候補）

- **category**: 廃止概念の遷移完了後残置（cleanup モデル対象カテゴリ）
- **target**: docs/designs/responsibilities/custom-tool-contracts.md:35
- **evidence**: 「廃止: issue_comment（…）。正規操作カタログから除去し、ADF 内部の呼出元は Comment 操作へ移行する。移行完了までの間は一時的に温存する」。全配布物呼出元の Comment 操作移行は完了し（commands/skills の issue_comment 操作呼出 0件、テンプレートファイル名 issue_comment_*.md は用途識別子として別系統で正当）、GitHub 版 contracts.ts とローカル版 runner-local.ts のいずれも issue_comment を実装しない。「温存」される実体がリポジトリ内に存在しない状態で条項のみが残置
- **severity**: low
- **confidence**: medium（外部 consumer 環境での旧 runner 保持の可能性が文脈確認事項）
- **source_of_truth**: REQ-011-022（二重モード操作を正規操作カタログに含まない）
- **recommended_route**: 意味診断検出事項。cleanup モデルの RETIRE / INFERENCE 候補（温存条項の除去または「温存完了」の明記）を推奨経路に併記
- **ng_classification**: pre-existing（本日の変更で温存条件「移行完了まで」が充足されたことで顕在化）
- **notes**: 既存 defer F-04（20260907）等の既知検出事項とは別件

## 推奨アクション

- F-01 / F-02: `/agentdev/req-define`（配布物記述の現行化 REqs 化）または該当 Case Issue での case-update。docs-check ルール候補「配布物 skill の Tool 操作パラメータ言及と公開スキーマの機械照合」を併記
- F-03 / F-04: Local 実装側ドキュメント 2ファイルの現行化（F-01 と同一 Case への統合候補）
- F-05: inspect-promote での分類後に cleanup（RETIRE / INFERENCE）判断
- req-define 入力案: 「agentdev_gh 16操作カタログへの刷新に伴う配布物・実装付随文書の現行化漏れ是正（issue_list 絞り込み契約の記述統一、Local 実装 README / case-schema の旧操作名・旧 PR 本文範囲記述の除去、custom-tool-contracts の温存条項の処置）」

## 対象外（Out of Scope）

- 既存 inbox 3ファイル（20260822T080133Z、20260901T120043Z、20260907T012032Z）の defer 検出事項の再審（inspect-promote の責務。F-05 相当の再評価はそちらの系統とは別件として本ファイルに出力）
- docs/reports/ 配下の凍結監査記録（req-048-baseline-v2-audit.md の REQ-048-019 旧行 ADF-COVERS 参照、監査レポート内リンク等。20260907 実行分と同一の扱い）
- 配布物 ADF-COVERS(implementation) 宣言中の REQ ID（正規配置先カタログに基づく機械消費の対応宣言）
- 既知の false positive（20260901/20260907 実行分で確認済み）: `/agentdev/templates/...` パス文字列、4重バックフェンス内 frontmatter 例示（agentdev-skill-authoring/references/development-workflow.md:57, 67）、コードフェンス内の見出し例示（git-error-messages.md L21、agentdev-learning-capture/references/example.md L163-175）、テンプレート変数 `{xxx}` 内の ID 表記
- 本スキャンで偽陽性と判定した機械的検出: 上記フェンス内見出し・frontmatter 例示の他、requirements/README.md・docs/README.md・decisions/README.md の AUTOGEN 突合は実ファイル数（47+11、26件）と完全一致

## クリーン判定（問題なしと確認した観点）

- REQ frontmatter id↔ファイル名一致・一意性: 現行 47 + retired 11 の全 58ファイルで問題なし
- 第一参照導線: requirements/README.md AUTOGEN（現行 47 + retired 11）・docs/README.md（47件/11件）・実ファイル数が完全一致。ルート README 入口表・commands README（19コマンド + README）も実在と一致
- Decision: 26ファイル、status 実体（accepted 16 / proposed 8 / superseded 2）が docs/README.md・decisions/README.md の記述と一致。superseded DEC-005/DEC-007 の活性文書参照はすべて注記・履歴文脈付き
- 廃止 REQ 参照: REQ-010/012/021/036 等の活性 REQ からの retired REQ 言及はすべて「廃止。」「retired。」前置付き（spot check 済、20260907 判定から変化なし）
- REQ-011-022..030 ↔ 16操作カタログ ↔ contracts.ts ↔ runner-local.ts ↔ verification-scope-catalog（REQ-011-022..024、025..030 任意行登録）: 操作名・VERIFY 区分・失敗分類・Comment 識別概念が相互に整合
- agentdev-issue-tracking Design 確定事項 12（再オープン遷移）・14（Comment 利用規律）↔ SKILL Comment 利用規律節: 単一参照点宣言が相互整合
- local-case-file.md ↔ runner-local.ts ↔ ローカル README の Comment 物理写像（`### c{NN}`、commentId `issue-{NNNN}-c{NN}`、comment_seq、原子的書込み）: 整合（README/各 2ファイルの陳腐化箇所は F-03/F-04 として別途出力）
- 配布物 231ファイル: UTF-8 BOM 付き 0、CRLF/LF 混在 0、制御文字・U+FFFD 0、frontmatter 重複 0、主要見出し重複 0（フェンス内例示は除外）、内部 ID 汚染 0、存在しない command 参照 0
- ADF-COVERS 宣言行の存在性: docs/ および配布物の全宣言の REQ-{NNN}-{NNN} 行が実在（docs/reports の REQ-048-019 旧行参照は凍結記録として対象外）
- REQ 要件テーブルの Design 分離基準（HOW 残留）走査: REQ-011 新設行（-022..-030）は公開操作契約の要約であり安定契約例外候補（外部接続契約）。新規違反シグナルなし
- guides・README: 履歴混入なし、索引は導線範囲内（guides README 11ガイド、ルート README 入口表、commands README の相互整合）

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 13 item
- `.agentdev/intake/promoted/`: 1 item
- `.agentdev/learning/inbox.md`: 存在（未整理エントリ）
- `.agentdev/learning/promoted/`: 1 item
- `.agentdev/backlog/req-units/`: 空（.gitkeep のみ）
- `.agentdev/inspect/inbox/`: 既存 defer 残置 3ファイル（20260822T080133Z、20260901T120043Z、20260907T012032Z）+ 本ファイル

## 参照

- 診断実行: /agentdev/inspect-docs（backlog-auto stage 1）2026-09-08
- 探索手段: README 索引・正規成果物の直接読取・rg / node による機械的走査（REQ frontmatter・索引突合・配布物エンコーディング/構文/ID パターン・ADF-COVERS 行存在・command 参照実在・Tool 契約↔実装↔配布物の相互照合）
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）
