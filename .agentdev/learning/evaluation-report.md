# 評価レポート

## メタデータ
- **実行日時**: 2026-07-23 (実行タイムゾーン: Etc/GMT-9)
- **対象エントリ数**: 4件（inbox: 4件、deferred: 44件参照）
- **問題クラス数**: 4（全て未分類クラスタ。inbox 4エントリは根本原因・再発条件・予防策が相互に異なり、同一問題クラスにグループ化不可）
- **inbox フォーマット**: 全エントリ旧フォーマット（由来/問題/再発防止候補/影響/検出元/日付）。正規化マッピング（状況/事象 → 問題事象、原因 → 根本原因、対策/解決策/教訓 → 自律対応内容/予防策候補）を解析時適用。元ファイルは書き換えず。

## 問題クラス一覧

### 問題クラス1: QG-3 誤検知パターン（spec_readme_update_required / extensions_check_required / requirements_readme_update_required）

- **根本原因**: `check_changed_docs.ts` のフラグ判定が「変更ファイルパス・差分有無」ベースであり、変更の意味内容（REQ 相互参照追加のみ、SPEC 内参照表記是正のみ等の軽微変更）を考慮しない。判定ロジックが意味的差分ではなく機械的差分に基づく。
- **再発条件**: SPEC 一覧表や extensions 配下を含む（または過去に含んでいた）ファイルに対し、README 更新や extensions への影響を生まない軽微な変更を行った場合。
- **予防策**: フラグ判定を行レベル差分ベースへ変更、または README 更新必須判定を frontmatter 変更時に限定、または false positive 抑止フラグ追加。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 同一問題クラスで2件（Wave 1 PR #1745、Wave 2 PR #1746 で同一誤検知が再発）。基準「2件=2」。 |
| 影響度 | 3/5 | 中。QG-3 信頼性低下、agent の判断負荷増大。誤って不合格扱いされるわけではないが、agent が毎回誤検知を解釈・処理する負荷が累積する。 |
| 横展開性 | 4/5 | 高い。他の `check_*.ts` 系フラグ判定（case-close targeted docs guard 等）でも同パターンが再発済み。変更差分ベースでフラグを立てる判定ロジック全般に適用可能。 |
| 反映先明確度 | 5/5 | 特定済み。`scripts/check_changed_docs.ts` のフラグ判定ロジック。予防策候補3案も inbox に明示済み。 |
| 自動化適性 | 4/5 | 容易。行レベル差分ベース判定への切替は技術的に確立されており、CI で自動実行可能。 |
| プロジェクト固有知識再利用性 | 4/5 | 高い。AgentDevFlow docs check 固有だが、機械判定ベースのフラグ設計一般に適用可能な知見。 |
| 再発可能性 | 4/5 | 高い。Wave 1→2 で連続再発中。対策しない限り毎 Wave の軽微変更で継続再発。 |
| 費用対効果 | 4/5 | 良い。行レベル差分判定の実装コストは中程度だが、毎 Wave の agent 負荷削減効果が大きい。 |
| **加重合計** | **30/40** | |

- **推奨処分案**: **staged**（既存 command へ反映）。`docs-check` command および `check_changed_docs.ts` 改善。ただし `check_changed_docs.ts` は `src/scripts/` 配下の配布物であるため、昇華経路（promoted → backlog-review → req-define → req-save → case-open → case-run）を経て改修が必要。promoted 成果物は「QG-3 フラグ判定の意味差分考慮要件」として扱う。

#### エントリ一覧
- 2026-07-23: QG-3 誤検知パターン: spec_readme_update_required / extensions_check_required [inbox]（Wave 1 PR #1745、Wave 2 PR #1746 で再発追記済み）

---

### 問題クラス2: Phase 1 一括 commit 運用パターンにおける子Issue 完了判定の case-close への偏在

- **根本原因**: Phase 1（RU 一括 commit 保存）と Phase 2（case-open による子Issue 分割）の分離基準が明文化されておらず、Phase 1 で8 AG を一括保存すると子Issue case-run は実装追加でなく acceptance criteria 順位検証と小改善が主体となる。結果、子Issue の実質的完了判定が case-close に集中する。
- **再発条件**: Epic で Phase 1 一括 commit 運用を採用し、Phase 2 case-open で子Issue を分割した場合。Wave 1〜3 で同パターン再発済み。
- **予防策**: Phase 1 一括保存と Phase 2 case-open の分離基準の明文化。acceptance criteria 順位検証のみの子Issue と実装追加の子Issue の完了条件テンプレート分離。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | Wave 1（#1737, #1738）、Wave 2（#1739, #1740）、Wave 3（#1741）で同パターン再発。実質3-4件。 |
| 影響度 | 2/5 | 小。子Issue の完了条件評価が case-close で都度行う負荷。プロジェクト進行を止める程ではなく、acceptance criteria 順位検証自体は子Issue の正当な役割。 |
| 横展開性 | 2/5 | 限定。Phase 1 一括 commit + Phase 2 case-open の運用を採用する Epic に限定。他プロジェクト運用では発生しない。 |
| 反映先明確度 | 3/5 | 候補あり。`agentdev-workflow-lifecycle` skill または `case-open` command。ただし具体手順（分離基準、完了条件テンプレート）はまだ曖昧。 |
| 自動化適性 | 2/5 | 低い。acceptance criteria 順位検証のみか実装追加かの判断は人間の運用判断が必要。機械化困難。 |
| プロジェクト固有知識再利用性 | 3/5 | 中程度。AgentDevFlow の Epic 実行運用固有の知見。 |
| 再発可能性 | 4/5 | 高い。運用基準が明文化されない限り、Phase 1 一括 commit 運用の Epic で継続再発。 |
| 費用対効果 | 3/5 | 妥当。分離基準の明文化コストは中、効果は case-close 負荷の軽減。 |
| **加重合計** | **23/40** | |

- **推奨処分案**: **deferred**（運用論に近く、具体手順が曖昧。`workflow-lifecycle` skill への反映候補だが、出現2件以上でも即時昇華には至らない。次回再評価対象として living pool で維持）。

#### エントリ一覧
- 2026-07-23: Phase 1 一括 commit 運用パターン: 子Issue case-run が acceptance criteria 確認主体 [inbox]

---

### 問題クラス3: SPEC 起票時の用語表記揺れ横断確認不足

- **根本原因**: SPEC 起票時に用語統一チェックが不十分。`spec-health-metrics.md` 「SPEC 横断診断」節に「論理区分不当混成」（機械化境界段落）と「論理区分不当混在」（検出パターンテーブル行）の表記揺れが同一節内に残留。REQ-0108-285（「論理区分の不当な混在」）、Issue #1742 完了条件 #6（「不当混在」）とも矛盾。
- **再発条件**: SPEC 起票時に用語統一を意識しない場合。Phase 1 commit 起票時の揺れが SPEC merge 後も残存し得る。
- **予防策**: SPEC 起票時の用語統一チェック強化。`inspect-docs` への用語揺れ検出パターン追加の検討。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（spec-health-metrics.md の揺れ）。基準「1件=1」。 |
| 影響度 | 2/5 | 小。同一 SPEC 内の用語不統一、REQ と SPEC の表記矛盾。読手の負荷はあるが、実害（機能破壊等）はない。 |
| 横展開性 | 4/5 | 高い。他 SPEC でも用語揺れは発生し得る。SPEC 全般に適用可能な汎用課題。 |
| 反映先明確度 | 3/5 | 候補あり。`inspect-docs` command への用語揺れ検出パターン追加、または `agentdev-doc-writing` skill の SPEC 起票時チェック強化。 |
| 自動化適性 | 4/5 | 容易。機械的な用語揺れ検出は既存技術で可能（grep ベース、形態素解析ベース）。 |
| プロジェクト固有知識再利用性 | 3/5 | 中程度。SPEC 起票時の用語統一という汎用課題だが、AgentDevFlow 固有の用語体系に依存。 |
| 再発可能性 | 3/5 | 中程度。SPEC 起票時に用語統一を意識すれば回避可能だが、人的ミスの余地あり。 |
| 費用対効果 | 3/5 | 妥当。用語揺れ検出パターンの実装コストは中、効果は SPEC 品質向上。 |
| **加重合計** | **23/40** | |

- **推奨処分案**: **deferred**（出現1件。横断チェック需要は明白だが、即時昇華には具体性不足。`inspect-docs` へのパターン追加は次回の inspect 系知見蓄積時に再評価。deferred.md に類似事例（duty keyword 中黒化、SUB-D gloss 形式）あり）。

#### エントリ一覧
- 2026-07-23: 用語表記揺れの横断確認不足: SPEC 起票時の揺れが同一文書内に残留 [inbox]

---

### 問題クラス4: SPEC 主論理区分・正規所有対象 frontmatter 宣言の運用未整備

- **根本原因**: SPEC 再評価基準（主論理区分、正規所有対象）の frontmatter 宣言状況を全現行 SPEC 142ファイルで横断確認した結果、`foundations/document-model.md`（L399, 401 で規定を述べる）のみ `spec_logical_division` / `canonical_owner` フィールド宣言を持ち、他 141 SPEC ファイルは未宣言。OU-007 で責務境界浄化の基準を規定した段階で、宣言形式の運用は「後方互換運用（REQ-0136-035、ADR-0124 soft-contract）」に従い段階適用・警告モード扱い。不合格理由ではないが、宣言付与の運用フローが未整備。
- **再発条件**: spec-save 工程で新規 SPEC を作成する際、宣言形式の参考がない状態で起票される場合。既存 SPEC は spec-save UPDATE 機会で順次宣言付与が必要。
- **予防策**: spec-save 工程で新規 SPEC から段階的に宣言付与を適用する手順の整備。既存 SPEC は spec-save UPDATE 機会で順次宣言付与。spec-health-metrics で宣言率を指標化し、検知の機械化を検討。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 5/5 | 142 SPEC 中 141 ファイルが宣言未対応（大規模）。基準「8件以上=5」を大幅に超過。 |
| 影響度 | 2/5 | 小。「不合格理由ではない」。後方互換運用で段階適用・警告モード扱い。実害は限定的。 |
| 横展開性 | 2/5 | 限定。AgentDevFlow SPEC frontmatter 固有の宣言形式。他プロジェクトへの横展開は限定的。 |
| 反映先明確度 | 4/5 | 明確。`spec-save` command の手順、`spec-health-metrics` SPEC の指標化。 |
| 自動化適性 | 3/5 | 可能。spec-health-metrics での宣言率指標化は機械化可能。ただし宣言付与自体は人手。 |
| プロジェクト固有知識再利用性 | 4/5 | 高い。AgentDevFlow SPEC 運用固有の知見。SPEC frontmatter 運用フロー設計の参考。 |
| 再発可能性 | 3/5 | 中程度。運用フローが整備されれば減少するが、新規 SPEC 起票時に都度判断が必要。 |
| 費用対効果 | 3/5 | 妥当。宣言付与手順の整備コストは中、効果は SPEC 運用品質向上。ただし141ファイルを一括更新するコストは高い（段階適用前提）。 |
| **加重合計** | **26/40** | |

- **推奨処分案**: **staged**（既存 command へ反映）。`spec-save` command の手順整備、新規 SPEC 起票時の frontmatter 宣言付与フロー。規模大（141ファイル）だが段階適用が前提。promoted 成果物は「新規 SPEC 作成時の frontmatter 宣言付与手順要件」として扱う。

#### エントリ一覧
- 2026-07-23: SPEC 主論理区分・正規所有対象宣言の未宣言: spec-save 段階適用の準備状態 [inbox]

---

## 全体傾向

- **高頻出・高影響の問題クラス**: 問題クラス4（SPEC frontmatter 宣言、141ファイル規模）。問題クラス1（QG-3 誤検知、Wave 単位で再発中）。
- **横展開性が高い問題クラス**: 問題クラス1（4/5、他 check_*.ts 系にも適用可能）、問題クラス3（4/5、SPEC 全般の用語揺れ）。
- **自動化適性が高い問題クラス**: 問題クラス1（4/5、行レベル差分判定）、問題クラス3（4/5、用語揺れ検出）。
- **全体的な観察所見**: Epic #1736 Wave 1〜4 の case-close から回収された4エントリは、AgentDevFlow の「機械判定ロジック（QG-3 / docs check）」と「SPEC 運用フロー（spec-save / spec-health-metrics）」の2領域に集中。両領域とも段階的改善が可能で、昇華経路（promoted → backlog-review → req-define → req-save → case-open → case-run）での対応が適する。Wave 単位で同種の問題（QG-3 誤検知、Phase 1 運用）が再発していることから、Epic 実行の属害管理としての学習回路が機能している。

## ADR候補除外記録

全4問題クラスについて `agentdev-adr-guidelines` の除外基準を適用:

### 問題クラス1（QG-3 誤検知パターン）
- **除外理由**: 仕様変更のみ（QG-3 判定ロジックの改善）。技術選定・アーキテクチャ判断を含まない。
- **根拠事実**: 予防策が「行レベル差分ベース判定」「README 更新必須判定の frontmatter 変更時限定」「false positive 抑止フラグ追加」のいずれも、既存 `check_changed_docs.ts` のロジック改善であり、新技術導入や設計判断ではない。
- **代替反映先候補**: SPEC（`docs/specs/integrity/` 配下、`check_changed_docs.ts` 関連 SPEC）および command（`docs-check`）。

### 問題クラス2（Phase 1 一括 commit 運用パターン）
- **除外理由**: 運用ルール（Phase 1/2 分離基準の明文化）。技術的トレードオフを含まない。
- **根拠事実**: 予防策が「Phase 1 一括保存と Phase 2 case-open の分離基準の明文化」「子Issue 完了条件テンプレートの分離」のいずれも、作業手順・運用制約の定義であり、技術判断ではない。
- **代替反映先候補**: skill（`agentdev-workflow-lifecycle`）または command（`case-open`）。

### 問題クラス3（用語表記揺れ横断確認不足）
- **除外理由**: 仕様変更のみ（用語揺れ検出パターンの追加）。技術判断を含まない。
- **根拠事実**: 予防策が「SPEC 起票時の用語統一チェック強化」「`inspect-docs` への用語揺れ検出パターン追加」のいずれも、既存 command/skill の機能拡張であり、新技術導入や設計判断ではない。
- **代替反映先候補**: command（`inspect-docs`）または skill（`agentdev-doc-writing`）。

### 問題クラス4（SPEC frontmatter 宣言運用未整備）
- **除外理由**: 運用ルール（宣言付与フローの整備）。技術的トレードオフを含まない。
- **根拠事実**: 予防策が「spec-save 工程での宣言付与手順整備」「既存 SPEC の spec-save UPDATE 機会で順次宣言付与」「spec-health-metrics での宣言率指標化」のいずれも、作業手順・運用制約の定義であり、技術判断ではない。
- **代替反映先候補**: command（`spec-save`）および SPEC（`docs/specs/skills/spec-health-metrics.md` の指標化）。

## promote 時prune結果

- **対象エントリ数**: 0件（本レポート時点では inbox からの新規移動エントリに対する prune は未実施。Step 14 で staged/rejected/duplicate エントリが発生した場合に実施）
- **prune実施**: なし（Step 14 で実施予定）

## 既存対策照合サマリ

| 問題クラス | 既存対策確認結果 | 該当ファイル | ギャップ分類 | ギャップ詳細 |
|---|---|---|---|---|
| 1（QG-3 誤検知） | 既存対策あり（不完全） | `scripts/check_changed_docs.ts`、`docs-check` command、`case-close` QG-3、targeted docs guard (case-close workflow) | fix gap | フラグ判定がファイルパス・差分有無ベースであり、行レベル意味差分を考慮しない。Wave 1/2 で誤検知再発。 |
| 2（Phase 1 一括 commit 運用） | 既存対策なし | （該当なし） | fix gap | `agentdev-workflow-lifecycle` skill に Phase 1 一括保存と Phase 2 case-open の分離基準が未規定。子Issue 完了条件テンプレートの分離も未規定。 |
| 3（用語表記揺れ横断確認不足） | 既存対策あり（不完全） | `inspect-docs` command、`agentdev-doc-writing` skill | fix gap | 用語揺れ検出パターンが未実装。SPEC 起票時の用語統一チェック手順が明示的でない。deferred.md に類似事例（duty keyword 中黒化、SUB-D gloss 形式）あり。 |
| 4（SPEC frontmatter 宣言運用未整備） | 既存対策あり（不完全） | `spec-save` command、`docs/specs/foundations/document-model.md` L399/401、`docs/specs/skills/spec-health-metrics.md` | fix gap | `foundations/document-model.md` で宣言形式規定を述べるが実運用手順が未整備。`spec-save` に宣言付与フロー未規定。`spec-health-metrics` に宣言率指標未実装。 |

## 判定結果サマリ（Step 9 提示用）

| 問題クラス | 加重合計 | 推奨処分案 | 主な理由 |
|---|---|---|---|
| 1（QG-3 誤検知パターン） | 30/40 | **staged**（既存 command 反映: `docs-check` / `check_changed_docs.ts` 改修） | 高スコア、Wave 単位再発中、反映先特定済み。配布物（`src/scripts/`）改修を含むため昇華経路経由。 |
| 2（Phase 1 一括 commit 運用） | 23/40 | **deferred** | 運用論、自動化適性低（人間判断前提）、具体手順曖昧。次回再評価。 |
| 3（用語表記揺れ横断確認不足） | 23/40 | **deferred** | 出現1件、即時昇華には具体性不足。`inspect-docs` パターン追加は次回再評価。 |
| 4（SPEC frontmatter 宣言運用未整備） | 26/40 | **staged**（既存 command 反映: `spec-save` 宣言付与フロー整備） | 規模大（141ファイル）、運用フロー未整備が明白。段階適用前提で手順化が必要。 |
