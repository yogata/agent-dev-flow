---
id: EXPERIMENT-G2-REQ048-DEFINITION
title: "REQ-048 実験G2定義（Structured Handoff 縮小・OU-010 / WP-09-2 Phase B）"
status: accepted
created: 2026-09-05
source_issue: "#2607 (OU-010 / WP-09-2 Experiment G2 実験定義)"
parent_epic: "#2597 (REQ-048 再構築・測定・実験系)"
---

<!-- ADF-COVERS(verification): REQ-048-012, REQ-048-014, REQ-048-016 -->

> **2026-09-05 撤回注記**: 本 Report の作成時点で想定していた「実証Case・評価ブランチ」による実行手続きは、実証Case機構の全面撤回（Issue #2624、Epic）により廃止された。実験の実行・判定は今後「通常の技術検証」として実施する。過去の測定結果・判断・作成経緯は歴史的事実として本 Report に残す。

# REQ-048 実験G2定義（Structured Handoff 縮小・OU-010 / WP-09-2 Phase B）

## 本 Report の位置づけ

本 Report は、REQ-048 再構築・測定・実験系 Epic（#2597）の Wave 4（OU-010 / WP-09-2）で作成した実験 G2（Structured Handoff の縮小）の実行可能な実験定義である。REQ-048-012 の実験契約が要求する6要素（Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision）を、各節で識別可能な形に保存する。

本 Report は既存成果物種別（Report）への保存であり、測定専用の新しい成果物種別、実行履歴 DB、恒久 checker、公開入口を追加しない（REQ-048-016、DEC-027 決定6）。本 Report が所有するのは実験の定義であり、実験の実行・判定は後続の個別の技術検証へ分離する。分離の契約は「実験の実行・判定の分離（後続の技術検証）」節に記す。

実験 G2 の縮小対象の仮説は重複群単位で立てる。無差別に複数 field を削らない。重複群の特定と単一の選定は「重複群の特定と単一の選定」節に記す。

入力は、削減候補ランキング（`docs/reports/req-048-candidate-ranking.md`）、correlation field derivability 監査（`docs/reports/req-048-correlation-derivability-audit.md`）、Baseline V2 測定（`docs/reports/req-048-baseline-v2-measurement.md`）、Baseline V2 定義基盤（`docs/reports/req-048-baseline-v2-definition.md`）、REQ-048、DEC-027、および workflow-contracts Design（工程間構造化文脈引き継ぎ契約、ADF 実行識別情報の記録契約）と delegation-contracts Design（構造化文脈引き継ぎ（委譲時）の直列化契約）が宣言する現行ベースラインである。

## 実験対象と現行ベースラインの構造

実験 G2 の対象機構は、structured handoff 残存集合（ランキング候補 C2）である。REQ-048-014 が観測対象とする「structured handoff の具体 field 集合」に該当し、同条が本要件の成立条件として固定しないと定める範囲の機構である。

現行ベースラインの構造は次のとおりである（workflow-contracts Design「ADF 実行識別情報の記録契約」の現行ベースライン宣言、delegation-contracts Design「構造化文脈引き継ぎ（委譲時）の直列化契約」）。

- 実行識別情報は 4 field である。`adf_case`、`adf_execution_unit`、`adf_delegation`（委譲識別情報の転記）、任意 `adf_harness_ref`
- 委譲 prompt の委譲 `<delegation-ident>` ブロックには、case-run が発行する `adf_delegation_id`（`DEL-{N}-{seq}` 形式の委譲単位識別子）を記録する
- 実行識別情報 field 数は 4件を 2 PR 分実測済みである（Baseline V2 測定 §4.2）。Wave 1〜4 平均 6.0 field から約 33% 減。この値は構造の観測値であり、token や wall-clock の削減量ではない
- workflow-contracts Design と delegation-contracts Design は、この意味集合と field 集合を現行ベースラインとして宣言し、「REQ-048-014 のとおり REQ-048 の成立条件として固定しない。field 集合の変更は REQ-048-012 の実験契約（単一の主要構造変更、Guardrail 付き）に従い、委譲時の直列化と意味対応を維持するため同時変更を要する」と記録する
- REQ-048-014 は、structured handoff の具体 field 集合を REQ の成立条件として固定せず、他の正規要件が所有する責務を除き観測・評価対象として扱えることを定める。本実験はこの観測・評価対象への実験契約の適用である

## 重複群の特定と単一の選定

重複群とは、canonical な成果物関係または正規成果物が既に保持する情報と、実行識別情報として重複して記録している field 部分の集合である。縮小の仮説は、field 単位や実行識別情報全体の単位ではなく、重複群の単位で立てる。

重複群の棚上げは、derivability 監査 §6 の decision 集約（Wave 5 縮小後に残存する KEEP / NARROW fields）と、ランキング §4.2 の残存する導出可能候補（R-S2、R-S3）に基づく。特定した重複群と重複外を次に記す。

| 群 | 含まれる重複部分 | canonical が既に保持する情報 | 証跡 |
|---|---|---|---|
| 重複群 A（flow 判別の重複群） | `adf_execution_unit` の値に含まれる flow 種別接頭辞（`epic:` / `standard:`） | テンプレート種別と Parent 関係からの機械判別。workflow-contracts Design が現行ベースラインとして「Epic / Standard の判別はテンプレート種別と Parent 関係から機械判別できる」ことを宣言済み | derivability 監査 §6 NARROW（`adf_execution_unit`）、ランキング R-S2「NARROW 候補（継続）。追加縮小は相関 capability の回帰検査を条件とする」 |
| 重複群 B（自己参照の重複群） | `adf_case` の Standard flow における Issue 番号同値部分 | 本 Issue の番号、Epic flow 子 Issue の `Parent: #N` 行、PR の `Refs: #N` 行 | derivability 監査 §6 NARROW（`adf_case`）、ランキング R-S3「直接 join の便益が確認済みのため、これ以上の縮小候補とはしない」 |
| 重複外（KEEP 核） | なし。canonical 関係から一意に導出できない情報 | なし（導出不能）。`adf_delegation` は再委譲 sequence を含む委譲と PR の相関、`adf_delegation_id` は case-run 発行の委譲 identity、`adf_harness_ref` は任意付加情報 | derivability 監査 §6 KEEP（`adf_delegation`、`adf_delegation_id`、`adf_harness_ref`）、ランキング §8 C2「KEEP（相関核）」 |

本実験の単一の主要構造変更の対象は、重複群 A とする。選定理由を次に記す。

1. ランキング R-S2 が追加縮小を相関 capability の回帰検査を条件として許容する記録である。重複群 B に対応する R-S3 は「これ以上の縮小候補とはしない」と記録済みであり、本実験の対象に含めない
2. flow 種別の canonical relation からの機械判別は workflow-contracts Design が現行ベースラインとして宣言済みであり、置換経路が契約上すでに確立している
3. 1 experiment = 1 major structural change（DEC-027 決定4、REQ-048-012）に従い、重複群 B と KEEP 核を同じ実験へ混在させない

無差別削除をしないことを次に明示する。本実験は重複群 A の1群のみを対象とする。残存 4 field の一括削除、KEEP 核（`adf_delegation`、`adf_delegation_id`、`adf_harness_ref`）の変更、重複群 B の同時変更は行わない（Epic #2597 scope-affecting impact candidate「G2 は複数 field を無差別に削らず重複群単位の仮説で縮小」）。

## 単一性の契約

- 1 experiment = 1 major structural change（DEC-027 決定4、REQ-048-012）
- G1〜G4 は同一 baseline へ複数の主要変更を混在させないため直列実行する（Epic #2597 AG-003）。G2 の実行時点で G1、G3、G4 の主要構造変更を混在させない
- ランキング §6.1 が G2 を2位に置いた根拠は、Observability confidence 高（field 数を実測）、Cost に構造観測値あり（4 field、約 33% 減）、Wave 5 で構造的縮小が済んでおり残る実験空間が委譲 context の経験的妥当性に限定され小規模から始めやすい、ことである
- C2 は REQ-048-011 分類で Structure / Convenience（相関維持の支援）、5価値軸では Control / Coordination が主、Autonomy が副である（ランキング §7）。本実験の Guardrail はこの相関維持の役割を不変条件として保存する

## Baseline

Baseline 要素は Baseline V2 で充足する。Baseline V2 とは「本要件再構築時点の GitHub 最新 ADF control plane」であり、その定義は Baseline V2 定義基盤 Report §1 が正である（`docs/reports/req-048-baseline-v2-definition.md`）。

### Baseline の取得手順（技術検証 実行時）

Baseline 測定は、実験を技術検証として実行する際に取得する。取得手順は Baseline V2 定義基盤 Report §2 の baseline commit SHA 固定手順（4ステップ）に従う。

1. 測定実行時に `git fetch origin main` を実行し、`git rev-parse origin/main` で GitHub 最新 default branch SHA を取得する
2. 取得した SHA が structurally normalized commit（`a0b5ac82c776a714c133c8245fce90c99dd1a836`）の子孫であることを `git merge-base --is-ancestor <structurally-normalized-SHA> origin/main` で確認する。子孫でない場合、測定を開始せず、その判断を測定 Report に記録する
3. baseline の選択は「structurally normalized commit を含む測定時 origin/main」で確定する
4. 測定 Report に baseline SHA、子孫確認の結果、実行日時の3点を固定記録する

測定手続きは Baseline V2 測定 Report §2 に従う。評価軸6軸と Observation Tax の観測方法（§2.1）、指標の取得源と測定方法（§2.2）、処理区分の対応付け（§2.3）、Observation Tax の測定方法（§2.4）である。

### 比較の起点と参照値

本 Report は測定値を作成しない。実験の比較起点は、技術検証が上記手順で固定記録する baseline SHA と、その時点の測定結果である。参照値として、Baseline V2 測定がすでに記録した構造観測値を G2 の比較対象の現状確認に使える。実行識別情報 field 数は Wave 5〜6 で 4 field、構造化識別情報 field 数の抽出は GitHub 本文の `adf_` key から実施済み（Baseline V2 測定 §2.2、§4.2）である。

比較可能性の条件は Baseline V2 定義基盤 Report §4 に従う。Baseline V2 と同一の指標定義、同一の実行単位定義で算出した結果とのみ比較し、Legacy Baseline（`docs/reports/req-048-reanalysis-baseline.md`）との直接比較は行わない。

## Hypothesis

実験 G2 の仮説を次に1文で定める。仮説の単位は重複群 A（flow 判別の重複群）である。

> 実行識別情報 `adf_execution_unit` の値から flow 種別接頭辞（`epic:` / `standard:`）の記録を除去し、Epic / Standard の判別をテンプレート種別と Parent 関係からの機械判別に一本化しても、REQ-048-001 の相関対応付けと、委譲時の直列化と工程間の直列化の意味対応は維持され、structured handoff 構築に関わる Observation Tax は現行の接頭辞付き形式より減少する。

仮説の読み方を次に区別する。

- 仮説が支持された場合（相関対応付けと意味対応が維持され、Tax 減少が確認された場合）: 接頭辞の重複記録が REQ-048-001 の便益を維持する最小形であるとは言えないことが実データで示され、NARROW（canonical relation 機械判別への一本化）の判断候補が支持される
- 仮説が棄却された場合（相関対応付けまたは意味対応が損なわれた、または Tax 減少が確認できなかった場合）: 現行の接頭辞付き形式が要求を満たす形であることを実データが示し、KEEP の判断候補が支持される
- 仮説は予測であり、判断の確定ではない。判断は Decision 要素の記録形式に従い、実行後の実データで行う

仮説の検定では単一の指標のみを理由に判断しない（DEC-027 決定2、REQ-048-006）。Observation の指標を Cost 側（Observation Tax）と Benefit 側（Guardrail の観測）の対で読む。

## 主要構造変更

G2 の主要構造変更は次の1件のみである。

| 項目 | 内容 |
|---|---|
| 変更 | Issue 本文と PR 本文の実行識別情報 `adf_execution_unit` の値から flow 種別接頭辞（`epic:` / `standard:`）を除去し、Epic / Standard の判別をテンプレート種別と Parent 関係からの機械判別に一本化する。実行単位と Issue の対応付け自体（REQ-048-001）は維持する |
| 単位 | 実行識別情報 `adf_execution_unit` の値形式（flow 種別接頭辞の記録方式）。field の廃止、`adf_case` の値、委譲識別情報の転記、委譲 `<delegation-ident>` ブロックは本変更の単位に含まれない |

選定理由を次に記す。

- workflow-contracts Design が「Epic / Standard の判別はテンプレート種別と Parent 関係から機械判別できる」ことを現行ベースラインとして宣言済みであり、接頭辞の記録は同じ判別情報の重複所有（重複群 A）である。REQ-048-002 の機械判別可能性は接頭辞の存在に依存せず、canonical 関係からの判別で充足する
- ランキング R-S2 が「追加縮小は相関 capability の回帰検査を条件とする」と記録した残置部分であり、Observability confidence 高（field 数と値形式を GitHub 本文から直接実測可能）で、変更前後の構造比較が実測できる（ランキング §6.1 の根拠と整合）
- 対象が1群のみであるため、複数の主要変更を混在させずに Tax 変化を観測できる

本実験に混在させない変更を次に明示する。これらは G2 の主要構造変更に含めない。

- `adf_case` の縮小・廃止（重複群 B。ランキング R-S3 が追加縮小候補外と記録済み）
- `adf_delegation` の転記廃止、`adf_delegation_id` の変更、`adf_harness_ref` の必須化または廃止（KEEP 核。derivability 監査 §6 が導出不能と記録した委譲相関の核である）
- 残存 4 field の一括削除（無差別削除の禁止）
- 工程間構造化文脈引き継ぎ契約と委譲時の直列化契約が扱う意味集合自体の変更
- 検証差分セクションの変更（G1 対象、ランキング候補 C1）
- 検証差分、capture pipeline セクション等の他候補（C1、C6）への変更

## Guardrail

Guardrail は実験中に維持すべき不変条件である（DEC-027 決定5: 機構ではなく不変条件の維持を評価対象とする）。REQ-048-014 の本文を次に引用する。

> structured handoff の具体 field 集合、source / projection 参照の引き継ぎ方式、検証差分の具体分類・表形式、review 回数、verification 回数、subagent 数、並列度、REQ / Decision / Design / Skill / reference の数量を、本要件の成立条件として固定しないこと。他の正規要件が所有する責務を除き、これらは観測・評価対象として扱えること

| # | 不変条件 | 根拠 |
|---|---|---|
| GR-1 | 意味対応の維持: workflow-contracts Design「工程間構造化文脈引き継ぎ契約」と delegation-contracts Design「構造化文脈引き継ぎ（委譲時）の直列化契約」が、同一の意味集合（目的、現在の ADF 工程、現在の実行単位、前工程で確定した事項、未確定事項、正規参照先、停止条件、期待する実行結果、後続工程へ渡すべき成果、計画変更を識別するための情報）を扱い続け、委譲時の直列化と工程間の直列化の意味対応が維持されること。NARROW 採用時の field 集合変更は、両 Design が宣言するとおり REQ-048-012 の実験契約に従い、意味対応を維持するための同時変更で実施すること | workflow-contracts Design「工程間構造化文脈引き継ぎ契約」、delegation-contracts Design「構造化文脈引き継ぎ（委譲時）の直列化契約」の現行ベースライン宣言 |
| GR-2 | 相関対応付けの維持: 変更後も、実行単位、委譲単位、Case、GitHub Issue、GitHub PR の対応付け（REQ-048-001）が canonical 成果物関係から機械的に成立し続けること。Epic / Standard の判別がテンプレート種別と Parent 関係から機械判別でき、対応付けが自由文中に偶然出現する識別子のみに依存しないこと（REQ-048-002） | REQ-048-001、REQ-048-002、`execution_ident_contract.test.ts` の相関検査 |
| GR-3 | KEEP 核の非変更: `adf_delegation`、`adf_delegation_id` は再委譲 sequence を含む委譲相関の核であり、発行型で導出不能である。`adf_harness_ref` は必須化しない任意付加情報である。本実験はこれらを変更せず、複数 field を無差別に削らないこと | derivability 監査 §6、ランキング §8（C2 KEEP 相関核） |
| GR-4 | N/A 非停止と観測対象性の維持: flow 判別の欠落、harness 指標の欠落は observability gap として分析時に扱い、workflow を停止させないこと。field 集合は REQ-048 の成立条件として固定せず、観測・評価対象として扱い続けること | REQ-048-004、REQ-048-014 |

GR-1 から GR-4 のいずれかが不成立となった実験結果は、仮説の成立如何に関係なく NARROW（canonical relation 機械判別への一本化）の判断候補を採用できない。この場合の判断候補は KEEP であり、その根拠を実データで記録する。

## Observation

測定対象は Baseline V2 測定 Report §2 の手順に従う。測定の実施は、実験を技術検証として実行する際に行う。

| 観測対象 | 指標 | 取得方法 |
|---|---|---|
| structured handoff 構築の Observation Tax（Cost） | 実行識別情報の記入・生成に要した作業の回数、および取得可能な場合の token、wall-clock、tool call、重複読み書き | Baseline V2 測定 §2.4 の方法。harness 指標が取得不能な場合は未測定と記録し、推定値を埋めない |
| Observation Tax（maintenance / contract complexity） | `adf_execution_unit` の値形式に関わる契約テスト（`execution_ident_contract.test.ts` の実行単位形式検査）、template、Design 宣言の保守箇所の変更有無と件数 | リポジトリ変更ファイルから数える。実行単位形式に関わる契約テストの更新要否を含む |
| 構造観測値 | `adf_execution_unit` の値形式（接頭辞の有無）、実行識別情報 field 数、Epic / Standard 判別の成立 | Issue 本文と PR 本文の `adf_` key と値の構造抽出（Baseline V2 測定 §2.2、§4.1 の手順に準拠） |
| Guardrail 観測（Quality、Benefit 側） | Epic / Standard 判別、および実行単位・委譲単位・Case・Issue・PR の相関対応付けが canonical 関係から成立したか。相関 capability の回帰検査結果 | Issue 本文の Parent 行と template 種別、PR 本文の Refs 行との突合、契約テストの実行結果（Baseline V2 測定 §2.1 の Quality 軸の観測方法） |
| 委譲相関の妥当性観測（KEEP 核の検証、変更なし） | `adf_delegation` の転記と `adf_delegation_id` が委譲実行と PR の対応付け（REQ-048-001）に使用されたか、再委譲 sequence の再構成に寄与したか | PR 本文、委譲識別情報、Issue コメントの突合。KEEP 核は変更せず観測のみ（ランキング §5 の G2 主題「残存 4 field と委譲 context 転記の妥当性」に対応） |
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

G2 における判断の方向性を次に記す。これは実行前の判断の確定ではなく、判断候補の整理である（REQ-048-013）。

- NARROW: 接頭辞除去が Guardrail（GR-1〜GR-4）を維持し、Observation Tax の減少が確認された場合の判断候補。canonical relation 機械判別への一本化を確定する。NARROW 採用の field 集合変更は、workflow-contracts Design と delegation-contracts Design の現行ベースライン宣言が定めるとおり、意味対応を維持するための同時変更を後続の技術検証の実装契約に含める
- KEEP: Guardrail の不成立、Observation Tax の減少が確認できなかった場合、または接頭辞付き直接表示の人間可読性の便益が実データで示された場合の判断候補。現行の接頭辞付き形式が要求を満たす最小形であることを実データが示す
- MERGE、DOWNGRADE、DELETE: 接頭辞除去の結果としては原則採用しない。`adf_execution_unit` 全体の削除（DELETE）は実行単位の対応付け（REQ-048-001）を失うため、ランキング §8 が C2 を KEEP（相関核）に置いた記録と整合しない。derivability 監査 §6 も「DOWNGRADE 候補はない」と記録している。重複群 B（`adf_case`）はランキング R-S3 の記録により本実験の判断対象に含めない

## 実験の実行・判定の分離（後続の技術検証）

本 Report は実験の定義のみを所有する。実験の実行・判定は本実行単位（#2607）の完了条件に含まれない。

- 実験の実行・判定（KEEP / NARROW / MERGE / DOWNGRADE / DELETE の確定）は、Epic #2597 のとおり後続の個別の技術検証として分離する（作成時点では実証Case候補と位置づけていた。AG-002・CR-001）
- 実行時に、測定条件・手順を当該検証の作業記録で確定する。技術検証では必要に応じて一時的な branch・worktree を使用できる（ADF Case 外の通常活動であり、ADF は専用の評価状態・評価契約を所有しない）
- G1〜G4 は同一 baseline へ複数の主要変更を混在させないため直列実行する（AG-003）。本実行単位は G2 定義のみを担当する
- NARROW 採用時の field 集合変更は、workflow-contracts Design（工程間構造化文脈引き継ぎ契約）と delegation-contracts Design（構造化文脈引き継ぎ（委譲時）の直列化契約）の意味対応維持のため同時変更を要する。この実装は後続の技術検証の実装契約であり、本 Report は実施しない
- 技術検証は、本 Report の Baseline 節の手順で baseline を固定記録し、Observation 節の指標を測定し、Guardrail 節の不変条件を確認した上で、Decision 記録形式で判断を記録する

## 検証対応

### ADF-COVERS 宣言と検証対応

本 Report は `ADF-COVERS(verification): REQ-048-012, REQ-048-014, REQ-048-016` を宣言する。

- REQ-048-012: Baseline、Hypothesis、主要構造変更、Guardrail、Observation、Decision 記録形式の各節により、実験契約の6要素を識別可能に保存する。単一の主要構造変更を1件（重複群 A の接頭辞除去）に限定し、混在させない変更を明示する
- REQ-048-014: structured handoff の具体 field 集合を REQ の成立条件として固定せず観測・評価対象として扱うことを、重複群の特定と単一の選定節、および workflow-contracts Design / delegation-contracts Design の現行ベースライン宣言の引用で示す
- REQ-048-016: 実験定義を既存成果物種別（Report）へ保存し、新規成果物種別、実行履歴 DB、恒久 checker、公開入口を追加しない

### TS-012C 読み戻し検証

Issue #2607 テスト戦略 TS-012C に従い、本 Report の読み戻しで次を確認した。

| 確認項目 | 結果 | 証拠 |
|---|---|---|
| REQ-048-012 の6要素（Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision）が識別可能である | 合格 | 各要素に対応する見出し節が1つずつ存在する。`## Baseline`、`## Hypothesis`、`## 主要構造変更`、`## Guardrail`、`## Observation`、`## Decision 記録形式` |
| 縮小対象が重複群単位の仮説に基づき、複数 field を無差別に削らない定義である | 合格 | 重複群の特定と単一の選定節が重複群 A / 重複群 B / KEEP 核を区別し、主要構造変更を重複群 A の1件に限定。混在させない変更で KEEP 核の非変更と一括削除の禁止を明示 |
| Guardrail が委譲時の直列化と工程間の意味対応維持を定義している | 合格 | Guardrail 節の GR-1 が、workflow-contracts Design「工程間構造化文脈引き継ぎ契約」と delegation-contracts Design「構造化文脈引き継ぎ（委譲時）の直列化契約」の意味対応維持と同時変更契約を不変条件として定め、不成立時の判断方向（KEEP）を明示 |
| 実行・判定が後続の技術検証に分離されている | 合格 | 実験の実行・判定の分離節が、本実行単位の完了条件に含まれないことを明示。実行時の測定条件・手順確定を当該検証の作業記録へ委ねることを記録 |

### docs 変更整合性検証

本 Report の保存後、`check_changed_docs.ts` を `--workflow case-run` で実行し、failures 0 を確認した。実行結果は PR 本文の検証差分セクションに記録する。
