# inspect-docs finding 20261017T102200Z

## サマリ

- スキャン対象: 現行 REQ 72件、retired REQ 19件、Decision 59ファイル（DEC-018 欠番。accepted 50 / superseded 9 / proposed 0）、Design 184件、guides 14件、knowledge 35件、README 群（docs/README.md、docs/requirements/README.md、docs/decisions/README.md、docs/designs/README.md、docs/guides/README.md、root README.md）、Command 18件+README、Skill 63件（.opencode 投影。配布正本は src/common/）。
- 検出事項: 11件。medium 2件（DC01、GR12）、low 9件（RQ16〜RQ18、DS34〜DS37、DC02、GR13）。
- 診断焦点: 2026-10-16T03:47:54Z（前回診断）以降の delta（commits 112eca7f、cfe1c1a0、67393213、bb6b7e0c、482c3657、8d6787d8。REQ-110-016〜021 追加、REQ-114-016/017 追加・REQ-114-010 拡張、DEC-059 supersede_note・DEC-060 新設、backlog-auto 一気通貫 Release 対応、phase-artifacts-update 初回作成・直接採用拡張、guides command-selection/glossary 更新）。delta 窓の全文読解と全体スキャンを並行実施。
- 推奨経路: intake 中心（要ヒューマンレビュー）、docs-check ルール候補 4件。
- NG 分類: 全 11件とも pre-existing（今回診断実行時点の main 既存。今回は修正を実施しない）。

## 診断基準と被覆

STEP-2 の意味診断は REQ 体系・Design・Decision/guides/README の3診断担当へ非同期並列委譲し、親が fan-in した。回収確認: 3担当すべて完了（REQ 体系 9m20s、Design 7m15s、Decision/guides/README 7m3s）。6観点網羅確認: SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT すべて REQ 体系担当の結果で被覆（DRIFT のみ RQ17 の low 1件、他5観点は対象なしを根拠付きで確認）。横断矛盾判定: source-of-truth priority（現行 REQ > 承認済み Decision > Design > guides）で担当間の判定矛盾なし（RQ17 と DC01/DC02 は同一 DEC-059/060 チェーンの補完関係、GR13 と REQ 担当の docs/README.md 導線「問題なし」判断は方針未明文化の不確実性を GR13 側に明記済みで実質矛盾なし）。重複排除: 同一対象・同一根拠の候補なし。既知 defer / false positive 照合実施（後述）。機械検査は repo root から実行し全て有効結果を取得。

## 機械検査証拠の採用判断

| 証拠 | 判定 | 根拠 |
|---|---|---|
| check_integrity（repo root、source profile） | 採用 | exit 0・NG 0・新規 unmanaged NG 0（delta 0）。Permanent exemptions: warning 7件 demoted、NG baseline: baseline-known 2 + approved additions 64 は管理済み |
| check_distribution_boundary（repo root） | 採用 | ok・scanned_files 483（前回 482→+1、PR #3781 由来）・failures 0 |
| check_command_format | 採用 | OK |
| check_templates | 採用 | 全検査カテゴリ OK |
| check_extensions | 採用 | failures 0、schema/malformed 0 |
| check_autogen_freshness | 採用 | 索引 6件、鮮度違反 0 |
| check_content_corruption | 採用 | known-corruption-literal 0、stale-reference 0 含む全違反 0 |
| check_design_frontmatter | 採用 | 違反 0 |
| check_knowledge_docs | 採用 | 構造違反 0 |
| check_skill_rename_symmetry | 採用 | renames 0、path/frontmatter 違反 0 |
| lint_skills | 採用 | AG-005 NG 0。WARNING 1件（aggregate budget 20619 > 20300、前回 20517 から増加、傾向管理継続 RU-0018 層1）+ prefix INFO（explainer 等の個人 skill、既知） |
| BOM / CRLF-LF 混在確認（親実施） | 採用 | .opencode 配布物 md 63件中 BOM 付き 0件・混在 0件 |
| README コマンド索引の実在確認（親実施） | 採用 | root README 索引 18コマンド ↔ 実在 18（commands README.md は索引対象外）、完全一致 |

機械検査の全面的クリーンを受けて、本診断の検出事項は意味診断由来に限定される。full integrity suite（bun test 全件）は docs-check / QG-4 の責務であり本診断では実施しない。

## 処理記録

- STEP-1: 対象収集（docs/requirements、docs/decisions、docs/designs、docs/guides、README 群、.opencode/）。
- STEP-2: 3診断担当へ並列委譲（読取専用・戻り値契約付き）。各担当は delta ファイル全文読解＋残り corpus 構造スキャン。親は fan-in（回収確認・6観点網羅・横断矛盾判定・重複排除・既知 defer 照合）。
- STEP-3: 配布物整合性検査は機械検査証拠（上表）と delta 配布物（PR #3781 phase-artifacts-update 拡張）の責務整合 spot 確認（command 記述と v51 Design・REQ-110-016〜021 の整合、e2e run 20261016T142343JST stage 6 検証済み）により新規検出なし。docs-check route 判定（候補 4件、後述）。未処理 artifact 確認: 各 promoted/ 空、`.agentdev/backlog/req-units/` 空、drafts なし → 未処理なし（`.agentdev/intake/inbox/` 3件は stage 2 intake 系統の正規処理待ち）。
- STEP-4: 本ファイル出力・git 永続化・完了報告。
- 2026-10-17 実施（backlog-auto stage 2 inspect 系統、--auto なし）分類確定: promote 2件（RQ18〔scope: `<!-- 【必須】 -->` 3箇所のテンプレート残骸除去。4列表・ぶら下がり段落は意図的選択の可能性により対象外として promoted 成果物に付随観察記載〕・DS34〔実装反映済みの命令形作業指示の現行化。:173-175・:181〕→ promoted/finding-20261017-req112-template-debris.md、promoted/finding-20261017-local-case-file-tense-fix.md へ保存・本ファイルから削除）/ reject 1件（DS35。2026-10-16 promoted finding-20261016-req114-doc-fix-candidates.md〔REQ-114-013 設計記録節の処遇判断。backlog-review で処理済み・promoted/ は消費後に空〕と同一対象の重複で新規成果物を持たないため即時削除。cleanup モデル REFERENCE/MOVE 候補の増分は commit message の却下理由に記録）/ defer 8件（DC01・GR12・RQ16・RQ17・DS36・DS37・DC02・GR13。本ファイルに残置）。分類は Jev 先行評価（観測 20261017T103421Z-8bf9。RQ18 は evaluator defer 0.72 → 最終判断 promote〔differenceReason: semantic_disagreement。scope 限定と 20261016 DS33 前例により adversarial-review が支持〕）＋ adversarial-review 2 stream（分類妥当性・証拠適合）convergence 後に全件自律確定（HITL 対象なし・破壊的変更なし）。発動条件判定: 手動分類対象は存在するが HITL 確定を要する本質的争点は残存しないため、条件付き化された後続 trigger 評価は生成せず（観測なし=契約どおり）。defer 分の統合・再評価条件: DC01 は 20260926 DC-07・20260927 DC-10・20261011 GR06 と同一 Map・同一論点（Decision Map 掲載基準未文書化）のため同時再評価（Map 一括反映・掲載基準明確化時）。GR12 は 20261008 F-25 と同一対象表のため同時再評価（REQ-099-018 組合せ記録〔phase 系 Senpi 解決可否〕の確認時、または同ガイド次回更新時）。RQ16 は REQ-110 次回更新時・docs-check ルール候補〔TS 表と sidecar/test 実体の鮮度照合〕の実装検討時。RQ17 は REQ-114 次回更新時・第一参照導線 ID 化不足家族（RQ03/RQ10/RQ11）の同時再評価時。DS36 は custom-tool-contracts.md 次回更新時（外部依存値と Tool 契約パラメータの分離表現整理の機会）。DS37 は 20261011 DS04 と同一ファイル・同系移行期宣言のため同時再評価（crosswalk 改訂・DS04 再評価時）。DC02 は DEC-059 関連の次回更新時（文言明確化の低優先改善候補として維持）。GR13 は 20261011 GR02 家族の REQ-114 世代拡大分として同時再評価（導線節の世代更新方針が明文化される時）
- 2026-10-19 実施（backlog-auto stage 2 inspect 系統、--auto なし）再評価: DC01/GR12/RQ16/RQ17/DS36/DS37/DC02/GR13 は defer 継続（自律確定）。うち RQ16/RQ17 は再評価条件（REQ-110/REQ-114 次回更新時）が本 delta で発火したため再検討: REQ-110 受け入れ条件対応節は test ファイル名列挙の構造のまま（:54-59 現物確認）、REQ-114-010 は DEC-060 内容の行内拡張を受けたが行内 Decision 参照は DEC-059 のままで DEC-060 参照追記は未実施（REQ-114.md:25 現物確認）のため、両項とも指摘構造が存続し defer 継続。DC02 は DEC-059.md:62「supersede は発生しない」断定と supersede_note（:8）の併存が現物確認でき変化なし。DC01 は Decision Map が DEC-052 supersedes DEC-044 を最終行とするまま（decisions/README.md Decision Map 現物確認）で変化なし。GR13 は docs/README.md・guides/README.md 導線節に REQ-114/DEC-059/060 未接続のまま変化なし。相互注記: 20261019 IDX-01（docs/README.md AUTOGEN 表の DEC-059 部分置換注記欠落。defer 確定）は DC01 と同一テーマ族・対象表が異なる増分のため、DC01 再評価時に併せて判定すること（IDX-01 側・20260926 側にも相互注記追記済み）

## 検出事項リスト

NG 分類は docs-spec-rebuild-integrity Design の NG 分類表に従う。全件 pre-existing（理由: 対象文言は本診断実行前の main 既存。今回修正対象なし。後続対象: inspect-promote による分類）。

### DC01（medium）decisions/README.md Decision Map への部分置換反映漏れ

- **対象**: `docs/decisions/README.md:222-263`（Decision Map 表）
- **観点**: STEP-2-6 Decision 意味診断（後継チェーンの索引反映）
- **根拠**: DEC-052 以降に承認された部分置換（DEC-055→DEC-033、DEC-056→DEC-034、DEC-060→DEC-059）が Decision Map 表に反映されていない。加えて DEC-046→DEC-040 決定2、DEC-047→DEC-028、DEC-048→DEC-036、DEC-049→DEC-036、DEC-050→DEC-045 の各行も Map 表にない。一方 DEC-051 supersedes DEC-041、DEC-052 supersedes DEC-044 は載っており、現行 DEC 同士の supersedes を載せる慣行と非対称
- **根拠とした正規情報源**: DEC-055/DEC-056/DEC-060 frontmatter relations（supersedes 宣言）、DEC-059.md:8 supersede_note、decisions/README.md の既存 Map 行（DEC-051/DEC-052 行）
- **推奨経路**: intake（Map 表への行追加）＋ docs-check rule candidate
- **不確実性**: Map の説明は「現行 Decision と過去版 ADR の履歴上の関連」であり現行 DEC 同士を掲載する契約上の義務が明文化されていない（慣行ベース）。手動テーブルのため AUTOGEN 検査外
- **NG 分類**: pre-existing

### GR12（medium）multi-host-operations.md の Command 対応表が公開コマンド 18 件中 13 件で stale

- **対象**: `docs/guides/multi-host-operations.md:93-109`
- **観点**: STEP-2-7 guides 意味診断（履歴混入: 過去時点の内容が現行として提示）
- **根拠**: 「全公開 command の対応表を次に示す（2026-10-02 時点、13件）」。phase 系 5 コマンド（phase-tasks-create/update、phase-artifacts-update、phase-review、phase-transition、DEC-057/058〔2026-10-12 採用〕）が対応表になく、「全公開」記述と生成規律（src/common/commands/agentdev/ 実ファイル列挙から生成、115-124行目）に追随していない
- **根拠とした正規情報源**: root README.md 配布コマンド索引（18コマンド）、command-selection.md:37-41、glossary.md:29-33、DEC-057/DEC-058（accepted 2026-10-12）
- **推奨経路**: intake（表更新）＋ docs-check rule candidate（対応表行数 vs 公開コマンド実ファイル数の照合。REQ-099-018 の記録規約と併せて判断）
- **不確実性**: phase 系の Senpi 探索接続での解決可否の検証記録（REQ-099-018 組合せ記録）は本診断では未確認。故意の除外の可能性は低いが更新漏れ断定前に確認が必要
- **NG 分類**: pre-existing

### RQ16（low）REQ-110 受け入れ条件対応節の TS 表による test ファイル名直書き

- **対象**: `docs/requirements/REQ-110.md:44-51`（TS-001〜TS-008 表）
- **観点**: 文書分類一貫性（実装パラメータの REQ 残留シグナル）／DRIFT 予防
- **根拠**: 「恒常検証手段: repo-agentdev-integrity の phase_domain_state.test.ts」等、test ファイル名を 5 件列挙。sidecar が正本のため REQ 側列挙との二重管理は test 分割・rename 時の陳腐化リスク
- **根拠とした正規情報源**: 同文書行 40「対応関係の正本はリポジトリ top-level traceability/ 配下の sidecar 宣言であり、本節の対応表はその所在の解決先を提供する」（自己宣言）。比較対象として REQ-103.md:57-84 の AC 表は TS 参照のみで test 名を書かない形式
- **推奨経路**: docs-check rule candidate（test 構成変更時の REQ-110 TS 表鮮度確認、または REQ 側は sidecar 宣言先参照への寄せ）
- **不確実性**: 行 40 が test 名列挙を「所在の解決先」として明示採用しており違規ではない。sidecar が正本のため REQ 側列挙が規約上必要かは patterns/document-type-responsibilities 側の定義確認が未了
- **NG 分類**: pre-existing

### RQ17（low）REQ-114-010 の行内拡張部分の Decision 正本（DEC-060）参照不在

- **対象**: `docs/requirements/REQ-114.md:25`（REQ-114-010。関連: 31-32 行の REQ-114-016/017）
- **観点**: DRIFT（REQ 側 Decision 参照の鮮度）／第一参照導線
- **根拠**: 同一行内の「ADF本体では版タグ…ごとに…GitHub Release を1件だけ対応させ…草稿を作ること（公開は…利用者が明確に認めた場合に限る）」は DEC-060 決定(1)の内容そのものだが、行内の Decision 参照は「リリース条件（Decision `DEC-059` の適用規則）」のみ。REQ 本文内に DEC-060 への参照なし
- **根拠とした正規情報源**: DEC-060.md:5（`related_reqs: [REQ-114]`）、DEC-060.md:11（supersedes DEC-059 部分）、DEC-060.md:20（`<!-- ADF-COVERS(decision): REQ-114-010, REQ-114-016, REQ-114-017 -->`）、DEC-059.md の `supersede_note`
- **推奨経路**: intake（REQ-114 本文への DEC-060 参照追記候補。版番号規則の DEC-059 参照は DEC-060 決定(2)により正しいため訂正ではなく追記）
- **不確実性**: REQ-059 の規律では関連宣言の正は Decision 側 frontmatter であり、宣言網は完全成立（乖離そのものではない）。REQ-114-016/017 はそもそも Decision 参照を持たない行スタイルで、参照必須の規約があるかは未確認
- **NG 分類**: pre-existing

### DS36（low）外部サービス観測値・API 具体の Design 固定（custom-tool-contracts Design）

- **対象**: `docs/designs/responsibilities/custom-tool-contracts.md:60-62`
- **観点**: STEP-2-5 実行時依存先としての不適切扱い（外部 API 具体の固定）
- **根拠**: 「search/issues エンドポイント（q=repo:{owner}/{repo} is:issue …）へ切替え」「GitHub search index の更新遅延（…秒〜分程度かかる可能性）、search API rate limit（30 req/min）」と外部サービス仕様の観測値・エンドポイント具体を現行契約として固定。同 Design は「物理 field 名は adapter 実装の自由度」（:90）と実装自由度を宣言する一方、エンドポイント文字列は具体規定のまま。外部仕様変更時に Design が陳腐化する
- **根拠とした正規情報源**: 同 Design:59「上限値は本 Design のパラメータとして定義する」（正当所有側）、`foundations/harness-separation-model.md`・`foundations/references/concrete-abstraction.md`（具体の抽象化方針）、DEC-049
- **推奨経路**: intake（外部依存値は「安全上限」等の Tool 契約パラメータと外部観測値に分離する表現整理）
- **不確実性**: 中。Tool 操作契約 Design は I/F 具体を正当に扱う立場であり、rate limit 値の記載を「運用注意」と呼称している程度の軽微性
- **NG 分類**: pre-existing

### DS37（low）未完了の参照付け替え指示が現行本文に残存（v4-delegation-contracts Design）

- **対象**: `docs/designs/workflows/v4-delegation-contracts.md:255`
- **観点**: STEP-2-5 未来計画の混入（作業指示の残置）
- **根拠**: 「本節が実行主体分類表の正規所有 Design である（v4 -> v5 crosswalk Design「分類スキーマ」節および責務再編系 Design からの参照は本節へ付け替える）」— 未実行の参照付け替え作業を命令形で指示。v4-v5-crosswalk（draft）の (b) 参照分類契約（`foundations/references/v4-v5-crosswalk.md:17-20`）と相互に整合しているが、本 Design 単体では未完了作業の指示が本文に残存する
- **根拠とした正規情報源**: `foundations/references/v4-v5-crosswalk.md:17-20`（参照分類 (a)/(b) 契約）、`foundations/document-model.md:47`（作業履歴の禁じ手）
- **推奨経路**: intake（crosswalk 側に処遇追跡を寄せ、本 Design 側は現行所有宣言のみに整える）
- **不確実性**: 中。living tracking（crosswalk）の管理下にある管理された移行であり、単独では violation と断定できない
- **NG 分類**: pre-existing

### DC02（low）DEC-059 承認記録の「supersede は発生しない」断定と DEC-060 部分置換の併存

- **対象**: `docs/decisions/DEC-059.md:62`
- **観点**: STEP-2-6 Decision 意味診断（DEC 内部整合）
- **根拠**: 62行目「status は accepted を維持する（後継 Decision 作成・supersede は発生しない）」。同日付（2026-10-16）で DEC-060 が DEC-059 決定(1)「公開操作」を部分置換しており、frontmatter supersede_note（8行目）が追加されている。文書内に「supersede は発生しない」という履歴記録が残る一方で supersede_note が存在する同士の併存は、読者が誤読し得る
- **根拠とした正規情報源**: DEC-059.md:62、DEC-059.md:8、DEC-060.md:9-11
- **推奨経路**: intake（文言明確化の低優先改善）
- **不確実性**: 承認記録は時系列記録であり、当該非意味修正時点の記述として矛盾しないとの解釈が成立する。supersede_note が現行状態の正を表す
- **NG 分類**: pre-existing

### GR13（low）「現在像への導線」に REQ-114 / DEC-059 / DEC-060 の基準導線が存在しない

- **対象**: `docs/README.md:9-22`、`docs/guides/README.md:19-31`
- **観点**: STEP-2-8 README 索引診断（導線欠落。stale entry ではなく新規承認分の未接続）
- **根拠**: 導線節は v4 / v5 基盤 / v5.1 の世代単位で構成され、REQ-112〜114 と DEC-059/DEC-060 が現れない。一方 guides 側（quickstart.md:4、command-selection.md:31、intake-learning-backlog-flow.md:102）は一気通貫実行・パッチリリースを案内しており、その基準（DEC-059/DEC-060）へ入口から導線が提供されない
- **根拠とした正規情報源**: DEC-059/DEC-060（accepted）、docs/README.md:15-22 の節構成
- **推奨経路**: req-define または intake（導線節の世代以降の扱い方針確定が先決）
- **不確実性**: 導線節が世代確定単位でのみ更新する運用の場合は指摘過剰（REQ-112/113 も同様に未掲載で一貫）。方針自体は未明文化
- **NG 分類**: pre-existing

## 6観点 fan-in 結果

| 観点 | 判定 | 根拠（代表証拠） |
|---|---|---|
| SPLIT | なし | REQ-041⇄REQ-114 の責務分割を双方で宣言（REQ-041.md:18、REQ-114.md:30）。REQ-110 内 008→016/017 参照接続済み（REQ-110.md:23） |
| MERGE | なし | REQ-112→REQ-113 は REQ-112-003・末尾行が宣言した意図的後続 REQ 分離。REQ-110-016〜021 は REQ-110 内に一貫整理（TS-008・適用範囲まで反映済み） |
| MOVE | なし | retired/ 配置 19 ファイル = README 廃止表 19 行、完全一致。現行 REQ からの廃止行参照 0 件（182 件のヒットはすべて retired/ 内の履歴記録） |
| DUPLICATE | なし | REQ-041:18 と REQ-114-015 の相互宣言で重複回避。REQ-105/106（正式確定・増分更新一般）と REQ-110（戻り入力受理固有規律）は関心分離確認。REQ-110-010（閲覧像）と REQ-111-001（独立レビュー所見）は第二正本禁止・完了認定禁止で分離 |
| RETIRE | なし | 廃止表・retired 配置・欠番レジストリ整合。ID 再利用なし |
| DRIFT | あり（low 1件） | RQ17 のみ。DEC-059 側 supersede_note・DEC-060 側 related_reqs/ADF-COVERS 宣言網は完全で、乖離ではなく REQ 側参照の鮮度問題に限定 |

第一参照導線: 問題なし（docs/requirements/README.md 現行表 72 件に REQ-110・REQ-114 登録済み、AUTOGEN 件数表記と実測一致）。

## 既知 defer / false-positive 照合

- inbox 残置 finding（DS02-DS05、DS10、DS14、DS16、DS22、DS26-DS33、RQ03、RQ07-RQ15、GR04-GR07、GR09、GR11、初期 4件）と新規候補（DC01-02、GR12-13、RQ16-18、DS34-37）の識別子衝突なし。
- DS34・DS35・RQ18 は既知 deferred の内容重複の可能性を不確実性欄に明記（内容ベースの同一性は inspect-promote の分類判断に委譲）。
- managed baseline（REQ-010-053/REQ-002-028/REQ-003-030 phantom 引用、`REQ-{NNNN}` placeholder、v2:ADR 履歴参照 AG-010 保護、lint_skills prefix INFO 等）は再報告対象から除外済み。
- docs/README.md 大型テーブルの内容過多懸念は AUTOGEN 生成構造であり既知 DEFERRED（DS 系）との重複が疑われるため新規採番せず。

## 対象なし確認（観点別）

| 観点 | 判定 | 補足 |
|---|---|---|
| Design: REQ/Decision/guides 代替 | なし | patterns.md:41-58 の `## 要件` 見出しは REQ ファイル書式テンプレートの説明。req-health-metrics.md は閾値定義に限定し「本 Design 自体は計測ロジックを実装しない」(:188) と境界明示。req-impact-map.md は REQ 行逐語複製なし。draft 2 件（v5-adopted-conventions、v4-v5-crosswalk）は draft status と本文一致 |
| Design: status drift | なし | superseded DEC（002/005/007/015/017/029/030/040/043）への全参照が注記付き。部分置換条項（Wave 収束前提〔DEC-041→051〕、閾値ルーティング〔DEC-043→044〕等）の現行扱い残存なし（case-auto.md:218、workflow-skill-model.md:74 は DEC-051 準拠形） |
| Decision: 現行権威への誤引用 | なし | superseded DEC 参照はすべて履歴区分付き（supervisor-credential-bridge.md:117/138 の DEC-040 が代表例）。guides 内 proposed 語 0 件 |
| guides: ナビゲーション範囲超過 | なし | 全 14 ファイルが正の所在を REQ/DEC/Design 参照で明示し基準へ委譲 |
| README: 内容過多・stale・範囲超過 | GR12 のみ（対応表 stale）| GR13 は導線欠落。root README 索引 18↔18 一致 |

## 観察メモ（finding としない）

- REQ-114 に「受け入れ条件対応」節がない点: TS 番号付与方針（REQ-103/REQ-110 のみが TS 台帳を所有）の運用と推定され、節不在を制度化違反と断定する正規根拠を確認できなかったため対象外。
- v2:ADR 履歴参照を現行契約の根拠として頻用する記述（case-auto.md 等）: AG-010 履歴参照保護・IR-065 検出対象外の管理下のため新規指摘せず。
- project-extensions.md:241-251（yomiyasu 節）の repo-local 具体パス: REQ-098 の design 対応所有を宣言し repo-local 運用と標準仕様を区別（:222-223）済みのため対象外。
- DEC-040 が部分置換ながら status superseded 扱いの非対称: DEC-052 が「DEC-040 は全体として superseded のまま」と明示記録済みのため確定事項。
- artifacts-and-state.md:48-55 の tree 図インデント: 見た目の整形域で文意への影響小のため対象外。
- REQ-110-016〜021 追加に伴う delta（REQ-110-008 参照改訂、TS-008 拡張、適用範囲拡張、traceability/agentdev-workflow-phase-artifacts-update.yaml sidecar 宣言）は完結しており新規問題なし。REQ-114 の外部参照先（REQ-034-027/038/040、REQ-008-010、REQ-061-025、REQ-039-001）すべて実在・文意一致。

## docs-check ルール候補（STEP-3-2）

1. **Decision Map 行と frontmatter relations supersedes 宣言の照合**（DC01 由来。部分置換を含む現行 DEC 同士の supersedes が decisions/README.md Map に反映されているか）
2. **multi-host 対応表行数と公開コマンド実ファイル数の照合**（GR12 由来。REQ-099-018 の記録規約と併せて判断）
3. **REQ-110 TS 表の test ファイル名と sidecar/test 実体の鮮度照合**（RQ16 由来）
4. **テンプレート残骸コメント（`<!-- 【必須】 -->` 等）の検出**（RQ18 由来）

## 推奨アクション

- 検出事項 11件（medium 2件: DC01、GR12 / low 9件）を inspect-promote（backlog-auto stage 2 inspect 系統）で分類・処理。medium 2件の優先的な確認を推奨。
- docs-check ルール候補 4件は将来の check_integrity / 専用 checker 検討材料。

## 対象外（Out of Scope）

- 検出事項の分類・採用・処分（inspect-promote の責務）
- 検査対象ファイルの修正（本 workflow は診断専用）
- full integrity suite（bun test 全件）の実行（docs-check / QG-4 の責務）
- GitHub Issue/PR の作成・更新

- 2026-10-27 実施（backlog-auto stage 2 inspect 系統、--auto なし）再評価: DC01/GR12/RQ16/RQ17/DS36/DS37/DC02/GR13 は defer 継続（自律確定）。発火済み再評価条件の再検討: RQ16〔REQ-110 次回更新時 発火〕は TS-001〜005/TS-010 の test ファイル名直書き6件存続を現物確認（REQ-110.md:64-73、sidecar 正本宣言不変・REQ 側列挙要否の規約確認未了）のため defer 継続。RQ17〔REQ-114 次回更新時 発火〕は REQ-114-010 の行内 Decision 参照が DEC-059 のままで DEC-060/061 参照追記未実施を現物確認（REQ-114.md:25、行内参照必須の明文規約未確認）のため defer 継続。GR12〔同ガイド次回更新時 発火〕は cursor 表現の表層修正のみで対象表（multi-host-operations.md:93「2026-10-02 時点、13件」）が未更新のまま存続を現物確認し、REQ-099-018 組合せ記録確認の前提未了のため defer 継続。増分: 20261026T190542Z IDX-06（DEC-061→DEC-060 行の Map 未掲載・DEC-062 のみ掲載の非対称を実確認）を DC01 へ、IDX-07（REQ-114-010/016 の DEC-061 由来拡大を実確認）を RQ17 へ増分併合し、DC01 族・ID 化不足家族の同時再評価条件に統合。DC02 は DEC-059.md:62 現物確認で変化なし（stage 1 診断報告）、DS36/DS37 は対象条件変化なし、GR13 は DEC-061/062 も同構造で未接続のまま（stage 1 診断報告）
