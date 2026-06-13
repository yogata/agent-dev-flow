# docs-review コマンドが deprecated のまま README 在庫に列挙されている

## 観測

`docs-review` コマンドが deprecated 扱いであるにもかかわらず、command README の在庫（inventory）に列挙されたままである。

### 対象箇所

- `docs/commands/agentdev/docs-review.md`（投射先 `.opencode/commands/agentdev/docs-review.md`）
- 件数: Warning 1（`cmd-deprecated-in-inventory`）

## 影響

deprecated コマンドが active 在庫に現れ、利用者に利用可能と誤認させる。

## 推奨対応

README 在庫から `docs-review` を除外する、または非 deprecated として復活させる（運用意図に依存）。

## 分類

- finding category: workflow-gap
- route: intake
- 原因: 確認済

## 根拠

- 検査: `cmd-deprecated-in-inventory`（strict）
