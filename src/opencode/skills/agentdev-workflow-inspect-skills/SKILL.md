---
name: agentdev-workflow-inspect-skills
description: "inspect-skills command の workflow 実装本体。Command→Skill 参照妥当性、Skill frontmatter・本文構造・粒度・段階的開示・責務境界・実行主体分類の診断、配布物構文健全性・責務整合診断、検出事項の分類と route 提示、inbox 出力と git 永続化を所有する（read-only-diagnostic 型、project 非依存）。USE FOR: inspect-skills 実行時の workflow 制御（診断対象読込・観点評価・分類・route 提示・検出事項出力・永続化）。DO NOT USE FOR: 診断対象ファイルの直接修正、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# inspect-skills workflow スキル

inspect-skills command の workflow 実装本体。Command/Skill 参照妥当性と Skill 構造の診断から、検出事項の分類、推奨 route の提示、`.agentdev/inspect/inbox/` 出力、`.agentdev/inspect/` 配下の git 永続化、完了報告までの制御構造を所有する。

inspect-skills command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。

## 型判定: read-only-diagnostic型（STEP model 対象外）

本スキルは read-only-diagnostic型（検査対象を直接修正しない診断専用の型）であり、STEP model の対象外である（REQ-{NNNN}-{NNN}）。**STEP resume point / export / import を持たない**。

- 工程は先頭から通しで実行する。中断が発生した場合は workflow を最初から再実行する（診断は対象の読み取りと検出事項ファイルの生成のみの冪等な処理であり、再実行で同等の結果を得る）
- 会話コンテキストを権威情報源とする再開点の再構成、状態の export / import を本スキルは定義しない

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各工程詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-inspect-skills.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と inspect-skills command の公開契約のみを前提とする。SPEC ディレクトリの内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **SPEC 内部パスの固定知識化の禁止**: extension に列挙されていない SPEC 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- Command 定義ファイル群
- Skill 定義ファイル群
- 必要に応じて関連する template/ reference/ script ファイル群

## 出力

- 診断レポート（セッション内テキスト出力）
- 検出事項リスト（対象、観点、分類、根拠、推奨 route）
- `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`

## 副作用

- `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成
- `.agentdev/inspect/` 配下の変更に限る git commit/push（commit message: `chore(agentdev): capture inspect-skills finding`）
- 診断対象（Command/ Skill/ Template/ Script 定義）のファイル変更は行わない

## 3層責務（deterministic check / semantic diagnosis / finding disposition）

| 層 | 担当 | 本スキルの位置づけ |
|---|---|---|
| deterministic check（機械的検査） | docs-check 等の機械検査レイヤ、決定的検証スクリプト | 対象外。機械的パターンマッチングで判定可能な検査を重複して保持しない |
| semantic diagnosis（意味診断） | inspect-skills workflow（本スキル）、inspect-docs workflow | **本スキルの担当**。Command/Skill 参照妥当性と Skill 構造を診断し検出事項として出力する |
| finding disposition（検出事項の分類・採用） | inspect-promote workflow | 対象外。本スキルは検出事項の分類・採用を行わない |

## Control Plane（工程一覧）

本スキルの工程一覧を次に示す。STEP ラベルは工程順序の整理ラベルであり、**resume point ではない**（read-only-diagnostic型、REQ-{NNNN}-{NNN}）。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 診断対象の読込 | command 実行開始 | Command/ Skill 定義の把握（参照、frontmatter、本文構造、references、template/ script 参照） | [references/skill-structure-diagnostics.md](references/skill-structure-diagnostics.md) |
| STEP-2 | 診断観点の評価・分類・route 提示 | 診断対象把握完了 | 検出事項（分類、根拠、推奨 route 付き） | [references/skill-structure-diagnostics.md](references/skill-structure-diagnostics.md) |
| STEP-3 | 検出事項出力・永続化・完了報告 | STEP-2 の検出事項確定 | 検出事項ファイル、`.agentdev/inspect/` commit/push、完了報告 | [references/finding-output-and-persist.md](references/finding-output-and-persist.md) |

### 工程間の依存と分岐

- STEP-1 → STEP-2 → STEP-3（分岐なし、常に同一順序で実行）
- 対象ファイルが存在しない場合は該当カテゴリを空として扱い警告を出力する（エラー処理は各工程 reference 参照）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-inspect-skills`: 診断観点と判定基準（参照妥当性、粒度、段階的開示、責務境界、canonical name、内部構造依存、配布物構文健全性）
- `agentdev-git-worktree`: ドメイン状態永続化プロシージャ（並列実行安全ステージング含む）
- `agentdev-conventional-commits`: commit message 規約
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## Workflow Extension 読込契約

本スキルは workflow-extension（`.agentdev/extensions/skills/agentdev-workflow-inspect-skills.yaml`、kind: workflow-extension）を読み込む場合がある。Workflow Skill のみが読み、inspect-skills command は直接読まない。標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行する（fail-open）。破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する。

本スキルは project 非依存で単体動作する正当な状態であり、extension が存在しなくても診断の全工程が動作する（対応 extension が存在しない command/skill は正常動作である）。docs-spec-rebuild-integrity SPEC の検査パターンは extension 経由で解決する。

## 共通制約

- **診断専用**: 許可される副作用は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成と `.agentdev/inspect/` 配下の git 永続化のみ（G01〜G04）
- **修正せず route 提示のみ**: 自動修正せず、推奨 route の提示に留める（command 不変条件）
- **SPEC 参照は extension 経由**: docs-spec-rebuild-integrity SPEC 等の検査パターンは extension 経由で解決し、SPEC 内部パスを固定知識として参照しない

## 終了条件（termination）

- 検出事項ファイル（`.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`）の出力が完了している
- `.agentdev/inspect/` 配下の変更が commit/push 済みである（変更なし時は「変更なし」報告済み）
- 完了報告 template（`.opencode/commands/agentdev/templates/inspect-skills/standard.md`）に従った報告を出力した

## See Also

- **`<workflows/workflow-skill-model>` SPEC**: Workflow Skill 固有契約の正規所有者
- **inspect-skills command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **`agentdev-workflow-inspect-promote`**: 検出事項の後段（分類・採用）を担当する workflow skill
