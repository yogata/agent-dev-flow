# Case #3183 follow-up: 旧 AI_GATEWAY_API_KEY 正本の残存整理と Vercel provider 設定整理（条件発火型を含む統合）

- 観測日: 2026-09-27（Case #3183 case-close Capture 回収、PR #3185 本文）
- 由来 intake item: 2026-09-27-3183-legacy-ai-gateway-key-cleanup.md（採用）＋ 2026-09-27-3183-opencode-json-vercel-provider-cleanup.md（採用・本成果物への吸収。単体 RU は生成しない）
- 分類確定: ユーザー承認済み（2026-09-27 backlog-auto stage 2 intake-promote HITL。adversarial-review 収束済み）

## 観測内容

- Windows User スコープへの `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` 登録は完了し、ocenv bridge 経由の scrub 実測（対照 UNSET / bridge 経由 SET）と TS-010 / TS-012 実測が成立した（Case #3183 の初回検証時 blocked 起因は解消済み）
- 旧 `AI_GATEWAY_API_KEY` 正本が Windows User スコープ（HKCU\Environment）に残存している。Jev 現行経路では参照されない
- opencode.json の Jev 以外の用途に由来する Vercel provider 設定は REQ-091 対象外節の宣言どおり Case #3183 では未整理のまま。現時点で具体的な不具合・残存経路は未確認

## 影響

- 旧 credential 残存: 現行経路での参照はないため機能影響なし。ただし不要な secret の User スコープ残存は整理候補
- Vercel provider 設定: 条件発火（Jev 以外の provider 利用の終了・整理）まで無害。REQ-091 対象外節に恒久記録済み

## 課題（RU 要求範囲 — adversarial-review の範囲限定を適用）

1. **旧 `AI_GATEWAY_API_KEY` 利用実態確認の実施支援**: Jev 以外の当該キー利用の有無を確認する手順・観点の提供（ユーザー判断材料の整備）
2. **bridge 手順の追随確認**: 削除が実施された場合、`docs/guides/supervisor-credential-bridge.md` の scrub 検証手順における旧変数名（`AI_GATEWAY_API_KEY`）言及の追随確認（リポジトリ作業）
3. **条件発火型の記録（item 3 の吸収）**: Jev 以外の Vercel provider 利用の整理が必要になった時点での追跡 Issue 起票（起票時に REQ-091 対象外節を参照根拠として明記）。本成果物はその手がかりの一元化であり、条件発火まで対応不要

## 制約（RU 化時の完了条件設計上の注意）

- Windows User スコープ（HKCU\Environment）からの旧キー削除そのものは**ユーザー環境操作**であり、RU の自動完了条件に含めない。RU 完了条件は「利用実態確認の実施支援と、削除実施時の bridge 手順追随確認」に限定する
- 削除可否の最終判断はユーザー判断（REQ-091 対象外節と同様、Jev 以外の利用実態の有無の確認に基づく）

## 既存要件との関連

- REQ-091 対象外節（opencode.json の Jev 以外の用途に由来する Vercel provider 設定の整理は対象外）
- docs/guides/supervisor-credential-bridge.md（scrub 検証手順）
- DEC-046（Jev 実行基盤の Cloudflare AI Gateway への完全置換 — 旧キーが参照されなくなった背景）
