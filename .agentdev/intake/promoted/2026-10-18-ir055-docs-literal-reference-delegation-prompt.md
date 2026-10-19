# IR-055（runtime-unresolved-reference）の予防観点を case-run 委譲 prompt の配布物本文記述規約へ引き渡す

## 観測内容

- 出所: Case #3793（PR #3802）case-close Capture 回収（PR 本文 Findings、工程記録〔検証証拠〕commentId 6251237805）
- worktree 環境の check_integrity が、design-file-manager SKILL.md への追記行の docs/designs/ literal 参照を新規 NG（runtime-unresolved-reference、IR-055 delta）として検出した。
- 既存 SKILL.md 本体は抽象表現（「Design 管理インデックス」等）で参照しており、新規行が literal パスで参照したことが検出原因。PR 内の修正再実行で解消済み。

## 影響

- case-run の実行担当サブエージェントが配布物へ追記する際、docs/ 等の literal 参照を書くと check_integrity が新規 NG を検出し、委譲実行内で修正再実行が発生する。
- 予防観点が委譲 prompt へ引き渡されていない間は、同種の検出・修正コストが実装 Case ごとに再発し得る。

## 課題

- case-run の委譲 prompt の配布物本文記述規約の引き渡し内容に、IR-055 予防観点（docs/ 等の literal 参照を書かず、既存 SKILL.md 本体の抽象表現へ合わせる）が含まれていない。

## 既存要件との関連

- src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md（委譲 prompt 構築）
- IR-055（runtime-unresolved-reference）

## 人間判断ポイント

- 委譲 prompt への予防観点の追加要否と引き渡し文言の承認。
