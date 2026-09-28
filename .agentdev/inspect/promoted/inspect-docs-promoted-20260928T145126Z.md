# inspect-docs promoted 20260928T145126Z

- source: .agentdev/inspect/inbox/inspect-docs-finding-20260928T145126Z.md（NEW 20件）+ inspect-docs-finding-20260925T120034Z.md（F-04 併合）
- 実施: /agentdev/backlog-auto stage 2 inspect 系統（inspect-promote、--auto なし）2026-09-29

## 処分サマリ

- promote 16件: 20260928 NEW 15件 + 20260925 F-04 併合（RQ-26 へ統合）
- reject 1件: 20260925 F-14（20260925 側で即時削除・却下理由は commit message）
- defer 継続: 20260928 NEW 5件（RQ-27/28/29・DS-19・DC-12）+ 既知 defer 38件（各ファイル残置）
- HITL: Q1 promote 15件 全件承認（うち RQ-23/RQ-24/RQ-25/DS-15 はユーザー判断要として提示）。Q2 RQ-17 は defer 継続（ユーザー確認）

## RU 化束構成提案（backlog-review 参考情報・束分けは backlog-review で再編可）

| 束 | findings | 主題 |
|---|---|---|
| 束A（最優先） | DS-14 + DS-20 | case-run.md が retired v2:REQ-0158-002 を「要件のSSoT」と現行引用（high）+ 簡体字「项」×3 混入。同一ファイルへのはめ込み是正 |
| 束B | RQ-21 + RQ-22 | REQ-092 再定義（Case 3192）への REQ-093・タイトル追随 |
| 束C | RQ-24 + RQ-25 + DS-18 | 訳語不統一（staleness 系）・provider/adapter 行内混在・vocabulary-registry 重複行/旧語彙残留 |
| 束D | DS-15 + DC-11 | retired v2:REQ/superseded DEC の現行権威引用残留（RA-002 続行バッチ）+ docs/README DEC-040 注記（AUTOGEN 再生成で解消） |
| 束E | RQ-26 + RQ-30 + DS-16 + GD-04 | phantom 行参照・DEC-040 注記なし・「段階的付与契約」dangling ref・ブランチ削除残存（参照整合注記系） |
| 束F | RQ-23 | frontmatter `updated` 鮮度（22ファイル・規約明文化を伴う） |
| 束G | DS-17 | Design 内固定件数・実測値・履歴叙述の埋め込み（document-type-responsibilities.md:246 明文禁止） |

## 審議記録

- STEP-5 in-context adversarial-review: 採択 A-1（HITL 4件を promote 承認一括質問に統合し個別除外機会を明示）/ A-2（F-04 併合を 20260925 側審議記録に明記し監査性担保）/ A-3（RU 束構成は backlog-review 参考提案と明示）。棄却 2（DS-15 defer 説・RQ-17 promote 説）
- STEP-6: 自律確定 11件（RQ-21/22/26/30・DS-14/16/17/18/20・DC-11・GD-04）+ HITL 4件（RQ-23/24/25/DS-15）→ 全件承認。F-04 併合・F-14 reject は自律確定。RQ-17 は defer 継続をユーザー確認
- docs-check route 候補（20260928 KNOWN 節より）: RQ-23 updated 鮮度突合 / DC-11 AUTOGEN 注記一致 / DS-17 固定件数検出 / DS-20 簡体字走査範囲拡張

## 検出事項（promote 16件・原状転記）

### REQ 体系（7件）

#### RQ-21: REQ-092 再定義に REQ-093 が未追随（所有境界記述の食い違い）
- **category**: DRIFT（横断参照の現行化漏れ）／参照整合
- **target**: docs/requirements/REQ-093.md:12、:31 vs docs/requirements/REQ-092.md:18
- **evidence**: REQ-093.md:12「REQ-092 が issue_list 操作の呼出側規律（**安全ページ上限**・labels 論理値専用）を所有するのに対し」。一方 REQ-092.md:18（09-28 再定義）「Tool 側の操作契約（…完全一覧契約・**安全上の上限**・失敗分類）は **REQ-011-033 が所有**し、本 REQ は呼出側の運用規律を所有する」
- **severity**: medium / **confidence**: high
- **source_of_truth**: 現行 REQ-092（be3b826d 再定義版）
- **recommended_route**: intake（Case 3192 系追随是正。REQ-093 側 2 箇所の表現修正）
- **ng_classification**: fix-target（be3b826d が REQ-093 を更新しなかったことで生じた新規不整合）
- **notes**: RQ-22 と同ファイル群で一括修正可能


#### RQ-22: REQ-092 タイトル「labels 論理値専用」と本文「論理軸の物理マッピング入力専用」の不整合
- **category**: DRIFT（title vs 本文）
- **target**: docs/requirements/REQ-092.md:3 vs :14, :25。docs/requirements/README.md:69 も同タイトル（AUTOGEN）
- **evidence**: タイトル「…labels **論理値**専用の文書整備」／本文「labels 引数が追跡Issue**論理軸**（role、kind、trackingState）の物理マッピング入力専用」
- **severity**: low-medium / **confidence**: high（表記不一致の事実）
- **source_of_truth**: REQ-092 本文（再定義後の契約内容）
- **recommended_route**: intake（タイトル改題 + README AUTOGEN 再生成を伴う軽微修正）
- **ng_classification**: fix-target（本文のみ再定義されタイトルが放置された）


#### RQ-23: RA-002 バッチ是正が frontmatter `updated` を更新せず（22 ファイル + 旧例 9 ファイル）
- **category**: DRIFT（metadata vs 内容鮮度）
- **target**: 例: docs/requirements/REQ-007.md:5（updated: "2026-09-19"、内容は 09-28 変更）、REQ-029.md:5（"2026-09-17"）、REQ-048.md:5（"2026-09-05"）、REQ-058.md:5（"2026-09-03"）。ba7a9f3e で本文変更された 22 ファイル全部で last_commit(09-28) > updated。旧例（pre-existing）: REQ-032.md（updated: 2026-09-19 のまま REQ-032-029 が 09-27 追加）、REQ-001/019/027/030/044/047/059/061
- **evidence**: 全 57 現行ファイルの last_commit vs frontmatter updated 実測突合（31 ファイルで不一致、うち 22 は 09-28 の ba7a9f3e 起因）
- **severity**: low / **confidence**: medium（patterns.md に REQ 用の「更新時 updated 進行」明文なし。慣例 + 知識文書規約「最終更新日」の趣旨から）
- **source_of_truth**: docs/designs/foundations/patterns.md REQ frontmatter 規約
- **recommended_route**: learning（バッチ横断是正の手順に frontmatter updated 更新を組込む）+ 是正実施は intake
- **ng_classification**: delta 分 fix-target、旧例分 pre-existing
- **notes**: check_integrity.ts は REQ frontmatter の updated 鮮度を未検査（docs-check route 候補）


#### RQ-24: stale/staleness 系訳語のバッチ内不統一（「現行性」は未登録造語）
- **category**: DRIFT（用語）
- **target**: docs/requirements/REQ-017.md:45（REQ-017-015「現行性」）vs 同 REQ-017.md:68（対象外「staleness check」）。REQ-058.md:25〜27（「陳腐化した」）。REQ-017-018、REQ-012-051（「鮮度」）
- **evidence**: 同一コミット ba7a9f3e で REQ-017-015 は「staleness」→「現行性」、REQ-058 は「stale」→「陳腐化した」へ変換。同一ファイル内に行内訳語と原語が混在。用語集・語彙レジストリに「現行性」の登録なし
- **severity**: low / **confidence**: high（不統一の事実）
- **source_of_truth**: REQ-094-003（用語政策 = document-type-responsibilities.md 用語4分類）+ 語彙レジストリ
- **recommended_route**: learning（staleness/stale の訳語を語彙レジストリ・訳語表へ登録し統一）
- **ng_classification**: fix-target（ba7a9f3e の部分適用起因）
- **notes**: 「staleness check」は check 名（固定複合表現）として原表記保持の許容解あり。同概念族に「鮮度」含め 3 表記


#### RQ-25: provider/adapter 訳語適用の行内不完全性（RA-002 部分是正の残置）
- **category**: DRIFT（用語）
- **target**: docs/requirements/REQ-090.md:36（REQ-090-022）、:35（REQ-090-021）、REQ-034.md:44（REQ-034-028「provider failure」）、REQ-091.md:10（「provider 資格情報」）、REQ-005.md:40（REQ-005-024「各STEP」「STEP識別子」vs「STEP 間のハンドオフ」）
- **evidence**: REQ-090-022 同一行内に「複数 **provider** 対応」と「将来の**プロバイダー**交換可能性」が混在
- **severity**: low / **confidence**: medium-high
- **source_of_truth**: vocabulary-registry.md:259（provider= 文脈依存語）、:261（adapter= 固定複合表現は原表記許容）
- **recommended_route**: intake（REQ-090-021/022 の行内統一）+ learning（compound 語の語彙レジストリ登録）
- **ng_classification**: fix-target（ba7a9f3e の適用もれ）
- **notes**: REQ-094-006（識別子・正式名称の変更禁止）と REQ-094-003（文脈依存）の境界事例


#### RQ-26: REQ-082 が現存しない行番号帯 REQ-003-030〜054 を来歴注記で参照
- **category**: 参照整合
- **target**: docs/requirements/REQ-082.md:12。REQ-003 現行行は …029 → 055 で 030〜054 は不連続（REQ-082-001〜025 へ採番替え済みを実測確認）
- **evidence**: 「REQ-003 の審議契約群（REQ-003-030〜054）を 2026-09-15 のユーザー裁定により分離移動したもの」
- **severity**: low / **confidence**: high（事実）
- **source_of_truth**: 現行 REQ-082 / REQ-003 の行構成
- **recommended_route**: intake（「現 REQ-082-001〜025」の対照注記追記で解消）
- **ng_classification**: pre-existing
- **notes**: 現行導線の本体は正しく、読者を実在しない行へ導く二次リスク


#### RQ-30: REQ-091 対象外の「DEC-040」参照に superseded 注記がなく本文と不整合
- **category**: 世代境界／第一参照導線
- **target**: docs/requirements/REQ-091.md:38 vs 同 :16
- **evidence**: :16「正規 Decision〔作成時点: DEC-044、DEC-040 は DEC-044 により superseded〕」と注記する一方、:38 対象外「REQ-090、DEC-040、各 Workflow Skill の Jev 関連契約行の変更」は注記なし
- **severity**: low / **confidence**: high（表記不整合の事実。親側直接検証済み）
- **source_of_truth**: DEC-044/DEC-046（DEC-040 は部分 superseded）
- **recommended_route**: intake（:16 と同様の〔 〕注記追記で足りる）
- **ng_classification**: pre-existing（541ba986 由来だが REQ-091 は差分期内に 2 回更新されており追随修正が望ましい）


### Design（6件）

#### DS-14: case-run Design が retired v2:REQ-0158-002 を「要件の SSoT」として現行引用
- **category**: 実行時依存先としての不適切扱い（廃止済み成果物の現行 SSoT 引用）
- **target**: docs/designs/commands/case-run.md:240（他 :236 節見出し、:247、:271-272）
- **evidence**: case-run.md:240「要件の SSoT は v2:REQ-0158-002。」／targeted-docs-guard-implementation.md:12「v2:REQ-0158…retire 完了」、同 :148「（v2:REQ-0158 より移管、**REQ-010-012 で要件化**）」、case-close.md:208「最終 gate 基底は REQ-010-012 を再利用し」— 同一契約で case-close は現行 REQ にアンカーし case-run のみ retired v2 ID を SSoT 宣言（親側直接検証済み）
- **severity**: high / **confidence**: high
- **source_of_truth**: REQ-010-012
- **recommended_route**: intake（case-run Design 修正。SSoT 参照を REQ-010-012 へ付替え。IR-015 クラス違反）
- **ng_classification**: fix-target
- **notes**: DS-20（同ファイルの簡体字混入）と同一ファイルで一括修正可能


#### DS-15: retired v2:REQ / superseded DEC が現行動作の権威引用として残存（RA-002 未網羅領域、約60件/14ファイル）
- **category**: 実行時依存先（廃止識別子の現行アンカー利用）
- **target**（代表）: commands/req-define.md:70,105,109,152（v2:REQ-0155-003/004/008）、commands/backlog-review.md:55、commands/learning-promote.md:19,74,90（v2:REQ-0155-004/005/008、v2:REQ-0137-002/005）、commands/case-open.md:178-179、commands/case-close.md:53,143,235（v2:REQ-0137-001/002/005）、responsibilities/artifact-contracts.md:216（v2:REQ-0107-012/013）、quality/design-health-metrics.md:12、commands/inspect-docs.md:56（v2:REQ-0115-041）、responsibilities/document-type-responsibilities.md:23（「v2:REQ-0140 の原本仕様である」）、local/runtime-package-boundary.md:313、authoring/command-file-format.md 節見出し（v2:REQ-0143-005）、integrity/rules/IR-051-…md:18、commands/case-auto.md:158（v2:ADR-0129）, :165、foundations/harness-separation-model.md:71（superseded DEC-015 を現在の並列境界の帰属先に単独引用）
- **evidence**: 正規パターンは「DEC-002 由来、現行の責務体制は DEC-036」の二重帰属型（workflow-skill-model.md:102 等4ファイル）。上記は retired 注記も現行アンカーもなし。document-model.md:525 は Case 3187 で v2:REQ-0155-009 のみ置換済み
- **severity**: medium / **confidence**: medium-high（クラスは確実。個別の後継アンカー同定に不確実性）
- **source_of_truth**: document-model.md（文書7分類・Design 5-class canonical section）、現行 REQ 各系
- **recommended_route**: intake（RA-002 続行バッチ是正として case-auto 実行候補。節見出しラベル用途は retired 注記+現行アンカー併記で足りる可能性）
- **ng_classification**: pre-existing 中心
- **notes**: 修正は表記レベルで軽微。req-impact-map.md:19 の「REQ-028-008」（:144 には retired 注記あり）も同ファイル内不整合として含む


#### DS-16: case-close Design が rule-ownership.md に存在しない「段階的付与契約」を参照
- **category**: 実行時依存先（参照先 Design に実在しない契約への依存）
- **target**: docs/designs/commands/case-close.md:280
- **evidence**: 「宣言付与は integrity/rule-ownership Design の**段階的付与契約**に従い」— rule-ownership.md 全文に「段階的」「付与」の出現ゼロ（親側 grep 検証済み）。実在記述は responsibilities/artifact-responsibilities.md:77「残存 68 件の未付与行は本カタログに従い段階的に付与する」
- **severity**: medium / **confidence**: high
- **source_of_truth**: artifact-responsibilities.md（ADF-COVERS 実装対応宣言の正規配置先カタログ）
- **recommended_route**: intake（参照先修正: rule-ownership → artifact-responsibilities、または契約の実在化）
- **ng_classification**: fix-target（dangling-reference）


#### DS-17: Design 内への固定件数・実測値・履歴叙述の埋め込みと陳腐化
- **category**: 文書分類（Design 記述対象外違反）
- **target**: integrity/index-auto-generation.md:189（「データ行 **43 行**」→ 実測 **45 行**。親側検証済み）、responsibilities/artifact-responsibilities.md:77（「残存 **68 件**」+将来作業）、responsibilities/custom-tool-contracts.md:89（「実測: 20260923T133911Z-6859」）、foundations/patterns.md:118-120（v3.0.0 移行時の障害履歴叙述+将来項目）、foundations/references/concrete-abstraction.md:31 vs :44,:48（同一ファイル内 baseline **11件** vs **3件** の矛盾）
- **evidence**: document-model.md:41 は Design の記述対象外に「作業履歴、監査結果、評価結果、実測値」を列挙。document-type-responsibilities.md:246「固定件数…は本Designに保持しない（固定件数埋め込みを全件禁止）」
- **severity**: medium / **confidence**: high（件数の事実関係。index-auto-generation と concrete-abstraction は現時点で矛盾・陳腐化済み）
- **source_of_truth**: document-model.md:41、document-type-responsibilities.md:246
- **recommended_route**: intake（件数を導出表現へ、履歴は Decision/Report へ。concrete-abstraction の 11/3 矛盾は即時修正候補）
- **ng_classification**: 陳腐化 2件は fix-target、其余 pre-existing
- **notes**: IR-064:47 等の baseline 計数は provenance manifest 管理の運用データのため除外。v4-traceability-model.md:95 の 942/111 件は自己管理された corpus 債務方針節のため除外


#### DS-18: vocabulary-registry.md 適用範囲の重複行と旧語彙残留
- **category**: 構造重複・用語不整合（RA-002 残留疑い）
- **target**: docs/designs/authoring/vocabulary-registry.md:72-73
- **evidence**: L72「…IR-045/050/051/044/055 と**配布物側語彙レジストリ**の責務分担」/ L73「…同一内容…と**実体対照表（repo-local）**の責務分担」— ほぼ同一内容の2行が重複。L29 は「repo-agentdev-integrity は repo-local スキル（配布対象外）」と定義し「配布物側語彙レジストリ」は旧語彙。当該ファイル updated: 2026-09-28（本日変更）
- **severity**: low / **confidence**: high（重複は客観的）
- **source_of_truth**: 同ファイル L29
- **recommended_route**: intake（L72 または L73 を削除統一）
- **ng_classification**: fix-target


#### DS-20: case-run.md に簡体字「项」（U+9879）3 箇所混入
- **category**: 文章表層品質（簡体字混入・文字破損）
- **target**: docs/designs/commands/case-run.md:239、:267、:269（「引継ぎ注意事项」「case-close 引継ぎ注意事项」）
- **evidence**: U+9879（简体字「项」）。正規表記は「項」（U+9805）。親側 codepoint 検証済み。check_content_corruption の simplified-chinese 検査は src/opencode/**（配布物）限定のため docs/designs は未走査
- **severity**: low / **confidence**: high
- **source_of_truth**: AGENTS.md 行動規範（中国語出力禁止）、textlint 共通基盤
- **recommended_route**: intake（DS-14 と同一ファイルのため一括修正）
- **ng_classification**: fix-target


### Decision / guides / README（2件）

#### DC-11: docs/README.md の DEC-040 注記が DEC-046 未反映で正側と不一致
- **category**: Decision 現行性／索引鮮度
- **target**: docs/README.md:127
- **evidence**: 「（superseded by DEC-044〔決定4 部分置換。**決定1〜3は維持**〕）」vs docs/decisions/README.md:56 および DEC-040.md:6 supersede_note「決定4 は DEC-044 が置換。**決定2 は DEC-046 が置換**。決定1・3は維持」（親側直接検証済み）
- **severity**: medium / **confidence**: high
- **source_of_truth**: DEC-040 frontmatter supersede_note + DEC-046
- **recommended_route**: intake（readme-decision-summary-table AUTOGEN 再生成。index-auto-generation.md:188 の notes 抽出合成規則どおり supersede_note から導出されば解消）
- **ng_classification**: fix-target（DEC-046 の supersede_note 更新後に AUTOGEN 再生成が実行されなかった）
- **notes**: DEC-043 の注記は正側と一致しており DEC-040 行のみ古い。docs-check route 候補（AUTOGEN 注記と生成源の意味一致検査）


#### GD-04: req-case-flow.md の case-close 出力に「ブランチ削除」が残存し DEC-045/REQ-032-029 現行と不整合の疑い
- **category**: guides 意味診断（現行性）
- **target**: docs/guides/req-case-flow.md:95
- **evidence**: 「**出力**: マージ済み + 記録追記済み + **ブランチ削除**」vs REQ-032-029「case-close は**リモートブランチ削除ステップを持たず**…クリーンアップの責務は**ローカルに限定**されること」。Design 側（case-close.md:54、system.md:216,230）と consumer-project-setup.md は追随済みで req-case-flow.md のみ旧表現。DEC-045 影響節は req-case-flow 更新を列挙せず（親側直接検証済み）
- **severity**: low-medium / **confidence**: medium（ローカルブランチ限定と読む余地が残る）
- **source_of_truth**: REQ-032-029 > DEC-045 決定1
- **recommended_route**: intake（「ローカルブランチ・worktree クリーンアップ」への明示限定）または現状意図の確認
- **ng_classification**: pre-existing（DEC-045 追随漏れ）
- **notes**: guides README 冒頭の「基準を優先」宣言が誤導を緩和


### 併合（20260925 F-04 → RQ-26）

[併合注記: 2026-09-29 に 20260925 F-04 を 20260928 RQ-26 へ併合（対象同一: REQ-082 の phantom 範囲参照）。以下は 20260925 本文の原状転記]

#### F-04（20260925・RQ-26 併合）: REQ-082.md:14 の移行経緯記述と phantom 範囲参照

- id: F-04
- category: MOVE／REQ参照ID整合性
- target: docs/requirements/REQ-082.md:14
- evidence: 「本 REQ は REQ-003 の審議契約群（REQ-003-030〜054）を 2026-09-15 のユーザー裁定により分離移動した…」。REQ-003 は現在 29 行で 030〜054 は全て不存在（機械確認済み）。REQ-001-014（現行本文は移行経緯を含まない）と緊張。シグナル 2（phantom 範囲参照 + 移行経緯残留）
- severity: medium
- confidence: medium
- source_of_truth: 現行 REQ-003 の実行構成（29 行）を正として判定
- recommended_route: req-define 再壁打ち候補（行番号 specifics の縮約）
- ng_classification: pre-existing
- notes: REQ-087-001 は例外採番 REQ（REQ-082）に「REQ 本文の該当行にユーザー裁定の記録」を義務付けるため、裁定記録自体の削除は不可。記録を残しつつ参照形式を現行体系へ整合させる方向
