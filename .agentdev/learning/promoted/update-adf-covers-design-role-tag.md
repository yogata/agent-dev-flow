# Design ファイルへの新規 REQ 行対応宣言は ADF-COVERS(design) を使用する（役割タグ解釈の明記）

## 背景
Case #3214 で新規 REQ-094 行への design 対応宣言を ADF-COVERS(implementation) で記載し、
coverage counts {design: 0}・missing-design 12 行でゲート不合格となった（宣言修正で解消）。

## 問題
「宣言の役割タグ（design/implementation/verification/decision）がそのまま coverage の役割解釈に
なる」ことが宣言作成側に周知されておらず、Design ファイル本体への記載でも implementation タグは
design 対応に数えられない旨が missing-design ゲート手順・check-interpretation に未記載。

## 望ましい変更
definition-pr-and-idempotency.md missing-design ゲート手順へ「Design ファイルへの新規 REQ 行宣言は
ADF-COVERS(design) が標準（implementation タグは design 対応に数えない）」と、宣言作成直後の
coverage --req 実測による役割解釈確認を追記する。agentdev-traceability check-interpretation.md の
役割解釈説明への追記も候補。

## 対象範囲
### 対象
- src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（missing-design ゲート手順）
- src/opencode/skills/agentdev-traceability/references/check-interpretation.md
### 対象外
- coverage 実装（役割解釈仕様は現状正）

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| 配布skill reference | definition-pr-and-idempotency.md | design タグ標準と宣言直後 coverage 実測の追記 |
| 配布skill reference | check-interpretation.md | 役割タグと coverage 役割解釈の関係説明の追記 |

## 既存対策確認
- **確認結果**: あり
- **該当ファイル**: definition-pr-and-idempotency.md L34（missing-design 0 件ゲート）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 役割タグと design 対応カウントの関係が未記載

## 制約
ゲートは fail-closed で機能済み（重大化しない）。手戻り削減が目的。

## 受け入れ条件
- [ ] 両 reference に役割タグ解釈の説明が追記されている

## 元learning item / 根拠
- **要約**: ADF-COVERS の役割タグが coverage の役割解釈を決める
- **根拠**: #3214（implementation タグで design: 0・missing-design 12→design タグへ変更で design: 12・0 件合格）
- **再発条件**: Design ファイルへ implementation タグで新規 REQ 行を宣言した場合
- **横展開可能性**: Design への新規 REQ 行宣言全般

## 推奨Issue分類
- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: Root Case #3214・PR #3215
