---
id: BASELINE-REQ048-DERIVABILITY
title: "REQ-048 再構築 correlation field derivability 監査（OU-004 / WP-04 Phase A）"
status: accepted
created: 2026-09-05
baseline_for: REQ-048 / DEC-027
source_issue: "#2601 (OU-004 / WP-04 Correlation Derivability Audit)"
parent_epic: "#2596 (REQ-048 再構築)"
---

<!-- ADF-COVERS(implementation): REQ-048-013, REQ-048-016 -->
<!-- ADF-COVERS(verification): REQ-048-016 -->
# REQ-048 再構築 correlation field derivability 監査（OU-004 / WP-04 Phase A）

## 本 Report の位置づけ

本 Report は REQ-048 再構築 Epic（#2596）の Wave 4（OU-004 / WP-04）で実施した、ADF 実行相関情報の導出可能性監査の記録である。既存の REQ、Decision、Design、テンプレート、契約テストを読み取り、各 field の必要性、導出元、追加コスト、縮小条件、判断候補を記録した。

本 Report は監査証拠の保存だけを行う。既存の REQ、Decision、Design、テンプレート、契約テストは変更していない。field の縮小、統合、削除は OU-005（Issue #2602）の責務である。本 Report はその実施判断の入力とする（REQ-048-016）。

## 1. 監査基準と方法

### 1.1 正規参照先

監査時点の対象と根拠は次のとおりである。行番号は監査時点のファイルに対する証拠位置である。

| 対象 | 証拠位置 | 用途 |
|---|---|---|
| REQ-048 | `docs/requirements/REQ-048.md` L26-30、L38-41 | 相関の最小化、観測機構の評価、判断結果の保存 |
| DEC-027 | `docs/decisions/DEC-027.md` L20-35 | structural redundancy と empirical redundancy の分離、hard invariant の維持 |
| 記録先契約 | `docs/designs/workflows/workflow-contracts.md` L373-399 | field の記録先、現行 baseline、実行単位、harness 情報の扱い |
| field 定義 | `src/opencode/skills/agentdev-workflow-templates/SKILL.md` L61-104 | template の配置、8個の adf_* key、任意性 |
| Issue 配置 | `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md` L22-26、同 bug L22-26、同 epic L22-26、同 child L26-30 | Issue 本文の field 配置 |
| PR 配置 | `src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md` L24-29 | PR 本文の field 配置 |
| 委譲識別情報 | `src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md` L100-105、L144-158 | delegation-ident の key、発行、転記 |
| Wave 1 監査 | `docs/reports/req-048-baseline-v2-audit.md` L105-122 | 現行配置行列、adf_pr の埋め戻し、委譲 block の所在 |
| 契約テスト | `.opencode/skills/repo-agentdev-integrity/scripts/execution_ident_contract.test.ts` L49-96、L145-153、L243-307 | 現行 runtime/downstream の明示値依存 |

### 1.2 縮小5条件

Issue #2601 の実行契約を正として、各 field に次の5条件を適用した。条件1から5がすべて成立する場合に縮小候補とした。

1. canonical な成果物関係から一意に導出できる。
2. 現行 runtime または downstream が明示値へ依存しない、または canonical derivation へ置換できる。
3. hard governance 不変条件を失わない。
4. correlation capability を失わない。
5. テストを重複 field の存在確認から、必要な相関が成立することの確認へ変更できる。

workflow-contracts Design L389-391 は条件1から4を記録している。条件5は Issue #2601 が定める実施判定条件として加えた。DEC-027 L25-28 に従い、成果物関係から一意に導出できる重複は structural redundancy とし、性能実験を待たず縮小候補として扱った。品質、自律性、回復性などの便益を測定しないと判断できない重複は empirical redundancy として別扱いにした。

## 2. correlation field の棚上げ

Wave 1 監査 Report L110-116 で確認された adf_* 8 key と、委譲 prompt の delegation-ident block 4 key を対象にした。Issue #2601 の「10 field」という総称に対し、漏れを防ぐため、block 内の4 keyを個別の監査行として記録した。したがって本 Report の表は、adf_* 8 key と delegation-ident 4 key の計12行で、Issue 本文に列挙されたすべての要素を網羅する。`adf_delegation_id` と `adf_child` は同値疑いを個別に検証し、`adf_parent` は導出可能性を個別に検証する。

### 2.1 配置行列

| 記録先 | adf_case | adf_phase | adf_execution_unit | adf_upstream_confirmed | adf_pr | adf_delegation | adf_result | adf_harness_ref |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| issue_desc_feature.md L22-26 | ○ | ○ | ○ | ○ | - | - | - | ○ 任意 |
| issue_desc_bug.md L22-26 | ○ | ○ | ○ | ○ | - | - | - | ○ 任意 |
| issue_desc_epic.md L22-26 | ○ | ○ | ○ | ○ | - | - | - | ○ 任意 |
| issue_desc_child.md L26-30 | ○ | ○ | ○ | ○ | - | - | - | ○ 任意 |
| pr_desc.md L24-29 | ○ | - | ○ | - | ○ | ○ | ○ | ○ 任意 |
| delegation-ident L100-105 | - | - | - | - | - | - | - | - |

delegation-ident の個別 key は `harness-delegation.md` L149-154 で定義される。`adf_delegation_id` は委譲単位識別子、`adf_delegation_purpose` は委譲目的、`adf_parent` は親実行、`adf_child` は子実行である。PR 本文の `adf_delegation` には delegation-id と purpose を転記する（同 L156-157）。

## 3. derivability table

次表の `field` を除く10列が Issue #2601 の指定列である。`can_derive` は現行契約からの導出可能性、`decision` は OU-005 に渡す候補であり、実施結果ではない。

| field | canonical_owner | why_needed | can_derive | derive_from | extra_write | extra_read | cross-artifact join value | runtime_dependency | safety_dependency | decision |
|---|---|---|---|---|---|---|---|---|---|---|
| `adf_case` | workflow-contracts「ADF 実行識別情報の記録契約」。Issue / PR 本文 | Case、Issue、PR の対応付け（REQ-048-001） | 可。配置により1から2段の導出 | Standard または Epic Issue の番号、子 Issue の `Parent: #N`、PR の `Refs: #N` | Issue / PR の1行。Issue の自己参照は作成後埋め戻し（issue-creation-flows.md L52、L59、L68、L89） | なし | Issue、PR、親 Epic を1ホップで結ぶ直接キー | execution_ident の ISSUE_CORRELATION_KEYS / PR_CORRELATION_KEYS（L58-70） | なし。関係自体は GitHub 成果物関係で維持 | **NARROW 候補**。導出置換は可能だが、直接 join の便益が高い |
| `adf_phase` | 同上。Issue 本文 | 記録を生成した ADF 工程の表示 | 可。現行 Issue template では `case-open` 固定 | Issue template の種別と実行識別情報 section の存在 | template の固定1行 | なし | 相関値は持たない。Issue が case-open 産物であることから判別可能 | ISSUE_CORRELATION_KEYS（L58-62） | なし | **DELETE 候補**。定数で structural redundancy |
| `adf_execution_unit` | 同上。Issue / PR 本文、execution_unit の既存定義に接続 | 実行単位と Epic / Standard の対応付け（REQ-048-001） | 可。番号は自己参照、flow 種別は既存関係から判別可能 | Issue 番号、子 Issue の Parent 行、PR の Refs 行、Epic / Standard の template 種別 | Issue / PR の1行。Issue は作成後埋め戻し | なし | Issue と実行単位、Epic の親子関係を結ぶ | ISSUE / PR_CORRELATION_KEYS、EXECUTION_UNIT_FORMATS（L58-70、L91-96） | なし。execution_unit の意味は epic-wave-model が所有 | **NARROW 候補**。自己参照を縮小し、flow 判別を canonical relation へ置換 |
| `adf_upstream_confirmed` | 同上。Issue 本文 | 前工程の確定事項を受け渡す | 相関値としては不可。内容は既存参照と重複 | REQ 参照 section、REQ / Decision / Design、git 履歴、structured handoff の `resolved_context` / `canonical_references` | Issue 本文の1行。値は識別子列挙を含む | なし | 相関 join には寄与しない。REQ と Issue の対応は別の canonical relation で成立 | 再構成後の execution_ident では pin 対象外。任意の記録行としてのみ存在 | なし。handoff の情報を削っても hard invariant ではない | **DELETE 候補**。correlation field から除外し、handoff の評価対象へ戻す |
| `adf_pr` | 同上。PR 本文 | PR としての識別子を記録 | 可。PR 自身の API 番号と完全同値 | GitHub PR の API 番号、URL、所属成果物 metadata | PR 作成後の本文埋め戻し1回（harness-delegation.md L51-52） | なし | なし。成果物自身の番号と同値 | PR_CORRELATION_KEYS（L64-70） | なし | **DELETE 候補**。自己参照定数で、埋め戻しも不要になる |
| `adf_delegation` | 同上。PR 本文。委譲 prompt から転記 | 委譲実行と PR の対応付け（REQ-048-001） | 不可。特に再委譲 sequence は成果物関係から一意に導出できない | delegation-ident の `adf_delegation_id` と `adf_delegation_purpose`。blocked / failed は Issue comment の SSoT | PR 本文への転記1行 | なし | PR と `DEL-{N}-{seq}` の結合キー | PR_CORRELATION_KEYS、delegation 転記検査（L64-70、L243-284） | なし。委譲契約を示す相関情報 | **KEEP 候補**。委譲と PR の相関を保持する最小の永続記録 |
| `adf_result` | 同上。PR 本文 | 実行結果を PR に表示 | 可。PR が存在する場合は `completed-pr`。他3状態は Issue comment SSoT | PR の存在、Issue comment の blocked / failed / delegation-unavailable 記録 | PR 本文の1行 | なし | なし。PR 存在と completed-pr が構造的に同値 | PR_CORRELATION_KEYS と4状態列挙（L64-70、L84-89、L275-283）。PR 単位の正として SKILL.md L123 も参照 | なし。result 4状態契約そのものは維持 | **DELETE 候補**。生成経路で定数化された structural redundancy |
| `adf_harness_ref` | 同上。Issue / PR 本文の任意 key | harness 生履歴との分析時結合を補助（REQ-048-003、004） | 部分。harness 側からの探索は可能だが、確実な canonical 導出ではない | OpenCode session ID 等の harness 側 metadata | 任意。省略可能 | 任意値を分析時に読む | ADF 記録と harness 履歴の結合入口 | 任意明記のみを検査（L208-227）。必須化しない | 欠落は observability gap として扱い workflow を停止しない | **KEEP 候補**。任意付加情報のまま維持 |
| `adf_delegation_id` | harness-delegation.md の delegation-ident block。case-run 発行 | 委譲単位と親子実行関係の識別（REQ-048-001） | 不可。Issue 番号は含むが、再委譲 sequence は発行履歴が必要 | case-run 発行の `DEL-{N}-{seq}` | 委譲 prompt への記録 | なし | 委譲実行、Issue comment、PR の結合元 | 雛形存在と `DEL-{N}-{seq}` 形式（L243-264） | 親子関係識別の正規手段。harness ID の代替ではない | **KEEP 候補**。発行型で導出不能 |
| `adf_delegation_purpose` | 同上。delegation-ident block | 委譲目的と処理区分の記録 | 相関識別としては不要。目的は分類値 | case-run が委譲時に選んだ implementation / review 等の意図 | 委譲 prompt への記録 | なし | 実行内容の分類を補助。REQ-048-010 の処理区分と意味が重なる | 雛形 key の存在を検査（L251-259）。相関 key としての pin はない | なし | **MERGE 候補**。REQ-048-010 の処理区分評価へ統合 |
| `adf_parent` | 同上。delegation-ident block | 親実行を明示 | 可。現行 adapter の親工程と実行単位から一意に導出 | `adf_delegation_id` の Issue 番号部分、親工程 `case-run`、`standard:#N` | 委譲 prompt への記録 | なし | 委譲 block を単独で読む場合の親子表示を補助 | 雛形 key の存在を検査（L251-259） | なし。親子関係は delegation ID と既存 execution relation で維持 | **DELETE 候補**。structural redundancy。可読性は注記として残す |
| `adf_child` | 同上。delegation-ident block | 子実行を明示 | 可。現行定義で `adf_delegation_id` と同値 | `adf_delegation_id`（L151、L154） | 委譲 prompt への記録 | なし | なし。同値 key のため結合情報は増えない | 雛形 key の存在を検査（L251-259） | なし | **MERGE 候補**。`adf_delegation_id` に統合。AG-006 の疑い成立 |

## 4. 縮小5条件判定

凡例は `成立`、`部分`、`不成立` とする。`部分` は canonical derivation の経路はあるが、直接 key としての便益または置換経路の確定が残ることを示す。条件5は、現行契約テストの存在 pin を相関成立の検査へ変更できるかで判定した。

| field | 条件1 一意導出 | 条件2 置換可能 | 条件3 hard invariant | 条件4 相関能力 | 条件5 テスト変更 | 分類 |
|---|---|---|---|---|---|---|
| `adf_case` | 部分。番号、Parent、Refs から導出 | 成立。契約テスト pin を関係検査へ置換可能 | 成立。GitHub 関係を維持 | 部分。直接 join の便益を失わない確認が必要 | 成立 | structural、NARROW 候補 |
| `adf_phase` | 成立。case-open 固定 | 成立。ISSUE_CORRELATION_KEYS から除外可能 | 成立 | 成立。相関の核ではない | 成立 | structural、DELETE 候補 |
| `adf_execution_unit` | 部分。番号は同値、flow 種別は関係から判別 | 成立。形式 pin を関係検査へ置換可能 | 成立 | 部分。Epic / Standard 判別の代替確認が必要 | 成立 | structural、NARROW 候補 |
| `adf_upstream_confirmed` | 成立。既存参照と handoff から再構成可能 | 成立。再構成後テストは pin していない | 成立 | 成立。相関 field ではない | 成立 | structural、correlation field から DELETE 候補 |
| `adf_pr` | 成立。PR API 番号と同値 | 成立。API metadata へ置換可能 | 成立 | 成立。API 番号で保持 | 成立 | structural、DELETE 候補 |
| `adf_delegation` | 不成立。再委譲 sequence が関係から導出不能 | 判定対象外。条件1不成立 | 成立 | 成立。委譲と PR の相関核 | 判定対象外 | 非冗長、KEEP 候補 |
| `adf_result` | 成立。PR 存在から completed-pr | 成立。PR / Issue comment の結果関係へ置換可能 | 成立 | 成立。4状態の SSoT は維持 | 成立 | structural、DELETE 候補 |
| `adf_harness_ref` | 部分。harness 側探索は可能だが確実性なし | 成立。任意であり必須依存なし | 成立 | 部分。補助結合を保持 | 適用外。任意 key の存在 pin ではない | 任意付加、KEEP 候補 |
| `adf_delegation_id` | 不成立。発行 sequence が導出不能 | 判定対象外。条件1不成立 | 成立 | 成立。親子関係の正規識別子 | 判定対象外 | 非冗長、KEEP 候補 |
| `adf_delegation_purpose` | 不成立。分類値で相関識別ではない | 成立。処理区分へ統合可能 | 成立 | 成立。分類情報としての補助に限定 | 成立 | empirical ではなく分類統合、MERGE 候補 |
| `adf_parent` | 成立。delegation ID と親工程から導出 | 成立。雛形存在 pin を関係検査へ変更可能 | 成立 | 成立。delegation ID で保持 | 成立 | structural、DELETE 候補 |
| `adf_child` | 成立。delegation ID と完全同値 | 成立。同値 key の pin を統合検査へ変更可能 | 成立 | 成立。delegation ID で保持 | 成立 | structural、MERGE 候補 |

### 4.1 判定根拠の補足

- `adf_case`: Standard flow では Issue 番号と同値である。Epic flow の子 Issue では本文の `Parent: #N`、PR では `Refs: #N` から対象を遡れる。直接 join の便益が高いため、完全削除ではなく、canonical relation を利用する NARROW 候補とした。
- `adf_execution_unit`: Issue では番号が自己参照であり、PR では対象 Issue の Refs と結び付く。`epic:` と `standard:` の区別は現行 template と Parent 関係で代替できる可能性があるが、OU-005 で実際の導出規則を確定する。
- `adf_phase`: Issue template の値は `case-open` 固定であり、記録先と template 種別から判別できる。現行契約テストの pin はあるが、テストを相関成立の検査へ変更できるため、削除候補とした。
- `adf_upstream_confirmed`: 前工程の確定事項を示す handoff 情報であり、REQ-048-001 の相関要素ではない。structured handoff の `resolved_context`、`canonical_references` と既存 REQ 参照の評価対象へ帰属を戻す。
- `adf_pr`: PR 自身の番号を本文に書く自己参照である。作成後埋め戻しの追加 write は `harness-delegation.md` L51-52 と Wave 1 Report L120 に記録されている。
- `adf_result`: PR 作成時点の値は `completed-pr` に固定される。blocked、failed、delegation-unavailable は PR を成果物とせず、Issue comment が SSoT である。したがって result 4状態契約を廃止するのではなく、PR 本文の定数 field を削除する候補とした。
- `adf_delegation`: delegation sequence を含む委譲と PR の対応付けは、成果物関係だけでは再構成できない。PR 本文の転記を維持する必要がある。
- `adf_delegation_id`、`adf_parent`、`adf_child`: `adf_delegation_id` は発行型であり、`adf_child` は同値、`adf_parent` は現行 adapter の親工程と Issue 番号から導出できる。AG-006 の `adf_child` 疑いは成立する。

## 5. AG-006 疑いリストの検証結果

| 疑い対象 | 検証結果 | decision 候補 | 根拠 |
|---|---|---|---|
| `adf_pr` | 成立。PR API 番号との自己参照であり、作成後埋め戻しが必要 | DELETE | `pr_desc.md` L25、`harness-delegation.md` L51-52 |
| `adf_result` | 成立。PR 生成経路では `completed-pr` 固定 | DELETE | `pr_desc.md` L28、execution_ident L84-89、L275-283 |
| `adf_child` | 成立。`adf_delegation_id` と同値 | MERGE | `harness-delegation.md` L151、L154、雛形 L101、L104 |
| `adf_phase` | 成立。Issue template では `case-open` 固定で artifact type から導出可能 | DELETE | issue template 4本の実行識別情報 section、Wave 1 Report L112-115 |
| `adf_upstream_confirmed` | 成立。相関ではなく context handoff 情報 | DELETE | workflow-contracts L355-371、REQ-048-001、003-005 |
| `adf_case` | 導出可能な範囲を確認。直接 join の便益が残る | NARROW | Issue 番号、Parent、Refs の既存関係 |
| `adf_execution_unit` | 自己参照部分は導出可能。flow 種別の代替導出は OU-005 で確認 | NARROW | epic-wave-model に接続する現行形式、execution_ident L91-96 |

AG-006 の疑いは、契約の縮小実施を意味しない。ここで記録したのは、既存契約から導出できるか、または相関 field として必要かの判定である。実施時には後述の契約テスト、template、Design 宣言の同時更新が必要になる。

## 6. decision 集約

| decision | field | 判断 |
|---|---|---|
| KEEP | `adf_delegation` | 再委譲 sequence を含む委譲と PR の相関を保持する。 |
| KEEP | `adf_delegation_id` | case-run 発行の導出不能な委譲 identity である。 |
| KEEP | `adf_harness_ref` | 必須化しない任意付加情報として、observability gap の分析入口を残す。 |
| NARROW | `adf_case` | Parent / Refs からの導出へ寄せる。ただし直接 join の便益を確認する。 |
| NARROW | `adf_execution_unit` | 自己参照を縮小し、flow 判別の canonical relation 置換を確認する。 |
| MERGE | `adf_child` | `adf_delegation_id` と同値のため統合する。 |
| MERGE | `adf_delegation_purpose` | REQ-048-010 の処理区分評価へ統合する。 |
| DELETE | `adf_phase` | `case-open` 固定の定数である。 |
| DELETE | `adf_upstream_confirmed` | 相関 field ではなく handoff 情報である。 |
| DELETE | `adf_pr` | PR API 番号との自己参照である。 |
| DELETE | `adf_result` | PR の存在から `completed-pr` を導出できる。 |
| DELETE | `adf_parent` | delegation ID と親工程から導出できる。 |

DOWNGRADE 候補はない。本監査の対象 field に hard control を構成するものはなく、DOWNGRADE ではなく導出、統合、相関 field からの除外で整理できる。`adf_harness_ref` は既に任意扱いであり、これ以上の downgrade は不要である。

### 6.1 structural redundancy と empirical redundancy

| 区分 | field | 扱い |
|---|---|---|
| structural redundancy | `adf_phase`、`adf_pr`、`adf_result`、`adf_parent`、`adf_child` | 成果物関係、固定値、同値から導出可能。性能実験を待たず縮小候補とする。 |
| structural、相関 field から除外 | `adf_upstream_confirmed` | 相関ではなく handoff 情報。既存 canonical reference との重複を解消する。 |
| structural、置換経路確認付き | `adf_case`、`adf_execution_unit` | 導出可能性はあるが、直接 join と flow 判別の便益を OU-005 で確認する。 |
| 導出不能 | `adf_delegation`、`adf_delegation_id` | 発行 sequence または委譲と PR の関係を保持するため KEEP 候補とする。 |
| 任意付加 | `adf_harness_ref` | 必須契約にせず、取得時だけ記録する。 |
| empirical redundancy | 該当なし | 本監査では品質便益の重複を実測していない。 |

## 7. OU-005 への引き渡し事項

1. `adf_phase`、`adf_pr`、`adf_result` を削除する場合、`execution_ident_contract.test.ts` の ISSUE / PR correlation key 検査を、field の存在確認から Issue、PR、結果の canonical relation 確認へ変更する。
2. `adf_result` の削除判断を実施する場合、`agentdev-workflow-templates` SKILL.md L123 の「PR 単位の実行結果は adf_result が正」という参照も同一変更で更新する。result 4状態自体は維持する。
3. `adf_child` の MERGE と `adf_parent` の DELETE を実施する場合、`harness-delegation.md` L100-105、L149-158 と execution_ident の L243-259 を同時に更新する。
4. `adf_case`、`adf_execution_unit` を NARROW する場合、Parent 行、Refs 行、Issue 番号、Epic / Standard 関係を canonical derivation とする規則を明示し、相関 capability の回帰を検査する。
5. `workflow-contracts.md` L387-391 の現行 baseline 宣言は、field 実施変更の一部として更新する。これは本 Issue の対象外であり、OU-005 の変更契約で扱う。
6. `adf_delegation` と `adf_delegation_id` は、再委譲 sequence を含む委譲相関のため維持する。`adf_harness_ref` は取得不能でも workflow を停止しない任意扱いを維持する。

## 8. 検証記録

### 8.1 TS-004A table 読み戻し検証

Report 保存後に本ファイルを読み戻し、次を確認する。

| 確認項目 | 結果 | 証拠 |
|---|---|---|
| Issue 本文が列挙した adf_* 8 key の網羅 | 合格 | 本 Report §2.1、§3 に8行 |
| delegation-ident 4 key の網羅 | 合格 | 本 Report §3 に `adf_delegation_id`、`adf_delegation_purpose`、`adf_parent`、`adf_child` の4行 |
| derivability table の10分析列 | 合格 | 本 Report §3 の表ヘッダー。field 軸を除き10列 |
| 全 field の縮小5条件判定 | 合格 | 本 Report §4 の12行。各行に条件1から5の判定 |
| 全 field の判定根拠 | 合格 | 本 Report §4.1、§5、§6 |
| decision の記録 | 合格 | 本 Report §3 の decision 列、§6 の集約表 |
| 縮小を実施していないこと | 合格 | 本 Report「本 Report の位置づけ」、Issue #2601 の対象外規定 |

### 8.2 既存契約テストの確認

Wave 3 で再構成された2本を main repository で読み取り実行した。worktree 外のテスト実体は Wave 1 Report L64、L201 に記録された junction 未伝播の環境制約により、worktree からは起動できない。

| 実行工程 | 検証種別 | 検証結果 | 新規 | 修正済み | 既出 | 撤回 | 無効 |
|---|---|---|---|---|---|---|---|
| case-run | 既存契約テスト2本の回帰 | 68 pass、0 fail。`execution_ident_contract.test.ts` が adf_* と delegation-ident の明示値依存を検査し、`verification_diff_contract.test.ts` は adf_* に依存しないことを読み取り確認 | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |
| case-run | TS-004A table 読み戻し | 本 Report の全12 field、10分析列、縮小5条件、decision を確認 | 該当なし | 該当なし | 該当なし | 該当なし | 該当なし |

実行コマンドは次のとおりである。

```text
bun test ./.opencode/skills/repo-agentdev-integrity/scripts/execution_ident_contract.test.ts ./.opencode/skills/repo-agentdev-integrity/scripts/verification_diff_contract.test.ts
```

実行結果は `68 pass`、`0 fail`、707 expect、2 files であった。`execution_ident_contract.test.ts` の依存は、ISSUE_CORRELATION_KEYS（L58-62）、PR_CORRELATION_KEYS（L64-70）、任意 `adf_harness_ref`（L208-227）、delegation-ident の4 key（L243-284）である。`verification_diff_contract.test.ts` は adf_* field を参照しない。

## 9. 残存リスク

- 本 Report は既存契約の導出可能性を記録したもので、field の削除後に実行される実データ分析の相関成立までは検証していない。
- `adf_case` と `adf_execution_unit` は canonical relation へ置換できる見込みがある一方、直接 join と flow 判別の便益を失う可能性がある。OU-005 で実データまたは guardrail を用いて確認する。
- `adf_result` の削除は、PR の存在と Issue comment の result SSoT の役割分担を同時に維持する必要がある。
- 契約テスト2本は main repository の untracked 実体であり、本 worktree の変更対象ではない。OU-005 の実施時には、対象実体と source / projection の所在を再確認する必要がある。
