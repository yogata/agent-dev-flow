# inspect-docs finding 20260901T120043Z

> backlog-auto（/agentdev/backlog-auto、started_at 2026-09-01 20:37:17 JST）の stage 1 として実施。
> スキャン対象: docs/requirements（47現行+9 retired）、docs/decisions（25件）、docs/designs、docs/guides（11件）、README.md、README-INSTALL.md、配布物（src/opencode/commands 20件、templates 27件、skills 51件、references 163件）。
> 判定基準: source-of-truth priority（現行 REQ > 承認済み ADR > Design > guides）、document-model 分離基準、docs-spec-rebuild-integrity 検査パターン。
> 分類（false positive / pre-existing / 今回修正対象）は未確定。inspect-promote での分類対象。

## REQ 構造系

### F-01: REQ-001-067/068/069/079 は REQ-001 に一度も存在したことがない行（最重要）
- **category**: 参照ID整合性（dangling 行参照・採番欠落）
- **target**: docs/requirements/REQ-001.md（要件テーブルは REQ-001-001〜066）。参照元: docs/designs/foundations/document-model.md:90,114、docs/designs/quality/req-health-metrics.md:165,171,173、docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md:22,70,77,129-132、docs/designs/integrity/rule-ownership.md、docs/designs/integrity/integrity-contracts.md、docs/designs/commands/req-define.md:532、docs/designs/skills/agentdev-req-analysis.md、docs/designs/responsibilities/document-type-responsibilities.md、docs/designs/responsibilities/responsibility-boundary-purification.md、docs/designs/workflows/backlog-artifact-lifecycle.md ほか
- **evidence**: req-health-metrics.md L146「document-model.md Design 分離基準（REQ-001-068）: …判定本体は document-model.md に従う」／document-model.md L90 注記 `<!-- REQ-001-068 -->`。`git log -S "REQ-001-068" -- docs/requirements/REQ-001.md` が空＝過去にも未存在。REQ-001-067（REQ/Design 文書種別境界）、068（Design 分離基準）、069（安定契約例外）、079（ステークホルダー基準）は IR-044 と REQ 横断診断の判定本体を正当化する行番号
- **severity**: high / **confidence**: high
- **source_of_truth**: 現行 REQ > Design。Design 群の判定基準チェーンが存在しない REQ 行を正規所有行として依存（REQ-001-009 要件行の一意採番に照らし無効番号）
- **recommended_route**: docs-check 候補（行実在性）＋ 意味診断検出事項（067〜079 の採番意図・正規所有の確定に意味判断を要する）

### F-02: REQ-006 分割完了後の旧行番号参照が designs/decisions に大量残存（48ファイル・影響 REQ 8件）
- **category**: 参照ID整合性（dangling 行参照・移管先参照更新漏れ）
- **target**: 宣言元 docs/requirements/REQ-006.md:20-21。参照残存: docs/designs/commands/case-auto.md:58,123,125,145,237,458,465-490 ほか大量、docs/designs/commands/case-open.md:70,102,333、docs/designs/workflows/capture-boundaries.md:63,92,100、docs/designs/workflows/delegation-contracts.md:248,251,261,268、docs/designs/workflows/workflow-contracts.md、docs/designs/skills/agentdev-issue-management.md、docs/designs/skills/agentdev-epic-tracker.md、docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md、docs/decisions/DEC-008.md:23,24,25,36,40,47
- **evidence**: REQ-006.md L20-21「要件行 ID は移動先で再採番された。分割は完了済みであり、**旧要件行番号への参照は現行文書では使用しない**」。現行 REQ-006 要件行は REQ-006-105〜109/111 の6行のみ。case-auto.md L125「結果状態の4次元集約（REQ-006-110）」等が継続参照。移管先は判明済み: REQ-006-110→REQ-034-031、REQ-006-112/113/114→REQ-034-032/033/034
- **severity**: high / **confidence**: high
- **source_of_truth**: REQ-001-014（現行文書の本文は再編工程固有の識別子を含まない）に designs/decisions 側が違反。accepted Decision の DEC-008 も無効番号を現行契約として参照
- **recommended_route**: docs-check 候補（dangling 行参照の一括検出・移管先への参照更新）

### F-03: REQ-004 旧番号（056〜088）参照残存（REQ-004 は 001〜054 の連番完備）
- **category**: 参照ID整合性
- **target**: docs/designs/commands/req-define.md:60,70,114,138,152、docs/designs/commands/req-save.md:121、docs/designs/commands/backlog-review.md:140、docs/designs/commands/intake-promote.md:41、docs/designs/commands/learning-promote.md:45、docs/designs/skills/agentdev-workflow-lifecycle.md:28、docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md:77（是正済み履歴記述を除く）
- **evidence**: backlog-review.md L140「req-define が最終確定する（REQ-004-087）」。REQ-004.md 現行テーブルは REQ-004-001〜054
- **severity**: medium / **confidence**: high
- **source_of_truth**: 参照先が REQ-004 に存在しない（再編時の参照更新漏れ、無注記の現行根拠参照）
- **recommended_route**: docs-check 候補

### F-04: REQ-005 旧番号（034/041/042/048/049）参照残存（REQ-005 は 001〜028 の連番完備）
- **category**: 参照ID整合性
- **target**: docs/designs/workflows/workflow-contracts.md:35、docs/designs/commands/case-open.md:70,102,333、docs/designs/foundations/design-principles.md:31
- **evidence**: workflow-contracts.md L35 は「公開コマンド5分類」の正規根拠として REQ-005-048 を引用。5分類の現行所有は REQ-001-053〜055 へ移管済みと解釈されるが参照未更新
- **severity**: medium / **confidence**: high
- **source_of_truth**: 安定契約（公開コマンド分類）の正規所有行が REQ-005 内に実在しない
- **recommended_route**: docs-check 候補

### F-05: REQ-002-022 / REQ-002-163（存在しない行）への現行根拠参照
- **category**: 参照ID整合性
- **target**: docs/requirements/REQ-027.md:37、docs/decisions/DEC-011.md:23、docs/designs/foundations/design-principles.md:164
- **evidence**: integrity-rule-catalog.md:75 に「従来 REQ-002-021..026、032 に紐づいていた配布物参照境界の検出脈絡は MOVE 先（REQ-029-001..008）へ集約」の移管記録あり。参照側は旧番号のまま
- **severity**: medium / **confidence**: high
- **source_of_truth**: MOVE 履歴は catalog 記録済みだが参照側（REQ-027、accepted の DEC-011、design-principles）が未更新
- **recommended_route**: docs-check 候補（DEC-011 は accepted Decision の非意味修正手順の適用対象）

### F-06: fafeb497 で削除済みの REQ-001-029/036/037 参照残存
- **category**: 参照ID整合性
- **target**: docs/designs/foundations/design-principles.md:121、docs/designs/foundations/document-model.md:47、docs/designs/workflows/workflow-contracts.md、docs/designs/responsibilities/artifact-contracts.md、docs/designs/skills/agentdev-artifact-validation.md
- **evidence**: git コミット fafeb497「…REQ-001-029/036/037 削除」。design-principles L121「決定的処理…を Script へ委譲する（REQ-001-029）」。現行所有は REQ-002-035（決定論的処理分離）と解釈されるが未更新
- **severity**: medium / **confidence**: high
- **source_of_truth**: 削除済み行への無注記参照
- **recommended_route**: docs-check 候補

### F-07: document-model.md の REQ-001-044/045 参照が現行行内容と意味不一致（dangling 検出をすり抜ける DRIFT）
- **category**: DRIFT（参照先実在・意味不一致）
- **target**: docs/designs/foundations/document-model.md:313-314 対 docs/requirements/REQ-001.md:57
- **evidence**: document-model.md L313「承認済み Decision の決定内容を意味変更してはならない（REQ-001-045）」— この内容の現行所有は REQ-001-056。L314 の REQ-001-044 参照内容と現行 REQ-001-044（要件文書の健全性の定量化）は別主題。REQ-001-045 は現行 REQ-001 に存在しない
- **severity**: high / **confidence**: high
- **source_of_truth**: Design が正規所有行を旧採番のまま参照し、現行では別内容の行が同番号を占有。誤った根拠付与リスクが最も高い形態
- **recommended_route**: 意味診断検出事項（参照先を REQ-001-056 等へ訂正）

### F-08: REQ-003 に委譲境界と対論型レビュー振る舞い契約が混在（SPLIT 候補）
- **category**: SPLIT
- **target**: docs/requirements/REQ-003.md:52-73（REQ-003-035〜054 の25行）対 同 :10-12（目的節）
- **evidence**: REQ-014.md L14/L34 が「adversarial-review 自身の振る舞い契約は REQ-003-035〜040 が所有する」と宣言。req-health-metrics 閾値適用: 要件行数 56（+1）＋関心分類 2（+1）＝シグナル 2＝「SPLIT 検討」。目的節は対論型レビューに言及なし
- **severity**: low / **confidence**: medium
- **source_of_truth**: req-health-metrics「関心分類」シグナル。対論型レビュー契約は委譲境界 REQ の関心対象の総体として説明できない
- **recommended_route**: 意味診断検出事項

### F-09: adversarial-review の default-on と再起票禁止が REQ-014/REQ-015/REQ-003 に二重規定
- **category**: DUPLICATE
- **target**: docs/requirements/REQ-014.md:32（REQ-014-013）対 docs/requirements/REQ-015.md:25（REQ-015-002）。docs/requirements/REQ-003.md:71（REQ-003-054）対 docs/requirements/REQ-014.md:26（REQ-014-007）
- **evidence**: REQ-003-054 が自ら「（REQ-014-007 と整合）」と相互参照を要する状態。REQ-014-015 は「単一所有」を宣言するが実態は同一規範が REQ-003 と REQ-014 に分散
- **severity**: low / **confidence**: medium
- **source_of_truth**: 3 REQ に同系規範が分散し同期コストが発生（document-model 6処置の REFERENCE/MERGE 対象）
- **recommended_route**: 意味診断検出事項

### F-10: 検証実行結果を TIM に保存しない規範が REQ-012/REQ-021 に二重規定（軽度）
- **category**: DUPLICATE
- **target**: docs/requirements/REQ-012.md:29（REQ-012-035）対 docs/requirements/REQ-021.md:26（REQ-021-019）
- **evidence**: 同一規範が表現違いで並存。両ファイルの責務分担構造（TIM 定義＝012／工程割当＝021）自体は妥当
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-001-006（索引は本文を重複保持しない）の精神に基づく重複縮約候補。相互参照で緩和済み
- **recommended_route**: 意味診断検出事項

### F-11: REQ-016 は一回きりの統合検証を恒久 REQ 化した「移行完了状態」（RETIRE 候補）
- **category**: RETIRE
- **target**: docs/requirements/REQ-016.md:18-27（REQ-016-001〜010）
- **evidence**: REQ-016-001〜006 が全て「7呼出元と case-auto 停止伝播の統合後、…」等の完了時点検証条件。REQ-016-008/009 は是正手順（作業手段）
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-001-052 廃止候補類型「移行完了状態」に該当。REQ-046 と同型の成立経緯だが検証工程の性質が強い
- **recommended_route**: 意味診断検出事項

### F-12: REQ-008-059 が要件テーブル外の見出しセクションとして定義され、内部アルゴリズム詳細を含む
- **category**: MOVE／分類一貫性
- **target**: docs/requirements/REQ-008.md:77-85。参照元 docs/designs/commands/req-define.md:381
- **evidence**: 要件テーブル（L18-75、REQ-008-001〜058）の外に独立見出しセクション。本文に決定的マーカー検査の fixture 文字列列挙（"TBD"、"TODO"、"未定" 等）と判定アルゴリズム、auto_gate.stop_reasons 記録契約
- **severity**: low / **confidence**: high
- **source_of_truth**: REQ-001-046（標準構成三区分）・REQ-001-009（テーブル行として一意識別）違反。document-model 移管候補の「内部アルゴリズム→Design」「fixture detail→Design/テスト文書」該当
- **recommended_route**: 意味診断検出事項（決定的マーカー一覧は Design またはルールカタログへ MOVE 候補）

### F-13: req-health-metrics.md の AUTOGEN 計測例テーブルの鮮度低下
- **category**: AUTOGEN freshness（docs-check 連動）
- **target**: docs/designs/quality/req-health-metrics.md:91-140
- **evidence**: AUTOGEN「現行 REQ の計測例」テーブル（計測日 2026-08-30）に REQ-056 が不在。REQ-001 行数 61 に対し実測 62（REQ-001-066 追加が計測後）
- **severity**: low / **confidence**: high
- **source_of_truth**: AUTOGEN freshness gate（REQ-001-059 鮮度 gate）連動
- **recommended_route**: docs-check 候補（generate_indexes.ts による再生成）

## 文書種別意味系

### F-14: workflow-skill-model.md に「新規 Capability Skill 抽出候補（将来対応）」セクション（将来計画混入）
- **category**: 将来計画混入
- **target**: docs/designs/workflows/workflow-skill-model.md:211-225（status: accepted）
- **evidence**: L211「### 新規 Capability Skill 抽出候補（将来対応）」、L214「本 Design は候補の記録のみを所有し、個別抽出実装は別 Issue が担う。」（候補7項目を列挙）
- **severity**: low / **confidence**: high
- **source_of_truth**: document-model L40（Design が記述しないもの: 新規要件、将来案）、L448。未実装の抽出候補リストは backlog/RU 管理対象。charter 決定4 条件7 の再評価条件（例: agentdev-traceability.md L64）は本件と区別し違反とみなさない
- **recommended_route**: 意味診断検出事項

### F-15: patterns.md の執筆規約 authoring/ 移管候補（未確定事項の Design 混入・低）
- **category**: 将来計画混入（未確定事項）
- **target**: docs/designs/foundations/patterns.md:12（status: accepted）／docs/designs/README.md:181
- **evidence**: patterns.md L12「…執筆規約寄り内容は ../authoring/ ドメイン…への移管候補とする。」／索引 L181「…実移管は case-run で判断」
- **severity**: low / **confidence**: high
- **source_of_truth**: document-model L59（移行対象は REQ の適用範囲にも Design にも現行判断として記載しない）。作業手段は case/Issue/作業記録で扱う
- **recommended_route**: 意味診断検出事項

### F-16: req-impact-map.md 配置の未確定事項が3文書に重複記載（低）
- **category**: 将来計画混入（未確定事項）
- **target**: docs/designs/responsibilities/req-impact-map.md:12／docs/designs/integrity/rule-ownership.md:22-23／docs/designs/README.md:195
- **evidence**: req-impact-map.md L12「配置は responsibilities/ 残置とする（…別途判断）」／rule-ownership.md L22「配置移動は未確定事項とし、…別途判断する。」
- **severity**: low / **confidence**: high
- **source_of_truth**: 「未確定事項」「別途判断」は現行 Design が扱う「現在採用している構造」ではない（REQ-001-055 基準）。同一未確定事項の3文書重複は判断確定時の更新漏れリスク
- **recommended_route**: 意味診断検出事項

### F-17: command-file-format.md の Decision 判断文の重複（低）
- **category**: Design代替（判断文の転記）
- **target**: docs/designs/authoring/command-file-format.md:62（status: accepted）
- **evidence**: 「ガードレール番号 Gxx の連番制度（…）は廃止する（DEC-022、REQ-051）。」— 判断宣告の転記。現行状態記述（「連番制度は廃止済み。現行は意味識別子で…」）への置換が文書種別責務に整合
- **severity**: low / **confidence**: high
- **source_of_truth**: document-model L40（Design は判断根拠を記述しない）
- **recommended_route**: 意味診断検出事項

### F-18: proposed DEC-023 が配布ファイルの根拠として引用
- **category**: ADR承認状態
- **target**: src/third-party/skills.yaml:3、src/opencode/skills/agentdev-workflow-third-party-sync/SKILL.md:89
- **evidence**: skills.yaml L3「# 位置づけ: …（DEC-023 決定2、…）」／SKILL.md L89「- **DEC-023**: third-party Skill の分離管理と取得機構の導入」（ステータス注記なしの権威参照）
- **severity**: low / **confidence**: high
- **source_of_truth**: DEC-023 は status: proposed。同一ファイルが現行 REQ-002-042/043/044 を要求根拠に掲げており DEC-023 引用は置換可能。docs/README.md L96 は「（proposed）」注記を行っており配布物側のみ注記欠落
- **recommended_route**: 意味診断検出事項

### F-19: proposed DEC-022 決定4 が配布 README の根拠引用
- **category**: ADR承認状態
- **target**: src/opencode/plugins/agentdev-gh-tool/README.md:3
- **evidence**: 「Custom Tool `agentdev_gh` を OpenCode の実行時へ登録する ADF 汎用 Plugin（REQ-011、REQ-052、DEC-022 決定4）。」
- **severity**: low / **confidence**: high
- **source_of_truth**: proposed Decision を配布物の根拠引用に使用。REQ-052（現行）が同一要求水準を所有
- **recommended_route**: 意味診断検出事項

### F-20: proposed DEC-022 を正規所有者・根拠とする Design 群
- **category**: ADR承認状態
- **target**: docs/designs/workflows/workflow-skill-model.md:23、docs/designs/responsibilities/artifact-contracts.md:31,34、docs/designs/responsibilities/custom-tool-contracts.md:12、docs/designs/local/runtime-package-boundary.md:239、docs/designs/authoring/command-file-format.md:62、docs/designs/integrity/rules/IR-063-common-policy-identifier-invariant.md:44、docs/designs/README.md:198
- **evidence**: 各箇所で「要求水準を所有する（DEC-022、REQ-002-037〜040）」「正規所有しない（DEC-022、REQ-002-001）」等と権威引用
- **severity**: low / **confidence**: high
- **source_of_truth**: status: proposed の DEC-022 が権威引用されている。同一内容は現行 REQ-002-037〜041、REQ-050、REQ-051、REQ-052 がすでに所有
- **recommended_route**: 意味診断検出事項（DEC-022 承認時の更新チェックリストとして使用可能）

### F-21: proposed DEC-020 / DEC-021 / DEC-025 / DEC-019 の権威引用
- **category**: ADR承認状態
- **target**: docs/designs/skills/agentdev-issue-tracking.md:13、docs/designs/foundations/document-model.md:517、docs/designs/local/local-case-file.md:177、docs/guides/artifacts-and-state.md:19、docs/guides/glossary.md:41（DEC-020）。docs/designs/local/runtime-package-boundary.md:225、docs/guides/consumer-project-setup.md:215（DEC-021）。docs/designs/foundations/references/verification-scope-catalog.md:23（DEC-025）。docs/requirements/REQ-012.md:56、docs/requirements/REQ-021.md:43（DEC-019）
- **evidence**: いずれも status: proposed の DEC を現行運用の根拠・関連 Decision として引用。REQ 層（最優先層）内の関連 Decision 参照がステータス注記なし
- **severity**: low / **confidence**: high
- **source_of_truth**: 現行 REQ が要求水準を所有しており proposed DEC 引用は冗長かつ未承認権威の援用。Decision 承認時に REQ 側更新が漏れるリスク
- **recommended_route**: 意味診断検出事項

### F-22: diagnostics-and-maintenance.md の正規記録先宣言と規約重複（guides範囲超過）
- **category**: guides範囲超過
- **target**: docs/guides/diagnostics-and-maintenance.md:100-113
- **evidence**: L106「| 3層ゲート達成状況… | 当ガイド diagnostics-and-maintenance.md の3層ゲートセクション（本セクション） |」、L112-113「Update Notes セクションは使用しない。」「変更履歴は frontmatter `updated` フィールドのみで追跡する。」
- **severity**: low / **confidence**: high
- **source_of_truth**: guides は規範的権限を持たない（document-model L42）。運用達成状況の正規記録先指定は規範的所有の宣言。「Update Notes 不使用」規則の正本は patterns.md L58 に存在する guides からの重複
- **recommended_route**: 意味診断検出事項

### F-23: req-case-flow.md の実行契約詳細の重複と stale Step 番号（guides範囲超過＋層間DRIFT）
- **category**: guides範囲超過／層間DRIFT
- **target**: docs/guides/req-case-flow.md:84-96,159-172
- **evidence**: L86「Step 11-1（ローカル検証）と Step 11-3（CI/CD検証）で検証失敗時、…最大各3回。」— 現行 case-run は STEP-S1〜S6／STEP-W1〜W5 の STEP モデル（src/opencode/skills/agentdev-workflow-case-run/SKILL.md L61-85）であり「Step 11-1」「11-3」は src/ 配布物・Design のいずれにも存在しない（grep 全走査 zero hit）。L161-172 停止条件10項目は REQ-034・case-run/case-auto Design が正規所有する要求水準の重複で参照導線なし
- **severity**: medium / **confidence**: high
- **source_of_truth**: guides は基準文書と矛盾しないこと（guides/README.md L5）、REQ-001-049（機能名・段階名で参照）。stale Step 番号は IR-034 step-reference 検査のガイド対象拡張候補
- **recommended_route**: 意味診断検出事項

### F-24: ルート README の導入マニュアル全体重複（索引過多）
- **category**: 索引過多
- **target**: README.md:78-156
- **evidence**: provisioning/install 別軸・インストール手順・状態確認・更新・推奨 .gitignore までガイド本文規模の手順を収録。同一内容が docs/guides/consumer-project-setup.md:136-274 に正規配置済み
- **severity**: low / **confidence**: high
- **source_of_truth**: REQ-001-006（索引文書は参照先文書の本文を重複保持しない）。ルート README は入口表（REQ-001-055）と参照先リンクで足りる
- **recommended_route**: 意味診断検出事項

### F-25: README-INSTALL.md の欠落参照と履歴規範参照
- **category**: stale索引・履歴混入
- **target**: README-INSTALL.md:53,63
- **evidence**: L63「移行計画: .omo/plans/agentdev-migration-2026-08-05.md §7（host 側の normative）」— 当該パスはリポジトリに存在しない（Test-Path = False）。「移行計画 §7.5」（L53）への依存も同じ文書
- **severity**: low / **confidence**: high
- **source_of_truth**: 参照先実在（IR-062 類題）違反＋一時的な移行計画（作業記録系）を配布 README が normative 根拠として引用（REQ-001-012 類題）
- **recommended_route**: docs-check 候補（リンク実在検査）＋ 意味診断検出事項

### F-26: docs/README.md の Design 欠落（低）
- **category**: stale索引
- **target**: docs/README.md:159-171（integrity/ 節）、:173-177（local/ 節）
- **evidence**: local/ に 3 件のみ列挙で designs/README.md L237 が正とする local/third-party-skill-management.md（accepted）が欠落。integrity/ 節に content-corruption-checker.md（決定的破損検査クラス）が欠落
- **severity**: low / **confidence**: high
- **source_of_truth**: 完全一覧は designs/README.md を正とする但し書き（docs/README.md L126）があるため軽微。ただし README が third-party 取得機構を現行機能として記載（L39、L145）しながら対応 Design 導線を欠く不整合
- **recommended_route**: 意味診断検出事項（低）

### F-27: guides 間で参照方向ルールの記述が分岐（層間DRIFT）
- **category**: 層間DRIFT
- **target**: docs/guides/project-docs-and-specs.md:38-39 対 docs/guides/artifacts-and-state.md:23-25
- **evidence**: project-docs-and-specs「REQ → Issue の一方向参照である（Issue から REQ への逆参照は行わない）」／artifacts-and-state「Decision → Issue の逆参照は不可」「文書間矛盾時は REQ を優先」。2つのガイドが異なる部分集合を正として提示し、正本（document-model.md）側に対応記述を確認できず
- **severity**: low / **confidence**: medium
- **source_of_truth**: 参照規則の正本は document-model.md（document-type-responsibilities.md L13）
- **recommended_route**: 意味診断検出事項

## 配布物整合性系

### F-28: upstream-handoff.md の見出し重複（マージ漏れ疑い）
- **category**: 見出し重複
- **target**: src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md:30-37
- **evidence**: line 30 `### backlog-review` と line 34 `### backlog-review` が隣接して2回出現。内容は「前工程からの引き継ぎメタデータを付与する」と「…を RU frontmatter に転記する」で部分的重複。他のコマンド小見出しは1回のみ
- **severity**: low / **confidence**: high
- **source_of_truth**: docs-spec-rebuild-integrity 構文健全性検査（同一 H2/H3 テキストの意図しない重複）
- **recommended_route**: docs-check 候補（決定論的検出可能）

### F-29: workflow-templates SKILL.md の本文空の見出し（残骸セクション）
- **category**: 見出し重複／文欠落
- **target**: src/opencode/skills/agentdev-workflow-templates/SKILL.md:221-223
- **evidence**: line 221 `### Issue作成時のテンプレート選定（case-close）` の直後が line 223 `### 共通ルール` で当該見出し配下に本文ゼロ。line 206 に正規の `### Issueクローズ時のテンプレート選定（case-close）` が既に存在。意味上も誤り（case-close は Issue を作成しない）
- **severity**: low / **confidence**: high
- **source_of_truth**: docs-spec-rebuild-integrity 見出し重複＋主語/目的語欠落文検出パターン
- **recommended_route**: 意味診断検出事項（残骸見出しの削除判断）

### F-30: 存在しない参照ファイル requirements-review-finding-protocol.md
- **category**: 存在しない参照
- **target**: src/opencode/skills/agentdev-req-file-manager/SKILL.md:156、src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md:38
- **evidence**: 「`agentdev-workflow-lifecycle` reference の `requirements-review-finding-protocol.md` を参照」。agentdev-workflow-lifecycle/references/ には upstream-handoff.md、structured-stage-handoff.md、reference-resolution.md のみ存在（glob 全局で不所存）
- **severity**: low / **confidence**: high
- **source_of_truth**: docs-spec-rebuild-integrity 参照実在性原則の reference ファイル版
- **recommended_route**: docs-check 候補（ファイル実在照合で決定論的検出可能）

### F-31: 存在しない参照 close-report.md / command-map.md / artifact-boundaries.md
- **category**: 存在しない参照
- **target**: src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md:287,365（close-report.md）、:342（command-map.md）、:597（artifact-boundaries.md）
- **evidence**: glob `**/close-report*.md`、`**/command-map*.md`、artifact-boundaries.md が全局不所存。artifact-boundaries.md の実在対応文書は docs/designs/responsibilities/artifact-contracts.md、artifact-responsibilities.md（旧名残置または誤記の疑い）
- **severity**: low / **confidence**: high
- **source_of_truth**: 参照先実在性原則
- **recommended_route**: docs-check 候補

### F-32: 存在しないスキル名 agentdev-tracking
- **category**: 存在しない参照
- **target**: src/opencode/skills/agentdev-intake-pipeline/references/intake-extraction.md:17、src/opencode/skills/agentdev-workflow-intake-from-github/SKILL.md:42
- **evidence**: 「role: tracking の追跡Issue（`agentdev-tracking` 用語で保存された Issue）は除外する」。`agentdev-tracking` という名の配布物は不所存。現行の正規名は `agentdev-issue-tracking`。旧名残置の疑い
- **severity**: low / **confidence**: high
- **source_of_truth**: skill 名存在照合で決定論的検出可能
- **recommended_route**: docs-check 候補

### F-33: elevation-ledger.md 誤字疑いのファイル名言及
- **category**: 壊れた参照表現
- **target**: src/opencode/commands/agentdev/learning-promote.md:48
- **evidence**: 「管理用ファイル（`elevation-ledger.md` 等）は生成しない」— 「elevation」は「evaluation」（evaluation-report.md が実在する管理ファイル）の誤字の疑い。否定文ゆえ実害は限定的
- **severity**: low / **confidence**: medium
- **source_of_truth**: 参照残骸様の表記
- **recommended_route**: 意味診断検出事項

### F-34: frontmatter source_note の参照先不所存（軽微）
- **category**: stale参照
- **target**: src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md:4
- **evidence**: `source_note: agent-dev-flow-japanese-replacement-dictionary-2026-07-18.md（参照資料）の内容を踏襲` — 参照先ファイル全局不所存。出典履歴注記であり意図的な歴史明記の可能性
- **severity**: low / **confidence**: medium
- **source_of_truth**: file-level 存在チェック上は参照先不在
- **recommended_route**: 意味診断検出事項（注記として許容かの判断）

### F-35: 単独 contracts.md 言及（曖昧参照表現・軽微）
- **category**: 壊れた参照表現
- **target**: src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md:186
- **evidence**: 「入力（Issue 番号、本文）と出力（Issue URL）が contracts.md と同一だけ」— `contracts.md` 単独のファイルは不所存。実在は docs/designs/responsibilities/custom-tool-contracts.md
- **severity**: low / **confidence**: medium
- **source_of_truth**: 省略形が独立ファイル名として読める
- **recommended_route**: 意味診断検出事項

### F-36: 同一テキスト見出しのレベル不統一（参考）
- **category**: 見出し重複（レベル不統一）
- **target**: src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md:360,368,530,559
- **evidence**: 「各 command の参照方法」が4回出現し line 368 のみ H2、他は H3。各出現は異なる手順セクション配下の反復で設計上の反復の可能性が高くレベル混在のみ指摘
- **severity**: low / **confidence**: medium
- **source_of_truth**: docs-spec-rebuild-integrity 見出し重複検出パターン（レベル一貫性）
- **recommended_route**: docs-check 候補

## クリーン判定（問題なしと確認した観点）

- 第一参照導線: クリーン（docs/requirements/README.md AUTOGEN 47件+retired 9件、docs/README.md、実ファイル数が一致。ルート README の ADF-COVERS（REQ-001-055、REQ-050-014）はともに実在行）
- 現行廃止境界: クリーン（superseded DEC-005/DEC-007 参照は全て注記・履歴ビュー・exempt 記録内。retired REQ-013/020/040 参照は適正。REQ-028-NNN の大半は「retired」前置付き履歴参照。F-07 の注記混在のみ別途指摘）
- MERGE: クリーン（REQ-014/015/016、REQ-012/021 は目的・適用範囲で所有境界を相互宣言）
- 形式面の分類一貫性: クリーン（全 47 現行 REQ で要件テーブル外の表形式ゼロ件。Design 委譲徹底）
- v2 過去版参照: クリーン（v2:REQ-01XX 表記で区別済みの履歴参照）
- 実行時依存: クリーン（実行時コマンドが docs/designs を読む依存なし）
- 履歴混入（guides）: クリーン（更新履歴節なし）
- 配布物の frontmatter 重複・エンコーディング（BOM/CRLF混在/制御文字）・Markdown 構文破損・存在しない command 参照・相対リンク・docs Design 言及・command→skill references 言及・dangling @参照・壊れた括弧: すべてクリーン（261ファイル全走査。STEP 反復小見出しは STEP Reference Contract 標準形式のため誤検出除外）
- 責務整合: クリーン（case-open/run/close/auto の責務境界記述は command 本文と workflow skill 間で矛盾なく一致。`DEC-{N}`／`REQ-{NNNN}-{NNN}` は体系的プレースホルダー慣行として正当）

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-01、探索3系統（REQ構造・文書種別意味・配布物整合性）
- 後続: /agentdev/inspect-promote（backlog-auto stage 2 inspect 系統）での分類（promote/defer/reject）
