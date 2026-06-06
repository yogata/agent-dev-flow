# 成果物・状態モデル

AgentDevFlow を構成する成果物の種別・配置・ライフサイクルを説明する。

## 文書種別

| 種別 | 格納先 | 役割 |
|------|--------|------|
| REQ | `docs/requirements/REQ-{NNNN}.md` | 要件定義の永続基準 |
| ADR | `docs/adr/ADR-{NNNN}.md` | 取り返しのつかない技術判断の記録 |
| SPEC | `docs/specs/*.md` | 実装者が参照する現在仕様 |
| DOC-MAP | `docs/DOC-MAP.md` | 文書探索・参照経路の入口（索引） |
| guides | `docs/guides/*.md` | 利用者向けの参照用読み物 |

**優先順位**: REQ > ADR > SPEC。DOC-MAP と guides は基準を代替しない。基準文書と矛盾する記述がある場合は基準を優先する。

### 参照ルール

- REQ → ADR、ADR → ADR、Issue → ADR の参照を許可
- ADR → Issue の逆参照は不可
- 文書間矛盾時は REQ を優先

## コマンド・スキル体系

| 成果物 | 格納先 | 役割 |
|--------|--------|------|
| Command | `src/opencode/commands/agentdev/`（runtime: `.opencode/commands/agentdev/`） | 実行手順の一次参照（Step 番号・入出力契約） |
| Skill | `src/opencode/skills/agentdev-*`（runtime: `.opencode/skills/agentdev-*`） | 判定基準・共通知識・宣言的ルールの一次参照 |
| Template | Skill 配下 `templates/` | Issue/PR 本文の出力構造とプレースホルダー |
| Script | Skill 配下 `scripts/` | ガードレール・検査・補助処理の実行可能ロジック |
| Repo-local Command | `.opencode/commands/repo/`（source なし、projection のみ） | self-hosting repo 専用コマンド（ADR-0020）。AgentDevFlow 配布対象外 |
| Repo-local Skill | `.opencode/skills/repo-*/`（source なし、projection のみ） | self-hosting repo 専用スキル（ADR-0020）。AgentDevFlow 配布対象外 |

Command は判定ロジックを直接記述せず Skill を参照する。Skill は Command の Step 番号やファイルパスを記述しない。Script は決定的で単体テスト可能な処理に限定する。

### テンプレート配置

| 種別 | 配置先 |
|------|--------|
| Issue/コメント/PR | `agentdev-workflow-templates/templates/` |
| REQ | `agentdev-req-file-manager/templates/` |
| ADR | `agentdev-adr-file-manager/templates/` |
| 乖離検出 | `agentdev-spec-compliance/templates/` |

## ディレクトリ構造

```
docs/
  requirements/REQ-{NNNN}.md    # 要件定義（基準）
  adr/ADR-{NNNN}.md             # アーキテクチャ判断（基準）
  specs/*.md                     # 現在仕様（repo-internal 設計文書、基準）
  DOC-MAP.md                     # 文書探索入口（非基準）
  guides/*.md                    # 参照用読み物（navigation 層、非基準）
.agentdev/
  intake/                        # Intake パイプライン domain state
    inbox/ accepted/ promoted/ archive/
  learning/                      # Learning パイプライン domain state
    inbox.md archive/active.md evaluation-report.md promoted/
  backlog/req-units/RU-*.md      # Requirement Unit
  integrity/                     # 整合性検証レポート
.opencode/                        # Runtime projection (junction → src/opencode/)
  commands/agentdev/             # Command 定義（AgentDevFlow distributed）
  commands/repo/                 # Repo-local command（ADR-0020、AgentDevFlow 配布対象外）
  skills/agentdev-*/             # Skill 定義（AgentDevFlow distributed）
  skills/repo-*/                 # Repo-local skill（ADR-0020、AgentDevFlow 配布対象外）
src/opencode/                     # Canonical source
  commands/agentdev/             # Command source
  skills/agentdev-*/             # Skill source
.sisyphus/                       # 一時的 runtime 作業領域（domain state ではない、ADR-0018）
  drafts/                        # command workflow の作業用一時領域（明示的 handoff のみ使用）
```

### ディレクトリ責務の補足

- `.agentdev/`: AgentDevFlow の canonical domain state。intake / learning / backlog / integrity の永続データを管理する。配布物ではなく、レポジトリの動作状態を保持する（ADR-0017）。
- `.sisyphus/`: runtime 一時作業領域。domain state ではなく、`.gitignore` で管理対象外とする（ADR-0018）。
- `.sisyphus/drafts/`: command workflow でのみ明示的に定義された working draft handoff に使用する一時領域。

## 成果物ライフサイクル

| 成果物 | 生成 | 読取り | 削除トリガー |
|--------|------|------|-------------|
| promoted artifact（intake） | `intake-promote` | `backlog-review` | RU 化成功時 |
| promoted artifact（learning） | `learning-promote` | `backlog-review` | RU 化成功時 |
| RU | `backlog-save`, session-sourced | `req-define`, `req-save`, `case-open` | `case-open` の Issue 作成 + VERIFY 成功時 |
| REQ ファイル | `req-save` | `case-open`, `case-run`, `case-close` | なし（永続） |
| Issue | `case-open` | `case-run`, `case-close` | なし（永続） |

流れ: promoted artifact / session-sourced → RU → REQ ファイル / Issue → マージ → クローズ。RU 削除は `case-open` の永続化成功に限定する。

## フェーズ体系

ワークフローは3つのマクロフェーズで構成される。

| マクロフェーズ | 対応マイクロフェーズ | SSoT 境界 |
|---------------|---------------------|---------|
| 壁打ち | `requirement` → `analyzed` | docs 変更を commit/push |
| 構造的実行 | `created` → `in_progress` | Issue 本文が SSoT |
| レビュー完了 | `review` → `done` | PR + Issue が SSoT |

| マイクロフェーズ | 状態 | マクロフェーズ |
|-----------------|------|---------------|
| `requirement` | 要件定義中 | 壁打ち |
| `analyzed` | 分析完了・Issue 未作成 | 壁打ち |
| `created` | Issue 作成済み・作業前 | 構造的実行 |
| `in_progress` | 実装中 | 構造的実行 |
| `review` | PR 作成済み・レビュー中 | レビュー完了 |
| `done` | 完了（post-run capture 含む） | レビュー完了 |

> **注意**: 6 マイクロフェーズは説明用ラベルであり、AgentDevFlow の状態管理モデルではない（REQ-0112-023）。AgentDevFlow は全体横断の状態遷移モデルを持たない。各コマンドの入出力契約とディレクトリ配置が実際の状態表現である。

## 状態モデル制約（REQ-0112）

以下の制約が AgentDevFlow の状態モデルに適用される:

- REQ / SPEC に workflow status を追加しない（REQ-0112-027）
- intake promoted に route / status を追加しない（REQ-0112-028）
- Issue / PR の状態を docs に複製しない（REQ-0112-029）
- command-map を状態遷移エンジン化しない（REQ-0112-030）

## .agentdev/ の位置づけ

`.agentdev/` は AgentDevFlow の canonical domain state（永続的領域状態）である（REQ-0112-024）:

- **domain state**: intake / learning / backlog / integrity のパイプライン状態を保持する
- **配布物ではない**: runtime 配布物の一部ではなく、agent-dev-flow レポジトリ内の作業領域である
- **git 管理対象**: コマンド実行時に scoped commit で永続化される
- `.sisyphus/` は runtime 作業領域であり、domain state ではない
