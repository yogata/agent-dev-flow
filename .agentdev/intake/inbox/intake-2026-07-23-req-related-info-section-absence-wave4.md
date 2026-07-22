# REQ 関連情報セクション不在: 18 REQ ファイルの横断確認候補

## 由来

- PR #1750 (squash merge: d9a9a7b3), Issue #1743, Epic #1736 Wave 4（最終 Wave）
- PR 本文 Findings / Capture候補 セクション F-3 記載
- Wave 1 intake `intake-2026-07-23-req-cross-reference-asymmetry.md`（REQ-0155/0156 双方向化、PR #1745 で是正済み）
- Wave 2 intake `intake-2026-07-23-req-related-info-section-sync.md`（REQ-0102-087/088 ↔ REQ-0119-038/ADR-0139、commit af3c5522 で是正済み）

## 現状

OU-007（Wave 4）の全現行 REQ 横断的再評価で、REQ ファイルの「## 関連情報」セクション相互参照状況を確認した。

- 52 REQ 中 34ファイルに「## 関連情報」セクション存在
- 18ファイルはセクション不在。REQ ファイル構成規則で関連情報セクションが必須か未確認

セクション不在18ファイル（PR #1750 本文 F-3 記載、一部 retired 含む）:

- REQ-0101, REQ-0103, REQ-0104, REQ-0107, REQ-0108, REQ-0109, REQ-0112, REQ-0113, REQ-0114, REQ-0143, REQ-0144, REQ-0145, REQ-0146, REQ-0147, REQ-0152, REQ-0153, REQ-0154, REQ-0160 等

本 Issue #1743 の acceptance criteria は横断的再評価の実施が対象で、是正の実施は後続 pipeline 責務（TS-010 on_failure）のため PASS 判定した。

## 候補内容

REQ ファイル構成規則の確認と、関連情報セクションの運用化。Wave 1/2 で検出した「双方向性」「根拠 REQ/ADR 同期」の問題に加え、Wave 4 で「セクション自体の不在」を新規検出した。

### 選択肢 A: REQ ファイル構成規則の明文化と全件是正

- document-model SPEC または REQ-0101 で「## 関連情報」セクション必須化を規定
- 18ファイルへセクションを新設し、相互参照を整理
- メリット: REQ 相互参照網羅性の担保、inspect-docs での横断確認が可能
- デメリット: 大規模修正、retired REQ の扱い判断が必要

### 選択肢 B: 現行運用維持（関連情報セクションは任意）

- 関連情報セクションを任意とし、必要 REQ のみに設ける運用を継続
- メリット: コスト最小
- デメリット: 相互参照網羅性の保証なし、Wave 1/2 と同種の問題が再発

### 選択肢 C: 必須化判定の実施（中間解）

- REQ ファイル構成規則の見直しを inspect-docs で実施し、関連情報セクション必須化の要否を判定
- 必須化が妥当な場合のみ選択肢 A へ移行
- メリット: 根拠ある判定、段階適用
- デメリット: 判定工程の追加

### Wave 1/2 との統合関係

Wave 4 で新規検出した「セクション不在」は、Wave 1「双方向性」、Wave 2「根拠 REQ/ADR 同期」と並列する第3の問題。3件を1 RU へ束ねる候補:

- RU 内容候補: 「REQ 関連情報セクション運用の整備（セクション必須化、双方向性、根拠同期）」
- 想定工程: req-define で運用方針確定 → req-save で REQ-0101 へ規定 → case-open/case-run で全件是正

## 想定反映先

- `docs/specs/foundations/document-model.md` または `docs/requirements/REQ-0101.md`（構成規則明文化時）
- 18 REQ ファイル（セクション新設時）

## 優先度

medium（文書品質、機能影響なし、Wave 1/2 と統合して1 RU 化が効率的）

## 関連

- Epic #1736 Wave 4（最終 Wave）: Issue #1743, PR #1750
- Wave 1 intake: `intake-2026-07-23-req-cross-reference-asymmetry.md`（REQ-0155/0156 双方向性）
- Wave 2 intake: `intake-2026-07-23-req-related-info-section-sync.md`（REQ-0102-087/088 根拠同期）
- Phase 1 commit 0192019c
- TS-010 on_failure: record-in-findings
