# inspect-docs finding 20261115T103843Z

実行日: 2026-11-15（UTC 20261115T103843Z / JST 2026-11-15 19:38）。実行基点: main aa5123e5。
本 finding は `/agentdev/inspect-docs`（STEP-1〜4 一気通貫、STEP-2 意味診断は 3 診断担当への並列委譲と fan-in 統合）による docs 全体の意味整合性診断の結果である。機械的検査（docs-check / check_integrity）の実行結果も候補整理の前置（STEP-2-0）で取り込んだ。

## サマリ

- スキャン対象の件数: 現行 REQ 79件（+ retired 19件）、Decision 61件、Design 112ファイル（docs/designs/ 全 9 サブディレクトリ + README.md）、guides 14ファイル、docs/README.md、配布物（.opencode/commands/agentdev/ 20ファイル + templates、.opencode/skills/ agentdev-* 64 Markdown ファイル）
- 各カテゴリの検出件数: REQ 体系 7件（R-1〜R-7）、Design 3件（S-1〜S-3）、Decision/guides/README 2件（G-1、G-2）、配布物整合性 1件（D-1 false positive 候補）。新規計 13件
- high severity の件数: 0件（medium 2件: G-1、G-2）
- docs-check（check_integrity）実行結果: NG 1件（IR-072 鮮度、対象外節参照）、warning 2件（IR-054 放置 → S-1 として意味確認済み、IR-053 直接 gh 記述 → D-1 として文脈確認済み）。機械検査その他は合格
- 6観点の網羅確認（fan-in 時点）: SPLIT（R-6）/ MERGE（N-1、N-2 で成立せず）/ MOVE（R-3、R-4）/ DUPLICATE（N-1、N-2 で成立せず、R-4 は分散所有）/ RETIRE（N-3、N-4）/ DRIFT（R-1、R-2、R-5、R-7、S-1、G-2）— 全6観点を担当結果で扱ったことを確認
- 既知 defer 照合: F-21 / F-11 / F-23 / GUIDE-6 / GR-05 / GR-06 / F-25 / IDX-02 を照合し、重複する候補は新規重複出力せず差分を反映（本ファイル末尾「既知 defer 項目の状況」参照）

## 検出事項リスト

### R-1【DRIFT】REQ-035-006 が DEC-055 が置換した「Wave＝実行スケジューリング単位」語彙を保持

- id: R-1
- category: DRIFT（要件行の旧語彙残留）
- target: `docs/requirements/REQ-035.md:23`（REQ-035-006）
- evidence: REQ-035-006「Wave は Epic 内の依存関係と並列実行可能性を表す**実行スケジューリング単位**であり、Epic Issue 本文から読み取る内部構造である」。DEC-033 冒頭の superseded 注記は「Wave を実行スケジューリング単位とする規定を DEC-055 が置換（Wave＝意味的な依存関係のまとまり、並列上限は独立した実行制御）」と宣言し、現行規定は REQ-108-008「Wave を**意味的な依存関係のまとまり**として扱い、並列実行の共有上限を Wave や親子 Issue の個数から独立した実行制御として扱うこと」+ glossary:80。一方 REQ-035-017（:34）は DEC-051 のスロット型キューに現行化済みであり、REQ-035 内部で行間の語彙・意味論が不整合している
- severity: low
- confidence: medium（矛盾は「実行スケジューリング単位」語彙に限定され、「Wave は execution_unit に含めない」部分は REQ-108-008 と矛盾しない。実質定義は現行と矛盾しない語彙差の範囲。REQ-108-012「v5 の実行モデルの実現確定までの間、現行の実行契約が実行経路の正として維持される…移行の棚卸し構造が優先順位を付けて処理する」により移行棚卸しの後続処理として予約されている可能性がある〔棚卸し記録は docs/designs/foundations/references/v4-v5-crosswalk.md が所有〕）
- source_of_truth: 承認済み DEC-055 → REQ-108-008（source-of-truth priority: 承認済み Decision > 現行 REQ 行間の語彙整合）
- recommended_route: inspect-promote → backlog-review（表現是正候補: REQ-035-006 の語彙現行化。または crosswalk 棚卸し記録側で処理優先順位を付与）
- ng_classification: pre-existing

### R-2【DRIFT・軽微】REQ-035-001 の旧 lifecycle 語彙「closing 段階」

- id: R-2
- category: DRIFT（要件行の旧語彙残留）
- target: `docs/requirements/REQ-035.md:18`（REQ-035-001）
- evidence: 「orchestration が完走する場合は**closing 段階**へ委譲し closing 段階の実行主体が書き込む」。現行語彙は stage 4 / case-close（REQ-034-025 が stage 1〜4 語彙の正規所有）。REQ-103-022「廃止済み command、旧 lifecycle 名、旧成果物名等の旧語彙が、歴史的説明を除いて現行規範として使用されていないこと」に照らして旧語彙の現行使用に該当する可能性
- severity: low
- confidence: medium（「closing 段階」が case-close の単なる別表現か旧語彙の残留かの断定には用語政策（docs/designs/authoring/vocabulary-registry.md）の照合を推奨）
- source_of_truth: REQ-103-022 + REQ-034-025（stage 語彙の正規所有）
- recommended_route: inspect-promote → backlog-review（表現是正候補）
- ng_classification: pre-existing

### R-3【分類】REQ-008 の Design 候補行が現時点で未移管のまま残存（移管義務は REQ-117-003 が所有）

- id: R-3
- category: 分類（Design分離基準違反シグナルの残留、機械検査既知）
- target: `docs/requirements/REQ-008.md:75`（REQ-008-058）、`:68`（REQ-008-051）、`:73`（REQ-008-056）
- evidence: REQ-008-058「artifact_actions の operation の取り得る値は REQ、Decision、Design とも共通の **3 種（新規作成、追記、更新）** とし、旧別名および新別名を受け付けないこと」— enum 値域の REQ 側定義が残存。同系統として REQ-008-051（session由来RU frontmatter の「generation_actor: req-define-parent または supervisor」等 4 フィールドの必須性と値域を REQ で規定）、REQ-008-056（「tentative_classification は既存7値」）が IR-044 移管対象リスト外の境界グレー行として存在
- severity: low（既知課題。対応義務は REQ-117-003「IR-044 Design 候補行 11 行（…REQ-008-058/059/060…）の Design 的内容を正規所有 Design へ移管し、REQ 側を外部契約・状態要件の要約へ置換すること」が所有し、IR-053 等の 1シグナル即 high ルール〔finding-output-contract.md severity 決定ルール〕の適用対象外と解釈した。機械検査〔docs-check / IR-044〕も既に検出済みで新規シグナルではないため）
- confidence: medium（REQ-117-003 の完了判定は文書外（Case 証跡）で行われるため、「未完了の進行中」か「完了後に置換漏れ」かを docs 上からは確定できない）
- source_of_truth: REQ-117-003（移管義務）+ REQ-008 自身の適用範囲線引き（「draft、RU の frontmatter、フィールド名、値一覧の詳細スキーマ（Design）」を対象外宣言）
- recommended_route: inspect-promote → backlog-review。REQ-117 一式の Case 進行状況を確認のうえ、未完了なら REQ-117-003 の実施時に自然解消するため本件の個別採用は不要の可能性。完了済みなら置換漏れとして再処理
- ng_classification: pre-existing

### R-4【分類・DUPLICATE境界】「コード囲み認識規則」の REQ 側本文記述と Design 側 3 ファイル分散（単一正本不在）

- id: R-4
- category: 分類（MOVE/DUPLICATE 境界、所有分散）
- target: `docs/requirements/REQ-004.md:82-84`（REQ-004-066/067/068）、`docs/requirements/REQ-001.md:83`（REQ-001-071）
- evidence: REQ-004-066「行頭（字下げなし）のバッククォート 3 つで開始するコード囲みの内側の行を見出し候補・節境界として扱わないこと。閉じのバッククォート 3 つを持たないコード囲みはファイル末尾までを内側とみなすこと」— 決定的処理（局所組立・target_area 検索・採番読込）の実装挙動仕様を REQ 行本文が規定。同じ規則への言及が Design 側 3 ファイル（docs/designs/commands/req-define.md、docs/designs/skills/agentdev-design-file-manager.md、docs/designs/foundations/numbering-policy.md）に分散し、REQ-001-071 は「認識規則は局所組立・target_area 検索と同一とすること」と同一性のみを規定して規則本体の正を一意に示さない
- severity: low
- confidence: medium（これらの行は REQ-117-003 の IR-044 対象 11 行に含まれず docs-check も pass しているため、現行の受理境界（REQ-001-068 の「実装と契約文の同一性契約」許容）内と解釈せざるを得ない。規則本体の単一正本が Design 側のどのファイルかを本診断では特定していない）
- source_of_truth: REQ-001-067（要件行の主たる文意が内部規則の詳細である場合の Design 分離基準）
- recommended_route: inspect-promote → backlog-review（規則本体の単一正本を Design 側に明示し、REQ 側を同一性参照へ収縮する候補。IR-044 対象拡張の判断を含める）
- ng_classification: pre-existing

### R-6【SPLIT・観察レベル】REQ-108 の「重要変更通知」関心の追記蓄積（分割予兆）

- id: R-6
- category: SPLIT（分割予兆の観察）
- target: `docs/requirements/REQ-108.md:30-40`（REQ-108-014〜024）
- evidence: 「ADF v5 有限実行とワークフロー責務再編」というタイトルに対し、重要変更の識別・通知・報告という別関心の行群 11 行が追記されており、適用範囲にも「**対象（重要変更の通知と結果説明の追加分）**」として第二の関心が明示分離されている。同様の蓄積傾向は REQ-110（41 行、完了報告必須要素群 REQ-110-034〜037 もタイトル関心から派生的）にも見られる
- severity: low
- confidence: low（機械健全性検査〔docs-check / req-health-metrics〕は pass 済みで行数閾値未超過。関心混在の意味論的評価だけでは分割判断に至らない。追記構造自体は REQ-120 の「既存 REQ への追記行として保存」方針に従う意図的な運用のため、予兆観察にとどめる）
- source_of_truth: REQ-001-044（分割予兆の機械的定量化は req-health-metrics Design が所有）
- recommended_route: 観察メモ（req-health-metrics の次回更新時に同系蓄積の閾値判断材料として参照）
- ng_classification: pre-existing

### S-2【宣言重複・観察】REQ-111-013 の implementation 宣言が 2 Design で重複

- id: S-2
- category: Design DRIFT（covers 宣言重複の観察）
- target: `docs/designs/workflows/v4-standard-lifecycle.md:10`、`docs/designs/foundations/references/v4-v5-crosswalk.md:9`
- evidence: 両者が `ADF-COVERS(implementation): REQ-111-013` を宣言。v4-standard-lifecycle.md:10 は「現行実行契約の正は REQ-108-012 が維持する」の注記付き、crosswalk.md:9 は棚卸し記録構造の実装対応
- severity: low
- confidence: low（両宣言はスコープ注記付きで補完的（現行経路権威の維持 vs 処遇記録構造）と解釈でき、単一所有違反の断定は保留）
- source_of_truth: REQ-111.md:28（REQ-111-013 本体）
- recommended_route: 観察メモ（実装対応所有を 1 Design へ集約するか、両宣言のスコープ注記を相互参照で明示化する判断を後続検討）
- ng_classification: 要ヒューマンレビュー

### S-3【宣言不在・観察】docs-spec-rebuild-integrity.md に ADF-COVERS 宣言が存在しない

- id: S-3
- category: Design DRIFT（宣言不在の観察）
- target: `docs/designs/integrity/docs-spec-rebuild-integrity.md`（全 85 行）
- evidence: 全行に ADF-COVERS コメントなし。対応関係は本文参照で表現（:10 REQ-002-006/007、:16 REQ-010-004、:32 REQ-010-005）。他の旧来 Design も欠如しており、カバレッジ義務は REQ 側宣言（例: REQ-117.md:22 の区分外達成義務行）で管理されている模様
- severity: low
- confidence: low（ADF-COVERS ヘッダの全 Design 必須規定は本診断では確認できず、不在それ自体の違反性は断定できない）
- source_of_truth: なし（規定の有無自体が未確認）
- recommended_route: 観察メモ（ADF-COVERS ヘッダ必須性の規定有無を別途確認のうえ、必要なら宣言追加を backlog 化）
- ng_classification: 要ヒューマンレビュー

## docs-check route 候補（STEP-3-2: 意味的疑いのうち機械的検査に落とせるもの）

| 候補 | 内容 | 対応 finding |
|---|---|---|
| RT-1 | guides 層の「全公開 command 対応表」件数と `src/common/commands/agentdev/` 実ファイル数の突合検査（日付付きスナップショットの陳腐化検出） | G-2 |
| RT-2 | guides 層の「の正」宣言センチネル検査（案内層が guide 自身を規範源として指定する表現〔「の正」+ guide へのリンク〕の検出） | G-1 |
| RT-3 | IR-053 検出器の否定文文脈許容（README 等の説明文内の「〜しない」否定形記述を構造的に許容する条件追加。area-based 除外宣言方式〔REQ-010-066 準拠の語彙引用・記録領域管理〕との整合を検討） | D-1 |

## 推奨アクション

- 各検出事項の後続処理は `/agentdev/inspect-promote`（分類・採用）→ `/agentdev/backlog-review`（RU 化）経路が正である
- G-2 は REQ-099 系文書更新タスク候補（multi-host-operations.md 対応表の現行化または対象外明示 + consumer-project-setup.md:401 の見直し）
- S-1 は case 経路（case-ready/case-revise）での Design 更新（triage (b)）候補、README.md:193 親行備考への joint triage 記録を含める
- D-1 は docs-check 検査データ候補（RT-3）であり、文書修正ではなく検出器改善経路
- R-3 / R-6 は既存対応義務（REQ-117-003）・機械検査（req-health-metrics）の判断材料として、個別採用の要否は inspect-promote の分類で判断する
- req-define 入力案: 0件（該当なし。本回の検出事項は既存文書の整合是正・観察が中心であり、新規要求の壁打ちを要する事項は検出していない）

## 対象外（Out of Scope）

- **機械的検査レイヤが所有する検出**: docs-check（check_integrity）の NG「IR-072 req-updated-freshness: docs/designs/local/adf-simplification-deferred-records.md の frontmatter updated（2026-11-13）と最終内容変更 commit 日（2026-11-14）の不一致」は docs-check 自身が検出済みで route: intake を付与済みのため、本診断では再録しない（3層責務: deterministic check は機械検査レイヤが所有）
- **機械的検査の合格領域（本実行での再検査結果）**: REQ ID 実在性（REQ-010-069）、欠番レジストリ突合（REQ-010-070）、関連REQ表 retired リンク（REQ-010-072）、frontmatter id↔filename 一致（REQ-010-063）、索引・README・件数突合（REQ-010-011）、AUTOGEN 鮮度、決定的破損検査、存在しない command 参照（docs 内参照抽出の突合で非問題確認）。配布物エンコーディング不整合は本実行で 64 Markdown ファイルを直接機械確認し BOM 付き 0件・CRLF/LF 混在 0件（検出対象外として合格）
- **非問題確認（本診断で成立しなかった候補）**:
  - docs/guides/troubleshooting.md:11 の `/agentdev/xxx` は症状説明のプレースホルダ例示であり実在コマンドの誤記ではない
  - superseded Decision（DEC-002/005/007/015/017/029/030/040/043 の 9件、61件中）への現行判断根拠引用は検出されず（guides 内の DEC 引用全件列挙。DEC-040 は supervisor-credential-bridge.md:117,138 で「（superseded）」明示 + 現行の正は DEC-046 と誘導され適切）。docs/README.md 表も全 9 行に置換注記あり
  - 旧コマンド名（req-save / design-save / case-update）の guides 現行叙述なし。case-open/close/run は全ガイドで内部 lifecycle 段階として一貫叙述
  - charter.md による DEC-001 要約は公認サマリ（decisions/README.md が「利用者向け要約」としてリンク、charter 自身が「矛盾時は DEC-001 を優先」と宣言）
  - DEC-051 related_reqs [REQ-034, REQ-035]: REQ-034-012 / REQ-035-016/017 のスロット型キュー規定と意味整合。DEC-060/DEC-061 related_reqs [REQ-114]: REQ-114-010 / REQ-114-016 と意味整合
  - glossary:80 の Wave 定義（DEC-055 引用）は現行定義と一致
  - REQ-034 vs REQ-030/031/032/061/062（stale duplication 疑い）: 各 stage REQ が明示所有宣言・対象外宣言・二重検査禁止条項で構造化しており重複なし
  - REQ-117-011 vs REQ-119-002 の同一変更内容の二重規定: 「恒久契約文言 vs 一式完了義務」の二層構造として明示された意図的な役割分担
  - DEC-013/022/045 の retired REQ 言及: いずれも (retired) 注記付き履歴根拠引用で現行 authority 参照なし
  - docs/requirements/README.md の件数記述（79/19）: 実ファイル数と一致、欠番レジストリ記述とも整合
  - Design frontmatter status: draft と README 索引の矛盾: frontmatter 実在は 2件（v5-adopted-conventions.md、v4-v5-crosswalk.md）のみで README と矛盾なし（_template 2件はコードフェンス内テンプレート例、artifact-contracts.md:321 と case-close.md は本文一致）
  - v4-v5-crosswalk.md の planned/defer 記録、adf-simplification-deferred-records.md の見送り記録、docs-spec-rebuild-integrity.md の「REQ-002-028/029/035 RETIRE 後の正規根拠」節はいずれも REQ 執行として正当（REQ-108-012、REQ-121-001、退避後記録）
  - REQ-110-015（O(n) 非機能受入条件）は REQ-004-051/052 が制度化する受入条件経路で正当（既知 finding RQ12 は別観点の表現是正で継続）
  - REQ-120-002（拡張子規則の恒久所有自己宣言）は許容境界内と判定

## 既知 defer 項目の状況（前回 finding からの照合結果）

| 項目 | 状況 | 証拠 |
|---|---|---|
| F-21: docs/README.md DEC 表の supersede 注記全文埋め込み（20261008T025952Z） | 変化なし（defer 維持）・増大傾向は継続 | 今回は docs/README.md:124-188（DEC-033:158、DEC-036:161、DEC-045:170、DEC-059:184-185）で同一構図を確認。defer 理由（AUTOGEN 生成元調整を伴う RA 判定）は未変化のため新規重複出力せず |
| F-11: docs/README.md 要件欠番説明の内容過多（20261006T151122Z） | 変化なし（defer 維持） | docs/README.md:29-31 の構図不変。numbering-policy.md が「requirements/README.md と docs/README.md で明記」を Design 義務として規定済み |
| F-23: artifacts-and-state.md 状態モデル制約の出典非明示（20261008T025952Z） | 変化なし（defer 維持） | 本回の G-1 は「指定する側」の別観点であり相互参照を付した。GR-06 同時扱いの継続 |
| GUIDE-6: 状態モデル制約の一般化と document-model Design との冲突（20260914T214425Z） | 変化なし（defer 維持） | 同節（artifacts-and-state.md:149-157）に文言変更を確認できず |
| F-25: multi-host-operations.md の日付付きスナップショット（20261008T025952Z） | **差分増悪あり**（G-2 として新規出力） | defer 時点（2026-10-08）には存在しなかった phase-* 5入口の欠落と consumer-project-setup.md:401 の「現行値の正」権威指定が新 delta で発生。「構造的に緩和済み」の前提が変化している |
| IDX-02: references 配下 Design の状態索引可視性（20261019T143944Z） | 変化なし（defer 維持） | 本回の S-1 は放置そのものの論点で別件。親子とも draft の現状は不変 |

## 参照

- 実行: `/agentdev/inspect-docs`（workflow skill: `agentdev-workflow-inspect-docs`、backlog-auto stage 1 からの委譲実行）
- 基点: main aa5123e54ce6102255101a707de12fd812b57b22、最終正式リリースタグ v5.2.0
- 並列委譲診断担当: REQ 体系担当（STEP-2-2/2-3/2-4/2-9/2-10、6観点 6/6 実施）、Design 担当（STEP-2-5）、Decision/guides/README 担当（STEP-2-6/2-7/2-8）
- 機械検査取り込み: docs-check（check_integrity --json、1071 checks、NG 1 / warning 2 / warning→info demote 7 / baseline demote 25）
- 判定基準: source-of-truth priority（現行 REQ > 承認済み Decision > Design > guides）、finding 契約（`agentdev-doc-diagnostics` finding-output-contract.md）

## 処理記録（2026-11-15 inspect-promote、backlog-auto stage 2 inspect 系統、--auto なし）

- promote 3件（R-5・S-1・D-1。全件自律確定、HITL 対象なし・破壊的変更なし）→ `.agentdev/inspect/promoted/finding-20261115-req119-120-alloc-note-cleanup.md`、`finding-20261115-crosswalk-draft-stale-triage-b.md`、`finding-20261115-ir053-negative-context-tolerance-candidate.md` へ原状保存・本ファイルから削除。根拠: R-5 は明確な不整合（REQ-001-014 違反の表現残留）で修正方向一意〔仮記括弧句除去〕、S-1 は IR-054 機械的シグナル確定で triage (b) が IR-054 規則と REQ-108-012 からの決定的導出〔(a)(c) 不適理由記載済み〕、D-1 は否定文記述の誤検知確定〔false positive 確定は finding 契約上 inspect-promote の分類責務〕+ docs-check 検査データ候補を独立 route せず受け入れ条件に含める契約適用〔RT-3 包含〕。未決の実装判断〔S-1 内容更新範囲・D-1 検出器改善方式〕は各 promoted 成果物側に記載（IDX-04・FD-16 前例型）
- reject 3件（既知 defer への統合により新規成果物を持たない重複。即時削除・却下理由は当該 commit message 参照）: G-1〔20261107T070520Z FD-13 と target 3箇所完全一致・同一矛盾構造。FD-13 側へ統合注記追記〕、G-2〔F-25→GR-12→FD-12 家族と同一対象表・同一論点。FD-12 側へ統合注記追記。orchestrator 依頼の delta 判断: G-2 の「新 delta」〔phase-* 5入口欠落 + consumer-project-setup.md:401 権威指定〕は FD-12 evidence に既に含まれ、19件計数は README.md 込みの誤差で実18件、REQ-099-018 と consumer-project-setup.md:401 の現物確認で「正」指定は REQ 由来の正規節構造〔見直しは REQ 変更を要する guide 表層修正でない〕、phase-* Senpi 投影不在を現物確認〔REQ-099-007 検証済み組合せの拡張を要する〕— delta 単独では新規 promote を正当化しない〕、R-7〔20261026T190542Z IDX-17 と target REQ-110.md:83-87 完全一致・同型指摘。IDX-17 側へ統合注記追記〕
- defer 7件（本ファイルに残置）: R-1・R-2・R-3・R-4・R-6・S-2・S-3。再評価条件: R-1 は v4-v5-crosswalk 改訂時〔S-1 promote 実施時を含む〕または REQ-035 次回更新時、R-2 は用語政策照合時〔document-type-responsibilities.md 訳語表・REQ-103-022 対照。語彙レジストリに closing 登録なしを現物確認〕または REQ-035 次回更新時、R-3 は REQ-117-003 対応の完了確認時〔REQ-117 次回更新時。Case 証跡確認を要すため docs 上からは採否未確定〕、R-4 は IR-044 対象拡張判断時または REQ-004/REQ-001 次回更新時、R-6 は req-health-metrics 次回更新時〔観察メモ・分割判断材料〕、S-2 は v4-v5-crosswalk 改訂時〔S-1 promote 実施時を含む〕または v4-standard-lifecycle 次回更新時、S-3 は ADF-COVERS 被覆契約の明文化時〔IDX-14〔20261026T190542Z〕と同時再評価条件〕
- docs-check route 候補（RT-1〜RT-3）の扱い: RT-3 は D-1 promote 成果物の受け入れ条件として包含。RT-1 は FD-12 側統合注記へ記録〔本側の G-2 対応・対応表件数突合検査候補で検出側ルール強化候補(2) と同一内容〕。RT-2 は FD-13 側統合注記へ記録〔G-1 対応・「の正」宣言センチネル検査候補〕
- 対象外の確認: 機械的検査レイヤ所有の IR-072 freshness NG（docs/designs/local/adf-simplification-deferred-records.md）は対象外節どおり本実行で扱わない（route: intake は機械検査側で付与済み。再採用なし）
- 分類は Jev 先行評価（観測 20261115T105719Z-9776。g1/g2/r7 reject 1.0・r1/r2/r4/r6/s2 defer 1.0・r5 promote 1.0・s1 promote 0.99・s3 defer 0.85・r3 reject 0.81・d1 promote 0.45/defer 0.32 近接対抗）＋ LLM 最終判断（R-3 のみ Jev reject から STEP-3 基準「不整合かどうか未確定 → defer」の直接適用により defer へ変更〔REQ-117-003 進行中の是正義務が残り対応不要の確定不可。differenceReason: semantic_disagreement〕、D-1 は DS18 前例〔20261015 近接対抗 promote 維持〕と同型で false positive 確定と改善方式未決の分離により promote 維持、他 11 項目は Jev 分類と一致）により全件自律確定。STEP-5 adversarial-review は条件付き化発動条件（手動分類対象が存在し本質的争点が残る）を満たさないため生成せず（観測なし=契約どおり）
- prior 17 finding ファイルの既知 defer 項目は、delta window が空〔aa5123e54..cf7ac3729 は本 finding ファイル追加のみ〕のため対象変化の構造的不可能性を根拠に全件 defer 継続（自律確定）し、各側処理記録へ 2026-11-15 再評価記録を追記済み。F-25/GR-12/FD-12 家族には G-2 統合、FD-13 には G-1 統合、IDX-17 には R-7 統合の注記を各側へ追記
