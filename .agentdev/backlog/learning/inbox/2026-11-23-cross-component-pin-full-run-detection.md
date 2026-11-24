---
id: 2026-11-23-cross-component-pin-full-run-detection
created_at: 2026-11-23T07:50:00+09:00
source: case-close (Epic #4202 Wave-1 PR #4211 本文 Findings の回収)
status: unreviewed
---

# クロスコンポーネントピンは bun test ./src/ のフル実行でのみ検出される

- **問題事象**: PR #4211 の実装中、req-define 側の `important-change-notification-pins` テストが backlog-auto SKILL.md 本文を検査するクロスコンポーネントピンがあり、backlog-auto 本文のスリム化で重要変更ピンが欠落した変更起因 fail が発生した。当該スキル（backlog-auto）単独のテスト実行では検出されず、`bun test ./src/` のフル実行でのみ検出された（修正後再実行で 0 fail）。
- **発生局面**: SKILL.md 本文スリム化（PR #4211・REQ-125-004・2026-11-22）
- **検知方法**: bun test ./src/ フル実行の fail 一覧
- **根本原因**: ピンの検査対象とテストの配置先が異なるコンポーネントに分かれており、分割実行では検査対象側のテストが回らない
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: SKILL.md 本文編集・スリム化系の変更では、対象スキル単独テストに加えて `bun test ./src/` フル実行が必須検証経路。分割実行だけでは契約ピンがすり抜ける
- **再発条件**: クロスコンポーネントピンの存在する本文（重要変更通知ピン等）を編集し、フル実行を省いた場合に再発
- **予防策候補**: SKILL.md 本文編集を伴う変更の検証手順への「bun test ./src/ フル実行必須」の明記（既存の workflow_body_contract 系 pin テストの検出経路として）
- **想定反映先**: SKILL.md 編集を伴う作業単位の検証手順、learning-promote での RU 化判断
- **関連**: `.agentdev/learning/inbox/2026-11-23-bun-test-fail-origin-classification.md`（フル実行の別の効用）
- **タグ**: `#pin-test` `#bun-test` `#SKILL.md` `#検証経路`
