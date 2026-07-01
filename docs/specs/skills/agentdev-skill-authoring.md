---
title: `agentdev-skill-authoring` SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# `agentdev-skill-authoring` SPEC

## 目的

OpenCode SKILL.md の作成における品質基準とベストプラクティスを提供する。
5評価軸と4チェックプロトコルを定義する。

## 適用対象

- 新規 Skill 作成、既存 Skill 改善
- 品質レビュー、構造設計
- トリガー記述（USE FOR / DO NOT USE FOR）
- 段階的開示（progressive disclosure）設計

## 提供する判断、操作

- 5軸評価基準（明確性、完全性等）
- 500行ガバナンス（超過時 `references/` 抽出が必須、400行超で推奨）
- トリガー設計（USE FOR / DO NOT USE FOR、description へのトリガー埋め込み）
- 段階的開示
- Frontmatter 規約
- 複雑構造の扱い
- See Also 規約
- アンチパターン検出

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- 簡潔さ優先
- 500行超で `references/` 抽出が必須、400行超で推奨
- description にトリガー埋め込み（USE FOR / DO NOT USE FOR）
- 実行時パス（`.opencode/skills/`）と source path（`src/opencode/skills/`）の区別
- サブエージェント編集安全性
- スキル本文と references の project docs 参照は skill read contract に集約する（ADR-0133、SPEC `../foundations/project-read-contracts.md`）
  - スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
  - 実行時に読むべき docs は `.agentdev/read-contracts/skills/<skill>.yaml` の `conditional_read`, `allowed_discovery` へ移す
  - skill read contract はスキル単位で1ファイルに集約し、reference ごとの read contract は作らない
  - スキルは呼び出し元コマンドから渡された解決済み文脈を優先し、skill read contract は不足分の追加文脈として扱う

## 対象外

- コマンド定義作成（`agentdev-command-authoring` 担当）
- 一般的なコーディング
- 単純なドキュメント修正

## 検証観点

- 行数制限（500行上限、400行超で `references/` 推奨）
- トークン予算
- トリガー精度（USE FOR / DO NOT USE FOR）
- 構造チェック
- アンチパターン検出

## See Also

- [agentdev-command-authoring.md](agentdev-command-authoring.md)
- [agentdev-inspect-skills.md](agentdev-inspect-skills.md)
- REQ-0113（Skill References SPEC 分離基準）
- REQ-0119（コマンド、スキル、サブエージェント責務分界）
