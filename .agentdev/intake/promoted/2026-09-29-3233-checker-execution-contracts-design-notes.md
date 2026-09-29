# checker 実行契約 Design への記載追加候補（worktree .opencode 前置確認・IR-072 author date 設計判断）

- 元 item: .agentdev/intake/inbox/2026-09-29-3233-checker-execution-contracts-lifecycle-notes.md
- 観測元: case-close #3233（PR #3235）Capture 回収。PR 本文「Design確定候補」申告2件の見送り評価による回収
- 種別: 変更候補（docs/designs/integrity/checker-execution-contracts.md への記載追加。実現面変更を伴うため case-close では見送り）
- 対応記録: https://github.com/yogata/agent-dev-flow/issues/3233#issuecomment-5878104337

## 課題（記載追加候補 2件）

### 候補 1: worktree checker の .opencode 状態前置確認手順の実行契約への取り込み

- worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」に実装済みの .opencode 状態前置確認手順（実在構成の ls 実測）を、checker 実行契約（checker-execution-contracts.md）へ取り込む候補
- 由来: Case #3233 実装（worktree checker 起動形実態是正・TS-003）。I/O 境界 Design 側の checker 実行契約への記載追加が未実施

### 候補 2: IR-072 の author date 採用理由と複数日跨ぎ PR での既知限界

- check_integrity.ts IR-072 の author date（%as）採用理由（squash merge の committer date 置換 drift を避ける）と複数日跨ぎ PR での既知限界（updated 進行 commit 自身を last content-change と判定する誤検出機構）を checker-execution-contracts.md へ記載追加する候補
- 由来: Case #3233 実装（IR-072 新規作成 + frontmatter のみ変更 commit の除外判定 e7f1f639）の設計判断記録。checker 実装・回帰テストは恒久対応済み、Design 文書への記載追加が未実施

## 既存知識との関連

- learning deferred に同一事象の知見記録あり（2026-09-30 learning-promote 移動分 e3: 「git 履歴依存 checker（IR-072 等）の実測結果は commit 前後で変化し得る」— backlog-review での合流判定対象として相互参照済み）
- 検証記録の実測局面明示の要件は REQ-032-030（QG-4 checker 実測手順の merge 直前 HEAD 実施規定）が関連

## 制約（review A-1）

- 候補 1 の取り込みにあたっては、Design（実行契約の正）と配布skill reference（worktree-operations.md・運用手順）の役割分担・単一情報源の考慮を req-define の変更影響分析で確認すること

## route 提示（backlog-review 判断用）

- req-define 変更影響分析による checker-execution-contracts.md（docs/designs/integrity/）への記載追加。REQ 変更の要否は Design 記載追加の性質上 req-define で確定
