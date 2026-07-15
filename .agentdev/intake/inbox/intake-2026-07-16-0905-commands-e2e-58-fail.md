# Intake Item: commands_e2e.test.ts 58 fail (存在しないコマンド参照 / README エンコーディング)

## 発生源

- PR: #1529 (Issue #1528, Standard flow)
- 発生 phase: case-run テスト結果 / case-close QG-4
- capture 分類: intake (具体的修正対象 = e2e テスト期待値 / README listing)

## 問題

`commands_e2e.test.ts` で 58 件の失敗が発生する。事前由来の失敗であり、本 PR #1529 とは無関係（main では 57 pass / 58 fail、本 PR では 58 pass / 58 fail で新規失敗なし）。

失敗原因は主に以下の2系統:

1. 存在しないコマンド（`req-restructure-review` 等）の README listing 要求（テスト期待値が旧コマンド構成に基づく）
2. README エンコーディング問題による事前由来ドリフト

## 推奨修正対象

別途 case または inspect で対応候補:

1. テスト期待値から廃止済みコマンド（`req-restructure-review` 等）の参照を除去、または
2. README listing と実コマンド一覧の同期、または
3. README エンコーディング問題の根本解決

廃止コマンドの特定と README 整合性確認が必要なため、inspect 系コマンドでの finding 化が適切。

## 関連

- PR: #1529 (Findings / Capture候補 セクション「事前由来テスト失敗（参考記録）」)
- 対象テスト: commands_e2e.test.ts
- 推定廃止コマンド参照: req-restructure-review 等
