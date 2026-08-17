# agentdev-artifact-graph scripts/lib/config.ts の 250 純LOC 超過 — ファイル分割候補

## 観測内容

scripts/lib/config.ts が 250 純LOC を超過している（編集前からの超過状態。PR #2195 は純増 +7 行に最小化したが分割候補として残る）。並行 Issue #2190/#2193 が同ディレクトリを触るため、Issue #2191 では分割を見送った。なお PR #2198（#2190）マージ後の main では augmentation.ts 分離等により構成が変化しており、#2195 の統合時に最新構成で再評価する。

## 影響

- 配布物スクリプトのモジュールサイズ基準（250 純LOC）超過が残存する

## 課題

専用の分割 Issue を起票する。統合後の最新構成で純LOC を再計測し、超過が残存する場合に分割する。

## 既存要件・成果物との関連

- 対象: src/opencode/skills/agentdev-artifact-graph/scripts/lib/config.ts
- 前提: PR #2195 は Level 2 統合でマージ済み（2026-08-17-epic2189-level2-integration-residual.md）。再計測は最新 main 構成で実施
- 出典: Issue #2191 (CLOSED), Epic #2189、PR #2195

## 出典

- 発生日: 2026-08-17
- 発生源: PR #2195 case-run 検証（Findings / Capture候補）
- 元 item: intake-2026-08-17-epic2189-config-ts-loc-split.md
