# ADF-COVERS 宣言行の形式制約（ID 列挙のみ）の明記

処分区分: 5 既存対策の更新（fix gap）

## 背景

Case #3314（PR #3325 Findings）で、ADF-COVERS 宣言行に全角括弧の説明を含めたところ、以降の ID がパーサで解析されなくなった（例: `<!-- ADF-COVERS(implementation): REQ-053-041（一部説明） REQ-053-042 -->` のような記述で 042 が解析対象から漏れる）。

## 問題

sidecar-and-policy.md に ADF-COVERS 宣言行の形式制約の明記がない。宣言行に説明文を書きたくなる動機は自然だが、パーサは ID 列挙のみを想定しており、全角括弧等が混入すると以降の ID 解析が静かに途切れる（警告なしのカバレッジ欠落）。

## 望ましい変更

sidecar-and-policy.md に ADF-COVERS 宣言行の形式制約を明記する:

1. 宣言行は ID 列挙のみとする（説明・注記を書かない）
2. 説明は sidecar 本文または PR 本文へ記載する
3. 全角括弧・全角文字が混入すると以降の ID 解析が途切れる旨の注意

## 対象範囲

### 対象

- src/common/skills/agentdev-traceability/references/sidecar-and-policy.md（宣言行の形式規定）

### 対象外

- パーサ側の全角文字許容拡張（寛容化は別候補。本成果物は形式規定の明記が主）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/common/skills/agentdev-traceability/references/sidecar-and-policy.md | ADF-COVERS 宣言行は ID 列挙のみ・説明は sidecar/PR 本文への方針を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: sidecar-and-policy.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 宣言行の形式制約（ID 列挙のみ・全角括弧による解析途切れ）の記載なし

## 制約

- 既存宣言行の遡及修正は対象外（新規記述からの適用）

## 受け入れ条件

- [ ] sidecar-and-policy.md に宣言行の形式制約と説明の記載先が明記されている

## 元learning item / 根拠

- **要約**: ADF-COVERS 宣言行への全角括弧説明混入で以降 ID が未解析になった事象
- **根拠**: 2026-10-02 Case #3314（PR #3325 Findings）: 全角括弧の説明を含めると以降の ID がパーサで解析されない
- **再発条件**: ADF-COVERS 宣言行に ID 以外の文字列を記述した場合
- **横展開可能性**: ADF-COVERS 宣言を記述する全成果物（AGENTS.md、各 docs）

## 推奨Issue分類

- **分類**: chore（ドキュメント追記）
- **推奨ラベル**: documentation
- **関連Issue**: Case #3314（PR #3325）
