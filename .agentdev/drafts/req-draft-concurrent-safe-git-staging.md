---
id: REQ-0137
title: "並列実行安全 git 操作規律（共有作業ツリーでの case-auto 並行実行支援）"
created: "2026-06-19"
updated: "2026-06-19"
---

## 目的

複数の case-auto（および個別の req-save / case-open / case-close 等）を同一リポジトリの共有作業ツリーで並行実行することを許可しつつ、git 操作の規律によりデータ損失・他セッション変更の巻き込み・コミット原子性破壊を防止する。

事前調査（Oracle 検証済み）で、以下の構造的欠陥が判明した:
- case-open は draft/RU 削除をディスク上で行うが commit step が不在（Form Zero）。削除が未ステージ状態で浮遊し、他セッションの `git add` で巻き込まれる前提条件を生む
- 複数コマンドが広域ディレクトリスコープ（`.agentdev/` 全体）で `git add` を行い、並行セッションの同ディレクトリ内ファイルを無差別にステージする
- plain `git commit` が共有 index の全エントリを排出するため、他セッションのステージ済み作業を勝手にコミットする
- スイープ操作（`git add -A` / `git checkout .` 等）が他セッションの正当な変更を破壊・復元誤爆する
- 消費済み draft/RU の削除完了検証（クリーンアップ検証ゲート）が Epic flow にしか存在せず、Standard flow では削除の巻き戻りを検知できない。実際の事故（case-auto-issue-number-dispatch = Standard）はこのギャップで残存した

本 REQ は、git ステージ・コミット規律（追加系）と消費アーティファクト削除の信頼性（削除系）の双方を要件化する。実装の詳細手順（対象コマンド一覧・正確な git コマンド形式・`--paths` 書式）は `agentdev-git-worktree` スキルの `git-common-procedures.md`（手続き SSoT）に配置する。並列実行のスケジューリング機構・ロック実装そのものは本 REQ の対象外とする。

## 要件

| ID | 要件 |
|---|---|
| REQ-0137-001 | 共有作業ツリーで git 操作を行うコマンドは、他セッションの変更を無差別に巻き込むスイープ操作（`git add -A`、`git add .`、`git add --all`、`git commit -a`、`git checkout .`、`git reset --hard`、`git stash`、および非所有パスに対する `git checkout -- <path>` / `git restore <path>`）を実行しないこと |
| REQ-0137-002 | git 操作を行うコマンドは、ステージおよびコミットを明示パス指定（`git add <path>` / `git rm <path>`）で行うこと。コミットは `git commit -- <paths>`（--only pathspec 形式）を用い、共有 index に存在する他セッションのステージ済み変更を当該コミットに排出しないこと |
| REQ-0137-003 | ファイルの削除・変更・作成を行うコマンドは、当該変更を未ステージ状態で作業ツリーに残存させないこと。削除・変更の実行と同一ステップ内で明示パスによりステージおよびコミットを完結すること（case-open の draft/RU 削除即時 commit を含む） |
| REQ-0137-004 | `agentdev-git-worktree` スキルの `git-common-procedures.md` に、REQ-0137-001〜003 を満たす並列実行安全ステージングプロシージャが定義されること。共有作業ツリーで git 操作を行う全コマンドは当該プロシージャに従うこと |
| REQ-0137-005 | git 操作を行うコマンドの `git add` 対象は、当該コマンドが生成・変更する成果物の専用サブディレクトリまたは明示ファイルパスに限定されること。親ディレクトリ全体（`.agentdev/` 等）を一括でスコープとしないこと |
| REQ-0137-006 | 消費済み draft（`.agentdev/drafts/req-draft-*.md`）および消費済み RU（`.agentdev/backlog/req-units/RU-*.md`）は、当該アーティファクトを消費する case-open の完了時点で作業ツリーから削除され、残存しないこと。削除は REQ-0137-002/003 に従い明示パスでステージ・コミットされ永続化されること（Form Zero の解消） |
| REQ-0137-007 | draft・RU の削除を行ったコマンドは、削除後に当該ファイルの残存を検証し、残存を検出した場合は停止すること。この検証は Standard flow と Epic flow の双方で実施されること（Epic flow 限定のクリーンアップ検証ゲートを Standard flow にも拡張） |

## 適用範囲

- **対象**:
  - 共有作業ツリー（main worktree）で git 操作を行う全コマンド: req-save, spec-save, case-open, case-close, learning-promote, backlog-review, intake-capture, intake-from-github, intake-promote, inspect-docs, inspect-skills, inspect-promote
  - `agentdev-git-worktree` スキルの `git-common-procedures.md`（並列実行安全ステージングプロシージャの定義先）
  - 消費済み draft（`.agentdev/drafts/req-draft-*.md`）および消費済み RU（`.agentdev/backlog/req-units/RU-*.md`）の削除ライフサイクル（case-open での削除・検証）
- **対象外**:
  - case-run の worktree 隔離フェーズ（専用 worktree + branch で index が独立しており、並行安全性が構造的に保証済み）
  - GitHub API 操作（Issue / PR 作成・merge。並行安全性は GitHub 側で保証）
  - 並列実行のスケジューリング・プロセスロック機構そのものの実装（本 REQ は git 操作規律の要件化であり、実行制御機構は別課題）
  - 単一セッション実行時の正確性（本 REQ は並行実行安全性が主目的。単一セッション動作は既存要件が担保）
  - draft/RU 以外のアーティファクト削除（intake archive・inspect archive等。これらは別コマンドのライフサイクル）

## Requirement Source

- ユーザー指示: 「case-auto の並行禁止はしたくない。そのうえで安全に並行実施することは可能？そのための方策は？」
- Oracle 検証（2026-06-19 セッション）:
  - Form B（編集スコープ + diff 検証）は並行 unsafe（パスプレフィックス検証のみで同一許可ディレクトリ内の他セッションファイルを透過）
  - Form A（明示パス）も広域スコープ + plain `git commit` では unsafe（共有 index 排出問題）
  - case-open は Form Zero（commit step 不在）が事故の真の前提条件
  - 事故の真因はエージェントの「訂正反応」（予期せぬ diff を観測して restore）→ 復元系スイープ操作の禁止が必須
- 実装事故の Git 証拠: commit `a77672d`（`git add -A` で4件巻き込み削除）→ commit `20be521`（2件誤復元）

## 関連ドキュメント更新候補

| 対象ファイル | 更新内容 | 分類 |
|---|---|---|
| `docs/requirements/REQ-0137.md` | 新規作成（本ドラフトの確定版） | 変更後仕様 |
| `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md` | 「並列実行安全ステージング」プロシージャ新設。既存「Domain state 永続化」L75 の広域 `.agentdev/` スコープを専用サブディレクトリへ狭域化 | 反映作業 |
| `src/opencode/commands/agentdev/case-open.md` | Step18/18-1 に draft/RU 削除の即時ステージ・コミット Step を新設（Form Zero 解消・REQ-0137-006）。Step18 完了後に draft/RU 残存を検証する Step を新設（REQ-0137-007・Standard/Epic 共通） | 反映作業 |
| `src/opencode/commands/agentdev/case-auto.md` | Standard flow でも case-open 相当処理完了後に draft/RU 残存検証（クリーンアップ検証ゲート）を実施するよう拡張（REQ-0137-007。現状は Epic flow Step4-1 前のみ） | 反映作業 |
| `src/opencode/commands/agentdev/case-close.md` | G17 の `.agentdev/` スコープ狭域化。L80 `git checkout .` を worktree 内限定化（main ツリーでのスイープ禁止） | 反映作業 |
| `src/opencode/commands/agentdev/req-save.md` | Step11 コミット手順に明示パスステージ + `git commit -- <paths>` 指定を追加 | 反映作業 |
| `src/opencode/commands/agentdev/spec-save.md` | Step10 コミット手順に同上 | 反映作業 |
| `src/opencode/commands/agentdev/learning-promote.md` | `git add` スコープを `.agentdev/` → `.agentdev/learning/` へ狭域化 | 反映作業 |
| `src/opencode/commands/agentdev/backlog-review.md` | `git add` スコープを `.agentdev/` → `.agentdev/backlog/` へ狭域化 | 反映作業 |
| `docs/requirements/README.md` | REQ-0137 関心対象追加 | 反映作業 |

## 関連情報

- **関連 REQ**: REQ-0102（req-save）, REQ-0103（Artifact責任分界・汎用ガードレール）, REQ-0110（git-worktree skill）, REQ-0131（case-close）, REQ-0132（case-open）, REQ-0128（learning-promote）, REQ-0129（backlog-review）, REQ-0136（spec-save・git hooks）
- **関連 ADR**: ADR-0114（case-auto orchestration / driver 委譲モデル）, ADR-0103（文書種別責務境界）
- **関連 SPEC / skill reference**: `agentdev-git-worktree/references/git-common-procedures.md`（手続き SSoT）, `docs/specs/workflow-contracts.md`
- **前提調査**: Oracle 検証セッション（concurrent case-auto git safety analysis）

## draft-meta

- **work_type**: feature
- **req-operation**: CREATE
- **target-req**: REQ-0137（新規）
- **adr-required**: false
- **adr-judgment**: ADR不要。並列実行の「許可」はユーザー方針として確定済み。「安全な git 操作規律」は運用規律の要件化であり、アーキテクチャ決定（コンポーネント構造・主要技術選択・データモデル）ではない。既存 ADR-0114（orchestration）・ADR-0103（責務境界）を維持する。Step 5-0 既存 ADR 重複確認: なし。Step 5-1 ADR 禁止ゲート: REQ 相当（安全境界の要件）。Step 5-3 作業手段 ADR 拒否ゲート: 該当なし（削除・廃止・移行を主題としない）
- **topic-slug**: concurrent-safe-git-staging
- **scale**: standard
- **status**: saved
- **spec-candidates**: （なし。プロシージャ詳細は `git-common-procedures.md` skill reference へ配置。docs/specs/ への新規 SPEC は不要）
- **split-forecast**:
  - 計測対象: new
  - 要件行数: 7（0〜50 → +0）
  - 関心分類数: 1（case-auto 並行実行安全性で統一。git 操作規律と削除ライフサイクル検証は同一根因 Form Zero の両面）→ +0
  - artifact 種別数: 2（REQ + command/skill 定義）→ +0
  - SPEC分離基準違反: 0 → +0
  - 合計シグナル: 0 → 推奨アクション: APPEND許可（standard）
  - thresholds_ref: docs/specs/req-health-metrics.md

## operation_units

```yaml
operation_units:
  - ou_id: OU-01
    source_ru: null
    target_req: REQ-0137
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-0137
      operation_mapping:
        OU-01:
          operation: create
          target_req: REQ-0137
          saved_doc: docs/requirements/REQ-0137.md
          created_ids:
            - REQ-0137-001
            - REQ-0137-002
            - REQ-0137-003
            - REQ-0137-004
            - REQ-0137-005
            - REQ-0137-006
            - REQ-0137-007
      source_ru_mapping: {}
      case_open_input:
        target_req: REQ-0137
        work_type: feature
        scale: standard
        issue_policy: single
```

## execution_groups

```yaml
execution_groups:
  - id: EG-01
    type: standard
    purpose: 並列実行安全 git 操作規律・消費アーティファクト削除信頼性の要件化と手続き SSoT 整備
    included_ou:
      - OU-01
    rationale: 単一新規 REQ の CREATE。関心は単一（case-auto 並行実行安全性。git 操作規律と削除ライフサイクルは同一根因の両面）。反映作業（git-common-procedures.md プロシージャ追加・7コマンド定義更新）は case-run が扱う。1 Issue で完結する。
```
