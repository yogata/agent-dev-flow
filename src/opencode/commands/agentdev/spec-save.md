---
description: req-define で分離された SPEC 保存対象を SPEC ファイルに保存、確定する（SPEC 対象 artifact_actions がある場合）
---

# SPEC 保存（SPEC artifact_actions → docs/specs 永続化）

req-define で分離された SPEC 保存対象（`draft-data` の `artifact_actions` 内 `artifact: spec` entry）を `docs/specs/<**/*>.md` に保存、確定する。
req-save の次、case-open の前に実行する。
req-save の G02（SPEC 編集禁止）を緩和するものではなく、SPEC 保存を独立責務として切り出す。
全 work_type 対象であり、`work_type` による判定は廃止する。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define が生成し req-save が REQ 保存済みのドラフト。`draft-data` の `artifact_actions` に `artifact: spec` entry を含む）

## 出力

- `docs/specs/<**/*>.md`（既存 SPEC への追記 or 新規 SPEC 作成）
- `.agentdev/drafts/req-draft-{topic-slug}.md`（SPEC artifact_actions 消費済みフラグの status 更新）

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-spec-save`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-spec-save.yaml`、kind: workflow-extension）を読み込む（ADR）。
extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。
extension に列挙されていない `docs/specs/**` 内部パスを固定知識として読みに行かない。
詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-spec-save` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。
同スキルが11 STEP の control plane として制御構造（配置先解決、SPEC ファイル操作、整合確認、永続化）を所有する。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 事前チェック | ドラフト指定あり | 処理対象確定（no-op 判定を含む） | SPEC 対象 artifact_actions（`artifact: spec`）の有無が判定済みであること |
| STEP-2 SPEC artifact_actions 読込 | 事前チェック通過 | SPEC 保存対象 entry リスト | `artifact_actions` 形式が正当であること（不正はエラー中止・req-define 差し戻し推奨） |
| STEP-3 配置先解決 | 読込済み | 配置先 SPEC パス（既存追記 or 新規作成） | 配置先判定が req-define（`agentdev-req-analysis`）の分離結果を尊重していること。特定不能候補は skip + follow-up 明示 |
| STEP-4 SPEC 分離基準の最終確認 | 配置先解決済み | 分離適合確認結果 | 各 action が SPEC 分離基準に適合していること（安定契約例外は follow-up 扱い） |
| STEP-5 SPEC ファイル操作 | 分離確認済み | `docs/specs/<**/*>.md` の追記 or 新規作成 | 新規作成時は frontmatter `status: draft` 付与、追記時は `status` 維持であること |
| STEP-6 インデックス整合 | SPEC 操作済み | SPEC 一覧（`README.md`）整合状態 | SPEC 一覧表と実ファイルが一致していること |
| STEP-7 SPEC 一覧整合確認 | インデックス更新済み | 整合確認結果 | 一覧表エントリと status が実ファイルと一致していること |
| STEP-8 ドラフト status 更新 | 整合確認済み | 消費済みフラグの status 更新 | status 更新が commit 対象に含まれていること |
| STEP-9 変更範囲検証 | status 更新済み | 変更範囲検証結果 | 変更が許可スコープ内であること（違反時は報告して指示待ち） |
| STEP-10 コミット・プッシュ | 検証通過 | commit・push 済みブランチ | 並列実行安全ステージング（`agentdev-git-worktree`）に従っていること |
| STEP-11 完了報告 | push 完了 | 完了報告（次コマンドの提示を含む） | 出力パスと次アクションが報告されていること |

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-spec-save` が所有する。
同 Workflow Skill は `/agentdev/spec-save` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。
OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- SPEC 対象 artifact_actions（`artifact: spec`）の有無で判定する（全 work_type 対象。`work_type` による判定は廃止）。対象がない場合は SPEC ファイル操作を行わない no-op とする
- SPEC artifact_actions の分離根拠・配置先判定は req-define（`agentdev-req-analysis`）の結果を尊重し、spec-save で再分類するのは SPEC 分離基準への適合確認に限定する
- 各 SPEC action は SPEC 分離基準に適合させる。安定契約例外は SPEC 保存対象から除外し follow-up 扱いとする
- SPEC ファイルは実行時非依存を維持する（実行時コマンドが SPEC ファイルに依存する記述にしない）
- SPEC status が `draft` の SPEC は REQ/SPEC 境界違反検出の対象外とする
- ドラフト不備（`artifact_actions` 形式不正）はエラーで中止し req-define 差し戻しを推奨する。配置先 SPEC 特定不能の候補は skip して follow-up を明示する（全体は中止しない）。変更範囲検証違反時はユーザーに報告して指示を待つ

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G02: ファイル編集スコープは `docs/specs/**`（SPEC ファイル）、`.agentdev/drafts/**`（ドラフト status 更新用）のみ。`docs/specs/README.md` は SPEC 操作に付随する更新のみ許可（REQ ファイル（`docs/requirements/**`）、Decision（`docs/decisions/**`）、コマンド、スキル、テンプレート等、上記以外の作成・編集は禁止）
- G06: SPEC status の昇格（draft → accepted）は case-close の責務であり、spec-save は `status: accepted` を付与しない（新規作成時は `status: draft`、既存 SPEC 追記時は `status` を維持）
- G12: Issue は作成しない（Issue 作成は case-open の責任）
