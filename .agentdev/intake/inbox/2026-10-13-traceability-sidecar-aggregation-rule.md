# traceability sidecar の同一 artifact × role 集約規則を明文化し、duplicate-inconsistencies の再発を解消する

## 観測

traceability の duplicate-inconsistencies 検出器は同一 artifact × role に対し「単一情報源集約制」（複数情報源間で REQ 集合が完全一致する場合のみ pass）であるため、別 Case が同一 artifact に別 REQ 行の対応を sidecar で宣言すると必ず検出される。Wave-1（PR #3663）で初回検出され既存 sidecar（ra002-commands-correction.yaml）への統合で解消したが、Wave-3（PR #3668）でも同様の初回 fail が再発し、既存 sidecar への追加一本化で修正して再検証合格した。inline 優先規則（producer 側）と sidecar 正規配置（配布対象）は存在するが、同一 artifact × role を跨ぐ複数 Case の sidecar 宣言の統合先・統合手順は明文化されていない。

## 今回扱わない理由

traceability sidecar の運用規約の明文化は正規成果物（配布物・traceability/）の変更であり、Epic #3654 の Wave 実行対象範囲外である。

## 影響

新たな REQ 行の implementation/verification 宣言を sidecar で行う Case が複数発生するたびに、duplicate-inconsistencies の初回 fail と統合修正の往復が再発する。component 名と統合後の中身の語義乖離（例: ra002-commands-correction.yaml への REQ-111 宣言の統合）も進行する。

## レビューで決めること

- 統合規則をどの文書（traceability 運用 reference、skill reference 等）へ明文化するか
- 既存 sidecar への追加を原則とするか、artifact × role 単位の新設を許容する条件を定めるか
- 語義乖離した component 名の改名可否（配布対象の互換性扱い）

## 根拠（任意）

- 観測元: PR #3663（Wave-1 #3660、Findings/Capture候補 intake セクション）、PR #3668（Wave-3 #3662、検証差分の修正済み finding）
- 証拠: PR #3668 検証差分「初回の traceability check で duplicate-inconsistencies fail（新規 sidecar と既存 sidecar で同一論理関係が複数情報源）を検出 → 既存 sidecar への追加一本化に修正して再検証し合格」
- 関連: traceability/ 配下 sidecar、agentdev-traceability check の duplicate-inconsistencies 検出器
