# intake: worktree 環境で junction 未設定により実コマンド検証テストが一部失敗する

## 発生日

2026-08-06

## 発生元

- Issue: #1926 (WP-1 基準文書・frontmatter・旧検査契約の正常化 OU-002)
- PR: #1933
- Epic: #1924 (AgentDevFlow 2026-08 移行)
- 取得元: PR #1933 本文「## Findings / Capture候補」セクション

## 問題事象

worktree 環境で `.opencode/commands/agentdev/` が空（junction 未設定）により、実コマンド検証テストが実行されない。`commands_structure.test.ts`、`commands_error_cases.test.ts`、`command_fixtures.test.ts` はソースパス（`src/opencode/commands/agentdev/`）へのフォールバックを実装したが、他のテスト（`commands_e2e.test.ts`、`skills_structure.test.ts`、`templates_structure.test.ts` 等）は同様のフォールバック未実装で worktree では失敗する。CI環境（main ブランチ）では junction が存在するため問題ないが、worktree 開発時のテスト実行精度に影響する。

## 影響

- worktree で開発する全ケース（case-run、case-auto の worktree-per-Wave モデル）で、実コマンド検証テストが一部実行されず、実装不具合の検出が遅れる
- worktree と CI（main ブランチ）のテスト結果に差異が生じ、開発者の手元で pass しても CI で fail する、またはその逆のケースが発生し得る
- 今回（PR #1933）は `commands_*` 系3テストへフォールバックを実装したが、`commands_e2e.test.ts`、`skills_structure.test.ts`、`templates_structure.test.ts` 等、未対応のテストが残る

## 発生局面

実装（Wave 2 WP-1 case-run、PR #1933 作成時）

## 検知方法

PR #1933 case-run 実装中、`commands_*` 系テストへ junction 未設定時のフォールバックを実装する際、同種のフォールバックが他のテストに未実装であることを確認。PR 本文 Findings へ記録。

## 想定される対応方向

- `commands_e2e.test.ts`、`skills_structure.test.ts`、`templates_structure.test.ts` 等、未対応テストへ `src/opencode/` ソースパスへのフォールバックを追加実装する
- または共通ヘルパ（例: `resolveCommandsDir()` 等）を抽出し、全構造系テストへ適用する
- worktree 環境でも CI と同等のテストカバレッジを確保する運用方針を `docs/specs/` または `docs/guides/` へ記載する

## 関連

- Epic: #1924
- Issue: #1926 (WP-1)、#1925 (WP-0)
- PR: #1933 (squash merge 18b522024)
- 対象ファイル: `.opencode/skills/repo-agentdev-integrity/scripts/` 配下の構造系テスト群

## 出典引用

PR #1933 本文「## Findings / Capture候補」より:

> worktree 環境で `.opencode/commands/agentdev/` が空（junction 未設定）により、実コマンド検証テストが実行されない問題がある。`commands_structure.test.ts`、`commands_error_cases.test.ts`、`command_fixtures.test.ts` はソースパス（`src/opencode/commands/agentdev/`）へのフォールバックを実装したが、他のテスト（`commands_e2e.test.ts`、`skills_structure.test.ts`、`templates_structure.test.ts` 等）は同様のフォールバック未実装で worktree では失敗する。CI環境（main ブランチ）では junction が存在するため問題ないが、worktree 開発時のテスト実行精度に影響する

## タグ

#intake #worktree #junction #test-fallback #repo-agentdev-integrity #wp-1 #migration-2026-08
