---
title: `agentdev-skill-authoring` SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-18
spec_logical_division: cross_cutting_contract
canonical_owner: agentdev-skill-authoring
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
- スキル本文と references の project docs 参照は skill extension に集約する（SPEC `../foundations/project-extensions.md`）
  - スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
  - 実行時に読むべき docs は `.agentdev/extensions/skills/<skill>.yaml` の `context` へ移す
  - skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
  - スキルは呼び出し元コマンドから渡された解決済み文脈を優先し、skill extension は不足分の追加文脈として扱う

## project docs 参照

スキル本文と references の project docs 参照は skill extension（`.agentdev/extensions/skills/<skill>.yaml`）に集約する（REQ-002、SPEC `../foundations/project-extensions.md`）。各 SKILL.md には extension 参照方針（4項目）を配置する:

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/<skill>.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

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
- 参照先実ファイル存在確認（skill 本文から `references/`、`scripts/`、`templates/` 等へのパス参照が実ファイルを指すこと。参照のみが存在し実ファイルが不存在する状態を査読で検出する）

## See Also

- [agentdev-command-authoring.md](agentdev-command-authoring.md)
- [agentdev-inspect-skills.md](agentdev-inspect-skills.md)
- v2:REQ-0113（Skill References SPEC 分離基準）
- REQ-003（コマンド、スキル、サブエージェント責務分界）

## Workflow Skill と Capability Skill

Skill authoring は Workflow Skill と Capability Skill の責務差を区別する（DEC-010）。
Workflow Skill の SKILL.md は control plane（STEP transition・STEP間参照）を所有する。
STEP reference は references/ 配下に配置し、resume point として自足する（DEC-011）。
Capability Skill は複数workflow 共通能力を所有し、workflow 固有STEP と混在させない（REQ-002-018）。

## Workflow Skill Soft Guard（REQ-027-002）

### 採用する soft guard

Workflow Skill の description の DO NOT USE FOR に置く簡潔なトリガー項:

- 単独起動（対応する /agentdev/* コマンド経由で利用すること）

description からは soft guard マーカー語、内部 ID 参照、運用規則の散文を除去する。
Skill 層（description の DO NOT USE FOR トリガー）と Command 層（本文宣言節）の二層様式は workflow-skill-model.md「soft guard の二層様式」が正規所有する。

### 適用対象

全 16 Workflow Skill（agentdev-workflow-*）の description。機械検査は全 Workflow Skill への簡潔トリガー項存在を肯定検証する。

## skill 記述基準（層1〜3）

### 層1: description のコスト抑制

- description は機能概要とトリガーを伝える最小限の長さとする。単体上限 600 文字（検証不通過）、集約予算は平均 350 文字 × N（N = SKILL.md 実ファイル数、超過時 warn）、OpenCode 仕様上限 1024 文字は検証不通過の安全線とする
- description に運用規則、内部 ID、soft guard マーカー語（`soft guard`、`直接起動`）を含めない。それらは本文または権威文書へ置く

### 層2: 記述の単一所属

- description は「機能 1 文 + Use when（トリガー列挙）+ Do NOT use（直近の誤トリガー対策、少数項目）」の構造とする。他スキルの責務一覧を DO NOT USE FOR として列挙しない。経路案内は README 入口表へ集約する
- 本文に `## USE FOR` / `## DO NOT USE FOR` セクションを description と二重に保持しない
- 制約・ガードレールは command か skill のいずれか一方だけが所有する。「詳細は〜参照」の定型はファイル内 1 回まで。機械検査化に必要な例外規則は次のとおり: (1) project extensions 読込の boilerplate 行（5セクション読み込み手順の定型参照行）は消費対象、(2) project-extensions スキル本文の定義言及（extension 機構そのものの説明としての参照）は例外扱いとする
- references/ の分割は相互排他または稀にしか併用しない文脈に限る。頻用併用の内容は分割しない。300 行超の参照ファイルは目次を付ける
- 頻用併用信号規則: 参照選択表の同一行に複数の reference が併記されている状態は頻用併用の信号であり、統合候補として審査する（PR #2187 の統合実績に基づく）。併記が常態化する場合は当該 references の統合を検討する

### 層3: 指示のスタイル

- 工程は前提条件・出力契約・検証基準で記述する。決定論性は検証（QG・validator）で保証する
- 同一スキル内のルールは少数の不変条件へ集約する（目安: 主要不変条件 10 件以内/スキル、超過時は変換対照表へ例外理由を記録）
- 否定命令は硬い境界（課金・認証・破壊的操作の禁止等）に限って使う。工程上の選好は肯定形の不変条件で表現する
- harness や実行基盤の責務・既定動作の再説明を配布物に書かない
- Markdown 見出し・表などの構造は維持し、削るのは分量と手続き性とする

### 機械検査（本 SPEC 検証観点への追加）

検証不通過: 1024 超過、単体 600 超過、USE FOR 二重保持、description 内マーカー語・内部 ID、簡潔トリガー項欠落（AG-004)、300 行超 references の目次欠落。warn: 集約予算（平均 350×N）超過。実装は既存検査枠組み（repo-agentdev-integrity / docs-check）へ規則追加する

