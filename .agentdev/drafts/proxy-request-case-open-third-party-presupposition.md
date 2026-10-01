# proxy-request: case-open 再開要求（third-party-presupposition）

- **発生日時**: 2026-10-01（case-auto case-open 段階・冪等再開ラン）
- **blocked 理由**: agentdev_gh 起動環境障害（gh exit 66・stderr 空・全操作）が持続。issue_create 2回・issue_read 2回・issue_list probe 2回が失敗（初期の issue_list 1回のみ成功）。45s/90s/120s バックオフ再試行でも回復せず、書込みの gh CLI 代替は契約上禁止のため blocked。REQ-093 既知事象（learning: 6598a633、e541536c、97ee6a74）
- **冪等残骸確認（gh CLI 読取・2026-10-01）**: `third-party-presupposition in:title` 0件、`REQ-097 in:title` 0件、`git ls-remote --heads origin "definition/*"` 0件 → 失敗した issue_create の残骸なし。preflight deleteBranchOnMerge=true 確認済み

## ステージ済みローカル成果物（再開時に再利用）

- draft: `.agentdev/drafts/req-draft-third-party-presupposition.md`（未削除・未コミット）
- Definition branch: `definition/issue-pending` @ f85216a0（origin/main a295d7d8 起点独立 branch、作業隔離 worktree `.worktrees/pending-definition`）
  - 変更済み: `docs/requirements/REQ-097.md` 新規（ACT-REQ-001 verbatim・採番 REQ-097 確認済み）、`docs/designs/local/third-party-skill-management.md` 4節追加 + ADF-COVERS(design) 宣言 + updated バンプ、`docs/README.md`（59件 + REQ-097 行 + 散言行更新）、`docs/requirements/README.md`、`docs/designs/quality/req-health-metrics.md`
  - checker 実測: generate_indexes 実行済み / check_integrity（NG 3件は pre-existing phantom REQ-003-055・本変更未接触）/ check_autogen_freshness 0件 / traceability check missing-design 0件 PASS（missing-implementation・missing-verification は case-run 前期待状態）/ coverage --req design 4件実測

## 再開手順（gh window 回復後・最小呼出順）

1. `agentdev_gh` issue_create: Root Case を作成（title: `case-open: third-party 成果物の包括定義と導入済み前提契約 — REQ-097 新規・third-party Skill 管理 Design 追記・yomiyasu 実宣言（T1）`、labels: enhancement + feature、role: case）。body は `proxy-case-open-third-party-presupposition-root-case-body.md` を verbatim 引数渡し
2. branch rename: `git -C .worktrees/pending-definition branch -m definition/issue-pending definition/issue-{N}`（N = Root Case 番号）。worktree 目录名を `.worktrees/{N}-definition` へ揃える場合は `git worktree remove` + `git worktree add .worktrees/{N}-definition definition/issue-{N}` で再構成
3. push: `git push -u origin definition/issue-{N}`（push 出力で refspec 確認）
4. `agentdev_gh` pr_create: base main、head definition/issue-{N}。body は `proxy-case-open-third-party-presupposition-pr-body.md` の `#{N}` を Root Case 番号へ置換の上 verbatim 引数渡し
5. `agentdev_gh` issue_update: Root Case 本文の `adf_case` 行（N/A → #N）と「Case 状態と次工程」の Definition PR 行（作成予定 → 作成済み: PR番号）を埋め戻し
6. STEP-5 冪等再実行確認・STEP-6 完了報告を skill 手順どおり再実行

## 検証証跡（本ラン実施済み）

- STEP-1 継続確定（agentdev_handoff なし・self-hosting）
- STEP-2 preflight 通過（gh repo view --json deleteBranchOnMerge → true）。adversarial-review 発動条件判定: skip（機械的投影のみ・上流 review 完了済み・unresolved なし）
- STEP-3 Definition Package 構成案確定（採番 REQ-097 確認、policy 追随不要判断、ADF-COVERS(design) 宣言追随確定、design 対応事前確認: 新規行のみで既存行の意味変更なし）
- STEP-4 実変更判定: 実変更あり → Definition 変更 commit f85216a0 作成済み（明示パス指定ステージ・スイープなし）
- STEP-5 冪等残骸なし確認済み・横断依存検査警告 0件（未クローズ Case 群 0件、detection_unavailable 0件、入力 JSON は検査後削除済み）
- STEP-6 learning capture 実施（`.agentdev/learning/inbox.md`）
