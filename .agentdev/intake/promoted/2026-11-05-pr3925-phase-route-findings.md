# Local モード純環境での agentdev_gh 全操作失敗の後続要求候補（PR #3925 Findings 回収）

## 観測内容

Case #3919（Wave 2・OU-603）の実装 PR #3925 本文 Findings 4件のうち、第1項が後続要求候補として採用対象。第2〜4項は現行契約の記録として参考掲載のみ（詳細は「参考記録」節）。

第1項（採用対象・後続要求候補）: Local モード純環境（gh 未認証・AGENTDEV_GH_REPO 未設定）では agentdev_gh 全操作が config-uninterpretable 失敗する。plugin.ts / registration.ts の runnerFor が Local 投影検出より前に repo 解決を前置する構造が原因。現行契約は README の AGENTDEV_GH_REPO 設定導線を正とするため当該 PR では契約を変更せず、後続要求候補として記録された。

観測元: PR #3925 本文 `## Findings`（4件、merge 済み squash merge・2026-11-05）、case-close 再開実行（コメント 6636486030）での capture 対象として記録済み。

## 影響

Local モード純環境での agentdev_gh 失敗は config-uninterpretable として分類される。環境変数設定への解決導線はメッセージに存在するが、repo 解決が Local 投影検出に先行する構造のため、Local 純環境の利用者に誤解を招く失敗分類となる余地がある。契約変更の要否自体は後続工程（req-define）で判断すべき事項であり、本 item は候補の持ち込みにとどまる。

## 課題

第1項の要求候補として、Local 投影検出を repo 解決に前置する（検出順序の変更）契約変更を検討するか否か。現行契約（README の AGENTDEV_GH_REPO 設定導線を正とする）との関係で、Local 純環境の利便性と契約複雑化のトレードオフ判断を backlog-review 経由で req-define に持ち込む。

## 既存要件との関連

- REQ-052-013 は対象解決失敗（config-uninterpretable）経路の診断情報・解決手続き導線の契約を所有し、REQ-052-014 は環境起因失敗の fail-closed と最小詳細を規定する。現行実装は REQ-052-013 の要件を満たしており、本件は現行契約の非適合ではなく、検出順序の変更という新規の契約設計候補である（対論型レビューで REQ-052-013/014 と本件の区別を確認済み）。
- REQ-009-051 は AGENTDEV_GH_REPO 設定導線を正とする現行契約の根拠行である。

## 参考記録（PR #3925 Findings 第2〜4項・採用対象外）

第2〜4項は申告済みの処置区分（現行契約の記録・処置不要・知識として保持）に従い、RU 化対象としない。本節により PR #3925 Findings 4件の追跡可能性を維持する。恒久の一次記録は GitHub PR #3925 本文である。

- 第2項: phase 経路の保存結果確認は決定的 script の照合（themes.ts / lookup.ts / frontmatter 検査 / apply 冪等）で成立しており、Tool レベルの新規 VERIFY 追加は行っていない（Custom Tool 操作契約の変更回避）。
- 第3項: SKILL.md の決定的 script 呼出しパス表記は配布投影側（OpenCode 投影）または原本パス直指定の両対応が既存。Senpi 投影向けの表記例示は未整備（マルチホスト表記は当該 Case の対象外）。
- 第4項: Local 版の実装を伴う作業の突合は case 系実行経路が正規所有。phase 経路は委外先（case-auto 突合契約・/agentdev/case-auto 接続）を明示した。
