# check_workflow_preventive.ts extractYamlField の正規表現抽出と Bun.YAML の二重経路解釈

## 観測内容

`check_workflow_preventive.ts` の `extractYamlField`（正規表現 `^field:\s*(\S+)$` による単一トップレベルフィールド行抽出）が `.agentdev/extensions/skills/**` の YAML から kind / id を抽出している。ドキュメント全体を構造化する構文解析ではなく状態機械の入力でもないため Issue #2352 の移行対象からは除外されたが、「Project Extensions YAML 入力からのフィールド抽出が正規表現と Bun.YAML の2経路」と見なせる余地がある（PR #2355 では判定 ambiguous として対象化せず記録）。

Issue #2352（OU-001）の完了条件は `check_extensions.ts` と共有実装スコープの YAML 構文解析・構造検証の委譲に閉じており、`check_workflow_preventive.ts` のフィールド抽出はスコープ外だった。

## 影響

YAML 入力に対する解析経路が2種類残存する解釈余地がある。RU-0002「二重経路残存なし」の解釈次第で移行要件になり得る。現状の機能動作への影響なし。

## 課題（レビューで決めること）

- `extractYamlField` を共有 lib の `resolveExtensionState`（Bun.YAML 委譲実装）再利用へ統合するか、意图的な移行対象外として根拠を明示するか。

## 既存要件・契約との関連

- RU-0002「二重経路残存なし」の解釈、Issue #2352 の移行対象範囲定義、`.agentdev/extensions/**` の YAML 解析経路（正規表現 / Bun.YAML）の整合。

## 根拠

- PR 2355 本文「Findings / Capture候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2355 ）
