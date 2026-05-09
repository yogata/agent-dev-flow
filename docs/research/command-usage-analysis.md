# issue-* コマンド機能活用状況分析

> **Issue**: #76「コマンド機能活用状況の確認（調査タスク）」
> **作成日**: 2026-05-09
> **対象**: `.opencode/commands/issue/` 配下の7コマンド + 12テンプレート + 18スキル

---

## 1. 各コマンドの機能一覧

### 1.1 issue-req（要件定義）

| 項目 | 内容 |
|------|------|
| **エージェント** | prometheus |
| **マクロフェーズ** | ①バイブス壁打ち |
| **説明** | 機能追加またはバグ修正の要件を壁打ちで整理・定義する |

#### フラグ/オプション

なし（インタラクティブな壁打ちセッション）

#### サブフローの分岐パス

| 分岐 | 条件 | アクション |
|------|------|------------|
| パターンB | 機能追加（`enhancement`, `feature`） | `.sisyphus/drafts/req-draft-{topic-slug}.md` にドラフト保存 → `issue-save-req` へ |
| パターンA | バグ修正・軽微変更（`bug`, `critical`） | セッション内で要件doc完結 → `issue-create` へ |
| 承認ゲート | ユーザー承認 | 次ステップへ |
| 差し戻し | ユーザー差し戻し | Step 1（壁打ち）に戻る |
| ADR判断 | ADR閾値以上の技術判断 | `adr-guidelines` で判断記録（ファイル作成は不可） |

#### 使用スキル一覧

| スキル | 用途 | 活用内容 |
|--------|------|----------|
| `req-analysis` | 壁打ちメソッドロジー・深掘り | 機能/非機能要件展開、Given-When-Then形式の受け入れ基準、チェックボックス品質基準 |
| `adr-guidelines` | ADR閾値判定 | 技術判断がADR閾値以上かの判定。判断の記録のみ（ファイル作成は不可） |
| `issue-guide-phases` | パターン判定 | Pattern Registry（パターンA/Bの判定基準、固有ルール） |
| `issue-guide-reports` | 完了報告フォーマット | 壁打ち結論ハイライト付きの完了報告 |

#### テンプレート使用状況

| テンプレート | 用途 |
|-------------|------|
| `doc_requirement.md` | 要件docの構造テンプレート（Read tool で読み込み） |

#### 外部コマンド呼び出し

なし（gitコマンド禁止、docs/配下のファイル参照・書き込み禁止）

#### 出力

- パターンB: `.sisyphus/drafts/req-draft-{topic-slug}.md`（draft-metaセクション付き）
- パターンA: セッション内要件doc（ファイル出力なし）

---

### 1.2 issue-save-req（要件保存）

| 項目 | 内容 |
|------|------|
| **エージェント** | sisyphus |
| **マクロフェーズ** | ①バイブス壁打ち |
| **説明** | 壁打ち成果物をREQ/ADRファイルとしてdocs/に保存し、コミット・プッシュする |

#### フラグ/オプション

なし（ドラフトファイルから自動処理）

#### サブフローの分岐パス

| 分岐 | 条件 | アクション |
|------|------|------------|
| パターンA検出 | `draft-meta.pattern == A` | 即座にエラー中止 |
| ドラフト未検出 | `req-draft-*.md` なし | エラー中止 |
| draft-meta欠損 | 必須フィールド（pattern, req-operation, topic-slug）なし | エラー中止 |
| CREATE | `req-operation == CREATE` | 新規REQ作成、インデックス追加、ドキュメントハブ更新 |
| APPEND | `req-operation == APPEND` | 既存REQにセクション追記、frontmatter updated更新 |
| UPDATE | `req-operation == UPDATE` | 既存REQの該当セクション更新、frontmatter updated更新 |
| ADR作成 | `adr-required == true` | `adr-file-manager` でADR作成 |
| ADR不要 | `adr-required == false` | スキップ |
| docs外変更検出 | `git diff --name-only` でdocs/外の変更あり | `git checkout -- <file>` で取り消し + ユーザー警告 |

#### 使用スキル一覧

| スキル | 用途 | 活用内容 |
|--------|------|----------|
| `req-file-manager` | REQ操作 | 採番ルール（最大番号+1）、CREATE/APPEND/UPDATE判定、frontmatterバリデーション |
| `adr-file-manager` | ADR作成 | ADR番号採番、テンプレート適用、ファイル配置 |
| `adr-guidelines` | ADR必要性確認 | ADR作成の必要性判定基準・ライフサイクル |
| `issue-guide-phases` | パターン判定 | パターンB以外の実行禁止ガード |
| `issue-guide-reports` | 完了報告フォーマット | 保存結果の報告 |
| `conventional-commits` | コミットメッセージ | Conventional Commits v1.0.0準拠のコミットメッセージ生成 |

#### テンプレート使用状況

| テンプレート | 用途 |
|-------------|------|
| `doc_requirement.md` | REQ新規作成時のテンプレート（間接的、req-file-manager経由） |
| `doc_adr.md` | ADR新規作成時のテンプレート（間接的、adr-file-manager経由） |

#### 外部コマンド呼び出し

| コマンド | 用途 |
|----------|------|
| `git diff --name-only` | 変更ファイル一覧取得（docs/外変更検出） |
| `git checkout -- <file>` | docs/外変更の取り消し |
| `git commit` | conventional-commits準拠のコミット |
| `git push` | mainブランチへのプッシュ |

#### 出力

- `docs/requirements/REQ-{NNNN}.md`（新規/追記/更新）
- `docs/requirements/README.md`（インデックス更新 — CREATE時のみ）
- `docs/README.md`（ドキュメントハブ更新 — CREATE時のみ）
- `docs/adr/ADR-{NNNN}.md`（ADR判断がある場合のみ）

---

### 1.3 issue-create（Issue登録）

| 項目 | 内容 |
|------|------|
| **エージェント** | sisyphus |
| **マクロフェーズ** | ①→②境界 |
| **説明** | 要件定義をもとにGitHub Issueを作成する |

#### フラグ/オプション

なし

#### サブフローの分岐パス

| 分岐 | 条件 | アクション |
|------|------|------------|
| REQ存在 | `docs/requirements/REQ-{NNNN}.md` あり | REQ内容を読み取り、Issue本文に反映 |
| REQ不在 | REQファイルなし | セッション内の要件docから直接生成 |
| パターンA | バグ修正 | `issue_desc_bug.md` テンプレート + `issue_comment_bug_analysis.md` コメント |
| パターンB | 機能追加 | `issue_desc_feature.md` テンプレート + `issue_comment_feature_technical.md` コメント |

#### 使用スキル一覧

| スキル | 用途 | 活用内容 |
|--------|------|----------|
| `issue-guide-phases` | フェーズ管理・ラベル付与 | ラベル体系に基づくラベル選定 |
| `issue-guide-reports` | 完了報告フォーマット | Issue作成結果の報告 |
| `gh-cli-best-practices` | gh CLI安全実行 | `--body-file` 使用の強制 |
| `req-file-manager` | REQ参照 | REQファイルの読み取り・バリデーション |
| `req-analysis` | 要件品質確認 | チェックボックス品質基準の検証 |
| `adr-file-manager` | ADR参照 | ADRの読み取り・参照 |

#### テンプレート使用状況

| テンプレート | 用途 | パターン |
|-------------|------|----------|
| `issue_desc_feature.md` | Issue本文（機能追加） | パターンB |
| `issue_desc_bug.md` | Issue本文（バグ修正） | パターンA |
| `issue_comment_feature_technical.md` | 技術検討コメント | パターンB |
| `issue_comment_bug_analysis.md` | 分析結果コメント | パターンA |

#### 外部コマンド呼び出し

| コマンド | 用途 |
|----------|------|
| `gh issue create` | Issue作成（`--body-file` 使用） |
| `gh issue comment` | 初期コメント追加（`--body-file` 使用） |

#### 出力

- GitHub Issue（ラベル付き、要件doc埋め込み）

---

### 1.4 issue-work（実装パイプライン）

| 項目 | 内容 |
|------|------|
| **エージェント** | sisyphus |
| **マクロフェーズ** | ②構造的実行 |
| **説明** | 計画立案からコミットまでを一気通貫で実行する |

#### フラグ/オプション

なし（Issue番号は省略可能 — 同一セッション内で自動検出）

#### サブフローの分岐パス

| 分岐 | 条件 | アクション |
|------|------|------------|
| Issue番号指定 | ユーザー入力あり | 指定番号を使用 |
| Issue番号省略 | セッション内に直近のIssueあり | 直近を優先、ユーザー確認 |
| Issue番号未検出 | セッション内にIssue番号なし | ユーザーに指定を求めて停止 |
| パターンB | 機能追加 | specs更新（system.md / patterns.md） |
| パターンA | バグ修正 | specs更新スキップ |
| 乖離あり | deviation-checkで乖離検出 | ユーザーに報告（自動修正禁止） |
| 乖離なし | deviation-checkで乖離なし | そのまま進行 |

#### 使用スキル一覧

| スキル | 用途 | 活用内容 |
|--------|------|----------|
| `req-analysis` | 要件検証 | チェックボックス品質基準による受け入れ基準検証 |
| `deviation-check` | 乖離検出 | 要件と実装の乖離検出・報告 |
| `issue-guide-phases` | パターン判定・フェーズ管理 | パターンA/Bの判定、specs更新要否 |
| `issue-guide-reports` | 完了報告フォーマット | PR作成結果の報告 |
| `issue-guide-review` | レビューNG対応 | レビューNG時の対応フロー知識（参照のみ） |
| `git-worktree` | worktree管理 | worktree作成・ブランチ準備 |
| `req-file-manager` | REQ参照 | REQファイルの読み取り |
| `adr-file-manager` | ADR参照 | ADRファイルの読み取り |
| `conventional-commits` | コミットメッセージ | Conventional Commits準拠のコミット |

#### テンプレート使用状況

| テンプレート | 用途 |
|-------------|------|
| `pr_desc.md` | PR本文テンプレート（issue-work Step 11でPR作成時に使用） |
| `report_deviation.md` | 乖離検出報告フォーマット（乖離ありの場合） |

#### 外部コマンド呼び出し

| コマンド | 用途 |
|----------|------|
| `git worktree add` | worktree作成 |
| `git worktree list` | worktree確認 |
| `git commit` | コミット |
| `gh pr create` | PR作成 |

#### 出力

- 実装済みブランチ、コミット履歴
- 乖離検出レポート（乖離があれば）
- GitHub PR（open状態、レビュー待ち）

---

### 1.5 issue-update（Issue更新）

| 項目 | 内容 |
|------|------|
| **エージェント** | sisyphus |
| **マクロフェーズ** | ②構造的実行（※フェーズ変更なし） |
| **説明** | 既存Issueの本文更新、コメント追加、またはREQファイル更新を行う |

#### フラグ/オプション

| フラグ | 説明 | テンプレート |
|--------|------|-------------|
| `--body` | Issue本文更新 | なし（直接生成） |
| `--comment` | コメント追加 | `issue_comment_update.md` |
| `--req` | REQファイル更新 | なし（req-file-manager準拠） |
| `--review-ng` | レビューNG専用フロー | `issue_comment_review_ng.md` |

#### サブフローの分岐パス

| 分岐 | 条件 | アクション |
|------|------|------------|
| `--body` | Issue本文更新 | テンプレートに従って更新 → `gh issue edit` |
| `--comment` | コメント追加 | `issue_comment_update.md` 読み込み → `gh issue comment` |
| `--req`（APPEND） | 既存セクションへの追加/新規セクション | REQファイルにセクション追記 + frontmatter updated更新 |
| `--req`（UPDATE） | 既存セクションの内容修正 | REQファイルの該当箇所修正 + frontmatter updated更新 |
| `--review-ng`（spec-bug） | 仕様バグ | REQ UPDATE + レビューNGコメント投稿 |
| `--review-ng`（impl-bug） | 実装バグ | レビューNGコメント投稿のみ（REQ変更不要） |
| `--review-ng`（scope-creep） | スコープ外逸脱 | REQ UPDATE（スコープ明確化）+ レビューNGコメント投稿 |
| `--review-ng`（テスト不足・品質基準未達） | テスト/品質問題 | レビューNGコメント投稿のみ |
| Issue番号省略 | セッション内に直近のIssueあり | 直近を優先、ユーザー確認 |
| Issue番号未検出 | セッション内にIssue番号なし | ユーザーに指定を求めて停止 |

#### 使用スキル一覧

| スキル | 用途 | 活用内容 |
|--------|------|----------|
| `issue-guide-phases` | フェーズ判定 | 現在のフェーズを判定（フェーズ変更はしない） |
| `issue-guide-reports` | 完了報告フォーマット | 更新結果の報告 |
| `issue-guide-review` | レビューNG対応 | NG理由分類と対応フロー |
| `gh-cli-best-practices` | gh CLI安全実行 | `--body-file` 使用の強制 |
| `req-file-manager` | REQ操作 | APPEND/UPDATE判定、frontmatter更新、ステータス遷移検証 |
| `req-analysis` | 要件品質確認 | チェックボックス品質基準 |
| `deviation-check` | 乖離解析 | `--review-ng` 時の乖離報告パース |

#### テンプレート使用状況

| テンプレート | 用途 | フラグ |
|-------------|------|--------|
| `issue_comment_update.md` | 進捗更新コメント | `--comment` |
| `issue_comment_review_ng.md` | レビューNG記録コメント | `--review-ng` |

#### 外部コマンド呼び出し

| コマンド | 用途 |
|----------|------|
| `gh issue edit` | Issue本文更新（`--body`, `--req` 時） |
| `gh issue comment` | コメント追加（`--comment`, `--review-ng` 時。`--body-file` 使用） |

#### 出力

- 更新されたIssue本文 / 追加されたコメント / 更新されたREQファイル / レビューNGコメント

---

### 1.6 issue-close（完了処理）

| 項目 | 内容 |
|------|------|
| **エージェント** | sisyphus |
| **マクロフェーズ** | ③レビュー完了 |
| **説明** | PRをマージし、対応記録を追記し、Issueをクローズしてブランチを削除する |

#### フラグ/オプション

なし（Issue番号/PR番号は省略可能 — 自動検出）

#### サブフローの分岐パス

| 分岐 | 条件 | アクション |
|------|------|------------|
| Issue番号省略 | セッション内に直近のIssueあり | 直近を優先、ユーザー確認 |
| Issue番号未検出 | セッション内にIssue番号なし | ユーザーに指定を求めて停止 |
| チェックボックス未完了 | 未完了の `[ ]` あり | エラー停止 |
| PR存在確認 | PRなし | エラー停止 |
| CI未通過 | `gh pr checks` で失敗あり | エラー停止 |
| パターンB | 機能追加 | docs/検証実行（REQ、specs、ADR、docs/README.md） |
| パターンA | バグ修正 | docs/検証スキップ |
| docs/不足 | 検証で不足検出 | 警告表示 + ユーザー判断 |
| 学びあり | エージェントが学びありと判断 | 内容提示 → ユーザー承認 → `docs/tips/inbox.md` 追記 |
| 学びなし | エージェントが学びなしと判断 | 次ステップへ（ユーザーに問わない） |
| Planあり | `.sisyphus/plans/` に該当plan | `archive-completed-plan` でアーカイブ |
| Planなし | planファイルなし | スキップ（注記付き） |
| パターンAクローズ | バグ修正 | `issue_comment_bug_record.md` テンプレート |
| パターンBクローズ | 機能追加 | `issue_comment_feature_implementation.md` テンプレート |

#### 使用スキル一覧

| スキル | 用途 | 活用内容 |
|--------|------|----------|
| `issue-guide-phases` | パターン判定 | パターンA/Bでdocs/検証要否を判定 |
| `issue-guide-reports` | 完了報告フォーマット | フロー完了報告 |
| `tips-capture` | 学び検知・抽出 | エージェント主体で学び有無を判断・生成 |
| `archive-completed-plan` | planアーカイブ | `.sisyphus/` 配下の関連ファイル一括アーカイブ |
| `gh-cli-best-practices` | gh CLI安全実行 | `--body-file` 使用の強制 |
| `git-worktree` | worktree削除 | ブランチ・worktreeのクリーンアップ |
| `req-file-manager` | REQ参照 | REQファイルの存在確認・整合性チェック |

#### テンプレート使用状況

| テンプレート | 用途 | パターン |
|-------------|------|----------|
| `issue_comment_feature_implementation.md` | 実装記録コメント | パターンB |
| `issue_comment_bug_record.md` | 対応記録コメント | パターンA |

#### 外部コマンド呼び出し

| コマンド | 用途 |
|----------|------|
| `gh pr checks` | CI通過確認 |
| `gh pr merge` | PRマージ |
| `gh issue comment` | 対応記録コメント追記（`--body-file` 使用） |
| `gh issue close --reason completed` | Issueクローズ |
| `git worktree remove` | worktree削除 |
| `git worktree prune` | 残存参照消去 |
| `git branch -d` | ブランチ削除（マージ済みのみ） |

#### 出力

- マージ済みPR
- クローズ済みIssue
- 削除済みブランチ・worktree

---

### 1.7 issue-next（次コマンド推論）

| 項目 | 内容 |
|------|------|
| **エージェント** | sisyphus |
| **マクロフェーズ** | 全フェーズ対応 |
| **説明** | セッションコンテキストから現在のフェーズを推論し、適切なissue-*コマンドを選択・実行する |

#### フラグ/オプション

なし

#### サブフローの分岐パス

| 分岐 | 推論結果 |
|------|----------|
| ①バイブス壁打ち | `/issue/issue-req` |
| ①→②準備（パターンB） | `/issue/issue-save-req` |
| ①→②境界（パターンB） | `/issue/issue-save-req` |
| ①→②境界（パターンA） | `/issue/issue-create` |
| ②構造的実行 | `/issue/issue-work` |
| ②→③境界 | レビュー待ち |
| ③レビュー完了 | `/issue/issue-close` |
| 乖離あり（重大2件以上） | ①バイブス壁打ちへループバック |
| 乖離あり（重大1件） | 該当セクションのみ再壁打ち |
| 乖離あり（軽微のみ） | そのまま進行 |
| レビューNG（仕様バグ） | `/issue/issue-update --req --review-ng` → `/issue/issue-work` |
| レビューNG（実装バグ） | `/issue/issue-update --comment --review-ng` → `/issue/issue-work` |
| レビューNG（スコープ外逸脱） | `/issue/issue-update --req --review-ng` → 不要実装削除 → `/issue/issue-work` |
| レビューOK | `/issue/issue-close` |
| フェーズ推論不可 | エラー停止、ユーザー確認 |
| Issue番号特定不能 | ユーザー確認（`.worktrees`等からの推測禁止） |

#### 使用スキル一覧

| スキル | 用途 | 活用内容 |
|--------|------|----------|
| `issue-guide-phases` | フェーズ推論・コマンド選択 | フェーズ体系、SSoT遷移、コマンド関連マップ |
| `issue-guide-review` | レビューNG時推論 | レビューNG時の対応フロー・次アクション判定 |
| `deviation-check` | 乖離判定 | ループバック判定基準（重大/軽微の閾値） |
| `req-analysis` | 要件品質確認 | 分析観点の参照 |

#### テンプレート使用状況

なし（コマンドの推論・選択のみ）

#### 外部コマンド呼び出し

**禁止**（セッションコンテキストのみ使用。gh/gitコマンド禁止）

#### 出力

- 推論された次のコマンドの実行、または「作業完了」の報告

---

## 2. テンプレート一覧と使用コマンド マッピング

| テンプレート | 種別 | 使用コマンド | パターン |
|-------------|------|-------------|----------|
| `doc_requirement.md` | 要件doc構造 | issue-req（Read）, issue-save-req（間接） | A/B共通 |
| `doc_adr.md` | ADR構造 | issue-save-req（間接、adr-file-manager経由） | Bのみ |
| `issue_desc_feature.md` | Issue本文 | issue-create | Bのみ |
| `issue_desc_bug.md` | Issue本文 | issue-create | Aのみ |
| `issue_comment_feature_technical.md` | 技術検討コメント | issue-create | Bのみ |
| `issue_comment_bug_analysis.md` | 分析結果コメント | issue-create | Aのみ |
| `issue_comment_update.md` | 進捗更新コメント | issue-update（`--comment`） | A/B共通 |
| `issue_comment_review_ng.md` | レビューNGコメント | issue-update（`--review-ng`） | A/B共通 |
| `issue_comment_feature_implementation.md` | 実装記録コメント | issue-close | Bのみ |
| `issue_comment_bug_record.md` | 対応記録コメント | issue-close | Aのみ |
| `pr_desc.md` | PR本文 | issue-work | A/B共通 |
| `report_deviation.md` | 乖離検出報告 | issue-work（乖離あり時） | A/B共通 |

---

## 3. 機能別使用状況判定

### 3.1 使用状況サマリ

| 機能 | コマンド | 判定 | 根拠 |
|------|----------|------|------|
| 壁打ち対話（Step 1-2） | issue-req | ✅ 使用中 | すべてのフローの起点。REQ-0001〜0005で基本設計完了 |
| 承認ゲート（Step 6） | issue-req | ✅ 使用中 | REQ-0004で承認ゲートが追加された |
| ドラフト保存（Step 5B） | issue-req | ✅ 使用中 | パターンBの標準フロー |
| draft-meta セクション | issue-req/issue-save-req | ✅ 使用中 | issue-save-reqの入力SSoT |
| ADR閾値判定（Step 3） | issue-req | ⚠️ 条件付き使用 | ADR閾値以上の技術判断が発生した場合のみ |
| REQ CREATE | issue-save-req | ✅ 使用中 | 全パターンBで基本操作 |
| REQ APPEND | issue-save-req | ⚠️ 条件付き使用 | 既存Issueへの追加要件発生時 |
| REQ UPDATE | issue-save-req | ⚠️ 条件付き使用 | 既存Issueの要件修正時 |
| docs/requirements/README.md 更新 | issue-save-req | ✅ 使用中 | CREATE時のみ実行 |
| docs/README.md 更新 | issue-save-req | ✅ 使用中 | CREATE時のみ実行 |
| ADR ファイル作成 | issue-save-req | ⚠️ 条件付き使用 | adr-required: trueの場合のみ |
| docs外変更検出・取り消し | issue-save-req | ⚠️ 条件付き使用 | docs/外の変更が含まれた場合のみ |
| specs読込（system.md + patterns.md） | issue-create/issue-work | ✅ 使用中 | Step 1/Step 3で必須読込 |
| ADR関連特定 | issue-create/issue-work | ✅ 使用中 | docs/adr/README.md からのマッチング |
| Issue番号自動検出 | issue-work/issue-update/issue-close | ✅ 使用中 | セッション内からの直近番号抽出 |
| worktree作成 | issue-work | ✅ 使用中 | Step 5でgit-worktreeスキル使用 |
| work plan生成（@plan） | issue-work | ✅ 使用中 | Step 6で実行 |
| TDD実装（/start-work） | issue-work | ✅ 使用中 | Step 6で実行 |
| チェックボックス更新 | issue-work | ✅ 使用中 | 各タスク完了時に [ ]→[x] |
| specs更新 | issue-work | ⚠️ 条件付き使用 | パターンBのみ |
| 乖離検出 | issue-work | ✅ 使用中 | Step 8で実行（乖離なしても実行） |
| ローカル検証 | issue-work | ✅ 使用中 | Step 11（型チェック・Lint・ビルド・テスト） |
| `--body` | issue-update | ⚠️ 条件付き使用 | Issue本文更新が必要な場面 |
| `--comment` | issue-update | ⚠️ 条件付き使用 | コメント追加が必要な場面 |
| `--req` | issue-update | ⚠️ 条件付き使用 | REQ更新が必要な場面 |
| `--review-ng` | issue-update | ⚠️ 条件付き使用 | レビューNG時のみ（spec-bug, impl-bug, scope-creep） |
| チェックボックス全完了確認 | issue-close | ✅ 使用中 | Step 2で必須確認 |
| PR CI確認 | issue-close | ✅ 使用中 | Guardrailsで義務化 |
| docs/検証（REQ/specs/ADR/README） | issue-close | ⚠️ 条件付き使用 | パターンBのみ |
| 学び検知・抽出（tips-capture） | issue-close | ⚠️ 条件付き使用 | エージェントが学びありと判断した場合のみ |
| Plan アーカイブ | issue-close | ⚠️ 条件付き使用 | planファイルが存在する場合のみ |
| フェーズ推論 | issue-next | ✅ 使用中 | すべての呼び出しで実行 |
| レビューNG時推論 | issue-next | ⚠️ 条件付き使用 | レビュー結果がNGの場合のみ |
| ループバック判定 | issue-next | ⚠️ 条件付き使用 | 乖離検出時に適用 |

### 3.2 未使用機能の分析

現時点で**完全に未使用**の機能は確認されない。全機能が設計上のフローでカバーされている。

ただし、以下の機能は**発動頻度が低い**（条件付き使用）と推測される：

| 機能 | 発動頻度が低い理由 |
|------|-------------------|
| REQ APPEND | 既存Issueへの追加要件は稀。通常は新規Issue → 新規REQ |
| REQ UPDATE | 要件修正はレビューNG（spec-bug, scope-creep）時のみ |
| ADRファイル作成 | ADR閾値以上の技術判断が発生する要件は限定 |
| `--review-ng` | レビューNG自体が稀 |
| docs外変更検出・取り消し | 通常はdocs/配下のみ操作 |
| ループバック（①への差し戻し） | 重大乖離が2件以上は稀 |
| 学び検知・抽出 | エージェントが学びなしと判断する場合も多い |
| Plan アーカイブ | planファイルが存在しない場合も多い（issue-workがplanを生成しないケース） |

---

## 4. 提案2（#77 README同期）の対象範囲確定

### 4.1 現状分析

#### issue-save-req の README 更新（Step 5）

```
インデックス更新: docs/requirements/README.md のインデックスに新規REQを追加、
docs/README.md のドキュメントハブにリンク追加（CREATE の場合のみ）
```

- **対象**: `docs/README.md` の Requirements セクション
- **条件**: REQ新規作成（CREATE）の場合のみ
- **欠落**: APPEND/UPDATE時は docs/README.md 更新なし（但し、既存エントリの更新なので通常は不要）

#### issue-close の docs/ 検証（Step 3）

```
docs/ 検証（パターンBの場合）:
- docs/requirements/REQ-{NNNN}.md が作成済みであることを確認
- docs/specs/system.md または docs/specs/patterns.md が更新されていることを確認
- ADRが必要な判断があった場合、docs/adr/ にADRが作成されていることを確認
- docs/README.md ドキュメントハブに新規エントリが含まれていることを確認
```

- **対象**: `docs/README.md` の新規エントリ存在確認
- **条件**: パターンBのみ
- **動作**: 検証のみ（更新はしない）。不足時は警告表示 + ユーザー判断

### 4.2 docs/README.md の現在の構造

```markdown
# Documentation Hub

## Requirements
- [Requirements Index](requirements/README.md)
  - [REQ-0001: ...](requirements/REQ-0001.md)
  ...
  - [REQ-0015: ...](requirements/REQ-0015.md)

## Specifications
- [System Specification](specs/system.md)
- [Implementation Patterns](specs/patterns.md)
```

### 4.3 同期ギャップの特定

| ギャップ | 説明 | 影響度 |
|----------|------|--------|
| ADRエントリ未追加 | `issue-save-req` はADR作成時に `docs/README.md` にADRエントリを追加しない | 中 — ADR専用セクションがdocs/README.mdに存在しない |
| specs更新時のハブ更新なし | `issue-work` がsystem.md/patterns.mdを更新しても、docs/README.mdのSpecificationsセクションは更新されない | 低 — 現在は固定リンク（ファイルリンクのみ）で運用 |
| APPEND/UPDATE時のREADME同期 | `issue-save-req` のAPPEND/UPDATE時は docs/README.md 更新対象外 | 低 — タイトルやステータス変更をdocs/README.mdに反映しない |
| docs/adr/README.md の不存在 | `docs/adr/` ディレクトリ自体が現在存在しない（glob検索で0件） | 中 — ADRが作成されたことがない、または手動管理 |

### 4.4 推奨案

#### 推奨: issue-save-req の Step 5 を拡張（A案）

**理由**:

1. **責務の明確性**: `issue-save-req` は「docs/への永続化」が責務。docs/README.md の更新もこの責務の一部
2. **一貫性**: 既に CREATE 時の更新ステップがある。APPEND/UPDATE タイタル変更時も同じ場所で更新すべき
3. **最小変更**: 既存ステップの条件緩和のみで対応可能

**具体的内容**:

| 拡張対象 | 現在 | 変更後 |
|----------|------|--------|
| Step 5（CREATE） | docs/README.md にリンク追加 | 変更なし |
| Step 5（APPEND） | docs/README.md 更新なし | docs/README.md の該当REQエントリ更新（タイトル変更等） |
| Step 5（UPDATE） | docs/README.md 更新なし | docs/README.md の該当REQエントリ更新（タイトル・ステータス変更等） |
| Step 6（ADR作成時） | docs/README.md 更新なし | `docs/adr/` ディレクトリ + `docs/adr/README.md` 作成（初回）、docs/README.md にADRセクション追加 |

**issue-update --req での対応は不要**:
- `issue-update --req` は Issue番号からREQを特定して更新するが、docs/README.md の同期も行う（Step 3-5で既に「ファイル書き出し → `gh issue edit` でIssue本文の該当箇所も同期」とある）
- しかし、docs/README.md の更新は明示的に記載されていない → **こちらも拡張対象に含めるべき**

#### 非推奨: issue-update への --sync-docs フラグ追加（B案）

**却下理由**:

- フラグ追加はユーザーが明示的に指定する必要があり、同期漏れのリスクがある
- 「docs/README.mdの同期」はコマンドの責務の一部であり、オプトインではなくデフォルト動作であるべき
- issue-update はすでに4フラグ（--body, --comment, --req, --review-ng）を持っており、フラグの増加は複雑性を高める

### 4.5 #77 対象範囲の確定

| 変更対象 | 変更内容 | 優先度 |
|----------|----------|--------|
| `issue-save-req.md` Step 5 | CREATE以外でもdocs/README.md更新（タイトル・ステータス変更反映） | 高 |
| `issue-save-req.md` Step 6 | ADR作成時にdocs/README.mdにADRセクション・エントリ追加 | 高 |
| `issue-save-req.md` Guardrails | ファイル編集スコープに`docs/adr/README.md`を追加（ADR初回作成時） | 中 |
| `issue-update.md` --req | REQ更新時にdocs/requirements/README.mdとdocs/README.mdの該当エントリ更新を明記 | 中 |
| `issue-close.md` Step 3 | docs/検証項目に「ADRエントリがdocs/README.mdに含まれていること」を追加 | 低 |
| `issue-guide-phases` スキル | docs構造の5区分にADR関連のハブ更新ルールを追記 | 低 |

---

## 5. スキル参照マトリクス

全コマンド × 全スキルの参照関係（● = load_skills に含まれる）：

| スキル | issue-req | issue-save-req | issue-create | issue-work | issue-update | issue-close | issue-next |
|--------|-----------|----------------|--------------|------------|--------------|-------------|------------|
| req-analysis | ● | | ● | ● | ● | | ● |
| adr-guidelines | ● | ● | | | | | |
| issue-guide-phases | ● | ● | ● | ● | ● | ● | ● |
| issue-guide-reports | ● | ● | ● | ● | ● | ● | |
| req-file-manager | | ● | ● | ● | ● | ● | |
| adr-file-manager | | ● | ● | ● | | | |
| conventional-commits | | ● | | ● | | | |
| gh-cli-best-practices | | | ● | | ● | ● | |
| git-worktree | | | | ● | | ● | |
| deviation-check | | | | ● | ● | | ● |
| issue-guide-review | | | | ● | ● | | ● |
| tips-capture | | | | | | ● | |
| archive-completed-plan | | | | | | ● | |

---

## 6. 外部コマンド呼び出しマトリクス

| コマンド | issue-req | issue-save-req | issue-create | issue-work | issue-update | issue-close | issue-next |
|----------|-----------|----------------|--------------|------------|--------------|-------------|------------|
| `git diff` | | ● | | | | | |
| `git checkout` | | ● | | | | | |
| `git commit` | | ● | | ● | | | |
| `git push` | | ● | | | | | |
| `git worktree add` | | | | ● | | | |
| `git worktree remove` | | | | | | ● | |
| `git worktree prune` | | | | | | ● | |
| `git branch -d` | | | | | | ● | |
| `gh issue create` | | | ● | | | | |
| `gh issue comment` | | | ● | | ● | ● | |
| `gh issue edit` | | | | | ● | | |
| `gh issue close` | | | | | | ● | |
| `gh pr create` | | | | ● | | | |
| `gh pr merge` | | | | | | ● | |
| `gh pr checks` | | | | | | ● | |

---

## 7. まとめ

### 達成状況

- [x] 各コマンドの機能一覧が文書化されている（セクション1、全7コマンドの全フラグ・分岐・スキル・テンプレート・外部コマンドを列挙）
- [x] 使用/未使用の判定結果が記録されている（セクション3、全機能について使用中/条件付き使用/未使用を判定）
- [x] 提案2（README同期=#77）の対象範囲が確定している（セクション4、ギャップ特定＋推奨案＋対象範囲テーブル）

### 主要な知見

1. **完全に未使用の機能は存在しない** — 全機能が設計上のフローでカバーされている
2. **条件付き使用が多いのは issue-update** — 4つのフラグ（--body, --comment, --req, --review-ng）はそれぞれ特定の場面でのみ発動
3. **docs/README.md 同期のギャップ** — issue-save-reqのCREATE時にのみ更新。APPEND/UPDATE/ADR作成時にハブが更新されない
4. **ADR運用の未成熟** — docs/adr/ディレクトリが存在せず、ADR作成の実績がない可能性
5. **issue-next は外部コマンド禁止** — セッションコンテキストのみで推論する設計
