---
description: 要件を整理、定義する（機能追加、バグ修正共通）
---

# 要件定義

機能追加またはバグ修正の要件を整理、定義する。
壁打ちフェーズで使用。

**draft-data 入力・出力**: 本コマンドは構造化 `draft-data`（`# draft-data` fenced YAML block）を扱う。
対話の進行は durable state（入力ファイル、draft 下書き、`status` frontmatter）から再構成され、会話コンテキストのみを resume source としない。

## 入力

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- 実証Issue（`req-define <実証Issue>` 形式の明示指定時。当該実証の正式化を主たる入力とし、評価契約、最終評価結果、参照証拠を取り込む）
- エラーログ（バグ修正の場合）
- **ユーザーが明示した入力ファイル**: 設計メモ、調査メモ、RU（`.agentdev/backlog/req-units/RU-*.md`）等。全て参照専用入力（G04）
- req-save SPLIT 検出時の検出事項（`.agentdev/drafts/requirements-review-finding-{topic-slug}.md`）
- inspect-skills 診断結果の検出事項（`.agentdev/inspect/inbox/inspect-skills-finding-{topic-slug}.md`）。参照専用入力として扱い、未確認事項・採否未確定事項は要件本文と分離する（inspect lifecycle、-151 相当）
- **promoted の参照経路**: `.agentdev/intake/promoted/` 及び `.agentdev/learning/promoted/` は backlog-review による RU 化を経由して参照する

## 出力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（全 work_type 共通、構造化 `draft-data` 形式）

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-req-define`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-req-define.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-req-define` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。
同スキルが11 STEP の対話型 control plane として制御構造を所有する。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 セッションコンテキスト検知・入力解決 | コマンド起動 | 入力モードと入力ソースの確定 | 入力ファイル・Issue URL・エラーログが解決済みであること |
| STEP-2 壁打ち対話 | 入力解決済み | 合意事項（`agreed_items`）の蓄積 | 未解決質問・未解決衝突が解消済みであること |
| STEP-3 既存REQ照合 | 壁打ち対話の進行 | 既存REQとの照合結果（CREATE/APPEND/UPDATE判定） | 照合結果が要件本文に反映されていること |
| STEP-4 要件展開 | 照合済み | 要件本文（チェックボックス付き） | チェックボックスが測定可能で一意であること |
| STEP-5 Decision判断 | 要件展開済み | Decision 要否判定と decision エントリ | Decision閾値以上の判断を `agentdev-decision-guidelines` で判定済みであること |
| STEP-6 要件doc生成 | 要件展開・Decision判断済み | 構造化 `draft-data` 形式の要件doc | req-draft.md テンプレートに従っていること |
| STEP-7 work_type・Scale 判定 | 要件doc生成済み | work_type と Scale の確定 | `agentdev-workflow-lifecycle` 基準に従っていること |
| STEP-8 adversarial-review（経路A） | ユーザー明示指定時 | review 結果と反映後の要件doc | accepted finding が要件docへ反映されていること |
| STEP-9 ドラフト保存 | 要件doc確定 | `.agentdev/drafts/req-draft-{topic-slug}.md` | ドラフトファイルが存在し `status` frontmatter を持つこと |
| STEP-10 要件doc確認 | ドラフト保存済み | ユーザー確認結果 | ユーザーが要件docを確認済みであること |
| STEP-11 完了報告 | 確認済み | 完了報告（次コマンドの提示を含む） | 出力パスと次アクションが報告されていること |

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-req-define` が所有する。
同 Workflow Skill は `/agentdev/req-define` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。
OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 本コマンドは要件の整理・定義（壁打ち）を扱い、成果物は要件doc（draft）に限定する。実装コードの作成は case-run の責務である
- docs/ の参照は、明示入力ファイル・`docs/requirements/**` の参照・Decision判断工程の限定探索の3経路に限定する
- inbox.md、deferred.md、採用済み成果物（promoted）は backlog-review による RU 化を経由して参照する
- 関連ドキュメントはコマンドが特定し、ユーザーへの個別ファイル列挙の依頼は省く
- チェックボックスは測定可能で一意にする（`agentdev-req-analysis` 品質基準）
- 要件doc 構造は req-draft.md テンプレート（構造化 `draft-data` 形式）に従う
- Decision閾値以上の判断は `agentdev-decision-guidelines` で判定する。Decision 要否確認ゲートでは `agentdev-architecture-advisory` の助言を親エージェントが分類して採用し、未確認事項は要件本文と分離して扱う
- work_type・Scale 判定は `agentdev-workflow-lifecycle` の基準に従う
- draft は `operation_units` セクションを出力する（単一REQ操作も1件の OU として出力）。`depends_on` は必須依存のみ記録し、Issue 階層・Epic/Wave 構成の決定は case-open が担う
- 実証必要性の推論・提案と評価契約の確定を要件展開工程の一部として実行する（実証Case判定と評価契約の意味論は評価ブランチ実証ワークフロー要件が所有する）。単なる追加調査だけを理由に実証Caseとしない
- 実証Caseとして確定した後は評価ブランチ利用を別途確認せず、実証Caseなら評価ブランチ、通常Caseなら main と決定的に導出する
- 評価契約と test strategy は分離する。test strategy は実証手段・計測手段・実証環境が正常に動作したかを扱い、評価契約は評価対象から得られた結果と採否を扱う
- 本コマンドは実証Caseでも Git 副作用を持たない（評価ブランチ・worktree 準備の実行主体・手順は command Design が所有する）。評価ブランチ作成だけの新しい公開コマンドを追加しない
- Design 分離基準に該当する要件行は `artifact_actions`（`artifact: design`）へ分離する（安定契約例外は除く）。test strategy 項目は verification（検証手順）・pass_criteria（合格基準）・on_failure（不合格時の処置）の3要素を完全に持ち、欠落項目は保存前に QG fail として扱う

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G03: ファイル編集スコープは `.agentdev/drafts/**` のみ（他パスへの作成・編集は禁止）
- G04: ユーザーが明示した入力ファイルは参照専用とし、変更・削除を行わない。`.agentdev/backlog/req-units/RU-*.md` の削除は case-open 成功後に実施する
- G08: `git` コマンドは実行しない
