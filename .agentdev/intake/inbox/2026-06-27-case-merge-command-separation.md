# case-merge 新規コマンド分離（コンフリクト解消モデル）

## 観察

Issue #1127（PR #1128「コンフリクト解消モデルと実行時間観測 (REQ-0151)」）は、コンフリクト解消モデル（最大 3 回の case-run 実行、3 回目で解消できなければユーザー判断）と実行時間観測（L1/L2 壁時計計測）を実装した。ただし「case-merge の新規コマンド分離」は将来課題としてREQ-0151 適用範囲外に明示した。

現在は case-close コマンドが rebase 責務（REQ-0148 の適用範囲「対象外: case-close（ほぼ変更不要）」を撤回し、case-close へ rebase 責務追加）を担う構成。case-merge の分離は行っていない。

## 修正されなかった理由

ADR-0132 代替案 #2 として「case-merge の新規コマンド分離」が位置付けられたが、REQ-0151 のスコープ（コンフリクト解消モデルの確立）と独立した大型変更であるため対象外とした。REQ-0148 の case-close 対象外撤回により、当面は case-close で rebase を担う設計を採用した。

## 課題

- case-merge コマンド分割の费用対効果（case-close の rebase 責務との二重化回避）
- ADR-0132 decision #2（代替案）の採用可否と、採用時の REQ-0148/REQ-0151 整合性
- 分離後の case-close / case-merge / case-run の責務境界再定義

## 根拠

PR #1128（Issue #1127）本文より引用:

> **対象外**:
> - case-merge の新規コマンド分離（将来課題、ADR-0132 代替案 #2）
> - ulw-loop 内部メトリクス（L3）は oh-my-openagent への依存が強すぎるため本要件対象外。L1（case-auto）+ L2（case-run）の壁時計計測のみ。

> case-merge の新規コマンド分離は将来の課題。

## 観測元

- Issue #1127
- PR #1128
- 要件: REQ-0151
- ADR-0132 decision #2（代替案）
