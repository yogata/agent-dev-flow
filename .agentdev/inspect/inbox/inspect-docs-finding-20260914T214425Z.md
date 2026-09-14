# inspect-docs finding 20260914T214425Z

> /agentdev/backlog-auto stage 1（inspect-docs）の診断結果。診断は3系統（REQ 構造 / Design・Decision・guides・README / 配布物整合性）で実施し、計 27件（+範囲外隣接1件）を検出。NG 分類の「今回」基準は前回 inspect-docs 実行（2026-09-07）以降のコミットに由来するもの（git log で導入日を裏付け）。

## サマリ

- 系統別検出数: REQ 構造 8件（F-01〜F-08）/ Design・Decision・guides・README 17件+隣接1件（README-1, GUIDE-1〜9, DESIGN-1〜3, DRIFT-1〜3, DEC-1, ADJ-1）/ 配布物 2件（DIST-01, DIST-02）
- severity 内訳（文書種別系）: high 5件 / medium 7件 / low 5件。顕著なクラスタ: 2026-09-14 DEC-029 波及（#2805〜#2813、PR #2812〜#2820）に伴う guides/README の部分更新残存（RU 削除タイミング・クイックスタートフロー・draft Design 放置）
- docs-check route 候補: 5件（§docs-check route 候補）

## 検出事項リスト

### [REQ 構造] F-01: REQ-003-025/027 が case-open/case-ready 責務分割後の現行契約と矛盾

- **category**: DRIFT（横断契約矛盾）
- **target**: docs/requirements/REQ-003.md:42（REQ-003-025）、REQ-003.md:44（REQ-003-027）対 REQ-030-007/008、REQ-061-025、REQ-008-010/011
- **evidence**: REQ-003-025「case-open は draft、RU 削除後に即時 push し」↔ REQ-030-007「case-open は draft / RU を削除しないこと」・REQ-061-025「case-ready は成功後に draft / RU を削除すること」・REQ-008-010「RU は case-ready 成功後にのみ削除」。REQ-003-027「case-open は子 Issue 本文に前工程完了度を記録し」↔ REQ-030-008「case-open は …Child Issue、Wave を作成しないこと」。`.agentdev/README.md` 状態表も case-ready 成功時削除で一致
- **severity**: high / **confidence**: high
- **source_of_truth**: 現行 REQ 間の矛盾。REQ-030/061/008 + DEC-029（2026-09-14 accepted、状態遷移中心再構成）が多数・新規側。REQ-003 該当行は 2026-08-20 以降未更新の旧状態
- **recommended_route**: req-define 再壁打ち（REQ-003 当該行を UPDATE: 削除・push 責務を現行分割へ追随、または行自体の RETIRE）
- **ng_classification**: 今回修正対象（矛盾は 2026-09-14 commit `fff8f0c9` の DEC-029 再構成で新規発生）
- **notes**: req-define入力案「case-open の draft/RU 削除・即時 push、子 Issue 本文への完了度記述という旧責務を REQ-003 から除去し、draft/RU 削除は case-ready（REQ-061-025）、子 Issue 完了度記録は case-ready/case-close の現行契約へ集約する」

### [REQ 構造] F-02: docs/README.md の REQ-030 タイトルが旧題のまま

- **category**: DRIFT（第一参照導線）
- **target**: docs/README.md 要件表 REQ-030 行（手動管理表）
- **evidence**: 表記「case-open 実行契約（Issue構成生成）」（最終更新 2026-08-15）↔ 実ファイル frontmatter title「case-open 実行契約（Root Case 確立と Definition Package）」（2026-09-14 `fff8f0c9` で改題）。requirements/README.md AUTOGEN 表は新題で一致、docs/README.md のみ陳腐化
- **severity**: high / **confidence**: high
- **source_of_truth**: 実ファイル frontmatter（現行 REQ）が正
- **recommended_route**: docs/README.md 表の文言修正（UPDATE。軽微表記修正、intake 化または直接修正）
- **ng_classification**: 今回修正対象（2026-09-14 の改題 commit で表が取り残された）

### [REQ 構造] F-03: 一時成果物・作業履歴識別子（RU/Issue/case 番号）の現行 REQ 残置（集約）

- **category**: MOVE（Design 分離基準違反: 作業履歴残留・一時成果物 ID 残留）
- **target**: ① REQ-044.md:27-29（適用範囲「RU-0002/0003/0004」）② REQ-048.md:57（「RU-0002 由来」）③ REQ-057.md:45（「AG-009(a)（Issue #2386 由来）」）④ REQ-031.md:45（REQ-031-028「case 2769 で確立」）⑤ REQ-060.md:10（目的「case 2766/2768/2777/2779」）⑥ REQ-006.md:21-22（履歴文脈段落）
- **evidence**: ①②は RU 番号空間が再利用され現在の RU-0002（2026-09-15 別主題）と衝突し参照一意性を欠く。REQ-001-030「永続文書の根拠参照は一時成果物の識別子を含まず」、REQ-008-012「RU は docs 永続文書の根拠参照対象外」、REQ-001-015「履歴情報は現行基準の本文では扱わない」。⑥は REQ-001-013 の置換連鎖例外候補だが REQ-001-047 との緊張あり
- **severity**: high / **confidence**: high（⑥のみ medium: 例外候補あり）
- **source_of_truth**: REQ-001-030 / REQ-008-012 / REQ-001-015
- **recommended_route**: MOVE（機能的記述への置換または削除。⑥は置換連鎖の要点のみに圧縮）
- **ng_classification**: ①②③⑥ pre-existing（2026-08-20〜09-02 由来、前回 inspect でも未指摘の見逃し）/ ④⑤ 今回修正対象（2026-09-14 追加行・新規 REQ）
- **notes**: req-define入力案「RU/Issue/case 番号を要件文・適用範囲から除去し、由来記録は追跡Issue・版管理履歴へ退避する（REQ-001-015 準拠）」

### [REQ 構造] F-04: REQ-038-006 に内部アルゴリズム（2フェーズ読込）が要件行の主内容に混入

- **category**: MOVE（文書分類一貫性: 内部アルゴリズム残留）
- **target**: docs/requirements/REQ-038.md:23（REQ-038-006）
- **evidence**: 「プールサイズに依存しない突合スコープ（インデックススキャンと候補絞り込みによる2フェーズ読込）で行い…全面読みフォールバックを契約とする」— 読込手段の実装方式が括弧内で要件化。行の主文意（スコープの非依存性）自体は非機能契約として成立
- **severity**: medium / **confidence**: medium（安定契約例外候補: 停止条件・処理量上限の骨格は REQ 側に留めてよい）
- **source_of_truth**: REQ-001-067（内部アルゴリズムは Design 移管）。実装方式の詳細は learning-pipeline Design/checker 実装が正規所有先
- **recommended_route**: MOVE（実装方式記述を Design へ、REQ 行は「突合スコープの非依存性と全面読みフォールバック」契約へ縮約）
- **ng_classification**: 今回修正対象（2026-09-13 `9100c169` 追加行）
- **notes**: req-define入力案「REQ-038-006 の2フェーズ読込等の実装手段を Design へ移管し、要件行は突合スコープの非依存性とフォールバック契約に縮約する」

### [REQ 構造] F-05: REQ-050-016 が REQ-050 の適用範囲外関心かつ実装パラメータを含む

- **category**: SPLIT（+ MOVE 補助: 実装パラメータ残留）
- **target**: docs/requirements/REQ-050.md:36（REQ-050-016）対 同ファイルの目的・適用範囲（scripts 公開入口境界）
- **evidence**: (a) skill description 集約予算の縮約方針は REQ-050 の目的・適用範囲のいずれにも説明できない（REQ-001-041 違反）。(b) 「350 字 × 50 件相当」「lint_skills 検査契約（warning 発出）」等の内部数値・checker 参照が行を占有。計 2 シグナル以上
- **severity**: medium-high / **confidence**: medium-high
- **source_of_truth**: REQ-001-041（関心対象の総体として説明できること）・REQ-001-067（行数上限等は Design）。予算数値は lint_skills 検査契約・Design が正規所有先
- **recommended_route**: SPLIT（独立関心として専用 REQ へ分割）+ 数値詳細は Design 参照へ縮約
- **ng_classification**: 今回修正対象（2026-09-12 `1003eb4c` 追加行）
- **notes**: req-define入力案「skill description 集約予算の運用方針を REQ-050 から切り出し、独立 REQ へ配置。予算数値の詳細は Design 参照とする」

### [REQ 構造] F-06: REQ-059-005 のテーブル外漏出散文（要件テーブル構造破損）

- **category**: DRIFT（文書構造）
- **target**: docs/requirements/REQ-059.md:22-25
- **evidence**: REQ-059-005 のテーブル行直後にテーブルセルから漏出した散文 3行（「retired Decision の復帰時取扱いとして、REQ-059-001 の空宣言原則と…完了条件に related_reqs 宣言（空含む）を含める。」）が表構造の外に存在。REQ-008-050・REQ-001-046 の標準構成から乖離
- **severity**: high / **confidence**: high（機械的シグナル）
- **source_of_truth**: REQ-001-046 / REQ-008-050（標準構成）
- **recommended_route**: UPDATE（散文を行本文へ統合、または適用範囲へ要約。構造修正、intake 化または保存工程の検査で是正）
- **ng_classification**: 今回修正対象（2026-09-12 `5683f59c` 追加）

### [REQ 構造] F-07: REQ-010-059 の旧ファイル名「spec-health-metrics.md」残存

- **category**: DRIFT（旧名称の残存）
- **target**: docs/requirements/REQ-010.md:31（REQ-010-059）
- **evidence**: 「AUTOGEN ブロック（spec-health-metrics.md 等）の鮮度を検出」— 実ファイルは docs/designs/quality/req-health-metrics.md（2度改名）。2026-08-22 監査報告にも同文言が記録済みで当該監査以降も未是正
- **severity**: high / **confidence**: high
- **source_of_truth**: 実ファイル配置（req-health-metrics.md）が正。REQ-010-067（旧パス・削除済み名称検出）が本 REQ 自体の検査方針への自己違反
- **recommended_route**: UPDATE（`req-health-metrics.md` 等へ置換。表記修正）
- **ng_classification**: pre-existing（2026-08-22 以前から残存）

### [REQ 構造] F-08: REQ-057-008 の参照注記「REQ-002-043（知識非保持原則）」ラベル不一致

- **category**: DRIFT（参照先内容と注記の不一致）
- **target**: docs/requirements/REQ-057.md:23（REQ-057-008）
- **evidence**: REQ-002-043 の実内容は third-party Skill の配置・release 非同梱。「知識非保持原則」に対応するのは REQ-002-046。ID とラベルのいずれかが誤り（文脈からは ID 043 が意図されラベルが誤りと推定）
- **severity**: medium / **confidence**: medium
- **source_of_truth**: REQ-002 の要件行本文が正
- **recommended_route**: UPDATE（ラベルを「third-party Skill 本体非同梱原則」等へ修正、または ID を REQ-002-046 へ変更）
- **ng_classification**: pre-existing（REQ-057 は 2026-09-02 作成、前回 inspect 2026-09-07 で未指摘）

### [文書種別] README-1: 最小クイックスタートが現行フローと矛盾（case-ready 欠落）

- **category**: README 索引診断（現行化漏れ）/ 横断契約矛盾
- **target**: README.md L10-15（最小クイックスタートコードブロック）
- **evidence**: ブロックは `req-define → case-open → case-run → case-close` の4コマンド。case-open 注釈「Issue を作成する」は旧責務表現。docs/guides/quickstart.md L19 は「case-ready をスキップしない」、docs/guides/req-case-flow.md L9 は5コマンドフロー。DEC-029（2026-09-14 accepted）が case-ready を主フローに導入
- **severity**: high / **confidence**: high
- **source_of_truth**: 現行 REQ-005/REQ-061 + DEC-029 を正とし、README（索引・案内層）の記述を検出事項とする
- **recommended_route**: README のフローブロックを quickstart.md 参照へ縮約（索引の範囲へ戻す）、または5コマンドへ現行化。inspect-promote → backlog-review
- **ng_classification**: 今回修正対象（2026-09-14 DEC-029 波及で guides 側のみ更新され README が旧フローのまま残存）

### [文書種別] GUIDE-1: quickstart.md に case-open 重複行（旧フロー編集残滓）

- **category**: guides 意味診断（履歴混入）
- **target**: docs/guides/quickstart.md L7 と L9
- **evidence**: L7 `/agentdev/case-open # Case Issue と Definition Package の作成`（新）と L9 `/agentdev/case-open # Issue を作成する`（旧注釈）が同一ブロックに混在。正しい流れは5コマンド
- **severity**: high / **confidence**: high（機械的に一意）
- **source_of_truth**: 現行 REQ-005/REQ-061（フロー）を正とし、ガイドの残滓行を検出事項とする
- **recommended_route**: L9 削除。inspect-promote → backlog-review
- **ng_classification**: 今回修正対象（DEC-029 波及の部分適用）

### [文書種別] GUIDE-2: RU 削除タイミングが自ファイル内で矛盾（旧 case-open 規定の残置）

- **category**: guides 意味診断 / 横断契約矛盾
- **target**: docs/guides/artifacts-and-state.md L119
- **evidence**: 「RU 削除は `/agentdev/case-open` の永続化成功に限定する。」↔ 同ファイル L112 の表は「`/agentdev/case-ready` の Definition 確定 + VERIFY 成功時」。SSoT: designs/workflows/backlog-artifact-lifecycle.md L41「RU 削除を行う唯一の工程は case-ready」、REQ-008-010/011、`.agentdev/README.md` 状態表も同一
- **severity**: high / **confidence**: high
- **source_of_truth**: 現行 REQ-008-010/REQ-030-007 を正とし、ガイド（下位）の矛盾を検出事項とする
- **recommended_route**: L118-119 を case-ready 削除契約へ現行化。inspect-promote → backlog-review
- **ng_classification**: 今回修正対象（#2807「draft/RU 削除タイミング移動」の部分更新残存）

### [文書種別] GUIDE-3: RU 削除表の case-open 行が現行契約と矛盾

- **category**: guides 意味診断 / 横断契約矛盾
- **target**: docs/guides/intake-learning-backlog-flow.md L114-117（RU の削除ルール表）
- **evidence**: 表行「RU の内容が Issue に永続化完了（Issue作成 + VERIFY 成功）| `/agentdev/case-open` | 該当 RU ファイル」。同ファイル L119 は「`/agentdev/case-ready` は Definition 確定後に RU を削除」。SSoT は GUIDE-2 と同一
- **severity**: high / **confidence**: high
- **source_of_truth**: 現行 REQ-008-010/REQ-030-007
- **recommended_route**: 表行の実行コマンド/トリガーを case-ready へ現行化。inspect-promote → backlog-review
- **ng_classification**: 今回修正対象（#2807 部分更新、方向が逆の半分更新）

### [文書種別] GUIDE-4: トラブルシューティング項目全体が旧 RU 削除モデル前提

- **category**: guides 意味診断（履歴混入）
- **target**: docs/guides/troubleshooting.md L26-33（「case-open で RU が削除されない」節）
- **evidence**: 「Issue 作成後に RU ファイルが残っている」を症状とし「再度 case-open を実行する」を対処とする。現行契約では case-open 後の RU 残置は正常動作（削除は case-ready、REQ-008-010）。現行では発生し得ない"問題"への対処を案内
- **severity**: high / **confidence**: high
- **source_of_truth**: 現行 REQ-008-010/REQ-030-007
- **recommended_route**: 同節を case-ready の VERIFY 失敗/RU 残置契約へ書き換えまたは削除。inspect-promote → backlog-review
- **ng_classification**: 今回修正対象（#2807 波及の更新漏れ）

### [文書種別] GUIDE-5: 参照方向の記述が実際と逆方向

- **category**: guides 意味診断 / 横断契約矛盾
- **target**: docs/guides/project-docs-and-specs.md L88
- **evidence**: 「REQ → Issue の一方向参照である。Issue から REQ への逆参照は行わない」。正規契約は逆: agentdev-req-file-manager/references/matching-and-merge.md L82「REQファイルはIssueから一方向参照（Issue本文にREQ番号を記載）」。実務も全 Case Issue が REQ 番号を標題に持つ（例: Issue #2809「REQ-061/017/035」）
- **severity**: medium / **confidence**: high
- **source_of_truth**: 配布 Capability Skill の正規契約記述 + 実務観測（契約の正は REQ-004 系・成果物責任表系）
- **recommended_route**: L88-89 を「Issue 本文に REQ 番号を記載（Issue→REQ）。REQ/Decision ファイルから Issue への逆参照は行わない」へ修正。inspect-promote → backlog-review
- **ng_classification**: pre-existing（DEC-020 以前からの旧表現）

### [文書種別] GUIDE-6: 状態モデル制約が Design/Decision の frontmatter status 管理と冲突

- **category**: guides 意味診断 / 横断契約矛盾
- **target**: docs/guides/artifacts-and-state.md L144-152（状態モデル制約節）
- **evidence**: 「REQ / Design の状態管理は Issue ラベル、GitHub Project で行う」「frontmatter や status フィールドによる状態管理は行わず」。一方 document-model.md（accepted Design, REQ-001-025）は「Design は frontmatter `status` で成熟度を管理する（draft/accepted）」、Decision も frontmatter status で管理。document-model の原本規定は「ワークフロー状態（6マイクロフェーズ）」に限定されており、ガイドが過度に一般化
- **severity**: medium / **confidence**: medium（節の意図がワークフロー状態に限定される可能性あり、要文脈判断）
- **source_of_truth**: Design（document-model.md、REQ-001-025）を正とし、ガイドの過度に一般化した記述を検出事項とする
- **recommended_route**: 同節を「ワークフロー進行状態」にスコープ明確化。inspect-promote → backlog-review
- **ng_classification**: pre-existing

### [文書種別] GUIDE-7: 用語集の Decision 定義が拡張前の旧定義のまま

- **category**: guides 意味診断 / 横断契約矛盾
- **target**: docs/guides/glossary.md L35
- **evidence**: 「Decision | 取り返しのつかない技術判断の記録」。document-model.md「Decision 定義拡張」節は拡張後の定義「将来の設計、運用、文書システムを制約する決定の記録」と明記。現行 Decision 群（DEC-016、DEC-025 等）は旧定義では説明不能
- **severity**: medium / **confidence**: high
- **source_of_truth**: Design（document-model.md、REQ-001 系）
- **recommended_route**: 拡張後定義へ更新。inspect-promote → backlog-review
- **ng_classification**: pre-existing

### [文書種別] GUIDE-8: 入口表の case-open 行が旧責務表現のまま重複行と混在

- **category**: guides 意味診断（現行化漏れ）
- **target**: docs/guides/command-selection.md L13
- **evidence**: 「REQ ファイルまたは要件docがある | `/agentdev/case-open` | GitHub Issue」。L12 は新契約（case-open → case-ready、出力「Definition Package と実行構造」）。L13 は「要件doc」が L12 と重複し case-ready を伴わず出力も旧責務（#2808 で case-open は Root Case 確立と Definition Package 生成へ縮小）
- **severity**: low / **confidence**: medium（行の意図が「REQ ファイル直指定」ケースの案内である解釈も可能）
- **source_of_truth**: 現行 REQ-030（case-open 実行契約）
- **recommended_route**: L13 を「REQ ファイル（case-ready 未実施分）」等へスコープ明確化、出力列を現行化。inspect-promote → backlog-review
- **ng_classification**: 今回修正対象（#2806/#2808 波及の更新漏れ可能性）

### [文書種別] GUIDE-9: 検出事項（Finding）の定義から inspect 系が漏落

- **category**: guides 意味診断（導線の正確性）
- **target**: docs/guides/glossary.md L67
- **evidence**: 「検出事項（Finding）| docs-check や case-run で検出された乖離、発現事項」。現行の主要な finding 供給源は inspect-docs / inspect-skills（`.agentdev/inspect/inbox/`、inspect lifecycle）
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-036（検出と診断コマンド群）+ finding 出力契約
- **recommended_route**: 定義に inspect 系コマンドを追加。inspect-promote → backlog-review
- **ng_classification**: pre-existing

### [文書種別] DESIGN-1: document-model.md が存在しない foundations/workflow-contracts.md を配置登録

- **category**: Design 意味診断 / 索引の不整合
- **target**: docs/designs/foundations/document-model.md L537 + L549
- **evidence**: 両表とも `workflow-contracts.md | foundations/`（縮小済み旧版）を登録。実ファイルは docs/designs/workflows/workflow-contracts.md のみで foundations/ 配下に存在しない（foundations/ 実在 9ファイル全数確認）。docs/designs/README.md の foundations 表にも掲載なし
- **severity**: medium / **confidence**: high（ファイル不存在は機械的）
- **source_of_truth**: 実ファイル配置 + designs/README.md（Design status・索引の追跡情報源）
- **recommended_route**: 該当行の削除または実配置（workflows/）への参照修正。cleanup モデル処置候補: REFERENCE。inspect-promote → backlog-review
- **ng_classification**: pre-existing（段階移送方針に伴う旧パス記録の残置）

### [文書種別] DESIGN-2: 廃止 REQ-028-007 の引用に (retired) 注記・後継併記がない

- **category**: 廃止 REQ/Design 由来記述残置
- **target**: docs/designs/authoring/vocabulary-registry.md L10, L32、docs/designs/integrity/integrity-rule-catalog.md L121, L123、docs/designs/README.md L244
- **evidence**: 「（ACT-SPEC-007、REQ-028-007、DEC-013 適用）」等、REQ-028（retired）配下の 007 を注記なしで引用。同一文書内の他箇所（integrity-rule-catalog L129-132、rule-ownership L177）は「retired REQ-028-007」と注記あり。参照規則（document-model）は廃止文書参照に `(retired)` 注記 + 現行後継文書の併記を要求
- **severity**: low / **confidence**: high（注記欠落自体は機械的。文脈は移管状態の説明が主で現行判断の根拠扱いではないと判断し low）
- **source_of_truth**: 参照規則（document-model.md）
- **recommended_route**: 該当箇所に retired 注記 + 後継（DEC-006/REQ-036 系）併記
- **ng_classification**: pre-existing

### [文書種別] DESIGN-3: Design 内の将来拡張余地記述（責務境界の境界ケース）

- **category**: Design 意味診断（将来計画の混入）
- **target**: docs/designs/authoring/command-file-format.md L17（+ 同旨が docs/designs/README.md authoring 行にも重複記載）
- **evidence**: 「`authoring/` は将来 REQ/Design/SKILL/guide 執筆規約の集約先として拡張余地を持つ（現状は command のみ）」。document-model L449 は「将来案…を Design に保持しない」。ただし本記述は現配置の維持根拠として機能しており複数解釈可能
- **severity**: low / **confidence**: low
- **source_of_truth**: Design 責務境界（document-model）。安定契約例外候補（配置方針の説明）として確信度下方調整
- **recommended_route**: cleanup モデル処置候補: KEEP（配置根拠として許容）または将来案表現の除去。inspect-promote → backlog-review
- **ng_classification**: pre-existing

### [文書種別] DRIFT-1〜3: 実装 Case 完了後も draft のままの Design（Design 状態乖離）

- **category**: Design 状態乖離 DRIFT
- **target**: DRIFT-1: docs/designs/commands/case-ready.md（status: draft, 2026-09-14）/ DRIFT-2: docs/designs/commands/case-revise.md（同上）/ DRIFT-3: docs/designs/workflows/definition-readiness.md（同上）
- **evidence**: 3 Design とも ADF-COVERS 宣言を持たないため REQ ファイル単位近似判定（近似判定である旨を明示）。DRIFT-1 ↔ REQ-061（Case #2809 closed、PR #2817 merged）。DRIFT-2 ↔ REQ-062（Case #2810 closed、PR #2818 merged）。DRIFT-3 ↔ REQ-061/REQ-005（PR #2817 が対応を記録、Case #2806 closed）。見送り記録（見送り理由・再評価契機）なし: 関連 Issue コメント・3 Design 本文中にも見送り記録なし
- **severity**: medium / **confidence**: DRIFT-1・2 high（Case 標題が REQ を直接明示）、DRIFT-3 medium（REQ 対応が近似）
- **source_of_truth**: REQ-001-025（Design ライフサイクル: 確定時に accepted へ遷移、昇格は case-close の責務）+ 完了 Case を正とする
- **recommended_route**: case-close の Design 状態評価（棚卸し制、REQ-032-024..026）への差し戻し — accepted 昇格または見送り記録（理由・再評価契機）の付与
- **ng_classification**: 今回修正対象（3 Design は 2026-09-14 の波及で新規保存）
- **notes**: PR #2817 の記録により ADF-COVERS を SKILL.md 側へ配置すること自体は正規配置規則に沿いため、宣言欠落自体は非違反

### [文書種別] DEC-1: Decision Map が現在不存在の Design パスを後継として案内

- **category**: Decision 意味診断（状態整合・参照整合）
- **target**: docs/decisions/README.md Decision Map 行「DEC-007 | supersedes-spec | docs/designs/local/artifact-graph.md」
- **evidence**: 「後継 Design は docs/designs/skills/agentdev-artifact-graph.md」と案内するが両パスとも実在しない（artifact-graph は DEC-017 により agentdev-traceability / traceability-model.md へ移管済み）。履歴 Map とはいえ現行後継の案内がなく読者が途切れる
- **severity**: low / **confidence**: high
- **source_of_truth**: DEC-017（accepted）+ 実ファイル配置
- **recommended_route**: Map 行に現行後継（agentdev-traceability / foundations/traceability-model.md）を併記。inspect-promote → backlog-review
- **ng_classification**: pre-existing

### [文書種別] ADJ-1（範囲外隣接）: superseded DEC-005 が現行参照として無注記で引用

- **category**: Decision 意味診断の走査で隣接検出
- **target**: .agentdev/README.md L65「[DEC-005](../docs/decisions/DEC-005.md): Project Extensions Architecture」
- **evidence**: DEC-005 は status: superseded（superseded_by: DEC-006）。参照更新規則（document-model「廃止 Decision 参照更新」）は現行後継への更新か注記を要求。docs/README.md L81 は「（superseded by DEC-006）」と注記ありで適合
- **severity**: medium / **confidence**: high
- **source_of_truth**: DEC-005 frontmatter（superseded）
- **recommended_route**: 参照更新（注記 + 後継併記。DEC-006 の置換範囲は inspect-extensions 廃止に係る部分置換である点に注意）
- **ng_classification**: pre-existing

### [配布物] DIST-01: case-run.md frontmatter 内の空行（他 command と不整合）

- **category**: 構文健全性（frontmatter 破損パターン。docs-spec-rebuild-integrity Design「構文健全性検査」）
- **target**: .opencode/commands/agentdev/case-run.md line 1-4（先頭バイト列: `---` / 空行 / `description:`）
- **evidence**: 開始デリミタ `---`（line 1）と `description:`（line 3）の間に空行（line 2）が存在。他の全18 command + README（計19ファイル）は `---` の直後に `description:` を置く形式で case-run.md のみ逸脱（機械検査確定）。YAML としては有効だが、frontmatter 先頭空行を許容しないパーサでは description 認識漏れ（コマンド一覧表示・検索劣化）のリスク。導入 commit `ac4cf77e`（2026-09-10、PR #2760）
- **severity**: medium / **confidence**: high
- **source_of_truth**: docs-spec-rebuild-integrity Design（構文健全性: frontmatter の重複・破損検出）
- **recommended_route**: inspect-promote → backlog-review（RU 化）→ 修正 Case（frontmatter の空行削除。変更は1行、意味判断不要）
- **ng_classification**: pre-existing（PR #2760〔2026-09-10〕で導入済み。後続対象: 別途要件化／メンテナンス Case）
- **notes**: docs-check route 候補 #1 参照。既存 check_content_corruption.ts は frontmatter 破損を意図的に対象外としており現行機械検査では検出されない

### [配布物] DIST-02: skill Design 一覧掲載スキル `agentdev-git-worktree-test-fallback` に対応する配布 skill が存在しない

- **category**: 責務整合（Design 索引と配布物実在の対応）
- **target**: docs/designs/README.md skill Design 一覧（skills/agentdev-git-worktree-test-fallback.md 行）vs .opencode/skills/（該当ディレクトリなし、agentdev-* スキル実在 49件）。配布側の出典: .opencode/skills/agentdev-git-worktree/references/worktree-operations.md line 8, 113
- **evidence**: 配布物からは「Design」として参照しており Design ファイル自体は実在（壊れた参照表現ではない）。ただし他の agentdev-* skill Design はすべて配布 skill ディレクトリと1:1対応で、test-fallback のみ Design のみ。repo-local 除外の明記（repo-agentdev-integrity に対する注記）がこの行にはない
- **severity**: low / **confidence**: medium（Design 実在・配布物不在は機械的確定だが、「Design のみで配布しない」意図的例外か判断には文脈確認が必要。要ヒューマンレビュー）
- **source_of_truth**: docs/designs/README.md（Design status 追跡情報源）を正とし、配布物実在セットとの対応を突合
- **recommended_route**: docs 側確認（Design 一覧の注記整理）。配布物側の修正対象ではない
- **ng_classification**: pre-existing

## docs-check route 候補（STEP-3-2）

| # | 候補ルール | 根拠観察 | 適合性 |
|---|---|---|---|
| 1 | frontmatter 先頭空行検出: md の line 1 が `---` なら line 2 は空行であってはならない | DIST-01。全19 command 中1件のみ逸脱、決定的・偽陽性ゼロ。既存 check_content_corruption.ts は frontmatter 破損を対象外 | ◎（新規 IR 候補） |
| 2 | 改行コード混在検出: ファイル内の CRLF/LF 出現集合が単一か | 本診断で 251 ファイル検査済み（0件）。Windows 編集環境での混入防止に有効 | ○ |
| 3 | 存在しない command 参照の README×実在突合 | 本診断で実装・実行済み（0件）。完全機械化可能 | △（docs-spec-rebuild-integrity Design が inspect-* の意味層検査として明示割当済み。移送は Design の責務分担変更を要する） |
| 4 | bare `---` setext リスク検出: fence 外・frontmatter 外の `---` は直前行が空行であること | 本診断で検査済み（実害0件） | ○ |
| 5 | 見出し重複検出 | 169件の重複がすべて正規構造（STEP 8見出し等） | ×（却下推奨。allowlist 運用コストが便益を上回る） |

## 既知 defer 継続事項（原状継続を確認、新規起票せず）

| defer ID | 内容 | 本診断での確認 |
|---|---|---|
| F-08 (0901) | REQ-003 に委譲境界と対論型レビュー振る舞い契約が混在（SPLIT 候補、REQ-003-035〜054） | 原状継続（本診断 F-01 とは別領域） |
| F-09 (0901) | default-on・再起票禁止が REQ-003/014/015 に二重規定（DUPLICATE） | 原状継続 |
| F-10 (0901) | 検証実行結果非保存が REQ-012/021 に二重規定（DUPLICATE 軽度） | 原状継続 |
| F-11 (0901) | REQ-016 が移行完了状態の恒久 REQ 化（RETIRE 候補。REQ-045/046 同型） | 原状継続 |
| F-12 (0901) | REQ-008-059 テーブル外見出し＋fixture 列挙（MOVE） | 原状継続 |
| F-04 (0907) | REQ-057 完了後 RETIRE 候補性（Epic #2506/#2633 系 case-close を再評価条件） | 原状継続 |

## 対象外（Out of Scope）

- docs 表層品質（textlint 共通基盤管轄）
- REQ ファイル群の詳細構造診断（本ファイル [REQ 構造] セクションに収録済み）
- ADJ-1 の対象 `.agentdev/README.md`（本診断 4 ディレクトリ外のため隣接検出としてのみ記録）
- PR #2820 記録の `--review-ng` 表記や extensions 旧 Skill 参照の残存指摘（配布物・`.agentdev/extensions` 側の個別対応）
- 偽陽性判定した機械的検出（4重バックフェンス内 frontmatter 例示、`(URL)` プレースホルダ、vendored node_modules 等）: 配布物診断の全数精査により false positive 分類済み

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 空（.gitkeep のみ）
- `.agentdev/learning/inbox.md`: 未整理エントリ存在（155行、最新 2026-09-15）。learning-promote 待ち
- `.agentdev/backlog/req-units/`: RU 13件（RU-0001 2026-09-13、RU-0002〜0013 2026-09-15、commit `a7dae7d2` の backlog-review 生成）。req-define 待ち
- `.agentdev/inspect/inbox/`: 既存 defer 2ファイル（20260901/20260907、分類確定済みの意図的残置）
- `.agentdev/intake/promoted/`・`learning/promoted/`・`inspect/promoted/`・`.agentdev/drafts/`: 空

## クリーン判定（問題なしと確認した観点）

- REQ 参照ID整合性: dangling 参照 0件（親 ID・サブ ID・IR ID すべて実在。REQ-000/900 系は `v2:` 付き歴史識別子で許容）
- 第一参照導線（requirements/README.md）: 整合（docs/README.md の REQ-030 行のみ F-02）
- 現行/廃止/世代境界: 二重存在 0件・欠番 13件は全て retired/ に実在し README 廃止表 12件と一致・tag v2.11.0 実在
- MERGE（新規 0件）、RETIRE（新規 0件）、DUPLICATE（新規 0件）
- Decision 状態乖離: 検出事項 0件（accepted 26 / superseded 2 / 欠番 DEC-018 で README・AUTOGEN・frontmatter 完全一致、proposed 0件）
- guides ナビゲーション層の範囲超過（要件本文・契約本文の重複）: 検出事項 0件
- README コマンド一覧 18/18 実在突合 ✓、主要導線リンク解決 ✓、廃止 ID・廃止コマンド残留なし
- 配布物 構文健全性: frontmatter 重複 0、見出し重複（意図せぬもの）0、Markdown 構文破損 0、存在しない command 参照 0、UTF-8 BOM 0、CRLF/LF 混在 0（計 251ファイル）
- 配布物 文意保持: 壊れた括弧 0、壊れた参照表現 0、主語/目的語欠落文 0
- 配布物 責務整合: command↔Design 責務説明照合 全18対で一致、case-open/run/close/auto の責務境界一致

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-15。診断実施: 3系統（REQ 構造 50現行+12retired REQ 全文、designs 171ファイル・decisions 29ファイル・guides 12ファイル・README 精読、配布物 251ファイル機械検査）
- 探索手段: README 索引・正規成果物の直接読取・node/perl による機械的走査（frontmatter、索引突合、エンコーディング/構文/ID パターン、相対リンク実在）
- 実行経緯（呼出失敗の明示）: 初回は3系統を background 並行委譲で実行したが、親プロセス終了により background task 結果が喪失した。adversarial-review の caller-integration 契約（呼出失敗時の silent skip 禁止・失敗の明示記録）に準じ、上記のとおり呼出失敗として本記録に明示し、同期逐次実行（run_in_background=false、1系統ずつ）で再実行して本結果を得た
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）
