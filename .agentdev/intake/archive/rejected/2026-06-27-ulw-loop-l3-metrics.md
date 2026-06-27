# ulw-loop 内部メトリクス（L3）の計測対象外

## 観察

Issue #1127（PR #1128「コンフリクト解消モデルと実行時間観測 (REQ-0151)」）は、case-auto（L1）と case-run（L2）の壁時計計測を要件化した。一方で ulw-loop 内部メトリクス（L3）は「oh-my-openagent への依存が強すぎるため対象外」と明示し、REQ-0151-010 で対象外規定を設けた。

PR #1187（case-auto と case-run の実行方式記述責務の分離）でも同様に、「SPEC 側の『ulw-loop 内部メトリクス（L3）は oh-my-openagent 依存が強すぎるため対象外』は計測スコープの技術的根拠説明として SPEC に保持する」と再確認された。

## 修正されなかった理由

ulw-loop（oh-my-openagent 提供の継続実行ループ）の内部メトリクスは、oh-my-openagent 側の API 依存が強く、AgentDevFlow 側から計測・収集する手段が技術的に制限されるため。L1/L2 の壁時計計測で実用上十分と判断した。

## 課題

- L3 計測の技術的実現可能性（oh-my-openagent 側の API 拡張待ちか、AgentDevFlow 側での代理手段か）
- REQ-0151-010「対象外」規定を将来昇格させる場合の契機（oh-my-openagent 側の変更等）
- 現行 L1+L2 で十分か、L3 相当の情報を別経路（Sisyphus-Junior result 等）から得るか

## 根拠

PR #1128（Issue #1127）本文より引用:

> **L3 計測対象外**: ulw-loop 内部メトリクスは oh-my-openagent への依存が強すぎるため本要件対象外。L1（case-auto）+ L2（case-run）の壁時計計測のみ。

> - [x] ulw-loop 内部メトリクス（L3）が本要件の対象外として明記されること（REQ-0151-010）

PR #1187 本文より引用:

> SPEC 側の「ulw-loop 内部メトリクス（L3）は oh-my-openagent 依存が強すぎるため対象外」は計測スコープの技術的根拠説明として SPEC に保持する。

## 観測元

- Issue #1127
- PR #1128, PR #1187
- 要件: REQ-0151-010
