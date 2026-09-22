# inspect-docs finding 20260901T120043Z（defer 残置分）

> 本ファイルは inspect-promote（2026-09-01 実施、/agentdev/backlog-auto 経由）の分類確定後、defer となった検出事項のみを残置する。promote 採用分（F-01〜F-07, F-13〜F-26, F-28〜F-33, F-35 の27件）は .agentdev/inspect/promoted/inspect-docs-promoted-20260901T120043Z.md へ保存済み。reject 0件（旧 20260815 ファイルの F-15 のみ reject・即時削除済み）。
> 2026-09-07 実施（backlog-auto stage 2 inspect 系統）の再評価で F-36 を、2026-09-16 実施（backlog-auto stage 2 inspect レーン、直列実行）の再評価で F-08/F-09 を、2026-09-20 実施（backlog-auto stage 2 inspect 系統、--auto なし）の再評価で F-27/F-34 を reject・即時削除した（いずれも却下理由は当該 commit message 参照）。F-11 は 2026-09-20 に再評価条件の充足（REQ-057 完了）により REQ-057 RETIRE 審査へ統合昇格（promote）した（`.agentdev/inspect/promoted/inspect-docs-promoted-20260920T105602Z.md` 参照）。残る F-10/F-12 は defer 継続。
>
> - F-10/F-12: 構造改善候補（DUPLICATE / MOVE）で採否が意味判断のため intake 送付候補

### F-10: 検証実行結果を TIM に保存しない規範が REQ-012/REQ-021 に二重規定（軽度）
- **category**: DUPLICATE
- **target**: docs/requirements/REQ-012.md:29（REQ-012-035）対 docs/requirements/REQ-021.md:26（REQ-021-019）
- **evidence**: 同一規範が表現違いで並存。両ファイルの責務分担構造（TIM 定義＝012／工程割当＝021）自体は妥当
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-001-006（索引は本文を重複保持しない）の精神に基づく重複縮約候補。相互参照で緩和済み
- **recommended_route**: 意味診断検出事項

### F-12: REQ-008-059 が要件テーブル外の見出しセクションとして定義され、内部アルゴリズム詳細を含む
- **category**: MOVE／分類一貫性
- **target**: docs/requirements/REQ-008.md:77-85。参照元 docs/designs/commands/req-define.md:381
- **evidence**: 要件テーブル（L18-75、REQ-008-001〜058）の外に独立見出しセクション。本文に決定的マーカー検査の fixture 文字列列挙（"TBD"、"TODO"、"未定" 等）と判定アルゴリズム、auto_gate.stop_reasons 記録契約
- **severity**: low / **confidence**: high
- **source_of_truth**: REQ-001-046（標準構成三区分）・REQ-001-009（テーブル行として一意識別）違反。document-model 移管候補の「内部アルゴリズム→Design」「fixture detail→Design/テスト文書」該当
- **recommended_route**: 意味診断検出事項（決定的マーカー一覧は Design またはルールカタログへ MOVE 候補）

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
- 2026-09-07 実施（backlog-auto stage 2 inspect 系統、--auto なし）再評価: F-08〜F-12/F-27/F-34 は前提条件に変化なく defer 継続（自律確定）。F-36 は reject・即時削除（自律確定）: 現行ファイル確認で「各 command の参照方法」見出しは汎用トップレベル節（H2、`---` 区切り直下）と各手順セクション内小節（H3）の正当な階層差であり設計上の反復、「見出しレベル不統一」検出パターンの誤検知と確認（前回予告の reject 余地再観查で確定。却下理由は commit message に記録）
- 2026-09-16 実施（backlog-auto stage 2 inspect レーン、--auto なし、直列実行）再評価: F-08/F-09 は解消済みのため reject・即時削除（自律確定）: #2846 により REQ-003-035〜054 が REQ-082 へ分離移管済み（SPLIT 懸念の対象が消滅）、REQ-003-054 も消滅し default-on・再起票禁止の規定は REQ-014-013 のみに単一化（REQ-003/REQ-082/REQ-014 の行実在突合で確認。却下理由は commit message に記録）。F-10〜F-12/F-27/F-34 は新情報なく defer 継続（自律確定）
- 2026-09-20 実施（backlog-auto stage 2 inspect 系統、--auto なし、in-context 審議）再評価: F-27 は reject・即時削除（自律確定）: `docs/guides/artifacts-and-state.md` から参照方向ルール記述が削除され L17 が正本参照（project-docs-and-specs.md）へ変更、参照方向ルールは `docs/guides/project-docs-and-specs.md:87-89` に集約済み（artifacts-and-state.md で「逆参照」「REQ を優先」の grep 0 件で解消確認）。F-34 は reject・即時削除（自律確定）: 対象 `agentdev-doc-writing` スキルが v4 で削除され `src/opencode/skills/agentdev-doc-writing/` が不存在（対象消滅、glob 0 件確認）。F-11 は promote 統合昇格（自律確定）: REQ-057 完了（Epic #2504/#2505/#2633 全 closed・全子 completed を agentdev_gh issue_read で直接確認）により F-11 系統の再評価条件が到来し、REQ-057 RETIRE 審査（同型群一括整理候補）へ統合（`inspect-docs-promoted-20260920T105602Z.md` へ保存）。F-10/F-12 は新情報なく defer 継続（自律確定）。却下理由の詳細は commit message に記録
- 2026-09-21 実施（backlog-auto stage 2 inspect 系統、--auto なし、in-context 審議）再評価: F-10/F-12 は新情報なく defer 継続（自律確定）: REQ-012-035（REQ-012.md:32・旧 :29 から行番号シフトのみ）・REQ-021-019（REQ-021.md:28・旧 :26 から行番号シフトのみ）・REQ-008-059 セクション（REQ-008.md:78-85）とも内容不変を grep で確認。第16段の REQ-016/REQ-057 RETIRE は両検出事項の対象領域（REQ-012/REQ-021 の二重規定・REQ-008 のテーブル外セクション）外であり、採否の意味判断条件に変化なし。adversarial-review（in-context・unresolved 0件）実施済み
- 2026-09-22 実施（backlog-auto stage 2 inspect 系統、--auto なし、in-context 審議）再評価: F-10/F-12 は新情報なく defer 継続（自律確定）: REQ-012-035（REQ-012.md:32）・REQ-021-019（REQ-021.md:28）・REQ-008-059 セクション（REQ-008.md:78）とも原状を grep で確認。二重規定の縮約採否・移管先選択はいずれも意味判断で未確定のまま、条件変化なし。adversarial-review（in-context・2系統独立 stream・convergence audit・unresolved 0件）実施済み
