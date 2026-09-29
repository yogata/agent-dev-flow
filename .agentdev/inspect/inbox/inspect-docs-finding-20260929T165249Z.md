# inspect-docs finding 20260929T165249Z

## サマリ

- スキャン対象: REQ 58件（retired 14件）／ Decision 46件（DEC-018 欠番、accepted 37 / superseded 9）／ Design 166ファイル（frontmatter status 全件 accepted、draft 0件）／ guides 13件／ README（root・docs・各索引）／ 配布物（src/opencode/commands/agentdev/ 13件 + skills 50系統、.opencode/ 投影）
- 診断体制: STEP-2 意味診断を 3 診断担当（REQ 体系／Design／Decision・guides・README）へ並列委譲し、親が fan-in 統合（6観点網羅、横断矛盾判定、重複排除、既知 defer/false positive 照合）。STEP-3 配布物整合性検査は親が逐次実行
- 検出件数: 新規 16件（重複排除後）。severity 内訳: low-medium 3件／ low 9件／ info 4件
- 機械的検査: check_integrity NG 0新規（0 new unmanaged NG）、command_format / extensions / distribution_boundary / templates / autogen_freshness 0違反、check_changed_docs は対象変更なし（main == origin/main・clean）、lint_skills WARNING 1件（description aggregate budget、RU-0018 層1 既知・継続。総量 17929 chars / N=49 / avg 365.9 > 予算 350×49）、配布物エンコーディング（BOM 0・CRLF/LF 混在は node_modules 配下の third-party のみ）、frontmatter/H2 重複 0件、コマンド参照突合 13=13 一致
- 主要新規テーマ: ①retired/REQ-013 から現行不存在行 REQ-006-040 への dangling 参照（RQ-31）②REQ-046 廃止判定予約の未消化（v4.0.0 final 通過済み、RQ-32）③case-auto.md:158 が superseded DEC-015 を「現行の責務体制は」と現行権威表記（DS-21）④docs/README.md の DEC-028 行に generator spec 上の superseded 注記が導出されていない（DC-14）⑤REQ-090-007 が REQ-035 と同一内容の重複宣言（RQ-33）⑥custom-tool-contracts.md の REQ-090 行逐語複製と実測観測刻印（DS-23/24）
- 前回 RU-0136 対象の状態: DS-14（case-run.md:236/240/247/271 の v2:REQ-0158-002 SSoT 宣言）・DS-20（:239/267/269「项」）とも残存（req-define 待ち・解消未確認）。簡体字全走査では docs/ 全域で case-run.md のみヒット

## 検出事項リスト（defer 残置 8件）

### REQ 体系（defer 残置 3件）

#### RQ-34: REQ-060-007 が timeout 数値帯（実装パラメータ）を要件行に保持
- **category**: 文書分類（Design 分離）
- **target**: docs/requirements/REQ-060.md:22（REQ-060-007）
- **evidence**: 「実行 timeout を明示指定すること（全体実行の実測所要時間が既定 timeout を超えるため、300〜600 秒の指定を標準とする）」。対照的に REQ-050-016（REQ-050.md:36）は「本行は固定数値を記載しない」と明記し、プロジェクト内記載方針と不整合
- **severity**: low / **confidence**: medium（実測根拠付きの運用標準として REQ 性を保持する判断も可能）
- **source_of_truth**: REQ-001-067 分離基準（REQ-001.md:79）+ REQ-050-016 の前例
- **recommended_route**: req-define 再壁打ち（数値帯を checker 実行契約 Design へ移管し「timeout 明示指定の義務」のみへ縮約）
- **ng_classification**: pre-existing

#### RQ-35: REQ-003-012 が result state enum の値列挙を要件行に保持
- **category**: 文書分類（enum 値一覧）
- **target**: docs/requirements/REQ-003.md:31（REQ-003-012）
- **evidence**: 「completed-pr、blocked、failed、delegation-unavailable のいずれか1状態を case-run へ返すこと」。result 4状態の正本は v4-delegation-contracts / v4-lifecycle-state-machine Design。REQ-014-012 は「case-run result enum の第5状態ではなく」と Design 所有を参照する形式
- **severity**: low / **confidence**: medium（REQ-003 は「許可、禁止、承認の境界のみ」と自己宣言し、閉じ性の境界定義という解釈も成立）
- **source_of_truth**: v4-delegation-contracts Design（result 状態正本）+ REQ-001-067
- **recommended_route**: req-define 再壁打ち（「Design 定義の result 状態集合から1状態を返すこと」へ縮約するか境界定義として維持）
- **ng_classification**: pre-existing

#### RQ-36: REQ-008 が SPLIT 検討相当（行数シグナル +1 × Design 分離違反候補の重畳）
- **category**: SPLIT（構造観察・INFO）
- **target**: docs/requirements/REQ-008.md（61行）
- **evidence**: req-health-metrics.md:94-95 で行数シグナル +1。既知 RQ-16（REQ-008-051〜054 の schema fields 埋め込み）と合算すると SPLIT シグナル 2 相当 = 同 Design:80「SPLIT 検討」ゾーン。REQ-008-050〜062（req-define/RU 生成契約）は REQ-004（要求の形成と合意）側への分離候補
- **severity**: info / **confidence**: medium（関心分類数等の正式計測は req-impact-map ベース機械計測が正）
- **source_of_truth**: docs/designs/quality/req-health-metrics.md（REQ-001-044 の定量定義所有）
- **recommended_route**: req-define 再壁打ち（SPLIT 検討として正式計測・判断。REQ-010.md:60 の「draft type registry（REQ-008）」運用例外の範囲確定を含む）
- **ng_classification**: 判断保留

### Design（defer 残置 2件）

#### DS-22: harness-separation-model.md:72 が DEC-015 固有用語のまま所有を記述
- **category**: Decision current-authority（表現鮮度・注記付き）
- **target**: docs/designs/foundations/harness-separation-model.md:72
- **evidence**: 「並列判断と並列起動機構の境界（DEC-015（superseded by DEC-036/038/039））: …判定は ADF の決定論的実行中核が所有し」。「ADF の決定論的実行中核」は DEC-015 固有用語で後継 DEC-036/039 の語彙に未更新。同ファイル:151 は正しい形式
- **severity**: low / **confidence**: medium-high
- **source_of_truth**: DEC-036/038/039 + v4-lifecycle-state-machine.md:22（「継承」形式の対比例）
- **recommended_route**: designs 修正候補（「DEC-015 由来、現行は DEC-036/038/039」or「継承」形式へ）
- **ng_classification**: pre-existing

#### DS-25: Design 4件に将来計画・未確定事項の小規模記述
- **category**: 将来計画混入（document-model 対象外列「将来の変更計画」との字面上の緊張）
- **target**: docs/designs/foundations/project-extensions.md:123（「専用表現の要否は将来の判断事項とする」）、docs/designs/integrity/index-auto-generation.md:219（「将来、導出規則と生成機構を別要件で確定すれば…拡張ポイント」）、docs/designs/authoring/command-file-format.md:17（「将来…集約先として拡張余地を持つ」）、docs/designs/integrity/autogen-freshness-gate.md:79（「将来の評価対象として記録するが、現行gate契約は変更しない」）
- **evidence**: いずれも自己限定・公認済み（README 記載）の小規模記述。v3-v4-crosswalk / v4-migration-and-release の「後続 v4 Implementation Sequence」は DEC-034 承認済み境界で適法
- **severity**: info / **confidence**: medium
- **source_of_truth**: document-model.md:60（Design 対象外列）
- **recommended_route**: 方針論点（document-model の許容境界明確化時に統合判断。個別是正不要）
- **ng_classification**: 判断保留

### Decision / guides / README（defer 残置 3件）

#### DC-13: DEC-018 欠番が decisions README と欠番レジストリに未記録（再検知）
- **category**: 索引整合（欠番明記）
- **target**: docs/decisions/README.md baseline-table、docs/designs/foundations/numbering-policy.md:57-66
- **evidence**: numbering-policy.md:55「欠番は各 README、索引類で『欠番』として明記し」に対し、既知の欠番節は REQ のみ掲載で DEC-018 の記載なし（ファイル全体 grep 0件）。baseline-table は DEC-017→019 を無注記で並べる。記録は v3-v4-crosswalk.md:51 のみ
- **severity**: low / **confidence**: high（規則文言に対する明確な未充足）
- **source_of_truth**: numbering-policy.md「欠番の扱い」節
- **recommended_route**: decisions README（AUTOGEN 節または手動節）と numbering-policy 既知欠番レジストリへ DEC-018 明記。REQ 欠番（docs/README.md 明記済み）との非対称解消
- **ng_classification**: pre-existing
- **notes**: 20260925 F-19 と同趣旨の再検知（20260914/20260927 にも言及）

#### GD-05: supervisor-credential-bridge.md:115 に日付付き実測記録（軽度）
- **category**: guides scope（履歴・監査要素の混入候補）
- **target**: docs/guides/supervisor-credential-bridge.md:115
- **evidence**: 「実測記録（2026-09-28、Case #3190 実行時）: 本ガイドと配布物…の旧変数名の言及は 0 件であり…」。ガイド内に日付・Case 番号付き実測証跡。同節 :101 は「確認手順と条件発火記録」と構造化され診断手順の一部という性格。DEC-040 履歴の扱い自体は模範的（:117「現行契約の正は DEC-046」）
- **severity**: info / **confidence**: medium（移設必須とは言えない）
- **source_of_truth**: docs/guides/README.md:4（案内層定義）+ docs/README.md Report 分離
- **recommended_route**: docs/reports/ または docs/knowledge/ への移設 or 現状維持の判断
- **ng_classification**: pre-existing

#### RM-02: docs/README.md Report 節に reports/ へのリンクなし（知識節との非対称）
- **category**: README index（ナビゲーション非対称・軽度）
- **target**: docs/README.md:233-236
- **evidence**: 知識節 :230 は `[knowledge/](knowledge/)` リンク付き、Report 節は `docs/reports/` のコード表記のみで Markdown リンクなし。機能的な到達経路は guides/project-docs-and-specs.md:49-56 等に存在
- **severity**: info / **confidence**: high
- **source_of_truth**: docs/README.md の索引責務（ドキュメント入口）
- **recommended_route**: Report 節に `[reports/](reports/)` リンク追加
- **ng_classification**: pre-existing
- **notes**: 軽微観察: root README 主要導線表に docs/README.md（ドキュメント入口）への導線なし（到達は guides README 経由の 2 ホップ）。導線追加の要否は document-type-responsibilities 側の判断

## KNOWN（継続確認・状態更新）

### 既知 defer 項目の残存確認（今回観測分）

- **20260926 RQ-13**（行番号欠番集約）: 残存（REQ-090: 008 を再観測。加えて REQ-006-001〜104 の大口欠番と RQ-31 の dangling 参照を対象追加提案）
- **20260926 RQ-14**（REQ-053-041/042 の関心ズレ）: 残存。今回の分析追加: MOVE 先候補は REQ-003（副作用境界）または REQ-018（worktree 構造的制約）。REQ-053-025/026 の書込み前適用の前堤という関連性を重視するなら REQ-053 内保持＋所有宣言の明示化も可
- **20260926 RQ-15**（REQ-090-011）: 残存（schema field 名・実呼出し検証手順の Design 移管案を再確認）
- **20260926 RQ-16**（REQ-008-051〜054）: 残存。対象追加提案: REQ-008-058 前半（operation enum 3値＋旧/新別名の非受理列挙。後半は Design 移管宣言済み）。20260925 F-05（REQ-008-059 見出し形式・機械計測漏れ）も継続
- **20260926 RQ-20**（retired status 値混在）: 残存
- **20260926 DS-03**（v4-traceability-model の物理削除済み v3 Design 現在形参照）: 残存
- **20260926 DS-13**（Design 索引 references/ 独立行）: 残存（README.md:154、:180 の2行。規則文言 :55 との運用揺れ）
- **20260926 DC-02**（DEC-015 補完後継逆参照欠落）: 残存＋designs 側引用表記の新規証拠（DS-21/DS-22）
- **20260926 DC-06/DC-07/DC-10**（Decision Map 系）: 残存（DC-10 へ DEC-047 トピック未掲載を対象追加 = DC-15）
- **20260926 GD-02/GD-03、20260926 RM-01、20260901 F-10、20260914 F-04/F-05**: 残存（今回の観測範囲では変化なし）
- **20260928 defer 5件**（RQ-27/28/29・DS-19・DC-12）: 残存（inbox 残置のまま）
- **AG-005**（lint_skills description aggregate budget、RU-0018 層1）: 継続。総量 17929 chars / N=49 / avg 365.9 > 予算 350×49=17150（新規 unmanaged delta として検出）
- **RU-0136 対象（20260928 promote 済み DS-14/DS-20）**: 修正未着地。case-run.md:236/240/247/271 の v2:REQ-0158-002 SSoT 宣言と :239/267/269 の「项」3箇所は残存（req-define 経由の修正待ち）。docs/ 全域の簡体字特有字形走査では case-run.md のみヒット

### 観察（対応不要推奨）

- **DEC-032:28 / DEC-039:50 の「DEC-015 本体は v3 として有効のまま保持する」宣言**: frontmatter のみ supersede・本文不変の正規慣行に従う固定記述であり執筆時点で正確。現行権威は索引/frontmatter で正しく後継に向いているため対応不要

## 解消確認（前回指摘の解消）

- **RQ-21/22**（REQ-092 再定義への REQ-093・タイトル追随）: 解消様子。REQ-092 title は再定義後（issue_list 運用規律）、REQ-093 title「agentdev_gh 起動環境障害の予防・診断・回復の恒久化」（frontmatter updated 2026-09-28/09-29）。次回診断で正式な解消確認対象
- **20260928 promote 済み DS-15/16/17/18・RQ-23〜26/30・DC-11・GD-04**: 本診断の範囲で直接検証せず（次回診断で解消確認対象。DS-17 は DS-24 の同種新規行を検出）

## docs-check route 候補（機械的検査に落とし得る意味的疑い）

- RQ-31: retired/ 配下からの dangling 行参照検出（broken-req-ref 検査の retired 側拡張候補）
- DC-14: superseded_by 保持 DEC 行の docs/README 注記導出一致検査（check_autogen_freshness の content_change 系拡張。20260928 DC-11 と同種）
- DS-21/DS-22: 「現行の責務体制は DEC-XXX」形式と DEC status の突合（IR-065 系語彙検査の拡張候補）
- DS-20（継続）: 簡体字走査の docs/designs 範囲拡張（check_content_corruption 拡張。今回の全走査では case-run.md のみヒット）

## カバレッジ（診断体制の限界の申告）

- REQ 体系: 全 58 現行 + retired 14 の行ID・参照の機械的突合（1330参照出現・ユニーク95ID 全解決確認）、重点精読は REQ-001/003/006/008/010/014/015/035/046/048/054〜056/061/082/087/090/091 系、残りは grep 掃引（行欠番・retired 参照・frontmatter・Design 分離シグナル）。6観点の正式計測（関心分類数・artifact 種別数）は req-impact-map ベース機械計測に依存
- Design: 166 ファイル status 全件照合・索引突合、精読は重点（Jev/REQ-090 同期、DEC-047 textlint vendor、worktree-operations、distribution-boundary、artifact-contracts、将来計画語彙掃引）。skills 系・integrity/rules 大半は grep スクリーニングのみ
- Decision/guides/README: DEC 46 frontmatter 全件・superseded 9件の引用先全走査、guides 13ファイル全文リンク解決検査（broken 0）、コマンド索引 13=13 突合。DEC 本文の全精読は不可（歴史引用の適法判定は引用箇側の文脈で実施）
- 配布物（src/opencode）: docs-check 8スクリプト実行（check_changed_docs は対象変更なしで usage のみ）+ エンコーディング・frontmatter/H2 重複・コマンド参照の親側直接検査。簡体字は docs/ 全域を走査

## 処理記録

- 本ファイルは inspect-docs（backlog-auto stage 1）の検出事項出力である。分類・採用は `/agentdev/inspect-promote`（backlog-auto stage 2 inspect 系統）に委譲する
- 機械的検査実行記録: check_integrity（report: .agentdev/integrity/reports/2026-09-29-integrity-report-9.md・非永続）、lint_skills（1 new unmanaged WARNING）、他 6スクリプト合格
- 2026-09-30 実施（backlog-auto stage 2 inspect 系統、--auto なし）: promote 8件（RQ-31/32/33・DS-21/23/24・DC-14/15）→ promoted/inspect-docs-promoted-20260929T165249Z.md へ原状保存・本ファイルから削除。うち DS-21 は 20260929T170714Z GR-03 と、DS-24 は同 DS-01（DS-23 と同ファイル群）と、DC-14 は同 GR-01 と対象統合（backlog-review で束化判定）。defer 8件（RQ-34/35/36・DS-22/25・DC-13・GD-05・RM-02）は本ファイルに残置（RQ-34 は 170714Z RQ-05 と統合 defer。REQ-060-007 は同日 learning 評価で実測裏付け済み・変更要求なし）。HITL 承認: RQ-32・RQ-33（2026-09-30 ユーザー承認）
