# system.md 新基準REQ群の範囲表記が旧番号のまま

## 観測

`docs/specs/system.md` L212 で「新基準REQ群（REQ-0101〜0049）」と記載。実際の active REQ は REQ-0101〜REQ-0109。旧番号計画（REQ-0042〜0049）の残存。

## 影響

system.md を参照した際に REQ 範囲の認識にズレが生じる。現在 9件の REQ が存在するにもかかわらず、49件存在するかのような記述になっている。

## レビューで決めること

- L212 の範囲表記を `REQ-0101〜0109` に修正する

## 根拠

- 検出元: integrity-check F-02 (2026-05-31)
- 分類: document-drift
- 対象ファイル: `docs/specs/system.md:212`
