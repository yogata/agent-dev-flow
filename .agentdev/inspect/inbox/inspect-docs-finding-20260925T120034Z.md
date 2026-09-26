# inspect-docs finding 20260925T120034Z（defer 残置分）

> 本ファイルは inspect-promote（2026-09-25 実施、--auto なし）の分類確定後、defer となった検出事項のみを残置する。promote 採用分（7件: F-01 / F-02 / F-03 / F-11 / F-12 / F-18 / F-20）は `.agentdev/inspect/promoted/inspect-docs-promoted-20260925T120034Z.md` へ保存済み（ユーザー承認〔HITL〕）。reject 0件。
>
> - F-04: 裁定記録を残しつつ参照形式を現行体系へ整合させる方向は req-define 再壁打ち候補（意味判断）
> - F-05: ユーザー指示により defer 継続（20260901 defer F-12 と同一内容・継続中）
> - F-06: F-03 と同一ファイル（IR-044）で一括修正の方針判断が未了
> - F-07: 「関連」節の交叉参照解釈が残り、#3122 修正方針との整合判断が未了
> - F-08: Decision の歴史記録保持 vs 後継参照注記追加のポリシー判断が未確定
> - F-09: 決定4 の後継群への搬送記述の有無確認が未了
> - F-10: 宣言重複の許容性・検査仕様が未確認（意図的な工程群別分割の可能性）
> - F-13: 読取系 contingency としての意図的記述の可能性があり、規則側の例外定義判断が未了
> - F-14: 既知 drift 機構（baseline-known。generate_indexes 再生成で解消見込み）
> - F-15: 恒常契約（029-031）と変更検証手順（032-033）の線引きが要ヒューマンレビュー
> - F-16: 作業叙述の現行状態記述への書き換えは intake 経由の意味判断
> - F-17: DEC-027 結合により REQ 行に残すべき境界が要ヒューマンレビュー
> - F-19: numbering-policy 未精読であり別文書に記録がある可能性
> - F-21: 類推参照は履歴的文脈に近く範囲外解釈も可能（優先度低）
> - F-22: 先送り記録の正規配置先規約が存在せず違反確定不能
> - F-23: 安定契約例外候補（confidence low〜medium）
> - F-24: baseline 同種参照が多数存在する既知パターン（本件のみ新規 delta）
> - F-25: 基準行との照合未実施（confidence low）
> - 2026-09-27: F-07・F-13 は 20260926T180630Z DS-04・DB-01 へ併合 promote（backlog-auto stage 2）

## 検出事項リスト（defer 残置分）

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

## 推奨アクション（defer 残置分）

- defer 18件（F-04〜F-10、F-13〜F-17、F-19、F-21〜F-25）は inbox 残置。次回以降の inspect サイクルまたは intake 経由で再評価
- req-define 再壁打ち候補（REQ 構造の本質的再構成を伴う）: F-04、F-05、F-15、F-17（4件）
- promote 採用済み: high severity の F-01 / F-02 / F-03、intake 経由の局所修正候補の F-11 / F-12 / F-18 / F-20（`.agentdev/inspect/promoted/inspect-docs-promoted-20260925T120034Z.md` 参照）

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

## 審議記録（参照）

- 暫定分類（25件: promote 7 / defer 18 / reject 0）→ ユーザー承認（HITL）により確定（--auto なし、自動 promote 0件）
- promote 7件（F-01 / F-02 / F-03 / F-11 / F-12 / F-18 / F-20）はユーザー明示承認により採用確定し、`.agentdev/inspect/promoted/inspect-docs-promoted-20260925T120034Z.md` へ保存（元 evidence は原状で保持）
- F-05 / F-07 はユーザー指示により defer 継続。その他の FID（F-04 / F-06 / F-08〜F-10 / F-13〜F-17 / F-19 / F-21〜F-25）はユーザー承認範囲外のため承認を新設せず defer（inbox 残置）
- reject 0件
- 旧 defer 残置分（20260901 / 20260914 の 2ファイル、計5件）は本 run では一切変更していない（原状維持）
