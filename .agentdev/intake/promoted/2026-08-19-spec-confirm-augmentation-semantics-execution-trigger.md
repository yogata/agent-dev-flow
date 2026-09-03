# SPEC確定候補: augmentation 意味定義・役割宣言変更の実行契機への組み込み運用定義

## 観測内容

candidate_limit サブスイートのカタログ置換（PR 2262）で、augmentation の意味定義（delegates_to / governs）と役割宣言（source_file の role: index）の変更を伴った。この種の変更を実行契機（解析スクリプト・抽出ルール・関係意味表の変更時）に含める運用定義は、現状 candidate_limit README「関係意味とノード役割の定義源泉」節にのみ記載されており、AG SPEC「解析品質と回帰検証」節には明示されていない。

PR 2262（Issue 2204）は標準候補数上限の決定がスコープで、AG SPEC「解析品質と回帰検証」節への運用定義追加は SPEC 改訂であり、case-close の SPEC 確定フローでは昇格対象（draft → accepted）とはならない見送り（パターン c）として記録・後続委ねとされた。

## 影響

関係意味表・抽出ルールの変更時に augmentation 宣言の追従変更が必要であることが SPEC 層から読み取れない。README のみの記載に依存する運用となる。

## 課題（レビューで決めること）

- AG SPEC「解析品質と回帰検証」節へ実行契機として明示するか（candidate_limit README 記載の SPEC 層への昇格）
- 明示する場合の文言範囲（augmentation 意味定義・役割宣言の双方を含めるか）

## 既存要件・契約との関連

- AG SPEC「解析品質と回帰検証」節と candidate_limit README「関係意味とノード役割の定義源泉」節の記載階層整合。

## 根拠

- PR 2262 本文「SPEC確定候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2262 ）
