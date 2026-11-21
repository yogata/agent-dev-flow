---
title: テストの解析ロジック再実装は producer 正規解析 import へ一本化する
created: 2026-11-21
updated: 2026-11-21
---

# テストの解析ロジック再実装は producer 正規解析 import へ一本化する

## 知識内容

テストの検知対象は「契約の破壊」であり「パーサ・解析ロジックの再実装」ではない。テストが producer の解析・判定ロジックを別実装（正規表現・独自実装）で再検証すると、2つの実装が乖離したときにどちらが正かを判定する手段がなくなり、producer 側の解析契約変更時にテストだけが沈黙または誤検知する構造リスクを抱える。

取り扱いの規約:

1. import 可能な通常テストでは、producer の正規解析関数を import して使う。ローカル再実装しない。
2. fixture 進行テスト構成（テスト対象を一時 fixture へコピーして実行する構成）では、静的 import の解決が fixture コピー先で失敗するため、[自己完結 checker への決定的実装共有は同一形式リーダー複製 ＋ 対決テストで機械担保する](checker-fixture-import-share-adversarial-test-pattern.md) のパターンを使い分ける。使い分けの境界は「import 解決が成立する構成か否か」である。
3. 試験統合時・新規テスト作成時に、ローカル再実装の有無を統合判定の観点に含める（再実装された解析ロジックは producer import への一本化候補として扱う）。

## 適用条件

- producer・consumer 契約構造を持つ解析（宣言パーサ・レジストリ読取・抽出ロジック等）のテストを作成・統合・見直しする場面。
- テストが解析対象を字面 pin 検証するために独自パーサを持ち始めたと疑われる場面。

## 適用対象

- src 側テスト・scripts 配下試験の解析契約検証構成。
- fixture 進行テスト構成自体の変更（既存パターンの破壊）と producer 側解析実装の変更は対象外。
- tim_declarations_contract.test.ts は REQ-123-002 契約（8,192 バイト以下・最小構成）を維持する前提での運用改善である。

## 根拠

- REQ-123-002（Case #4170・PR #4174）の tim 圧縮（28 → 5 ケース・22,165 → 4,443 バイト）で、tim_declarations_contract.test.ts が TIM 契約検知のため宣言パーサ（正規表現）をローカル再実装していたことが判明。実行時にローカル再実装パーサを廃止し producer 側 parseDeclarations へ一本化し、TIM 契約検知に必須の 5 ケースのみ残存した。
- b46ab1938 で試験も src 側単一正本へ統合済み。本知識は実害解消後の再発防止規約としての整備である。

## 関連知識

- [自己完結 checker への決定的実装共有は同一形式リーダー複製 ＋ 対決テストで機械担保する](checker-fixture-import-share-adversarial-test-pattern.md)（fixture 進行テスト構成での使い分け相手方パターン。import 可能な通常テストでは本知識の producer import 方式を採用する）
