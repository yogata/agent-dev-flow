---
description: PRをマージし、対応記録を追記し、Caseをクローズしてブランチを削除する
agent: sisyphus
implementation_pattern: file-pipeline
load_skills:
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
  - agentdev-gh-cli
  - agentdev-git-worktree
  - agentdev-workflow-templates
---

# 完了処理

PRをマージし、Caseに記録を追記し、クローズ後にworktreeとブランチを削除する。レビュー完了フェーズ。

## Input

- Issue番号
- PR番号（または自動検出）

## Output

- マージ済みPR
- クローズ済みCase
- 削除済みブランチ・worktree

## Steps

1. **Issue番号解決**: ユーザー入力またはセッション内会話から番号を取得。複数候補時は直近を優先して確認。検出不可時はユーザーに指定を求めて停止

2. **前提確認**: 達成判定・完了ゲート → `agentdev-workflow-lifecycle` の達成判定プロトコル（5条件判定・自律解決判定）に従い、Issue本文の完了条件チェックボックスを検証:
   - unchecked項目を達成判定（証拠ソース・5条件プロトコル）
   - 達成不可項目を自律解決判定（変更対象分類×検証種別分類）
   - `agentdev-gh-cli` に従い `--body-file` で Issue本文更新 → VERIFY
   - 未達項目が残る場合 → 構造化エラーで停止（G08）
   - PR存在確認

3. **docs/ 検証**: 機能追加固有の検証（REQ作成・インデックス記載・spec更新・ADR作成）および全パターン共通の関連ドキュメント整合性確認。DOC-MAP整合性確認（REQ-0101）。不足時は警告表示してユーザー判断を仰ぐ

4. **PRマージ**: `gh pr merge` → HEAD commit hash 記録（`agentdev-git-worktree` references/git-common-procedures.md Section 3）。対応記録コメントをIssueに追記 → テンプレート: `agentdev-workflow-templates` から Read → `agentdev-gh-cli` の VERIFY 操作に従って内容検証

5. **Post-merge テスト戦略検証**: マージ後のみ確認可能な項目（CI通過等）を反映。`agentdev-gh-cli` に従い `--body-file` で更新 → VERIFY

6. **Issueクローズ**: `gh issue close --reason completed`

7. **ブランチ・worktree削除**: `agentdev-git-worktree` の worktree削除手順に従う:
   - 未コミット変更検出（`agentdev-git-worktree` references/git-common-procedures.md Section 4）
   - squash merge 済みの場合 → `git checkout .` で破棄可（SHALL）
   - .sisyphus/ クリーンアップ
   - worktree remove → Permission denied 時は停止（リトライは skill 定義に従う）
   - ローカルブランチ削除（squash merge 後の条件付き `-D` は skill 定義に従う）
   - リモートブランチ削除
   - 削除失敗時は警告表示して停止（SHALL）

8. **親Epic Issue更新**: `agentdev-epic-tracker` スキル参照:
   - Issue本文から Parent Issue番号を特定（`Parent: #{N}` パターン）
   - Parent なし → スキップ
   - ステータストラッキング表を更新 → `agentdev-gh-cli` VERIFY
   - Epic自動クローズ判定: 全子Issue CLOSED → 自動クローズ。1件以上 OPEN → スキップ

9. **実行前同期**: `agentdev-git-worktree` の 実行前同期（references/git-common-procedures.md Section 1）に従い `git pull --ff-only` を実行。ローカル変更事前チェック・hash検証・不一致時は評価・承認のやり直し

10. **学びの検知・抽出**: `agentdev-learning-capture` スキル（manual reference）に従い、エージェントが自ら学びの有無を判断:
    - ユーザーに学びの有無を問うことは禁止
    - 学びあり → `.agentdev/learning/inbox.md` に直接追記 → 通知
    - staging stub imported 判定 → `agentdev-learning-pipeline`（manual reference）の archive ルール
    - Post-run intake capture: 本筋外の変更候補を intake item として `.agentdev/intake/inbox/` に保存。PR本文の `## Findings / Intake候補` セクションから回収。Epic横断回収。Split Rule は `agentdev-workflow-lifecycle` → `references/capture-boundaries.md` を SSoT とする
    - intake と learning を別々の成果物として扱う（SHALL）

11. **Domain state 永続化**: `agentdev-git-worktree` の domain state 永続化（references/git-common-procedures.md Section 2）に従い `.agentdev/` 配下を commit/push。learning と intake を同一 commit に含める（SHALL）

12. **完了報告**: `agentdev-workflow-reporting` の完了報告variantに従って出力。結果状態に応じたvariantを選択:
    - 全系統成功 → completion-reports/case-close/standard.md
    - .agentdev push失敗 → completion-reports/case-close/agentdev-push-failed.md
    - ブランチ・worktree削除失敗 → completion-reports/case-close/worktree-cleanup-failed.md
    - GitHub完了後に .agentdev push失敗の場合は standard variant を使用してはならない（MUST NOT, REQ-0107-034）
    - **結果状態の分離報告**（SHALL）: GitHub側完了状態・`.agentdev` 永続化状態・ブランチ削除状態を独立して報告

## Guardrails

- G01: 未マージPRはクローズしない
- G02: Issue番号省略は同一セッション内で作成済みの場合のみ
- G03: Issue番号解決に `gh issue list` / `gh issue status` 等は禁止。ユーザー入力またはセッション内会話からのみ
- G04: Epic自動クローズは全子IssueがCLOSEDの場合のみ
- G05: ブランチ・worktree削除は必ず実行。失敗時は警告表示して停止
- G06: `git pull --ff-only` は必ず実行。pull前ローカル変更チェック・hash検証必須
- G07: PRのCI通過確認。CI失敗時は case-run に差し戻す
- G08: 未達チェックボックスが残る場合、構造化エラーで停止（REQ-0106）
- G09: 機能追加で docs/ 更新がない場合、警告表示して停止確認
- G10: テスト戦略チェックボックスを必ず更新
- G11: コメントテンプレートの【必須】セクション確認
- G12: `agentdev-gh-cli` に従い `--body-file` を使用（`--body` 直接指定禁止）
- G13: 学びの検知はエージェント自律。ユーザーに問わない
- G14: gh CLI出力読み取りは `agentdev-gh-cli` の安全な手順に従う
- G15: intake と learning を混合した単一成果物にしない（Split Rule 準拠）
- G16: 今回の完了条件に含まれる未対応事項を intake に逃がして完了扱いにしない
- G17: Step 11 の commit は `.agentdev/` 配下のみ。他パスを巻き込まない
- G18: learning と intake を同一 commit に含める
- G19: Step 12 は結果状態を分離して報告。`.agentdev` push失敗時は完了扱いにしない
