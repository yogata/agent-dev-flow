---
id: EXPERIMENT-G4-REQ048-DEFINITION
title: "REQ-048 実験G4定義（Review / Verification の条件付き化・OU-012 / WP-09-4 Phase B）"
status: accepted
created: 2026-09-05
source_issue: "#2609 (OU-012 / WP-09-4 Experiment G4 実験定義)"
parent_epic: "#2597 (REQ-048 再構築・測定・実験系)"
---

<!-- ADF-COVERS(verification): REQ-048-008, REQ-048-012, REQ-048-014, REQ-048-016 -->
# REQ-048 実験G4定義（Review / Verification の条件付き化・OU-012 / WP-09-4 Phase B）

## 本 Report の位置づけ

本 Report は、REQ-048 再構築・測定・実験系 Epic（#2597）の Wave 6（OU-012 / WP-09-4）で作成した実験 G4（Review / Verification の条件付き化）の実行可能な実験定義である。REQ-048-012 の実験契約が要求する6要素（Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision）を、各節で識別可能な形に保存する。

本 Report は既存成果物種別（Report）への保存であり、測定専用の新しい成果物種別、実行履歴 DB、恒久 checker、公開入口を追加しない（REQ-048-016、DEC-027 決定6）。本 Report が所有するのは実験の定義であり、実験の実行・判定は後続の個別実証（実証Case候補）へ分離する。分離の契約は「実験の実行・判定の分離（後続実証Case）」節に記す。

実験 G4 の対象は、削減候補ランキング C4 の Review / Verification 実行条件である。review 回数、verification 回数は REQ-048-014 のとおり要件の成立条件として固定せず、hard governance 不変条件と quality gate 必須統制を維持した上で、trigger ベースの条件付き化を実験対象とする。

入力は、削減候補ランキング（`docs/reports/req-048-candidate-ranking.md`）、Baseline V2 測定（`docs/reports/req-048-baseline-v2-measurement.md`）、Baseline V2 定義基盤（`docs/reports/req-048-baseline-v2-definition.md`）、REQ-048、REQ-054、DEC-001、DEC-024、DEC-027、および quality-gates Design が宣言する現行ベースラインである。

## 実験対象と現行ベースラインの構造

実験 G4 の対象機構は、Review / Verification 実行条件（ランキング候補 C4）である。C4 は REQ-048-011 で Quality control（Safety invariant 支援）に分類され、5価値軸では Quality が主軸、Efficiency、Autonomy、Control / Coordination が副軸である。

現行ベースラインでは、次の review / verification 機構を各工程の契約に従って実行する。

- adapter 委譲内の adversarial-review は、実装方針の形成、review 呼出、結果反映を行う。発動条件判定と review 呼出は分離して扱う
- 実装後の test strategy 各項目は、verification、pass_criteria、on_failure に従う test-fix ループで処理する
- QG-1〜QG-4 は主ワークフローの定義整合、受入条件網羅、実装乖離、最終受入を検査する必須統制である
- review NG フローは、審議中 finding、修正証跡、次工程制御を扱う契約として維持される

Baseline V2 測定の現状では、C4 の発動回数は系統記録されていない。PR 本文の検証記録から部分観測できるが未集計であり、review / verification の工程別 Cost と Benefit も未測定である（ランキング §2、§3）。

## trigger の定義根拠

G4 の trigger は、単一の固定回数や固定閾値ではなく、次の3ソースを組み合わせて定義する。具体的な閾値と条件式は、本 Report では先に固定せず、後続実証Caseが実測データと既存状態を確認して定める。

### 実測データ（Baseline V2）

Baseline V2 測定 Report §2 の手順に従い、Review、Verification の処理区分、発動実績、Observation Tax を取得する。Baseline V2 測定 §2.3 の処理区分対応付け、§2.4 の Observation Tax 測定方法、§4.2 の GitHub 成果物から取得できる構造観測を使用する。harness 生実行履歴に由来する wall-clock、token、tool call は §6 の observability gap により未測定であり、取得できる範囲だけを trigger の根拠とする。サンプルは6 execution unitsであり、分布や削減効果を断定しない（§5）。

### 既存 risk

REQ-054 と DEC-024 の変更誘発境界リスク分析が導出した case-specific risk を使用する。dependency、client/server、execution、build/runtime、environment propagation の5観点境界で高い risk が導出された変更では、review / verification を省略しない。導出された risk は test strategy へ投影し、QG-1 の投影完全性検査と接続する。

### finding / modification state

REQ-048-008 の finding 差分（新規、修正済み、既出、撤回、無効）、REQ-003-042 の審議中 finding 状態、前工程で確認済みの finding を使用する。新規 finding の発生、修正済み finding の反復、未解決の審議中 finding、変更状態の不明は trigger 不成立として扱い、省略しない。finding の状態と変更状態を工程間で追跡できる記録を残す。

この3ソースは、実行条件を評価するための入力であり、hard governance 不変条件や QG 必須統制を置き換えない。実測データが不足する場合は保守的に常時実行側へ倒す。

## 単一性の契約と単一変更の選定

- 1 experiment = 1 major structural change（DEC-027 決定4、REQ-048-012）
- G1〜G4 は同一 baseline へ複数の主要変更を混在させないため直列実行する（Epic #2597 AG-003）。G4 の実行時点で G1〜G3 の主要構造変更を混在させない
- ランキング §6.1 が G4 を3位に置いた根拠は、Safety relevance が高く、判断できた場合の Impact は大きい一方、Cost、Benefit とも未測定で Observability confidence が低〜中であること、hard governance 不変条件を Guardrail に含める必要があり実行難度が中以上であることである
- ランキング §8 C4 は、G4 の後で DOWNGRADE（条件付き化）または NARROW を評価すると整理している

G4 の単一の主要構造変更として、review / verification 実行の条件付き化（trigger ベース）のみを選定する。trigger の判定を導入するが、hard governance 不変条件と QG-1〜QG-4 必須統制の維持を前提とする。

## Baseline

Baseline 要素は Baseline V2 で充足する。Baseline V2 とは「本要件再構築時点の GitHub 最新 ADF control plane」であり、その定義は Baseline V2 定義基盤 Report §1 が正である（`docs/reports/req-048-baseline-v2-definition.md`）。

### Baseline の取得手順（実証Case 実行時）

Baseline 測定は、後続実証Caseが実験実行時に取得する。取得手順は Baseline V2 定義基盤 Report §2 の baseline commit SHA 固定手順（4ステップ）に従う。

1. 測定実行時に `git fetch origin main` を実行し、`git rev-parse origin/main` で GitHub 最新 default branch SHA を取得する
2. 取得した SHA が structurally normalized commit（`a0b5ac82c776a714c133c8245fce90c99dd1a836`）の子孫であることを `git merge-base --is-ancestor <structurally-normalized-SHA> origin/main` で確認する。子孫でない場合、測定を開始せず、その判断を測定 Report に記録する
3. baseline の選択は「structurally normalized commit を含む測定時 origin/main」で確定する
4. 測定 Report に baseline SHA、子孫確認の結果、実行日時の3点を固定記録する

測定手続きは Baseline V2 測定 Report §2 に従う。評価軸6軸と Observation Tax の観測方法（§2.1）、指標の取得源と測定方法（§2.2）、処理区分の対応付け（§2.3）、Observation Tax の測定方法（§2.4）を使用する。

### 比較の起点と参照値

本 Report は測定値を作成しない。実験の比較起点は、実証Caseが上記手順で固定記録する baseline SHA と、その時点の測定結果である。参照値として、C4 は発動回数の系統記録がなく、PR 本文の検証記録から部分観測可能だが未集計である。Review / Verification の Cost、Benefit、工程別 wall-clock と token は未測定であり、Baseline V2 測定 §6 の observability gap として扱う。6 execution units はサンプル不足であり、未測定軸を推定値で補わない。

比較可能性の条件は Baseline V2 定義基盤 Report §4 に従う。Baseline V2 と同一の指標定義、同一の実行単位定義で算出した結果とのみ比較し、Legacy Baseline（`docs/reports/req-048-reanalysis-baseline.md`）との直接比較は行わない。

## Hypothesis

実験 G4 の仮説を次に1文で定める。

> 実測データ（Baseline V2）と既存 risk / finding / modification state から定義した trigger に基づき review / verification の実行を条件付き化しても、DEC-001 決定3の hard governance 不変条件と QG-1〜QG-4 の必須統制は維持され、REQ-048-008 の incremental value 比較可能性を損なわず、review / verification 工程の Observation Tax は現行の常時実行より減少する。

仮説が支持された場合、hard governance 不変条件、QG 必須統制、incremental value 比較可能性を維持したまま Tax の減少が確認され、DOWNGRADE（条件付き化）の判断候補が支持される。仮説が棄却された場合、いずれかの不変条件または必須統制が損なわれた、比較可能性が損なわれた、または Tax の減少が確認できず、KEEP の判断候補が支持される。仮説は予測であり、判断の確定ではない。

仮説の検定では単一の指標のみを理由に判断しない（DEC-027 決定2、REQ-048-006）。Observation の指標を Cost 側（review / verification と trigger 判定の Observation Tax）と Benefit 側（Guardrail の観測）の対で読む。

## 主要構造変更

G4 の主要構造変更は次の1件のみである。

| 項目 | 内容 |
|---|---|
| 変更 | review / verification の実行を、各工程での常時実行から、実測データ、既存 risk、finding / modification state の3ソースから定義した trigger が成立した場合に実行する方式へ条件付き化する。trigger 不成立時に省略できるのは対象機構の実行であり、hard governance 不変条件と QG-1〜QG-4 必須統制は維持する |
| 単位 | review / verification の発動条件、trigger の定義と判定方式。hard governance 不変条件、QG-1〜QG-4 の配置と判定、review NG フローの意味、finding 5分類、adversarial-review の審議契約自体は本変更の単位に含めない |

選定理由は次のとおりである。

- REQ-048-014 は review 回数、verification 回数を REQ の成立条件として固定せず、観測・評価対象として扱うことを定めている
- DEC-027 決定5は Safety invariant の維持を評価対象とし、機構の実装方式の簡素化を評価可能としている。条件付き化は不変条件を維持する範囲だけを対象とする
- ランキング §8 C4 が DOWNGRADE（条件付き化）または NARROW を実験後の判断候補として記録している
- 対象を実行条件の1件に限定するため、G1〜G3 の変更や複数の主要変更を混在させない

本実験に混在させない変更を次に明示する。

- DEC-001 決定3の hard governance 8点の緩和、廃止、追加、およびそれらを実現する機械検査の廃止
- QG-1〜QG-4 必須統制の廃止、緩和、配置変更、判定契約の変更
- finding 5分類の意味変更、検証差分セクション形式の変更（G1 対象）
- structured handoff field 集合の変更（G2 対象）
- source / projection 参照方式の変更（G3 対象）
- adversarial-review の審議契約、review NG フロー、REQ-003-042 と REQ-007-005 の所有境界の変更
- integrity suite、docs-check、契約テストの廃止または常時実行の緩和

## Guardrail

Guardrail は実験中に維持すべき不変条件である（DEC-027 決定5）。

> Safety invariant は「機構」ではなく「不変条件」の維持を評価対象とする。DEC-001 決定3の hard governance 8点に該当する不変条件は維持し、それを実現する重複した field、checker、document、state、step の縮小は評価可能である。

| # | 不変条件 | 根拠 |
|---|---|---|
| GR-1 | hard governance 不変条件の維持: DEC-001 決定3の8点（状態破壊、権限逸脱、ユーザー合意の偽装、作業または永続情報の喪失、二重実行・競合更新、誤った成果物の正規化、下流工程の実行不能、後から検出・回復できない重大な失敗）は条件付き化の対象外とし、実験中および採用後も維持する。これらを実現する機械検査の常時実行を緩めない | DEC-001 決定3、DEC-027 決定5 |
| GR-2 | QG 必須統制の維持: quality-gates Design が主ワークフローへ配置する QG-1〜QG-4（Definition Integrity、Acceptance Criteria Coverage、Implementation Deviation、Final Acceptance）は条件付き化の対象外とし、各工程で維持する | quality-gates Design、REQ-007 |
| GR-3 | incremental value 比較可能性の維持: review、verification の実行または省略を記録し、当該工程で初めて確認された actionable finding を前工程の finding と区別して、後続工程の incremental value を比較できる | REQ-048-008 |
| GR-4 | 保守的な trigger 判定: REQ-054 が高 risk と判定した変更、新規 finding、修正済み finding の反復、審議中または不明な変更状態がある場合は review / verification を省略しない。実測データがサンプル不足または未測定の場合は常時実行側へ倒す | REQ-054、REQ-048-008、Baseline V2 測定 §5 |
| GR-5 | N/A 非停止: harness 指標の欠落や部分測定は observability gap として分析時に扱い、workflow を停止させない。review 回数、verification 回数は REQ-048 の成立条件として固定せず、観測・評価対象として扱う | REQ-048-004、REQ-048-014 |

GR-1 から GR-5 のいずれかが不成立となった実験結果は、仮説の成立如何に関係なく条件付き化の判断候補を採用できない。この場合の判断候補は KEEP であり、その根拠を実データで記録する。

## Observation

測定対象は Baseline V2 測定 Report §2 の手順に従う。測定の実施は後続実証Caseが実験実行時に行う。

| 観測対象 | 指標 | 取得方法 |
|---|---|---|
| Review / Verification 実行の Observation Tax（Cost） | review、verification、trigger 判定の実行回数、および取得可能な場合の token、wall-clock、tool call、重複読み書き | Baseline V2 測定 §2.3 の処理区分（Review、Verification）と §2.4 の方法。harness 指標が取得不能な場合は未測定と記録し、推定値を埋めない |
| trigger 判定の保守コスト | 3ソースの取得と判定に要した作業、maintenance / contract complexity、判定記録の保守箇所 | Baseline V2 測定 §2.4 の Observation Tax 方法と、変更ファイルおよび既存契約の記録 |
| 構造観測値 | trigger の成立・不成立、review / verification の発動・省略、理由、参照した実測データ・risk・finding / modification state の記録 | Issue、PR、コメントの構造化記録から抽出する（Baseline V2 測定 §2.2、§4.1） |
| Guardrail 観測（Quality、Benefit 側） | hard governance 8点に該当する事象の有無、QG-1〜QG-4 の実行結果と継続、finding の工程間比較、incremental value 比較の可否 | PR 本文、Issue コメント、quality gate 結果、検証差分を突合する（Baseline V2 測定 §2.1） |
| 自律性への影響（Autonomy） | human intervention、user-decision-required、blocked、failed、delegation-unavailable、self-heal、stop、resume の発生有無 | Baseline V2 測定 §2.1 の Autonomy 軸の観測方法 |

観測の境界を次に記す。

- Cost 側の Observation Tax と Benefit 側の Guardrail 観測を対で記録し、単一指標のみを理由に判断しない（DEC-027 決定2、REQ-048-006）
- token は input、output、cache read、cache write の性質を区別し、単純合算値を Cost の判断に用いない（REQ-048-007）
- 発動回数の系統記録が現状なく、harness 指標も observability gap により未測定である場合は、構造観測と Guardrail 観測を記録するだけに留め、未測定軸を推定値で埋めない
- trigger 判定の記録方式は観測の前提であり、review / verification の条件付き化以外の主要構造変更として扱わない

## Decision 記録形式

実験の判定は KEEP、NARROW、MERGE、DOWNGRADE、DELETE の5値から1つを選び、次の形式で既存成果物へ記録する。記録先は Report、Decision、Issue 等の既存成果物であり、新規成果物種別を追加しない（REQ-048-016）。

| 記録項目 | 内容 |
|---|---|
| 判断値 | KEEP / NARROW / MERGE / DOWNGRADE / DELETE の1値（REQ-048-013） |
| 判断の根拠 | Hypothesis の支持・棄却、Observation の指標値、取得源、実行日時 |
| Guardrail 確認 | GR-1 から GR-5 の成立確認結果 |
| 比較範囲 | 使用した baseline SHA、および Baseline V2 定義基盤 Report §4 の比較可能範囲に収まることの確認。未測定軸とサンプル不足の明示を含む |
| trigger 根拠 | 実測データ、既存 risk、finding / modification state の各入力、trigger の成立・不成立、review / verification の発動・省略理由 |
| 証跡 | PR 本文、Issue コメント、quality gate 結果等の証跡への参照 |
| 削除成功条件の不在 | 削除そのものを成功条件としないことの明示（REQ-048-013、DEC-027 決定2） |

G4 における判断の方向性を次に記す。これは実行前の判断の確定ではなく、判断候補の整理である（REQ-048-013）。

- DOWNGRADE: 条件付き化が GR-1〜GR-5 を維持し、review / verification の Observation Tax 減少が確認された場合の判断候補。ランキング §8 C4 の条件付き化に対応し、trigger の具体条件を確定する
- NARROW: 条件付き化の価値が review または verification の一方、または特定の変更領域だけで確認された場合の判断候補。適用範囲を狭めて確定する
- KEEP: Guardrail の不成立、incremental value 比較可能性の損失、または Tax 減少の未確認の場合の判断候補。現行の常時実行が要求を満たす形であることを実データが示す
- MERGE、DELETE: 原則採用しない。DELETE は review / verification 自体の廃止にあたり、hard governance 不変条件または QG 必須統制を失うため、条件付き化の判断候補にはしない

## 実験の実行・判定の分離（後続実証Case）

本 Report は実験の定義のみを所有する。実験の実行・判定は本実行単位（#2609）の完了条件に含まれない。

- 実験の実行・判定（KEEP / NARROW / MERGE / DOWNGRADE / DELETE の確定）は、Epic #2597 のとおり後続の個別実証（実証Case候補、AG-002・CR-001）として分離する
- 実行時に、評価ブランチと評価契約を当該実証Caseの Issue で確定する（REQ-043、DEC-018）。本 Report は評価ブランチ・評価契約を先に確定しない
- G1〜G4 は同一 baseline へ複数の主要変更を混在させないため直列実行する（AG-003）。本実行単位は G4 定義のみを担当する
- 実証Case は、本 Report の Baseline 節の手順で baseline を固定記録し、trigger の3ソースを確認して Observation 節の指標を測定し、Guardrail 節の不変条件を確認した上で、Decision 記録形式で判断を記録する
- 実測データ、risk、finding / modification state に基づく trigger の具体的な閾値と条件式は、REQ-043、DEC-018 に従い実行時に確定する

## 検証対応

### ADF-COVERS 宣言と検証対応

本 Report は `ADF-COVERS(verification): REQ-048-008, REQ-048-012, REQ-048-014, REQ-048-016` を宣言する。

- REQ-048-012: Baseline、Hypothesis、主要構造変更、Guardrail、Observation、Decision 記録形式の各節により、実験契約の6要素を識別可能に保存する。主要構造変更を review / verification 実行の条件付き化1件に限定し、混在させない変更を明示する
- REQ-048-008: trigger の finding / modification state 入力と Guardrail の incremental value 比較可能性を保存し、finding の工程間比較を維持する
- REQ-048-014: review 回数、verification 回数を REQ の成立条件として固定せず、trigger ベースの観測・評価対象として扱うことを trigger の定義根拠節と Guardrail で示す
- REQ-048-016: 実験定義を既存成果物種別（Report）へ保存し、新規成果物種別、実行履歴 DB、恒久 checker、公開入口を追加しない

### TS-012E 読み戻し検証

Issue #2609 テスト戦略 TS-012E に従い、本 Report の読み戻しで次を確認した。

| 確認項目 | 結果 | 証拠 |
|---|---|---|
| REQ-048-012 の6要素（Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision）が識別可能である | 合格 | `## Baseline`、`## Hypothesis`、`## 主要構造変更`、`## Guardrail`、`## Observation`、`## Decision 記録形式` が存在する |
| trigger の定義根拠（実測データ、既存 risk、finding / modification state）が明示されている | 合格 | 「trigger の定義根拠」節に3ソースを独立して記載し、Baseline V2、REQ-054 / DEC-024、REQ-048-008 / REQ-003-042 を参照している |
| Guardrail が hard governance 不変条件と QG 必須統制の維持を定義している | 合格 | GR-1 が DEC-001 決定3の8点を条件付き化対象外として維持し、GR-2 が QG-1〜QG-4 を対象外として維持する。GR-5 は N/A 非停止を定義する |
| 実行・判定が後続実証Caseに分離されている | 合格 | 「実験の実行・判定の分離（後続実証Case）」節が本 Issue の完了条件外、REQ-043 / DEC-018 実行時確定、G1〜G4 直列実行を明示している |

### docs 変更整合性検証

本 Report の保存後、`check_changed_docs.ts` を `--workflow case-run` で実行し、failures 0、warnings 0 を確認した。実行結果は PR 本文の検証差分セクションに記録する。
