# Intake / Learning / Backlog フロー

作業候補、学びの収集から RU（Requirement Unit）生成までの流れを説明する。

## 概要

AgentDevFlow には、課題を収集して要件化につなげる3段階のパイプラインがある。

```
Intake パイプライン → Backlog パイプライン → req/case パイプライン
Learning パイプライン ↗
```

- **Intake**: 具体的な修正対象が特定できる作業候補を収集する
- **Learning**: 再発防止の知見、判断ミス、手順漏れを蓄積する
- **Backlog**: 両パイプラインの採用済み成果物を RU に統合する

## Intake と Learning の境界

両パイプラインは以下の基準で振り分ける。

- 具体的な修正対象が特定できる → Intake
- 再発防止の知見、判断ミス、手順漏れ → Learning
- 両方の性質を持つ → Intake 項目と Learning 項目に分割

## Intake パイプライン

具体的な作業候補、不整合、未回収課題の収集、レビュー、採用判断を行う。

### 状態遷移

```
inbox/ → promoted/（採用 item の inbox 元ファイルは削除）
       ↘ 即時削除（reject、commit message に却下理由を記録）
```

### コマンド

| 前工程の生成物 | コマンド | 出力 |
|----------|------|------|
| ユーザー手動入力 | `/agentdev/intake-capture` | `inbox/` |
| クローズ済み Issue/PR | `/agentdev/intake-from-github` | `inbox/` |
| `inbox/` | `/agentdev/intake-promote` | `promoted/`（inbox 元ファイルは削除） |

### 各ディレクトリの役割

| ディレクトリ | 役割 |
|-------------|------|
| `inbox/` | 収集された気づき、課題の一次受け |
| `promoted/` | backlog-review 入力用の採用済み成果物 |

採用・却下いずれの判断も inbox 元ファイルは即時削除とし、監査証跡は commit message（reject の場合は却下理由を含める）で確保する。

`promoted/` はフラット構成で、ディレクトリ配置で route / status を表現する。

## Learning パイプライン

再発防止に使う知見の蓄積、分類、昇華を行う。

### 状態遷移

```
inbox.md + deferred.md → promoted/
```

### コマンド/スキル

| 前工程の生成物 | コマンド | 出力 |
|----------|------|------|
| 観測（case-run 中等） | `learning-capture`（スキル） | `inbox.md` |
| `inbox.md` + `deferred.md` | `/agentdev/learning-promote` | `promoted/` |

### 各成果物の役割

| 成果物 | 役割 |
|--------|------|
| `inbox.md` | 未整理の Learning エントリを受け溜めるキュー。`learning-capture` で蓄積し、採用判断成功後にクリアされる |
| `deferred.md` | 分類済みエントリの蓄積（継続的に再評価される living pool）。未処分、保留中、再評価対象を保持する |
| `evaluation-report.md` | 採用判断の内部フェーズで生成される一時成果物（非公開） |
| `promoted/` | 昇華判定済み成果物の配置先。フラット構造 |

### エントリ形式

13項目形式で記録する。
問題事象、発生局面、検知方法、根本原因、自律対応内容、ユーザー確認有無、ADR/REQ/spec 影響、横展開観点、再発条件、予防策候補、想定反映先、関連、タグ。

## Backlog パイプライン

Intake/Learning 両方の採用済み成果物を RU に統合する。

### コマンド

| 前工程の生成物 | コマンド | 出力 |
|----------|------|------|
| `promoted/`（intake/learning） | `/agentdev/backlog-review` | `RU-*.md` |

`/agentdev/backlog-review` は分析、統合結果をユーザーに確認（HITL：人の判断を挟む）し、承認後に直接 RU を生成する。

### RU の粒度

- N:1（複数の採用済み成果物を 1 RU に統合）可能
- 1:N（1 つの採用済み成果物を複数 RU に分割）可能
- 採用済み成果物の単純コピー（パススルー）は不可

### セッション由来 RU

チャット内でユーザーと合意形成済みの内容は、セッション由来 RU として直接 `.agentdev/backlog/req-units/` に保存できる。
RU 本文は後続工程（req-define）で必要な情報を自足し、整理済みの合意形成内容のみを保存対象とする。

## RU の削除ルール

| トリガー | 実行コマンド | 対象 |
|----------|-------------|------|
| RU の内容が Issue に永続化完了（Issue作成 + VERIFY 成功） | `/agentdev/case-open` | 該当 RU ファイル |
| 採用済み成果物の RU 化成功 | `/agentdev/backlog-review` | 該当する採用済み成果物 |

`/agentdev/req-save` は RU を残置し、RU パスを docs 永続文書の根拠参照から除外する。
RU は一時成果物であり、永続化未完了の場合は残置する。

## 矛盾検出

採用済み成果物間に矛盾が検出された場合、矛盾する成果物を RU 化せずユーザーに確認する。
矛盾しない成果物は通常通り RU 化を継続する（一部成功）。

## 状態モデル制約

AgentDevFlow のパイプライン状態はディレクトリ配置とファイルの存在で表現する（REQ-0112-023）。
frontmatter や status フィールドによる状態管理は行わず、各段階の進行はディレクトリ構造で追跡する。

- **採用済み成果物の状態表現**: ディレクトリ配置（`inbox/` → `promoted/`）が状態の表現である（REQ-0112-028）。frontmatter の route / status はディレクトリ配置で代替する
- **GitHub 状態の管理場所**: Issue / PR の open / closed / merged 状態は Issue / PR で管理する（REQ-0112-029）。REQ / SPEC / guides への複製は行わない
- **入口表は状態遷移エンジンではない**: 入口表は次に実行すべきコマンドの案内であり、状態機械の遷移表ではない（REQ-0112-030）
- **6 マイクロフェーズは説明用ラベル**: ワークフローの進行状況を人間が理解するための呼称であり、システムが管理する状態値ではない（REQ-0112-023）

## .agentdev/ の位置づけ

`.agentdev/` は AgentDevFlow の正規のドメイン状態である（REQ-0112-024）。
パイプラインの状態（Intake / Learning / Backlog / 整合性）を保持する永続領域であり、実行時配布物の一部ではない。
各コマンドは `.agentdev/` 配下の変更を scoped commit で git に永続化する。
