# check-test-impact の依存パッケージテスト除外（約160件）の挙動変化記録

## 観測

PR #2395 (c) により check_test_impact の SCAN_EXCLUDE_DIRS が node_modules を任意階層セグメント一致（SCAN_EXCLUDE_ANY_DEPTH_DIRS）へ変更され、走査対象から依存パッケージテスト約160件（src/opencode/skills/*/scripts/node_modules 配下、PR 2357 観測の混入）が除外された。tests_scanned の実数は実行環境の node_modules 状態に依存して変動する。

## 今回扱わない理由

設計どおりの挙動（Design test-impact-detection-gate.md の検出対象外定義と同期更新済み）であり、変更を要しない記録物のため。

## 影響

テスト影響範囲検出（REQ-019）の走査件数が環境間で安定する（依存パッケージの混入排除）。

## レビューで決めること

- なし（記録として保管）

## 根拠

- PR #2395 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2395 ）
