# ReferencePath: references/&lt;harness&gt;.md placeholder 参照の未存在判定（9件）

## 概要

配布 command/skill 中の `references/<harness>.md` 参照が、check_integrity.ts ReferencePath 検査で「ファイルが存在しない」と判定されている（NG 9件）。`<harness>` は harness 固有ファイルを示す placeholder 記法だが、検査時に解決されず NG となる。

## 詳細

検出対象（9箇所）:

- `.opencode/commands/agentdev/case-auto.md:144`
- `.opencode/commands/agentdev/case-run.md:165, :237`
- `.opencode/skills/agentdev-architecture-advisory/SKILL.md:76`
- `.opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:29, :31, :130, :132, :159`

`<harness>` は consumer 環境で AGENTS.md が指定する harness 名（例: oh-my-openagent）に置換されるべき記法。検査スクリプトはこの placeholder を解決できず NG 判定を出力している。

## 候補となる対応

1. **検査除外要件の制度化**: 検査スクリプトで `references/<harness>.md` パターンを placeholder 参照として除外（設計上正当な placeholder の扱い）
2. **harness 固有ファイルの実整備**: `.opencode/skills/*/references/oh-my-openagent.md` 等のファイルを実配置し、placeholder を解消
3. **参照記法の見直し**: placeholder を使わない別の間接参照方法に変更

設計上 `<harness>` は正当な placeholder であるため、方法1（検査除外）または方法2（実整備）が妥当。

## 根拠

- 観測元: /repo/docs-check 2026-07-15 実施（check_integrity.ts ReferencePath strict）
- 設計原則: agentdev-project-extensions（references/<harness>.md の harness 固有ファイル分離設計）
- 検出規模: NG 9件
- 原因分類: 不明（設計上の placeholder 扱いか、検査除外要件の整備不足か、要 req-define 判断）
- route: intake → req-define（検査仕様の判断が必要）
