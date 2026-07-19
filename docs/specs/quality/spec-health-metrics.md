---
title: SPEC 健全性メトリクス
status: accepted
created: 2026-06-26
updated: 2026-06-26
---

# SPEC 健全性メトリクス

SPEC の肥大化、関心ズレ、放置を定量的に検出するための閾値を定義する。
req-health-metrics.md と対となる SPEC 健全性の定量メトリクスであり、REQ/SPEC 健全性の双方向メトリクスを構成する（REQ-0155-001, REQ-0156-007）。

## 適用範囲

- **対象**: docs/specs/ 配下の SPEC ファイル（commands/, skills/, workflows/, ドメインディレクトリ配下）
- **対象外**: REQ, ADR, guides, DOC-MAP, .agentdev/ 配下のドラフト

## 測定対象と計測方法

| メトリクス | 定義 | 計測方法 |
|---|---|---|
| SPEC 行数 | SPEC ファイルの本文行数 | frontmatter、HTML コメントを除く本文行数 |
| status 放置期間 | draft status の SPEC が最終更新から現在までの日数 | frontmatter updated 日付から現在までの日数 |
| ドメイン分類適合 | SPEC が document-model.md のドメイン分類に従って配置されているか | ファイルパスと document-model.md ドメイン定義の照合 |

## 閾値とシグナル

### SPEC 行数

| SPEC 行数 | シグナル | 判定 |
|---|---|---|
| 0〜300 | +0 | 健全 |
| 301〜500 | +1 | 肥大化傾向。分割検討 |
| 501 以上 | +2 | 肥大化。分割推奨 |

### status 放置期間（draft SPEC）

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

## 他 SPEC、スキルとの関係

- **req-health-metrics.md**: REQ 健全性メトリクス。本 SPEC は SPEC 健全性メトリクスとして対をなす（REQ/SPEC 双方向メトリクス）
- **document-model.md**: ドメイン分類の定義元。本 SPEC のドメイン分類適合判定が参照する
- **integrity-rule-catalog.md IR-054**: draft SPEC 放置検出ルール。本 SPEC の放置期間閾値と連動する
- **REQ-0154**: SPEC status 追跡と draft 放置検出。本 SPEC の放置期間メトリクスと連動する

## 機械化境界

本 SPEC は閾値の定義のみを提供し、計測、判定の実装は以下が担う:

- **inspect-docs / inspect-skills**: 定期診断で本 SPEC の閾値を適用
- **case-close**: draft → accepted 昇格時に放置期間をリセット
- **生成スクリプト**（`.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`）: 本 SPEC に基づく SPEC 計測例テーブルを実ファイルから再生成する（AG-006 候補5、SC-002 Phase C）。定期実行を前提とし、計測結果を実ファイルの最新状態に追従させる

本 SPEC 自体は計測ロジックを実装しない。
閾値の変更は本 SPEC の更新をもって正とし、各実装は本 SPEC を参照する。
