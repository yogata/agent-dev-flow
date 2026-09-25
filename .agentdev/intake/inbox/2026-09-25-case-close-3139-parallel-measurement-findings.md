# intake: inspect-docs 意味診断並列化 Case #3139 全件対称再測定（DEL-3139-3）由来の検出候補和集合

- 観測日: 2026-09-25
- 観測元: case-close #3139 Capture 回収（PR #3141 本文「Findings / Capture候補」intake セクション。全件対称再測定 DEL-3139-3〔baseline c25d9be7 逐次 55分47秒 / 並列 71fdd9a7 16分00秒 / 現行実行参照 21分29秒〕の finding 突合〔baseline 既知 49 件・完全再検出 25 + 部分 6 + 判定差 4 + 新規 20 + 検出漏れ相当 14〔LLM 推論分散〕・意味的矛盾 0 件〕に由来）
- 種別: corpus 品質指摘（REQ 構造・文書整合）の intake 候補群。個別是正は inspect-promote / req-define 経由

## 候補 1: inspect-docs Design「現在の動作」の STEP 所属注記欠落

inspect-docs Design「現在の動作」の docs-check route 判定（L61）と未処理 artifact 確認（L65）は Workflow Skill 工程定義では STEP-3 所属だが、Design 本文からは所属判定できない（並列化対象か否かの読解に Workflow Skill 参照必須）。軽度・Definition 側修正候補（Case #3139 では Definition 側変更対象外のため未実施）。

## 候補 2: REQ 関連情報節 vs patterns.md 規約の corpus 級乖離

patterns.md の規約（「REQファイルは3セクションだけ」「関連情報節は持たない」）に対し、現行 12 REQ が関連情報節を保有し REQ-050 は非保有。規範と運用のどちらを正とするかの裁定候補。全件対称再測定でも REQ 体系担当が独立に再検出した。

## 候補 3: REQ-050-016 の数値乖離と表記揺れ

REQ-050-016 の固定「50 件」と正本 Design の動的 N 式の数値乖離。併せて「字」/「文字」の表記揺れ。数値統一の小修正候補。

## 候補 4: REQ 構造指摘 14 件（file:line 付き詳細は実行セッション記録）

REQ-038-002/003 の HITL 確定重複、REQ-036-007/009 の診断観点二重定義、REQ-036-031/032 の実行機構・測定項目詳細混入等、REQ 構造指摘 14 件（req-define 入力候補）。

## 候補 5: 全件対称再測定の検出候補和集合（baseline 49 件 + 並列新規 20 件 − 重複）

代表作: patterns 規約と現行 12 REQ の「## 関連情報」乖離、document-model.md の REQ 行引用の文意不一致 3 箇所、capture-boundaries.md の REQ-006-021 未解決参照、簡体字混入（「含义」「状态」「实行」）、numbering-policy 欠番注記「次の新規 REQ は REQ-092」の陳腐化。REQ-036-032 の検証証拠として本測定に帰属し、個別是正は inspect-promote / req-define 経由。
