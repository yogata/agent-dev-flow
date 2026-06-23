# glossary の src/opencode-local/ 定義が旧構成・旧用語を使用

## 発生源

- Epic: #1093 (Wave 4)
- Issue: #1097 (REQ-0141 UPDATE)
- PR: #1101 (merged, squash a225893cb22a8ca2536ed6e10687d36826f49499)
- 発生日: 2026-06-23
- 処理: case-close Step 10 Capture 回収（PR 本文 Findings / Capture候補 intake セクション F-005）

## 内容

`docs/guides/glossary.md` L91 の `src/opencode-local/` の定義が「ローカル版生成時ソース領域」と記述し、構成要素として `case-schema/` を top-level に列挙している（実際は agentdev-gh-cli/ 配下）。REQ-0141-004 の現行構成と不整合。

## 推奨対応先

- 別 Issue（glossary の src/opencode-local/ 行更新）
- または inspect-docs で検出候補

## 現在の追跡状態

- intake inbox に保存（2026-06-23 Epic #1093 Wave 4 close より）
- intake-promote 判断待ち
