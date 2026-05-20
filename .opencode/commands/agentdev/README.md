---
description: agentdev コマンドセットの使用ガイド
---

# agentdev コマンド使用ガイド

AgentDevFlow の req/case パイプラインを提供するコマンドセット。

## コマンド一覧

| コマンド | 役割 | 対象フェーズ |
|----------|------|-------------|
| `/agentdev/req-define` | 要件の壁打ち・整理 | 壁打ちフェーズ |
| `/agentdev/req-save` | 壁打ち成果物をREQ/ADRファイルとして保存 | 壁打ちフェーズ |
| `/agentdev/case-open` | REQファイルからGitHub Issue作成 | 壁打ちフェーズ |
| `/agentdev/case-run` | 計画立案から実装・コミット・PR作成まで一括実行 | 構造的実行フェーズ |
| `/agentdev/case-update` | Issue本文の更新やコメント追加 | 構造的実行・レビュー完了 |
| `/agentdev/case-close` | PRマージ・記録追記・Issueクローズ・ブランチ削除 | レビュー完了フェーズ |

### intake コマンド（未回収課題の回収）

| コマンド | 役割 |
|----------|------|
| `intake-capture` | 変更候補を intake item として保存 |
| `intake-from-github` | クローズ済み issue/PR から残課題を intake item として保存 |
| `intake-review` | intake item の review・採用可否判断 |
| `intake-promote` | review 済み item を後続コマンド用 artifact に整形 |
| `intake-open` | intake-promote 生成 artifact から GitHub Issue を作成 |

## 基本フロー

```
/agentdev/req-define → /agentdev/req-save → /agentdev/case-open → /agentdev/case-run → /agentdev/case-close
```

パターンA（バグ修正・軽微変更）の場合、`req-save` をスキップ:

```
/agentdev/req-define → /agentdev/case-open → /agentdev/case-run → /agentdev/case-close
```

## 各コマンドの詳細

- `/agentdev/req-define` — [req-define.md](./req-define.md)
- `/agentdev/req-save` — [req-save.md](./req-save.md)
- `/agentdev/case-open` — [case-open.md](./case-open.md)
- `/agentdev/case-run` — [case-run.md](./case-run.md)
- `/agentdev/case-update` — [case-update.md](./case-update.md)
- `/agentdev/case-close` — [case-close.md](./case-close.md)
- `/agentdev/intake-open` — [intake-open.md](./intake-open.md)
