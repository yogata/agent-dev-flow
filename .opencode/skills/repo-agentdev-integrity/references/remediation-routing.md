# Remediation Routing

docs-check / docs-review の finding を適切な是正ルートに振り分けるルールを定義する（REQ-0115-024〜027）。

## 概要

`/repo/docs-check`（機械的検査）と `/agentdev/docs-review`（意味レビュー）の finding を、それぞれの性質に応じた是正ルートへ routing する。両者は feedback loop で連携し、docs 整合性を継続的に改善する。

## docs-check Finding Routes

`/repo/docs-check` の finding は以下のルートに振り分ける（REQ-0115-024）。

| Finding 性質 | Route 先 | 対応内容 |
|-------------|----------|---------|
| 機械的修正可能な不整合 | 対象ファイルの直接修正 | frontmatter 修正、リンク修正、index 同期 |
| 語彙の不整合 | vocabulary-registry.md 更新 | 旧語彙 → 正規語彙の対照表更新 + 検出パターン同期 |
| gate-level 不整合 | gate-levels.md 更新 | 検査カテゴリ・根拠 REQ の追加・修正 |
| fixture 追加が必要なパターン | regression fixture 追加 | テスト fixture ディレクトリに代表パターンを追加 |
| source / projection 不整合 | source / projection 修正 | `src/` 側ソースと `.opencode/` 側投影の同期 |
| template / inventory 不整合 | template / inventory 同期 | command template の更新、README / DOC-MAP の inventory 同期 |

### docs-check → docs-review Route

docs-check の finding のうち、意味判断が必要なもの（heuristic / observation）は `/agentdev/docs-review` へ route する（gate-levels.md の Finding route を参照）。

## docs-review Finding Routes

`/agentdev/docs-review` の finding は以下のいずれかのルートに振り分ける（REQ-0115-025）。

| Finding 性質 | Route 先 | 対応内容 |
|-------------|----------|---------|
| 新規要件・仕様変更が必要 | `/agentdev/req-define` | 意味レビューで判明した要件ギャップ・仕様矛盾の壁打ち入力 |
| 要件変更が必要（実装済み） | RU 化 → `/agentdev/req-define` | REQ 変更を RU として backlog に登録し req-define で処理 |
| 実装のみが逸脱している場合 | case workflow へ戻し | REQ / SPEC の変更は不要とし case-update / case-run で修正（REQ-0115-036） |
| 再現可能な検査に落とせるもの | docs-check rule 追加 | 意味レビュー結果を機械的検査ルール / fixture に変換（REQ-0115-026） |
| 再発防止の知見 | learning / backlog | `.agentdev/learning/inbox.md` または intake inbox へ保存 |

### docs-review → docs-check Rule フィードバック

docs-review の結果で再現可能な検査に落とせるものは、`/repo/docs-check` の rule / fixture へフィードバックする（REQ-0115-026）。

**変換条件**:
- finding が機械的・再現可能なパターンとして表現できる
- 検出根拠を正規表現・ファイル存在確認・frontmatter 検査等の形で定義できる
- false positive を除外するコンテキストルールを併記できる

**フィードバック手順**:
1. docs-review finding を分析し、機械的検査への変換可能性を判定
2. 変換可能な場合、gate-levels.md に該当カテゴリを追加（strict / heuristic / observation のいずれか）
3. vocabulary-registry.md の更新が必要な場合は対照表に追加
4. regression fixture を追加（REQ-0108-055）
5. 検出スクリプトに検査ルールを実装

## Feedback Loop

docs-check → docs-review → req/case/RU → docs-check rule 追加の feedback loop を定義する（REQ-0115-027）。

```
┌──────────────┐
│  docs-check  │ 機械的検査
│  (/repo/)    │
└──────┬───────┘
       │ finding（意味判断が必要なもの）
       ▼
┌──────────────┐
│  docs-review │ 意味レビュー
│  (/agentdev/)│
└──────┬───────┘
       │ finding route
       ├─→ /agentdev/req-define（新規要件・仕様変更）
       ├─→ RU 化（要件変更が必要）
       ├─→ case-update / case-run（実装修正）
       ├─→ learning / backlog（再発防止知見）
       └─→ docs-check rule 追加 ←────────────┐
              │                                │
              ▼                                │
       ┌──────────────┐                        │
       │  docs-check  │ rule/fixture が強化された状態
       │  (/repo/)    │
       └──────────────┘
```

### Loop の性質

- **単方向ではなく循環**: docs-check が検出 → docs-review が意味判断 → rule 追加で docs-check が強化され、次回の検出精度が向上する
- **即時反映はしない**: rule 追加は別の workflow（req-define → case-run 等）で実行される。docs-review 実行中に docs-check rule を変更しない
- **読み取り専用の原則**: `/agentdev/docs-review` は read-only であり、finding の route 先を提示するが実行はしない（REQ-0115-008）

## 局所予防との関係

req-* / case-* workflow での局所予防（REQ-0115-019〜023）と本 remediation routing の関係:

- 局所予防は各 workflow step 内での漏れ検出・防止を担う
- 本 remediation routing は docs-check / docs-review の finding を適切な是正ルートへ振り分ける
- 局所予防は `/agentdev/docs-review` の全体意味レビューの代替ではない（REQ-0115-023）
