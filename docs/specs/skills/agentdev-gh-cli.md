---
title: agentdev-gh-cli SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-gh-cli SPEC

## 目的

Windows PowerShell 環境での GitHub CLI（gh）使用時のエンコーディングとエスケープエラーを防止し、安全な読み書き・検証手順を強制する。

## 適用対象

- `--body-file` / `-F` を使用した gh コマンド（case-open・case-run・case-close・case-update の各書き込み操作後）
- Windows 上での Issue/PR 作成・更新
- gh コマンド出力の読み取り

## 提供する判断・操作

- WRITE 操作: `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` で BOM なし UTF-8 ファイル作成・`--body-file` / `-F` 経由で指定
- READ 操作: Node.js `execSync` で pwsh パイプラインをバイパスし UTF-8 出力を直接取得
- VERIFY 操作: 書き込み後の読み戻し検証（4観点: エンコーディング・Markdown 構造・テンプレート必須セクション・リポジトリ参照リンク正規化）
- 3段階リトライロジック（同一内容リトライ・内容再生成・停止・ユーザー報告）
- コンソールエンコーディング初期化（`chcp 65001`）

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- `--body` 直接指定禁止・`--body-file` 使用必須
- Windows ではコンソールエンコーディング初期化（`chcp 65001`）が必須
- リポジトリ参照リンク正規化は `verify_body.ts` の `checkLinkNormalization` で実行
- Markdown リンク内の相対パス・裸パスを検出

## 対象外

- 基本 gh コマンド（body なし）
- 非 Windows 環境（一部共通制約あり）
- 一般的な git 操作（`agentdev-git-worktree` 担当）

## 検証観点

- エンコーディング検証（UTF-8 BOM なし・LF）
- Markdown 構造検証
- テンプレート必須セクション検証
- リポジトリ参照リンク検証

## See Also

- [agentdev-issue-management.md](agentdev-issue-management.md)
- [commands/case-open.md](../commands/case-open.md)
- [commands/case-close.md](../commands/case-close.md)
- [commands/case-update.md](../commands/case-update.md)
