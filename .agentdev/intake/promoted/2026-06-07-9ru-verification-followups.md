# 9RU検証フォローアップ5件

## 観測

Epic #647 (9RU残要件一括対応) の Wave 2 G4 検証で、58 criteria 中 40 達成・9 partial・9 未達成。以下 5 件が未達成または要修正として特定された。

## 課題一覧

### 1. broken junction 除去（優先度: 高）

- **現象**: `.opencode/skills/agentdev-integrity` が存在するが実体なし（指し先の `src/opencode/skills/agentdev-integrity` が存在しない）
- **影響**: integrity-check 実行時に broken junction エラーが発生する
- **関連要件**: REQ-0108-001（artifact collection registry）
- **修正方向**: broken junction の削除、または実体の復旧

### 2. 禁止 frontmatter field 残存（優先度: 高）

- **現象**: 5 コマンドに REQ-0108-095~097 で禁止された field が残存
  - `load_skills`: case-close, case-open, case-run, case-update
  - `implementation_pattern`: intake-promote, learning-promote
- **影響**: thin command 原則違反。REQ-0108 準拠性に gap
- **関連要件**: REQ-0108-022, REQ-0108-023, REQ-0108-024, REQ-0112-019, REQ-0112-020
- **修正方向**: 当該 field の frontmatter からの除去

### 3. ガイド数不整合（優先度: 中）

- **現象**: REQ-0101-014 が「9 ガイド」と記載しているが実際は 10 ガイド（consumer-project-setup.md 追加分）
- **影響**: ドキュメントの正確性。ガイド一覧と REQ の不一致
- **関連要件**: REQ-0101（文書・REQ管理基準）
- **修正方向**: REQ-0101-014 の記載を実際のガイド数に更新

### 4. Pattern A/B/C/D 参照残存（優先度: 中）

- **現象**: `docs/specs/design-principles.md` line 29 に旧分類コードの記述が残存
- **影響**: 旧語彙の残存。REQ-0112 準拠性に gap
- **関連要件**: REQ-0112-015, REQ-0112-023（Pattern 退場）
- **修正方向**: design-principles.md から旧分類コード参照を除去

### 5. regression test 未追加（優先度: 低）

- **現象**: `check_integrity.test.ts` に REQ-0108-049, 055, 106, 120, 133~134, 168 で要求される regression test（約 200 LOC）が未実装
- **影響**: integrity-check ルール変更時の回帰防止が不完全
- **関連要件**: REQ-0108-012（体系的テスト）
- **修正方向**: 要求される regression test の追加

## 今回扱わない理由

Epic #647 の scope は「9RU残要件の実装・検証」であり、検証で発見された新規課題の修正は別ケースで対応が適切。

## backlog-review 向け分析観点

- 5 件を 1 つの Case で扱うか、個別 Case にするか
- 優先度の設定（1, 2 が高、3, 4 が中、5 が低）
- regression test（約 200 LOC）のスコープ確定
- REQ-0108 / REQ-0112 準拠性の全体像としての整理

## 根拠

- G4 検証レポート: Issue #649 コメント (2026-06-07)
- 検証結果: 40/58 達成 (69%)
