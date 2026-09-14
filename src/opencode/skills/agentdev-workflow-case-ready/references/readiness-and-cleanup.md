# 検証ゲート、ready 遷移、クリーンアップ、冪等再実行（STEP-6 / STEP-7）

検証対応要否の最終ゲート、Root Case の ready 遷移、draft / RU 削除、main 同期確認、冪等再実行の実行時詳細である。

## STEP-6: 検証ゲートと ready 遷移

### 検証対応要否の最終ゲート

- 実行対象 REQ の全対象要件行について、検証対応要否の未分類がないことを確認する
- 確認は `agentdev-traceability` の check（検証対応要否分類状態の導出）を用いる。実行失敗、空結果の場合は正規成果物（対応宣言コーパスと検証対応要否カタログ）の直接読取で代替する（fail-open）。代替読取でも未分類行が特定できない場合は検出不能として報告し、ready へ遷移しない
- 対象要件行に未分類が残る場合は ready へ遷移させず、未分類行一覧と停止理由を報告する

### ready 遷移

- 実行準備条件を満たした場合のみ Root Case を ready に遷移させる
- 実行準備条件: canonical Definition 確定、Decision 受理評価完了（受理不能な proposed が残らない）、execution contract 確定、実行構造確定、検証ゲート合格
- 遷移の反映は Root Case 本文の「Case 状態と次工程」セクション更新で行う。次工程は case-run とする

## STEP-7: draft / RU 削除と同期確認

### draft / RU 削除

- 成功後に draft（`.agentdev/drafts/req-draft-*.md`）と RU（`.agentdev/backlog/req-units/RU-*.md`）を削除する
- blocked、failed、中断した場合は draft / RU を保持する
- 削除対象は明示パス指定で行い、スイープ操作（`git add -A` 等）は行わない。削除した成果物は明示パス指定で git 永続化する

### main 同期確認

- draft / RU 削除後に main ブランチの作業ディレクトリとリモートの同期を確認する
- 不一致を検出した場合は停止する（同期状況と差分を報告）

## 冪等再実行

再実行時は不足分だけを処理する:

- merge 済み Definition（Definition PR）を再利用し、merge を巻き戻さない
- 既存 Child Issue を再利用し、重複生成しない
- 既存 Wave / 依存構造を再利用し、重複確定しない
- Decision の受理記録（accepted 遷移済み）を再利用し、重複する状態遷移や承認記録を生成しない
- execution contract 確定済みの Root Case 本文は現行値を検証し、差分がある場合のみ更新する
- 冪等キーの具体形は `<workflows/definition-readiness>` Design の冪等キー節を参照する

## 完了報告

- case-ready 完了報告テンプレートに従い、結果（ready 遷移、execution contract 確定、実行構造、Definition PR merge の有無、capture 結果）を報告する
- Capture結果: 自工程で実観測した deviation を capture 委譲した場合、保存した成果物のパス・分類・保存結果を含める
- 停止時は停止理由の分類（HITL 判断事項、CI 失敗、構成不備、受理不能 Decision、未分類残存、同期不一致）と再開条件を報告する
