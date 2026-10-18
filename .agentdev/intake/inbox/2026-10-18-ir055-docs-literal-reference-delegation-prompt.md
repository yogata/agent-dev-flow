# IR-055（runtime-unresolved-reference）の予防観点を case-run 委譲 prompt の配布物本文記述規約へ引き渡す候補

- 出所: Case #3793（PR #3802）case-close Capture 回収（PR 本文 Findings、工程記録〔検証証拠〕commentId 6251237805）
- 種別: 委譲 prompt 構築の改善候補
- 事実: worktree 環境の check_integrity が、design-file-manager SKILL.md への追記行の docs/designs/ literal 参照を新規 NG（runtime-unresolved-reference、IR-055 delta）として検出した。既存 SKILL.md 本体は抽象表現（「Design 管理インデックス」等）で参照しており、新規行が literal パスで参照したことが検出原因。PR 内の修正再実行で解消済み
- 提案: case-run の委譲 prompt の配布物本文記述規約の引き渡し内容へ、IR-055 予防観点（docs/ 等の literal 参照を書かず、既存 SKILL.md 本体の抽象表現へ合わせる）を加える
- 対象: src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md（委譲 prompt 構築）
