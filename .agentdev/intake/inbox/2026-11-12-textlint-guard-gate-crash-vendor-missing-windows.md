# agentdev-textlint-guard gate 本体が vendor 未生成環境の Windows で crash（exit 3221226505）し得る事象の fail-closed 案内経路との整合観察

## 観測事実

- Case #4005（PR #4020 本文 Findings/intake 候補）で記録。textlint-guard gate（`bun src/opencode/plugins/agentdev-textlint-guard/gate.ts --root .`）は vendor 未生成の環境で Windows crash（exit 3221226505）し得る。vendor 生成後の再実行で exit 0 を記録（crash 分の証跡 `textlint-final.exit` は PR #4020 証拠退避に保持）。
- 既存 intake（2026-11-11-textlint-guard-distribution-tests-vendor-state-fails.md）が記録するのはテスト側の vendor 依存 failure であり、本 item は gate 本体（実行経路）の crash 事象。テストの fail-closed 停止と案内は機能しているが、gate 本体の crash は非ゼロ終了コードとして案内経路と整合するかの要観察事象。

## 処置候補

- vendor 未生成時の gate 本体の起動検査（crash 前の fail-closed 停止と導入手順案内）の追加要否を promote 判断で評価する。導入形態ごとの実行場所は plugin README「導入時の依存生成手順」を参照先とする。

## 関連

- Case #4005・PR #4020（検証差分 #11・補足節）・agentdev-textlint-guard plugin README・2026-11-11-textlint-guard-distribution-tests-vendor-state-fails.md（テスト側の別観点・promote 時に突合）
