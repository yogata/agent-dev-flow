# link mode 導入後の旧語彙の追随更新（REQ-0141 関連）

## 観測

PR #1101（src/opencode-local/README.md rewrite to link mode）で、REQ-0141 関連の旧語彙（「ローカル版生成方式」「変換プロンプト」「生成時ソース領域」等）が複数ファイルに残存することを確認した。各ファイルの更新は別 Issue / inspect 系で検出候補とした。

## 根拠

PR #1101 で記録された4件の旧語彙残存:

> - 内容: REQ-0141 の coverage 列が「ローカル版生成方式、src/opencode-local/ 生成時ソース領域、変換プロンプト、生成安全性制約」と旧用語で記述。link mode、agentdev-gh-cli 差し替え、unlink/relink などの現行要素が未反映。
> - 推奨対応先: 別 Issue（DOC-MAP の REQ-0141 行更新）または inspect-docs で検出候補。

> - 内容: `src/opencode-local/` の定義が「ローカル版生成時ソース領域」と記述し、構成要素として `case-schema/` を top-level に列挙（実際は agentdev-gh-cli/ 配下）。REQ-0141-004 の現行構成と不整合。
> - 推奨対応先: 別 Issue（glossary の src/opencode-local/ 行更新）または inspect-docs で検出候補。

> - 内容: 「ローカル版生成時ソース領域」「生成時ソース領域の実行エントリポイント」など旧用語で記述。link mode 導入方式への更新が必要。
> - 推奨対応先: 別 Issue（consumer-project-setup の link mode 導入方式への更新）または inspect-docs で検出候補。

対象ファイル候補: integrity-rule-catalog.md（REQ-0141-004 追随）、DOC-MAP.md（REQ-0141 行）、glossary.md（src/opencode-local/ 行）、consumer-project-setup.md（link mode 導入方式）。

補足: PR #1193（ADR-0126 residues → ADR-0131 link mode）で integrity-rule-catalog.md 等の一部是正が実施された可能性あり。要確認。
