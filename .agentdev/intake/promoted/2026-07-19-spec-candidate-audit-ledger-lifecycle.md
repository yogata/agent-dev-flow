# 監査台帳ライフサイクル SPEC 候補（one-time 成果物の廃棄条件・タイミング）

## 観測内容

Issue #1596 で生成した監査台帳 `.agentdev/drafts/audit-ledger-governance-system-audit.md` は one-time 成果物であり、再編フェーズ完了後または自動化機構移行完了時に廃棄する運用（計画 Section 5.3 + Section 10 + CR-002）。しかし、廃棄条件・廃棄タイミングを SPEC 化した契約が存在しない。

現状:

- 計画文書（プロジェクト固有の構想）には廃棄方針が記載されている。
- 汎用的な one-time 成果物（監査台帳、照合表等）のライフサイクル（生成→廃棄）を定義した SPEC がない。
- 次回以降の監査系 Case で同様の one-time 成果物を生成する際、廃棄条件が不明確。

## 影響

one-time 成果物の廃棄条件・タイミングが属人的判断になり、トレーサビリティと再現性が担保されない。発生頻度は、監査系 Case や一時分析を行う Case で one-time 成果物を生成する都度。

## 課題

one-time 成果物（監査台帳、照合表、一時分析ファイル等）のライフサイクル（生成→廃棄）を汎用的な契約として SPEC 化する必要がある。本 Issue（#1596）の監査台帳廃棄条件（「再編フェーズ完了時 or 自動化機構移行完了時のいずれか早い方」）を汎化する形での SPEC 化を想定する。

## 既存要件・仕様との関連

- CR-002: 監査台帳の恒久性、one-time 扱いの根拠。
- `docs/specs/workflows/backlog-artifact-lifecycle.md`: 追記候補。one-time 成果物のライフサイクル定義が現状不在。

## 対応方針の方向性

one-time 成果物ライフサイクル SPEC を新設（`docs/specs/workflows/backlog-artifact-lifecycle.md` への追記、または新規 SPEC）し、以下を契約化する:

1. one-time 成果物の定義（監査台帳、照合表、一時分析ファイル等）。
2. 廃棄条件の明示（後続フェーズ完了時、自動化機構移行完了時、その他）。
3. 廃棄責務所在（case-close、専用コマンド等）。
4. 廃棄方式（git rm、`.agentdev/drafts/archived/` 移動、マーカー付与等）。
5. 廃棄記録のトレーサビリティ（issue/PR への記録、commit message 規約等）。
