# structured-stage-handoff.md サンプルYAMLの workflow_phase インデント不整合

## 観測

観測元: 2026-09-21 の外部レビュー（structured handoff 効果測定レビュー中の副次検出）。

`src/opencode/skills/agentdev-workflow-lifecycle/references/structured-stage-handoff.md` の「直列化形式（10意味）」節サンプルYAML（L20付近）で、`workflow_phase` キーのみ `structured_context:` と同じインデント（構造化ブロックの外側）に置かれ、直後の `execution_unit` 以下（`structured_context` 配下のインデント）と不整合している。

同節の説明文は10キーすべてを `structured_context` 配下のトップレベルキーとしており、Design（`v4-delegation-contracts.md`「構造化文脈引き継ぎ（委譲時）の直列化契約」の10意味リスト）とも整合するため、サンプルYAMLのインデント誤りと判断する。

## 修正対象

当該サンプルYAMLの `workflow_phase` 行を `structured_context` 配下のインデントへ揃えること。

## 影響

軽微（配布物参照のサンプル記述。YAMLとして機械検査されている様子はなく、意味理解への影響は限定的）。
