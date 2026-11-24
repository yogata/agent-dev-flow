---
title: 工程別タイムスタンプ計測と Phase 0 commit スコープ設計運用
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-auto.md から参照される詳細仕様（遅延読み込み）。 -->

# 工程別タイムスタンプ計測と Phase 0 commit スコープ設計運用

## 工程別タイムスタンプ計測と対象別・stage 別観測証跡（L1: case-auto）（REQ-003-028、REQ-034-045）

case-auto は各工程（case-open / case-ready / case-revise / case-run / case-close）の委譲起動前後にタイムスタンプを記録し、工程別の壁時計時間を完了報告に含める。
現行の開始、終了時刻記録（REQ-034-023/083）を工程別内訳へ拡張する。

- 計測単位: 委譲起動前後の壁時計時刻（JST、REQ-034-023 の時刻形式に準拠）
- 対象別・stage 別観測証跡（REQ-034-045）: 完了報告に対象別・stage 別の起動時刻、完了時刻、識別情報（adf_delegation_id 等の既存発行型委譲識別子、bg task ID、Issue status 遷移記録を含む等価な観測証跡）を含め、並列実行の overlap と stage 間の全対象収束（fan-in）を実測で検証できるようにする（overlap 検証の判定対象は当該 stage 開始時に実行可能な対象が2以上である場合）。時刻は親（case-auto）の観測時刻を一次とし子側報告時刻は補助として区別する。REQ-034-028 に従い同期逐次実行へ切替えずに停止した場合は、当該実行の起動試行履歴（試行回数、起動成立数、最終成功起動時刻）を停止報告に含める。観測証跡の記録形式と永続化の詳細は本 Design が所有し、本契約は採用後に起動した対象に適用し既存起動へ遡及適用しない
- 記録先: case-auto 完了報告への工程別内訳追記。永続化は必要になった段階で別途検討
- 対象外: 委譲先内部メトリクス（L3）は harness 依存が強すぎるため対象外（REQ-003-010）。case-run 内の L2 計測は case-run result に含まれる（REQ-003-009、REQ-031-017）

## Phase 0 commit スコープ設計運用

Phase 0（枝PR作成フェーズ）の commit スコープ設計運用を明示する。
Phase 0 は case-ready / case-revise で確定した Definition をコミットし、枝PR を作成するフェーズである。
本節は Phase 0 の commit 構成と、後続する case-run（実装フェーズ）の委譲内 commit に適用するスコープ設計運用を規定する。
case-run Design（`docs/designs/commands/case-run.md`）の同名節と整合する内容を維持する（OU-013a / OU-013b）。

### 孫 Issue 間 Design スコープ交差時の扱い

Phase 0 で複数孫 Issue（Epic Wave 内の子Issue、または並列 execution_unit 内の個別 Issue）の実装が同一 Design ファイルに触れる場合の扱いを以下で規定する。

**Design 本文修正の非許容**: 孫 Issue の test strategy が `on_failure: fix-and-reverify` を指示する場合でも、Phase 0 の case-run 委譲内で Design 本文（`docs/designs/**`）を修正しない。
Phase 0 の Design 成果物は既に case-ready / case-revise 工程で確定済みであり、case-run 委譲内で再修正すると定義層の一貫性が損なわれる。
Design 修正が必要と判明した場合は `record-in-findings` で PR 本文の `## Design確定候補` セクションへ記録し、case-close の docs 検証における Design 確定チェックへ引き継ぐ（`agentdev-case-run-execution-adapter` SKILL の Design確定候補配置契約に従う）。

**target_area の重複判定と並列制御**:

- 同一 Design ファイルの異なる target_area を複数孫 Issue が編集する場合: git diff が競合しないため並列マージを許容する。並列判定軸は REQ-034-013 の連結成分ベースに従い、ファイル衝突（L2）は並列許容、PR マージコンフリクトは後続 PR の rebase で解決する
- 同一 Design ファイルの同一 target_area を複数孫 Issue が編集する場合: case-open 構成生成時に必須依存（depends_on）として連結させ、直列化する。Wave 構成で同一 Wave へ割り当てない

### ドメイン state 更新と成果物変更の同一コミット混在

Phase 0 の枝PR に含まれるコミット構成運用を規定する。
原則として **2分割運用** を採用し、ドメイン state 更新と成果物変更を同一コミットへ混在させない。

**対象ディレクトリ**:

- 成果物変更: `docs/`、`src/opencode/`、`src/common/tools/agentdev-gh/local/` 等、配布対象の永続状態
- ドメイン state 更新: `.agentdev/` 配下（intake、learning、drafts、cases 等のケース固有の一時状態）

**2分割運用の理由**:

- 永続性の違い: 成果物は配布対象の永続状態、ドメイン state はケース固有の一時状態。同一コミットに混在すると revert、cherry-pick の単位が曖昧になる
- レビュー単位の分離: 成果物変更は Design 品質査読の対象、ドメイン state はキャプチャ境界（intake/learning）の対象。査読観点が異なるため分離する
- capture 境界の遵守: `.agentdev/backlog/intake/`、`.agentdev/backlog/learning/` の直接編集は case-run 委譲内では禁止（委譲内の対象外制約、`agentdev-case-run-execution-adapter` SKILL）。実行担当サブエージェントは PR 本文の `## Findings / Capture候補` へ記録し、case-close が intake/learning pipeline へ引き継ぐ。よって case-run 委譲内でドメイン state をコミットへ含めることは原則として発生しない

**例外**: `.agentdev/drafts/` と RU の削除（case-ready 完了後のクリーンアップ）は、成果物変更とは独立したクリーンアップコミットとして扱う。
本運用が禁止する同一コミット混在には該当しない。
当該クリーンアップ検証は case-ready 後の case-auto gate の責務であり、case-run 委譲内では発生しない。

**commit 分割手順**: 実行担当サブエージェントは成果物変更を先にコミットする。
ドメイン state に触れる必要がある場合は別コミットへ分離するが、前述の通り case-run 委譲内では原則として `.agentdev/` 配下を編集せず、PR 本文経由で case-close へ引き継ぐ。
