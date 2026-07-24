---
name: agentdev-doc-diagnostics
description: docs 横断診断カテゴリ、共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティングを提供する診断判断 skill。USE FOR: inspect-docs command の診断カテゴリ定義、docs 横断の診断判定規則、共通証拠構造（finding schema、severity、信頼度）、診断結果（finding）の出力契約、診断に必要な reference または script の選択、文書種別別診断（REQ 固有、文意品質、探索順）へのルーティング。DO NOT USE FOR: 診断対象の修正、promote 判断（inspect-promote 担当）、REQ/SPEC/RU 保存（各保存 command 担当）、commit/push（command 担当）、Issue/PR 操作（case-* 担当）、REQ 固有の SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 診断（agentdev-req-structure-diagnostics 担当）、文意品質診断（agentdev-doc-writing 担当）、探索順（agentdev-doc-map 担当）。
---

# docs 横断診断知識ベース（doc-diagnostics）

inspect-docs command から呼ばれる docs 横断診断の判断基盤。
横断診断カテゴリ、共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティングを一次所有する（AG-008、RU-20260722-01 合意）。
REQ 固有の SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 診断、文意品質、探索順は再定義せず、各専門 skill へルーティングする。
検査対象を直接修正しない診断専用であり、本スキルは判定ロジックとルーティング表の提供のみを行う。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-doc-diagnostics` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-doc-diagnostics.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 検査対象を直接修正しない制約

- ファイル変更（docs 配下、REQ/ADR/SPEC、Command/Skill/Template/Script）、Issue 作成、PR 作成、RU 保存、branch/worktree 操作を行わない。許可される副作用は `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/push）のみ（inspect lifecycle 準拠、REQ-0103-140-151）
- 診断結果はセッション内テキストで提示する
- 修正案は route として提示し、実装、保存、自動整形は行わない

## USE FOR

- inspect-docs command の docs 横断診断カテゴリ定義
  - 廃止 REQ/SPEC 由来記述残置（retired REQ/SPEC ID をソースとした横断スキャン）
  - REQ/SPEC 境界違反（HOW 詳細の要件行残留、安定契約例外候補の抽出）
  - REQ 粒度過小（関心対象、成果物種別、command family、lifecycle 段階の混在）
  - 横断契約矛盾（source-of-truth priority に基づく矛盾）
  - 文意品質候補（LLM っぽい表現、空虚語、英語混じり、実行主体分類の誤認）
  - 探索順と索引の不整合（DOC-MAP と基準文書の不整合）
- docs 横断スキャン観点とルーティング先の定義（専門診断のシグナルカタログ、閾値は再定義しない）
- 共通証拠構造（finding schema、severity、信頼度）
- 共通 finding 出力契約（`.agentdev/inspect/inbox/*.md`、severity 分類、信頼度）
- 診断に必要な reference または script の選択条件
- 文書種別別診断へのルーティング（REQ 固有、文意品質、探索順の各専門 skill への委譲）
- source-of-truth priority に基づく矛盾判定（現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides）
- NG 分類（false positive / pre-existing / 今回修正対象）の付与

## DO NOT USE FOR

- 診断対象の修正: intake/inspect pipeline 経由でのみ修正を許可する
- promote 判断: `inspect-promote` の責務
- REQ/SPEC/RU の保存: 各保存 command（req-save/spec-save 等）の責務
- commit/push: command の責務（ただし inspect lifecycle に基づく `.agentdev/inspect/` 配下の永続化は許可される副作用）
- Issue/PR 操作: case-* command の責務
- REQ 固有の SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 診断: `agentdev-req-structure-diagnostics` の責務（本スキルはルーティングのみ）
- 文意品質診断（LLM っぽい表現、空虚な形容/動詞、英語混じり表現）: `agentdev-doc-writing` の責務（本スキルはルーティングのみ）
- 探索順（DOC-MAP 読み方ガイド、ドキュメント探索順序）: `agentdev-doc-map` の責務（本スキルはルーティングのみ）

## 対象コマンド

| コマンド | 目的 |
|----------|------|
| inspect-docs | docs全体の意味整合性診断における横断診断カテゴリ、共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティングの提供 |

## 責務境界（AC-014、REQ-0109-048、REQ-0124-025）

本スキルは横断編成と結果統合のみを所有し、専門診断の再定義を行わない。
`diagnostics` 命名は REQ-0124-025 の例外境界に基づき inspect-* 系 command と区別して skill 名でのみ許容される。

| 専門診断 | 正規所有者 skill | 本スキルの役割 |
|----------|------------------|----------------|
| REQ 固有 SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT | `agentdev-req-structure-diagnostics` | ルーティングのみ（判定ロジックを再定義しない） |
| 文意品質（LLM 表現、空虚語、英語混じり、実行主体分類） | `agentdev-doc-writing` | ルーティングのみ |
| 探索順（DOC-MAP、ドキュメント探索経路） | `agentdev-doc-map` | ルーティングのみ |
| docs 横断診断カテゴリ、共通証拠構造、共通 finding 出力契約 | `agentdev-doc-diagnostics`（本スキル） | 一次所有 |

## references/ 構成一覧

| ファイル | 内容 |
|----------|------|
| `references/diagnostic-categories.md` | docs 横断診断カテゴリ（廃止 REQ/SPEC 由来記述残置、REQ/SPEC 境界違反、REQ 粒度過小、横断契約矛盾、文意品質候補、探索順と索引の不整合、配布物統合性）の定義、横断スキャン観点、ルーティング先、安定契約例外候補の抽出方針。配布物統合性には docs-spec-rebuild-integrity SPEC が定義する構文健全性5パターン（frontmatter 重複、見出し重複、Markdown 構文破損、存在しない command 参照、エンコーディング不整合）、文意保持、責務整合を含む |
| `references/finding-output-contract.md` | 共通証拠構造（finding schema フィールド）、severity 分類、信頼度、出力ファイル契約（`.agentdev/inspect/inbox/`）、NG 分類、source-of-truth priority、許可される副作用 |
| `references/diagnostic-routing.md` | 文書種別別診断へのルーティング表（REQ 固有、文意品質、探索順、配布物整合性、SPEC 三層構造）、専門 skill 委譲規則、委譲時の入力引き渡し契約、責務重複なしの保証（AC-014） |

## See Also

- **agentdev-req-structure-diagnostics**: REQ 固有 SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 診断、配布物 ID 汚染検出、配布物統合性検出、SPEC 三層構造検出（ルーティング先）
- **agentdev-doc-writing**: 文意品質、実行主体分類（ルーティング先）
- **agentdev-doc-map**: 探索順、DOC-MAP 読み方ガイド（ルーティング先）
- **agentdev-inspect-skills**: Command/Skill 参照妥当性診断（独立した inspect-* 対象、本スキルのルーティング先ではない）
