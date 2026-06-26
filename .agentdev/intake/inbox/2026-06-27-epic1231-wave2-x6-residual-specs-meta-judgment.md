# docs/specs 配下の X-6「において」残存2件（メタ記述判定・要再確認）

## 発生源

- Epic: #1231 (Wave 2 close)
- PR: #1247, #1248, #1249 (Wave 2 close 時の Epic-level AG-004 再検証で発見)
- 発生日: 2026-06-27

## 内容

Epic #1231 Wave 2 close 時の Epic-level AG-004（X-6「において」が7ディレクトリで0件、許容範囲のメタ記述を除く）再検証で、docs/specs 配下に X-6「において」残存2件を検出した。

対象:
- `docs/specs/commands/spec-save.md` L50: `` `operation: update` / `operation: spec-update` において action の `target_area` が指定された場合...``
- `docs/specs/integrity/backticks-identifier-threshold.md` L12: `` docs/** 配下の自然言語記述において、識別子...``

両者とも SPEC ファイルの振る舞い・目的を説明するメタ的な記述であり、Epic-level AG-004 の「許容範囲のメタ記述を除く」に該当すると判断して Epic を完了扱いとした。ただし algorithm SSoT（`mechanical-replacement-rules.md`）の X-6 例外は SSoT ファイル自身のみを明示しており、SPEC 振る舞い記述の許容は解釈拡張である。

## 推奨対応先

- 「許容範囲のメタ記述」の定義を algorithm SSoT or integrity-rules SPEC で明文化し、SPEC 振る舞い記述が許容されるかを確定する
- 許容外とする場合: 上記2件を `で` へ置換する修正 Issue を起票
- 許容とする場合: algorithm SSoT の例外節に明記

## 現在の追跡状態

- Epic #1231 Wave 2 close（case-close(#epic)）の QG-4 Epic-level AG-004 評価で判定
- Epic は完了扱い（メタ記述許容判定）でクローズ済み、本 intake は境界確定を後続へ委譲
