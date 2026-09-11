# docs/guides に残存する生 gh CLI 表記の正規化候補

## 観測内容

- 発生源: PR 2711（Issue 2700 / OU-005）の Findings/intake 記録を回収
- capture 元: case-close Epic Wave 1（Epic 2695、delegation DEL-CLOSE-A1）
- captured_at: 2026-09-09

verification-only PR 節の表記統一（ACT-DESIGN-004、commit ff591ef4）と同種の生 gh CLI 表記が検証対象外の場所に残存している。2026-09-11 時点の現行突合で以下の3箇所が現存を確認:

| 対象 | 現行位置 | 内容 | IR-053 スキャン |
|---|---|---|---|
| docs/designs/commands/case-close.md | L218 | `gh pr view --json mergeable,mergeStateStatus`（mergeable UNKNOWN ポーリング節） | 範囲外 |
| src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | L121 | `gh pr view --json files`（PR 変更ファイル一覧取得） | 範囲内・既存 |
| docs/designs/commands/case-run.md | L322 | `gh issue list`（対象外リスト内の言及） | 範囲外 |

補足観察（統合済み）:

- PR 2718 の Findings で qg-4-final-acceptance.md の同一箇所を再観察。同 PR マージ（7964375f）により該当行は L121 近傍へ移動済みだが、生表記自体は未修正のまま残存（同 PR のスコープ外）
- PR 2751 の Findings で integrity suite の gh-direct-invocation check が single.md の gh CLI 直接呼出記述を warning として再観察。これについては「Issue/PR 操作は Custom Tool agentdev_gh を標準とする」理由説明の文脈であり IR-053 除外候補（custom-tool-contracts.md「迂回防止」基準）として capture 時に回収対象外と判断済みのため、本成果物では取り扱わない

## 影響・課題

- 生 gh CLI 表記の残存は「Issue/PR 操作は Custom Tool agentdev_gh を標準とする」正規経路（REQ-011 系）の読者に迂回手段を含む記述として認識不整合を生む
- docs/designs（IR-053 スキャン範囲外）は機械検出対象外のため、正規化は人手整理に依存する

## 後続判断に残る選択肢

- 各3箇所を Custom Tool agentdev_gh 操作契約の表記へ正規化するか、対象外リスト内の言及（case-run.md L322）は現状維持とするか
- docs/designs 側（スキャン範囲外）を正規化対象に含めるか、IR-053 スキャン範囲拡大を別途検討するか

## 既存要件・契約との関連

- REQ-011（I/O境界と外部連携手段）、REQ-052（Custom Tool 操作契約）
- docs/designs/responsibilities/custom-tool-contracts.md「迂回防止」
