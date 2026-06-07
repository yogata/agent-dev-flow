# 9RU検証フォローアップ5件

## 観測

Epic #647 (9RU残要件一括対応) のWave 2 G4検証で、58 criteria中40達成・9 partial・9未達成。以下5件が未達成または要修正として特定された:

1. **broken junction 除去**: `.opencode/skills/agentdev-integrity` が存在するが実体なし（指し先の `src/opencode/skills/agentdev-integrity` が存在しない）。integrity-checkがF-001として検出
2. **禁止frontmatter field**: 5コマンドにREQ-0108-095~097で禁止された `load_skills` (case-close, case-open, case-run, case-update) と `implementation_pattern` (intake-promote, learning-promote) が残存
3. **ガイド数不整合**: REQ-0101-014 が「9 ガイド」と記載しているが実際は10ガイド（consumer-project-setup.md 追加分）
4. **Pattern A/B/C/D参照残存**: `docs/specs/design-principles.md` line 29 に旧分類コードの記述が残存。REQ-0112-023が現行分類からの除去を要求
5. **regression test未追加**: `check_integrity.test.ts` に REQ-0108-049,055,106,120,133~134,168 で要求される regression test ~200 LOC が未実装

## 今回扱わない理由

Epic #647のscopeは「9RU残要件の実装・検証」であり、検証で発見された新規課題の修正は別ケースで対応が適切。

## 影響

- 1: integrity-check実行時にbroken junctionエラーが発生する可能性
- 2: thin command原則違反。REQ-0108準拠性にgap
- 3: ドキュメントの正確性。ガイド一覧とREQの不一致
- 4: 旧語彙の残存。REQ-0112準拠性にgap
- 5: integrity-checkルール変更時の回帰防止が不完全

## レビューで決めること

- 5件を1つのCaseで扱うか、個別Caseにするか
- 優先度の設定（1,2が高、3,4が中、5が低）
- regression test (~200 LOC) のスコープ確定

## 根拠

- G4検証レポート: Issue #649 コメント (2026-06-07)
- 検証結果: 40/58達成 (69%)
