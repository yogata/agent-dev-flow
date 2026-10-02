# spawnSync 型テストの固定 timeout 超過に対する timeout 設定方針の確定

処分区分: 5 既存対策の更新（fix gap）

## 背景

check_integrity の spawn 系回帰テスト 4 件（spawnSync 型）が 15000ms 固定 timeout をローカル環境で継続超過している。third-party 配布物追加により main root 正規形でも新規 timeout 超過が発生し、baseline 対照実行で +3.7 秒増を定量した。2026-09-19 の deferred エントリでも同種の flaky が観測済み（15000ms は当時猶予済み）であり、継続・増悪傾向の課題である。

## 問題

- `docs/knowledge/windows-bun-test-spawn-timeout-classification.md` は由来分類・再現手順を所有するが、timeout 値調整は未解決（deferred 再評価条件「timeout 設定方針の処分確定時」に合致していた）
- 固定 15000ms は現行の検査対象規模（third-party 配布物追加後）に対して不足しており、checker の検証内容本体（何を検証するか）と spawn 実測時間（環境依存）の分離ができていない

## 望ましい変更

1. spawnSync 型テストの固定 timeout を 30〜60 秒へ引上げる
2. checker 実測時間と検証内容本体の分離（検証内容を spawn によらず確認できる構造）を検討する
3. baseline 対照実行（main と PR head の同条件比較）を標準手順とする
4. timeout 値調整を独立 Case として起案するか既存変更に含めるかの判断を req-define へ引き渡す

## 対象範囲

### 対象

- check_integrity 関連 spawn 系回帰テスト 4 件の timeout 設定
- docs/knowledge/windows-bun-test-spawn-timeout-classification.md（対処記録の追補）

### 対象外

- checker 本体の検証ロジック変更
- CI 環境側の実行時間最適化

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/windows-bun-test-spawn-timeout-classification.md | timeout 設定方針の確定記録・baseline 対照手順の追補 |
| 配布skill | check_integrity 系テスト（repo-agentdev-integrity scripts 配下） | timeout 値引上げ（30〜60 秒）の実装対象候補 |
| Design | checker 実行契約関連 Design | checker 実測と検証内容分離の原則候補 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: docs/knowledge/windows-bun-test-spawn-timeout-classification.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 由来分類・再現手順は所有するが timeout 値の設定方針が未解決のまま残存（deferred 再評価条件に合致するため本成果物で引き継ぐ）

## 制約

- timeout 引上げはテストの恒久遅延化を招かない範囲で、実測分布に基づく値とする
- 環境依存（Windows ローカル）を考慮し CI とローカルで同一値を維持する

## 受け入れ条件

- [ ] spawn 系回帰テスト 4 件がローカル・CI ともに安定通過する timeout 値が設定されている
- [ ] baseline 対照手順が知識文書に記録されている

## 元learning item / 根拠

- **要約**: spawnSync 型テスト固定 timeout 超過 3 件（今期 2 件 + deferred 1 件）
- **根拠**: (1) 2026-09-30 RU-0150: full integrity suite の spawnSync 型回帰テスト 4 件がローカル環境で継続 timeout fail、checker 実測による検証内容本体の分離確認が必要、(2) 2026-10-01 Case #3289 case-close: third-party 配布物追加により spawn 系回帰 4 test が main root 正規形で新規 timeout 超過、baseline 対照で +3.7 秒増を定量、(3) 2026-09-19 deferred エントリ（prune 済み・証拠本保存）: spawn 固定 timeout flaky・当時 15000ms に猶予済み
- **再発条件**: 検査対象規模の増加（配布物追加等）または実行環境の低速化で固定 timeout を超える場合
- **横展開可能性**: spawnSync 型テスト全般、checker 実行を含むテストスイート

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: testing, flaky-test
- **関連Issue**: RU-0150, Case #3289
