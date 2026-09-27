# intake: 旧 AI_GATEWAY_API_KEY 正本の Windows User スコープ残存整理（削除可否はユーザー判断）

- 観測日: 2026-09-27（Case #3183 case-close Capture 回収。PR #3185 本文）
- 観測元: PR #3185 本文「Findings / Capture候補」intake セクション
- 種別: 残タスク候補（ユーザー判断・本 Case 対象範囲外）

## 内容

- Windows User スコープへの `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` 登録はユーザー操作により完了し、ocenv bridge 経由の scrub 実測（対照 UNSET / bridge 経由 SET）と TS-010 / TS-012 実測が成立した（初回検証時の blocked 起因は解消済み）
- 旧 `AI_GATEWAY_API_KEY` 正本が Windows User スコープに残存している。Jev 現行経路では参照されないが、User スコープからの削除可否はユーザー判断の残タスク候補
- 削除判断の参考: REQ-091 対象外節（opencode.json の Jev 以外の用途に由来する Vercel provider 設定の整理は対象外）と同様、Jev 以外の利用実態の有無を実態確認の上で判断する

## 処置候補

- ユーザーによる Jev 以外の `AI_GATEWAY_API_KEY` 利用実態確認 → 未利用であれば Windows User スコープ（HKCU\Environment）からの削除
- 削除実施の場合、ocenv bridge の scrub 検証手順（docs/guides/supervisor-credential-bridge.md）での旧変数名言及の追随確認
