# req-backlog actual RU 生成検証未完了

req-backlog の対象指定・N:1/1:N 基準・矛盾構造化提示を追加した PR #438 で、actual RU 生成の検証がプロダクション実行後として保留されている。コマンド定義の要件カバレッジ確認と artifact-lifecycle.md 内容確認は完了しているが、実際の RU 生成動作が未検証。

## 根拠

- PR #438: feat(commands): req-backlog 対象指定・N:1/1:N基準・矛盾構造化提示を追加 (#437)
  - 完了条件「req-backlog 実行時の actual RU 生成検証（プロダクション実行後）」が未チェック
