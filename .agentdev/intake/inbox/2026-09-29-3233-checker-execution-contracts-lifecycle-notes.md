# intake: checker-execution-contracts Design への記載追加候補（Case #3233 case-close Design 確定候補の見送り分）

- 観測日: 2026-09-29（case-close #3233 Capture 回収。PR #3235 本文「Design確定候補」申告 2 件の見送り評価による回収）
- 種別: 変更候補（docs/designs/integrity/checker-execution-contracts.md への記載追加。実現面変更を伴うため case-close では見送り）
- 再評価手段: req-define 変更影響分析（次回 REQ/Case）。対応記録コメント: https://github.com/yogata/agent-dev-flow/issues/3233#issuecomment-5878104337

## 候補 1: worktree checker の .opencode 状態前置確認手順

- worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」への .opencode 状態前置確認手順（実在構成の ls 実測）を、checker 実行契約（checker-execution-contracts.md）へ取り込む候補
- 由来: Case #3233 実装（worktree checker 起動形実態是正・TS-003）で worktree-operations.md 側に実装済み。I/O 境界 Design 側の checker 実行契約への記載追加が未実施

## 候補 2: IR-072 の author date 採用理由と複数日跨ぎ PR での既知限界

- check_integrity.ts IR-072 の author date（%as）採用理由（squash merge の committer date 置換 drift を避ける）と複数日跨ぎ PR での既知限界（updated 進行 commit 自身を last content-change と判定する誤検出機構）を checker-execution-contracts.md へ記載追加する候補
- 由来: Case #3233 実装（IR-072 新規作成 + frontmatter のみ変更 commit の除外判定 e7f1f639）の設計判断記録。checker 実装・回帰テストは恒久対応済み、Design 文書への記載追加が未実施
