# AG-009: req-save/spec-save SPEC 記載項目の一部が check_changed_docs.ts profile rules に明示的対応 rule なし

## 観測内容

case-close Epic #1363 Wave 1 / PR #1366 (REQ-0157/0158 doc-inputs 機構と docs guard の仕上げ) の PR 本文 Findings より観察。`docs/specs/commands/req-save.md`、`docs/specs/commands/spec-save.md` に記載の changed docs guard 検査項目の一部が、`check_changed_docs.ts` の profile rules に明示的な対応 rule として実装されていない。実用上は既存 rule（req-required-frontmatter、spec-responsibility-classification 等）が包括的にカバーしている。

該当項目:
- req-save profile: 「要件行 ID 形式の妥当性」
- spec-save profile: 「変更 SPEC と近接リンクの整合」「integrity SPEC の catalog/rule file/script 整合」「REQ相当/ADR相当/guide相当の混入検出」

## 影響

- 実用上の検出漏れなし（既存 rule がカバー）
- command SPEC 記載と check_changed_docs.ts 実装の厳密な 1:1 対応が取れていない（ドキュメント整合性の問題）

## 課題

- `docs/specs/commands/req-save.md`、`docs/specs/commands/spec-save.md` の changed docs guard 記載項目と `check_changed_docs.ts` profile rules の厳密な 1:1 対応が必要か判定
- 必要な場合: 対応する rule を check_changed_docs.ts に追加、または SPEC 記載を実装に合わせて修正
- 不要な場合: SPEC 記載を「既存 rule が包括カバー」と明記

## 既存要件との関連

- AG-009（workflow 別検査責務の明確化）: PR #1366 で「主要項目カバー」により MET 判定
- REQ-0157: doc-inputs 機構
- REQ-0158: docs guard の仕上げ

## 観測元

- PR #1366 (Epic #1363 Wave 1 / Issues #1364, #1365 / REQ-0157, REQ-0158)
- case-close Step 10 capture 回収
