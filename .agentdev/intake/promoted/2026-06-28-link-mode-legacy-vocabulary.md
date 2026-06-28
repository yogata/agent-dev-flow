## 観測内容
PR #1101（src/opencode-local/README.md rewrite to link mode）で、REQ-0141 関連の旧語彙（「ローカル版生成方式」「変換プロンプト」「生成時ソース領域」等）が複数ファイルに残存することを確認した。2026-06-28 時点での検証で、これらの旧語彙は依然として 8 ファイルに残存していることが判明: DOC-MAP.md, local-generation.md, ADR-0131.md, ADR-0126.md, rule-ownership.md, specs/README.md, requirements/README.md, REQ-0141.md。PR #1193（ADR-0126 residues → ADR-0131 link mode）では完全には解消されていない。

PR #1101 で記録された旧語彙残存の具体的内容:
- REQ-0141 の coverage 列が「ローカル版生成方式、src/opencode-local/ 生成時ソース領域、変換プロンプト、生成安全性制約」と旧用語で記述。link mode、agentdev-gh-cli 差し替え、unlink/relink などの現行要素が未反映。
- `src/opencode-local/` の定義が「ローカル版生成時ソース領域」と記述し、構成要素として `case-schema/` を top-level に列挙（実際は agentdev-gh-cli/ 配下）。REQ-0141-004 の現行構成と不整合。
- 「ローカル版生成時ソース領域」「生成時ソース領域の実行エントリポイント」など旧用語で記述。link mode 導入方式への更新が必要。

対象ファイル候補: DOC-MAP.md（REQ-0141 行）、local-generation.md、ADR-0131.md、ADR-0126.md、rule-ownership.md、specs/README.md、requirements/README.md、REQ-0141.md、glossary.md（src/opencode-local/ 行）、integrity-rule-catalog.md（REQ-0141-004 追随）、consumer-project-setup.md（link mode 導入方式）。

## 影響
語彙の不整合で機能には影響しないが、ドキュメントの一貫性が損なわれている。link mode 導入後の追随更新が不完全。

## 課題
旧語彙（「ローカル版生成方式」「変換プロンプト」「生成時ソース領域」等）を link mode の現行語彙（link mode、agentdev-gh-cli 差し替え、unlink/relink 等）へ一斉置換する。8 ファイルを対象に更新を実施。

## 既存要件との関連
- REQ-0141
- PR #1101
- PR #1193
