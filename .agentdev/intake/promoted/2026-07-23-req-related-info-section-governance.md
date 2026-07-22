# REQ 関連情報セクション運用の整備: 双方向性・根拠同期・セクション不在

## 統合元

本成果物は以下3件の intake item を統合したものである。Wave 1/2 で予防仕組み検討が残り、Wave 4 で「セクション自体の不在」を新規検出した。Wave 4 item が「3件を1 RU へ束ねる候補」を明示していた。

- Wave 1: `intake-2026-07-23-req-cross-reference-asymmetry.md`（REQ-0155/0156 双方向性、Epic #1736 Wave 1、PR #1745 で是正済み）
- Wave 2: `intake-2026-07-23-req-related-info-section-sync.md`（REQ-0102-087/088 根拠同期、Epic #1736 Wave 2、commit af3c5522 で是正済み）
- Wave 4: `intake-2026-07-23-req-related-info-section-absence-wave4.md`（18 REQ ファイル セクション不在、Epic #1736 Wave 4 最終 Wave）

## 観測内容

REQ ファイル群の「## 関連情報」セクション周りで3つの異なる問題が Wave 1/2/4 に段階的に検出された。各事象自体は是正済みだが、予防仕組みが未整備であり、Wave 4 で第3の問題（セクション自体の不在）を新規検出した。

### 問題1: REQ 間相互参照の片方向欠落（Wave 1）

REQ-0155 の関連 REQ セクションに REQ-0156 が欠けていた（片方向参照）。REQ-0156 側には REQ-0155 が既に含まれていた。PR #1745 で双方向化して是正済み。他の REQ ペアでも発生する可能性がある。

### 問題2: 新規要件行追加時の根拠 REQ/ADR 同期漏れ（Wave 2）

REQ-0102-087/088 が REQ-0119-038 と ADR-0139 を根拠として明示参照するのに、REQ-0102.md 関連情報セクション（関連 REQ、関連 ADR）に REQ-0119 と ADR-0139 が未掲載だった。Phase 1 commit `0192019c` で要件行と SPEC 本文は追加されたが、関連情報セクションの相互参照追記が漏れていた。commit af3c5522 で是正済み。新規要件行追加時に根拠 REQ/ADR を関連情報セクションへ同時追記するチェックが req-save / case-close に存在しないことが原因。

### 問題3: 関連情報セクション自体の不在（Wave 4 新規検出）

OU-007（Wave 4）の全現行 REQ 横断的再評価で、52 REQ 中18ファイルに「## 関連情報」セクションが存在しないことを確認した。REQ ファイル構成規則で関連情報セクションが必須か未確認。

セクション不在18ファイル（一部 retired 含む）: REQ-0101, REQ-0103, REQ-0104, REQ-0107, REQ-0108, REQ-0109, REQ-0112, REQ-0113, REQ-0114, REQ-0143, REQ-0144, REQ-0145, REQ-0146, REQ-0147, REQ-0152, REQ-0153, REQ-0154, REQ-0160 等。

## 影響

- 機能影響はない（文書品質問題）。
- 相互参照網羅性が保証されず、Phase 1 のような一括保存工程で同種の問題が再発する可能性が高い。
- inspect-docs での横断確認が、セクション不在のため一部 REQ で実施できない。

## 課題

REQ ファイル構成規則の明文化と、関連情報セクション運用の整備。3問題は並列する:

1. セクション必須化の要否判定（Wave 4 新規）
2. REQ 間対称性の担保（Wave 1）
3. 新規要件行の根拠 REQ/ADR と関連情報セクションの同期（Wave 2）

予防仕組みは req-save / case-close（QG-4）/ check_changed_docs.ts のいずれかで実装候補。

## 既存要件との関連

- REQ-0102-087、REQ-0102-088（根拠同期の検出元要件行）
- REQ-0119-038、ADR-0139（根拠同期の参照先）
- document-model SPEC（REQ ファイル構成規則、`docs/specs/foundations/document-model.md`）
- REQ-0101（関連情報セクション必須化の規定先候補）

## 候補内容（対応方針）

### セクション必須化（問題3）

- 選択肢 A: document-model SPEC または REQ-0101 で「## 関連情報」セクション必須化を規定し、18ファイルへセクションを新設して相互参照を整理
- 選択肢 B: 現行運用維持（関連情報セクションは任意、必要 REQ のみに設ける）
- 選択肢 C: 必須化判定の実施（中間解）。inspect-docs で運用見直しを実施し、必須化が妥当な場合のみ選択肢 A へ移行

### REQ 間対称性・根拠同期の予防仕組み（問題1, 2）

- 選択肢 A: req-save 手順へのチェック項目追加（新規要件行保存時に根拠 REQ/ADR を関連情報セクションへ同時追記、対称性確認を明文化）。入口での予防
- 選択肢 B: case-close（QG-4）での検証項目追加。出口での検出、既存違反の回収
- 選択肢 C: check_changed_docs.ts へのルール追加（REQ 変更時に要件行の根拠参照と関連情報セクションの整合性、REQ 間対称性を自動チェック）。PR 単位で自動検出
- 選択肢 D: 現状維持（都度修正）。Phase 1 のような一括保存工程で再発可能性高

## 想定工程

req-define で運用方針確定（セクション必須化の要否、予防仕組みの選択）→ req-save で REQ-0101 / document-model SPEC へ規定 → case-open / case-run で全件是正・予防仕組み実装。

## 想定反映先

- `docs/specs/foundations/document-model.md` または `docs/requirements/REQ-0101.md`（構成規則明文化時）
- 18 REQ ファイル（セクション新設時）
- `.opencode/commands/agentdev/req-save.md`（選択肢 A、req-save 手順）
- `.opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md`（選択肢 B、QG-4 検査観点）
- `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts`（選択肢 C、自動チェック実装）

## 優先度

medium（文書品質、機能影響なし、Wave 1/2/4 統合して1 RU 化が効率的）

## 関連

- Epic #1736（OU-007 最終 Wave 完了済み）
  - Wave 1: Issue #1738, PR #1745
  - Wave 2: Issue #1740, PR #1747
  - Wave 4: Issue #1743, PR #1750
- Phase 1 commit `0192019c`
- REQ-0155, REQ-0156, REQ-0102-087, REQ-0102-088, REQ-0119-038, ADR-0139
- TS-010 on_failure: record-in-findings
