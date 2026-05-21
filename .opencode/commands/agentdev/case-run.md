---
description: 計画立案からコミットまでを一気通貫で実行する。3フェーズ構成でべき等性・再開ポイントを提供。複数Issueの並列実行に対応
agent: sisyphus
load_skills:
  - agentdev-req-analysis
  - agentdev-spec-compliance
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
  - agentdev-workflow-routing
  - agentdev-workflow-orchestration
  - agentdev-git-worktree
  - agentdev-gh-cli
  - agentdev-req-file-manager
  - agentdev-adr-file-manager
  - agentdev-conventional-commits
  - agentdev-epic-tracker
  - agentdev-workflow-templates
---

# 実装パイプライン

Caseに対して計画立案から実装・コミットまでを一気通貫で実行する。構造的実行フェーズ。常にgit worktreeを使用。

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

`agentdev-workflow-orchestration` の状態機械・再開ポイント検出に従い、再開が必要なフェーズを判定。Issue番号解決・引数パース・妥当性確認・実行パス分岐・成果物チェックの詳細は `agentdev-workflow-orchestration` に準拠。依存関係分析（多重Issueモード）およびWave スケジューリングも `agentdev-workflow-orchestration` に従い実行・構成。

- **再開ポイントの報告**: 再開が必要なフェーズをユーザーに通知。準備フェーズから開始する場合は省略

### 多重Issue実行フェーズ（多重Issueモード）

`agentdev-workflow-orchestration` のサブエージェント実行プロトコルに従い各Waveを実行。

### 準備フェーズ: 準備（Steps 1-5）

**べき等性**: worktreeとブランチが既に存在する場合、Step 5をスキップして実装フェーズへ移行。

**Step 1**: Issue本文から要件docと受け入れ基準を抽出 → `agentdev-req-analysis` のチェックボックス品質基準で検証

**Step 2**: `docs/specs/system.md` と `docs/specs/patterns.md` を読み込み、現在のシステム仕様と実装パターンを把握する。実装がspecsに矛盾しないことを確認する

**Step 3**: `docs/adr/README.md` を読み込み、要件と関連するADRを「対象領域」と「決定内容」でマッチングして特定する。関連ADRがあれば個別に読み込み、実装がADRの決定事項に矛盾しないことを確認する

**Step 4**: Pattern判定 → `agentdev-workflow-lifecycle` の Pattern Registry に従って Pattern A/B/C/D を判定し、以降のStepの分岐を決定（バグ修正・軽微変更/機能追加/リファクタリング・保守作業/ドキュメント・雑務）

**Step 5**: Worktree作成・ブランチ準備 → `agentdev-git-worktree` スキルに従って実行。`origin/main` をベースとして明示的に指定。べき等チェック: worktree既存時は作成スキップ

**Step 5b**: 親Epicステータス更新（`agentdev-epic-tracker` スキル参照）。子Issue本文から `Parent: #{N}` を検出し、該当行を `☐ 未着手` → `🔄 進行中` に更新。既に進行中/完了/対処不要の場合はスキップ。更新失敗時は警告表示して実装フェーズへ継続

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

**Step 8**: 実装完了後、乖離検出 → `agentdev-spec-compliance` に従ってチェック。品質メトリクス収集も併せて実行

**Step 9**: 乖離があれば報告 → `agentdev-spec-compliance` の報告フォーマットでユーザーに提示。乖離がある場合、ユーザーの指示を待機（自動修正禁止）。ユーザーが「継続」を選択した場合のみ次Stepへ

**Step 10**: 機能追加の場合、`docs/specs/system.md` または `docs/specs/patterns.md` を更新する。全パターン共通: 実装によって仕様が変化した部分と矛盾する関連ドキュメントが存在する場合、同一Issue内で更新する（SHALL）

**Step 10（多重Issueモード）**: `agentdev-workflow-orchestration` のSpecs更新直列化に従い、親エージェントのみが順次実行

**Step 11**: ローカル検証 → PR作成 → デプロイ検証（3サブステップ構成）

- **11a: ローカル検証**（型チェック・Lint・ビルド・テスト・フォーマット・import不整合）
  - 検証成功時のみ11bへ進む
  - 検証失敗時: `agentdev-workflow-orchestration` のSelf-Healing Loopに従い自律修正

- **11b: PR作成**: `gh pr create` を `agentdev-gh-cli` に従って `--body-file` で実行。PR本文は `agentdev-workflow-templates` のPRテンプレートに従い、【必須】セクションが全て含まれることを確認。書き込み後にVERIFY操作で内容検証。べき等チェック: PR既存時は作成スキップして11cへ

- **11c: デプロイ検証**: `agentdev-workflow-orchestration` のCI / Review 対応 Loopに従いデプロイ検証を実行。CI失敗時はSelf-Healing Loopに従い自律修正

**Step 11（多重Issueモード）**: 各サブエージェントがworktree内で11a〜11cを個別に実行。親エージェントは全サブエージェントのデプロイ検証完了を待機

**Step 12**: 完了報告 → `agentdev-workflow-reporting` の完了報告フォーマットで結果出力

**Step 12（多重Issueモード）**: `agentdev-workflow-orchestration` の集約完了報告フォーマットで結果出力

## エラー処理

エラー発生時の対応は `agentdev-workflow-orchestration` のエラー回復マップに従う。各フェーズ境界が再開ポイントとなる。

- エラー発生時は即座に停止し、エラー内容と再開ポイントをユーザーに報告
- 自動リトライは同一入力の機械的再試行およびStep 11a/11cの自律修正ループのみ許可（要件変更・仕様判断を伴う修正は禁止）
- セッション途切れ時は再実行時にStep 0が自動的に再開ポイントを特定

## Guardrails

- G01: 壁打ち禁止（構造的実行フェーズ — 実装のみ）
- G02: 実装で判明した制約はREQを黙って変更せず、乖離として報告しユーザー承認後に反映する
- G03: 乖離の自動修正禁止（ユーザー決定）
- G04: 全ファイル操作はworktree内で実行
- G05: Issue番号省略は同一セッション内で作成済みの場合のみ
- G06: Issue番号の解決に `gh issue list` / `gh issue status` 等でopen issue一覧を取得することは禁止。番号はユーザー入力またはセッション内会話からのみ取得可能
- G07: 実装結果をspecsに反映すること（機能追加の場合）— Step 10で `system.md` / `patterns.md` を更新
- G08: 関連ドキュメントの更新漏れは未完了事項と同等に扱う。変更後仕様と矛盾する関連ドキュメントが存在する場合、それを更新せずに提出フェーズへ移行してはならない
- G09: 関連ドキュメントがreq-defineに明記されていないことを理由に、更新対象外としてはならない
- G10: Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → Pattern Registry を参照
- G11: 最大5 Issues/呼び出し（超過時は拒否メッセージを表示）
- G13: specs更新は親エージェントのみ実行（サブエージェントはspecs更新禁止）
- PR本文・乖離検出報告のテンプレート【必須】セクション確認は各テンプレートに従う
- 完了判定はIssue本文の `完了条件` セクションを品質ゲートとして参照

### 本筋外発見の退避方針（REQ-0019-009 ~ 012）

実装・検証フェーズで本筋外の不整合・規約違反・小改善候補を発見した場合の取り扱い。`agentdev-workflow-lifecycle` → `reference/capture-boundaries.md` の Split Rule を SSoT とする。

- **G14: スコープ拡大禁止**: 作業中に本筋外の不整合・規約違反・小改善候補を見つけた場合、現在の完了条件を拡大して修正してはならない（SHOULD / MUST NOT）。発見は記録し、修正は後続処理に委ねる
- **G15: intake 候補の記録**: 本筋外の発見のうち、具体的な修正対象が特定できるものを intake 候補として記録する（SHOULD）。case-close の post-run capture または `/agentdev/intake-capture` が後続処理として拾える導線を持つ
- **G16: learning 候補の区別**: 作業中の失敗・回避・判断ミス・手順漏れを learning 候補として intake 候補と区別して記録する（SHOULD）
- **G17: 成果物の分離**: intake 候補と learning 候補を混ぜた単一成果物にしてはならない（SHALL）。両方がある場合は `capture-boundaries.md` の Split Rule（具体的修正対象 → intake item、再発防止知見 → learning item、両方 → 分割）に従い別々の成果物とする
