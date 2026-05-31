# ADR README が retired REQ を README 位置づけの権限として引用

## 観測

`docs/adr/README.md` L19 で `REQ-0004-066` を README の位置づけの根拠として引用しているが、REQ-0004 は retired である。現行の active REQ（REQ-0101〜REQ-0109 等）に代替となる権限記述があるか確認が必要。

## 影響

ADR README の根拠として retired REQ を引用しているため、参照先が superseded 済みであり権限としての有効性が不明瞭。

## レビューで決めること

- 該当箇所の retired REQ 参照を対応する active REQ（REQ-0101 等）への参照に更新するか、あるいは現状維持とするか

## 根拠

- 検出元: integrity-check F-06 (2026-05-31)
- 分類: document-drift
- 対象ファイル: `docs/adr/README.md:19`
