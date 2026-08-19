---
title: Design 健全性メトリクス
status: accepted
created: 2026-06-26
updated: 2026-08-20
---

# Design 健全性メトリクス

Design の肥大化、関心ズレ、放置を定量的に検出するための閾値を定義する。
req-health-metrics.md と対となる Design 健全性の定量メトリクスであり、REQ/Design 健全性の双方向メトリクスを構成する（v2:REQ-0155-001, REQ-001-007）。

## 適用範囲

- **対象**: docs/designs/ 配下の Design ファイル（commands/, skills/, workflows/, ドメインディレクトリ配下）
- **対象外**: REQ, Decision, guides, Report（docs/reports/）, .agentdev/ 配下のドラフト

## 測定対象と計測方法

| メトリクス | 定義 | 計測方法 |
|---|---|---|
| Design行数 | Designファイルの人手管理本文行数 | frontmatter、HTMLコメントを除外して計測する |
| status放置期間 | draft状態のDesignが最終更新から経過した日数 | frontmatter `updated`から算出する |
| ドメイン分類適合 | Designが文書モデルの配置規則へ適合するか | ファイルパスとドメイン定義を照合する |

## 閾値とシグナル

### Design 行数

| Design 行数 | シグナル | 判定 |
|---|---|---|
| 0〜300 | +0 | 健全 |
| 301〜500 | +1 | 肥大化傾向。分割検討 |
| 501 以上 | +2 | 肥大化。分割推奨 |

### status 放置期間（draft Design）

| 放置期間 | シグナル | 判定 |
|---|---|---|
| 0〜30 日 | +0 | 健全 |
| 31〜90 日 | +1 | 放置傾向。case-close での昇格を促進 |
| 91 日以上 | +2 | 放置。IR-054 対象 |

### ドメイン分類適合

| 状態 | シグナル | 判定 |
|---|---|---|
| ドメイン分類に適合 | +0 | 健全 |
| ドメイン未分類（直下残留） | +1 | 分類候補。inspect/backlog で移送検討 |

## Design 計測例の運用

Design 計測例（全 Design の行数・status・ドメイン分類の表）は Design 文書へ永続化しない。
再計算可能な実測値であるため、必要時に実ファイルから算出する（REQ-001-003、RU-0001 AG-002）。
計測の実行は `/repo/docs-check`（repo-agentdev-integrity）が担い、結果は検証レポートとして出力する。

## 他 Design、スキルとの関係

- **req-health-metrics.md**: REQ 健全性メトリクス。本 Design は Design 健全性メトリクスとして対をなす（REQ/Design 双方向メトリクス）
- **document-model.md**: ドメイン分類の定義元。本 Design のドメイン分類適合判定が参照する
- **integrity-rule-catalog.md IR-054**: draft Design 放置検出ルール。本 Design の放置期間閾値と連動する
- **REQ-001**: Design status 追跡と draft 放置検出。本 Design の放置期間メトリクスと連動する

## 機械化境界

本 Design は閾値の定義のみを提供し、計測、判定の実装は以下が担う:

- **inspect-docs / inspect-skills**: 定期診断で本 Design の閾値を適用
- **case-close**: draft → accepted 昇格時に放置期間をリセット
- **/repo/docs-check**（`.opencode/skills/repo-agentdev-integrity/`）: 計測を必要時に実ファイルから実行する

本 Design 自体は計測ロジックを実装しない。
閾値の変更は本 Design の更新をもって正とし、各実装は本 Design を参照する。

## Design 横断診断

Design 健全性診断は行数・status・配置に基づく次の検出パターンを適用する（REQ-001）。

### 検出パターン

| パターン | 内容 |
|---|---|
| 実装/履歴混入 | Design に実装計画、マイルストーン、完了履歴、監査結果、実測値が混入（REQ-001-003、REQ-001-060 違反） |
| REQ 規範重複 | Design 記述が REQ 要件と重複 |
| Report 混入 | 監査・評価・観測記録が Design 配下に存在（REQ-001-065 違反） |

### 機械化境界

上記検出パターンの機械判定可能範囲（Report 配下への監査記録分離確認、行数計測等）は docs-check が担う。
文脈解釈を要する判定（REQ 規範重複等）は inspect-docs / `agentdev-doc-writing` が担う（3層検出構造、REQ-036-008）。
本 Design は検出パターンの定義のみを提供し、各実装を規定しない。