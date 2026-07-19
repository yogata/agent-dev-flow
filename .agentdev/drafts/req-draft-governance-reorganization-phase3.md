---
title: ガバナンス体系統合再編フェーズ3（自動化機構実装）要件ドラフト
type: req-draft
work_type: maintenance
scale: large
phase: 3
parent_epic: "1601"
source_audit_ledger: .agentdev/drafts/audit-ledger-governance-system-audit.md
created: 2026-07-20
status: draft
---

# ガバナンス体系統合再編フェーズ3（自動化機構実装）

## 概要

AgentDevFlow 基準体系・統治境界の統合再編計画 第3フェーズ（自動化機構実装）。第1フェーズ監査台帳 AG-006' が抽出した自動化候補のうち、フェーズ3対象分（候補1〜5、候補7 Wave 2/3）を実装する。第2フェーズで確定した機構定義 SPEC（SC-001 採番管理、SC-002 索引類自動生成、SC-003 監査台帳ライフサイクル）に基づき、生成スクリプト、CI 組込、全索引展開を実施する。

フェーズ2で SC-002 が定義した機構の契約（Phase B まで完了）に対し、Phase C（生成スクリプト実装）、Phase D（CI 組込）、Phase E（全索引展開）を実行する。フェーズ3完了後、AG-006 候補の自動化機構移行が完了し、人手更新に依存する件数や一覧の追記漏れが構造的に根絶される。

## 背景

### 第1フェーズ監査と AG-006 自動化候補

第1フェーズ監査台帳（`.agentdev/drafts/audit-ledger-governance-system-audit.md`、フェーズ2完了時に削除済）の AG-006 セクションは、処置方針が DERIVE または GENERATE と分類された項目を8件の自動化候補として抽出した。各候補は「自動化移行の最終判断・実装は再編フェーズまたは後続作業の対象」として位置づけられた。

### フェーズ2での分類確定（CR-003 新基準）

フェーズ2（Epic #1601）で CR-003 新基準に基づき、AG-006' 候補をフェーズ2対象とフェーズ3対象へ分類した:

- **フェーズ2対象**: 候補6（doc-writing REFERENCE 強化）、候補7 Wave 1（SKILL.md 高優先度重複除去）。個別 IR 依存で SPEC 本文変更を伴わない REFERENCE 強化と SKILL.md Wave 1 重複除去。これらは #1610（OU-009）で実施済み
- **フェーズ3対象**: 候補1〜5（catalog/README/matrix/metrics GENERATE 化）、候補7 Wave 2/3（SKILL.md DERIVE/GENERATE 機構）。新規 script 開発を要する GENERATE 機構

### SC-002 による機構定義（フェーズ2完了）

SC-002 `docs/specs/integrity/index-auto-generation.md`（PR #1615、OU-003）が以下の機構を定義した:

- 適用対象: 6 索引（`docs/README.md`、`docs/requirements/README.md`、`docs/adr/README.md`、`docs/specs/README.md`、`docs/DOC-MAP.md`、`docs/requirements/mapping-table.md`）
- 生成規則: 件数表明、一覧網羅性、ステータス別ビュー、トピック別ビュー、Decision Map
- 人手編集領域と自動生成領域の分離
- 生成タイミング（pre-commit hook / CI / 手動 trigger）
- 段階導入（Phase A〜E、Phase B まで完了、Phase C 以降がフェーズ3対象）

### フェーズ2で完了した項目（フェーズ3の前提）

フェーズ2で完了した以下はフェーズ3の対象外とする:

- U-001〜U-015 横断解消（監査台帳 U 項目の解決結果確定と書き戻し、Phase1 監査台帳削除）
- SC-001 採番管理 SPEC 完成（`docs/specs/foundations/numbering-policy.md`、PR #1613）
- SC-002 索引類自動生成 SPEC 完成（`docs/specs/integrity/index-auto-generation.md`、PR #1615）
- SC-003 監査台帳ライフサイクル SPEC 完成（`docs/specs/local/audit-ledger-lifecycle.md`、PR #1612）
- F-001/002/005 即時修正（PR #1599、#1618 検証）
- 候補6 doc-writing REFERENCE 強化（#1610、OU-009）
- 候補7 Wave 1 SKILL.md 高優先度重複除去（#1610、OU-009）

## フェーズ3の位置づけ

- **work_type**: maintenance
- **scale**: large
- **Phase1 CR-001 適用**: 単一Epicトラック回避。フェーズ3は複数 Wave 構成を前提とする
- **起票方式**: 本ドラフトを入力として別セッションで `/agentdev/req-define` を起動する（AG-009、CR-004）

## 対象候補

フェーズ3対象は AG-006' 候補1〜5（catalog/README/matrix/metrics GENERATE 化）と候補7 Wave 2/3（SKILL.md DERIVE/GENERATE 機構）とする。候補8（DOC-MAP GENERATE 化）は SC-002 適用対象に含まれるため、候補2/3 と併せて処理する。

### 候補1: 整合性ルールカタログ GENERATE 化

- **監査台帳 AG-006 該当**: 候補1（U-008 一部）
- **現所有者**: `docs/specs/integrity/integrity-rule-catalog.md`
- **正規所有者**: 各 `docs/specs/integrity/rules/IR-*.md` の frontmatter（`id`、`title`、`status`、`domain` 等）。IR-* 個別ルールが SSoT
- **導出元**: 各 IR-*.md の frontmatter（60件、IR-045 欠番）
- **生成方法**: スクリプトが `docs/specs/integrity/rules/IR-*.md` を走査し、frontmatter から catalog エントリを再生成。`integrity-rule-catalog.md` を DERIVE 生成物に変更
- **自動化後の状態**:
  - `integrity-rule-catalog.md` は IR-* から機械生成された一覧表のみとなる（スキーマ定義は残置）
  - 新規 IR 追加時に catalog への手動追記が不要となる
  - catalog と IR-* の不整合が構造的に根絶される
- **関連 SPEC**: SC-002（機構契約）、`docs/specs/integrity/integrity-contracts.md`

### 候補2: ADR README 件数・一覧 GENERATE 化

- **監査台帳 AG-006 該当**: 候補2（U-015、F-001/002/005 根絶機構）
- **現所有者**: `docs/adr/README.md`
- **正規所有者**: 各 `docs/adr/ADR-*.md` の frontmatter（`id`、`title`、`status`、`created`）と本文「関連する決定」セクション
- **導出元**: 各 ADR-*.md の frontmatter（29件、accepted 25 / proposed 1 / superseded 2 / deprecated 1）
- **生成方法**: スクリプトが ADR-* を走査し、現行基盤ビュー、ステータス別ビュー、トピック別ビュー、Decision Map、関連 REQ 表、廃止済み履歴ビューの各自動生成対象領域を再生成
- **自動化後の状態**:
  - キャプション「承認済みステータス（accepted）の ADR-01XX 25件」は実測から自動生成される
  - 新規 ADR 追加時にステータス別ビュー、トピック別ビューへの追記漏れが構造的に発生しない
  - F-001（キャプション数値）、F-002（accepted リスト）、F-005（トピック別ビュー）が構造的に根絶される
  - トピック分類は frontmatter の分類フィールド追加または本文セクション構造からの導出規則で対応
- **関連 SPEC**: SC-002（機構契約、Phase C 以降）、SC-001（欠番維持）

### 候補3: REQ README 件数・一覧 GENERATE 化

- **監査台帳 AG-006 該当**: 候補3
- **現所有者**: `docs/requirements/README.md`
- **正規所有者**: 各 `docs/requirements/REQ-*.md` の frontmatter（`id`、`title`）
- **導出元**: 各 REQ-*.md の frontmatter（54件、REQ-0157 欠番、8 廃止済み欠番）
- **生成方法**: スクリプトが REQ-* を走査し、README の一覧表と件数表明を再生成
- **自動化後の状態**:
  - REQ 一覧表と件数表明が実測と常に一致する
  - 新規 REQ 追加時に README のみが更新されない事態を構造的に防止する
  - 欠番（REQ-0157、廃止済み REQ-0111/0115-0118/0120-0122）が SC-001 基準で正しく表示される
- **関連 SPEC**: SC-002（機構契約）、SC-001（欠番維持）

### 候補4: rule-ownership.md ルール所有権マトリクス GENERATE 化

- **監査台帳 AG-006 該当**: 候補4（U-008 一部）
- **現所有者**: `docs/specs/integrity/rule-ownership.md`
- **正規所有者**: 各 `docs/specs/integrity/rules/IR-*.md` の所有者情報 + 各 SKILL.md / SPEC の責務宣言
- **導出元**: IR-* frontmatter と各 SPEC の canonical owner 宣言
- **生成方法**: スクリプトが IR-* と各 SPEC を突合し、ルールドメイン → canonical REQ/SPEC の対応マトリクスを再生成
- **自動化後の状態**:
  - `rule-ownership.md` と `responsibilities/req-impact-map.md`（REQ → 影響するルール/アーティファクト）の双方向参照が常に整合する
  - 新規 IR 追加時にマトリクスの手動更新が不要となる
  - DUPLICATE 削減、所有権の drift が構造的に防止される
- **関連 SPEC**: SC-002（機構契約）、`docs/specs/integrity/integrity-contracts.md`

### 候補5: req-health-metrics / spec-health-metrics 数値項目 GENERATE 化

- **監査台帳 AG-006 該当**: 候補5
- **現所有者**: `docs/specs/quality/req-health-metrics.md`、`docs/specs/quality/spec-health-metrics.md`
- **正規所有者**: 実ファイル（REQ/SPEC）の列挙結果、検証結果、整合性スコア
- **導出元**: `docs/requirements/REQ-*.md`、`docs/specs/**/*.md`、`docs-check` 検証レポート
- **生成方法**: metrics 計算スクリプトが週次等で各数値項目を再生成
- **自動化後の状態**:
  - REQ 肥大化、関心ズレ検出の定量閾値が実測に基づく最新値となる
  - SPEC 肥大化、放置、ドメイン分類適合の定量閾値が実測に基づく最新値となる
  - REQ-0144/0145（docs-check 運用是正）と親和し、定期メトリクス更新が自動化される
- **関連 SPEC**: `docs/specs/quality/quality-specs.md`、`docs/specs/quality/quality-gates.md`

### 候補7 Wave 2/3: SKILL.md DERIVE/GENERATE 機構

- **監査台帳 AG-006 該当**: 候補7 Wave 2/3（U-009 Wave 2/3、U-012）
- **現所有者**: 各 `src/opencode/skills/agentdev-*/SKILL.md`
- **正規所有者**: 各 `docs/specs/skills/agentdev-{name}.md`（契約 SSoT）。SKILL.md は運用ビュー
- **導出元**: 各 SPEC の契約記述（機能、責務、入出力、QG）
- **生成方法**: REQ-0140 SKILL.md 重複查読の優先度基準 Wave 1/2/3 に従い、Wave 2（中優先度）、Wave 3（低優先度）の重複部分を SPEC から DERIVE した生成物に変更
- **自動化後の状態**:
  - SKILL.md 概要節と機能節の重複が SPEC を正として DERIVE される
  - extension と SKILL.md の記載重複（U-012）が解消される（extension は標準 SKILL.md を前提として補完する関係が明確化）
  - SPEC 変更時に SKILL.md の重複部分が追従漏れを起こさない
- **関連 SPEC**: `docs/specs/skills/agentdev-{name}.md`、`docs/specs/responsibilities/artifact-contracts.md`
- **前提**: Wave 1（高優先度、doc-writing REFERENCE 強化 + 高優先度重複除去）はフェーズ2 #1610 で実施済み

### 候補8: DOC-MAP GENERATE 化（候補2/3 と併せて処理）

- **監査台帳 AG-006 該当**: 候補8
- **現所有者**: `docs/DOC-MAP.md`
- **正規所有者**: 実ファイル配置（REQ/ADR/SPEC のパスと存在）
- **導出元**: `docs/requirements/REQ-*.md`、`docs/specs/**/*.md`、`docs/adr/ADR-*.md` の配置
- **生成方法**: DOC-MAP を「探索経路インデックス」に徹し、件数・一覧は実ファイルから GENERATE
- **自動化後の状態**:
  - DOC-MAP の件数・一覧が実ファイルと常に一致する
  - 補助索引としての位置づけ（ADR-0110）が明確化される
- **関連 SPEC**: SC-002（機構契約、候補2/3 と併せて適用）

## 対象外（フェーズ2で実施済み）

以下はフェーズ2で実施済みであり、フェーズ3の対象外とする:

- **候補6: doc-writing 查読観点の重複部分 REFERENCE 強化**（#1610、OU-009 で実施）。`src/opencode/skills/agentdev-doc-writing/SKILL.md` の「原本は japanese-tech-writing」と明示されている部分を、japanese-tech-writing から REFERENCE で参照する形式に縮小
- **候補7 Wave 1: SKILL.md 高優先度重複除去**（#1610、OU-009 で実施）。REQ-0140 基準の Wave 1（高優先度）SKILL.md 重複除去
- **U-001〜U-015 横断解消最終確認**（#1611、OU-010 = 本フェーズ2 最終Issue）。監査台帳 U 項目の解決結果確定、フェーズ3用入力転記、Phase1 監査台帳削除
- **SC-001/002/003 SPEC 完成**（#1603/1604/1605、OU-002/003/004）。3 SPEC の accepted 昇格と内容完成
- **F-001/002/005 即時修正**（PR #1599、#1618 検証）。ADR README キャプション、accepted リスト、トピック別ビューの修正
- **F-003/004 根絶**（#1603、SC-001 SPEC）。REQ-0157、IR-045 の欠番扱い確定
- **F-006 解消**（#1602、OU-001）。REQ-0102 SPLIT 完結（79→62要件行）
- **REQ-0102 SPLIT**（#1602、OU-001）。REQ-0138/0140 へ17要件行を移行
- **workflow-contracts 物理統合**（#1608、OU-007）。foundations/workflow-contracts.md 削除、workflows/ 版へ一本化
- **U-007 確定**（#1608）。物理統合完了、stub/redirect 残置なし
- **U-010 解消**（local-generation.md link mode 一元化、local-transform.md 削除、PR #1619 で関連項目リンク更新）
- **U-011 解消**（cb8e5891 + responsibility-boundary-purification.md で Project Extensions 境界明確化）
- **U-013 解消**（SC-003 SPEC で廃棄時期確定、#1611 で監査台帳削除）
- **U-014 解消**（cb8e5891 + 各 SPEC accepted 昇格で command SPEC と command 定義の粒度差整備）

## 受け入れ条件（フェーズ3完了判定）

### AC-1: 候補1〜5 GENERATE 機構実装完了

- **AC-1-1**: 候補1（catalog GENERATE 化）の生成スクリプトが実装され、`integrity-rule-catalog.md` が IR-* から再生成可能であること
- **AC-1-2**: 候補2（ADR README GENERATE 化）の生成スクリプトが実装され、`docs/adr/README.md` の各自動生成対象領域（現行基盤ビュー、ステータス別ビュー、トピック別ビュー、Decision Map、関連 REQ 表、廃止済み履歴ビュー）が ADR-* から再生成可能であること
- **AC-1-3**: 候補3（REQ README GENERATE 化）の生成スクリプトが実装され、`docs/requirements/README.md` の一覧表と件数表明が REQ-* から再生成可能であること
- **AC-1-4**: 候補4（rule-ownership GENERATE 化）の生成スクリプトが実装され、`rule-ownership.md` のルール所有権マトリクスが IR-* と各 SPEC から再生成可能であること
- **AC-1-5**: 候補5（metrics GENERATE 化）の計算スクリプトが実装され、`req-health-metrics.md`、`spec-health-metrics.md` の数値項目が実ファイル列挙結果から再生成可能であること

### AC-2: 候補7 Wave 2/3 SKILL.md DERIVE/GENERATE 機構実装完了

- **AC-2-1**: Wave 2（中優先度）SKILL.md の重複部分が SPEC から DERIVE された形式に変更されていること
- **AC-2-2**: Wave 3（低優先度）SKILL.md の重複部分が SPEC から DERIVE された形式に変更されていること
- **AC-2-3**: U-012（extension と SKILL.md の記載重複解消）が処理されていること

### AC-3: SC-002 Phase C〜E 完了

- **AC-3-1**: Phase C（生成スクリプト実装）が完了し、主要な索引類（候補1〜5対象）へ適用されていること
- **AC-3-2**: Phase D（CI 組込）が完了し、docs-check または CI に生成検証が組込まれていること
- **AC-3-3**: Phase E（全索引展開）が完了し、SC-002 適用対象の全索引（6索引）へ自動生成が展開されていること

### AC-4: 自動化後の整合性検証

- **AC-4-1**: F-001/002/005 が構造的に根絶されていること（自動生成により再発防止が担保されていること）
- **AC-4-2**: 自動生成の実行有無にかかわらず、docs-check が索引類と実ファイルの整合性を検証していること
- **AC-4-3**: 新規 REQ/ADR/IR/SPEC 追加時に自動生成対象領域が自動的に追従すること

### AC-5: AG-001 制約遵守

- **AC-5-1**: 公開 command/skill 動作の変更を行わないこと（`src/opencode/commands/agentdev/*.md`、`src/opencode/skills/agentdev-*/SKILL.md` の動作変更を除き、SKILL.md 重複部分の DERIVE 化は候補7 Wave 2/3 の範囲内で実施）
- **AC-5-2**: 新規 REQ/ADR CREATE を行わないこと（既存 REQ/ADR への APPEND/UPDATE、新規 SPEC のみ CREATE 可）

### AC-6: フェーズ3完了時の監査台帳ライフサイクル完了

- **AC-6-1**: AG-006 候補の自動化機構移行が完了したことを PR 本文で表明すること
- **AC-6-2**: 第1フェーズ監査台帳 AG-006 セクションの全候補（1〜8）について、フェーズ2/3 での処理状況が確定していること

## 依存関係

- **フェーズ2完了**: Epic #1601（全10 OU 完了）が前提。本ドラフト作成時点でフェーズ2は #1610（OU-009）と #1611（OU-010）が最終段階
- **SC-002 SPEC**: Phase C 以降の実装基盤。フェーズ2で accepted 昇格済み（PR #1615）
- **SC-001 SPEC**: 欠番管理の基盤。候補1〜3 で IR/REQ/ADR の欠番扱いに依存
- **SC-003 SPEC**: 監査台帳ライフサイクル。フェーズ3完了後の監査台帳廃棄条件に関連

## 想定 Wave 構成（Phase1 CR-001 適用、単一Epicトラック回避）

フェーズ3は work_type=maintenance、scale=large を想定し、Phase1 CR-001「単一Epicトラック回避」に従い複数 Wave 構成とする。詳細 Wave 分割は req-define で確定するが、想定案:

- **Wave 1**: 候補1（catalog）+ 候補4（rule-ownership）の GENERATE 化（IR-* 依存、整合性ドメイン完結）
- **Wave 2**: 候補2（ADR README）+ 候補3（REQ README）+ 候補8（DOC-MAP）の GENERATE 化（索引類一括、SC-002 Phase C）
- **Wave 3**: 候補5（metrics）の GENERATE 化（品質ドメイン完結）
- **Wave 4**: 候補7 Wave 2/3（SKILL.md DERIVE 機構）
- **Wave 5**: SC-002 Phase D（CI 組込）+ Phase E（全索引展開）+ フェーズ3完了判定

## 参照情報

- **第1フェーズ監査台帳**: `.agentdev/drafts/audit-ledger-governance-system-audit.md`（フェーズ2完了時に削除済、フェーズ3用入力へ転記済）
- **フェーズ2要件ドラフト**: `.agentdev/drafts/req-draft-governance-reorganization-phase2.md`（フェーズ2 Epic #1601 完了時に削除済）
- **SC-001 SPEC**: `docs/specs/foundations/numbering-policy.md`（REQ/ADR/IR 採番、欠番維持）
- **SC-002 SPEC**: `docs/specs/integrity/index-auto-generation.md`（索引類自動生成機構、Phase C〜E がフェーズ3対象）
- **SC-003 SPEC**: `docs/specs/local/audit-ledger-lifecycle.md`（監査台帳ライフサイクル、フェーズ3完了条件に関連）
- **Epic #1601**: フェーズ2 Epic（全10 OU、Wave 3 で完了）
- **AG-006' 候補分類基準**: CR-003 新基準（フェーズ2/3 分類）
- **req-save/spec-save 統合委託**: commit cb8e5891（フェーズ2前工程）

## 次のアクション

本ドラフトを入力として `/agentdev/req-define` を別セッションで起動し、フェーズ3の要件を確定する。req-define では以下を確認・確定する:

1. Wave 構成の最終化（本ドラフトの想定 Wave 1〜5 を壁打ち材料とする）
2. 各候補の技術選択（スクリプト言語、CI 統合方式、自動生成マーカー形式）
3. Phase C〜E の詳細実装計画
4. フェーズ3完了判定基準の最終化

req-define 完了後、req-save → spec-save → case-open → case-run → case-close の標準フローでフェーズ3を実行する。case-auto での自走も検討（フェーズ2実績に基づく）。
