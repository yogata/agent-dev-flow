# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永存するドキュメントに移動する。

## issue-close Step 7 で git pull を branch -d より前に実行する必要がある

- **問題事象**: `git branch -d refactor/issue-266` が "the branch is not fully merged" エラーで失敗した。PRはGitHub上でマージ済みだが、ローカルmainにmerge commitが取り込まれていなかったため。
- **発生局面**: issue-close Step 7（ブランチ・worktree削除）
- **検知方法**: `git branch -d` の stderr エラー出力
- **根本原因**: issue-close コマンドの Step 7 で `git pull`（ローカルmain同期）が `git branch -d` の後に位置している。`git branch -d` は HEAD（main）にmerge commitが含まれているかでマージ判定するため、pull前に実行すると「not fully merged」と判定される。
- **自律対応内容**: `git pull` を先に実行してから `git branch -d` を再実行することで解決。worktree remove → prune → git pull → branch -d → remote delete の順序に変更。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: issue-close.md の Step 7 手順順序がこの問題を引き起こす可能性あり
- **横展開観点**: 他のワークフローでPRマージ後にローカルブランチを削除する場面でも同様に発生する
- **再発条件**: GitHub上でPRマージ後、ローカルmainをpullせずに `git branch -d` を実行した場合
- **予防策候補**: issue-close Step 7 の手順順序を worktree remove → prune → **git pull** → branch -d → remote delete に変更する
- **想定反映先**: `.opencode/commands/issue/issue-close.md` Step 7
- **関連**: Issue #266, PR #267
- **タグ**: `#git` `#issue-close` `#ワークアラウンド`

---

## 2026-05-17: issue-backlog由来Issueの不明確さへの対処方針

- **問題事象**: issue-backlogで抽出した子Issue（例: staff-schedule#739）が、元issue/PRの「対象外」1行文のみを出典とするため、概要がタイトルの再述に過ぎず極めて不明確になった
- **発生局面**: 実装
- **検知方法**: Issue着手時の要件確認
- **根本原因**: issue-backlogは壁打ちフェーズのショートカット経路であり、構造的抽出のみを行う設計。元ソースに情報が少ない場合、深掘り能力がない（設計上の制約）
- **自律対応内容**: 方針Cを採用 — backlog Issueは「まだらな未整理リスト（プレースホルダー）」として許容し、着手時にissue-reqで壁打ち深掘りするフローを確立。フロー: issue-backlog（粗いIssue作成）→ 着手時にissue-req（壁打ち）→ issue-save-req（docs保存）→ issue-update（既存Issue更新）→ issue-work（実装）。既存Issue更新はissue-createではなくissue-updateを使用する点に注意
- **ユーザー確認有無**: あり
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 自動抽出によるIssue作成では、元ソースの情報量がそのままIssue品質の上限になる。情報量が少ないソースからの抽出では「粗いIssue + 後段での壁打ち」パターンが適用可能
- **再発条件**: issue-backlogで情報量の少ないソースからIssueを抽出する場合
- **予防策候補**: issue-backlog実行時に情報量の少ないIssueには「要壁打ち」ラベルを付与する
- **想定反映先**: `issue-backlog` コマンド
- **関連**: `.opencode/commands/issue/issue-backlog.md`
- **タグ**: `#ワークフロー` `#issue-backlog` `#要件定義` `#プロセス設計`

---

## 2026-05-17: ADR管理スキルの設計パターン

- **問題事象**: ADR管理機能が整理されておらず、ガイドラインとファイル管理ロジックが混在していた
- **発生局面**: 実装
- **検知方法**: adr-file-manager スキルの新規作成時に既存構造を確認
- **根本原因**: ADR管理機能が単一スキルに集約され、責務分離が行われていなかった
- **自律対応内容**: 責務分離 — adr-guidelines（評価基準・判定）と adr-file-manager（採番・CRUD・バリデーション）に分離。同一セクション構造を採用し一貫性のある運用を確保
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: スキル設計では「判定ロジック」と「管理ロジック」を分離すると保守性が向上する。同一セクション構造を採用することで一貫性のある運用が可能
- **再発条件**: 単一スキルに複数の異なる責務が混在する場合
- **予防策候補**: スキル新規作成時に責務分析を行い、判定系と管理系の分離を検討する
- **想定反映先**: スキル設計ガイドライン
- **関連**: `.opencode/skills/adr-file-manager/SKILL.md`, `.opencode/skills/adr-guidelines/SKILL.md`
- **タグ**: `#スキル設計` `#ADR` `#責務分離`

---

## 2026-05-17: Markdownコマンド定義の段階的拡張

- **問題事象**: issue-work コマンドに複数Issue並列実行を追加する必要があった（135行→244行）
- **発生局面**: 実装
- **検知方法**: 機能追加要件の発生
- **根本原因**: 既存の単一Issueフローを壊さずに新機能を組み込む必要があった
- **自律対応内容**: Step 0 の条件分岐で新旧パスを分離。分岐点で「有効数 = 1 → 従来フロー、≥2 → 新モード」とし、Steps 1-12 の内容は一切変更しない。新モード専用の Step 0b/0c/Phase D を追加
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 既存Stepの内容不変 + 分岐点でのみ新規パスを注入するパターンは、他のコマンドでも後方互換性を保つ拡張に適用可能
- **再発条件**: 既存コマンドに新機能を追加する場合
- **予防策候補**: 拡張時は分岐点のみの変更とし、既存パスのロジックは不改変とする設計原則を明文化する
- **想定反映先**: コマンド設計ガイドライン、`issue-work` コマンド
- **関連**: `.opencode/commands/issue/issue-work.md`
- **タグ**: `#コマンド設計` `#後方互換性` `#段階的拡張`

---

## 2026-05-17: LLM + 正規表現ハイブリッド分析

- **問題事象**: 複数Issue間の依存関係判定で正規表現単独では「トリプル化に伴い」等の暗黙的依存を見逃した（バックテストで判明）
- **発生局面**: 実装
- **検知方法**: バックテスト
- **根本原因**: 正規表現では自然言語に埋め込まれた暗黙的関係を検出不可
- **自律対応内容**: LLM意味解析を主、正規表現を補助とする2層構成を設計。4レベル分類（L0-L3）の明確な枠組みをプロンプトに与えて判定品質を安定化
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 自然言語に埋め込まれた暗黙的関係の検出にはLLM意味解析を主軸に据え、正規表現は明示的パターンの高速検出に限定する構成が実用的
- **再発条件**: 自然言語から関係性を抽出する必要がある場合
- **予防策候補**: テキスト解析系の設計では必ずLLM + ルールベースの2層構成を検討する
- **想定反映先**: 依存関係解析モジュール
- **関連**: なし
- **タグ**: `#依存関係` `#ハイブリッド分析` `#プロンプト設計`

---

## 2026-05-17: 並列PRマージ時のbase変更コンフリクトパターン

- **問題事象**: issue-work で Wave 2（#85,#86,#87）を並列実装し3つのPRを順次マージした際、先にマージされたPRがmainを更新するため後続PRがコンフリクトになった。特に#86と#85が共にissue-work.md Step 8を修正していたため同一箇所でコンフリクト
- **発生局面**: 実装
- **検知方法**: PRマージ時のコンフリクトエラー
- **根本原因**: 並列Issueで同じファイルを修正する場合、先にマージされたPRがbaseを更新するため後続PRとコンフリクトする
- **自律対応内容**: worktree上で `git rebase origin/main` → コンフリクト解消 → `git push --force-with-lease` → 再マージ
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 並列Issueで同じファイルを修正する場合、マージ順序を意識して最も変更の大きいPRを最後にするか、コンフリクト解消手順を事前に準備する
- **再発条件**: 並列Issueで同一ファイルを修正し順次マージする場合
- **予防策候補**: 並列実行時はファイル変更範囲の重複を事前チェックし、重複時はマージ順序を工夫する
- **想定反映先**: `issue-work` コマンド
- **関連**: Issue #85, #86, #87
- **タグ**: `#並列実行` `#コンフリクト` `#issue-work`

---

## 2026-05-17: worktree使用中ブランチのローカル削除制約

- **問題事象**: `gh pr merge --delete-branch` でリモートブランチは削除されたがローカルブランチ削除が失敗
- **発生局面**: 実装
- **検知方法**: git コマンドのエラー
- **根本原因**: worktreeがそのブランチを参照している間は `git branch -d` が失敗する
- **自律対応内容**: 先に `git worktree remove` でworktreeを削除してから `git branch -d` を実行
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: worktree使用中の操作では削除順序が重要。リモート→worktree→ローカルの順が安全
- **再発条件**: worktreeを使用した作業後にブランチを削除する場合
- **予防策候補**: issue-close のブランチ削除手順にworktree削除を先に行うことを明記
- **想定反映先**: `issue-close` コマンド、`git-worktree` スキル
- **関連**: `.opencode/commands/issue/issue-close.md`
- **タグ**: `#git-worktree` `#ブランチ管理`

---

## 2026-05-17: PR Closes #NNによる自動Issueクローズ

- **問題事象**: 全4PRに `Closes #NN` を含めていたため、マージ直後にIssueが自動クローズされた
- **発生局面**: 実装
- **検知方法**: 手動 `gh issue close` 実行時の "already closed" エラー
- **根本原因**: GitHubの自動クローズ機能（PR本文の `Closes`/`Fixes`/`Resolves` キーワード）を考慮していなかった
- **自律対応内容**: 自動クローズを確認し、手動クローズが不要だったことを認識。以後は自動クローズを前提とする運用に変更
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: PR本文に `Closes #NN` を含めればマージ時の自動クローズを活用できる。手動クローズはフォールバックにする方針は他のIssueクローズワークフローでも適用可能
- **再発条件**: PR本文に `Closes`/`Fixes`/`Resolves` キーワードを含め、かつ手動クローズも試行する場合
- **予防策候補**: issue-close では自動クローズを前提とし、手動クローズはフォールバックにする
- **想定反映先**: `issue-close` コマンド
- **関連**: `.opencode/commands/issue/issue-close.md`
- **タグ**: `#GitHub` `#自動化` `#issue-close`

---

## 2026-05-17: テンプレート準拠の3層防御パターン

- **問題事象**: PR #129がテンプレート（`pr_desc.md`）の構造を無視した出力（`Summary/Root Cause/Changes`）を生成
- **発生局面**: レビュー
- **検知方法**: レビュー時のPR本文確認
- **根本原因**: コマンド定義は「テンプレートに従って生成」と指示するのみで、(1)テンプレートに必須/任意の区別がなく、(2)コマンドに必須セクション一覧がなく、(3)検証ゲートがなかった
- **自律対応内容**: 3層防御を実装 — (1)テンプレート側に `<!-- 【必須】 -->` / `<!-- 【任意】 -->` マーカーを付与、(2)コマンド側の該当Stepに必須セクション一覧を明記、(3)各コマンドのGuardrailsに準拠ルールを追加
- **ユーザー確認有無**: あり
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 「テンプレートに従って生成」という指示だけではエージェントはテンプレート構造を無視する可能性がある。参照（READ）→必須セクション明示（SPECIFY）→検証ゲート（VERIFY）の3層で初めて準拠が担保される。コマンド設計の一般原則として適用可能
- **再発条件**: テンプレート参照を指示するだけで、必須セクションの明示と検証ゲートがない場合
- **予防策候補**: テンプレート使用箇所すべてに READ→SPECIFY→VERIFY の3層防御を適用する
- **想定反映先**: テンプレートシステム、各コマンドのGuardrails
- **関連**: PR #129, `.opencode/skills/issue-template-manager/SKILL.md`
- **タグ**: `#テンプレート準拠` `#コマンド設計` `#検証ゲート` `#品質担保`

---

## 2026-05-18: git pull時のローカルダーティファイル衝突

- **問題事象**: メインリポジトリで `docs/specs/system.md` を編集（worktreeにコピーするため）した後、`git pull` でPR #250 のマージコミットを取り込もうとした際、同一ファイルのローカル変更とリモート変更が衝突し pull が失敗した
- **発生局面**: 実装（issue-close実行中）
- **検知方法**: `git pull` のエラー（`error: Your local changes to the following files would be overwritten by merge`）
- **根本原因**: worktreeにコピーするためメイン側でファイルを編集し、その後リモートのマージコミットが同一ファイルを変更していた。worktreeへの変更反映をメイン側で行うアプローチが不適切だった
- **自律対応内容**: `git stash` → `git pull`（fast-forward成功）→ `git stash drop`（stash内容はマージコミットに含まれているため不要）で解消。本来は worktree 内で `git merge origin/main` 後に worktree 内でファイル編集すべきだった
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: worktree使用中のファイル編集は常に worktree 内で行い、メインリポジトリ側で編集しない方針が安全。メイン側の編集は pull 時の衝突リスクを生む
- **再発条件**: worktreeが存在する状態で、メインリポジトリ側でworktreeと共通のファイルを編集し、その後リモート変更をpullする場合
- **予防策候補**: worktree作業中のファイル編集は必ず worktree 内で行う。メインリポジトリは pull 専用とし編集しない
- **想定反映先**: `git-worktree` スキル、`issue-close` コマンド
- **関連**: `.opencode/skills/git-worktree/SKILL.md`, Issue #246
- **タグ**: `#git-worktree` `#コンフリクト回避` `#操作順序`

---

## 2026-05-19: 大量ドキュメント修正のエージェント分割とコンフリクト回避

- **問題事象**: 25件のドキュメント修正（23ファイル、用語・内容整合・フォーマット）を4エージェントに分割委任し、コンフリクトなしで並列実行する必要があった
- **発生局面**: 実装
- **検知方法**: issue-work Step 6 の実装計画時
- **根本原因**: 23ファイルにまたがる修正を単一エージェントで実行するとトークン消費と時間が増大する。しかしファイル間で依存関係があるため、無計画な分割はコンフリクトを引き起こす
- **自律対応内容**: ファイルの変更領域を4グループに完全分離し、各グループが独立したファイル群のみを担当するよう設計: A(issue commands + pattern-registry), B(terminology + ref docs), C(README + skills + reports + tips), D(templates)。各エージェントに担当ファイルパスと「触ってはいけないファイル」を明示。結果: コンフリクト0件で並列完了
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 複数ファイルのドキュメント修正やリファクタリングをエージェント並列実行する場合、ファイル所有権によるグループ分けが有効。同じファイルを複数エージェントが触らないことが前提
- **再発条件**: 10+ファイルにまたがる修正をissue-workで実行する場合
- **予防策候補**: work plan生成時にファイル所有権マトリクスを作成し、各エージェントの担当ファイルを明示的に定義する
- **想定反映先**: `issue-work-orchestration` スキル
- **関連**: Issue #256, PR #257
- **タグ**: `#並列実行` `#エージェント分割` `#コンフリクト回避` `#ドキュメント修正`

---

## 2026-05-19: ファイル移動時のスキル参照ファイルの見落し検知

- **問題事象**: pr_desc.md の移動に伴うスコープ（7ファイル）に `artifact-boundaries.md`（issue-lifecycle スキル参照ファイル）が含まれておらず、移動後の配置先と矛盾する旧パス参照が残存した
- **発生局面**: レビュー（issue-close Step 3 docs検証）
- **検知方法**: issue-close の関連ドキュメント整合性検証で `commands/issue/templates` パターンの全文検索を実行し、`.opencode/skills/issue-lifecycle/reference/artifact-boundaries.md` に旧パス参照を発見
- **根本原因**: issue-work の要件スコープ定義時に、コマンドファイルとREQファイルの参照更新のみを考慮し、スキル参照ファイル（reference/ 配下）の記載内容まで網羅的に検査していなかった
- **自律対応内容**: 追加コミットで artifact-boundaries.md のテンプレート配置先テーブルを更新し、PR に push してからマージを実行
- **ユーザー確認有無**: あり（完了不可の判断をユーザーに確認し、「修正してから継続」を選択）
- **ADR/REQ/spec影響**: なし（artifact-boundaries.md は知識ベース参照ファイルであり、要件・仕様への影響なし）
- **横展開観点**: ファイルの移動・リネーム・削除を行う際、コマンドやREQファイルだけでなく、スキルの reference/ ディレクトリ配下の知識ベースファイルにも移動対象への参照が含まれる可能性がある
- **再発条件**: スキル参照ファイルに配置先・パスを記載している状態で、そのパスが変更されるファイル移動を実行する場合
- **予防策候補**: issue-work の乖離検出（Step 8）で、変更ファイルの旧パスを全文検索し参照ファイルの漏れを検出する手順を追加する
- **想定反映先**: `spec-compliance` スキル（乖離検出の観点に「スキル参照ファイルの旧パス残存」を追加）
- **関連**: Issue #260, PR #261, `.opencode/skills/issue-lifecycle/reference/artifact-boundaries.md`
- **タグ**: `#ファイル移動` `#参照整合性` `#スキル参照` `#docs検証`

---

## 2026-05-20: Write tool による gh --body-file 用ファイルの文字化け（Windows）

- **問題事象**: PR body を OpenCode Write tool で一時ファイルに書き出し `gh pr edit --body-file` で読み込ませたところ、日本語テキストが文字化けした
- **発生局面**: 実装（PR作成）
- **検知方法**: gh pr view で読み戻したPR本文の日本語が化けていることを確認
- **根本原因**: Write tool の出力エンコーディングが Windows 環境で期待と異なる（BOM付きUTF-8やShift-JISになる可能性）
- **自律対応内容**: `[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))` を使用して BOMなしUTF-8 を明示的に指定してファイル書き出し → `gh pr edit --body-file` で再適用 → 文字化け解消
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Windows環境で `--body-file` / `--comment-file` 等のgh系ファイル入力を使う場合、ファイルのエンコーディングに注意が必要。Write tool に頼らず `[System.IO.File]::WriteAllText` で BOMなしUTF-8 を明示する方が安全
- **再発条件**: Windows環境でWrite tool で生成したファイルをgh --body-fileに渡す場合
- **予防策候補**: gh-cli-best-practices スキルの標準手順を Write tool から `[System.IO.File]::WriteAllText` + UTF8Encoding($false) に変更する。ただし gh-cli-best-practices は「OpenCodeのWrite toolを使用」と明記しているため、スキル側の更新が必要
- **想定反映先**: `gh-cli-best-practices` スキル
- **関連**: PR #265, `.opencode/skills/gh-cli-best-practices/SKILL.md`
- **タグ**: `#Windows` `#エンコーディング` `#gh-cli` `#文字化け`

---

## 2026-05-20: ADR新規作成時のdocs/README.md個別リンク追加漏れ

- **問題事象**: ADR-0004を新規作成し `docs/adr/README.md`（ADR Index）には追記したが、`docs/README.md` の個別ADRリストへの追加を漏らした
- **発生局面**: レビュー（issue-close Step 3 docs検証）
- **検知方法**: issue-close のパターンB固有検証で `docs/README.md` のADRセクションを確認し、ADR-0004リンクが欠落していることを発見
- **根本原因**: 実装時の対象ファイルリストに `docs/README.md` が含まれておらず、ADR Index（`docs/adr/README.md`）の更新のみを考慮していた。docs/README.md の個別ADRリストも更新対象であることを見落とした
- **自律対応内容**: worktreeで `docs/README.md` に1行追加し、コミット・push後にmergeを継続
- **ユーザー確認有無**: あり（G09: 警告表示→ユーザー判断→修正を選択）
- **ADR/REQ/spec影響**: なし
- **横展開観点**: ADR新規作成時は `docs/adr/README.md`（Index）と `docs/README.md`（ドキュメントハブ）の両方の更新が必要。対象ファイルリストの自動生成ロジックがない場合、チェックリスト化が有効
- **再発条件**: ADRを新規作成する際、対象ファイルリストに `docs/README.md` を含めない場合
- **予防策候補**: adr-file-manager スキルのCREATE手順に「docs/README.md の個別ADRリストにも追記する」を明記する
- **想定反映先**: `adr-file-manager` スキル、`issue-work` の対象ファイルリスト生成ロジック
- **関連**: Issue #264, PR #265, `docs/README.md`, `.opencode/skills/adr-file-manager/SKILL.md`
- **タグ**: `#ADR` `#ドキュメント整合性` `#docs検証` `#見落とし防止`

---

## 2026-05-20: サブエージェント委譲編集後のドキュメント内整合性検証

- **問題事象**: requirements-review-finding-protocol.md の `open → consumed` ライフサイクル削除をサブエージェントに委譲したところ、対象セクション（frontmatter、ライフサイクル定義、次工程、責務テーブル）は正しく削除されたが、ファイル冒頭の説明文（line 3）に「ライフサイクルとスキーマを定義する」という旧概念参照が残存した
- **発生局面**: 実装（issue-work Step 6 サブエージェント委譲後の検証）
- **検知方法**: 委譲結果のファイル全体読み取りによる確認。対象セクション外の記述をgrep検査で発見
- **根本原因**: サブエージェントには「特定セクションの削除」を指示したが、「ファイル全体で旧概念への参照がないか」は検証スコープに含まれていなかった。ファイル冒頭の説明文は各セクションのメタ的な要約であり、個別セクション変更時に見落とされやすい
- **自律対応内容**: line 3 の「ライフサイクルとスキーマ」→「スキーマと扱い」に修正。コミット前に検証ステップで捕捉
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: ドキュメントの概念削除・変更をサブエージェントに委譲する際、対象セクションの変更だけでなく、ファイル全体（特に冒頭の要約・説明文、セクション間の相互参照）に旧概念が残存していないか検証が必要。これは複数ファイルにまたがる変更でも同様
- **再発条件**: ドキュメントの特定概念を削除・変更する編集をサブエージェントに委譲する場合
- **予防策候補**: 委譲後にファイル全体で削除対象キーワード（例: 削除した概念名、旧ステータス値）をgrep検索し、残存参照がないか確認する手順を検証ステップに組み込む
- **想定反映先**: issue-work の検証手順（Step 6 後の検証フェーズ）
- **関連**: Issue #270, PR #271, `.opencode/skills/issue-lifecycle/reference/requirements-review-finding-protocol.md`
- **タグ**: `#サブエージェント委譲` `#ドキュメント整合性` `#検証` `#概念削除`

---

## gh CLI on Windows で --body-file / --json body の日本語が文字化けする

- **問題事象**: PowerShell 7 環境で `gh issue view --json body -q .body` や `gh pr view --json body` の出力が文字化け（Mojibake）する。`--body-file` 経由で書き込んだ場合も、PowerShell経由の読み戻しで文字化けして見える。**ただし Node.js の `child_process.execSync` 経由で同一gh APIコマンドを実行すると文字化けなし**。GitHub上の実際のデータは正しく保存されており、問題はPowerShellの標準出力パイプラインのみに発生。
- **発生局面**: 実装（issue-create, issue-work, issue-close で一貫して発生）
- **検知方法**: PowerShell経由のgh CLI読み取りで日本語が文字化け。Node.js `execSync` で同一コマンドを実行して正しく読み取れることを確認し、問題がPowerShellのパイプライン処理に限定されていることを特定
- **根本原因**: Windows環境（PowerShell 7）の標準出力パイプラインが、gh CLIのUTF-8出力を正しくハンドリングしていない。gh CLI自体はUTF-8でデータを送受信しており、GitHub上のデータは正しい。問題はPowerShellがgh CLIのstdoutをコンソール/リダイレクト出力に変換する際のエンコーディング処理にある
- **自律対応内容**: (1) `--body-file` + Write toolで書き込み → GitHub上は正しく保存されることを確認、(2) VERIFY操作はNode.js `execSync` 経由でgh CLIを読み取ることで正確な検証が可能であることを発見、(3) issue-close時のコメント投稿も同様にGitHub上は正しい
- **ユーザー確認有無**: あり（ユーザーから文字化け修復を指示され、調査を実施）
- **ADR/REQ/spec影響**: gh-cli-best-practices スキルのVERIFY操作（Section 5）の読み取り手順をNode.js `execSync` 経由に変更する必要がある。PowerShell経由の読み取りは信頼できない
- **横展開観点**: gh CLIに限らず、PowerShell経由でUTF-8出力を伴う外部コマンドの読み取り全般で発生する可能性がある
- **再発条件**: Windows環境（PowerShell 7）でgh CLIのJSON出力をPowerShellパイプラインで受け取る場合
- **予防策候補**: (1) gh CLI読み取りをNode.js `execSync` 経由に変更、(2) gh-cli-best-practices の読み取り手順をNode.js方式に更新、(3) PowerShell経由の読み取りを禁止するルールの追加
- **想定反映先**: `.opencode/skills/gh-cli-best-practices/SKILL.md`
- **関連**: Issue #274, PR #275
- **タグ**: `#gh-cli` `#文字化け` `#Windows` `#UTF-8` `#ワークアラウンド未解決`

---

## gh issue comment のファイル入力フラグは --body-file であり --comment-file ではない

- **問題事象**: `gh issue comment` でファイルからコメント本文を読み込む際、`--comment-file` を使用して「unknown flag」エラーが8回連続で発生した。正しいフラグは `--body-file` であった
- **発生局面**: 実装（issue-close でのコメント追記）
- **検知方法**: gh CLIのエラーメッセージでusageが表示され、`--body-file` が正しいことを確認
- **根本原因**: `gh issue edit` や `gh pr create` も `--body-file` を使用するが、comment サブコマンド固有のフラグ名として `--comment-file` を誤って推測した。gh CLIは書き込み系サブコマンド全般で `--body-file` / `--body` のペアを使用する統一的なインターフェース
- **自律対応内容**: エラー後に `--body-file` に修正して再実行し、全8件のコメント投稿に成功
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: gh CLIの全サブコマンド（issue create/edit/comment、pr create/edit）で `--body-file` が共通。他のフラグも含め、gh CLIのフラグ名は `gh <cmd> --help` で確認する癖をつけるべき
- **再発条件**: gh CLIのファイル入力フラグを推測で記述する場合
- **予防策候補**: gh-cli-best-practices スキルに「gh系コマンドのファイル入力は全て `--body-file` または `-F`」を明記する
- **想定反映先**: `gh-cli-best-practices` スキル
- **関連**: Issue #194, PR #282
- **タグ**: `#gh-cli` `#フラグ誤認` `#自浄作用`

## Oracle検証前にローカルHEADがorigin/mainと同期しているか確認する必要がある

- **問題事象**: Oracle検証でローカルmainが古いコミント(`dcc3141`)を指していたため、実際には`origin/main`(`2357ae4`)で解決済みの4件が「blocker」として誤検出された。fast-forward後に再検証したところ全基準PASS。
- **発生局面**: issue-close後のOracle検証（ultrawork loop verification）
- **検知方法**: Oracle結果の内容と`origin/main`の実際のコミットを比較して発覚
- **根本原因**: worktree ベースのマージ操作後、ローカルmainに`git pull`が未実行だった。複数のworktreeで並列作業するとローカルmainが古くなりやすい。
- **自律対応内容**: `git pull --ff-only` でローカルmainをfast-forwardし、Oracle再検証でPASSを取得
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: worktree を使うマージ操作全般で、main repo のローカル HEAD が最新かどうかの確認を検証前に挟むべき
- **再発条件**: worktree でPRをマージした後にローカルmainで検証・確認操作を行う場合
- **予防策候補**: Oracle/ Momus 等の検証エージェント起動前に `git rev-parse HEAD` と `git rev-parse origin/main` の比較を自動実行する
- **想定反映先**: case-close コマンド、case-run コマンド
- **関連**: Epic #284, Oracle session ses_1b83afe6effeYE7xAOvpWcDyl
- **タグ**: `#git` `#worktree` `#検証` `#誤検知`

## skill rename 後の delegate で旧 skill 名を参照すると task() が失敗する

- **問題事象**: `task(load_skills=["gh-cli-best-practices"])` を実行した際、"Skills not found: gh-cli-best-practices" エラーで失敗。REQ-0017 で全skillが `agentdev-*` にrenameされたが、delegate時のpromptに旧名を指定していた。
- **発生局面**: issue-close バッチ処理の delegate
- **検知方法**: task() のエラー出力
- **根本原因**: skill rename 後、人間の記憶（およびセッション内の古いコンテキスト）に旧名が残っており、新名 `agentdev-gh-cli` で指定すべきところを旧名で指定した
- **自律対応内容**: エラーメッセージに表示されたavailable skillsリストから正しい新名 `agentdev-gh-cli` を特定し、再実行
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。ただし REQ-0017 の改名が完了した後も旧名参照が残る可能性の注意喚起
- **横展開観点**: 大規模rename操作（コマンド、スキル、ファイル等）後は、旧名からの参照が全て新名に更新されているかの一括スキャンが有用
- **再発条件**: 大規模rename後に旧名をハードコード・記憶してdelegateする場合
- **予防策候補**: archive-completed-plan または integrity-check で旧名参照の残存検出を組み込む
- **想定反映先**: `agentdev-integrity-check` コマンド
- **関連**: Issue #292 (skill rename), REQ-0017
- **タグ**: `#skill` `#rename` `#delegate` `#旧名残存`

## gh issue view --json 出力の pwsh > リダイレクトで日本語が文字化けする

- **問題事象**: `gh issue view 283 --json body > .sisyphus/tmp/gh-read-issue283.json` で保存したJSONファイルの日本語が全てShift-JIS化けした（例: `概要` → `蠎ｧ隱咲ｺｺ`）。gh-cli-best-practices は「pwsh の `>` リダイレクトは UTF-8 を生成する」を前提としているが、実際には文字化けが発生した。
- **発生局面**: issue-close Step 1（Issue本文取得・チェックボックス確認）
- **検知方法**: Read toolで一時ファイルを読み取った際、日本語が全て文字化けしていることを確認
- **根本原因**: pwsh 7 の `>` リダイレクトがgh CLIのstdoutエンコーディングと相互作用して文字化けを引き起こす。gh CLIがUTF-8で出力していても、pwshのリダイレクトパイプラインでencoding変換が発生する可能性がある。gh-cli-best-practices の「Section 3: pwsh `>` は UTF-8 を生成」という前提が実環境で成立しないケースがある。
- **自律対応内容**: Python subprocess（`subprocess.run(['gh',...], capture_output=True)`）でgh出力を直接UTF-8バイトとして取得し、`json.loads(r.stdout)` でパースするワークアラウンドに切り替えた。この手法はencoding問題を完全に回避できる。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり — `gh-cli-best-practices` スキルの Section 3（安全な読み取り手順）と Section 4（読み取り禁止事項）の前提が崩れている可能性がある。pwsh `>` リダイレクトを「安全」とする記述の見直しが必要。
- **横展開観点**: 全てのissue-close/issue-work/issue-updateフローでgh出力を読み取る箇所に影響。Python subprocessワークアラウンドは汎用的に適用可能。
- **再発条件**: pwsh環境で `gh ... > file` を使用して日本語を含むJSON出力をファイルに保存する全てのケース
- **予防策候補**: gh-cli-best-practices の読み取り手順を「pwsh `>` ではなく Python subprocess を使用」に変更する。またはgh出力の読み取りに `gh ... --jq '.'` ではなくPython経由を標準とする。
- **想定反映先**: `gh-cli-best-practices` スキル（Section 3-4）
- **関連**: Issue #283, PR #303, `.opencode/skills/gh-cli-best-practices/SKILL.md`
- **タグ**: `#gh-cli` `#encoding` `#日本語化け` `#workaround` `#pwsh`
