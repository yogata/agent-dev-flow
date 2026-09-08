# 評価レポート

## メタデータ
- **実行日時**: 2026-09-08 20:55
- **対象エントリ数**: 140件（inbox: 9件、deferred既存: 131件）
- **問題クラス数**: 5（3要素一致クラスタ A〜E。inbox 由来単独 2件を個別評価。残り deferred 単独は living pool 継続）

## 問題クラス一覧

8軸表記: 発生件数/影響度/横展開性/反映先明確度/自動化適性/固有知識再利用性/再発可能性/費用対効果。
対象エントリ数は inbox + deferred の合計。deferred 由来メンバーは本文確認済み（根本原因・再発条件・予防策の3要素突合）。

### クラス A: Windows 環境での checker・検証コマンド実行と証跡取得の環境前提ずれ・符号化破壊

- **根本原因**: 検証・証跡取得の実行契約が環境固有の失敗モード（PowerShell リダイレクト/パイプの cp932 再符号化、bun test の stderr 流出、Bun API 依存 checker の node 経路不能、worktree の node_modules 非伝播、pwsh パイプ後 $LASTEXITCODE 上書き）を明示せず、暗黙前提で実行して証跡欠落・誤判定・gate 不能に至る
- **再発条件**: Windows/PowerShell 上で checker・テストの stdout/stderr・終了コード・依存を契約どおりと暗黙仮定して実行する場合
- **予防策**: checker 実行契約（Design）・QG-4 bun test 実行形態契約への環境前提の明記集約（spawnSync + UTF-8 writeFileSync 退避、stderr 併退避、Bun 依存 checker は bun 実行、worktree は bun install 前置、パイプ後の終了コード直接参照）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 5/5 | 8件（inbox 2 + deferred 6: PS リダイレクト・git show パイプ・bun test stderr・pwsh LASTEXITCODE・PS 一括読み書き・zod/bun install 前置） |
| 影響度 | 4/5 | 証跡欠落・gate 実行不能・blocked 再作業・配布物破壊に直結 |
| 横展開性 | 4/5 | Windows 環境で checker・検証コマンドを実行する全工程（case-run/case-close/QG） |
| 反映先明確度 | 4/5 | checker 実行契約 Design・qg-4-final-acceptance・worktree-operations・AGENTS.md・docs/knowledge の候補が特定済み |
| 自動化適性 | 3/5 | spawnSync wrapper 標準化は一部自動化可、契約文書化が中心 |
| プロジェクト固有知識再利用性 | 5/5 | Windows+junction+bun 固有の落とし穴集合。既存知識文書（windows-powershell-bulk-io-corruption.md）項3が「規定化待ち」と明記 |
| 再発可能性 | 4/5 | 新 checker・新 worktree 検証の追加で都度再発 |
| 費用対効果 | 4/5 | 手順注記集約で安価に予防可能 |
| **加重合計** | **33/40** | |

- **推奨処分案**: promote（カテゴリ5: 既存対策の更新）。前回実行 C1（worktree 依存整備 32/40）・C2（PS 出力退避破壊 30/40）の promote 推奨を観測増分（E19 系 zod 前置・bun test stderr・Bun.YAML node 不能）を統合して再確認。知識文書項3の規定化再評価条件が充足された。

#### エントリ一覧
- 2026-09-07: Bun.YAML 依存 checker は node 安定実行経路で実行不能 [inbox]
- 2026-09-08: bun の stdout を PowerShell リダイレクトで受けると符号化破損 [inbox]
- PowerShell のリダイレクトは UTF-8 JSON を破壊する [deferred 移動日 2026-09-01]
- PowerShell で git show の出力をパイプ受信すると cp932 デコードで取りこぼす [deferred 移動日 2026-09-01]
- 2026-09-05: bun test のレポートは stderr に流れる [deferred 移動日 2026-09-07]
- pwsh のパイプラインでは $LASTEXITCODE が最終コマンドの終了コードになる [deferred 移動日 2026-09-01]
- PowerShell 一括読み書きによる配布物ファイル破壊の再発防止 [deferred 移動日 2026-08-18]
- Windows worktree で外部依存を持つ検証スクリプトは bun install 前置で実行する [deferred 移動日 2026-09-01]

### クラス B: ツール・プロセス境界を跨ぐ編集の永続化漏れ

- **根本原因**: ツール処理（bun install・rebase・Wave close）の自動同期対象外・後続手動編集が、永続化・統合フロー（git add・squash・Wave 境界確認）から漏れ、下流（merge/main/Wave 境界）で欠落として発覚する
- **再発条件**: ツール処理後に手動編集・追従確認を要する場面で、境界通過前の機械確認（worktree clean・残存参照全文検索）を省略する場合
- **予防策**: 境界通過前の機械確認（rebase --continue 前 git add 完了・squash 前 worktree clean・Wave 境界で廃止キーワード全文検索）と通過後の main 上再検証を case-close/workflow 手順へ明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（inbox 2 + deferred 1: Epic Wave間変更漏れ 2026-06-07） |
| 影響度 | 4/5 | main 破壊状態での squash merge・fix コミット（77e2caa4）を要した実績 |
| 横展開性 | 3/5 | rebase・package rename・複数 Wave Epic で反復 |
| 反映先明確度 | 4/5 | case-close pr-merge-and-conflict reference・runtime-package-boundary.md・REQ-009 系検証手順が候補特定済み |
| 自動化適性 | 3/5 | worktree clean 確認・残存検索の定型化は可能 |
| プロジェクト固有知識再利用性 | 3/5 | ADF の case-close・Epic 運用に依存する知見 |
| 再発可能性 | 4/5 | Level 1 rebase は今後も頻出 |
| 費用対効果 | 4/5 | 手順注記で安価に予防 |
| **加重合計** | **28/40** | |

- **推奨処分案**: promote（カテゴリ3/5: Design・手順文書の注記候補）

#### エントリ一覧
- 2026-09-08: bun install は bun.lock の root workspace name を書き換えない [inbox]
- 2026-09-08: rebase コンフリクト解消の編集は rebase --continue 前に git add を完了させる [inbox]
- Epic Orchestrator の Wave間変更漏れパターン [deferred 移動日 2026-06-07]

### クラス C: 配布依存境界 gate・全文検証の検出規則と適用範囲の設計織り込み不足

- **根本原因**: 配布依存境界の ID 検出規則（concrete-id/unclassified-entry・digits 付き具体 ID）と全文検証の探索範囲を、配布物執筆・インベントリ設計の時点で織り込まず、case-close 最終 gate で新規違反・参照取りこぼしとして発覚する
- **再発条件**: 配布物へ具体 ID 例を記載する場合、および操作廃止系 Case の全文検索インベントリを src/・docs/ のみで定義する場合
- **予防策**: 配布対象ファイルへの記載例はプレースホルダ形式で執筆（skill-authoring ガイド集約）、操作廃止系 TS の検索範囲に repo-local 実体（.opencode/skills/repo-*）を含めるかの明示判断、PR 作成前の配布境界 gate 前置実行

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | 6件（inbox 2 + deferred 3 本文確認済み + 知識文書化済み OU-0004 系） |
| 影響度 | 3/5 | case-close blocked 再作業（PR #2675・#2691 の実績） |
| 横展開性 | 4/5 | 配布物へ例・言及を書く全場面・廃止系 Case 全般 |
| 反映先明確度 | 4/5 | agentdev-skill-authoring 記載例ガイドライン・custom-tool-contracts.md TS-003 検索範囲規定が候補特定済み |
| 自動化適性 | 3/5 | gate 前置実行は CI/手順化可能 |
| プロジェクト固有知識再利用性 | 4/5 | distribution-boundary 固有の検出規則知識 |
| 再発可能性 | 4/5 | 記載例追加・廃止 Case で反復実績あり |
| 費用対効果 | 4/5 | プレースホルダ執筆規律で安価に予防 |
| **加重合計** | **30/40** | |

- **推奨処分案**: promote（カテゴリ5: 既存対策の更新）

#### エントリ一覧
- 2026-09-07: 配布対象 SKILL.md の記載例に具体的な REQ/TS 行 ID を使うと concrete-id/unclassified-entry 違反になる [inbox]
- 2026-09-08: 操作廃止時の残存参照検索は repo-local integrity Skill の実体もインベントリに含める [inbox]
- 配布物への具体 ID・docs パス直書きは配布依存境界 gate で違反になる [deferred 移動日 2026-08-18]
- release archive 同梱配布物には実 REQ ID を書かずプレースホルダ表記を使う [deferred 移動日 2026-09-01]
- distribution boundary check の concrete-id は新規配布物原本・テスト内の ID 表記からも検出される [deferred 移動日 2026-09-01]

### クラス D: agentdev_gh 旧契約の欠陥知見（Epic #2686 で解消済み・陳腐化）

- **根本原因**: 旧操作契約（issue_comment 代理 VERIFY・issue_update 未知フィールド黙無視・pr_mergeable 二重読取・pr_read 本文欠落）の欠陥についての観測
- **再発条件**: 旧契約の操作利用時（現行カタログでは該当操作なし・欠陥解消済み）
- **予防策**: 不要（解消済み）。横展開観点（副作用操作の出力契約に読み戻し項目を含める等）は REQ-011-022〜030 に恒久化済み

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 4件（いずれも deferred） |
| 影響度 | 4/5 | 旧契約当時は verification-incomplete・部分更新黙成功を生んだ |
| 横展開性 | 3/5 | 出力契約設計の一般原則は残るが REQ 化済み |
| 反映先明確度 | 3/5 | 対応先は既存（REQ-011・実装 af697092 以降） |
| 自動化適性 | 2/5 | 対策不要 |
| プロジェクト固有知識再利用性 | 1/5 | REQ-011-022〜030 が恒久契約としてカバー |
| 再発可能性 | 1/5 | 解消済み（16操作カタログ・issue_comment 廃止） |
| 費用対効果 | 2/5 | 追加措置の価値なし |
| **加重合計** | **19/40** | |

- **推奨処分案**: rejected（カテゴリ7: すでに別の対策で十分対応済み）。証拠: REQ-011-022〜030（本日更新・マージ済み）、comment_create 読み戻し VERIFY（TS-012）、未知フィールド拒否（TS-013）、pr_mergeable 単一読取（TS-011）、pr_read body（TS-010）、issue_comment 廃止（PR #2693・TS-003 参照 0件）

#### エントリ一覧
- issue_comment の VERIFY は「Issue が open であること」の代理検証 [deferred 移動日 2026-09-01]
- agentdev_gh issue_update は契約外フィールドを無視して部分更新として成功する [deferred 移動日 2026-09-01]
- agentdev_gh pr_mergeable は gh の mergeable 再計算競合で verification-incomplete になり得る [deferred 移動日 2026-09-01]
- agentdev_gh pr_read 本文欠落時の読み取り系 gh CLI fallback [deferred 移動日 2026-09-03]

### クラス E: agentdev-traceability 実行の引数・走査対象の暗黙前提

- **根本原因**: check/coverage 実行時の引数仕様（--req は範囲展開しない・個別カンマ指定が正）と走査対象（.md/.ts のみ・.agentdev/ 除外・--root の cwd 相対解決）の前提を確認せずに実行し、リテラル reqId 報告・計上漏れを生む
- **再発条件**: case-close 独立再検査・coverage 実行で引数・cwd・対象を暗黙仮定する場合
- **予防策**: agentdev-traceability SKILL.md の check 呼出手順注記（個別カンマ指定・worktree での --root 明示・宣言配置可能拡張子）への集約。--req 範囲展開は実装改善候補として記録

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（inbox 1 + deferred 2） |
| 影響度 | 3/5 | 検証誤計上・再実行の手戻り |
| 横展開性 | 3/5 | case-close・case-run の traceability check 実行全般 |
| 反映先明確度 | 4/5 | agentdev-traceability SKILL.md 手順節が候補特定済み |
| 自動化適性 | 4/5 | --req 範囲展開の実装修正で恒久解消可 |
| プロジェクト固有知識再利用性 | 3/5 | ツール固有の引数仕様知識 |
| 再発可能性 | 4/5 | case-close 毎に --req を使用 |
| 費用対効果 | 4/5 | 注記+小修正で解消 |
| **加重合計** | **28/40** | |

- **推奨処分案**: promote（カテゴリ5: 既存対策の更新）

#### エントリ一覧
- 2026-09-08: agentdev-traceability check の --req 範囲構文はリテラル reqId として報告される [inbox]
- worktree で agentdev-traceability を scripts ディレクトリ cwd 起動する場合は --root 明示指定 [deferred 移動日 2026-09-01]
- traceability scripts の scan 対象は .md と .ts のみで .agentdev/ は除外ディレクトリ [deferred 移動日 2026-09-01]

### 単独エントリ（inbox 由来）

| # | エントリ | 8軸 | 加重合計 | 推奨処分 | 主要根拠・既存対策確認 |
|---|---|---|---|---|---|
| S1 | 2026-09-07: ng-baseline エントリ削除は live suppression を巻き込まない | 1/4/2/4/2/3/2/3 | 21/40 | **defer** | 単発・再発条件が baseline 削除作業に限定。判断基準（live 個別確認）を含むため living pool 保持。近縁 deferred（bucket key 陳腐化・manifest 完全一致）は根本原因が別でクラスタ不成立 |
| S2 | 2026-09-08: issue_update/issue_reopen の追跡軸保持 VERIFY は before を必要とする（両版同時反映） | 1/3/3/5/2/3/3/3 | 23/40 | **promote（カテゴリ3: Design 候補）** | before payload 契約は Design 未保存（Epic #2686 対応記録の design-save 再実行提案4件の1つ）。正規昇華経路（promoted → backlog-review）への合流が最短。情報は自足的に整備済み |

### 未分類

- deferred 残り単独エントリ（114件。本文未再評価）は living pool 継続。今回の再評価焦点（inbox 合流候補・Epic #2686 陳腐化）以外の全文精査は実施していない

## promote 時 prune 結果

- **対象エントリ数**: 24件（staged 20: クラス A/B/C/E メンバー + S2、rejected 4: クラス D メンバー）
- **prune実施**: あり
- **prune候補**: 24件（deferred.md から除去。staged 分の証拠は採用済み成果物の「元learning item/ 根拠」セクションへ保存）
- **prune却下**: 0件

## 全体傾向

- 高頻出・高影響: クラス A（33/40・8件）— Windows 環境の検証実行前提が最大の反復テーマ。前回 C1/C2 から観測増分で成長
- 横展開性が高い: クラス A・C — 検証工程・配布物執筆の全域で再発
- 自動化適性が高い: クラス E（--req 範囲展開の実装修正）・クラス B（worktree clean 機械確認）
- 全体的な観察所見: Epic #2686 完了により agentdev_gh 旧欠陥知見 4件が陳腐化（クラス D）。以後の新規学びは 16 操作カタログ契約を前提とした観測になる

## Decision候補除外記録

- **対象item**: 全クラス（A〜E・S1・S2）
- **除外理由**: 運用ルール（チェック実行手順・執筆規律・検証手順の注記集約）。技術判断不在
- **根拠事実**: 各予防策は手順文書・Design 注記・スキル手順への反映候補であり、アーキテクチャ変更・技術選定を含まない
- **代替反映先候補**: Design（checker 実行契約・case-close reference・custom-tool-contracts）、Capability Skill 手順（agentdev-traceability・agentdev-skill-authoring）、docs/knowledge、AGENTS.md

## 自律確定記録（STEP-5）

| 項目 | 判定 | 主要根拠 | HITL 不要理由 |
|---|---|---|---|
| クラス A | promote | 8件蓄積・知識文書項3の規定化再評価条件充足・反映先候補特定済み・予防策同一 | 処置が根拠から一意。採用済み成果物は backlog-review の利用者承認で再評価される |
| クラス B | promote | main 破壊実績・機械確認予防策・反映先候補特定済み | 同上 |
| クラス C | promote | 6件・blocked 再作業 2実績・プレースホルダ規律の集約先特定済み | 同上 |
| クラス D | rejected | REQ-011-022〜030 マージ済み（本日 af697092〜ffaf3603）・旧操作廃止済みの客観証拠 | 対応済みの機械検証可能な事実のみで確定 |
| クラス E | promote | 3件・反映先（SKILL.md 手順節）一意・実装修正候補を含む情報候補 | 同上 |
| S1 | defer | 単発・再発条件限定・判断基準は living pool で保持 | 安全側（何も失われない） |
| S2 | promote | Design 未保存 gap の確定情報・design-save 再実行提案と同一内容で正規経路合流 | 二重経路の実害なし（backlog-review が重複統合） |

## STEP-4 review（adversarial-review）記録

- **発動条件判定**: 非発動（skip）。判定根拠: `agentdev-learning-pipeline` の候補判断（Step 8-R1）はユーザー明示要求を必須条件とし、本実行は backlog-auto stage 2 による起動で明示要求なし。evaluation-report.md 反映済みであること自体は充足
- **従来フロー継承**: STEP-5 以降を従来フローで実行
