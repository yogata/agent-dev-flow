# 2026-10-20 sidecar 重複パスキーの構造的予防

## 内容

traceability sidecar 追記・更新フローへの重複パキー事前検出の導入要求。候補: check の malformed-declarations での重複キー検出追加、または sidecar 更新手順への統合ルール明記。現状の check は Bun.YAML の last-wins 解釈のため重複キーを検出できない（shadow された行は parse 時点で消える）。

背景: 重複は 6f414e5ff 時点（実装 PR #3818 の前）から存在する構造的負債であり、全70 sidecar 中 traceability/agentdev-workflow-req-define.yaml のみ。PR #3819 で統合解消済み。

## 根拠

- 観測元: PR #3819 本文「## Findings / Capture候補」セクション（intake 候補）
- 元テキスト: 「sidecar 重複パスキーの構造的予防。重複は 6f414e5ff 時点（実装 PR #3818 の前）から存在する構造的負債であり、全70 sidecar 中本ファイルのみ」
- 発見元: 修正委譲（DEL-3816-2）内の from-scratch 検証

---
