# Definition 受入と canonical 再取得（STEP-1 / STEP-2）

Definition PR の受入判定と merge、canonical Definition 再取得の実行時詳細である。
Definition PR lifecycle、canonical Definition の判定、backend 意味論の物理写像の正規所有は case-open / case-ready Design である。

## STEP-1: Definition PR 受入

### 前提の確認

- Root Case を読み込み、Definition Package の構成（要件行、Decision、Design、Issue 構成案、受入条件一式）を確認する
- Case 単位で高々1件の Definition PR と、case-revise 由来の Definition Amendment PR の有無を確認する（Custom Tool `agentdev_gh` の pr_read / issue_read 経由）

### Definition PR なし分岐（実変更なし）

- canonical Definition（merge 済み main の docs 永続文書と Issue / Epic 構造）との差分が空の Case（実変更のない bugfix 等では Definition PR が存在しない）では、PR を作成せず現行 main の状態を canonical Definition として採用し、STEP-2 へ進む
- 空の Definition PR を作成する経路は存在しない

### 忠実性・整合性・品質検査（Definition PR あり）

1. **忠実性確認**: req_draft の合意済み内容（agreed_items、operation_units、realization_actions、受入条件）と Definition PR の変更内容を突合し、req-define で合意済みの意味内容に対する忠実な投影であることを確認する。判断方法: 閉じた意味評価（合意済み内容と変更内容の突合。事実・判断基準・結果空間〔忠実/非忠実〕は評価前に限定）。確定権限: 正規契約（合意済み内容）からの導出。人間に留保された判断（REQ-{NNNN}-{NNN}）を新規に確定しない
2. **整合性検査**: REQ / Decision / Design の相互整合と frontmatter 整合を確認する。決定的検証は `agentdev-artifact-validation` の公開検証契約へ委譲する。判断方法: 決定的処理（機械検証へ委譲）。確定権限: 正規契約からの導出
3. **品質検査**: Definition PR の CI 結果とリポジトリの品質検査結果を確認する。判断方法: 決定的処理（機械的証拠の突合）。確定権限: 正規契約からの導出

### merge 前の isDraft 確認（STEP-1 の正規経路）

merge 実行前に、Custom Tool `agentdev_gh` の pr_read で対象 PR の isDraft を確認する（REQ-{NNNN}-{NNN}）。

- **isDraft: false（通常 Pull Request）**: 3検査 pass を前提に pr_merge へ進む。確認位置は merge 実行より前でなければならない
- **isDraft: true（GitHub Draft PR）**: pr_merge を実行せず、blocked で停止する。停止理由には「GitHub Draft PR が正規 lifecycle 外であり merge 不可」であることを識別可能な情報（対象 PR 番号を含む）を記録する。GitHub Draft PR は外部変更・既存成果物・旧版由来を含む正規 lifecycle 外の異常状態として扱う
- **復旧操作の不在**: isDraft: true による blocked 時に、pr_ready 相当操作、draft 解除（ready 化）の自動実行、raw gh WRITE による復旧は存在しない。操作カタログへ draft 解除操作を追加しない。停止理由の報告後、ユーザー判断を求めて停止する

### 確定判定と merge

- merge 前の isDraft 確認（上記）で isDraft: false を確認した後、人間に留保された判断（REQ-{NNNN}-{NNN}）の新規確定が不要で、既存の正規契約から導出できる解消と委譲された裁量の範囲内の判断である（上記3検査が pass し、合意済み意味内容からの逸脱がない）場合、追加の人間承認を要求せず Definition PR を merge する
- merge は Case 単位の Definition PR（Definition / Amendment のいずれか）に対して実行する

### HITL 停止条件

当該判断が人間に留保された判断（REQ-{NNNN}-{NNN}）を新規に確定する必要がある場合、または既存の安全境界が要求する操作承認を要する場合は停止し、既存 PR を保持したままユーザー判断を求める。

人間判断への移送の判定は、語の使用（新しい Decision の作成、合意済み意味内容の変更、対象範囲の拡大、意味的な不整合の解消）だけで行わず、REQ-{NNNN}-{NNN} の留保事項（新しい目的、価値、優先順位、対象範囲、外部契約、受け入れ条件、恒久規範、または既存正規契約だけでは解決不能な規範間の優先関係の確定）への該当性で行う。判断の難易度、確信度、評価器間の不一致、結果状態、唯一解でないことだけを理由として人間判断へ移送しない。停止理由は REQ-{NNNN}-{NNN} の原因分類へ対応させる

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

### traceability check の機械実行と case-open 差し戻し

canonical 再取得時に、`agentdev-traceability` の check を対象 Case の要件行について機械実行する。

- **機械実行**: 対象は canonical Definition（merge 済み main の docs 永続文書）である。手動判断（記録を伴わない裁量判断）で代替しない。traceability 能力の不在、実行失敗、空結果時は README 索引、正規成果物の直接読取等の代替手段で継続する（fail-open）
- **missing-design / policy 不正検出時の差し戻し**: missing-design（Design 対応 0 件の要件行）または verification policy の不正を検出した場合は case-open へ差し戻す。差し戻し時は ready へ遷移せず停止し、検出された該当行一覧と停止理由を報告する。case-open 側は Definition Package 生成時のトレーサビリティポリシー追随確認の漏れ解消を Definition 経由で行う。既存 merge は巻き戻さない
- **トレーサビリティ完全性ゲート所有の維持（二重定義なし）**: トレーサビリティ完全性ゲート（Design 対応・トレーサビリティポリシー有効性の確認、STEP-6）は引き続き case-ready が所有する。STEP-2 の本検査は canonical 再取得時点での確認であり、完全性ゲートを二重定義しない。required 行の verification 対応欠落（missing-verification）は ready 拒否条件に含めない（case-run の対応作成・更新と case-close の QG-4 最終完全性検査が所有する）
