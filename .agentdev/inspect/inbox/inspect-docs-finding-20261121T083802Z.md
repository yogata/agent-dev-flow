# inspect-docs finding 20261121T083802Z

## 処分記録（inspect-promote 2026-11-21・backlog-auto stage 2・inspect 系統）

- 処分実行: inspect-promote workflow（`--auto` 未指定・通常実行）。全 71 件を自律確定（REQ-036-018。HITL 対象 0 件）
- promote 59 件: `.agentdev/inspect/promoted/inspect-promoted-20261121T083802Z.md` へ保存済み（本ファイルからは除去）
- defer 12 件（本ファイルに残置）: REQ-07, REQ-16, REQ-18, REQ-22, REQ-23, DESIGN-11, DESIGN-17, DESIGN-23, DESIGN-36, DESIGN-37, DOC-04, DIST-01
- reject 0 件（誤検知・対応不要の確定なし）
- review: adversarial-review 実施済み（暫定分類後・確定前。accepted 変更 2 件反映、unresolved 本質的争点なし）
- 検証: evidence 抜き取り再確認 9 件（8 件は主張どおり。DESIGN-23 は過大主張のため promote から defer へ修正——「runtime 制御契約」節は `docs/designs/commands/case-auto/references/parallel-orchestration.md:53` に実在し実値（上限5・起動間隔10秒）も保持。case-auto.md 本体「後述」表記の指し先不正確のみ残存）
- 再開時: 本ファイル残置分は処理実行済み報告付き defer として扱う（resume protocol）

## サマリ

- スキャン対象: docs 全体（REQ 78件 / ADR〔Decision〕45件 / Design 158件 / guides 14件 / 索引 README 4件 / 配布物 src/common・.opencode 投影 287 Markdown）+ `.agentdev/` 状態領域
- 実行形態: STEP-2 意味診断を 5 診断担当（REQ-early 44件 / REQ-late 34件 / Design-A 110件 / Design-B 91件 / Decision-guides-README 62件）へ並列委譲し親が fan-in。STEP-3 配布物整合性検査は親が逐次実行
- 機械検査: 検証エンジン全量（23 ルール実行 / OK 24・NG 0・Warning 0・Error 0）でクリーン。本 finding 群はすべて機械検査を通過している意味レベルの指摘
- 検出事項（stage 1 スキャン時）: **71件**（REQ 23 / Design 37 / Decision-guides-README 10 / 配布物・状態領域 1。severity 内訳: high 4 / medium 34 / low 33）。現状: promote 59 件は処分済み、defer 12 件を本ファイルに残置（冒頭の処分記録参照）
- 観点網羅: SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT の6観点すべてで検出あり
- req-define入力案: なし（本診断は要件変更判断を保留し、finding として記録のみ。draft 生成は行わない）
- 待ち行列滞留: 滞留なし（inspect inbox は本ファイル生成前、空）

---

## 検出事項リスト

各検出事項は finding schema（id / category / target / evidence / severity / confidence / source_of_truth / recommended_route / ng_classification / notes）に従う。
source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides。

### REQ 層

**REQ-07 / RETIRE** target: docs/requirements/REQ-117.md、REQ-119.md、REQ-120.md、REQ-122.md、REQ-123.md、REQ-113.md
evidence: 完了済み「N 作業単位」一括是正 REQ 群の RETIRE 検討。実施済み傍証: REQ-117-007 の case-run scripts tsconfig+package.json 現存、REQ-117-004 の検証参照 IR-073 も現行不存在（untracked 残存検出は後続で撤去）、REQ-113-001 の `src/common/tools/agentdev-gh/local/tsconfig.json` `"extends": "../tsconfig.json"` 統合済み実測、REQ-119-002/005 の反映先現存。REQ-122・REQ-123 は進行中のため完了判定確定後の処置。
severity: medium / confidence: medium / source_of_truth: REQ-103-020（歴史は Git 履歴で担保）・AGENTS.md 最上位制約1・REQ-008（一時成果物ライフサイクル）
recommended_route: backlog-review（REQ-122/123 完了判定後、REQ-117/119/120/122/123・REQ-113 の RETIRE（REQ-103-020 準拠 Clean Deletion）を一括提案）
ng_classification: pre-existing / notes: REQ-117-011 の恒久契約文言を REQ-117 全体 RETIRE で残すかは利用者判断境界。

**REQ-16 / 文書分類（MOVE 候補）** target: docs/requirements/REQ-052.md:36-37（REQ-052-016/017）
evidence: 運用文書の内容（issue-operation-recovery.md への明記事項・診断手順2段分離試験の判定分類値域）を要件行が規範化。Custom Tool 限定の安全境界部分は要件として妥当。
severity: low / confidence: medium / source_of_truth: REQ-001-002・REQ-001-067
recommended_route: /agentdev/req-define（MOVE 判定。安全境界部分は維持）
ng_classification: pre-existing

**REQ-18 / 文書分類（MOVE 候補）** target: docs/requirements/REQ-030.md:51（REQ-030-032）、docs/requirements/REQ-029.md:36（REQ-029-017）
evidence: REQ-030（case-open 実行契約）内に case-close 機械工程の行（REQ-030-032）、REQ-029（配布依存境界）内に case-open 機械工程の行（REQ-029-017）が配置。所有者は REQ-032 / REQ-030。0件案件横断契約の意図的分持ちの可能性を含む。
severity: low / confidence: medium / source_of_truth: REQ-032・REQ-030（実行契約の所有）
recommended_route: /agentdev/req-define（MERGE/MOVE 判定）
ng_classification: pre-existing

**REQ-22 / 表記** target: docs/requirements/REQ-012.md:22（REQ-012-026）
evidence: 要件行 ID 書式表記 `REQ-{NNNN}-{MMM}` が正規書式 `REQ-{NNN}-{MMM}`（patterns.md:36・numbering-policy.md:34）と不整合。DEC-062（受理上限撤廃）により規範違反とは断定できない。
severity: low / confidence: medium / source_of_truth: patterns.md・numbering-policy.md
recommended_route: 診断修正候補
ng_classification: pre-existing

**REQ-23 / REQ 本文の経緯記述** target: docs/requirements/REQ-048.md:18-20
evidence: 目的節「本要件は、旧 REQ-048（ADF 実行効率第1次改善）で導入された…」が REQ-001-014（本文は過去前提・移行経緯を含まない）と緊張。同一 ID の in-place リライトで廃止識別子再利用（REQ-001-013）には非抵触の解釈が成立。
severity: low / confidence: low / source_of_truth: REQ-001-014
recommended_route: /agentdev/req-define（REQ-001-014 との整合判断を保留記録）
ng_classification: pre-existing / notes: 判断保留のため finding として記録。

### Design 層（基盤ドメイン）

**DESIGN-11 / 計画残骸・所有欠落** target: docs/designs/quality/quality-specs.md:38-42
evidence: 「必須シナリオ（S-001..S-010）説明中の RU-xxxx 設計根拠参照を除去し…詳細 normative は移行計画 §5.6」。計画ディレクティブ残留 + DESIGN-02 と重複の死んだポインタ。指定された定義場所（Design）は空で、document-type-responsibilities.md:580 が Release Report・Design 配置を定義するも現行 Design ツリーに S-001〜S-010 の内容不存在。
severity: medium / confidence: medium / source_of_truth: document-type-responsibilities.md:580
recommended_route: /agentdev/req-define（10シナリオ定義の欠落は要件級の判断を要するため req-define 入口）
ng_classification: pre-existing

**DESIGN-17 / 所有矛盾・長期 draft** target: docs/designs/foundations/adopted-conventions.md（frontmatter、:11、:105、:68-79）
evidence: status: draft（2026-10-09 作成・README status 列で管理）。`:11`・`:105` が resolver 実装を「後続の実装 Design」へ委譲するが、resolver（`src/common/skills/agentdev-adopted-conventions/scripts/src/resolve.ts`・evaluate.ts）は既に稼働中で後継実装 Design は不存在（skill Design 一覧に adopted-conventions 行なし）。`:68-79` は target_area 指定付きパッチ形式の追記ブロック。skill Design 不在自体は targeted-docs-guard-implementation.md:191-192 で容認。
severity: medium / confidence: medium / source_of_truth: リポジトリ実在・docs/designs/README.md
recommended_route: /agentdev/req-define（実装 Design の新規 or 所有宣言の現行化。draft 昇格判断を含む）
ng_classification: pre-existing

### Design 層（commands / skills / workflows）

**DESIGN-23 / 正規所有破損（runtime 制御契約節）** target: docs/designs/commands/case-auto.md:82,86、src/common/skills/agentdev-workflow-case-auto/SKILL.md:87、docs/designs/foundations/runtime-execution-model.md:67
evidence: case-auto Design「後述『runtime 制御契約』節」2件・workflow-case-auto SKILL「詳細は case-auto Design『runtime 制御契約』節」が参照する節が両側に不存在（grep 確認・スリム化系列 commit 3653293a3 で削除の形跡）。runtime-execution-model.md:67 は「上限の数値は case-auto Design が所有」と主張し実値（上限5・起動間隔10秒）は SKILL にのみ存在。受理済み Design 間で所有宣言が互いに破損。
severity: high / confidence: high / source_of_truth: runtime-execution-model.md「runtime 制御ループ」節（実在）＋DEC-010・REQ-034-027
recommended_route: /agentdev/req-define（または Design 修正 case 経路。所有位置を case-auto Design に復権させるか SKILL 参照に付け替えるかの一箇所決定が必要）
ng_classification: pre-existing

**DESIGN-36 / 廃止 IR 言及** target: docs/designs/skills/agentdev-git-worktree-test-fallback.md:35
evidence: 「ir035 worktree 誤検出」。IR-035 は現行 IR に不存在（再番号の可能性）。
severity: low / confidence: medium / source_of_truth: rules/ 現行一覧
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-37 / 移行期言語残存** target: docs/designs/workflows/lifecycle-state-machine.md:43,65-67,76
evidence: 「v3 result 契約の置換・改名は後続段階が所有する」「後続 Sequence 段階での再定義を先取りしない」「承継分配の正は第9段 Root Case #3022」。v4 移行 Sequence 完遂済みで計画期の参照構造が残存（provenance 注記として意図的な可能性）。
severity: low / confidence: medium / source_of_truth: 同 Design の移行完遂事実
recommended_route: Design 修正経路（provenance 保持の判断込み）
ng_classification: pre-existing

### Decision / guides / README 層

**DOC-04 / 欠番散文の不完全性** target: docs/decisions/README.md:10
evidence: 「DEC-018 は欠番であり…」のみで、実欠番は23個（DEC-002/005/007/015/017/018/027-031/033/034/040/043-046/052/059/060/064）。Clean Deletion 原則では全欠番列挙は不要であり、DEC-018 だけ特記する現行散文が自身不完全。
severity: low / confidence: medium / source_of_truth: decisions/ 実在一覧・AGENTS.md Clean Deletion
recommended_route: 診断修正候補（DEC-018 特記の要否判断。DOC-02 と合わせて）
ng_classification: pre-existing / notes: DEC-018 が発行取り消しとして区別される特別番号の可能性。

### 配布物整合性・未処理 artifact（STEP-3・親実行分）

**DIST-01 / 一時資材残置（観察メモ）** target: .agentdev/integrity/reports/（2,752 ファイル）
evidence: 非永続・git 管理対象外領域（.agentdev/README.md 状態表）に過去検証の一時資材が大量残置。特に `case-auto-20261008-cleanup/3550/` 配下は worktree 内 `.agentdev` 全体がネストコピーされた「環境一式」相当の構造（`.agentdev/3550/.agentdev/tmp/case-3550/...` 等）。REQ-118-007 は「全生ログ、環境一式…を別保管庫へ移して恒久保持する方式を採らない」と定義するが、本領域は非永続のため REQ-118 違反とは断定できない。REQ-118 の適用範囲対象外「過去に残存した資材の個別削除実行」に該当。
severity: low / confidence: medium / source_of_truth: REQ-118-007・.agentdev/README.md 状態表
recommended_route: learning/intake（REQ-118 の後片付け責務観点での整理候補として記録。削除実行は REQ-118 対象外のため本診断では実施しない）
ng_classification: pre-existing / notes: 診断専用実行のため回収操作は行わない。REQ-118-001 の「回収または引継ぎが成立していない場合は未処理事項として報告」に基づく記録。

### STEP-3-2: docs-check route 判定

意味的疑いのうち機械的検査に落とせる候補の提示:
- 節名参照の実在性（DESIGN-23「runtime 制御契約」節・DESIGN-16「IR-019...移管」節等の Markdown リンク外の節参照）の機械検査は技術的に可能だが、**推奨しない**: IR 減量方針（REQ-122-001・DEC-065）と DEC-001 決定4（新規統制既定不追加）に抵触する。意味診断（inspect-docs 定期実行）での監視を継続する。
- Decision ID 参照の実在性（DOC-02 DEC-064 懸垂参照）も同様に IR-067 の対象拡張（REQ 行 → Decision ID）は技術可能だが、同じく新規統制追加に抵触するため route 判定としては候補保留（要ヒューマンレビュー）。

---

## 推奨アクション（route サマリ）

| route | 対象 finding |
|---|---|
| /agentdev/req-define（REQ 現行化・修正判断） | REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-08, REQ-09, REQ-13, REQ-14〜REQ-19, REQ-23, DESIGN-01, DESIGN-02, DESIGN-07, DESIGN-11, DESIGN-17, DESIGN-23, DESIGN-29, DESIGN-32 |
| /agentdev/req-define（RETIRE 判定提案: backlog-review 経由） | REQ-07（REQ-117/119/120/122/123・REQ-113。REQ-122/123 完了判定確定後） |
| Design 修正経路（参照付け替え・現行化・断片削除。小粒で機械的な整理は case 経路または次回 docs 整理で一括） | DESIGN-03〜06, 08〜10, 12〜16, 18〜22, 24〜28, 30〜31, 33〜37, DOC-02 |
| 診断修正候補（guide・索引・表記系の軽微修正） | REQ-12, REQ-20, REQ-21, REQ-22, DOC-01, DOC-03〜10 |
| learning / intake（整理是正候補の記録） | DIST-01 |
| 保留（要ヒューマンレビュー） | STEP-3-2 の docs-check ルール化2件、REQ-23 |

優先度の高い系統:
1. **REQ-01/REQ-02/DESIGN-29 の「公開 command 廃止後の残置」系統**（REQ 層・Design 層・配布物本体を跨ぐ横断不一致）
2. **DESIGN-23 の runtime 制御契約所有ポインタ破損**（受理済み Design 間の所有宣言破損・実値所在が SKILL 単独に移動）
3. **REQ-07 の RETIRE 判定系統**（REQ-122/123 完了判定後の REQ-117/119/120/122/123・REQ-113 一括 RETIRE。REQ-03〜REQ-06 の陳腐化行は RETIRE で自然解消）
4. **DESIGN-01/02/07 の廃止参照・死んだポインタ系統**（規範参照が到達不能）

---

## 対象外（Out of Scope）

本スキャンで明示的に対象外（false positive 判定または正当クラス）とした事項:

- **機械スキャンの誤検知群**: 見出し重複 170件（STEP 単位テンプレ構造・例示の意図的繰り返し）、frontmatter 二重ブロック検出 8件（Markdown 水平線の誤判定）、壊れた括弧パターン 8件（検出パターン例示の本文・通常文）、CRLF/LF 混在 4件（git 管理外 node_modules 配下の第三者ファイル）、`/agentdev/templates` 26件（`.opencode/commands/agentdev/templates/...` パス参照の regex 誤マッチ）
- **正規参照表の廃止コマンド移行案内**（src/common/commands/agentdev/README.md L45-49 の `/agentdev/case-open` 等5件）: REQ-103-022 の「歴史的説明」正当クラス
- **廃止明示付き歴史言及**: REQ-014/015 の REQ-016、REQ-003 の REQ-096 移管、REQ-010/036 の REQ-028（retired 明示＋移管先提示）、REQ-094 語彙レジストリ廃止、REQ-095 の REQ-093 廃止、REQ-117-011 の IR-072 廃止明示、採番注記フッタ、v2:REQ 履歴参照、adversarial-review Design の旧 Design 保全、case-close Design「（削除済み）」明示記述
- **integrity ルールカタログ等のチェック仕様所有**（docs/designs/integrity/ 配下）: DEC-065 による正当な所有（DESIGN 群の指摘はチェック仕様の所有ではなく意味ポインタの陳腐化のみを対象）
- **v4/v5 の二重正規併存**（REQ-103-027・REQ-108-012・docs/README.md「採用済み v5 基盤」記述）: 移行期の意図された状態
- **learning inbox 10件**（2026-11-21・Wave-4 close learnings）: stage 2（learning-promote）の正規待ち行列。learning 側で既に検知済みの REQ-001-054/055 参照文意不一致・REQ-037-006 参照整合候補は本診断 findings と重複なし（対象面が異なる）
- **`.agentdev/phase/` 保存状態・intake/drafts/blocked**: 空または正規待ち行列
- **Decision 部分置換3件**（DEC-036/037/041）: 後継（DEC-048/049/054/051）との維持部分矛盾なし（全文照合済み）
- **docs-check（repo-local command `/repo/docs-check`）**: 現存確認済みのため REQ-010 は現行（RETIRE 対象外）

---

* 診断実行: inspect-docs workflow（backlog-auto stage 1）。診断専用実行のため本 finding ファイル生成以外の副作用なし。検出事項の分類・処分（promote/defer/reject）は inspect-promote（stage 2）の責務。*

