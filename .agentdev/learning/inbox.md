# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## worktree 環境で integrity スクリプトの source-projection-sync が失敗する

- **問題事象**: worktree（`.worktrees/{N}-{type}`）で integrity スクリプト（`check_integrity.ts`）を実行すると、`source-projection-sync` チェックが失敗する。worktree には `.opencode/skills/agentdev-*/` の junction が存在しないため
- **発生局面**: 実装（case-run での integrity 検証時）
- **検知方法**: integrity スクリプト実行時の exit code 1 および source-projection-sync チェックの NG 出力
- **根本原因**: worktree は独立したチェックアウトであり、`install-consumer-opencode.ps1` が作成する junction link が伝播しない。メインリポジトリの junction 構造が worktree 側に再現されない
- **自律対応内容**: AGENTS.md に記載の手順で junction を手動再作成することで対応。既知の制約として PR Findings に記録
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用上の既知制約）
- **横展開観点**: worktree で projection 関連の検証を行う場合は常に junction 再作成が必要
- **再発条件**: worktree 上で integrity スクリプトまたは projection 関連チェックを実行する全ケース
- **予防策候補**: case-run の worktree セットアップ手順に junction 再作成ステップを組み込む、または integrity スクリプトが worktree 環境を検知して該当チェックをスキップ/警告する
- **想定反映先**: `agentdev-workflow-orchestration`（case-run worktree セットアップ手順）、`scripts/check_integrity.ts`（worktree 検知）
- **関連**: PR #804 Findings, Issue #803
- **タグ**: `#worktree` `#integrity` `#junction` `#既知制約`

## retired REQ の履歴言及における規範語の位置づけ（REQ-0109-038）

- **問題事象**: REQ-0109-038（REQ-0122 retire 宣言）に "SHALL/MUST/SHOULD/MAY" の記載がある。RFC2119 完全廃止後にこの記載が integrity 違反に見える可能性がある
- **発生局面**: レビュー（case-run での整合性確認時）
- **検知方法**: RFC2119 英語キーワード grep でのヒット確認
- **根本原因**: REQ-0109-038 は REQ-0122 が使用していた規範語を「名前挙げ（歴史言及）」で記載しており、規範的使用ではない。integrity スクリプトのレガシー検知 regex と同じ位置づけ（履歪文脈での言及）
- **自律対応内容**: 規範的使用ではなく履歴言及であることを PR Findings に明記。integrity スクリプトでは既に regex で履歴例外処理されているのと同等の扱いと判断
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-0109-038 の記載は履歪文脈であり規範的使用ではない）
- **横展開観点**: retired REQ に言及する文書で、旧規範語を名前として使う場合は履歴文脈であることを明記すべき
- **再発条件**: retired REQ の規範語を active 文書で歴史的に言及する全ケース
- **予防策候補**: integrity スクリプトの RFC2119 検知 regex に retired/historical コンテキストの例外処理を追加する、または言及時に「履歴言及」マーカーを付ける運用ルール化
- **想定反映先**: `scripts/check_integrity.ts`（RFC2119 検知 regex の例外処理）
- **関連**: PR #804 Findings, REQ-0109-038, Issue #803
- **タグ**: `#rfc2119` `#integrity` `#retired` `#履歴言及`

## 要件定義・plan 作成時に active REQ の実ファイル一覧を grep/glob で実証確認すべき

- **問題事象**: case-run で Momus review により REQ-0123 の見落としが指摘された。要件定義・plan 作成時に active REQ の実ファイル一覧を実証確認していれば、REQ-0123 の存在を事前に把握できた
- **発生局面**: レビュー（case-run での Momus review）
- **検知方法**: Momus review による指摘
- **根本原因**: 要件定義・plan 作成時に active REQ 番号のレンジ（例: REQ-0101〜REQ-0123）を文書から読んでいたが、実ファイル一覧を `glob docs/requirements/REQ-*.md` 等で実証確認していなかった。文書のレンジ表現と実ファイルの乖離を見逃していた
- **自律対応内容**: 指摘を受けて REQ-0123 を含めて整合性を回復。以降の要件定義・plan 作成では実ファイル一覧の grep/glob 実証確認を徹底
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用改善）
- **横展開観点**: 全ての要件定義・plan 作成で、文書の番号レンジと実ファイル一覧の一致を確認すべき。ADR 番号等でも同様
- **再発条件**: 文書のレンジ表現を信頼して実ファイル一覧を確認しない場合
- **予防策候補**: req-define / case-run の plan 作成ステップに「active REQ 実ファイル一覧の glob 確認」を必須ステップとして組み込む
- **想定反映先**: `agentdev-req-analysis`（要件定義手順）、`agentdev-workflow-orchestration`（case-run plan 作成手順）
- **関連**: Issue #803, case-run Momus review
- **タグ**: `#要件定義` `#実証確認` `#req-range` `#momus`

## case-close 実行前にメインリポジトリの未コミット変更と対象 PR の変更ファイル重複をチェックすべき

- **問題事象**: case-close の Step 9（`git pull --ff-only`）が、メインリポジトリの別件未コミット変更（REQ-0124 関連: `docs/DOC-MAP.md`, `docs/README.md`, `docs/requirements/README.md`）と PR #804 の squash commit の変更ファイルが重複したため失敗した。結果として `.agentdev/` domain state の commit/push（Step 11）が実行不能になった
- **発生局面**: 実行前同期（case-close Step 9）
- **検知方法**: `git pull --ff-only` の exit code 1 と「Your local changes would be overwritten by merge」エラーメッセージ
- **根本原因**: 別件作業（REQ-0124）がメインリポジトリの作業ツリーに未コミットで残っており、その変更ファイルが今回の PR（REQ-0122 retire）の変更ファイルと重複していた。`git pull --ff-only` は作業ツリーの変更が上書きされる場合に安全のため拒否する
- **自律対応内容**: 別件変更は帰属不明のため触れず（停止条件 (6) 該当）、GitHub 側操作（merge/close/worktree削除）は完了させた上で、Step 9 で停止してユーザーに報告。`.agentdev/learning/inbox.md` への capture 書き込みは pull 非依存のため実施
- **ユーザー確認有無**: なし（停止して報告）
- **ADR/REQ/spec影響**: なし（運用上の制約。停止条件 (4)/(6) として既に task に文書化済み）
- **横展開観点**: case-close 開始時にメインリポジトリの `git status` と対象 PR の変更ファイル一覧を比較し、重複ファイルがある場合は早期警告すべき。複数 Issue を並行作業する環境で特に重要
- **再発条件**: メインリポジトリに未コミット変更がある状態で case-close を実行し、その変更ファイルが対象 PR の変更ファイルと重複する場合
- **予防策候補**: case-close Step 1（Issue 番号解決）の直後にメインリポジトリの `git status --short` と PR の変更ファイル一覧（`gh pr view --json files`）の重複チェックを追加。重複時は Step 4（merge）前にユーザーに警告
- **想定反映先**: `src/opencode/commands/agentdev/case-close.md`（Step 1-2 に早期チェック追加）
- **関連**: Issue #803, PR #804, case-close Step 9
- **タグ**: `#case-close` `#git-pull` `#未コミット変更` `#重複チェック` `#並行作業`

## REQ-0119-025 precedent 形式は retire 宣言（APPEND）で再利用可能

- **問題事象**: なし（ポジティブ学び）。REQ-0122 retire 宣言（REQ-0109-038 APPEND）を REQ-0119-025（REQ-0111 retire 宣言）の precedent 形式で機械的に作成できた。新たな書式設計が不要だった
- **発生局面**: 実装（case-run での REQ-0109-038 作成時）
- **検知方法**: REQ-0119-025 の書式を参照し、REQ-0109-038 に適用して整合性を確認
- **根本原因**: 該当なし（成功パターンの記録）
- **自律対応内容**: REQ-0119-025 precedent に従って REQ-0109-038 を作成。理由欄・移動先・吸収なし宣言の書式を踏襲
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 今後の retire 宣言でも REQ-0119-025 precedent 形式を再利用可能。ADR 不要判定の根拠にもなる（機械的 retire 操作）
- **再発条件**: retire 宣言を行う全ケース
- **予防策候補**: retire 宣言用のテンプレート化、または precedent 参照を req-define 手順に明記
- **想定反映先**: `agentdev-req-file-manager`（retire 宣言テンプレート）、`agentdev-req-analysis`（precedent 活用手順）
- **関連**: REQ-0119-025, REQ-0109-038, Issue #803
- **タグ**: `#precedent` `#retire宣言` `#再利用` `#ポジティブ学び`

