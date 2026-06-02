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
| Command | `.opencode/commands/agentdev/` | 実行手順の一次参照（Step 番号・入出力契約） |
| Skill | `.opencode/skills/agentdev-*` | 判定基準・共通知識・宣言的ルールの一次参照 |
| Template | Skill 配下 `templates/` | Issue/PR 本文の出力構造とプレースホルダー |
| Script | Skill 配下 `scripts/` | ガードレール・検査・補助処理の実行可能ロジック |

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
  specs/*.md                     # 現在仕様（基準）
  DOC-MAP.md                     # 文書探索入口（非基準）
  guides/*.md                    # 参照用読み物（非基準）
.agentdev/
  intake/                        # Intake パイプライン domain state
    inbox/ accepted/ promoted/ archive/
  learning/                      # Learning パイプライン domain state
    inbox.md archive/active.md evaluation-report.md promoted/
  backlog/req-units/RU-*.md      # Requirement Unit
  integrity/                     # 整合性検証レポート
.opencode/
  commands/agentdev/             # Command 定義
  skills/agentdev-*/             # Skill 定義（SKILL.md + references/ + templates/ + scripts/）
.sisyphus/                       # 作業領域（runtime 用。永続的な domain state ではない）
```

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
