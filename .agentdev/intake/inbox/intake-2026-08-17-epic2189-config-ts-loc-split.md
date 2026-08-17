# Intake Item: agentdev-artifact-graph scripts/lib/config.ts の 250 純LOC 超過 — ファイル分割候補

## 発生源

- PR: #2195 (Issue #2191 / OU-0002, Epic #2189 Wave 1)
- 発生 phase: case-run 検証（Findings / Capture候補）
- capture 分類: intake（配布物是正候補）

## 問題

scripts/lib/config.ts が 250 純LOC を超過している（編集前からの超過状態。PR #2195 は純増 +7 行に最小化したが分割候補として残る）。並行 Issue #2190/#2193 が同ディレクトリを触るため、Issue #2191 では分割を見送った。なお PR #2198（#2190）マージ後の main では augmentation.ts 分離等により構成が変化しており、#2195 のコンフリクト解消時に最新構成で再評価する。

## 推奨対応

専用の分割 Issue を起票する。PR #2195 と PR #2198 の統合（case-auto Level 2/3）後の最新構成で純LOC を再計測し、超過が残存する場合に分割する。

## 関連

- Issue: #2191 (OPEN、コンフリクト解消待ち), Epic: #2189
- PR: #2195 (OPEN/CONFLICTING), #2198 (merged f4ac8d70)
