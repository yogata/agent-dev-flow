✅ docs-check 完了

完了コマンド: /repo/docs-check
対象: 全 command 定義 / command-local templates / integrity artifacts
結果:
  - 検証対象: {N} command 定義
  - 違反検出: {N}件
  - {違反なしの場合: 全 command 定義が command-local template を参照}
  - {違反ありの場合: 違反内容のサマリ}
report:
  - path: `.agentdev/integrity/reports/{YYYY-MM-DD}-integrity-report.md`
  - 状態: ローカル出力済み（非commit・非push、REQ-0108-229）
intake items:
  - 生成件数: {N}件
  - {1件以上の場合:}
  - items:
    - {path1}
    - {path2}
  - {0件の場合: 該当なし（NG/WARNING finding なし）}
git 永続化:
  - {intake item 作成あり・成功時: commit {hash}、push 済み（.agentdev/intake/ 配下）}
  - {intake item 未作成時: 変更なし（intake item 未作成のため）}
  - {intake item 作成あり・失敗時: 失敗Step（{Step名}）+ エラー内容}
次のコマンド:
  - {1件以上: `/agentdev/intake-promote {path1} {path2} ...`}
  - {0件: なし}
検証結果: {✅ OK / ⚠️ 注意（違反あり）}