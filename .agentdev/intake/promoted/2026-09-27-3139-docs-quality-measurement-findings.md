# intake: Case #3139 全件対称再測定由来の docs 品質検出候補（採用分・確定済み）

- 観測日: 2026-09-25（intake 確定日: 2026-09-27、backlog-auto stage 2 intake-promote）
- 観測元: case-close #3139 Capture 回収（PR #3141 本文「Findings / Capture候補」intake セクション。全件対称再測定 DEL-3139-3〔baseline c25d9be7 逐次 55分47秒 / 並列 71fdd9a7 16分00秒 / 現行実行参照 21分29秒〕の finding 突合〔baseline 既知 49 件・完全再検出 25 + 部分 6 + 判定差 4 + 新規 20 + 検出漏れ相当 14〔LLM 推論分散〕・意味的矛盾 0 件〕に由来）
- 種別: corpus 品質指摘（REQ 構造・文書整合）の採用分。個別是正は req-define / backlog-review 経由
- 分類確定: 部分採用（候補1・numbering-policy・REQ-036-031/032・REQ-006-021は除外。保留分は inbox 残置 item 2026-09-27-3139-measurement-unverified-remainder.md へ分割）

## 採用 1: patterns.md 規約 vs 現行 REQ の「## 関連情報」節保有の corpus 級乖離（req-define 裁定対象）

- 正パス: docs/designs/foundations/patterns.md:56-57（「REQファイルは3セクションだけ」「関連情報節は持たない」）
- 現行 12 REQ が「## 関連情報」節を保有: REQ-004/010/012/021/036/037/038/039/054/055/056/060（REQ-050 は非保有）
- 規範と運用のどちらを正とするかは req-define 再壁打ちでの裁定事項（規約執行で12節廃止 / 規約改訂で許容 / 個別判定）
- 全件対称再測定で REQ 体系担当が独立に再検出。2026-09-27 時点の新規 inspect-docs 31 finding・deferred 3ファイルのいずれにも未カバー（重複なし検証済み）

## 採用 2: REQ-050-016 の数値乖離と表記揺れ（小修正）

- REQ-050-016:36 の固定「350 字 × 50 件」と正本 Design の動的 N 式の数値乖離。併せて「字」/「文字」の表記揺れ

## 採用 3: REQ 構造指摘の代表例（req-define 入力候補）

- REQ-038-002/003: HITL 確定の重複記述（21-22行目）
- REQ-036-007/009: 診断観点の二重定義（26/28行目）
- 残りの REQ 構造指摘約10件（REQ-036-031/032 を除く）は file:line が PR #3141 本文に無く再導出不能のため保留分へ分割

## 採用 4: 簡体字混入（小修正）

- 实行 ×30: docs/designs/workflows/crosswalk-inventory.md（多数行）
- 状态 ×1: docs/designs/foundations/v3-v4-crosswalk.md:55
- 含义 ×1: docs/designs/responsibilities/document-type-responsibilities.md:309 — AGENTS.md が参照する現行責務文書内であり優先度高

## 除外マップ（レビュー・照合確定分）

- 候補1「inspect-docs Design STEP 所属注記欠落」: PR #3140（39aa07f3）が注記追記で解消済み → 却下
- 候補5 numbering-policy 欠番注記「次の新規 REQ は REQ-092」: PR #3150 で解消済み → 却下
- REQ-036-031/032: 2026-09-25 inspect finding F-15 の defer カバー済み → 除外
- REQ-006-021 未解決参照: baseline known（REQ-002-021/028 と同一ファミリーの既知事項） → 除外
