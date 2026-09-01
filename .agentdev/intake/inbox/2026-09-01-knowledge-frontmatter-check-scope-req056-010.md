# REQ-056-010 検査範囲への Knowledge frontmatter 検査要否の解釈確定候補

## 観測

patterns Design は Knowledge 文書の frontmatter（title、created、updated）を必須と規定するが、REQ-056-010 の「必須内容」を REQ-056-003 の本体5項目に限定して checker を実装したため、frontmatter 検査は checker 範囲外となっている。REQ-056-010 の検査範囲に frontmatter を含めるかの解釈が未確定。

## 影響

frontmatter 欠落の知識文書が checker で検出されない状態が、REQ-056-010 の契約解釈として妥当かが判定できない。検査範囲の解釈が checker 拡張の要否判断を左右する。

## レビューで決めること

- REQ-056-010 の検査範囲に frontmatter 必須性の検査を含めるかの解釈確定（含める場合は checker 拡張、含めない場合は REQ 行の明確化）

## 根拠

- PR #2503 本文「Design確定候補」2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2503 ）
