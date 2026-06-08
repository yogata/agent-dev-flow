✅ docs-check 完了

完了コマンド: /repo/docs-check
対象: 全 command 定義 / completion-reports.md / integrity artifacts
結果:
  - 検証対象: {N} command 定義
  - 違反検出: {N}件
  - {違反なしの場合: 全 command 定義が completion-reports.md を参照}
  - {違反ありの場合: 違反内容のサマリ}
検証結果: {✅ OK / ⚠️ 注意（違反あり）}
git 永続化:
  - {intake item 作成あり・成功時: commit {hash}、push 済み（.agentdev/intake/ 配下）}
  - {intake item 未作成時: 変更なし（intake item 未作成のため）}
  - {intake item 作成あり・失敗時: 失敗Step（{Step名}）+ エラー内容}
次のコマンド: なし

> Note: repo-local 版は `.opencode/commands/repo/templates/docs-check/standard.md` にある
> Boundary: integrity-check は repo-local コマンド (`/repo/docs-check`) のため、原本テンプレートは `.opencode/commands/repo/templates/docs-check/` にある。このファイルは agentdev 公開 namespace 内の残存（REQ-0108-187）。
