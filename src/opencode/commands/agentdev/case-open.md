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

0. **upstream handoff 停止判定**: 要件docまたは RU に `apply_in_current_project: false` が含まれる場合、Issue を作成せず停止。agent-dev-flow repository への手動取り込み対象として報告。判定は `agentdev-workflow-lifecycle` skill の upstream handoff protocol に従う

0-1. **OU 選択ゲート**: ドラフトに `operation_units` セクションがある場合、処理対象 OU を決定する（REQ-0104-035〜037）:
     - OU ID が指定されている場合 → 指定された OU の req-save result を読み取り、その OU だけを Issue 化する
     - OU ID 指定なし・OU 1 件 → その OU を自動選択して処理する
     - OU ID 指定なし・OU 2 件以上 → OU 一覧（`ou_id`, `target_req`, `operation`, `result`）を表示して停止する。ユーザーに OU ID の指定を求める
     - `operation_units` セクションがない場合 → 従来どおり全要件docを処理する（後方互換）

1. 要件docからIssue本文を生成。詳細は `agentdev-workflow-lifecycle` skill の Issue 生成プロトコル を参照。委譲接続点: サブエージェントはREQ読解・テンプレート充足検査・完了条件候補抽出のみを返し、親エージェントが本文確定とIssue作成を行う

2. **マルチREQ入力判定**: 入力要件doc数を確認
   - 単一REQ → Step 3
   - 複数REQ または draft-meta `scale: large` → **マルチREQ Epic flow**（Step 4〜）
   - **OU モード時**: Step 0-1 で選択した OU が複数または `scale: large` を含む場合 → `execution_groups` 検証（Step 2-1）を経て Epic flow に分岐

3. **規模判定**（Step 2で単一REQの場合）:
   - `scale: large` → **単一REQ Epic flow**（Step 4〜）
   - `scale: standard` / フィールドなし → **Standard flow**（Step 14〜）

2-1. **execution_groups 検証**（OU モード・複数REQ時）: ドラフトの `execution_groups` セクションを読み取り、Epic 候補の根拠を検証する（REQ-0104-039）:
   - 各 execution_group の `rationale` が明示されている場合 → Epic / child Issue を作成
   - `rationale` が空・矛盾している場合 → Epic 化せず、停止または単体 Issue 化
   - **独自推論禁止**: `execution_groups` の提案に基づかない独自推論で Epic Issue を作成しない（REQ-0104-040）
   - 複数 OU であることだけを理由に Epic Issue を作成しない（REQ-0104-041）

**共通ルール**（全Step適用）:
- **VERIFY**: gh CLI書込後は毎回 `agentdev-gh-cli` の VERIFY操作（Section 5-8）に従い検証
- **テンプレート準拠**: テンプレート読込後は毎回【必須】セクションの完備を確認（【任意】は内容がある場合のみ含める）、欠落時は再生成

### Epic flow（Step 4〜8）

Epic flow は Step 2 または Step 3 のルーティングにより開始。マルチREQ / 単一REQ の差分:

| 差分項目 | マルチREQ | 単一REQ |
|----------|-----------|---------|
| 分解ソース | 各REQ doc単位 | draft-meta `decomposition` |
| Waveテーブル列 | Wave/Issue/実行方法/前提/対象REQ | Wave/Issue/実行方法/前提 |
| 子Issue数上限 | G15（最大10） | G05（最大10） |
 | 子Issue内容ソース | 各REQ docから生成 | decomposition内容から生成 |
| 子Issue追加要素 | Wave番号+依存記載、REQ doc番号明示（traceability）、孫Issue判定 | なし |

4. テンプレート `issue_desc_epic.md` を Read tool で読み込む。詳細は `agentdev-workflow-lifecycle` skill の Issue 生成プロトコル を参照

5. Epic Issue本文を生成。`execution_groups` セクションから Epic 候補グループの根拠を読み取る（REQ-0104-039）。詳細は `agentdev-workflow-lifecycle` skill の Issue 生成プロトコル を参照。委譲接続点: サブエージェントは分解候補・依存候補・子Issue数検査を pass/warn/fail/partial で返し、親エージェントがEpic本文と停止判断を確定する

6. Epic Issueを作成:
   - ラベル: `enhancement`, `feature`, `epic`
   - `--body-file` 使用 → VERIFY。Issue番号を `{epic_number}` として記録

7. 子Issueを作成（OU 単位・順次処理）。Issue 化単位は REQ doc 単位ではなく OU 単位とする（REQ-0104-042）。詳細は `agentdev-workflow-lifecycle` skill の Issue 生成プロトコル を参照。委譲接続点: サブエージェントは子Issue本文候補とテンプレート充足検査のみを返し、親エージェントが `gh` 実行とVERIFYを行う

8. Epic Issue本文を更新。詳細は `agentdev-workflow-lifecycle` skill の Issue 生成プロトコル を参照。委譲接続点: サブエージェントは置換漏れ検査のみを返し、親エージェントが本文更新とVERIFYを行う

8-1. **OU 結果の書き戻し**: ドラフトに `operation_units` セクションがある場合、作成した Issue / Epic 番号を当該 OU の `result` に書き戻す（REQ-0104-038）

### Standard flow + 共通終了（Step 14〜）

14. **[Standard]** `docs/adr/README.md` から関連ADRを特定（単一REQ Epic flowの内容反映にも活用）
15. **[Standard]** ラベル付与 → `agentdev-workflow-lifecycle` ラベル体系に従う
16. **[Standard]** GitHub Issue作成（`gh issue create`）→ `--body-file` → VERIFY

16-1. **[Standard] OU 結果の書き戻し**: ドラフトに `operation_units` セクションがある場合、作成した Issue 番号を当該 OU の `result` に書き戻す（REQ-0104-038）

17. コメント追加: テンプレート `issue_comment_bug_analysis.md`（バグ・軽微変更等）または `issue_comment_feature_technical.md`（機能追加）読込（Epic flowではEpic Issueにコメント追加）→ VERIFY

 18. ドラフトが存在する場合、`.sisyphus/drafts/req-draft-{topic-slug}.md` を削除

 18-1. **RU ファイル削除**。詳細は `agentdev-workflow-lifecycle` skill の Issue 生成プロトコル を参照。委譲接続点: 親エージェントのみが削除・同期確認を行う。サブエージェントへ委譲する場合は削除対象候補の抽出までとする

18-2. 完了報告 → template variant:
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
- G17: 成果物本文（Issue本文・PR本文・commit message・保存対象ファイル本文・テンプレート成果物）はverbatimで返す。判定結果・調査過程・中間ログ・読解メモは要約・成果物パス・根拠・親判断事項・capture候補へ圧縮して返す

 ### Capture 非関与制約
- G18: case-open は intake / learning capture を行わない。capture 境界の詳細は `agentdev-workflow-orchestration` を参照

### OU 処理制約
- G19: case-open は `execution_groups` の提案に基づかない独自推論で Epic Issue を作成しないこと（REQ-0104-040）
- G20: case-open は複数 OU であることだけを理由に Epic Issue を作成しないこと（REQ-0104-041）。REQ-0104-029（複数REQ doc → Epic）は本要件により狭義化される
- G21: case-open の Issue 化単位は REQ doc 単位ではなく OU 単位とすること（REQ-0104-042）
