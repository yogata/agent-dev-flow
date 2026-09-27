# inspect-docs finding 20260927T135638Z（promoted）

- **採用日**: 2026-09-27
- **ソース**: inspect-docs run 20260927T135638Z（`.agentdev/inspect/inbox/inspect-docs-finding-20260927T135638Z.md`）
- **承認**: backlog-auto stage 2 inspect-promote HITL + adversarial-review 収束
- **採用**: 18件（RQ-18, RQ-19, DS-05, DS-06, DS-07, DS-08, DS-09, DS-10, DS-11, DS-12, DS-14, DS-15, DC-08, DC-09, DC-11, GD-04, GD-05, DB-03）
- **残置**: defer 5件（RQ-17, RQ-20, DS-13, DC-10, RM-01）は inbox 側に残置（再評価条件付記）
- **備考**: 各事項は原 finding からの verbatim 転記に、adversarial-review 確定の拡張注記（DC-08 / DC-11 / DS-15 / GD-04）を追記したものである

## 検出事項（採用 18件）

### REQ 体系（2件）

#### RQ-18: REQ-092 全体が「文書整備」という反映作業を主文意とし、呼出側規律の正規所有宣言を欠く
- **category**: MOVE／RETIRE（作業完了後の陳腐化予備）
- **target**: docs/requirements/REQ-092.md:3（タイトル）, :10（目的）, :24（REQ-092-003）
- **evidence**: タイトル「〜の文書整備」、目的「呼出側規律を運用文書へ明記する」、REQ-092-003「運用文書が…contingency 補完手順を参照可能な形で保持すること」。文書整備完了後の恒久契約は「issue_list 呼出側規律の正」だが、REQ-011-033（tool 側 search 推送契約）との両面規律としての棲み分け・所有宣言が本文にない（REQ-093.md:12 は REQ-092 との区別を宣言するが、REQ-092 自身は REQ-011 との関係を対象外欄の「現行契約を維持」にのみ寄せる）
- **severity**: medium / **confidence**: medium
- **source_of_truth**: REQ-011-033（tool 側契約の正。呼出側規律の帰属先は REQ-011 拡張か REQ-092 再定義か未確定）
- **recommended_route**: req-define（REQ-092 を呼出側規律の正として再定義し、REQ-011 との所有境界を相互参照で明記）
- **ng_classification**: pre-existing
- **notes**: F-23（defer、REQ-092-003 の実装詳細参照）と対象行が重なるが指摘軸が異なる（実装詳細 vs 反映作業・所有宣言欠如）

#### RQ-19: REQ-091 対象欄の「REQ-050-009 への追記」指示が反映済みで陳腐化
- **category**: DRIFT（完了済み作業指示の残置）
- **target**: docs/requirements/REQ-091.md:31, :34（対象欄）
- **evidence**: 「REQ-050-009 の内部配置列挙への追記」— 実確認では REQ-050-009（REQ-050.md:29）は既に「self-hosting 環境向けの実行環境ブリッジ道具は scripts/self/ 配下」へ反映済み。「新規配置」表現も実現後の状態
- **severity**: medium / **confidence**: medium
- **source_of_truth**: REQ-050-009（反映済み現行契約）
- **recommended_route**: intake（対象欄から反映済み指示を除去し「scripts/self/supervisor-bridge/ の正本管理」のみに整理）
- **ng_classification**: pre-existing
- **notes**: 陳腐化の事実確認済み（REQ-050.md 実読）

### Design（10件）

#### DS-05: 存在しない skill `agentdev-doc-writing` を移譲先・診断担い手として現行記述（4ファイル）
- **category**: 実行時依存（存在しない skill の実在前提参照）
- **target**: docs/designs/authoring/vocabulary-registry.md:34、docs/designs/integrity/integrity-rule-catalog.md:124, :139、docs/designs/integrity/rule-ownership.md:184、docs/designs/integrity/rules/IR-051-executor-skill-notation-misrecognition.md:21
- **evidence**: 「IR-045 … `agentdev-doc-writing` スキル配下へ移譲済みである」「doc-writing（v2:REQ-0140-027）が意味的診断を担う」（現在形）。`agentdev-doc-writing` は src/opencode/skills/ と .opencode/skills/ のどちらにも存在しない。現行の実際の担い手は textlint 共通基盤（Plugin 実在確認済み）と agentdev-doc-diagnostics / agentdev-inspect-skills
- **severity**: high / **confidence**: high（不在は機械確定）
- **source_of_truth**: 現行配布実体（src/opencode/skills/ 一覧）> Design 記述
- **recommended_route**: intake（4ファイルの移譲先表記を現行担い手へ更新する design-fix。正典語彙レジストリ .opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md:105 側も実体と不整合のため、あわせて inspect-skills 系整備対象）
- **ng_classification**: pre-existing
- **notes**: 移譲先が存在しないため「IR-019/022/026/036 移管先」の追跡導線が断線している

#### DS-06: req-impact-map.md が監査文書の誤パスを証拠参照
- **category**: 横断契約矛盾（参照残置）
- **target**: docs/designs/responsibilities/req-impact-map.md:145
- **evidence**: 「`docs/designs/integrity/audits/cross-cutting-integration-design-20260811.md`」→ 実ファイルは `docs/reports/integrity/audits/cross-cutting-integration-design-20260811.md`（Report 分離後の現行配置）。backtick 内テキストのため broken-link 機械検査を素通し
- **severity**: medium / **confidence**: high
- **source_of_truth**: 現行配置（docs/reports/、Report 分離規則）
- **recommended_route**: intake（design-fix）
- **ng_classification**: pre-existing

#### DS-07: req-impact-map.md 影響マトリクスの IR 参照陳腐化
- **category**: 横断契約矛盾（旧概念残存・DRIFT）
- **target**: docs/designs/responsibilities/req-impact-map.md:32, :34, :35
- **evidence**: :32「REQ-001 | … IR-001, IR-002, IR-003, IR-004, IR-017, IR-018, IR-022」、:34「IR-001~IR-024 (全件)」、:35「v2:REQ-0107 | IR-013, IR-019」。IR-017/019/022 のルールファイルは実在しない（rules/ 欠番: 011・017・019・022・026・036・045。019/022/026/036 は rule-ownership.md:184 により 2026-08-11 に inspect/diagnostics 層へ移管済み）。「IR-001~IR-024 (全件)」は現行ルール集合（IR-071 まで 65 件）と乖離。:67-69 に IR-063〜066 の行があり更新は部分的
- **severity**: medium / **confidence**: high（実体不在は確定）
- **source_of_truth**: 現行 IR 実体（integrity-rule-catalog / rules/）
- **recommended_route**: intake（移管済み IR の注記または参照削除、「全件」範囲表記の現行化）
- **ng_classification**: pre-existing
- **notes**: DS-05 と連動（移管先が実在しない skill 名のため、移管記録の行き先も追跡不能）

#### DS-08: 機械検出の確定: content-corruption-checker.md の `REQ-0108-194` は許容例未登録の自己言及
- **category**: 廃止 REQ 由来記述残置（許容例運用の自己適用漏れ）
- **target**: docs/designs/integrity/content-corruption-checker.md:137
- **evidence**: 「docs/designs/integrity/rules/IR-069-req-number-gap-recorded.md × stale-reference: 採番例外記録の文脈で旧ナンバリング REQ-0108-194 を歴史的根拠として引用」。check_content_corruption.ts が stale-reference 1件として検出（報告行 131 は簡体字許容例エントリ、字面は :137）。IR-069 側の引用は ALLOWED_USAGE（7エントリ）に登録済みだが、checker Design 自身の字面は `content-corruption-checker.md × stale-reference` という未登録組合せを生む。本 Design の追加運用規則（:139-141）に照らし Case #3166（RA-007）の 7エントリ登録時に自己言及分が漏れた状態
- **severity**: medium / **confidence**: high
- **source_of_truth**: 本 Design 自身の許容例運用規則（Design 節と checker 実装の双方反映が義務）
- **recommended_route**: intake（①許容例一覧へ自己言及エントリ追記 + checker 実装 ALLOWED_USAGE 反映、②または字面の言い換え）
- **ng_classification**: pre-existing
- **notes**: REQ-0108-194 自体は v2 旧ナンバリング帯の歴史的引用として意味内容は正当

#### DS-09: agentdev-doc-diagnostics.md 内部矛盾: Decision 状態乖離の「別要件として追加する（未来）」残置 vs 実装済み観点節
- **category**: 将来計画混入（陳腐化した未来宣言の残置）／横断契約矛盾
- **target**: docs/designs/skills/agentdev-doc-diagnostics.md:127-128
- **evidence**: 「Decision の状態乖離（…）は本観点の対象外とし、… 確定後に別要件として追加する」— 一方で同ファイル :130-151 に「## Decision 状態乖離 DRIFT 診断観点」が現行観点として実装済み。skill reference（diagnostic-categories.md）も Decision drift を現行カテゴリとして位置づける
- **severity**: medium / **confidence**: high
- **source_of_truth**: 後から追加された観点節 + skill reference（現行動作）
- **recommended_route**: intake（:127-128 を現行状態に整合する文へ修正）
- **ng_classification**: pre-existing

#### DS-10: targeted-docs-guard-implementation.md の obsolete-path-map.yaml 配置パス陳腐
- **category**: 横断契約矛盾（参照残置）
- **target**: docs/designs/integrity/targeted-docs-guard-implementation.md:183
- **evidence**: 「`docs/designs/integrity/obsolete-path-map.yaml` による … 対応表の運用」→ 実ファイルは `.opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml`（designs/integrity/ 配下に yaml は存在しない）
- **severity**: medium / **confidence**: high
- **source_of_truth**: 実配置（repo-local data/）
- **recommended_route**: intake（design-fix）
- **ng_classification**: pre-existing

#### DS-11: Design 5 論理区分の正典不在と retired v2 REQ への根拠依存
- **category**: 廃止 REQ 由来記述残置／所有権ギャップ（Design代替の境界事例）
- **target**: docs/designs/commands/req-define.md:129、docs/designs/responsibilities/responsibility-boundary-purification.md:132、docs/designs/responsibilities/document-type-responsibilities.md:122
- **evidence**: 「v2:REQ-0155-009 の5区分（挙動Design、カタログDesign、横断契約Design、パラメータDesign、実装詳細Design）」を分類根拠として引用。5 区分の定義表（各区分の記述対象定義）は現行 corpus に存在しない（document-model.md が持つのは別の 7 分類モデル）。retired v2 REQ が現行分類の実質的な定義根拠になっている
- **severity**: medium / **confidence**: medium
- **source_of_truth**: 現行 REQ（v2:REQ-0155 の後継は REQ-001 系）が正。定義の正典所有が現行成果物にない
- **recommended_route**: req-define（5 区分定義表の正典所有先〔document-model.md 等〕を確定する要件化）
- **ng_classification**: pre-existing
- **notes**: DS-05（vocabulary 系）と同根の v2:REQ-0140/0155 系引継ぎ問題の一部

#### DS-12: Root Case #3011（一時成果物）を「分類の正本」と宣言
- **category**: 実行時依存（正典の寿命違反）＋正典二重宣言
- **target**: docs/designs/skills/agentdev-doc-diagnostics.md:162
- **evidence**: 「分類の正本は Root Case #3011 の分類語彙表であり、本節はその確定値を記録する」— 同一文の冒頭で「正典: DEC-036、foundations/v4-responsibility-boundaries Design」とも宣言。Case は lifetime 有限の成果物であり恒久語彙の正典所有に適さない（v4-durable-state-and-recovery の寿命モデルと不整合）
- **severity**: medium / **confidence**: medium
- **source_of_truth**: 恒久成果物（DEC-036 / v4-responsibility-boundaries）
- **recommended_route**: intake（正典宣言を DEC-036/v4-responsibility-boundaries に一本化、#3011 は根拠参照へ降格）
- **ng_classification**: pre-existing
- **notes**: 他 skill Design の v4 責務分類節に同型宣言がないかは全数未確認（診断担当の不確実性継承）

#### DS-14: custom-tool-contracts.md 移管記録の時制陳腐
- **category**: 将来計画混入（完了済み作業の未完了形記述）
- **target**: docs/designs/responsibilities/custom-tool-contracts.md:121
- **evidence**: 「旧 Skill Design（`docs/designs/skills/agentdev-gh-cli.md`）はこの移管の完了に伴い現行 Design 体系から除去する」→ 当該ファイルは既に物理削除済み。移管は完了しているのに未完了形で記述
- **severity**: low / **confidence**: high（事実）/ low（影響度）
- **source_of_truth**: 現行状態（削除済み）
- **recommended_route**: intake（「除去する」→「除去した」等の表現修正）
- **ng_classification**: pre-existing

#### DS-15: v3-v4-crosswalk.md 集約サマリの件数陳腐（低優先）
- **category**: 横断契約矛盾（DRIFT 的・軽微）
- **target**: docs/designs/foundations/v3-v4-crosswalk.md:50
- **evidence**: 「REQ（現行 53）」「retired 12 件は retired を維持する」→ 現行は REQ 56 件・retired 14 件（retired/ 実計数 14、docs/README 自動集計 56 と一致）。crosswalk（updated 2026-09-19）以降の増分。同ファイルに「件数の正確な値は references/crosswalk-inventory.md を正とする」の免責あり
- **severity**: low / **confidence**: medium
- **source_of_truth**: crosswalk-inventory（正典宣言通り）
- **recommended_route**: intake（低優先。「時点値」明記または inventory 参照への置換）
- **ng_classification**: pre-existing
- **adversarial-review 注記**: 時点値明記 or inventory 参照置換（免責条項ありだが crosswalk 更新のたびに再陳腐化する構造のため恒久解消）。

### Decision（3件）

#### DC-08: docs/README.md 手動散文の Decision 件数が陳腐（DEC-045/046 追加の取り残し）
- **category**: Decision 現行性（README 索引整合）
- **target**: docs/README.md:83
- **evidence**: 「現行 Decision は DEC-001 から DEC-044 の43件である」— 同一ファイルの AUTOGEN 表は DEC-045/DEC-046 を掲載済み。decisions/README.md:12（「承認済み36件」）と各 DEC frontmatter が正。DEC-045/046 追加時に AUTOGEN のみ更新され手動散文が取り残された
- **severity**: high / **confidence**: high
- **source_of_truth**: decisions/README.md AUTOGEN・各 DEC frontmatter
- **recommended_route**: intake（散文更新）
- **ng_classification**: 今回修正対象（DEC-045/046 は 2026-09-26〜27 追加の直近事象）
- **notes**: 手動散文は AUTOGEN 対象外のため機械検査（autogen_freshness）では検出不能
- **adversarial-review 確定（対象範囲拡張）**: docs/README.md:127 の DEC-040 AUTOGEN 行注記「superseded by DEC-044〔決定4 部分置換。決定1〜3は維持〕」も frontmatter supersede_note（「決定2 は DEC-046 が置換」）と乖離しており、decisions/README.md 側 AUTOGEN は反映済みで docs/README.md 側のみ取り残し。同一 RU 対象に含める。

#### DC-09: DEC-040 本文の部分置換注記が DEC-046 による決定2 置換を未反映
- **category**: Decision 現行性（superseded の本文明示不足・新規事例）
- **target**: docs/decisions/DEC-040.md:25-26（本文注記）, :37, :46-47（決定2 本文）
- **evidence**: 本文注記「（SUPERSEDED、2026-09-26 時点）: 本 Decision の決定4 のみ DEC-044 が置換する。決定1〜3 は本 Decision が現行として維持する」。一方 frontmatter（updated 2026-09-27）は「決定2 は DEC-046 が置換」。決定2 本文（Vercel 方針）に置換注記がなく、accepted DEC-046（Cloudflare AI Gateway 置換）と本文を素読すると現行性が矛盾する
- **severity**: high / **confidence**: high
- **source_of_truth**: DEC-046（accepted）+ DEC-040 frontmatter supersede_note
- **recommended_route**: intake（DEC-040 本文注記の更新）
- **ng_classification**: 今回修正対象（DEC-046 追加〔2026-09-27〕に伴う取り残し）
- **notes**: 既知 F-08/F-09/DC-04（superseded Decision の現在形参照）と同型の新規事例。DEC-046 追加日の当日検出

#### DC-11: DEC-043 行の後継注記欠落（DEC-040 行との非対称）
- **category**: Decision 現行性（索引不整合）
- **target**: docs/decisions/README.md:59, :129
- **evidence**: baseline 表・superseded ビューの DEC-040 行は「〔superseded by DEC-044…〕」注記付きだが、DEC-043 行は status「superseded」のみで後継ポインタなし。docs/README.md:130 には「（superseded by DEC-044）」がある
- **severity**: medium / **confidence**: medium
- **source_of_truth**: DEC-043 frontmatter `superseded_by: DEC-044`
- **recommended_route**: intake（注記付与、または注記不要の規約上の判定）
- **ng_classification**: pre-existing
- **notes**: status 列自体は正しく、注記必須かは生成規約の対象ブロック定義次第
- **adversarial-review 確定（修正先明確化）**: 修正先は README 行の手動編集ではなく DEC-043 frontmatter へ supersede_note 追記＋AUTOGEN 再生成（DEC-040 先例整合）。

### guides / README（2件）

#### GD-04: quickstart「廃止コマンドの移行案内」節（移行情報の残置候補）
- **category**: guides 導線超過（履歴汚染・cleanup モデル対象）
- **target**: docs/guides/quickstart.md:30-32
- **evidence**: 「v4（DEC-033）では case-open、…公開 command ではなく内部 lifecycle 段階へ回収された。旧 case-* コマンドに相当する操作は…alias は残さない。」v4 cutover は DEC-034 で確定済みであり、v2/v3 経験者向け移行説明が案内層に残置
- **severity**: medium / **confidence**: medium
- **source_of_truth**: DEC-033（accepted）
- **recommended_route**: intake（cleanup 処置候補 KEEP/MOVE/RETIRE の判定を添えた guide-fix）
- **ng_classification**: pre-existing
- **adversarial-review 確定（要件範囲）**: KEEP/MOVE/RETIRE cleanup 判定を要件に含める（REQ-058 cleanup 契約準拠。v4 cutover DEC-034 確定済みで移行情報の寿命は尽くしている）。

#### GD-05: 移行期言語の残置（軽微）
- **category**: guides 導線超過（履歴汚染・軽微）
- **target**: docs/guides/command-selection.md:70、docs/guides/quickstart.md:39
- **evidence**: 「既存5コマンド…は従来どおり単独実行できる」「引数なし時の drafts 全件処理は従来どおりの対象解決として維持する」—「既存」「従来どおり」は移行時点の対比言語で現行索引の説明として不自然
- **severity**: low / **confidence**: high
- **source_of_truth**: 現行 REQ（REQ-036 系）
- **recommended_route**: intake（guide-fix）
- **ng_classification**: pre-existing

### 配布物整合性（1件）

#### DB-03: 配布物 skill 本文への具体 ID 参照残留（check_distribution_boundary strict failure 16ヒット）
- **category**: 配布物参照境界（REQ-029 具体ID 禁止違反）
- **target**: src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md:16, :51, :53（REQ-030-017）、src/opencode/skills/agentdev-workflow-case-auto/references/input-resolution-and-orchestration.md:149（REQ-030-017, REQ-061-039, REQ-034-025）、src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md:35, :46, :48, :94, :102, :111（REQ-030-017）
- **evidence**: check_distribution_boundary.ts が concrete_id_hits=16, ok=false, exit 1（docs-check 全体 fail 要因）。16件すべて「REQ-030-017 の正規所有は case-open Design〜節であり、本節は〜」という委任参照形式（規範の再掲ではなく導線）だが、機械検査上は具体ID残留。definition-pr-and-idempotency.md:35 は同一ファイル内に「REQ-{NNNN}-{NNN}」プレースホルダ使用と混在。導入は 2026-09-24 commit f6e4f187（Case #3109、PR #3129）
- **severity**: medium / **confidence**: high（機械検出確定）
- **source_of_truth**: REQ-029（配布物参照境界）+ check_distribution_boundary 検査規則
- **recommended_route**: intake（具体IDを「REQ-{NNNN}-{NNN}」形式へ抽象化する配布物修正。参照形式自体は Design への委任宣言として正当なため、表記抽象化で解消可能）
- **ng_classification**: pre-existing（2026-09-24 導入）
- **notes**: check_content_corruption の stale-reference 1件（content-corruption-checker.md:131/137）は DS-08 として Design 側に分割済み

## docs-check route 候補（STEP-3-2・採用分のみ）

- DS-07（req-impact-map IR 参照）: designs 本文の IR-NNN 参照実在チェックは check_integrity の拡張候補（既存 IR-071-integrity-rule-related-req-existence は rules 側 related_req のみ対象）
- DB-03: check_distribution_boundary が既に機械検出済み（本検出は検査器の健全性を確認させる実例）
