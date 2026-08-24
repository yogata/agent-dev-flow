---
title: Custom Tool 操作契約
status: accepted
created: 2026-08-24
updated: 2026-08-24
---

# Custom Tool 操作契約

Git / GitHub 等への構造化された副作用操作を担う Custom Tool の操作契約と失敗時動作を所有する
（REQ-052、DEC-022）。

## 操作契約の構成要素

各操作は次の外部契約のみを公開する。実装詳細（gh オプション、--body-file、UTF-8 BOM なし、
chcp、REST API PATCH、一時ファイル、PowerShell 対策等）は Tool 内部に隠蔽する。

| 要素 | 内容 |
|---|---|
| 入力 | 操作名、構造化引数（title、body、labels 等）。環境依存の引数運用規則を含まない |
| 出力 | 構造化結果（issue 番号、URL 等） |
| 保証 | 操作の結果を検証（読み戻し等）してから成功を返す |
| 失敗 | 保存または検証に失敗した場合に成功扱いとしない。エラー種別と再試験可否を返す |

## 対象操作の境界（初期セット）

GitHub I/O: issue_create、issue_read、issue_update、issue_comment、issue_close、pr_create、pr_read、
pr_merge、pr_changed_files、pr_mergeable。ツール名・公開単位・ファイル構成は本 Design の後続更新で確定する。

## ローカル版実装差し替え

ローカル版は同一の操作契約で Case ファイル読み書きを実装した Local 実装を提供する（REQ-011-006、DEC-004）。
Workflow は GitHub 版と Local 版の差を認識しない。

## 迂回防止

Plugin / Hook（tool.execute.before 等）により、生 gh WRITE 等の正規経路迂回を検出・拒否できる。
禁止範囲（読み取り系の許容等を含む）は本 Design が所有する。
