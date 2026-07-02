# Issue #1341 が挙げる docs/guides/local-generation.md は実在しない

## 観察

Issue #1341 の TS-003 verification が対象12ファイルとして挙げた `docs/guides/local-generation.md` は実在しない。実体は `docs/specs/local/local-generation.md`（REQ-0141 系の SPEC）。Issue #1341 のパス表記誤りの可能性がある。

PR #1344 の TS-003 検証では `docs/guides/local-generation.md` を `FILE_NOT_FOUND` として N/A 扱いし、Findings に記録した。Issue 完了条件は PR の置換結果で満たされたが、パス表記の正規化は未解決。

## 修正されなかった理由

本 Issue #1341 のスコープは旧語彙置換と dangling 参照削除であり、Issue 本文のパス表記修正は含まれていない。Issue 本文を事後修正すると完了条件の意味が変わるリスクがあるため、別 Issue での整理を推奨する。

## 課題

- Issue #1341 本文の `docs/guides/local-generation.md` を `docs/specs/local/local-generation.md` へ修正すべきか
- TS-003 verification リスト内のパスも同様に修正すべきか
- 過去の Issue/PR で同種のパス誤りが他に存在するか（横展開確認）

## 根拠

PR #1344 本文「## Findings / Capture候補」より引用:

> intake 候補: Issue #1341 が対象ファイルとして挙げた `docs/guides/local-generation.md` は実在しない。実体は `docs/specs/local/local-generation.md`（Issue 対象外）。Issue のパス誤りの可能性。別 Issue で整理推奨。

## 観測元

- PR #1344
- Issue #1341
