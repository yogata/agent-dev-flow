# proxy-case-ready: case-ready 段階の書込代行リクエスト（gh exit 66 blocked）

> 外部 Supervisor 向け。本ファイルは case-auto stage 2（case-ready / Root Case #3289）が agentdev_gh 起動環境障害で blocked となった際の resume payload である。
> 先例: case-open proxy request（commit dc879228）→ 消費（commit 3885e646）と同一パターン。

## 発生日時

- 2026-10-01T13:57+09:00（blocked 確定時点。case-ready 工程開始: 2026-10-01T13:46 頃 JST）

## blocked 理由

- Custom Tool `agentdev_gh` が gh exit 66（stderr 空・operation-failed・起動環境障害）で持続失敗中。
- 本工程での試行記録（1 retry 規律に従う）:
  - issue_read #3289: 2 回失敗（初回 + retry）
  - pr_merge #3290（method: squash）: 2 回失敗（初回 + retry）
  - 計 4 回失敗・回復なし。case-auto orchestration 側の 5 回 probe（直近 2026-10-01T13:44 JST）からの持続障害と同一事象
- bash 直 `gh` CLI は正常動作（読み取り系で実測確認済み）。回復には harness 再起動が必要（サブエージェント側から実行不能・known-issue）。
- 書込操作（pr_merge / issue_update / comment_create）は agentdev_gh 正規経路のみ許容（fail-closed・raw gh CLI 書込禁止規律）のため、書込を伴わず本 payload による外部代行で停止する。本障害は `delegation-unavailable` ではなく stop condition として扱う。

## 完了済みの読み取り系受入検査（resume 時の再検証は不要・head SHA 不変で冪等有効）

- 対象実測（2026-10-01T13:46-13:57 JST・gh CLI 読み取り + ローカル git）:
  - PR #3290: OPEN・isDraft false・mergeable MERGEABLE / mergeStateStatus CLEAN・CI checks なし・head definition/issue-3289 @ f85216a085ba7638b233805e4951bf8ab5e131c1・base main
  - origin/definition/issue-3289 = f85216a…（PR head SHA と一致）。case-open 実測検査時から head SHA 不変 → 下記の case-open 検査結果は冪等に有効
  - origin/main = ローカル main = 3885e646（main 同期一致）
  - 変更ファイル 5 件の blob hash が diff post-image と一致: docs/requirements/REQ-097.md (e465fe83, 新規), docs/designs/local/third-party-skill-management.md (9756361e), docs/README.md (d159ada5), docs/requirements/README.md (e70b1e75), docs/designs/quality/req-health-metrics.md (84140592)
- STEP-1 忠実性検査: PR diff と draft-data（`.agentdev/drafts/req-draft-third-party-presupposition.md`）の投影検査 → REQ-097.md（ACT-REQ-001 content）は frontmatter / 目的 / 要件 4 行 / 適用範囲が行単位一致。Design 追記 4 節（ACT-DESIGN-001 content: third-party 成果物の包括定義／宣言ファイルの配置と解決（2候補）／一括実行面（cli.ts）／drift 検知（導入系3経路））は行単位一致・anchor「## Design で確定する実装判断」直前配置・既存節不変（updated: "2026-10-01" のみ更新）・ADF-COVERS(design) 宣言（REQ-097-001〜004）追随含む。README 2 件（REQ-097 行追加・AUTOGEN カウント 58→59）と req-health-metrics（REQ-097 | 4 | +0）は機械的索引追随。新しい意味判断は不要（追加承認なしで merge 可能な状態）
- STEP-2 整合性・品質検査: REQ frontmatter id↔filename 整合（id: REQ-097 ↔ REQ-097.md）、README entry 存在（docs/README.md / docs/requirements/README.md）、traceability check: REQ-097-001〜004 全行 ↔ ADF-COVERS(design) 4 宣言が完全一致 → missing-design 0 件・verification policy 不正 0 件。check_integrity NG 3 件は pre-existing phantom REQ-003-055（本変更未接触・対象外）、check_autogen_freshness 0 件（case-open proxy payload 記録の実測を head SHA 不変により冪等再利用）
- STEP-3 Decision 受理評価: `docs/decisions/**` に `status: proposed` 0 件（grep 実測）→ 評価対象 0 件・accepted 遷移なし（draft 判定「DEC-023/047/021 の枠内の機構詳細」に整合）
- STEP-5 実行構造: OU-001 単一・issue_policy single → Standard 確定（case_open_hints.epic_needed: false / wave_hints: []）。Child Issue / Wave / 依存構造は作成しない
- STEP-6 検証ゲート: Design 対応 1 件以上・トレーサビリティポリシー有効・missing-design 0 件 → 合格。横断依存検査: 未クローズ Issue は #3289 のみ・警告 0 件（case-auto 側実施済み・本 payload の staged 本文へ反映済み）

## 冪等残骸確認（2026-10-01T13:57 JST 実測）

- PR #3290: OPEN のまま・merge 未実行（二重 merge・競合残骸なし）
- Root Case #3289: OPEN・状態 open のまま（ready 遷移・本文更新未実行）
- draft `.agentdev/drafts/req-draft-third-party-presupposition.md`: 保持中（成功時のみ削除の規律に従い、blocked では削除しない）
- ローカル git: HEAD 3885e646 = origin/main（同期一致）。staged payload は本 payload の commit が初回（明示パス指定・先例手順に準拠）

## staged artifacts（.agentdev/drafts/）

1. `case-ready-3289-root-case-body.md` — Root Case #3289 issue_update 用本文（Execution Contract 確定・実行識別情報 `adf_execution_unit: standard`・状態 ready・次工程 case-run を含む確定版）
2. `case-ready-3289-completion-comment.md` — Root Case #3289 comment_create 用完了報告本文（`agentdev-workflow-templates` root-case-report.md テンプレート準拠。本文は「本文開始」〜「本文終了」マーカー間）
3. `proxy-request-case-ready-3289.md` — 本ファイル

いずれも UTF-8（BOM なし）・LF。

## 外部 Supervisor への最小呼出シーケンス（順序厳守）

前提: agentdev_gh の起動環境障害が回復していること（harness 再起動後）。全 GitHub 操作は Custom Tool `agentdev_gh` 経由とする（raw gh CLI による GitHub 書込は禁止）。書込操作は Tool 内部で read-back 検証済み（fail-closed）。個々の操作が失敗した場合は自動再試行せず停止を報告すること。

1. 冪等事前確認（読み取り）:
   - pr_read: number 3290 → state と isDraft を確認。既に MERGED の場合は手順 2 をスキップ（冪等継続）。OPEN で isDraft true の場合は何もせず停止報告
   - pr_mergeable: number 3290 → MERGEABLE / CLEAN を確認。矛盾する場合は停止報告
2. pr_merge: number 3290, method: **squash**（base: main）
3. issue_update: number 3289, body = `case-ready-3289-root-case-body.md` の**全文を verbatim**（utf-8 / LF 保持・ファイル経由で構成）
4. issue_read: number 3289 → 更新後本文に「## Execution Contract」セクション、「- 状態: ready」、「- 次工程: `case-run`」が存在し、既存セクション（概要 / 対象 REQ / Definition Package / レビュー判断）の欠落がないことを確認（更新前後比較）。欠落検出時は更新を取りやめて停止報告
5. comment_create: number 3289, body = `case-ready-3289-completion-comment.md` の「本文開始」行の次から「本文終了」行の前まで（両マーカー行自体は含めない）を verbatim
6. draft / RU 削除（case-ready 成功時のみ実施）:
   - 削除: `.agentdev/drafts/req-draft-third-party-presupposition.md`
   - RU は本 Case に存在しない（`.agentdev/backlog/req-units/` に該当なし・確認のこと）
   - draft 削除後に main 同期確認: `git fetch origin` → origin/main に PR #3290 の squash commit が含まれること、ローカル main と同期すること（git pull は可）
7. staged payload の処分（手順 2〜5 の成功確認後）:
   - 最小構成: `proxy-request-case-ready-3289.md` を削除し、削除を明示パス指定でコミット（先例: commit 3885e646 は proxy-request ファイルのみ削除の実績。メッセージ様式 chore(agentdev): ...）
   - 任意: `case-ready-3289-root-case-body.md`、`case-ready-3289-completion-comment.md` の 2 ファイルは手順 3・5 の投稿済み確認後は不要となるため、同じコミットで削除してよい（残置する場合は先例同様に draft 領域の参照候補として残る）
8. 完了後、case-auto stage 3（case-run・インライン）へ継続。Root Case #3289 は ready・Issue 本文が case-run の SSoT

## 期待される結果

- PR #3290 squash merge 済み → canonical Definition が main 上に確定（docs/requirements/REQ-097.md ほか 5 ファイル）
- Root Case #3289: 本文更新済み（Execution Contract 確定・実行識別情報 standard・状態 ready）・完了報告コメント投稿済み
- draft 削除済み・staged payload 処分済み → case-run へ継続
