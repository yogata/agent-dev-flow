---
title: サブエージェント委譲契約
status: accepted
created: 2026-06-21
updated: 2026-06-21
---

# サブエージェント委譲契約（横断）

> 本 SPEC は ADR-0112 で定義されたサブエージェント委譲の一般概念に基づく共通契約を定義する。個別 command / skill の委譲利用は各 SPEC を参照のこと（AG-008）。

## 目的

manager-orchestrator 以外のコマンドパターンから保存・更新を親に残す検査・分類委譲を行う際の最小契約と制約を定める。`lightweight-delegation`（軽量委譲）は主要パターンではなく、主要な実装分類に重ねる委譲の扱いである。

## 委譲時最小契約

委譲時の最小契約は ADR-0112 §5 に従い以下の要素を中心に記述する。`delegation_type` と `on_result` は必須 envelope ではなく、必要な場合のみ参考ラベルまたは親側の扱いとして記述する。

```yaml
inputs:
  scope:
    - {対象ファイル、Issue、PR、ログ、成果物パスなど}
  constraints:
    - {参照してよい基準、読んでよい範囲、除外対象}
side_effect_boundary:
  allowed:
    - read_files
    - inspect_content
    - classify_candidates
    - return_summary
    - return_evidence
    - return_artifact_body_when_requested
  forbidden:
    - file_write
    - issue_pr_update
    - commit
    - push
    - user_confirmation
output_contract:
  status: pass | warn | fail | partial
  summary: {判定結果の要約}
  evidence:
    - {根拠ファイル、行、ログ、観測事実}
  artifact_body: {成果物本文がある場合のみverbatimで返す}
  parent_decision_required:
    - {親エージェントが判断・保存・確認すべき事項}
  side_effects: none
capture_handoff:
  intake_candidates:
    - {具体的な修正候補。保存は親エージェントが判断する}
  learning_candidates:
    - {再発防止知見候補。保存は親エージェントが判断する}
```

`side_effect_boundary` に `read_only` のような包括値（blanket value）を使用せず、許可する操作を具体名で列挙すること。

## 委譲種別（delegation_type 参考分類）

delegation_type は参考分類であり、Command 本文での使用は任意である。分類ラベルより、実際の入力範囲・副作用境界・返却内容を優先する。

| delegation_type | 用途 | 書き込み | 書き込み許可条件 |
|---|---|---:|---|
| `gate_check` | 完了判定・ガードレール充足確認・保存前/close前検査 | 禁止 | — |
| `semantic_review` | 文書・差分・REQ/ADR/SPECの意味レビュー | 禁止 | — |
| `log_analysis` | テストログ・CIログ・review結果解析 | 禁止 | — |
| `classification` | 成果物 / 検出事項 / intake / learning の分類 | 禁止 | — |
| `extraction` | 候補・論点・未回収事項の抽出 | 禁止 | — |
| `draft_generation` | Issue本文・PR本文・レポート案などの草案生成 | 禁止 | — |
| `controlled_case_execution` | case-run Epic / 複数Issue実行 | 条件付き | case-run のみ |
| `step_execution` | case-auto からの構成工程（req-save / spec-save / case-open / case-close）の task() 起動（ADR-0127） | 許可 | case-auto からの工程委譲のみ。各工程のコマンド定義ガードレールに従う |

## 委譲制約

| 制約 | 説明 |
|---|---|
| 対象を直接修正しない委譲（書き込み禁止型） | gate_check / semantic_review / log_analysis / classification / extraction / draft_generation は検査対象アーティファクトを変更せず、許可操作は read_files / inspect_content / return_evidence 等に限定する |
| 親コマンド最終判断 | サブエージェントは判断の入力を提供し、最終決定は親コマンドが行う（ADR-0112 §4） |
| 中間成果扱い | サブエージェント出力は中間成果であり、親コマンドは一部を採用・修正・却下できる（ADR-0112 §6） |
| 成果物本文の verbatim | Issue本文・PR本文・commit message・保存対象ファイル本文・テンプレート成果物はそのまま（verbatim）返す |
| 判定結果の圧縮 | 判定結果・調査過程・中間ログ・読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す |
| Script 優先 | 単純な決定的検査は Script 優先。非決定的処理（意味レビュー・分類・抽出等）にサブエージェント委譲を適用 |

## manager-orchestrator と軽量委譲の分離

| 項目 | manager-orchestrator | 軽量委譲 |
|---|---|---|
| 適用コマンド | case-run / case-auto | 上記初期適用対象（ADR-0112・case-auto の工程委譲を含む・ADR-0127） |
| 委譲規模 | 複数サブエージェント統制・Wave scheduling・障害伝播 | 単一タスク委譲（case-auto の構成工程委譲は step_execution で各工程単位） |
| 状態管理 | 大規模な状態機械・自己修復ループ | なし（一方向の入出力） |
| プロトコル | case-run 専用サブエージェントプロトコル（`agentdev-case-run-execution-adapter`）・case-auto は工程別委譲契約（ADR-0127） | 本汎用サブエージェント委譲契約 |
| 書き込み | すべて許可 | 原則禁止（controlled_case_execution / step_execution のみ条件付き） |

## 初期適用対象

各 command / skill の具体的委譲利用は各 SPEC を参照。本節は参考例である。

| コマンド | 委譲種別 | 委譲内容 |
|---|---|---|
| req-define | extraction / classification | 入力整理、既存文書照合、関連文書候補抽出 |
| case-run | gate_check / semantic_review / log_analysis | 検査・解析系ステップ |
| case-auto | step_execution（ADR-0127） | 構成工程（req-save / spec-save / case-open / case-close）の task() 起動。各工程のコマンド定義を authoritative source として実行し、結果（Issue/PR番号・pass/warn/fail）を case-auto に返す |
| inspect-docs | semantic_review / classification | 意味レビュー、分類一貫性確認 |
| backlog-review | classification / semantic_review / extraction | artifact分析、統合/分割、矛盾検出 |
| learning-promote | classification / gate_check | 分類、評価、既存対策確認 |
| intake-promote | semantic_review / classification / draft_generation | itemレビュー、分類案生成 |

## 責務分界（委譲関連）

| 責務 | 定義場所 |
|---|---|
| 公開API・入力・出力・ガードレール・高レベルStep | Command定義（`src/opencode/commands/agentdev/*.md`） |
| 再利用可能な判断基準・検査観点の詳細 | Skill references（`references/*.md`） |
| 委譲インタフェース（共通エンベロープ・delegation_type 分類・制約） | 本 SPEC |
| 委譲のアーキテクチャ判断（一般概念・manager-orchestrator位置づけ・検査・分類委譲の許容） | ADR-0112 |
| case-run 専用プロトコル（起動仕様・プロンプト構成・Epic Wave 実行/クローズモデル） | `agentdev-case-run-execution-adapter` skill references |
| 編集安全手順・AST-grep運用・大規模ファイル分割 | `agentdev-case-run-execution-adapter` skill references |
| 委譲定義の最小構成・delegated_check・中間成果基準 | `agentdev-command-authoring` skill references |
| 決定的な変換・検証・生成 | Script（`scripts/*.js`） |

## See Also

- [workflow-contracts.md](workflow-contracts.md) — ワークフロー全体契約
- [epic-wave-model.md](epic-wave-model.md) — Epic Wave 実行モデル
- ADR-0112 — サブエージェント委譲の一般概念
- ADR-0127 — case-auto の工程委譲
- ADR-0128 — case-run 外部実行委譲
- `agentdev-case-run-execution-adapter` skill — case-run 外部実行 adapter
- `agentdev-command-authoring` skill — 委譲定義記述標準
