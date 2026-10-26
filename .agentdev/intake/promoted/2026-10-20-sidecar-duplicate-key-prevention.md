# sidecar 重複パスキーの構造的予防

## 観測内容

traceability sidecar 追記・更新フローへの重複パキー事前検出の導入要求。

- 候補: check の malformed-declarations での重複キー検出追加、または sidecar 更新手順への統合ルール明記
- 現状の check は Bun.YAML の last-wins 解釈のため重複キーを検出できない（shadow された行は parse 時点で消える）

## 影響

- 重複キーが再発した場合、check が検出できず shadow された行の義務が黙って失われる。
- 発見済みの重複（traceability/agentdev-workflow-req-define.yaml のみ、全 70 sidecar 中）は PR #3819 で統合解消済みだが、再発予防は未導入。

## 課題

- 検出手段（check 拡張）と手順ルール（更新手順への統合）のいずれで防ぐかの設計判断は後続分析で行う。

## 既存要件との関連

- traceability sidecar 契約、check_integrity（malformed-declarations 検出）

## 出典

- 観測元: PR #3819 本文「## Findings / Capture候補」セクション（intake 候補）
- 発見元: 修正委譲（DEL-3816-2）内の from-scratch 検証
