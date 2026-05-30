# docs/reference drift 整理

## 観測
Integrity Check (2026-05-31) で検出された 5件の docs/reference 系ドリフトをまとめたバッチ修正項目。

### F-01: ADR README Related REQ テーブル 9件のリンク切れ
- **対象**: `docs/adr/README.md` L89-97
- **現状**: `[REQ-{NNNN}](../requirements/REQ-{NNNN}.md)` が 9件。対象 REQ は全て `retired/` に移動済みでリンク切れ
- **修正**: リンク先を `../requirements/retired/REQ-{NNNN}.md` に変更

### F-02: ADR README ADR-0009 status 二重記載
- **対象**: `docs/adr/README.md` L17（一覧テーブル）
- **現状**: ADR-0009 status が `proposed`。Status View (L34) と ADR本文 frontmatter は `accepted`
- **修正**: L17 の ADR-0009 status を `accepted` に変更

### F-05: case-run Epic variant パス不一致
- **対象**: `.opencode/commands/agentdev/case-run.md` L169-171
- **現状**: `completion-reports/case-run/{all-success,partial-fail,all-fail}.md` を参照
- **実体**: `completion-reports/case-run-epic/{all-success,partial-fail,all-fail}.md`
- **修正**: 参照パスを `completion-reports/case-run-epic/` に変更

### F-07: specs/README.md に design-principles.md 未掲載
- **対象**: `docs/specs/README.md` SPEC Files テーブル
- **現状**: 3件のみ掲載（system, patterns, quality-specs）。`design-principles.md` が欠落
- **修正**: `design-principles.md` をテーブルに追加

### F-09: system.md の REQ 番号表記に旧範囲混在
- **対象**: `docs/specs/system.md` L212
- **現状**: `REQ-0101〜0049` と記載。`0049` は旧REQ体系の番号
- **修正**: `REQ-0101〜REQ-0109` に修正

## 影響
- ADR README: ナビゲーションリンク 9件が壊れている。ADR-0009 の status 誤表示
- case-run: Epic モードの完了報告で variant 参照不能の可能性
- specs README: design-principles.md がインデックスから漏れている
- system.md: REQ番号範囲が不正確

## レビューで決めること
- 上記 5件の修正内容でよいか

## 根拠
- Integrity Check Report 2026-05-31 F-01, F-02, F-05, F-07, F-09
- 分類: `document-drift`, `broken-reference`
- 推奨ルート: `intake`
