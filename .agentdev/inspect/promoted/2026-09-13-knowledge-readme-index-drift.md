# docs/knowledge/README.md の知識文書一覧が実態から乖離（3件記載 vs 実態8ファイル）

## 概要

docs/knowledge/README.md の「現在の知識文書」一覧（3件）が実態（知識文書8ファイル）から乖離しており、差分5ファイルが件数・列挙のいずれからも漏れている。README 一覧を8件・件数表記含めて現行化する。
既存 intake item（2026-09-11-knowledge-readme-missing-bun-offline-entry）は本件乖離5件に完全包含するため、本成果物へ範囲拡張により吸収・統合する（統合解決の詳細は「根拠」節参照）。

## 内容（修正対象）

- docs/knowledge/README.md「## 現在の知識文書」節の一覧を知識文書8ファイルへ現行化（件数表記「3件。」の更新を含む）
- 列挙漏れ5ファイル:
  - baseline-substitution-vocabulary-crosscheck.md
  - bun-offline-bundle-placement-independent-build.md（既存 intake item の指摘対象を包含）
  - bun-test-junit-reporter-evidence.md
  - distribution-concrete-id-placement.md
  - windows-bun-test-spawn-timeout-classification.md

## 受け入れ条件

1. docs/knowledge/README.md の知識文書一覧が実態の知識文書8ファイルと一致し、件数表記が更新されていること
2. 恒久対策候補の記録（採用判断は後続工程へ付託、本成果物から独立 route を作らない）:
   - REQ-056-010 の機械検査範囲（frontmatter + 本体5項目）への「README 列挙整合」拡張（docs-check route 候補）
   - knowledge README 一覧の AUTOGEN 化（index-auto-generation Design 準拠）
3. 再発構造の記録: learning 昇華（REQ-056-004、backlog-review の docs/knowledge/ 直接保存）の保存承認時に README 一覧更新が組み込まれていない運用ギャップが本乖離の再発構造である。上記恒久対策候補の採用判断材料とする

## 根拠

- evidence: README「## 現在の知識文書」節は「3件。」と記載し3ファイルのみ列挙（windows-powershell-bulk-io-corruption / checker-cli-stdout-loss-on-windows-bun / external-dependency-major-version-compatibility）。実態は docs/knowledge/ 配下に知識文書8ファイル（README 除く）が存在し、実ファイル一覧との機械的突合で乖離5件は確定（2026-09-13 現在）
- source_of_truth: 実態の知識文書8ファイル（REQ-056-001 の配置契約に従う正規成果物）を正とする。README の一覧は領域の案内であり、実態に追随すべき導線情報である。README の一覧更新義務は REQ 上明文化されていないが、列挙する以上は実態整合が要請される。docs/README.md「知識（Knowledge）」セクションは列挙を持たず REQ-057-016 に整合するため本件対象外
- 元検出事項: inspect-docs finding 20260913T145842Z F-01（severity: medium / confidence: high / ng_classification: pre-existing）
- 統合解決: 既存 intake item `.agentdev/intake/inbox/2026-09-11-knowledge-readme-missing-bun-offline-entry.md`（case 2775 / PR #2776 Findings 由来、case-close 2026-09-11 回収、bun-offline 1件のみ指摘）は本件乖離5件に完全包含する。本成果物に吸収し、同 item は inbox 残置の上、intake-promote 実行時に本成果物との重複として処分される（物理削除の主体は intake-promote の契約であり、inspect-promote では削除しない）。backlog-review 実行時は intake/promoted/ に同 item の派生成果物が存在しないことを確認のこと

## 後続

- backlog-review で RU 化（他 intake/learning promoted 成果物との統合・分割判定対象）
