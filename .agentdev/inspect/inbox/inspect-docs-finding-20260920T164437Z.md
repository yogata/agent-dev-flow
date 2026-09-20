# inspect-docs finding 20260920T164437Z（backlog-auto stage 1・v4.0.0 tag 046fc2e7 時点）

> 診断実行: /agentdev/backlog-auto（stage 1）2026-09-21（JST）。対象: main repo @046fc2e7（== origin/main・tag v4.0.0・clean）。
> 前回実行 2026-09-20（87d7c8a8・finding 20260920T105602Z.md・検出 2 件は第16段 RC fixes で解消済み・当該ファイルは stage 2 処理済みのため inbox に不存在を確認）。

## サマリ

- スキャン対象: 現行 REQ 52 / retired REQ 14 / Decision 38（accepted 31・superseded 7・proposed 0）/ Design md 176（draft 0・全件 accepted 相当）/ guides 12 / README 群 / 配布コマンド定義 md 34（公開コマンド 13）/ 配布スキル 49（workflow 18・capability 31・repo-local 除外）
- 機械検査 baseline 突合（@046fc2e7 実測、第17段 監査レポート docs/reports/integrity/audits/req-045-consistency-audit-20260921.md 記載値と比較）: **全項目一致**
  - check_integrity（source）: OK 787 / NG 52 / Warning 8 / Info 109（NG 52 = LinkIntegrity broken-file-link 既知残存のみ）✓
  - traceability: missing-design 906 / missing-implementation 107 / policy-invalid 0 / missing-verification 0（malformed・unknown-roles・unknown-req-refs・invalid-artifact-paths 全て 0）✓
  - check_autogen_freshness: 違反 0（IR-061 drift 解消維持）✓
  - check_distribution_boundary（source）: ok・failures 0 ✓
  - check_extensions: ok（workflow 16 / internal 0 / capability 12 / legacy 0・schema violation 0・malformed 0）✓
  - check_design_frontmatter: findings 0 ✓（列挙 176 / 検査対象 169 / 対象外 7。監査レポート記載の列挙 175 / 対象 168 と 1 件差 → 当該 checker はファイル列挙方式のため監査時実行の checker 実行 commit 差（#3048 の IR-070 rules ファイル追加前後）に起因する可能性が高い。findings 0 で影響なし、要因の確定は監査レポート側の記録であるため本診断では観察記録に留める）
- 検出事項: **2 件**（high 1 / medium 1）
  - F-1: REQ-014 が廃止済み REQ-016 を現行所有者として記述（high）
  - F-2: v4 廃止公開コマンドの旧パス表記 `/agentdev/case-*` が Design 群に残存（medium）

## 検出事項リスト

### F-1: REQ-014 が廃止済み REQ-016 を現行所有者として記述（retired 残置・横断契約矛盾）

- **category**: 廃止 REQ/Design 由来記述残置（横断契約矛盾・DRIFT）
- **target**: docs/requirements/REQ-014.md:12（目的節）、同 :49（適用範囲・対象外リスト）
- **evidence**:
  - L12「各 command の呼出統合は REQ-015、横断整合は REQ-016 が所有する。」— 廃止注記なしの現在形所有記述
  - L49「横断整合確認（REQ-016）」— 廃止注記なしの対象外ルーティング記述
  - REQ-016 は 2026-09-20 RETIRE（PR #3047 6967bdc0、docs/requirements/retired/REQ-016.md 移管済み）。移管先の REQ-015.md:18 は「横断整合の恒常契約は本 REQ が所有する（横断整合の完了時点検証は廃止済み REQ-016 が記録、2026-09-20 RETIRE）」、REQ-015.md:46 も「（廃止済み REQ-016・完了時点検証として記録）」と正しく注記付きで更新済み。REQ-014 の2行のみ移管追随から漏れた残置（シグナル 2 件）
- **severity**: high / **confidence**: high（retired ID の直接参照 + 現在形所有動詞の機械的抽出と REQ-015 更新文との突合で確定）
- **source_of_truth**: 現行 REQ-015（RETIRE 移管先）と retired REQ-016 の RETIRE 記録を正とし、REQ-014 の当該記述を検出事項とする
- **recommended_route**: UPDATE → /agentdev/inspect-promote → /agentdev/backlog-review（REQ-014:12/49 を REQ-015 参照へ更新、または REQ-015 と同型の「廃止済み REQ-016・完了時点検証として記録」注記へ修正）
- **ng_classification**: 今回修正対象（REQ-016 RETIRE を実施した PR #3047〔前回診断 87d7c8a8 以降の変更窓内〕で導入された追随漏れ）
- **req-define入力案**: 「REQ-014 の横断整合に関する所有記述を REQ-015（現行所有者）へ更新する。完了時点検証の履歴参照が必要な場合は『廃止済み REQ-016・完了時点検証として記録』の注記形式とする」
- **notes**:REQ-014 の行実在・参照整合自体は機械検査 OK（retired ファイルが実在するため broken 参照にならない）。意味層（現行所有帰属）のみの検出

### F-2: v4 廃止公開コマンドの旧パス表記 `/agentdev/case-*` が Design 群に残存（旧名称残存 DRIFT）

- **category**: 横断契約矛盾（旧名称・旧概念の残存）
- **target**: docs/designs/foundations/system.md:147/161/175/189/203（Workflow Architecture Inventory の case-ready/revise/open/run/close の5見出し）、docs/designs/README.md:86-90（command Design 一覧の責務列）、docs/designs/foundations/project-extensions.md:216、docs/designs/responsibilities/artifact-contracts.md:224・415（docs 内の該当表記は上記 14 箇所、全文走査）
- **evidence**:
  - 配布コマンド README「廃止コマンドの移行案内」は case-open/ready/revise/run/close を「v4 で公開コマンドから廃止され、alias は残さない。内部 lifecycle 段階として case-auto が駆動する」と規定（DEC-033 ADF v4 公開運用モデル・公開 UX 2入口収斂に基づく）
  - system.md のコマンド表（L29-34）と Workflow Architecture Inventory 一覧表（L117-121）は「case-open（内部 lifecycle 段階、case-auto 駆動）」形式で正しく表記する一方、直後の詳細セクション見出し（L147 `### /agentdev/case-ready` 等 5 件）は旧公開コマンドパス表記のまま（同一ファイル内で表記不整合）
  - designs/README.md command Design 一覧（L86-90）の責務列も `/agentdev/case-open` 等の旧パス表記
  - artifact-contracts.md:415 は実在しない `src/opencode/commands/agentdev/case-open.md` を直接参照（src/opencode/commands/agentdev/ の実在突合: case-auto.md のみ存在し case-*.md は不存在）
- **severity**: medium / **confidence**: high（旧パス表記の機械的抽出 + src 実在突合 + 同一ファイル内の正規表記との不整合で確定。現行判断の根拠として使用されてはおらず命名・導線の局所的破綻のため high ではない）
- **source_of_truth**: 承認済み Decision（DEC-033・公開 UX 2入口収斂と内部 lifecycle）および配布コマンド README 廃止コマンドの移行案内を正とし、Design 側の旧パス表記を検出事項とする
- **recommended_route**: UPDATE → /agentdev/inspect-promote → /agentdev/backlog-review（見出し・一覧表記を system.md 表と同じ「case-*（内部 lifecycle 段階）」形式へ統一、実在しないパス参照は workflow skill または Design パス参照へ置換）
- **ng_classification**: pre-existing（v4 cutover に由来し、前回診断時点から存在。今回の変更窓（87d7c8a8..046fc2e7）では導入されていない）
- **req-define入力案**: 「`/agentdev/case-*` 旧パス表記（system.md 5 見出し・designs/README 5 行・project-extensions 1 行・artifact-contracts 2 箇所）を内部 lifecycle 段階の正規表記へ一括更新する」
- **notes**: artifact-contracts.md:415 のパス実在性は check_integrity broken-file-link baseline（NG 52 既知残存）と重複し得る。本検出事項の主体は命名 DRIFT（廃止コマンドパスの現行使用）であり、baseline の file-link 修正とは別軸。Design セクションの本文記述自体（内部 lifecycle 段階としての説明、例: system.md:163「例外経路の内部 lifecycle 段階（REQ-062）」）は正しく、見出し・表記のみの残置

## 推奨アクション

- F-1: severity high・今回修正対象。次回 case サイクル（req-define → case-auto）で REQ-014 の追随修正を実施する想定で inspect-promote へ送付
- F-2: pre-existing・medium。表記統一の批量修正（docs-chore）候補として inspect-promote へ送付
- 両件とも分類・採用の判断は /agentdev/inspect-promote（backlog-auto stage 2 inspect 系統）の責務

## docs-check route 候補（STEP-3-2、診断記録）

| # | 候補ルール | 根拠観察 | 適合性 |
|---|---|---|---|
| 1 | retired REQ ID と所有・帰属動詞（「が所有する」「が記録する」等）の共起検出 | F-1。retired ID 参照のうち履歴注記形式（「廃止済み」「retired」前置）を除外すれば偽陽性を抑えられる可能性 | △（注記形式の多様性があり文脈判断が残る。今回の F-1 は意味判断として検出） |

## 既存 inbox 残置 2 件の観察結果（編集せず観察のみ）

- **0901（inspect-docs-finding-20260901T120043Z.md）**: F-10（REQ-012/REQ-021 検証実行結果非保存の二重規定・DUPLICATE 軽度）・F-12（REQ-008-059 テーブル外見出し+fixture 列挙・MOVE）とも**原状継続**（REQ-021-019・REQ-008-059 セクションとも内容不変。REQ-012 側は周辺行追加による行番号シルトのみ）。解消・再評価条件の変化なし
- **0914（inspect-docs-finding-20260914T214425Z.md）**: F-04（REQ-038-006 2フェーズ読込・MOVE）**原状継続**（REQ-038.md:25・内容不変）。F-05（REQ-050-016 SPLIT）**原状継続**（REQ-050.md:36・「350 字 × 50 件相当」も不変。前回 2026-09-20 観察注記どおり再評価条件の learning 成果物は `.agentdev/`・`docs/knowledge/` とも不在のまま）。GUIDE-6（artifacts-and-state.md 状態モデル制約節の過度な一般化）**原状継続**（L145-153・内容不変）。DESIGN-3（command-file-format.md 将来拡張余地記述）は**原状継続しつつ変化あり**: 第16段（#3043/#3047）で L18「即時統合・`authoring/` の削除は行わない」と designs/README authoring 行の同旨注記が追加され、KEEP 解釈（配置根拠の明示）が強化された。将来案表現の残存は不変のため defer 判定自体への影響判断は stage 2 に委ねる
- 20260920T105602Z.md（前回分）は inbox に不存在（stage 2 で処理・削除済みの正常状態）

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 空（.gitkeep のみ）
- `.agentdev/learning/inbox.md`: 未整理エントリ 2 件（Definition PR 受入期待値の merge 後実測乖離、境界 close 時 AUTOGEN 計測日 drift と直接 commit 禁止の競合。learning-promote 待ち）
- `.agentdev/backlog/req-units/`・`.agentdev/intake/promoted/`・`.agentdev/learning/promoted/`・`.agentdev/inspect/promoted/`・`.agentdev/drafts/`: 空

## クリーン判定（問題なしと確認した観点）

- REQ 参照ID整合性・第一参照導線・現行/廃止/世代境界: 機械検査全 OK（REQ 106 OK/0 NG・AUTOGEN 鮮度 0・現行 52/retired 14 が実ファイルと一致・docs/README・requirements/README の AUTOGEN 表と実在突合一致）
- retired ID 残置（F-1 以外）: 全て履歴注記（「廃止済み」「retired」前置）・移管記録・retired 索引表・crosswalk-inventory 等の履歴参照（対象外）。adversarial-review Design L343-348 は履歴注記付き検証記録節
- 6観点: SPLIT シグナルは REQ-001(+1)・REQ-008(+1)・REQ-004(+1) のみで全て単一シグナル（req-health-metrics 計測日 2026-09-21・閾値未満の観察メモ扱い）。MERGE・RETIRE・DUPLICATE の新規候補なし。MOVE は F-1/F-2 と既知 defer（F-04/F-05/F-12）でカバー。DRIFT は F-1/F-2
- Design 分離基準違反の新規シグナル: なし（既知 defer F-04/F-05/F-12 のみ）。第16段で移管された恒久 5 行（REQ-001-069・REQ-021-030・REQ-052-012・REQ-053-041・REQ-061-037）は adversarial-review・第17段 full validation 済み。REQ-053-041（node readFileSync/writeFileSync 等の手段列挙）・REQ-021-030（突合手順の詳細）は安定契約例外候補の境界にあるが安全境界・編集破損防止の大枠として要件行として成立（観察のみ）
- Design 状態乖離 DRIFT: 対象なし（draft 0 件・全 Design accepted）
- Decision 状態乖離 DRIFT: 対象なし（proposed 0 件・accepted 31/superseded 7・DEC-001〜039 38件で README 記載と一致）
- Decision 意味診断: superseded Decision（DEC-002/005/007/015/017/029/030）への言及は全て注記付き（README 表・本文 supersedes 記録）
- guides 意味診断: navigation 層の範囲超過なし（delta 変更は guides/README の ADF-COVERS 注記除去〔#3047 の retired 同期〕と troubleshooting 軽微更新のみ）
- README 索引診断: ルート README の配布コマンド 13 件が実在突合一致・主要導線リンクは baseline 既知の broken-file-link 以外なし
- 配布物整合性: ID 汚染（REQ/ADR/SPEC/IR パターン）0 件・UTF-8 BOM 0 件・CRLF/LF 混在 0 件・frontmatter 重複 0 件・意図しない主要見出し重複 0 件・壊れた括弧 0 件（「（REQ）」等のカテゴリーラベル二重括弧表記は false positive と判定）・存在しない command 参照 0 件（README 廃止コマンド移行案内の case-* 言及は移行案内目的の正規記述）
- 配布物 責務整合: #3049 で追加された配布 reference 行（RA-007〜012・OU-005〜012: docs-chore 削除起因参照追随・正典導出補助情報・tracking 軸 3 規則・traceability 数値期待の増減理由型・AUTOGEN 鮮度 gate・merge 前 commit message 確認・missing-design 0 件ゲート・instruction 単位完了度照合等）は原本 Design 節への委譲表記（`<...>` 記法）・責務境界とも矛盾なし。Issue 番号言及（Case #2979 等）は配布物 ID 汚染パターン（REQ/ADR/SPEC/IR）の対象外
- 配布物の lint_skills・check_command_format・check_templates・check_content_corruption・check_knowledge_docs: 第17段監査で baseline 一致確認済み（本診断では重複実施せず監査レポート参照）

## 対象外（Out of Scope）

- docs 表層品質（textlint 共通基盤管轄）
- check_integrity NG 52（broken-file-link 既知残存。baseline 管理対象・route intake 済み）
- V1〜V10 意味観点の再実施（第17段 full validation 監査レポート〔commit 046fc2e7〕で全 pass・新規違反 0 確認済み。本診断は delta（87d7c8a8..046fc2e7）の意味レビューと正規経路としての構造観点で補完）
- 検出事項の分類・採用・処分（stage 2 inspect-promote の責務）
- 既存 inbox 2 件（0901・0914）の編集・削除

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-21 JST。探索手段: README 索引・正規成果物の直接読取・node による機械的走査（retired ID 横断検索・配布物 ID/エンコーディング/構文パターン・/agentdev/* 参照実在突合・REQ 要件行 HOW シグナル）・機械検査 6 種の実行（check_integrity・traceability・autogen・distribution・extensions・design_frontmatter）
- 検査対象の状態: git status clean・HEAD 046fc2e7 不変（read-only-diagnostic・診断対象ファイルの変更なし）
- 後続: /agentdev/inspect-promote（backlog-auto stage 2 inspect 系統）での分類（promote / defer / reject）
