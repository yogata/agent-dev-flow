# agentdev_jev の Jev 観測 JSON が委譲境界での子セッション中断により observation_write 未到達で喪失する

## 観測内容

Custom Tool `agentdev_jev` の Jev 観測は、evaluate 実施後に委譲境界で子セッションが中断すると、`observation_write` が未到達のまま観測 JSON を喪失する。

- 実例（RU-0128）: 2026-09-24 01:16:38 JST、case-auto stage 2 case-ready #3086（RU-0128、実行構造確定判断）で evaluate が成功（Standard 確率 1.0・inputTokens 589・processingMs 800）したが、子セッション中断（`ses_f30f31b08ffea9ac17b67ea5c31aa766a012dd3`、2026-09-24 01:15-01:18 JST）により `observation_write` が実行されず、`.agentdev/jev-observations/` に当該観測 JSON が存在しないことを実確認した。
- 当該 1 判断は opencode.db parts から出力 JSON ごと手作業復元可能だったが正規観測 JSON ではなく、観測の証跡性が opencode.db 依存の状態になっている。
- 契約上の位置づけ: 観測書込み失敗時の success 維持・warning 明示（custom-tool-contracts.md「Jev 先行評価」節および各 workflow skill の共通契約）は `observation_write` 呼出が行われた場合の規定であり、evaluate から observation_write への間の委譲境界死亡は適用外。

## 影響

Issue B（Jev 有効性評価）の観測証跡が欠落する。

## 課題

evaluate 結果の write 前永続化、または委譲境界での書込み保証。REQ-090-009（投機実行・rollback の禁止、Jev 専用 durable state の新設禁止）制約との整合を明記した上で対応方針を判断する。

## 既存要件との関連

REQ-090-003 は `observation_write` 呼出後の保存失敗のみ規定しており、evaluate 成功から write 到達前の喪失は未被覆。

## 関連

- `2026-09-24-jev-observation-write-target-contract.md`: 同く agentdev_jev 観測の別故障様式（書込先帰属の問題。本件は書込み到達前の喪失）として相互参照。
