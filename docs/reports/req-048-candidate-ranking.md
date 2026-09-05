---
id: RANKING-REQ048-CANDIDATES
title: "REQ-048 再構築 削減候補ランキング（OU-008 / WP-08 Phase B）"
status: accepted
created: 2026-09-05
baseline_for: REQ-048（再構築版） / DEC-027
source_issue: "#2605 (OU-008 / WP-08 Candidate Ranking)"
parent_epic: "#2597 (REQ-048 再構築・測定・実験系)"
---

<!-- ADF-COVERS(verification): REQ-048-006, REQ-048-013, REQ-048-016 -->

> **2026-09-05 撤回注記**: 本 Report の作成時点で想定していた「実証Case・評価ブランチ」による実行手続きは、実証Case機構の全面撤回（Issue #2624、Epic）により廃止された。実験の実行・判定は今後「通常の技術検証」として実施する。過去の測定結果・判断・作成経緯は歴史的事実として本 Report に残す。

# REQ-048 再構築 削減候補ランキング（OU-008 / WP-08 Phase B）

## 本 Report の位置づけ

本 Report は、REQ-048 再構築・測定・実験系 Epic（#2597）の Wave 2（OU-008 / WP-08）で作成した削減候補ランキングの記録である。入力は Baseline V2 測定（`docs/reports/req-048-baseline-v2-measurement.md`）、correlation field derivability 監査（`docs/reports/req-048-correlation-derivability-audit.md`）、Baseline V2 定義基盤（`docs/reports/req-048-baseline-v2-definition.md`）、REQ-048、DEC-027 である。

ランキングの性質を先に限定する。本ランキングは後続実験 G1〜G4（OU-009〜012、Issue #2606〜#2609）の実験対象選定と優先順位の入力である。KEEP、NARROW、MERGE、DOWNGRADE、DELETE の最終判断は、実験実行後の Decision（後続の個別の技術検証）が所有する。本 Report に記録するのは候補の評価と判断候補であり、判断の確定ではない。削除そのものを成功条件としない（DEC-027 決定2、REQ-048-013）。

本 Report は既存成果物種別（Report）への保存であり、新規成果物種別、実行履歴 DB、恒久 checker、公開入口を新設しない（REQ-048-016、DEC-027 決定6）。既存の REQ、Decision、Design、Report の実測値と定義は変更していない。

## 1. 評価方法

### 1.1 評価軸6つの定義

| 評価軸 | 定義 | 主な根拠 |
|---|---|---|
| Frequency | 機構が発火・使用される頻度。GitHub 成果物から観測できる存在率を優先し、観測できない場合は未測定と記録する | REQ-048-007、Baseline V2 測定 §2.2 |
| Cost | token、wall-clock、tool call、重複読み書き、orchestration、maintenance / contract complexity。単純合算 token は使わない | DEC-027 決定2、REQ-048-005、REQ-048-007 |
| Incremental Benefit | unique outcome、unique finding、autonomy improvement、recovery / safety contribution。前工程にない便益だけを数える | DEC-027 決定2、REQ-048-008 |
| Redundancy | 重複の所在と種別。成果物関係から一意に導出できる重複は structural、品質・自律性の便益を実測しないと判断できない重複は empirical とする | DEC-027 決定3 |
| Safety relevance | Safety invariant との関連。不変条件の維持と実装方式の簡素化を区別する | DEC-027 決定5、REQ-048-011 |
| Observability confidence | 現状の測定確度。実測あり、部分観測、未測定の別と、その根拠を記録する | REQ-048-004、Baseline V2 測定 §6 |

harness 生実行履歴由来の指標（token、wall-clock、tool call、同一 path 再読込、source / projection 重複参照）は Baseline V2 測定 §6 の observability gap により現時点で測定不能である。取得できるデータは GitHub 成果物からの構造観測値に限られる。したがって本 Report では、測定データがない評価軸を数値で埋めず、「未測定」と根拠を併記する。値を推定して記入しない。

### 1.2 Benefit / Cost 対で比較する

単一の指標、単一の評価軸だけを理由に候補を順位づけしない（DEC-027 決定2、REQ-048-006）。§6 のランキングは、6軸の記録値と、観測可能性・実行容易性という実験遂行上の代理条件を併用して構成した提案であり、Benefit と Cost の確定対比較の結果ではない。確定対比較に必要な実データは実験（G1〜G4）で取得する。

### 1.3 冗長性2種の分離

DEC-027 決定3に従い、候補を次の2種に分離して扱う。分離の結果は §4 と §5 に分けて記録し、ランキング（§6）の構成に反映する。

| 区分 | 定義 | 扱い |
|---|---|---|
| structural redundancy | 成果物関係、固定値、同値から一意に導出できる情報の重複所有 | 性能実験を待たず縮小候補として評価できる |
| empirical redundancy | review、verification、handoff 等の品質・自律性に便益があり得る機構の重複 | Baseline と Guardrail を設定して実測してから縮小判断する |

## 2. 候補プールの棚上げ

候補は REQ-048 の評価対象機構（REQ-048-005、REQ-048-014）、Baseline V2 測定の Observation Tax 表、derivability 監査の decision 集約、および本実行時のリポジトリ control plane 調査から列挙した。所有成果物と現時点の測定状態を次に記録する。

| 候補 | 内容 | 所有成果物 | REQ-048-011 分類 | 測定状態 |
|---|---|---|---|---|
| C1 検証差分記録 | PR 本文の検証差分セクション。実行工程、検証種別、検証結果、finding 差分5分類（新規、修正済み、既出、撤回、無効）の記録表 | `agentdev-workflow-templates` SKILL（検証差分セクション規約）、`verification_diff_contract.test.ts` | Quality control | 検証差分または検証記録の存在を 6 PR 中 5件と実測済み（Baseline V2 測定 §4.2）。記入コストは未測定 |
| C2 structured handoff 残存集合 | 実行識別情報 4 field（`adf_case`、`adf_execution_unit`、`adf_delegation`、`adf_harness_ref`）と委譲識別情報の転記。Wave 5 縮小後の残存集合 | `workflow-contracts` Design（記録契約）、Issue/PR template、`harness-delegation.md`、`execution_ident_contract.test.ts` | Structure / Convenience（相関維持の支援） | field 数 4件を 2 PR 分実測済み。Wave 1〜4 平均 6.0 field から約 33% 減（構造観測値）。token 等は未測定 |
| C3 source / projection 再参照 | source（src/opencode）と projection（.opencode）の二重参照、参照引き継ぎ方式 | DEC-002、配布物配置契約、REQ-048-007 が観測対象 | Efficiency support | 同一 path 再読込、source / projection 重複参照とも harness データ未永続化のため未測定 |
| C4 Review / Verification 実行条件 | adversarial-review の発動条件、品質ゲートの実行条件、review NG フロー | `agentdev-adversarial-review`、REQ-014 / REQ-015 / REQ-016、`agentdev-quality-gates`、REQ-007 | Quality control（Safety invariant 支援） | 発動回数の系統記録なし。PR 本文の検証記録から部分観測可能だが未集計。Cost、Benefit とも未測定 |
| C5 Epic tracking tables | 親 Epic 本文の分解テーブル、Wave テーブル、ステータス追跡テーブル、状態件数サマリ。Wave ごとの agentdev-epic-tracker 更新 | `agentdev-epic-tracker`、`agentdev-workflow-templates`（テーブル正規形）、REQ-049 | Structure / Convenience | Epic 本文から直接観測可能。更新コスト自体は未測定。子 Issue コメント数 7件 / 6 Issue の部分実測あり |
| C6 capture pipeline セクション | PR 本文の `## Findings / Capture候補` と `## Design確定候補`。case-close が intake / learning / Design 確定へ回収する入力 | `agentdev-workflow-orchestration`（capture 境界）、`agentdev-workflow-templates` | Structure / Convenience | セクション存在率を実測済み（Findings 6/6、Design確定候補 5/6）。Cost は未測定 |
| C7 integrity suite・docs-check・契約テスト | repo-local 検査基盤。docs-check、配布物境界検査、AUTOGEN 鮮度 gate、契約テスト 2本の保守と実行 | `.opencode/skills/repo-agentdev-integrity/scripts/`、DEC-021（公開入口 2本固定）、REQ-050 | Safety invariant（機械検査の実装手段） | 実行結果は直接観測可能（derivability 監査で 68 pass、0 fail を実測）。保守コストは maintenance / contract complexity として継続中。Baseline V2 測定 §3 で削減対象外と記録 |
| C8 telemetry 契約起因の実行失敗監視 | 契約・schema 不整合による実行失敗の監視。Baseline V2 測定 §3 が記録対象とする項目 | Baseline V2 測定（記録項目）、REQ-048-009 | Safety invariant 関連 | 本測定範囲で発生例を確認できず。サンプル不足 |

## 3. 候補別 6軸評価

各候補の6評価軸を区別して記録する。未測定の軸は根拠を併記する。Redundancy 軸の値は §4（structural）と §5（empirical）の分離に対応する。

| 候補 | Frequency | Cost | Incremental Benefit | Redundancy | Safety relevance | Observability confidence |
|---|---|---|---|---|---|---|
| C1 検証差分記録 | PR あたり 1回。存在実測 5/6（#2613 は見出しなし）。サンプル 6件で頻度分布は未確定 | 未測定（harness 指標未永続化）。観測可能なのは表の記入行数と PR 本文の 8列構造のみ | 未測定。REQ-048-008 の incremental finding 分類は実データ未蓄積。存在率から便益は読めない | empirical 冗長性候補（G1 対象）。5分類・8列の表形式が冗長かは品質便益の実測が前提 | 低〜中。検証証跡は Quality guardrail。hard governance 8点の不変条件そのものではない | 中〜高。セクション存在率と表構造は GitHub から直接観測済み |
| C2 structured handoff 残存集合 | Issue あたり 1回、PR あたり 1回。Wave 5〜6 の 4 field で安定 | 構造観測値として実測済み（4 field、平均 6.0 から約 33% 減）。token、wall-clock、tool call は未測定 | 部分。相関成立は契約テストで検査中。実データ分析での相関成立は未検証（derivability 監査 §9） | structural 縮小は Wave 5 で実施済み。残存は NARROW 後の最小集合。残りの経験的縮小空間は G2 対象 | 中〜高。REQ-048-001 の相関契約と委譲契約（`adf_delegation`、`adf_delegation_id` は発行型で導出不能）の維持手段 | 高。field 数は GitHub 本文から直接実測可能 |
| C3 source / projection 再参照 | 未測定（harness read 履歴未永続化） | 未測定（同一 path 再読込、重複参照とも測定不能。Baseline V2 測定 §6 の gap） | 未測定 | empirical 冗長性候補（G3 対象）。重複の実体は未観測 | 中。DEC-002 の source / projection 分離そのものは配布原則であり、評価対象は参照方式の効率。分離契約の廃止は候補としない | 低。測定に必要な harness 側手順が未整備 |
| C4 Review / Verification 実行条件 | 未測定（発動回数の系統記録なし） | 未測定（review・verification 工程の時間・token 区分は処理区分の観測 gap に含まれる） | 未測定。incremental finding（REQ-048-008）と autonomy 区別（REQ-048-009）は実データ未蓄積 | empirical 冗長性候補（G4 対象）。条件付き化で品質が維持できるかは実測が前提 | 高。REQ-007 の完了報告ゲートと hard governance の一部不変条件の実装手段に接続。ただし機構自体は不変条件ではなく、実装手段の縮小は評価可能（DEC-027 決定5） | 低〜中。PR 本文の検証記録から部分観測可能だが、発動条件の実行頻度は未集計 |
| C5 Epic tracking tables | Wave 完了ごと、子 Issue 状態変更ごと | 未測定。更新の token・wall-clock は分離されていない | 部分。再開時の状態復元と fan-in 判定の契約上の役割は定義済み。便益の実測なし | structural 要素を含む。状態件数サマリは分解テーブルのステータス列から一意に導出可能（導出可能な重複）。更新頻度の妥当性は経験的評価対象 | 低〜中。再開・resume の補助。STEP resume 契約（DEC-011）は別軸であり依存しない | 高。Epic 本文から直接観測可能 |
| C6 capture pipeline セクション | PR あたり 1回。存在実測 Findings 6/6、Design確定候補 5/6 | 未測定 | 部分。Epic #2596 の各 PR から learning entry の capture コミットが実際に生成された実績あり。回収率の定量化は未実施 | 現時点で明確な重複は観測していない。intake / learning 正規経路との重複評価はデータ蓄積後の対象（G1〜G4 外） | 低。補助的な学び・残課題の記録 | 高。セクション存在率は GitHub から直接実測可能 |
| C7 integrity suite・docs-check・契約テスト | docs 変更ごとに実行。機械検査の発火頻度は変更頻度に従う | 実行コストは未測定。保守コスト（maintenance / contract complexity）は Observation Tax として継続中。Baseline V2 測定 §3 で削減対象外と記録 | 部分。Wave 5 の field 縮小時に契約テストの同時更新が必要だった事実が、保守コストと検出能力の両方の証拠 | derivability 監査で重複は確認されていない。OU-003 で明示値依存から能力検証へ再構成済み | 高。配布境界・整合性の機械検査は hard governance 不変条件の実装手段（DEC-001 決定3、DEC-021、REQ-050） | 高。テスト・checker の実行結果は直接観測可能（68 pass、0 fail を実測） |
| C8 telemetry 契約起因の実行失敗監視 | 未測定。本測定範囲で発生例なし | 未測定（発生例なし） | 評価不能（発生例なし。発生しないとは断定しない） | 重複は観測されていない | 未分類（サンプル不足。Safety invariant 関連の可能性は残る） | 低。発火が稀なためサンプルが集まらない構造 |

## 4. structural redundancy（導出可能、実験不要の縮小候補）

### 4.1 Wave 5 で実施済みの構造的縮小

derivability 監査（OU-004）が structural redundancy と判定した候補は、OU-005（Issue #2602、PR #2615）で実施済みである。Baseline V2 はこの縮小後の構造を測定対象としている。

| 対象 | 監査の判定 | Wave 5 の実施 | 実測値 |
|---|---|---|---|
| `adf_phase` | DELETE 候補（`case-open` 固定の定数） | 削除 | Issue 本文の field 数に反映 |
| `adf_upstream_confirmed` | DELETE 候補（相関 field ではなく handoff 情報） | 削除 | 同上 |
| `adf_pr` | DELETE 候補（PR API 番号との自己参照） | 削除。`adf_pr` backfill も不要化 | PR 本文 field は 6 から 4 へ |
| `adf_result` | DELETE 候補（PR 存在から `completed-pr` を導出） | 削除。result 4状態契約自体は維持 | 同上 |
| `adf_parent` | DELETE 候補（delegation ID と親工程から導出） | 削除 | 委譲識別情報 block に反映 |
| `adf_child` | MERGE 候補（`adf_delegation_id` と同値） | 統合 | 同上 |
| `adf_delegation_purpose` | MERGE 候補（処理区分評価へ統合） | 統合 | 同上 |
| `adf_case`、`adf_execution_unit` | NARROW 候補（canonical relation 置換付き） | 縮小 | 残存 4 field の構成要素 |

Baseline V2 の実測では、PR 本文の field 数が Wave 1〜4 の平均 6.0 から Wave 5〜6 の 4 へ減少し、平均比で約 33% 減となった。この値は構造の観測値であり、Efficiency の token や wall-clock の削減量ではない（Baseline V2 測定 §4.3）。

### 4.2 残存する導出可能候補

correlation field 系の構造的冗長性は §4.1 で消費済みである。本実行の control plane 調査で新たに識別した残存の導出可能候補は次のとおりである。実験を要しない縮小候補であり、実施判断は後続の個別 Case（OU-013 Dead Responsibility Cleanup の落とし先を含む）に委ねる。本 Report では実施しない。

| 候補 | 内容 | 導出可能性の根拠 | 判断候補（REQ-048-013） |
|---|---|---|---|
| R-S1 Epic 状態件数サマリ | 親 Epic 本文のステータス追跡テーブルの件数表（pending、running、completed、blocked、failed の件数） | 分解テーブルのステータス列から数え上げで一意に導出できる。成果物関係からの導出可能な重複に該当（DEC-027 決定3） | MERGE / NARROW 候補。件数表を廃し分解テーブル集計に寄せる案。開いた直後に件数を読む可読性の便益があるため、実施時は運用影響の確認を条件とする |
| R-S2 `adf_execution_unit` の flow 判別部分 | `epic:` / `standard:` の接頭辞 | derivability 監査 §4.1 が Parent 関係と template 種別から判別可能と記録。Wave 5 で NARROW 実施済みの残置部分 | NARROW 候補（継続）。現行の直接表示は人間の読解用として残置されており、追加縮小は相関 capability の回帰検査を条件とする |
| R-S3 `adf_case` の Standard flow 自己参照部分 | Standard flow では Issue 番号と同値になる `adf_case` の値 | derivability 監査 §4.1 が Issue 番号、Parent、Refs からの導出を記録。Wave 5 で NARROW 実施済みの残置部分 | NARROW 候補（継続）。直接 join の便益が確認済みのため、これ以上の縮小候補とはしない |

R-S2、R-S3 は Wave 5 で縮小を実施した上で残置された部分であり、残置理由（直接 join と flow 判別の便益）が derivability 監査で記録済みである。本ランキングでは「追加縮小の余地は限定的」と記録し、実験対象としない。

## 5. empirical redundancy（Baseline / Guardrail 実験を要する候補）

品質・自律性に便益があり得る機構の重複は、実測してから縮小判断する（DEC-027 決定3）。次の対応表は、本ランキングの候補と Epic #2597 で定義される実験 G1〜G4（OU-009〜012）の対応を示す。

| 候補 | 対応実験 | 実験の主題 | 実行の前提 |
|---|---|---|---|
| C1 検証差分記録 | G1（OU-009、Issue #2606） | Verification Diff 縮小。5分類・8列の表形式が finding 分類の便益を維持する最小形か | Guardrail として REQ-048-008 の incremental finding 分類を使用する設計が可能。観測データは PR 本文から取得可能 |
| C2 structured handoff 残存集合 | G2（OU-010、Issue #2607） | Structured Handoff 縮小。残存 4 field と委譲 context 転記の妥当性 | 重複群単位の仮説で縮小する（Epic #2597 scope-affecting impact candidate）。field 数の構造観測は済み |
| C3 source / projection 再参照 | G3（OU-011、Issue #2608） | source / projection 再参照の縮小。解決済み reference choice の再判断削減 | Baseline V2 測定 §6 の harness テレメトリ読取手順の整備が測定の前提。整備前に実行数値は得られない |
| C4 Review / Verification 実行条件 | G4（OU-012、Issue #2609） | Review / Verification の条件付き化。実測データと既存 risk / finding / modification state から trigger を定義 | hard governance 不変条件の維持を Guardrail に含める必要がある（DEC-027 決定5）。Safety relevance が高いため実験設計の難度は高い |

### 5.1 G1〜G4 の外にある経験的評価対象

| 候補 | 状況 | 扱い |
|---|---|---|
| C6 capture pipeline セクション | 存在率の実測はあるが、回収された finding が後続工程で活用された率のデータはない | 本ランキングでは観測継続とする。活用率データが蓄積した時点で実験要否を判断する。G1〜G4 への即時追加は提案しない |
| C5 Epic tracking tables の経験的部分 | 更新頻度の妥当性と Wave 制御への寄与は未測定 | 構造的部分（R-S1）とは分離し、観測継続とする |
| C8 telemetry 契約起因の実行失敗監視 | 発生例なし、サンプル不足 | 評価不能。Baseline V2 測定 §3 と同じく「削減済みとは扱わない」を維持する |

## 6. ランキング（実験優先順位の入力）

### 6.1 経験的候補の優先順位

経験的冗長性候補の実験実行順序の提案を次に記録する。これは G1〜G4 の実験定義作成（OU-009〜012）の優先順位判断の入力であり、判断の確定ではない。

| 順位 | 候補 | 根拠となる6軸の記録値 |
|---|---|---|
| 1 | C1 検証差分記録（G1） | Frequency は PR あたり 1回で存在実測 5/6。Observability confidence 中〜高（表構造と存在率を実測済み）。Cost の構造観測が可能。Guardrail 設計の材料（REQ-048-008 分類）が契約上すでに定義されている |
| 2 | C2 structured handoff 残存集合（G2） | Observability confidence 高（field 数を実測）。Cost に構造観測値あり（4 field、約 33% 減）。Wave 5 で構造的縮小が済んでおり、残る実験空間は委譲 context の経験的妥当性に限定され、小規模から始めやすい |
| 3 | C4 Review / Verification 実行条件（G4） | Safety relevance が高く、実験で判断できた場合の Impact は大きい。ただし Cost、Benefit とも未測定で Observability confidence 低〜中。hard governance 不変条件を Guardrail に含める設計が必要で、実行難度は中以上 |
| 4 | C3 source / projection 再参照（G3） | Frequency、Cost とも未測定。Observability confidence 低。Baseline V2 測定 §6 の harness テレメトリ読取手順の整備が測定の前提であり、測定可能状態の整備が実行条件になる |

順序の構成論理を明示する。本順序は縮小価値の大小の順序ではなく、Benefit / Cost の確定対比較を最も早く成立させられる実験から順に並べた提案である。代理条件は Observability confidence（測定確度）と Guardrail 設定の実行容易性であり、これらは DEC-027 決定2 が定める単一の指標ではない。6軸の記録値自体は §3 に区別して保存してあり、後続の実験定義作成者が別の重みづけで順序を組み直せるようにしている。

G3 を 4位に置くのは縮小価値が低いという判断ではない。測定可能状態が未整備であることが理由であり、この区別を明記する。G3 の実験定義作成自体は OU-011 の対象である。

### 6.2 実験対象外の候補の扱い

| 候補 | 扱い |
|---|---|
| R-S1 〜 R-S3（構造的残存候補） | 実験を要しない。実験優先順位の対象外。実施判断は後続の個別 Case へ記録を引き継ぐ |
| C6 capture pipeline セクション | KEEP 観測継続。データ蓄積後に再評価 |
| C7 integrity suite・docs-check・契約テスト | KEEP。Baseline V2 測定 §3 の削減対象外記録と DEC-021、REQ-050 の契約を維持 |
| C8 telemetry 契約起因の実行失敗監視 | サンプル不足につき優先順位付け不能。観測継続 |

### 6.3 Benefit / Cost 対比の論評

Cost 側で現時点で実測されているのは C2 の構造観測値（4 field、平均 6.0 からの約 33% 減）と、C1・C6 の存在率（5/6、6/6、5/6）、C7 の実行結果（68 pass）だけである。Benefit 側の実測は全体として欠落している。REQ-048-008 の incremental finding 分類、REQ-048-009 の autonomy 区別は契約としては定義済みだが、実データが蓄積されていない。

したがって本ランキングは Benefit / Cost の確定対比較の結果ではあり得ない。確定対比較に必要な実データを最も早く取得できる順に実験を並べたことが、本ランキングが提供できる判断の正体である。この限界を後続の実験定義（OU-009〜012）と実験後の Decision が引き受ける。

## 7. 5価値軸マッピング（REQ-048-006）

各候補が主に寄与する価値軸を区別して記録する。複数軸に寄与する候補は主軸と副軸を分けて示す。単一の価値軸だけを理由に統制の追加・縮小を判断しない（REQ-048-006）。

| 候補 | Outcome | Efficiency | Quality | Autonomy | Control / Coordination |
|---|---|---|---|---|---|
| C1 検証差分記録 | | 記入・生成コスト（副） | **主**。incremental finding 分類と検証証跡 | | finding 差分の追跡可能性（副） |
| C2 structured handoff 残存集合 | | | | blocked 復帰・再開の補助（副） | **主**。実行単位・委譲・Case の対応付け |
| C3 source / projection 再参照 | | **主**。重複読み取りの削減余地 | | | |
| C4 Review / Verification 実行条件 | 最終成果の品質保証（副） | 工程コスト（副） | **主**。gate と review による品質維持 | 発動条件が自律実行の範囲を規定（副） | review NG フローの次工程制御（副） |
| C5 Epic tracking tables | | | | | **主**。fan-in 判定、再開時の状態復元 |
| C6 capture pipeline セクション | **主**。学び・残課題の永続化 | | 回収された finding の次 Case への供給（副） | | 回収境界の制御（副） |
| C7 integrity suite・docs-check・契約テスト | | | 整合違反の検出（副） | | **主**。機械検査による不変条件の維持 |
| C8 telemetry 契約起因の実行失敗監視 | | | | 失敗の検出が自律回復の前提（関連） | |

## 8. 判断候補の整理（REQ-048-013）

評価結果を KEEP、NARROW、MERGE、DOWNGRADE、DELETE の判断へ整理した候補を記録する。ここに示すのは判断候補であり、判断の確定ではない。最終判断は実験実行後の Decision が行う。削除そのものを成功条件としない（DEC-027 決定2）。

| 候補 | 判断候補 | 条件と備考 |
|---|---|---|
| C1 検証差分記録 | 実験 G1 の後で DOWNGRADE または NARROW を評価 | 5分類・8列の表が REQ-048-008 の便益を維持する最小形かで判断する。単独での DELETE は品質証跡を失うため候補としない |
| C2 structured handoff 残存集合 | KEEP（相関核）。残存集合の妥当性は G2 で検証 | `adf_delegation`、`adf_delegation_id` は発行型で導出不能（derivability 監査 §6）。R-S2、R-S3 の追加 NARROW は相関 capability の回帰検査を条件とする |
| C3 source / projection 再参照 | 実験 G3 の後で NARROW または DOWNGRADE を評価 | 測定可能状態の整備が前提。DEC-002 の分離契約そのものは対象外 |
| C4 Review / Verification 実行条件 | 実験 G4 の後で DOWNGRADE（条件付き化）または NARROW を評価 | hard governance 不変条件は維持する（DEC-027 決定5）。機構の実行条件の縮小のみを評価対象とする |
| C5 Epic tracking tables | 構造的部分は MERGE / NARROW 候補（R-S1）。経験的部分は観測継続 | 実施時は template 契約と agentdev-epic-tracker の更新契約の変更を伴う |
| C6 capture pipeline セクション | KEEP | 存在実測 6/6、5/6。learning entry 生成の実績あり。データ蓄積後に再評価 |
| C7 integrity suite・docs-check・契約テスト | KEEP | Baseline V2 測定 §3 の削減対象外記録、DEC-001 決定4、DEC-021、REQ-050 に従う |
| C8 telemetry 契約起因の実行失敗監視 | 判断候補なし（サンプル不足） | 発生例の蓄積を待つ。発生しないとは断定しない |

DOWNGRADE の対象は hard control を構成する field からは見つかっていない。derivability 監査 §6 も「DOWNGRADE 候補はない」と記録しており、本ランキングでも DOWNGRADE は G1、G3、G4 の実験後の可能性としてのみ存在する。

## 9. サンプル不足と解釈の境界

本ランキングの実測値の多くは Epic A #2596 の 6件（PR #2611〜#2616）という小サンプルの構造観測値である。Baseline V2 測定 §5 と同じく、30〜50 execution units は運用蓄積の目安であり、本時点のサンプルでは頻度分布、平均、削減効果を断定できない。

- 未測定と記録した評価軸に推定値を補っていない。後続の実験定義作成者は、未測定の軸を実験の Observation 設計の対象として扱える
- Baseline V2 の比較可能範囲・非比較範囲（Baseline V2 定義 §4）に従い、本 Report の値を Legacy Baseline の実測値（約 67.9 億トークン等）と比較しない
- 本ランキングは Phase B 時点の control plane に基づく。後続の実験・縮小の実施で構造が変わった場合、ランキングは更新されず、後続の Decision が新しい状態を評価する

## 10. 検証対応と検証記録

### 10.1 ADF-COVERS 宣言と検証対応

本 Report は `ADF-COVERS(verification): REQ-048-006, REQ-048-013, REQ-048-016` を宣言する。

- REQ-048-006: §1.2 の対比較原則と §7 の5価値軸（Outcome、Efficiency、Quality、Autonomy、Control / Coordination）の区別記録により検証対応を示す
- REQ-048-013: §8 の KEEP、NARROW、MERGE、DOWNGRADE、DELETE への判断候補の整理により検証対応を示す
- REQ-048-016: 評価結果を既存成果物種別（Report）へ保存し、新規成果物種別を追加しないことで検証対応を示す

### 10.2 TS-008B 読み戻し検証

Issue #2605 テスト戦略 TS-008B に従い、本 Report の読み戻しで次を確認する。

| 確認項目 | 結果 | 証拠 |
|---|---|---|
| 評価軸6つ（Frequency、Cost、Incremental Benefit、Redundancy、Safety relevance、Observability confidence）が区別して記録されている | 合格 | §1.1 の定義表、§3 の 6列評価表。全候補行に6軸の記録がある。未測定軸は根拠を併記 |
| structural redundancy と empirical redundancy の分離が反映されている | 合格 | §1.3 の区分定義、§4（structural、Wave 5 実施済みと残存候補の分離）、§5（empirical、G1〜G4 対応）、§6.1 のランキング対象が §5 の候補に限定されていること |
| ランキングが既存成果物に保存されている | 合格 | 本 Report 自体が既存成果物種別（Report）である。新規成果物種別は追加していない |

### 10.3 docs 変更整合性検証

本 Report の保存後に `/repo/docs-check` 相当の `check_changed_docs.ts` を実行し、failures 0 を確認した。実行結果は PR 本文の検証差分セクションに記録する。
