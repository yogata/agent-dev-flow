# IR-049 rule 記述の陳腐化（ Wave 2 で一部是正、全体確認は未実施）

## 観測

IR-049 rule の旧 description が Wave 1 の thin Command 化と逆方向（「表形式欠落」検出と記載されていたが checker は工程表「残存」を検出）だった。PR 2433 で checker 実装に整合するよう description を修正した。ただし IR-049 全体の記述鮮度（他フィールド・期待値例の整合）は確認していない。

## 今回扱わない理由

PR 2433 は検出対象の逆方向記述のみを是正対象とした。IR-049 全体の記述鮮度確認は OU-002 の完了条件に含まれず、修正判断には checker 実装との突合作業を要する。

## 影響

IR-049 の残存記述が checker 実装と乖離している場合、docs-check 利用者が誤った違反想定を持つ。

## レビューで決めること

- IR-049 rule 全フィールドの checker 実装突合の実施要否と実施タイミング（inspect-docs の観点候補にするか、個別修正にするか）

## 根拠

- PR 2433 本文「Findings / Capture候補」intake 3件目
- docs/designs/integrity/rules/IR-049-command-file-format-violation.md（PR 2433 で一部修正済み）
