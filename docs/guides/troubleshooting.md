<!-- ADF-COVERS(implementation): REQ-052-012, REQ-008-010, REQ-008-011 -->

# トラブルシューティング

AgentDevFlowの利用でよくある問題と対処法をまとめる。

## コマンド実行関連

### コマンドが見つからない

症状: `/agentdev/xxx`を実行してもコマンドが認識されない。

確認: `.opencode/commands/agentdev/`（配置先、原本は`src/common/commands/agentdev/`）に該当コマンドファイルが存在するか確認する。

対処: コマンドファイルが欠落している場合は、リポジトリの最新状態を取得する。

### req-define で既存 REQ が参照されない

症状: 関連する既存REQがあるはずなのに、req-defineでは新規CREATEとして扱われる。

確認: `docs/requirements/`に該当REQファイルが存在するか確認する。

対処: REQファイルが存在する場合、req-defineのStep 0でセッションコンテキスト検知が正しく動作しているか確認する。
セッションに前段の情報が残っていない場合、手動で関連REQ番号を伝える。

### case-ready 後も RU が削除されない

症状: case-ready完了後もRUファイルが`.agentdev/backlog/req-units/`に残っている。

原因: 現行契約ではcase-open後のRU残置は正常であり、RUを削除する唯一の工程はcase-readyである（REQ-008-010、REQ-030-007）。case-readyのDefinition確定 + VERIFY（読み戻し検証）が失敗した場合、またはblocked / failed / 中断した場合、RUは残置される（REQ-008-011）。

対処: case-readyのVERIFY結果と実行状態を確認する。
Definition保存内容の不備（読み戻し検証の不一致、テンプレート必須セクション欠落等）を解消し、case-readyを再実行する。
case-openを再実行してもRUは削除されない。

## エンコーディング関連

### Issue/PR 本文の日本語が文字化けする

症状: GitHub上で日本語が`???`や`�`で表示される。

原因: BOM付きUTF-8でファイルが書き込まれた、またはShift-JISに変換された。

対処: GitHub I/OはCustom Tool `agentdev_gh`の操作契約経由で行う。
本文のファイル作成、エンコーディング、検証はCustom Tool内部で処理されるため、本ガイドではgh CLIの直接手順を実行しない。

### gh CLI の出力を PowerShell で受けると文字化けする

原因: PowerShellがネイティブコマンドのUTF-8出力をパイプライン経由でエンコーディング変換する。

対処: GitHub I/OはCustom Tool `agentdev_gh`の操作契約経由で行う。
Custom Toolがgh CLIの実行と出力のエンコーディングを一元管理するため、PowerShellやNode.jsからgh CLIを直接実行しない。

## ワークフロー関連

### case-run の自律修正ループが3回停止した

症状: 「3回上限超過」で自律修正が停止した。

対処: case-runのレポートから失敗項目一覧、エラーログ要約、各試行の修正内容を確認する。
要件、仕様の見直しが必要か判断し、必要に応じてreq-defineに戻る。

### 検出事項が Intake に回収されない

症状: PR本文に記録した検出事項がcase-closeで回収されない。

確認: PR本文の「Findings / Capture候補」セクションに正しく記録されているか確認する。

対処: case-closeはマージ済みPR本文の同セクションを回収する。
セクション構造に不備がある場合は手動でintake-captureに登録する。

### Epic が自動クローズされない

症状: 全子Issueが完了しているのにEpicがオープンのまま。

確認: 親Epic本文の実行構成表で、全子Issueの子状態が`completed`になっているか確認する。

対処: 子状態が`pending` / `blocked` / `failed`のままになっている子Issueがないか確認する。
case-closeが正常に完了していない場合、手動で子状態を更新する（blocked / failedからの再試行は継続条件成立と旧実行終了確認のうえpendingへ戻す）。

## 整合性関連

### docs-check で大量の検出事項が出る

対処: まず検出事項の分類と振り分け先を確認する。
`document-drift`や`broken-reference`はIntakeに登録して段階的に対応できる。
一度に全てを修正する必要はない。

### REQ 体系が複雑になりすぎている

対処: `/agentdev/inspect-docs`を実行して健全性を診断する。
推奨アクションに従ってREQの統合、分割を検討する。
