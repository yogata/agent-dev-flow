---
name: obsidian-note-workflow
description: Manages Obsidian Vault note lifecycle (capture, organize, solidify, archive) with tagging and Zettelkasten principles. USE FOR: creating notes, organizing inbox, adding tags, or archiving notes. DO NOT USE FOR: vault configuration, plugin setup, periodic review processes, or general file management outside the note lifecycle.
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

## Stages

### Capture（収集）
アイデア、ブックマーク、一時ノートを `00_inbox` に `type/inbox` タグ付きでキャプチャする。フォーマット不要 — 生のキャプチャが最優先。後で整理ステージで処理する。

### Organize（整理）
`00_inbox` から `40_resources/41_inbox` にノートを移動し、適切なタグ（`type/note`、ドメインタグ）を適用して説明的なタイトルを割り当てる。各ノートは1つの明確な目的を持つこと。

### Solidify（定着）
整理済みノートを `40_resources/42_notes` の `type/permanent` タグ付き恒久ノートに変換する。関連ノートへの双方向リンクを追加し、長期的価値のために内容を洗練させ、原子性（1ノート1アイデア）を確保する。

### Archive（アーカイブ）
完了または非アクティブなノートを `status/archived` タグ付きで `50_archives` に移動する。ノートは検索可能だがアクティブなワークスペースから外れる。定期的にレビューして再活性化を検討する。

## Implementation
各ステージの詳細手順と具体例は、references/ ディレクトリの各ファイルを参照:
- [note-lifecycle.md](references/note-lifecycle.md): ライフサイクル詳細
- [tag-guidelines.md](references/tag-guidelines.md): タグ設計ガイドライン
- [link-patterns.md](references/link-patterns.md): リンク付けパターン

## Common Mistakes
- **Too many tags**: Adding 5+ tags to a single note creates noise. Limit to 2-3 meaningful tags per note. Example: ❌ `#idea #project #work #important #urgent` → ✅ `#project/alpha type/note`
- **Orphan notes without links**: Notes without any `[[wiki-links]]` become undiscoverable. Always link new notes to at least one existing note. Example: ❌ A standalone meeting note → ✅ Meeting note linked to project note and person note
- **Incomplete organization**: Leaving notes in `00_inbox` after processing. Once reviewed and tagged, move to the appropriate stage folder immediately
