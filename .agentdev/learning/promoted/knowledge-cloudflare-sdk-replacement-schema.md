# SDK 置換系変更での request schema 知識消失予防（Cloudflare /ai/run の model-in-path 制約の実測）

## 背景

Case #3183 の case-run TS-010 実 gateway 検証（初回実測〔HEAD 62ab5166〕）で、Cloudflare AI Gateway `/ai/run/{model}` 形式（model-in-path）で `typesafe/jev` を呼び出すと HTTP 400 `code 7000 "No route for that URI"` で失敗した（失敗観測 20260927T112354Z-6677・TS-010 on_failure 発火）。評価 SDK（`ai` / `@ai-sdk/gateway`）の依存を撤去して fetch 直呼び出しに置換した変更で、SDK が暗黙に担っていた request schema 知識が消失したことが原因。on_failure（fix-and-reverify）に従い、公式カタログ（developers.cloudflare.com の model ページ配下 schema-input.json / schema-output.json）を取得・確認して物理 mapping を修正し、再実測で解消した（観測 20260927T113606Z-6056、commit 58a0fad7）。

## 問題

- Cloudflare `/ai/run` の model-in-path 継続形式（`/ai/run/{model}`）は Workers AI `@cf/` モデル専用であり、第三者モデル（`author/model` 形式の `typesafe/jev`）には path ルートが存在しない。公式の `/ai/run` は body の `{ model, input }` でモデルと入力を渡す
- 評価 SDK が暗黙に担っていた request schema 知識は、fetch 直呼び出しへ置換した時点で消失する。置換後の実装が公式 schema の確認なしに書かれると、SDK 依存時代には存在しなかった request schema エラー（HTTP 400 等）が実 gateway 実測で初めて顕在化する

## 望ましい変更

SDK 置換系変更の実装手順に、次を実装前工程として組み込む知識として整備する。

- 置換対象 SDK が担っていた契約（request schema・認証・エラー形式等）の列挙
- 接続先モデルの request schema の公式一次情報源（公式カタログ・OpenAPI 等）からの取得・確認

## 対象範囲

### 対象

- provider 置換・依存削減系の case-run 実装手順（SDK 置換時の実装前工程）
- docs/knowledge/ 知識化候補（SDK 置換系変更の一般手順）

### 対象外

- adapter 内部の物理 mapping 実装の詳細（修正済み・REQ-090-022 の provider 境界どおり）
- Cloudflare 固有の API 仕様の恒久管理（一般手順としての知識化が対象）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/ 候補 | SDK 置換系変更の実装前工程（契約列挙・公式 schema 取得確認）の知識文書化候補 |
| 配布skill reference | provider 置換系 Case の case-run 実装手順（関連 reference） | SDK 置換時の前置確認手順追加候補 |

## 既存対策確認

- **確認結果**: なし
- **該当ファイル**: なし（Cloudflare・SDK 置換系の既存エントリは皆無）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: SDK 置換時の schema 契約列挙・公式確認を前置する手順・知識が存在しない

## 制約

- request schema の一次情報源は公式カタログ（本件では developers.cloudflare.com の model ページ配下 schema-input.json / schema-output.json）であり、エラーメッセージや推測からの復元を標準としない
- on_failure（fix-and-reverify）契約内の修正で解消済みだが、知識化の対象は再発予防の実装前工程である

## 受け入れ条件

- [ ] SDK 置換系変更の実装前工程に「置換対象 SDK が担っていた契約の列挙」が組み込まれた手順・知識が整備されること
- [ ] 「公式 schema の取得確認」が実装確認の前置として明記されること

## 元 learning item / 根拠

- **要約**: Cloudflare /ai/run の model-in-path 形式は Workers AI @cf/ モデル専用で第三者モデルは body で渡す。SDK 置換で request schema 知識が消失する
- **根拠**: inbox「Cloudflare /ai/run の model-in-path 形式は Workers AI @cf/ モデル専用 — 第三者モデルは body で渡す（評価 SDK 依存から fetch 直呼び出しへ置換する場合、SDK が担っていた schema 知識の消失を実装前工程で補う）」（Case #3183・PR #3185）: HTTP 400 code 7000 "No route for that URI"（失敗観測 20260927T112354Z-6677）。公式カタログ取得・確認で request / response の物理 mapping を修正し再実測成功（観測 20260927T113606Z-6056・commit 58a0fad7）
- **再発条件**: 評価・推論系 SDK の依存を撤去して HTTP 直呼び出しに置換し、request schema の一次情報源の確認を実装前に実施しない場合
- **横展開可能性**: 外部 API SDK を fetch 直呼び出しへ置換する全 Case（provider 置換・依存削減系）に適用可能

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし
