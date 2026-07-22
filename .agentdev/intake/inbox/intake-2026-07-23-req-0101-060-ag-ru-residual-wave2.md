# REQ-0101-060 違反: Wave 2 対象 SPEC の AG/RU 残留（4 SPEC）

## 由来
- PR #1746 (squash merge: 640d6496), Issue #1739, Epic #1736 Wave 2
- PR 本文 Findings / Capture候補 セクション記載
- Phase 1 commit 0192019c 由来の工程固有識別子残留
- Wave 1 intake `intake-2026-07-23-req-0101-060-ag-ru-residual.md`（document-type-responsibilities.md 由来）の拡張情報

## 現状

OU-003 対象の 4 SPEC に AG/RU 識別子が残留し、REQ-0101-060（現行基準本文からの工程固有識別子除去）に違反している。Phase 1 と Wave 1 で段階的に是正する方針（REQ-0119-037）に従い、本 Wave では acceptance criteria 範囲内の参照整合性補強（ADR-0139 追記、相対パス是正）のみ実施し、AG/RU 残留の完全除去は別途横断是正 Issue での対応を推奨する。

主な残留箇所:

- `docs/specs/responsibilities/artifact-responsibilities.md`
  - 行30, 34, 36: AG-003、AG-007、AG-008、AG-019、RU-20260722-01、RU-20260722-02
- `docs/specs/responsibilities/artifact-contracts.md`
  - 行75, 112, 135: AG-002、AG-003、AG-004、AG-009、AG-012、AG-019、RU-20260722-01、RU-20260722-02
- `docs/specs/commands/learning-promote.md`
  - 行22: AG-004、RU-20260722-02
- `docs/specs/commands/intake-promote.md`
  - 行18: AG-004、RU-20260722-02

本 Issue #1739 の acceptance criteria 12項目は「追記されていること」「節が存在する」「定義が記載されている」等の存在確認を条件とし、識別子の正規性を含まないため PASS 判定した。QG-3 targeted docs guard のルールでも検出されなかった。REQ-0101-060 違反の解消は Wave 1 と同様に横断是正候補。

## 候補内容

Wave 1 intake と統合した横断是正 Issue の起案、または REQ-0101-060 運用調整:

### 選択肢 A: 全 SPEC 横断是正（Wave 1 + Wave 2 対象 SPEC 統合）
- Wave 1 対象: document-type-responsibilities.md
- Wave 2 対象: artifact-responsibilities.md、artifact-contracts.md、learning-promote.md、intake-promote.md
- 上記 5 SPEC の AG/RU 残留を REQ 行番号または意味ベース参照へ一括置換
- メリット: REQ-0101-060 完全遵守、作業効率
- デメリット: 大規模修正、他 Wave での追加残留リスク

### 選択肢 B: REQ-0101-060 運用調整
- AG/RU 引用を文書種別（SPEC 等）で例外許容する運用ルールの検討
- メリット: 修正コスト最小
- デメリット: REQ-0101-060 厳格性低下

### 選択肢 C: 現状維持（known issue 蓄積）
- 横断是正は Wave 4 (#1743 responsibility-boundary-purification.md UPDATE と全現行 REQ/SPEC 再評価) で対応
- メリット: 本 Epic (#1736) 完了を阻害しない
- デメリット: REQ-0101-060 違反が継続、Wave 3 でも残留拡大の可能性

## 想定反映先
- `docs/specs/responsibilities/artifact-responsibilities.md`、`docs/specs/responsibilities/artifact-contracts.md`、`docs/specs/commands/learning-promote.md`、`docs/specs/commands/intake-promote.md`（横断是正時）
- `docs/specs/responsibilities/document-type-responsibilities.md`（Wave 1 対象、統合時に併処理）
- `docs/requirements/REQ-0101.md` REQ-0101-060（例外判定追加時）

## 優先度
medium（文書品質問題、機能影響なし、REQ-0119-037 段階的対応方針に従う）

## 関連
- Epic #1736 Wave 2: Issue #1739, PR #1746
- Wave 1 intake: `intake-2026-07-23-req-0101-060-ag-ru-residual.md`（document-type-responsibilities.md 由来）
- Phase 1 commit 0192019c
- REQ-0101-060: 現行基準本文からの工程固有識別子除去
- REQ-0119-037: 段階的対応方針
