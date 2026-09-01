# inspect-docs finding 20260901T120043Z（defer 残置分）

> 本ファイルは inspect-promote（2026-09-01 実施、/agentdev/backlog-auto 経由）の分類確定後、defer となった検出事項のみを残置する。promote 採用分（F-01〜F-07, F-13〜F-26, F-28〜F-33, F-35 の27件）は .agentdev/inspect/promoted/inspect-docs-promoted-20260901T120043Z.md へ保存済み。reject 0件（旧 20260815 ファイルの F-15 のみ reject・即時削除済み）。
>
> - F-08〜F-12: 構造改善候補（SPLIT / DUPLICATE / RETIRE / MOVE）で採否が意味判断のため intake 送付候補
> - F-27: guides 間の参照方向ルール分岐（正本記述が未確定）のため intake 送付候補
> - F-34: 出典履歴注記の許容可能性判断のため intake 送付候補
> - F-36: 見出しレベル不統一（設計上の反復の可能性）のため intake 送付候補・次回サイクルで reject 余地を再観察

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

### F-27: guides 間で参照方向ルールの記述が分岐（層間DRIFT）
- **category**: 層間DRIFT
- **target**: docs/guides/project-docs-and-specs.md:38-39 対 docs/guides/artifacts-and-state.md:23-25
- **evidence**: project-docs-and-specs「REQ → Issue の一方向参照である（Issue から REQ への逆参照は行わない）」／artifacts-and-state「Decision → Issue の逆参照は不可」「文書間矛盾時は REQ を優先」。2つのガイドが異なる部分集合を正として提示し、正本（document-model.md）側に対応記述を確認できず
- **severity**: low / **confidence**: medium
- **source_of_truth**: 参照規則の正本は document-model.md（document-type-responsibilities.md L13）
- **recommended_route**: 意味診断検出事項

## 配布物整合性系

### F-34: frontmatter source_note の参照先不所存（軽微）
- **category**: stale参照
- **target**: src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md:4
- **evidence**: `source_note: agent-dev-flow-japanese-replacement-dictionary-2026-07-18.md（参照資料）の内容を踏襲` — 参照先ファイル全局不所存。出典履歴注記であり意図的な歴史明記の可能性
- **severity**: low / **confidence**: medium
- **source_of_truth**: file-level 存在チェック上は参照先不在
- **recommended_route**: 意味診断検出事項（注記として許容かの判断）

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

## 審議記録（参照）

- 暫定分類（新規36件: promote 28 / defer 8 / reject 0 + 旧残置3件）→ adversarial-review 2系統独立 stream → convergence → convergence audit 完了
- promote 27件（新規）+ 旧残置 F-16/F-17（ユーザー承認で promote・Epic #2099 closed 確認により再確認条件充足）は promoted 保存済み
- 旧 20260815 F-15（workflow-skill-model draft）は accepted 昇格確認済みのため reject（即時削除済み、commit message 参照）
- 旧 20260822 F-05（draft Design 被参照）は defer 継続（該当ファイルは残置）
