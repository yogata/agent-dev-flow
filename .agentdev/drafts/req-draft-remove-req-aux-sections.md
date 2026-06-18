---
id: REQ-0101
title: "文書・REQ管理基準: REQファイル標準構成の3セクション化（補助セクション完全削除）"
created: "2026-06-18"
updated: "2026-06-18"
---

## draft-meta

- **work_type**: feature
- **req-operation**: UPDATE（主: REQ-0101 への APPEND + 廃止行除去 / 従: 機能REQ群・セクションのみREQ群の UPDATE）
- **target-req**:
  - 主: REQ-0101（標準構成状態要件の APPEND + REQ-0101-029/041/059 廃止 + 自身の補助セクション除去）
  - 機能REQ群（要件行再表現・除去 + セクション除去）: REQ-0102, REQ-0104, REQ-0105, REQ-0112, REQ-0114, REQ-0130
  - セクションのみREQ群（`## Requirement Source` / `## Update Notes` セクション除去のみ）: REQ-0103, REQ-0106, REQ-0107, REQ-0110, REQ-0113, REQ-0119, REQ-0123, REQ-0124, REQ-0125, REQ-0126, REQ-0127, REQ-0128, REQ-0129, REQ-0131, REQ-0132, REQ-0133
- **adr-required**: false
- **adr-rationale**: REQ-0101-044（作業手段ADR拒否ゲート）— 本変更の主題は補助セクションの完全削除（＝過去判断の除去）であり、新規ADRではなく既存REQの UPDATE/廃止で処理する。また本変更は REQ 文書形式・artifact contract 規約の変更（ADR不適格条件 #5）に該当し、新たな技術判断・アーキテクチャ決定を含まない。機能データキャリア（Requirement Source）の削除に伴う機能代替は既存規定（REQ-0112-009 テンポラリメタ取得、要件doc本文によるハンドオフ検出）で既に担保されている。
- **topic-slug**: remove-req-aux-sections
- **scale**: standard
- **status**: saved
- **agentdev_handoff**: false（agent-dev-flow repository 本体での作業であり、AgentDevFlow 本体＝当プロジェクト成果物のため通常要件docとして扱う。upstream-handoff.md L9 準拠）
- **create-rationale**: （CREATE ではなく既存REQ-0101 UPDATE）REQファイル標準構成は REQ-0101「文書・REQ管理基準」の既存関心対象であり、対象コンポーネント（REQファイル構成）・対象スコープ（REQファイルセクション構成）・目的の連続性（REQ-0101 は frontmatter/ID/セクション基準を既に規定）の全軸で既存REQ-0101 に吸収可能。新規REQ作成基準（REQ-0101-007, REQ-0101-053）の「既存 active REQ に吸収できない独立関心対象」に該当しない。

---

## 目的

AgentDevFlow の REQ ファイル標準構成を「目的 / 要件 / 適用範囲」の3必須セクションのみに整理し、補助セクション（"Requirement Source"、"Update Notes"、"関連ドキュメント更新候補"）を retired 以外の全記述から完全に削除する。これにより、REQ ファイルを現行仕様のみを表す簡潔な基準構造に維持し、履歴管理・入力ソース記録・更新候補管理を REQ ファイル本体から分離する。

"Requirement Source" は単なる文書セクションではなく、要件docドラフトで case-auto（RU削除判定）・case-run（ハンドオフ検出）の機能データキャリアとして使われていた。本要件はこれら機能連動記述・概念記述も含めて完全削除し、機能データ授受は既存の代替規定（REQ-0112-009 テンポラリメタ取得、要件doc本文・Issue本文によるハンドオフ検出）に一本化する。新規の機能代替設計は作り込まない（既存代替規定で担保済みであることを確認のうえ削除する）。

## 要件

| ID | 要件 |
|---|---|
| REQ-0101-070 | REQ ファイルの標準構成は `## 目的`、`## 要件`、`## 適用範囲` の3セクションのみとし、テンプレート `doc_requirement.md` に厳密に従うこと |
| REQ-0101-071 | active REQ ファイルは `## Requirement Source`、`## Update Notes`、`## 関連ドキュメント更新候補` セクションを含まないこと（これらの補助セクションは標準構成から外す） |
| REQ-0101-072 | retired REQ ファイル（`docs/requirements/retired/` 配下）は標準構成変更の適用対象外とし、履歴参照用途の構成を維持すること |
| REQ-0101-073 | REQ ファイル本文に変更履歴セクションを設けず、変更の追跡は frontmatter `updated` フィールドのみで扱うこと |
| REQ-0101-074 | RU 受入・ハンドオフ検出・RU削除判定・変更影響候補の機能データは、`## Requirement Source` 等の専用セクションに依存せず、要件doc本文・一時メタ情報（テンポラリメタ）等の既存経路で授受すること（既存代替規定 REQ-0112-009 を維持する） |

## 適用範囲

- **対象**:
  - REQ ファイル標準構成の定義（3必須セクションのみ化）
  - active REQ ファイル（27件）から "Requirement Source" / "Update Notes" / "関連ドキュメント更新候補" の各セクション・要件行・概念記述・機能連動記述の完全削除
  - 当該3キーワードの retired 以外の全出現箇所の除去（REQ 本文・SPEC `patterns.md`・command 定義 `req-define.md`・skill reference `req-save-procedure.md`・機能連動 command `case-auto.md`/`case-run.md`/`upstream-handoff.md`・要件インデックス `requirements/README.md`・移行表 `mapping-table.md` を含む）
  - 機能連動（case-auto RU削除判定、case-run ハンドオフ検出、req-define 変更影響候補抽出）の、既存代替規定（REQ-0112-009 テンポラリメタ、要件doc本文）への一本化確認
- **対象外**:
  - retired REQ ファイル（`docs/requirements/retired/**/*.md`、58件）の編集（一切触れない）
  - テンプレート `doc_requirement.md` の編集（元から当該セクションを含まないため変更不要）
  - `## 関連情報`（関連REQ/ADR/SPEC）セクションの扱い（本要件の対象外・維持する）
  - AGENTS.md / ADR / guides の編集（ただし当該ファイル群に3キーワードへの言及が検出された場合は、Wave 1 の調査結果をもって別途ユーザー確認対象とする）
  - integrity rule catalog（`integrity-rule-catalog.md`）の IR ルール本体変更（手動実行での確認のみ）
  - 機能代替の新規設計・作り込み（既存代替規定で担保済みであることを確認するのみ）
  - 欠番となる要件ID（REQ-0101-029/041/059、REQ-0102-001/014、REQ-0104-026、REQ-0105-010、REQ-0112-008、REQ-0114-023/026 等）の再採番（欠番維持・AGENTS.md 準拠）

---

## 完了条件

> 全項目 Agent 自動検証可能（grep / docs-check / inspect-docs）。測定可能・一意。

- [ ] retired 以外から "Requirement Source" が完全消失: `grep -rn "Requirement Source" docs/ src/ AGENTS.md | grep -v "docs/requirements/retired/"` → 0件
- [ ] retired 以外から "Update Notes" が完全消失: `grep -rn "Update Notes" docs/ src/ AGENTS.md | grep -v "docs/requirements/retired/"` → 0件
- [ ] "関連ドキュメント更新候補" が完全消失: `grep -rn "関連ドキュメント更新候補" docs/ src/ AGENTS.md` → 0件
- [ ] active REQ 27件すべてが `## 目的` / `## 要件` / `## 適用範囲` のみで構成されている（補助3セクションなし）
- [ ] REQ-0101 に標準構成状態要件（REQ-0101-070〜074）が APPEND されている
- [ ] REQ-0101-029 / 041 / 059（廃止対象行）が REQ-0101 から除去されている
- [ ] REQ-0112-009 の機能（テンポラリメタからRU削除対象を取得）が維持されており、"Requirement Source" 言及のみ除去されている
- [ ] case-run のハンドオフ検出機能（`agentdev_handoff: true` 検出）が維持されており、検出対象が "要件doc本文" 等に一本化されている
- [ ] 欠番要件ID（REQ-0101-029/041/059 等）が再採番されず欠番維持されている
- [ ] retired REQ ファイルが一切編集されていない: `git diff --name-only | grep "docs/requirements/retired/"` → 0件
- [ ] テンプレート `doc_requirement.md` が変更されていない: `git diff --name-only | grep "templates/doc_requirement.md"` → 0件
- [ ] 編集対象 REQ ファイルの frontmatter `updated` が "2026-06-18" に更新され、`id`/`title`/`created` は不変である
- [ ] `/repo/docs-check` 実行で事前ベースライン相比 新規 finding なし
- [ ] `/agentdev/inspect-docs` 実行で事前ベースライン相比 新規 finding なし

---

## operation_units

> 各 OU は req-save による REQ 操作単位。SPEC・command・skill ファイルの編集は case-run（実装）の責務であり、OU には含めない。

### OU-1

- **ou_id**: OU-1
- **source_ru**: （本ドラフトは明示入力ファイル `.sisyphus/plans/req-template-restructure.md` 由来。RU-XXXX は要件doc確定後に backlog-review 経由で付与される場合は case-open が処理）
- **target_req**: REQ-0101
- **operation**: UPDATE（APPEND + 行除去 + セクション除去の複合）
  - APPEND: REQ-0101-070, 071, 072, 073, 074（標準構成状態要件）
  - 除去（廃止・欠番維持）: REQ-0101-029, REQ-0101-041, REQ-0101-059
  - セクション除去: REQ-0101 自身の `## Requirement Source`（L82「該当なし」）・`## Update Notes`（L86-107 変更履歴テーブル）
  - frontmatter `updated` を "2026-06-18" に更新（`id`/`title`/`created` 不変）
- **scale**: standard
- **depends_on**: （なし・先行 OU）
- **recommended_order**: 1
- **issue_policy**: single-issue（REQ-0101 単独 UPDATE）
- **result**: （req-save / case-open が書き戻す）

### OU-2

- **ou_id**: OU-2
- **source_ru**: （同上）
- **target_req**: REQ-0102, REQ-0104, REQ-0105, REQ-0112, REQ-0114, REQ-0130
- **operation**: UPDATE（機能要件行の再表現または除去 + 補助セクション除去 + 適用範囲記述調整）
  - REQ-0102: REQ-0102-001/014 の "Requirement Source として" 言及を再表現（RU 受入機能は維持）、`## Update Notes` セクション除去、適用範囲の "Requirement Source / 関連ドキュメント更新候補" 記述除去
  - REQ-0104: REQ-0104-026 のハンドオフ検出対象を "要件doc本文" に一本化（"Requirement Source" 言及除去・機能維持）、`## Update Notes` セクション除去
  - REQ-0105: REQ-0105-010 の "Requirement Source として" 言及を再表現（RU 受入機能維持）、`## Update Notes` セクション除去
  - REQ-0112: REQ-0112-008 除去、REQ-0112-009 は "テンポラリメタから取得する" 機能を維持し "Requirement Source" 言及のみ除去、`## Update Notes` セクション除去
  - REQ-0114: REQ-0114-023/026 除去、`## Update Notes` セクション除去
  - REQ-0130: REQ-0130-004 の "関連ドキュメント更新候補" 機能言及を再表現（実装計画組み込み機能の維持方法は case-run で確定）、`## Update Notes` セクション除去、適用範囲の同言及除去
  - 各ファイル frontmatter `updated` を "2026-06-18" に更新
  - 欠番要件IDは再採番せず欠番維持
- **scale**: standard
- **depends_on**: OU-1（REQ-0101 の標準構成状態要件の確定を前提とする整合性のため。ただしファイル編集の並列性は case-run Wave 2 で調整可能）
- **recommended_order**: 2
- **issue_policy**: single-issue または multi-issue（6 REQ を個別 Issue にするか1 Issue に束ねるかは case-open が判断）
- **result**: （req-save / case-open が書き戻す）

### OU-3

- **ou_id**: OU-3
- **source_ru**: （同上）
- **target_req**: REQ-0103, REQ-0106, REQ-0107, REQ-0110, REQ-0113, REQ-0119, REQ-0123, REQ-0124, REQ-0125, REQ-0126, REQ-0127, REQ-0128, REQ-0129, REQ-0131, REQ-0132, REQ-0133
- **operation**: UPDATE（機械的準拠更新: `## Requirement Source` / `## Update Notes` セクション除去のみ・要件行の新規追加・再表現なし）
  - 各ファイルの `## Requirement Source`・`## Update Notes` セクション（内容含む）を完全除去
  - 各ファイル frontmatter `updated` を "2026-06-18" に更新（`id`/`title`/`created` 不変）
  - `## 目的` / `## 要件` / `## 適用範囲` / `## 関連情報` 等の他セクションは維持
  - Wave 1（inventory）で確定した対象ファイル・出現箇所を厳密に処理
- **scale**: standard
- **depends_on**: OU-1（標準構成状態要件の確定を前提）
- **recommended_order**: 3
- **issue_policy**: multi-issue 推奨（16ファイルを機械的並列処理可能。case-open が Wave 単位で Issue 化）
- **result**: （req-save / case-open が書き戻す）

---

## execution_groups

### EG-1

- **id**: EG-1
- **type**: coordinated-update（単一ガバナンス要件に基づく多REQ準拠更新）
- **purpose**: REQ-0101 で確立した標準構成状態要件（3セクションのみ化）を、全 active REQ ファイル・関連 SPEC/command/skill に完全準拠させる
- **included_ou**: OU-1, OU-2, OU-3
- **rationale**: 3つの OU はすべて単一のガバナンス要件（REQ-0101-070〜074）から派生する準拠作業であり、論理的に一貫した変更。OU-1 が規定を確立し、OU-2/OU-3 が既存REQを準拠させる。req-save は3 OU を順次処理し、case-run は Wave 1（inventory）→ Wave 2（並列削除）→ Wave FINAL（検証）で実行する（詳細は `.sisyphus/plans/req-template-restructure.md` の Execution Strategy 参照）。Epic 規模には該当しない（標準構成要件の論理複雑さは単一REQに集約され、準拠更新は機械的）。
