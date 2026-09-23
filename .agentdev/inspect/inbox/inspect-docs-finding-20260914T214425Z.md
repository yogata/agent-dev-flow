# inspect-docs finding 20260914T214425Z（defer 残置分）

> 本ファイルは inspect-promote（2026-09-15 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）の分類確定後、defer となった検出事項のみを残置する。promote 採用分（22件）は `.agentdev/inspect/promoted/inspect-docs-promoted-20260914T214425Z.md` へ保存済み。reject 1件（DIST-02）は即時削除（却下理由は当該 commit message 参照）。
>
> 2026-09-18 inspect-promote 再審議（対論型レビュー、/agentdev/backlog-auto stage 2 経由）: 本ファイルの defer 5件（F-04/F-05/GUIDE-6/GUIDE-8/DESIGN-3）は全件 defer 継続と判定した（再評価条件に変化なし、unresolved 0件）。F-05 のみ learning 2026-09-18 顕在化事象との関連注記を追加（下記 F-05 notes 参照）。
>
> - F-04: REQ-038-006 の内部アルゴリズム混入は安定契約例外候補があり採否が意味判断（20260901 defer F-12 と同型の MOVE 系）
> - F-05: REQ-050-016 の SPLIT は新規 REQ 対象範囲の決定を伴う構造再編（20260901 defer F-08 と同型）
> - GUIDE-6: 節の意図がワークフロー状態限定の可能性があり要文脈判断
>
> 2026-09-20 inspect-promote 再審議（in-context 審議、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）: GUIDE-8 は解消確認により reject・即時削除（自律確定。`docs/guides/command-selection.md:13` が「`/agentdev/case-auto`（内部 lifecycle の case-open 段階）」表記へ更新済み、旧 case-open 直接参照・旧責務出力は消滅。却下理由は当該 commit message 参照）。F-04/F-05/GUIDE-6/DESIGN-3 は defer 継続（自律確定）。F-05 に stage 1 観察（OBS-1）の注記を追加（下記 F-05 notes 参照）。
>
> 2026-09-21 inspect-promote 再審議（in-context 審議、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）: DESIGN-3 は reject・即時削除（自律確定）: 第16段 RC fixes（#3043/#3047）で command-file-format.md に配置理由注記（L16）と「即時統合・`authoring/` の削除は行わない」（L18）の明示的意思決定が追加され、指摘の判断軸（KEEP 許容 vs 将来案表現除去の複数解釈・low/low）が corpus 側で KEEP（配置根拠として許容）へ解消確定したため対応不要。将来案表現（L17）の除去は merge 済み意思決定と逆行する（L16-18 実読確認。却下理由は当該 commit message 参照）。F-04/F-05/GUIDE-6 は defer 継続（自律確定、再評価条件に変化なし）。

## 検出事項リスト（defer 残置分）

### [REQ 構造] F-04: REQ-038-006 に内部アルゴリズム（2フェーズ読込）が要件行の主内容に混入

- **category**: MOVE（文書分類一貫性: 内部アルゴリズム残留）
- **target**: docs/requirements/REQ-038.md:23（REQ-038-006）
- **evidence**: 「プールサイズに依存しない突合スコープ（インデックススキャンと候補絞り込みによる2フェーズ読込）で行い…全面読みフォールバックを契約とする」— 読込手段の実装方式が括弧内で要件化。行の主文意（スコープの非依存性）自体は非機能契約として成立
- **severity**: medium / **confidence**: medium（安定契約例外候補: 停止条件・処理量上限の骨格は REQ 側に留めてよい）
- **source_of_truth**: REQ-001-067（内部アルゴリズムは Design 移管）。実装方式の詳細は learning-pipeline Design/checker 実装が正規所有先
- **recommended_route**: MOVE（実装方式記述を Design へ、REQ 行は「突合スコープの非依存性と全面読みフォールバック」契約へ縮約）
- **ng_classification**: 今回修正対象（2026-09-13 `9100c169` 追加行）
- **notes**: req-define入力案「REQ-038-006 の2フェーズ読込等の実装手段を Design へ移管し、要件行は突合スコープの非依存性とフォールバック契約に縮約する」

### [REQ 構造] F-05: REQ-050-016 が REQ-050 の適用範囲外関心かつ実装パラメータを含む

- **category**: SPLIT（+ MOVE 補助: 実装パラメータ残留）
- **target**: docs/requirements/REQ-050.md:36（REQ-050-016）対 同ファイルの目的・適用範囲（scripts 公開入口境界）
- **evidence**: (a) skill description 集約予算の縮約方針は REQ-050 の目的・適用範囲のいずれにも説明できない（REQ-001-041 違反）。(b) 「350 字 × 50 件相当」「lint_skills 検査契約（warning 発出）」等の内部数値・checker 参照が行を占有。計 2 シグナル以上
- **severity**: medium-high / **confidence**: medium-high
- **source_of_truth**: REQ-001-041（関心対象の総体として説明できること）・REQ-001-067（行数上限等は Design）。予算数値は lint_skills 検査契約・Design が正規所有先
- **recommended_route**: SPLIT（独立関心として専用 REQ へ分割）+ 数値詳細は Design 参照へ縮約
- **ng_classification**: 今回修正対象（2026-09-12 `1003eb4c` 追加行）
- **notes**: req-define入力案「skill description 集約予算の運用方針を REQ-050 から切り出し、独立 REQ へ配置。予算数値の詳細は Design 参照とする」
- **2026-09-18 審議注記**（inspect-promote 対論型レビュー）: learning 2026-09-18 に「lint-skills description 長 NG 2件（agentdev-workflow-case-ready 743 chars、case-revise 663 chars の 600 上限超過）+ aggregate budget warning が main @ c421a4b4 で恒常再現する pre-existing」という顕在化事象が記録された。予算制度の履行状況に疑問を投げかける観察だが、超過は warning であり lint_skills 検査契約どおりの動作であるため履行違反と即断できない。**SPLIT 採否の意味判断は不変で defer 継続**。ただし learning-promote 2026-09-18 が採用済み成果物 `design-candidate-autogen-staleness-prevention.md` の付帯記録として description 長の独立改善要求（一括短縮の別 Case 化候補）を昇格させており、**次回再評価では当該 learning 成果物の backlog-review 処置結果を再評価条件に含める**こと。
- **2026-09-20 観察注記**（inspect-promote、stage 1 OBS-1）: lint_skills description 長は NG 1件（agentdev-workflow-case-open 629 chars のみ）に減少（case-ready/case-revise は短縮済み。aggregate budget warning は継続）。再評価条件の learning 成果物 `design-candidate-autogen-staleness-prevention` は `.agentdev/` 全域・`docs/knowledge/` ともに不在（backlog-review での RU 化・消費済みと推定）。恒久対策は `docs/designs/integrity/index-auto-generation.md`・`check_autogen_freshness`（鮮度違反 0）として稼働中。REQ-050-016 の行は原状（`docs/requirements/REQ-050.md:36`、「350 字 × 50 件相当」の内部数値も残存。現行スキル数 49 との軽微なずれを含む）。**SPLIT 採否の意味判断は不変のため defer 継続**。本観察は次回再評価の入力情報。

### [文書種別] GUIDE-6: 状態モデル制約が Design/Decision の frontmatter status 管理と冲突

- **category**: guides 意味診断 / 横断契約矛盾
- **target**: docs/guides/artifacts-and-state.md L144-152（状態モデル制約節）
- **evidence**: 「REQ / Design の状態管理は Issue ラベル、GitHub Project で行う」「frontmatter や status フィールドによる状態管理は行わず」。一方 document-model.md（accepted Design, REQ-001-025）は「Design は frontmatter `status` で成熟度を管理する（draft/accepted）」、Decision も frontmatter status で管理。document-model の原本規定は「ワークフロー状態（6マイクロフェーズ）」に限定されており、ガイドが過度に一般化
- **severity**: medium / **confidence**: medium（節の意図がワークフロー状態に限定される可能性あり、要文脈判断）
- **source_of_truth**: Design（document-model.md、REQ-001-025）を正とし、ガイドの過度に一般化した記述を検出事項とする
- **recommended_route**: 同節を「ワークフロー進行状態」にスコープ明確化。inspect-promote → backlog-review
- **ng_classification**: pre-existing

## 推奨アクション（defer 残置分）

- F-04 / F-05: 採否・範囲が意味判断のため継続見送り。次回以降の inspect サイクルまたは intake 経由で再評価（20260901 defer F-08/F-12 と同一の処遇）
- GUIDE-6: 代替解釈・文脈判断が残るため継続見送り。次回 inspect サイクルで再評価

## docs-check route 候補（STEP-3-2、診断記録）

> 候補 #1（frontmatter 先頭空行検出）は promote 採用分 DIST-01 の受け入れ条件に包含（独立 route としない）。#2〜#5 は本診断の観察記録であり、採用済み成果物とは独立した route を構成しない。

| # | 候補ルール | 根拠観察 | 適合性 |
|---|---|---|---|
| 1 | frontmatter 先頭空行検出: md の line 1 が `---` なら line 2 は空行であってはならない | DIST-01。全19 command 中1件のみ逸脱、決定的・偽陽性ゼロ。既存 check_content_corruption.ts は frontmatter 破損を対象外 | ◎（新規 IR 候補） |
| 2 | 改行コード混在検出: ファイル内の CRLF/LF 出現集合が単一か | 本診断で 251 ファイル検査済み（0件）。Windows 編集環境での混入防止に有効 | ○ |
| 3 | 存在しない command 参照の README×実在突合 | 本診断で実装・実行済み（0件）。完全機械化可能 | △（docs-spec-rebuild-integrity Design が inspect-* の意味層検査として明示割当済み。移送は Design の責務分担変更を要する） |
| 4 | bare `---` setext リスク検出: fence 外・frontmatter 外の `---` は直前行が空行であること | 本診断で検査済み（実害0件） | ○ |
| 5 | 見出し重複検出 | 169件の重複がすべて正規構造（STEP 8見出し等） | ×（却下推奨。allowlist 運用コストが便益を上回る） |

## 既知 defer 継続事項（原状継続を確認、新規起票せず）

| defer ID | 内容 | 本診断での確認 |
|---|---|---|
| F-08 (0901) | REQ-003 に委譲境界と対論型レビュー振る舞い契約が混在（SPLIT 候補、REQ-003-035〜054） | 原状継続（本診断 F-01 とは別領域） |
| F-09 (0901) | default-on・再起票禁止が REQ-003/014/015 に二重規定（DUPLICATE） | 原状継続 |
| F-10 (0901) | 検証実行結果非保存が REQ-012/021 に二重規定（DUPLICATE 軽度） | 原状継続 |
| F-11 (0901) | REQ-016 が移行完了状態の恒久 REQ 化（RETIRE 候補。REQ-045/046 同型） | 原状継続 |
| F-12 (0901) | REQ-008-059 テーブル外見出し＋fixture 列挙（MOVE） | 原状継続 |
| F-04 (0907) | REQ-057 完了後 RETIRE 候補性（Epic #2506/#2633 系 case-close を再評価条件） | 原状継続 |

## 対象外（Out of Scope）

- docs 表層品質（textlint 共通基盤管轄）
- REQ ファイル群の詳細構造診断（本ファイル [REQ 構造] セクションに収録済み）
- ADJ-1 の対象 `.agentdev/README.md`（本診断 4 ディレクトリ外のため隣接検出としてのみ記録）
- PR #2820 記録の `--review-ng` 表記や extensions 旧 Skill 参照の残存指摘（配布物・`.agentdev/extensions` 側の個別対応）
- 偽陽性判定した機械的検出（4重バックフェンス内 frontmatter 例示、`(URL)` プレースホルダ、vendored node_modules 等）: 配布物診断の全数精査により false positive 分類済み

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 空（.gitkeep のみ）
- `.agentdev/learning/inbox.md`: 未整理エントリ存在（155行、最新 2026-09-15）。learning-promote 待ち
- `.agentdev/backlog/req-units/`: RU 13件（RU-0001 2026-09-13、RU-0002〜0013 2026-09-15、commit `a7dae7d2` の backlog-review 生成）。req-define 待ち
- `.agentdev/inspect/inbox/`: 既存 defer 2ファイル（20260901/20260907、分類確定済みの意図的残置）
- `.agentdev/intake/promoted/`・`learning/promoted/`・`inspect/promoted/`・`.agentdev/drafts/`: 空

## クリーン判定（問題なしと確認した観点）

- REQ 参照ID整合性: dangling 参照 0件（親 ID・サブ ID・IR ID すべて実在。REQ-000/900 系は `v2:` 付き歴史識別子で許容）
- 第一参照導線（requirements/README.md）: 整合（docs/README.md の REQ-030 行のみ F-02）
- 現行/廃止/世代境界: 二重存在 0件・欠番 13件は全て retired/ に実在し README 廃止表 12件と一致・tag v2.11.0 実在
- MERGE（新規 0件）、RETIRE（新規 0件）、DUPLICATE（新規 0件）
- Decision 状態乖離: 検出事項 0件（accepted 26 / superseded 2 / 欠番 DEC-018 で README・AUTOGEN・frontmatter 完全一致、proposed 0件）
- guides ナビゲーション層の範囲超過（要件本文・契約本文の重複）: 検出事項 0件
- README コマンド一覧 18/18 実在突合 ✓、主要導線リンク解決 ✓、廃止 ID・廃止コマンド残留なし
- 配布物 構文健全性: frontmatter 重複 0、見出し重複（意図せぬもの）0、Markdown 構文破損 0、存在しない command 参照 0、UTF-8 BOM 0、CRLF/LF 混在 0（計 251ファイル）
- 配布物 文意保持: 壊れた括弧 0、壊れた参照表現 0、主語/目的語欠落文 0
- 配布物 責務整合: command↔Design 責務説明照合 全18対で一致、case-open/run/close/auto の責務境界一致

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-15。診断実施: 3系統（REQ 構造 50現行+12retired REQ 全文、designs 171ファイル・decisions 29ファイル・guides 12ファイル・README 精読、配布物 251ファイル機械検査）
- 探索手段: README 索引・正規成果物の直接読取・node/perl による機械的走査（frontmatter、索引突合、エンコーディング/構文/ID パターン、相対リンク実在）
- 実行経緯（呼出失敗の明示）: 初回は3系統を background 並行委譲で実行したが、親プロセス終了により background task 結果が喪失した。adversarial-review の caller-integration 契約（呼出失敗時の silent skip 禁止・失敗の明示記録）に準じ、上記のとおり呼出失敗として本記録に明示し、同期逐次実行（run_in_background=false、1系統ずつ）で再実行して本結果を得た
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）

## 審議記録（参照）

- 暫定分類（28項目 = 27検出事項 + 範囲囲外隣接 ADJ-1: promote 22 / defer 5 / HITL 1）→ adversarial-review 2系統独立 stream → convergence → convergence audit 完了
- promote 22件は自律確定（現物検証済みの明確な不整合、正規情報源特定済み、分類に本質的競合なし。workflow-contracts Design「promote系判断確定とHITL境界」詳細判定表に従い判定）
- defer 5件は自律確定（採否・範囲・優先度が文脈判断のため inbox 残置）
- DIST-02 は HITL でユーザー判断を照会し reject 確定（agentdev-git-worktree-test-fallback の Design-only 構成は意図的: REQ-057-014 が当該 Design を「stale-junction 自己修復」運用規約の正規所有 Design として直接参照、REQ-045 整合監査・#2536 実装監査合格。README 一覧への例外注記追加も不要。即時削除、却下理由は commit message 参照）
- 旧 defer 残置分（20260901/20260907 の 2ファイル）は原状維持。promote 採用の GUIDE-5 が 20260901 F-27 の project-docs 側前提（正本記述未確定）を部分的に解決する関係注記は promoted ファイル側に記載
- 2026-09-20 実施（backlog-auto stage 2 inspect 系統、--auto なし、in-context 審議）再評価: GUIDE-8 は解消確認により reject・即時削除（自律確定）: `docs/guides/command-selection.md:13` は「`/agentdev/case-auto`（内部 lifecycle の case-open 段階）」表記へ更新済み（grep で確認、旧 `/agentdev/case-open` 直接参照・旧責務出力は zero hit）。F-04/F-05/GUIDE-6/DESIGN-3 は新情報なく defer 継続（自律確定）。なお 20260901 F-27（GUIDE-5 の前提）も同日実施の再評価で解消確認により reject（当該ファイル・commit message 参照）。却下理由の詳細は commit message に記録
- 2026-09-21 実施（backlog-auto stage 2 inspect 系統、--auto なし、in-context 審議）再評価: DESIGN-3 は reject・即時削除（自律確定）: 対象行の実読で command-file-format.md L16 に「authoring/ ドメインでの配置理由」注記、L18 に「即時統合・`authoring/` の削除は行わない」の明示的意思決定が第16段 RC fixes（#3043/#3047）で追加済みであることを確認。指摘の判断軸（KEEP 許容 vs 将来案表現除去の複数解釈）は corpus の明示的意思決定により KEEP（配置根拠として許容）へ解消確定し、将来案表現（L17）の除去は merge 済み意思決定と逆行するため対応不要（adversarial-review で反証 2 件＋メタ反証 1 件を棄却、unresolved 0件。却下理由の詳細は commit message に記録）。F-04 は defer 継続（自律確定）: REQ-038-006（REQ-038.md:25）原状・REQ-057 RETIRE は対象領域（learning checker の安定契約例外候補判断）外で変化なし。F-05 は defer 継続（自律確定）: REQ-050-016（REQ-050.md:36・「350 字 × 50 件相当」残存）原状・再評価条件の learning 成果物は backlog-review 2026-09-20（60120646）で処置済みだが description 集約予算の独立改善要求が別 Case 化された形跡はなく SPLIT 採否の意味判断に変化なし。GUIDE-6 は defer 継続（自律確定）: artifacts-and-state.md 状態モデル制約節（L145-153）原状・#3047 の guides 変更（ADF-COVERS 注記除去）は当該節と無関係で文脈判断残存
- 2026-09-22 実施（backlog-auto run3 stage 2 inspect レーン、--auto なし、in-context 審議）再評価: F-04/F-05/GUIDE-6 は新情報なく defer 継続（自律確定）: REQ-038-006（REQ-038.md:25、2フェーズ読込の要件行混入）・REQ-050-016（REQ-050.md:36、「350 字 × 50 件相当」残存）・artifacts-and-state.md 状態モデル制約節（L145-153、「frontmatter や status フィールドによる状態管理は行わず」の一般化表現）とも内容不変を現物行の再読取で確認（run3 stage 1 診断 20260922T102316Z の原状確認と一致）。REQ-090 系（Jev Stage 1）の新設・REQ-090-011 追加はいずれの対象領域とも無関係で、採否の意味判断・文脈判断条件に変化なし。Jev 先行評価（defer、probability 1.0）＋ adversarial-review（in-context・反証棄却・unresolved 0件）実施済み
- 2026-09-23 実施（backlog-auto stage 2 inspect レーン、--auto なし、in-context 対論型レビュー）再評価: F-04/F-05/GUIDE-6 は新情報なく defer 継続（自律確定）: REQ-038-006（REQ-038.md:25、2フェーズ読込の要件行混入）・REQ-050-016（REQ-050.md:36、「350 字 × 50 件相当」残存）・artifacts-and-state.md 状態モデル制約節（L145-153、「frontmatter や status フィールドによる状態管理は行わず」の一般化表現）とも内容不変を現物行の再読取で確認（stage 1 診断 20260923T050218Z の原状確認と一致）。F-05 の再評価条件（learning 成果物 `design-candidate-autogen-staleness-prevention` の backlog-review 処置結果）は 2026-09-20 注記どおり処置済みで変化なし。DEC-041 新設・REQ-090 系の変更は各対象領域外。Jev 先行評価（分類妥当 true、p=0.84）＋ adversarial-review（in-context・反証棄却・unresolved 1件〔GUIDE-1、本件とは別対象〕）実施済み
