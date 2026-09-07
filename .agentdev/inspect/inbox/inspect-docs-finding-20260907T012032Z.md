# inspect-docs finding 20260907T012032Z（defer 残置分）

> 本ファイルは inspect-promote（2026-09-07 実施、/agentdev/backlog-auto stage 2 inspect 系統経由）の分類確定後、defer となった検出事項のみを残置する。promote 採用分（F-01〜F-03 の3件）は `.agentdev/inspect/promoted/inspect-docs-promoted-20260907T012032Z.md` へ保存済み。本ファイル内の reject 0件（旧 20260901 F-36 のみ今回 reject・即時削除、同ファイル参照）。
>
> - F-04: REQ-057 の完了後 RETIRE 候補性は将来判断の予告（現時点で不正状態ではない）。Epic #2506/#2633 系 case-close を再確認条件として観察継続（旧 20260901 F-11 と統合した再評価対象）

## 検出事項リスト（defer 残置分）

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

## 推奨アクション（defer 残置分）

- F-04: 観察継続（F-11 と統合した再評価）。REQ-057 の完了判定は Epic #2506/#2633 系 case-close を条件とする

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

## 審議記録（参照）

- 暫定分類（4件: promote 3 / defer 1 / reject 0）→ adversarial-review 2系統独立 stream → convergence → convergence audit 完了
- F-01〜F-03 は自律確定で promote（機械的確定の明確な不整合、正規情報源特定済み、分類に本質的競合なし）。promoted ファイルへ保存済み
- F-04 は自律確定で defer（現時点で不正状態ではない将来判断の予告、再確認条件が Epic #2506/#2633 系 case-close で未解消）。inbox 残置
- 旧 defer 残置分（20260822 F-05、20260901 F-08〜F-12/F-27/F-34）は再評価の結果 defer 継続、旧 20260901 F-36 は reject（各元ファイル参照）
