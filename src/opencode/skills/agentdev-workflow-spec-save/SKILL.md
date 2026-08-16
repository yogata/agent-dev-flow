---
name: agentdev-workflow-spec-save
description: "spec-save command の workflow 実装本体。req-define で分離された SPEC 保存対象（artifact: spec entry）の保存・確定を行う制御を所有する。事前チェック（no-op 判定）、配置先解決、SPEC ファイル操作（target_area セクション置換、SPEC 宣言付与）、インデックス整合、targeted docs guard、ドラフト status 更新、変更範囲検証、コミット・プッシュも含む。USE FOR: spec-save 実行時の workflow 制御（normal create/update・no-op・validation failure・partial failure・rerun idempotency・commit 前中断・external Git failure 各シナリオ）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# spec-save workflow スキル

spec-save command の workflow 実装本体。req-define で分離された SPEC 保存対象（`draft-data` の `artifact_actions` 内 `artifact: spec` entry）を `docs/specs/<**/*>.md` に保存、確定する制御構造を所有する。req-save の次、case-open の前に実行する。req-save の G02（SPEC 編集禁止）を緩和するものではなく、SPEC 保存を独立責務として切り出す。全 work_type 対象であり、`work_type` による判定は廃止する。

spec-save command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約は `<workflows/workflow-skill-model>` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-spec-save.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と spec-save command の公開契約のみを前提とする。SPEC ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **SPEC 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として読みに行かない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## USE FOR

- spec-save command の実行時 workflow 制御（全 STEP）
- 事前チェック（`artifact: spec` entry 有無判定、no-op 完了、旧形式 draft 後方互換）
- 配置先解決（既存パス vs `new:{slug}` / `target_spec` 構造化、決定的スクリプト呼出）
- SPEC 分離基準の最終確認（安定契約例外の除外と follow-up 明示）
- SPEC ファイル操作（create: frontmatter 付き新規作成、update: target_area セクション置換 / 後方互換追記、複数 action 並列化、SPEC 宣言付与）
- インデックス整合（新規 SPEC の README 一覧登録、check-entry-existence 検証）
- SPEC 一覧整合確認（targeted docs guard、extension 更新要否確認）
- ドラフト status 更新（SPEC 消費済みフラグ）、変更範囲検証、コミット・プッシュ

## DO NOT USE FOR

- 要件doc 作成、壁打ち（`/agentdev/req-define`）
- REQ/Decision ファイル保存（`/agentdev/req-save`）
- Issue 作成（`/agentdev/case-open`。spec-save は Issue を作成しない）
- SPEC ファイル管理・配置判断・target_area マッチング規則の定義（`agentdev-spec-file-manager`）
- 決定的検証スクリプトの所有（`agentdev-artifact-validation`）
- SPEC status 昇格（draft → accepted）の判定（case-close の責務。spec-save は accepted を付与しない）
- SPEC 内容品質の再検証（req-define の QG-{N} の責務）
- commit message 規約の定義（`agentdev-conventional-commits`）
- 並列実行安全ステージングの定義（`agentdev-git-worktree`）

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define が生成し req-save が REQ 保存済みのドラフト。`draft-data` の `artifact_actions` に `artifact: spec` entry を含む）

## 出力

- `docs/specs/<**/*>.md`（既存 SPEC への追記 or 新規 SPEC 作成）
- `.agentdev/drafts/req-draft-{topic-slug}.md`（SPEC artifact_actions 消費済みフラグの status 更新）

## 副作用

- `docs/specs/**` と `.agentdev/drafts/**` のみ作成・編集（G02。`docs/specs/README.md` は SPEC 操作に付随する更新のみ）
- main ブランチへの commit・push（明示パスステージ、`agentdev-git-worktree` プロシージャ準拠）
- Issue は作成しない（G12、case-open の責任範囲）

## Control Plane（STEP 一覧）

spec-save workflow は次の11 STEP で構成する。各 STEP は resume point を持つ（DEC-{N}、`docs/specs/<workflows/step-reference-contract>.md`）。会話コンテキストに依存せず、durable state（draft の SPEC 消費済みフラグ、SPEC ファイルの存在と frontmatter `status`、`docs/specs/README.md` エントリ、git 状態）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 事前チェック | spec-save 起動 | 処理要否判定（no-op or 継続） | [references/placement-and-save.md](references/placement-and-save.md) |
| STEP-2 | SPEC artifact_actions 読込 | 処理対象あり | 処理対象 entry（target、operation、content）確定 | [references/placement-and-save.md](references/placement-and-save.md) |
| STEP-3 | 配置先解決 | entry 確定 | 配置先 SPEC（既存 or 新規）解決、target_area 判定 | [references/placement-and-save.md](references/placement-and-save.md) |
| STEP-4 | SPEC 分離基準の最終確認 | 配置先解決済み | 適合判定（安定契約例外は除外し follow-up 明示） | [references/placement-and-save.md](references/placement-and-save.md) |
| STEP-5 | SPEC ファイル操作 | 適合判定済み | SPEC create / update 実行（並列化、宣言付与） | [references/placement-and-save.md](references/placement-and-save.md) |
| STEP-6 | インデックス整合 | ファイル操作完了 | 新規 SPEC の README 一覧登録（check-entry-existence 検証） | [references/verification-and-persistence.md](references/verification-and-persistence.md) |
| STEP-7 | SPEC 一覧整合確認 | インデックス整合完了 | targeted docs guard、extension 更新要否確認 | [references/verification-and-persistence.md](references/verification-and-persistence.md) |
| STEP-8 | ドラフト status 更新 | 一覧整合確認完了 | SPEC 消費済みフラグ（commit 対象に含む） | [references/verification-and-persistence.md](references/verification-and-persistence.md) |
| STEP-9 | 変更範囲検証 | status 更新済み | check-change-impact 検証 | [references/verification-and-persistence.md](references/verification-and-persistence.md) |
| STEP-10 | コミット・プッシュ | 変更範囲検証合格 | 明示パス commit、push | [references/verification-and-persistence.md](references/verification-and-persistence.md) |
| STEP-11 | 完了報告 | push 完了 | 保存した SPEC 一覧、スキップ、follow-up 報告 | [references/verification-and-persistence.md](references/verification-and-persistence.md) |

### STEP 間の依存と分岐

- **標準経路**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 → STEP-6 → STEP-7 → STEP-8 → STEP-9 → STEP-10 → STEP-11
- **no-op 経路**: STEP-1 で `artifact: spec` entry がない場合（旧形式 draft 含む）、no-op で完了
- **部分スキップ**: STEP-3 で配置先 SPEC 特定不能な候補は当該候補をスキップし follow-up 明示（全体中止しない）。STEP-4 で安定契約例外相当は除外し follow-up に明示
- **並列化**: 異なる `target` パスの SPEC create/update は並列化可能（最大5件）。同一 SPEC ファイルへの複数 action は順序依存のため直列サブセットとして分離する

### resume protocol

- 再開点は durable state から再構成する: draft の SPEC 消費済みフラグ、SPEC ファイルの存在と frontmatter（`status`、`updated`）、`docs/specs/README.md` のエントリ、`git status`
- commit 前中断時は `git diff --name-only` で変更ファイルを再検出し、未実行 STEP から再開する。SPEC 消費済みフラグの更新は commit/push より前に実施し commit 対象に含める
- partial failure 時は保存済み SPEC（durable state）を残したまま未完了 action のみ再処理する（rerun idempotency）。external Git failure 時はエラー報告し、同一状態からリトライ可能な STEP を明示する

### termination

- 正常終了: STEP-11 の完了報告出力まで（no-op 時は STEP-1 の no-op 完了）
- 停止終了: ドラフト不存在（エラーで中止、req-define を案内）、`artifact_actions` 形式不正（エラーで中止し req-define 差し戻し推奨）、変更範囲検証違反（ユーザーへ報告し指示待ち、自動破棄禁止）
- SPEC status は新規作成時 `draft` のみ付与し、既存追記時は変更しない。`accepted` 昇格は case-close の責務

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-spec-file-manager`: SPEC ファイル操作、配置判断、target_area マッチング規則、SPEC ライフサイクル適用、決定的スクリプト呼出契約（search-target-area.ts）、複数 action 並列化
- `agentdev-artifact-validation`: 公開検証契約（check-entry-existence、check-change-impact）
- `agentdev-conventional-commits`: commit message 生成
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（明示パスステージ、`git commit -- <paths>`）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- integrity checker skill（AG-{NNN} detector、repo 固有）: check_changed_docs.ts（--workflow spec-save）

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-spec-save.yaml`、`kind: workflow-extension`）を読み込む場合がある（REQ-{NNNN}-{NNN}、DEC-{N}）。必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-spec-save/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。いずれも Workflow Skill のみが読み、spec-save command は直接読まない。標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行する。

## 共通制約

- **工程分岐**: `artifact: spec` entry の有無で判定する（全 work_type 対象、`work_type` による判定は廃止）
- **SPEC ライフサイクル**: 新規作成時 `status: draft`、既存追記時 `status` 変更なし。遷移契機の詳細は `agentdev-spec-file-manager` の spec-lifecycle-application が正とする
- **再分類禁止**: SPEC artifact_actions の分離根拠、配置先判定は req-define（`agentdev-req-analysis`）の結果を尊重し、spec-save で再分類しない
- **実行時非依存**: SPEC ファイルは実行時コマンドが依存する記述にしない（G09）
- **Issue 作成禁止**: spec-save は Issue を作成しない（case-open の責任範囲）

## See Also

- **`<workflows/workflow-skill-model>` SPEC**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` SPEC**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **spec-save command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
