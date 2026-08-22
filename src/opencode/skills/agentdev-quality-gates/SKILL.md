---
name: agentdev-quality-gates
description: "Defines lightweight quality gates for the AgentDevFlow main workflow. USE FOR: QG definition integrity, QG acceptance criteria coverage, QG implementation deviation, QG final acceptance. DO NOT USE FOR: executing tests, modifying files, creating issues, creating or merging PRs, replacing command-specific procedures."
---

# Quality Gates スキル

AgentDevFlow 主ワークフローの品質ゲート QG-1〜QG-4 の判定基準、検査観点を提供する knowledge base。
本スキルは参照専用であり、ファイル編集、Issue 作成、PR 作成、マージ、テスト実行は行わない。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-quality-gates` Design である。
Design を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は Design を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）のみを前提とし、`docs/designs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-quality-gates.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/designs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/designs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/designs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 概要

- **役割**: QG-1〜QG-4 の判定基準、検査観点、乖離分類基準を提供する
- **対象**: AgentDevFlow **主ワークフローのみ**（req-define/ req-save/ design-save/ case-open/ case-run/ case-close）。design-save は主ワークフローの一工程だが、独自の QG を持たず QG-1（req-save）と QG-4（case-close）の Design lifecycle 確定で担保される
- **特性**: knowledge base。コマンドから参照され、判定結果を返すが成果物を直接編集しない
- **依存**: agentdev コマンドから参照される専門スキル

## Quality Gate 一覧

| Gate | 名称 | 配置コマンド | 参照ファイル |
|------|------|-------------|-------------|
| QG-1 | Definition Integrity Gate | req-define/ req-save | [qg-1-definition-integrity.md](references/qg-1-definition-integrity.md) |
| QG-2 | Acceptance Criteria Coverage Gate | case-open | [qg-2-acceptance-criteria-coverage.md](references/qg-2-acceptance-criteria-coverage.md) |
| QG-3 | Implementation Deviation Gate | case-run | [qg-3-implementation-deviation.md](references/qg-3-implementation-deviation.md) |
| QG-4 | Final Acceptance Gate | case-close | [qg-4-final-acceptance.md](references/qg-4-final-acceptance.md) |

全 Gate 共通の契約（pass/warn/fail/partial 定義、evidence-first 原則、ゲート結果フォーマット）は [common-gate-contract.md](references/common-gate-contract.md) を参照。

## 適用範囲外のワークフロー

以下の補助ワークフローは **実行時コマンドの参照対象ではない**。QG-1〜QG-4 を適用しない:

- `inspect-*`（inspect-docs/ inspect-skills/ inspect-promote）
- `intake-*`（intake-capture/ intake-from-github/ intake-promote）
- `learning-*`（learning-capture/ learning-promote）
- `backlog-*`（backlog-review）
- `case-update`（QG 直接参照なし。`--review-ng` 時は QG-3 の結果を引用する）

## 責務境界

本スキルは**判定基準の提供と判定結果の提示**に限定する。

- **本スキルが行うこと**: 各 Gate の pass/warn/fail 判定、乖離の分類（QG-3）、推奨アクションの提示
- **本スキルが行わないこと**: ファイル編集、REQ 更新、Issue チェックボックス更新、PR 作成、マージ、テスト実行

### QG-3 と docs 全体レビューの関係

QG-3 は実装と Issue/ REQ/ ADR/ Design/ work plan の乖離検出ゲートであり、docs 全体の意味レビューの代替ではない。
docs 全体の意味レビューは `/agentdev/inspect-docs` が担う。

### case-update 連携

QG-3 は乖離の分類と推奨アクションの提示までを責務とし、REQ 更新の最終判断は case-update（ユーザー承認入力）に委譲する。
乖離分類 → case-update フラグの mapping は `references/qg-3-implementation-deviation.md` を参照。

## 自動ループバック禁止

QG-3/ QG-4 の fail 判定時、エージェントは推奨アクションを提示しユーザーが決定する。
自動的な差し戻し、修正は行わない。

## bun test フル suite 正規形の所有

QG-4（full integrity suite 合格基準）における bun test フル suite 正規形（3 cwd 分割実行・./ prefix・環境ラベル）は、本スキルが品質統制側として所有する。
正規形の定義は [qg-4-final-acceptance.md](references/qg-4-final-acceptance.md)「bun test フル suite 正規形（実行形態契約）」を参照。
フル suite の受理判断は機械受理基準（正規形実行記録・環境ラベル・件数突合・fail 全件由来分類の記録存在検証、由来不明 fail 0 件）により行う。
手動判断（記録を伴わない裁量判断）で受理しない。
基準の定義は同ファイル「機械受理基準」を参照。
テスト環境前提（worktree 構造的制約、依存パッケージ未伝播、bun install 前置）は `agentdev-git-worktree` の worktree 構造的制約を参照する。

## See Also

- [common-gate-contract.md](references/common-gate-contract.md)（全 Gate 共通契約。pass/warn/fail/partial、evidence-first、結果フォーマット）
- quality-gates Design（QG-1〜QG-4 の Design 定義、機械化境界、実装マッピング、skill extension 経由）
- **agentdev-req-analysis**: 要件分析手法、チェックボックス品質基準（QG-1 の基準）
- **agentdev-workflow-lifecycle**: work_type 判定、フェーズ定義
- **agentdev-workflow-routing**: case-update --review-ng 手順（QG-3 結果の消費先）

