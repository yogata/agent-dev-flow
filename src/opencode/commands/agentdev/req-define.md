---
description: 要件を整理、定義する（機能追加、バグ修正共通）
---

# 要件定義

機能追加またはバグ修正の要件を整理、定義する。
壁打ちフェーズで使用。

**draft-data 入力・出力**: 本コマンドは構造化 `draft-data`（`# draft-data` fenced YAML block）を扱う。対話の進行は durable state（入力ファイル、draft 下書き、`status` frontmatter）から再構成され、会話コンテキストのみを resume source としない。

## 入力

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- エラーログ（バグ修正の場合）
- **ユーザーが明示した入力ファイル**: 設計メモ、調査メモ、RU（`.agentdev/backlog/req-units/RU-*.md`）等。全て参照専用入力（G04）
- req-save SPLIT 検出時の検出事項（`.agentdev/drafts/requirements-review-finding-{topic-slug}.md`）
- inspect-skills 診断結果の検出事項（`.agentdev/inspect/inbox/inspect-skills-finding-{topic-slug}.md`）。参照専用入力として扱い、未確認事項、採否未確定事項を要件本文に混入させない（inspect lifecycle、-151 相当）
- **promoted 直読み禁止**: `.agentdev/intake/promoted/` 及び `.agentdev/learning/promoted/` は直接読み込まない。backlog-review による RU 化を経由すること

## 出力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（全 work_type 共通、構造化 `draft-data` 形式）

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-req-define`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-req-define.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-req-define` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。同スキルが11 STEP の対話型 control plane として制御構造を所有する。

### Step 1: セッションコンテキスト検知・入力解決

6項目推論（信頼度付き）、明示入力ファイル・RU 自動検出、session由来RU 消費契約

### Step 2: 壁打ち対話

深掘り、前工程からの引き継ぎ判定（`agentdev_handoff`）

### Step 3: 既存REQ照合

CREATE 前 APPEND/UPDATE 評価、定量的データ検証、SPLIT 予兆計測

### Step 4: 要件展開

変更影響候補抽出、分類ゲート、Decision要否確認ゲート、test strategy 定義

### Step 5: Decision判断

Decision判断記録（`new:{topic-slug}`、ファイル作成は req-save）

### Step 6: 要件doc生成

構造化 `draft-data`（operation_units、artifact_actions、test_strategy、review_dispositions）

### Step 7: work_type・Scale 判定

4値分類、feature のみ standard/large

### Step 8: adversarial-review（経路A）

default-on、skip 条件該当時は省略、ユーザー明示指定時は強制発動

### Step 9: ドラフト保存

`.agentdev/drafts/req-draft-{topic-slug}.md` へ保存

### Step 10: 要件doc確認

ユーザーに提示（承認は求めず提示のみ）

### Step 11: 完了報告

work_type・scale 別種別の選択（`templates/req-define/` 配下）

各 STEP の詳細（開始条件・結果・手順・resume point・関連 Capability Skill 連携）は `agentdev-workflow-req-define` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-req-define` が所有する。同 Workflow Skill は `/agentdev/req-define` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## ガードレール

- G01: 壁打ちフェーズのみ（実装コード禁止）
- G02: 関連ドキュメントの個別ファイル列挙をユーザーに求めない
- G03: ファイル編集スコープ: `.agentdev/drafts/**` のみ作成、編集を許可
- G04: ユーザーが明示した入力ファイルは参照専用入力（変更、削除しない）。`.agentdev/backlog/req-units/RU-*.md` の削除は行わない（後続の case-open 成功後に実行）
- G05: `docs/` 配下の広範な探索禁止（例外: 明示入力ファイルと docs/requirements/\*\* の参照専用参照、Step 5-1 の限定探索は許可）
- G06: inbox.md/ deferred.md を直接ロードしない
- G07: 採用済み成果物の直読み禁止
- G08: `git` コマンドは実行しない
- G09: チェックボックスは測定可能で一意（`agentdev-req-analysis` 品質基準）
- G10: 要件doc構造は req-draft.md テンプレート（構造化 `draft-data` 形式）に従う
- G11: Decision閾値以上の判断は `agentdev-decision-guidelines` へ
- G12: work_type 判定基準は `agentdev-workflow-lifecycle` を参照
- G13: req-define は Issue 階層を決定しない。`depends_on`（必須依存のみ）は case-open が execution_unit 構成（連結成分判定）に使用する依存情報であり、最終 Issue 構成は case-open が決定する
- G14: req-define は draft に `operation_units` セクションを出力し、`execution_groups` セクションは出力しないこと（038）。単一REQ操作の場合も 1 件の OU として出力する。Epic/ Wave/ Issue 構成の生成は case-open の責務である
- G15: SPEC 分離基準に該当する要件行候選は REQ 要件行に残留させず、`draft-data` の `artifact_actions`（`artifact: spec`）へ分離すること。安定契約例外は分離対象外
- G16: Decision判断が必要な変更（Decision要否確認ゲート）では Decision 判断前に `agentdev-architecture-advisory` を参照する。アーキテクチャ助言サブエージェントは Decision 要否、推奨方向、設計リスク、根拠を返し、最終的な Decision 作成判断は親エージェントが行う
- G17: アーキテクチャ助言サブエージェントの助言は親エージェントが分類し、未確認事項を要件本文へ混入させない。同サブエージェントはファイル編集主体ではない
- G19: test strategy 項目は verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素を完全に持つこと（REQ）。on_failure（不合格時の処置）を持たない検証項目は test strategy に含めないこと（REQ）。3要素のいずれかが欠落する項目を検出した場合、保存前に QG-{N} が fail として扱う（REQ）
