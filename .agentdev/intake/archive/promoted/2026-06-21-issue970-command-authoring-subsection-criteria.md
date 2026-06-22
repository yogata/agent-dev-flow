# agentdev-command-authoring サブセクション化 vs リスト1行化の判断基準不在

## 観測

`agentdev-command-authoring/SKILL.md` の「Commandに書くべきでない内容」は既に4項目で過不足なく整備されていた。PR #975 で Step 番号関連のサブセクションを追加したが、親リストの最後に「Step 番号の細分」を1行追加するだけでも同等の情報量になった可能性がある。「サブセクション化」か「リスト1行化」かの判断基準が command-authoring 内に明示されていない。

## 影響

- 今後の SKILL 編集で、同じ「親リストへ追記」可能な内容でもサブセクション化されるケースが散発し、SKILL 構造にばらつきが生じうる。
- Reviewer が「これはサブセクションにすべきだったか？」を毎回判断するコストが発生する。

## レビューで決めること

- command-authoring SKILL に「サブセクション化 vs リスト1行追記」の判断基準（情報量・独立性・将来拡張見込み 等）を明示するか。

## 根拠

- PR #975: https://github.com/yogata/agent-dev-flow/pull/975 (ファイル `src/opencode/skills/agentdev-command-authoring/SKILL.md` に「Step 番号と詳細手順の配置」サブセクション新設)
- Issue #970: https://github.com/yogata/agent-dev-flow/issues/970 (RU-0007 part 2)
