---
description: 1 Issue単位で実行担当サブエージェントへ実装実行を委譲し、実行担当サブエージェント resultを処理する。worktree前提・1 Issueスコープの実行担当サブエージェント起動・結果処理を責務とする。3フェーズ構成でべき等性・再開ポイントを提供
agent: sisyphus
---

# 実装パイプライン

Case に対して実装実行を実行担当サブエージェント経由で外部実行バックエンドへ委譲し、実行担当サブエージェント resultを処理する。case-run 本体は orchestration に専念し、実装実行そのものは行わない（ADR-0114）。常に git worktree を使用。

**1 Issue スコープ**: case-run は常に1 Issue のみを処理する（REQ-0130-010）。Epic 全体や Wave 一括の実行は行わない。1 Issue スコープとは: 割り当てられた1 Issue の要件のみを読み込み、当該 Issue の変更のみを実装し、Issue 1件あたり1 PR を作成する。複数 Issue の一括実行・Wave 順序制御は case-auto の責務であり、case-run に委譲しない（SPEC `docs/specs/workflow-contracts.md` SC-008）。

3フェーズ構成で各フェーズは独立して再実行可能（べき等性）。フェーズ間エラー時は Step 0 の再開判定から再開できる。

## Input

- Issue番号またはURL（要件doc埋め込み済み）
- ブランチ名（自動生成または指定）

## Output

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。**case-run の成功成果は PR 作成である**
- blocked / failed: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## フェーズ構成

| フェーズ | Steps | 再開条件 |
|---|---|---|
| 準備フェーズ | 1-4 | worktree+ブランチが存在しない |
| 実行担当サブエージェント委譲フェーズ | 5-6 | PRが未作成 または 実行担当サブエージェント result 未確定 |
| クリーンアップフェーズ | 7 | 実行担当サブエージェント result = completed(pr) |

## Steps

### Step 0: フェーズ判定（再開ポイント検出）

`agentdev-workflow-orchestration` に従い、再開フェーズを判定する。Issue番号解決・引数パース・妥当性確認・実行パス分岐・成果物チェックの詳細は同skill参照。

- **再開ポイントの報告**: 再開が必要なフェーズをユーザーに通知。準備フェーズから開始する場合は省略

**実行パス分岐**:

1. Issue番号を解決する。case-run は常に1 Issue のみを処理する（case-auto から1件委譲、または直接起動）。複数 Issue の一括実行・Epic 全体の一括実行・Wave 単位のオーケストレーションは提供しない（REQ-0130-010）

**upstream handoff 停止判定**: Issue 本文、要件doc本文に `agentdev_handoff: true` が含まれる場合、実装を開始せず停止する。agent-dev-flow repository への手動取り込み対象として報告する。判定は `agentdev-workflow-lifecycle` に従う

### 準備フェーズ（Steps 1-4）

**べき等性**: worktreeとブランチが既に存在する場合、Step 4をスキップして実行担当サブエージェント委譲フェーズへ移行。

**Step 1**: Issue本文から要件docと受け入れ基準を抽出 → `agentdev-req-analysis` のチェックボックス品質基準で検証

**Step 2**: `docs/adr/README.md` を読み込み、関連ADRを特定。関連ADRがあれば個別に読み込み、実装がADRの決定事項に矛盾しないことを確認

**Step 3**: work_type 判定 → `agentdev-workflow-lifecycle` に従い bugfix/feature/maintenance/docs_chore を判定。scale は feature のみ standard/large。workflow_route は都度導出し保存しない

**Step 4**: Worktree作成・ブランチ準備 → `agentdev-git-worktree` に従って実行。`origin/main` をベースとして明示的に指定。べき等チェック: worktree既存時は作成スキップ

**Step 4-1**: 親Epicステータス更新（`agentdev-epic-tracker` 参照）

**Step 4-2**: worktree precondition gate（実行担当サブエージェント起動前の隔離検証）。`agentdev-git-worktree` の検証ヘルパー（`references/worktree-operations.md` の「worktree 内判定ヘルパー」参照）に従い、当該 Issue の worktree+ブランチが作成済みであることを検証する:

- **検証1**: `git worktree list` の出力に当該 Issue の worktree（`.worktrees/{N}-{type}`）が含まれること
- **検証2**: `git rev-parse --show-toplevel`（worktree 内で実行）の結果がメインリポジトリルートと**一致しない**こと（現在 worktree 内にいることの確認）

**検証失敗時（worktree 未作成・メインリポジトリにいる）**: 実行担当サブエージェントを起動**せず**停止し、Step 4（Worktree作成・ブランチ準備）へ戻るようユーザーに報告する。実行担当サブエージェント委譲フェーズへ進んではならない。

本 gate は REQ-0137 適用範囲対象外「case-run の worktree 隔離フェーズ（構造的に保証済み）」の前提を保護する機構である。worktree 隔離が構造的に保証されているという前提を、実行時に検証して担保する。

### 実行担当サブエージェント委譲フェーズ（Steps 5-6）

**Step 5: 実行担当サブエージェント起動**: 実装実行を外部実行バックエンドへ委譲するため、実行担当サブエージェントを起動する。実行担当サブエージェントは `agentdev-case-run-execution-adapter` skill の adapter protocol に従い、Issue読込・ADR/REQ/SPEC/docs repository context 再確認・外部実行バックエンドへの委譲・blocker処理・result返却を実行する。

- **case-run が直接行わない（実行担当サブエージェント / 外部実行バックエンドの責務）**: work plan生成・実装実行・TDD・乖離検出（QG-3）・specs更新・関連ドキュメント整合性確認・ローカル検証・PR本文作成・PR作成・デプロイ検証
- **実行担当サブエージェントへの引き渡し**: 割り当てられた1 Issue の Issue番号・worktree root（相対パス指定・worktree内制約）・ブランチ名。実行担当サブエージェントはこの1 Issue のみを実装対象とする（Wave全体や他子Issue のオーケストレーションは含まない）
- ハーネス起動方式（CLI subprocess）の詳細は `agentdev-case-run-execution-adapter` スキル参照。AGENTS.md で指定されたハーネスを読み込んで起動する
- 外部実行ハーネスの plan artifact 等の中間成果物の内部構造に依存した処理・検証を行わない（REQ-0139-007）。最終結果は PR URL で受領する
- 実行担当サブエージェントが Issue 完了条件チェックボックスを更新しない（case-close QG-4 の責務）
- Findings / Capture 候補は実行担当サブエージェントが PR 本文の `## Findings / Capture候補` に記録する
- **外部実行手段の中間成果物**: 外部実行手段の plan artifact 等の中間成果物を AgentDevFlow の永続成果物（draft/Issue/PR/REQ/ADR/SPEC）として扱わない（REQ-0139-007）
- **SPEC確定候補（ADR-0123 Decision #4, REQ-0136-015）**: 実装時に発見された SPEC レベルの詳細（SPEC に記載すべき schema・enum・判定表・内部アルゴリズム等、実装で判明した仕様詳細）は、実行担当サブエージェントが PR 本文の `## SPEC確定候補` セクションに記録する。`## Findings / Capture候補`（本筋外発見・intake/learning 候補）とは別セクションとし、混在させない。SPEC確定候補は case-close Step 3 で SPEC 確定チェックの入力となり、draft → accepted 昇格または spec-save 再起動の判断材料となる

**Step 6: 実行担当サブエージェント result 処理**: 実行担当サブエージェントが返す3状態（`agentdev-case-run-execution-adapter` の result 契約）のいずれかを処理する:

- **completed(pr)**: 実装完了・PR作成済み。PR番号を受け取りクリーンアップフェーズへ。成功成果は PR 作成である
- **blocked**: 回答可能な blocker。詳細本文は Issue コメントに SSoT として記録済み（実行担当サブエージェント責務）。エラー処理に従い停止・ユーザー報告
- **failed**: repository context で回答不能な blocker。詳細本文は Issue コメントに構造化して記録済み（実行担当サブエージェント責務）。エラー処理に従い停止・ユーザー報告

### クリーンアップフェーズ（Step 7）

**Step 7**: worktree クリーンアップ確認 + 完了報告
- 未コミット変更あり: 報告してユーザーの指示に従う。自動的な破棄・コミットは行わない
- 未コミット変更なし: 完了報告へ。.sisyphus/ の削除は行わない（case-close で実施）
- 完了報告templateに従って出力（実行担当サブエージェント result 状態・PR番号を含める）

## エラー処理

エラー発生時の対応は `agentdev-workflow-orchestration` に従う。実行担当サブエージェント result が blocked / failed の場合、Issue コメント（SSoT）を参照して停止理由・再開ポイントをユーザーに報告する。実行担当サブエージェント内の自律修正ループ（同一入力の機械的再試行・検証ループ）は `agentdev-case-run-execution-adapter` / `agentdev-workflow-orchestration` に従う。

## Guardrails

### orchestration・委譲境界
- G01: 壁打ち禁止（構造的実行フェーズ — 実装は実行担当サブエージェント経由）
- G02: 実装で判明した制約はREQを黙って変更せず、実行担当サブエージェントが乖離として報告しユーザー承認後に反映
- G04: 全ファイル操作はworktree内で実行
- G05: Issue番号省略は同一セッション内で作成済みの場合のみ
- G06: Issue番号解決に `gh issue list` 等のopen issue一覧取得は禁止
- G10: work_type 判定基準は `agentdev-workflow-lifecycle` を参照
- G11: case-run は1 call あたり1 Issue のみを処理する。複数 Issue の一括実行・Epic 全体の一括実行・Wave 単位オーケストレーションは提供しない（REQ-0130-010, REQ-0130-011）
- G22: case-run は実装実行を実行担当サブエージェントへ委譲し、自ら work plan生成・実装・乖離検出・specs更新・PR作成を行わない（ADR-0114）。adapter protocol は `agentdev-case-run-execution-adapter` 参照
- G23: 実行担当サブエージェント result の3状態（completed(pr)/blocked/failed）は `agentdev-case-run-execution-adapter` の result 契約に従う。成功成果は PR 作成である
- G24: 完了条件チェックボックスの評価・更新は case-close QG-4 の責務。case-run・実行担当サブエージェント・外部実行バックエンドは完了条件チェックボックスを更新しない
- G25: blocked / failed の詳細本文 SSoT は Issue コメント。completed の SSoT は PR 本文。一時会話コンテキスト・中間ファイルは SSoT としない
- G26: 外部実行ハーネスの plan artifact 等の中間成果物の内部構造に依存した処理・検証を行わない（REQ-0139-007）。最終結果は PR URL で受領する。
- G29: 外部実行手段の中間成果物を AgentDevFlow の永続成果物として扱わない（REQ-0139-007）
- G30: Step 5（実行担当サブエージェント起動）の前に worktree+ブランチが作成済みであることを検証すること（Step 4-2 precondition gate）。未作成時・メインリポジトリにいる場合は実行担当サブエージェントを起動禁止（REQ-0137 適用範囲対象外「case-run の worktree 隔離フェーズ（構造的に保証済み）」の前提保護）
- G31: 実行担当サブエージェントへの引き渡しにおいて worktree root（相対パス・`.worktrees/{N}-{type}/`）を必ず含め、メインリポジトリパスを渡さないこと

### 本筋外発見の退避方針

intake / learning 境界は `agentdev-workflow-orchestration` を参照する。実行担当サブエージェントが PR 本文の `## Findings / Capture候補` に記録する。

- G14: スコープ拡大禁止。発見は記録し修正は後続処理に委ねる
- G15: intake 候補を PR 本文の `## Findings / Capture候補` に記録。`.agentdev/intake/inbox/` の直接変更禁止
- G16: learning 候補を intake 候補と区別して記録
- G17: intake/learning 候補を混ぜた単一成果物にしない。capture 境界の詳細は `agentdev-workflow-orchestration/references/capture-boundaries.md` を参照（case-run の capture 責務は記録のみ）
- G21: `.agentdev/learning/inbox.md` の直接変更禁止。capture 情報は PR 本文経由のみ case-close に引き継ぐ
- G27: SPEC確定候補（実装で発見された SPEC レベル詳細）は PR 本文の `## SPEC確定候補` セクションに記録し、`## Findings / Capture候補` とは混在させない（ADR-0123 Decision #4）。SPEC確定候補の確定・SPEC ファイルへの反映判断は case-close の責務
