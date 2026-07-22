# 新規要件行追加時の関連情報セクション相互参照漏れ: 予防候補

## 由来
- PR #1747 (squash merge: 52053418), Issue #1740, Epic #1736 Wave 2
- PR 本文 Findings / Capture候補 セクション記載
- 本 PR commit af3c5522 で是正済み

## 現状

REQ-0102-087/088 が REQ-0119-038 と ADR-0139 を根拠として明示参照するのに、REQ-0102.md 関連情報セクション（関連 REQ、関連 ADR）に REQ-0119 と ADR-0139 が未掲載だった。

- 修正前: REQ-0102-087 → REQ-0119-038 を明示参照するが、REQ-0102.md 関連 REQ に REQ-0119 が未掲載。REQ-0102-087/088 が RU-20260722-02 合意 ADR-0139 を根拠とするが、関連 ADR に ADR-0139 が未掲載。
- 修正後: REQ-0102.md 関連情報セクションに REQ-0119 と ADR-0139 を相互参照として追加。

Phase 1 commit 0192019c で要件行（REQ-0102-087/088）と SPEC 本文は追加されたが、関連情報セクションの相互参照追記が漏れていた。新規要件行を追加する際、根拠となっている REQ/ADR を関連情報セクションへ同時追記するチェックが req-save / case-close に存在しないことが原因。

Wave 1 intake `intake-2026-07-23-req-cross-reference-asymmetry.md`（REQ-0155/REQ-0156 間の双方向参照欠落）とは別問題。Wave 1 は REQ 間の対称性、本件は「新規要件行の根拠 REQ/ADR と関連情報セクションの同期」。

## 候補内容

新規要件行追加時に根拠 REQ/ADR を関連情報セクションへ同時追記する仕組みの検討:

### 選択肢 A: req-save 手順へのチェック項目追加
- req-save が新規要件行を保存する際、根拠 REQ/ADR を関連情報セクションへ追記するステップを明文化
- メリット: 入口での予防、新規違反の防止
- デメリット: req-save 手順の複雑化

### 選択肢 B: case-close (QG-4) での検証項目追加
- case-close の QG-4 検査観点に「新規要件行の根拠 REQ/ADR が関連情報セクションに掲載されているか」を追加
- メリット: 出口での検出、既存違反の回収
- デメリット: case-close 負荷増大

### 選択肢 C: check_changed_docs.ts へのルール追加
- REQ 変更時に要件行の根拠参照と関連情報セクションの整合性を自動チェック
- メリット: PR 単位で自動検出
- デメリット: 実装コスト、誤検知リスク

### 選択肢 D: 現状維持（都度修正）
- 個別 PR 単位で都度修正
- メリット: コスト最小
- デメリット: 漏れ発生リスク、Phase 1 のような工程では大量発生

## 想定反映先
- `.opencode/commands/agentdev/req-save.md`（選択肢 A）
- `.opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md`（選択肢 B）
- `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts`（選択肢 C）

## 優先度
medium（文書品質、機能影響なし、Phase 1 のような一括保存工程で再発可能性高）

## 関連
- Epic #1736 Wave 2: Issue #1740, PR #1747
- Wave 1 intake: `intake-2026-07-23-req-cross-reference-asymmetry.md`（REQ 間対称性、別問題）
- REQ-0102-087、REQ-0102-088、REQ-0119-038、ADR-0139
- Phase 1 commit 0192019c
