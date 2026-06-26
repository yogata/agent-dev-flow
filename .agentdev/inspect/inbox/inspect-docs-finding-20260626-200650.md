---
title: "inspect-docs finding: docs全体意味整合性診断 (Phase 4 第2層)"
command: inspect-docs
generated_at: 2026-06-26T20:06:50+09:00
generator: Sisyphus-Junior (inspect-docs Phase 4 第2層)
spec: docs/specs/commands/inspect-docs.md
scope: docs/requirements/, docs/adr/, docs/specs/, docs/guides/, docs/DOC-MAP.md, README.md, .opencode/
source_of_truth_priority: 現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides
phase_context: |
  Phase 4（第2層 inspect-docs）実行。
  REQ-0155（文書粒度モデル、8要件）、REQ-0156（docs/specs 基盤SPECドメイン別体系化、9要件）、
  REQ-0154-003（基盤SPEC status 追跡）の制定後。
  docs/specs/ は6ドメイン構造（foundations/responsibilities/quality/integrity/local/authoring/）
  + integrity/rules/（IR-NNN 53件、IR-045は削除済み）。
---

# inspect-docs 検出事項: docs全体意味整合性診断

## 目的

`docs/specs/commands/inspect-docs.md` Step 1-16 に従い、docs全体（REQ/ADR/SPEC/guides/DOC-MAP）の意味整合性を診断した結果を成果物とする。検査対象の直接修正は行わない（G01）。

## 診断サマリ

| 項目 | 値 |
|------|-----|
| スキャン対象 REQ（現行） | 48 件（REQ-0101〜REQ-0156、欠番 8 件含まず） |
| スキャン対象 REQ（retired） | 58 件（REQ-0001〜REQ-0050 + 廃止 REQ 8 件） |
| スキャン対象 ADR（現行） | 24 件（accepted 21 + superseded 2 + deprecated 1） |
| スキャン対象 ADR（retired） | 23 件（ADR-0001〜ADR-0023） |
| スキャン対象 SPEC | 100 件（commands 17 + skills 28 + workflows 5 + 基盤SPEC 50 + IR 53） |
| スキャン対象 guides | 11 件 |
| 検出事項合計 | 12 件（HIGH 3 / MEDIUM 5 / LOW 4） |

### 観点別検出件数

| Step | 観点 | 検出件数 |
|------|------|----------|
| Step 5 | SPEC 意味診断 | 2 件（HIGH 1、LOW 1） |
| Step 7 | guides 意味診断 | 1 件（LOW 1） |
| Step 8 | DOC-MAP 意味診断 | 1 件（LOW 1） |
| Step 9 | REQ structure review（6観点） | 7 件（MOVE 6、DRIFT 1） |
| Step 10 | 文書分類一貫性（SPEC 分離基準違反） | 上記 Step 9 MOVE 6 件と同一（重複出力せず） |
| Step 12 | 未処理 artifact | 1 件（HIGH、複数カテゴリ集約） |

### 6観点（Step 9）内訳

| 観点 | 件数 |
|------|------|
| SPLIT | 0 件（REQ-0155 は観察メモ、要件化せず） |
| MERGE | 0 件 |
| MOVE | 6 件 |
| DUPLICATE | 0 件 |
| RETIRE | 0 件 |
| DRIFT | 1 件 |

## 検出事項一覧

### Finding 1: runtime-package-boundary.md 将来内容の SPEC 残留

- **観点**: Step 5 SPEC 意味診断
- **対象**: `docs/specs/local/runtime-package-boundary.md`
- **確信度**: HIGH
- **根拠**:
  - L17: `| plugin-future | 将来の plugin/npm/package 配布形態 | 現在は未対応 | plugin が管理する実行時位置 | （将来） |`
  - L97-100: `### Plugin-future（将来）` セクション。本文 "現在は要件定義のみ。npm/package 配布時に `.opencode/` が plugin により管理される形態を想定。"
  - L134: `| Plugin / npm / package | 未対応 | 将来対応 | REQ-0103-064 |`
  - L159: `| plugin-future | （将来定義） | - |`
- **判定**: SPEC は「現在どう動作しているか」を記述する（document-model.md 責務マトリックス）。`plugin-future` リポジトリ種別は現在未対応であり、「将来」「未対応」「（将来定義）」は SPEC の対象外（REQ の「満たすべき成果」または ADR の判断対象）。
- **source-of-truth 判定**: SPEC（runtime-package-boundary.md）が現行アーキテクチャ基準として不適切。REQ-0103-064 が「将来の選択肢扱い」と REQ 側で要約済みであり、SPEC 側の詳細は過剰。
- **推奨 route**: `MOVE`（SPEC から REQ/ADR へ）。`plugin-future` 型の詳細セクションを runtime-package-boundary.md から削除し、REQ-0103-064 を参照する1行（「将来の plugin 配布形態は REQ-0103-064 参照」）へ縮退。
- **req-define 入力案**: 「runtime-package-boundary.md の `plugin-future` リポジトリ種別エントリを将来計画として SPEC から除去し、REQ 側の要約参照のみ残す」

### Finding 2: IR-053/IR-054 regression_test "(追加予定)" の SPEC 残留

- **観点**: Step 5 SPEC 意味診断
- **対象**: `docs/specs/integrity/rules/IR-053-gh-direct-invocation-detection.md` L15、`docs/specs/integrity/rules/IR-054-draft-spec-abandonment-detection.md` L15
- **確信度**: LOW
- **根拠**:
  - IR-053 L15: `| regression_test | (追加予定)。gh 直接記述を含むテストデータ（fixture）で検出されること、standard-procedures.md で検出されないことを検証する |`
  - IR-054 L15: `| regression_test | (追加予定)。既知 true positive として updated を閾値以上過去日とした draft SPEC fixture が報告されること...`
- **判定**: "(追加予定)" は将来の実装計画を含み、SPEC の「現在どう動作しているか」原則に対し境界ケース。ただし regression_test フィールド自体が「現在実装されているか」を示す現状記載でもあるため、即時違反とは断定できない。
- **source-of-truth 判定**: SPEC の現状記載として許容範囲内だが、表記は "(追加予定)" ではなく "未実装" または空欄運用が SPEC 原則により整合。
- **推奨 route**: `UPDATE`（表記調整）。"(追加予定)" → "未実装（REQ-0108-055 遵守にて追加予定）" 等の現状記載への修正。
- **req-define 入力案**: —（運用改善、要件変更不要）

### Finding 3: REQ-0114-024 case-open Step 13a 直接参照

- **観点**: Step 9 MOVE / Step 10 SPEC 分離基準違反（Step 番号直接参照）
- **対象**: `docs/requirements/REQ-0114.md` REQ-0114-024
- **確信度**: HIGH
- **根拠**: `| REQ-0114-024 | case-open 相当処理で、case-open.md Step 13a と同一条件で RU ファイルを削除すること |`
- **判定**: REQ-0136-031 が「現行 REQ の要件行は command 定義または SPEC の Step 番号を直接参照せず、機能名・フェーズ名で参照する」を宣言。本件は "Step 13a" の Step 番号直接参照であり、IR-044 Step 番号直接参照検出の true positive。
- **source-of-truth 判定**: 現行 REQ（REQ-0136-031）が本参照形式を禁止。REQ-0114-024 は現行 REQ に違反。
- **推奨 route**: `MOVE`（機能名参照へ置換）。"case-open.md Step 13a" → "case-open の RU 削除工程" 等の機能名参照へ修正。
- **req-define 入力案**: 「REQ-0114-024 の "case-open.md Step 13a" を機能名参照（"case-open の RU 削除工程" 等）へ置換」

### Finding 4: REQ-0102-074 test_strategy 3要素のスキーマフィールド残留

- **観点**: Step 9 MOVE / Step 10 SPEC 分離基準違反（schema field 残留）
- **対象**: `docs/requirements/REQ-0102.md` REQ-0102-074
- **確信度**: MEDIUM
- **根拠**: `| REQ-0102-074 | req-define は要件展開において test_strategy（テスト戦略）を定義すること。各 test strategy 項目は verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素で構成すること |`
- **判定**: "verification / pass_criteria / on_failure" の3フィールド名列举はスキーマフィールド詳細。test_strategy の3要素構成は安定契約候補（利用者可視）だが、フィールド名まで REQ 行に残留すると SPEC 分離基準（REQ-0101-068 schema field 移管候補）に抵触。
- **source-of-truth 判定**: REQ-0101-069 安定契約例外「利用者に見える分類体系」の境界ケース。3要素の存在は安定契約だが、フィールド名まで列挙するかは解釈が分かれる。
- **推奨 route**: `UPDATE`（安定契約の要約化）。"各 test strategy 項目は検証手順・合格基準・不合格時処置の3要素で構成すること（フィールドスキーマは SPEC 参照）" への修正、または REQ-0101-069 例外明記。
- **req-define 入力案**: 「REQ-0102-074 の test_strategy フィールド詳細を SPEC（req-define.md 等）へ移管し、REQ 側は3要素構成の安定契約要約のみ残す」

### Finding 5: REQ-0108-100 severity enum 値一覧残留

- **観点**: Step 9 MOVE / Step 10 SPEC 分離基準違反（enum 値一覧残留）
- **対象**: `docs/requirements/REQ-0108.md` REQ-0108-100
- **確信度**: MEDIUM
- **根拠**: `| REQ-0108-100 | docs-check の検出事項は strict / heuristic / observation のいずれかに分類すること |`
- **判定**: "strict / heuristic / observation" の3値列举は enum 値一覧。severity 分類体系は安定契約（利用者可視、docs-check レポートで使用）だが、値の列挙は SPEC 分離基準（REQ-0101-068 enum 値一覧移管候補）に抵触。
- **source-of-truth 判定**: REQ-0101-069 安定契約例外「利用者に見える分類体系」に該当する可能性が高く、即時違反とは断定し難い。確信度 MEDIUM。
- **推奨 route**: `UPDATE`（安定契約例外の明記、または要約化）。REQ-0101-069 例外適用を明記するか、"severity で分類すること（詳細は SPEC）" への修正。
- **req-define 入力案**: —（REQ-0101-069 例外適用の明記で対応可能、要件変更は軽微）

### Finding 6: REQ-0108-153 gate_level enum 値一覧残留

- **観点**: Step 9 MOVE / Step 10 SPEC 分離基準違反（enum 値一覧残留）
- **対象**: `docs/requirements/REQ-0108.md` REQ-0108-153
- **確信度**: MEDIUM
- **根拠**: `| REQ-0108-153 | 検査層は3層であること: full audit（全ルール実行）/ delta guard（変更関連ルールのみ実行）/ impact guard（影響範囲ルールのみ実行） |`
- **判定**: "full audit / delta guard / impact guard" の3値列举は enum 値一覧。3層構造は安定契約（利用者可視、docs-check 運用で使用）だが、各層の名称と説明の列挙は SPEC 分離基準に抵触。
- **source-of-truth 判定**: Finding 5 と同様、REQ-0101-069 安定契約例外境界。確信度 MEDIUM。
- **推奨 route**: `UPDATE`（安定契約例外の明記、または要約化）。
- **req-define 入力案**: —（Finding 5 と同方針）

### Finding 7: REQ-0148-007/009/018 実装パラメータ（数値上限）残留

- **観点**: Step 9 MOVE / Step 10 SPEC 分離基準違反（実装パラメータ残留）
- **対象**: `docs/requirements/REQ-0148.md` REQ-0148-007, REQ-0148-009, REQ-0148-018
- **確信度**: LOW-MEDIUM
- **根拠**:
  - REQ-0148-007: `case-open は依存強度（必須/弱/関連）、Epic サイズ（推奨3-10子Issue、上限10）、機能的一貫性の3軸で最終 Epic 構成を自律生成すること`
  - REQ-0148-009: `case-open は Epic サイズ上限10子Issueをハード制約として守ること`
  - REQ-0148-018: `case-auto レベルでのグローバル並列上限は設定せず、case-run 単位の5件上限（REQ-0130-026 踏襲）のみを制御対象とすること`
- **判定**: "3-10子Issue"、"上限10"、"5件上限" は実装パラメータ（行数上限に類する）。ただし REQ-0101-069 安定契約例外「安全境界」に該当する可能性が高い（Epic サイズ上限は並列実行の安全境界）。
- **source-of-truth 判定**: 安定契約例外「安全境界」境界ケース。確信度 LOW-MEDIUM。
- **推奨 route**: `UPDATE`（安定契約例外の明記）。REQ-0101-069「安全境界」例外を明記するか、数値を SPEC へ移管して REQ 側は「Epic サイズ上限（詳細は SPEC）」へ要約化。
- **req-define 入力案**: —（REQ-0101-069 例外適用の明記で対応可能）

### Finding 8: REQ-0144-013 検出 regex パターンの SPEC 詳細残留

- **観点**: Step 9 MOVE / Step 10 SPEC 分離基準違反（内部アルゴリズム残留）
- **対象**: `docs/requirements/REQ-0144.md` REQ-0144-013
- **確信度**: LOW
- **根拠**: `| REQ-0144-013 | SPEC↔source 同期検査は "Sisyphus-Junior\(ulw-loop\)" パターンを恒久的に検出する |`
- **判定**: "Sisyphus-Junior\(ulw-loop\)" は検出 regex パターン詳細（内部アルゴリズム）。ただし本パターンは安定契約（誤分類表記の恒久検出）としての性質も持つ。
- **source-of-truth 判定**: 安定契約例外境界。確信度 LOW。
- **推奨 route**: `UPDATE`（安定契約例外の明記）。
- **req-define 入力案**: —

### Finding 9: docs/guides/project-docs-and-specs.md REQ 範囲表記の陳腐化（DRIFT）

- **観点**: Step 9 DRIFT
- **対象**: `docs/guides/project-docs-and-specs.md` L26
- **確信度**: HIGH
- **根拠**: L26: `現行 REQ は REQ-0101 から REQ-0152 までの 44 件（REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は廃止、履歴参照のみ）`
- **判定**: 現行は REQ-0101〜REQ-0156（48 件）。当該 guide の "REQ-0152 までの 44 件" は陳腐化。REQ-0144-007「docs/guides/*.md の REQ 範囲表記は実 REQ 最大番号に追従すること」に違反。
- **source-of-truth 判定**: 現行 REQ（REQ-0144-007）と現状（REQ-0156/48件）が優先。guide が陳腐化。
- **推奨 route**: `UPDATE`（guide の範囲表記更新）。"REQ-0101 から REQ-0156 までの 48 件" への修正。
- **req-define 入力案**: —（運用是正、要件変更不要。REQ-0144-007 は現行 REQ として有効、実装の陳腐化のみ）

### Finding 10: docs/guides/consumer-project-setup.md 内の歴史的記述（guide 範囲超過）

- **観点**: Step 7 guides 意味診断
- **対象**: `docs/guides/consumer-project-setup.md` L130
- **確信度**: LOW
- **根拠**: L130: `agentdev-integrity（旧 integrity skill）は AgentDevFlow 配布対象外となった（ADR-0106）。`
- **判定**: REQ-0115-041（履歴混入検出時は route 追加）に照らし、"旧 integrity skill" / "配布対象外となった" は歴史的記述。guide はナビゲーション層（ADR-0103）であり、改名履歴は ADR/retired 文書参照へ留めるべき。
- **source-of-truth 判定**: ADR-0106（承認済み）が配布対象外の根拠。guide 側は ADR-0106 参照のみで十分。
- **推奨 route**: `UPDATE`（参照へ縮退）。"AgentDevFlow 配布対象外（ADR-0106 参照）" への修正。
- **req-define 入力案**: —

### Finding 11: DOC-MAP.md セクション見出しの陳腐化

- **観点**: Step 8 DOC-MAP 意味診断
- **対象**: `docs/DOC-MAP.md` L121
- **確信度**: LOW
- **根拠**: L121: `### その他 SPEC（`specs/` 直下）` だが、実際には SPEC は foundations/, responsibilities/, quality/, integrity/, local/, authoring/ の6サブディレクトリへ移動済み（REQ-0156）。
- **判定**: セクション見出しの "specs/ 直下" は現状（サブディレクトリ配下）と不整合。ただし DOC-MAP は索引（document-model.md）であり、各 SPEC 行のリンク先は新パスへ更新済みのため実害は軽微。
- **source-of-truth 判定**: 現状（6ドメインサブディレクトリ）が優先。見出し表記が陳腐化。
- **推奨 route**: `UPDATE`（見出し修正）。"その他 SPEC（基盤SPEC群）" 等の現状整合表記へ修正。
- **req-define 入力案**: —

### Finding 12: 未処理 artifact の蓄積

- **観点**: Step 12 未処理 artifact 確認
- **対象**: `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md`、`.agentdev/inspect/inbox/`
- **確信度**: HIGH（事実確認）
- **根拠**:
  - **intake inbox**: 23 件の未処理 item（`2026-06-24-issue1105-*.md` から `2026-06-26-pr1200-*.md` まで）。最古 2026-06-24、最新 2026-06-26。
  - **intake promoted**: 0 件（`.gitkeep` のみ）。
  - **learning inbox.md**: 7 件の未処理 entry（gh pr merge、Issue 事前状態、duty keyword、PR #1122 X-6、gh CLI mojibake、SUB-D gloss、case-open direct scope）。
  - **learning promoted**: 0 件（`.gitkeep` のみ）。
  - **backlog/req-units**: 0 件（`.gitkeep` のみ）。
  - **inspect inbox（既存）**: 5 件（em-dash 関連 4 件 + 前回 inspect-docs finding 1 件 `inspect-docs-finding-20260625-202639.md`）。
  - **inspect promoted**: 0 件（`.gitkeep` のみ）。
- **判定**: 多量の未処理 artifact が蓄積。本診断の検出事項（12件）は `intake-promote` / `learning-promote` / `inspect-promote` / `backlog-review` の各工程で順次処理されるべき。本 finding 自体も `inspect-promote` 待ちとなる。
- **潜在的影響**:
  - intake inbox 23 件は新規要件化作業候補。一部は REQ-0140/0144/0145 体系化で既に取り込み済みの可能性あり、`intake-promote` での重複確認が必要。
  - learning inbox 7 件は `learning-promote` での恒久契約昇華検討候補。
  - inspect inbox の em-dash 関連 4 件は既存 finding（`inspect-promote` 対象）。
- **source-of-truth 判定**: artifact lifecycle（`.agentdev/README.md` 状態表）に従い、各工程の入力として処理されるべき。本診断では処理しない（G04）。
- **推奨 route**: 各 lifecycle command の実行（`intake-promote` / `learning-promote` / `inspect-promote`）。本 finding は `inspect-promote` にて採用／却下判定される。

## 観察メモ（要件化せず）

### REQ-0155 SPLIT シグナル（1シグナル、観察留め）

REQ-0155「文書粒度モデル」は8要件で7関心事（SPEC 5論理区分、文書7分類、粒度ゲート、RU運用、learning制約、レポジトリ種別非区別、局所物理分離）を扱う。SPLIT 診断のシグナル (a)「1つのREQに複数の関心対象」に該当するが、REQ-0155 の「目的」が「7項目を統合的に管理し」と明示的に統合を宣言しており、関心対象の総体として説明可能。シグナル閾値（1シグナルのみ → 観察メモ留め、検出事項化せず）に従い本診断では要件化しない。

### REQ-0146 SPLIT シグナル（要継続観察）

REQ-0146「実行契約・委譲・プロセス設計」はタイトルが3トピック（実行契約・委譲・プロセス設計）を含む。要件行は各トピックが関連しつつも独立して扱われている。本診断では詳細読込から SPLIT シグナル (a) のみ検出。要件化には2シグナル以上が必要なため観察留め。

## false positive 記録（再診断時の効率化のため）

以下のパターンは機械的 grep で検出されるが、本診断では false positive と判定した。

### FP-1: REQ-9001〜REQ-9009 参照

- **対象**: `docs/specs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md` L15, L88-89
- **理由**: `scripts/check_integrity.test.ts` のテスト fixture 用仮想 REQ ID。実在しないが、テストデータ識別子として文書化されている。REQ 参照 ID 整合性違反ではない。

### FP-2: ADR-0000〜ADR-0099 参照

- **対象**: `docs/specs/integrity/rules/IR-025-retired-adr-path-rule.md` L9
- **理由**: "`docs/adr/ADR-0*.md`（ADR-0000〜ADR-0099）の存在確認" は数値範囲表記（glob パターン `ADR-0*.md` の人間可読説明）。個別 ID 参照ではない。

### FP-3: REQ-0101-068 SPEC 分離基準 META 規則行

- **対象**: `docs/requirements/REQ-0101.md` REQ-0101-068
- **理由**: SPEC 分離基準自体を定義する META 規則行（REQ-0145-012 exemption 対象）。スキーマフィールド名や enum 値を列挙するが、それは SPEC 詳細の記述ではなく責務範囲の規定。

### FP-4: workflow-contracts.md "実行計画" 表現

- **対象**: `docs/specs/workflows/workflow-contracts.md` L79
- **理由**: SSoT 遷移表の「説明」列で "要件doc + 実行計画" と記載。これは SSoT が保持する現状成果物の説明であり、将来計画ではない。

### FP-5: X-1〜X-7 機械的置換残存（前回診断の対象）

- **対象**: 全 docs（REQ-0102.md L83 "において" 等）
- **理由**: 前回 `inspect-docs-finding-20260625-202639.md` で機械的置換パターン（X-1〜X-7）として網羅カタログ化済み。本診断の対象（構造・意味整合性）とは軸が異なるため再計上せず。

## source-of-trouth priority 遵守状況

- G05（現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides）: 全 finding で遵守。Finding 9（guide の陳腐化）は現行 REQ（REQ-0144-007）を優先し guide を古い側と判定。Finding 1（SPEC 将来内容）は REQ-0103-064 を優先し SPEC 過剰と判定。
- ADR-0123（SPEC lifecycle）: 全 SPEC status 判定で遵守。REQ-0154-003 に基づく基盤SPEC status 追跡は `docs/specs/README.md` の status 列で集約管理されており、DOC-MAP は重複管理しない（REQ-0154-001）。

## 推奨アクション優先度順

1. **HIGH**: Finding 12（未処理 artifact 処理）→ 各 lifecycle command 実行
2. **HIGH**: Finding 9（project-docs-and-specs.md REQ 範囲表記更新）→ 直接修正可（guide のみ）
3. **HIGH**: Finding 3（REQ-0114-024 Step 13a 直接参照）→ req-save または req-define で修正
4. **HIGH**: Finding 1（runtime-package-boundary.md plugin-future 除去）→ spec-save で修正
5. **MEDIUM**: Finding 4/5/6（REQ-0102-074, REQ-0108-100/153 enum/field 残留）→ req-save で安定契約例外明記または SPEC 移管
6. **LOW**: Finding 7/8/10/11/2 → 運用改善または後続 RU で対応

## See Also

- [inspect-docs SPEC](../../../docs/specs/commands/inspect-docs.md)
- [agentdev-req-structure-diagnostics skill](../../../src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md)
- [document-model.md SPEC 分離基準](../../../docs/specs/foundations/document-model.md#spec-分離基準)
- [前回 inspect-docs finding（X-1〜X-7 カタログ）](inspect-docs-finding-20260625-202639.md)
