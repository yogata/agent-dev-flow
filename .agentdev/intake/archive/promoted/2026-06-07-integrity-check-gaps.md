# integrity-check 未実装検査・検証残（REQ-0108-111/112/126~127 + variant 検査 + 回帰テスト）

integrity-check に関連する複数の未完了検証・未実装検査が散在している。REQ-0108-111, 112, 126~127 の検査が未実装、command 定義の variant path 検査が未完了、完了報告フォーマットの integrity-check 検証が保留、移行後検証が別途確認扱い、コマンド肥大化是正の回帰テストが未実施となっている。

- REQ-0108-111, 112, 126~127 の integrity-check 検査が未実装
- integrity-check が command 定義の variant path と実際の template ファイルの一致を検査できない
- ADR retired REQ / broken links / implementation pattern mismatch の修正後、integrity-check で該当 finding が解消されることの確認が未完了（#503/#504 マージ後に確認が必要）
- 完了報告フォーマットの integrity-check 検査（case-run スコープ外として保留）
- REQ-0107 SSoT 化の移行後 integrity-check check (d) 検証が別途確認扱い
- コマンド・スキル肥大化是正（#511）の integrity-check 回帰テスト2項目未実施

## 根拠

- PR #587: chore(#581): 不整合台帳・分類基準の確立
  - INC-0024: REQ-0108-111, 112, 126~127 の検査が未実装と記録
- PR #571: feat: 各 command 定義の完了報告 template 参照パスを新配置に更新 (#564)
  - 完了条件「integrity-check が variant path と実際の template ファイルの一致を検査できること」が未チェック
- PR #509: fix: ADR retired REQ表記・system.md broken links・backlog-review pattern整合 (#505)
  - 完了条件「上記修正後に integrity-check で該当 finding が解消されること」が未チェック（#503/#504 マージ後に確認）
- Issue #511: コマンド・スキル肥大化是正と再発防止ガバナンス
  - テスト戦略2項目（integrity-check 回帰テスト・過検出再発防止テスト）が未チェック
- Issue #468: REQ-0107 SSoT 化: command 定義のインライン完了報告を completion-reports.md に集約
  - 残課題「integrity-check check (d) による移行後検証は別途確認」と記録
