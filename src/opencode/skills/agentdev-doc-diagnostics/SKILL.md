---
name: agentdev-doc-diagnostics
description: docs 横断診断カテゴリ、共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティングを提供する診断判断 skill。USE FOR: docs 横断の診断判定規則、共通証拠構造（finding schema、severity、信頼度）、診断に必要な reference・script の選択、文書種別別診断へのルーティング。DO NOT USE FOR: 診断対象の修正、検出事項の分類・採用・処分、REQ 構造診断、文意品質診断。
---

# docs 横断診断知識ベース（doc-diagnostics）

inspect-docs command から呼ばれる docs 横断診断の判断基盤。
横断診断カテゴリ、共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティングを一次所有する（AG-{NNN}、RU-{NNNN}-01 合意）。
REQ 固有の SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 診断、文意品質、探索順は再定義せず、各専門 skill へルーティングする。
検査対象を直接修正しない診断専用であり、本スキルは判定ロジックとルーティング表の提供のみを行う。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-doc-diagnostics` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）のみを前提とし、`SPEC 配下` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-doc-diagnostics.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/designs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/designs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/designs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 検査対象を直接修正しない制約

- ファイル変更（docs 配下、REQ/ADR/SPEC、Command/Skill/Template/Script）、Issue 作成、PR 作成、RU 保存、branch/worktree 操作を行わない。許可される副作用は `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/push）のみ（inspect lifecycle 準拠）
- 診断結果はセッション内テキストで提示する
- 修正案は route として提示し、実装、保存、自動整形は行わない

## 対象コマンド

| コマンド | 目的 |
|----------|------|
| inspect-docs | docs全体の意味整合性診断における横断診断カテゴリ、共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティングの提供 |

## 責務境界（AC-{NNN}）

本スキルは横断編成と結果統合のみを所有し、専門診断の再定義を行わない。
`diagnostics` 命名は例外境界に基づき inspect-* 系 command と区別して skill 名でのみ許容される。

| 専門診断 | 正規所有者 skill | 本スキルの役割 |
|----------|------------------|----------------|
| REQ 固有 SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT | `agentdev-req-structure-diagnostics` | ルーティングのみ（判定ロジックを再定義しない） |
| 文意品質（LLM 表現、空虚語、英語混じり、実行主体分類） | `agentdev-doc-writing` | ルーティングのみ |
| docs 横断診断カテゴリ、共通証拠構造、共通 finding 出力契約 | `agentdev-doc-diagnostics`（本スキル） | 一次所有 |

## cleanup モデルへの適用経路

document-model SPEC（extension 経由）「恒久基準と非規範情報の整理」は、非規範情報（移行情報、内部実装方式、fixture、regex、内部関数、テスト構成、未宣言 reference、draft SPEC、移行証跡、リリース証跡）を整理する cleanup モデル（6処置: KEEP、MERGE、REFERENCE、MOVE、RETIRE、INFERENCE）を所有し、処置の実行を inspect-docs / inspect-skills / 専用の cleanup 作業へ割り当てる。
本スキルは inspect-docs の横断診断カテゴリの一次所有者として、この適用経路に組み込まれる。
横断診断で cleanup モデルの対象カテゴリに該当する記述を検出した場合は、6処置の候補を検出事項の推奨 route に併記して提示する。
処置に伴う文書変更は行わない（診断専用）。
cleanup モデルと処置契約の SSoT は document-model SPEC であり、本スキルは再定義しない。

## 参考文献

| ファイル | 内容 |
|----------|------|
| `references/diagnostic-categories.md` | docs 横断診断カテゴリ（廃止 REQ/SPEC 由来記述残置、REQ/SPEC 境界違反、REQ 粒度過小、横断契約矛盾、文意品質候補、探索順と索引の不整合、配布物統合性）の定義、横断スキャン観点、ルーティング先、安定契約例外候補の抽出方針。配布物統合性には docs-spec-rebuild-integrity SPEC が定義する構文健全性5パターン（frontmatter 重複、見出し重複、Markdown 構文破損、存在しない command 参照、エンコーディング不整合）、文意保持、責務整合を含む |
| `references/finding-output-contract.md` | 共通証拠構造（finding schema フィールド）、severity 分類、信頼度、出力ファイル契約（`.agentdev/inspect/inbox/`）、NG 分類、source-of-truth priority、許可される副作用 |
| `references/diagnostic-routing.md` | 文書種別別診断へのルーティング表（REQ 固有、文意品質、探索順、配布物整合性、SPEC 三層構造）、専門 skill 委譲規則、委譲時の入力引き渡し契約、責務重複なしの保証（AC-{NNN}） |

## See Also

- **agentdev-req-structure-diagnostics**: REQ 固有 SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 診断、配布物 ID 汚染検出、配布物統合性検出、SPEC 三層構造検出（ルーティング先）
- **agentdev-doc-writing**: 文意品質、実行主体分類（ルーティング先）
- **agentdev-inspect-skills**: Command/Skill 参照妥当性診断（独立した inspect-* 対象、本スキルのルーティング先ではない）
