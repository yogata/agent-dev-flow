# SPEC確定候補: IR-055 トークン近傍免除におけるプレースホルダ表記の定義明記

## 観測

PR #2265 の checker 実装は、トークン近傍免除におけるプレースホルダ表記として、カタログ同節の例示（`REQ-{NNNN}`）を一般化し `{...}` に加え `<...>` 角括弧表記（isTemplatePlaceholder 規約、v2:REQ-0144-020 と整合）および brace-set glob（`{a,b}`）を含む実装とした。integrity-rule-catalog.md の IR-055 節本文にプレースホルダ表記の定義は明記されていない。

## 今回扱わない理由

integrity-rule-catalog.md は status: accepted であり、draft → accepted 昇格の対象ではない。プレースホルダ表記の定義明記は accepted SPEC への追記要求（SPEC 改訂）であり、case-close の SPEC 確定フローでは扱わない（見送り、パターン c）。

## 影響

checker 実装のプレースホルダ表記の解釈（`{...}` + `<...>` + brace-set glob）が SPEC 文面からは読み取れず、実装と文面の間に解釈の余地が残る。

## レビューで決めること

- IR-055 節（または exemption 小節）へプレースホルダ表記の定義を明記するか
- 明記する場合、isTemplatePlaceholder 規約（v2:REQ-0144-020）への参照で一元化するか

## 根拠

- PR 2265 本文「SPEC確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2265）
