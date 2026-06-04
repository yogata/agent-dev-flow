---
description: 計画立案からコミットまでを一気通貫で実行する。3フェーズ構成でべき等性・再開ポイントを提供。複数Issueの並列実行に対応
agent: sisyphus
---

# 実装パイプライン

Caseに対して計画立案から実装・コミットまでを一気通貫で実行する。常にgit worktreeを使用。

3フェーズ構成で各フェーズは独立して再実行可能（べき等性）。フェーズ間エラー時はStep 0の再開判定から再開できる。

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
| 準備フェーズ | 1-4 | worktree+ブランチが存在しない |
| 実装フェーズ | 5-6 | work planが未完了 または チェックボックス未完了 |
| 提出フェーズ | 7-11 | PRが未作成 |

## Steps

### Step 0: フェーズ判定（再開ポイント検出）

`agentdev-workflow-orchestration` の状態機械・再開ポイント検出に従い、再開フェーズを判定。Issue番号解決・引数パース・妥当性確認・実行パス分岐・成果物チェックの詳細は同skill参照。

- **再開ポイントの報告**: 再開が必要なフェーズをユーザーに通知。準備フェーズから開始する場合は省略

**実行パス分岐**:

1. Issue番号を解決
2. 有効Issue ≥ 2件 → **多重Issueモード**
3. 有効Issue = 1件 → Epic検出チェック（`agentdev-workflow-orchestration` の検出ルール参照）→ Epic Orchestrator モード or 単一Issueパス

### 多重Issue実行フェーズ / Epic Orchestrator 実行フェーズ

`agentdev-workflow-orchestration` のプロトコルに従い各Waveを実行。Epic OrchestratorはWave順次実行→specs更新（親のみ）→集約完了報告。

### 準備フェーズ（Steps 1-4）

**べき等性**: worktreeとブランチが既に存在する場合、Step 4をスキップして実装フェーズへ移行。

**Step 1**: Issue本文から要件docと受け入れ基準を抽出 → `agentdev-req-analysis` のチェックボックス品質基準で検証

**Step 2**: `docs/adr/README.md` を読み込み、関連ADRを特定。関連ADRがあれば個別に読み込み、実装がADRの決定事項に矛盾しないことを確認

**Step 3**: work_type 判定 → `agentdev-workflow-lifecycle` の workflow classification に従い bugfix/feature/maintenance/docs_chore を判定（REQ-0112-011）。scale は feature のみ standard/large。workflow_route は都度導出し保存しない（REQ-0112-013）

**Step 4**: Worktree作成・ブランチ準備 → `agentdev-git-worktree` に従って実行。`origin/main` をベースとして明示的に指定。べき等チェック: worktree既存時は作成スキップ

**Step 4b**: 親Epicステータス更新（`agentdev-epic-tracker` 参照）

### 実装フェーズ（Steps 5-6）

**べき等性**: work plan完了済みの場合は提出フェーズへ。部分的完了時は未完了タスクから再開。

**Step 5**: work planを生成・実行・TDD実装
- 再開対応: `.sisyphus/plans/` に既存planファイルがある場合、plan再生成をスキップして未完了タスクから再開
- 関連ドキュメントの影響範囲探索を含める（SHALL — REQ-0101, 0102）
- 実装完了後、ローカルdiffからキーワード抽出し `docs/specs/` で矛盾確認（SHALL — REQ-0106, 008）
- 矛盾検出時は実装計画の関連ドキュメント更新確認対象に含める（SHALL）

**Step 6**: チェックボックス更新・完了判定
- `gh issue edit --body-file` の実行結果を確認してから todo を completed に（SHALL — REQ-0106）
- todo の completed マークと `gh issue edit` の API 呼び出しを同一ツール呼び出しブロック内で実行（SHALL）
- チェックボックス更新失敗時はエラー表示して停止
- スコープ外項目を `> ℹ️ 別途確認: {項目名}` 形式に変換（SHALL — REQ-0105）
- 全チェックボックス完了確認後に提出フェーズへ移行

### 提出フェーズ（Steps 7-11）

**べき等性**: PR既存時はSteps 7-9をスキップしStep 10cのみ再実行後Step 11へ。

**Step 7**: 乖離検出 → `agentdev-spec-compliance` に従ってチェック。品質メトリクス収集も実行。grep対象は `docs/` 全体（SHALL — REQ-0106-021）

**Step 8**: 乖離報告 → ユーザー指示待機（自動修正禁止）。ユーザーが「継続」を選択した場合のみ次Stepへ

**Step 9**: specs更新・関連ドキュメント整合性確認
- **work_type: feature 専用**: `docs/specs/` を更新（SHALL）
- **全 work_type 共通**: 矛盾する関連ドキュメントを同一Issue内で更新（SHALL）
- **DOC-MAP整合性**: `docs/DOC-MAP.md` を参照し矛盾がないことを確認（REQ-0101）

**Step 9.5**: 本筋外 Finding の PR 本文記録（REQ-0106）
- 発見元・内容・分類（intake/learning）を含める（SHALL）
- intake と learning を混ぜた単一エントリにしない（SHALL — G17）
- `.agentdev/intake/inbox/` の直接変更禁止（SHALL）

**Step 10**: ローカル検証→PR作成→デプロイ検証（3サブステップ）

- **10a: ローカル検証**（型チェック・Lint・ビルド・テスト）。検証成功時のみ10bへ。失敗時 → `agentdev-workflow-orchestration` の Self-Healing Loop

- **10b: PR作成**: `agentdev-gh-cli` に従い `--body-file` で実行。PR本文は `agentdev-workflow-templates` に準拠。Findingsセクション非空検証（SHALL）。書き込み後にVERIFY操作で内容検証

- **10c: デプロイ検証**: `agentdev-workflow-orchestration` の CI/Review 対応 Loop に従い検証。CI失敗時はSelf-Healing Loopに従い自律修正

**Step 10.5**: worktree クリーンアップ確認（SHALL, REQ-0106）
- 未コミット変更あり: 報告してユーザーの指示に従う。自動的な破棄・コミットは行わない
- 未コミット変更なし: Step 11 へ。.sisyphus/ の削除は行わない（case-close で実施）

**Step 11**: 完了報告 → 完了報告templateに従って出力

## エラー処理

エラー発生時の対応は `agentdev-workflow-orchestration` のエラー回復マップに従う。エラー発生時は即座に停止し、エラー内容と再開ポイントをユーザーに報告。自動リトライは同一入力の機械的再試行およびStep 10a/10cの自律修正ループのみ許可。

## Manual References

- `agentdev-req-analysis`: Step 1 のチェックボックス品質基準で参照
- `agentdev-req-file-manager`: Step 5 以降で関連ドキュメント特定時に参照
- `agentdev-adr-file-manager`: ADR 確認時に参照
- `agentdev-conventional-commits`: コミットメッセージ作成時に参照
- `agentdev-no-ai-slop-writing`: PR 本文生成時に参照（常時 load 禁止: REQ-0103-032）
- `agentdev-workflow-routing`: review NG 時のルーティングで参照

## Guardrails

- G01: 壁打ち禁止（構造的実行フェーズ — 実装のみ）
- G02: 実装で判明した制約はREQを黙って変更せず、乖離として報告しユーザー承認後に反映
- G03: 乖離の自動修正禁止（ユーザー決定）
- G04: 全ファイル操作はworktree内で実行
- G05: Issue番号省略は同一セッション内で作成済みの場合のみ
- G06: Issue番号解決に `gh issue list` 等のopen issue一覧取得は禁止
- G07: work_type: feature の場合、Step 9で specs 更新
- G08: 関連ドキュメント更新漏れは未完了事項と同等（G07のspecs更新とは別条件）
- G09: 関連ドキュメントがreq-defineに明記されていないことを理由に更新対象外としない
- G10: work_type 判定基準は `agentdev-workflow-lifecycle` → workflow classification を参照
- G11: 多重Issue上限5件/call。Wave内同時実行上限は別ルール（G19）
- G12: specs更新は親エージェントのみ実行（サブエージェントは禁止）
- 完了判定はIssue本文の `完了条件` セクションを品質ゲートとして参照

### 本筋外発見の退避方針（REQ-0105 ~ 012）

`agentdev-workflow-lifecycle` → `references/capture-boundaries.md` の Split Rule を SSoT とする。

- G14: スコープ拡大禁止。発見は記録し修正は後続処理に委ねる
- G15: intake 候補を PR 本文の `## Findings / Intake候補` に記録。`.agentdev/intake/inbox/` の直接変更禁止（SHALL）
- G16: learning 候補を intake 候補と区別して記録（SHOULD）
- G17: intake/learning 候補を混ぜた単一成果物にしない（SHALL）。Split Rule に従い別々の成果物とする
- G18: Epic Orchestrator モードは追加モードであり既存パスを置き換えない（REQ-0106）
- G19: 1Wave内同時実行上限5件。超過時はWave自動分割（REQ-0106）
