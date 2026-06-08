---
description: 要件定義をもとにGitHub Issueを作成する
agent: sisyphus
---

# Case登録

要件定義（req-define）の結果をもとにGitHub Issueを作成する。①バイブス壁打ち→②構造的実行フェーズの境界。

## Input

- req-defineで生成された要件doc（チェックボックス付き）

## Output

- GitHub Issue（ラベル付き、要件doc埋め込み）

## Steps

0. **upstream handoff 停止判定**: 要件docまたは RU に `apply_in_current_project: false` が含まれる場合、Issue を作成せず停止する。agent-dev-flow repository への手動取り込み対象として報告する。判定は `agentdev-workflow-lifecycle/references/upstream-handoff.md` に従う

1. 要件docからIssue本文を生成:
   - `docs/requirements/REQ-{NNNN}.md` が存在する場合: REQ内容（目的/要件/適用範囲）を読み取り、Issue本文に反映
   - 存在しない場合: セッション内の要件docから直接生成
   - テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md` または `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_bug.md` を Read tool で読み込む
    **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てIssue本文に含まれること。`【任意】` セクションは内容がある場合のみ含める。必須セクションが欠落している場合、生成をやり直すこと。
     **Requirement Source 転記**: REQ文書（またはセッション内要件doc）に `## Requirement Source` セクションが存在する場合、その内容をIssue本文に転記する。転記先はIssue本文の補足情報セクションの後に `## Requirement Source` セクションとして配置する
    - **関連ドキュメント更新候補 転記**: REQ文書（またはセッション内要件doc）に `## 関連ドキュメント更新候補` セクションが存在する場合、その内容をIssue本文に転記する
    - **直接矛盾の完了条件反映**: 関連ドキュメント更新候補のうち `直接矛盾` に分類された候補を、Issue本文の完了条件セクションにチェックボックスとして反映する
    - **テスト戦略スコープ管理**: テスト戦略セクションの各テスト項目について、単一実装PR内で完結する検証かどうかを判定すること（SHALL）。単一PR内で完結しない検証（E2Eテスト、手動確認等）はチェックボックス形式（`- [ ]`）で出力してはならない（MUST NOT）。達成不可能項目のうち情報保持が必要なものは `> ℹ️ 別途確認: {項目名}` 形式で出力すること（SHALL）
  2. **マルチREQ入力判定**:
    - 入力要件docの数を確認
    - **単一REQドキュメント**の場合 → 既存の規模判定（Step 3）へ進む
    - **複数REQドキュメント**またはdraft-metaに`scale: large`が設定されている場合 → **マルチREQ Epic flow**（Step 4〜）へ進む
 3. **規模判定によるフロー分岐**（Step 1の直後に実行）:
    - draft-metaの `scale` フィールドを確認
    - `scale: large` の場合 → **単一REQ Epic flow**（Step 8〜12）へ進む
    - `scale: standard` または `scale` フィールドなしの場合 → **Standard flow**（Step 16〜19）へ進む
 4. **[マルチREQ Epic flow]**: テンプレート `issue_desc_epic.md` を Read tool で読み込む
     **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てEpic Issue本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
 5. **[マルチREQ Epic flow]**: Epic Issue本文を生成:
     - 各REQドキュメントから要約を抽出し、Epicの`{summary}`, `{problem}`, `{solution}`を統合して生成
      - **分解テーブル生成**: 入力REQドキュメント単位で分解テーブルを生成。各REQドキュメントを個別の作業単位として扱う。子Issue番号は後で更新するためプレースホルダー `#{TBD}`
      - **Waveテーブル生成**: 各REQドキュメントの依存関係情報を解析し、Wave番号を決定して`## 実行順序`セクションのWaveテーブルを生成する。列形式: `Wave / Issue / 実行方法 / 前提 / 対象REQ`。子Issue番号はプレースホルダー `#{TBD_Wn}`（nは行番号）とする。対象REQ列には各子Issueに対応するREQドキュメント番号を記載
     - ステータス追跡テーブル: 全子Issue数（=入力REQドキュメント数）を`{total}`に設定、進行中/完了は0
     - `{completion_criteria}`は各REQドキュメントの完了条件を統合して抽出
     - **子Issue数事前チェック**: 入力REQドキュメント数（子Issue数）を確認。G15（最大10件）を超過する場合、Epic Issue・子Issueのいずれも作成せずエラーを報告して停止する
 6. **[マルチREQ Epic flow]**: Epic Issueを作成:
    - ラベル: `enhancement`, `feature`, `epic`
    - `agentdev-gh-cli` に従って `--body-file` 使用
    - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
    - 作成されたIssue番号を `{epic_number}` として記録
 7. **[マルチREQ Epic flow]**: 各REQドキュメントに対応する子Issueを作成（REQドキュメントの順に処理）:
    - テンプレート `issue_desc_child.md` を Read tool で読み込む
     **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全て子Issue本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
    - 子Issue本文を生成:
      - `Parent: #{epic_number}` を先頭行に配置
      - 対象REQドキュメントの内容から`{summary}`, `{scope}`, `{solution}`, `{test_strategy}`を生成
      - **Wave情報反映**: 対象REQドキュメントが属するWave番号と依存関係をIssue本文の補足情報セクションに記載
      - **REQ traceability保持**: 対象REQドキュメント番号をIssue本文に明示的に記載し、要件ドキュメントとの追跡可能性を維持する
    - ラベル: `enhancement`, `feature`（`epic` は付与しない）
    - `agentdev-gh-cli` に従って `--body-file` 使用
     - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
     - 作成されたIssue番号を記録
      - **孫Issue判定**: 子Issue作成時に対象REQドキュメントの規模・複雑度を判定し、必要に応じて追加分解による孫Issue作成を検討する（SHOULD）
 8. **[マルチREQ Epic flow]**: Epic Issue本文を更新:
    - 分解テーブルの `#{TBD}` を実際の子Issue番号に置換
    - Wave テーブルの `#{TBD_Wn}` を実際の子Issue番号に置換（`n` は行番号に対応）
    - ステータス追跡テーブルの件数を更新
    - `gh issue edit` でEpic本文を更新（`--body-file` 使用）
     - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。

 9. **[単一REQ Epic flow]**: テンプレート `issue_desc_epic.md` を Read tool で読み込む
     **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てEpic Issue本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
 10. **[単一REQ Epic flow]**: Epic Issue本文を生成:
    - REQ内容から `{summary}`, `{problem}`, `{solution}` を埋める
    - draft-metaの `decomposition` から分解テーブルを生成（子Issue番号は後で更新するためプレースホルダー `#{TBD}`）
    - Wave テーブル生成: `agentdev-workflow-orchestration` の Wave scheduling ロジックに従い依存関係から Wave 番号を決定し、`## 実行順序` セクションの Wave テーブルを生成する。列形式: `Wave / Issue / 実行方法 / 前提`。子Issue番号はプレースホルダー `#{TBD_Wn}`（n は行番号）とする
    - ステータス追跡テーブル: 全子件数を `{total}` に設定、進行中/完了は0
    - `{completion_criteria}` は要件docから抽出
    - **子Issue数事前チェック**: decomposition の子Issue数を確認。G05（最大10件）を超過する場合、Epic Issue・子Issueのいずれも作成せずエラーを報告して停止する
 11. **[単一REQ Epic flow]**: Epic Issueを作成:
    - ラベル: `enhancement`, `feature`, `epic`
    - `agentdev-gh-cli` に従って `--body-file` 使用
    - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
    - 作成されたIssue番号を `{epic_number}` として記録
 12. **[単一REQ Epic flow]**: 各子Issueを作成（decompositionの順に処理）:
   - テンプレート `issue_desc_child.md` を Read tool で読み込む
    **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全て子Issue本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
   - 子Issue本文を生成: `Parent: #{epic_number}` を先頭行に配置
   - `{summary}`, `{scope}`, `{solution}`, `{test_strategy}` をdecomposition内容から生成
   - ラベル: `enhancement`, `feature`（`epic` は付与しない）
   - `agentdev-gh-cli` に従って `--body-file` 使用
    - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
    - 作成されたIssue番号を記録
 13. **[単一REQ Epic flow]**: Epic Issue本文を更新:
    - 分解テーブルの `#{TBD}` を実際の子Issue番号に置換
    - Wave テーブルの `#{TBD_Wn}` を実際の子Issue番号に置換（`n` は行番号に対応）
    - ステータス追跡テーブルの件数を更新
    - `gh issue edit` でEpic本文を更新（`--body-file` 使用）
     - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
 14. **[Standard flow]** `docs/adr/README.md` を読み込み、要件と関連するADRを「対象領域」と「決定内容」でマッチングして特定する。関連ADRがあれば個別に読み込む（単一REQ Epic flowでもStep 2bの内容反映に活用）
 15. **[Standard flow]** ラベル付与 → `agentdev-workflow-lifecycle` のラベル体系に従って選定
 16. **[Standard flow]** GitHub Issueを作成（`gh issue create`） → `agentdev-gh-cli` に従って `--body-file` 使用
      - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
 17. Issue作成後にコメント追加 → テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_analysis.md`（バグ修正・軽微変更/リファクタリング・保守作業/ドキュメント・雑務）または `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_feature_technical.md`（機能追加）を Read tool で読み込む（単一REQ Epic flowおよびマルチREQ Epic flowではEpic Issueにコメント追加）
     - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
     **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てコメント本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
 18. ドラフトが存在する場合、`.sisyphus/drafts/req-draft-{topic-slug}.md` を削除する
  18a. RU ファイル削除（SHALL）:
    - Issue 作成時に使用した一時メタ情報（要件docの Requirement Source セクション、またはセッション内要件docの Requirement Source セクション）から抽出した `.agentdev/backlog/req-units/RU-*.md` に一致するファイルを削除する
    - **削除条件**: Issue 作成 + VERIFY が正常完了した場合のみ（SHALL）。Issue 作成失敗・VERIFY 失敗時は RU を残置する
    - **削除対象外**: RU パターンに一致しない Requirement Source は削除しない
    - **RU削除後の同期確認**（SHALL）: RU ファイル削除を commit/push した場合、以下を確認すること:
        1. main 作業ディレクトリの HEAD と `origin/main` が一致していること（`git rev-parse HEAD` と `git rev-parse origin/main` を比較）
        2. `git status --porcelain` に削除済み RU ファイルが残っていないこと
     - 同期確認に失敗した場合、対象ファイル・現在の HEAD・`origin/main` を表示して完了扱いにせず停止すること（SHALL）
 18b. 完了報告 → 完了報告templateに従って出力。実行フローに応じたvariantを選択:
     - Standard flow → .opencode/commands/agentdev/templates/case-open/standard.md
     - 単一REQ Epic flow → .opencode/commands/agentdev/templates/case-open/epic.md
     - マルチREQ Epic flow → .opencode/commands/agentdev/templates/case-open/multi-req-epic.md

## Guardrails

### フェーズ制約
- G01: ADR・specsの内容はIssue本文の生成に反映すること
- G02: Standard flowの動作・出力形式はEpic flow追加による影響を受けない

### 実行制約
- G03: 子Issue本文の先頭行に `Parent: #{epic_number}` を必ず含める（親子関係の追跡用）
- G04: 全子Issueの作成完了後にEpic本文のステータス追跡テーブルを更新する（部分更新は禁止）
- G05: 子Issueは最大10件まで（Epic 1件あたり）。Step 5（マルチREQ Epic flow）またはStep 10（単一REQ Epic flow）で子Issue数を確認し、超過時はEpic・子Issueのいずれも作成せずエラーで停止する
- G14: REQドキュメントの追跡可能性を破壊するような、Wave単位のみの子Issue構造を作成してはならない。子Issueは必ずREQドキュメントと対応付けること
- G15: マルチREQ Epic flowは、複数REQドキュメント入力時またはdraft-metaに`scale: large`が設定されている場合にのみ実行する

### 品質ゲート
- G06: req-define未実行の場合は警告
- G07: 要件docのチェックボックスが空の場合は警告
- G08: featureの場合、対応するREQファイルが存在することを確認
- G09: テンプレートの【必須】セクションが全てIssue本文に含まれていることを確認してからgh issue createを実行すること。欠落セクションがある場合は再生成すること
- G10: `完了条件` セクションはIssue本文テンプレートの【必須】セクションである。テンプレート準拠検証で必ず含まれていることを確認すること

### 判断・承認制約
- G11: 単一REQ Epic flowは draft-metaの `scale: large` が明示的に設定されている場合のみ実行
- G16: マルチREQ Epic flowは複数REQドキュメント入力時またはdraft-metaに`scale: large`が設定されている場合のみ実行

### 委譲・参照制約
- G12: gh CLI出力を読み取る際は `agentdev-gh-cli` の安全な読み取り手順に従うこと
- G13: work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` → workflow classification を参照

### 出力制約
- G17: サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
