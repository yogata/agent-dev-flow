---
name: obsidian-note-workflow
description: Manages Obsidian Vault note lifecycle (capture, organize, solidify, archive) with tagging and Zettelkasten principles. Use when creating notes, organizing inbox, adding tags, or archiving notes.
---

# Obsidian Note Workflow

## Overview
Obsidian Vaultの PARA × Zettelkasten 運用に基づくノート管理ワークフロー。収集・整理・定着・アーカイブのライフサイクルを管理します。

## When to Use
Obsidian Vaultでノートを作成・管理・整理する場合

## Core Pattern
収集 → 整理 → 定着 → アーカイブ

## Quick Reference
| ステージ | フォルダ | タグ | アクション |
|---------|----------|------|-----------|
| 収集 | 00_inbox | type/inbox | キャプチャ |
| 整理 | 40_resources/41_inbox | type/note | 分類・タグ付け |
| 定着 | 40_resources/42_notes | type/permanent | リンク付け |
| アーカイブ | 50_archives | status/archived | 移動 |

## Implementation
詳細は references/ ディレクトリの各ファイルを参照
- note-lifecycle.md: ライフサイクル詳細
- tag-guidelines.md: タグ設計ガイドライン
- link-patterns.md: リンク付けパターン

## Common Mistakes
- タグを付けすぎる
- リンクなしの孤立ノート
- ファイル整理の未完了
