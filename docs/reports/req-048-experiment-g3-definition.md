---
id: EXPERIMENT-G3-REQ048-DEFINITION
title: "REQ-048 実験G3定義（source / projection 再参照の縮小・OU-011 / WP-09-3 Phase B）"
status: accepted
created: 2026-09-05
source_issue: "#2608 (OU-011 / WP-09-3 Experiment G3 実験定義)"
parent_epic: "#2597 (REQ-048 再構築・測定・実験系)"
---

<!-- ADF-COVERS(verification): REQ-048-007, REQ-048-012, REQ-048-016 -->
# REQ-048 実験G3定義（source / projection 再参照の縮小・OU-011 / WP-09-3 Phase B）

## 本 Report の位置づけ

本 Report は、REQ-048 再構築・測定・実験系 Epic（#2597）の Wave 5（OU-011 / WP-09-3）で作成した実験 G3（source / projection 再参照の縮小）の実行可能な実験定義である。REQ-048-012 の実験契約が要求する6要素（Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision）を、各節で識別可能な形に保存する。

実験 G3 の定義対象は、解決済み reference choice の再判断削減である。source を常に確認する、projection を常に確認するといった参照先の固定化（固定ルール化）は定義対象に含めない。この区別は workflow-contracts Design「source / projection 参照確認の工程契約」が定める「常に source のみ」「常に projection のみ」のような固定ルールとしない契約に従うものであり、「実験対象と定義対象の契約」節に記す。

本 Report は既存成果物種別（Report）への保存であり、測定専用の新しい成果物種別、実行履歴 DB、恒久 checker、公開入口を追加しない（REQ-048-016、DEC-027 決定6）。本 Report が所有するのは実験の定義であり、実験の実行・判定は後続の個別実証（実証Case候補）へ分離する。分離の契約は「実験の実行・判定の分離（後続実証Case）」節に記す。

入力は、削減候補ランキング（`docs/reports/req-048-candidate-ranking.md`）、Baseline V2 測定（`docs/reports/req-048-baseline-v2-measurement.md`）、Baseline V2 定義基盤（`docs/reports/req-048-baseline-v2-definition.md`）、REQ-048、DEC-027、および workflow-contracts Design「source / projection 参照確認の工程契約」の現行ベースラインである。

## 実験対象と定義対象の契約（固定化との区別）

実験 G3 の対象機構は、source / projection 再参照（ランキング候補 C3）である。REQ-048-007 が Efficiency の評価対象とする「同一 path 再読込、子実行間の同一 path 再読込、source / projection 重複参照」に該当し、REQ-048-014 が「source / projection 参照の引き継ぎ方式は本要件の成立条件として固定しない」と定める範囲の機構である。

現行ベースラインの構造は次のとおりである（workflow-contracts Design「source / projection 参照確認の工程契約」）。

- 各工程における成果物参照は、実行目的に応じて正規原本（source）を確認すべき場合、実行時投影（projection）を確認すべき場合、双方の整合確認が必要な場合を判別して行う。「常に source のみ」「常に projection のみ」のような固定ルールとしない
- 工程間の文脈引き継ぎ等を利用して、当該作業で使用すべき解決済み参照先を後工程へ渡せる
- source / projection 双方の確認が品質保証上必要な場合は、その確認を維持する。source / projection 責務境界自体の変更が必要となった場合は、当該要件の暗黙事項として扱わず、正規の設計判断を行う
- この参照引き継ぎの具体的方式と source / projection 重複参照の効率は、REQ-048-007（Efficiency）の評価対象であり、引き継ぎ方式は REQ-048-014 のとおり REQ-048 の成立条件として固定しない

定義対象と対象外の区別を次に固定する。

| 区分 | 内容 |
|---|---|
| 定義対象（再判断削減） | ある実行または委譲ですでに解決済みの reference choice（source を確認した、projection を確認した、双方の整合確認をした、の別と参照済み path）を、後工程や子実行が再判断しないで済む形で引き継ぐこと。同一 path 再読込、子実行間の同一 path 再読込、source / projection 重複参照の削減をこの形で評価する |
| 対象外（固定化） | 「常に source を確認する」「常に projection を確認する」等の参照先の固定ルール化。実行目的に応じた判別を廃する変更は workflow-contracts Design の工程契約に反するため、本実験の定義対象に含めない |

ランキング §2 が記録した C3 の測定状態は、同一 path 再読込、source / projection 重複参照とも harness データ未永続化のため未測定である（Baseline V2 測定 §6 の observability gap）。縮小候補は REQ-048-007 の評価対象指標に対応する3種として列挙する。

| 縮小候補 | 内容 | 測定状態 |
|---|---|---|
| 同一 path 再読込（1実行内） | 同一の実行・委譲単位内で同一 path を複数回読み取る重複 | 未測定（harness read 履歴未永続化） |
| 子実行間の同一 path 再読込 | 委譲単位をまたいで同一 path を再読み取りする重複。session 対応付けの gap を含む | 未測定（harness read 履歴と session 識別子の未永続化） |
| source / projection 重複参照 | 同一実体を source と projection の双方から参照する重複 | 未測定（harness read 履歴未永続化） |

## 単一性の契約と単一変更の選定

- 1 experiment = 1 major structural change（DEC-027 決定4、REQ-048-012）
- G1〜G4 は同一 baseline へ複数の主要変更を混在させないため直列実行する（Epic #2597 AG-003）。G3 の実行時点で G1、G2、G4 の主要構造変更を混在させない
- ランキング §6.1 が G3 を4位に置いた根拠は、Frequency、Cost とも未測定で Observability confidence 低、Baseline V2 測定 §6 の harness テレメトリ読取手順の整備が測定の前提であることである。この順位は縮小価値が低いという判断ではなく（ランキング §6.1 が明記）、測定可能状態の整備が実行条件になることを示す。この前提を本 Report は Baseline 節、Hypothesis 節、Observation 節に反映する
- C3 は REQ-048-011 分類で Efficiency support、5価値軸では Efficiency（重複読み取りの削減余地）が主である（ランキング §7）。本実験の Guardrail は source / projection の判別参照と責務境界を不変条件として保存する

3つの縮小候補から単一の主要構造変更の対象として、source / projection 重複参照（解決済み reference choice の記録と引き継ぎ）を選定する。選定理由を次に記す。

1. workflow-contracts Design が「参照引き継ぎの具体的方式と source / projection 重複参照の効率は、REQ-048-007（Efficiency）の評価対象」と現行ベースラインとして宣言済みであり、REQ-048-014 も引き継ぎ方式を REQ の成立条件として固定しない。契約上、縮小空間が明示されている唯一の候補である
2. 同一 path 再読込（1実行内）と子実行間の同一 path 再読込は、harness 実行機構の read 挙動そのものであり、ADF 配布物側に縮小対象の機構を持たない。子実行間の再読込はさらに session 識別子の取得手段が未整備（Baseline V2 測定 §6）であるため、測定前提の整備難度が最も高い
3. 解決済み reference choice の引き継ぎは、選定対象の重複参照に加え、解決済み実体の再確認に起因する同一 path 再読込を従属的に減らし得る。ただし従属的な効果は Observation で観測するにとどめ、本実験の判断理由の主指標は重複参照の縮小とする

## Baseline

Baseline 要素は Baseline V2 で充足する。Baseline V2 とは「本要件再構築時点の GitHub 最新 ADF control plane」であり、その定義は Baseline V2 定義基盤 Report §1 が正である（`docs/reports/req-048-baseline-v2-definition.md`）。

### Baseline の取得手順（実証Case 実行時）

Baseline 測定は、後続実証Caseが実験実行時に取得する。取得手順は Baseline V2 定義基盤 Report §2 の baseline commit SHA 固定手順（4ステップ）に従う。

1. 測定実行時に `git fetch origin main` を実行し、`git rev-parse origin/main` で GitHub 最新 default branch SHA を取得する
2. 取得した SHA が structurally normalized commit（`a0b5ac82c776a714c133c8245fce90c99dd1a836`）の子孫であることを `git merge-base --is-ancestor <structurally-normalized-SHA> origin/main` で確認する。子孫でない場合、測定を開始せず、その判断を測定 Report に記録する
3. baseline の選択は「structurally normalized commit を含む測定時 origin/main」で確定する
4. 測定 Report に baseline SHA、子孫確認の結果、実行日時の3点を固定記録する

測定手続きは Baseline V2 測定 Report §2 に従う。評価軸6軸と Observation Tax の観測方法（§2.1）、指標の取得源と測定方法（§2.2）、処理区分の対応付け（§2.3）、Observation Tax の測定方法（§2.4）である。

### 測定整備の前提

ランキング §5 が G3 の実行の前提として記録したとおり、Baseline V2 測定 §6 の harness テレメトリ読取手順の整備が測定の前提であり、整備前に実行数値は得られない。実証Caseは実験実行前に、Baseline V2 測定 §6 の整備項目のうち次の2項を整備する。整備は REQ-048-003 のとおり harness 側の既存生実行履歴を読み取り専用で分析時に読む方向で行い、ADF 側の新規必須 field、永続 state、公開入口を追加しない。

- harness 側の message、part、tool call、token 生成元情報を、実行単位とともに読み取り専用で取得できる手順（wall-clock、同一 path 再読込、source / projection 重複参照の測定に必要）
- 委譲実行時の harness session 識別子を取得できる手段（子実行間の同一 path 再読込の対応付けに必要）

### 比較の起点と参照値

本 Report は測定値を作成しない。実験の比較起点は、実証Case が上記手順で固定記録する baseline SHA と、その時点の測定結果である。参照値として、Baseline V2 測定がすでに記録した構造観測値のうち G3 の比較対象に使える値は存在しない。同一 path 再読込、子実行間の同一 path 再読込、source / projection 重複参照は Baseline V2 測定 §6 が observability gap として記録した未測定指標であり、本実験はこの gap の解消後に初めて比較可能になる。この未測定であること自体を、G3 の baseline 状態として記録する。

比較可能性の条件は Baseline V2 定義基盤 Report §4 に従う。Baseline V2 と同一の指標定義、同一の実行単位定義で算出した結果とのみ比較し、Legacy Baseline（`docs/reports/req-048-reanalysis-baseline.md`）との直接比較は行わない。

## Hypothesis

実験 G3 の仮説を次に1文で定める。仮説の単位は source / projection 重複参照（解決済み reference choice の再判断削減）であり、前提として測定整備の完了を含む。

> 測定整備（harness テレメトリ読取手順）を完了した上で、工程間・委譲時の文脈引き継ぎへ解決済み reference choice（確認済みの source / projection の別と参照済み path）を記録し、後工程が同一実体の source / projection 再判断を省略できるようにしても、実行目的に応じた source / projection の判別と品質保証上必要な双方確認は維持され、同一 path 再読込、子実行間の同一 path 再読込、source / projection 重複参照（REQ-048-007 の Efficiency 指標）と wall-clock は現行の逐次再確認より減少する。

仮説の読み方を次に区別する。

- 仮説が支持された場合（判別と双方確認が維持され、指標の減少が確認された場合）: 逐次再確認が REQ-048-007 の効率を保つ最小形であるとは言えないことが実データで示され、NARROW（解決済み choice 引き継ぎの方式確定）の判断候補が支持される
- 仮説が棄却された場合（判別または双方確認が損なわれた、または指標の減少が確認できなかった場合）: 現行の逐次再確認が要求を満たす形であることを実データが示し、KEEP の判断候補が支持される
- 仮説は予測であり、判断の確定ではない。判断は Decision 要素の記録形式に従い、実行後の実データで行う

仮説の検定では単一の指標のみを理由に判断しない（DEC-027 決定2、REQ-048-006）。Observation の指標を Cost 側（Observation Tax、再読込・重複参照）と Benefit 側（Guardrail の観測）の対で読む。

## 主要構造変更

G3 の主要構造変更は次の1件のみである。

| 項目 | 内容 |
|---|---|
| 変更 | 工程間・委譲時の文脈引き継ぎへ、当該作業で使用する解決済み reference choice の記録を含める。記録するのは、参照した系の別（source を確認した、projection を確認した、双方の整合確認をした）と参照済み path、および後工程が再判断を省略してよい範囲である。後工程は記録された実体について source / projection どちらを確認済みかの再判断を省略する。実行目的に応じた source / projection の判別自体は変更しない |
| 単位 | 解決済み参照先の記録と後工程引き継ぎの方式（記録項目と省略範囲の定義）。harness 実行機構（read キャッシュ、session 取得手段）、source / projection 責務境界、参照先を固定する運用ルールは本変更の単位に含まれない |

選定理由を次に記す。

- workflow-contracts Design が「工程間の文脈引き継ぎ等を利用して、当該作業で使用すべき解決済み参照先を後工程へ渡せる」ことを現行ベースラインとして宣言済みであり、その具体的方式は REQ-048-007 の評価対象、REQ-048-014 の固定対象外である。解決済み choice の記録は、すでに契約上許容されている機構の具体化であって、新しい統制の追加ではない
- 現行ベースラインでは解決済み参照先の記録の形式と省略範囲が定義されておらず、後工程の再判断は工程・委譲ごとに暗黙である。変更前後の差を、解決済み choice の記録の有無という構造観測と、REQ-048-007 の指標の実測の両方で評価できる
- 対象が1件のみであるため、複数の主要変更を混在させずに指標変化を観測できる

本実験に混在させない変更を次に明示する。これらは G3 の主要構造変更に含めない。

- source / projection 責務境界自体の変更。DEC-002 の分離契約は配布原則であり、その変更は正規の設計判断として本実験の対象外である（ランキング §8 C3 が「DEC-002 の分離契約そのものは対象外」と記録済み）
- 「常に source」「常に projection」等の参照先の固定ルール化（定義対象外、workflow-contracts Design の工程契約に反する）
- source / projection 双方の確認が品質保証上必要な場合の確認の廃止・代替
- harness 実行機構の変更（read キャッシュの導入、session 識別子取得手段の実装等）。session 取得手段の整備は測定の前提であり、縮小対象ではない
- 同一 path 再読込の他の削減手段（委譲構造、子実行構造の変更）
- 検証差分セクション（G1 対象、ランキング候補 C1）、実行識別情報 field 集合（G2 対象、ランキング候補 C2）への変更

## Guardrail

Guardrail は実験中に維持すべき不変条件である（DEC-027 決定5: 機構ではなく不変条件の維持を評価対象とする）。workflow-contracts Design「source / projection 参照確認の工程契約」の本文を次に引用する。

> 各工程における成果物参照は、実行目的に応じて正規原本（source）を確認すべき場合、実行時投影（projection）を確認すべき場合、双方の整合確認が必要な場合を判別して行う。「常に source のみ」「常に projection のみ」のような固定ルールとしない。
> 工程間の文脈引き継ぎ等を利用して、当該作業で使用すべき解決済み参照先を後工程へ渡せる。
> source / projection 双方の確認が品質保証上必要な場合は、その確認を維持する。source / projection 責務境界自体の変更が必要となった場合は、当該要件の暗黙事項として扱わず、正規の設計判断を行う。

| # | 不変条件 | 根拠 |
|---|---|---|
| GR-1 | source / projection 責務境界の非変更: 実験および NARROW 採用時の方式確定は、source（正規原本）と projection（実行時投影）の責務境界、および workflow-contracts Design「source / projection 参照確認の工程契約」が定める責務境界自体を変更しない。責務境界自体の変更が必要となった場合は正規の設計判断であり、本実験の判断対象に含めない | workflow-contracts Design「source / projection 参照確認の工程契約」後段、DEC-002、ランキング §8 C3 |
| GR-2 | 判別して参照する契約の維持: 変更後も、成果物参照は実行目的に応じて source、projection、双方の整合確認を判別して行う。「常に source のみ」「常に projection のみ」の固定ルールへの置き換え、および解決済み choice の記録を理由にした判別工程の廃止を行わないこと | workflow-contracts Design「source / projection 参照確認の工程契約」前段 |
| GR-3 | 品質保証上必要な双方確認の維持: source / projection 双方の確認が品質保証上必要な場合は、解決済み reference choice の記録が存在しても、その確認を省略しない。記録は双方確認の必要を判断する入力であり、双方確認の代替ではないこと | workflow-contracts Design「source / projection 参照確認の工程契約」中段 |
| GR-4 | N/A 非停止と観測対象性の維持: harness 指標の欠落、部分測定は observability gap として分析時に扱い、workflow を停止させないこと。参照引き継ぎ方式は REQ-048-014 のとおり REQ の成立条件として固定せず、観測・評価対象として扱い続けること | REQ-048-004、REQ-048-014 |

GR-1 から GR-4 のいずれかが不成立となった実験結果は、仮説の成立如何に関係なく NARROW（解決済み choice 引き継ぎの方式確定）の判断候補を採用できない。この場合の判断候補は KEEP であり、その根拠を実データで記録する。

## Observation

測定対象は Baseline V2 測定 Report §2 の手順に従い、測定整備の前提節に記した整備完了後に取得する。測定の実施は後続実証Caseが実験実行時に行う。

| 観測対象 | 指標 | 取得方法 |
|---|---|---|
| 参照・再読込の Observation Tax（Cost） | wall-clock、同一 path 再読込回数（1実行内）、子実行間の同一 path 再読込回数、source / projection 重複参照数（REQ-048-007 の Efficiency 指標） | Baseline V2 測定 §2.4 の方法と、測定整備の前提節の手順。harness の message、part、tool call 履歴から path 単位の読み取り回数と参照系の別を数える。harness 指標が取得不能な場合は未測定と記録し、推定値を埋めない |
| Observation Tax（maintenance / contract complexity） | 解決済み choice の記録方式に関わる引き継ぎ記載、契約記述の保守箇所の変更有無と件数 | リポジトリ変更ファイルから数える。記録方式の変更が既存契約の更新を要求するかを含む |
| 構造観測値 | 解決済み reference choice の記録の有無、記録項目（参照系の別、参照済み path、省略範囲）の充足率、再判断省略の適用範囲 | 文脈引き継ぎの記録と PR 本文の構造抽出（Baseline V2 測定 §2.2、§4.1 の手順に準拠） |
| Guardrail 観測（Quality、Benefit 側） | 参照が実行目的に応じて判別されて行われたか。品質保証上必要な双方確認が省略されなかったか。source / projection 責務境界が変更されていないか | 文脈引き継ぎの記録と実際の参照の突合、変更ファイルの責務境界確認（Baseline V2 測定 §2.1 の Quality 軸の観測方法） |
| 自律性への影響（Autonomy） | human intervention、user-decision-required、blocked、failed、delegation-unavailable、self-heal、stop、resume の発生有無 | Baseline V2 測定 §2.1 の Autonomy 軸の観測方法 |

観測の境界を次に記す。

- 測定整備が完了しないまま取得した数値は比較に用いない。整備前に実行数値は得られない（ランキング §5 の G3 実行の前提）
- harness 指標（wall-clock、再読込回数等）は observability gap（Baseline V2 測定 §6）により未測定である可能性が残る。その場合、構造観測値と Guardrail 観測のみで判断し、未測定の軸を推定値で埋めない（REQ-048-004、REQ-048-007）
- Cost 側の観測（Observation Tax、再読込・重複参照）と Benefit 側の観測（Guardrail 観測）を対で記録し、単一指標のみを理由に判断しない（DEC-027 決定2、REQ-048-006）
- token は input、output、cache read、cache write の性質を区別して記録し、単純合算値を Cost の判断に用いない（REQ-048-007）

## Decision 記録形式

実験の判定は KEEP、NARROW、MERGE、DOWNGRADE、DELETE の5値から1つを選び、次の形式で既存成果物へ記録する。記録先は Report、Decision、Issue 等の既存成果物であり、新規成果物種別を追加しない（REQ-048-016）。

| 記録項目 | 内容 |
|---|---|
| 判断値 | KEEP / NARROW / MERGE / DOWNGRADE / DELETE の1値（REQ-048-013） |
| 判断の根拠 | Hypothesis の支持・棄却、Observation の指標値（取得源と実行日時を含む） |
| Guardrail 確認 | GR-1 から GR-4 の成立確認結果 |
| 比較範囲 | 使用した baseline SHA、および Baseline V2 定義基盤 Report §4 の比較可能範囲に収まることの確認。測定整備の完了確認を含む |
| 証跡 | PR 本文、Issue コメント等の証跡への参照 |
| 削除成功条件の不在 | 削除そのものを成功条件としないことの明示（REQ-048-013、DEC-027 決定2） |

G3 における判断の方向性を次に記す。これは実行前の判断の確定ではなく、判断候補の整理である（REQ-048-013）。

- NARROW: 解決済み reference choice の記録と引き継ぎが Guardrail（GR-1〜GR-4）を維持し、重複参照・再読込指標の減少が確認された場合の判断候補。引き継ぎ方式の具体形を確定する。ランキング §8 C3 が「実験 G3 の後で NARROW または DOWNGRADE を評価」と記録したうち、引き継ぎ方式の確定に対応する方向である
- KEEP: Guardrail の不成立、または指標の減少が確認できなかった場合の判断候補。現行の逐次再確認（暗黙の解決済み参照取り扱い）が要求を満たす形であることを実データが示す
- DOWNGRADE: 解決済み choice の記録が、常時ではなく特定の工程・委譲条件でのみ価値を持つことが実データで示された場合に評価する可能性の判断候補。機構の常時適用を条件付きへ緩める方向であり、DEC-027 決定5 のとおり実装方式の簡素化としてのみ評価する
- MERGE、DELETE: 原則採用しない。DELETE（source / projection 参照確認自体の廃止）は workflow-contracts Design の工程契約と責務境界の変更に相当し、ランキング §8 が DEC-002 の分離契約そのものを対象外と記録済みである

## 実験の実行・判定の分離（後続実証Case）

本 Report は実験の定義のみを所有する。実験の実行・判定は本実行単位（#2608）の完了条件に含まれない。

- 実験の実行・判定（KEEP / NARROW / MERGE / DOWNGRADE / DELETE の確定）は、Epic #2597 のとおり後続の個別実証（実証Case候補、AG-002・CR-001）として分離する
- 実行時に、評価ブランチと評価契約を当該実証Caseの Issue で確定する（REQ-043、DEC-018）。本 Report は評価ブランチ・評価契約を先に確定しない
- G1〜G4 は同一 baseline へ複数の主要変更を混在させないため直列実行する（AG-003）。本実行単位は G3 定義のみを担当する
- 測定整備（harness テレメトリ読取手順、session 識別子取得手段）の整備は、実証Caseが実験実行の前置きとして実施する。この整備自体は本実験の主要構造変更に含めない
- 実証Case は、本 Report の Baseline 節の手順で baseline を固定記録し、測定整備を完了した上で Observation 節の指標を測定し、Guardrail 節の不変条件を確認した上で、Decision 記録形式で判断を記録する

## 検証対応

### ADF-COVERS 宣言と検証対応

本 Report は `ADF-COVERS(verification): REQ-048-007, REQ-048-012, REQ-048-016` を宣言する。

- REQ-048-012: Baseline、Hypothesis、主要構造変更、Guardrail、Observation、Decision 記録形式の各節により、実験契約の6要素を識別可能に保存する。単一の主要構造変更を1件（解決済み reference choice の記録と引き継ぎ）に限定し、混在させない変更を明示する
- REQ-048-007: Observation 節が wall-clock、同一 path 再読込、子実行間の同一 path 再読込、source / projection 重複参照を評価対象指標として保存し、token の性質区分と単純合算の不使用を観測の境界に記す
- REQ-048-016: 実験定義を既存成果物種別（Report）へ保存し、新規成果物種別、実行履歴 DB、恒久 checker、公開入口を追加しない

### TS-012D 読み戻し検証

Issue #2608 テスト戦略 TS-012D に従い、本 Report の読み戻しで次を確認した。

| 確認項目 | 結果 | 証拠 |
|---|---|---|
| REQ-048-012 の6要素（Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision）が識別可能である | 合格 | 各要素に対応する見出し節が1つずつ存在する。`## Baseline`、`## Hypothesis`、`## 主要構造変更`、`## Guardrail`、`## Observation`、`## Decision 記録形式` |
| 定義対象が解決済み reference choice の再判断削減であり、固定化（source / projection の固定ルール化）ではない | 合格 | 本 Report の位置づけと実験対象と定義対象の契約（固定化との区別）節が、定義対象と対象外の区別を表で固定。混在させない変更で固定ルール化を除外 |
| Guardrail が source / projection 責務境界を変更しない定義である | 合格 | Guardrail 節の GR-1 が責務境界の非変更を不変条件として定め、責務境界自体の変更を正規の設計判断として対象外に位置づけ、不成立時の判断方向（KEEP）を明示 |
| 実行・判定が後続実証Caseに分離されている | 合格 | 実験の実行・判定の分離節が、本実行単位の完了条件に含まれないことを明示。評価ブランチ・評価契約（REQ-043、DEC-018）の実行時確定と測定整備の前置き実施を記録 |

### docs 変更整合性検証

本 Report の保存後、`check_changed_docs.ts` を `--workflow case-run` で実行し、failures 0 を確認した。実行結果は PR 本文の検証差分セクションに記録する。
