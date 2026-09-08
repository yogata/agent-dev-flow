# implementation 対応宣言の正規配置先と宣言様式の確定

## 観測内容

配布物本文中の concrete REQ 行 ID inline 記載排除（REQ-057-019）について、当該是正の implementation 対応宣言（ADF-COVERS）が docs 配下の正規成果物に未配置である。配布物側は対応宣言を置けないため、配置先の可否判断が必要である。宣言欠落行は repo 全体で多数存在する既存状態（漸進モデル）の一部であり、REQ-008-060 等も同状態である。traceability check は REQ-057-019 を verification-present として完了阻害なしと判定済み（implementation 宣言は agentdev-skill-authoring Design に既存存在）。

## 影響

- 配布物是正系の変更が implementation 宣言欠落のまま扱われ、トレーサビリティの実装対応網に網羅穴が残る
- 漸進モデルの運用が暗黙前提となり、宣言配置の判断が case-close 時に都度迷子になる

## 変更候補

- implementation 対応宣言の配置先となる正規成果物（例: `docs/designs/integrity/distribution-boundary.md`）と宣言様式（REQ-002-027 準拠）を確定する
- 宣言欠落行が多数存在する既存状態の扱い（漸進モデルの維持 or 一括是正）を backlog 側で判断する

## 既存要件・成果物との関連

- REQ-057-019（配布物 concrete REQ 行 ID 排除の要件行）
- `docs/designs/skills/agentdev-skill-authoring.md`（REQ-057-019 の implementation 宣言既存配置先）
- `docs/designs/skills/agentdev-doc-writing.md`（REQ-057-019 の verification 宣言既存配置先）
- REQ-002-027（宣言様式の準拠候補）
- intake promoted 成果物「traceability-bare-parent-id-handling」と同領域（traceability 実行前提の明示化）。backlog-review での統合・分離判定候補

## 出所

- 元 intake item: `2026-09-07-req-057-019-implementation-declaration-placement-candidate-2664.md`（PR #2677 Findings/Capture候補由来、Issue #2664・Epic #2653 Wave 1）
