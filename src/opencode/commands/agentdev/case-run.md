---
description: 1 Issue単位でdriver subagentへ実装実行を委譲し、driver resultを処理する。worktree前提・Epic/multi-Issue順序制御・driver起動・driver結果処理を責務とする。3フェーズ構成でべき等性・再開ポイントを提供
agent: sisyphus
---

# 実装パイプライン

Case に対して実装実行を driver subagent 経由で外部実行バックエンドへ委譲し、driver result を処理する。case-run 本体は orchestration に専念し、実装実行そのものは行わない（ADR-0114）。常に git worktree を使用。

3フェーズ構成で各フェーズは独立して再実行可能（べき等性）。フェーズ間エラー時は Step 0 の再開判定から再開できる。

## Input

- Issue番号またはURL（要件doc埋め込み済み）
- ブランチ名（自動生成または指定）

## Output

- 成功: 実装済みブランチ + GitHub PR（driver が作成）。**case-run の成功成果は PR 作成である**
- blocked / failed: blocker 詳細は Issue コメントに SSoT として記録される（driver 責務）

## フェーズ構成

| フェーズ | Steps | 再開条件 |
|---|---|---|
| 準備フェーズ | 1-4 | worktree+ブランチが存在しない |
| driver委譲フェーズ | 5-6 | PRが未作成 または driver result 未確定 |
| クリーンアップフェーズ | 7 | driver result = completed(pr) |

## Steps

### Step 0: フェーズ判定（再開ポイント検出）

`agentdev-workflow-orchestration` に従い、再開フェーズを判定する。Issue番号解決・引数パース・妥当性確認・実行パス分岐・成果物チェックの詳細は同skill参照。

- **再開ポイントの報告**: 再開が必要なフェーズをユーザーに通知。準備フェーズから開始する場合は省略

**実行パス分岐**:

1. Issue番号を解決
2. 有効Issue ≥ 2件 → **多重Issueモード**
3. 有効Issue = 1件 → Epic検出チェック（`agentdev-workflow-orchestration` の検出ルール参照）→ Epic Orchestrator モード or 単一Issueパス

**upstream handoff 停止判定**: Issue 本文、要件doc本文に `agentdev_handoff: true` が含まれる場合、実装を開始せず停止する。agent-dev-flow repository への手動取り込み対象として報告する。判定は `agentdev-workflow-lifecycle` に従う

### 多重Issue実行フェーズ / Epic Orchestrator 実行フェーズ

`agentdev-workflow-orchestration` のプロトコルに従い各Waveを実行。Epic OrchestratorはWave順次実行→specs更新（親のみ）→集約完了報告。各子Issueの実装実行は driver subagent へ委譲する。

### 準備フェーズ（Steps 1-4）

**べき等性**: worktreeとブランチが既に存在する場合、Step 4をスキップしてdriver委譲フェーズへ移行。

**Step 1**: Issue本文から要件docと受け入れ基準を抽出 → `agentdev-req-analysis` のチェックボックス品質基準で検証

**Step 2**: `docs/adr/README.md` を読み込み、関連ADRを特定。関連ADRがあれば個別に読み込み、実装がADRの決定事項に矛盾しないことを確認

**Step 3**: work_type 判定 → `agentdev-workflow-lifecycle` に従い bugfix/feature/maintenance/docs_chore を判定。scale は feature のみ standard/large。workflow_route は都度導出し保存しない

**Step 4**: Worktree作成・ブランチ準備 → `agentdev-git-worktree` に従って実行。`origin/main` をベースとして明示的に指定。べき等チェック: worktree既存時は作成スキップ

**Step 4-1**: 親Epicステータス更新（`agentdev-epic-tracker` 参照）

### driver委譲フェーズ（Steps 5-6）

**Step 5: driver subagent 起動**: 実装実行を外部実行バックエンドへ委譲するため、driver subagent を起動する。driver は `agentdev-execution-backend` skill の adapter protocol に従い、Issue読込・ADR/REQ/SPEC/docs/repository context 再確認・外部実行バックエンドへの委譲・REJECT/ITERATE/blocker処理・result返却を実行する。

- **case-run が直接行わない（driver / 外部実行バックエンドの責務）**: work plan生成・実装実行・TDD・乖離検出（QG-3）・specs更新・関連ドキュメント整合性確認・ローカル検証・PR本文作成・PR作成・デプロイ検証
- **driver への引き渡し**: Issue番号・worktree root（相対パス指定・worktree内制約）・ブランチ名
- 外部実行バックエンドの plan artifact は不透明な外部成果物として扱う（解釈・検証しない）
- driver が Issue 完了条件チェックボックスを更新しない（case-close QG-4 の責務）
- Findings / Capture 候補は driver が PR 本文の `## Findings / Capture候補` に記録する

**Step 6: driver result 処理**: driver が返す3状態（`agentdev-execution-backend` の result 契約）のいずれかを処理する:

- **completed(pr)**: 実装完了・PR作成済み。PR番号を受け取りクリーンアップフェーズへ。成功成果は PR 作成である
- **blocked**: 回答可能な blocker。詳細本文は Issue コメントに SSoT として記録済み（driver 責務）。エラー処理に従い停止・ユーザー報告
- **failed**: repository context で回答不能な blocker。詳細本文は Issue コメントに構造化して記録済み（driver 責務）。エラー処理に従い停止・ユーザー報告

### クリーンアップフェーズ（Step 7）

**Step 7**: worktree クリーンアップ確認 + 完了報告
- 未コミット変更あり: 報告してユーザーの指示に従う。自動的な破棄・コミットは行わない
- 未コミット変更なし: 完了報告へ。.sisyphus/ の削除は行わない（case-close で実施）
- 完了報告templateに従って出力（driver result 状態・PR番号を含める）

## エラー処理

エラー発生時の対応は `agentdev-workflow-orchestration` に従う。driver result が blocked / failed の場合、Issue コメント（SSoT）を参照して停止理由・再開ポイントをユーザーに報告する。driver 内の自律修正ループ（同一入力の機械的再試行・検証ループ）は `agentdev-execution-backend` / `agentdev-workflow-orchestration` に従う。

## Guardrails

### orchestration・委譲境界
- G01: 壁打ち禁止（構造的実行フェーズ — 実装は driver 経由）
- G02: 実装で判明した制約はREQを黙って変更せず、driver が乖離として報告しユーザー承認後に反映
- G04: 全ファイル操作はworktree内で実行
- G05: Issue番号省略は同一セッション内で作成済みの場合のみ
- G06: Issue番号解決に `gh issue list` 等のopen issue一覧取得は禁止
- G10: work_type 判定基準は `agentdev-workflow-lifecycle` を参照
- G11: 多重Issue上限5件/call。Wave内同時実行上限は別ルール（G19）
- G22: case-run は実装実行を driver subagent へ委譲し、自ら work plan生成・実装・乖離検出・specs更新・PR作成を行わない（ADR-0114）。driver adapter protocol は `agentdev-execution-backend` 参照
- G23: driver result の3状態（completed(pr)/blocked/failed）は `agentdev-execution-backend` の result 契約に従う。成功成果は PR 作成である
- G24: 完了条件チェックボックスの評価・更新は case-close QG-4 の責務。case-run・driver subagent・外部実行バックエンドは完了条件チェックボックスを更新しない
- G25: blocked / failed の詳細本文 SSoT は Issue コメント。completed の SSoT は PR 本文。一時会話コンテキスト・中間ファイルは SSoT としない
- G26: 外部実行バックエンドの plan artifact は不透明な外部成果物として扱い、内部構造に依存した処理・検証を行わない

### Epic・Wave
- G12: specs更新は親エージェントのみ実行（サブエージェントは禁止）
- G18: Epic Orchestrator モードは追加モードであり既存パスを置き換えない
- G19: 1Wave内同時実行上限5件。超過時はWave自動分割

### 本筋外発見の退避方針

intake / learning 境界は `agentdev-workflow-orchestration` を参照する。driver が PR 本文の `## Findings / Capture候補` に記録する。

- G14: スコープ拡大禁止。発見は記録し修正は後続処理に委ねる
- G15: intake 候補を PR 本文の `## Findings / Capture候補` に記録。`.agentdev/intake/inbox/` の直接変更禁止
- G16: learning 候補を intake 候補と区別して記録
- G17: intake/learning 候補を混ぜた単一成果物にしない。capture 境界の詳細は `agentdev-workflow-orchestration/references/capture-boundaries.md` を参照（case-run の capture 責務は記録のみ）
- G21: `.agentdev/learning/inbox.md` の直接変更禁止。capture 情報は PR 本文経由のみ case-close に引き継ぐ
