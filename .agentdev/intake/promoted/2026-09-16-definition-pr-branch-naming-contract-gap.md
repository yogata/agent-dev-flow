# Draft Definition PR のブランチ命名規約が definition-readiness Design で所有されていない

## 観測内容

case-open の Draft Definition PR 作成に必要なブランチ命名規約が `docs/designs/workflows/definition-readiness.md`（Definition PR lifecycle、canonical Definition の判定、冪等キーの正規所有者）に定義されていない。Draft Definition PR は物理的にブランチを必要とする主要成果物であるにもかかわらず、lifecycle・冪等キーと異なりブランチ命名の所有者が不在である（2026-09-16 時点で再確認: 同 Design に branch/ブランチの記述なし）。

2026-09-15 の case-open バッチ実行（Batch 1、Case #2821〜#2825、PR #2826〜#2830）では `agentdev-git-worktree` skill のブランチ名規約 `{type}/issue-{N}` から `definition/issue-{N}` を派生運用した（type=definition）。実装系ブランチ（`feature/issue-{N}`、case-run）との区別は可能だが、規約の正規所有とバッチ以降の一貫運用には Design 側の明文化が必要。

## 影響

- 以降の case-open バッチでも命名判断が毎回派生運用になり、`feature/` 同名帯との混同・命名揺れのリスクが残る

## 課題（対応候補と判断材料）

- definition-readiness Design（Draft Definition PR lifecycle 節または冪等キー節）へ Draft Definition PR のブランチ命名 `{type}/issue-{N}`（type=definition）を正規所有させる
- Definition Amendment PR（case-revise）のブランチ命名も同時に所有するかを併せて確定する

## 既存要件との関連

- definition-readiness Design: Definition PR lifecycle・冪等キーの正規所有者（今回の追加対象）
- `agentdev-git-worktree` SKILL.md のブランチ名規約 `{type}/issue-{N}`: 派生元の既存規約

## 根拠

- 観測元: case-open Batch 1 実行（Case #2821〜#2825、Draft Definition PR #2826〜#2830、ブランチ definition/issue-2821〜2825）
- 観測時 commit: 1fa44567d1b8ed8b5b7ce247ac36f45d1ecd63ef（main）
- 2026-09-16 再検証: definition-readiness.md にブランチ関連記述なし
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: 契約不在が Design 実査で確認済み）
