---
description: PRをマージし、対応記録を追記し、Caseをクローズしてブランチを削除する
agent: sisyphus
---

# 完了処理

PRをマージし、Caseに記録を追記し、クローズ後にworktreeとブランチを削除する。レビュー完了フェーズ。

**完了条件チェックボックスの評価・更新は case-close の専任責務**（ADR-0114）。case-run / driver / 外部実行バックエンドが完了条件チェックボックスを更新しない。case-close は PR 作成後に別コンテキストで Issue 本文の完了条件を再読込し、PR 本文を capture 入力源として最終完了判定する。

## Input

- Issue番号
- PR番号（または自動検出）

## Output

- マージ済みPR
- クローズ済みCase
- 削除済みブランチ・worktree

## Steps

1. **Issue番号解決**: ユーザー入力またはセッション内会話から番号を取得。複数候補時は直近を優先して確認。検出不可時はユーザーに指定を求めて停止

1-1. **重複ファイルチェック**: merge/pull 実行前に、ローカル未コミット変更ファイルと対象 PR 変更ファイルの重複を検出する:
     - `git status --short` でローカル未コミット変更ファイル一覧を取得
     - `gh pr view {pr_number} --json files` で対象 PR 変更ファイル一覧を取得
     - 両者の重複ファイルを特定
     - 重複ファイルが存在する場合: 構造化警告を提示し、ユーザーによる対応（`git stash` / commit / `git checkout -- <file>` / worktree利用）を促して停止する
     - 重複なしの場合: 後続ステップへ進む
     - `gh pr view` 実行不可時: 後方互換性として Step 9（実行前同期）でフォールバック検出を維持

2. **前提確認**: 達成判定・完了ゲート（QG-4）→ `agentdev-quality-gates` の QG-4（Final Acceptance Gate）に従い、Issue本文の完了条件チェックボックスを最終評価・更新する。判定基準・検査観点は同スキルの `.opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md` を参照:
   - **完了条件チェックボックス評価・更新は case-close の責務**（QG-4）。case-run・実行担当サブエージェント・外部実行バックエンドは完了条件チェックボックスを更新しない（ADR-0114）。case-close は case-run / 実行担当サブエージェントとは**別コンテキスト**で、PR 作成後に独立して完了条件を再読込して最終完了判定する
   - unchecked項目を達成判定（証拠ソース・`agentdev-workflow-orchestration` のプロトコルに従い）し `[x]` に更新
   - 達成不可項目を自律解決判定（変更対象分類×検証種別分類）
   - `agentdev-gh-cli` に従い `--body-file` で Issue本文更新 → VERIFY
   - **事後確認（再読込 VERIFY）**: 更新後にIssue本文を再読込し、完了条件セクションの全 `- [ ]` が `[x]` に反映されていることを確認。未反映の場合は再更新（最大2回）し、それでも失敗する場合は構造化エラーで停止
   - 未達項目が残る場合 → 構造化エラーで停止（G08）
   - PR存在確認

3. **docs/ 検証**: 機能追加固有の検証（REQ作成・インデックス記載・spec更新・ADR作成）および全work_type共通の関連ドキュメント整合性確認。DOC-MAP整合性確認。不足時は警告表示してユーザー判断を仰ぐ。PR 本文の `## SPEC確定候補` セクションから SPEC 確定フロー（Step 3-2）を実行する
    - **文書分類ポリシー適合確認**: `docs/specs/document-model.md` の Document Classification Policy に基づき、最終ドキュメント状態が分類ポリシーに適合していることを確認する

3-1. **close 時 SPEC / commands / skills 更新漏れの局所確認**: 実装完了・PRマージ前に、今回の変更に伴う以下の更新漏れを局所的に確認する:
    - SPEC 本文と実装の最終矛盾確認
    - 変更に伴う command 定義の更新漏れ
    - 変更に伴う skill 責務境界の変更漏れ
    - 更新漏れを検出した場合は警告表示してユーザー判断を仰ぐ
    - **局所予防の範囲**: この確認は close 時の局所的な漏れ検出であり、`/agentdev/inspect-docs` の全体意味レビューの代替ではない

3-2. **SPEC 確定フロー（ADR-0123 Decision #4, REQ-0136-015）**: PR 本文の `## SPEC確定候補` セクション（case-run / driver が記録）を読み取り、SPEC の確定・昇格を処理する。セクションが存在しない・空の場合はスキップする:
    - **SPEC確定候補の提示**: SPEC確定候補一覧（対象 SPEC・内容・分類）をユーザーに提示する
    - **確定判断**: 各候補について以下のいずれかをユーザー承認のもと選択する:
      - (a) **case-close 内で SPEC 昇格**: 対象 SPEC の `status` を `draft` → `accepted` に昇格する（編集スコープ: `docs/specs/**`）。実装が SPEC 内容を検証済みであることを確認できた場合
      - (b) **spec-save 再起動の提案**: SPEC確定候補が SPEC ファイル未保存（新規 SPEC 候補・追記候補）の場合、`/agentdev/spec-save` の再実行を提案し case-close は完了させる
      - (c) **見送り**: 確定不要と判断した場合、候補を Findings / Capture候補 に準じて記録し後続へ委ねる
    - **SPEC status 昇格タイミング（draft → accepted）**: 以下の両方を満たした場合に昇格させる:
      - 対象 SPEC が `status: draft` であること
      - 今回の実装（PR）が当該 SPEC の内容を検証（実装と整合）したことを case-close Step 3 の docs/検証で確認できたこと
    - 昇格時は SPEC frontmatter `status` を `accepted` に更新し、`updated` 日付を更新する

4. **PRマージ**:
   - `gh pr merge --squash` 実行 → HEAD commit hash 記録（`agentdev-git-worktree` skill に従い）
   - **Squash merge失敗時の自動リトライ**:
     - 失敗時は5秒待機して再試行
     - 最大5回リトライ（初期試行 + 5回リトライ）
     - 各リトライ試行をログ記録
    - **全リトライ失敗時のフォールバック**: フォールバック手順は template (`.opencode/commands/agentdev/templates/case-close/standard.md`) を参照
   - 対応記録コメントをIssueに追記 → テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md` から Readして `agentdev-gh-cli` の VERIFY 操作に従って内容検証

5. **Post-merge テスト戦略検証**: マージ後のみ確認可能な項目（CI通過等）を反映。`agentdev-gh-cli` に従い `--body-file` で更新 → VERIFY

6. **Issueクローズ**: `gh issue close --reason completed`

7. **ブランチ・worktree削除**: `agentdev-git-worktree` の worktree削除手順に従う:
   - 未コミット変更検出（`agentdev-git-worktree` skill に従い）
   - squash merge 済みの場合 → 当該 worktree が隔離されている（専用 worktree + branch で index が独立）場合のみ `git checkout .` で破棄可。**共有作業ツリー（main worktree）では `git checkout .` は禁止**（REQ-0137-001・他セッション変更の無差別破壊）。本 Step は worktree 削除フェーズ内の隔離 worktree でのみ実行する
   - .sisyphus/ クリーンアップ
   - worktree remove → Permission denied 時は停止（リトライは skill 定義に従う）
   - ローカルブランチ削除（squash merge 後の条件付き `-D` は skill 定義に従う）
   - リモートブランチ削除
   - 削除失敗時は警告表示して停止すること

8. **親Epic Issue更新**: `agentdev-epic-tracker` スキル参照:
   - Issue本文から Parent Issue番号を特定（`Parent: #{N}` パターン）
   - Parent なし → スキップ
   - ステータストラッキング表を更新 → `agentdev-gh-cli` VERIFY
   - 子Issue状態事前取得: `gh issue view --json comments` 等で全子Issueの OPEN/CLOSED 状態を一覧取得しログ出力（例: `子Issue状態一覧: #N1 (OPEN), #N2 (CLOSED), ...`）
   - Epic自動クローズ判定: 全子Issue CLOSED → 自動クローズ。1件以上 OPEN → スキップ

9. **実行前同期**: `agentdev-git-worktree` に従い `git pull --ff-only` を実行。ローカル変更事前チェック・hash検証・不一致時は評価・承認のやり直し

10. **学びの検知・抽出**: `agentdev-learning-capture` スキル（manual reference）に従い、エージェントが自ら学びの有無を判断:
      - ユーザーに学びの有無を問うことは禁止
     - 学びあり → `.agentdev/learning/inbox.md` に直接追記 → 通知
     - promoted artifact imported 判定 → `agentdev-learning-pipeline`（manual reference）の archive ルール
      - **Capture 回収責務**: PR 本文の `## Findings / Capture候補` セクションから intake / learning を分離回収する。intake 候補は `.agentdev/intake/inbox/` に保存し、learning 候補は `.agentdev/learning/inbox.md` に保存する。Epic 横断回収
       - **Capture 境界**: intake / learning 境界は `agentdev-workflow-orchestration` を参照
      - intake と learning を別々の成果物として扱う
      - **一時会話コンテキスト不入力**: case-run の一時会話コンテキスト（ローカル変数・中間ファイル等）を capture の入力として使用しない。capture 情報の入力源は PR 本文のみ

 11. **Domain state 永続化**: `agentdev-git-worktree` に従い `.agentdev/` 配下を commit/push。learning と intake を同一 commit に含める

12. **完了報告**: 完了報告templateに従って出力。結果状態に応じた種別を選択:
    - 全系統成功 → .opencode/commands/agentdev/templates/case-close/standard.md
    - .agentdev push失敗 → .opencode/commands/agentdev/templates/case-close/agentdev-push-failed.md
    - ブランチ・worktree削除失敗 → .opencode/commands/agentdev/templates/case-close/worktree-cleanup-failed.md
     - GitHub完了後に .agentdev push失敗の場合は standard 種別 を使用してはならない
     - **結果状態の分離報告**: GitHub側完了状態・`.agentdev` 永続化状態・ブランチ削除状態を独立して報告

## Guardrails

- G01: 未マージPRはクローズしない
- G02: Issue番号省略は同一セッション内で作成済みの場合のみ
- G03: Issue番号解決に `gh issue list` / `gh issue status` 等は禁止。ユーザー入力またはセッション内会話からのみ
- G04: Epic自動クローズは全子IssueがCLOSEDの場合のみ
- G05: ブランチ・worktree削除は必ず実行。失敗時は警告表示して停止
- G06: `git pull --ff-only` は必ず実行。pull前ローカル変更チェック・hash検証必須
- G07: PRのCI通過確認。CI失敗時は case-run に差し戻す
   - G08: 未達チェックボックスが残る場合、構造化エラーで停止。チェックボックス更新後は必ず再読込して反映を確認
- G09: 機能追加で docs/ 更新がない場合、警告表示して停止確認
- G10: テスト戦略チェックボックスを必ず更新
- G11: コメントテンプレートの【必須】セクション確認
- G12: `agentdev-gh-cli` に従い `--body-file` を使用（`--body` 直接指定禁止）
- G13: 学びの検知はエージェント自律。ユーザーに問わない
- G14: gh CLI出力読み取りは `agentdev-gh-cli` の安全な手順に従う
- G15: intake と learning を混合した単一成果物にしない（`agentdev-workflow-orchestration` の capture 境界に準拠）
- G16: 今回の完了条件に含まれる未対応事項を intake に逃がして完了扱いにしない
- G17: Step 11 の commit は並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、明示パス（`git add <path>` / `git rm <path>`）でステージし、`git commit -- <paths>`（--only pathspec 形式）で実行する（REQ-0137-002）。`git add` は capture 成果物の専用サブディレクトリ（`.agentdev/learning/`・`.agentdev/intake/`）または明示パスに限定し、`.agentdev/` 全体の一括スコープにしないこと（REQ-0137-005）。他パスを巻き込まない
- G18: learning と intake を同一 commit に含める
- G19: Step 12 は結果状態を分離して報告。`.agentdev` push失敗時は完了扱いにしない
- G20: 完了条件チェックボックスの評価・更新は case-close の専任責務（ADR-0114）。case-run / driver / 外部実行バックエンドは更新しない。case-close は別コンテキストで Issue 本文を再読込して最終完了判定し、更新後に再読込 VERIFY を必ず実施する
- G21: case-close の capture 責務は回収・保存。PR 本文から intake / learning を分離回収しドメイン状態に保存する。境界の詳細は `agentdev-workflow-orchestration/references/capture-boundaries.md` 参照
- G22: SPEC status 昇格（draft → accepted）は case-close の責務（ADR-0123）。昇格は対象 SPEC が `draft` かつ今回の実装が SPEC 内容を検証済みの場合のみ実施する。spec-save は accepted を付与しない
- G23: SPEC確定候補の処理（Step 3-2）は PR 本文の `## SPEC確定候補` セクションを入力とし、`## Findings / Capture候補` とは区別して扱う
