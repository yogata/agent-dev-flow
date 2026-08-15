# 評価レポート

## メタデータ
- **実行日時**: 2026-08-15 17:05
- **対象エントリ数**: 29件（inbox: 29件, deferred: 0件 — deferred.md（約49エントリ）は既存対策照合・重複確認の参照用として読込。本 run では再評価対象に含めず、living pool の再評価は次回実行時に行う。経路D review で本スコープ決定を確認済み）
- **問題クラス数**: 8（未分類含む。クラス7 + 未分類1）

## 問題クラス一覧

### 問題クラス1: Windows コンソールエンコーディング初期化の欠落・不十分による gh/git CLI 日本語 mojibake

- **根本原因**: Windows PowerShell/pwsh の既定コンソールコードページ（cp932）環境で、gh/git CLI の WRITE・READ 操作にコンソールエンコーディング初期化3行（`[Console]::OutputEncoding` / `$OutputEncoding` / `chcp 65001`）を前置しない、または前置しても複合呼び出し（`--title` inline + `--body-file` 同時渡し）で `--body-file` 側へ保護が波及しない。現行 SPEC（agentdev-gh-cli Section 2 Step 0）は gh CLI WRITE 向けに限定され、git CLI 直接操作・READ 経路・複合呼び出しをカバーしない
- **再発条件**: Windows pwsh 環境で初期化なし（または不十分な形式）で日本語を含む gh/git CLI 操作（`--body-file`、`git commit -F`、`git show` 等のパイプライン出力）を実行する場合
- **予防策**: 初期化手順の適用範囲を「gh CLI WRITE」から「git CLI 直接操作（message file 経由）・READ 系パイプライン出力・複合呼び出し回避（2段階シーケンス or REST API 経由）」へ拡張して規範化する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 4件（3経路 + READ 経路） |
| 影響度 | 4/5 | PR 本文・commit message の mojibake で amend/force-push/再設定の手戻り。通信内容の破損として重大 |
| 横展開性 | 5/5 | Windows 環境の gh/git CLI 操作全般。他プロジェクトでも同一発生 |
| 反映先明確度 | 4/5 | agentdev-gh-cli SPEC Section 2、AGENTS.md、agentdev-git-worktree と複数候補が特定済み |
| 自動化適性 | 4/5 | 3行の前置を手続き・テンプレートへ組み込むことで構造的に防止可能 |
| プロジェクト固有知識再利用性 | 4/5 | pwsh/gh/git の相互作用という環境固有の技術知見 |
| 再発可能性 | 5/5 | 既に4回・3経路で発生。手順化されない限りほぼ確実に再発 |
| 費用対効果 | 5/5 | 低コスト（前置3行 + 手順明記）で高リスク低減 |
| **加重合計** | **34/40** | |

- **推奨処分案**: 昇華（spec 候補）。agentdev-gh-cli SPEC Section 2 の適用範囲拡張（git CLI 直接操作・READ 経路・複合呼び出し回避）として恒久契約化する価値が高い
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: agentdev-gh-cli SPEC Section 2 Step 0（gh CLI WRITE 向け）あり / AGENTS.md にファイル編集時の注意あり。**ギャップ: fix gap**（適用範囲が gh CLI WRITE に限定。git CLI 直接操作・READ 経路・`gh pr create` 複合呼び出しのカバーなし）

#### エントリ一覧
- gh CLI WRITE 操作で Step 0 encoding 初期化を省略し --body-file 本文が mojibake（--title は正常）[inbox]
- git commit -F <file> で encoding 初期化を省略し commit message が cp932 二重エンコード mojibake [inbox]
- gh pr create --title --body-file で Step 0 encoding 初期化3行前置にも関わらず --body-file 本文が cp932 二重エンコード mojibake（第3の経路）[inbox]
- Windows + junction worktree で git show 等 READ 系出力が cp932 mojibake（READ 手順でも OutputEncoding 前置が実質必要）[inbox]

### 問題クラス2: check_changed_docs.ts（targeted docs guard）実行契約の未文書化による誤 pass・誤 FAILURE・起動失敗

- **根本原因**: guard スクリプトの CLI 実行契約（モード使い分け、引数形式、起動手段）が手順書・ヘルプ文言に明示されず、実行時の試行錯誤で (1) コミット前 `--base-ref` 実行による files_checked 空の pass 誤認、(2) PowerShell 引用符付きスペース区切りの `--files` 渡しによる TARGET-EMPTY 誤 FAILURE、(3) Node v26 での node/tsx 起動失敗（import/require 混在）が発生
- **再発条件**: コミット前に `--base-ref` モードのみ実行 / pwsh で引用符付きスペース区切り一覧を `--files` に渡す / bun 以外の起動手段を使う場合
- **予防策**: 実行手順の明文化（コミット前は `--files`・コミット後は `--base-ref`、引用符なし複数 argv または comma 区切り、`bun run` 起動）+ ヘルプ文言への shell 別注意喚起

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 4件（同一スクリプトの3種の誤作動） |
| 影響度 | 3/5 | 誤 pass は検証漏れ、誤 FAILURE は時間消費。ゲート判定の信頼性を損なう |
| 横展開性 | 3/5 | スクリプト自体は自己ホスト固有だが、可変引数 CLI を pwsh から呼ぶ知見は汎用 |
| 反映先明確度 | 4/5 | check_changed_docs.ts ヘルプ文言、case-run/case-close の guard 実行手順 reference と特定済み |
| 自動化適性 | 4/5 | 手順明記 + 未コミット変更検出警告の拡張で自動化可能 |
| プロジェクト固有知識再利用性 | 3/5 | repo 固有ツールの運用契約知見 |
| 再発可能性 | 4/5 | コミット前検証・pwsh 习惯は毎回発生しうる |
| 費用対効果 | 4/5 | 文言・手順明記は低コスト |
| **加重合計** | **28/40** | |

- **推奨処分案**: 昇華（spec 候補 / 既存 skill へ反映）。guard 実行手順の標準化とヘルプ文言改善
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: targeted-docs-guard-implementation SPEC（files_checked 空時の確認規定、false-clean 予防: case-close は --files 標準・--base-ref 補助、main worktree HEAD==merge-base の空 diff 警告）、USAGE 文言（"space-separated recommended"）あり。**ギャップ: fix gap**（既存規定は case-close 向け。case-run のコミット前タイミング運用、shell 別引数形式（pwsh 引用符）、起動コマンド（bun run）の3点が未手順化）

#### エントリ一覧
- check_changed_docs.ts --base-ref はコミット前実行だと files_checked 空の warning になり pass 誤認リスクがある [inbox]
- check_changed_docs.ts の --base-ref モードはコミット済み差分のみ検出（コミット前は --files モードで明示指定）[inbox]
- check_changed_docs.ts は Node v26 で node/tsx 直接起動が失敗（bun run で起動する）[inbox]
- check_changed_docs.ts の --files 複数指定を PowerShell 引用符で囲むと 1 トークン扱いになり TARGET-EMPTY 誤 FAILURE [inbox]

### 問題クラス3: 配布物構造を固定する契約テストと本文編集・完了判定の相互作用

- **根本原因**: 契約テスト（routing contract 系、期待値固定テスト）が配布物本文トークン・構造を固定していることを、編集時（thin 化圧縮）および完了条件設計時に考慮する手順が存在しない。並列 Wave では他 Wave の更新状況が見えず、部分的な期待値更新漏れが統合状態で陳腐化 fail として顕在化する
- **再発条件**: 契約テストが本文トークン・期待値を固定する領域を機械的圧縮・構造変更する PR を、期待値更新なしで完了判定した場合（特に並列 Wave）
- **予防策**: (1) 本文圧縮・構造変更前に当該ファイルを参照する `*.test.ts` の grep 確認を手順化、(2) 構造変更 PR の完了条件に「固定する契約テストの期待値更新」を明示的に含める

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（実行時手順と完了条件設計の相補ペア） |
| 影響度 | 4/5 | Epic 差し戻しに直結した実績（陳腐化期待値 24 件 fail） |
| 横展開性 | 4/5 | 契約テストを持つプロジェクト・並列 Wave 構成全般 |
| 反映先明確度 | 3/5 | authoring skill・case-open 完了条件ガイドラインと候補は明確だら手順の正規配置先は要設計 |
| 自動化適性 | 3/5 | grep 確認は手順化可能だが固定トークン特定は判断含む |
| プロジェクト固有知識再利用性 | 4/5 | 配布物と契約テストの相互作用という固有知見 |
| 再発可能性 | 4/5 | thin 化・構造変更・並列 Wave で再発 |
| 費用対効果 | 4/5 | 手順明記で防止可能 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 昇華（spec 候補）。authoring 手順（skill-authoring / command-authoring）と完了条件記載ガイドラインへの反映
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: なし（契約テスト事前確認・完了条件への期待値更新明示の手順なし）。**ギャップ: fix gap**

#### エントリ一覧
- Command 本文 thin 化圧縮時に契約テスト固定トークンの事前確認を省略し一時失敗 [inbox]
- アーキテクチャ構造変更 PR の完了条件に「固定するテストの期待値更新」を明示的に含める [inbox]

### 問題クラス4: 検証 fail の由来判定基準（基準 commit・検証環境）の不定性

- **根本原因**: 「pre-existing fail」の由来判定の基準 commit と検証環境が受入れ基準に規定されず、各 Wave の PR base（直前 staging）相対判定や単一環境の結果が絶視されると、同一 Epic 内の先行 Wave 起因失敗が「元から存在」に見え、false-positive completion と誤った不合格の双方を生む
- **再発条件**: 複数 Wave・複数検証環境（worktree/main、junction 伝播、node_modules 有無）にまたがる Epic の完了検証で由来判定を行う場合
- **予防策**: 由来判定は remediation 開始前 baseline commit 基準で実施 + 受入れ記録への検証環境明記と fail 全件の由来分類証跡を規定する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（基準 commit と環境の2観点） |
| 影響度 | 4/5 | false-positive completion に直結（Epic 完了判定の誤り） |
| 横展開性 | 4/5 | 複数環境・複数 Wave を持つ検証全般 |
| 反映先明確度 | 3/5 | 同主題の intake 候補あり、品質ゲート側（QG-4/case-close SPEC）と候補 |
| 自動化適性 | 3/5 | 由来判定自体は手動（git show 等）。基準の文書化が主 |
| プロジェクト固有知識再利用性 | 4/5 | baseline commit・環境差という固有検証知見 |
| 再発可能性 | 4/5 | 検証のたびに由来判定は発生 |
| 費用対効果 | 4/5 | 基準明文化は低コストで判定揺れを防止 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 昇華（spec 候補）。同主題の intake item（intake-2026-08-15-spec-candidate-full-integrity-suite-acceptance-criteria.md）と backlog-review で統合前提
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: intake inbox に同主題の SPEC確定候補あり。**ギャップ: fix gap**（当該候補は受入れ基準・環境記録を含むが、由来判定の baseline commit 基準を含まない）

#### エントリ一覧
- 「pre-existing fail」の由来判定は PR base（staging 相対）基準ではなく remediation 開始前 baseline commit 基準で行う [inbox]
- full integrity suite の fail 構成は検証環境（worktree / main、junction・node_modules 有無）で変化する [inbox]

### 問題クラス5: IR-055 baseline 再生成の実行契約（タイミング・スコープ）未規定

- **根本原因**: IR-055 baseline が file 単位・単一 PR HEAD 基準で再生成される一方、file 移設（command → skill 移行）、並列 Wave での共有 baseline 再生成、docs/specs/** への新規参照追加が baseline 登録集合へ波及する工程契約（いつ・どのスコープで再生成するか）が規定されていない
- **再発条件**: file 移設を伴う変更、並列 Wave での baseline 再生成、docs/specs/** への新規参照を伴う工程で baseline 再生成をスキップまたは局所実行した場合
- **予防策**: baseline 再生成の実行契約の明文化（移設系 PR の標準手順への組込み、Wave 境界または最終 merge での全兄弟変更取り込み後再生成、case-close で docs/specs/** 変更時の baseline 再生成必須チェック）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（移設・並列 Wave・更新漏れ） |
| 影響度 | 3/5 | pre-existing fail や delta warning のノイズ。Epic 完了前の対処必要性 |
| 横展開性 | 3/5 | baseline ratchet 運用を持つプロジェクト全般 |
| 反映先明確度 | 4/5 | case-run/case-close references、integrity SPEC（IR-055 baseline 運用）と特定済み |
| 自動化適性 | 4/5 | 正規 CLI（--update-ir055-baseline）が存在し手順への組込みは容易 |
| プロジェクト固有知識再利用性 | 4/5 | ratchet baseline の運用契約という固有知見 |
| 再発可能性 | 4/5 | 移設・並列 Wave・docs 変更で継続的に発生 |
| 費用対効果 | 4/5 | 手順明記とチェック追加は低コスト |
| **加重合計** | **29/40** | |

- **推奨処分案**: 昇華（spec 候補）。IR-055 baseline 運用契約（integrity SPEC 側）と case-run/case-close 手順への反映
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: 再生成 CLI あり。**ギャップ: fix gap**（再生成の実行契約（タイミング・スコープ）の規定なし）

#### エントリ一覧
- baseline 未反映による check_integrity.test.ts IR-055 pre-existing failure（Phase 6 #2083 委譲）[inbox]
- workflow 実装を command から skill へ移設すると IR-055 baseline 再生成が移設作業の標準手順として機能する [inbox]
- 並列 Wave の1つが共有 baseline を再生成すると、兄弟 Wave の変更が merge 後 staging で delta warning を生む [inbox]

### 問題クラス6: 配布物間の形式・参照契約の突合欠陥（テンプレート vs ガードレール vs スキル形式定義）

- **根本原因**: 同一情報（子Issue 本文の Parent 配置、Epic ステータス追跡テーブル形式、reference からテンプレートへの参照先）の正規形式が複数箇所（command ガードレール、テンプレート、スキルの正規表現定義、reference）で二重定義され、配布物間の SSoT 整合と参照先実ファイル存在の突合機構が存在しない
- **再発条件**: 配布物間で形式・参照を追加・変更する際に、SSoT 整合（どちらを正とするか）と参照先実ファイルの作成・確認を行わずに merge した場合
- **予防策**: (1) 形式契約の SSoT 統一（テンプレートを正としてガードレール・スキルを追随、またはその逆を明確化）、(2) authoring 時の参照先実ファイル存在確認の査読観点化、(3) checker による「reference → templates/ パス参照 → 実ファイル存在」検査の追加

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（Parent 配置・Epic テーブル形式・テンプレート参照欠落） |
| 影響度 | 3/5 | 全10子Issue の手戻り修正、tracker 正規表現の機能不全、完了報告構造の実行時解釈化 |
| 横展開性 | 4/5 | 配布物（テンプレート・command・skill）を持つプラグイン開発全般 |
| 反映先明確度 | 4/5 | issue_desc_child.md、case-open G03、agentdev-epic-tracker、check_templates.ts と特定済み |
| 自動化適性 | 4/5 | 参照→実ファイル存在検査は checker で自動化可能 |
| プロジェクト固有知識再利用性 | 4/5 | 配布物間契約の突合という固有知見 |
| 再発可能性 | 4/5 | テンプレート・スキル編集時に継続発生しうる |
| 費用対効果 | 4/5 | 查読観点化と checker 検査追加は中程度コストで効果大 |
| **加重合計** | **30/40** | |

- **推奨処分案**: 昇華（spec 候補 + template・checker 拡張）。E11 の具体修正は既存 intake item と backlog-review で統合前提
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: agentdev-skill-authoring の参照整合 axis あり / intake-2026-08-14-case-open-completion-report-templates-missing.md が E11 具体修正を保持。**ギャップ: guardrail insufficiency**（テンプレート vs ガードレール vs スキル形式定義の突合機構なし）

#### エントリ一覧
- Epic ステータス追跡テーブル形式の契約不一致（agentdev-epic-tracker 新4列/旧4列 vs case-open 件数テーブル）[inbox]
- Workflow Skill reference が配布テンプレート実ファイルを参照せず「参照のみ存在」状態で運用継続 [inbox]
- G03（子Issue 先頭行 Parent）と issue_desc_child テンプレート構造の突合欠陥（解決時に重複記載で両立）[inbox]

### 問題クラス7: 機械検査・guard の対象範囲規定欠落による false positive（非 SPEC ファイル・歴史参照・worktree 環境差）

- **根本原因**: guard/checker が検出対象の除外規定を持たない。(1) targeted docs guard が docs/specs/ 配下のファイルを役割（SPEC schema 準拠 vs 非 SPEC snapshot）によらず機械的に README 登録候補とする、(2) 廃止 IR 識別子の監査文書・baseline の歴史参照を機能的残存と区別しない、(3) Windows+junction worktree で `.opencode/skills/agentdev-*` が空洞化する環境差を検知しない
- **再発条件**: docs/specs/ 配下に SPEC schema を持たないファイルを新規作成 / IR 廃止・MERGE で歴史記録に識別子言及が残る / Windows+junction 環境の worktree で `.opencode/skills/` 参照 checker を実行する場合
- **予防策**: 対象外規定の明文化（frontmatter・配置ディレクトリによる SPEC 判定とフラグ制御、歴史記録ディレクトリの除外リスト、worktree 空洞化検知時の warning/skip フラグ）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（非 SPEC 判定・歴史参照・worktree 環境差） |
| 影響度 | 3/5 | false positive のノイズと判定の揺れ。検証コストの増大 |
| 横展開性 | 3/5 | guard を持つプロジェクト全般。環境差検知は Windows/junction 固有 |
| 反映先明確度 | 4/5 | check_changed_docs.ts、DEC-013 AG-008、TS-017、check_templates.ts と特定済み |
| 自動化適性 | 4/5 | 除外リスト・frontmatter 判定・空洞化検知は自動化容易 |
| プロジェクト固有知識再利用性 | 4/5 | 検査対象範囲設計という固有知見 |
| 再発可能性 | 4/5 | 新規ファイル種別・IR 整理・worktree 利用で都度発生 |
| 費用対効果 | 4/5 | 除外規定の明文化は低コスト |
| **加重合計** | **29/40** | |

- **推奨処分案**: 昇華（spec 候補 + checker 拡張）。E9 のテスト側安定化は既存 intake item と backlog-review で統合前提
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: intake-2026-08-15-check-templates-dryrun-worktree-failures.md（E9 テスト側安定化候補）あり。**ギャップ: fix gap**（非 SPEC ファイル・歴史参照・worktree 環境差の対象外規定なし）

#### エントリ一覧
- docs/specs/ 配下の非 SPEC ファイル（baseline snapshot）の SPEC README 登録対象判定 [inbox]
- 廃止 IR 識別子の歴史参照を監査文書・baseline に残置する運用（DEC-013 AG-008 履歴担保原則の適用事例）[inbox]
- Windows + ジャンクション環境 worktree での check_templates.ts worktree 固有 false positive（.opencode/skills/agentdev-* 空洞化）[inbox]

> **deferred pool 突合記録（経路D review）**: deferred.md 既存エントリ「Windows worktree 環境で lint_skills.ts を実行するためのジャンクション一時作成パターン」と E9 は同根（junction 未伝播による .opencode/skills 空洞化）だが、予防策が相違する（一時ジャンクション作成という作業側回避策 vs checker 側の空洞化検知フラグ）ため本 run ではクラスタ化せず living pool で維持する。E6 は false positive そのものではなく「判定基準の未規定による解釈判断」であり、クラス題名は「対象範囲規定の未整備」と読むのが正確である。厳密な3要素同一規則の適用では本クラスは3つの単発エントリに分解しうるが、単一の予防策族（guard/checker の対象外規定明文化）に集約できるため現構成を維持する（粒度例「Windows環境でのパスエスケープ問題」と同水準の grouping）。

### 未分類
- detector 個別 unit test 拡充不足パターン（file-scope violation 検出 vs detector 単位カバレッジ）[inbox] — deferred（出現1件。REQ-028-006 運用基準の明確化候補として living pool で維持）
- verify-only 検証で MOVE/RETIRE 済み REQ 行の現行根拠参照を grep 検出するパターン [inbox] — deferred（出現1件。検証パターン記録。具体修正は intake-2026-08-14-stale-req-002-022-reference-resolved.md で対応済み）
- 旧表現を禁止する是正注記で旧表現の字面を引用すると grep 0 件基準の機械検査と衝突する [inbox] — deferred（出現1件。執筆規範レベル知見）
- 配布物へ Workflow Skill の STEP 表を書く際、具体番号を書ける ID ファミリーは STEP / QG に限定される [inbox] — deferred（出現1件。既定運用の明確化事象、authoring 注意喚起候補）
- ハーネス Write ツールのリポジトリ外 temp 書き込みが distribution-boundary-guard でブロックされる（worktree 内配置で回避）[inbox] — deferred（出現1件。guard 設計どおりの挙動、回避策の運用知見）
- autogen-index-regeneration-diff 拡張check の指定ツール generate_indexes.ts が adr-to-decision rename 未追随で EXIT_ERROR（中間 Wave は PR 索引影響なしで継続判断）[inbox] — deferred（同一事象の intake item（intake-2026-08-14-generate-indexes-requires-removed-adr-readme.md）が具体修正を管理中。duplicate 定義は既存 command/skill/template/docs によるカバーを想定し intake item は該当しないため duplicate 不適切、対策未解決のため reject も不適切。本エントリは living pool で維持し、次回実行時に intake 側処分と照合する。なお本エントリ固有の一般化予防策（rename 横断是正 PR への参照スクリプト追従確認の必須項目化、拡張check 指定ツールの freshness gate 変更）は intake item の対応方向に含まれないため、次回再評価時に delta として昇華可否を判断する）
- RU-0004 が git 未コミットのまま Form Zero で削除され evidence 保存前提が欠落（審議実体は投影記録で検証）[inbox] — deferred（出現1件。backlog-review / case-open 手順変更候補）
- Windows 環境でスクリプトの network 系コマンド不使用を「呼び出し記録型ダミー git.cmd」で実行時証明する検証技法 [inbox] — deferred（出現1件。検証技法の知見、規範化は要判断）

## promote 時prune結果

- **対象エントリ数**: 29件
- **prune実施**: 未実施（HITL 承認後に実施）
- **prune候補**: 21件（staged 21件。duplicate 0件 — 経路D review で E25 を deferred へ変更。HITL 承認時に確定）
- **prune却下**: 0件

## 全体傾向
- **高頻出・高影響**: 問題クラス1（Windows mojibake、34/40）が最高スコア。4件・3経路で発生し、費用対効果も最大
- **横展開性が高い**: 問題クラス1（gh/git CLI 全般）、問題クラス3・6（契約テスト・配布物間契約。プラグイン開発全般）
- **自動化適性が高い**: 問題クラス6・7（checker による参照存在検査・対象外規定）、問題クラス5（baseline 再生成の標準手順化）
- **全体的な観察所見**: 29件中17件が「検証・guard・契約の運用契約未規定」族（クラス2〜7）。Epic #2099（thin 化 remediation）と Epic #2119 系（docs guard 運用）で大半を占め、ほか Epic #2076（IR 整理）由来6件、mojibake 3件（Issue #2050/#2054/#2058）、Epic #2091 由来1件など複数系統から回収された。同主題の intake item が3件存在（クラス4・6・7で参照）し、backlog-review での統合が前提。未分類8件はすべて living pool（deferred）で維持する（E25 は同一事象の intake item が管理中のため次回実行時に照合）

## ADR候補除外記録
- **対象item**: 全問題クラス（1〜7）
- **除外理由**: 技術判断不在 / 運用ルール（全クラスともアーキテクチャ上の決定・技術選定を含まず、手続き・検証基準・契約明文化が本質）
- **根拠事実**: 各クラスの予防策は手順の明文化・SPEC への規定・checker 拡張であり、代替案間の技術的トレードオフ判断を含まない
- **代替反映先候補**: 各クラスのとおり spec 候補（docs/specs/ 配下）および既存 skill・checker への反映
