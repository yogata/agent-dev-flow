# inspect-docs finding 20260927T135638Z

## サマリ

- スキャン対象: REQ 56件（retired 14件）／ Decision 45件（DEC-018 欠番、accepted 36 / superseded 9）／ Design 177件（draft 0件）／ guides 13件／ README（root・docs・各索引）／ 配布物（src/opencode/commands/agentdev/ 13件 + skills 50系統 + templates、.opencode/ 投影）
- 診断体制: STEP-2 意味診断を 3 診断担当（REQ 体系／Design／Decision・guides・README）へ並列委託し、親が fan-in 統合（REQ 体系担当は初回 Aborted 後の再委託で完了）。STEP-3 配布物整合性検査は親が逐次実行
- 検出件数: 新規 23件（重複排除後）。severity 内訳: high 4件／ medium 14件／ low 5件。既知 defer との重複 8件を除外（GD-02、F-25、RQ-15、F-17、RQ-13、F-23、F-19、DC-07 は KNOWN 節へ増分記載）
- 機械的検査: check_integrity NG 0 / Warning 0（baseline-known Info 126 は管理済み）、command_format / extensions / templates / autogen_freshness / design_frontmatter / knowledge_docs 0 違反、lint_skills WARNING 1件（description aggregate budget、RU-0018 層1 既知）、BOM 0、CRLF/LF 混在 0、**check_distribution_boundary exit 1（concrete_id 16ヒット）**、check_content_corruption 1件（本 finding DB-02 に分類）
- 主要新規テーマ: ①配布物参照境界違反（concrete-id 16件、pre-existing）②存在しない `agentdev-doc-writing` スキルの移譲先記述（4ファイル）③DEC-045/046 追加に伴う docs 意味鮮度の取り残し（docs/README 散文・DEC-040 本文注記）④req-impact-map の監査パス・IR 参照陳腐化

## 検出事項リスト（新規）

### REQ 体系（4件）

#### RQ-17: REQ-090-004 に Case 固有の作業指示が恒久要件行へ残留
- **category**: MOVE（反映作業そのものの要件行化）／DRIFT
- **target**: docs/requirements/REQ-090.md:19（REQ-090-004）、:55（対象外欄）
- **evidence**: 「適用対象19件と適用可否を本 Case 内で確定する3件の判断結論を該当 Workflow の reference へ文書化すること」「課金開始後の実験継続条件の判断（本 Case の失敗条件としない）」—「本 Case 内で」「本 Case の失敗条件」は一時 Case 指示であり、6観点 MOVE シグナル(a)「REQ行が変更後仕様ではなく反映作業そのもの」に該当
- **severity**: medium / **confidence**: medium
- **source_of_truth**: REQ-090-006/013（field 名等は実装設計の自由度と宣言する自己境界設定）
- **recommended_route**: intake（Stage 1 完了後の行の恒久化判断を req-define 壁打ち候補として）
- **ng_classification**: pre-existing
- **notes**: Stage 1（Issue A）進行中の意図的暫定記述の可能性が残る。RQ-15（defer、REQ-090-011）と同ファイルの別行

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

#### RQ-20: retired/ 内 14件の status 値が retired / migrated で混在し使い分け基準が未文書化
- **category**: RETIRE（廃止側メタデータの不統一）
- **target**: docs/requirements/retired/（status: retired = REQ-020/033/040/042/043、status: migrated = REQ-013/016/022/023/024/025/026/028/057）
- **evidence**: retired/REQ-020.md:4 は「status: retired」ながら :11「後継: REQ-012」と移行先明示。retired/REQ-013.md:6 は「status: migrated」で同様に後継明示。後継の有無と status 値が対応しない。retired/README は不在
- **severity**: low / **confidence**: medium
- **source_of_truth**: requirements/README.md 廃止表（実体配置が正。status 値の意味規定は不在）
- **recommended_route**: intake（status 値の統一、または 2 値の意味を requirements/README.md 基準構造節に 1 行定義）
- **ng_classification**: pre-existing
- **notes**: 機能影響なしの表記揺れ。非文書化慣行の可能性あり

### Design（11件）

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

#### DS-13: Design インデックスの references/ 独立行が自規則と不整合
- **category**: 分類政策（索引登録規則の不整合）
- **target**: docs/designs/README.md（foundations/ 表・workflows/ 表）
- **evidence**: 登録手順節は「`references/` サブディレクトリの Design … は親 Design 行の備考欄で言及し、独立行としては登録しない」と規定。しかし foundations/ 表に `foundations/references/concrete-abstraction.md` の独立行、workflows/ 表に `workflows/references/execution-unit-construction.md` の独立行が存在。同規則を守っている行もある（v3-v4-crosswalk 行、perspective-registry 等）
- **severity**: medium / **confidence**: medium
- **source_of_truth**: インデックス自体の規則文（機械検査は未登録ファイル検出のみで独立行の可否は見ない）
- **recommended_route**: intake（2 行の親行への統合、または規則文に経過措置を明記）
- **ng_classification**: pre-existing
- **notes**: Wave 3 再構築以前の行の祖父条項の可能性

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

### Decision（4件）

#### DC-08: docs/README.md 手動散文の Decision 件数が陳腐（DEC-045/046 追加の取り残し）
- **category**: Decision 現行性（README 索引整合）
- **target**: docs/README.md:83
- **evidence**: 「現行 Decision は DEC-001 から DEC-044 の43件である」— 同一ファイルの AUTOGEN 表は DEC-045/DEC-046 を掲載済み。decisions/README.md:12（「承認済み36件」）と各 DEC frontmatter が正。DEC-045/046 追加時に AUTOGEN のみ更新され手動散文が取り残された
- **severity**: high / **confidence**: high
- **source_of_truth**: decisions/README.md AUTOGEN・各 DEC frontmatter
- **recommended_route**: intake（散文更新）
- **ng_classification**: 今回修正対象（DEC-045/046 は 2026-09-26〜27 追加の直近事象）
- **notes**: 手動散文は AUTOGEN 対象外のため機械検査（autogen_freshness）では検出不能

#### DC-09: DEC-040 本文の部分置換注記が DEC-046 による決定2 置換を未反映
- **category**: Decision 現行性（superseded の本文明示不足・新規事例）
- **target**: docs/decisions/DEC-040.md:25-26（本文注記）, :37, :46-47（決定2 本文）
- **evidence**: 本文注記「（SUPERSEDED、2026-09-26 時点）: 本 Decision の決定4 のみ DEC-044 が置換する。決定1〜3 は本 Decision が現行として維持する」。一方 frontmatter（updated 2026-09-27）は「決定2 は DEC-046 が置換」。決定2 本文（Vercel 方針）に置換注記がなく、accepted DEC-046（Cloudflare AI Gateway 置換）と本文を素読すると現行性が矛盾する
- **severity**: high / **confidence**: high
- **source_of_truth**: DEC-046（accepted）+ DEC-040 frontmatter supersede_note
- **recommended_route**: intake（DEC-040 本文注記の更新）
- **ng_classification**: 今回修正対象（DEC-046 追加〔2026-09-27〕に伴う取り残し）
- **notes**: 既知 F-08/F-09/DC-04（superseded Decision の現在形参照）と同型の新規事例。DEC-046 追加日の当日検出

#### DC-10: Decision Map に DEC-044→DEC-043/040・DEC-046→DEC-040 の後継行が欠落（DC-07 増分）
- **category**: Decision 現行性（索引不整合・既知 DC-07 の増分事実）
- **target**: docs/decisions/README.md:176-211（手動管理の Decision Map）
- **evidence**: Map は DEC-006 supersedes DEC-005 等の現行間 supersedes を掲載するが、DEC-044→DEC-043（全体置換）・DEC-044→DEC-040（決定4 部分置換）・DEC-046→DEC-040（決定2 置換）の行がない。project-docs-and-specs.md:37 は「後継関係は Decision Map を参照」と案内。DC-07（20260926 defer「Decision Map が v4 期の frontmatter relations を大部分未反映」）の継続・増分（DEC-046 追加で欠落が拡大）
- **severity**: medium / **confidence**: medium
- **source_of_truth**: 各 DEC frontmatter（superseded_by / supersede_note）
- **recommended_route**: DC-07 の defer 継続（本件は DC-07 の増分事実として次回 inspect-promote で同時再評価）
- **ng_classification**: pre-existing（DEC-044 分）/ 今回修正対象（DEC-046 分）
- **notes**: 新規独立検出とせず DC-07 との関連を明示

#### DC-11: DEC-043 行の後継注記欠落（DEC-040 行との非対称）
- **category**: Decision 現行性（索引不整合）
- **target**: docs/decisions/README.md:59, :129
- **evidence**: baseline 表・superseded ビューの DEC-040 行は「〔superseded by DEC-044…〕」注記付きだが、DEC-043 行は status「superseded」のみで後継ポインタなし。docs/README.md:130 には「（superseded by DEC-044）」がある
- **severity**: medium / **confidence**: medium
- **source_of_truth**: DEC-043 frontmatter `superseded_by: DEC-044`
- **recommended_route**: intake（注記付与、または注記不要の規約上の判定）
- **ng_classification**: pre-existing
- **notes**: status 列自体は正しく、注記必須かは生成規約の対象ブロック定義次第

### guides / README（3件）

#### GD-04: quickstart「廃止コマンドの移行案内」節（移行情報の残置候補）
- **category**: guides 導線超過（履歴汚染・cleanup モデル対象）
- **target**: docs/guides/quickstart.md:30-32
- **evidence**: 「v4（DEC-033）では case-open、…公開 command ではなく内部 lifecycle 段階へ回収された。旧 case-* コマンドに相当する操作は…alias は残さない。」v4 cutover は DEC-034 で確定済みであり、v2/v3 経験者向け移行説明が案内層に残置
- **severity**: medium / **confidence**: medium
- **source_of_truth**: DEC-033（accepted）
- **recommended_route**: intake（cleanup 処置候補 KEEP/MOVE/RETIRE の判定を添えた guide-fix）
- **ng_classification**: pre-existing

#### GD-05: 移行期言語の残置（軽微）
- **category**: guides 導線超過（履歴汚染・軽微）
- **target**: docs/guides/command-selection.md:70、docs/guides/quickstart.md:39
- **evidence**: 「既存5コマンド…は従来どおり単独実行できる」「引数なし時の drafts 全件処理は従来どおりの対象解決として維持する」—「既存」「従来どおり」は移行時点の対比言語で現行索引の説明として不自然
- **severity**: low / **confidence**: high
- **source_of_truth**: 現行 REQ（REQ-036 系）
- **recommended_route**: intake（guide-fix）
- **ng_classification**: pre-existing

#### RM-01: root README「最小クイックスタート」の動作説明詳細
- **category**: README 索引過多
- **target**: README.md:15-17
- **evidence**: case-auto 内部 lifecycle の駆動・「Definition の保存・確定と実行構造の確定もその内部責務として実行する」・例外経路（case-revise → case-ready）解決の動作説明。REQ-034/REQ-062 契約の再掲であり、索引・クイックスタートとしては詳細。全 34 行中 3 行で程度は軽微
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-034 / REQ-062
- **recommended_route**: intake（quickstart.md への集約とリンク化を検討）
- **ng_classification**: pre-existing
- **notes**: 入口要約として許容範囲の可能性あり

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

## KNOWN（継続確認・既知 defer への増分情報）

- **GD-02（20260926 defer）への増分**: intake-learning-backlog-flow.md:139「状態モデルの共通制約の正は [成果物、状態モデル] を参照する」が guides 層の相互権威主張（artifacts-and-state.md を「正」指定）をさらに強化する参照元として確認された。GD-02 の再評価時に参照元リストへ追加されるべき
- **RQ-13（20260926 defer「説明なき行欠番の集約」）への増分事例**: REQ-003-025/027（REQ-003.md:44-46 の 024→026→028 間欠、REQ-082 分離移動とは別理由で説明なし）、REQ-090-008（REQ-090.md:22-23 の 007→009）。RQ-13 の集約対象として次回再評価に含めるべき
- **継続確認の既知 defer（本サイクルで新規検出なし・再指摘なし）**: RQ-04, RQ-08, RQ-09, RQ-14, RQ-15, RQ-16, DS-03, DC-02, DC-04, DC-06, DC-07, GD-02, GD-03（20260926）、F-04〜F-25 系（20260925）、F-10/F-12（20260901）、F-04/F-05/GUIDE-6（20260914）

## docs-check route 候補（STEP-3-2）

- RQ-20（retired status 値の混在）: retired/*.md の status 値域チェック（2値許容の明確化後、値域外検出）は docs-check 機械検査候補
- DS-07（req-impact-map IR 参照）: designs 本文の IR-NNN 参照実在チェックは check_integrity の拡張候補（既存 IR-071-integrity-rule-related-req-existence は rules 側 related_req のみ対象）
- DB-03: check_distribution_boundary が既に機械検出済み（本検出は検査器の健全性を確認させる実例）
