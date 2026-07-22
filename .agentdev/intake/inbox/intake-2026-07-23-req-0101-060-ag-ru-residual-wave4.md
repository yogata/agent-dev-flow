# REQ-0101-060 違反: Wave 4 横断的再評価で検出した新規15 SPEC の AG/RU 残留

## 由来

- PR #1750 (squash merge: d9a9a7b3), Issue #1743, Epic #1736 Wave 4（最終 Wave）
- PR 本文 Findings / Capture候補 セクション F-1 記載
- Phase 1 commit 0192019c 由来の工程固有識別子残留
- Wave 1 intake `intake-2026-07-23-req-0101-060-ag-ru-residual.md`（document-type-responsibilities.md）
- Wave 2 intake `intake-2026-07-23-req-0101-060-ag-ru-residual-wave2.md`（artifact-responsibilities.md、artifact-contracts.md、learning-promote.md、intake-promote.md）

## 現状

OU-007（Wave 4）の全現行 SPEC 横断的再評価で、既知5ファイルに加え新規15ファイル（計20ファイル）の AG/RU 残留を検出した。本 Issue #1743 の acceptance criteria は基準定義と横断再評価の実施が対象で、是正の実施は後続 pipeline 責務（TS-010 on_failure）のため PASS 判定した。

新規検出15ファイルの主な残留箇所（PR #1750 本文 F-1 表より抜粋）:

- `local/audit-ledger-lifecycle.md` 行13, 85, 91: AG-009、CR-004
- `commands/_template.md` 行64: AG-001/005/010/013、RU-20260722-01
- `commands/spec-save.md` 行50, 67: AG-006/007、RU-20260722-02
- `commands/req-define.md` 行79, 80, 94, 112, 161, 171: AG-002/005/010、RU-20260722-02
- `commands/backlog-review.md` 行76, 101: AG-004/005、RU-20260722-02
- `skills/_template.md` 行60, 62, 64, 67: AG-002/003/012/019、RU-20260722-01
- `foundations/document-model.md` 行399, 401: AG-002、RU-20260722-02
- `foundations/design-principles.md` 行143, 145, 146, 152-159: AG-001〜AG-019、RU-20260722-01
- `authoring/command-file-format.md` 行93, 95: AG-005/010、RU-20260722-01
- `skills/agentdev-spec-file-manager.md` 行10, 51, 52: AG-003/007/009/019、RU-20260722-01
- `skills/agentdev-artifact-validation.md` 行10, 48, 49, 54, 62, 77, 78, 87: AG-003/009/017/019、RU-20260722-01
- `skills/agentdev-doc-diagnostics.md` 行10, 52: AG-008、RU-20260722-01
- `responsibilities/responsibility-boundary-purification.md` 行64, 92: AG-010、RU-20260722-02（自己言及的違反、本 Issue Phase 1 保存節自体に残留。F-4）
- `quality/spec-health-metrics.md` 行229: AG-008、RU-20260722-02
- `quality/req-health-metrics.md` 行169: AG-008、RU-20260722-02

## 候補内容

Wave 1/2/4 既知5 + 新規15 = 計20ファイルを束ねた横断是正 RU の起案。Wave 4 で全現行 SPEC の再評価を実施した結果、本 Epic で取り得る選択肢は確定した。

### 選択肢 A: 全20 SPEC 横断是正（Wave 1/2/4 統合、推奨）

- Wave 1 対象: document-type-responsibilities.md
- Wave 2 対象: artifact-responsibilities.md、artifact-contracts.md、learning-promote.md、intake-promote.md
- Wave 4 新規対象: 上記15ファイル（responsibility-boundary-purification.md 含む）
- 全20 SPEC の AG/RU 残留を REQ 行番号または意味ベース参照へ一括置換
- メリット: REQ-0101-060 完全遵守、OU-007 横断的再評価の成果を一括是正へ接続
- デメリット: 大規模修正、レビュー負荷。ただし横断的再評価は OU-007 で完了しているため機械的置換が中心

### 選択肢 B: REQ-0101-060 運用調整

- AG/RU 引用を文書種別（SPEC 等）で例外許容する運用ルールの検討
- メリット: 修正コスト最小
- デメリット: REQ-0101-060 厳格性低下。OU-007 で「後方互換運用」节（unknown 既定値、警告モード、既存成果物拒否なし）を REQ-0136-035、ADR-0124 soft-contract で規定済みであり、新たに AG/RU 引用の例外を追加すると運用が複雑化

### 選択肢 C: 現状維持（known issue 蓄積、本 intake で完了）

- 横断是正は後続 pipeline で個別処理
- メリット: 本 Epic (#1736) 完了を阻害しない（既に完了済み）
- デメリット: REQ-0101-060 違反が継続、新規 Issue の発見可能性低下

## 想定反映先

- Wave 1/2/4 対象20 SPEC ファイル（横断是正時）
- `docs/requirements/REQ-0101.md` REQ-0101-060（例外判定追加時）

## 優先度

medium（文書品質問題、機能影響なし、OU-007 横断的再評価で全件検出済み、機械的置換で対応可能）

## 関連

- Epic #1736 Wave 4（最終 Wave）: Issue #1743, PR #1750
- Wave 1 intake: `intake-2026-07-23-req-0101-060-ag-ru-residual.md`（document-type-responsibilities.md）
- Wave 2 intake: `intake-2026-07-23-req-0101-060-ag-ru-residual-wave2.md`（4 SPEC）
- Phase 1 commit 0192019c
- REQ-0101-060: 現行基準本文からの工程固有識別子除去
- ADR-0139: 横断的再評価の根拠
- TS-010 on_failure: record-in-findings（本 Issue は不合格としない）
- F-4（自己言及的違反）: responsibility-boundary-purification.md 自体の残留を含む
