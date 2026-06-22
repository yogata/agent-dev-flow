# Wave 1+2 完了後に陳腐化した draft SPEC の「参照する references」セクション

## 観測

OU-002 Wave 1 (#1019 / PR #1023) および Wave 2 (#1020 / PR #1024) で `agentdev-doc-writing`・`agentdev-inspect-skills` 各 skill 配下に新規 references ファイルが追加された。これに伴い、draft SPEC 側の「参照する references」セクションが陳腐化した。

- `docs/specs/skills/agentdev-doc-writing.md`（draft）: 7ファイル列表記のまま。今回の追加 (`references/execution-subject-classification.md`) で 8 ファイルになったが未更新。
- `docs/specs/skills/agentdev-inspect-skills.md`（draft）: 「なし（SKILL.md 本文に集約）」と記載されているが、今回の追加 (`references/execution-subject-misclassification.md`) で同記述が事実と矛盾。

両 SPEC は draft であり、それぞれの Wave Issue の修正候補外（scope 守控）とされたため本 Wave では対応されなかった。

## 影響

- draft SPEC と実 skill の references 構成が不一致。SPEC の昇格時に正文との突合せで再検出される可能性が高い。
- Wave 3 (#1021) の横断検出で「draft SPEC の参照リスト陳腐化」パターンが同型違反として検出される候補となる。

## レビューで決めること

- Wave 3 (#1021) の横断検出・修正スコープに draft SPEC の references セクション更新を含めるか。
- または spec-save の別 Issue として先行修正するか（draft SPEC の status 昇格判定の前に整える）。
- 「draft SPEC の参照リスト陳腐化」を機械的検出ルール（integrity-rule-catalog）に追加する余地があるか（references ファイル数と SPEC 記載数の突合せ）。

## 根拠

- PR #1023 Findings / Capture候補: https://github.com/yogata/agent-dev-flow/pull/1023
- PR #1024 Findings / Capture候補: https://github.com/yogata/agent-dev-flow/pull/1024
- 対象: `docs/specs/skills/agentdev-doc-writing.md`・`docs/specs/skills/agentdev-inspect-skills.md`
- 後続 Wave: OU-002 Wave 3 #1021（横断検出・修正）
