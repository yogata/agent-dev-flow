# promote 系 workflow skill・doc-diagnostics・workflow-inspect-docs の自律確定・source-of-truth priority 記述と lifecycle 正本節の規則本文境界精査

## 観測事実

- Case #4026 Wave 1（PR #4038）で工程駆動11ファイルと公開 Command 側の反復した共通報告・Decision・自律確定規則の本文を agentdev-workflow-lifecycle スキル「共通報告・Decision・自律確定規約」節へ集約した（B2-1・CR-001）。
- PR #4038 本文 Findings で、workflow skill 側（agentdev-workflow-intake-promote・agentdev-workflow-learning-promote・agentdev-workflow-inspect-promote 等の promote 系 workflow・agentdev-doc-diagnostics・agentdev-workflow-inspect-docs）に残存する自律確定・source-of-truth priority の記述は「規則本文の複製でなく工程位置・判定位置を含む呼出条件の記述」と判断し、Issue 変更対象リスト外として非接触とした（対象範囲外の判断）。
- 後続 Wave で規則本文（lifecycle 正本節）との境界精査が必要な場合の intake 候補として申告済み。

## 具体的な修正対象

- promote 系 workflow skill・doc-diagnostics・workflow-inspect-docs の各記述が「呼出条件・工程位置の記述」に留まり、lifecycle 正本節（完了報告の必須要素 / decision 成果物の役割と正本の優先度への参照 / promote 系操作の自律確定と HITL 境界 / inspect-* コマンド選択 routing）と本文複製になっていないかを精査する。複製が検出された場合は正本への名レベル参照へ置換する。
- 精査は inspect-skills（意味的重複検出）経由の機械診断で実施できる候補。

## 関連

- Case #4026・PR #4038 本文 Findings / Capture候補（DEL-4028-1）
- agentdev-workflow-lifecycle スキル「共通報告・Decision・自律確定規約」節（正本）
- REQ-110-034〜039（TS-011・TS-012 正本参照化）
