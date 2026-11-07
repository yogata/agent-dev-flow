# 評価レポート

## メタデータ

- **実行日時**: 2026-11-07（backlog-auto stage 2 learning 系統・3ライン並行の learning-promote ライン）
- **基準 revision**: 7528a03ea（run 開始時 main HEAD・STEP-6 前に並行ラインの intake-promote commit（121521f9d・SKILL.md 等の learning 対象ファイルへの変更なし実測）が入ったため、STEP-6 実行時の基準は 121521f9d。pull --ff-only で確認済み）
- **対象エントリ数**: inbox 67 件（見出し単位・627 行実測）、deferred 271 件（見出し 275 行のうち 4 行は様式・説明見出し。実行前実測）、promoted/ 0 件（空ディレクトリ実測）
- **問題クラス数**: 41（promote 1・duplicate 4・deferred 統合追記 14・deferred 新規移動 22〔STEP-4 review 是正で P-b を promote から deferred へ変更・21 クラス + P-b〕。Case #3928 系 design 候補群を 1 クラスに統合（18 エントリ）。Case Capture の複数サブ学びを含む見出し 4 件は主クラス帰属＋サブ分離（Q6 追記 1・Q23 1・Q25〜Q27 3）で処理）
- **Jev**: 処分区分 1 評価（20261107T072458Z-3b99・41 問・confidence 0.87・暫定と 37 問一致・4 問（c17/c18/c38/c39）で evaluator が「既存対策の更新」優勢〔0.44〜0.48〕と暫定 deferred が分岐 → LLM 最終判断は promote 基準（恒久手順の具体的 gap を**実測で確認**）が未充足（gap 現行文言確認未実施・出現 1 件）により deferred 維持（semantic_disagreement で記録・observation_write 成功））・8軸評価 1 評価（20261107T072629Z-8c55・14 問・confidence 0.69・全問 argmax 水準と最終判断一致。observation_write は 3 形式（水準番号・混合修正・index）試行し全て invalid_input → **観測への finalResult 未追記**（前回 run（2026-10-27）と同一の既知問題・fail-open 契約により本 Workflow success は維持し warning として明示。evaluator 結果・確率分布は観測へ永続化済み・最終判断（水準番号）は本レポート本文に記録））・昇華可能性 1 評価（20261107T072915Z-08cf・2 問・u1=false〔0.81〕u2=true〔0.70〕・LLM 最終判断は両問とも evaluator と一致（u1 の false は「恒久契約（REQ/Decision/Design）への昇華」の意味であり、処分区分 5（既存対策の更新）としての promote とは別軸（SKILL 文言是正は配布物是正で完結・恒久契約変更を伴わない）で矛盾なし）・observation_write 成功（boolean 形式は問題なし・score 形式のみ既知問題の発生を確認））・review 発動条件 1 評価（20261107T073721Z-ec2e・rt1=true〔0.95〕・LLM 最終判断は発動で一致・observation_write 成功）
- **Jev score value 解釈の記録（追補）**: evaluator の score value は scale index（0 起）で返却（分布 argmax 水準 = value + 1・前回 run 記録と同一）。observation_write の検証は、(a) 水準番号形式（全問 index+1・sb-transfer（index 4 → 水準 5 とすべき所 4 を送信）1 件差異で invalid_input）、(b) 水準番号形式（sb-transfer 修正済み・全問 index+1）→ sa-impact（index+1 値 2 を送信）で invalid_input、(c) index 形式（全問 index そのまま）→ sb-transfer（index 4 を送信）で invalid_input、(a)(c) で同一 value（sb-transfer=4）が (a) では差異・(c) では差異と相反判定された。整合する入力形式を (c) までで確定できなかったため (d) 以降の追試は実施せず（同一形式の盲目的反復禁止・(a)(b)(c) は material difference あり）fail-open 経路へ切替
- **旧 report**: 2026-10-27 実行分（Case #3816〜#3862 系 41 件対象・promote 2 件〔P1・P3〕の promoted は backlog-review で RU 化消費済み〔promoted/ 空・状態表契約どおり〕）のため本レポートで上書き置換
- **前回 run との差分**: 前回 run（2026-10-27）以降に capture された 67 見出し（2026-10-27 〜 11-07・Case #3866〜#3928 系（Epic 最終 close 含む）・一部 2026-10-27 当日遅延分）。deferred.md は前回 run 終了時（統合追記 13 箇所 + 新規移動 14 件）から不変（見出し 275 行〔261+14〕実測）

## 判定基準

処分はスコアのみで決めず、既存恒久対策の現状、実害、情報の自足性、昇華可能性、既存プールとの関係を併せて評価した。十分な恒久対策により既に網羅されているものだけ duplicate とし、deferred pool に似た記録があるだけでは duplicate にしない（前回 run と同一基準）。promote（既存対策の更新）は既存恒久手順の具体的 gap を実測（grep・ファイル読取・コード読取）で確認できた場合に限った。**既存対策照合の対象は恒久契約（docs/designs・requirements・decisions）に限らず、配布 reference（src/common/skills/*/references/）と docs/knowledge/ を含む**（STEP-4 review で P-b の照合漏れが発見されたため本基準を明文化）。Decision 候補は禁止条件ゲート（agentdev-decision-guidelines 除外基準）で全単位除外した。

## STEP-1 読込・正規化

- inbox 67 エントリ（627 行）を読込・正規化。capture 由来の 3 形式（13 フィールド形式・検知/対処/学び 3 行形式・Case Capture の ### サブエントリ形式）を解析時に 13 フィールド相当へ正規化（元ファイル不変・旧 5 フィールド形式の出現なし・正規化適用の必要な欠損フィールドなし）
- deferred インデックススキャン: 見出し 275 行（実エントリ 271 件）を grep on read で取得。同根・近縁候補の本文読込 12 箇所（L4369〔Q4 統合先近縁〕・L4542〔Q2 同根・配布物 REQ ID 直記違反〕・L4606〔Q6 同根・Windows Git Bash /tmp ENOENT〕・L4893〔Q4 統合先近縁・bun install lockfile 副作用〕・L4947〔Q3 同根・LSP 3000ms timeout → tsc --noEmit〕・L5027〔Q39 同根・scan 集合 cwd 変動〕・L3892〔Q16 同根・ADF-COVERS inline 重複・処分判定 deferred 済み〕・L5125〔Q17 統合先・DefinitionEdit 2 行編集〕・L3979 近傍〔Q18 統合先近縁・Bun.YAML 解析系〕・L2143 付近〔Q32 同根・同一 Wave 並列 fixture 依存・実測見出し行は L2181〕・L4637 近傍〔Q8 統合先近縁・acceptance-checks AUTOGEN 差分〕・L4800 近傍〔Q29 統合先近縁・baseline 既存 fail 対照〕）。全面読みフォールバック対象エントリなし

## 問題クラス一覧と処分判定

軸順: 発生件数 / 影響度 / 横展開性 / 反映先明確度 / 自動化適性 / 再利用性 / 再発可能性 / 費用対効果。加重合計は満点 40。発生件数軸は deterministic 境界により機械導出。スコア記録は水準番号（index + 1・前回 run 記録規律と同一）。

### P-a（promote・既存対策の更新）: case-run-execution-adapter SKILL.md 作成先文言不整合是正（1 エントリ・28/40）

- **根本原因**: 検証用一時資材の作成先境界の Design 変更（case-dedicated-area basis 廃止・案件番号非根拠化）が、同一境界を参照する配布 SKILL 契約行へ追随されていない（対象変更ファイル一覧外のため未修正のまま残存）
- **再発条件**: 実装境界の変更を伴う Case（basis 値の置換・判定根拠の削除）で、同一境界を参照する SKILL 契約行が対象変更ファイル一覧に含まれない場合
- **予防策（提案段階・実現先確定は req-define）**: 実装境界変更を伴う Case では同一境界を参照する SKILL 契約行の文言整合を対象一覧へ含めるか、不整合を Findings として確実に記録する。実装と SKILL 文言の不整合は、作成入口の確認報告が旧文言に従う事故の起点になり得る
- **8軸評価**: 28/40（発生1〔機械導出〕・影響2・横4・反映4・自動4・再利用4・再発4・費用5。Jev 評価 20261107T072629Z-8c55: 全軸 argmax 水準と最終判断一致・STEP-4 review Stream A で PROMOTE_OK 判定〔8軸妥当圏内〕）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: agentdev-case-run-execution-adapter SKILL.md（検証用一時資材の作成報告節・L94）に修正前境界文言（「案件専用領域（案件識別子をパス要素に含む repo 外ディレクトリ）」）が現存（grep 実測・2026-11-07）。Design 正本（verification-resource-lifecycle.md・受入未達節 L50①・作成入口の作成先拒否の接続確認節 L51）の現行文言は「プロジェクト内正規一時領域（repo root の .agentdev/tmp/）・パス要素に案件番号が含まれることは許可根拠にしない」（grep 実測・2026-11-07）。SKILL.md 全文中作成先境界文言は L94 のみで別節での追随修正なし・並行ラインによる修正なし（intake-promote commit 121521f9d は SKILL.md 未変更実測）・intake items による所有なし（promoted 4 件いずれも文言整合を所有しない実測）。inbox エントリ自身が「SKILL.md が対象変更ファイル一覧外のため未修正・文言整合は別件処置候補（intake/learning-promote での分類確定対象）」と申告（Case #3928 Wave-6 #3946 close の PR #3947 Findings）。出現 1 件・gap 分類: fix gap（文言追随漏れ・陳腐化）
- **既存対策照合**: 対策あり（部分的）・ギャップ: fix gap（SKILL 契約行の文言追随漏れ）
- **エントリ一覧**: [2026-11-06T05:19] adapter SKILL.md 作成先文言不整合（Case #3928 Wave-6 #3946）

### P-b（STEP-4 review 是正で promote から deferred 新規移動へ変更）: 大容量 Issue 本文部分更新の機械的照合規律（2 エントリ・30/40）

- **根本原因**: agentdev_gh issue_update の大容量本文（Epic 本文等）の部分更新で、(1) 組立途中リテラル（PLACEHOLDER-FULL-BODY）の送信、(2) 正本ファイルを読まず記憶から再構築した簡略版の送信、により本文を破壊した。事故は既存規律（issue-operation-safety.md・後述）存在下での機械的照合未実施として発生。Tool VERIFY は送信内容と読み戻しの一致のみを検証し「意図した内容との一致」は検証しない（specs-issue.ts L388-418 実測: 送信内容と読み戻しの完全一致 + 追跡軸保持のみ）
- **再発条件**: 大容量本文の部分更新を、既存の最小差分手順（スナップショット取得・state 突合）を実行せずに実施した場合。送信前の機械照合（行数・sentinel の正本突合）は既存規律に不在（既存は送信後 state 突合）。中断（abort）経路で正規領域外に作成した一時 payload が残存し検査から漏れる場合（既存は payload 正規配置（.agentdev/tmp/）規定あり・残存検査範囲（repo 直下 + .agentdev/ 直下）の明記は不在）
- **予防策（提案段階・実現先確定は req-define）**: 既存規律（issue-operation-safety.md「Issue 更新時の前後内容比較」「issue_update の全文置換モデルと最小差分手順」）に、(a) 送信前機械照合（行数・主要 sentinel の正本突合）の明記追加、(b) 中断後残存検査の範囲拡大（repo 直下 + .agentdev/ 直下の両方）を候補として保持する
- **8軸評価（STEP-4 是正後）**: 30/40（発生2〔機械導出〕・影響4・横4〔5→4: 横展開根拠の「規律不在」が既存規律実在により修正〕・反映4・自動4・再利用4・再発4〔事故は規律存在下での未遵守として実害実績・機械化 gap は残存〕・費用4〔5→4: 残 gap は規律強化で即効性減〕。STEP-4 是正前の暫定 32/40〔横5・費用5〕は review 指摘〔前提崩れによる過大〕を受理して修正）
- **処分変更記録（STEP-4 review Stream A の重大 finding を受理）**: 暫定 promote（既存対策の更新）を取り消し **deferred（新規移動）へ変更**。反証実測: issue-operation-safety.md（agentdev-issue-management 配布 reference）に Case #3928 事故（2026-11-06）以前（最終更新 2026-10-15・commit 23ae4277c）から「更新前スナップショット必須禁止（L290）」「Issue 更新時の前後内容比較（L182-193・更新前スナップショット保存 → 再取得差分比較 → スナップショット削除）」「issue_update の全文置換モデルと最小差分手順（L195-218・全文置換モデル明示・最小差分手順 3 要素〔スナップショット・対象セクション明示・state 突合〔対象外セクションの checkbox 状態・行数・識別子変化確認〕〕・fix-and-reverify〔対象外 state 変化時はスナップショットの値へ戻して issue_update やり直し〕）」「Epic 実行構成表更新手順（L161-180・更新前スナップショット記録 → 更新後の行数・列数検証）」「payload 正規配置（L232・実行時作業領域配下）」「中断・担当交代再開（L248-251）」が実在。P-b の問題クラスの中核（全文置換モデルによる本文破壊・スナップショット突合による検出・fix-and-reverify）は既存対策で被覆済みであり、暫定 promote の根拠（「恒久契約へ不在」・custom-tool-contracts.md への不在としては真〔grep 実測・実装側 specs-issue.ts も被覆なし〕）は既存対策照合の範囲漏れに依存していた。残 gap（送信前機械照合・残存検査範囲拡大）のみを deferred で保持する。docs/knowledge/llm-body-verification-filesystem-truth.md（機械突合規律・Case #3158）も関連知識として実在。出現 2 件（本文破壊 ×2 実害 + 一時ファイル abort 残存〔同根申告あり〕・Case #3928 最終 close 工程〔m0729/m0731/m0787/m0792〕）
- **既存対策照合（STEP-4 是正後）**: 対策あり（大部分）・ギャップ: fix gap（送信前機械照合の不在〔既存は送信後 state 突合〕・残存検査範囲拡大の明記不在〔既存は payload 正規配置のみ〕）
- **エントリ一覧**: [2026-11-06T22:30] 大容量 Issue 本文部分更新破壊事故×2（Case #3928 最終 close）・[2026-11-06T15:20] 中断セッションの workflow 一時ファイル .agentdev/ 直下残存（Case #3928・同根申告あり）

### duplicate（4 クラス・23 エントリ）

| クラス | エントリ | 処分根拠（実測） | 8軸 |
|---|---|---|---|
| dup-1 | Case #3928 Wave クローズ design 候補 18 件（REQ-118-005 REQ 行文言判断・4制御接続観測構造と6系統 gap code（merge c6935a61a 申告）・observationFailures 二重チャネル（設計意図記録）・pre-merge-local-state-check 特定実体除外（merge 済み申告）・未記録 entity 正の存在証拠限定（JSDoc/Design 記載済み申告）・作成先許容基準と桁境界（実装済み申告）・OS 依存観測コマンド正規形（SKILL.md 記載済み申告）・CloseMechanicalInput.reclamation・台帳回収様式 verification-resource-ledger-final:v1・証跡センチネル verification-evidence:v1・terminalOperationCompleted・台帳削除確認記録様式・削除確認拒否コード系統・台帳不在と削除確認不存在の責務分離・case-close SKILL HITL 削除確認完了順序（SKILL 接続分 merge 済み申告）・検査 scope 別 JSON stdout 形状（記録のみ）・作成先境界判定アルゴリズムと basis 値契約（文言整合 merge 済み申告）・porcelain 省略形除外/grounds 消費/registrationBasis 旧形式互換（文言整合 merge 済み申告）） | 恒久 Design（verification-resource-lifecycle.md）に受入未達（gap）4制御の機械観測（L50）・作成入口の作成先拒否の接続確認（L51）・削除確認節（L54）・照合（close時）と全終了経路（L59）・専用領域節（L41）等が現行文言で実在（実測・2026-11-07）、case-close SKILL.md に「一時資材回収の削除確認（HITL 停止手順）」（L94-107・5段完了順序含む）・「検証用一時資材照合の OS 依存観測コマンド正規形」（L109・契約テストまで実在）・検査証拠の全文保存の恒久規定は case-close Design の機械工程 script 呼出し契約節（gate 証跡保持要件・stdout/stderr 全文を detail で保存）に実在〔STEP-4 review で根拠所在を訂正〕。Epic #3928 最終 close（m1334・final-acceptance closeAllowed=true 申告〔inbox 先頭エントリ〕）で判断材料として消費済み。**残余（STEP-4 review で指摘・duplicate 維持の条件付き記録）**: 台帳回収様式（verification-resource-ledger-final:v1）・証跡センチネル（verification-evidence:v1）の 2 候補は恒久文書（Design・SKILL・templates Design・issue-lifecycle-records Design）に様式として不在で case-close scripts 実装定数（verification-resource-reclamation.ts L153・verification-evidence-record.ts L50/136）にのみ存在。inbox 申告の「agentdev-workflow-templates Design 側への反映候補」は未消化・様式の運用は scripts 機械生成で成立するが、様式の Design 反映は次回 run で再評価対象（統合追記先・次回 deferred 化の候補）として本記録を残す | 17/40（発生5・影響1・横2・反映4・自動1・再利用2・再発1・費用1） |
| dup-2 | worktree bun test 依存整備手段の前提 3 件（手段1 は main 側 node_modules 実体前提〔空ディレクトリで不成立〕・probe test 前置・Windows git-bash junction 作成〔runtime 結合・dangling 検知・unlinkSync〕） | worktree-operations.md「bun test 実行の環境前提」節（L138-179）に整備手段 1（junction）・手段 2（bun install）・「整備手段の選択基準」節（L168・main 側不在時の一意決定「junction 作成は参照先不在で成立しないため worktree 内での bun install が唯一の確定的な整備手段（判断に迷う余地なし）」）・node_modules 伝播状態の確認手順（L169-171・probe 相当の前置）・fs.symlinkSync 絶対パス指定（L154・forward slash 形式 L150）・fs.rmdirSync 正規手段（L156・Git Bash rmdir 拒否補記 L163）が実在（実測・STEP-4 review で再確認）。手段 1 前提は「main 側不在時の一意決定」規定で被覆済み | 23/40（発生3・影響2・横3・反映4・自動2・再利用4・再発2・費用3） |
| dup-3 | RED 検証時の git stash 一時使用逸脱（1 件・Case #3928 Wave-10 #3954） | worktree-operations.md「git stash 運用手順（一時退避）」節（L306-339）に「worktree 検証で一時退避が必要な場合、git stash を使わない」（L314・detached worktree 代替を優先）・やむ得ない場合の規則（L332-339・stash@{N} 形式のシェル解釈注意含む）が明文化実在（実測・STEP-4 review で再確認）。適用範囲は「worktree での検証における」（L308・検証一般として書かれ RED 検証も含む）。エントリ自身が「逸脱として完了記録に明示記録・refs/stash 実在確認で元 stash 無傷を検証済み」と申告し恒久手順（禁止規定）の適用違反（逸脱記録済み）であって手順 gap なし | 15/40（発生1・影響1・横2・反映4・自動1・再利用3・再発1・費用2） |
| dup-4 | post-merge full integrity で pre-existing 検出（phase 系参照欠落・Case #3887）と「pre-merge targeted では full audit 系検出が観測されない・merge 直後 full integrity を case-close 標準工程へ組み込む」改善候補 | case-close SKILL.md の機械工程（L74）と close_mechanical_steps.ts（L9・full integrity suite の起動と結果集約の実装）に「merge 直後 full integrity」が既に実装済み実在（実測・STEP-4 review で再確認）。改善候補（merge 直後 full integrity を標準工程へ組み込む）は既に実現済みで残 gap なし。境界事例記録: schema の rejected 定義文言（「すでに別の対策で十分対応済み」）にも該当し得るが duplicate 定義にも合致し実質影響なし（両者 prune 対象・STEP-4 review で境界確認） | 15/40（発生1・影響2・横2・反映4・自動1・再利用2・再発1・費用2） |

### deferred（統合追記 14 クラス・既存エントリへの追記で維持）

| クラス | エントリ | 維持根拠（統合追記先・gap 分類） | 8軸 |
|---|---|---|---|
| Q2（3 件）配布物識別子直記 checker 検出（identity.ts REQ 識別子コメント intake_candidate・REQ-118 checker base 既出 concrete-id・Epic Wave クローズ 21 violations〔intake_candidate〕） | L4542（配布物 REQ ID 直記違反・参照は Design パス+節名へ一本化）へ統合追記。恒久是正（識別子コメント除去）の処置判断は intake 系統での分類確定対象（エントリ自身が intake 分離申告）・baseline 扱いは個別 PR で散発的に行わずまとまった docs 変更 Case で一括判断（既存学び継承） | 24/40 |
| Q3（2 件）LSP 診断の不応・タイムアウト → tsc --noEmit 正規化（worktree 内 lsp_diagnostics timeout・Windows worktree Deno LSP 診断不応） | L4947（LSP 診断の 3000ms timeout 時は tsc --noEmit が同等の静的検査）へ統合追記（STEP-4 review で同根先実在実測）。2 観察（case-close scripts × repo-agentdev-integrity scripts）で一般化（出現 3 件目相当）だが反映先（手順書明記）の恒久規定不在の実測未了のため deferred 継続（promote は実測 gap 前提） | 21/40 |
| Q4（2 件）worktree scripts typecheck は bun install --frozen-lockfile 前提（case-close scripts・repo-agentdev-integrity scripts〔再確認素材・統合集約要求申告あり〕） | L4369（node_modules 未伝播 worktree で tsc 型検査未解決）+ L4893（bun install lockfile 副作用）へ統合追記。**STEP-4 review で worktree-operations.md 全文（598 行）grep により --frozen-lockfile 文言不在を確定**（promote 判定の実測前置を今回で充足・次回 run で promote 判定可能）。本 run では deferred 維持 | 23/40 |
| Q6（3 件 + サブ 1）MSYS パス・環境変数解像差とネイティブプロセス（MSYS /tmp 仮想パス × bun fs 解釈差・git-bash TMPDIR/TEMP は os.tmpdir() に反映されない・MSYS clone 誤配置〔Case #3889 サブ〕） | L4606（Windows Git Bash /tmp リダイレクト先 ENOENT・STEP-4 review で実在実測）へ統合追記（MSYS 仮想パス × ネイティブプロセス実効値の解像差クラス 3 変異を同クラス統合。エントリ自身が統合判定を要求する申告を含む） | 23/40 |
| Q8（1 件）acceptance-checks autogen 再生成差分の実行順序（手動先行実行を commit せず script 実行 → restore 巻き戻し〔Case #3907〕） | L4637 近縁（acceptance-checks の AUTOGEN 再生成差分 warn 系）へ統合追記。「script 実行前の working tree クリーン前提（先行手動派生更新は commit 済みであること）」の実行順序規律を保持 | 18/40 |
| Q12（1 件）design-basis --adopted の root 相対解決（実行例不在・Case #3910） | L4084（CLI 引数契約の実行例不在で初回実行者が誤りやすい）へ統合追記（CLI 引数契約の解決基準明記クラス） | 19/40 |
| Q16（1 件）traceability sidecar 登録の inline 重複・表記ゆれ（Case #3887） | L3892（ADF-COVERS inline 宣言追加時の既存 sidecar 重複・処分判定 deferred 済み・STEP-4 review で実在実測）へ統合追記（duplicate-inconsistencies 機械突合・表記ゆれは機械検査でのみ発見〔同根申告あり〕） | 19/40 |
| Q17（1 件）DefinitionEdit 行区切り保全で行削除型操作が表現できず前段配置経路へ事前割当て（Case #3866） | L5125（DefinitionEdit の行構造事前確認・2 行編集回避構成・STEP-4 review で実在実測）へ統合追記（2 出現目）。**STEP-4 review で definition-pr-and-idempotency.md L25-84 に行削除型の前段配置事前割当て規定が不在と確定**（promote 判定の実測前置を今回で充足）。本 run では deferred 維持 | 25/40 |
| Q18（1 件）draft YAML plain-scalar コロン+空白でパーサエラー・生成直後 safe_load 検証前置（Case #3887・修正済み commit 87621f165） | L3979 近縁（Bun.YAML 解析系・frontmatter 複数行 plain scalar 解析失敗）へ統合追記（draft 生成・解析の YAML 危険性クラス）。修正済み・1 出現のため deferred 維持（Jev 既存対策の更新 0.40 に対し semantic_disagreement 記録） | 22/40 |
| Q29（1 件）close full suite 機械受理の baseline 再現確認構成（手動 3 分割 → detached worktree baseline 1 回全対象実行 → 機械突合 2 段構成〔Case #3902〕） | L4800 近縁（baseline 既存 fail 存在下の対照救済・由来分類）へ統合追記（baseline 再現確認の構成技法クラス。「fail 対象単独実行と全対象実行の組み合わせで 1 回ずつ実行すれば被覆できる・手動予備実行は失敗由来分類の正当理由に該当」を保持） | 23/40 |
| Q32（1 件）Wave 先行 merge 後の後続レイヤー fixture 再適合（Case #3928 Wave-2・PR #3936 Level 1 rebase） | L2181 実測（同一 Wave 並列 Issue 間の fixture・API 依存〔report 初版の L2143 参照は行番号ずれ・STEP-1 で訂正〕）へ統合追記（並行 Wave の fixture 適合クラス。「Level 1 rebase 手順に fixture の統合後契約適合 → suite 再実行を組込むのが正・競合ゼロのファイルでも fixture 由来の fail は起こり得る」を保持） | 22/40 |
| Q34（1 件）REQ-018-008(b) worktree root 相対文言と実装 mainRepoRoot 基準の解釈差（Case #3928 Wave-6・既存契約維持申告） | L3325 近縁（REQ スキーマ文言と実装の解釈分岐）へ統合追記（REQ 文言と実装基準の解釈差クラス。「文言側の基準明確化（mainRepoRoot 基準を正と明記）または実装側の worktreeRoot 受理」を将来の整合候補として保持） | 19/40 |
| Q39（1 件）配布依存境界 gate の scan 対象集合変動（親側証跡と close 側再実行の判定分岐・Case #3928 Wave-2） | L5027（scan 集合が実行 cwd で変動し worktree 事前 gate が検出漏れ・STEP-4 review で実在実測）へ統合追記（同根。「pre-recorded 証跡の採用前には gate の scan 対象集合（files 数）と検出件数の両方を記録・突合し、検出の変更起因性を独立確認する・worktree の junction 伝播は scan 集合を縮小させ得る」を追加） | 22/40 |
| Q48（1 件）ADF-COVERS inline 宣言の ID 列挙かっこ付き説明黙示切断（Case #3928・coverage --req 単行実測で原因特定・独立行宣言回避） | L3892（ADF-COVERS inline 宣言管理）へ統合追記。sidecar-and-policy.md「inline 宣言行の記述形式（ID 列挙のみ）」節（L84-89）が恒久規定として既存で、失敗モード（かっこ付き説明の後の ID 連結は黙示切断され malformed には検出されず missing-design だけが現れる）の記載は不在〔STEP-4 review で不在を確定〕（出現 1 件・失敗モード注記の残余は deferred で保持） | 25/40 |

### deferred（新規移動 22 クラス・living pool で維持）

| クラス | エントリ | 維持根拠 | 8軸 |
|---|---|---|---|
| Q7（3 件）measurement-convergence の REQ frontmatter 収束欠落（REQ 報告形式非対応で script fail〔Case #3910〕・収束対象が Design のみ〔Case #3909・手動 contingency で対応済み〕・targeted では (b) 発火せず case-ready 再実測が最後の検出点〔Case #3928〕） | script gap は intake item（.agentdev/intake/promoted/2026-11-04-prepare-definition-pr-freshness-path-extraction.md 実在・**分類確定済み（backlog-review 待ち）・Split Rule により learning 側と分割済み**〔item 自身が「同一観測の再発防止知見は learning 線に記録済み・本 item は intake 側の修正候補のみを扱う」と申告・STEP-4 review で実測・report 初版の「処置中」表現を訂正〕）で処置済み。learning 側での promote は intake と二重になる（重複回避）。恒久規定（definition-pr-and-idempotency.md 計測日収束節〔実測・script 内 step 機械化済み〕）への変異（REQ 収束対象外）の追記は script 契約変更（実現先選択）を伴い learning-promote は先取り禁止。次回再評価対象として新規移動 | 28/40 |
| Q9（1 件）並行 case-open 下の measurement-convergence 補正 commit が宣言外ファイル（他 Case 対象）を含む（Case #3910・契約どおり動作・親判断は case-auto decision_context 委譲申告） | 出現 1 件・script 契約変更候補（補正対象報告への区分追加・宣言外パス補正の別 commit 分離）を保持・親判断委譲申告あり | 16/40 |
| Q10（1 件）draft wave_hints の宣言追随時期記述が design/implementation 役割の適用時期を区別せず missing-design 0 件ゲートと矛盾（Case #3910・契約優先適用で対応済み） | 出現 1 件・req-define 側の case_open_hints 記述ガイダンス候補を保持 | 19/40 |
| Q11（1 件）coverage 契約の role 語彙に requirement 役割がなく REQ 工程成果物自身の covers 表現が自明でない（Case #3910・検証は仮表現で対応済み・契約拡張は対象範囲外申告） | 出現 1 件・契約拡張（requirement 役割追加）検討候補を保持 | 16/40 |
| Q13（1 件）pin 期待文言テストの文言期待が対象文書更新と非同期で pre-existing fail 滞留（Case #3918 T6・REQ-110-041 系滞留と同型計上） | 出現 1 件・pin 期待文言の同期運用候補（追随更新か期待再確認の記録）を保持 | 19/40 |
| Q14（3 件 + 見出し帰属 2 サブ）traceability check のスコープ別実行と corpus 全件診断の乖離（REQ-118 全件 missing 系 base 既出・Case #3900 スコープ限定実行では findings に現れない・フルスコープ既存構造検出 14+16 件） | 3 変異を同クラス（traceability check の実行スコープと検出の関係）統合。「対象行完備確認を先に機械確定してから corpus 分を診断指標として扱う」運用規律を保持（REQ-118 棚卸しは Epic close で実施済み申告あり） | 24/40 |
| Q20（1 件）PR 本文作成時の実行基盤不一致署名混入（Tool 側自動付与疑い・本文更新で是正済み〔Case #3928〕） | 出現 1 件・初回読み戻し確認の運用知見を保持 | 21/40 |
| Q21（1 件）install.ps1 LocalMode 検証には consumer レイアウト変換が必要（Case #3889・exit 1 実測・consumer 変換で解消済み） | 出現 1 件・環境構築手順知見を保持（導入手順書明記候補） | 17/40 |
| Q22（1 件・見出し帰属）gh-write guard が説明文中の WRITE コマンド名も検出しコマンド全体をブロック（Case #3889・隣接リテラル分割で解消・heredoc ではファイル作成自体も不成立） | 出現 1 件・guard 挙動（fail-closed の正当動作）と回避構成の運用知見を保持 | 18/40 |
| Q23（Case #3889 サブ分離 1 件）edit tool は workspace 外パスで fail-closed（AGENTS.md write と同じ境界・bash（quoted heredoc）で代替） | 出現 1 件・ツール境界知見を保持（windows-powershell-bulk-io-corruption.md 系の標準手段知識への接続候補） | 17/40 |
| Q24（1 件・見出し帰属）完了記録確定前の観測鮮度照合（parked 時点スナップショットで誤完了 → 訂正記録〔Case #3890〕） | 出現 1 件・case-close STEP-2 QG-4 の判定根拠照合項目（観測鮮度照合）への反映候補を保持。**STEP-4 review で case-close SKILL.md に観測鮮度照合項目が不在と確定**（promote 判定の実測前置を今回で充足）。本 run では deferred 維持 | 26/40 |
| Q25（Case #3890 サブ分離 1 件）Root Case 起票前提の契約状態記録は起票前に commit（jev 観測前置 commit 順序逸脱・Case #3890） | 出現 1 件・case-open 起票前置確認への反映候補を保持 | 20/40 |
| Q26（Case #3890 サブ分離 1 件）委譲指示による実行構造逸脱（single-Standard case へ子 Issue 作成）は逸脱として明示記録（Case #3890・逸脱明示の記録規律不足申告） | 出現 1 件・case-ready（実行構造確定時の逸脱明示）反映候補・記録規律を保持 | 17/40 |
| Q27（Case #3890 サブ分離 1 件）隔離試験 fixture 中立性検査にディレクトリ名等の環境識別子を含める（試験文脈示唆名称からの文脈推論観測〔Case #3890・後続 fixture で中立名称変更済み〕） | 出現 1 件・検証環境構築手順（中立性検査項目・trace reasoning 文脈推論確認）への反映候補を保持 | 21/40 |
| Q28（1 件）隔離検証セッション実行側の中間メッセージ中国語出力観測（Epic #3909 TS-606・機能影響なし・発生要因未特定） | 出現 1 件・言語規律の隔離環境適用と観測項目化候補を保持 | 17/40 |
| Q31（1 件）fail-first 申告が module-absence 失敗だった場合の mutation-based RED 感度検証補完（Case #3928・バイト等価復元（sha256 一致・porcelain 空）確認含む） | 出現 1 件（同一手法前例を含むと 2 件相当）・検証技法（境界無効化 → assertion RED 観測 → バイト等価復元 → 再 GREEN）として保持（fail-first 規約への明記候補・規約本文の現行文言確認は未実施のため promote 判定せず） | 22/40 |
| Q35（2 件）bun 標準 API は実動確認で根拠確定（fs.rmSync maxRetries/retryDelay 無視〔bun 1.3.6 実測・bounded retry 自前実装で解決済み〕・bun test で process.on("exit") が正常終了でも発火せず〔bun:test afterAll 移行で解決済み〕） | 2 変異を同クラス（bun 標準仕様どおりの挙動を仮定せず実動確認で根拠を確定・「オプションを渡した」と「実際に起こった」を分けて実測）統合。出現 2 件・恒久規律の明記先（knowledge 文書候補）は未確定のため deferred | 22/40 |
| Q38（2 件）機械工程の起動経路と twin 検出（detached 起動（nohup）の重複実行が構造的に twin 検出を再現（m1297/m1320 実測）・m1334 native spawn 単一起動で twin launcher 病理解消・残る拒否は監督側シェル（識別子含有の範囲内導出・fail-closed 正当動作）） | 2 変異を同クラス（機械工程の起動機構衛生が機械受理の前提）統合。「機械工程の起動は (i) 起動直後の重複実行検出と (ii) 解消されない場合の起動経路変更（同期実行・単一 submission 保証付き経路）を前提に設計する」規律を保持。**STEP-4 review で worktree-operations.md 全文・case-close skill 全体に重複実行・twin・起動直後検出の規定が不在と確定**（出現 2 件・8軸 27/40・promote 判定の実測前置を今回で充足・次回 run で P 化候補）。本 run では deferred 維持 | 27/40 |
| Q40（1 件）台帳ヘルパー worktree 実行は --main-repo-root 明示が必須（未指定で worktree-context 独立解決によりメイン台帳へ登録〔Case #3928 Wave-1・smoke 後片付け済み〕） | 出現 1 件・「台帳を扱う試験・smoke の手順書にはこの区別を明記すべき」改善候補を保持（intake item（worktree tmp 前提）は別事象（req-id-roundtrip ENOENT・promoted/ 配下に分類確定済み）と区別実測済み） | 20/40 |
| Q41（1 件）case-open STEP-4 の gate 誤接続（GateCommandSpec 存在・引数検証のみで gate の意味適合を確認せず check_changed_docs を full check_integrity 役割に誤接続〔Case #3902・固定生成は後に実装済み〕） | 出現 1 件・「gate 設定前に正規 checker の CLI 契約を確認し script 内 gate の名前と実行実体を evidence で照合する」規律を保持（固定生成で構造的に解消済み申告あり・再発条件で保持） | 22/40 |
| Q43（1 件）台帳 fixture の契約外 kind で ledger read fail → 観測系検出が全て実行されない（検出ゼロ合格根拠前に positive control 確認〔Case #3928 Wave-9・許容 kind で修正済み〕） | 出現 1 件・「検出ゼロを合格根拠に使う前に観測系が実際に実行された根拠（positive control の検出）を確認する」規律を保持 | 21/40 |
| P-b（STEP-4 是正で promote から変更・2 件）大容量 Issue 本文部分更新の機械的照合規律 | 詳細は本レポート「P-b（STEP-4 review 是正）」節（issue-operation-safety.md 既存規律で大部分被覆・残 gap は送信前機械照合と残存検査範囲拡大） | 30/40 |

（Q7・Q23〜Q27 等: inbox 見出し内の複数学びのサブ分離（Q6 追記 1・Q23 1・Q25〜Q27 3）は対応クラスの統合追記先・新規エントリへ内容反映）

### rejected（0 クラス）

- 本 run の rejected なし（全 67 見出しが promote 1 / duplicate 4 / deferred 36 クラスのいずれかに帰属・STEP-4 review で reject/duplicate 境界事例（dup-4）を確認済み）

## Decision 候補除外記録

- **対象 item**: P-a〜P-b・Q 系統全 41 クラス
- **除外理由**: 技術判断不在 / 運用ルール / command 仕様
- **根拠事実**: 全単位が運用・検証・手順・記録様式・環境障害対応・文言整合の知見であり、アーキテクチャ上の決定、技術選定、設計判断の新規確定を含まない
- **代替反映先候補**: REQ/Design/配布 skill references/guide/knowledge（promote 1 クラスの反映先候補は採用済み成果物参照）

## STEP-4 adversarial-review

- 発動判定: **発動**（Jev boolean true〔0.95〕・観測 20261107T073721Z-ec2e・LLM 最終判断は発動で一致・inbox 67 件で skip 条件〔空・1 件のみで重複確実〕非該当・evaluation-report 反映済み・不可逆処理（deferred 移動・prune・commit/push・promoted 生成）未実行を実測で確認〔promoted/ 空・inbox 未クリア・deferred 未追記・未 commit〕）
- review 構成: 独立 challenge stream 2 本（explore サブエージェント・相互の finding を非公開で並行実行）。Stream A = promote 暫定系（P-a・P-b）の処分判断の反証（6m13s）。Stream B = duplicate/deferred 系（39 クラス）の反証と分類境界検証（9m10s）
- orchestrator（Reviewee）反証・受理結果:
  - **A1（受理・P-b・重大）**: promote 前提が既存対策照合漏れ — issue-operation-safety.md（最終更新 2026-10-15・commit 23ae4277c・事故前実在）に「更新前スナップショット必須禁止（L290）」「前後内容比較（L182-193）」「全文置換モデルと最小差分手順（スナップショット・対象セクション明示・state 突合・fix-and-reverify・L195-218）」「Epic 実行構成表更新手順（L161-180）」「payload 正規配置（L232）」「中断・担当交代再開（L248-251）」実在（grep・git log 実測）。P-b の中核規律は既存対策で被覆済み。→ **P-b を promote から deferred 新規移動へ変更**（残 gap〔送信前機械照合・残存検査範囲拡大〕のみ保持・8軸 32→30 修正・dup-1 の custom-tool-contracts.md 限定の照合範囲を本レポート判定基準に明文化）
  - **A2（受理・P-b・軽微）**: 8軸 32/40 は前提崩れで過大（横5・反映4・再発4 が規律不在に依存）→ **8軸を 30/40 へ修正**
  - **A3（受理・記載訂正）**: intake item 記載 — 実態は promoted/ 配下 4 件（inbox 空・commit 121521f9d で移動済み・4 件いずれも P-a の文言整合を所有せず二重処置判定は変わらず）→ Q7・Q40 の intake 表現を訂正
  - **A4（受理しない・P-a）**: Stream A が PROMOTE_OK 判定（SKILL.md L94 旧文言現存・Design 正本 L50①/L51 新基準・追随修正なし・stale なし・二重処置なし・8軸妥当圏内）→ **P-a promote 維持**
  - **B1（受理・dup-1）**: 様式 2 件（ledger-final:v1・evidence:v1）の恒久文書様式不在（scripts 実装定数のみ）と templates Design 反映候補未消化を残余として受理。dup-1 は duplicate 維持（様式運用は scripts 機械生成で成立・Epic close で判断材料消費済み）だが処分根拠へ残余を明記（次回再評価対象）。→ **dup-1 根拠へ残余記録を追加**
  - **B2（受理・dup-1）**: 根拠文言の所在指定不正確（「報告 JSON stdout/stderr 全文保存」は SKILL.md には不在・実在は case-close Design gate 証跡保持要件）→ **dup-1 根拠文言を訂正**（duplicate 判定結論自体は他根拠で成立）
  - **B3（受理・Q4/Q17/Q24/Q38/Q48）**: gap 不在の grep 実測確定（frozen-lockfile 不在・行削除型前段配置規定不在・観測鮮度照合項目不在〔SKILL.md〕・起動衛生規律不在・失敗モード注記不在）→ **該当クラス行へ gap 確定記録を追加**（処分は deferred 維持・promote への切替は STEP-2/3 の実測前置（反映先候補の現行文言確認・gap 分類・8軸前提の再評価）を伴うため本 run では実施せず次回 run の P 化候補として記録）
  - **B4（受理・Q7・軽微）**: intake item は promoted/ 配下（分類確定済み・Split Rule 分割済み申告あり）で「処置中」表現は実状態とズレる → **Q7 表現を訂正**
  - **B5（受理しない・reject 0 件）**: dup-4 は rejected/duplicate 境界事例だが duplicate 定義にも合致し実質影響なし（両者 prune 対象）→ **reject 0 件妥当として維持**（境界事例記録を dup-4 根拠へ追加）
- 反映後の再判定: STEP-2 戻り → 8軸再評価（P-b のみ・横展開 5→4・費用 5→4 修正・32→30/40）と処分区分再判定（P-b promote → deferred）。昇華可能性の最終: P-a true・P-b false（既存対策重複のため）・review 発動条件の再判定は不発動
- 戻しループ離脱: accepted finding の反映は実測済み根拠の機械的反映（文言訂正・処分変更〔promote → deferred は判定の弱化であり新規 promote を作らない〕）であり新たに未検証の争点を導入しないため、再 review は発動せず後続の意味評価と観測記録も生成せずに停止条件を満たしてループを離脱した
- unresolved: なし

## STEP-5 自律確定記録

- 自律確定: 41 クラスすべて自律確定（ユーザー承認なし）。promote 1 クラス（P-a）は既存恒久手順の具体的 gap を実測（SKILL.md L94 現行文言・Design 正本 L50①/L51・intake promoted 4 件・並行 commit 121521f9d の実測・STEP-4 review 両 stream 検証）で確認した既存対策の更新であり、正規契約と実測からの導出で一意に確定。duplicate 4 クラス 23 見出しは恒久手順・恒久規律・知識文書・機械検査による被覆を実測で確認（うち dup-1 は STEP-4 finding の受理で根拠文言訂正・残余記録追加）。deferred 36 クラスは出現回数・既存対策照合結果・promote 基準（実測 gap 前置）該当性の実測で確認（P-b は STEP-4 review の反証受理で promote から deferred へ変更・残 gap を記録）
- HITL 不要の理由（人間判断への引き上げ条件との照合）: (1) ユーザー固有の目的・価値観・優先順位の新規確定を要する事項なし。(2) 正規情報源間の未解決規範矛盾なし（STEP-4 で P-b 既存対策照合漏れ・dup-1 根拠所在が実測で解決済み）。(3) 対論型レビューの本質的争点は相互反証と実測検証ですべて解決済み（P-a は PROMOTE_OK・P-b は重大 finding 受理で是正・unresolved なし）。(4) 要件・仕様の対象範囲、外部契約、受け入れ条件、恒久規範の新規決定なし〔promote 1 クラスは backlog-review/req-define 向けの提案ステージに限り、実現先の確定・恒久規範の確定は行わない〕。(5) 既存の明示的な安全境界が要求する操作の承認なし〔inbox クリアは正規の deferred 移動原子的操作プロシージャであり、prune は本 run 移動分の promote 時 prune で STEP-5 の判定確定と同時に承認済み。「inbox.md 全体強制クリア・大量エントリ一括削除」には該当しない。既存 pool への追加 prune は実施しない保守方針〕
- 判定の変更指示: なし（本 run は HITL 質問を発生させず STEP-6 へ進む）
- 破壊的変更: なし（既存 pool 271 件への追加 prune は実施しない。deferred 移動は原子的操作プロシージャの機械実行規律〔メモリ完結・全検証・一括書込〕に従い、統合追記 19 箇所〔15 種類の追記文・Q4 は 2 箇所・Q16/Q48 は同一先へ別々の追記〕・新規移動 24 見出し・inbox クリアを検証付きで実施。既存エントリの書換えは行っていない）

## STEP-6 実行記録

- **promoted 1 件**（existing-measure-update-case-run-adapter-skill-wording-alignment.md〔P-a〕）を新規生成（UTF-8 BOM なし・LF）
- **deferred 移動（原子的操作・メモリ完結＋全検証＋一括書込）**: 統合追記 19 箇所（Q2〔配布物 REQ ID 直記先・3 ブロック分〕・Q3〔LSP timeout 先・2 ブロック分〕・Q4〔node_modules 未伝播 tsc 先 + bun install lockfile 副作用先・各 1〕・Q6〔Git Bash /tmp ENOENT 先・2 ブロック分 + Case #3889 サブ知見〕・Q8〔acceptance-checks AUTOGEN 差分先〕・Q12〔CLI 引数契約先〕・Q16〔ADF-COVERS inline 重複先〕・Q17〔DefinitionEdit 2 行編集先〕・Q18〔Bun.YAML 解析系先〕・Q29〔baseline 対照先〕・Q32〔同一 Wave fixture 依存先〕・Q34〔REQ スキーマ解釈分岐先〕・Q39〔scan 集合変動先〕・Q48〔ADF-COVERS inline 重複先・Q16 と同一先へ別追記〕）+ 新規移動 24 見出し（Q7×3・Q9・Q10・Q11・Q13・Q14×2〔Case #3900 を含む〕・Q20・Q21・Q22・Q24・Q31・Q35×2・Q38×2・Q40・Q41・Q43・P-b×2・移動日 2026-11-07）+ inbox クリアを実施し読戻し検証済み（deferred 見出し 299〔275+24〕・統合追記マーカー 19・移動日 2026-11-07 ×24・inbox ヘッダーのみ・prune 対象 24 見出しのタイトルは deferred に不存在実測・検証失敗時 fail-closed で書込なし〔1 回の期待値誤り〔マーカー 15/19〕を検証が捕捉・修正後に全検証合格〕）
- **prune（promote 時）**: 24 見出し（promote 1〔P-a・採用済み成果物の「元learning item / 根拠」セクションへ証拠保存〕+ duplicate 23〔dup-1 18・dup-2 3・dup-3 1・dup-4 1・本レポートに根拠保存〕）。rejected 0。統合追記分 19 見出しは deferred へ追記せず統合先へ証拠保存。inbox から除去
- **実行証跡**: 既存対策の実測 — case-run-execution-adapter SKILL.md L94（P-a gap 現存）・verification-resource-lifecycle.md L50/L51（P-a 正本文言）・issue-operation-safety.md L161-251/L290（P-b 既存規律）・custom-tool-contracts.md L36/L50/L52/L120・specs-issue.ts L388-418（P-b gap 実測）・worktree-operations.md L138-179/L306-339/全文 frozen-lockfile 不在（dup-2/dup-3/Q4）・case-close SKILL.md L74/L94-107/L109（dup-1/dup-4/Q24）・close_mechanical_steps.ts L9（dup-4）・sidecar-and-policy.md L84-89（Q48）・definition-pr-and-idempotency.md L39-61・L25-84 行削除型規定不在（Q17）・deferred 同根候補本文読込 12 箇所・intake promoted 4 件読込（Q7/Q40・P-a 二重処置確認）・git show 121521f9d（SKILL.md 未変更確認）
- **git 永続化**: 対象 .agentdev/learning/ のみ（明示パス指定・並列実行安全ステージング）。commit hash は完了報告参照
- **一時ファイル**: .agentdev/tmp/lp-report-20261107.md・lp-report-final-20261107.md・lp-deferred-move.mjs は適用検証後に削除

## 全体傾向

- **昇華価値の中心**: P-a（28/40・SKILL 文言追随漏れの fix gap・実測確認・PROMOTE_OK）。P-b は STEP-4 review で promote から deferred へ是正（既存規律 issue-operation-safety.md が事故前から実在・promote 根拠の照合漏れを反証で検出）した点が本 run の最大の是正事象
- **adversarial-review の効用**: promote 暫定 2 クラスのうち 1 クラス（P-b）の既存対策照合漏れを実測で是正し、不当な promote を未然に防止。8軸の過大評価（32→30）を修正。dup-1 の根拠文言所在を訂正し、様式 2 件の恒久文書様式不在（残余）を次回再評価対象として記録。Q4/Q17/Q24/Q38/Q48 の gap 不在を実測確定し次回 promote 判定の実測前置を完了。P-a は両 stream 通過で promote 維持
- **恒久被覆による重複**: Case #3928 Wave クローズ design 候補群（dup-1 18 件）は恒久 Design・SKILL・実装に集中的に被覆。worktree 環境系（dup-2/dup-3）は worktree-operations.md の整備手段選択基準節・stash 運用手順節に被覆。本文更新規律（P-b・review 是正後）は issue-operation-safety.md に事故前から被覆
- **保持型**: 出現 1〜3 件の検証経路・環境障害知見・記録規律知見（Q7〜Q43）は deferred で保持。STEP-4 review で gap 不在が実測確定した高スコア 5 クラス（Q4 23・Q17 25・Q24 26・Q38 27・Q48 25）は次回 run の promote 判定候補として記録
- **全体的な観察所見**: 本 batch は Case #3928（Epic 最終 close 含む）由来が中心で、Wave クローズ記録の design 候補群は恒久文書反映済みで duplicate に収斂。inbox 申告と恒久契約の乖離確認の重要性が再確認された（P-b の「規律不在」申告は issue-operation-safety.md の既存規律を見落とした照合漏れ・P-a の旧文言現存は申告どおり実測確認）。既存対策照合は恒久契約に限らず配布 reference・docs/knowledge/ を機械 grep で必須適用すべき（本基準を判定基準へ明文化・次回 run 以降適用）。本 run の Jev observation_write 失敗（8軸 finalResult 未追記・3 形式 invalid_input）は fail-open 契約どおり warning として報告
