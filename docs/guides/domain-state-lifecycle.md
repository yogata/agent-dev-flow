# Domain State Lifecycle

AgentDevFlow の Learning・Intake・Integrity パイプラインにおけるファイル・ディレクトリの状態遷移を説明します。

## Intake と Learning の境界

両パイプラインは以下の基準で振り分けます。

- **具体的な修正対象が特定できる** → intake
- **再発防止の知見・判断ミス・手順漏れ** → learning
- **両方の性質を持つ** → intake item と learning item に分割

詳細な境界定義は [capture-boundaries](../../.opencode/skills/agentdev-workflow-lifecycle/reference/capture-boundaries.md) を参照。

## Learning Lifecycle

Learning パイプラインは、再発防止に使う知見の蓄積・分類・昇華を目的とします。

### 基本フロー

学び発生 → `learning-capture`（スキル）→ `/agentdev/learning-refine` → `/agentdev/learning-promote` → `/agentdev/req-define` に合流

### 主要 artifact

| Artifact | 役割 |
|----------|------|
| `inbox.md` | 未整理 learning entry の active queue |
| `archive.md` | 分類済み learning entry の蓄積（promote の入力） |
| `evaluation-report.md` | refine/promote 間の境界 artifact（毎回上書き） |
| `elevation-staging/` | Requirement Source stub の staging 領域 |
| `elevation-staging/archive/` | 消費済み staging stub の保管 |

### 各 artifact の詳細

#### inbox.md

| 項目 | 内容 |
|------|------|
| 役割 | 未整理の学びエントリの一時保管 |
| 生成トリガー | `agentdev-learning-capture` スキルの実行 |
| 対応コマンド | なし（スキルが直接書き込み） |
| 次に進むコマンド | `/agentdev/learning-refine` |

capture で蓄積され、refine 成功後にクリアされます。

#### archive.md

| 項目 | 内容 |
|------|------|
| 役割 | 分類済み learning entry の蓄積（promote の入力） |
| 生成トリガー | `/agentdev/learning-refine` の完了 |
| 対応コマンド | `/agentdev/learning-refine` |
| 次に進むコマンド | `/agentdev/learning-promote` |

living pool であり、終端保管ではありません。未処分・保留中・再評価対象を保持します。

#### evaluation-report.md

| 項目 | 内容 |
|------|------|
| 役割 | 最新の評価レポート |
| 生成トリガー | `/agentdev/learning-refine` の完了 |
| 対応コマンド | `/agentdev/learning-refine` |
| 次に進むコマンド | `/agentdev/learning-promote` |

refine と promote の間に位置する境界 artifact で、毎回上書きされます。

#### elevation-staging/

| 項目 | 内容 |
|------|------|
| 役割 | req-define 入力用の staging |
| 生成トリガー | `/agentdev/learning-promote` の完了 |
| 対応コマンド | `/agentdev/learning-promote` |
| 次に進むコマンド | `/agentdev/req-define`（明示入力ファイル指定） |

Requirement Source stub の staging 領域です。

#### elevation-staging/archive/

| 項目 | 内容 |
|------|------|
| 役割 | 消費済み stub の記録 |
| 生成トリガー | `/agentdev/case-close` での消費判定 |
| 対応コマンド | `/agentdev/case-close` |
| 次に進むコマンド | なし（終端状態） |

消費済み staging stub の保管先です。

## Intake Lifecycle

Intake パイプラインは、具体的な作業候補・不整合・未回収課題の収集・レビュー・促進を目的とします。

### 基本フロー

気づき・課題の発生 → `/agentdev/intake-capture` → `/agentdev/intake-review` → `/agentdev/intake-promote` → `/agentdev/req-define` または `/agentdev/intake-open`

### 主要ディレクトリ

| ディレクトリ | 役割 |
|-------------|------|
| `inbox/` | 未処理 intake item の一時保管 |
| `accepted/` | レビュー済み（採用）item の一時保管 |
| `archive/rejected/` | 却下された item の保管 |
| `promoted/req-define/` | req-define 用 artifact |
| `promoted/intake-open/` | intake-open 用 artifact |
| `archive/promoted/` | promote 済み item の保管 |

### 各ディレクトリの詳細

#### inbox/

| 項目 | 内容 |
|------|------|
| 役割 | 収集された気づき・課題の一次受け |
| 生成トリガー | `/agentdev/intake-capture` または `/agentdev/intake-from-github` |
| 対応コマンド | `/agentdev/intake-capture`, `/agentdev/intake-from-github` |
| 次に進むコマンド | `/agentdev/intake-review` |

#### accepted/

| 項目 | 内容 |
|------|------|
| 役割 | 採用確定 item の promote 待ち |
| 生成トリガー | `/agentdev/intake-review` で採用判定 |
| 対応コマンド | `/agentdev/intake-review` |
| 次に進むコマンド | `/agentdev/intake-promote` |

#### archive/rejected/

| 項目 | 内容 |
|------|------|
| 役割 | 却下 item の記録 |
| 生成トリガー | `/agentdev/intake-review` で却下判定 |
| 対応コマンド | `/agentdev/intake-review` |
| 次に進むコマンド | なし（終端状態） |

#### promoted/req-define/

| 項目 | 内容 |
|------|------|
| 役割 | req-define 入力用の整形済み artifact |
| 生成トリガー | `/agentdev/intake-promote` で req-define ルート選択 |
| 対応コマンド | `/agentdev/intake-promote` |
| 次に進むコマンド | `/agentdev/req-define`（明示入力ファイル指定） |

#### promoted/intake-open/

| 項目 | 内容 |
|------|------|
| 役割 | intake-open 入力用の整形済み artifact |
| 生成トリガー | `/agentdev/intake-promote` で intake-open ルート選択 |
| 対応コマンド | `/agentdev/intake-promote` |
| 次に進むコマンド | `/agentdev/intake-open` |

#### archive/promoted/

| 項目 | 内容 |
|------|------|
| 役割 | promote 済み item の記録 |
| 生成トリガー | `/agentdev/intake-promote` の完了 |
| 対応コマンド | `/agentdev/intake-promote` |
| 次に進むコマンド | なし（終端状態） |

## Integrity Lifecycle

Integrity パイプラインは、AgentDevFlow artifact（REQ/ADR/Skill/Command/Template）の横断的整合性検証を目的とします。

### 基本フロー

検査契機発生 → `/agentdev/integrity-check` → 検証レポート生成 → 乖離がある場合は対応コマンドへ

### 主要 artifact

| Artifact | 役割 |
|----------|------|
| `reports/` | 整合性検証レポートの出力先 |

### 各 artifact の詳細

#### reports/

| 項目 | 内容 |
|------|------|
| 役割 | 検証結果レポートの保存 |
| 生成トリガー | `/agentdev/integrity-check` の完了 |
| 対応コマンド | `/agentdev/integrity-check` |
| 次に進むコマンド | 乖離検出時: 該当コマンドで修正 → 再実行 |

REQ/ADR の frontmatter 整合性、スキル構造、コマンド定義のクロスリファレンス等を検証します。詳細な検証項目は `agentdev-integrity` スキルを参照。
