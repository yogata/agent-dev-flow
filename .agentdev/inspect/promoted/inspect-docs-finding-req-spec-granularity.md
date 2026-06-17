---
topic: req-spec-granularity
type: inspect-docs-finding
created: "2026-06-17"
source: "manual REQ-0102-054 + SPEC分離基準 + 安定契約例外 査定（REQ-0109-047 観点の手動実適用）"
status: promoted
promoted_date: "2026-06-17"
classification: promote
---

# Inspect Finding: REQ粒度（SPEC分離基準）査定

全25 active REQ を `REQ-0102-054`（粒度判定テスト）+ `document-model.md` SPEC分離基準 + 安定契約例外で査定した結果。`REQ-0109-047`（REQ/SPEC境界違反・REQ粒度過小・SPEC detail混入・誤分類）の診断観点の手動実適用。

## Summary

- 査定要件行総数: 約950行
- 移管候補（TRANSFER）: 約410行（43%）
- 境界（BORDERLINE-KEEP）: 約250行（26%）
- 妥当（CLEAN）: 約290行（31%）

要件行の4割超が SPEC / rule catalog / command reference / test docs への明確な移管候補。規約（`document-model.md`）と検出器（`REQ-0109-047`）は揃っているが、実行（全REQへの適用）が未着手だったことが原因。

## Scope

- **対象**: 全25 active REQ（REQ-0101〜REQ-0133、retired 8件は除く）
- **適用基準**:
  - SPEC分離基準（schema field / enum / route表 / file pattern / template variant / report format / fixture / regression / checker個別ルール / false positive抑制 / retry回数 / token目安 / 行数上限 / Step・Phase番号 / 内部アルゴリズム / 作業履歴）
  - 安定契約例外（公開command名 / 入口 / domain state位置 / inter-command接続 / ユーザー可視分類 / 安全境界 / 停止条件 / 安定外部契約）
  - 粒度判定テスト REQ-0102-054（「当該行が無くても REQ の言いたいことは分かるか」）
- **対象外**: retired REQ、ADR、SPEC本文、command/skill定義ファイルの本文、retired notes、mapping-table

## 診断サマリ（REQ別 汚染度）

| REQ | タイトル | 行数 | 移管候補 | 移管率 | 主な漏出 |
|---|---|---|---|---|---|
| REQ-0107 | Reporting/Writing Quality | 42 | 33 | 79% | template variant機構が全面侵食 |
| REQ-0108 | docs-check/Validation | 206 | 142 | 69% | rule catalog化（最大規模） |
| REQ-0106 | Epic/Wave orchestration | 9 | 6 | 67% | gitコマンド・行数上限 |
| REQ-0123 | workflow-lifecycle分担 | 19 | 11 | 58% | Step/path/行数密集 |
| REQ-0119 | 責務分界の再基準化 | 29 | 16 | 55% | Step番号・作業履歴 |
| REQ-0103 | Artifact責務分界 | 136 | 39 | 29% | token/行数/path |
| REQ-0112 | ADR lifecycle/体系基盤 | 59 | 26 | 44% | schema/checkerルール |
| REQ-0114 | case-auto 自走モード | 67 | 25 | 37% | report format/Step番号 |
| REQ-0109 | inspect-docs/REQ整合性 | 47 | 22 | 47% | 検出シグナル・git手順 |
| REQ-0102 | 要件定義・保存 | 57 | 13 | 23% | schema field多数 |
| REQ-0104 | Workflow/Command Protocol | 52 | 12 | 23% | route表/Step番号 |
| REQ-0101 | 文書・REQ管理基準 | 60 | 10 | 17% | 比較的健全 |
| REQ-0124 | inspect-* lifecycle | 21 | 9 | 43% | 作業履歴/file pattern |
| REQ-0127 | Intake command群 | 21 | 8 | 38% | template/Phase |
| REQ-0105 | RU lifecycle | 15 | 4 | 27% | schema field |
| REQ-0110 | Git worktree cleanup | 8 | 5 | 63% | 具体コマンド手順 |
| REQ-0131 | case-close | 20 | 6 | 30% | Step/retry/git手順 |
| REQ-0125 | inspect-skills | 14 | 6 | 43% | git手順/report |
| REQ-0126 | inspect-promote | 14 | 6 | 43% | git手順/report |
| REQ-0113 | Skill References SPEC分離 | 9 | 3 | 33% | file pattern/作業手段 |
| REQ-0128 | Learning-promote | 7 | 2 | 29% | 内部フェーズ |
| REQ-0132 | case-open | 6 | 2 | 33% | git status detail |
| REQ-0129 | Backlog-review | 11 | 1 | 9% | 最も健全 |
| REQ-0130 | case-run | 9 | 1 | 11% | 健全 |
| REQ-0133 | case-update | 8 | 1 | 13% | 健全 |

## 問題候補

### F-01: REQ-0108 rule catalog 化（MOVE + SPLIT）

| フィールド | 内容 |
|---|---|
| 観点 | MOVE（主）+ SPLIT（副）+ DUPLICATE（副） |
| 対象 | REQ-0108（docs-check/Validation/Tests、206行中142行が移管候補） |
| 根拠 | 個別checkerルール（REQ-0108-080〜094 frontmatter検査、082〜091 path検査、121〜141、161〜259 後半checker群）、検出シグナル定義、path解決アルゴリズム（REQ-0108-115 長大段落）、report schema（006/117/162/163/219/220）、false positive抑制（043/045/072/076/138/142/211/213）が要件行として残留。REQ-0108-001 は自己矛盾（「registry更新のみで対応」と宣言しつつ18集合をインライン）。正しい移管先 `integrity-rule-catalog.md` が既存（REQ-0108-150/151 が存在を要求）。 |
| シグナル数 | 4（MOVE-a: SPEC相当内容、MOVE-b: 作業手段混入、SPLIT: 複数関心対象混在、DUPLICATE: catalog重複） |
| 確信度 | high |
| 推奨アクション | MOVE + SPLIT（責務行とルール行の分離） |
| req-define入力案 | REQ-0108 を docs-check責務境界（read-only・検査対象の存在宣言・report→intake接続・baseline/3層gateの概念）十数行に凝縮。checkerルール群→`integrity-rule-catalog.md`、schema/report format→`document-model.md`/`workflow-contracts.md`、regression条件→test docs、内部アルゴリズム→SPECへ分散。 |

### F-02: REQ-0107 template variant 機構の全面侵食（MOVE）

| フィールド | 内容 |
|---|---|
| 観点 | MOVE |
| 対象 | REQ-0107（Reporting/Writing Quality、42行中33行・79%移管） |
| 根拠 | variant選択ロジック・variant path・variant schema（REQ-0107-012〜042 約30行）が要件の大部分。document-model SPEC分離基準: template variant→SPEC/command reference。WHAT（完了報告の品質基準・git永続化分離・AI-slop抑止）に対するHOW（variant機構の詳細）。 |
| シグナル数 | 3（MOVE-a: SPEC相当内容、template variant 該当、checker個別ルール該当） |
| 確信度 | high |
| 推奨アクション | MOVE |
| req-define入力案 | REQ-0107 を完了報告品質基準（git永続化欄分離・リンク正規化・AI-slop抑止・encoding LF/BOMなし）に凝縮。variant選択ロジック・path・schema は template/command reference へ。 |

### F-03: 実装パラメータの横断残留（MOVE）

| フィールド | 内容 |
|---|---|
| 観点 | MOVE |
| 対象 | REQ-0103-022/023/024（100/150/200行）、025（5〜12 Step）、082（chars/4）、083（3,500tk）、084（5,000tk）；REQ-0106-029（500行）；REQ-0110-001（3回retry）；REQ-0119-005/006/007（Step整数・12以下）；REQ-0123-018（200行）；REQ-0131-013（5回retry） |
| 根拠 | retry回数・token目安・行数上限・Step数が要件行に残留。document-model SPEC分離基準がこれらを明示的に「SPEC / command reference 行き」と定義（retry回数・token目安・行数上限・Step番号）。粒度判定テスト: これらが無くても WHAT（信頼性・品質管理）は不明にならない。 |
| シグナル数 | 3（MOVE-a + SPEC分離基準明示該当 + 粒度テスト NO） |
| 確信度 | high |
| 推奨アクション | MOVE（各該当SPEC / command authoring standards へ） |
| req-define入力案 | —（横断的UPDATE。各REQから該当行を削除し、該当SPEC / authoring standards へ集約） |

### F-04: 具体的 git 手順の残留（MOVE）

| フィールド | 内容 |
|---|---|
| 観点 | MOVE |
| 対象 | REQ-0110-005/006/008（`git worktree prune` / `git checkout .` / 3段フォールバック）；REQ-0106-019（`git rebase origin/main`）；REQ-0108-011；REQ-0109-040〜046（`git pull --ff-only`・commit message形式・template git欄）；REQ-0131-014（rebase workflow）/015（`--force-with-lease`）；REQ-0125/0126-010〜014（同系git手順） |
| 根拠 | 具体gitコマンド・フラグ・commit message形式・Step順手続きが要件行。WHAT（信頼性・安全同期）に対するHOW。document-model SPEC分離基準: file pattern / 内部アルゴリズム / report format→SPEC/command reference。 |
| シグナル数 | 3（MOVE-a + HOW該当 + 粒度テスト NO） |
| 確信度 | high |
| 推奨アクション | MOVE（command reference / skill reference / common template へ） |
| req-define入力案 | —（各REQから該当行を削除。共通git手順は共通skill reference / common template へ集約） |

### F-05: 内部アルゴリズムの残留（MOVE）

| フィールド | 内容 |
|---|---|
| 観点 | MOVE |
| 対象 | REQ-0108-115（パス解決アルゴリズム・長大段落）；REQ-0106-027（Wave scheduling 非重複チェック）；REQ-0114-042/044（Wave順序・OU queue制御）；REQ-0129-010（循環依存検証）；REQ-0130-005（キーワード抽出→SPEC矛盾確認）；REQ-0128-003（normalize→judge 6フェーズ） |
| 根拠 | 「どう判定するか」のアルゴリズム記述が要件行。document-model SPEC分離基準: 内部アルゴリズム→SPEC。WHAT（何を検証するか）は残し、HOW（検証アルゴリズム）はSPEC/scriptへ。 |
| シグナル数 | 2（MOVE-a + 内部アルゴリズム明示該当） |
| 確信度 | high |
| 推奨アクション | MOVE（SPEC / script docs へ） |
| req-define入力案 | — |

### F-06: report format / schema field の残留（MOVE）

| フィールド | 内容 |
|---|---|
| 観点 | MOVE |
| 対象 | REQ-0108-006（level/category/route/file/line/evidence）/117（OK結果フィールド）/162/163（artifact_type/check/finding_category）/219/220（intake item schema）；REQ-0107-039〜045（variant別schema field群）；REQ-0102-011/013/016/020/034/036（report schema fields）；REQ-0103-130/135/136/137（draft schema） |
| 根拠 | 出力スキーマのフィールド一覧が要件行。document-model SPEC分離基準: report format / schema field→SPEC。 |
| シグナル数 | 2（MOVE-a + schema field 明示該当） |
| 確信度 | high |
| 推奨アクション | MOVE（`document-model.md` / `workflow-contracts.md` / `artifact-contracts.md` へ） |
| req-define入力案 | — |

### F-07: 作業履歴 / 移行記録の現行REQ残留（MOVE・REQ-0102-049 違反）

| フィールド | 内容 |
|---|---|
| 観点 | MOVE |
| 対象 | REQ-0109-038（PR #743 commit hash 90064c2 引用）；REQ-0119-025/026/027（REQ-0111 retired経緯・REQ-0103-089参照更新・REQ-0118吸収退役判断）；REQ-0112-051/052（ADR-0017→0103 具体対応表・対象8ファイル列挙）；REQ-0124-007/010/017/020（diagnostics→inspect 改名履歴） |
| 根拠 | PR番号・commit hash・retired経緯・改名履歴が現行REQに残留。REQ-0102-049 が「作業手段（移行・変更・再定義・削除・改名・移管・除去等）は case/Issue/受け入れ条件/作業記録で扱い、active REQ の要件行に混入させない」を明示。document-model SPEC分離基準: 作業履歴→test docs/作業記録。 |
| シグナル数 | 3（MOVE-a + 作業手段語混入 + 粒度テスト NO） |
| 確信度 | high |
| 推奨アクション | MOVE（retired notes / mapping-table / 作業記録 へ） |
| req-define入力案 | — |

### F-08: REQ-0123 / REQ-0119 の Step・path・履歴密集（MOVE + UPDATE）

| フィールド | 内容 |
|---|---|
| 観点 | MOVE |
| 対象 | REQ-0123（58%移管：Step番号・Phase番号・file pattern・行数上限が密集）；REQ-0119（55%移管：Step整数化・delegation_type schema・retired経緯が混入） |
| 根拠 | 両REQとも責務分界のWHATは妥当だが、Step/path/schema/履歴の詳細が過半を占める。document-model SPEC分離基準: Step/Phase番号・file pattern・schema field→SPEC/command reference。 |
| シグナル数 | 2（MOVE-a + 複数SPEC分離該当） |
| 確信度 | medium |
| 推奨アクション | MOVE + UPDATE（WHAT責務境界は残し、詳細は該当SPEC/skill referenceへ） |
| req-define入力案 | REQ-0123 は workflow-lifecycle 責務限定の要約に凝縮。REQ-0119 は command/skill/sub-agent 責務分界の要約に凝縮。 |

### F-09: 検出シグナル定義・enum・route表の rule catalog 残留（MOVE）

| フィールド | 内容 |
|---|---|
| 観点 | MOVE |
| 対象 | REQ-0109-023〜036（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 検出シグナル定義・確信度 enum・推奨アクション enum・シグナル閾値）；REQ-0108-017（finding category enum 6値）/018（route 判定表） |
| 根拠 | 検出シグナル詳細・enum値一覧・route判定表が要件行。これらは既に `agentdev-req-structure-diagnostics/references/req-structure-review.md` に正として存在（DUPLICATE）。document-model SPEC分離基準: enum値一覧・route詳細判定表・checker個別ルール→SPEC/rule catalog。 |
| シグナル数 | 3（MOVE-a + DUPLICATE 正位置と重複 + enum/route明示該当） |
| 確信度 | high |
| 推奨アクション | MOVE（`integrity-rule-catalog.md` / rule catalog へ。正位置があるものはDUPLICATE解消） |
| req-define入力案 | — |

### F-10: REQ-0103 god-REQ（SPLIT 候補・9関心混在）

| フィールド | 内容 |
|---|---|
| 観点 | SPLIT |
| 対象 | REQ-0103（Artifact責任分界・136行。既存 F-03/F-06 で39行が移管候補だが、構造的に9関心対象が混在） |
| 根拠 | 単一 REQ に 9 関心対象が混在: (1) Command/Skill 責務境界 001-045, (2) source/projection 048-065, (3) sync script 050-055, (4) repo type 061-065, (5) consumer install 072-077, (6) token budget 082-089, (7) Skill 粒度 100-106, (8) inspect domain 140-151, (9) drafts 配置 126-137。REQ-0101-054（1 command = 1 command-level REQ 原則）から見て、REQ-0103 は artifact-runtime 系の複数独立関心を担いすぎている。F-01 の REQ-0108 SPLIT（checker rule の横並び過多）とは別軸の god-REQ |
| シグナル数 | 4（(a) 複数関心対象 / (b) 複数 artifact 種別: command・skill・sync script・install script・drafts・domain state / (c) 複数 command family: case-*/inspect-*/req-*/learning / (d) 複数 lifecycle 段階: authoring・distribution・operation） |
| 確信度 | high |
| 推奨アクション | SPLIT |
| req-define入力案 | 「REQ-0103 を artifact 責務境界の中核（001-045 相当）に縮退させ、配布基盤（source/projection・sync・repo type・consumer install）・inspect domain・drafts・authoring standards をそれぞれ独立 REQ として再構成する」。ただし REQ-0103-079-081（配布物境界制約）・078（inter-command skill load 契約）・009/056/066/067（namespace・予約名）・070（domain state 位置づけ）は安定契約例外（REQ-0101-069）で残置。新規 REQ ID 採番と分割軸最終決定は req-define + ユーザー承認 |

## Initial Remediation Direction（優先度順）

1. **REQ-0108 の外科的分離**（最大効果・F-01）: WHAT（docs-check検査責務・read-only境界・report→intake接続）を十数行に凝縮。140行超のcheckerルールは既存 `integrity-rule-catalog.md` へ。自己矛盾（REQ-0108-001）も解消。
2. **REQ-0107 template 機構切り出し**（F-02）: variant選択・path・schema を command reference/templates へ。WHAT（完了報告品質基準）のみ残す。
3. **横断的パラメータの一括SPEC化**（F-03）: retry回数・token目安・行数上限・Step数を該当SPEC/authoring standards へ集約。
4. **共通git手順の集約**（F-04）: 各REQに散在する git 手順を共通skill reference / common template へ集約。
5. **作業履歴の退去**（F-07）: retired経緯・改名履歴・commit hash を retired notes / mapping-table / 作業記録へ。
6. **`REQ-0109-047` の機械化**: この査定を inspect-docs に組込み、再発防止を自動化。
7. **REQ-0103 god-REQ の分割検討**（F-10）: MOVE 系是正（1-5）で REQ-0103 が縮小した後に、配布基盤・inspect domain・drafts・authoring standards への軸別 SPLIT を検討。F-01（REQ-0108 SPLIT）と併せて構造的課題。

## Out of Scope

- 本findingは診断結果の記録のみ。REQ/SPECファイルの実際の編集・移管は含まない。
- 各移管候補行の個別 REQ-NNNN-SSS 全文（約410行）はセッション内査定ログに残り、本findingでは9クラスタに集約。個別行レベルの是正は req-define / req-save で実施。
- BORDERLINE-KEEP（約250行）の個別判断は、各クラスタ是正時に安定契約例外の適否を再判定する。

## Suggested route

- **主 route**: `req-define`（F-01/F-02/F-08 は再壁打ちが必要。REQ残存行と移管先行の切り分け）
- **副 route**: `inspect-promote`（本findingを promote → backlog-review → RU化 → req-define で是正Case化）
- **学習候補**: 「規約と検出器が揃っていても実行が追いつかない」という再発防止知見。`learning-capture` 候補（横断的パラメータ・git手順の混入は新規REQ作成時の繰り返しリスクあり）
