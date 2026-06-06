# Bare slash command 形式の残存（agentdev prefix なし）

## 観測
integrity-check により、14件の bare slash command 形式（`/case-open` 等、`agentdev/` prefix なし）が以下のファイルで検出された:

**NG 14件（legacy-namespace + expanded-legacy-namespace 重複含む）:**

| ファイル | 検出パターン |
|----------|-------------|
| `.opencode/skills/agentdev-workflow-orchestration/SKILL.md` | `/case-run` |
| `.opencode/commands/agentdev/case-close.md` | `/case-close` |
| `.opencode/commands/agentdev/case-open.md` | `/case-open` |
| `.opencode/commands/agentdev/case-update.md` | `/case-update` |
| `.opencode/commands/agentdev/req-define.md` | `/req-define` |
| `.opencode/commands/agentdev/req-save.md` | `/req-save` |
| `docs/specs/system.md` | `/case-close`, `/req-define` |

## 今回扱わない理由
integrity-check の読み取り専用制約により、検出のみを実施し修正は行わなかった。

## 影響
- bare slash 形式はユーザーが誤ったコマンド名で実行する原因になる
- agentdev namespace への移行が不完全であることを示す指標

## レビューで決めること
- 各ファイルの該当箇所が意図的な言及（例: 歴史的説明）か修正対象かの判定
- 修正する場合は `/agentdev/{cmd}` 形式への統一でよいか

## 根拠
- integrity-check カテゴリ: Namespace / legacy-namespace, expanded-legacy-namespace
- 分類: `obsolete-structure`
- ルート: `intake`
- 検出元: `.agentdev/integrity/reports/2026-06-04-integrity-report.md`
