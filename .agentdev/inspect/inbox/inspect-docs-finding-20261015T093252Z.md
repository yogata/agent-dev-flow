# inspect-docs finding 20261015T093252Z

## サマリ

- スキャン対象: 現行 REQ 72件、retired REQ 19件、Decision 58件（accepted 49件）、Design 184件、guides 14件、knowledge 35件、README 群（docs/README.md、docs/requirements/README.md、docs/decisions/README.md、docs/designs/README.md、root README.md）、Command 18件、Skill 58件。
- 検出事項: 15件。high 0件、medium 3件（DB02, DS18, DS23）、low 12件（DS17, DS19〜DS22, DS24, DS25, RQ15〜RQ17, GR10, GR11）。
- 診断焦点: 2026-10-13T09:07Z 以降の delta（REQ-114・DEC-059 新規、REQ-041 目的節更新、QG-4 定義〔REQ-032/case-close.md Design〕、tracking-issue label 語彙最小化、knowledge 3ファイル新規、docs-check strict findings 解消コミット群、backlog-auto Design 2件更新）。全体スキャンも並行実施。
- 推奨経路: 表現是正候補、修正候補、追跡Issue育成、docs-check ルール候補。既知 finding（defer 残置 13件）の disposition は変更しない。

## 診断基準と被覆

STEP-2 の意味診断は REQ 体系・Design・Decision/guides/README/knowledge の3診断担当へ非同期並列委譲し、親が fan-in した（回収確認: 3担当すべて完了、担当間の判定矛盾なし、担当間の同一対象重複なし）。各担当は delta window を重点全文読解し、残り corpus を構造スキャン。親は Design/Decision 状態乖離 DRIFT（doc-diagnostics 直接判定カテゴリ）と配布物整合性検査（STEP-3）を逐次で実行した。機械検査は repo root から実行し全て有効結果を取得（MECH01 手順の再維持）。

## 機械検査証拠の採用判断

| 証拠 | 判定 | 根拠 |
|---|---|---|
| check_integrity（repo root、source profile） | 採用 | NG 0 / warning 0 / info 132。scanned: REQ 72、Skill 63、Command 18、Guides 14、Specs 184、RetiredREQ 19、Runtime 83。前回の RuntimeReference NG 3・ReqFreshness 2 は 85680dab で解消済み |
| check_distribution_boundary（repo root） | 採用 | scanned 424、failures 0。前回の 11 failures（delta 由来）は cc99df59 で解消済み |
| check_command_format | 採用 | OK |
| check_templates | 採用 | 全検査カテゴリ OK |
| check_autogen_freshness | 採用 | 索引 6件、鮮度違反 0 |
| check_content_corruption | 採用 | heading / code block / link / Unicode 等すべて違反 0 |
| check_skill_rename_symmetry | 採用 | skills 58、designs 33、違反 0 |
| lint_skills | 採用 | AG-005 NG 0。前回 LINT01（description 上限超過 3件）は 85680dab で解消。warning 8件（explainer/explainer-book/first-reader/yomiyasu の USE FOR/DO NOT USE FOR トリガー欠落。agentdev 配布 skill 以外の個人 skill）+ aggregate budget WARNING 1件（20362 > 20300、傾向管理） |
| check_extensions | 採用 | failures 0、public_commands 18、public_skills 58 |
| BOM / CRLF-LF 混在確認（親実施） | 採用 | 配布物 md 745件中 BOM 付き 0件。CRLF/LF 混在は node_modules 配下 third-party（@types/bun README 等）のみで配布物対象外。配布物違反 0 |
| README コマンド索引の実在確認（親実施） | 採用 | root README 索引 18コマンド ↔ 実在 18コマンド、完全一致 |

## 処理記録

- 生成時点: 2026-10-15T09:32:52Z（UTC）、main @ 38bc58c7。
- 本 finding は backlog-auto stage 1（Case #3725 E2E 検証・系統識別 [inspect-docs]）として生成。inspect-promote（stage 2）が分類・採否を判断する。
- git 永続化（commit/push）は本 run の実行契約上実施しない（後続工程の責務）。
- 2026-10-15 実施（backlog-auto stage 2 inspect 系統、--auto なし）分類確定: promote 6件（DS18・DS20・DS21・DS23・DS24・DS25 → 既存2 artifact と `finding-20261015-case-close-release-support-candidate.md` へ保存・本ファイルから削除）/ reject 2件（RQ16。既知 RQ-16〔20260926T180630Z、defer 継続中〕と同一対象。supervisor 値域追加・docs-check ルール候補の増分は既知側へ統合注記；RQ15。REQ-114 の受け入れ条件は維持する既存の安全境界を確認し、重複所見を追加処置なしで却下）/ defer 7件（DB02・DS17・DS19・DS22・RQ17・GR10・GR11。本ファイルに残置）
- 分類は Jev 先行評価（観測 20261015T094749Z-77ac、confidence 0.91・全15項目 top-1 妥当）＋ adversarial-review 2 stream（分類妥当性・証拠適合〔promote 5件の対象行を現物実読で確認〕）convergence 後に 13件を自律確定（破壊的変更なし）。Jev 乖離の処置: DS18 は promote 0.46 / defer 変更 0.42 の近接対抗を Stream A で検証の結果、採否（inspect-promote 責務）と統合判断（backlog-review 責務）の分離により promote 維持と合意（成果物に REQ-114 反映群との同根注記を付す）
- defer 分の再評価条件: DB02・DS17・DS19・RQ17・GR10 は Case #3725 完了時（解消未了なら promote 再分類）、DS22・GR11 は docs-check ルール候補の実装検討時
- 旧 defer 71件は全件 defer 継続（自律確定）: 各 finding ファイルへ再評価記録を追記。delta 窓（2026-10-12 以降）と旧 defer 対象の交差 8件を現物確認し、うち 7件は対象記述不変、RQ-36（20260929T165249Z）は REQ-008 が 97 行（診断時 61 行比増加）のため次回 SPLIT 正式計測時に含める注記を追記

## 検出事項リスト

### DB02
- category: 配布物統合性（責務整合: Design と配布物本文の乖離）
- target: `src/common/commands/agentdev/backlog-auto.md`（description:2、不変条件:29-36、ガードレール:44）、`src/common/skills/agentdev-workflow-backlog-auto/SKILL.md`（description:3）
- evidence: 配布物は backlog 整理サイクル（stage 1〜3）のみを記述する。一方、正規 Design（`docs/designs/commands/backlog-auto.md`、`docs/designs/skills/agentdev-workflow-backlog-auto.md`。いずれも status: accepted、updated 2026-10-15）は ADF-COVERS(design) で REQ-114（全行/公開 interface 行）を所有し、orchestration stage 4〜7（要件定義接続・実行接続・全体完了判定・リリース）を定義済み。command 本文ガードレール「req-define、case-ready、GitHub Issue / PR 作成を自動起動しない」（:44）は Design stage 4（単一 req-define 実行）・stage 5（case-auto 実行）と字面上衝突する読みを生じる。ワークフロー skill description も「stage 3: backlog-review、fan-in 判定、停止伝播、resume 契約」までで stage 4-7 に言及しない。配布物内の REQ-114/一気通貫 言及は 0 件（親 grep 実測、3担当の確認とも一致）。
- severity: medium
- confidence: high（言及欠落は機械的に一意確認。Case 進行中の未同期という解釈の余地は処置側）
- source_of_truth: REQ-114-001/014（現行 REQ）、commands/backlog-auto.md Design 目的節・covers（REQ-114-001/010/011/012/014）、skills Design stage 構成（:25、:39-45、:115）
- recommended_route: 表現是正候補（配布物の description・不変条件・ガードレールへの REQ-114 stage 4-7 反映）。本 Case（#3725）の後続 Wave 対象と解される。Case 完了時に解消されていなければ残留乖離として扱う。
- ng_classification: 今回修正対象（ea3d6e0a で Design のみ先行確定し配布物が未追随。Case #3725 進行中の未同期）。
- notes: 配布物本文の構造診断は inspect-skills 領域の近接。DB02 起点の配布物更新と GR10（案内層）・DS17〜DS19（Design covers 実体）は同根の REQ-114 反映未完了群。

### DS17
- category: Design（covers 宣言と本文実体の不一致: REQ-114-013 実体なし）
- target: `docs/designs/skills/agentdev-workflow-backlog-auto.md:9`（covers）、本文 112-121
- evidence: covers 行は REQ-114-001〜015 全行を宣言。しかし REQ-114-013「ADF本体、GitHub 接続型適用プロジェクト、ローカルIssue適用プロジェクトの各採用形態で…共通の E2E 挙動が確認可能」に対応する本文記述がなく、2 Design とも「E2E」「採用形態」の出現 0 件（grep 実測）。
- severity: low
- confidence: medium
- source_of_truth: REQ-114-013
- recommended_route: 追跡Issue育成（実体節の追加、または covers から REQ-114-013 を外す判断。検証義務行を design covers に含める役割設定自体の見直しを含む）。
- ng_classification: 今回修正対象（ea3d6e0a の新規 covers 追加分）。
- notes: REQ-114-013 は検証主体の行であり、宣言側の問題か本文欠落かの切り分けは後続判断事項。

### DS19
- category: Design（covers 宣言と本文実体の部分不一致: REQ-114-005/-012部分/-015）
- target: `docs/designs/skills/agentdev-workflow-backlog-auto.md:9,116,118`、`docs/designs/commands/backlog-auto.md:10,77`
- evidence: REQ-114-005「再スコープ」の語が本文になし（:116「対応表（統合・分割を含む）」が部分受皿）。REQ-114-012「RU 0 件またはリリース対象となる実変更がない場合はリリースを作成せず報告」が本文になし（基準点 0 件の停止 :118 と「完遂済み・リリース保留」commands:77 は存在）。REQ-114-015（REQ-041 完了扱い範囲の限定）の明示実体なし（commands:72「所有する実行契約は REQ-114」で間接受けの可能性）。
- severity: low
- confidence: medium
- source_of_truth: REQ-114-005/012/015
- recommended_route: 追跡Issue育成。
- ng_classification: 今回修正対象（新規 covers に対する部分実体欠落）。

### DS22
- category: Design（covers 宣言様式: 集合の包含重複）
- target: `docs/designs/skills/agentdev-workflow-backlog-auto.md:7-8`
- evidence: :7 は REQ-041-003〜006, 009〜015、:8 は REQ-041-002〜016（:7 の全要素が :8 に包含され冗長）。case-close.md:8-20 にも同型の重複。
- severity: low
- confidence: medium
- source_of_truth: case-close 棚卸しは coverage 形式区別なしで全件突合のため動作影響なし
- recommended_route: docs-check ルール候補（同一ファイル内 covers 集合の包含重複検出）／表現是正候補（統合）。
- ng_classification: pre-existing（複数 Case にわたる宣言積み上げ慣行。false positive 寄り）。

### RQ15 処理結果（reject / no-action）

- 重複所見を却下し、REQ-114 の受け入れ条件を維持する。DEC-059 への委譲と既存の安全境界を保つ現行構造を確認したため、REQ-114 を縮小せず、追加 artifact・変更・後続作業を起こさない。

### RQ17
- category: REQ 体系（参照の要約表現と原文の差。参照整合性自体は成立）
- target: `docs/requirements/REQ-114.md:29` vs `docs/requirements/REQ-039.md:19`
- evidence: REQ-114-014「REQ-039-001（backlog-review は自動的な要件化を行わない）は…」／REQ-039-001 原文「backlog-review は採用済み成果物を分析、統合し、ユーザー承認を経て RU（要件ユニット）を生成すること。プロジェクト知識候補については docs/knowledge/ への知識文書保存（REQ-056）を…」。意味的接続は成立するが、括弧内要約は原文の言い換えとして不正確（原文は「ユーザー承認を経る」ことの要求であり、知識文書保存という別の正規完了経路も含む）。
- severity: low
- confidence: medium
- source_of_truth: 現行 REQ-039-001
- recommended_route: 表現是正候補（括弧内を「ユーザー承認を経て RU を生成する」等の原文準拠へ）。
- ng_classification: 今回修正対象候補（REQ-114 新規行）だが severity low。

### GR10
- category: guides／README（案内層に REQ-114 一気通貫契約の未反映。矛盾ではなく未反映）
- target: `docs/guides/command-selection.md:30,81`、`docs/guides/quickstart.md:4`、`docs/guides/glossary.md:21`、`README.md:15`（root、delta で未変更）
- evidence: 案内層の backlog-auto 記述はいずれも REQ-041 整理サイクル形のみ（command-selection.md:30 入口表「backlog整理サイクル（検出→昇格→統合）を1回で実行したい」、:81 補足、root README「生成された RU を req-define に渡す」）。REQ-114 の単一起動拡張（一気通貫実行）への到達導線が案内層のどこにもない（docs/guides + root README の REQ-114/DEC-059/一気通貫 grep 0 件）。guides の現行記述自体は REQ-041 契約として正であり矛盾なし。
- severity: low
- confidence: high（未反映の事実）。所見化の要否判断を含め medium
- source_of_truth: REQ-114-001（現行 REQ・72件表掲載）、REQ-041（所有権分割）、DEC-059（accepted）
- recommended_route: 追跡Issue育成（REQ-114 の配布物反映〔DB02〕と E2E 実測（REQ-114-013）の成立を契機とした入口表行追加・glossary 語義更新）。
- ng_classification: 要ヒューマンレビュー（guides の現行記述は誤りでない。実装前の経路を案内しない現行規律からは据え置き妥当、現行化追跡として有効）。
- notes: 配布物側の未反映は DB02。glossary の REQ-114 由来語彙未登録は既知 GR08 カテゴリの延伸として GR08 処置（defer）に統合。

### GR11
- category: README（AUTOGEN ブロック外での件数散文複製。潜在リスク・現行違反なし）
- target: `docs/README.md:28`
- evidence: :25（AUTOGEN 内）「現行 REQ: 72件、廃止済み: 19件」に対し、:28（AUTOGEN 外・手動文）「現行要件は72件である。…」。現時点は一致しており逸脱は未発生。delta（ea3d6e0a）でも 71→72 に正しく更新済み。
- severity: low
- confidence: high
- source_of_truth: AUTOGEN readme-req-summary-count（docs/README.md:24-26）
- recommended_route: docs-check ルール候補（AUTOGEN 外の件数複製の機械照合）。
- ng_classification: pre-existing。

## 6観点 fan-in 結果

| 観点 | 結果 |
|---|---|
| SPLIT | 対象なし（REQ 担当: REQ-114 は実行接続とパッチリリースを単一ライフサイクルの連続段として一体的に定義、関心混在シグナル1で閾値未満。REQ-032 は case-close 単一 lifecycle 段階で一貫） |
| MERGE | 対象なし（REQ-114↔REQ-041 は双方向 ID 参照〔REQ-041.md:18、REQ-114-015〕で所有移管が明確、REQ-041 側維持宣言あり。REQ-114↔REQ-034 は「接続部分のみを所有」で重複なし） |
| MOVE | RQ16 のみ（REQ-008-051 schema field 列挙）。REQ-114-002/003、REQ-114-009 は安定契約例外候補。REQ-032-039 は Design 委譲宣言を同梱した適正な要件行 |
| DUPLICATE | RQ15（REQ↔DEC 規則反復）、DS18（同一ファイル内逐語二重保持）、DS21（対象外重複）、DS22（covers 包含重複、pre-existing） |
| RETIRE | 対象なし（retired 19 ID の活性 REQ 参照を rg 全数走査、全て annotation 付き移管説明。REQ-095 の「旧 REQ-092/093」は移管注記付きで許容。superseded DEC 参照の annotation なしは観察メモ〔REQ-011:20、REQ-047:15、REQ-035:43。いずれも DEC-036 維持部分の参照〕。「現行判断の根拠」としての retired 参照は 0 件） |
| DRIFT | 対象なし。REQ 側: REQ-011-026/REQ-049-002/003 の kind・trackingState 削除と agentdev-issue-tracking SKILL.md（「kind と trackingState は Tool 操作契約から削減済み」「Tool は状態ラベルの再付与による遷移を機械適用しない」）が完全整合。Decision 側: proposed 0件。Design 側（親直接判定）: draft Design 2件のうち、implementation covers を持つのは v4-v5-crosswalk.md（REQ-111-013）のみ。REQ-111-013 の実装義務（後継経路の実現・採用と同じ変更セットでの確定）は採用確定が未了（既知 RQ08 defer が同一問題群を処理中）のため乖離条件（完了済み Case × draft のまま）に該当しない。v5-adopted-conventions.md は design covers のみで implementation 宣言なし → 判定対象外。REQ ファイル単位近似のため REQ-111 他行実装 Case 完了による誤報告性格を含む。観察記録のみ |

## 既知 defer / false-positive 照合

既存の disposition は変更せず、今回確認できた状態のみを記録する。

| 既知 finding | 今回の状態 |
|---|---|
| RQ03〜RQ07（RQ03: REQ-009/REQ-088、RQ04: REQ-006.md:38、RQ07: REQ-061.md:52） | 対象行は delta で不変。再報告なし |
| RQ08（REQ-111-013/DEC-058/crosswalk/REQ-005 確定時制） | v4-v5-crosswalk.md は 85680dab で frontmatter のみ変更、対象記述（:80）変化なし。disposition unchanged |
| RQ09〜RQ14（REQ-111/REQ-110/REQ-035/REQ-030/REQ-061/REQ-041） | RQ14 は REQ-041 目的節 1行追加で行番号 39→40 にずれたが内容不変。RQ13（REQ-030.md:44-45）は 85680dab で updated 日付のみ変更。他は対象行不変。全て disposition unchanged |
| DS01〜DS08（v4-standard-lifecycle 等 covers/body） | 85680dab による同ファイル変更は frontmatter `updated` のみ。covers 行・本文構造は変化なし。処遇維持 |
| DS10（v51-phase-transition REQ-111-011 本文不足） | ファイルは d89506c8/944dfe14 で変更されたが covers と本文欠落状態は維持。disposition unchanged |
| DS14（v4-standard-lifecycle.md:10 REQ-111-013 scope 注記不足） | 現行行でも REQ-111-013 は括弧注記の後に裸で連ねる形で固有注記なし。維持 |
| DS16（v51-phase-driven REQ 行近接言い換え） | 対象記述は現行 line 74 付近に存続。維持 |
| GR02（docs/README.md:8、guides/README.md:18 v5/v5.1 導線欠落） | 導線節は delta でも不変。REQ-114/DEC-059 は導線節に未追加。処置変更なし |
| GR03〜GR06 | 対象節の実質変化なし |
| GR07（DEC-057:23、DEC-058:26 ADF-COVERS(decision) 宣言様式） | **第3例**: DEC-059.md:17 が同様式（related_reqs: [REQ-114] との併記も同型）。GR07 処置（defer）は変更なし、カテゴリ延伸のみ記録 |
| GR08（glossary 新語彙未登録） | REQ-114 由来語彙（一気通貫実行・パッチリリース）の登録なし。glossary:21 backlog-auto 語義は REQ-041 範囲で現行正。カテゴリ延伸として GR10 の notes に集約、GR08 処置変更なし |
| GR09（artifacts-and-state.md .agentdev/phase/ 列挙欠落） | ファイルは d89506c8 で更新されたが phase/ 列挙は不在のまま。処置変更なし |
| LINT01（配布 Skill description 上限超過 3件） | **解消済み**: 85680dab で 600 字以内化、lint_skills 再実行で AG-005 NG 0。aggregate budget WARNING（20362 > 20300）は傾向管理として継続観察 |
| MECH01（機械検査の母集団無効） | 今回も repo root から実行し全検査で有効結果（check_distribution_boundary scanned 424、check_extensions ok、check_integrity NG 0） |

## 対象なし確認（観点別）

- Decision 意味診断: DEC-059 は frontmatter（status: accepted、related_reqs: [REQ-114]、relations: DEC-001/DEC-039）と本文（REQ-114-008〜012 拘束適用、結果・影響節）が整合。decisions/README.md の baseline 表・accepted ビュー・関連 REQ 表に反映済み、件数「承認済み49件、提案中0件」は自力集計（accepted 49 / superseded 9 / DEC 58件+README）と一致。参照先 3件（DEC-001/034/039）は全て accepted で superseded 無注記参照なし。承認記録の Root Case #3725・設計PR #3726 は git 履歴と一致。DEC-034 が frontmatter relations に不在（本文は排除的言及のみ）は非関係宣言として妥当と判定（不確実性注記: REQ-059 の DEC-DEC 関係宣言の厳密運用は REQ owner 確認余地）。
- guides 意味診断: REQ-111 併存規定（command-selection.md:42、artifacts-and-state.md:147、root README）は REQ-111-013 と一致。guides 内に新規の規範的ルール創出なし（navigation-layer overflow なし）、実行主体分類の誤認なし。
- README 索引診断: root README 18コマンド索引 ↔ 実在 18コマンド完全一致（親実施）。docs/README.md 各節の導線リンクは実在先に解決（v51-* Design 含む glob 実在確認済み）。decisions/README.md の Decision Map に DEC-059 行がないのは DEC-057/058 と同型の運用（Map は過去版 ADR との履歴関連の手動節）で矛盾とは判定しない。
- knowledge 診断（REQ-056 準拠）: 新規 3ファイル（external-ai-collaboration-and-incremental-artifact-formation、phase-structure-and-development-scale、phase-themes-and-progress-judgment）は docs/knowledge/ 配下・kebab-case・frontmatter 必須・ADF-COVERS なしで配置整合。必須5節（REQ-056-003）を備え、正への権威委譲が明示（phase-structure:23「双経路併存の正式な決定は DEC-058 が所有する」、phase-themes:21「REQ-105 が所有する…代替できない」、external-ai:47「この知識自体が現行契約を変更するものではない」）。REQ-111 対象外規定（工程全体の完了認定を行わない等）と方向一致、二重正本なし。knowledge README 列挙 35件は実ファイルと一致。表記不統一（external-ai は md リンク、他2件は plain パス＋「正規契約：」接頭辞）は意味影響なし・textlint 管轄のため所見化せず。
- REQ-114 参照整合性（REQ 担当明示評価）: REQ-114-008/009/010→DEC-059（成立、accepted 参照問題なし）、REQ-114-004→REQ-034-027/040（成立）、REQ-114-006→REQ-034-038（成立、別経路接続と矛盾なし）、REQ-114-007→REQ-008-010/REQ-061-025（成立、削除契約の正しい参照）、REQ-114-014→REQ-039-001（成立、表現差は RQ17）、REQ-114-015→REQ-041（成立、双方向 ID 参照確立・scope-out 削除との残置なし）。requirements/README.md・docs/README.md への REQ-114 行登録済み。
- QG-4 定義と case-close.md Design 責務照合（Design 担当明示評価）: case-close.md:346-353 と agentdev-quality-gates（:86、references/qg-4-final-acceptance.md）の所有分離は明示されており一致（所見なし）。
- REQ-041 対象外項目削除に伴う Design 説明整合: 38bc58c7 は workflow Design 対象外から「req-define、GitHub Issue / PR 作成」を削除し、REQ-114 stage 4/5 との正面衝突用語を除去済み。REQ-041 目的節・適用範囲対象外と workflow Design 対象外は一致（説明整合達成。残りは DS21/DS19）。
- 配布物構文健全性・文意保持: check_command_format・check_templates・check_content_corruption・check_skill_rename_symmetry・BOM/CRLF・コマンド索引すべて違反 0（親確認）。
- 未処理 artifact 確認: intake inbox 9件、learning inbox 41エントリ、inspect inbox 10件（defer 残置含む）はいずれも本 backlog-auto cycle の stage 2（昇格3系統）以降の入力。drafts 空、req-units 空（RU-0227 は case-ready 成功後に削除済み・commit 72cc380e）、inspect/promoted 空（前回 promote 7件は backlog-review で消費済み）、ローカル Issue なし。blocked・旧記録の新規異常なし。

## 観察メモ（finding としない）

- REQ-095.md:12（目的節）「case ラベルは廃止済み（定義を削除済み）であり」: 作業履歴風の語彙だが目的節の理由説明であり要件行 REQ-095-002 は現行契約のみ。1シグナル。
- REQ-011.md:20「Harness/Backend adapter 境界（ADF v4 実装責務境界 Design・DEC-036）に接続」: DEC-036 部分置換済みだが参照先は DEC-036 が維持する決定(2)部分に一致（REQ-002.md:14 が正確な annotation を保持）。誤オーナー参照なし。
- REQ-047.md:15「semantic/deterministic 区分は…DEC-036 が正典である」: DEC-036 決定(1)は DEC-048 部分置換（REQ-096.md:14 が記録）。rule-ownership Design 分類注記との併記で救済済み。pre-existing。
- REQ-035.md:43「処理単位の一級概念定義（DEC-036、REQ-11）」: annotation なし DEC-036 参照。既知 RQ11（:38）と同ファイルの別行。pre-existing。
- REQ-110.md:41（TS-004）「線形走査（O(n)）の検証」: 既知 RQ12 対象語彙が受け入れ条件対応節にも出現。要件行ではなく検証義務定義節のため MOVE 観点の要件行対象外。
- REQ-041.md:34（REQ-041-011）「backlog-auto 全体を完了扱いにしない」: 「全体」の指す範囲（整理サイクルか一気通貫か）は REQ-114-015 の所有分離宣言で機能上解決済み。
- case-auto.md Design:281「停止理由分類（REQ-034-015/108 拡張）」: REQ-034-108 という行 ID は現行 REQ-034 に存在せず斜読の余地あり（意図は「REQ-034-015 の拡張」か）。表現是正候補・low/low・pre-existing の可能性。判定確信不足のため所見化は見送り。
- case-close.md Design:353「（ユーザー判断 2026-10-15・判断記録 CR-003/CR-004）」: 判断記録参照の所在が本文から追跡不能だが契約根拠アンカー様式の範囲内（adversarial-review アンカー慣行との差異は主観的）。
- Design 状態乖離 DRIFT の判定記録（親直接判定）: 上記 6観点表 DRIFT 行を参照。対象なし、観察記録のみ。

## docs-check ルール候補（STEP-3-2）

| 候補 | 起源 finding |
|---|---|
| 同一ファイル内 covers 集合の包含重複検出 | DS22 |
| AUTOGEN 外での件数散文複製の機械照合 | GR11 |
| 適用範囲対象外宣言と同 REQ 内 schema 列挙行の共存検出 | RQ16 |
| 異言語文字混入（中国語字等）の Unicode 検査への追加 | DS23 |

## 推奨アクション

- DB02・DS17〜DS21: Case #3725（本 E2E 検証）の後続 Wave で REQ-114 の配布物反映とともに解消する見込み。Case 完了時に解消されていなければ、残留乖離として再検出する。
- DS25: 採用済み correction candidate として promoted に保存し、case-close Design のリリース手順の受け皿を後続検討する。RQ15: 却下（no-action）。REQ-114 の受け入れ条件は変更しない。GR10: 要ヒューマンレビュー（inspect-promote の review 対象）。
- DS22・DS23・GR11・RQ16: docs-check ルール候補として backlog-review 経由で検出基盤側へ育成可能。
- RQ17・DS24・DS26（なし）: 表現是正候補（次回現行化バッチ候補）。

## 対象外（Out of Scope）

- 文章表層品質（LLM 表現、空虚語、英語混じり表現の辞書検査）: 共通 textlint 基盤（`agentdev-textlint-guard`）の管轄。
- 配布物の構文健全性5パターン（frontmatter 重複、見出し重複、Markdown 構文破損、存在しない command 参照、エンコーディング不整合）: 機械検査で違反 0 を確認済み（本 finding の機械検査証拠表参照）。
- 配布物の Command/Skill 構造診断・実行主体分類の配布物側検査: `agentdev-inspect-skills` の診断対象。
- Design 状態乖離 DRIFT の時間ベース draft 放置検出: 判定基準を分離済み（diagnostic-categories.md 判定分離準拠）。
- REQ/Decision/Design の状態変更・修正・保存: 診断専用のため実施しない。
- GitHub Issue/PR 操作: 実施しない（agentdev_gh 不使用）。
- git commit/push: 本 run の実行契約上実施しない（後続工程の責務）。
