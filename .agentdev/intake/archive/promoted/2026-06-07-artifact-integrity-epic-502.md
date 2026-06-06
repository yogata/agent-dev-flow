# artifact integrity alignment Epic 完了条件9項目未チェック

Epic #502（AgentDevFlow artifact integrity alignment）で、完了条件9項目がすべて未チェックのままクローズされている。`reference/` → `references/` 移行、integrity-check の README index 抽出修正、completion report 存在確認、retired REQ 参照の警告対象外化、placeholder 記法の扱い、ADR 表記、backlog-review の implementation_pattern 整合等の完了確認が記録されていない。

- `.opencode/skills/**/reference/` → `references/` 移行完了
- integrity-check の README index 抽出が `[REQ-NNNN](REQ-NNNN.md)` 形式に対応
- completion report 存在確認が Variant Registry + variant files で判定
- `mapping-table.md` の migration 用 retired REQ 参照が current-use warning 対象外
- `[URL]` 等 placeholder 記法が broken file link として扱われない
- ADR の naked retired REQ 参照が履歴参照として明示的表記
- `backlog-review` の implementation_pattern が command-map と整合
- load_skills 検査が pattern 固定 + substring matching だけで missing/excess を断定しない
- 検査ルール変更に regression fixture/test が含まれている

## 根拠

- Issue #502: Epic: AgentDevFlow artifact integrity alignment
  - 完了条件9項目がすべて未チェックでクローズされている
