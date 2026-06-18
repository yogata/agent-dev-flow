# REQ/SPEC Cleanup Plan — IR-044 既存 active REQ SPEC 混入是正

- **起票**: Issue #903 (RU-5) / REQ-0136-017
- **作成日**: 2026-06-19
- **検出基準**: IR-044（`check_integrity.ts` の `req-spec-boundary-violation`、REQ-0136-006 / REQ-0101-068）
- **安定契約例外**: REQ-0101-069（公開 command 名・domain state 位置づけ等は REQ 残留）
- **関連**: 親 Epic #896 / REQ-0136 / ADR-0123、前置 intake `.agentdev/intake/inbox/2026-06-18-issue899-ir044-existing-req-spec-contamination.md`

## 目的

IR-044 導入後に洗い出された既存 active REQ の SPEC 詳細混入（REQ-0136-017）について、違反一覧・移行先・移行判定を記録し、承認対象を明示する。本 plan は Issue #903 の承認アーティファクト（APPROVAL BOUNDARY 解釈: 明確な違反は移行+文書化、曖昧なものは approval-pending）。

## 適用範囲

- **対象**: active REQ 8 件の IR-044 検出行（REQ-0101, REQ-0104, REQ-0108, REQ-0114, REQ-0124, REQ-0126, REQ-0131, REQ-0136）
- **対象外**: retired REQ（IR-044 は retired を走査対象外）、新規要件の追加、IR-044 検出パターン自体の改修（別 Issue）

## 移行判定基準（本 plan の適用方針）

- **migrate**: SPEC 詳細（REQ-0101-068 の Step 番号・schema field 等）が純粋な実装/参照詳細であり、REQ の意図（what/why）を損なわずに Step 番号等を除去できるもの。移行先は command reference（各 command `.md`）に既存。
- **exempt (false positive)**: 検出キーワードが現れるが、当該行は SPEC 詳細ではなく（i）文書分類ポリシーそのもの、（ii）SPEC/委譲先を定める宣言要件、（iii）存在を要求する品質要件、（iv）経路分類。REQ に残留が正しい。
- **approval-pending**: 人間の判断を要する曖昧なもの。今回は該当なし。

## 違反一覧（before: 計15件、うち migrate 6 / exempt 9 / approval-pending 0）

### migrate（6件 — すべて Step 番号、純粋な command reference 詳細）

| # | REQ 行 | ファイル:行 | signal | 移行先 | 判定根拠 |
|---|---|---|---|---|---|
| 1 | REQ-0104-047 | REQ-0104.md:62 | Step number | `case-open.md`（Step 18/18-1 既存） | Step 番号は command reference 詳細。REQ の意図（共通終了処理の全フロー共通注記）は番号なしで表現可能 |
| 2 | REQ-0114-060 | REQ-0114.md:73 | Step number | `case-auto.md`（Step 4-1 既存） | "Step 4-1" は実装詳細。意図（キュー処理開始前のクリーンアップ検証ゲート）は番号なしで表現可能 |
| 3 | REQ-0114-063 | REQ-0114.md:76 | Step number | `case-auto.md`（Step 8 既存） | "（Step 8）" は実装詳細。意図（完了報告へのゲート結果反映）は番号なしで表現可能 |
| 4 | REQ-0131-010 | REQ-0131.md:25 | Step number | `case-close.md`（乖離検出 Step 既存） | Step 番号は詳細。注: REQ の "Step 8" は現行 case-close.md では乖離検出は Step 3（docs/検証）に該当し不整合 — Step 番号が REQ に固定されていた弊害の副次是正 |
| 5 | REQ-0131-011 | REQ-0131.md:26 | Step number | `case-close.md`（Step 8 親Epic Issue更新に子Issue状態事前取得 既存） | "Step 8" は実装詳細。意図（G04 判定前の子Issue状態事前取得+ログ出力）は番号なしで表現可能 |
| 6 | REQ-0136-010 | REQ-0136.md:25 | Step number | `req-define.md`（Step 4-2/4-3 既存） | "Step 4-2/4-3" は実装詳細。意図（分類判定結果に基づく SPEC候補の自動分離）は番号なしで表現可能 |

**移行方法**: 各 REQ 行の Step 番号参照を除去し、振る舞いの記述のみ残す（option a: 純粋実装詳細の除去）。Step 番号の実体は各 command `.md` に既存のため、SPEC への新規追記は不要（重複回避）。

### exempt / false positive（9件 — REQ 残留が正しい）

| # | REQ 行 | ファイル:行 | signal | 残留根拠 |
|---|---|---|---|---|
| 7 | REQ-0101-055 | REQ-0101.md:59 | fixture detail | SPEC 分離基準（何を SPEC に置くか）を定義する文書分類ポリシーそのもの。REQ-0101-057/058 が分類ポリシーは REQ-0101 に集約と規定。キーワードは被参照物 |
| 8 | REQ-0101-067 | REQ-0101.md:70 | enum value list | REQ/SPEC 文書種別の役割定義（文書分類ポリシー）。安定契約。キーワードは SPEC が記述する対象の列挙 |
| 9 | REQ-0101-068 | REQ-0101.md:71 | schema field | SPEC 分離基準リストそのもの（REQ-0101 の中核）。AGENTS.md・req-analysis skill が権威として引用。安定契約 |
| 10 | REQ-0108-001 | REQ-0108.md:16 | checker individual rule | "checker 個別ルールを rule catalog/SPEC に委譲する" という委譲宣言要件。SPEC 詳細そのものではなく委譲先を定める |
| 11 | REQ-0108-051 | REQ-0108.md:22 | fixture detail | "検査カテゴリ詳細等を skill/script/tests に集約する" という集約先要件。委譲を定める |
| 12 | REQ-0108-055 | REQ-0108.md:24 | fixture detail | "新規検査に regression fixture/test が存在すること" という品質要件。"regression fixture/test" は存在要件であり fixture 詳細ではない |
| 13 | REQ-0108-252 | REQ-0108.md:35 | fixture detail | "rule catalog/fixture 等が SPEC に切り出されていること" という切り出し状況の検証要件。委譲の完了を要件化 |
| 14 | REQ-0103-150（REQ-0124 内） | REQ-0124.md:45 | fixture detail | "docs-check rule/fixture 追加候補は独立 route とせず…" という routing 要件。"fixture 追加候補" は経路分類名 |
| 15 | REQ-0126-007 | REQ-0126.md:22 | fixture detail | 同上。promoted artifact の要件化方向/受け入れ条件に含める routing 要件 |

## 移行ログ（migrate 実行結果）

実行日: 2026-06-19。6 件すべて「Step 番号参照の除去 + 振る舞い記述の残留 + command reference 参照の併記」で移行。各 REQ frontmatter `updated` を 2026-06-19 へ更新。

| REQ 行 | before | after |
|---|---|---|
| REQ-0104-047 | `case-open の Step 18（ドラフト削除）・18-1（RU削除）に Standard / Epic 全フロー共通である旨の注記があること` | `case-open のドラフト削除・RU削除の各ステップに Standard / Epic 全フロー共通である旨の注記があること（各ステップ番号の詳細は command reference 参照）` |
| REQ-0114-060 | `case-auto に Epic Issue Step 4-1 キュー処理開始前のクリーンアップ検証ゲートがあること` | `case-auto に Epic Issue キュー処理開始前のクリーンアップ検証ゲートがあること（対象ステップの詳細は command reference 参照）` |
| REQ-0114-063 | `クリーンアップ検証ゲートの実行結果が case-auto 完了報告（Step 8）に含まれること` | `クリーンアップ検証ゲートの実行結果が case-auto 完了報告に含まれること（対象ステップの詳細は command reference 参照）` |
| REQ-0131-010 | `` `case-close` Step 8 乖離検出において、削除・変更対象キーワードの `docs/` 全体 grep を必須ステップとすること `` | `` `case-close` の乖離検出において、削除・変更対象キーワードの `docs/` 全体 grep を必須ステップとすること（対象ステップの詳細は command reference 参照） `` |
| REQ-0131-011 | `` `case-close` Step 8 で Epic を検出した際、G04 自動クローズ判定を実行する前に全子 Issue の OPEN/CLOSED 状態を事前取得し、状態一覧をログ出力すること `` | `` `case-close` で Epic を検出した際、G04 自動クローズ判定を実行する前に全子 Issue の OPEN/CLOSED 状態を事前取得し、状態一覧をログ出力すること（対象ステップの詳細は command reference 参照） `` |
| REQ-0136-010 | `req-define が Step 4-2/4-3 の判定結果をもとに SPEC 候補をドラフト内の SPEC候補セクションに自動分離し…` | `req-define が分類判定結果をもとに SPEC 候補をドラフト内の SPEC候補セクションに自動分離し…（対象ステップの詳細は command reference 参照）` |

## IR-044 再実行結果（完了条件 #5 検証）

- **before**: 15 件（migrate 対象 6 + exempt 9）
- **after**: 9 件（exempt 9 のみ残留。migrate 6 は全件解消）
- **検証コマンド**: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --json`（`req-spec-boundary-violation` check で抽出）
- **期待結果**: migrate 6 件は解消 ✓。exempt 9 件は IR-044 の heuristic 制限により warning 残留（block 対象外・既知の false positive パターン）。完了条件 #5「対象違反が解消している」は migrate 対象 6 件について充足。

## approval-pending（人間判断待ち）

該当なし。全15件は上記の通り機械的根拠により migrate または exempt に分類済み。

## IR-044 false positive 抑制改善候補（別課題）

exempt 9 件は「委譲/集約/切り出し/存在要件」文脈で SPEC キーワードが現れる heuristic false positive である。既存の否定文脈 exemption（`isNegationContext`）と同様に、委譲文脈（"委譲/集約/切り出し/存在すること"）の exemption 拡張により抑制可能。本 Issue の対象外（IR-044 検出パターン改修は別課題）とし、Findings として PR 本文に記録する。
