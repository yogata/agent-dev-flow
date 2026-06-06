# Upstream handoff workflow 完了条件11項目全未チェック

upstream handoff workflow protocol（REQ-0104-017~027）の実装 Issue #612 で、完了条件8項目・テスト戦略3項目がすべて未チェックのままクローズされている。`upstream-handoff.md` の skill references 追加、各コマンド（req-define / backlog-review / backlog-save / case-open / case-run）への handoff 停止条件追加、共通方針の重複排除等の完了確認が記録されていない。

- `upstream-handoff.md` の `agentdev-workflow-lifecycle` skill references/ 追加
- SKILL.md への upstream handoff 用途記載
- req-define / backlog-review / backlog-save / case-open / case-run への handoff 停止条件追加
- command 側の長文重複排除確認
- 各 command への handoff 停止条件記述の内容確認
- `upstream-handoff.md` の共通方針と各 command の停止条件の REQ 適合確認
- 全 command ファイルの grep による重複確認

## 根拠

- Issue #612: feat: implement upstream handoff workflow protocol (REQ-0104-017~027)
  - 完了条件8項目・テスト戦略3項目がすべて未チェックでクローズされている
