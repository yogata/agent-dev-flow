# docs/specs 配下の X-6「において」残存2件（メタ記述判定・要再確認）

## 発生源

- Epic: #1231 (Wave 2 close)
- PR: #1247, #1248, #1249 (Wave 2 close 時の Epic-level AG-004 再検証で発見)
- 発生日: 2026-06-27

## 観測内容

Epic #1231 Wave 2 close 時の Epic-level AG-004（X-6「において」が7ディレクトリで0件、許容範囲のメタ記述を除く）再検証で、docs/specs 配下に X-6「において」残存 2 件を検出した。

対象:
- `docs/specs/commands/spec-save.md` L50: `` `operation: update` / `operation: spec-update` において action の `target_area` が指定された場合...``
- `docs/specs/integrity/backticks-identifier-threshold.md` L12: `` docs/** 配下の自然言語記述において、識別子...``

両者とも SPEC ファイルの振る舞い・目的を説明するメタ的な記述であり、Epic-level AG-004 の「許容範囲のメタ記述を除く」に該当すると判断して Epic を完了扱いとした。ただし algorithm SSoT（`mechanical-replacement-rules.md`）の X-6 例外は SSoT ファイル自身のみを明示しており、SPEC 振る舞い記述の許容は解釈拡張である。

## 影響

- 「許容範囲のメタ記述」の定義が未確定で、algorithm SSoT の例外節と解釈が拡張されている

## 課題

- 「許容範囲のメタ記述」の定義を algorithm SSoT or integrity-rules SPEC で明文化し、SPEC 振る舞い記述が許容されるかを確定する
- 許容外とする場合: 上記 2 件を `で` へ置換する修正 Issue を起票
- 許容とする場合: algorithm SSoT の例外節に明記

## 既存要件との関連

- `mechanical-replacement-rules.md`（algorithm SSoT、X-6 例外は SSoT ファイル自身のみ明示）
- integrity-rules SPEC
- 関連: PR #1122 X-6 残存5件（宣言不一致）の別 intake あり

## 対応方針候補

- 境界確定を後続へ委譲。「許容範囲のメタ記述」を定義し、許容/不許容を確定して対応を分岐する
