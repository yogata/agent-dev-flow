---
name: agentdev-conventional-commits
description: Generates commit messages following Conventional Commits v1.0.0 spec. USE FOR: creating commits, writing commit messages, or formatting commit history. DO NOT USE FOR: git operations beyond commit messages, branch naming conventions, or changelog generation.
---

# `agentdev-conventional-commits`

## 原本（SSoT）

本スキルの原本仕様は [`agentdev-conventional-commits` SPEC](../../../../docs/specs/skills/agentdev-conventional-commits.md) である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## プロジェクト固有ルール

- コミットメッセージは日本語で記述する
- フッター参照形式: `Refs: #N`（参照）、`Closes: #N`（クローズ）
- スコープ例: `api`, `auth`, `ui`, `database`, `config`, `test`

## 簡易参照（Quick Reference）

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

## よくある誤り（Common Mistakes）

| 間違い | 修正 |
|--------|------|
| `Feat:` → 大文字 | `feat:` 全て小文字 |
| ピリオド `機能を追加。` | ピリオド省略 `機能を追加` |
| 英語と日本語の混在 | 全て日本語で統一 |

## GitHub auto-close 回避ガイドライン

コミットメッセージに GitHub auto-close キーワード（`close`/`closes`/`closed`/`fix`/`fixes`/`fixed`/`resolve`/`resolves`/`resolved`）を含む複合語と `#N`（Issue 番号参照）を近接して記述する場合、GitHub が複合語内の部分文字列を auto-close キーワードとして誤認し、意図せず Issue をクローズするリスクがある。

### リスク事例

- `case-close` 等の "close" を含むコマンド名（複合語）と `#N` を括弧内で併存させた表記（例: `(case-close #1403)`）で、GitHub が "close" を auto-close キーワードとして認識し、直後の `#1403` をクローズ対象として解釈する
- `disclose`/ `closed-loop` 等、"close" を含む他の複合語でも同様の誤認が発生し得る

### 回避策

コマンド名と Issue 番号を分離し、`#` 記号による Issue 参照を避ける:

| 回避策 | 例 |
|--------|-----|
| コマンド名と番号を分離（`#` 省略） | `case-close for Epic 1403` |
| 括弧内表記を避ける | `Epic 1403 の case-close` |

括弧内にコマンド名 + Issue 番号を併記する必要がある場合は、複合語内に auto-close キーワードが含まれないか確認すること。

### 意図的クローズ表記の運用維持

本ガイドラインは「auto-close キーワードを含む複合語と `#N` の近接併存」のみを対象とする。意図的なクローズ表記（`fixes #123` 等）の運用は維持する。フッター参照形式（`Refs: #N`（参照）/ `Closes: #N`（クローズ））も従来通り使用可能である。
