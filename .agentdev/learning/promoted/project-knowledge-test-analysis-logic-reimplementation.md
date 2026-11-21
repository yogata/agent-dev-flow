# テストの解析ロジック再実装は契約破壊検知を沈黙させ producer 正規解析へ一本化する

## 背景

REQ-123-002（Case #4170・PR #4174）の tim 圧縮（28 → 5 ケース・22,165 → 4,443 バイト）で、tim_declarations_contract.test.ts が TIM 契約検知のため宣言パーサ（正規表現）をローカル再実装していたことが判明した。テスト側のローカル再実装は producer 側の解析契約変更に追随できず、契約変更時にテストだけが沈黙または誤検知する構造リスクを抱えていた。

## 問題

テストが producer の解析・判定ロジックを別実装で再検証すると、2つの実装が乖離したときにどちらが正かを判定する手段がなくなる。テストの検知対象は「契約の破壊」であり「パーサの再実装」ではない。解析契約を持つ producer・consumer 構造では、テストが producer 正規解析関数を import せず独自実装で pin 検証する構成は構造リスクである。この原則は知識として整備されておらず、試験統合時の判定観点にも含まれていない。

## 望ましい変更

- テスト側での解析ロジック再実装を禁止し、producer の正規解析関数を import して使う規約・知識を整備する
- 試験統合時にローカル再実装の有無を統合判定の観点に含める
- 「自己完結 checker での複製+対決テストパターン」（docs/knowledge/checker-fixture-import-share-adversarial-test-pattern.md）との使い分け（import 可能な通常テストでは producer import、fixture 進行テスト構成では複製+対決テスト）を知識として明示する

## 対象範囲

### 対象

- src 側テスト・scripts 配下試験の解析契約検証構成
- docs/knowledge/ のテスト設計知識（新規作成・既存文書との関係整理）

### 対象外

- repo-local checker の fixture 進行テスト構成自体の変更（checker-fixture-import-share-adversarial-test-pattern.md が所有するパターンの破壊）
- producer 側解析実装の変更
- tim_declarations_contract.test.ts の再編（REQ-123-002 契約の 8,192 バイト以下最小構成は維持済み）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/（新規知識文書） | テストの検知対象は契約の破壊であり解析ロジックの複製はリスク、producer 正規解析 import 方式と複製+対決テスト方式の使い分け（適用条件の境界） |
| knowledge | docs/knowledge/checker-fixture-import-share-adversarial-test-pattern.md | 使い分け観点の相互参照追記（req-define で判断） |

## 既存対策確認

- **確認結果**: あり（近接）
- **該当ファイル**: docs/knowledge/checker-fixture-import-share-adversarial-test-pattern.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存知識は「自己完結 checker での複製許容+対決テスト」パターン（fixture 進行テスト構成での import 解決失敗回避）のみで、import 可能な通常テストでの producer import 方式（複製禁止・契約破壊検知への一本化）の規約・観点が欠落

## 制約

- 実害は解消済み（PR #4174 でローカル再実装パーサを廃止し producer 側 parseDeclarations へ一本化・TIM 契約検知に必須の 5 ケースのみ残存、b46ab1938 で試験も src 側統合済み）。本成果物は再発防止の規約・知識化が対象
- tim_declarations_contract.test.ts は REQ-123-002 契約（8,192 バイト以下・最小構成）を維持する

## 受け入れ条件

- [ ] テスト側解析ロジック再実装の禁止規約（producer import 方式）が知識として明文化されている
- [ ] 複製+対決テストパターンとの使い分け（適用条件の境界）が記録されている
- [ ] 試験統合時のローカル再実装有無判定観点が明示されている

## 元learning item / 根拠

- **要約**: テスト側ローカルパーサ再実装の構造リスクと producer 正規解析への一本化
- **根拠**: REQ-123-002（Case #4170・PR #4174）で tim 圧縮時にローカル再実装パーサを廃止し producer 側 parseDeclarations へ一本化（check と同一の解析契約を使用）。ユーザー確認なし（実行担当の裁量・監督承認済み・テスト代表ケース選定の記録は PR 本文）
- **再発条件**: テストが producer の解析・判定ロジックを正規表現・独自実装で再現して pin 検証する場合（試験統合・新規テスト作成時）
- **横展開可能性**: producer・consumer 契約構造を持つ解析全般に適用可能な一般原則

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, knowledge
- **関連Issue**: なし（Case #4170 は完了済み・参照のみ）
