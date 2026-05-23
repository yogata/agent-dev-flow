---
description: agentdev コマンドセットの使用ガイド
---

# agentdev コマンド使用ガイド

AgentDevFlow の全ドメイン（req/case/learning/intake/integrity）パイプラインを提供するコマンドセット。

## コマンド一覧

| コマンド | 役割 | 対象フェーズ |
|----------|------|-------------|
| `/agentdev/req-define` | 要件の壁打ち・整理 | 壁打ちフェーズ |
| `/agentdev/req-save` | 壁打ち成果物をREQ/ADRファイルとして保存 | 壁打ちフェーズ |
| `/agentdev/case-open` | REQファイルからGitHub Issue作成 | 壁打ちフェーズ |
| `/agentdev/case-run` | 計画立案から実装・コミット・PR作成まで一括実行 | 構造的実行フェーズ |
| `/agentdev/case-update` | Issue本文の更新やコメント追加 | 構造的実行・レビュー完了 |
| `/agentdev/case-close` | PRマージ・記録追記・Issueクローズ・ブランチ削除 | レビュー完了フェーズ |

### learning コマンド（学びの蓄積・分析・昇華）

| コマンド | 役割 | 対象フェーズ |
|----------|------|-------------|
| `/agentdev/learning-refine` | inbox を問題クラス分類→8軸評価→archive移動 | 学びパイプライン |
| `/agentdev/learning-promote` | 評価レポートから昇華判定→staging stub生成 | 学びパイプライン |

### intake コマンド（未回収課題の回収）

| コマンド | 役割 |
|----------|------|
| `/agentdev/intake-capture` | 変更候補を intake item として保存 |
| `/agentdev/intake-from-github` | クローズ済み issue/PR から残課題を intake item として保存 |
| `/agentdev/intake-review` | intake item の review・採用可否判断 |
| `/agentdev/intake-promote` | review 済み item を後続コマンド用 artifact に整形 |
| `/agentdev/intake-open` | intake-promote 生成 artifact から GitHub Issue を作成 |

### integrity コマンド（整合性検証）

| コマンド | 役割 |
|----------|------|
| `/agentdev/integrity-check` | ドキュメント・スキル・コマンドの整合性を検証 |

## 基本フロー

### req/case パイプライン（開発ワークフロー）

```
/agentdev/req-define → /agentdev/req-save → /agentdev/case-open → /agentdev/case-run → /agentdev/case-close
```

バグ修正・軽微変更の場合、`req-save` をスキップ:

```
/agentdev/req-define → /agentdev/case-open → /agentdev/case-run → /agentdev/case-close
```

### learning パイプライン（学びの蓄積・分析・昇華）

```
学び発生 → learning-capture（スキル）→ /agentdev/learning-refine → /agentdev/learning-promote → /agentdev/req-define（明示入力ファイル）
```

### intake ワークフロー（気づき・課題の収集・レビュー・昇華）

```
/agentdev/intake-capture / /agentdev/intake-from-github → /agentdev/intake-review → /agentdev/intake-promote → /agentdev/req-define または /agentdev/intake-open
```

### integrity ワークフロー（整合性検証）

```
/agentdev/integrity-check
```

## 各コマンドの詳細

- `/agentdev/req-define` — [req-define.md](./req-define.md)
- `/agentdev/req-save` — [req-save.md](./req-save.md)
- `/agentdev/case-open` — [case-open.md](./case-open.md)
- `/agentdev/case-run` — [case-run.md](./case-run.md)
- `/agentdev/case-update` — [case-update.md](./case-update.md)
- `/agentdev/case-close` — [case-close.md](./case-close.md)
- `/agentdev/intake-open` — [intake-open.md](./intake-open.md)
- `/agentdev/intake-capture` — [intake-capture.md](./intake-capture.md)
- `/agentdev/intake-from-github` — [intake-from-github.md](./intake-from-github.md)
- `/agentdev/intake-review` — [intake-review.md](./intake-review.md)
- `/agentdev/intake-promote` — [intake-promote.md](./intake-promote.md)
- `/agentdev/learning-refine` — [learning-refine.md](./learning-refine.md)
- `/agentdev/learning-promote` — [learning-promote.md](./learning-promote.md)
- `/agentdev/integrity-check` — [integrity-check.md](./integrity-check.md)
