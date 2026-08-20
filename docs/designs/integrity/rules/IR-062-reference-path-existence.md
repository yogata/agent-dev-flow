---
title: skill/command パス参照実在
status: accepted
created: 2026-08-20
updated: 2026-08-20
---

# IR-062: skill/command パス参照実在

## 検出対象

command 定義（`.opencode/commands/agentdev/*.md`）、skill の SKILL.md、および skill の reference ファイル（`references/*.md`）に記述されたパス参照（`scripts/`、`templates/`、`references/` 配下の `.ts`/`.md`）が実ファイルを指すことを検証する。
サブディレクトリを含むネスト参照（例: `templates/case-open/standard.md`、`scripts/src/alloc-req-number.ts`）を検出対象とする（RU-0009、AG-016）。

## 検出方法

1. 対象ファイルからパス参照パターンを抽出する。コードブロック内部、glob（`*`）、`{...}`/`<...>` placeholder は対象外とする
2. 抽出した参照を次の順で解決する:
   - リポジトリルート相対（`.opencode/skills/...`、`.opencode/commands/...`）: 実投影パス → `src/opencode/` fallback
   - skill 相対（`scripts/`、`templates/`、`references/` 先頭）: 自 skill ディレクトリ
   - 未解決の場合: 近接コンテキストの skill 名（前後5行）→ 全 skill 探索（command 定義と reference ファイルのみ適用）
3. SKILL.md のみ、他 skill に実在する bare 参照を cross-skill NG として報告する（明示パスへの修正を促す）。reference ファイルは正当な他 skill 資産への言及があり得るため文脈解決で ok とする
4. いずれにも解決しない参照を NG（broken-reference）として報告する

backtick 囲みパス成分はパス解決前に除去する（REQ-036-008）。
パスセグメントの正規表現は ASCII 系文字に限定し、CJK 句読点に隣接した参照が句読点を跨いで延長されることを防ぐ。

## severity

strict（参照切れは broken-reference として即時修正対象）

## カタログフィールド

| Field | Value |
|-------|-------|
| rule_id | IR-062 |
| description | skill/command reference 内の templates/ 等へのパス参照が実ファイルを指すこと（ネストサブディレクトリ参照を含む） |
| severity | strict |
| category | broken-reference |
| detection_method | `checkScriptTemplateReferencePaths`（check_integrity.ts）によるパス抽出と存在確認 |
| affected_artifacts | [commands, skills, templates, scripts, references] |
| related_req | [REQ-028-012, REQ-010] |
| related_design | [integrity-contracts.md, agentdev-skill-authoring.md, agentdev-command-authoring.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。CJK 句読点隣接はパスセグメント正規表現で終端する。reference ファイルの他 skill 資産への正当な裸パス言及は文脈解決で対象外とする |
| regression_test | `check_reference_paths.test.ts`（ネスト参照の正常/異常、reference ファイル走査、CJK 句読点隣接、cross-skill 文脈解決を同一ケースで整備） |
| finding_route | intake |
| triage_action | 参照先実ファイルを作成する、または参照パスを修正する |
| last_verified | 2026-08-16 |

## 8項目存在条件の充足（REQ-028-012 (a)、IR 存在資格 gate）

1. canonical basis: REQ-028-012、`agentdev-skill-authoring.md`/`agentdev-command-authoring.md` の検証観点（参照先実ファイル存在確認）
2. invariant: skill/command reference のパス参照は実ファイルを指す
3. executable detector: `checkScriptTemplateReferencePaths`（check_integrity.ts。他検出との共有 detector）
4. regression test: `check_reference_paths.test.ts`（正常/異常 fixture を同一ケースで保持）
5. execution route: docs-check（`/repo/docs-check` → check_integrity.ts、full-audit / delta-guard で到達可能）
6. finding route: intake（`/agentdev/intake-capture`）
7. 他 IR 非包含: IR-008（SKILL.md の references/ 実在）、IR-013（completion-reports/ 種別パス）、IR-055（docs パス系の導入先未解決参照）はいずれも本 invariant と独立
8. severity / gate_level 実行可能性: strict / full-audit + delta-guard により機械判定で完結する

## (b) hard governance 追加 gate の充足（blocking strict IR）

本 IR は従来から `check_integrity.ts` が実装し docs-check を blocking してきた `reference-path-existence` 検出の catalog 登録（正典化）であり、新規検出統制の新設ではない。DEC-001 決定4 の7条件は次のとおり充足する:

1. 既存統制と重複しない（既存 IR 群は本 invariant を包含しない。未登録検出の正典化である）
2. 既存統制を置換しない（既存 IR の廃止を伴わない）
3. 削除/統合/interface 縮小との関係: 検出器は既存単一関数の拡張（ネスト対応、reference ファイル走査）であり新規検出器を追加しない
4. 本質的制約: 参照のみが存在し実ファイルが不存在する状態（設計意図のみの参照）は配布物の機能障害に直結する
5. 機械的検証可能: パス抽出とファイル存在確認のみで意味判断を要しない
6. 運用コスト: 既存の docs-check 実行経路に乗り、追加の実行コストを発生させない
7. 例外条件と false positive 抑制方式は本ファイル「検出方法」に文書化済み

## 関連

- 検出器: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（`checkScriptTemplateReferencePaths`）
- 回帰テスト: `.opencode/skills/repo-agentdev-integrity/scripts/check_reference_paths.test.ts`
- 実体化テンプレート: `src/opencode/skills/agentdev-workflow-templates/templates/case-open/`（standard.md、epic.md、multi-req-epic.md）
- 関連 REQ: REQ-028-012（新規 IR 登録 gate）、REQ-010（docs-check）
