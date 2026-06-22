# case-close G17/G19/G23 ガードレールの旧 Step 番号参照（stale reference）

## 観測

PR #1014 (Issue #1013 / REQ-0143) のステップ番号再編（Step 0→1 繰り上げ・フェーズ見出し削除等）に伴い、`case-close.md` のガードレール G17・G19・G23 が本文中の Step 番号を参照しているが、参照先の Step 番号が旧番号のまま残っている（pre-existing）。今回の準拠作業はガードレール番号形式の統一（G01 形式）を対象とし、ガードレール本文内の Step 番号参照の追従更新は含まれていない。

## 影響

- ガードレールが参照する Step 番号と実際の手順 Step 番号が不一致になり、運用時の参照追跡が困難。
- 今後の case-close 実行でガードレール参照が迷子になる可能性。

## レビューで決めること

- G17・G19・G23 の Step 番号参照を現行の Step 番号へ一括更新するか。
- 更新する場合、他の command ファイルでも同種の stale Step 参照がないか横断確認するか。

## 根拠

- PR #1014: https://github.com/yogata/agent-dev-flow/pull/1014
- Issue #1013: https://github.com/yogata/agent-dev-flow/issues/1013
- 対象: `src/opencode/commands/agentdev/case-close.md`（G17, G19, G23）
