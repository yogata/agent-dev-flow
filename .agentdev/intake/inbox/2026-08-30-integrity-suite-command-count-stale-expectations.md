# integrity suite のコマンド数期待値定数の陳腐化（COMMAND_COUNT / public_commands 期待 18 に対する実 19）

## 観測

integrity suite の既知欠陥 6 件（baseline 60715d99 起因、Epic #2465 Wave2-a の OU-006（PR #2476）の QG-4 フル suite 由来分類で判定）のうち、commands_e2e.test.ts の COMMAND_COUNT 期待値 18 と実態 19 の陳腐化（third-party-sync コマンド追加時にテスト定数が未更新）および check_workflow_preventive.test.ts の public_commands 期待 18 に対する実 19 が含まれる。次回コマンド追加 PR でも同様の fail を生むため、テスト定数の更新または動的化の候補。

## 今回扱わない理由

既知欠陥の是正は OU-006（Issue #2471、決定的破損検査クラス実装）の対象範囲外。テスト定数の更新と動的化の選択は repo-agentdev-integrity 側の判断事項。

## 影響

integrity suite に恒常 fail 2 件（COMMAND_COUNT、public_commands 関連）が残存し、新規 fail の見極めコストが増大する。

## レビューで決めること

- COMMAND_COUNT / public_commands 期待値を 19 へ更新するか、コマンド定義数の動的カウントへ変更するか
- コマンド追加を含む PR の必須更新リストへの組入れ要否

## 根拠

- PR #2476 本文「Findings / Capture候補」intake、「テスト結果」節の fail 由来分類表（回収元: https://github.com/yogata/agent-dev-flow/pull/2476 ）
