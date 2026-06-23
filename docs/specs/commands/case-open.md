---
title: case-open SPEC
status: draft
created: 2026-06-21
updated: 2026-06-23
---

# case-open SPEC

## 目的

要件定義（req-define）の結果をもとに GitHub Issue を作成する。壁打ち→構造的実行フェーズの境界。Epic + 子 Issue 一括作成に対応する。

## 入力

- req-define で生成された要件doc（構造化 `draft-data` 形式: REQ-0138, ADR-0124・チェックボックス付き）
- draft 全体の `agreed_items`・`artifact_actions`・`operation_units` を処理対象。OU ごとにスライスせず draft 全体を取り扱う（REQ-0138-009）
- `auto_gate.auto_ready` が false、または未解決質問・未解決衝突・repo外操作・停止理由が残る場合は停止（REQ-0138-013）
- `conflict_resolutions` に記録済みの衝突は同じ内容をユーザーへ再確認しない（REQ-0138-014）

## 出力

- GitHub Issue（ラベル付き、要件doc埋め込み）
- Epic flow の場合は Epic Issue + 子 Issue 群（最大10件・G05/G15）
- ドラフト削除: `.agentdev/drafts/req-draft-{topic-slug}.md`
- RU ファイル削除: `.agentdev/backlog/req-units/RU-*.md`
- OU `result` 書き戻し: `operation_units` セクションに Issue / Epic 番号

## 副作用

- ファイル削除: `.agentdev/drafts/req-draft-*.md`, `.agentdev/backlog/req-units/RU-*.md`（Standard / Epic 全フロー共通・REQ-0137-003/006 Form Zero）
- git 操作: `git rm <path>` + `git commit -- <paths>` の即時ステージ・コミット（並列実行安全ステージング）
- GitHub API: `gh issue create`, `gh issue edit`, `gh issue comment`（`agentdev-gh-cli` VERIFY 付き）
- intake / learning capture: 非関与（G18, G22）

## 現在の動作

- Step 0: 前工程からの引き継ぎ停止判定 — `agentdev_handoff: true` 含まれる場合は Issue 作成せず停止
- Step 0-1: OU 選択ゲート — `operation_units` セクションがある場合、処理対象 OU を決定（OU ID 指定 / 自動選択 / 一覧表示停止）
- Step 1: 要件docからIssue本文生成（`agentdev-issue-management`）— REQ読解・テンプレート充足検査・完了条件候補抽出
  - Step 1-1: 完了条件網羅性検証（QG-2）— Issue作成前に REQ/ADR/SPEC 必達要件の網羅性を検証
- Step 2: マルチREQ入力判定 — 単一REQ / 複数REQ or `scale: large` で Epic flow へ分岐
  - Step 2-1: 自律構成生成（OU モード・複数REQ時）— `operation_units` から Epic / Wave / Issue 構造を自律生成
- Step 3: 規模判定（単一REQの場合）— `scale: large` → Epic flow / `scale: standard` → Standard flow
- Epic flow（Steps 4-8-1）:
  - Step 4: テンプレート読込（`agentdev-workflow-templates`）
  - Step 5: Epic Issue本文生成 — 自律構成分析結果に基づき Epic 本文を構築
  - Step 6: Epic Issue作成（ラベル: `enhancement`, `feature`, `epic`）— VERIFY
  - Step 7: 子Issue作成（OU 単位・順次処理）— Issue化単位は REQ doc 単位ではなく OU 単位（REQ-0104-042）。各子 Issue 本文の「## 補足情報」セクションに「前工程完了度」属性を埋め込む（REQ-0146-011・`docs/specs/workflows/epic-wave-model.md` の前工程完了度3段階分類に従う）
  - Step 8: Epic Issue本文更新 — ステータス追跡テーブル更新
  - Step 8-1: OU `result` 書き戻し — Issue / Epic 番号
- Standard flow（Steps 14-16-1）:
  - Step 14: 関連ADR特定
  - Step 15: ラベル付与（`agentdev-workflow-lifecycle`）
  - Step 16: GitHub Issue作成 — VERIFY
  - Step 16-1: OU `result` 書き戻し — Issue 番号
- 共通終了処理（Steps 17-18-2）:
  - Step 17: コメント追加（`agentdev-workflow-templates`）
  - Step 18: ドラフト削除（`git rm` + `git commit` Form Zero）
  - Step 18-1: RU ファイル削除（`git rm` + `git commit` Form Zero）
- Step 18-1-1: draft / RU 削除残存検証 — `git status --porcelain` で残存検出
- Step 18-1-2: draft/RU 削除 commit 後の即時 push（REQ-0146-003） — Step 18 / 18-1 の削除コミット後に `git push` を即時実行する。case-run 引き継ぎ時の `git pull --ff-only` 失敗防止のため
- Step 18-2: 完了報告（Standard / 単一REQ Epic / マルチREQ Epic テンプレート）

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md) — フェーズ定義・コマンド分類・workflow_route
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md) — Epic / Wave / Issue 階層・子Issue 状態 enum・case-open 構成生成基準
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md) — RU 削除トリガー・draft lifecycle
- [quality-gates.md](../quality-gates.md) — QG-2
- [document-type-responsibilities.md](../document-type-responsibilities.md) — Issue 本文品質検査

## 対象外

- 機能要件・非機能要件・制約・対象外・受け入れ条件の新規作成（G19・REQ-0132-009）
- 実装順序・Issue分解についてのユーザー確認要求（G20・REQ-0132-008）
- 単一 Issue で完結する場合の Epic 作成（G20・REQ-0104-041）
- Wave単位のみの子Issue構造（G14・子Issueは必ずREQドキュメントと対応付けること）
- 子Issue最大10件超過時の作成続行（G05・エラー停止）
- intake / learning capture の実施（G18, G22）
- Issue作成の gh CLI 安全手順省略（G12・`agentdev-gh-cli` 参照）
- スイープ操作（`git add -A` / `git add .` / `git commit -a` / `git checkout .` / `git reset --hard` / `git stash` 等）の実行（G23・REQ-0137-001）
- 明示パス指定以外のステージ・コミット（G24・REQ-0137-002/005）
- draft / RU 削除の未ステージ残存許可（G24・Form Zero・REQ-0137-003/006）

## 検証観点

- QG-2（Acceptance Criteria Coverage Gate）: Step 1-1 で完了条件が対象 REQ/ADR/SPEC の必達要件を網羅しているか検証。fail 時は Issue 作成前に req-define 差し戻し推奨
- 子Issue 先頭行 `Parent: #{epic_number}` 含有（G03・親子関係追跡用）
- 全子Issue作成完了後の Epic 本文ステータス追跡テーブル更新（G04・部分更新禁止）
- 子Issue数上限（G05・最大10件・Epic 1件あたり）
- テンプレート必須セクション完備確認（G09・G10・`完了条件` セクション含む）
- 出力制約: Issue 本文・commit message は verbatim で返す（G17）
- draft / RU 削除残存検証（Step 18-1-1・`git status --porcelain` で空であること）

## case-auto 並列委譲モデル（REQ-0114-087〜093）

### 連結成分ベース複数 Standard/Epic 構成生成（REQ-0114-088 更新・REQ-0148）

case-open は OU 群の依存グラフの連結成分（必須依存のみをエッジとする）を Epic 候補の出発点とし、依存強度・Epic サイズ・機能的一貫性の3軸判断で複数 Standard Issue / 複数 Epic Issue / 混在を自律生成する（REQ-0148-005, REQ-0148-006, REQ-0148-007, REQ-0132-015/016）。

**単独根の Standard flow 扱い**: 連結成分が 1 OU だけ（単独根）の場合、Epic 化せず Standard flow とする（REQ-0148-008, REQ-0132-017）。

**3軸判断の判定基準**:

| 軸 | 判定基準 |
|---|---|
| 依存強度 | 必須依存で結合した OU 群は原則同一 Epic。弱依存・関連依存は連結成分のエッジにしない |
| Epic サイズ | 1 Epic あたり子 Issue 推奨 3-10・上限 10 ハード制約（REQ-0148-009）。上限超過時は必須依存があっても分割を検討 |
| 機能的一貫性 | 連結成分内の OU 群が単一の機能的主題を成すか。主題を欠く場合は複数 Epic へ分割、または Standard flow へ分散 |

case-open は無関係な OU 群を単一 Epic へ機械的に集約しない（REQ-0148-010）。3軸判断の個別エッジケース（同機能独立・共通基盤等）は LLM 推論に委ねる。REQ/SPEC で固定するのは不変の方針（依存強度3レベル定義・Epic サイズ上限・単独根 Standard flow）のみである。

case-open は Epic 構成推論の根拠を Epic Issue 本文または `case_open_hints` に記録する（REQ-0148-011, REQ-0138-020）。連結成分アルゴリズム・3軸判断基準・Epic 分割例外（REQ-0148-023）の詳細は `docs/specs/workflows/epic-wave-model.md` の「連結成分ベース execution_unit 構成モデル」セクション参照。

### 子Issue 作成の並列化

- 子Issue 本文案作成・検査・Issue 作成は最大5件まで並列化できる（REQ-0114-089）
- Epic Issue 作成・Wave 1 配置・Epic 本文ステータス追跡テーブル更新は親が直列集約（REQ-0114-093）
- G04「全子Issue 作成完了後にテーブル更新（部分更新禁止）」は集約更新で維持

## See Also

- [req-define.md](req-define.md) — 前段コマンド
- [req-save.md](req-save.md) — 前段コマンド（REQ/ADR 保存）
- [spec-save.md](spec-save.md) — 前段コマンド（SPEC 保存）
- [case-run.md](case-run.md) — 後続コマンド（実装）
- `agentdev-issue-management` skill — Issue 本文生成・テンプレート充足
- `agentdev-workflow-templates` skill — テンプレート選定
- `agentdev-workflow-lifecycle` skill — work_type・scale 判定・ラベル付与
- `agentdev-gh-cli` skill — gh CLI 安全使用
- `agentdev-git-worktree` skill — 並列実行安全ステージング
- `agentdev-quality-gates` skill — QG-2
- `agentdev-epic-tracker` skill — ステータス追跡テーブル
- REQ-0132 — case-open / Issue作成
- REQ-0137 — 並列実行安全 git 操作規律
- REQ-0148 — RU群バッチ処理と複数 execution_unit 並列実行
