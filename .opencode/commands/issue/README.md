---
description: issue コマンドセットの使用ガイド
---

# issue コマンド使用ガイド

機能追加とバグ修正を統一された `issue` コマンドセットでサポートします。

## 3マクロフェーズ

| フェーズ | 内容 | コマンド |
|---|---|---|
| ①バイブス壁打ち | 要件定義・技術判断を壁打ちで決定 | `/issue/issue-req` → `/issue/issue-create` |
| ②構造的実行 | TDD・コーディング・デバッグを実行 | `/issue/issue-work` |
| ③レビュー完了 | PR・マージ・決定事項クローズ | `/issue/issue-close` |

**イメージ違ったら**: 要件定義に立ち戻り①からやり直し（`/issue/issue-req`）

## スキル一覧

ロジックと知識ベースを提供するスキル群。コマンドはこれらの薄いdispatcher。

| スキル | 役割 |
|---|---|
| `issue-guide` | ワークフロー統括ハブ（フェーズ・パターン・検証） |
| `req-analysis` | 要件分析手法（機能・非機能の分析・品質基準） |
| `decision-log` | 決定事項のトレーサビリティ管理 |
| `deviation-check` | 乖離検出（要件とのズレ検知・ループバック判定） |
| `adr-guidelines` | ADR閾値判定（アーキテクチャ級の決定） |

## コマンド一覧

L2薄化形式（Input/Output/Steps+スキル参照/Guardrails）。詳細は各コマンドファイルを参照。

| コマンド | 役割 | スキル参照 |
|---|---|---|
| `/issue/issue-req` | 要件定義（壁打ち） | req-analysis, decision-log |
| `/issue/issue-create` | Issue登録 | issue-guide |
| `/issue/issue-work` | 実装パイプライン | req-analysis, decision-log, deviation-check |
| `/issue/issue-update` | Issue更新 | issue-guide |
| `/issue/issue-close` | 完了処理 | decision-log |
| `/issue/issue-next` | 次コマンド推論 | deviation-check |

## 決定事項管理

壁打ちフェーズでの技術判断は `decisions/DEC-XXX-slug.md` に記録します。

- **ライフサイクル**: proposed → accepted → implemented
- **ADR境界**: アーキテクチャ級はADR、モジュール内はDecision Log
- **トレーサビリティ**: 要件 → 決定 → PR → マージ

## 基本フロー

```
/issue/issue-req → /issue/issue-create → /issue/issue-work → /issue/issue-close
```

ループバック: `/issue/issue-next` が乖離検出時に `/issue/issue-req` へ戻すことを提案。

## 各コマンドの詳細

- `/issue/issue-req` — [issue-req.md](./issue-req.md)
- `/issue/issue-create` — [issue-create.md](./issue-create.md)
- `/issue/issue-work` — [issue-work.md](./issue-work.md)
- `/issue/issue-update` — [issue-update.md](./issue-update.md)
- `/issue/issue-close` — [issue-close.md](./issue-close.md)
- `/issue/issue-next` — [issue-next.md](./issue-next.md)

## テンプレート

`templates/` ディレクトリに配置。詳細は `issue-guide` スキルを参照。
