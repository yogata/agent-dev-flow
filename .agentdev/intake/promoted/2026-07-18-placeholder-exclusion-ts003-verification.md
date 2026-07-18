# references/<harness>.md プレースホルダー参照の除外パターン完全化と TS-003 検証完遂

## 観測内容
- `check_integrity.ts` の ReferencePath 検査が、抽象参照表記 `references/<harness>.md` をリテラルパスと解釈して NG（reference-path-existence）を11件検出
- REQ-0144-025 によって除外パターンを追加済みだが、除外が機能していない
- TS-003「check_integrity.ts 実行による `<harness>` placeholder false positive 解消確認」が時間制約で未実施。Issue #1516 は CLOSED だが TS-003 が未完

## 影響
- 配布物に抽象参照表記を残すと docs-check が恒久的に NG を出す
- placeholder が除外対象であることの検証が未完で、TS-003 pass_criteria「`<harness>` placeholder に起因する NG が 0件」が未達

## 課題
- `check_integrity.ts` の除外パターン実装を完遂し、11件の NG を解消する
- TS-003 検証を実施し、placeholder に起因する NG が 0件になったことを確認する

## 既存要件との関連
- REQ-0144-025: placeholder 検査対象外
- REQ-0162-002: harness 実行制御分離
- ADR-0136

## 対応方針の方向性
- 除外パターン実装の現状確認（実装漏れ / パターン不備 / 検査ロジック側の解釈違いのいずれかを切り分け）
- 実装完了後に `check_integrity.ts` を実行し、11件が 0件になったことを確認
- TS-003 の3点の検証項目を順次実施

## 出典
- 元 intake item:
  - intake-2026-07-18-1337-references-harness-placeholder-still-detected.md
  - intake-2026-07-15-1516-check-integrity-ts003.md
