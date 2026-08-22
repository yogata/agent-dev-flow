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

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-req-save`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-req-save.yaml`、kind: workflow-extension）を読み込む。
extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。
詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-req-save` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。
同スキルが12 STEP の control plane として制御構造（事前チェック、REQ ファイル操作、整合性検証、永続化）を所有する。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 事前チェック | ドラフト指定あり | 処理対象確定（no-op 判定を含む） | REQ/Decision 対象 artifact_actions の有無が判定済みであること |
| STEP-2 ドラフト読込 | 事前チェック通過 | ドラフト本文の読込結果 | ドラフトファイルが存在すること（不在はエラー中止） |
| STEP-3 ドラフト検証・処理対象確定 | 読込済み | 検証結果と処理対象リスト | `doc_requirement.md` テンプレートの【必須】セクションが完備していること |
| STEP-4 REQ ファイル操作 | 処理対象確定 | REQ ファイル（新規/追記/更新） | REQ番号が連番・一意であること（`agentdev-req-file-manager` 採番規則） |
| STEP-5 インデックス・ハブ更新 | REQ 操作済み | `docs/requirements/README.md`・`docs/README.md` の更新 | イデックス・ハブが実ファイルと一致していること |
| STEP-6 Decision ファイル作成 | Decision エントリ存在時のみ | `docs/decisions/<DEC-NNN>.md` | Decision妥当性再検証（後述の不変条件）を通過していること |
| STEP-7 docs 変更整合性検証 | ファイル操作完了 | 検証結果 | docs 配下の整合性検査が全て pass であること |
| STEP-8 README 索引影響確認 | 整合性検証済み | 索引影響の確認結果 | 索引への影響が反映済みであること |
| STEP-9 変更範囲検証・リモート同期 | 索引確認済み | 変更範囲検証結果・`git pull --ff-only` 同期 | 読込時 hash と pull 後 hash が一致していること |
| STEP-10 ドラフト status 更新 | 変更範囲検証通過 | `status: saved` のドラフト | status 更新が commit 対象に含まれていること |
| STEP-11 コミット・プッシュ | status 更新済み | commit・push 済みブランチ | 並列実行安全ステージング（`agentdev-git-worktree`）に従っていること |
| STEP-12 完了報告 | push 完了 | 完了報告（次コマンドの提示を含む） | 出力パスと次アクションが報告されていること |

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-req-save` が所有する。
同 Workflow Skill は `/agentdev/req-save` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。
OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- REQ/Decision 対象 artifact_actions（`artifact: req`/ `artifact: decision`）がない場合は no-op 完了とする（`work_type` による停止は廃止）。工程分岐も `artifact_actions` の有無で判定する（判定基準は `agentdev-workflow-lifecycle` 参照）
- 要件doc 構造は `doc_requirement.md` テンプレートに厳密に従い、【必須】セクションを完備させる
- REQ番号は連番・一意とする（空き番号の再利用は `agentdev-req-file-manager` 採番規則に従う）
- ドラフトの status 更新（`saved`）は commit/push より前に実施し、commit 対象に含める（push 後の status 更新は永続化されないため）
- `git pull --ff-only` 後は読込時 hash と pull 後 hash の一致を検証し、不一致時は評価・承認をやり直す。pull 前にローカル変更チェックを行う
- Decision保存の直前に妥当性を再検証する: Decision が技術判断（アーキテクチャ上の決定）を含むか確認し、REQ/Design 相当の内容のみの場合は保存を停止して理由を報告する。`agentdev-decision-guidelines` の判定結果を前提とし、`agentdev-decision-file-manager` の採番ルール（既存最大番号 + 1、欠番埋めは行わない）で番号を確定する。draft 内の全 Decision 参照（`new:{topic-slug}` 形式）を当該確定番号で置換する
- 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）は verbatim で返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す
- capture は原則非関与とし、REQ 再構成 intake（`.agentdev/intake/inbox/req-restructure/**`）のみ生成する。deviation capture（req-save 実行中に実観測した deviation）は Skill（`agentdev-learning-capture` または `agentdev-intake-pipeline`）への委譲で実施する（capture 境界（capture-boundaries）は `agentdev-workflow-orchestration` 参照）

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G02: ファイル編集スコープは `docs/requirements/**`（REQファイル）、`docs/decisions/**`（Decision）、`docs/README.md`（ドキュメントハブ）、`.agentdev/drafts/**`（ドラフトstatus更新用）のみ（上記以外のパスへの作成・編集・削除は禁止）
- G11: Issue は作成しない（Issue 作成は case-open の責任範囲）
