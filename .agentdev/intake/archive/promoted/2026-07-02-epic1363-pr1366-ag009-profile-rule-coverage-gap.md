# AG-009: req-save/spec-save SPEC 記載項目の一部が check_changed_docs.ts profile rules に明示的対応 rule なし

## 観察

case-close Epic #1363 Wave 1 / PR #1366 (REQ-0157/0158 doc-inputs 機構と docs guard の仕上げ) の PR 本文 Findings より観察。

`docs/specs/commands/req-save.md`、`docs/specs/commands/spec-save.md` に記載の changed docs guard 検査項目の一部が、`check_changed_docs.ts` の profile rules に明示的な対応 rule として実装されていない:

- req-save profile: 「要件行 ID 形式の妥当性」
- spec-save profile: 「変更 SPEC と近接リンクの整合」「integrity SPEC の catalog/rule file/script 整合」「REQ相当/ADR相当/guide相当の混入検出」

実用上は既存 rule（req-required-frontmatter、spec-responsibility-classification 等）が包括的にカバーしている。厳密な1:1対応が必要な場合は別途調整。

## 影響

- 実用上の検出漏れなし（既存 rule がカバー）
- command SPEC 記載と check_changed_docs.ts 実装の厳密な1:1対応が取れていない（ドキュメント整合性の問題）
- AG-009 完了条件（「各 profile の検査項目が command SPEC 説明と一致」）は「主要項目カバー」で MET 判定

## 修正されなかった理由

PR #1366 の完了条件は AG-009（workflow別検査責務の明確化）。実装は「主要項目カバー」で完了条件を満たす。厳密な1:1対応は実用上不要と判断し case-run が Findings に記録。case-close が capture 回収。

## 課題

- `docs/specs/commands/req-save.md`、`docs/specs/commands/spec-save.md` の changed docs guard 記載項目と `check_changed_docs.ts` profile rules の厳密な1:1対応が必要か判定
- 必要な場合: 対応する rule を check_changed_docs.ts に追加、または SPEC 記載を実装に合わせて修正
- 不要な場合: SPEC 記載を「既存 rule が包括カバー」と明記

## 想定対応 Issue

- 保守系（maintenance）— command SPEC と check_changed_docs.ts 実装の整合性確認。優先度は低い（実用上の影響なし）

## 根拠

PR #1366 本文「## Findings / Capture候補」より:

> **AG-009 厳密な差異**: req-save の「要件行 ID 形式の妥当性」、spec-save の一部項目（「変更 SPEC と近接リンクの整合」「integrity SPEC の catalog/rule file/script 整合」「REQ相当/ADR相当/guide相当の混入検出」）が command SPEC に記載されているが check_changed_docs.ts の profile rules に明示的に対応する rule がない。実用上は既存 rule（req-required-frontmatter、spec-responsibility-classification 等）が包括的にカバー。厳密な1:1対応が必要な場合は別途調整。

## 観測元

- PR #1366 (Epic #1363 Wave 1 / Issues #1364, #1365 / REQ-0157, REQ-0158)
- case-close Step 10 capture 回収
- 観測日時: 2026-07-02 (case-close 実行中)
