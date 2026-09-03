# intake-from-github ガードレールの GitHub I/O 表記混在（gh CLI 直記述と agentdev_gh 経由表記）

## 観測

PR #2539（Issue #2538）の case-run で、`intake-from-github.md` ガードレールの「GitHub Issue/PR のデータ取得は `gh` CLI のみ使用」という記述と、他 command の Custom Tool `agentdev_gh` 経由表記が混在していることを検出した。

## 今回扱わない理由

GitHub I/O 手段の表記統一は文意変更を伴い、文章品質是正の意味保持契約（REQ-053-013）の範囲を超えるため本次では触れなかった（PR #2539 本文に記録済み）。

## 影響

配布 command 間で GitHub I/O の実行手段（gh CLI 直接 / Custom Tool `agentdev_gh` 経由）の表記が不整合になり、読み手が正しい実行手段を誤認する可能性がある。

## レビューで決めること

- 表記統一の方向（Custom Tool 経由へ寄せるか、gh CLI 記述を正当化するか）
- REQ-011（I/O 境界と外部連携手段）/ REQ-052（Custom Tool・Plugin/Hook の種別契約と配布境界）との整合判断

## 根拠

- PR #2539 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2539 ）
