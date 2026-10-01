# proxy-case-ready resume procedure — Root Case #3293 / Definition PR #3294

Case: Root Case #3293（docs-current-model-alignment-and-compression-foundation、work_type: maintenance / scale: large、Epic 構成）
Blocked reason: Custom Tool `agentdev_gh` が gh exit 66（serve-internal spawn 劣化・stderr 空・REQ-093 既知事象）を全操作で持続し、GitHub WRITE（pr_merge・issue_create・issue_update）を実行できない。読み取りは gh CLI 置換で完了済み。
Created by: case-ready（実行セッション 2026-10-01、Jev 観測 20261001T075638Z-e211 / 20261001T075727Z-df20）
実行者: 回復後の serve プロセス内の case-auto（resume case-auto #3293 → case-ready 再実行）または外部 Supervisor。

この payload は case-ready STEP-1〜STEP-6 の gh-independent 準備をすべて完了した上で作成した。残作業は GitHub WRITE のみであり、正規 Tool `agentdev_gh` のみで実行する（raw gh WRITE は write-guard により機械的に blocked・迂回禁止）。

## 前提（本 payload 作成時点で完了済みのこと）

- STEP-1 Definition PR 受入: 3検査 pass。忠実性（draft-data ACT-REQ-001〜003・ACT-DESIGN-001〜007 と PR diff 完全一致。docs/designs/README.md は Design 管理インデックス追随）、整合性（check-frontmatter-consistency req/decision OK、check-entry-existence REQ-032/034/061 OK、check-change-impact で README.md 1件 violation → overlap 突合の警告として記録・受入）、品質検査（CI no checks reported、textlint gate PASS 545 files / 0 hard violations、traceability 行限定 check〔PR branch・--req REQ-034-032,REQ-061-003,REQ-032-025〕pass 9 / fail 0）。isDraft: false 確認済み（gh pr view 3294）。ヒットなし HITL 条件。
- STEP-2 は merge 後に実行する（下記手順 3）。
- STEP-3 Decision 受理評価: 評価対象 0 件（docs/decisions 47 件の frontmatter related_reqs × status 機械確認。REQ-032/034/061 関連はすべて superseded/accepted で proposed なし）。accepted 遷移なし。
- STEP-4 execution contract: 本文 payload 準備済み（proxy-case-ready-docs-current-model-alignment-root-case-update-contract.md）。
- STEP-5 実行構造: 3軸判断確定（依存強度: 必須・Epic サイズ: 8/上限 10・機能的一貫性: 一貫 → Epic。Jev evaluate + LLM 最終判断。観測 20261001T075638Z-e211）。Wave 構成判断・スコープ重複判定確定（Wave1 並列可・system.md 重複許容・スコープ重複なし。観測 20261001T075727Z-df20）。構成検証（決定的）合格（DAG 循環なし・依存 Wave 順序 OK・全割当 8/8・上限 OK）。Epic / Child Issue 本文 payload 準備済み。
- STEP-6: traceability 完全性ゲートは merge 後 canonical に対して再実行する（手順 3-b）。行限定 check は PR branch で pass 9 / fail 0 済み。横断依存検査: 未クローズ Case は自 Case のみ（gh issue list --state open で機械確認済み）で検出源なし。
- 冪等キー: topic_slug docs-current-model-alignment-and-compression-foundation。Definition PR #3294（head: definition/issue-3290・1 commit 92edf6ae・11 files）。

## resume 手順（最小呼び出し）

### 1. 疎通確認

`agentdev_gh` issue_read（number: 3293）を1回実行する。
- 成功 → serve 回復済み。手順 2 へ。
- gh exit 66 のまま → 回復未完了。payload を消費せず本手順を終了する（serve 再起動後に再度 resume）。

### 2. 残骸再確認（冪等）

gh CLI 読み取り（または回復後は agentdev_gh 読み取り）で次を確認する。どれかが既に成立している場合は該当手順をスキップする（merge 済み Definition・既存 Child Issue を再利用し、重複生成しない）:

- PR #3294 の状態: `gh pr view 3294 --json state,isDraft,mergedAt` → state: MERGED なら手順 3-a をスキップ。
- Epic Issue の存在: `gh issue list --state open --search "Epic: docs 現行モデル整合と圧縮基盤"` → 存在するなら手順 5-a をスキップし、その番号を #EPIC_SELF として使用。
- Child Issue の存在: `gh issue list --state open --search "OU-000"` → 存在分をスキップ。
- Root Case #3293 本文に「## Execution Contract」セクションが既にあるなら手順 4-a をスキップ。
- Decision 受理記録: accepted 遷移なし（評価対象 0 件）で再実行不要。

### 3-a. Definition PR merge（正規経路: agentdev_gh pr_merge のみ）

`agentdev_gh` pr_merge（number: 3294, method: squash）。raw gh（gh pr merge 等）・local git push による merge は禁止。
- merge 成功 → 手順 3-b へ。
- mergeable UNKNOWN の場合は pr_merge を1回実行して結果を確認（GitHub 側で判定される）。コンフリクト検出時は case-auto コンフリクト解消 Level 1（rebase）に従い、Definition 内容は変更しない。

### 3-b. canonical Definition 再取得と traceability check（STEP-2）

- main 作業ディレクトリで `git pull --ff-only`（merge を巻き戻さない）。
- canonical 再取得後、`bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root . --req REQ-034-032,REQ-061-003,REQ-032-025` を機械実行する。
- missing-design または policy-invalid（verification policy の不正）を検出した場合 → case-open へ差し戻し・ready 不遷移で停止し報告する（merge は巻き戻さない）。
- 全 pass → STEP-4 へ。（missing-verification は ready 拒否条件に含めない〔case-run 対応作成・case-close QG-4 が所有〕）

### 4-a. execution contract 確定（STEP-4）

payload `proxy-case-ready-docs-current-model-alignment-root-case-update-contract.md` の適用手順に従い、Root Case #3293 本文を `agentdev_gh` issue_update で更新する（本文は一時ファイル経由・LF 保持）。更新後は `gh issue view 3293` で「## Execution Contract」セクション存在と「Definition PR: merge 済み」行を検証する。

### 5-a. Epic Issue 作成（STEP-5）

payload `proxy-case-ready-docs-current-model-alignment-epic-issue.md` の Title・Body を使用する。作成後に返却された Issue 番号を #EPIC_SELF として確定し、Body 内の `#EPIC_SELF`・`#CHILD_OU-000N` を埋める。
- issue_create 引数: title = payload の Title 行、body = プレースホルダ置換後 Body、labels = ["maintenance"]、role = "case"。
- 本文は一時ファイル経由で渡す（Markdown 行構造保持）。

### 5-b. Child Issue 作成（STEP-5）

payload `proxy-case-ready-docs-current-model-alignment-child-ou-0001.md` 〜 `child-ou-0008.md` の順に8件作成する。各 payload の Title・Body を使用し、Body 先頭 `Parent: #EPIC_SELF`・本文内 `#EPIC_SELF` を手順 5-a で確定した Epic Issue 番号へ置換する。
- issue_create 引数: labels = ["maintenance"]、role = "case"。
- 8件作成後、返却番号を #CHILD_OU-0001〜0008 として確定する。

### 6. 検証ゲートと ready 遷移（STEP-6）

- traceability 完全性ゲート: 手順 3-b の行限定 check が全 pass であることを再確認（トレーサビリティポリシー有効・Design 対応 1 件以上）。
- 横断依存検査: 未クローズ Case 群（自 Case 以外のオープン Issue）を `gh issue list --state open` で取得し、検出源の有無を確認する。自 Case のみなら検出なし（本 payload 作成時点の実績値）。未クローズ Case が増えている場合は共有エンジン `bun .opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts` を実行し、警告は ready 遷移判定を変更せず記録する。
- payload `proxy-case-ready-docs-current-model-alignment-root-case-update-ready.md` の適用手順に従い、Root Case #3293 本文を `agentdev_gh` issue_update で更新する（adf_execution_unit: epic、実行構造セクション挿入、Case 状態: ready・次工程: case-run。子 Issue 番号を反映）。
- 更新後 `gh issue view 3293` で「状態: ready」「## 実行構造」セクション・8 子 Issue 番号を検証する。

### 7. draft / RU 削除と同期確認（STEP-7）

- `git branch --show-current` で current branch が `main` であることを確認。
- draft / RU 削除は git rm と明示パス指定 commit を同一ステップで完結させる:
  `git rm .agentdev/drafts/req-draft-docs-current-model-alignment-and-compression-foundation.md .agentdev/backlog/req-units/RU-20261001-01.md`
  `git commit -m "chore(agentdev): consume case-ready artifacts after successful case-ready completion for Case #3293 (Refs #3293)" -- .agentdev/drafts/req-draft-docs-current-model-alignment-and-compression-foundation.md .agentdev/backlog/req-units/RU-20261001-01.md`
- commit 前 `git status --short` で自 Case 分以外の stage 混入がないことを確認（混入時は commit せず待機・再確認）。
- `git pull --ff-only` と `git push`（git 書込み・許可）で main 同期確認。

### 8. payload consume（本 payload の削除）

成功後に次を削除し、明示パス指定 commit で永続化する:
- proxy-case-ready-docs-current-model-alignment-resume-procedure.md（本ファイル）
- proxy-case-ready-docs-current-model-alignment-epic-issue.md
- proxy-case-ready-docs-current-model-alignment-child-ou-0001.md 〜 child-ou-0008.md
- proxy-case-ready-docs-current-model-alignment-root-case-update-contract.md
- proxy-case-ready-docs-current-model-alignment-root-case-update-ready.md

commit message 例: `chore(agentdev): consume case-ready proxy request payload after recovered case-ready completion for Root Case #3293 / Epic creation (Refs #3293)`

### 失敗時

- いずれかの GitHub WRITE が gh exit 66 で失敗した場合、1回再試行して失敗なら write を停止し、payload を保持したまま BLOCKED 報告（infra-transient・serve 再起動後に手順 1 から resume。merge 済み Definition は巻き戻さない）。
- STEP-2 traceability check で missing-design / policy 不正検出時は case-open へ差し戻し（ready 不遷移・merge 巻き戻しなし）。
- blocked / failed / 中断時は draft / RU を保持する（cleanup 違反ではない）。

## 受入検査記録（payload 作成時点の測定値・再検証の基準）

- PR #3294: OPEN / isDraft: false / mergeable UNKNOWN（pr_merge 時に GitHub 側判定）/ 1 commit 92edf6ae / 11 files / CI no checks reported
- check-frontmatter-consistency（PR branch worktree @ 92edf6ae）: req OK・decision OK（errors 0 / warnings 0）
- check-entry-existence: REQ-034・REQ-061・REQ-032 とも found OK
- check-change-impact（changed 11 = allowed 10 + README.md）: violation = docs/designs/README.md 1件（overlap 突合警告。Design 管理インデックス追随として受入済み）
- traceability check（PR branch、--req REQ-034-032,REQ-061-003,REQ-032-025）: pass 9 / fail 0（先行測定 base 8c471d3e と同一結果）
- textlint gate（PR branch docs 545 files）: PASS / hard violations 0
- Decision frontmatter 機械確認: proposed 0 件（47 件中 REQ-032/034/061 関連は superseded×2・accepted×5）
- 3軸判断: Jev 20261001T075638Z-e211（Epic 0.94・依存強度 必須・一貫性 一貫）+ LLM 最終判断 = Epic。Jev 20261001T075727Z-df20（Wave1 並列可 0.95・重複許容 0.91・スコープ重複なし 0.79）+ LLM 最終判断 = 一致
- 構成検証（決定的）: DAG 循環なし・依存 Wave 順序 OK・全割当 8/8・Epic サイズ 8 ≤ 10
- オープン Issue: 自 Case #3293 のみ（スコープ重複候補 0 件）
- main @ 3016eb18、Definition branch fork point 8c471d3e（無関係 chore 2件: fefa9d6f・3016eb18）
