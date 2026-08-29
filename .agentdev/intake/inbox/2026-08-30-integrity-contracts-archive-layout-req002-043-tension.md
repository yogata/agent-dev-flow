# docs 設計系の残存記述: integrity-contracts.md の archive レイアウト記述と REQ-002-043 の字面緊張

## 観測

`docs/designs/integrity/integrity-contracts.md` L528/L536 の archive レイアウト記述が、REQ-002-043（release 成果物へ third-party Skill 本体を含めない）と字面が緊張している。

- PR #2462（commit 882e7194）の特例是正時に検出
- Design upstream の確定事項のため PR #2462 では不修正（Design 更新は design-save 経由で行う契約）

## 今回扱わない理由

docs 設計系 Design ファイルの更新は case-run/case-close の変更対象外。design-save による Design 更新判断が必要。

## 影響

archive レイアウトの正の記述が REQ-002-043 の非同梱要件と読み替え可能な状態が続く。後続の archive 系実装・検証で解釈の揺れが再発する。

## レビューで決めること

- integrity-contracts.md の該当記述を REQ-002-043 整合の表現へ更新するか（design-save 対象としての採否）
- archive レイアウト図に third-party Skill 非収録の注記を足すか

## 根拠

- PR #2462 本文「Findings / Capture候補」intake 3件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2462 ）
