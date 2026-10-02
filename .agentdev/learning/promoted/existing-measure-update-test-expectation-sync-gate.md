# 正本・宣言的データ変更とテスト期待値の同期漏れに対する gate 検出契機の拡張

処分区分: 5 既存対策の更新（fix gap）

## 背景

正本・宣言的データ（extension yaml、textlint plugin の追加対象設定、Definition の判断境界文言、配布物文言）を変更した際、それらを参照するテストの期待値同期が追随せず、REQ-019 test-impact gate では捕捉されず case-close STEP-3 の full suite で初検出となる事象が反復した（deferred 1 件を含む計 4 件）。

## 問題

- REQ-019 gate（`check_test_impact.ts`）の検出契機が、宣言的データ・config を参照するテストの影響判定を含んでおらず、同期漏れが pre-existing fail として main に潜む
- config 変更を含む Case の test strategy に integrity suite 実行の明示がなく、case-run 段階での検出が case-close まで遅延する
- 実例: agentdev-textlint-guard テスト 2 件が main でも失敗する pre-existing（追加対象設定とテスト期待の不整合疑い。128 pass / 2 fail）が放置されている

## 望ましい変更

1. REQ-019 gate の検出契機に「宣言的データ参照テスト」（yaml/config/文言を期待値に持つテストの特定と影響通知）を追加する拡張候補として req-define へ引き渡す
2. 該当類型（config・宣言的データ変更を含む）Case の test strategy へ integrity suite 実行を明記する
3. case-close STEP-3 での full suite 実行省略を禁止する運用の徹底
4. textlint guard テスト 2 件の pre-existing fail 解消を後続 Case 対象として記録する

## 対象範囲

### 対象

- `scripts`（check_test_impact.ts）の検出契機
- REQ-019 関連 Design（test-impact-detection-gate）
- Case の test strategy 記述様式
- src/opencode/plugins/agentdev-textlint-guard/tests/（期待値修正）

### 対象外

- 個別テストの期待値修正そのもの（後続 Case が実施。本成果物は検出・予防の枠組み）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | test-impact-detection-gate 関連 Design（REQ-019） | 検出契機に宣言的データ参照テストを追加する拡張候補 |
| scripts | check_test_impact.ts | 検出契機拡張の実装対象候補 |
| template | case 系 test strategy 関連 template | config・宣言的データ変更を含む Case への integrity suite 実行明記 |
| 配布skill | case-close workflow の STEP-3 記述 | full suite 省略禁止の明文化 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: check_test_impact.ts、test-impact-detection-gate 関連 Design
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 検出契機がソースコード依存中心であり、宣言的データ・config 参照テストの影響判定が未カバー

## 制約

- gate 拡張は誤検出過多にならない検出精度を前提とする
- 既存 test-impact gate の契約を壊さない追加として設計する

## 受け入れ条件

- [ ] 宣言的データ参照テストの同期漏れが gate または test strategy で case-close より前に検出可能になっている
- [ ] textlint guard テスト 2 件の pre-existing fail が解消または対処 Case 化されている

## 元learning item / 根拠

- **要約**: 正本・宣言的データ変更とテスト期待値の同期漏れ 4 件（今期 3 件 + deferred 1 件）
- **根拠**: (1) 2026-09-18 deferred エントリ（prune 済み・証拠本保存）: Definition 変更にテスト期待文言が追随せず陳腐化、(2) 2026-10-01 Case #3293 Root Case Wave 1: 判断境界文言更新を含む配布物変更での契約テスト期待値同期と docs guard profile 選定、(3) 2026-10-02 Case #3311: extension yaml 変更と integrity テスト期待値の暗黙依存が REQ-019 gate で捕捉されず case-close STEP-3 の full suite で初検出、(4) 2026-10-02 Case #3316 PR #3328: agentdev-textlint-guard テスト 2 件が main でも失敗する pre-existing（追加対象設定とテスト期待の不整合疑い）
- **再発条件**: config・宣言的データ・判断境界文言を変更する Case でテスト期待値同期を含まない場合
- **横展開可能性**: plugin config、extension yaml、配布物文言を変更する全 Case

## 推奨Issue分類

- **分類**: feature（gate 拡張）+ fix（pre-existing fail 解消）
- **推奨ラベル**: enhancement, testing
- **関連Issue**: Case #3293, Case #3311, Case #3316（PR #3328）
