# REQ-0101-060 違反: document-type-responsibilities.md の AG/RU 残留

## 由来
- PR #1744 (squash merge: f0c9275d), Issue #1737, Epic #1736 Wave 1
- PR 本文 Findings/docs-integrity セクション記載
- Phase 1 commit 0192019c 由来の工程固有識別子残留

## 現状

`docs/specs/responsibilities/document-type-responsibilities.md` に再編工程固有識別子が残留し、REQ-0101-060（現行基準本文からの工程固有識別子除去）に違反している。

主な残留箇所:
- 行57: `（AG-001、AG-004、RU-20260722-02 合意、ADR-0139）`
- 行73: `（REQ-0136-033、AG-004）`
- 行91: `（REQ-0136-033、AG-004）`
- 行193: AG-011 残留
- 行215: RU-20260722-01 残留

本 Issue #1737 の acceptance criteria 5項目は「追記されていること」を条件とし、識別子の正規性を含まないため PASS 判定した。QG-3 targeted docs guard のルールでも検出されなかった。ただし REQ-0101-060 違反の解消は別 Issue（文書品質系、または inspect-docs 由来）で扱うべき候補。文書全体の横断是正が望ましい。

## 候補内容

document-type-responsibilities.md 全体の横断是正、または REQ-0101-060 の例外判定ルール検討:

### 選択肢 A: 横断是正
- document-type-responsibilities.md 内の全 AG/RU 残留を REQ 行番号または意味ベース参照へ置換
- メリット: REQ-0101-060 完全遵守
- デメリット: 既存 SPEC の大規模修正、他 SPEC への横展リスク

### 選択肢 B: REQ-0101-060 例外判定ルール追加
- 文書種別（SPEC 等）により AG/RU 引用を許容する例外を規定
- メリット: 修正コスト最小
- デメリット: REQ-0101-060 厳格性低下

### 選択肢 C: 現状維持（known issue 記録）
- 横断是正は別途 inspect-docs または大規模メンテ Wave で対応
- メリット: 本 Epic (#1736) 完了を阻害しない
- デメリット: REQ-0101-060 違反が継続

## 想定反映先
- `docs/specs/responsibilities/document-type-responsibilities.md`（横断是正時）
- `docs/requirements/REQ-0101.md` REQ-0101-060（例外判定追加時）

## 優先度
medium（文書品質問題、機能影響なし、他 SPEC にも同様の残留リスクあり）

## 関連
- Epic #1736 Wave 1: Issue #1737, PR #1744
- Phase 1 commit 0192019c
- REQ-0101-060: 現行基準本文からの工程固有識別子除去
