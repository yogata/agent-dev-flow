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

### G-1【guides範囲超過】guides 層が guide 自身を「の正」と指定する矛盾

- id: G-1
- category: guides範囲超過（案内層が guide 自身を規範源として指定）
- target: `docs/guides/README.md:70`、`docs/guides/intake-learning-backlog-flow.md:142`、`docs/guides/artifacts-and-state.md:149-157`
- evidence: guides/README.md:70「[成果物、状態モデル](artifacts-and-state.md) | …（状態モデル制約、`.agentdev/` の位置づけ**の正**）」、intake-learning-backlog-flow.md:142「状態モデルの共通制約**の正**は [成果物、状態モデル](artifacts-and-state.md) を参照する」。一方 artifacts-and-state.md:55 は guides を「参照用読み物（案内層、**非基準**）」と自己定義し、guides/README.md:4-5 も「基準は各 REQ/Decision/Design ファイルであり、ガイドは基準への導線を提供する」と宣言。さらに artifacts-and-state.md:151 は「以下の制約を AgentDevFlow の状態モデルに**適用する**」と規範句（「frontmatter や status フィールドによる状態管理は行わず」「Issue / PR の状態を docs に複製しない」等）を guide 内で直接定義し、同節内に所有 REQ/Design への導線を持たない。guides 層が guide を「正」と指定する表現は、guide 層自身の非基準定義と直接矛盾する
- severity: medium
- confidence: medium（「guide 層内の参照ハブ」という擁護解釈が残る。ただし「の正」は規範源指定に使う語であり、非基準自己定義との矛盾は明確）
- source_of_truth: docs/guides/README.md:4-5（guides 層の非基準原則）と docs/guides/artifacts-and-state.md:55（非基準自己定義）を正とし、「の正」指定側の記述を矛盾と判定
- recommended_route: inspect-promote → backlog-review。状態モデル制約の規範所有者（REQ/Design）を特定し、guides 側を導線表現へ修正する後続調査を含める
- ng_classification: pre-existing
- notes: 同一節群を対象とした継続論点 GUIDE-6（inspect-docs-finding-20260914T214425Z.md、制約の一般化と document-model Design との冲突、defer 継続）と F-23（inspect-docs-finding-20261008T025952Z.md、出典非明示、defer 継続）および GR-06（20261004T162140Z 由来、継続指摘中）とは**観点が異なる**: 本件は「指定する側」（guides/README.md:70、intake-learning-backlog-flow.md:142）の問題であり、上記 defer 論点の再評価と混同しないこと

### G-2【履歴混入】multi-host-operations.md 対応表の陳腐化（phase-* 5入口欠落）が現行値の正として権威指定されている

- id: G-2
- category: 履歴混入（陳腐化した「現行値」スナップショットが正と宣言される）
- target: `docs/guides/multi-host-operations.md:93`、`docs/guides/consumer-project-setup.md:401`
- evidence: multi-host-operations.md:93「全公開 command の対応表を次に示す（**2026-10-02 時点、13件**）」。現行の公開 command は `src/common/commands/agentdev/` 実在19件であり、phase-tasks-create / phase-tasks-update / phase-artifacts-update / phase-review / phase-transition の5件（v5.1、DEC-057/058、REQ-110/111 として 2026-10-12 以降 accepted）が欠落。この5件はリポジトリルート README の配布コマンド索引と docs/guides/glossary.md:29-33 に現行入口として掲載済み。consumer-project-setup.md:401「組合せと Command 対応表の**現行値はマルチホスト運用ガイドが正とする**」により、日付付きスナップショットが現行値の権威として指定されている。同 guide の :113-124「対応表の生成規律」は実ファイル列挙を検証手順と定めており、手順に従えば 19件になる
- severity: medium
- confidence: medium（phase-* 5件の Senpi 投影が未実装の可能性がある。その場合は「対応表の対象外」と明示的に除外宣言する記述が必要であり、現状は「全公開 command」と宣言しつつ欠落しているため除外理由の記述がない）
- source_of_truth: 公開 command の正（`src/common/commands/agentdev/` 実ファイル列挙と各 command Design）を正とし、13件のスナップショットを陳腐化と判定
- recommended_route: inspect-promote → backlog-review。対応表を現行19コマンドへ更新するか、phase-* の対象外区分を明記。consumer-project-setup.md:401 の「正」指定の見直しとセット
- ng_classification: pre-existing（既知 defer F-25 の差分増悪。defer 時点 2026-10-08 には phase-* が存在せず、欠落5件と「正」権威指定は新 delta で発生）

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

### R-5【DRIFT・軽微】一式 REQ の採番「仮記」文言の採番確定後残留

- id: R-5
- category: DRIFT（過去前提文言の残留）
- target: `docs/requirements/REQ-119.md:35`、`docs/requirements/REQ-120.md:41`
- evidence: REQ-119「REQ-119 の番号は決定的採番スクリプト（alloc-req-number.ts）の採番結果を正とする（本文は現行最大 REQ-118 時点の次番号を仮記）」、REQ-120「（本文は現行最大 REQ-119 時点の次番号 REQ-120 を仮記）」。採番は確定済み（frontmatter id、本文 REQ-119-xxx / REQ-120-xxx とも一致、docs-check pass）であり、文言は採番前の一時状態の記述がそのまま残留している
- severity: low
- confidence: high（前提文「採番結果を正とする」により意味は自己解決されるため軽微）
- source_of_truth: REQ-001-014（現行文書の本文は過去前提を含まない）＋各行自身の「採番結果を正とする」前提文
- recommended_route: inspect-promote → backlog-review（仮記括弧句の除去候補）
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

### R-7【分類・軽微】REQ-110 の「対象へ追記／対象外へ追記」ラベルの多段蓄積

- id: R-7
- category: 分類（DRIFT 境界、本文変更履歴表現の緊張関係）
- target: `docs/requirements/REQ-110.md:83-87`（4 件の追記ラベル）
- evidence: 適用範囲節に「対象へ追記」「対象外へ追記」が 4 世代分蓄積。「作業単位ラベル付きの適用範囲項目」は変更履歴そのものではないが、REQ-001-047「変更の追跡は更新日フィールドのみで扱い、本文中に変更履歴節を設けないこと」との緊張関係を持ち、世代を重ねるほど「現在の適用範囲」の一意な読みが崩れるリスクがある
- severity: low
- confidence: medium（追記ラベルの運用上限・整理時期の方針を規定した文書を本診断では確認していない）
- source_of_truth: REQ-001-047（変更追跡は updated のみ）＋ REQ-120 の追記行保存方針（運用の正当化根拠）
- recommended_route: inspect-promote → backlog-review（追記ラベルの整理方針の明文化候補）
- ng_classification: pre-existing

### S-1【IR-054放置】references 配下 Design の draft 放置（32日、閾値 30日超過）

- id: S-1
- category: Design DRIFT（draft Design 放置、IR-054 確認済み）
- target: `docs/designs/foundations/references/v4-v5-crosswalk.md:3,5`（frontmatter status: draft、updated: 2026-10-14）
- evidence: 基準日 2026-11-15 で経過 32日 > 閾値 30日。docs-check（check_integrity）が warning として検出済み（Draft Design stale: age=32d）。規則権威は docs/designs/integrity/rules/IR-054-draft-spec-abandonment-detection.md（:41 閾値 30日固定、:27 triage (a)昇格/(b)更新+updated最新化/(c)廃止）。親 `docs/designs/foundations/v5-adopted-conventions.md` 自身も draft（updated: 2026-11-04、11日で新鮮）であり、README.md:193 の親行備考が crosswalk 所有を言及。親は 2026-11-04 に「解決手順」節へ target_area 追記（:68-79）を更新したが子には波及していない
- severity: low（heuristic warning 相当。high や medium に相当する現行判断への直接影響は確認できず、triage 明確のため low と判定）
- confidence: high（機械的シグナル確定、frontmatter 実読確認済み）。triage 判断: (a) 昇格は親が draft のためライフサイクル順序に不整合、(c) 廃止は REQ-108-012（REQ-108.md:28「移行の棚卸し構造が優先順位を付けて処理すること」）が本 crosswalk 構造を現行義務として要求するため不適。よって **(b) 内容更新 + updated 最新化**を推奨。README.md:193 の親行備考への joint triage 記録を推奨。crosswalk は living tracking（planned → confirmed → executed）を担い v5 実行モデル確定までの長期休止が設計上あり得る点は IR-054 自身が false_positive_risk「中」を認める（規則 :24）ため、updated フィールドの実態乖離の可能性も付記
- source_of_truth: docs/designs/README.md:21-22（IR-054 は基盤 Design を含む全 Design 対象、references/ 子は親行備考で言及）+ IR-054 規則本文 + REQ-108-012
- recommended_route: inspect-promote → backlog-review（triage (b) の case 経路実行候補〔case-ready/case-revise での Design 更新〕）
- ng_classification: pre-existing
- notes: 既知 finding IDX-02（inspect-docs-finding-20261019T143944Z.md、references 配下の status 索引可視性、defer 継続）と**対象ファイルは同一だが論点は別**: IDX-02 は索引の状態表示契約、本件は放置そのもの。両者を混同しないこと

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

### D-1【IR-053 false positive 候補】配布物の直接 gh CLI 記述 warning は否定文記述

- id: D-1
- category: 配布物整合性（docs-check warning の文脈確認、検出器文脈許容候補）
- target: `src/common/skills/agentdev-workflow-case-close/scripts/README.md:7`
- evidence: docs-check（check_integrity）が CanonicalConflict warning「Direct gh CLI invocation 'gh pr view' detected — route via the agentdev_gh Custom Tool (IR-053, v2:REQ-0152-001)」を報告。該当行はスクリプト仕様書の入力仕様記述であり、該当箇所は「0 の場合は mergeable-polling を N/A pass（prNotApplicable）とし **`gh pr view` を発行しない**」という**否定文の説明**である。実行コードでも迂回手順の記述でもない。本 warning は permanent exemptions（exemptions.json、7件 demote 対象外）にも baseline（NG baseline 1件+approved additions 24件）にも未登録で、新規検出として warning に留められている
- severity: low
- confidence: high（文脈は明確に否定文記述であり、迂回指示ではない。ただし検出器仕様（IR-053 の正規検出条件と既知許容）の詳細は未照合のため「検出器の許容条件追加」の妥当性は次段判断）
- source_of_truth: IR-053（直接 gh CLI 迂回検出）の検出意図（実行迂りの検出）を正とし、README 説明文の否定文記述を false positive 候補と判定
- recommended_route: docs-check 検査データ候補（STEP-3-2: 検出器の否定文文脈許容条件〔「発行しない」「〜しない」等の否定形記述の構造的許容、または area-based 除外宣言〕の検討。ng-baseline / exemptions への仮登録ではなく検出器改善を推奨）
- ng_classification: false positive 候補（検査ルールの誤検知。検査ルールの修正対象。確定は inspect-promote の分類で行うため「候補」と表記）

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
