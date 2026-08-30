---
description: 壁打ち成果物をREQ/Decisionファイルとしてdocs/に保存し、コミット、プッシュする
---

# 要件保存（壁打ち→docs永続化）

req-defineで生成された壁打ち成果物をREQ/Decisionファイルとしてdocs/に保存し、コミット、プッシュする。
壁打ちフェーズで使用する（REQ/Decision 対象 artifact_actions がある場合）。
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

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-req-save` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。

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

- ファイル編集スコープは `docs/requirements/**`（REQファイル）、`docs/decisions/**`（Decision）、`docs/README.md`（ドキュメントハブ）、`.agentdev/drafts/**`（ドラフトstatus更新用）のみ（上記以外のパスへの作成・編集・削除は禁止）
- Issue は作成しない（Issue 作成は case-open の責任範囲）
