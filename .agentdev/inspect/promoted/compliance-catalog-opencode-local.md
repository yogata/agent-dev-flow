---
title: src/opencode-local/ 規範逸脱カタログ
topic: opencode-local-compliance-catalog
source_issue: "#1043"
parent_epic: "#1037"
status: draft
created: 2026-06-23
review_norms:
  - japanese-tech-writing（skill 相当適用サブセット: 整形・LLM 表現禁止・冗長排除・論証の厳密さ・用語政策）
  - docs/specs/document-type-responsibilities.md（配置基準・用語政策）
---

# src/opencode-local/ 規範逸脱カタログ

## 概要

`src/opencode-local/` 配下 6 ファイルに対する japanese-tech-writing 規範（skill 相当適用サブセット）および document-type-responsibilities.md（配置基準・用語政策）の逸脱を抽出したカタログ。個別修正は後続 Issue で扱う（本カタログは見える化が目的）。遡及準拠の範囲は REQ-0140-026 に基づく。

## 対象範囲

6 ファイル（査読対象外: なし）。

| ファイル | 行数 |
|---|---|
| `README.md` | 125 |
| `generation-flow.md` | 145 |
| `case-schema/case-file.md` | 213 |
| `transform/generate.md` | 165 |
| `transform/review.md` | 132 |
| `transform/spec.md` | 148 |

## 適用サブセット

skill 相当サブセット（整形・LLM 表現禁止・冗長排除・論証の厳密さ・用語政策）。演出・パラグラフライティングは非適用。

## 検出事項

### F-001（high）: 同一ファイル内の段落完全重複

- **対象**: `transform/review.md` L7-8 / L122
- **該当規範**: 冗長排除（同じ主張を言い換えて繰り返さない）
- **現状**: 以下の 2 文が冒頭「目的」節と末尾「必須チェック失敗時の扱い」節で完全一致する。
  - L8: 「必須チェックが1つでも失敗した場合、結果は `FAIL` とする（REQ-0141-028）。部分通過（一部必須項目のみ通過）を `PASS` として扱わない。」
  - L122: 「必須チェックが1つでも失敗した場合、結果は `FAIL` とする（REQ-0141-028）。部分通過（一部必須項目のみ通過）を `PASS` として扱わない。」
- **改善方向**: 末尾側を「再レビューでも `FAIL` の扱いとなる点は冒頭の規定通り」と短く参照させ、重複本文を削る。

### F-002（high）: 同一文のファイル横断重複（決定的変換スクリプト不使用）

- **対象**: `README.md` L40 / `generation-flow.md` L22, L63 / `transform/generate.md` L9
- **該当規範**: 冗長排除（同じ主張を言い換えて繰り返さない）
- **現状**: 「決定的な変換ロジックを実装した変換スクリプトは使用しない」が同一表現で 4 箇所に現れる。
  - `README.md` L40: 「決定的な変換ロジックを実装した変換スクリプトは使用しない。」
  - `generation-flow.md` L22: 「決定的な変換ロジックを実装した変換スクリプトは使用しない。」
  - `generation-flow.md` L63: 「決定的な変換スクリプトは使用しない」（Step 5 内で再述）
  - `generate.md` L9: 「決定的な変換ロジックを実装した変換スクリプトは使用しない。」
- **改善方向**: 正本位置（`generate.md` 目的節など）に集約し、他は「変換スクリプトは使用しない（詳細は `generate.md` 参照）」など短く参照させる。`generation-flow.md` 内の 2 回（L22・L63）は特に近接しており、Step 5 側は削れる。

### F-003（med）: 終端状態遷移規定の節内重複

- **対象**: `case-schema/case-file.md` L70 / L95
- **該当規範**: 円長排除（同じ主張を言い換えて繰り返さない）
- **現状**: 終端状態からの遷移不許容が 2 箇所で重複。
  - L70: 「`closed` と `cancelled` は終端状態とする。終端状態からの遷移は定義しない。」
  - L95: 「終端状態（`closed`, `cancelled`）からの遷移は定義しない。」
- **改善方向**: L70 の一文に集約し、L95 の「禁止遷移」節は `blocked → closed` 直接遷移禁止のみを残す。

### F-004（med）: 述語欠落の不完全文

- **対象**: `case-schema/case-file.md` L135
- **該当規範**: 整形（一文一行）・論証の厳密さ
- **現状**: 「これらは GitHub 版で PR 本文が担っていた引き継ぎ情報の代替であり、case-close への引き継ぎ経路を失わせないため（REQ-0141-020）。」
- **問題**: 「〜ため」で止まり、「〜ためである」「〜ためである（REQ-0141-020）」といった述語が欠落している。REQ 参照の括弧だけが文末に来て文が完結していない。
- **改善方向**: 「case-close への引き継ぎ経路を失わせないためである（REQ-0141-020）。」と補う。

### F-005（med）: ガードレール一覧の意図的だが冗長な重複

- **対象**: `transform/generate.md` L79-119 / `transform/spec.md` L43-91
- **該当規範**: 冗長排除（隣接する節が同じことを別の角度で述べているなら、役割が重複している）
- **現状**: 両ファイルとも「原本保護 / 安全ゲート / 配置規則 / バックエンド制約 / GitHub 依存除去 / Case ファイル引き継ぎ」のガードレール箇条書きをほぼ同一内容で保持する。`generate.md` L81 と `spec.md` L45 に「同一内容を保持し整合すること」と明記されており、意図的な同期表明である。
- **改善方向**: 同期表明自体は AI エージェント参照上の設計意図として妥当だが、`spec.md` 側を「`generate.md` のガードレール一覧を参照」と短く差し替えるか、正本を `spec.md` に寄せて `generate.md` 側を参照化する。本カタログでは「設計意図は確認した上での DRY 違反」として記録する。

### F-006（med）: レポートフォーマット表のファイル間重複

- **対象**: `transform/generate.md` L121-138 / `transform/spec.md` L92-110
- **該当規範**: 冗長排除（同じ主張を言い換えて繰り返さない）
- **現状**: 変換レポートの必須項目表が両ファイルで同一の 12 行を保持する。`spec.md` L94 と `generate.md` L123 に「同一の必須項目を保持し整合させること」との同期表明がある。
- **改善方向**: F-005 と同じ方針で正本を一本化する。

### F-007（med）: 違反判定基準表の 3 箇所重複

- **対象**: `transform/generate.md` L140-153 / `transform/review.md` L66-79 / `transform/spec.md` L111-124
- **該当規範**: 冗長排除（同じ主張を言い換えて繰り返さない）
- **現状**: 「残存 GitHub 固有参照の違反/非違反」判定表が 3 ファイルで同一の 7 行を保持する。`spec.md` のみ「根拠」列を追加しているが判定本体は同一。
- **改善方向**: 判定表の正本を `spec.md` に集約し、`generate.md`・`review.md` は参照化する。

### F-008（med）: 中黒（・）による日本語並列

- **対象**: `README.md` L111 / `generation-flow.md` L40, L126-128 / `transform/generate.md` L18, L53 / `transform/review.md` L15-17 / `transform/spec.md` L23-40 等（多数）
- **該当規範**: 整形（中黒を日本語の並列で使わない。ただし単一の固有名詞の内部では使ってよい）
- **現状**: 複数ファイルで中黒を並列リストに使用。
  - 例: `README.md` L111「生成された `.opencode/commands/` ・ `.opencode/skills/` ・ `.opencode/` 配下ひな形・変換スクリプト」
  - 例: `transform/spec.md` L23-25「`src/opencode/` | コマンド（`commands/agentdev/*.md`）・スキル（`skills/agentdev-*/`）・ひな形」
  - 例: `transform/review.md` L15「`.opencode/commands/agentdev/` ・ `.opencode/skills/agentdev-*/` ・ `.opencode/` 配下ひな形」
- **改善方向**: 表のセル内・箇条書きの並列は読点またはスラッシュ／かぎ括弧の列挙に置き換える。並列項目が識別子やコード値のみの場合も、地の文の並列としては中黒を避ける方針（document-type-responsibilities.md の用語政策節が同様の書き方を採用）。
- **補足**: リポジトリ全体での中黒使用が広く浸透しているため、修正優先度は個別ファイルごとに判定されるべき。

### F-009（low）: 「YAML 前書き」の訳語選択

- **対象**: `case-schema/case-file.md` L16, L18, L30, L43-53 / `transform/spec.md` L134 等（広範）
- **該当規範**: 用語政策（術語・訳語はその分野で慣用されている語を選ぶ）
- **現状**: YAML frontmatter を「YAML 前書き」と翻訳している。ファイル名 `rules/frontmatter.yaml` は原語を保持する一方、本文は「前書き」としている。
- **改善方向**: frontmatter の定着日本語訳はないが、「前書き」は一般語で YAML メタデータブロックの意味を伝えにくい。「YAML フロントマター」「frontmatter（YAML 前書き）」など原語併記、または初出のみ訳出の運用に揃える。document-type-responsibilities.md の訳語表に frontmatter 行を追加して SSoT 化する案も後続 Issue で検討価値がある。

## 対象外

- 演出・パラグラフライティング関連の規範は本ディレクトリの適用サブセット外のため検出対象外。
- REQ-0141 関連の仕様レベル整合性（ REQ-0141-XXX 番号の妥当性、意味仕様と運用参照資料の矛盾）は本カタログの査読規範外。`docs/specs/local-*.md` との正本一致性は別途 inspect-docs 等で扱う。
- `case-schema/rules/*.yaml`（機械可読定義）は `.md` ファイルではないため対象外。

## 後続 route 候補

- F-001〜F-007（冗長排除系）: まとめて1 Issue で「src/opencode-local/ 冗長排除」として整理可能。
- F-004（不完全文）: 単独修正 Issue で即時修正可能。
- F-008（中黒）: リポジトリ全体の中黒使用方針と合わせて判定が必要なため、個別 Issue ではなく用語政策系の横断 Issue で扱うことを推奨。
- F-009（frontmatter 訳語）: document-type-responsibilities.md の訳語表拡充 Issue の一環として扱うことを推奨。
