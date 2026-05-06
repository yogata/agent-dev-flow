---
name: conventional-commits
description: Generates commit messages following Conventional Commits v1.0.0 spec. Use when creating commits, writing commit messages, or formatting commit history.
---

# conventional-commits

## プロジェクト固有ルール

- コミットメッセージは日本語で記述する
- フッター参照形式: `Refs: #N`（参照）、`Closes: #N`（クローズ）
- スコープ例: `api`, `auth`, `ui`, `database`, `config`, `test`

## Quick Reference

| type | SemVer | 例 |
|------|--------|----|
| `feat` | MINOR | `feat: ユーザー認証機能を追加` |
| `fix` | PATCH | `fix(api): レスポンスのステータスコードを修正` |
| `docs` | PATCH | `docs: READMEのインストール手順を更新` |
| `style` | PATCH | `style: コードのインデントを修正` |
| `refactor` | PATCH | `refactor: 関数のネストを整理` |
| `perf` | PATCH | `perf: クエリの実行速度を向上` |
| `test` | PATCH | `test: ログインのユニットテストを追加` |
| `build` | PATCH | `build: Node.jsバージョンを更新` |
| `ci` | PATCH | `ci: GitHub Actionsのバージョンを更新` |
| `chore` | PATCH | `chore: 依存パッケージを更新` |
| `revert` | PATCH | `revert: feat: ユーザー認証機能を追加` |

## Common Mistakes

| 間違い | 修正 |
|--------|------|
| `Feat:` → 大文字 | `feat:` 全て小文字 |
| ピリオド `機能を追加。` | ピリオド省略 `機能を追加` |
| 英語と日本語の混在 | 全て日本語で統一 |
