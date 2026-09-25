# intake: agentdev_gh gh-spawn 系統故障が Case 停止として分類される問題

- 観測日: 2026-09-25
- 観測元: Hermes supervisor による case-auto #3123 再開監視（session ses_f2d15b751ffelKKGbyy7uhW2f5、root 08:57 停止報告）
- 種別: 機構改善（停止分類と回復経路の設計欠陥）

## 現象

長寿命 OpenCode プロセス（`opencode serve`、127.0.0.1:4096、2026-09-24 16:57 起）内で `agentdev_gh` の gh spawn が恒常失敗（`gh exited with 66`）。プロセス自体は生存し HTTP API も応答するが、GitHub 読み書きのみ全滅。workflow（case-ready STEP-7 の issue_update）は再試行でも回復せず、08:57 に「実行できる作業はセッション内に残っていない」と fail-closed 停止。

serve 再起動（プロセス入れ替え）で即回復。durable state（staging 済み Issue 本文・draft・git）は完全保持され、冪等再開が成立した。

## 問題点

1. **回復単位の誤配置**: gh spawn 環境の劣化はインフラ（harness）層の transient 障害で、serve 再起動で回復する。なのに現行では Case 側の blocker（ワークフロー停止）として分類され、supervisor が気づいて再起動するまで pipeline が前進しない。
2. **停止分類への混入**: ツール基盤故障は ADF の停止条件（HITL・CI 失敗・構成不備等）のいずれの本質でもないが、正規書込経路が `agentdev_gh` に限定され代替が契約禁止のため、結果的に workflow 停止と同形になる。

## 修正提案（対象）

### A. ADF 側（agent-dev-flow）

- case-ready/case-run/case-close の停止分類に「infra-transient（ツール基盤故障）」を追加し、Case の失敗とは区別する。
- 停止報告に「supervisor による harness 再起動で回復可・durable state から冪等再開」という回復経路を明記する。
- 該当判定条件: 単一ツール（gh spawn 系）の恒常失敗 × プロセス生存 × 再試行無効 × 他経路正常（git・DB・ローカル FS）。

### B. harness 側（OpenCode / agentdev_gh 実装）

- 長寿命プロセス内での gh spawn を fresh process 分離（call 単位の spawn 環境検証）または失敗時の自動再初期化で吸収する。
- 恒常化した環境劣化をツール呼び出し単位のエラーとして報告し続けない。

## 証跡

- opencode.log: 2026-09-25 08:5x の root 停止報告（`gh exited with 66` 実測）
- serve 再起動後の再開 relay 受理（09:12:01）
- staging 済み `.agentdev/tmp/issue-3123-body-step7.md`（21,420 bytes、08:37）

## 関連

- 先行知見: headless `opencode run` の turn 境界 child-kill（2026-09-25 診断済み・adf-supervisor-operations skill 記録済み）と同じ「harness ライフサイクル由来の pipeline 停止」ファミリー。本件はその常駐 serve 版。
