# inspect-docs promoted findings 20260929T170714Z.md

- 保存日: 2026-09-30（backlog-auto stage 2 inspect 系統・inspect-promote。--auto なし）
- 来源: .agentdev/inspect/inbox/inspect-docs-finding-20260929T170714Z.md から promote 判定分を原状保存（HITL・自律確定の別は処理記録参照）

#### DS-01: Custom Tool 操作契約 Design に実測観測への言及が残存
- category: 文書分類（document-model 責務マトリックス違反: 実測値・観測記録の Design 混入）
- target: `docs/designs/responsibilities/custom-tool-contracts.md:89`
- evidence: 「書込先 root は Tool が内部解決し…main リポジトリ側 `.agentdev/jev-observations/` に帰着する（実測観測: `.agentdev/jev-observations/20260923T133911Z-6859.json`）」— 特定観測ファイルへの実測参照が Design 本文に残存。同 Design 内の他の契約は実測ファイル名を引用しない観測可能契約のみで記述しており表現不統一。
- severity: low
- confidence: medium
- source_of_truth: document-model.md:41（Design は監査結果・評価結果・実測値を記述しない。REQ-001-003）、同 :425（実測スナップショットの Design 混入禁止）
- recommended_route: intake（特定観測ファイル名を除去し観測契約の一般表現へ寄せる、または Report 参照へ置換する文書修正候補）
- ng_classification: pre-existing（2026-09-29 の Jev 純化 PR #3240 で当該行が触れた後に残存）
- notes: 契約挙動の根拠としての最小言及という弁護も可能

#### DS-02: document-model.md のドメインディレクトリ表が実在 Design 構成に対して陳腐化
- category: 横断契約矛盾（Design README と document-model の表の整合性欠落。DRIFT 的陳腐化）
- target: `docs/designs/foundations/document-model.md:553-560`
- evidence: foundations/ 行は8件列挙に対し実在は16エントリ（v4 系8ファイル、v3-v4-crosswalk がすべて未列挙）。integrity/ 行は5件列挙に対し実在は15エントリ（checker-execution-contracts 等 未列挙）。local/ 行は2件列挙に対し実在4件。quality/ 行のみ実在と一致。
- severity: medium
- confidence: medium
- source_of_truth: docs/designs/README.md「Design status 追跡情報源」（全 Design の単一追跡情報源）、document-model.md:547-548（ドメイン体系化規範の正、REQ-001-001）
- recommended_route: intake（表の列挙を実在へ更新するか代表例示へ文言明示する文書更新案）
- ng_classification: pre-existing
- notes: 表が網羅リストか代表列挙かが文言上明言なし。foundations/ 行のみ v4 群が全欠落で quality/ 行は完全一致する点から更新漏れと解するのが自然

### Decision / guides / README（新規 10件）

#### GR-01: docs/README.md の DEC-040 索引注記が現行の部分置換状態と不一致
- category: README 索引の現行性
- target: `docs/README.md`（Decision 索引 AUTOGEN ブロック内 DEC-040 行）
- evidence: 同行は「superseded by DEC-044〔決定4 部分置換。決定1〜3は維持〕」と記載。DEC-040.md:6 の supersede_note は「決定4 は DEC-044 が置換。決定2 は DEC-046 が置換。決定1・3は維持」であり、docs/decisions/README.md:56 もこちらを反映。docs/README.md のみ決定2 置換（DEC-046）が欠落し、読者は決定2〔旧 provider: Vercel〕を現行と誤読し得る。
- severity: medium
- confidence: medium
- source_of_truth: docs/decisions/DEC-040.md frontmatter（SSoT）
- recommended_route: docs-check（AUTOGEN 注記の生成ソース〔後継側 relations reason と推定〕の調査・修正を含む）
- ng_classification: pre-existing
- notes: 注記出所（DEC-044.md:14 の reason 由来と推定）の特定までは未検証

#### GR-02: 部分置換の記録様式が Decision 間で非一貫（DEC-028 vs DEC-040）
- category: Decision 意味整合（規則ギャップ）
- target: `docs/decisions/DEC-028.md:4-6,42` / `docs/decisions/DEC-040.md:4-6,25-26,37,39`
- evidence: 同じ「部分置換」でも DEC-028 は status: accepted 継続 + frontmatter supersede_note のみ（本文42行の置換対象条項は本文内無注記）。DEC-040 は status: superseded + 本文冒頭注記 + インラインマーカー。DEC-040 の superseded_by は DEC-044 のみで、決定2 を置換する DEC-046 は supersede_note のみに記録。decision-lifecycle.md:45-46 は部分置換時の status 付与基準（accepted 継続 vs superseded 化）を規定しない。
- severity: medium
- confidence: medium
- source_of_truth: decision-lifecycle.md:45-46、v4-lifecycle-state-machine.md（status 値域の一般化契約）
- recommended_route: intake（契約の明確化を要する規則ギャップ。文書整備で足りるなら docs-check）
- ng_classification: pre-existing
- notes: DEC-047 が DEC-028 の accepted 継続を明示宣言しており意図的差異の可能性はあるが、判断基準の明文がない

#### GR-03: accepted Decision が superseded 済み DEC-015 を「有効のまま保持」と現在形で記述
- category: Decision 意味整合（superseded の現行扱い）
- target: `docs/decisions/DEC-032.md:28`、`docs/decisions/DEC-039.md:50`
- evidence: DEC-032:28「（DEC-015 本体は v3 として有効のまま保持する）」、DEC-039:50「v3 保持: DEC-015（…）および DEC-004（…）の本体は v3 として有効のまま保持する。置換の実行は後続 Sequence 段階が所有する。」— DEC-015 は 2026-09-18 以降 superseded 実行済み（DEC-015.md:4-5、superseded_by: DEC-036）。
- severity: medium
- confidence: high（git・frontmatter で事実確定）
- source_of_truth: docs/decisions/DEC-015.md frontmatter status
- recommended_route: docs-check
- ng_classification: pre-existing（v4 Sequence の予定記述が陳腐化）
- notes: DEC-038:43 の同型記述は対象が DEC-011（現行 accepted）のため問題なし

#### GR-04: ガイドの v2 ADR 物理削除範囲が git 実績・Decision 索引と不一致
- category: guides 歴史事実の文書間不一致
- target: `docs/guides/diagnostics-and-maintenance.md:49`
- evidence: 「（v2:ADR-0001〜0099 帯は 2026-07-20 に物理削除済み）」— git 実績では 2026-07-20（commit 527ed5f7）に削除されたのは docs/adr/retired/ADR-0001〜0023 の23ファイルのみ。ADR-0024〜0099 は全履歴に存在実績なし。tag v2.11.0 ツリーも ADR-0101〜0139 のみ。docs/decisions/README.md:307 は「v2:ADR-0001〜0023」と正しく記載。
- severity: low
- confidence: high（git 履歴・tag ツリーで検証済み）
- source_of_truth: docs/decisions/README.md:307 + git 履歴
- recommended_route: docs-check
- ng_classification: pre-existing
- notes: 「0100 未満の番号帯全体の不在」を述べた寛容的解釈の余地はあるが表記統一が必要

#### GR-09: numbering-policy.md の採番実行主体列挙と Definition PR 内採番前例の関係
- category: Design 領域（採番政策の現行性）
- target: `docs/designs/foundations/numbering-policy.md:40-41`
- evidence: 「Definition 保存 / Design 保存内部責務（case-ready / case-revise）は当該スクリプトを bash 経由で呼び出す」— 実行契約前例（DEC-046: Case #3183/PR #3184、DEC-047: Case #3236/PR #3237）では proposed Decision は Definition PR 編成時（case-open 工程側）に採番・作成されている。既存 intake item 2026-09-29-3236-decision-numbering-timing-wording.md が同主題を記録するが、その対象候補に numbering-policy.md は含まれない。
- severity: medium
- confidence: medium
- source_of_truth: 上記 intake item、REQ-061-020/061-039
- recommended_route: intake（既存 inbox item への対象追加候補）
- ng_classification: pre-existing
- notes: 「（case-ready / case-revise）」が例示か網羅かで重大度が変わる

