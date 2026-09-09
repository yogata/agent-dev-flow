---
id: REQ-053-TEXTLINT-CORPUS-CORRECTION
title: "textlint corpus 校正・是正と最終検証の実行記録"
status: accepted
created: 2026-09-09
source_issue: "#2728"
parent_epic: "#2723"
---

<!-- ADF-COVERS(implementation): REQ-053-017, REQ-053-018, REQ-053-019, REQ-053-020, REQ-053-021 -->

# textlint corpus 校正・是正と最終検証の実行記録

本 Report は、textlint 文章表層品質共通実行基盤の導入 Epic（#2723）Wave 4（Issue #2728、RA-005 文書全体の移行と最終保証）の実行記録である。規則校正と正式初期判定の分離、固定規則での corpus 是正、最終検査入口による全文検証、ファイル単位の完了証拠を記録する。測定値はすべて本 Report のとおり実測であり、Design 本文へは混在させない（textlint 品質基盤 Design「規則校正と移行検証」節のとおり）。

## 1. 校正記録（規則と severity の固定）

正式初期判定に先立ち、対象全体の実測と誤検出確認に基づき規則構成を固定した。校正の結果、Wave 1〜3 で確立した構成を変更せずそのまま固定する。

| 項目 | 固定内容 |
|---|---|
| 標準構成 | textlint-rule-preset-ja-technical-writing、@textlint-ja/textlint-rule-preset-ai-writing、textlint-rule-prh |
| 拒否対象（severity error） | preset-ja-technical-writing/no-hankaku-kana、no-invalid-control-character、no-nfd、no-zero-width-spaces、prh（標準辞書 rules/default-prh.yml + プロジェクト辞書の追加合成） |
| 助言対象（severity warning） | 上記以外の全規則（文長、漢字連続、文体混在、弱い表現、リスト形式等のヒューリスティック規則） |
| プロジェクト用語辞書 | なし（.agentdev/config/plugins/agentdev-textlint-guard-prh.yml 不在。標準構成だけの正常状態） |
| 対象 | docs/**/*.md（標準）+ src/opencode/commands/**/*.md、src/opencode/skills/**/*.md（追加対象、.agentdev/config/plugins/agentdev-textlint-guard.yaml） |
| 依存版の固定 | package.json + bun.lock、および配布済み vendored engine bundle（vendor/textlint-engine.bundle.json、オフライン起動） |

校正判断の根拠（実測と誤検出確認）:

- 文字品質違反クラス（半角カナ、制御文字、NFD、ゼロ幅スペース）と prh（完全一致検出）は誤検出が確認されていない決定的規則であり、拒否対象として維持する
- 助言対象規則の実測（初期判定 9,390 件）には正規の術語・定着した記述形式への検出が大量に含まれる（max-kanji-continuous-len 2,154 件は正当な術語の連なり、no-ai-list-formatting 2,194 件は定着した「語句: 値」リスト形式等）。意味不備と断定できない検出を不合格の根拠にしない設計契約（ヒューリスティックな規則を一律に拒否対象としない）により、助言対象を維持する
- 正式初期判定の実施後は規則、option、severity を変更していない（事後降格なし、baseline suppression なし）

## 2. 正式初期判定（固定規則での実測）

実行形式: 最終検査入口（gate.ts）による全対象列挙・実ファイル全文検査。対象は worktree .worktrees/2728-feature、修正前（base 6012e3a4 = origin/main）。

| 項目 | 実測値 |
|---|---|
| 検査ファイル数 | 521 |
| 拒否対象違反 | 5 件（すべて prh。文字品質クラスは 0 件） |
| 助言 | 9,390 件 |

初期判定の拒否対象違反（5 件）:

| パス:行 | 規則 | 検出語 |
|---|---|---|
| docs/designs/commands/inspect-docs.md:97 | prh | `source-of-trought` |
| docs/designs/commands/inspect-promote.md:31 | prh | `監査証跠` |
| docs/designs/commands/intake-promote.md:69 | prh | `監査証跠` |
| src/opencode/skills/agentdev-intake-pipeline/references/intake-promotion.md:67 | prh | `監査証跠` |
| src/opencode/skills/agentdev-req-analysis/references/session-context-detection.md:38 | prh | `陈述形式` |

規則別の検出件数（初期判定）:

| 規則 | 拒否対象 | 助言 |
|---|---|---|
| preset-ai-writing/ai-tech-writing-guideline | 0 | 84 |
| preset-ai-writing/no-ai-colon-continuation | 0 | 236 |
| preset-ai-writing/no-ai-emphasis-patterns | 0 | 23 |
| preset-ai-writing/no-ai-hype-expressions | 0 | 16 |
| preset-ai-writing/no-ai-list-formatting | 0 | 2194 |
| preset-ja-technical-writing/arabic-kanji-numbers | 0 | 29 |
| preset-ja-technical-writing/ja-no-mixed-period | 0 | 663 |
| preset-ja-technical-writing/ja-no-redundant-expression | 0 | 212 |
| preset-ja-technical-writing/ja-no-successive-word | 0 | 96 |
| preset-ja-technical-writing/ja-no-weak-phrase | 0 | 3 |
| preset-ja-technical-writing/max-comma | 0 | 58 |
| preset-ja-technical-writing/max-kanji-continuous-len | 0 | 2154 |
| preset-ja-technical-writing/max-ten | 0 | 36 |
| preset-ja-technical-writing/no-doubled-conjunction | 0 | 11 |
| preset-ja-technical-writing/no-doubled-conjunctive-particle-ga | 0 | 2 |
| preset-ja-technical-writing/no-doubled-joshi | 0 | 171 |
| preset-ja-technical-writing/no-exclamation-question-mark | 0 | 24 |
| preset-ja-technical-writing/no-mix-dearu-desumasu | 0 | 499 |
| preset-ja-technical-writing/no-unmatched-pair | 0 | 2 |
| preset-ja-technical-writing/sentence-length | 0 | 2877 |
| prh | 5 | 0 |

## 3. 是正記録（固定規則での是正）

初期判定の拒否対象違反 5 件すべてを意味保持の最小修正で是正した。修正対象はいずれも現行の Design 本文と配布 skill の references であり、Report（docs/reports/）と廃止済み要件（docs/requirements/retired/）等の歴史記録は修正していない。歴史記録の事実照合: 本是正で歴史記録を変更していないため、変更前後の事実差分は存在しない。

| パス:行 | 規則 | 是正前 | 是正後 | 意味保持の判断根拠 |
|---|---|---|---|---|
| docs/designs/commands/inspect-docs.md:97 | prh | `source-of-trought` | `source-of-truth` | 同ファイル93行目・100行目と同じ術語の誤記。誤記修正により意味を一義的に保存する |
| docs/designs/commands/inspect-promote.md:31 | prh | `監査証跠` | `監査証跡` | 誤変換（跠から跡）。標準辞書の固定置換をそのまま適用する |
| docs/designs/commands/intake-promote.md:69 | prh | `監査証跠` | `監査証跡` | 誤変換（跠から跡）。標準辞書の固定置換をそのまま適用する |
| src/opencode/skills/agentdev-intake-pipeline/references/intake-promotion.md:67 | prh | `監査証跠` | `監査証跡` | 誤変換（跠から跡）。標準辞書の固定置換をそのまま適用する |
| src/opencode/skills/agentdev-req-analysis/references/session-context-detection.md:38 | prh | `陈述形式` | `記述形式` | 簡体字の混入。辞書候補（記述形式/表明形式）から「質問ではない」との対比で陳述を表明する文脈に合う候補を採用する |

是正の判断方針:

- 標準辞書の replacement が文脈にそのまま当てはまる場合は固定置換を適用した（`監査証跠` は `監査証跡` への誤変換訂正 3 件）
- `source-of-trought` は同一文書内で正形 `source-of-truth` が用語として確立している誤記であり、誤記の訂正として正形へ戻した（検出テストの境界例も `source-of-trought`（誤記）と `source-of-truth`（正）を区別する設計である）
- 意味を一義的に復元できない箇所は存在せず、推測修正は行っていない。blocked として記録した事項はない（REQ-053-013、REQ-053-017）
- 実ファイル変更なしに合格としたファイルはなく、誤検出の根拠付き証明（REQ-053-018）の適用件数は 0 件である

## 4. 最終検証と初期/最終比較

最終検証は最終検査入口（gate.ts）で全対象の実ファイル全文を検査した（差分、作業用メモ、過去の査読結果には依存しない）。本 Report 自身を含む検査対象全体で拒否対象違反ゼロの合格を最終 HEAD の実ファイルへ再適用して確認する（REQ-053-014〜REQ-053-016）。最終 HEAD の確定値（コミットハッシュ）と最終実行の件数は PR 本文（実行識別情報）に記録する。

初期状態と最終状態の比較（REQ-053-020）:

| 比較項目 | 初期状態 | 最終状態 |
|---|---|---|
| 不合格ファイル数（拒否対象違反あり） | 5 | 0 |
| 拒否対象違反数 | 5 | 0 |
| 既知違反の baseline suppression | 0 件 | 0 件（取り込みなし） |
| 決定的破損（targeted docs guard 変更限定検査） | 0 件 | 0 件（7 変更ファイル、failures 0、warnings 0） |

既知違反を基準値へ登録しての合格扱い、規則緩和、severity の事後降格は行っていない（REQ-053-037、REQ-053-038、REQ-010-074）。

## 5. ファイル単位の完了証拠

全対象ファイルの初期判定、修正有無、確認観点、最終判定、残存助言、blocked をファイル単位で記録する（REQ-053-019）。確認観点は全ファイル共通で「固定規則による全文検査（最終検査入口、両入口同一判定）」であり、表中の「全文・固定規則」はこれを指す。残存助言列は正式初期判定時点の助言件数であり、助言は検査不合格の根拠としない（校正記録のとおり）。本 Report は初期判定時点で未作成のため、初期判定は — とし、最終判定は最終検証の対象に含めて確認する。

| パス | 初期判定 | 修正 | 確認観点 | 最終判定 | 残存助言 | blocked |
|---|---|---|---|---|---|---|
| docs/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| docs/decisions/DEC-001.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| docs/decisions/DEC-002.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/decisions/DEC-003.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| docs/decisions/DEC-004.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/decisions/DEC-005.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/decisions/DEC-006.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/decisions/DEC-007.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| docs/decisions/DEC-008.md | 合格 | 無 | 全文・固定規則 | 合格 | 23 | なし |
| docs/decisions/DEC-009.md | 合格 | 無 | 全文・固定規則 | 合格 | 26 | なし |
| docs/decisions/DEC-010.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| docs/decisions/DEC-011.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| docs/decisions/DEC-012.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| docs/decisions/DEC-013.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| docs/decisions/DEC-014.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| docs/decisions/DEC-015.md | 合格 | 無 | 全文・固定規則 | 合格 | 17 | なし |
| docs/decisions/DEC-016.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/decisions/DEC-017.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/decisions/DEC-019.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/decisions/DEC-020.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/decisions/DEC-021.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/decisions/DEC-022.md | 合格 | 無 | 全文・固定規則 | 合格 | 20 | なし |
| docs/decisions/DEC-023.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/decisions/DEC-024.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/decisions/DEC-025.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/decisions/DEC-026.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| docs/decisions/DEC-027.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/decisions/DEC-028.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/decisions/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 29 | なし |
| docs/designs/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 29 | なし |
| docs/designs/authoring/command-file-format.md | 合格 | 無 | 全文・固定規則 | 合格 | 32 | なし |
| docs/designs/authoring/dependency-version-compatibility.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/designs/authoring/vocabulary-registry.md | 合格 | 無 | 全文・固定規則 | 合格 | 21 | なし |
| docs/designs/commands/_template.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/designs/commands/backlog-auto.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/designs/commands/backlog-review.md | 合格 | 無 | 全文・固定規則 | 合格 | 48 | なし |
| docs/designs/commands/case-auto.md | 合格 | 無 | 全文・固定規則 | 合格 | 110 | なし |
| docs/designs/commands/case-close.md | 合格 | 無 | 全文・固定規則 | 合格 | 64 | なし |
| docs/designs/commands/case-open.md | 合格 | 無 | 全文・固定規則 | 合格 | 109 | なし |
| docs/designs/commands/case-run.md | 合格 | 無 | 全文・固定規則 | 合格 | 109 | なし |
| docs/designs/commands/case-update.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| docs/designs/commands/design-save.md | 合格 | 無 | 全文・固定規則 | 合格 | 70 | なし |
| docs/designs/commands/inspect-docs.md | 不合格（1） | 有 | 全文・固定規則 | 合格 | 24 | なし |
| docs/designs/commands/inspect-promote.md | 不合格（1） | 有 | 全文・固定規則 | 合格 | 34 | なし |
| docs/designs/commands/inspect-skills.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| docs/designs/commands/intake-capture.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/designs/commands/intake-from-github.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| docs/designs/commands/intake-promote.md | 不合格（1） | 有 | 全文・固定規則 | 合格 | 28 | なし |
| docs/designs/commands/issue.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/designs/commands/learning-promote.md | 合格 | 無 | 全文・固定規則 | 合格 | 32 | なし |
| docs/designs/commands/req-define.md | 合格 | 無 | 全文・固定規則 | 合格 | 100 | なし |
| docs/designs/commands/req-save.md | 合格 | 無 | 全文・固定規則 | 合格 | 26 | なし |
| docs/designs/commands/third-party-sync.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/foundations/decision-lifecycle.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/designs/foundations/design-principles.md | 合格 | 無 | 全文・固定規則 | 合格 | 25 | なし |
| docs/designs/foundations/document-model.md | 合格 | 無 | 全文・固定規則 | 合格 | 93 | なし |
| docs/designs/foundations/harness-separation-model.md | 合格 | 無 | 全文・固定規則 | 合格 | 23 | なし |
| docs/designs/foundations/numbering-policy.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/designs/foundations/patterns.md | 合格 | 無 | 全文・固定規則 | 合格 | 15 | なし |
| docs/designs/foundations/project-extensions.md | 合格 | 無 | 全文・固定規則 | 合格 | 25 | なし |
| docs/designs/foundations/references/concrete-abstraction.md | 合格 | 無 | 全文・固定規則 | 合格 | 15 | なし |
| docs/designs/foundations/references/verification-scope-catalog.md | 合格 | 無 | 全文・固定規則 | 合格 | 87 | なし |
| docs/designs/foundations/system.md | 合格 | 無 | 全文・固定規則 | 合格 | 384 | なし |
| docs/designs/foundations/traceability-model.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/designs/integrity/autogen-freshness-gate.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| docs/designs/integrity/backticks-identifier-threshold.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/designs/integrity/checker-execution-contracts.md | 合格 | 無 | 全文・固定規則 | 合格 | 47 | なし |
| docs/designs/integrity/content-corruption-checker.md | 合格 | 無 | 全文・固定規則 | 合格 | 24 | なし |
| docs/designs/integrity/distribution-boundary.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| docs/designs/integrity/docs-spec-rebuild-integrity.md | 合格 | 無 | 全文・固定規則 | 合格 | 30 | なし |
| docs/designs/integrity/index-auto-generation.md | 合格 | 無 | 全文・固定規則 | 合格 | 46 | なし |
| docs/designs/integrity/integrity-contracts.md | 合格 | 無 | 全文・固定規則 | 合格 | 98 | なし |
| docs/designs/integrity/integrity-rule-catalog.md | 合格 | 無 | 全文・固定規則 | 合格 | 43 | なし |
| docs/designs/integrity/prose-quality-sentinel-checks.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| docs/designs/integrity/references/targeted-docs-guard-implementation-details.md | 合格 | 無 | 全文・固定規則 | 合格 | 15 | なし |
| docs/designs/integrity/references/validator-internal-config.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rule-ownership.md | 合格 | 無 | 全文・固定規則 | 合格 | 24 | なし |
| docs/designs/integrity/rules/IR-001-req-frontmatter-id-filename.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-002-req-required-frontmatter.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-003-active-retired-req-id-conflict.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-004-req-index-actual-consistency.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-005-adr-req-bidirectional-reference.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/integrity/rules/IR-006-command-allowed-frontmatter.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-007-skill-name-dir-match.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-008-skill-references-existence.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-009-obsolete-namespace-residual.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-010-adr-status-normalization.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-012-template-required-sections.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-013-variant-path-existence.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/integrity/rules/IR-014-singular-reference-dir-residual.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-015-retired-req-current-ref-detection.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-016-source-projection-integrity.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-018-req-range-notation-freshness.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-020-baseline-known-vs-new-finding.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-021-retired-skill-reference-detection.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-023-integrity-artifact-validator-drift.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-024-command-readme-actual.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-025-retired-adr-path-rule.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-027-retired-adr-current-authority-citation.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/integrity/rules/IR-028-command-top-step-int-only.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/designs/integrity/rules/IR-029-command-alphabet-substep-prohibition.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/integrity/rules/IR-030-subagent-verbatim-conditional-return.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/integrity/rules/IR-031-findings-capture-heading-unification.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-032-delegation-type-on-result-envelope-prohibition.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/integrity/rules/IR-033-lightweight-delegation-primary-pattern-prohibition.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-034-skill-internal-section-step-reference-detection.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-035-skill-see-also-detection-perspective.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-037-retired-adr-current-baseline-ref.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-038-decision-index-consistency.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-039-index-req-title-consistency.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-040-retired-req-authority-comment.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-041-retired-req-broken-link.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-042-hardcoded-req-count.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-043-retired-readme-coverage.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md | 合格 | 無 | 全文・固定規則 | 合格 | 20 | なし |
| docs/designs/integrity/rules/IR-046-consumer-generated-repo-type-fp-prevention.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/integrity/rules/IR-047-src-opencode-local-link-origin-dir-structure.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-048-generated-by-identifier-integrity.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/designs/integrity/rules/IR-049-command-file-format-violation.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/integrity/rules/IR-050-load-skills-command-mis-specification.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/integrity/rules/IR-051-executor-skill-notation-misrecognition.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/integrity/rules/IR-052-completion-grep-pattern-design.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/designs/integrity/rules/IR-053-gh-direct-invocation-detection.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/integrity/rules/IR-054-draft-spec-abandonment-detection.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/designs/integrity/rules/IR-056-project-extensions-integrity.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/designs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| docs/designs/integrity/rules/IR-058-distribution-untracked-skill-reference.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/designs/integrity/rules/IR-059-distribution-reference-boundary.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/designs/integrity/rules/IR-060-forbidden-japanese-word-detection.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/designs/integrity/rules/IR-061-index-generation-consistency.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/designs/integrity/rules/IR-062-reference-path-existence.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| docs/designs/integrity/rules/IR-063-common-policy-identifier-invariant.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/designs/integrity/rules/IR-064-unresolved-placeholder.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/designs/integrity/rules/IR-065-obsolete-vocabulary-current-use.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/designs/integrity/rules/IR-066-legacy-path-removed-name.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/designs/integrity/rules/IR-068-skill-projection-manifest.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/designs/integrity/targeted-docs-guard-implementation.md | 合格 | 無 | 全文・固定規則 | 合格 | 32 | なし |
| docs/designs/integrity/test-impact-detection-gate.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/designs/integrity/validator-split-criteria.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/designs/local/install-script-usability.md | 合格 | 無 | 全文・固定規則 | 合格 | 32 | なし |
| docs/designs/local/local-case-file.md | 合格 | 無 | 全文・固定規則 | 合格 | 25 | なし |
| docs/designs/local/runtime-package-boundary.md | 合格 | 無 | 全文・固定規則 | 合格 | 75 | なし |
| docs/designs/local/third-party-skill-management.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/designs/quality/design-health-metrics.md | 合格 | 無 | 全文・固定規則 | 合格 | 15 | なし |
| docs/designs/quality/quality-gates.md | 合格 | 無 | 全文・固定規則 | 合格 | 41 | なし |
| docs/designs/quality/quality-specs.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/designs/quality/req-health-metrics.md | 合格 | 無 | 全文・固定規則 | 合格 | 29 | なし |
| docs/designs/quality/textlint-quality-runtime.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/designs/responsibilities/artifact-contracts.md | 合格 | 無 | 全文・固定規則 | 合格 | 77 | なし |
| docs/designs/responsibilities/artifact-quality-control-routing.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| docs/designs/responsibilities/artifact-responsibilities.md | 合格 | 無 | 全文・固定規則 | 合格 | 24 | なし |
| docs/designs/responsibilities/custom-tool-contracts.md | 合格 | 無 | 全文・固定規則 | 合格 | 33 | なし |
| docs/designs/responsibilities/document-type-responsibilities.md | 合格 | 無 | 全文・固定規則 | 合格 | 49 | なし |
| docs/designs/responsibilities/req-impact-map.md | 合格 | 無 | 全文・固定規則 | 合格 | 35 | なし |
| docs/designs/responsibilities/responsibility-boundary-purification.md | 合格 | 無 | 全文・固定規則 | 合格 | 44 | なし |
| docs/designs/skills/_template.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/skills/agentdev-adversarial-review.md | 合格 | 無 | 全文・固定規則 | 合格 | 48 | なし |
| docs/designs/skills/agentdev-architecture-advisory.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/designs/skills/agentdev-artifact-validation.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| docs/designs/skills/agentdev-backlog-integration.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| docs/designs/skills/agentdev-case-run-execution-adapter.md | 合格 | 無 | 全文・固定規則 | 合格 | 33 | なし |
| docs/designs/skills/agentdev-command-authoring.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/designs/skills/agentdev-command-creator.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/skills/agentdev-conventional-commits.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/designs/skills/agentdev-decision-file-manager.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/designs/skills/agentdev-decision-guidelines.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/designs/skills/agentdev-design-file-manager.md | 合格 | 無 | 全文・固定規則 | 合格 | 22 | なし |
| docs/designs/skills/agentdev-doc-diagnostics.md | 合格 | 無 | 全文・固定規則 | 合格 | 17 | なし |
| docs/designs/skills/agentdev-epic-tracker.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/skills/agentdev-git-worktree-test-fallback.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/designs/skills/agentdev-git-worktree.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/designs/skills/agentdev-inspect-skills.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/designs/skills/agentdev-intake-pipeline.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| docs/designs/skills/agentdev-issue-management.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/designs/skills/agentdev-issue-tracking.md | 合格 | 無 | 全文・固定規則 | 合格 | 23 | なし |
| docs/designs/skills/agentdev-learning-capture.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/designs/skills/agentdev-learning-pipeline.md | 合格 | 無 | 全文・固定規則 | 合格 | 23 | なし |
| docs/designs/skills/agentdev-project-extensions.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/designs/skills/agentdev-quality-gates.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| docs/designs/skills/agentdev-req-analysis.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| docs/designs/skills/agentdev-req-file-manager.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/designs/skills/agentdev-req-structure-diagnostics.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/designs/skills/agentdev-skill-authoring.md | 合格 | 無 | 全文・固定規則 | 合格 | 28 | なし |
| docs/designs/skills/agentdev-traceability.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/designs/skills/agentdev-workflow-backlog-auto.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/designs/skills/agentdev-workflow-lifecycle.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/skills/agentdev-workflow-orchestration.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/skills/agentdev-workflow-routing.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/designs/skills/agentdev-workflow-templates.md | 合格 | 無 | 全文・固定規則 | 合格 | 17 | なし |
| docs/designs/workflows/backlog-artifact-lifecycle.md | 合格 | 無 | 全文・固定規則 | 合格 | 20 | なし |
| docs/designs/workflows/capture-boundaries.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| docs/designs/workflows/delegation-contracts.md | 合格 | 無 | 全文・固定規則 | 合格 | 55 | なし |
| docs/designs/workflows/epic-wave-model.md | 合格 | 無 | 全文・固定規則 | 合格 | 49 | なし |
| docs/designs/workflows/input-resolution-and-durable-state.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/designs/workflows/references/execution-unit-construction.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/designs/workflows/step-reference-contract.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/designs/workflows/workflow-contracts.md | 合格 | 無 | 全文・固定規則 | 合格 | 63 | なし |
| docs/designs/workflows/workflow-skill-model.md | 合格 | 無 | 全文・固定規則 | 合格 | 25 | なし |
| docs/guides/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/guides/artifacts-and-state.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/guides/charter.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| docs/guides/command-selection.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/guides/consumer-project-setup.md | 合格 | 無 | 全文・固定規則 | 合格 | 23 | なし |
| docs/guides/diagnostics-and-maintenance.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/guides/glossary.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/guides/intake-learning-backlog-flow.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/guides/project-docs-and-specs.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/guides/quickstart.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/guides/req-case-flow.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| docs/guides/troubleshooting.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/knowledge/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/knowledge/windows-powershell-bulk-io-corruption.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/reports/experiment-case-withdrawal-final-verification.md | 合格 | 無 | 全文・固定規則 | 合格 | 47 | なし |
| docs/reports/experiment-case-withdrawal-inventory.md | 合格 | 無 | 全文・固定規則 | 合格 | 22 | なし |
| docs/reports/integrity/audits/bidirectional-audit-20260811.md | 合格 | 無 | 全文・固定規則 | 合格 | 109 | なし |
| docs/reports/integrity/audits/candidate-limit-tim-catalog-diff-20260818.md | 合格 | 無 | 全文・固定規則 | 合格 | 15 | なし |
| docs/reports/integrity/audits/classification-20260811.md | 合格 | 無 | 全文・固定規則 | 合格 | 51 | なし |
| docs/reports/integrity/audits/cross-cutting-integration-design-20260811.md | 合格 | 無 | 全文・固定規則 | 合格 | 58 | なし |
| docs/reports/integrity/audits/final-reverification-20260811.md | 合格 | 無 | 全文・固定規則 | 合格 | 60 | なし |
| docs/reports/integrity/audits/ng21-provenance-classification-20260816.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| docs/reports/integrity/audits/req-045-consistency-audit-20260822.md | 合格 | 無 | 全文・固定規則 | 合格 | 368 | なし |
| docs/reports/integrity/audits/req-057-integrity-suite-implementation-audit-20260904.md | 合格 | 無 | 全文・固定規則 | 合格 | 39 | なし |
| docs/reports/integrity/baselines/pre-audit-baseline-20260811.md | 合格 | 無 | 全文・固定規則 | 合格 | 31 | なし |
| docs/reports/integrity/docmap-reference-audit.md | 合格 | 無 | 全文・固定規則 | 合格 | 33 | なし |
| docs/reports/integrity/normalizations/ou-020-adr-vocabulary-sweep-20260904.md | 合格 | 無 | 全文・固定規則 | 合格 | 33 | なし |
| docs/reports/integrity/normalizations/req-046-normalization-20260822.md | 合格 | 無 | 全文・固定規則 | 合格 | 141 | なし |
| docs/reports/local/artifact-graph-effect-evaluation.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/reports/req-048-baseline-v2-audit.md | 合格 | 無 | 全文・固定規則 | 合格 | 48 | なし |
| docs/reports/req-048-baseline-v2-definition.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| docs/reports/req-048-baseline-v2-measurement.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| docs/reports/req-048-candidate-ranking.md | 合格 | 無 | 全文・固定規則 | 合格 | 41 | なし |
| docs/reports/req-048-correlation-derivability-audit.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| docs/reports/req-048-dead-responsibility-cleanup.md | 合格 | 無 | 全文・固定規則 | 合格 | 25 | なし |
| docs/reports/req-048-experiment-g1-definition.md | 合格 | 無 | 全文・固定規則 | 合格 | 36 | なし |
| docs/reports/req-048-experiment-g2-definition.md | 合格 | 無 | 全文・固定規則 | 合格 | 59 | なし |
| docs/reports/req-048-experiment-g3-definition.md | 合格 | 無 | 全文・固定規則 | 合格 | 51 | なし |
| docs/reports/req-048-experiment-g4-definition.md | 合格 | 無 | 全文・固定規則 | 合格 | 43 | なし |
| docs/reports/req-048-reanalysis-baseline.md | 合格 | 無 | 全文・固定規則 | 合格 | 22 | なし |
| docs/requirements/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/requirements/REQ-001.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/requirements/REQ-002.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| docs/requirements/REQ-003.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| docs/requirements/REQ-004.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/requirements/REQ-005.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/requirements/REQ-006.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| docs/requirements/REQ-007.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/requirements/REQ-008.md | 合格 | 無 | 全文・固定規則 | 合格 | 15 | なし |
| docs/requirements/REQ-009.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| docs/requirements/REQ-010.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| docs/requirements/REQ-011.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/requirements/REQ-012.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/requirements/REQ-014.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/requirements/REQ-015.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/requirements/REQ-016.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/requirements/REQ-017.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| docs/requirements/REQ-018.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/requirements/REQ-019.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| docs/requirements/REQ-021.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| docs/requirements/REQ-027.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/requirements/REQ-029.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/requirements/REQ-030.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/requirements/REQ-031.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/requirements/REQ-032.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| docs/requirements/REQ-033.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/requirements/REQ-034.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| docs/requirements/REQ-035.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/requirements/REQ-036.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| docs/requirements/REQ-037.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/requirements/REQ-038.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/requirements/REQ-039.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| docs/requirements/REQ-041.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/requirements/REQ-044.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/requirements/REQ-045.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/requirements/REQ-046.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/requirements/REQ-047.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/requirements/REQ-048.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/requirements/REQ-049.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/requirements/REQ-050.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/requirements/REQ-051.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/requirements/REQ-052.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| docs/requirements/REQ-053.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| docs/requirements/REQ-054.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/requirements/REQ-055.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/requirements/REQ-056.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/requirements/REQ-057.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| docs/requirements/REQ-058.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| docs/requirements/retired/REQ-013.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/requirements/retired/REQ-020.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/requirements/retired/REQ-022.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/requirements/retired/REQ-023.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| docs/requirements/retired/REQ-024.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| docs/requirements/retired/REQ-025.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| docs/requirements/retired/REQ-026.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| docs/requirements/retired/REQ-028.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| docs/requirements/retired/REQ-040.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| docs/requirements/retired/REQ-042.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| docs/requirements/retired/REQ-043.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/commands/agentdev/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| src/opencode/commands/agentdev/backlog-auto.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| src/opencode/commands/agentdev/backlog-review.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| src/opencode/commands/agentdev/case-auto.md | 合格 | 無 | 全文・固定規則 | 合格 | 26 | なし |
| src/opencode/commands/agentdev/case-close.md | 合格 | 無 | 全文・固定規則 | 合格 | 17 | なし |
| src/opencode/commands/agentdev/case-open.md | 合格 | 無 | 全文・固定規則 | 合格 | 15 | なし |
| src/opencode/commands/agentdev/case-run.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| src/opencode/commands/agentdev/case-update.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/commands/agentdev/design-save.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| src/opencode/commands/agentdev/inspect-docs.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| src/opencode/commands/agentdev/inspect-promote.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| src/opencode/commands/agentdev/inspect-skills.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| src/opencode/commands/agentdev/intake-capture.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| src/opencode/commands/agentdev/intake-from-github.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| src/opencode/commands/agentdev/intake-promote.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| src/opencode/commands/agentdev/issue.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| src/opencode/commands/agentdev/learning-promote.md | 合格 | 無 | 全文・固定規則 | 合格 | 21 | なし |
| src/opencode/commands/agentdev/req-define.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| src/opencode/commands/agentdev/req-save.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| src/opencode/commands/agentdev/templates/backlog-review/partial.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/backlog-review/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/commands/agentdev/templates/backlog-review/zero-promoted.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/case-close/agentdev-push-failed.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| src/opencode/commands/agentdev/templates/case-close/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/case-close/worktree-cleanup-failed.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| src/opencode/commands/agentdev/templates/case-run/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/case-update/body.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/case-update/comment.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/case-update/req.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/case-update/review-ng.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/common/git-error-messages.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| src/opencode/commands/agentdev/templates/inspect-docs/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/commands/agentdev/templates/inspect-promote/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/inspect-skills/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| src/opencode/commands/agentdev/templates/intake-capture/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/intake-from-github/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/intake-promote/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/issue/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/commands/agentdev/templates/learning-promote/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/req-define/feature-epic.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/commands/agentdev/templates/req-define/feature.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/commands/agentdev/templates/req-define/lightweight.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/commands/agentdev/templates/req-define/req-draft.md | 合格 | 無 | 全文・固定規則 | 合格 | 1 | なし |
| src/opencode/commands/agentdev/templates/req-save/epic.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/templates/req-save/split-detected.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| src/opencode/commands/agentdev/templates/req-save/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/commands/agentdev/third-party-sync.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| src/opencode/skills/agentdev-adversarial-review/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 34 | なし |
| src/opencode/skills/agentdev-adversarial-review/references/adversarial-review-protocol.md | 合格 | 無 | 全文・固定規則 | 合格 | 32 | なし |
| src/opencode/skills/agentdev-architecture-advisory/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| src/opencode/skills/agentdev-architecture-advisory/references/architecture-review-delegation.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| src/opencode/skills/agentdev-artifact-validation/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 17 | なし |
| src/opencode/skills/agentdev-artifact-validation/scripts/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| src/opencode/skills/agentdev-backlog-integration/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| src/opencode/skills/agentdev-backlog-integration/references/integration-judgment.md | 合格 | 無 | 全文・固定規則 | 合格 | 29 | なし |
| src/opencode/skills/agentdev-backlog-integration/references/learning-outcome-routing.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 75 | なし |
| src/opencode/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md | 合格 | 無 | 全文・固定規則 | 合格 | 24 | なし |
| src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md | 合格 | 無 | 全文・固定規則 | 合格 | 63 | なし |
| src/opencode/skills/agentdev-command-authoring/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 32 | なし |
| src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md | 合格 | 無 | 全文・固定規則 | 合格 | 42 | なし |
| src/opencode/skills/agentdev-command-authoring/references/common-policy-identifiers.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| src/opencode/skills/agentdev-command-creator/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| src/opencode/skills/agentdev-conventional-commits/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| src/opencode/skills/agentdev-decision-file-manager/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| src/opencode/skills/agentdev-decision-file-manager/references/validation-and-consistency.md | 合格 | 無 | 全文・固定規則 | 合格 | 20 | なし |
| src/opencode/skills/agentdev-decision-file-manager/templates/doc_decision.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| src/opencode/skills/agentdev-decision-guidelines/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 41 | なし |
| src/opencode/skills/agentdev-design-file-manager/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 20 | なし |
| src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/skills/agentdev-design-file-manager/references/target-area-matching.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| src/opencode/skills/agentdev-design-file-manager/scripts/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| src/opencode/skills/agentdev-doc-diagnostics/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 17 | なし |
| src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md | 合格 | 無 | 全文・固定規則 | 合格 | 27 | なし |
| src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-routing.md | 合格 | 無 | 全文・固定規則 | 合格 | 18 | なし |
| src/opencode/skills/agentdev-doc-diagnostics/references/finding-output-contract.md | 合格 | 無 | 全文・固定規則 | 合格 | 15 | なし |
| src/opencode/skills/agentdev-epic-tracker/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| src/opencode/skills/agentdev-epic-tracker/references/regex-and-merge-conflict.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-git-worktree/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md | 合格 | 無 | 全文・固定規則 | 合格 | 89 | なし |
| src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 合格 | 無 | 全文・固定規則 | 合格 | 54 | なし |
| src/opencode/skills/agentdev-inspect-skills/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 33 | なし |
| src/opencode/skills/agentdev-inspect-skills/references/execution-subject-misclassification.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md | 合格 | 無 | 全文・固定規則 | 合格 | 35 | なし |
| src/opencode/skills/agentdev-inspect-skills/references/skill-frontmatter-name-backtick.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| src/opencode/skills/agentdev-inspect-skills/references/spec-operation-contract-consistency.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| src/opencode/skills/agentdev-intake-pipeline/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| src/opencode/skills/agentdev-intake-pipeline/references/intake-extraction.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| src/opencode/skills/agentdev-intake-pipeline/references/intake-promotion.md | 不合格（1） | 有 | 全文・固定規則 | 合格 | 6 | なし |
| src/opencode/skills/agentdev-issue-management/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| src/opencode/skills/agentdev-issue-tracking/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-learning-capture/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| src/opencode/skills/agentdev-learning-capture/references/capture-entry-template.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| src/opencode/skills/agentdev-learning-capture/references/example.md | 合格 | 無 | 全文・固定規則 | 合格 | 23 | なし |
| src/opencode/skills/agentdev-learning-pipeline/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| src/opencode/skills/agentdev-learning-pipeline/references/deferred-atomic-move-procedure.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| src/opencode/skills/agentdev-learning-pipeline/references/disposition-and-artifact-schema.md | 合格 | 無 | 全文・固定規則 | 合格 | 28 | なし |
| src/opencode/skills/agentdev-learning-pipeline/references/inbox-and-evaluation-schema.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| src/opencode/skills/agentdev-learning-pipeline/references/promote-judgment-logic.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| src/opencode/skills/agentdev-project-extensions/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 28 | なし |
| src/opencode/skills/agentdev-project-extensions/scripts/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/skills/agentdev-quality-gates/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| src/opencode/skills/agentdev-quality-gates/references/case-run-pre-delegation-staleness-check.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| src/opencode/skills/agentdev-quality-gates/references/common-gate-contract.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| src/opencode/skills/agentdev-quality-gates/references/qg-1-definition-integrity.md | 合格 | 無 | 全文・固定規則 | 合格 | 62 | なし |
| src/opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md | 合格 | 無 | 全文・固定規則 | 合格 | 44 | なし |
| src/opencode/skills/agentdev-quality-gates/references/qg-3-implementation-deviation.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | 合格 | 無 | 全文・固定規則 | 合格 | 89 | なし |
| src/opencode/skills/agentdev-req-analysis/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 22 | なし |
| src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md | 合格 | 無 | 全文・固定規則 | 合格 | 53 | なし |
| src/opencode/skills/agentdev-req-analysis/references/investigation-scope-refinement.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-req-analysis/references/req-define-detailed-gates.md | 合格 | 無 | 全文・固定規則 | 合格 | 24 | なし |
| src/opencode/skills/agentdev-req-analysis/references/session-context-detection.md | 不合格（1） | 有 | 全文・固定規則 | 合格 | 14 | なし |
| src/opencode/skills/agentdev-req-analysis/references/test-strategy-numeric-threshold-guide.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-req-analysis/references/verification-log.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| src/opencode/skills/agentdev-req-analysis/references/wall-methodology.md | 合格 | 無 | 全文・固定規則 | 合格 | 22 | なし |
| src/opencode/skills/agentdev-req-file-manager/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 32 | なし |
| src/opencode/skills/agentdev-req-file-manager/references/create-append-update-flow.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| src/opencode/skills/agentdev-req-file-manager/references/matching-and-merge.md | 合格 | 無 | 全文・固定規則 | 合格 | 12 | なし |
| src/opencode/skills/agentdev-req-file-manager/references/numbering-and-validation.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/skills/agentdev-req-file-manager/scripts/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| src/opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md | 合格 | 無 | 全文・固定規則 | 合格 | 6 | なし |
| src/opencode/skills/agentdev-req-structure-diagnostics/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 14 | なし |
| src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md | 合格 | 無 | 全文・固定規則 | 合格 | 59 | なし |
| src/opencode/skills/agentdev-skill-authoring/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| src/opencode/skills/agentdev-skill-authoring/references/design-principles.md | 合格 | 無 | 全文・固定規則 | 合格 | 42 | なし |
| src/opencode/skills/agentdev-skill-authoring/references/development-workflow.md | 合格 | 無 | 全文・固定規則 | 合格 | 20 | なし |
| src/opencode/skills/agentdev-skill-authoring/references/review-protocol.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| src/opencode/skills/agentdev-traceability/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 24 | なし |
| src/opencode/skills/agentdev-traceability/scripts/README.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| src/opencode/skills/agentdev-workflow-backlog-auto/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 35 | なし |
| src/opencode/skills/agentdev-workflow-backlog-auto/references/fan-in-and-reporting.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-workflow-backlog-auto/references/stage-execution.md | 合格 | 無 | 全文・固定規則 | 合格 | 17 | なし |
| src/opencode/skills/agentdev-workflow-backlog-review/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 59 | なし |
| src/opencode/skills/agentdev-workflow-backlog-review/references/analysis-composition-and-review.md | 合格 | 無 | 全文・固定規則 | 合格 | 29 | なし |
| src/opencode/skills/agentdev-workflow-backlog-review/references/contradiction-ru-and-persistence.md | 合格 | 無 | 全文・固定規則 | 合格 | 21 | なし |
| src/opencode/skills/agentdev-workflow-case-auto/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 47 | なし |
| src/opencode/skills/agentdev-workflow-case-auto/references/conflict-resolution-and-reporting.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| src/opencode/skills/agentdev-workflow-case-auto/references/input-resolution-and-orchestration.md | 合格 | 無 | 全文・固定規則 | 合格 | 23 | なし |
| src/opencode/skills/agentdev-workflow-case-auto/references/stop-and-decision-resolution.md | 合格 | 無 | 全文・固定規則 | 合格 | 33 | なし |
| src/opencode/skills/agentdev-workflow-case-close/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 60 | なし |
| src/opencode/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md | 合格 | 無 | 全文・固定規則 | 合格 | 23 | なし |
| src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md | 合格 | 無 | 全文・固定規則 | 合格 | 39 | なし |
| src/opencode/skills/agentdev-workflow-case-close/references/epic-wave-close.md | 合格 | 無 | 全文・固定規則 | 合格 | 31 | なし |
| src/opencode/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md | 合格 | 無 | 全文・固定規則 | 合格 | 32 | なし |
| src/opencode/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md | 合格 | 無 | 全文・固定規則 | 合格 | 21 | なし |
| src/opencode/skills/agentdev-workflow-case-open/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 37 | なし |
| src/opencode/skills/agentdev-workflow-case-open/references/adversarial-review-integration.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| src/opencode/skills/agentdev-workflow-case-open/references/execution-unit-and-preflight.md | 合格 | 無 | 全文・固定規則 | 合格 | 18 | なし |
| src/opencode/skills/agentdev-workflow-case-open/references/handoff-and-ou-gate.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| src/opencode/skills/agentdev-workflow-case-open/references/issue-body-and-execution-contract.md | 合格 | 無 | 全文・固定規則 | 合格 | 37 | なし |
| src/opencode/skills/agentdev-workflow-case-open/references/issue-creation-flows.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-workflow-case-open/references/termination-and-cleanup.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| src/opencode/skills/agentdev-workflow-case-run/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 40 | なし |
| src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md | 合格 | 無 | 全文・固定規則 | 合格 | 54 | なし |
| src/opencode/skills/agentdev-workflow-case-run/references/epic-wave.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| src/opencode/skills/agentdev-workflow-case-run/references/single.md | 合格 | 無 | 全文・固定規則 | 合格 | 56 | なし |
| src/opencode/skills/agentdev-workflow-case-update/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 18 | なし |
| src/opencode/skills/agentdev-workflow-case-update/references/update-flows.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| src/opencode/skills/agentdev-workflow-design-save/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 33 | なし |
| src/opencode/skills/agentdev-workflow-design-save/references/placement-and-save.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-workflow-design-save/references/verification-and-persistence.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| src/opencode/skills/agentdev-workflow-inspect-docs/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 20 | なし |
| src/opencode/skills/agentdev-workflow-inspect-docs/references/distribution-check-and-output.md | 合格 | 無 | 全文・固定規則 | 合格 | 13 | なし |
| src/opencode/skills/agentdev-workflow-inspect-docs/references/scan-and-doc-diagnostics.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 48 | なし |
| src/opencode/skills/agentdev-workflow-inspect-promote/references/auto-promote-and-review.md | 合格 | 無 | 全文・固定規則 | 合格 | 31 | なし |
| src/opencode/skills/agentdev-workflow-inspect-promote/references/hitl-and-disposition.md | 合格 | 無 | 全文・固定規則 | 合格 | 47 | なし |
| src/opencode/skills/agentdev-workflow-inspect-promote/references/inbox-scan-and-classification.md | 合格 | 無 | 全文・固定規則 | 合格 | 28 | なし |
| src/opencode/skills/agentdev-workflow-inspect-skills/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 18 | なし |
| src/opencode/skills/agentdev-workflow-inspect-skills/references/finding-output-and-persist.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/skills/agentdev-workflow-inspect-skills/references/skill-structure-diagnostics.md | 合格 | 無 | 全文・固定規則 | 合格 | 7 | なし |
| src/opencode/skills/agentdev-workflow-intake-capture/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-workflow-intake-from-github/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-workflow-intake-promote/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 44 | なし |
| src/opencode/skills/agentdev-workflow-intake-promote/references/classification-and-review.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| src/opencode/skills/agentdev-workflow-intake-promote/references/hitl-persistence-and-destructive.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| src/opencode/skills/agentdev-workflow-issue/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 23 | なし |
| src/opencode/skills/agentdev-workflow-learning-promote/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 45 | なし |
| src/opencode/skills/agentdev-workflow-learning-promote/references/analysis-and-review.md | 合格 | 無 | 全文・固定規則 | 合格 | 20 | なし |
| src/opencode/skills/agentdev-workflow-learning-promote/references/hitl-and-persistence.md | 合格 | 無 | 全文・固定規則 | 合格 | 24 | なし |
| src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-workflow-lifecycle/references/reference-resolution.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| src/opencode/skills/agentdev-workflow-lifecycle/references/structured-stage-handoff.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| src/opencode/skills/agentdev-workflow-orchestration/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 19 | なし |
| src/opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md | 合格 | 無 | 全文・固定規則 | 合格 | 30 | なし |
| src/opencode/skills/agentdev-workflow-orchestration/references/case-auto-recovery.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md | 合格 | 無 | 全文・固定規則 | 合格 | 11 | なし |
| src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md | 合格 | 無 | 全文・固定規則 | 合格 | 39 | なし |
| src/opencode/skills/agentdev-workflow-req-define/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 24 | なし |
| src/opencode/skills/agentdev-workflow-req-define/references/adversarial-review-integration.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/skills/agentdev-workflow-req-define/references/draft-generation.md | 合格 | 無 | 全文・固定規則 | 合格 | 16 | なし |
| src/opencode/skills/agentdev-workflow-req-define/references/input-and-dialogue.md | 合格 | 無 | 全文・固定規則 | 合格 | 9 | なし |
| src/opencode/skills/agentdev-workflow-req-define/references/requirement-development.md | 合格 | 無 | 全文・固定規則 | 合格 | 35 | なし |
| src/opencode/skills/agentdev-workflow-req-save/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 33 | なし |
| src/opencode/skills/agentdev-workflow-req-save/references/indexes-and-persistence.md | 合格 | 無 | 全文・固定規則 | 合格 | 32 | なし |
| src/opencode/skills/agentdev-workflow-req-save/references/precheck-and-req-ops.md | 合格 | 無 | 全文・固定規則 | 合格 | 21 | なし |
| src/opencode/skills/agentdev-workflow-routing/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/skills/agentdev-workflow-routing/references/case-update-procedure.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| src/opencode/skills/agentdev-workflow-routing/references/next-command-rules.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| src/opencode/skills/agentdev-workflow-routing/references/review-ng.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| src/opencode/skills/agentdev-workflow-templates/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 17 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/case-open/epic.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/case-open/multi-req-epic.md | 合格 | 無 | 全文・固定規則 | 合格 | 4 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/case-open/standard.md | 合格 | 無 | 全文・固定規則 | 合格 | 5 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_analysis.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_feature_implementation.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_feature_technical.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_review_ng.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_update.md | 合格 | 無 | 全文・固定規則 | 合格 | 2 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_bug.md | 合格 | 無 | 全文・固定規則 | 合格 | 8 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md | 合格 | 無 | 全文・固定規則 | 合格 | 3 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_epic.md | 合格 | 無 | 全文・固定規則 | 合格 | 0 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md | 合格 | 無 | 全文・固定規則 | 合格 | 10 | なし |
| src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md | 合格 | 無 | 全文・固定規則 | 合格 | 15 | なし |
| src/opencode/skills/agentdev-workflow-third-party-sync/SKILL.md | 合格 | 無 | 全文・固定規則 | 合格 | 18 | なし |
| docs/reports/req-053-textlint-corpus-correction.md | —（未作成） | —（新規作成） | 全文・固定規則 | 合格（最終検証で確認） | —（本 Report 自身） | なし |

## 6. blocked と残存事項

- blocked なし。全拒否対象違反は意味保持修正で解消し、意味復元不能箇所は存在しなかった
- 残存する助言 9,390 件（初期判定時点）は固定 severity の助言対象であり、検査不合格の根拠としない
- IR-055 の既知 baseline 警告（agentdev-git-worktree/references/worktree-operations.md:146 の未解決参照）は本変更の対象外であり、origin/main と同一の状態を維持する。本是正の合格判定の阻止要因として新たに扱っていない

## 7. 検証観点と実行形態

- TS-008（二入口の同一性と bypass 検出の corpus 適用）: gate.test.ts が同一全文・パス・規則・設定での判定差分ゼロ、拒否件数一致、外部書込み違反の最終検査による検出、docs-check 非依存を検証する。本 Case で追加した corpus 適用回帰（是正パターンの両入口同一判定と bypass 検出）を含む
- TS-013（corpus への導入と最終保証）: 本 Report の校正記録と正式初期判定の分離（§1、§2）、固定規則での是正（§3）、最終検証と初期/最終比較（§4）、ファイル単位の完了証拠（§5）、歴史記録の事実照合（§3）が証拠である
- 実行形式: worktree .worktrees/2728-feature（branch feature/issue-2728）、bun 実行、UTF-8（BOM なし）・LF での編集。Shell リダイレクトによる証跡出力は行わず、node による UTF-8 ファイル書き出しを使用した
