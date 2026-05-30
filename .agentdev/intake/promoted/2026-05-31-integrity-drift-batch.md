# Integrity Drift 一括修正バッチ

## 概要

Integrity Check (2026-05-31) および Oracle 再検証 (Epic #421) で検出された docs/reference drift の修正バッチ。REQ-0039 移行後の残余整合性問題を解消する。

## 修正項目一覧

### D-01: REQ-0033 promoted/req-define/ 旧構造参照（3件）
- **対象**: `docs/requirements/REQ-0033.md`
- **現状**: 旧 `promoted/req-define/` サブディレクトリ構造への参照が3件残存
- **修正**: フラット構造 (`promoted/*.md`) に合わせて該当記述を UPDATE
- **出典**: Oracle 再検証 (Epic #421)

### D-02: commands_e2e.test.ts の stale intake-open 参照（7件）
- **対象**: `.opencode/commands/agentdev/tests/commands_e2e.test.ts`
- **現状**: 削除済み `intake-open` コマンドへの参照が7件残存
- **修正**: req-backlog ベースに更新、または該当テストケースを再設計
- **出典**: Oracle 再検証 (Epic #421)

### D-03: ADR-0001 旧 skill 名（2件）
- **対象**: `docs/adr/ADR-0001.md` L37
- **現状**: `issue-work-orchestration`（現行: `agentdev-workflow-orchestration`）、`tips-pipeline-orchestration`（現行: `agentdev-learning-pipeline`）
- **修正**: 現行名に更新
- **出典**: Integrity Check 2026-05-31 F-03

### D-04: ADR-0002 旧 skill 名（2件）
- **対象**: `docs/adr/ADR-0002.md` L34-35
- **現状**: D-03 と同一の旧 skill 名
- **修正**: 現行名に更新
- **出典**: Integrity Check 2026-05-31 F-04

### D-05: ADR README Related REQ テーブル 9件リンク切れ
- **対象**: `docs/adr/README.md` L89-97
- **現状**: `[REQ-{NNNN}](../requirements/REQ-{NNNN}.md)` → 対象 REQ は `retired/` 移動済み
- **修正**: リンク先を `../requirements/retired/REQ-{NNNN}.md` に変更
- **出典**: Integrity Check 2026-05-31 F-01

### D-06: ADR README ADR-0009 status 二重記載
- **対象**: `docs/adr/README.md` L17
- **現状**: ADR-0009 status `proposed`。Status View (L34) と本文 frontmatter は `accepted`
- **修正**: L17 の status を `accepted` に変更
- **出典**: Integrity Check 2026-05-31 F-02

### D-07: case-run Epic variant パス不一致
- **対象**: `.opencode/commands/agentdev/case-run.md` L169-171
- **現状**: `completion-reports/case-run/{all-success,...}` を参照
- **実体**: `completion-reports/case-run-epic/{all-success,...}`
- **修正**: 参照パスを `completion-reports/case-run-epic/` に変更
- **出典**: Integrity Check 2026-05-31 F-05

### D-08: specs/README.md に design-principles.md 未掲載
- **対象**: `docs/specs/README.md` SPEC Files テーブル
- **現状**: 3件のみ。`design-principles.md` が欠落
- **修正**: `design-principles.md` をテーブルに追加
- **出典**: Integrity Check 2026-05-31 F-07

### D-09: system.md REQ番号範囲表記不正
- **対象**: `docs/specs/system.md` L212
- **現状**: `REQ-0101〜0049`（`0049` は旧番号）
- **修正**: `REQ-0101〜REQ-0109` に修正
- **出典**: Integrity Check 2026-05-31 F-09

## 影響範囲

| カテゴリ | 対象ファイル | 項目数 |
|----------|-------------|--------|
| REQ 旧構造参照 | `docs/requirements/REQ-0033.md` | 3件 |
| テスト stale 参照 | `tests/commands_e2e.test.ts` | 7件 |
| ADR 旧 skill 名 | `ADR-0001.md`, `ADR-0002.md` | 4件 |
| ADR README リンク切れ | `docs/adr/README.md` | 10件 |
| コマンド定義パス | `case-run.md` | 3件 |
| specs インデックス | `specs/README.md`, `system.md` | 2件 |

## 前提・制約

- REQ-0039 移行後に残存した整合性問題
- REQ本文の機能要件自体は変更しない（参照・表記の修正のみ）
- テスト修正は実行有無の判断を含む

## 元 intake item

- `2026-05-29-req-0033-promoted-req-define-refs.md`
- `2026-05-29-stale-intake-open-test-refs.md`
- `2026-05-31-integrity-adr-0001-old-skill-names.md`
- `2026-05-31-integrity-adr-0002-old-skill-names.md`
- `2026-05-31-integrity-docs-reference-drift.md`
