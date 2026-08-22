# archive-builder テストの trust-archive-verify-* 一時ディレクトリ並行衝突による不安定さ

## 観測

archive-builder テスト（same-filesystem staging）が trust-archive-verify-* 一時ディレクトリの並行テスト間衝突により不安定である。

- Issue #2380 の検証環境では 1 実行目 fail、2 実行目 pass を観測

## 今回扱わない理由

Issue #2380（OU-002）の検証対象外のテスト基盤の挙動。テスト分離の改善は独立した作業である。

## 影響

フル suite の実行順・並列度により pass/fail が揺らぎ、N/M 件数突合や QG-4 判定のノイズになる。

## レビューで決めること

- trust-archive-verify-* 一時ディレクトリのテスト毎の一意化（suffix 付与等）による分離改善
- 既存 intake 項目 2026-08-19-archive-builder-staging-test-timing-flaky.md（約1秒境界の時間依存揺らぎ）と同根の可能性があり、統合評価とすべきか

## 根拠

- PR #2390 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2390 ）
- .agentdev/intake/inbox/2026-08-19-archive-builder-staging-test-timing-flaky.md
