# PR #3925 phase 経路の Findings 4件（capture 回収）

## 概要

Case #3919（Wave 2・OU-603）の実装 PR の本文 Findings 4件の capture 回収。phase 経路（工程駆動）の実行接続で観測された後続要求候補と委託先明示の記録。case-close 再開実行（2026-11-05）の capture 工程で回収。

## 根拠

- 観測元: PR #3925 本文 `## Findings`（4件）。merge 済み（squash merge 先 main・2026-11-05）
- 元テキスト（PR 本文から逐語）:
  1. 「Local モード純環境（gh 未認証・AGENTDEV_GH_REPO 未設定）では agentdev_gh 全操作が config-uninterpretable 失敗する（plugin.ts / registration.ts の runnerFor が Local 投影検出より前に repo 解決を前置）。現行契約は README の AGENTDEV_GH_REPO 設定導線を正とするため本 PR では契約を変更せず、後続要求候補として記録する」
  2. 「phase 経路の保存結果確認は決定的 script の照合（themes.ts / lookup.ts / frontmatter 検査 / apply 冪等）で成立しており、Tool レベルの新規 VERIFY 追加は行っていない（Custom Tool 操作契約の変更回避）」
  3. 「SKILL.md の決定的 script 呼出しパス表記は配布投影側（OpenCode 投影）または原本パス直指定の両対応が既存。Senpi 投影向けの表記例示は未整備（マルチホスト表記は本 Case の対象外）」
  4. 「Local 版の実装を伴う作業の突合は case 系実行経路が正規所有。phase 経路は委外先（case-auto 突合契約・/agentdev/case-auto 接続）を明示した」
- 処置区分の見込み: 第1項は後続要求候補（REQ 候補）。第2〜4項は現行契約の記録（処置不要・知識として保持）
- case-close 再開実行（コメント 6636486030）での capture 対象として記録済み
