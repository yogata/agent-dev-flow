# agentdev_jev の Jev 観測 JSON が委譲境界での子セッション中断により observation_write 未到達で喪失

## 観測

- Custom Tool `agentdev_jev` の Jev 観測が、evaluate 実施後に委譲境界で子セッションが中断した場合、`observation_write` が未到達のまま観測 JSON を喪失する。
- 2026-09-24 01:16:38 JST、case-auto stage 2 case-ready #3086（RU-0128、実行構造確定判断）で evaluate が実施され成功した（結果: Standard 確率1.0・inputTokens 589・processingMs 800）が、子セッション中断により `observation_write` が実行されず、`.agentdev/jev-observations/` に当該観測 JSON が存在しない。
- 当該1判断は opencode.db parts から出力 JSON ごと手作業復元可能だったが正規観測 JSON ではなく、観測の証跡性が opencode.db 依存の状態になっている。

## 契約上の位置づけ

- 観測書込み失敗時の success 維持・warning 明示（`custom-tool-contracts.md`「Jev 先行評価」節および各 workflow skill の共通契約）は `observation_write` 呼出が行われた場合の規定であり、evaluate から observation_write への間の委譲境界死亡はその適用外。

## 修正候補

- evaluate 結果の write 前永続化
- または委譲境界での書込み保証

## 根拠

- 観測元: case-auto stage 2 case-ready delegation（Case #3086、2026-09-24 01:15-01:18 JST、子セッション `ses_f30f31b08ffea9ac17b67ea5c31aa766a012dd3` の中断）
- Split Rule 分類: intake（具体的修正対象: `agentdev_jev` の観測永続化経路・契約文言）
