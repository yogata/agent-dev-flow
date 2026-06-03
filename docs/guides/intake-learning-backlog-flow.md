# Intake / Learning / Backlog フロー

作業候補・学びの収集から RU（Requirement Unit）生成までの流れを説明する。

## 概要

AgentDevFlow には、課題を収集して要件化につなげる3段階のパイプラインがある。

```
Intake パイプライン → Backlog パイプライン → req/case パイプライン
Learning パイプライン ↗
```

- **Intake**: 具体的な修正対象が特定できる作業候補を収集する
- **Learning**: 再発防止の知見・判断ミス・手順漏れを蓄積する
- **Backlog**: 両パイプラインの promoted artifact を RU に統合する

## Intake と Learning の境界

両パイプラインは以下の基準で振り分ける。

- 具体的な修正対象が特定できる → Intake
- 再発防止の知見・判断ミス・手順漏れ → Learning
- 両方の性質を持つ → intake item と learning item に分割

## Intake パイプライン

具体的な作業候補・不整合・未回収課題の収集・レビュー・促進を行う。

### 状態遷移

```
inbox/ → accepted/ → promoted/
              ↘ archive/rejected/
promoted/ → archive/promoted/
```

### コマンド

| 前工程の生成物 | コマンド | 出力 |
|----------|------|------|
| ユーザー手動入力 | `intake-capture` | `inbox/` |
| クローズ済み Issue/PR | `intake-from-github` | `inbox/` |
| `inbox/` | `intake-review` | `accepted/` / `archive/` |
| `accepted/` | `intake-promote` | `promoted/` |

### 各ディレクトリの役割

| ディレクトリ | 役割 |
|-------------|------|
| `inbox/` | 収集された気づき・課題の一次受け |
| `accepted/` | 採用確定 item の promote 待ち |
| `archive/rejected/` | 却下 item の記録（終端状態） |
| `promoted/` | backlog-review 入力用の promoted artifact |
| `archive/promoted/` | promote 済み item の記録（終端状態） |

`promoted/` はフラット構造で、frontmatter を持たない。route / status はディレクトリ配置で表現する。

## Learning パイプライン

再発防止に使う知見の蓄積・分類・昇華を行う。

### 状態遷移

```
inbox.md → archive/active.md → promoted/
               ↘ evaluation-report.md ↗
```

### コマンド/スキル

| 前工程の生成物 | コマンド | 出力 |
|----------|------|------|
| 観測（case-run 中等） | `learning-capture`（スキル） | `inbox.md` |
| `inbox.md` + `archive/active.md` | `learning-refine` | `evaluation-report.md` |
| `evaluation-report.md` + `archive/` | `learning-promote` | `promoted/` |

### 各成果物の役割

| 成果物 | 役割 |
|--------|------|
| `inbox.md` | 未整理 learning entry の active queue。capture で蓄積し、refine 成功後にクリアされる |
| `archive/active.md` | 分類済み entry の蓄積（living pool）。未処分・保留中・再評価対象を保持する |
| `evaluation-report.md` | refine/promote 間の境界 artifact。毎回上書きされる |
| `promoted/` | 昇華判定済み artifact の配置先。フラット構造 |

### エントリ形式

13項目形式で記録する。問題事象、発生局面、検知方法、根本原因、自律対応内容、ユーザー確認有無、ADR/REQ/spec 影響、横展開観点、再発条件、予防策候補、想定反映先、関連、タグ。

## Backlog パイプライン

intake/learning 両方の promoted artifact を RU に統合する。

### コマンド

| 前工程の生成物 | コマンド | 出力 |
|----------|------|------|
| `promoted/`（intake/learning） | `backlog-review` | review draft |
| review draft | `backlog-save` | `RU-*.md` |

`backlog-review` は分析・統合結果をユーザーに確認（HITL）する。`backlog-save` は RU を生成し、元の promoted artifact を削除する。

### RU の粒度

- N:1（複数 promoted artifact を 1 RU に統合）可能
- 1:N（1 promoted artifact を複数 RU に分割）可能
- promoted artifact の単純コピー（パススルー）は不可

### session-sourced RU

チャット内でユーザーと合意形成済みの内容は、session-sourced RU として直接 `.agentdev/backlog/req-units/` に保存できる。RU 本文は後続工程（req-define）で必要な情報を自足し、未合意・未整理・採否未確定の内容は保存しない。

## RU の削除ルール

| トリガー | 実行コマンド | 対象 |
|----------|-------------|------|
| RU の内容が Issue に永続化完了（Issue作成 + VERIFY 成功） | `case-open` | 該当 RU ファイル |
| promoted artifact の RU 化成功 | `backlog-save` | 該当 promoted artifact |

`req-save` は RU を削除せず、RU パスを docs 永続文書に記録しない。RU は一時成果物であり、永続化未完了の場合は残置する。

## 矛盾検出

promoted artifact 間に矛盾が検出された場合、矛盾する artifact を RU 化せずユーザーに確認する。矛盾しない artifact は通常通り RU 化を継続する（partial success）。
