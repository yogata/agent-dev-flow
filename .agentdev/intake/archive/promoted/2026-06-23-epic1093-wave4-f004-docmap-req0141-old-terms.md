# DOC-MAP の REQ-0141 カバレッジ説明が旧用語を使用

## 発生源

- Epic: #1093 (Wave 4)
- Issue: #1097 (REQ-0141 UPDATE)
- PR: #1101 (merged, squash a225893cb22a8ca2536ed6e10687d36826f49499)
- 発生日: 2026-06-23
- 処理: case-close Step 10 Capture 回収（PR 本文 Findings / Capture候補 intake セクション F-004）

## 内容

`docs/DOC-MAP.md` L53 の REQ-0141 coverage 列が「ローカル版生成方式、src/opencode-local/ 生成時ソース領域、変換プロンプト、生成安全性制約」と旧用語で記述している。link mode、agentdev-gh-cli 差し替え、unlink/relink などの現行要素が未反映。

## 推奨対応先

- 別 Issue（DOC-MAP の REQ-0141 行更新）
- または inspect-docs で検出候補

## 現在の追跡状態

- intake inbox に保存（2026-06-23 Epic #1093 Wave 4 close より）
- intake-promote 判断待ち
