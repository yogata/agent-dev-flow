# 廃止 REQ/SPEC 由来の SKILL/command 記述残置を inspect 系で検出する仕組み追加

## 背景

REQ/SPEC/ADR が廃止（retired 化、supersede）された際、当該由来の SKILL/command/guide 本文に埋め込まれた運用ルール記述（archive ルール、配置先、ライフサイクル等）まで追跡・整理する仕組みがない。廃止イベントと下流 SKILL 本文の紐付けがなく、文書間で孤儿化したまま停滞する documentation drift が発生する。具体例として、agentdev-learning-pipeline/SKILL.md の「取り込み済みスタブの archive ルール」セクションが REQ-0023 廃止後も残置し、現行 lifecycle SPEC と矛盾する状態で停滞していた。当該セクションは偶発的なテスト戦略精査で発見されるまで検出されなかった。

## 問題

1. inspect-skills/inspect-docs の検出観点に「廃止 REQ/SPEC 由来の記述残置」カテゴリが明示されていない。retired 化された REQ/SPEC ID への言及が SKILL/command/guide 本文に残存していても機械検出されない。
2. REQ/SPEC 廃止手順（req-save/spec-save）に、下流 SKILL/command/guide 記述の横断クリーンアップステップが組み込まれていない。廃止は REQ ファイルの retired/ 化や ADR の supersede 整理にとどまる。

## 望ましい変更

- inspect-skills/inspect-docs の検出観点に「廃止 REQ/SPEC 由来の記述残置」カテゴリを追加する。retired 化された REQ/SPEC への言及（`REQ-NNNN`、SPEC パス参照等）を SKILL/command/guide 本文から横断検索し、finding として検出する。
- REQ/SPEC 廃止手順（req-save/spec-save または専用コマンド）に、下流 SKILL/command/guide 記述のクリーンアップステップを組み込む候補を整備する。

## 対象範囲

### 対象

- inspect-skills skill（検出観点）
- inspect-docs skill（検出観点）
- `docs/specs/integrity/integrity-rule-catalog.md`（検出ルールカタログ、新規カテゴリ候補）
- REQ/SPEC 廃止手順（req-save/spec-save の廃止関連ステップ）

### 対象外

- 個別の retired REQ/SPEC 由来残存記述の即時クリーンアップ（本成果物は仕組み追加が対象、個別是正は別 case）
- check_integrity.ts 本体の実装（検出カテゴリの設計が先行、実装は req-define → case-run で対応）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | inspect-skills/SKILL.md | 検出観点に「廃止 REQ/SPEC 由来の SKILL/command 記述残置」カテゴリを追加候補 |
| skill | inspect-docs/SKILL.md | 検出観点に「廃止 REQ/SPEC 由来の docs 記述残置」カテゴリを追加候補 |
| spec | docs/specs/integrity/integrity-rule-catalog.md | 新規検出ルール（retired REQ/SPEC ID 残存参照検出）の候補エントリ |
| command | req-save.md / spec-save.md | 廃止関連ステップに下流 SKILL/command/guide 横断クリーンアップステップの追加候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分カバー）
- **該当ファイル**: inspect-skills command、inspect-docs command、req-save/spec-save（廃止機能）
- **ギャップ分類**: fix gap + guardrail insufficiency
- **ギャップ詳細**: inspect-skills/inspect-docs は既存の検出観点を持つが、「廃止 REQ/SPEC 由来の記述残置」カテゴリが明示されていない。retired REQ/SPEC ID の grep 横断検索で発見可能な drift が未検出。req-save/spec-save の廃止手順に下流 SKILL/command/guide の横断クリーンアップステップがない。

## 制約

- 検出カテゴリの追加は、retired/ 化された REQ/SPEC のリストをソースとして横断検索する設計とする。活性 REQ/SPEC への言及は検出対象外。
- 廃止手順へのクリーンアップステップ追加は、req-save/spec-save の既存フローを破壊しない追加ステップとする。
- 検出カテゴリの実装（check_integrity.ts 等の検出ロジック）は本成果物の対象外（設計→req-define→case-run で対応）。本成果物は検出観点の設計とカタログ候補エントリの整備が対象。
- REQ/SPEC の supersede（後継 REQ への移行）は retired とは区別し、supersede 元への言及は文脈によって有効な場合があるため、検出は finding（要確認）扱いとする。

## 受け入れ条件

- [ ] inspect-skills/inspect-docs の検出観点に「廃止 REQ/SPEC 由来の記述残置」カテゴリが追加候補として整備されていること
- [ ] retired REQ/SPEC ID をソースとした横断検索の検出設計が記述されていること
- [ ] integrity-rule-catalog.md に新規検出ルールの候補エントリが記載されていること
- [ ] req-save/spec-save の廃止手順に横断クリーンアップステップの追加候補が記載されていること

## 元learning item / 根拠

- **要約**: 廃止 REQ/SPEC 由来の SKILL/command 記述が孤儿化し、inspect 系で検出されない documentation drift が発生する。
- **根拠**: agentdev-learning-pipeline/SKILL.md の「取り込み済みスタブの archive ルール」セクション（旧 388-430行）が、REQ-0023 廃止後も残置していた。当該セクションは REQ-0023 廃止時に整理されるべきだったが、廃止イベントと SKILL 本文の紐付けがなく、孤儿化したまま停滞。Issue #1414 のテスト戦略 TS-005 (3) で偶発的に発見されるまで検出されなかった。本 PR #1415 で当該セクションを削除し、inspect-skills/intake-pipeline の旧 archive 記述も整理した。
- **再発条件**: (a) REQ/SPEC/ADR が廃止・supersede され、(b) 当該由来の記述が SKILL/command/guide 本文に埋め込まれており、(c) 廃止時の横断クリーンアップが実行されない場合。
- **横展開可能性**: REQ/SPEC/ADR 廃止 + 下流 docs 埋め込みの全パターンで発生しうる。特に「運用ルール」「ライフサイクル」「配置先」等の記述は由来 REQ/SPEC の廃止後に陳腐化しやすく、かつ機械的検出が困難。汎用的。

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, process-improvement
- **関連Issue**: Issue #1414、PR #1415、REQ-0023（廃止済み）
