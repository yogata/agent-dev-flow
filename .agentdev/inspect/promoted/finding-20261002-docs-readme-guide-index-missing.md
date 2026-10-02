# docs/README.md ガイド一覧への multi-host-operations.md 欠落

- **分類**: inspect finding promote（F-02・severity low・confidence medium）
- **由来**: inspect-docs finding 20261002T154006Z（backlog-auto stage 1）

## 観測（evidence・実測確認済み）

- `docs/README.md` ガイド一覧は12ガイド列挙。実測: `docs/guides/` は13ガイド（README 除く）で `multi-host-operations.md` が docs/README.md 一覧にない
- `guides/README.md:54` には掲載済み
- docs/README.md のガイド一覧は手動記述のため AUTOGEN 対象外（検出は手動照合）

## 影響課題

docs 入口から multi-host-operations.md への探索導線欠落。2026-10-02 PR #3331 でのガイド新設時の反映漏れ。

## 対応候補

docs/README.md ガイド一覧へ multi-host-operations.md を追加。docs-check route 候補: docs/README.md ガイド一覧の手動整合チェックルール化。

## 既存要件関連

guides/README.md（13ガイド全掲載）を正とする索引整合。

## 統合注記（backlog-review での統合判定候補）

なし（単独対応）。
