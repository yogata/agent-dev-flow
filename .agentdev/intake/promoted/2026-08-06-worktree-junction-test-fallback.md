# worktree junction 未設定時の構造系テスト fallback 未実装

## 観測内容

worktree 環境では `.opencode/commands/agentdev/` が空（junction 未設定）となるため、実コマンド検証テストが一部実行されない。
PR #1933 で `commands_structure.test.ts`、`commands_error_cases.test.ts`、`command_fixtures.test.ts` の3テストへソースパス（`src/opencode/commands/agentdev/`）へのフォールバックを実装した。
しかし `commands_e2e.test.ts`、`skills_structure.test.ts`、`templates_structure.test.ts` 等は同様のフォールバック未実装であり、worktree では失敗する。
CI環境（main ブランチ）では junction が存在するため問題ないが、worktree 開発時のテスト実行精度に影響する。

## 影響

worktree で開発する全ケース（case-run、case-auto の worktree-per-Wave モデル）で、実コマンド検証テストが一部実行されず、実装不具合の検出が遅れる。
worktree と CI（main ブランチ）のテスト結果に差異が生じ、開発者の手元で pass しても CI で fail する、またはその逆のケースが発生し得る。
優先度は中。開発時品質ゲートの低下。

## 課題

未対応テスト（`commands_e2e.test.ts`、`skills_structure.test.ts`、`templates_structure.test.ts` 等）へ `src/opencode/` ソースパスへの fallback を実装する。
対応候補:
- 各テストへ個別に fallback を追加実装する
- 共通ヘルパ（例: `resolveCommandsDir()` 等）を抽出し、全構造系テストへ適用する
- worktree 環境でも CI と同等のテストカバレッジを確保する運用方針を `docs/specs/` または `docs/guides/` へ記載する

## 既存要件との関連

- 対象: `.opencode/skills/repo-agentdev-integrity/scripts/` 配下の構造系テスト群
- Epic: #1924（AgentDevFlow 2026-08 移行）
- Issue: #1926（WP-1）、#1925（WP-0）
- PR: #1933（squash merge 18b522024）

## 出典

- inbox 元ファイル: `intake-2026-08-06-wp1-worktree-junction-test-fallback.md`
- 発生日: 2026-08-06
- PR: #1933（Issue #1926 / WP-1, Epic #1924）
