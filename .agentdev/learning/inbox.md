# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-22: agentdev_gh リポジトリ解決失敗時の読み取り切替と書込み blocked 判定

- **問題事象**: Custom Tool `agentdev_gh` の全操作が `config-uninterpretable`（cannot resolve the target repository）で失敗。同一環境の bash/bun から `gh repo view` は成功するが、opencode プロセス内の Plugin（`defaultResolveRepo`）では環境変数 `AGENTDEV_GH_REPO` 未設定・`gh repo view` 失敗となり解決不能。
- **発生局面**: case-auto stage 1（case-open）の Root Case 作成・Definition PR 作成（agentdev_gh issue_create / pr_create）
- **検知方法**: agentdev_gh issue_list の `config-uninterpretable` 失敗（2回再現、`retryable: false`）
- **根本原因**: opencode プロセス環境に `AGENTDEV_GH_REPO` が設定されておらず、Plugin 内 `spawnSync("gh", ["repo", "view", ...])` が harness プロセス側の PATH / `context.worktree` 状態で失敗する（bash セッション実測では同一呼出しが成功。環境差は harness プロセス側に存在）
- **自律対応内容**: definition-pr-and-idempotency.md の切替手順に従い、冪等検出（既存 Root Case・既存 Definition PR）を gh CLI 読み取り（gh issue list / gh pr list）で完遂。書込みは契約上 gh CLI 代替禁止（POL-gh-io-delegation、fail-closed）のため blocked 判定で停止
- **ユーザー確認の有無**: なし（case-auto 自走経路内の blocked 停止）
- **Decision/REQ/spec影響**: なし（Tool 契約どおりの fail-closed 挙動。迂回実行は行わなかった）
- **横展開観点**: agentdev_gh を使う全 workflow（case-open / case-ready / case-run / case-close、issue workflow）で同条件なら同様に書込み不能になる
- **再発条件**: `AGENTDEV_GH_REPO` 未設定の環境で opencode を起動し、かつ Plugin 内の `gh repo view` が失敗する場合
- **予防策候補**: opencode 起動環境への `AGENTDEV_GH_REPO` 設定（launcher / .env 相当）、plugin `resolveRepo` の診断情報強化・git remote fallback 検討
- **想定反映先**: src/opencode/plugins/agentdev-gh-tool/README.md 設定節、harness 導入ガイド
- **関連**: .agentdev/intake/inbox/intake-gh-tool-repo-resolution-failure.md、draft topic_slug: jev-adapter-score-criteria-fix
- **タグ**: #gh-tool #config-uninterpretable #case-open #fail-closed

---

## 2026-09-22: 評価 SDK の質問形式別 criteria 形式差異と adapter mapping 実装の一次根拠

- **問題事象**: agentdev_jev 初期 Vercel adapter の score 形式質問で criteria に null 配列を渡し、評価 SDK のローカル検証（validateEvaluationInput）の score criteria 契約（最低 2 水準の ordered levels 文字列配列）に不適合。GatewayInternalServerError（HTTP 500）で score 形式が使用不能
- **発生局面**: case-run 実装検証（TS-003 実 gateway 呼出し）・Issue #3060 / REQ-090-011
- **検知方法**: 実 gateway 呼出しの HTTP 500 と SDK ローカル検証実装の直接確認（ai@7.0.108）
- **根本原因**: 「choice と対称」という意味契約をデータ構造の同一性（候補ラベルキーのマップ）と誤解釈して実装した。形式間の対称性は意味レベルのもので、criteria のデータ構造は形式ごとに異なる（choice = 候補ラベルキーのマップ、score = 最低 2 要素の ordered levels 配列、boolean = true/false キーのマップは任意）
- **自律対応内容**: criteria に scale 水準ラベルの文字列配列を渡す実装へ修正し、boolean/choice/score 全形式のマッピングを検証する単体テストを追加（PR #3062）
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし（公開契約・REQ の意味契約は不変。実装バグ修正）
- **横展開観点**: SDK 境界の adapter mapping を扱う際、契約文書の対称性表現をデータ構造の同一性と解釈しない。SDK 側バリデータの実装を一次根拠として確認するのが有効（SDK のローカル検証は gateway 到達前に InvalidArgumentError として検出可能）
- **再発条件**: SDK の形式別入力契約を確認せずに意味的な対称性だけから mapping を実装する場合
- **予防策候補**: adapter mapping 実装前に SDK ローカル検証（validateEvaluationInput 等）の実装確認を手順化
- **想定反映先**: adapter-vercel の実装・テスト（反映済み。PR #3062）
- **関連**: PR #3062 本文 Findings/Capture候補・Issue #3060 対応記録コメント
- **タグ**: #agentdev-jev #adapter-mapping #criteria #sdk-contract

---

## 2026-09-22: worktree での agentdev-traceability scripts 実行不能と main root 実体からの --root 指定実行

- **問題事象**: worktree（.worktrees/3060-fix）で `bun run .opencode/skills/agentdev-traceability/scripts/src/check.ts` が Module not found で失敗。`.opencode/skills/agentdev-*` は junction 構造のため worktree へ未伝播（repo- プレフィックス検査基盤 scripts は git 管理実体として worktree に存在し実行可）
- **発生局面**: case-close STEP-3 のトレーサビリティ独立再検査（3完全性ゲート）を worktree root 起点で実行した際
- **検知方法**: bun run の `error: Module not found ".opencode/skills/agentdev-traceability/scripts/src/check.ts"`
- **根本原因**: worktree の構造的制約（node_modules・junction 未伝播）。agentdev-traceability/scripts は junction 経由で解決される配布 skill 実体のため worktree チェックアウトに含まれない
- **自律対応内容**: main root 側の check.ts 実体から `--root <worktree root>` を明示指定して PR HEAD ツリーを検査対象に実行し、9 pass / 0 fail を確認
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし（check.ts の --root 引数は検証対象リポジトリルート明示の正規手段）
- **横展開観点**: worktree で junction 系 skill scripts（agentdev-traceability 等）を使う検査は、main root 実体からの --root 指定実行で代替可能。QG-4 前提手順の「worktree root 起点で完全性が確定できない場合の main 側 root 再実行」と組み合わせて運用する
- **再発条件**: worktree で junction 系 skill の scripts を実行する場合（case-close / case-run の各検査で高頻度）
- **予防策候補**: worktree 検査手順への「main root 実体 + --root 指定」経路の明記
- **想定反映先**: agentdev-git-worktree の worktree 構造的制約節・case-close 検査手順
- **関連**: Issue #3060 対応記録コメントの検証差分（トレーサビリティ独立再検査行）
- **タグ**: #worktree #junction #traceability-check #case-close
