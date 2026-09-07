# inspect-docs finding 20260907T012032Z

## サマリ

- スキャン対象:
  - docs/requirements: 58ファイル（現行 47、retired 11）
  - docs/decisions: 27ファイル（DEC 26 + README）
  - docs/designs: 172ファイル（README 含む）
  - docs/guides: 11ファイル
  - docs/knowledge: 3ファイル
  - README.md（ルート）、docs/README.md
  - 配布物: 261ファイル（.opencode/commands/agentdev/** 31、.opencode/skills/agentdev-*/** 230。うち vendored node_modules 37ファイルは検査対象外、自著作 224ファイル）
- 検出件数: 4件
  - カテゴリ別: 廃止 REQ 参照不整合 1 / docs 参照整合（相対リンク切れ）1 / 配布物 ID 汚染 1 / REQ 構造（RETIRE 候補）1
  - severity 別: high 1 / medium 2 / low 1
  - NG 分類別: 今回修正対象 1 / pre-existing 3 / false positive 0
- 既存 defer の継続観察: F-05（20260822）、F-08〜F-12・F-27・F-34・F-36（20260901）は inbox 残置のまま（本ファイルでは再検出せず、後段 inspect-promote の再評価対象）

## 検出事項リスト

### F-01: decisions/README.md の DEC-013 関連REQ行が retired REQ-028 へ現行パスのリンクを保持

- **category**: 廃止 REQ 参照不整合（リンク切れ・retired 注記欠落）
- **target**: docs/decisions/README.md:181（DEC-013 行）
- **evidence**: `[REQ-028](../requirements/REQ-028.md)` は実在しない `docs/requirements/REQ-028.md` を指す（実体は `docs/requirements/retired/REQ-028.md`）。同行は REQ-028 に (retired) 注記・後継併記もない。document-model.md「参照規則」（L382、REQ-001-048）は廃止文書参照に (retired) 注記と現行後継の併記を要求する。DEC-007 行（L175）・DEC-017 行（L185）は retired パス + 注記の正規形であり、DEC-013 行のみ旧形のまま
- **severity**: medium
- **confidence**: high（相対リンク実在チェックで機械的確定）
- **source_of_truth**: 現行 REQ 体系（docs/requirements/README.md 廃止済み要件表）と document-model.md 参照規則を正とし、decisions/README.md 該当行を矛盾側と判定
- **recommended_route**: 意味診断検出事項（UPDATE: `retired/REQ-028.md` へのリンク修正 +「retired、IR 存在条件契約は DEC-013 が移管受入れ」注記の追加）
- **ng_classification**: pre-existing（当該行は 2026-08-11 be3359db 導入。前回 2026-09-01 診断では decisions/README の個別リンク実在は未検査）
- **notes**: 関連 REQ 表は AUTOGEN 管理外（手動管理）のため、design-save 経由ではなく docs_chore 系修正に相当

### F-02: docs/designs 配下の相対リンク切れ 5件（IR-062 の機械検査対象外領域）

- **category**: docs 参照整合（相対リンク切れ）
- **target**:
  - docs/designs/integrity/rules/IR-060-forbidden-japanese-word-detection.md:35、:67、:68
  - docs/designs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md:131
  - docs/designs/quality/quality-gates.md:214
- **evidence**:
  - IR-060:35/:67 は `../../../src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md`（docs/src に解決され実在しない。正しくは `../../../../src/...`）
  - IR-060:68 は `../responsibilities/document-type-responsibilities.md`（docs/designs/integrity/responsibilities/ に解決され実在しない。正しくは `../../responsibilities/...`）
  - IR-057:131 は `../obsolete-path-map.yaml`（docs/designs/integrity/ に解決され実在しない。実体は `.opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml`）
  - quality-gates.md:214 は `../../src/opencode/skills/agentdev-quality-gates/SKILL.md`（docs/src に解決され実在しない。正しくは `../../../src/...`）
- **severity**: medium（参照整合性の局所的破綻。読者導線の断）
- **confidence**: high（相対パス解決で機械的確定）
- **source_of_truth**: 実ファイル配置（src/opencode/、.opencode/skills/repo-agentdev-integrity/data/、docs/designs/responsibilities/）を正とし、リンク記述側を矛盾側と判定
- **recommended_route**: 意味診断検出事項（UPDATE: 5リンクの相対深度・参照先修正）。加えて docs-check route 候補: IR-062（reference-path-existence）は配布物（commands/skills）のみが対象のため、docs/designs 相対リンク実在検査のルール化または IR-062 対象拡張を提案
- **ng_classification**: pre-existing（IR-060・IR-057 は 2026-08-20 5111aac3 最終更新時点から解決不能。quality-gates.md は 2026-09-04 の用語棚卸し（7813f83f）で更新されたが、リンク深度誤りは旧来からのもの）
- **notes**: IR-060:35/:67 の参照先（置換辞書）は IR-060 の forbidden 語リストの正であるため、切れたままでは検出基盤の正参照が導線上不明になる

### F-03: 配布物本文中の REQ 行 ID 直接引用 9箇所（IR-059 具体ID 相当）

- **category**: 配布物 ID 汚染（内部 ID 残留、MOVE）
- **target**:（src/opencode/ 正本。.opencode/ 投影と内容同一、投影差分 0）
  - src/opencode/commands/agentdev/case-open.md:11（REQ-017-017）
  - src/opencode/commands/agentdev/case-run.md:43（REQ-017-017）
  - src/opencode/commands/agentdev/req-define.md:46（REQ-004-037）、:47（REQ-008-060）
  - src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:65（REQ-017-017）
  - src/opencode/skills/agentdev-req-analysis/SKILL.md:34（REQ-004-037）
  - src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md:147（REQ-004-037）、:161（REQ-004-038）
  - src/opencode/skills/agentdev-workflow-case-open/references/issue-body-and-execution-contract.md:92（REQ-017-017）
- **evidence**: 文末出典括弧「（REQ-017-017）」等の形で内部 REQ 行 ID が配布物本文に残留。IR-059（distribution-reference-boundary、severity: strict）は配布テキスト成果物中の具体ID（`REQ-NNNN-NNN`）を検知対象とし、exemption（テンプレートプレースホルダー、検査対象path宣言、索引として許可された README 参照、generic/template 参照）のいずれにも該当しない。配布物利用者は docs/requirements を配布物内に持たず、当該 ID を追跡する導線がない
- **severity**: high
- **confidence**: high（パターン照合は機械的。ADR/SPEC/IR 系の他パターンは 0 件）
- **source_of_truth**: REQ-029（配布依存境界）と IR-059 を正とし、配布物本文の具体ID 記述を矛盾側と判定
- **recommended_route**: 意味診断検出事項（MOVE: ID 引用を機能的記述へ置換、または ADF-COVERS 宣言等の正規機構へ集約。realization_actions 導入系・要件分析観点系の 2026-09-03 以降コミットで導入）
- **ng_classification**: 今回修正対象
- **notes**: `<!-- ADF-COVERS(implementation): ... -->` 宣言（agentdev-doc-writing、agentdev-req-analysis、agentdev-workflow-case-close、agentdev-workflow-case-open、agentdev-decision-file-manager 配下）は artifact-responsibilities.md「ADF-COVERS 実装対応宣言の正規配置先カタログ」に基づく正規機構のため対象外。`REQ-{NNNN}-{NNN}` プレースホルダー表記も従来慣行どおり対象外

### F-04: REQ-057（docs corpus 整合バッチ）の完了後 RETIRE 候補性（既存 defer F-11 系統の拡張観察）

- **category**: RETIRE 候補（移行完了状態の恒久 REQ 化）
- **target**: docs/requirements/REQ-057.md（要件テーブル全体）
- **evidence**: REQ-057 は「docs corpus 整合・現行化バッチ」として OU 単位の一回きり整合作業を要件行化した構造（REQ-057-001〜028）。Epic #2506 系（Issues #2510〜#2642、Epic #2633 Wave 1 完了済み）が進行中のため現時点で廃止ではないが、バッチ完了時には REQ-016 に対する既存 defer F-11（20260901T120043Z）と同型の「移行完了状態」RETIRE 候補となる。REQ-045（網羅監査）・REQ-046（横断正規化後の不変条件）も F-11 が指摘する同型群
- **severity**: low
- **confidence**: medium（将来判断の予告であり、現時点で不正状態ではない）
- **source_of_truth**: REQ-001 の廃止候補類型（移行完了状態）を基準にした構造観察
- **recommended_route**: 意味診断検出事項（F-11 と統合して次回以降の inspect サイクルで再評価。REQ-057 の完了判定は Epic #2506/#2633 系 case-close を条件とする観察継続）
- **ng_classification**: pre-existing（F-11 defer 系統のスコープ拡張）
- **notes**: バッチ進行中のため本サイクルでの処置不要

## 推奨アクション

- F-01、F-02: docs_chore 系の小修正（リンク修正）。`/agentdev/req-define`（docs_chore）または intake 経由での要件化候補
- F-03: 配布物の ID 置換（IR-059 triage_action: generic 表現へ是正）。intake 経由で RU 化したうえで case 系で修正するか、次回 docs corpus バッチへ束ねるかは inspect-promote / backlog-review で判断
- F-04: 観察継続（F-11 と統合した再評価）
- docs-check route 候補（STEP-3-2 の判定結果）:
  1. decisions/README.md 関連REQ表の retired REQ 実パスリンク検査（IR-041/IR-040 系の decisions README 適用拡張）
  2. docs/designs 配下相対リンク実在検査（IR-062 の対象拡張または新規ルール化）
  3. docs/reports の歴史的リンク切れの取扱い明確化（検査対象外運用の明文化）

## 対象外（Out of Scope）

- vendored node_modules 37ファイル（`.opencode/skills/*/scripts/node_modules/`）。うち 4ファイル（`@types/bun/README.md`）に CRLF/LF 混在を検出したが、git 管理対象外（.gitignore）のローカル生成物のため配布物検査の対象外
- 配布物 ADF-COVERS(implementation) 宣言中の REQ ID（正規配置先カタログに基づく機械消費の対応宣言）
- docs/reports/ 配下の監査レポート 8ファイル 19リンクの相対リンク切れ（2026-08 の docs 再編・Report 分離に伴う歴史記録の陳腐化。凍結監査記録のため本診断の修正対象外。docs-check route 候補 3 として扱いの明確化を提案）
- 既存 defer 検出事項の再審（F-05、F-08〜F-12、F-27、F-34、F-36: `.agentdev/inspect/inbox/` の 2ファイルに残置。F-27 の guides 参照方向分岐は今回の走査でも原文残存を確認済み）
- 偽陽性と判定した機械的検出:
  - 4重バックフェンス内の frontmatter 例示（agentdev-skill-authoring/references/development-workflow.md:67）
  - `(URL)`・`(...)` リンクプレースホルダ（docs/designs/commands/case-close.md:92、agentdev-epic-tracker SKILL.md:20・references/regex-and-merge-conflict.md:102/130）
  - document-model.md:380 のリンク形式例示（インラインコード内の記法说明）
  - DEC-007 Decision Map 行の旧 Design パス言及（supersedes-spec の履歴記録）
  - `/agentdev/templates/...` パス文字列（コマンド参照ではなく template パス）
  - 配布物中の `（）` 等の括弧パターン検出（検査パターン自体の例示説明行）

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 26 item（2026-09-04 〜 2026-09-07 付）
- `.agentdev/learning/inbox.md`: 26 未整理エントリ（`deferred.md` は存在）
- `.agentdev/intake/promoted/`、`.agentdev/learning/promoted/`、`.agentdev/inspect/promoted/`、`.agentdev/backlog/req-units/`: 空
- `.agentdev/inspect/inbox/`: 既存 defer 2ファイル（20260822T080133Z、20260901T120043Z）

## クリーン判定（問題なしと確認した観点）

- REQ frontmatter id↔ファイル名一致・id 一意性: 現行 47 + retired 11 の全 58ファイルで問題なし
- 現行/retired 二重存在: なし。requirements/README.md（47 + 11）・docs/README.md AUTOGEN（現行 REQ: 47件、廃止済み: 11件）・実ファイル数が一致
- Decision: 26ファイル、status 実体（accepted 16 / proposed 8 / superseded 2）が docs/README.md 記述・decisions/README.md AUTOGEN（承認済み 16件・提案中 8件）と一致
- 廃止 REQ・DEC-018 参照: 活性文書中の全言及が retired 注記・移管証跡・履歴文脈付き（F-01 のリンク切れのみ例外）
- REQ 要件テーブルの Design 分離基準（HOW 残留）走査: 新規違反シグナルなし（src/opencode・.opencode・docs/designs のパス記述行は配置契約の安定契約例外、REQ-001-067 は分離基準の政策行自体）
- REQ-048（再構築 16行）・REQ-053〜REQ-058（新規・更新群）の構造: 要件テーブル形式・目的/適用範囲構成で問題なし
- 配布物（自著作 224ファイル）: frontmatter 重複 0、主要 H1/H2 見出し重複 0（STEP 反復小見出しは STEP Reference Contract 標準形式）、UTF-8 BOM 付き 0、CRLF/LF 混在 0、制御文字・U+FFFD 0、存在しない command 参照 0（README listing 20コマンドと整合）、壊れた括弧 0、ADR/SPEC/IR 系 ID 汚染 0
- src/opencode ↔ .opencode 投影: 共通ファイルの内容差分 0（IR-016 領域、junction 構造）
- guides・README: 履歴混入なし、索引は導線範囲内（ルート README 入口表・commands README・docs/README の相互整合）
- MERGE/DUPLICATE/SPLIT/DRIFT の横断比較: 前回判定（MERGE クリーン等）を覆す新シグナルなし（F-04 の観察を除く）

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-07
- 探索手段: README 索引・正規成果物の直接読取・node による機械的走査（REQ frontmatter、索引突合、配布物エンコーディング/構文/ID パターン、相対リンク実在、投影比較）
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）
