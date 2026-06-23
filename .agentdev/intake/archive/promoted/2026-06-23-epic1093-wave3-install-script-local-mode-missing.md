# scripts/install-consumer-opencode.ps1 は通常版のみ対応

## 発生源

- Epic: #1093 (Wave 3)
- Issue: #1096 (REQ-0134 APPEND)
- PR: #1100 (merged, squash 27a28730)
- 発生日: 2026-06-23
- 処理: case-close Step 10 Capture 回収（PR 本文 Findings / Capture候補 intake セクション F-002）

## 内容

`scripts/install-consumer-opencode.ps1`（L13-L14）は `consumer-with-agentdev`（通常版）向けであり、`consumer-generated`（ローカル版）向けの agentdev-gh-cli → src/opencode-local/agentdev-gh-cli/ の link 設定を欠いている。

REQ-0103-158 が定めるローカル版 link 構成（agentdev-gh-cli のみ src/opencode-local/ へ接続）を実装するインストールスイッチ（例: `-LocalMode`）または別スクリプトが未提供。

本スクリプトは runtime-package-boundary SPEC が規定する「link mode の接続手順の技術詳細」に該当し、Wave 3 #1096 の対象外であった。

## 推奨対応先

- Wave 4 #1097（REQ-0141 link mode 前提への再構成 + local SPEC 改訂）
- または別 Issue（local-generation SPEC の技術詳細実装）で検討候補
- runtime-package-boundary SPEC の接続手順技術詳細領域を新設する RU 候補

## 現在の追跡状態

- intake inbox に保存（2026-06-23 Epic #1093 Wave 3 close より）
- intake-promote 判断待ち
