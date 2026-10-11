# case-open STEP-4 の traceability gate 判定に新規 REQ 行対象の missing-implementation/verification 構造的 fail の明文化を追加する

## 観測

case-open STEP-4 の prepare_definition_pr.ts 呼び出しで、新規 REQ 行（REQ-035-021）追加の Definition 変更に対し traceability gate が fail を報告した（pass=9 fail=2）。fail の内訳は対象行 REQ-035-021 の missing-implementation / missing-verification であり、case-open の正規ゲートである missing-design（対象行）は pass していた。実行は gate 判定仕様の冒頭規定（case-open の正規ゲートは対象 REQ 行の missing-design 0 件）から導出して既知未完了として処理し、PR 作成へ進めた。

## 今回扱わない理由

case-open 工程は Definition の REQ 行と Design 変更の確定までが責務であり、reference 手順の明文化（src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md の gate 判定仕様節補足）は作業本筋外である。Case #3627 が同領域の reference 明文化（traceability gate の既存債務対照救済手順等）を進行中であるため、本件の明文化追加はそちらとの統合・重複判定を含めて後段で判断する。

## 影響

新規 REQ 行を伴うすべての case-open 設計PR で同様の gate fail と意味レビューによる判断が再発する。判断根拠（case-open の正規ゲートは対象行の missing-design 0 件、新規行の missing-implementation / missing-verification は case-run / case-ready 段階の前提欠落）が手順に明文化されていない場合、各実行で解釈判断の往復が生じ、誤って gate fail を設計PR の作成停止と読み替えるリスクがある。

## レビューで決めること

- Case #3627 の reference 明文化スコープへの統合可否（同一 reference の gate 判定仕様節への追記として統合するか、別途とするか）
- STEP-4 reference の gate 判定仕様節への明文化の文言と配置
- script 側の判定対象変更（形式検査系 + missing-design 対象行への絞り込み）を行うか、reference 側の明文化のみとするか

## 根拠（任意）

- 観測元: Case #3628、PR #3631（case-open 実行、2026-10-11）
- 証拠: prepare_definition_pr.ts 報告 JSON の traceability-check step（status: fail、exitCode 2、pass=9 fail=2）。check --req REQ-035-021 の内訳（missing-design pass、missing-implementation fail、missing-verification fail、形式検査系全件 pass）
- 関連手順: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md「traceability check の gate 判定仕様と計測日収束」節
