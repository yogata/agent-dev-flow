# artifact-responsibilities.md L38/L46 の誤引用（REQ-082-004 の引用本文が REQ 行に不在）

## 観測内容

`docs/designs/responsibilities/artifact-responsibilities.md` L38/L46 の REQ-082-004 参照（Case #2846 で REQ-003-033 から付け替え済み）は誤引用である。L38 は REQ-082-004 を「責務ごとに最も安定した最小の定義元を正規とする」と引用し、L46 も同文言を安定性基準の根拠に置くが、この引用本文は REQ-082-004 行に存在しない。

2026-09-16 時点の再実査: REQ-082-004 行の実本文は「技術的に決着できない優先判断、ユーザー固有の目的・価値判断、両立不能要求、必要情報不足等、エージェント間で自律解決できない争点のみをユーザーへ返し…」であり、引用文とは内容が完全に異なる。引用本文は `src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md` L30 のみに存在する。REQ-082 分離前から存在した状態であり、Case #2846 の機械的対応表による付け替えでは dangling 解消のみが行われ、引用本文の修正は新規の意味判断として対象外と記録されていた。

## 影響

- 正規成果物（responsibilities 系 Design）内の誤引用が参照者に誤った要件内容を伝える。REQ-082-004 の実規定（HITL 境界系）と無関係な文言に紐づく状態が継続する

## 課題（対応候補と判断材料）

- L38/L46 の引用本文を修正する: 引用本文の出所（semantic-diagnostic-perspectives.md）を正規 REQ 行へ要件化して参照するか、該当記述を REQ-082-004 の実本文に即した表現へ書き換えるかは採用時（backlog-review / req-define）に確定する

## 既存要件との関連

- REQ-082-004（正規の定義元選定）: 誤引用の対象行
- REQ-082-009・REQ-001（関心キー・正規所有）: 当該節の本来の根拠体系

## 根拠

- 観測元: PR #2879 本文 Findings F-001（Case #2846、git 履歴 1948023c で旧行本文確認）
- 観測時 commit: PR #2879 head（merge 後 main 2098a9d9）
- 2026-09-16 再検証: L38/L46 の引用文が REQ-082-004 行本文に不存在であることを現行ファイルで確認
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: 誤引用が現行実査で確認済み）
