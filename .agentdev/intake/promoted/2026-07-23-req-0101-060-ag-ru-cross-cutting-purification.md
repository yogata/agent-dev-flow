# REQ-0101-060 違反: 計20 SPEC の AG/RU 残留 横断是正

## 統合元

本成果物は以下3件の intake item を統合したものである。Wave 1/2/4 で段階的に検出され、各 item が相互に統合を想定していた。

- Wave 1: `intake-2026-07-23-req-0101-060-ag-ru-residual.md`（document-type-responsibilities.md、Epic #1736 Wave 1）
- Wave 2: `intake-2026-07-23-req-0101-060-ag-ru-residual-wave2.md`（artifact-responsibilities.md、artifact-contracts.md、learning-promote.md、intake-promote.md、Epic #1736 Wave 2）
- Wave 4: `intake-2026-07-23-req-0101-060-ag-ru-residual-wave4.md`（新規15ファイル、Epic #1736 Wave 4 最終 Wave）

## 観測内容

Phase 1 commit `0192019c` 由来の工程固有識別子（AG-001〜AG-019、RU-20260722-01、RU-20260722-02 等）が、計20 SPEC ファイルの現行基準本文に残留している。OU-007（Wave 4）の全現行 SPEC 横断的再評価で、既知5ファイルに加え新規15ファイルを検出した。

REQ-0101-060（現行基準本文からの工程固有識別子除去）に違反する状態である。

## 影響

- 機能影響はない（文書品質問題）。
- REQ-0101-060 違反が継続している。各 Wave の Issue acceptance criteria は「追記されていること」「節が存在する」等の存在確認を条件とし、識別子の正規性を含まなかったため PASS 判定した。QG-3 targeted docs guard のルールでも検出されなかった。
- REQ-0119-037（段階的対応方針）に従い、各 Wave では是正を実施せず横断是正候補として蓄積してきた。Wave 4 で全現行 SPEC の再評価が完了し、横断是正の前提が整った。

## 対象20ファイル（主な残留箇所）

Wave 1 対象（1ファイル）:

- `docs/specs/responsibilities/document-type-responsibilities.md`（行57, 73, 91, 193, 215 等）

Wave 2 対象（4ファイル）:

- `docs/specs/responsibilities/artifact-responsibilities.md`（行30, 34, 36）
- `docs/specs/responsibilities/artifact-contracts.md`（行75, 112, 135）
- `docs/specs/commands/learning-promote.md`（行22）
- `docs/specs/commands/intake-promote.md`（行18）

Wave 4 新規対象（15ファイル）:

- `local/audit-ledger-lifecycle.md`（行13, 85, 91）
- `commands/_template.md`（行64）
- `commands/spec-save.md`（行50, 67）
- `commands/req-define.md`（行79, 80, 94, 112, 161, 171）
- `commands/backlog-review.md`（行76, 101）
- `skills/_template.md`（行60, 62, 64, 67）
- `foundations/document-model.md`（行399, 401）
- `foundations/design-principles.md`（行143, 145, 146, 152-159）
- `authoring/command-file-format.md`（行93, 95）
- `skills/agentdev-spec-file-manager.md`（行10, 51, 52）
- `skills/agentdev-artifact-validation.md`（行10, 48, 49, 54, 62, 77, 78, 87）
- `skills/agentdev-doc-diagnostics.md`（行10, 52）
- `responsibilities/responsibility-boundary-purification.md`（行64, 92）— 自己言及的違反（F-4）。本 Issue Phase 1 保存節自体に残留
- `quality/spec-health-metrics.md`（行229）
- `quality/req-health-metrics.md`（行169）

## 課題

計20ファイルの AG/RU 残留を除去し、REQ 行番号または意味ベース参照へ一括置換する。Wave 4 で全現行 SPEC の横断的再評価が完了しているため、機械的置換が中心となる。ただし大規模修正であり、レビュー負荷に注意が必要。

自己言及的違反（responsibility-boundary-purification.md 自体の残留、F-4）の処理も含む。

## 既存要件との関連

- REQ-0101-060: 現行基準本文からの工程固有識別子除去（本件の違反対象基準）
- REQ-0119-037: 段階的対応方針（各 Wave で是正を先送りした根拠）
- ADR-0139: 横断的再評価の根拠
- TS-010 on_failure: record-in-findings（各 Issue を不合格としなかった根拠）

## 候補内容（対応方針）

### 選択肢 A: 全20 SPEC 横断是正（推奨）

- Wave 1/2/4 対象20 SPEC の AG/RU 残留を REQ 行番号または意味ベース参照へ一括置換
- メリット: REQ-0101-060 完全遵守、OU-007 横断的再評価の成果を一括是正へ接続
- デメリット: 大規模修正、レビュー負荷。ただし横断的再評価は OU-007 で完了しているため機械的置換が中心

### 選択肢 B: REQ-0101-060 運用調整

- AG/RU 引用を文書種別（SPEC 等）で例外許容する運用ルールの検討
- メリット: 修正コスト最小
- デメリット: REQ-0101-060 厳格性低下。OU-007 で「後方互換運用」節（unknown 既定値、警告モード、既存成果物拒否なし）を REQ-0136-035、ADR-0124 soft-contract で規定済みであり、新たに AG/RU 引用の例外を追加すると運用が複雑化

### 選択肢 C: 現状維持（known issue 蓄積、本 intake で完了）

- 横断是正は後続 pipeline で個別処理
- メリット: 追加作業なし
- デメリット: REQ-0101-060 違反が継続、新規 Issue の発見可能性低下

## 想定反映先

- Wave 1/2/4 対象20 SPEC ファイル（選択肢 A 採用時）
- `docs/requirements/REQ-0101.md` REQ-0101-060（選択肢 B 採用時、例外判定追加）

## 優先度

medium（文書品質問題、機能影響なし、OU-007 横断的再評価で全件検出済み、機械的置換で対応可能）

## 関連

- Epic #1736（OU-007 最終 Wave 完了済み）
  - Wave 1: Issue #1737, PR #1744
  - Wave 2: Issue #1739, PR #1746
  - Wave 4: Issue #1743, PR #1750
- Phase 1 commit `0192019c`（工程固有識別子残留の発生源）
- REQ-0101-060、REQ-0119-037、ADR-0139、TS-010 on_failure: record-in-findings
