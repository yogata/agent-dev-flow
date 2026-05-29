# commands_e2e.test.ts の stale intake-open 参照

## 観測
`.opencode/commands/agentdev/tests/commands_e2e.test.ts` に削除済み `intake-open` コマンドへの参照が7件残存している。パイプライン定義・テストケース・テンプレート期待値の箇所。

## 今回扱わない理由
Epic #421 (REQ-0039) の対象範囲はコマンド定義・スキル・ドキュメントであり、テストコードは含まれていなかった。REQ-0039 Section F (REQ-0039-023~025) は reference ファイルが対象。

## 影響
テスト実行時に該当箇所が失敗する可能性がある。現在テストが実行されていないため即時影響はないが、将来のテスト有効化時にブロックされる。

## レビューで決めること
- intake-open 参照を req-backlog ベースに更新するか、あるいは該当テストケース自体を削除・再設計するか
- テストの実行・保守を今後行うかどうかの判断

## 根拠
- Oracle 再検証 (Epic #421 post-implementation review) で検出
- Epic #421 で intake-open.md コマンドとテンプレート2件を削除済み (PR #429)
