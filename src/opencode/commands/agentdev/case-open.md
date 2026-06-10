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

0. **upstream handoff 停止判定**: 要件docまたは RU に `apply_in_current_project: false` が含まれる場合、Issue を作成せず停止。agent-dev-flow repository への手動取り込み対象として報告。判定は `agentdev-workflow-lifecycle/references/upstream-handoff.md` に従う

1. 要件docからIssue本文を生成:
   - `docs/requirements/REQ-{NNNN}.md` が存在: REQ内容（目的/要件/適用範囲）を読み取り反映。存在しない: セッション内要件docから直接生成
   - テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md` または `issue_desc_bug.md` を Read tool で読み込む
   - **Requirement Source 転記**: REQ/要件docの `## Requirement Source` を補足情報セクション後に配置
   - **関連ドキュメント更新候補 転記**: 同セクションを転記
   - **直接矛盾の完了条件反映**: 関連ドキュメント更新候補の `直接矛盾` を完了条件にチェックボックス反映
   - **テスト戦略スコープ管理**: 各テスト項目について単一PR内完結か判定（SHALL）。完結不可項目は `- [ ]` 出力禁止（MUST NOT）。情報保持が必要な達成不可項目は `> ℹ️ 別途確認: {項目名}` 形式（SHALL）

2. **マルチREQ入力判定**: 入力要件doc数を確認
   - 単一REQ → Step 3
   - 複数REQ または draft-meta `scale: large` → **マルチREQ Epic flow**（Step 4〜）

3. **規模判定**（Step 2で単一REQの場合）:
   - `scale: large` → **単一REQ Epic flow**（Step 4〜）
   - `scale: standard` / フィールドなし → **Standard flow**（Step 14〜）

**共通ルール**（全Step適用）:
- **VERIFY**: gh CLI書込後は毎回 `agentdev-gh-cli` の VERIFY操作（Section 5-8）に従い検証（SHALL）
- **テンプレート準拠**: テンプレート読込後は毎回【必須】セクションの完備を確認（【任意】は内容がある場合のみ含める）、欠落時は再生成

### Epic flow（Step 4〜8）

Epic flow は Step 2 または Step 3 のルーティングにより開始。マルチREQ / 単一REQ の差分:

| 差分項目 | マルチREQ | 単一REQ |
|----------|-----------|---------|
| 分解ソース | 各REQ doc単位 | draft-meta `decomposition` |
| Waveテーブル列 | Wave/Issue/実行方法/前提/対象REQ | Wave/Issue/実行方法/前提 |
| 子Issue数上限 | G15（最大10） | G05（最大10） |
| 子Issue内容ソース | 各REQ docから生成 | decomposition内容から生成 |
| 子Issue追加要素 | Wave番号+依存記載、REQ doc番号明示（traceability）、孫Issue判定（SHOULD） | なし |

4. テンプレート `issue_desc_epic.md` を Read tool で読み込む

5. Epic Issue本文を生成:
   - `{summary}`, `{problem}`, `{solution}` を埋める
   - 分解テーブル生成（子Issue番号はプレースホルダー `#{TBD}`）
   - Waveテーブル生成: 依存関係からWave番号を決定（プレースホルダー `#{TBD_Wn}`、nは行番号）。マルチREQ: 各REQ docの依存関係を解析、対象REQ列にREQ番号記載。単一REQ: `agentdev-workflow-orchestration` のWave schedulingロジックに従う
   - ステータス追跡テーブル: `{total}` = 子Issue数、進行中/完了 = 0
   - `{completion_criteria}` 抽出
   - 子Issue数事前チェック: 上限超過時はEpic・子Issueいずれも作成せずエラーで停止

6. Epic Issueを作成:
   - ラベル: `enhancement`, `feature`, `epic`
   - `--body-file` 使用 → VERIFY。Issue番号を `{epic_number}` として記録

7. 子Issueを作成（順次処理）:
   - テンプレート `issue_desc_child.md` 読込
   - 本文: `Parent: #{epic_number}` 先頭行。{summary}, {scope}, {solution}, {test_strategy} 生成
   - マルチREQ差分: Wave番号+依存を補足情報に記載、REQ doc番号を明示記載、孫Issue判定（SHOULD）
   - ラベル: `enhancement`, `feature`（`epic` 除外）
   - `--body-file` 使用 → VERIFY。Issue番号を記録

8. Epic Issue本文を更新:
   - `#{TBD}` → 実番号、`#{TBD_Wn}` → 実番号（n=行番号対応）
   - ステータス追跡テーブル更新
   - `gh issue edit`（`--body-file`）→ VERIFY

### Standard flow + 共通終了（Step 14〜）

14. **[Standard]** `docs/adr/README.md` から関連ADRを特定（単一REQ Epic flowの内容反映にも活用）
15. **[Standard]** ラベル付与 → `agentdev-workflow-lifecycle` ラベル体系に従う
16. **[Standard]** GitHub Issue作成（`gh issue create`）→ `--body-file` → VERIFY

17. コメント追加: テンプレート `issue_comment_bug_analysis.md`（バグ・軽微変更等）または `issue_comment_feature_technical.md`（機能追加）読込（Epic flowではEpic Issueにコメント追加）→ VERIFY

18. ドラフトが存在する場合、`.sisyphus/drafts/req-draft-{topic-slug}.md` を削除

18a. **RU ファイル削除**（SHALL）:
   - Issue作成 + VERIFY 正常完了時のみ削除。失敗時は残置
   - 対象: 要件docの Requirement Source から抽出した `RU-*.md` に一致するファイル。RU パターンに一致しないものは削除しない
   - **削除後同期確認**（SHALL）: commit/push 後、`git rev-parse HEAD` == `origin/main` であること、`git status --porcelain` に削除RUが残っていないこと。失敗時はファイル・HEAD・origin/main を表示し停止

18b. 完了報告 → template variant:
   - Standard → `templates/case-open/standard.md`
   - 単一REQ Epic → `templates/case-open/epic.md`
   - マルチREQ Epic → `templates/case-open/multi-req-epic.md`

## Guardrails

### フェーズ制約
- G01: ADR・specsの内容はIssue本文の生成に反映すること
- G02: Standard flowの動作・出力形式はEpic flow追加による影響を受けない

### 実行制約
- G03: 子Issue本文の先頭行に `Parent: #{epic_number}` を必ず含める（親子関係の追跡用）
- G04: 全子Issueの作成完了後にEpic本文のステータス追跡テーブルを更新する（部分更新は禁止）
- G05: 子Issueは最大10件まで（Epic 1件あたり）。Step 5 で子Issue数を確認し、超過時はEpic・子Issueいずれも作成せずエラーで停止
- G14: Wave単位のみの子Issue構造を作成してはならない。子Issueは必ずREQドキュメントと対応付けること
- G15: マルチREQ Epic flowは、複数REQドキュメント入力時またはdraft-metaに`scale: large`が設定されている場合にのみ実行する

### 品質ゲート
- G06: req-define未実行の場合は警告
- G07: 要件docのチェックボックスが空の場合は警告
- G08: featureの場合、対応するREQファイルが存在することを確認
- G09: テンプレートの【必須】セクションが全て本文に含まれていることを確認してからgh issue createを実行。欠落時は再生成
- G10: `完了条件` セクションはテンプレートの【必須】セクション。準拠検証で必ず確認

### 判断・承認制約
- G11: 単一REQ Epic flowは draft-metaの `scale: large` が明示的に設定されている場合のみ実行
- G16: マルチREQ Epic flowは複数REQドキュメント入力時またはdraft-metaに`scale: large`が設定されている場合のみ実行

### 委譲・参照制約
- G12: gh CLI出力を読み取る際は `agentdev-gh-cli` の安全な読み取り手順に従うこと
- G13: work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` → workflow classification を参照

### 出力制約
- G17: サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）

### Capture 非関与制約
- G18: case-open は intake / learning capture を行わない（SHALL）。capture 境界の詳細は `agentdev-workflow-orchestration` skill の `references/capture-boundaries.md` を参照
