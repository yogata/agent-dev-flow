---
description: 計画立案からコミットまでを一気通貫で実行する。3フェーズ構成でべき等性・再開ポイントを提供。複数Issueの並列実行に対応
agent: sisyphus
load_skills:
  - req-analysis
  - spec-compliance
  - issue-lifecycle
  - issue-completion-reporting
  - issue-post-review-routing
  - issue-work-orchestration
  - git-worktree
  - gh-cli-best-practices
  - req-file-manager
  - adr-file-manager
  - conventional-commits
  - epic-status-tracker
---

# 実装パイプライン

Issueに対して計画立案から実装・コミットまでを一気通貫で実行する。②構造的実行フェーズ。常にgit worktreeを使用。

3フェーズ構成により、各フェーズは独立して再実行可能（べき等性）。フェーズ間でエラーが発生した場合、Step 0の再開判定から再開できる。

## Input

- Issue番号またはURL（要件doc埋め込み済み）
- ブランチ名（自動生成または指定）

## Output

- 実装済みブランチ、コミット履歴
- 乖離検出レポート（乖離があれば）
- GitHub PR（open状態、レビュー待ち）

## フェーズ構成

| フェーズ | Steps | 再開条件 |
|---|---|---|
| 準備フェーズ | 1-5 | worktree+ブランチが存在しない |
| 実装フェーズ | 6-7 | work planが未完了 または チェックボックス未完了 |
| 提出フェーズ | 8-12 | PRが未作成 |

## Steps

### Step 0: フェーズ判定（再開ポイント検出）

`issue-work-orchestration` の状態機械・再開ポイント検出に従い、再開が必要なフェーズを判定。

1. **Issue番号解決**: ユーザー入力またはセッション内会話からIssue番号を取得。検出できない場合はユーザーに番号の指定を求めて停止
2. **引数パース（多重Issue対応）**: 個別指定 `1 2 3`、範囲指定 `1-5`、混在 `1 3-5 7` に展開。逆順範囲・0/負数はエラー拒否
3. **Issue妥当性確認**: 各Issue番号について `gh issue view {N} --json state,title,labels` で存在・状態を確認。存在しない・closedは警告付きスキップ。有効Issue 0件→中止、>5件→拒否
4. **実行パス分岐**: 有効Issue 1件→単一Issueパス、≥2件→多重Issueモード（Step 0bへ）
5. **成果物チェック（単一Issueパス）**: `issue-work-orchestration` の成果物チェック順序に従って再開フェーズを判定
6. **再開ポイントの報告**: 再開が必要なフェーズをユーザーに通知。準備フェーズから開始する場合は省略

### Step 0b: 依存関係分析（多重Issueモード）

`issue-work-orchestration` の依存関係分析に従い、各Issueの依存レベル（L0〜L3）を判定し、依存関係テーブルを提示。曖昧な依存判定時は直列寄りのWave構成を採用。

### Step 0c: Wave スケジューリング（多重Issueモード）

`issue-work-orchestration` のWave スケジューリングに従いWaveを構成。

### 多重Issue実行フェーズ（多重Issueモード）

`issue-work-orchestration` のサブエージェント実行プロトコルに従い、各Waveの各Issueを実行。サブエージェントが使用できない場合はSequential Waveにフォールバック。

### 準備フェーズ: 準備（Steps 1-5）

**べき等性**: worktreeとブランチが既に存在する場合、Step 5をスキップして実装フェーズへ移行。

**Step 1**: Issue本文から要件docと受け入れ基準を抽出 → `req-analysis` のチェックボックス品質基準で検証

**Step 2**: `docs/specs/system.md` と `docs/specs/patterns.md` を読み込み、現在のシステム仕様と実装パターンを把握する。実装がspecsに矛盾しないことを確認する

**Step 3**: `docs/adr/README.md` を読み込み、要件と関連するADRを「対象領域」と「決定内容」でマッチングして特定する。関連ADRがあれば個別に読み込み、実装がADRの決定事項に矛盾しないことを確認する

**Step 4**: Pattern判定 → `issue-lifecycle` の Pattern Registry に従って Pattern A/B/C/D を判定し、以降のStepの分岐を決定

**Step 5**: Worktree作成・ブランチ準備 → `git-worktree` スキルに従って実行。`origin/main` をベースとして明示的に指定。べき等チェック: worktree既存時は作成スキップ

**Step 5b**: 親Epicステータス更新（`epic-status-tracker` スキル参照）。子Issue本文から `Parent: #{N}` を検出し、該当行を `☐` → `🔄 進行中` に更新。既に進行中/完了/対処不要の場合はスキップ。更新失敗時は警告表示して実装フェーズへ継続

### 実装フェーズ: 実装（Steps 6-7）

**べき等性**: work planが完了済みの場合、提出フェーズへ移行。部分的に完了している場合は未完了タスクから再開。

**Step 6**: work planを生成（@plan）→ 実行（/start-work）→ TDD実装
- 再開対応: `.sisyphus/plans/` に既存planファイルがある場合、plan再生成をスキップして未完了タスクから再開
- 関連ドキュメントの影響範囲探索を実装計画に含める（SHALL）

**Step 7**: 各タスク完了時にIssue本文のチェックボックスを `[ ]` → `[x]` に更新
- テスト戦略検証・完了条件品質ゲートに基づき達成判定
- チェックボックス更新失敗時はエラー表示して停止
- 全チェックボックス完了確認後に提出フェーズへ移行

### 提出フェーズ: 提出（Steps 8-12）

**べき等性**: PR既存時はSteps 8-10をスキップし、Step 11cのみ再実行後Step 12へ。CI通過済みの場合はStep 12のみ実行。

**Step 8**: 実装完了後、乖離検出 → `spec-compliance` に従ってチェック。品質メトリクス収集も併せて実行。`.opencode/skills/spec-compliance/templates/report_spec_compliance.md` テンプレートを使用し、【必須】セクションが全て含まれることを確認

**Step 9**: 乖離があれば報告 → `spec-compliance` の報告フォーマット + テンプレートでユーザーに提示。乖離がある場合、ユーザーの指示を待機（自動修正禁止）。ユーザーが「継続」を選択した場合のみ次Stepへ

**Step 10**: パターンBの場合、`docs/specs/system.md` または `docs/specs/patterns.md` を更新する。全パターン共通: 実装によって仕様が変化した部分と矛盾する関連ドキュメントが存在する場合、同一Issue内で更新する（SHALL）

**Step 10（多重Issueモード）**: `issue-work-orchestration` のSpecs更新直列化に従い、親エージェントのみが順次実行

**Step 11**: ローカル検証 → PR作成 → デプロイ検証（3サブステップ構成）

- **11a: ローカル検証**（型チェック・Lint・ビルド・テスト・フォーマット・import不整合）
  - 検証成功時のみ11bへ進む
  - 検証失敗時: `issue-work-orchestration` のSelf-Healing Loopに従い自律修正（最大3回、停止条件に該当時は即座に停止・ユーザー報告）

- **11b: PR作成**: `gh pr create` を `gh-cli-best-practices` に従って `--body-file` で実行。PR本文は `.opencode/commands/issue/templates/pr_desc.md` テンプレートに従い、【必須】セクション（概要・実装内容・テスト結果・品質メトリクス・Closes）が全て含まれることを確認。書き込み後にVERIFY操作で内容検証。べき等チェック: PR既存時は作成スキップして11cへ

- **11c: デプロイ検証**: `issue-work-orchestration` のCI / Review 対応 Loopに従いデプロイ検証を実行。CI失敗時はSelf-Healing Loopに従い自律修正（最大3回）

**Step 11（多重Issueモード）**: 各サブエージェントがworktree内で11a〜11cを個別に実行。親エージェントは全サブエージェントのデプロイ検証完了を待機

**Step 12**: 完了報告 → `issue-completion-reporting` の完了報告フォーマット（`reference/completion-reports.md` → issue-work 完了時）で結果出力

**Step 12（多重Issueモード）**: `issue-work-orchestration` の集約完了報告フォーマットで結果出力

## エラー処理

エラー発生時の対応は `issue-work-orchestration` のエラー回復マップに従う。各フェーズ境界が再開ポイントとなる。

**共通ルール**:
- エラー発生時は即座に停止し、エラー内容と再開ポイントを明示的にユーザーに報告する
- 自動リトライは同一入力・同一操作の機械的再試行に加え、Step 11a/11c の自律修正ループを許可。要件変更・仕様判断・スコープ変更を伴う修正は禁止
- セッションが途切れた場合、再実行時にStep 0のフェーズ判定が自動的に再開ポイントを特定する

## Guardrails

- バイブス禁止（②構造的実行フェーズ — 実装のみ）
- 実装で判明した制約はREQを黙って変更せず、乖離として報告しユーザー承認後に反映する
- 乖離の自動修正禁止（ユーザー決定）
- 全ファイル操作はworktree内で実行
- Issue番号省略は同一セッション内で作成済みの場合のみ
- Issue番号の解決に gh issue list / gh issue status 等でopen issue一覧を取得することは禁止。番号はユーザー入力またはセッション内会話からのみ取得可能
- 実装結果をspecsに反映すること（パターンBの場合）— Step 10で `system.md` / `patterns.md` を更新
- 関連ドキュメントの更新漏れは未完了事項と同等に扱う。変更後仕様と矛盾する関連ドキュメントが存在する場合、それを更新せずに提出フェーズへ移行してはならない
- 関連ドキュメントがissue-reqに明記されていないことを理由に、更新対象外としてはならない
- gh CLI出力を読み取る際は `gh-cli-best-practices` の安全な読み取り手順に従うこと
- Pattern分岐の判定基準と固有ルールは `issue-lifecycle` → Pattern Registry を参照
- 各フェーズのべき等チェックは必ず実行する
- フェーズ境界でエラーが発生した場合、Step 0から再開することで安全に復旧できる
- G11: 最大5 Issues/呼び出し（超過時は拒否メッセージを表示）
- G12: 依存関係分析結果は実行前に表示するが、ユーザー承認待ちで停止しない
- G13: specs更新は親エージェントのみ実行（サブエージェントはspecs更新禁止）
- G14: 単一Issue時は現行 Steps 1-12 と同一フロー（多重Issueモードのオーバーヘッドなし）
- G15: サブエージェント出力は verbatim で出力（再フォーマット・要約禁止）
- vibe-coding（実装先行）の場合も乖離報告を省略しない
- G16: 失敗Issueは兄弟Issueの実行をブロックしない（部分続行）
- G17: closed/存在しないIssueは警告付きスキップ（全体を中止しない）
- G18: サブエージェントのraw reportは折りたたみ保持する。親エージェントはsummaryを作成可能だが、rawの改変は禁止する
- PR本文の生成時に `pr_desc.md` テンプレートの【必須】セクションが全て含まれていることを確認すること
- 乖離検出報告の生成時に `report_spec_compliance.md` テンプレートの【必須】セクションが全て含まれていることを確認すること
- 完了判定はIssue本文の `完了条件` セクションを品質ゲートとして参照すること
