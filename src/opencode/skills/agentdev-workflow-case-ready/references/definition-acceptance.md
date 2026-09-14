# Definition 受入と canonical 再取得（STEP-1 / STEP-2）

Definition PR の受入判定と merge、canonical Definition 再取得の実行時詳細である。
Definition PR lifecycle、canonical Definition の判定、backend 意味論の物理写像の正規所有は `<workflows/definition-readiness>` Design である。

## STEP-1: Definition PR 受入

### 前提の確認

- Root Case を読み込み、Definition Package の構成（要件行、Decision、Design、Issue 構成案、受入条件一式）を確認する
- Case 単位で高々1件の Draft Definition PR と、case-revise 由来の Definition Amendment PR の有無を確認する（Custom Tool `agentdev_gh` の pr_read / issue_read 経由）

### Definition PR なし分岐（実変更なし）

- canonical Definition（merge 済み main の docs 永続文書と Issue / Epic 構造）との差分が空の Case（実変更のない bugfix 等では Draft Definition PR が存在しない）では、PR を作成せず現行 main の状態を canonical Definition として採用し、STEP-2 へ進む
- 空の Definition PR を作成する経路は存在しない

### 忠実性・整合性・品質検査（Definition PR あり）

1. **忠実性確認**: req_draft の合意済み内容（agreed_items、operation_units、realization_actions、受入条件）と Definition PR の変更内容を突合し、req-define で合意済みの意味内容に対する忠実な投影であることを確認する
2. **整合性検査**: REQ / Decision / Design の相互整合と frontmatter 整合を確認する。決定的検証は `agentdev-artifact-validation` の公開検証契約へ委譲する
3. **品質検査**: Definition PR の CI 結果とリポジトリの品質検査結果を確認する

### 確定判定と merge

- 新しい意味判断を必要としない（上記3検査が pass し、合意済み意味内容からの逸脱がない）場合、追加の人間承認を要求せず Definition PR を merge する
- merge は Case 単位の Definition PR（Draft / Amendment のいずれか）に対して実行する

### HITL 停止条件

次のいずれかを検出した場合は停止し、既存 PR を保持したままユーザー判断を求める:

- 新しい Decision の作成が必要
- 合意済み意味内容の変更が必要
- 対象範囲の拡大が必要
- 意味的な不整合の解消が必要

### CI 失敗時

- Definition PR の CI / 品質検査失敗時は ready へ遷移せず、既存 PR を保持したまま停止する
- 停止理由と既存 PR 番号を報告する。修復後に case-ready を再実行する（既存 PR を再利用する）

### 冪等

- merge 済み Definition PR を再実行時に検出した場合、merge を巻き戻さず canonical Definition を基準として後続 STEP へ進む
- merge 済み PR への再 merge 要求、2件目の Definition PR 作成を行わない

## STEP-2: canonical 再取得

- merge 後（または実変更なし継続後）に canonical Definition を再取得し、以降の STEP の処理基準とする
- 再取得対象: merge 済み main の REQ / Decision / Design、Root Case、Epic 構造の確定状態
- 取得した canonical Definition と req_draft の差分を以降の投影（STEP-4）の入力として扱う。req_draft が取得不能な場合も canonical Definition だけで継続できる（req_draft は補助入力）
- 後続 STEP が失敗して再実行した場合も、merge を巻き戻さず canonical Definition を基準として再開する
