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

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/spec-save.yaml`）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。extension に列挙されていない `docs/specs/**` 内部パスを固定知識として読みに行かない。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-spec-save` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。同スキルが11 STEP の control plane として制御構造（配置先解決、SPEC ファイル操作、整合確認、永続化）を所有する。

### Step 1: 事前チェック

`artifact: spec` entry 有無判定（全 work_type 対象）、no-op 完了、旧形式 draft 後方互換

### Step 2: SPEC artifact_actions 読込

処理対象 entry（target、operation、content）確定

### Step 3: 配置先解決

既存パス vs `new:{slug}` / `target_spec` 構造化、`search-target-area.ts` による決定的判定

### Step 4: SPEC 分離基準の最終確認

安定契約例外の除外と follow-up 明示

### Step 5: SPEC ファイル操作

create（frontmatter `status: draft` 付き）/ update（target_area セクション置換、後方互換追記）、並列化（最大5件）、SPEC 宣言付与

### Step 6: インデックス整合

新規 SPEC の `docs/specs/README.md` 一覧登録（check-entry-existence 検証）

### Step 7: SPEC 一覧整合確認

targeted docs guard、extension 更新要否確認

### Step 8: ドラフト status 更新

SPEC 消費済みフラグ（commit 対象に含める）

### Step 9: 変更範囲検証

check-change-impact

### Step 10: コミット・プッシュ

明示パスステージ、`git commit -- <paths>`

### Step 11: 完了報告

保存した SPEC 一覧（新規/追記別）、スキップ有無、follow-up

各 STEP の詳細（開始条件・結果・手順・resume point・関連 Capability Skill 連携）は `agentdev-workflow-spec-save` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-spec-save` が所有する。同 Workflow Skill は `/agentdev/spec-save` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## ガードレール

### フェーズ制約
- G01: SPEC 対象 artifact_actions（`artifact: spec`）の有無で判定する（全 work_type 対象）。`work_type` による判定は廃止

### ファイル操作制約
- G02: ファイル編集スコープ: 以下のパスのみ作成、編集を許可: `docs/specs/**`（SPEC ファイル）、`.agentdev/drafts/**`（ドラフト status 更新用）。`docs/specs/README.md` は SPEC 操作に付随する更新のみ許可
- G03: 上記以外のファイル作成、編集は禁止。REQ ファイル（`docs/requirements/**`）、Decision（`docs/decisions/**`）、コマンド、スキル、テンプレートは編集禁止
- G04: SPEC 対象 artifact_actions がない場合は SPEC ファイルを一切作成、編集しない（no-op）

### SPEC ライフサイクル制約
- G05: 新規 SPEC 作成時は frontmatter `status: draft` を必ず付与すること
- G06: 既存 SPEC へ追記時は当該 SPEC の `status` を変更しないこと。`status: accepted` への昇格は case-close Step 3 の責務
- G07: SPEC status が `draft` の SPEC は REQ/SPEC 境界違反検出の対象外とする

### 品質制約
- G08: 各 SPEC action は SPEC 分離基準に適合すること。安定契約例外は SPEC 保存対象から除外し follow-up 扱い
- G09: SPEC ファイルは実行時非依存を維持すること。実行時コマンドが SPEC ファイルに依存する記述にしない

### 委譲、参照制約
- G10: SPEC artifact_actions の分離根拠、配置先判定は req-define（`agentdev-req-analysis`）の結果を尊重し、spec-save で再分類しないこと
- G11: SPEC status 昇格（draft → accepted）の判定は case-close の責務。spec-save は accepted を付与しない

### Issue 作成制約
- G12: spec-save は Issue を作成してはならない。Issue 作成は case-open の責任

## エラー処理

ドラフト不備（`artifact_actions` 形式不正）→ エラーで中止し req-define 差し戻し推奨。配置先 SPEC 特定不能 → 当該候補をスキップし follow-up 明示（全体中止しない）。変更範囲検証違反 → ユーザーに報告し指示を待つ（自動破棄禁止）
