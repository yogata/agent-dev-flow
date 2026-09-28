# inspect-docs finding 20260928T145126Z

## サマリ

- スキャン対象: REQ 57件（retired 14件）／ Decision 45件（DEC-018 欠番、accepted 36 / superseded 9）／ Design 175件（frontmatter status 全件 accepted、draft 0件）／ guides 13件／ README（root・docs・各索引）／ 配布物（src/opencode/commands/agentdev/ 13件 + skills 50系統、.opencode/ 投影）
- 診断体制: STEP-2 意味診断を 3 診断担当（REQ 体系／Design／Decision・guides・README）へ並列委譲し、親が fan-in 統合（6観点網羅、横断矛盾判定、重複排除、既知 defer 照合、主要所見 7 件の親側直接検証）。STEP-3 配布物整合性検査は親が逐次実行
- 検出件数: 新規 20件（重複排除後）。severity 内訳: high 1件／ medium 5件／ low-medium・low 13件／ info 1件
- 機械的検査: check_integrity NG 0 / Warning 0、command_format / extensions / templates / autogen_freshness / design_frontmatter / knowledge_docs 0違反、content_corruption 0違反、**check_distribution_boundary 0ヒット（前回16ヒットから解消確認）**、lint_skills WARNING 1件（description aggregate budget、RU-0018 層1 既知・継続）
- 主要新規テーマ: ①case-run Design が retired v2:REQ-0158-002 を「要件の SSoT」と現行引用（DS-14、要即時是正）②REQ-092 再定義（Case 3192）への REQ-093・タイトル追随漏れ（RQ-21/22）③RA-002 バッチ是正の副次不整合（updated frontmatter 未更新 22ファイル、訳語の批次内不統一、vocabulary-registry 重複行）④DEC-046 の docs/README AUTOGEN 注記への未反映（DC-11）⑤Design 内の固定件数・実測値埋め込みと陳腐化（DS-17）⑥case-run.md 3箇所の簡体字「项」混入（DS-20）⑦rule-ownership Design に存在しない「段階的付与契約」参照（DS-16）
- 前回 promote 済みテーマの解消確認: agentdev-doc-writing 参照（src/opencode 全域 0件）、req-impact-map 監査パス陳腐化（Phase 3 履歴記録として適法な形で残存）

## 検出事項リスト（新規 20件）

### REQ 体系（10件）

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

#### RQ-27: REQ-007-013 が git 運用手順（対策選定 (1)(2)(3)）を要件行に保持
- **category**: 文書分類
- **target**: docs/requirements/REQ-007.md:32
- **evidence**: 「対策は (1) fetch + refspec による baseline commit の明示的取得、(2) baseline commit へのタグ付与…、(3) 他環境での対照実行または警告付きのスキップ…から選定し」
- **severity**: low-medium / **confidence**: medium
- **source_of_truth**: 文書種別責務 Design（運用手順・具体手段は Design 分離）。known RQ-14/RQ-15 と同種の新規対象行
- **recommended_route**: req-define 再壁打ち（安定契約例外か Design 分離かの scope 判断）
- **ng_classification**: pre-existing（2026-09-27 08:30Z 追加）
- **notes**: 要求自体（原因調査の前置と選定記録）は要件として妥当。手段列挙部分が問題

#### RQ-28: REQ-018-006 が node fs API と shell 挙動の実装詳細を要件行に保持
- **category**: 文書分類（MOVE 候補の側面あり）
- **target**: docs/requirements/REQ-018.md:23
- **evidence**: 「作成は絶対パス指定を前提とし（**node fs.symlinkSync の相対 target は dest ディレクトリ基準で解決される**）、削除は **node fs.rmdirSync を正規手段**とすること（Git Bash rmdir の拒否・PowerShell Remove-Item の確認プロンプト挙動は補記とする）」
- **severity**: low / **confidence**: medium
- **source_of_truth**: 文書種別責務 Design（内部アルゴリズム・処理系固有手順は Design 分離）。同一ファイル REQ-018-002/005 は skill references 明文化義務を既に所有
- **recommended_route**: req-define 再壁打ち（REQ-018-002 へ吸収する MOVE、または手段不変条件への抽象化）
- **ng_classification**: pre-existing

#### RQ-29: REQ-094-008 が語彙管理データの区別軸（スキーマ的列挙）を要件行に列挙
- **category**: 文書分類
- **target**: docs/requirements/REQ-094.md:25（REQ-094-008）
- **evidence**: 「推奨される日本語表現、定着したカタカナ表現、文脈ごとの使い分け、原語を保持すべき条件、固定置換の可否、文脈判断の要否、文章として説明すべき概念の各区別軸を保持して管理できること」
- **severity**: low / **confidence**: medium
- **source_of_truth**: document-type-responsibilities.md:270（語彙管理の実体データは repo-local 語彙レジストリ実体が所有）
- **recommended_route**: req-define 再壁打ち（能力要求として維持か軸列挙の Design 移管か）
- **ng_classification**: fix-target（REQ-094 新規追加当日の内容）
- **notes**: 「保持して管理できること」の能力表現のため訴え度は低い

#### RQ-30: REQ-091 対象外の「DEC-040」参照に superseded 注記がなく本文と不整合
- **category**: 世代境界／第一参照導線
- **target**: docs/requirements/REQ-091.md:38 vs 同 :16
- **evidence**: :16「正規 Decision〔作成時点: DEC-044、DEC-040 は DEC-044 により superseded〕」と注記する一方、:38 対象外「REQ-090、DEC-040、各 Workflow Skill の Jev 関連契約行の変更」は注記なし
- **severity**: low / **confidence**: high（表記不整合の事実。親側直接検証済み）
- **source_of_truth**: DEC-044/DEC-046（DEC-040 は部分 superseded）
- **recommended_route**: intake（:16 と同様の〔 〕注記追記で足りる）
- **ng_classification**: pre-existing（541ba986 由来だが REQ-091 は差分期内に 2 回更新されており追随修正が望ましい）

### Design（7件）

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

#### DS-19: v4-quality-gate-model.md の executed supersede の未遂形記述
- **category**: 廃止済み成果物の扱い（DS-03 近縁の時制問題）
- **target**: docs/designs/quality/v4-quality-gate-model.md:90
- **evidence**: 「v3 quality/quality-gates.md は本 Design により supersede **される**」— crosswalk-inventory.md:134 は第6段 executed 2026-09-19（quality-gates.md 実ファイル削除済み）
- **severity**: low / **confidence**: low（永続関係宣言の読みも成立）
- **source_of_truth**: crosswalk-inventory.md（第6段 executed 記録）
- **recommended_route**: KNOWN DS-03 と同一バッチでの時制整理時に併合判断
- **ng_classification**: 判断保留（parent 判断により KNOWN バッチ併合可）

#### DS-20: case-run.md に簡体字「项」（U+9879）3 箇所混入
- **category**: 文章表層品質（簡体字混入・文字破損）
- **target**: docs/designs/commands/case-run.md:239、:267、:269（「引継ぎ注意事项」「case-close 引継ぎ注意事项」）
- **evidence**: U+9879（简体字「项」）。正規表記は「項」（U+9805）。親側 codepoint 検証済み。check_content_corruption の simplified-chinese 検査は src/opencode/**（配布物）限定のため docs/designs は未走査
- **severity**: low / **confidence**: high
- **source_of_truth**: AGENTS.md 行動規範（中国語出力禁止）、textlint 共通基盤
- **recommended_route**: intake（DS-14 と同一ファイルのため一括修正）
- **ng_classification**: fix-target

### Decision / guides / README（3件）

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

#### DC-12: DEC-001 決定5 管理方式表に現行に存在しない `specs` 配置が記載（info 級）
- **category**: Decision 履歴記述の現行性
- **target**: docs/decisions/DEC-001.md:105（「docs ディレクトリ配置 | 現行配置（docs/requirements|decisions|specs|guides）を維持」）
- **evidence**: 現行配置は docs/designs/（docs/README.md:136 以下）。docs/specs/ は現存せず
- **severity**: info / **confidence**: high（字面は確定。2026-07-24 採用時点の配置名を履歴保持の可能性）
- **source_of_truth**: 現行 docs ディレクトリ構成
- **recommended_route**: 処置推奨なし（F-08「Decision history-keeping vs successor-note policy」defer 論点に従属。F-08 の方針確定時に統合判断）
- **ng_classification**: pre-existing

## KNOWN（継続確認・状態更新）

### 既知 defer 項目の残存確認（今回観測分）

- **20260926 RQ-04**（REQ-015 横断整合の受入行なし）: 残存
- **20260926 RQ-08**（REQ-034「Command Design を正とする」）: **対象行の所在が変質**。REQ-034-008/009 は現存せず、当該規範は REQ-034-007（REQ-034.md:25）に存在。実質残存だが引用行番号が無効
- **20260926 RQ-09**（REQ-034-025 god-row）: 残存（REQ-034.md:41）
- **20260926 RQ-13**（行番号欠番集約）: 残存（REQ-003: 025/027/030〜054、REQ-034: 008〜009、REQ-090: 008）
- **20260926 RQ-14/15/16/17**（REQ-053-041、REQ-090-011、REQ-008-051〜054、REQ-090-004）: 残存
- **20260926 RQ-20**（retired status 値混在）: 残存
- **20260926 DS-03**（v4-traceability-model が物理削除済み v3 Design を移行期間現在形で参照）: 残存（:125、:109-111）
- **20260926 DS-13**（Design 索引 references/ 独立行）: 残存（README.md:154、:180 の2行）
- **20260926 DC-02**（DEC-015 補完後継逆参照欠落）: 残存（DEC-015.md:5 superseded_by=DEC-036 のみ）
- **20260926 DC-06**（DEC-006 legacy top-level supersedes）: 残存（DEC-006.md:5）
- **20260926 DC-07**（Decision Map v4-era relations 未反映）: 残存（relates-to 搭載の不均一含む）
- **20260926 DC-10**（Decision Map 欠落 DEC-044→DEC-043/040、DEC-046→DEC-040）: 残存（decisions/README.md:176-211 に DEC-044/045/046 行なし）。**範囲明確化**: baseline table:56 と superseded ビュー:128 の DEC-040 注記は DEC-046 反映済みで Map 本体のみ未更新。DEC-045（relates-to のみ）の Map 行不在が DC-10 対象かは仕様上の判定を要する
- **20260926 GD-02**（artifacts-and-state 状態モデル制約の旧記述 + guides 索引「正」指定）: 残存（artifacts-and-state.md:145-153、guides/README.md:52）。:151「frontmatter や status フィールドによる状態管理は行わず」は Design status frontmatter 運用（docs/README.md:160）と緊張
- **20260926 GD-03**（intake-learning-backlog-flow 規範記述の正規引用欠落）: 残存（:53-54、:56、:86-87、:104-106、:117-121、:125-126）
- **20260926 RM-01**（root README 最小クイックスタート運用詳細）: 残存（README.md:15-17）
- **20260901 F-10**（REQ-012-035 vs REQ-021-019 重複規範）: 残存
- **20260914 F-04**（REQ-038-006 内部アルゴリズム）: 残存
- **20260914 F-05**（REQ-050-016 SPLIT）: 残存
- **20260925 F-04〜F-13（判定不能分を除く）**: F-05/F-06/F-08/F-09/F-10/F-13 は方針論点として継続。F-08 に**証拠追加**: 後継注記方式の混在（DEC-040 本体注記追記方式、DEC-006 legacy key 方式、DEC-001/043 無編集方式）。F-09 に**隣接観察**: DEC-043.md:41「運用契約の正は配布 skill reference…が所有する」が superseded 後も現在形、DEC-044.md:14,60-61,87「決定1〜3は本 Decision が維持する」が DEC-046 採用後の現行と部分不一致
- **20260914 GUIDE-6 / 20260925 F-07**: 指摘内容の同定ができず判定不能（次回再評価）

### 解消確認（前回指摘の解消）

- **quickstart 移行案内節（RM-01 関連、OU-005）**: 解消。root README に migration-note セクションなし
- **README 散文の件数二重記述（OU-003）**: 解消。docs/README.md:84「Decision インデックスの集計を正とする」へ集約済み
- **配布物 concrete_id 境界違反（前回 16ヒット）**: 解消。check_distribution_boundary 0ヒット
- **agentdev-doc-writing スキル参照（20260927 promote テーマ②）**: 解消。src/opencode 全域 0件
- **req-impact-map 監査パス陳腐化（20260927 promote テーマ④）**: 解消。Phase 3 履歴記録としてメタデータ付きで適法残存

### docs-check route 候補（機械的検査に落とし得る意味的疑い）

- RQ-23: REQ frontmatter `updated` と last commit 日付の突合（鮮度検査。check_integrity 拡張候補）
- DC-11: AUTOGEN 生成ブロックの注記と生成源（supersede_note）の意味一致検査（check_autogen_freshness の content_change 系拡張候補）
- DS-17: docs/designs/** の固定件数埋め込み検出（IR-042 系の Design 適用拡張候補）
- DS-20: docs/designs/** の簡体字混入検出（check_content_corruption の走査範囲拡張候補）

## カバレッジ（診断体制の限界の申告）

- REQ 体系: 全行読了 8 ファイル（README、REQ-012/082/090/091/092/093/094）、差分全文読み 21 ファイル、残り 28 現行ファイルは grep 掃引（幻影行参照・retired 参照・frontmatter・用語残置）のみ。retired/ 残り 12 ファイルは status と RA-002 差分のみ確認
- Design: 175 ファイル全列挙 + 横断 grep 8系統、精読約 30 ファイル。残り約 90 ファイル（skills 系・integrity/rules 大半等）は grep スクリーニングのみで観点1（REQ/Decision 代替）の意味判断は検出力限定。F-06/F-10/DESIGN-3 は再検証不能（指摘内容の定義が inbox 残置分から取得不能であったため）
- Decision/guides/README: guides 13本・主要 README 全文・DEC 8本精読 + 全 45 Decision frontmatter 機械抽出。DEC-002〜005/007〜014/016〜039/041/042 本文は未精読（DC-04 の完全判定は不可）。AUTOGEN 生成スクリプトとの照合は未実施
- 配布物（src/opencode）: 機械的検査全面クリーン。責務整合の意味面は Design 担当の Design 側照合と前回 promote テーマの解消確認まで（全文の意味再診断は今回実施せず）

## 処理記録

- 本ファイルは inspect-docs（backlog-auto stage 1）の検出事項出力である。分類・採用は `/agentdev/inspect-promote`（backlog-auto stage 2 inspect 系統）に委譲する
