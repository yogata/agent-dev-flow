---
title: agentdev-doc-map SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-doc-map SPEC

## 目的

DOC-MAP（`docs/DOC-MAP.md`）の位置づけ、読み方、関連ドキュメント探索順序を定義する。
DOC-MAP を基準文書ではなく補助インデックスとして扱う。

## 適用対象

- ドキュメント構造の理解、関連ドキュメントの発見、探索順序の決定
- req-define の限定探索前、case-run の関連ドキュメント影響範囲探索時
- case-close の docs 検証時の DOC-MAP 記載と実際の基準文書の整合性確認

## 提供する判断、操作

- 基準（REQ/ADR/SPEC）と補助（DOC-MAP、README）の境界定義
- ドキュメント探索順序: 明示入力ファイル → DOC-MAP → 各 README / SPEC 入口 → 基準 REQ/ADR/SPEC → キーワード限定探索
- 影響確認フロー（REQ/ADR/SPEC 追加時の DOC-MAP 影響確認対象）
- 矛盾時の優先順位（基準優先、DOC-MAP 修正対象）

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- DOC-MAP は基準文書ではなく補助インデックス
- 基準と矛盾する場合は基準を優先し DOC-MAP を修正対象とする
- `docs/requirements/views/` は廃止済み（参照、作成、更新禁止）
- views が提供していた観点別体系化機能は DOC-MAP に統合済み

## 対象外

- REQ/ADR/SPEC ファイルの作成、変更実行（各 file-manager skill 担当）
- 正則な文書内容の置き換え、複製

## 検証観点

- DOC-MAP と基準文書の整合性
- 探索順序に従っているか
- 基準文書を直接読み込んでいるか（DOC-MAP の要約のみで判断していないか）
- DOC-MAP にのみ記載された情報が基準を持っているか

## See Also

- [agentdev-req-file-manager.md](agentdev-req-file-manager.md)
- [agentdev-adr-file-manager.md](agentdev-adr-file-manager.md)
- REQ-0101（文書、REQ 管理基準）
