# Intake Item: document-model.md L153/L580 の 6 処置重複に対する相互参照追加

## 発生源

- PR: #1848 (Issue #1847 / OU-001, Epic #1845 Wave 1)
- 発生 phase: case-run 検証（document-model SPEC「恒久基準と非規範情報の整理」新セクションと L153「### 恒久契約適格性と既存成果物処置分類」の重複確認時）
- capture 分類: intake（具体的修正対象、積み残し作業候補）

## 問題

`docs/specs/foundations/document-model.md` の L153「### 恒久契約適格性と既存成果物処置分類」と L580「## 恒久基準と非規範情報の整理」は共に 6 処置（KEEP、MERGE、REFERENCE、MOVE、RETIRE、INFERENCE）を定義し、処置の意味合いは実質同一である。適用フェーズ（L153: 昇格前適格性判定 / L580: cleanup 実行モデル）と正規所有契約の参照元が異なるため統合は非推奨だが、6 処置名重複に対する reader の混乱を回避するため、相互参照による関係性の明示が推奨される。

## 推奨修正対象

`docs/specs/foundations/document-model.md`:

1. **L163「#### 既存成果物の6処置」**: L580 cleanup 実行契約への参照を付与
2. **L607「### 6 処置モデル」**: L153 適格性判定への参照を付与

## 推奨対応

別 Issue で相互参照を追加する。document-model.md 編集を許可する工程（spec-save または spec-update）で対応すること。本 Issue #1847 は document-model.md 読み取り専用検証であったため対応対象外。

## 関連

- references: docs/specs/foundations/document-model.md (L153-201, L580-639)
- Issue: #1847 (CLOSED), Epic: #1845 (CLOSED)
- PR: #1848 (Findings / Capture候補 セクション F-1)
- commit: 6eeedabf（spec-save）、025a20a1（OU-001 case-close）
- source finding: 「L153 vs L580 overlap 分析」推奨事項（統合非推奨、相互参照追加推奨）
