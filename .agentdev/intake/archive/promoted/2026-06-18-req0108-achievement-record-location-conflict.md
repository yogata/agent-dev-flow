# 完了条件 #4「REQ-0108 Update Notes 記録」と REQ-0101-071/073（Update Notes 禁止）の仕様対立

## 観測

Issue #904 (RU-6) の完了条件 #4 は「REQ-0108 の Update Notes に3層ゲート達成状況と再発finding対応を記録」を求める。しかし REQ-0101-071 は active REQ ファイルの `## Update Notes` セクションを禁止し、REQ-0101-073 は変更履歴セクションを禁止して frontmatter `updated` のみで追跡することを定めている（これらは本 Epic REQ-0136 自身の標準化成果の一部）。driver は情報源優先順位 #1 の REQ-0101 に従い REQ-0108 本体へは追記せず、達成状況を SPEC 準拠の記録先（`docs/guides/diagnostics-and-maintenance.md` の3層ゲートセクション / `gate-levels.md` false positive 表 / REQ-0108-153/154/155 要件行）へ記録した。

## 影響

- Issue 完了条件の字面と権威 REQ が衝突しており、達成記録の正しい帰着先が曖昧
- REQ-0108（docs-check/Validation）の達成状況を「どこに・どう記録するか」の標準が無いと、将来の達成確認で毎回判断が揺れる

## レビューで決めること

- REQ-0108 達成状況（3層ゲート実装・稼働・再発finding対応）の正規記録先を明文化するか（ガイド/SPEC の所定セクション、または REQ-0101-071/073 の例外としての専用セクション）
- 完了条件文言を「REQ-0108 Update Notes」から「REQ-0108 達成状況が SPEC 準拠の記録先に記録」のように標準へ寄せるか（REQ-0136 側の要件表記調整）
- 達成記録標準を REQ-0108 側に要件化するか（例: REQ-0108-xxx「達成状況は X に記録」）

## 根拠

- PR #917: https://github.com/yogata/agent-dev-flow/pull/917 (Findings / Capture候補 - Finding-1)
- Issue #904: https://github.com/yogata/agent-dev-flow/issues/904 (完了条件 #4)
- 衝突先 REQ: REQ-0101-071（Update Notes セクション禁止）, REQ-0101-073（変更履歴禁止・frontmatter `updated` のみ）
- Epic #896 / REQ-0136（本標準化 Epic）, REQ-0108（docs-check/Validation）
