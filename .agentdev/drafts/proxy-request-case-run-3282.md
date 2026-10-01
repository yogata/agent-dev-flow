# proxy-request-3282（Case #3278 合意・外側 Supervisor write-proxy 運用）

- adf_delegation: DEL-3282-1
- 対象 Case: #3278（Root Case）/ Epic #3280 Wave 2-1
- 対象 Issue: #3282
- 発生事象: agentdev_gh pr_create が gh exit 66（serve 全体劣化）で2回失敗（初回 + プロトコル許容の追試行1回）。反復リトライ禁止に従い本 proxy package へ切替。

## exact operation

- operation: `pr_create`（Custom Tool `agentdev_gh`）

## 引数

- title: `Wave 2: RA-003 正典REQ行の語彙・参照横断更新 + README索引・AUTOGEN更新（Case #3278 OU-002）`
- base: `main`
- head: `docs/issue-3282`
- body: `pr-body-3282.md` の全文（同ディレクトリ・UTF-8 BOM なし）

## 事前条件

1. head `docs/issue-3282` を持つ open PR が存在しないこと（二重起票防止）
2. head ブランチの先頭 commit が実装 commit `5cbd7317` であること（origin push 済み。full hash は `git rev-parse docs/issue-3282` で確認）
3. base `main` に対する変更ファイルが次の10ファイルであること:
   - docs/designs/workflows/v4-delegation-contracts.md
   - docs/requirements/REQ-005.md
   - docs/requirements/REQ-006.md
   - docs/requirements/REQ-031.md
   - docs/requirements/REQ-034.md
   - docs/requirements/REQ-036.md
   - docs/requirements/REQ-037.md
   - docs/requirements/REQ-038.md
   - docs/requirements/REQ-041.md
   - docs/requirements/REQ-061.md

## read-back 期待値（pr_create 成功判定）

- state: `OPEN`
- head: `docs/issue-3282`（先頭 commit `5cbd7317` と一致）
- changed files: 10件（上記事前条件3のファイル集合と一致）
- body が次のセクションを含むこと: `実行識別情報` / `検証差分` / `完了条件との対応` / `adversarial-review 発動記録` / `Design確定候補` / `Findings / Capture候補`
- title が引数 title と一致

## 実行後の取扱い

- pr_create 成功後、本 package と `pr-body-3282.md` は処理完了時に削除してよい（Case #3278 の proxy package 消費後削除前例: ec762dc5）
- gh serve 全体劣化の回復後に外側 Supervisor が本要求を exact operation どおり実行する
