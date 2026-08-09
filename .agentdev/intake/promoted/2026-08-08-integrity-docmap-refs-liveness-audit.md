# integrity スクリプト群の DOC-MAP 参照45件の生死判定監査

## 観測内容

DOC-MAP.md 本体および配布スキルを #1953 で物理削除し、現行ドキュメント体系から DOC-MAP 参照を #1959 で横断除去した。
しかしコードレベルの DOC-MAP 依存（検証ロジック・テスト fixture）は `.opencode/` 配下の integrity スクリプト群へ残存している。
実測値（grep で確認、.opencode/ gitignore をスキップする点に注意）は下記のとおり45件（inbox 原文は「約50件」と記載していたが実測は45件）:
- check_integrity.ts が中心（inbox 原文は約40件と申告）
- generate_indexes.ts（約10件）
- check_changed_docs.ts（約5件）
- 各種テスト fixture

これらはドキュメント参照ではなく機能コードの DOC-MAP 検証ロジックであり、#1954 のスコープ（横断 DOC-MAP 参照除去）の対象外とした。

## 影響

DOC-MAP が存在しないにもかかわらず検証ロジックが DOC-MAP を走査対象に含み続け、保守負荷を生む。
IndexGenerationConsistency 等の検証カテゴリで DOC-MAP 関連の検査が無意味な NG/skip を出力し続ける可能性。
後続の integrity スクリプト改修時に DOC-MAP 関連分岐の存在が誤解を生む。
優先度は中。ただし生きた整合性検査が含まれる可能性もあり、一律の dead code 断定は回避する。

## 課題

45件の DOC-MAP 参照の生死判定監査を REQ-013（DOC-MAP 依存除去）移行の一環として実施する。
「全件 dead code 断定」は回避し、個別に生死を判定する。
- 生きた整合性検査: 保持
- 死んだ参照: 除去

対象スクリプト: `check_integrity.ts`、`generate_indexes.ts`、`check_changed_docs.ts`、およびテスト fixture。
baseline ファイル（`.opencode/skills/repo-agentdev-integrity/scripts/src/integrity-baselines/`）の DOC-MAP 関連エントリも併せて確認・整理する。
機能コードのリファクタリングであり、ドキュメント横断除去 Issue ではなく REQ-013 続編として扱う。

## 既存要件との関連

- REQ: REQ-013（DOC-MAP 依存除去）
- Epic: #1952（REQ-013: DOC-MAP 依存除去）
- Issue: #1953（DOC-MAP 本体削除）、#1954（横断参照除去）
- PR: #1959
- 実装: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`、`generate_indexes.ts`、`check_changed_docs.ts`

## 出典

- inbox 元ファイル: `intake-2026-08-08-docmap-removal-integrity-scripts-dead-code.md`
- 発生日: 2026-08-08
- PR: #1959（Issue #1954, Epic #1952）
