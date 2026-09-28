---
title: SDK 置換系変更では置換対象 SDK が担っていた契約（request schema・認証・エラー形式）の列挙と公式一次情報源からの取得確認を実装前工程として前置する
created: 2026-09-28
updated: 2026-09-28
---

# SDK 置換系変更では置換対象 SDK が担っていた契約（リクエストスキーマ・認証・エラー形式）の列挙と公式一次情報源からの取得確認を実装前工程として前置する

## 知識内容

評価・推論系 SDK の依存を撤去して fetch 直呼び出しへ置換する変更（provider 置換・依存削減系）では、SDK が暗黙に担っていたリクエストスキーマ知識が置換時点で消失する。置換後の実装が公式スキーマの確認なしに書かれると、SDK 依存時代には存在しなかったリクエストスキーマエラー（HTTP 400 等）が実 gateway 実測で初めて顕在化する。SDK 置換系変更の実装前工程として、次を前置する:

1. **置換対象 SDK が担っていた契約の列挙**: リクエストスキーマ・認証（credential 供給経路・ヘッダ構成）・エラー形式（ステータスコードとエラーボディの構造）を、置換前に列挙して変更計画に明記する
2. **公式一次情報源からの取得確認**: 接続先モデルのリクエストスキーマを公式カタログ・OpenAPI 等の一次情報源から取得・確認する。エラーメッセージや推測からのスキーマ復元を標準としない

### Cloudflare /ai/run の model-in-path 制約（実測）

Cloudflare AI Gateway の `/ai/run/{model}` 形式（model-in-path 継続）は Workers AI の `@cf/` モデル専用であり、第三者モデル（`author/model` 形式）にはパスルートが存在しない。公式の `/ai/run` は body の `{ model, input }` でモデルと入力を渡す。実測では `typesafe/jev` を model-in-path で呼び出すと HTTP 400 `code 7000 "No route for that URI"` で失敗した（Case #3183、失敗観測 20260927T112354Z-6677）。公式カタログ（developers.cloudflare.com の model ページ配下 schema-input.json / schema-output.json）の取得・確認でリクエスト/レスポンスの物理マッピングを修正し、再実測で解消した（観測 20260927T113606Z-6056、commit 58a0fad7）。

## 適用条件

- 評価・推論系 SDK の依存を撤去して HTTP（fetch）直呼び出しへ置換する場合
- provider 置換・依存削減系の case-run 実装で、SDK が暗黙に担っていた契約が実装者に引き継がれていない可能性がある場合

## 適用対象

- provider 置換・依存削減系の case-run 実装手順（SDK 置換時の実装前工程）
- 外部 API SDK を fetch 直呼び出しへ置換する全 Case（Jev evaluation gateway 置換〔DEC-046 系〕を含む）

## 根拠

- Case #3183（case-run TS-010 実 gateway 検証、PR #3185）: 評価 SDK（`ai` / `@ai-sdk/gateway`）依存を撤去して fetch 直呼び出しに置換した変更で、Cloudflare `/ai/run/{model}` の model-in-path が `typesafe/jev` に対して HTTP 400 code 7000 "No route for that URI" で失敗（失敗観測 20260927T112354Z-6677・TS-010 on_failure 発火）。model-in-path は `@cf/` モデル専用で第三者モデルはボディ渡しが正という実測の確定に至った。公式カタログ取得・確認で物理マッピングを修正し再実測成功
- DEC-046（Jev 実行基盤の Cloudflare AI Gateway への完全置換）

## 関連知識

- [Supervisor 環境の credential 供給ブリッジ](supervisor-bridge-credential-supply.md)（置換後の認証 credential の供給経路）
- [LLM body 検証とファイルシステム実測](llm-body-verification-filesystem-truth.md)（LLM 入出力の実測検証観点）

## 反映先候補

以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、RU 化せず本節に保持する（2026-09-28 ユーザー承認済み）:

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | provider 置換系 Case の case-run 実装手順（関連 reference） | SDK 置換時の前置確認手順（契約列挙・公式スキーマ取得確認）の追加候補 |
