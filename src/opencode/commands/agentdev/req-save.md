---
description: 壁打ち成果物をREQ/Decisionファイルとしてdocs/に保存し、コミット、プッシュする
---

# 要件保存（壁打ち→docs永続化）

req-defineで生成された壁打ち成果物をREQ/Decisionファイルとしてdocs/に保存し、コミット、プッシュする。
壁打ちフェーズで使用（REQ/Decision 対象 artifact_actions がある場合）。
`work_type` による消費判定は廃止し、`artifact_actions` の有無で判定する。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define で生成されたドラフト）

## 出力

- `docs/requirements/REQ-{NNNN}.md`（新規/追記/更新）
- `docs/requirements/README.md`（インデックス更新）
- `docs/README.md`（ドキュメントハブ更新）
- `docs/decisions/<DEC-NNN>.md`（Decision判断がある場合のみ）
- `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`（SPLIT検出時のみ。要件の膨張、関心分離によるSPLIT候補の詳細）
- `.agentdev/intake/inbox/req-restructure/*.md`（REQ再構成候補検知時のみ）

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-req-save`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-req-save.yaml`、kind: workflow-extension）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-req-save` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。同スキルが12 STEP の control plane として制御構造（事前チェック、REQ ファイル操作、整合性検証、永続化）を所有する。

### Step 1: 事前チェック

`artifact_actions` の `artifact: req`/`artifact: decision` 有無判定、no-op 完了、旧形式 draft 後方互換

### Step 2: ドラフト読込

最新ドラフト特定、読込時 commit hash 記録

### Step 3: ドラフト検証・処理対象確定

必須フィールド検証、分類ゲート検査、artifact_actions 処理ゲート

### Step 4: REQ ファイル操作

CREATE/APPEND/UPDATE、決定的スクリプト呼出、QG-{N}（適用結果の整合性検証）、3フェーズ分離

### Step 5: インデックス・ハブ更新

README エントリ登録（check-entry-existence 検証）

### Step 6: Decision ファイル作成

`artifact: decision` entry のみ、妥当性再検証ゲート、採番 max+1

### Step 7: docs 変更整合性検証

REQ番号連続性、frontmatter id↔ファイル名整合

### Step 8: README 索引影響確認

索引更新、targeted docs guard、extension 更新要否確認

### Step 9: 変更範囲検証・リモート同期

check-change-impact、`git pull --ff-only` 後の hash 一致検証

### Step 10: ドラフト status 更新

`status: saved`（commit 対象に含める）

### Step 11: コミット・プッシュ

明示パスステージ、`git commit -- <paths>`、OU 結果書き戻し

### Step 12: 完了報告

種別選択（`templates/req-save/` 配下: split-detected / epic / standard）

各 STEP の詳細（開始条件・結果・手順・resume point・関連 Capability Skill 連携）は `agentdev-workflow-req-save` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-req-save` が所有する。同 Workflow Skill は `/agentdev/req-save` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## ガードレール

### フェーズ制約
- G01: REQ/Decision 対象 artifact_actions（`artifact: req`/ `artifact: decision`）がない場合は no-op 完了。`work_type` による停止は廃止

### ファイル操作制約
- G02: ファイル編集スコープ: 以下のパスのみ作成、編集、削除を許可: `docs/requirements/**`（REQファイル）、`docs/decisions/**`（Decision）、`docs/README.md`（ドキュメントハブ）、`.agentdev/drafts/**`（ドラフトstatus更新用）
- G03: 上記以外のファイル作成、編集は禁止

### 品質ゲート
- G04: ドラフトファイルが存在しない場合は実行不可（エラーで中止）
- G05: REQ番号は連番、一意であること（空き番号の再利用禁止）→ `agentdev-req-file-manager` に従う
- G06: 要件doc構造は `doc_requirement.md` テンプレートに厳密に従うこと。【必須】セクションの欠落は禁止
- G07: ドラフトのstatus更新（`saved`）は commit/push より前に実施し、commit対象に含めること。push後のstatus更新は永続化されないため禁止
- G08: Step 9-1 の `git pull --ff-only` 後、読込時 hash と pull 後 hash の一致検証を必須とすること。一致しない場合は評価、承認をやり直すこと

### Decision妥当性再検証ゲート

Decision保存の直前に、以下の妥当性を再検証すること: Decisionが技術判断（アーキテクチャ上の決定）を含むか確認、REQ/SPEC相当の内容のみの場合は保存を停止し理由を報告、`agentdev-decision-guidelines`の判定結果を前提として検証、`agentdev-decision-file-manager` の採番ルール（max+1, 欠番埋め禁止）で確定した番号を振る、draft 内の全 Decision 参照（`new:{topic-slug}` 形式）を当該確定番号で置換、採番は `docs/decisions/` 配下の既存 Decision ファイルの最大番号 + 1 とし欠番があっても埋めない

### 委譲、参照制約
- G09: 工程分岐は `work_type` 固定分岐ではなく `artifact_actions` の有無で判定する。判定基準の詳細は `agentdev-workflow-lifecycle` を参照

### 出力制約
- G10: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

### Capture 非関与制約
- G12: req-save の capture 責務は原則非関与。req-save は intake/ learning capture を直接行わない。例外: REQ 再構成 intake（`.agentdev/intake/inbox/req-restructure/**`）のみ生成可能。deviation capture（req-save 実行中に実観測した deviation）は Skill（`agentdev-learning-capture` または `agentdev-intake-pipeline`）への委譲で実施し、req-save が直接 capture しない（REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}）。capture 境界（capture-boundaries）の詳細は `agentdev-workflow-orchestration` 参照

### Issue作成制約
- G11: req-saveはIssueを作成してはならない。Issue作成はcase-openの責任範囲である
