# inspect-docs finding 20260928T145126Z

## サマリ

- スキャン対象: REQ 57件（retired 14件）／ Decision 45件（DEC-018 欠番、accepted 36 / superseded 9）／ Design 175件（frontmatter status 全件 accepted、draft 0件）／ guides 13件／ README（root・docs・各索引）／ 配布物（src/opencode/commands/agentdev/ 13件 + skills 50系統、.opencode/ 投影）
- 診断体制: STEP-2 意味診断を 3 診断担当（REQ 体系／Design／Decision・guides・README）へ並列委譲し、親が fan-in 統合（6観点網羅、横断矛盾判定、重複排除、既知 defer 照合、主要所見 7 件の親側直接検証）。STEP-3 配布物整合性検査は親が逐次実行
- 検出件数: 新規 20件（重複排除後）。severity 内訳: high 1件／ medium 5件／ low-medium・low 13件／ info 1件
- 機械的検査: check_integrity NG 0 / Warning 0、command_format / extensions / templates / autogen_freshness / design_frontmatter / knowledge_docs 0違反、content_corruption 0違反、**check_distribution_boundary 0ヒット（前回16ヒットから解消確認）**、lint_skills WARNING 1件（description aggregate budget、RU-0018 層1 既知・継続）
- 主要新規テーマ: ①case-run Design が retired v2:REQ-0158-002 を「要件の SSoT」と現行引用（DS-14、要即時是正）②REQ-092 再定義（Case 3192）への REQ-093・タイトル追随漏れ（RQ-21/22）③RA-002 バッチ是正の副次不整合（updated frontmatter 未更新 22ファイル、訳語の批次内不統一、vocabulary-registry 重複行）④DEC-046 の docs/README AUTOGEN 注記への未反映（DC-11）⑤Design 内の固定件数・実測値埋め込みと陳腐化（DS-17）⑥case-run.md 3箇所の簡体字「项」混入（DS-20）⑦rule-ownership Design に存在しない「段階的付与契約」参照（DS-16）
- 前回 promote 済みテーマの解消確認: agentdev-doc-writing 参照（src/opencode 全域 0件）、req-impact-map 監査パス陳腐化（Phase 3 履歴記録として適法な形で残存）

## 検出事項リスト（defer 残置 5件）

### REQ 体系（defer 残置 3件）

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

### Design（defer 残置 1件）

#### DS-19: v4-quality-gate-model.md の executed supersede の未遂形記述
- **category**: 廃止済み成果物の扱い（DS-03 近縁の時制問題）
- **target**: docs/designs/quality/v4-quality-gate-model.md:90
- **evidence**: 「v3 quality/quality-gates.md は本 Design により supersede **される**」— crosswalk-inventory.md:134 は第6段 executed 2026-09-19（quality-gates.md 実ファイル削除済み）
- **severity**: low / **confidence**: low（永続関係宣言の読みも成立）
- **source_of_truth**: crosswalk-inventory.md（第6段 executed 記録）
- **recommended_route**: KNOWN DS-03 と同一バッチでの時制整理時に併合判断
- **ng_classification**: 判断保留（parent 判断により KNOWN バッチ併合可）

### Decision / guides / README（defer 残置 1件）

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
- **20260925 F-04〜F-13（判定不能分を除く）**: F-05/F-06/F-08/F-09/F-10 は方針論点として継続。（2026-09-29 訂正: 旧記載の F-13 は 2026-09-27 に 20260926 DS-04 へ併合 promote 済みであり「継続」は簿記誤り。F-04 は 2026-09-29 に 20260928 RQ-26 へ併合 promote。F-07 は 2026-09-27 の DS-04/DB-01 併合時に本文セクション削除済み）F-08 に**証拠追加**: 後継注記方式の混在（DEC-040 本体注記追記方式、DEC-006 legacy key 方式、DEC-001/043 無編集方式）。F-09 に**隣接観察**: DEC-043.md:41「運用契約の正は配布 skill reference…が所有する」が superseded 後も現在形、DEC-044.md:14,60-61,87「決定1〜3は本 Decision が維持する」が DEC-046 採用後の現行と部分不一致
- **20260914 GUIDE-6 / 20260925 F-07**: （2026-09-29 同定解消）GUIDE-6 は 20260914 ファイルに本文現存（guides/artifacts-and-state.md 状態モデル制約節が対象）であり、20260926 GD-02 と同一対象節を指す。F-07 は 2026-09-27 の DS-04/DB-01 併合時に本文セクション削除済み（追跡終了）

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
- 2026-09-29 実施（backlog-auto stage 2 inspect 系統、--auto なし）: promote 15件（RQ-21/22/23/24/25/26/30・DS-14/15/16/17/18/20・DC-11・GD-04。うち RQ-23/RQ-24/RQ-25/DS-15 は HITL、残り 11件は自律確定）→ promoted/inspect-docs-promoted-20260928T145126Z.md へ原状保存・本ファイルから削除。20260925 F-04 を RQ-26 へ併合（対象同一）。defer 5件（RQ-27/28/29・DS-19・DC-12）は req-define 再壁打ち候補等として本ファイルに残置。RQ-17 は Stage 1 完了宣言が確認できないため 20260926 側で defer 継続（ユーザー確認済み）
