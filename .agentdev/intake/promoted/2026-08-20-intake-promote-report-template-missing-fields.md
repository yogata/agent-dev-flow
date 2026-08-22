# intake-promote 完了報告テンプレートに保留・却下件数欄と自律確定証跡欄がない

## 観測

`src/opencode/commands/agentdev/templates/intake-promote/standard.md`（完了報告テンプレート）は件数2種のみの簡素な形式である。一方、agentdev-workflow-intake-promote の STEP-6 reference は「分類結果（採用、保留、却下の件数、一覧。自律確定 item は主要根拠とHITL不要理由を含む）」を完了報告に要求しており、テンプレートとの間に元からあった差が自律確定実装（OU-0025、PR #2335）で拡大した。

## 今回扱わない理由

テンプレートファイルは Issue #2293（intake-promote 自律確定実装）の変更対象範囲外のため、PR #2335 では未対応のまま capture 候補（intake）として記録された。

## 影響

完了報告が STEP-6 reference の要求形式と整合せず、保留・却下の内訳と自律確定 item の主要根拠・HITL不要理由が報告から漏れる可能性がある。

## レビューで決めること

- 完了報告テンプレートへ保留・却下件数欄と自律確定証跡（主要根拠・HITL不要理由）欄を追加するか

## 根拠

- PR #2335 本文「Findings / Capture候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2335）
- 要求元: agentdev-workflow-intake-promote STEP-6 reference（分類結果の報告形式）
