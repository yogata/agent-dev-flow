# 評価レポート（learning-promote STEP-1〜STEP-3）

- **実行日時**: 2026-09-27（backlog-auto stage 2 learning lane）
- **対象エントリ数**: 12件（inbox: 12件、deferred: 候補本文読込 29件／同類判定 6件）
- **問題クラス数**: 4クラス + 未分類 6件
- **正規化**: 全 12 エントリが新13フィールド形式で完好。旧フォーマット正規化・パース失敗ともに 0 件
- **deferred.md 読込方式**: インデックススキャン（`^## ` 見出し 131 行・タグ行抽出）→ 候補選択（タグ一致／見出しトークン一致／直近20エントリ規則）→ 候補本文のみ読込。全面読みフォールバック 0 件
- **処分判定内訳**: 昇華（staged）9クラスタ／11エントリ（既存対策の更新 6クラスタ／7エントリ、project knowledge 3クラスタ／4エントリ）、duplicate 1エントリ（E5）、rejected／新規 deferred 0件
- **禁止条件フィルタリングゲート**: 全 12 エントリが Decision 候補除外（運用ルール・手順・仕様遵守・検証手順に該当。技術選定・アーキテクチャ判断を含まない）。Decision 候補 0 件
- **自律確定**: 12/12 エントリが自律確定可能（HITL 必須項目 0）

## 問題クラス一覧（8軸評価はクラス単位）

### CL-1: agentdev_gh pr_create は head branch が remote に存在しないと HTTP 422（push 前段手順の未明示）— 27/40

- 根本原因: pr_create は GitHub 側に head branch が存在しないと PR 作成不能。branch の新規作成と push（push 先の正確性を含む）は呼出側の前段操作であるが、配布 workflow reference にその前段手順が未記載
- 再発条件: branch を新規作成した直後に push 前段なし（または push 先誤指定）で pr_create を呼出した場合
- 予防策: case-open / case-revise の reference へ「pr_create 前に head branch を origin へ push する（refspec 検査込み）」前段手順の明記
- メンバ: E1（inbox）+ deferred「case-open が Definition 変更を main へ直接 push し Draft Definition PR を作成不能にした」（移動日 2026-09-16。誤指定経路で同一結果 422）
- 既存対策照合: `agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` に pr_create 手順はあるが push 前段の記述なし（grep 検証済み）→ fix gap
- 8軸: 発生2/影響2/横展開4/反映先4/自動化3/再利用4/再発4/費用対効果4 = **27/40**
- 推奨処分案: 5 既存対策の更新（fix gap）。成果物 `update-pr-create-head-branch-push-precheck.md`

### CL-2: 配布物本文への concrete ID 直書きによる配布境界 checker 新規 hit（節名参照・sidecar 宣言が正規手段）— 29/40

- 根本原因: 配布物（src/opencode 配下）本文に REQ 行 ID・CR 番号等の concrete ID を直書きすると concrete-id ルールが新規 hit として計上する。参照導線・規律展開は ID を本文に必要としない
- 再発条件: 配布物本文へ concrete ID を含む canonical 参照文言を追記した場合
- 予防策: 本文は機能的記述・節名参照のみとし、対応関係は traceability sidecar 宣言で記録。実装委譲時の指示規約へ事前明示
- メンバ: E3（Case #3144）+ E7（Case #3145）+ deferred「配布物の不在ID参照残骸は概念名参照へ置換する」（移動日 2026-09-03）
- 既存対策照合: `docs/knowledge/distribution-concrete-id-placement.md`（updated 2026-09-20）が中核知識を保有するが、知識存在下の同一バッチ2回発生（E3・E7 は知識文書更新後に違反）→ application miss（委譲指示規約〔agentdev-case-run-execution-adapter references〕への組込みなし）
- 8軸: 発生3/影響3/横展開4/反映先4/自動化3/再利用4/再発4/費用対効果4 = **29/40**
- 推奨処分案: 5 既存対策の更新（application miss）。成果物 `update-distribution-concrete-id-delegation-briefing.md`（E3+E7 統合）

### CL-3: write guard の project root 固定によるワークスペース外書込み fail-closed と一時ファイル配置の標準手段 — 29/40

- 根本原因: guard の書込み範囲制御は project root を境界とし、承認済み一時ディレクトリも含む外部パスを一律 fail-closed ブロックする（設計どおり。guard と環境側一時許可の粒度差）
- 再発条件: guard 有効環境でワークスペース外へ一時ファイル・スクリプトを書込んだ場合
- 予防策: 一時ファイルは project root 内（`.agentdev/integrity/reports/` 等の gitignore 領域）へ配置。書込みは標準手段（node writeFileSync 等）。大規模編集は node スクリプトファイル経由
- メンバ: E6（inbox）+ deferred 3件（「ハーネス Write ツールのリポジトリ外 temp 書き込み…」2026-08-15、「証跡退避先・一時作業先の OS 一時ディレクトリも textlint guard の…」2026-09-19、「write tool の guard は承認済み temp dir 含む…」2026-09-20）
- 既存対策照合: AGENTS.md 書込み guard 運用指針 + `agentdev-workflow-case-open/scripts/README.md`「検査入力 JSON の置き場所指針」（RU-0131 実施済み）が存在。ギャップ: 置き場所の具体候補（`.agentdev/integrity/reports/`）明示、worktree-operations.md「書込み guard 運用指針」節への標準手段集約が未実施 → fix gap
- 8軸: 発生3/影響2/横展開4/反映先4/自動化3/再利用4/再発5/費用対効果4 = **29/40**
- 推奨処分案: 5 既存対策の更新（fix gap）。成果物 `update-write-guard-temp-file-placement-standard.md`
- review F-4a 反映: deferred L2402 の明示保持知識「node -e + PowerShell 単一引用符ヒアドキュメントによる大規模編集技法」（L2419 処分判定が明記）は、本成果物または CL-4 知識文書のいずれかに明記して相互参照するまで prune しない（worktree 内配置が阻塞される状況の代替実行形式であり CL-4 知識〔Git Bash inline は破損〕と補完関係。「shell inline 一律禁止」への過剰一般化を防ぐ）

### CL-4: Windows Git Bash 経由の inline・heredoc コンテンツ伝達破損（escape 解釈・長文日本語打ち切り）— 28/40

- 根本原因: Windows 環境の bash ラッパー経由でコード（正規表現のバックスラッシュ）や長大な日本語コンテンツを shell 引数・heredoc で機械伝達すると、shell 解釈層（escape 解釈／stdin 伝達）で内容が変質・欠落する
- 再発条件: bash から `node -e` 等へバックスラッシュ含む正規表現を inline 記述した場合／bash heredoc で日本語含む長大ファイル内容を書き出した場合
- 予防策: 該当コンテンツは shell 経由をやめ、project root 内の一時ファイル経由（Write ツール→copyFileSync、または一時スクリプトファイル実行・検査後削除）を標準手段とする
- メンバ: E8 + E11（同一バッチ、想定反映先も worktree-operations.md「書込み guard 運用指針」節で同一）
- グルーピング根拠: 機構の差（引数 escape 解釈 vs heredoc stdin 打ち切り）はあるが、本質的原因（Windows bash 経由のコンテンツ伝達層での変質）・予防策（ファイルベース伝達）が同一。分割しても処分は不変（両方 project knowledge）
- 既存対策照合: `docs/knowledge/windows-powershell-bulk-io-corruption.md`（PowerShell ファイル I/O）・`powershell-console-stdout-crlf-bash-pipe.md`（PS→bash パイプ CRLF）は未カバー。worktree-operations.md に heredoc・一時スクリプトの知識なし（grep 検証済み）→ なし（fix gap 相当の新規知識）
- 8軸: 発生2/影響3/横展開4/反映先4/自動化3/再利用4/再発4/費用対効果4 = **28/40**
- 推奨処分案: 4 project knowledge。成果物 `knowledge-windows-git-bash-inline-content-corruption.md`（docs/knowledge/ 知識文書候補。backlog-review 利用者承認後に直接保存）
- review F-1 反映（限定条件）: 成果物は2機構（argv escape 解釈による文字列変質／heredoc stdin の中途打ち切り）を別個の検知方法・再発条件として記録する（検知方法が異なるため統合記述で潰さない）

### 未分類（単独エントリ）: E2・E4・E5・E9・E10・E12

いずれも deferred 候補突合により同類既存エントリなしを確認（関連だが根本原因が異なる隣接エントリは各エントリ評価参照）。

## 各エントリ評価

| # | エントリ（短縮） | クラス | 8軸 | 処分区分 | 自律確定 | 成果物ファイル名候補 |
|---|---|---|---|---|---|---|
| E1 | pr_create 422 head branch 未 push | CL-1 | 27/40 | 5 既存対策の更新 | 可 | update-pr-create-head-branch-push-precheck.md |
| E2 | check_integrity --json stdout 混入 | 未分類 | 25/40 | 5 既存対策の更新（事実修正付き） | 可 | update-checker-json-stdout-capture-discipline.md |
| E3 | canonical 参照は節名のみ | CL-2 | 29/40 | 5 既存対策の更新 | 可 | update-distribution-concrete-id-delegation-briefing.md（E7 と統合） |
| E4 | bun ./ prefix + junction | 未分類 | 26/40 | 5 既存対策の更新 | 可 | update-worktree-bun-execution-form-junction.md |
| E5 | issue_list labels 0 件 | 未分類 | 20/40 | duplicate | 可 | （なし。prune 対象） |
| E6 | write guard fail-closed | CL-3 | 29/40 | 5 既存対策の更新 | 可 | update-write-guard-temp-file-placement-standard.md |
| E7 | sidecar 宣言パターン | CL-2 | 29/40 | 5 既存対策の更新 | 可 | （E3 と統合） |
| E8 | node -e regex escape 破損 | CL-4 | 28/40 | 4 project knowledge | 可 | knowledge-windows-git-bash-inline-content-corruption.md（E11 と統合） |
| E9 | guard vs knowledge README 担当 | 未分類 | 26/40 | 5 既存対策の更新 | 可 | update-knowledge-readme-verification-routing.md |
| E10 | 本文検証 filesystem truth | 未分類 | 28/40 | 4 project knowledge | 可 | knowledge-llm-body-verification-filesystem-truth.md |
| E11 | bash heredoc 打ち切り | CL-4 | 28/40 | 4 project knowledge | 可 | （E8 と統合） |
| E12 | delta baseline pre-existing 分類 | 未分類 | 26/40 | 4 project knowledge | 可 | knowledge-qg4-pre-existing-baseline-reproduction.md |

### エントリ別補足

- **E1**: deferred 候補 L1775（invalid-input リトライ: 別機構）・L2027（422=既存 PR シグナル: 別機構）・L2047（同類）を読込。ギャップ（reference 未記載）と同類再発が取得可能根拠から一意。
- **E2（重要な事実修正・コード実証）**: 現行 `check_integrity.ts` は `console.error`（stderr）で "Report written to:" を出力（L11352。git 履歴上 #611 以降不変、観測日時点でも同コード）。entry の根本原因記述（checker が stdout へ連結出力）は現行実装と不整合。混入は呼出側の stdout/stderr 統合キャプチャが最有力説明（実証なし）。既存知識文書 `docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md` に当該 variant（メッセージ連結による JSON.parse 失敗）と「stdout 単独キャプチャ規律」が未記載のため fix gap。promoted 内容は修正版（stdout 単独キャプチャ規律）とし、元 entry の checker 側原因記述を残さないこと。
- **E4**: REQ-060・`docs/knowledge/bun-test-execution-form-drift-signals.md`・checker 実行契約 Design は bun test 中心。checker スクリプト実行への `./` prefix 適用と junction projection 挙動（checker 本体は projection 側解決・テストは worktree 実ファイルを読む）が未記載。harness-delegation.md に実行形式の明示なし。
- **E5**: REQ-092-002（labels 引数は物理マッピング入力専用・0 件帰着の明記）+ REQ-092-004（search 選択性）+ `agentdev-issue-management/references/issue-operation-safety.md`「labels 引数は tracking 論理値専用」節・「search トークンの選択性指針」節（L43-48、grep 実証）が知識を完全カバー → duplicate。観測時点（Case #3145 実行中）では AG-003 追記が同 Case の case-run 成果物として未着だった可能性が高いが、既存対策照合は現在時点の整備状況で判定。
- **E6**: deferred 同類 3件（L814/L2320/L2402）。L2320 の再評価条件（外部 worktree・TEMP 経由の証跡退避・一時作業の再開時）は E6 が直接トリガー。L814 は再評価条件の記述なし、L2402 の再評価条件（大規模編集再開時）は E6（検査入力 JSON）では厳密には未トリガーのため、3件とも同類 grouping による包摂再評価として staged 化する（review F-4b 修正: 旧記述「3件が再評価条件を保有し E6 がトリガー」は不正確）。deferred 3件は staged として STEP-6 で証拠保存後 prune（L2402 は CL-3 成果物への技法吸収確認後）。
- **E9**: targeted-docs-guard-implementation.md は `docs/knowledge/**` 対象外と代替検査運用（REQ-010-077）を明記済みだが、check_knowledge_docs.ts との検査責務分担明示と workflow 検証手順への実行必須化が未整備。agentdev-doc-diagnostics に knowledge ルーティング記述なし（grep 実証）。
- **E10**: issue-operation-safety.md の read-back 規則（Tool 検証済み成功の信頼）は循環検証問題をカバーせず（grep 実証）、docs/knowledge/ に同主題なし。
- **E12**: QG-4 fail 由来分類契約（agentdev-quality-gates「fail 全件由来分類・由来不明 0 件」機械受理基準が存在）の運用実践手順として知識化。entry 内の intake 化候補（delta baseline commit `bac3ca4b...` の永続化・ラベリング方針）は対象範囲の新規決定であり学び処分とは別経路 → ユーザー質問候補。

## 判定統計

- staged 11件（9クラスタ）／duplicate 1件（E5）／rejected 0件／新規 deferred 0件
- 成果物 9件（E3+E7 統合、E8+E11 統合）
- STEP-6 prune 材料: deferred 側 staged 統合 5件（L2047〔CL-1〕、L1561〔CL-2〕、guard 系 L814/L2320/L2402〔CL-3〕。各「元learning item/根拠」へ証拠保存後に削除）+ E5（duplicate）
- Decision 候補除外記録（全エントリ共通）: 除外理由 = 運用ルール（手順・承認・作業規律）または仕様遵守・検証手順の知識であり、アーキテクチャ上の決定・技術選定・設計判断を含まない。根拠事実 = 各エントリの予防策候補が reference・手順・知識文書への追記を指向し、技術的トレードオフの意思決定を含まない。代替反映先候補 = 各 promoted 成果物の「反映先候補」欄

## 不確実性メモ

1. **E2 の観測経路（推定）**: 現行実装はメッセージを stderr 分離済み（`check_integrity.ts` L11352、#611 以降不変）。「stdout へ混入した」観測は呼出側の stdout/stderr 統合キャプチャが最有力説明だが実証なし（例: `2>&1` 付き実行、ハーネス bash のストリーム統合）。promoted 内容は修正版（stdout 単独キャプチャ規律）とし、元 entry の checker 側原因記述を残さないこと
2. **E12 の intake 候補（ユーザー質問候補）**: delta baseline commit `bac3ca4b...` の永続化・ラベリング方針は「要件・仕様の対象範囲の新規決定」に該当し得る。学び処分（knowledge 昇華）とは独立に intake-capture での起票要不要をユーザーに確認する（review F-5: 本質問は「HITL 必須項目 0」の集計に含めず、完了報告のユーザー質問欄に明示必須）
3. **E5 の時系列注記**: 現在時点で完全カバーのため duplicate 判定は維持。REQ-092 実装（AG-003 追記）の main 到達は issue-operation-safety.md L43-48 の grep 実証で確認済み
4. **E2・E4 の昇華価値は中程度（25-26/40）**: 反映先明確度・費用対効果・再発可能性が全て 4 であるため本分析は昇華を推奨するが、deferred 降格も合理的な選択肢
5. **CL-4 のグルーピング判断**: E8（escape 解釈）と E11（heredoc 打ち切り）は機構が異なるため厳密には別根因。予防策の同一性（ファイルベース伝達）と想定反映先の一致から同一クラスとした。分割した場合も両エントリの処分（project knowledge）と成果物内容は不変
6. **STEP-4 発動条件**: skip 条件（エントリ1件のみ+重複確定、または inbox 空）は不成立（12エントリ）。workflow reference は default-on、capability skill（agentdev-learning-pipeline）は明示要求時のみと記述が並存するが、workflow 制御平面（analysis-and-review.md）に従い発動する（Jev 先行評価 20260926T180954Z-bccb: true, confidence 0.97）
