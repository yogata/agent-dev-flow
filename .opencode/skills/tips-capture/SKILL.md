---
name: tips-capture
description: Extracts and captures learnings when problems are solved. Use when fixing bugs, completing investigations, finishing implementations, or discovering technical insights.
---

# tips-capture

会話中に得られた学びを自動検知し、ユーザー確認を経て蓄積するスキル。

## いつトリガーするか

以下のタイミングでこのスキルを検討する：

- バグを修正したとき
- 調査が完了し、原因が判明したとき
- 新しい実装が完了したとき
- エラーの解決策を見つけたとき
- 技術的な発見や気づきがあったとき

## Prerequisites

学びの保存先：
- `docs/tips/inbox.md` — 最新の学び（常にここに追加）
- `docs/tips/archive.md` — 過去の学び（/tips-refactor実行時に移動）

> **注意**: inbox.md、archive.mdが存在しない場合、/tips-add が自動で作成する。

## How to Use This Skill

### Step 1: 学びの検知

問題解決後、以下を自問する：

1. **今回の解決で何を学んだか？**
2. **将来同じ問題に遭遇したら、どうすれば防げるか？**
3. **他の開発者にも共有すべき知見か？**

### Step 2: 学びの抽出

学びがあると判断した場合、以下の形式で要約する：

```
## [タイトル]

**状況**: [どのような状況で発生したか]
**原因**: [根本原因は何か]
**解決策**: [どう解決したか]
**教訓**: [将来への指針]
**タグ**: #バグ修正 #調査 #実装 など
```

> **注意**: `**タグ**` フィールドは人間の可読性のため保持している。セマンティック分析（/tips-refactor）ではタグに依存せず、LLMが内容からテーマを判定する。

### Step 3: ユーザー確認

学びを追加する前に、必ずユーザーに確認する：

> 今回の対応で以下の学びがありました。`docs/tips/inbox.md` に追加しますか？
>
> [学びの内容を表示]
>
> - はい / いいえ

### Step 4: 学びの追加

ユーザーが承認したら、`/tips-add` コマンドの使用を提案する：

```
/tips-add "[タイトル]" --tags "[タグ1],[タグ2]"
```

または、直接 `docs/tips/inbox.md` に追記する。

### Step 5: 閾値チェック

inbox.mdのエントリ数（`## ` で始まる行）をカウントする。
15件以上の場合、以下を提案する：

> inbox.mdが{N}件になっています。`/tips-refactor` で分析することを推奨します。

---

## Example Workflow

See [references/example.md](references/example.md) for a complete workflow example.

---

## Tips

1. **タイミングを逃さない** — 問題解決直後に記録するのが最も効果的
2. **簡潔に** — 長すぎる学びは読まれない。要点を絞る
3. **タグを活用** — 後で検索しやすいようにタグを付ける
4. **ユーザー確認は必須** — 自動的に追加せず、必ず確認を取る
5. **inbox.mdが溜まったら** — 15件以上で `/tips-refactor` を提案

---

## MUST NOT

- **自動的に学びを追加しない** — 必ずユーザー確認が必要
- **強制しない** — ユーザーが「いいえ」と言えば追加しない
- **複雑なロジックを使わない** — シンプルなテキスト追記のみ
