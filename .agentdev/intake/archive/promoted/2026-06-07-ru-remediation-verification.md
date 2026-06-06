# RU Remediation 系列（RU-0001〜0006）完了条件未達

不整合 Remediation 戦略に基づく6段階の体系的アプローチ（RU-0001〜0006）の各 Issue で、完了条件がすべて未チェックのままクローズされている。台帳作成、機械的修正、旧語彙現行化、意味矛盾解消、Runtime 境界整理、予防ゲート整備の各フェーズの完了確認が記録されていない。

**RU-0001 台帳（#581）**: 台帳スキーマ文書化、integrity check 結果投入、全不整合エントリ化、ルート割り当て、台帳保存（5項目）
**RU-0002 機械的修正（#584）**: strict_mechanical エントリ処理済み確認、修正後再検査、false_positive 根拠記録、deferred エントリ ルーティング（4項目）
**RU-0003 旧語彙現行化（#585）**: REQ-0112 Pattern A/B/C/D 除去確認、旧語彙除去、分類済み確認、ambiguous/runtime ルーティング（4項目）。REQ-0112 未実装部分があれば本 Issue で対応する方針だった。
**RU-0004 文書責務（#583）**: REQ-0101 guide count mismatch 解消、system.md stale references 更新、guides 内規範的 requirements 除去、未 acceptance ADR 引用確認、全意味矛盾解消（5項目）
**RU-0005 Runtime 境界（#582）**: 全コマンド thin 確認、judgment/template/script 配置確認、.agentdev/ と .sisyphus/ 境界記述適合確認、runtime の docs/specs 暗黙依存確認、boundary_violation エントリ処理（5項目）
**RU-0006 予防ゲート（#586）**: 語彙レジストリ作成、ゲート水準定義・反映、回帰テスト fixture 追加、authoring checklist 更新、false positive ルール文書化、REQ-0108 APPEND 候補確定（6項目）

## 根拠

- Issue #580: 不整合 Remediation 戦略 — 体系的特定・分類・修正・予防
  - アプローチ6段階のうち step 3「旧語彙現行化 → REQ-0112 の未実装分を含む全旧語彙の置換」を記載
- Issue #581: RU-0001: 不整合台帳・分類基準の確立 — 完了条件5項目未チェック
- Issue #582: RU-0005: Runtime Artifact 境界の整理 — 完了条件5項目未チェック
- Issue #583: RU-0004: 文書責務・意味矛盾の整理 — 完了条件5項目未チェック
- Issue #584: RU-0002: Strict Mechanical Cleanup — 完了条件4項目未チェック
- Issue #585: RU-0003: 旧語彙・旧分類の現行化 — 完了条件4項目未チェック。「0112 未実装部分があれば本Issueで対応」を記載
- Issue #586: RU-0006: 継続的予防ゲートの整備 — 完了条件6項目未チェック
