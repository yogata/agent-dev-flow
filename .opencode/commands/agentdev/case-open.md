---
description: 要件定義をもとにGitHub Issueを作成する
agent: sisyphus
load_skills:
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
  - agentdev-gh-cli
  - agentdev-req-file-manager
  - agentdev-req-analysis
  - agentdev-adr-file-manager
  - agentdev-workflow-templates
---

# Case登録

要件定義（req-define）の結果をもとにGitHub Issueを作成する。①バイブス壁打ち→②構造的実行フェーズの境界。

## Input

- req-defineで生成された要件doc（チェックボックス付き）

## Output

- GitHub Issue（ラベル付き、要件doc埋め込み）

## Steps

1. `docs/specs/system.md` と `docs/specs/patterns.md` を読み込み、現在のシステム仕様と実装パターンを把握する
2. 要件docからIssue本文を生成:
   - `docs/requirements/REQ-{NNNN}.md` が存在する場合: REQ内容（目的/要件/適用範囲）を読み取り、Issue本文に反映
   - 存在しない場合: セッション内の要件docから直接生成
   - テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md` または `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_bug.md` を Read tool で読み込む
    **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てIssue本文に含まれること。`【任意】` セクションは内容がある場合のみ含める。必須セクションが欠落している場合、生成をやり直すこと。
    **Requirement Source 転記**（REQ-0023-004）: REQ文書（またはセッション内要件doc）に `## Requirement Source` セクションが存在する場合、その内容をIssue本文に転記する。転記先はIssue本文の補足情報セクションの後に `## Requirement Source` セクションとして配置する
3. **規模判定によるフロー分岐**（Step 2の直後に実行）:
   - draft-metaの `scale` フィールドを確認
   - `scale: large` の場合 → **Epic flow**（Step 4〜8）へ進む
   - `scale: standard` または `scale` フィールドなしの場合 → **Standard flow**（Step 4〜）へ進む
4. **[Epic flow]**: テンプレート `issue_desc_epic.md` を Read tool で読み込む
    **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てEpic Issue本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
5. **[Epic flow]**: Epic Issue本文を生成:
   - REQ内容から `{summary}`, `{problem}`, `{solution}` を埋める
   - draft-metaの `decomposition` から分解テーブルを生成（子Issue番号は後で更新するためプレースホルダー `#{TBD}`）
   - Wave テーブル生成: `agentdev-workflow-orchestration` の Wave scheduling ロジックに従い依存関係から Wave 番号を決定し、`## 実行順序` セクションの Wave テーブルを生成する。列形式: `Wave / Issue / 実行方法 / 前提`。子Issue番号はプレースホルダー `#{TBD_Wn}`（n は行番号）とする
   - ステータス追跡テーブル: 全子件数を `{total}` に設定、進行中/完了は0
   - `{completion_criteria}` は要件docから抽出
6. **[Epic flow]**: Epic Issueを作成:
   - ラベル: `enhancement`, `feature`, `epic`
   - `agentdev-gh-cli` に従って `--body-file` 使用
   - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
   - 作成されたIssue番号を `{epic_number}` として記録
7. **[Epic flow]**: 各子Issueを作成（decompositionの順に処理）:
   - テンプレート `issue_desc_child.md` を Read tool で読み込む
    **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全て子Issue本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
   - 子Issue本文を生成: `Parent: #{epic_number}` を先頭行に配置
   - `{summary}`, `{scope}`, `{solution}`, `{test_strategy}` をdecomposition内容から生成
   - ラベル: `enhancement`, `feature`（`epic` は付与しない）
   - `agentdev-gh-cli` に従って `--body-file` 使用
    - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
    - 作成されたIssue番号を記録
8. **[Epic flow]**: Epic Issue本文を更新:
   - 分解テーブルの `#{TBD}` を実際の子Issue番号に置換
   - Wave テーブルの `#{TBD_Wn}` を実際の子Issue番号に置換（`n` は行番号に対応）
   - ステータス追跡テーブルの件数を更新
   - `gh issue edit` でEpic本文を更新（`--body-file` 使用）
    - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
9. **[Standard flow]** `docs/adr/README.md` を読み込み、要件と関連するADRを「対象領域」と「決定内容」でマッチングして特定する。関連ADRがあれば個別に読み込む（Epic flowでもStep 3bの内容反映に活用）
10. **[Standard flow]** ラベル付与 → `agentdev-workflow-lifecycle` のラベル体系に従って選定
11. **[Standard flow]** GitHub Issueを作成（`gh issue create`） → `agentdev-gh-cli` に従って `--body-file` 使用
    - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
12. Issue作成後にコメント追加 → テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_analysis.md`（バグ修正・軽微変更/リファクタリング・保守作業/ドキュメント・雑務）または `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_feature_technical.md`（機能追加）を Read tool で読み込む（Epic flowではEpic Issueにコメント追加）
    - 書き込み完了後、`agentdev-gh-cli` の VERIFY操作（Section 5-8）に従って内容を検証すること。
    **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てコメント本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
13. ドラフトの `## draft-meta` セクションの `status` を `issued` に更新する（ドラフトが存在する場合のみ） → 更新後、`.sisyphus/drafts/req-draft-{topic-slug}.md` を削除
14. 完了報告 → `agentdev-workflow-reporting` の完了報告フォーマットで結果出力:
    - **Standard flow**: 作成したIssue番号を報告、次ステップ: `/agentdev/case-run {issue_number}`
    - **Epic flow**: Epic # + 全子Issue番号を報告、次ステップ: `/agentdev/case-run {epic_N}`（Epic Issue番号を指定）

## Guardrails

### フェーズ制約
- G01: ADR・specsの内容はIssue本文の生成に反映すること
- G02: Standard flowの動作・出力形式はEpic flow追加による影響を受けない

### 実行制約
- G03: 子Issue本文の先頭行に `Parent: #{epic_number}` を必ず含める（親子関係の追跡用）
- G04: 全子Issueの作成完了後にEpic本文のステータス追跡テーブルを更新する（部分更新は禁止）
- G05: 子Issueは最大10件まで（Epic 1件あたり）

### 品質ゲート
- G06: req-define未実行の場合は警告
- G07: 要件docのチェックボックスが空の場合は警告
- G08: 機能追加（Pattern B）の場合、対応するREQファイルが存在することを確認
- G09: テンプレートの【必須】セクションが全てIssue本文に含まれていることを確認してからgh issue createを実行すること。欠落セクションがある場合は再生成すること
- G10: `完了条件` セクションはIssue本文テンプレートの【必須】セクションである。テンプレート準拠検証で必ず含まれていることを確認すること

### 判断・承認制約
- G11: Epic flowは draft-metaの `scale: large` が明示的に設定されている場合のみ実行

### 委譲・参照制約
- G12: gh CLI出力を読み取る際は `agentdev-gh-cli` の安全な読み取り手順に従うこと
- G13: Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → Pattern Registry を参照

### 出力制約
- G14: サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
