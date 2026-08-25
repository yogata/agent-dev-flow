# archive-builder staging path テストの約1秒境界の時間依存揺らぎ（launcher-blockers）

## 観測

trusted-distribution-gate/launcher-blockers.test.ts「staging path is created UNDER outputRoot, never under os.tmpdir()」が間欠的に fail する。

- PR #2259（無参照テンプレート3ファイルの削除のみ）の full integrity suite 3回実行中1回のみ fail（約1000ms、他2回は pass）
- PR #2260 では単独実行で 9/0 → 8/1 → 8/1 → 8/1、clean base でも 8/1 を確認。最終 full suite 実行では pass

両 PR の変更（テンプレート削除・checker 検出語更新）との因果はなく、約1秒境界の時間依存とみられる。

## 今回扱わない理由

EU-D2（Epic 2218）Wave 1 の各 Issue スコープ外の pre-existing 挙動。両 PR の Findings に記録のみ実施。

## 影響

full integrity suite の pass/fail が実行時の負荷・タイミングで揺らぎ、N/M 件数突合や QG-4 判定のノイズになる。

## レビューで決めること

- 約1秒境界の時間依存の原因特定（タイムアウト閾値、時計のモック化等）と安定化の方針
- 再現条件（単独実行・並列負荷時の差）の整理

## 根拠

- PR 2259 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2259 ）
- PR 2260 本文「Findings / Capture候補」launcher-blockers 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2260 ）
