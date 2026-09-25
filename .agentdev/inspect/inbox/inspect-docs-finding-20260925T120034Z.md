# inspect-docs finding 20260925T120034Z

## サマリ

- スキャン対象: REQ 69 件（現行 55 / retired 14）、Decision 41 件（accepted 34 / superseded 7 / proposed 0 / 欠番 DEC-018）、Design 177 件（draft 実体ゼロ・全件 accepted 相当）、guides 13 件、README 群（root / docs / requirements / decisions / knowledge）、配布物（commands/skills Markdown: 構文・エンコーディング検査 242 ファイル、内容破損検査 212 ファイル）、機械検査スクリプト 10 種（check_integrity / check_command_format / check_extensions / check_distribution_boundary / check_autogen_freshness / check_content_corruption / check_knowledge_docs / check_design_frontmatter ほか）
- 診断体制: STEP-2 意味診断は 3 診断担当への並列委譲（REQ 体系 / Design / Decision・guides・README）で実施、fan-in で横断矛盾判定・重複排除・既知候補照合を実施。配布物整合性検査（STEP-3-1）は親が逐次実行
- 検出件数: **25 件**（high 3 / medium 14 / low 8）
- カテゴリ別内訳: MOVE（Design 分離違反含む）7 / DRIFT 4 / superseded 引用（横断契約矛盾）4 / 配布物（ID 汚染・参照・gh 直呼び）3 / 索引整合 2 / その他（宣言整合・世代境界・採番記録・将来計画境界・guides 導線境界）5
- 6観点網羅: SPLIT 1（F-15）/ MERGE 0（REQ-014/015/082 分業確認済み）/ MOVE 7 / DUPLICATE 0（行重複定義なし・REQ-014/015/082 分業確認）/ RETIRE 0（全現行 REQ が外部参照 8 以上）/ DRIFT 4
- high severity 3 件: F-01（REQ-082 が retired REQ-016 を現行所有者として参照）、F-02（配布物に REQ-083 具体参照残留）、F-03（IR-044 の REQ-036-005 準拠引用が現行行と意味不一致）

## 検出事項リスト

### F-01: REQ-082 が retired REQ-016 を現行所有者として参照【high】

- id: F-01
- category: DRIFT（retired 参照・参照ID整合性）
- target: docs/requirements/REQ-082.md
- evidence: 15 行目「caller 統合契約（…）は REQ-014/015/016 が所有し」、50 行目 対象外節「（… REQ-014/015/016）が所有」。retired/REQ-016.md:38-41 は 2026-09-20 に RETIRE（履歴注記「恒常契約は REQ-015 の既存契約が所有する」）。REQ-082 の updated は 2026-09-15 のまま廃止後未更新。シグナル 3（retired 参照 2 箇所 / 廃止後未更新 / REQ-036 のような「retired」明記慣行との不整合）
- severity: high（retired 文書が現行判断の根拠として引用されている。REQ-001-012/013 抵触）
- confidence: high
- source_of_truth: 現行 REQ-082 と retired/REQ-016 の履歴注記を正として判定
- recommended_route: intake（REQ-082 の所有者表記修正の要件化）
- ng_classification: pre-existing
- notes: REQ-015 本体が caller 統合の恒常契約を実際に所有しているかは REQ-016 移行先注記からの推定（REQ-015 本文は未深読み）

### F-02: 配布物に REQ-083 具体参照残留（IR-055 delta・strict）【high】

- id: F-02
- category: 配布物 ID 汚染
- target: src/opencode/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md:49
- evidence: check_integrity.ts IR-055 delta 検出「New strict violation: REQ-NNNN reference 'REQ-083' detected」。PR #3136（12b92f3a fix(skills): remove concrete REQ IDs from distribution references）で配布 references から具体 REQ ID を除去した変更の残存 1 件
- severity: high（配布物汚染に近い影響、機械的確定）
- confidence: high
- source_of_truth: IR-055 ルール（配布物は REQ-NNNN 参照を含まない）
- recommended_route: intake（機能的記述への置換の要件化）
- ng_classification: 今回修正対象（PR #3136 の除去漏れ）
- notes: なし

### F-03: IR-044 の「REQ-036-005 準拠」引用が現行 REQ-036-005 と意味不一致【high】

- id: F-03
- category: DRIFT（横断契約矛盾: Design が現行 REQ と矛盾）
- target: docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md ↔ docs/requirements/REQ-036.md
- evidence: IR-044 の 72 行目「…真陽性保護対象から除外する（REQ-036-005）」、79 行目付「…保護対象から除外する（REQ-036-005 準拠）」。現行 REQ-036.md:24 の REQ-036-005 は「検出事項の文言は inspect finding に統一し、検出事項ファイル名は command ごとの接頭辞に従うこと」であり保護除外記録義務を含まない。REQ-036 は 2026-09-25 13:29 更新（コミット 39aa07f3、#3140）
- severity: high（下位文書である Design ルールが上位の現行 REQ 行と矛盾）
- confidence: medium
- source_of_truth: 現行 REQ-036-005 を正として判定（source-of-truth priority）
- recommended_route: intake（IR-044 側の引用再アンカーまたは Design 自己根拠化の要件化）
- ng_classification: 今回修正対象（直近の REQ-036 更新由来の未同期の可能性が高い。git 履歴上の行付け替え確認は未実施）
- notes: F-04/F-06（IR-044 の作業履歴残留）と同一ファイルのため一括修正を推奨

### F-04: REQ-082.md:14 の移行経緯記述と phantom 範囲参照

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

### F-05: REQ-008-059 が要件テーブル外の見出し行形式で HOW 詳細を含む【前回 finding F-12 と同一・継続】

- id: F-05
- category: MOVE（Design 分離基準違反）
- target: docs/requirements/REQ-008.md:80-88
- evidence: 80 行目は `### REQ-008-059: 未確定内容の auto_ready 抑止` という見出し（テーブルは 058→060 で飛び、他行は全てテーブル行＝REQ-001-009 の連番行形式から逸脱）。85-88 行目は決定的マーカー列挙（"TBD"/"TODO"/"未定"…）、QG-1 意味判定との組み合わせ、`auto_gate.stop_reasons`/AG-ID/ACT-ID フィールド記述。シグナル 3（構造非準拠 / 内部アルゴリズム残留 / schema field 残留）
- severity: medium（停止条件の大枠を含むため安定契約例外候補として high から medium に調整）
- confidence: medium
- source_of_truth: REQ-001-009（連番行形式）と document-model Design Separation Criteria
- recommended_route: req-define 再壁打ち候補（マーカー列挙・判定結合・field 名は Design へ移動、契約本体「未確定事項が残る場合 auto_ready を true にしない」は REQ に残す）
- ng_classification: pre-existing（20260901T120043Z finding F-12 と同一内容・未処理）
- notes: check_integrity が本行を phantom 扱いするのは見出し形式を行として数えられないため。検査ルール側の未対応（false positive 素因）と箇所側の形式逸脱の両面あり

### F-06: IR-044 ルール本文の作業履歴残留（PR 番号・旧行番号参照）

- id: F-06
- category: MOVE（作業履歴残留）
- target: docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md:72,79
- evidence: 「REQ-006-082、REQ-010-008 は #1109 PR で…移行済み」「#1335（RU-0011）で true positive に分類し是正した件…REQ-006-099（Step 番号直接参照…をフェーズ名参照へ置換…）」。REQ-001-003（Design は作業履歴を記述対象外）に抵触。REQ-006-082/099 は現行 REQ-006（9 行）に不存在。シグナル 2（作業履歴残留 high-specificity + phantom 旧行番号）
- severity: medium
- confidence: medium
- source_of_truth: REQ-001-003（Design の記述対象外領域）
- recommended_route: intake（是正履歴の docs/reports/ への分離）
- ng_classification: pre-existing
- notes: 「是正根拠 PR 番号を本欄へ追記」する運用自体が検査の安定契約として意図されている可能性があり、F-03 と一括で方針判断すべき

### F-07: harness-separation-model.md の superseded DEC-002 引用が縮約注記式未修正

- id: F-07
- category: 横断契約矛盾（superseded 引用）
- target: docs/designs/foundations/harness-separation-model.md:150
- evidence: 「DEC-002（OpenCode ソース・プロジェクション分離）: 本 Design の harness 非依存原則を原本とプロジェクションの分離によって物理層で担保する。」— superseded 済み（DEC-036 が後継）の DEC-002 を「関連」節で現行根拠のように記述。同種引用は Case #3122（コミット 47918c05）で 4 ファイルが「〜由来、現行の責務体制は DEC-036」の縮約注記式へ修正済みだが本ファイルのみ旧式のまま残存
- severity: medium
- confidence: medium（「関連」節は交叉参照リストとの解釈も可能。ただし #3122 修正方針との一貫性が崩れている）
- source_of_truth: 承認済み Decision の現行 status（superseded チェーン）を正として判定
- recommended_route: intake（#3122 と同一の縮約注記式への修正）
- ng_classification: pre-existing
- notes: check_integrity の accepted-adr-only-citation WARNING 7 件のうち、現行候補と確定したのは本 1 件（v3-v4-crosswalk の DEC-002/005/007 は履歴文脈で対象外、他 4 件は #3122 修正済み）

### F-08: DEC-010 が superseded DEC-002 を現在形で「維持する」と記述

- id: F-08
- category: 横断契約矛盾（superseded 引用）
- target: docs/decisions/DEC-010.md:35
- evidence: 「DEC-002（ソース・プロジェクション分離）を維持する。」— 現在形の維持宣言。DEC-002 は DEC-036（v4 再定義）により superseded 済みで所有権移転
- severity: medium
- confidence: medium
- source_of_truth: Decision の現行 status チェーン（DEC-036 が正の所有者）
- recommended_route: intake（後継 DEC-036 への参照注記追加）
- ng_classification: pre-existing
- notes: Decision を受領時点の歴史記録として保持する立場を採るなら no-action の選択肢あり（ポリシー判断）

### F-09: DEC-022 が superseded DEC-015 決定4 を部分改定前提として参照

- id: F-09
- category: 横断契約矛盾（superseded 引用）
- target: docs/decisions/DEC-022.md:47-48,86
- evidence: 「DEC-015 決定4（…新たな層や成果物種別を導入しない）のうち…Custom Tool を新種別として導入するよう部分修正する」「決定1〜3、5〜7 は維持」。DEC-015 は DEC-036（主後継）・DEC-038/039（補完後継）により superseded。決定4 の後継群への搬送記録が見えない
- severity: medium
- confidence: medium
- source_of_truth: Decision の現行 supersede チェーン
- recommended_route: intake（DEC-036 側または Decision Map 側で DEC-015 決定4 の行き先明記）
- ng_classification: pre-existing
- notes: DEC-036 本文中に決定4 相当の搬送記述がある可能性は grep 範囲では確認できていない

### F-10: inspect-docs Design の ADF-COVERS 宣言 ID 重複

- id: F-10
- category: 宣言整合（トレーサビリティ宣言の不整合）
- target: docs/designs/commands/inspect-docs.md:8-12
- evidence: 行9 `REQ-036-001, 002, 006, 007, 008, 009, 010, 011, 024` と行10 `REQ-036-001, 004, 006, 008, 009, 010` で REQ-036-001/006/008/009/010 の 5 ID が重複。行11 ADF-COVERS(design) と行12 ADF-COVERS(implementation) が同一 ID 群 REQ-036-028〜033（#3140 で追加）を両宣言
- severity: medium
- confidence: medium（重複自体は確実。宣言重複の許容性・検査仕様は未確認）
- source_of_truth: トレーサビリティ宣言の一意性（agentdev-traceability の relation integrity）
- recommended_route: intake（重複 ID の統合または分割意図の明示）
- ng_classification: 今回修正対象（#3140 由来の直近変更）
- notes: 複数行 ADF-COVERS 宣言が意図的な分割用途（工程群別）の可能性あり。REQ-036-028〜033 の implementation 宣言は診断並列化の実際の動作変更を伴うため正当な可能性

### F-11: 「次の新規 REQ は REQ-092」の記述が陳腐化（3 ファイル）

- id: F-11
- category: DRIFT（記述と実態の乖離）
- target: docs/designs/foundations/numbering-policy.md:65、docs/README.md:15、docs/requirements/README.md:100
- evidence: 3 ファイルが「REQ-089…再利用しない（次の新規 REQ は REQ-092）」と記述。REQ-092 は 2026-09-24 に作成済み（REQ-092.md:4）で、現時点の次番号は REQ-093。AUTOGEN 管轄外の手書き段落の更新忘れと推定
- severity: medium
- confidence: medium
- source_of_truth: REQ 実ファイルの採番実態
- recommended_route: intake（3 ファイルの記述更新）
- ng_classification: pre-existing
- notes: 意図的に採番時点の記述を固定している可能性は排除できない

### F-12: knowledge README の列挙欠落・件数不一致

- id: F-12
- category: 索引整合
- target: docs/knowledge/README.md
- evidence: README 22-36 行目「13件」+ 13 ファイル列挙に対し、実ファイルは 14 件。powershell-console-stdout-crlf-bash-pipe.md（frontmatter created: 2026-09-24、REQ-056-010 由来）が列挙外。check_knowledge_docs.ts も同一不整合を検出
- severity: medium
- confidence: high
- source_of_truth: docs/knowledge/ の実ファイル一覧
- recommended_route: intake（README 列挙・件数の更新）
- ng_classification: pre-existing（2026-09-24 の知識文書追加に追随していない）
- notes: なし

### F-13: 配布 reference 中の gh CLI 直呼び記述（IR-053）

- id: F-13
- category: 横断契約矛盾（GitHub I/O の正規経路委任）
- target: src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md:51、src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md:58
- evidence: 「`gh issue list --search …` の形式で手動読取し」等。ただし直前に「operation-failed 時限定の補完手段」「書込み系は引き続き Tool 正規経路に限定」との限定付き。check_integrity IR-053 WARNING 2 件
- severity: medium
- confidence: medium（機械検出の再現は確実。違反か意図された例外かは規則側の判断）
- source_of_truth: IR-053 ルールと REQ-011-001（GitHub I/O は Custom Tool 委任）
- recommended_route: intake（IR-053 の例外条項化または記述の Tool 経由への変更）
- ng_classification: pre-existing
- notes: 両記述とも読取系 fallback に限定した contingency 手順として意図的に書かれている。検出ルール側の例外定義不足の可能性

### F-14: req-health-metrics AUTOGEN 計測日の鮮度逸脱（date rollover drift）

- id: F-14
- category: DRIFT（AUTOGEN 鮮度）
- target: docs/designs/quality/req-health-metrics.md:150
- evidence: 「計測日: 2026-09-24。」（AUTOGEN ブロック内、END 151 行目）— 当該ブロックを最終変更したコミット 39aa07f3 の committer date は 2026-09-25T13:29:34+09:00。check_integrity IR-061 NG と check_autogen_freshness CONTENT_CHANGE が同一不整合を検出
- severity: medium
- confidence: high（事実確認済み）
- source_of_truth: index-auto-generation Design「AUTOGEN 計測日は generate_indexes の最終 commit の committer date から導出」
- recommended_route: intake（generate_indexes 再生成による解消）
- ng_classification: pre-existing（日次で発生し得る既知 drift 機構。autogen-freshness-gate Design 既知）
- notes: 診断実行日との比較で日次検出され得る。既存 baseline-known 分類を維持

### F-15: REQ-036 の STEP-2 並列化受け入れ条件群（029-033）の関心混在

- id: F-15
- category: SPLIT／MOVE
- target: docs/requirements/REQ-036.md:48-52
- evidence: REQ-036-029〜033 が 3 command 契約（001-027）と別に、並列化の委譲方式・計測手順（「壁時計時間…モデル呼出とツール呼出を測定し」「同一 Git revision の診断対象 corpus と既知 finding を比較基準として」）・受入れ判定を含む。関心混在（SPLIT シグナル）+ 検証手順・測定項目の詳細（MOVE シグナル）。適用範囲（65 行目）には明記済み
- severity: medium
- confidence: medium
- source_of_truth: document-model Design Separation Criteria
- recommended_route: req-define 再壁打ち候補（032-033 の一度きりの変更検証手順は Report/Design へ、029-031 の恒常委譲契約は REQ に残す方向）
- ng_classification: 今回修正対象寄り（#3140/#3141 由来の新規行。ただし確定判断は inspect-promote 側）
- notes: 029-031（恒常契約）と 032-033（変更検証手順）の線引きは要ヒューマンレビュー

### F-16: REQ-036-002 / REQ-036-022 の移管作業叙述・schema 操作記述

- id: F-16
- category: MOVE
- target: docs/requirements/REQ-036.md:21,41
- evidence: REQ-036-002「inspect-extensions を独立公開 command として廃止すること。…決定的検査（8項目）を IR-056 / docs-check、意味診断（2項目）を inspect-skills…移管すること」（過去の移管作業の叙述 + 項目数パラメータ）、REQ-036-022「baseline_status を IR スキーマから除外すること」（schema field 操作＝DEC-013 反映の作業記述）
- severity: medium
- confidence: medium
- source_of_truth: document-model Design Separation Criteria
- recommended_route: intake（作業叙述の現行状態記述への書き換え。公開 command 集合 {inspect-docs, inspect-skills, inspect-promote} は安定契約例外として保持）
- ng_classification: pre-existing
- notes: なし

### F-17: REQ-048 の移行経緯・Legacy Baseline の REQ 所有

- id: F-17
- category: MOVE
- target: docs/requirements/REQ-048.md
- evidence: 目的節「本要件は、旧 REQ-048（ADF 実行効率第1次改善）で導入された…具体方式を…観測・評価対象として扱い直す」（移行経緯）、REQ-048-015「2026-08-22 の改善前分析は歴史的比較基線（Legacy Baseline）として保持すること」（監査・評価結果＝REQ-001-003 の REQ 記述対象外領域）
- severity: medium
- confidence: medium
- source_of_truth: REQ-001-003（REQ の記述対象領域）
- recommended_route: req-define 再壁打ち候補（Legacy Baseline の歴史定義は Report/Design へ。「baseline 定義変更時は比較可能範囲を区別する」契約のみ REQ に残す方向）
- ng_classification: pre-existing
- notes: DEC-027 が REQ-048 を第一適用対象とし baseline 運用と密接に結合。REQ 行に残すべき境界は要ヒューマンレビュー

### F-18: retired/REQ-016.md・retired/REQ-057.md の frontmatter status 欠落

- id: F-18
- category: 世代境界（retired メタデータ慣行不一致）
- target: docs/requirements/retired/REQ-016.md、docs/requirements/retired/REQ-057.md
- evidence: 両ファイルの frontmatter に status なし（他の retired 12 ファイルは `status: migrated`/`retired` を持つ）。一方で REQ-016.md:38・REQ-057.md:59 の履歴注記は「RETIRE、status: migrated、2026-09-20」と宣言しファイル内で自己矛盾
- severity: low
- confidence: medium（REQ-001-010 の必須メタデータは識別子・表題・作成日・更新日のみで status は必須ではないため慣行不一致）
- source_of_truth: 他 retired ファイルの慣例と各ファイル内履歴注記
- recommended_route: intake（status: migrated 追加）
- ng_classification: pre-existing
- notes: なし

### F-19: DEC-018 欠番の採番管理での明示記録が見当たらない

- id: F-19
- category: 採番記録
- target: docs/designs/foundations/numbering-policy.md、docs/README.md、docs/decisions/README.md
- evidence: git ec085ed8「retire REQ-042/REQ-043、DEC-018 を物理削除し main 基準へ一本化」により意図的削除。ただし numbering-policy.md に DEC-018 への個別言及なし（REQ 欠番 REQ-063〜081/084〜086/089 は docs/README.md に明記されている対比）。decisions/README.md の retired-table も空
- severity: low
- confidence: medium（numbering-policy.md を全文精読していない。別文書に記録がある可能性）
- source_of_truth: 採番ポリシー「欠番の扱いを採番ミスと意図的予約の両面から確定する」
- recommended_route: intake（欠番理由の記録追加または既存記録の所在確認）
- ng_classification: pre-existing
- notes: なし

### F-20: decisions/README トピック別ビューの superseded 注記不整合

- id: F-20
- category: README 索引（表記一貫性）
- target: docs/decisions/README.md:139,143
- evidence: 141 行目 DEC-005・147 行目 DEC-017 には「superseded by …」注記があるが、139 行目 DEC-002・143 行目 DEC-007 には同種注記がない（同一「配布基盤・ソースモデル」節内の表記ゆれ）
- severity: low
- confidence: medium（表記不整合自体は確実、重要度は低）
- source_of_truth: 同 README 内の注記慣行
- recommended_route: intake（注記の統一）
- ng_classification: pre-existing
- notes: トピック別ビューが AUTOGEN 管理か手書きか未確認

### F-21: accepted Decision による superseded Decision の類推参照（3 件）

- id: F-21
- category: 横断契約矛盾（superseded 引用・類推参照）
- target: docs/decisions/DEC-016.md:38（DEC-002 類推）、docs/decisions/DEC-019.md:37（DEC-015 類推）、docs/decisions/DEC-027.md:48（DEC-017 類推）
- evidence: いずれも relates-to の類推・方向性参照であり現行根拠としての規範引用ではないが、参照先は全て superseded（DEC-002→DEC-036、DEC-015→DEC-036/038/039、DEC-017→DEC-037）
- severity: low
- confidence: low
- source_of_truth: Decision の現行 supersede チェーン
- recommended_route: intake（後継 Decision への参照付け替え。優先度低）
- ng_classification: pre-existing
- notes: 「類推参照」は履歴的文脈に近く、範囲外とする解釈も可能

### F-22: v4-collaboration-loop Design の先送り記録（将来計画の境界ケース）

- id: F-22
- category: 将来計画混入（境界ケース）
- target: docs/designs/workflows/v4-collaboration-loop.md:70
- evidence: 「先送り記録: …REQ 級で 7 系統を正式に所有する場合は、将来段階で REQ-038 の行変更が別途必要である（本段では REQ 行文言を不変とする）」。document-model.md:449「Design に新規要件を置かない。将来要件、将来案は REQ に記述する」への抵触が限定的
- severity: low
- confidence: low
- source_of_truth: document-model Design「将来要件は REQ に記述する」
- recommended_route: intake（先送り記録の配置先方針の要件化。昇格判断は inspect-promote 側）
- ng_classification: pre-existing
- notes: 「先送り記録」ラベル付きで現行の不変性を同時宣言しており、先送り記録の正規配置先規約が存在しないため違反確定不能

### F-23: REQ-087-004 / REQ-092-003 の実装詳細参照（安定契約例外候補）

- id: F-23
- category: MOVE（Design 分離・実装パラメータ残留）
- target: docs/requirements/REQ-087.md:21（REQ-087-004）、docs/requirements/REQ-092.md:26（REQ-092-003）
- evidence: REQ-087-004 が checker 名 `broken-req-ref`/`adr-req-crossref`、関数名 `extractKnownGapNumbers`、`alloc-req-number.ts` を要件行に埋め込み。REQ-092-003 が `gh issue list --search --json labels` の CLI 詳細を記述（req-structure-review「CLI 詳細の抽象化漏れ」高頻度パターン）
- severity: low
- confidence: low〜medium
- source_of_truth: document-model Design Separation Criteria（安定契約例外候補として確信度調整）
- recommended_route: intake（詳細値の Design/SKILL 正規所有への移動）
- ng_classification: pre-existing
- notes: 両行とも外部契約を要約し詳細を例示している側面があり安定契約例外候補。checker 名は検査体系の semi-stable 契約、REQ-087 は採番スクリプトとの単一情報源維持自体が要件主文

### F-24: scan-and-doc-diagnostics.md の docs/designs/, docs/guides/ 参照（IR-055 delta）

- id: F-24
- category: 配布物参照（runtime-unresolved-reference）
- target: src/opencode/skills/agentdev-workflow-inspect-docs/references/scan-and-doc-diagnostics.md:56,57
- evidence: 診断担当対象範囲テーブル中の `docs/designs/`、`docs/guides/` 文字列参照。check_integrity IR-055 delta（WARNING、New heuristic violation）。PR #3141 で追加された行
- severity: low
- confidence: medium
- source_of_truth: IR-055（配布物は docs/designs/, docs/guides/ 参照を避ける heuristic）と同 baseline 既存 40 件超の同種参照
- recommended_route: intake（表記の一般化または baseline 登録）
- ng_classification: 今回修正対象寄り（#3141 由来。ただし同種 baseline-known 参照が多数存在するため既知パターンの側面が強い）
- notes: baseline 同種参照（他 workflow references 40 件超）は INFO として管理下にある。本件のみ新規 delta

### F-25: command-selection guide 補足節の規範的記述（境界事例）

- id: F-25
- category: guides 導線超過（規範内容の混入疑い・境界）
- target: docs/guides/command-selection.md:48-56
- evidence: 50-51 行目「工程分岐は req_draft の `artifact_actions` 存在で動的判定する。work_type（…）による固定判定は行わない」— case-ready 実行契約（REQ-030/REQ-061 系）が所有するはずの判定規則をガイドが断言形式で記述。ただし guides/README.md:4-5 は「基準は各 REQ/Decision/Design、矛盾時は基準を優先」と宣言済み
- severity: low
- confidence: low
- source_of_truth: REQ-030/REQ-061（案内は基準に従属）
- recommended_route: intake（要約許容範囲か基準への参照差し替えかの判断）
- ng_classification: pre-existing
- notes: REQ-030/REQ-061 の該当行との一致度までは照合未実施

## 推奨アクション

- 全検出事項 25 件を `.agentdev/inspect/inbox/` に保存済み。次段は `/agentdev/inspect-promote` による分類（promote/defer/reject）と採用
- req-define 再壁打ち候補（REQ 構造の本質的再構成を伴う）: F-04、F-05、F-15、F-17（4 件）
- intake 経由の局所修正候補（UPDATE/MOVE 中心）: F-01〜F-03、F-06〜F-14、F-16、F-18〜F-25（21 件）
- 一括修正推奨クラスタ: F-03 + F-06（IR-044 同一ファイル）、F-15 + F-16 + F-10（REQ-036/inspect-docs Design の直近 #3140/#3141 由来群）、F-07 + F-08 + F-21（superseded DEC-002/015/017 参照群）
- 高優先度（high severity）: F-01（REQ-082 所有者表記）、F-02（REQ-083 配布物参照）、F-03（IR-044 引用不一致）

## 対象外（Out of Scope）

- baseline-known INFO 群（check_integrity で provenance 管理下・demoted to info）: docs/designs/, docs/guides/ 参照 baseline 40 件超、unresolved placeholder（REQ-{NNNN} 等の bare 表記）、obsolete vocabulary（REQ/ADR/）、phantom REQ 行参照 baseline-known 群（REQ-006-021 / REQ-002-021/028/029 / REQ-010-053 ほか、provenance-tracked）
- REQ-010-053（DEC-013・decisions/README）: Decision Map が「REQ-010-053..057 RETIRE は DEC-009 CR-001 の適用外、欠番維持」と明記する履歴文脈のため不成立（REQ-048-019 も DEC-027 による廃止記録として同様に許容、IR-071 の REQ-002-079/080/081 は導入動機の歴史記述として許容、Report 群・retired 内の旧行番号参照は記録文書として許容）
- 文章表層品質（LLM 表現・空虚語・英語混じり）: 共通 textlint 基盤（agentdev-textlint-guard）の担当
- Command/Skill 参照妥当性・Skill 構造: `inspect-skills` 独立コマンドの対象（本診断では配布物の構文健全性・エンコーディング・文意保持・責務整合のみ実施し、いずれも 0 件を確認）
- 配布物構文健全性・エンコーディング不整合: 機械検査 0 件（BOM 0、CRLF/LF 混在は git 管理外 node_modules のみ、frontmatter 重複・見出し重複はコード例示に起因する偽陽性、存在しない command 参照は case-* 内部段階の案内記載として仕様どおり）
- Design 状態乖離 DRIFT: draft Design 実体ゼロ（frontmatter status: draft の実 Design なし）のため対象なし
- Decision 状態乖離 DRIFT: proposed Decision 0 件のため対象なし
- README 索引診断: ルート README 13 コマンド完全一致・主要導線 7 リンク全解決・内容過多なし（問題なし確認済み）
- 6観点の MERGE / DUPLICATE / RETIRE: REQ-014/015/082 分業明確・行重複定義なし・全現行 REQ が外部参照 8 以上のため新規候補なし
- bun test 全件実行: docs-check の別 STEP（品質ゲート）であり、検出事項の候補収集対象外
- docs-check 完走（intake item 自動生成・bun test）: 本診断は inspect-docs ガードレール（診断専用）に従い、機械検査スクリプトの実行結果のみ取り込み

## 診断カバレッジ（透明性）

- 機械フルスキャン: 全 69 REQ frontmatter・全 docs/*.md の REQ 参照走査・参照数集計、全 41 Decision frontmatter、全 177 Design frontmatter・パターンスキャン（将来計画/REQ 混入/Decision 混入/superseded 引用）、README 索引突合
- 深読み実施: REQ 001/006/036/048/082/087/092（+008 部分、+retired 013/016）、Design 8 件（README / v4-lifecycle-state-machine / inspect-docs / workflow-skill-model / harness-separation-model / index-auto-generation / req-health-metrics / v4-migration-and-release）、Decision 010/013/022（+grep 文脈検証 007/012/016/017/019/027/030/032/036/037/038/039）、guides README/command-selection/quickstart/charter（+consumer-project-setup 部分、diagnostics-and-maintenance 部分）
- 既知の走査限界: 範囲参照表記（例: 「REQ-034-031〜034」）は始点のみ存在検証。REQ 内の Markdown URL リンク切れは未検査。177 Design 中 169 件は frontmatter/パターンスキャンのみ
