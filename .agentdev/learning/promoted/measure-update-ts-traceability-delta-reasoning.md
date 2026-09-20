# REQ 行追加を伴う test strategy の traceability 数値期待は絶対値不変でなく増減理由型で記述する

## 背景

case-open（Case #2979）で REQ 新規 8 行（REQ-004-054/055、REQ-030-016、REQ-031-031、REQ-032-028、REQ-061-036、REQ-062-009、REQ-034-039。いずれも positioning・評価経路行で implementation 実装を持たない）を含む Definition PR を作成したところ、draft TS-003 の期待「missing-implementation 103 不変」に対し実測 111（103 + 8）となった。policy.yaml verification.optional への登録は missing-verification のみ回避し missing-implementation の加算を防がない。REQ-088 の 7 行も第3段で同じく baseline に加算済み（baseline 103 は REQ-088 7 行を含む）であり、既知パターンとして確認した。

## 問題

REQ 行追加を伴う Case のテスト戦略で traceability 数値（missing-implementation / missing-design 等）を「絶対値不変」形式で期待すると、新規行の未被覆分が常に加算されるため必ず乖離する。宣言の design 側新設には既存行解消の負の寄与（v4-standard-lifecycle 宣言で missing-design 955→949、6 行解消等）もあり、単純な相殺計算では期待を書けない。現行の test-strategy-numeric-threshold-guide.md は絶対値閾値の到達可能性検証が中心で、この増減理由型の記述様式を持たない。

## 望ましい変更

test strategy の traceability 数値期待の記述様式として、増減理由型を agentdev-req-analysis の数値閾値ガイドへ追記する:

1. req-define で TS 数値を記述する際、artifact_actions の REQ 行追加の有無を確認する
2. REQ 行追加（positioning 行を含む）を伴う場合は「絶対値不変」でなく「増減理由の型」（baseline + 新規行数 − 宣言解消数、policy optional 登録の効果範囲は missing-verification のみ等）で期待を記述する
3. 実測乖離時は計算内訳（新規行数・宣言解消・policy 登録の効果）を検証記録に残す

## 対象範囲

### 対象

- agentdev-req-analysis の test strategy 数値閾値ガイド（references/test-strategy-numeric-threshold-guide.md）
- REQ 行の追加・更新を伴う Case の test strategy 策定（req-define → case-open）

### 対象外

- traceability check の検査仕様（missing-implementation の計上規則は不変）
- policy.yaml verification.optional の仕様（既存・不変）
- case-ready STEP-2 の検証（検出側は既存・正常動作）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-req-analysis/references/test-strategy-numeric-threshold-guide.md | 数値閾値の失敗パターン表へ「REQ 行追加 Case での絶対値不変期待」を追加し、増減理由型（baseline + 新規行数 − 宣言解消・policy optional の効果範囲）の記述様式を追記 |
| 配布skill | src/opencode/skills/agentdev-quality-gates/（QG-2 acceptance criteria coverage） | 数値閾値到達可能性検証の観点に増減理由型の確認を追記する候補 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: src/opencode/skills/agentdev-req-analysis/references/test-strategy-numeric-threshold-guide.md（数値閾値策定ガイド・QG-2 観点6 連動）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存ガイドは絶対値閾値の実測・到達可能性評価を扱い、失敗パターン表（根拠なき高閾値・スナップショット誤用・平均の罠・範囲無視）を持つが、「REQ 行追加に伴う加算・宣言解消の減算・policy optional の効果範囲」という増減理由型の期待記述様式が未カバー（ガイドを grep 検証し増減・missing-implementation の記述なしを確認済み）

## 制約

- REQ-088 前例（positioning 行の implementation 未被覆は既知）を根拠に、実測整合判断（baseline + 新規行数 − 宣言解消）と計算内訳の PR 本文記録を TS on_failure の fix 手順として機能させられる
- traceability check の findings に新規行 ID が含まれる機械確認と、baseline findings の遡及確認を検証手段とする（Case #2979 の実績手法）
- 増減理由型への移行は新規 Case から適用し、既存 Definition の TS 書き換えを要求しない

## 受け入れ条件

- [ ] 数値閾値ガイドに REQ 行追加 Case での絶対値不変期待の失敗パターンが記載されていること
- [ ] 増減理由型（baseline + 新規行数 − 宣言解消、policy optional の効果範囲）の記述様式が記載されていること
- [ ] 実測乖離時の計算内訳記録（PR 本文・検証記録）が手順に含まれること

## 元learning item / 根拠

- **要約**: REQ 行追加（positioning 行含む）を伴う Case で TS に「missing-implementation / missing-design 不変」型の期待を書くと新規行の未被覆分が常に加算され必ず乖離する。増減理由型で期待を記述する
- **根拠**: Case #2979（2026-09-19、PR #2980）。REQ 新規 8 行（positioning・評価経路行）で TS-003 期待 103 不変に対し実測 111。REQ-088 前例（第3段・baseline 103 は REQ-088 7 行を含む）に基づき「baseline + 新規行数 − 宣言解消」で実測整合を判断し、PR 本文に計算内訳を記録して確定
- **再発条件**: REQ 行追加（positioning 行を含む）を伴う draft で TS に絶対値不変型の期待を書いた場合
- **横展開可能性**: REQ 行追加を伴う Case は常態的に発生する。traceability 数値以外でも「基線 + 増減理由」で書くべき数量期待全般に適用可能

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: workflow, verification
- **関連Issue**: Case #2979、PR #2980、Case #2973（REQ-088 前例）
