---
title: ローカル版 OpenCode 変換プロンプト
status: draft
created: 2026-06-20
updated: 2026-06-23
---

# ローカル版 OpenCode 変換プロンプト

> **Scope**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である（ADR-0103）。
> link mode への移行に伴い、ローカル版 OpenCode 変換プロンプト（`transform/generate.md`, `transform/review.md`, `transform/spec.md`）が不要となった経緯と、変換品質検証の読み替え先を定義する。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0104）。
> REQ-0141 と ADR-0131 の詳細仕様を原本とする。

## 目的

link mode 導入に伴い、`src/opencode-local/transform/` 配下の変換プロンプト要件を廃止または縮小する（AG-011, ADR-0131 decision #4）。
link mode では `src/opencode/` の原本がそのまま接続されるため、変換プロンプトによる意味変換は不要である。
本 SPEC は変換プロンプトの廃止根拠と、変換品質検証の後継を定義する。

## 変換プロンプトの廃止

以下のファイルは link mode では不要となるため廃止候補とする（AG-011, ADR-0131 decision #4）。

| ファイル | 廃止理由 |
|---|---|
| `transform/generate.md` | link mode では原本がそのまま接続されるため、ローカル版 command / skill / ひな形の生成が不要 |
| `transform/review.md` | 生成物のレビューが不要になったため |
| `transform/spec.md` | 変換仕様の集約参照資料が不要になったため |

link mode では、agentdev-gh-cli の link 先だけを差し替えることでローカル版が構成できる（ADR-0131 decision #3）。
そのため、command / skill 全体を変換するプロンプトは存在意義を失う。

## 変換品質検証の読み替え

変換プロンプトが担っていた品質検証要件（REQ-0141-029 残存 GitHub 固有参照の違反判定）は、agentdev-gh-cli 差し替え版の品質検証へ読み替える（AG-011）。

### 読み替え先

| 変換プロンプト時代の検証 | link mode での検証 |
|---|---|
| 生成物に残存 GitHub 固有参照がないか | ローカル版 agentdev-gh-cli が gh I/O と Case ファイル I/O の契約に一致しているか |
| case-open / case-run / case-close の意味変換が正しいか | 各手続きが Case ファイルの該当セクションへ正しく読み替えられているか |
| ひな形の相対参照構造が維持されているか | link mode では原本がそのまま接続されるため対象外 |

### 契約一致の検証観点

ローカル版 agentdev-gh-cli の品質検証は以下の観点で実施する。
詳細は [agentdev-gh-cli SPEC](../skills/agentdev-gh-cli.md) の差し替え可能性セクション参照。

- 標準版 agentdev-gh-cli の手続き名と、ローカル版 agentdev-gh-cli の手続き名が一致していること
- 標準版の Issue / PR 操作が、ローカル版で Case ファイルの対応セクションへ正しく読み替えられていること
- PR 関連手続きがスキップされておらず、Case ファイルの対応セクションで代替されていること

## 残存 GitHub 固有参照の違反判定基準

変換プロンプト時代に `transform/spec.md` が正本としていた違反判定基準は、link mode でも継続して適用する（REQ-0141-029）。
正本は本 SPEC と [ローカル版 OpenCode 生成](local-generation.md) が保持する。

| 参照の性質 | 違反 / 非違反 |
|---|---|
| 必須操作として残る GitHub Issue / PR 参照 | 違反 |
| 必須入力として残る GitHub Issue / PR 参照 | 違反 |
| 必須出力として残る GitHub Issue / PR 参照 | 違反 |
| 背景説明の GitHub Issue / PR 参照 | 非違反 |
| GitHub 版との置換表の GitHub Issue / PR 参照 | 非違反 |
| 対象外の説明の GitHub Issue / PR 参照 | 非違反 |
| 用語上の参照 | 非違反 |

## 関連項目

- [ローカル Case ファイル](local-case-file.md)（Case ファイルのスキーマ、状態遷移、見出し）
- [ローカル版 OpenCode 生成](local-generation.md)（link mode 接続フロー、link target 確認）
- [agentdev-gh-cli SPEC](../skills/agentdev-gh-cli.md)（I/O hub、差し替え可能性、操作契約）
- [実行時パッケージ境界](runtime-package-boundary.md)（`consumer-generated` リポジトリ種別）
- REQ-0141（ローカル版 OpenCode 導入方式とローカル Case ファイル運用）
- ADR-0131（ローカル版導入方式を link mode へ統一し生成方式を廃止）
