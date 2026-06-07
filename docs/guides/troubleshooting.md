# トラブルシューティング

AgentDevFlow の利用でよくある問題と対処法をまとめる。

## コマンド実行関連

### コマンドが見つからない

**症状**: `/agentdev/xxx` を実行してもコマンドが認識されない。

**確認**: `.opencode/commands/agentdev/`（runtime projection; source は `src/opencode/commands/agentdev/`）に該当コマンドファイルが存在するか確認する。

**対処**: コマンドファイルが欠落している場合は、リポジトリの最新状態を取得する。

### req-define で既存 REQ が参照されない

**症状**: 関連する既存 REQ があるはずなのに、req-define が新規 CREATE として扱う。

**確認**: `docs/requirements/` に該当 REQ ファイルが存在するか確認する。

**対処**: REQ ファイルが存在する場合、req-define の Step 0 でセッションコンテキスト検知が正しく動作しているか確認する。セッションに前段の情報が残っていない場合、手動で関連 REQ 番号を伝える。

### case-open で RU が削除されない

**症状**: Issue 作成後に RU ファイルが `.agentdev/backlog/req-units/` に残っている。

**原因**: Issue 作成後の VERIFY（読み戻し検証）が失敗した場合、RU は残置される。

**対処**: Issue 本文が正しく作成されているか確認する。エンコーディング問題やテンプレート必須セクション欠落がないか確認し、問題がなければ再度 case-open を実行する。

## エンコーディング関連

### Issue/PR 本文の日本語が文字化けする

**症状**: GitHub 上で日本語が `???` や `�` で表示される。

**原因**: BOM 付き UTF-8 でファイルが書き込まれた、または Shift-JIS に変換された。

**対処**: `agentdev-gh-cli` スキルの手順に従い、`[System.IO.File]::WriteAllText` で BOM なし UTF-8 を指定してファイル作成し、`--body-file` で指定する。PowerShell の `Out-File` や `Set-Content` は使用しない。

### gh CLI の出力を PowerShell で受けると文字化けする

**原因**: PowerShell がネイティブコマンドの UTF-8 出力をパイプライン経由でエンコーディング変換する。

**対処**: Node.js の `execSync` を使って gh CLI の出力を直接取得する。`node -e "const r=execSync('gh ...',{encoding:'utf-8'});..."` の形式。

## ワークフロー関連

### case-run の自律修正ループが3回停止した

**症状**: 「3回上限超過」で自律修正が停止した。

**対処**: case-run のレポートから失敗項目一覧・エラーログ要約・各試行の修正内容を確認する。要件・仕様の見直しが必要か判断し、必要に応じて req-define に戻る。

### Findings が intake に回収されない

**症状**: PR 本文に記録した Findings が case-close で回収されない。

**確認**: PR 本文の「Findings / Intake候補」セクションに正しく記録されているか確認する。

**対処**: case-close はマージ済み PR 本文の同セクションを回収する。セクション構造が壊れている場合は手動で intake-capture に登録する。

### Epic が自動クローズされない

**症状**: 全子 Issue が完了しているのに Epic が open のまま。

**確認**: 親 Epic 本文のステータス追跡テーブルで、全子 Issue が `✅ 完了` または `❌ 対処不要` になっているか確認する。

**対処**: ステータスが `🔄 進行中` のままになっている子 Issue がないか確認する。case-close が正常に完了していない場合、手動でステータスを更新する。

## 整合性関連

### docs-check で大量の finding が出る

**対処**: まず finding の分類と route を確認する。`document-drift` や `broken-reference` は intake に回して段階的に対応できる。一度に全てを修正する必要はない。

### REQ 体系が複雑になりすぎている

**対処**: `/agentdev/docs-review` を実行して健全性を診断する。推奨アクションに従って REQ の統合・分割を検討する。
