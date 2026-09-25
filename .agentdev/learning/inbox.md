# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-26: agentdev_gh pr_create は head branch 未 push 状態で HTTP 422 を返す（branch push 前段が必要）

- **問題事象**: case-open STEP-4 で Definition branch を worktree 上で新規作成した直後に agentdev_gh の pr_create を実行したところ、HTTP 422 Validation Failed（operation-failed、retryable: true、fallbacks: なし）で失敗した
- **発生局面**: case-open STEP-4（Definition PR 作成）。Case 専用 worktree（.worktrees/{N}-definition）で origin/main HEAD から definition/issue-{N} を新規作成し commit 済みだが push 前の状態で pr_create を呼出した初回
- **検知方法**: agentdev_gh の構造化 failure（kind: operation-failed、detail: gh: Validation Failed (HTTP 422)）
- **根本原因**: pr_create は GitHub 側に head branch が存在しない場合 PR を作成できず、Custom Tool は branch push（git push）を内部で行わない。branch の新規作成と push は呼出側の前段操作である
- **自律対応内容**: git push -u origin definition/{branch} を前段で実行した上で pr_create を再実行し作成成功（VERIFY 通過）。gh CLI への切替は行わなかった（書込み操作のため切替範囲外）
- **ユーザー確認の有無**: なし（自律解決）
- **Decision/REQ/spec影響**: なし（既存契約の範囲内。pr_create 操作契約・REQ-083 に変更なし）
- **横展開観点**: case-revise の Definition Amendment PR も branch 新規作成後に pr_create する構成であり同条件になり得る
- **再発条件**: branch を新規作成した直後に push 前段なしで pr_create を呼出した場合
- **予防策候補**: case-open / case-revise の reference に「pr_create 前に head branch を origin へ push する」前段手順の明記。gh CLI 切替継続手順（definition-pr-and-idempotency.md）は読み取り切替のみを扱い、書込み系の 422 への言及がない
- **想定反映先**: agentdev-workflow-case-open references/definition-pr-and-idempotency.md、agentdev-workflow-case-revise の同等手順
- **関連**: Case #3142、PR #3147、REQ-083（definition/issue-{N}）
- **タグ**: #gh-cli #pr-create #branch-push #case-open

---

## 2026-09-26: check_integrity --json の stdout にレポート書込みメッセージが混入し機械的 JSON 解析が壊れる（メッセージ分離 workaround）

- **問題事象**: check_integrity.ts --json の stdout を node で JSON.parse したところ、JSON 直後に "Report written to: ..." メッセージ行が連結され SyntaxError（Unexpected non-whitespace character after JSON）で解析失敗した
- **発生局面**: 実装（case-open STEP-4、Definition PR の検査期待値確定前の branch HEAD 実測。worktree root を --root 指定して実行）
- **検知方法**: 初回実行で node JSON.parse の SyntaxError を検知
- **根本原因**: checker は --json 指定でも標準出力へ JSON と人間向けレポート書込みメッセージ（Report written to: <path>）を連結出力する。--json 出力契約とメッセージ出力が同一チャネルに混在する
- **自律対応内容**: stdout を "Report written" で分割して JSON 部分のみを切り出してから JSON.parse する workaround で実測を取得（レポートファイルパス自体はメッセージから確認）
- **ユーザー確認の有無**: なし（自律解決）
- **Decision/REQ/spec影響**: なし（checker 実装の現行挙動の観測であり契約変更なし）
- **横展開観点**: 同系 checker を --json で機械解析する工程（QG 検証、case-run 検証等）で同型の解析失敗が起こり得る
- **再発条件**: --json 指定の checker 出力を機械的に JSON.parse する工程でレポート書込み（.agentdev/integrity/reports/ への書込みあり時）が発生した場合
- **予防策候補**: checker 側で --json 時はレポート書込みメッセージを stderr へ分離、または JSON を単独チャネルに出力。呼出側は --json 時にメッセージ混在を前提とした解析とする
- **想定反映先**: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts（出力分離）、checker 実行手順を扱う reference
- **関連**: Case #3146、check_integrity.ts、.agentdev/integrity/reports/（非永続領域）
- **タグ**: `#checker` `#json-output` `#workaround` `#case-open`

---

