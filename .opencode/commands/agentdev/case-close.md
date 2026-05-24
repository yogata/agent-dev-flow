---
description: PRをマージし、対応記録を追記し、Caseをクローズしてブランチを削除する
agent: sisyphus
load_skills:
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
  - agentdev-learning-capture
  - agentdev-gh-cli
  - agentdev-git-worktree
  - agentdev-req-file-manager
  - agentdev-epic-tracker
  - agentdev-workflow-templates
  - agentdev-learning-pipeline
---

# 完了処理

PRをマージし、Caseに記録を追記し、クローズ後にworktreeとブランチを削除する。レビュー完了フェーズ。

## Input

- Issue番号
- PR番号（または自動検出）

## Output

- マージ済みPR
- クローズ済みCase
- 削除済みブランチ・worktree

## Steps

1. Issue番号解決:
    - ユーザー入力からIssue番号を取得（指定されている場合はそれを使用）
    - 番号が省略された場合、セッション内会話から直近のIssue番号を検索（`case-run` の完了報告、直前のIssue参照履歴等から抽出）
    - 複数のIssue番号が存在する場合は直近のものを優先し、ユーザーに確認（例: 「Issue #Nで完了処理を行います。よろしいですか？」）
    - 検出できない場合はユーザーに番号の指定を求めて停止
2. 前提確認: 達成判定・完了ゲート、PR存在確認:
    - Issue本文を `agentdev-gh-cli` の安全な読み取り手順で取得する
    - Issue本文内の完了条件・テスト戦略セクションから全チェックボックスを抽出する（`- [ ]` および `- [x]`）
    - **達成判定（unchecked項目がある場合）**: 即座に停止せず、各unchecked項目について以下の達成判定を実行する:
        - **証拠ソース**: PR本文、PR diff、commit内容、CI結果、Issueコメント、PRコメント、実装ファイル内容から証拠を探索する
        - **達成の5条件** — 以下の全条件を満たす場合のみ達成と判定（MUST NOT: 間接的・不明確・矛盾する証拠で達成判定しない）:
          1. チェックボックス文言の要求する完了状態が特定できる
          2. 証拠ソースに証拠が存在する
          3. 証拠がチェックボックス文言に直接対応する
          4. 反証や未処理の情報が存在しない
          5. 判定理由を完了コメント等の出力に記録可能である
        - 達成と判定された項目 → `[x]` に更新（判定根拠・証拠ソースを記録）
        - 達成と判定されなかった項目 → `[ ]` のまま（MUST NOT: 証拠なしで `[x]` に更新しない）
    - **Issue本文更新**: `agentdev-gh-cli` に従い `--body-file` で `gh issue edit` を実行してIssue本文を更新
    - **再取得・再検証**: Issue本文を再取得し、unchecked項目が残っていないことを確認（REQ-0032-012）
    - **未達項目が残る場合** → 構造化エラーを出力して停止する（G08）。Step 3以降に進まない:
      ```
      ## 完了ゲートエラー: 未達チェックボックス検出

      **Issue**: #{N}
      **未達項目数**: {count}件
      **未達項目一覧**:
      {未達項目のリスト}

      **停止理由**:
      達成根拠を確認できない未チェック項目が残っています。

      **ユーザーアクション**:
      未達項目を実装・検証するか、不要な項目であればIssue本文から削除してください。
      ```
    - **全項目達成済みの場合** → Step 3へ進む
    - PRの存在を確認（`gh pr view` でPR番号を特定、またはセッション内会話から取得）
    - **責任境界**: case-runのチェックボックス更新責任は維持される。case-closeは最終セーフティネットとして機能する（REQ-0032-013, 014）
3. docs/ 検証:
    **機能追加固有の検証**:
    - `docs/requirements/REQ-{NNNN}.md` が作成済みであることを確認
    - `docs/requirements/README.md` のインデックスに該当REQが記載されていることを確認。未記載の場合は警告
    - `docs/README.md` ドキュメントハブに該当REQのリンクが記載されていることを確認。未記載の場合は警告
    - `docs/specs/system.md` または `docs/specs/patterns.md` が更新されていることを確認
    - ADRが必要な判断があった場合、`docs/adr/` にADRが作成されていることを確認
    - ADRが作成されている場合、`docs/README.md` にADRセクションが存在し、該当ADRのリンクが記載されていることを確認
    - 不足がある場合: 警告を表示してユーザーの判断を仰ぐ
    **全パターン共通の検証（関連ドキュメント整合性）**:
    - 実装コード・設定・関連ドキュメントが要件と矛盾していないことを確認する（SHALL）
    - 旧仕様の記述が残っている場合、その記述が変更後仕様と矛盾しないことを確認する（SHALL）
    - 変更後仕様と矛盾するドキュメント更新漏れがある場合、完了不可とする（SHALL）
4. PRマージ（`gh pr merge`）→ 対応記録をIssueにコメント追記 → テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_feature_implementation.md`（機能追加）または `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md`（バグ修正・軽微変更/リファクタリング・保守作業/ドキュメント・雑務）を Read tool で読み込む
    - **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てコメント本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
    - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
5. Post-merge テスト戦略検証・反映（Step 4 PRマージ後）:
    - Step 2の達成判定はマージ前の完了ゲートとして機能する。本Stepはマージ後にのみ確認できる項目の反映を行う
    - Issue本文を取得し、テスト戦略セクションのチェックボックスを確認
    - **マージ後のみ確認可能な項目**（例: CI通過確認、マージ後の動作検証）について、マージ結果に基づき反映:
        - マージ後のCI結果・マージ成功に基づき達成が確認できる項目 → `[x]` に更新（理由を記録）
        - それ以外の項目 → Step 2での判定結果を維持（本Stepで再判定しない）
    - 更新対象がある場合のみ、`agentdev-gh-cli` に従い `--body-file` で `gh issue edit` を実行してIssue本文を更新
    - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
6. Issueクローズ（`gh issue close --reason completed`）
7. ブランチ・worktree削除 → `agentdev-git-worktree` スキルの「worktree削除手順」に従って以下を実行:
    - **.sisyphus/ クリーンアップ**: worktree 内の `.sisyphus/` ディレクトリを削除（`Remove-Item -Recurse -Force .sisyphus/`）。未追跡ファイルによる worktree remove エラーを防止
    - worktree削除（`git worktree remove`）
    - worktree prune
    - ローカルブランチ削除（`git branch -d`）
    - **リモートブランチ削除**（`git push origin --delete`）— `agentdev-git-worktree` スキル Step 5 参照
    - 削除の成否を確認し、失敗した場合は警告表示してユーザーの判断を仰ぐ
 8. 親Epic Issue更新（`agentdev-epic-tracker` スキル参照）:
    - Issue本文からParent Issue番号を特定（`Parent: #{N}` パターンを検索）
    - Parent Issueが存在しない場合 → スキップ
    - Parent Issueの本文を取得
    - ステータストラッキング表から該当Issue番号（#{N}）の行を特定
    - 該当行のステータス列を更新（例: `☐ 未着手` → `✅ 完了 ([PR#{N}](URL))`、`🔄 進行中` → `✅ 完了 ([PR#{N}](URL))`）
    - 該当Issue番号の詳細セクションがある場合、ステータスとPR情報を更新（例: `✅ 完了 ([PR#{N}](URL))`）
    - `agentdev-gh-cli` に従い `--body-file` で `gh issue edit` を実行してParent Issue本文を更新
    - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
    - **Epic自動クローズ判定**（Parent Issue更新後）:
        - 更新後のParent Issue本文から全子Issue番号を抽出（`#{N}` パターンを検索）
        - 各子Issueの状態を `gh issue view {N} --json state` で確認
        - 状態取得に失敗した場合 → 警告表示してスキップ（Epicクローズしない）
        - 全子Issueが "CLOSED" またはステータス追跡テーブルで `❌ 対処不要` の場合:
            - Epicに完了コメントを追記（「全子Issue完了のため自動クローズ」+ 子Issue一覧）
            - `agentdev-gh-cli` に従い `--body-file` でコメント追記
            - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
            - `gh issue close {epic_number} --reason completed` でEpicをクローズ
            - 完了報告に「Epic #{N} を自動クローズ」と表示
        - 1件以上 "OPEN" の子Issueがある場合 → スキップ（完了報告に「Epic #{N}: N件未完了のためスキップ」と表示）
8b. 実行前同期（git pull）:
    - カレントディレクトリで `git pull --ff-only` を実行する
    - **失敗時**: 以下の構造化エラーメッセージを表示して停止する（自動解消しない）:
      ```
      ## Git 同期エラー

      **エラー種別**: pull --ff-only 失敗
      **停止理由**: リモートに未取り込みの変更があり、fast-forward マージできない
      **対象ブランチ**: {current_branch}
      **ユーザーアクション**: 手動で `git pull --rebase` または `git stash && git pull --ff-only && git stash pop` を実行してください
      **raw git output**:
      {git_error_output}
      ```
 9. 学びの検知・抽出: `agentdev-learning-capture` スキルに従い、エージェントが自ら学びの有無を判断する
     - **禁止**: ユーザーに学びの有無を問うこと（「学びはありますか？」等）は禁止。エージェントが判断する
     - エージェントが学びありと判断 → 13フィールド形式でエントリを生成し、ユーザー承認を求めず `.agentdev/learning/inbox.md` に直接追記する。追記後、追記内容をユーザーに通知する（承認や却下は求めない）
     - エージェントが学びなしと判断 → ユーザーに何も問わず次の Step へ進む
 9a. Staging stub consumed 判定と archive:
     - staging stub archive 処理は `agentdev-learning-pipeline` skill の archive ルールに従う（SSoT）
     - consumed 判定結果を Step 11 の完了報告に含める
 9b. Post-run intake capture: 完了処理中に発見した本筋外の変更候補のうち、具体的な修正対象が特定できるものを intake item として保存する。`agentdev-workflow-lifecycle` → `reference/capture-boundaries.md` の Split Rule を SSoT とする
     - **Intake item の保存**: 具体的な修正対象が特定できるもの（不整合・規約違反・未回収課題等）を `.agentdev/intake/inbox/` に intake item として保存（SHALL）
     - **Intake item の形式**: 他の intake 系コマンド（intake-capture / intake-from-github）と同一の推奨標準形に従う:
       - ファイル名: `YYYY-MM-DD-{topic-slug}.md`（生成元コマンド名をファイル名に含めない）
       - 同名ファイル既存時: `-2`, `-3` の連番を付与する
       - 推奨見出し: 観測、今回扱わない理由、影響、レビューで決めること、根拠（任意）。見出し名は固定せず、内容に応じて変更・省略を許容する
       - 内容がないセクションを形式維持のためだけに作成しない
       - frontmatter・状態フィールド・重複排除キーを持たせない
       - case-close 由来であることは `根拠（任意）` 見出しに記録する（ファイル名や独自 frontmatter には記録しない）
    - **曖昧な候補は自律保存しない**: 修正対象が特定できない候補・単なる違和感・改善案・曖昧な変更候補は自律保存せず、完了報告に候補としてのみ提示（SHALL）
    - **保存先の限定**: intake item の保存先は `.agentdev/intake/inbox/` のみ（SHALL）
    - **採用判断の禁止**: intake item の採用可否判断、GitHub Issue 作成、後続対応の優先度判断を行わない（SHALL）
    - **未対応事項の逃避禁止**: 今回の Issue / PR の完了条件に含まれる未対応事項を intake item に逃がして完了扱いにしてはならない（SHALL）
    - **別々の成果物**: intake item と learning item を別々に件数・保存先・次ステップを表示する（SHALL）。混合した単一成果物にしない
    - **既存 learning capture 原則の維持**: Step 9 の learning capture の原則（ユーザーに学びを問わない、承認なしで蓄積し通知する）は維持する（SHALL）
    - **Split Rule の適用**: 観測が intake と learning の両方に該当する場合、`capture-boundaries.md` の Split Rule（具体的修正対象 → intake item、再発防止知見 → learning item、両方 → 分割）に従い、別々の成果物として作成
9c. .agentdev 変更の commit と push（learning + intake 同一 commit）:
    - `git diff --name-only` で `.agentdev/` 配下の変更ファイルを確認する
    - **変更なし時**: commit/push せず、Step 11 の完了報告で「変更なし」と報告
    - **変更あり時**:
        1. `git add` は `.agentdev/` 配下の変更ファイルのみを対象とする（SHALL）。他のパスを巻き込まない
        2. commit message: `chore(agentdev): close case #N and capture domain state`（Conventional Commits 形式）（SHALL）
           - `#N` は対象Issue番号に置換
        3. learning capture (Step 9) と intake capture (Step 9b) の成果物を**同一 commit** に含める（SHALL）
        4. `git push` を実行する
        5. **push 失敗時**: 以下の構造化エラーメッセージを表示し、完了扱いにしない（SHALL）:
            ```
            ## Git Push エラー（domain state 永続化失敗）

            **PR/Issue 状態**: PRマージ済み・Issueクローズ済み（完了状態）
            **失敗対象**: .agentdev/ 配下の domain state 永続化（learning/intake の保存）
            **エラー種別**: push 失敗
            **対象ブランチ**: {current_branch}
            **変更ファイル**: {changed_files}
            **ユーザーアクション**: 手動で `git push` を実行してください
            **raw git output**:
            {git_error_output}
            ```
10. 完了報告 → `agentdev-workflow-reporting` の完了報告フォーマット（completion-reports.md → case-close 完了時）に従って出力
    - **git 永続化結果**（完了報告に追加）:
        - 変更の有無（あり/なし）
        - 変更ありの場合: commit されたファイル一覧、commit hash、push 成否
        - 変更なしの場合: 「変更なし（commit/push スキップ）」

## Guardrails

### 実行制約
- G01: 未マージPRはクローズしない
- G02: Issue番号省略は同一セッション内で作成済みの場合のみ
- G03: Issue番号の解決に `gh issue list` / `gh issue status` 等、gh/gitコマンドでopen issue一覧を取得することは禁止。番号はユーザー入力またはセッション内会話からのみ取得可能
- G04: Epic自動クローズは全子IssueがCLOSEDの場合のみ実行。子Issue状態取得失敗時はEpicクローズしない
- G05: Step 7 のブランチ・worktree削除（ローカル+リモート）は必ず実行し、成否を確認すること。削除失敗時は警告表示して停止
- G06: Step 8b の `git pull --ff-only` は必ず実行すること。pull失敗時は自動解決せずエラー報告して停止

### 品質ゲート
- G07: PRのCIが通っていることを確認（`gh pr checks`）。CI/CDが失敗している場合は case-run に差し戻す（case-close は修正を行わない）
- G08: 達成判定後も未達チェックボックスが残る場合、Step 2で構造化エラーを出して停止する。達成判定は5条件プロトコルに従う（根拠ソース・直接対応・反証なし・理由記録可能）
- G09: 機能追加で docs/ 更新がない場合、警告を表示して停止確認。変更後仕様と矛盾するドキュメント更新漏れがある場合、完了不可とする
- G10: Issue本文のテスト戦略チェックボックスを必ず更新すること（PR検証結果を反映）
- G11: コメントテンプレートの【必須】セクションが全てコメント本文に含まれていることを確認してからコメント投稿すること

### 委譲・参照制約
- G12: `agentdev-gh-cli` に従って `--body-file` を使用すること（`--body` 直接指定は禁止）
- G13: `agentdev-learning-capture` スキルのフロー（エージェントが検知・抽出・自律蓄積・内容通知。承認可否を問わない）に従う。ユーザーに学びの有無や内容の入力を求めることは禁止
- G14: gh CLI出力を読み取る際は `agentdev-gh-cli` の安全な読み取り手順に従うこと
- G15: Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → Pattern Registry を参照
- G16: intake item と learning item を混合した単一成果物にしないこと。`capture-boundaries.md` の Split Rule に従い別々の成果物とすること
- G17: 今回の Issue / PR の完了条件に含まれる未対応事項を intake item に逃がして完了扱いにしないこと
- G18: intake item の採用可否判断・GitHub Issue 作成・優先度判断を行わないこと

### 出力制約
- G19: サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- G20: Step 8b の `git pull --ff-only` 失敗時は自動解消せず、構造化エラーメッセージを表示して停止すること
- G21: Step 9c の commit は `.agentdev/` 配下のみを対象とすること。他のパスを巻き込まないこと
- G22: Step 9c で learning capture と intake capture の成果物を同一 commit に含めること
- G23: Step 9c の push 失敗時は PR/Issue完了済み、domain state永続化失敗として構造化エラーメッセージを表示して停止すること
- G24: `.agentdev/` 配下に変更がない場合は commit/push をスキップすること
