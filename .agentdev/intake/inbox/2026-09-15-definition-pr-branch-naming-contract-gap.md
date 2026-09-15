# Draft Definition PR のブランチ命名規約が definition-readiness Design で所有されていない

## 内容

case-open の Draft Definition PR 作成に必要なブランチ命名規約が `docs/designs/workflows/definition-readiness.md`（Definition PR lifecycle、canonical Definition の判定、冪等キーの正規所有者）に定義されていない。Draft Definition PR は物理的にブランチを必要とする主要成果物であるにもかかわらず、lifecycle・冪等キーと異なりブランチ命名の所有者が不在である。

2026-09-15 の case-open バッチ実行（Batch 1、Case #2821〜#2825、PR #2826〜#2830）では `agentdev-git-worktree` skill のブランチ名規約 `{type}/issue-{N}` から `definition/issue-{N}` を派生運用した（type=definition）。実装系ブランチ（`feature/issue-{N}`、case-run）との区別は可能だが、規約の正規所有と Batch 2 以降の一貫運用には Design 側の明文化が必要。

## 提案

definition-readiness Design（Draft Definition PR lifecycle 節または冪等キー節）へ Draft Definition PR のブランチ命名 `{type}/issue-{N}`（type=definition）を正規所有させる。Definition Amendment PR（case-revise）のブランチ命名も同時に所有するかを併せて確定する。

## 根拠

- 観測元: case-open Batch 1 実行（Case #2821〜#2825、Draft Definition PR #2826〜#2830、ブランチ definition/issue-2821〜2825）
- 観測時 commit: 1fa44567d1b8ed8b5b7ce247ac36f45d1ecd63ef（main）
- 根拠 1: docs/designs/workflows/definition-readiness.md に「ブランチ」「branch」の記述が存在しない（2026-09-15 時点、同 Design 39 行全体を確認）
- 根拠 2: src/opencode/skills/agentdev-git-worktree/SKILL.md のブランチ名規約は `{type}/issue-{N}`（例: fix/issue-516）であり、worktree 運用 skill の規約を Definition PR に転用した経緯
- 根拠 3: 既存 Case ブランチ（feature/issue-2654 等、case-run 由来）と Draft Definition PR ブランチが同名帯（feature/）を共有しないよう派生した運用判断の記録

## 分類

- 分類: intake（具体的修正対象あり: docs/designs/workflows/definition-readiness.md）
- 変更種別: docs（Design への契約追加）
- 優先度: 中（Batch 2 以降の case-open でも同一判断が必要になるため早期の正規化が望ましい）
