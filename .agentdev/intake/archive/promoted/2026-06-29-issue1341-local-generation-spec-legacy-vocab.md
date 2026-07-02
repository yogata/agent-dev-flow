# docs/specs/local/local-generation.md に旧語彙が残存

## 観察

PR #1344 の TS-003 検証で対象12ファイル外の `docs/specs/local/local-generation.md` にも旧語彙（変換プロンプト等）が複数存在することを確認した。本ファイルは link mode 移行を説明する SPEC であり、REQ-0141 系の関連文書。Issue #1341 は対象12ファイルに `docs/guides/local-generation.md`（実在しない）を挙げており、実体の `docs/specs/local/local-generation.md` は対象外となった。

grep 結果（PR #1344 worktree にて計測）:
- 行82, 147, 149, 151, 165, 167, 221 に「変換プロンプト」関連表現が7件
- 一部は「変換プロンプト廃止経緯（local-transform.md から一元化）」等の節見出しとして構造化されている

既存 intake `2026-06-27-local-generation-word-fix.md`（PR #1195 / Issue #1193 由来）と同じファイルの同一問題を指すが、今回は Issue #1341 完了後も未解決であることを再確認した観測。

## 修正されなかった理由

本 Issue #1341 の対象12ファイルに `docs/specs/local/local-generation.md` は含まれない。Issue #1341 は対象外ファイルを後から拡張しない方針（完了条件の範囲を維持）。別 Issue での整理が必要。

## 課題

- 既存 intake `2026-06-27-local-generation-word-fix.md` との統合判定（重複エントリの整理）
- 旧語彙のうち「変換プロンプト廃止経緯」節見出しは SPEC 構造上の意図的保持か、現行語彙へ再構成すべきか
- 「link mode 移行に伴う廃止経緯」への節タイトル変更を含むか

## 根拠

PR #1344 本文「## Findings / Capture候補」より引用:

> intake 候補: `docs/specs/local/local-generation.md` にも旧語彙（変換プロンプト等）が複数存在するが、本 Issue 対象外のため未処理。link mode 移行説明の SPEC であり、別途整理が必要な可能性。

## 観測元

- PR #1344
- Issue #1341
- 既存 intake: `2026-06-27-local-generation-word-fix.md`（PR #1195 / Issue #1193）
