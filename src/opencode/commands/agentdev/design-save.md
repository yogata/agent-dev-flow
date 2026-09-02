---
description: req-define で分離された Design 保存対象を Design ファイルに保存、確定する（Design 対象 artifact_actions がある場合）
---

# Design 保存（Design artifact_actions → docs/designs 永続化）

req-define で分離された Design 保存対象（`draft-data` の `artifact_actions` 内 `artifact: design` entry）を `docs/designs/<**/*>.md` に保存、確定する。
req-save の次、case-open の前に実行する。
req-save のファイル編集スコープ制約（Design 編集禁止）を緩和するものではなく、Design 保存を独立責務として切り出す。
全 work_type 対象であり、`work_type` による判定は廃止する。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define が生成し req-save が REQ 保存済みのドラフト。`draft-data` の `artifact_actions` に `artifact: design` entry を含む）

## 出力

- `docs/designs/<**/*>.md`（既存 Design への追記 or 新規 Design 作成）
- `.agentdev/drafts/req-draft-{topic-slug}.md`（Design artifact_actions 消費済みフラグの status 更新）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-design-save` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- Design 対象 artifact_actions（`artifact: design`）の有無で判定する（全 work_type 対象。`work_type` による判定は廃止）。対象がない場合は Design ファイル操作を行わない no-op とする
- Design artifact_actions の分離根拠・配置先判定は req-define（`agentdev-req-analysis`）の結果を尊重し、design-save で再分類するのは Design 分離基準への適合確認に限定する
- 各 Design action は Design 分離基準に適合させる。安定契約例外は Design 保存対象から除外し follow-up 扱いとする
- Design ファイルは実行時非依存を維持する（実行時コマンドが Design ファイルに依存する記述にしない）
- Design status が `draft` の Design は REQ/Design 境界違反検出の対象外とする
- ドラフト不備（`artifact_actions` 形式不正）はエラーで中止し req-define 差し戻しを推奨する。配置先 Design 特定不能の候補は skip して follow-up を明示する（全体は中止しない）。変更範囲検証違反時はユーザーに報告して指示を待つ

## ガードレール

否定規則は破壊的操作・state 破壊等の硬い境界に限定する:

- ファイル編集スコープは `docs/designs/**`（Design ファイル）、`.agentdev/drafts/**`（ドラフト status 更新用）のみ。`docs/designs/README.md` は Design 操作に付随する更新のみ許可（REQ ファイル（`docs/requirements/**`）、Decision（`docs/decisions/**`）、コマンド、スキル、テンプレート等、上記以外の作成・編集は禁止）
- Design status の昇格（draft → accepted）は case-close の責務であり、design-save は `status: accepted` を付与しない（新規作成時は `status: draft`、既存 Design 追記時は `status` を維持）
- Issue は作成しない（Issue 作成は case-open の責任）
