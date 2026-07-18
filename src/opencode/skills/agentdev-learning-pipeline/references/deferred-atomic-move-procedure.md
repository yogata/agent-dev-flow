# deferred 移動原子的操作プロシージャ

<!-- 元コマンド: learning-promote.md (Step 13-1/13-2/13-3) -->
<!-- 抽出日: 2026-07-19 (Issue #1575, 横断是正残対応) -->

learning-promote コマンドの Step 13 で実行する deferred 移動（inbox.md → deferred.md 原子的移行）の手順を定義する。
3サブステップ（追記、検証、クリア）を原子的に実行し、中断時のデータ喪失を防止する。

## 前提

- Step 12（採用済み成果物生成）が完了していること
- inbox.md、deferred.md が `agentdev-learning-pipeline` skill の「Inbox Entry Schema」に従うこと

## 手順

### Step 1: inbox.md 全エントリを deferred.md に追記

inbox.md の全エントリを deferred.md に追記する。各エントリに `**移動日**: YYYY-MM-DD` フィールドを追加する。

### Step 2: deferred.md 書込検証

deferred.md への追記が正しく完了したか、追記エントリ数をカウント照合して検証する。

### Step 3: inbox.md をヘッダーのみにクリア

Step 2 の検証成功時のみ、inbox.md をヘッダーのみにクリアする。クリア後の inbox.md 本文:

```markdown
# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---
```

## 失敗時の扱い

- Step 2（検証）失敗時 → inbox.md を変更せず、エラー内容を報告する。inbox.md のデータは保持されたままとなる
- Step 3（クリア）は Step 2 成功時のみ実行する。Step 2 失敗時に Step 3 を実行してはならない

## 各 command の参照方法

command 側（learning-promote Step 13）には以下のように参照する:

- 「`agentdev-learning-pipeline` の deferred 移動原子的操作プロシージャ（`references/deferred-atomic-move-procedure.md`）に従い、inbox.md 全エントリの deferred.md 追記、書込検証、inbox.md クリアを実行」
