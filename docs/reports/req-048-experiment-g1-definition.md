---
id: EXPERIMENT-G1-REQ048-DEFINITION
title: "REQ-048 実験G1定義（Verification Diff 縮小・OU-009 / WP-09-1 Phase B）"
status: accepted
created: 2026-09-05
source_issue: "#2606 (OU-009 / WP-09-1 Experiment G1 実験定義)"
parent_epic: "#2597 (REQ-048 再構築・測定・実験系)"
---

<!-- ADF-COVERS(verification): REQ-048-008, REQ-048-012, REQ-048-016 -->
# REQ-048 実験G1定義（Verification Diff 縮小・OU-009 / WP-09-1 Phase B）

## 本 Report の位置づけ

本 Report は、REQ-048 再構築・測定・実験系 Epic（#2597）の Wave 3（OU-009 / WP-09-1）で作成した実験 G1（Verification Diff の縮小）の実行可能な実験定義である。REQ-048-012 の実験契約が要求する6要素（Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision）を、各節で識別可能な形に保存する。

本 Report は既存成果物種別（Report）への保存であり、測定専用の新しい成果物種別、実行履歴 DB、恒久 checker、公開入口を追加しない（REQ-048-016、DEC-027 決定6）。本 Report が所有するのは実験の定義であり、実験の実行・判定は後続の個別実証（実証Case候補）へ分離する。分離の契約は「実験の実行・判定の分離（後続実証Case）」節に記す。

入力は、削減候補ランキング（`docs/reports/req-048-candidate-ranking.md`）、Baseline V2 測定（`docs/reports/req-048-baseline-v2-measurement.md`）、Baseline V2 定義基盤（`docs/reports/req-048-baseline-v2-definition.md`）、REQ-048、DEC-027、および `agentdev-workflow-templates` Design と workflow-contracts Design が宣言する検証差分セクションの現行ベースラインである。

## 実験対象と単一性の契約

実験 G1 の対象機構は、検証差分記録（ランキング候補 C1）である。REQ-048-014 が観測対象とする「検証差分の具体分類・表形式」に該当し、REQ-048-008 が「特定の表形式を本要件の成立条件としない」と定める範囲の機構である。

現行ベースラインの構造は次のとおりである（`agentdev-workflow-templates` Design「実行識別情報・検証差分のテンプレートセクション形式」節、workflow-contracts Design の現行ベースライン宣言）。

- 検証差分セクションはテーブル形式、1行1検証
- 列構成は 実行工程 / 検証種別 / 検証結果 / 新規 / 修正済み / 既出 / 撤回 / 無効 の8列
- finding 差分は 新規、修正済み、既出、撤回、無効 の5分類
- 検証差分セクション存在率の実測は 5/6（Baseline V2 測定 §4.2）
- Design 宣言は「検証差分の分類・表形式（8列）は現行ベースラインであり、REQ-048-008、REQ-048-014 のとおり REQ-048 の成立条件として固定しない」と記録し、形式の変更を REQ-048-012 の実験契約に従うものとしている

単一性の契約を次に固定する。

- 1 experiment = 1 major structural change（DEC-027 決定4、REQ-048-012）
- G1〜G4 は同一 baseline へ複数の主要変更を混在させないため直列実行する（Epic #2597 AG-003）。G1 の実行時点で G2〜G4 の主要構造変更を混在させない
- ランキング §6.1 が G1 を1位に置いた根拠は、存在率と表構造の実測がある Observability confidence、Cost の構造観測可能性、Guardrail 設計の材料（REQ-048-008 分類）が契約上すでに定義されていることである

## Baseline

Baseline 要素は Baseline V2 で充足する。Baseline V2 とは「本要件再構築時点の GitHub 最新 ADF control plane」であり、その定義は Baseline V2 定義基盤 Report §1 が正である（`docs/reports/req-048-baseline-v2-definition.md`）。

### Baseline の取得手順（実証Case 実行時）

Baseline 測定は、後続実証Caseが実験実行時に取得する。取得手順は Baseline V2 定義基盤 Report §2 の baseline commit SHA 固定手順（4ステップ）に従う。

1. 測定実行時に `git fetch origin main` を実行し、`git rev-parse origin/main` で GitHub 最新 default branch SHA を取得する
2. 取得した SHA が structurally normalized commit（`a0b5ac82c776a714c133c8245fce90c99dd1a836`）の子孫であることを `git merge-base --is-ancestor <structurally-normalized-SHA> origin/main` で確認する。子孫でない場合、測定を開始せず、その判断を測定 Report に記録する
3. baseline の選択は「structurally normalized commit を含む測定時 origin/main」で確定する
4. 測定 Report に baseline SHA、子孫確認の結果、実行日時の3点を固定記録する

測定手続きは Baseline V2 測定 Report §2 に従う。評価軸6軸と Observation Tax の観測方法（§2.1）、指標の取得源と測定方法（§2.2）、処理区分の対応付け（§2.3）、Observation Tax の測定方法（§2.4）である。

### 比較の起点と参照値

本 Report は測定値を作成しない。実験の比較起点は、実証Case が上記手順で固定記録する baseline SHA と、その時点の測定結果である。参照値として、Baseline V2 測定がすでに記録した構造観測値（検証差分セクション存在率 5/6、8列構造が GitHub から観測可能）を G1 の比較対象の現状確認に使える。

比較可能性の条件は Baseline V2 定義基盤 Report §4 に従う。Baseline V2 と同一の指標定義、同一の実行単位定義で算出した結果とのみ比較し、Legacy Baseline（`docs/reports/req-048-reanalysis-baseline.md`）との直接比較は行わない。

## Hypothesis

実験 G1 の仮説を次に1文で定める。

> 検証差分セクションの列構成を8列から5列（実行工程 / 検証種別 / 検証結果 / finding 分類 / finding 参照）へ統合しても、REQ-048-008 の incremental value 比較可能性は維持され、検証差分記録・diff 生成の Observation Tax は現行8列形式より減少する。

仮説の読み方を次に区別する。

- 仮説が支持された場合（比較可能性が維持され、Tax 減少が確認された場合）: 8列形式が REQ-048-008 の便益を維持する最小形であるとは言えないことが実データで示され、NARROW（列統合）の判断候補が支持される
- 仮説が棄却された場合（比較可能性が損なわれた、または Tax 減少が確認できなかった場合）: 現行8列形式が要求を満たす形であることを実データが示し、KEEP の判断候補が支持される
- 仮説は予測であり、判断の確定ではない。判断は Decision 要素の記録形式に従い、実行後の実データで行う

仮説の検定では単一の指標のみを理由に判断しない（DEC-027 決定2、REQ-048-006）。Observation の指標を Cost 側（Observation Tax）と Benefit 側（Guardrail の観測）の対で読む。

## 主要構造変更

G1 の主要構造変更は次の1件のみである。

| 項目 | 内容 |
|---|---|
| 変更 | PR 本文の検証差分セクションの列構成を、現行8列（実行工程 / 検証種別 / 検証結果 / 新規 / 修正済み / 既出 / 撤回 / 無効）から、実行工程 / 検証種別 / 検証結果 / finding 分類 / finding 参照 の5列へ統合する。finding 分類列は5分類の値を1つ記録し、finding 参照列は要約と参照（セクション名、Issue コメント、PR 本文内位置等）を記録する。1行1検証のテーブル形式は維持する |
| 単位 | 検証差分セクションの列構成（表形式）。セクション見出し、テーブル形式、5分類の意味体系、配置規則は本変更の単位に含まれない |

選定理由を次に記す。

- REQ-048-008 は「全工程に一律の finding 詳細分類または特定の表形式を本要件の成立条件としない」と明示し、8列という特定の表形式は REQ-048 の成立条件外である。契約上、最も安全な縮小空間である
- 分類別の専用列5列は、同じ finding の分類値を1列に1つ記録する冗長な横並びであり、ランキング §3 が Cost 側の観測対象として記録した「PR 本文の 8列構造」の実体である。5分類の意味体系（REQ-048-008 の incremental value 比較の中核）を変更せずに、表の列構造だけを縮小できる
- 8列構造は GitHub PR 本文から直接観測可能であり（Observability confidence 中〜高）、変更前後の構造比較が実測可能である（ランキング §6.1 の根拠と整合）

本実験に混在させない変更を次に明示する。これらは G1 の主要構造変更に含めない。

- finding 差分の5分類（新規、修正済み、既出、撤回、無効）の意味の変更・削減。REQ-003-042（審議中 finding 状態の追跡）と接続する撤回・無効分類を含む
- 検証差分セクション自体の廃止（ランキング §8 が単独 DELETE を候補外と記録済み）
- 実行識別情報 field 集合の変更（G2 対象、ranking C2）
- セクション配置規則や `<!-- 【必須】 -->` マーカー等のテンプレート契約の変更

## Guardrail

Guardrail は実験中に維持すべき不変条件である（DEC-027 決定5: 機構ではなく不変条件の維持を評価対象とする）。REQ-048-008 の本文を次に引用する。

> review、verification、quality gate 等について、当該工程で初めて確認された actionable finding を前工程の finding と区別し、後続工程の incremental value を比較できること。全工程に一律の finding 詳細分類または特定の表形式を本要件の成立条件としないこと。REQ-003-042（審議中 finding 状態の追跡）と REQ-007-005（欠陥類型単位の修正証跡）の所有境界を変更しないこと

| # | 不変条件 | 根拠 |
|---|---|---|
| GR-1 | incremental value 比較可能性の維持: 変更後の検証差分セクションでも、当該工程で初めて確認された actionable finding を前工程の finding と区別し、後続工程の incremental value を比較できる。具体的には、case-run の検証行と case-close の対応記録コメントの検証行が同一形式で記録され、finding の新規・修正済み・既出・撤回・無効の5分類が工程間の読み比べから判別できること | REQ-048-008 前段 |
| GR-2 | 機械判別可能性の維持: 検証差分セクションの見出しと構造化形式が維持され、Baseline V2 測定 §2.2 の存在率観測と PR 本文からの構造抽出（`##` 見出し、テーブル）が引き続き機能すること | REQ-048-002、Baseline V2 測定 §2.2 |
| GR-3 | N/A 非停止: 検証差分情報の欠落、部分記録、取得不能な指標は observability gap として分析時に扱い、workflow を停止させないこと | REQ-048-004 |
| GR-4 | 所有境界の維持: adversarial-review の審議中 finding 状態の追跡（REQ-003-042）と、品質ゲート完了報告の欠陥類型単位の修正証跡（REQ-007-005）の所有境界を変更しないこと。検証差分セクションはこれらの記録を代替しない | REQ-048-008 後段 |

GR-1 から GR-4 のいずれかが不成立となった実験結果は、仮説の成立如何に関係なく NARROW（列統合）の判断候補を採用できない。この場合の判断候補は KEEP であり、その根拠を実データで記録する。

## Observation

測定対象は Baseline V2 測定 Report §2 の手順に従う。測定の実施は後続実証Caseが実験実行時に行う。

| 観測対象 | 指標 | 取得方法 |
|---|---|---|
| 検証差分記録の Observation Tax（Cost） | 検証差分セクションの記入・生成に要した作業の回数、および取得可能な場合の token、wall-clock、tool call、重複読み書き | Baseline V2 測定 §2.4 の方法。harness 指標が取得不能な場合は未測定と記録し、推定値を埋めない |
| Observation Tax（maintenance / contract complexity） | 検証差分セクション形式に関わるテンプレート、契約テスト、Design 宣言の保守箇所の変更有無と件数 | リポジトリ変更ファイルから数える。検証差分形式に関わる契約テストの更新要否を含む |
| 構造観測値 | 検証差分セクションの列数、記入行数、finding 分類の記録方式、セクション存在率 | PR 本文の `##` 見出しとテーブル構造から抽出する（Baseline V2 測定 §2.2、§4.1 の手順に準拠） |
| Guardrail 観測（Quality、Benefit 側） | finding 差分の5分類が工程間比較で機能したか。case-run 行と case-close 行の分類の一貫性と、後続工程の incremental value の判定可否 | PR 本文と対応記録コメントの検証差分記録を読み比べる（Baseline V2 測定 §2.1 の Quality 軸の観測方法） |
| 自律性への影響（Autonomy） | human intervention、user-decision-required、blocked、failed、delegation-unavailable、self-heal、stop、resume の発生有無 | Baseline V2 測定 §2.1 の Autonomy 軸の観測方法 |

観測の境界を次に記す。

- harness 指標（token、wall-clock 等）は observability gap（Baseline V2 測定 §6）により未測定である可能性がある。その場合、構造観測値と Guardrail 観測のみで判断し、未測定の軸を推定値で埋めない（REQ-048-004、REQ-048-007）
- Cost 側の観測（Observation Tax）と Benefit 側の観測（Guardrail 観測）を対で記録し、単一指標のみを理由に判断しない（DEC-027 決定2、REQ-048-006）
- token は input、output、cache read、cache write の性質を区別して記録し、単純合算値を Cost の判断に用いない（REQ-048-007）

## Decision 記録形式

実験の判定は KEEP、NARROW、MERGE、DOWNGRADE、DELETE の5値から1つを選び、次の形式で既存成果物へ記録する。記録先は Report、Decision、Issue 等の既存成果物であり、新規成果物種別を追加しない（REQ-048-016）。

| 記録項目 | 内容 |
|---|---|
| 判断値 | KEEP / NARROW / MERGE / DOWNGRADE / DELETE の1値（REQ-048-013） |
| 判断の根拠 | Hypothesis の支持・棄却、Observation の指標値（取得源と実行日時を含む） |
| Guardrail 確認 | GR-1 から GR-4 の成立確認結果 |
| 比較範囲 | 使用した baseline SHA、および Baseline V2 定義基盤 Report §4 の比較可能範囲に収まることの確認 |
| 証跡 | PR 本文、Issue コメント等の証跡への参照 |
| 削除成功条件の不在 | 削除そのものを成功条件としないことの明示（REQ-048-013、DEC-027 決定2） |

G1 における判断の方向性を次に記す。これは実行前の判断の確定ではなく、判断候補の整理である（REQ-048-013）。

- NARROW: 列統合が Guardrail（GR-1〜GR-4）を維持し、Observation Tax の減少が確認された場合の判断候補。ランキング §8 が C1 の判断候補として記録した「DOWNGRADE または NARROW を評価」のうち、列統合の結果に対応する方向である
- KEEP: Guardrail の不成立、または Observation Tax の減少が確認できなかった場合の判断候補。現行8列形式を実データが支持する
- MERGE、DOWNGRADE、DELETE: 列統合の結果としては原則採用しない。DELETE は検証証跡を失うためランキング §8 が単独での候補外と記録済みである。列統合の結果が他候補との重複責務や hard control の非該当を示した場合、後続の実験・判断で再評価する

## 実験の実行・判定の分離（後続実証Case）

本 Report は実験の定義のみを所有する。実験の実行・判定は本実行単位（#2606）の完了条件に含まれない。

- 実験の実行・判定（KEEP / NARROW / MERGE / DOWNGRADE / DELETE の確定）は、Epic #2597 のとおり後続の個別実証（実証Case候補、AG-002・CR-001）として分離する
- 実行時に、評価ブランチと評価契約を当該実証Caseの Issue で確定する（REQ-043、DEC-018）。本 Report は評価ブランチ・評価契約を先に確定しない
- G1〜G4 は同一 baseline へ複数の主要変更を混在させないため直列実行する（AG-003）。本実行単位は G1 定義のみを担当する
- 実証Case は、本 Report の Baseline 節の手順で baseline を固定記録し、Observation 節の指標を測定し、Guardrail 節の不変条件を確認した上で、Decision 記録形式で判断を記録する

## 検証対応

### ADF-COVERS 宣言と検証対応

本 Report は `ADF-COVERS(verification): REQ-048-008, REQ-048-012, REQ-048-016` を宣言する。

- REQ-048-012: Baseline、Hypothesis、主要構造変更、Guardrail、Observation、Decision 記録形式の各節により、実験契約の6要素を識別可能に保存する。単一の主要構造変更を1件に限定し、混在させない変更を明示する
- REQ-048-008: Guardrail 節が REQ-048-008 の本文を引用し、GR-1〜GR-4 の不変条件として保存する。REQ-003-042 と REQ-007-005 の所有境界の維持を含める
- REQ-048-016: 実験定義を既存成果物種別（Report）へ保存し、新規成果物種別、実行履歴 DB、恒久 checker、公開入口を追加しない

### TS-012B 読み戻し検証

Issue #2606 テスト戦略 TS-012B に従い、本 Report の読み戻しで次を確認した。

| 確認項目 | 結果 | 証拠 |
|---|---|---|
| REQ-048-012 の6要素（Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision）が識別可能である | 合格 | 各要素に対応する見出し節が1つずつ存在する。`## Baseline`、`## Hypothesis`、`## 主要構造変更`、`## Guardrail`、`## Observation`、`## Decision 記録形式` |
| 単一の主要構造変更である | 合格 | 主要構造変更節の変更が1件（8列から5列への列統合）。混在させない変更を明示し、5分類の意味変更とセクション廃止を除外 |
| Guardrail が REQ-048-008（incremental value 比較可能性）を維持する | 合格 | Guardrail 節が REQ-048-008 本文を引用し、GR-1 で incremental value 比較可能性を不変条件として定め、不成立時の判断方向（KEEP）を明示 |
| 実行・判定が後続実証Caseに分離されている | 合格 | 実験の実行・判定の分離節が、本実行単位の完了条件に含まれないことを明示。評価ブランチ・評価契約（REQ-043、DEC-018）の実行時確定を記録 |

### docs 変更整合性検証

本 Report の保存後、`check_changed_docs.ts` を `--workflow case-run` で実行し、failures 0 を確認した。実行結果は PR 本文の検証差分セクションに記録する。
