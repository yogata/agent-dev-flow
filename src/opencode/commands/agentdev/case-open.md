---
description: 要件定義をもとにGitHub Issueを作成する
agent: sisyphus
---

# Case登録

要件定義（req-define）の結果をもとにGitHub Issueを作成する。①壁打ち→②構造的実行フェーズの境界。

## Input

- req-defineで生成された要件doc（チェックボックス付き）

## Output

- GitHub Issue（ラベル付き、要件doc埋め込み）

## Steps

0. **upstream handoff 停止判定**: 要件docまたは RU に `agentdev_handoff: true` が含まれる場合、Issue を作成せず停止。agent-dev-flow repository への手動取り込み対象として報告。判定は `agentdev-workflow-lifecycle` に従う

0-1. **OU 選択ゲート**: ドラフトに `operation_units` セクションがある場合、処理対象 OU を決定する（REQ-0104-035〜037）:
     - OU ID が指定されている場合 → 指定された OU の req-save result を読み取り、その OU だけを Issue 化する
     - OU ID 指定なし・OU 1 件 → その OU を自動選択して処理する
     - OU ID 指定なし・OU 2 件以上 → OU 一覧（`ou_id`, `target_req`, `target_spec`, `operation`, `result`）を表示して停止する。ユーザーに OU ID の指定を求める
     - `operation_units` セクションがない場合 → 従来どおり全要件docを処理する（後方互換）

1. 要件docからIssue本文を生成。詳細は `agentdev-issue-management` を参照。委譲接続点: サブエージェントはREQ読解・テンプレート充足検査・完了条件候補抽出のみを返し、親エージェントが本文確定とIssue作成を行う

   **1-1. 完了条件網羅性検証（QG-2）**: Issue本文生成後・Issue作成前に、`agentdev-quality-gates` の QG-2（Acceptance Criteria Coverage Gate）に従い、完了条件が対象 REQ/ADR/SPEC の必達要件を網羅しているかを検証する。判定基準・検査観点は同スキルの `.opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md` を参照。fail 時は Issue 作成前に req-define 差し戻しを推奨

2. **マルチREQ入力判定**: 入力要件doc数を確認
   - 単一REQ → Step 3
   - 複数REQ または draft-meta `scale: large` → **マルチREQ Epic flow**（Step 4〜）
   - **OU モード時**: Step 0-1 で選択した OU が複数または `scale: large` を含む場合 → Epic flow に分岐（Step 2-1 で自律的に構成を生成）

3. **規模判定**（Step 2で単一REQの場合）:
   - `scale: large` → **単一REQ Epic flow**（Step 4〜）
   - `scale: standard` / フィールドなし → **Standard flow**（Step 14〜）

2-1. **自律構成生成**（OU モード・複数REQ時）: ドラフトの `operation_units` セクションを読み取り、要件分析に基づいて Epic / Wave / Issue 構造を自律生成する（REQ-0104-039, REQ-0132-007）。req-define の出力（operation_units の `depends_on`, `recommended_order` 等）は参考情報とし、case-open が最終構造を決定する:
   - 複数 OU が存在する場合、要件分析に基づいて Epic Issue および子 Issue 構造を生成する（REQ-0104-041）
   - **停止条件**: 要件が曖昧で Issue 構造を生成できない場合、または operation_units の要件に矛盾が含まれる場合は停止し、要件の明確化を求める（REQ-0132-010）
   - **禁止事項**: 機能要件・非機能要件・制約・対象外・受け入れ条件を新規に作成しない（REQ-0132-009, REQ-0104-040）。実装順序・Issue分解についてユーザー確認を求めない（REQ-0132-008）

**共通ルール**（全Step適用）:
- **VERIFY**: gh CLI書込後は毎回 `agentdev-gh-cli` の VERIFY操作に従い検証
- **テンプレート準拠**: テンプレート読込後は毎回【必須】セクションの完備を確認（【任意】は内容がある場合のみ含める）、欠落時は再生成

### Epic flow（Step 4〜8-1）

Epic flow は Step 2 または Step 3 のルーティングにより開始。マルチREQ / 単一REQ の差分:

| 差分項目 | マルチREQ | 単一REQ |
|----------|-----------|---------|
| 分解ソース | 各REQ doc単位 | draft-meta `decomposition` |
| Waveテーブル列 | Wave/Issue/実行方法/前提/対象REQ | Wave/Issue/実行方法/前提 |
| 子Issue数上限 | G15（最大10） | G05（最大10） |
 | 子Issue内容ソース | 各REQ docから生成 | decomposition内容から生成 |
| 子Issue追加要素 | Wave番号+依存記載、REQ doc番号明示（traceability）、孫Issue判定 | なし |

4. `agentdev-workflow-templates` の選定ルールに従いテンプレートを読み込む。詳細は `agentdev-issue-management` を参照

5. Epic Issue本文を生成。Step 2-1 の自律構成分析結果（Epic / Wave / Issue 構造・依存関係）に基づいて Epic 本文を構築する（REQ-0104-039, REQ-0132-007）。詳細は `agentdev-issue-management` を参照。委譲接続点: サブエージェントは分解候補・依存候補・子Issue数検査を pass/warn/fail/partial で返し、親エージェントがEpic本文と停止判断を確定する

6. Epic Issueを作成:
   - ラベル: `enhancement`, `feature`, `epic`
   - `--body-file` 使用 → VERIFY。Issue番号を `{epic_number}` として記録

7. 子Issueを作成（OU 単位・順次処理）。Issue 化単位は REQ doc 単位ではなく OU 単位とする（REQ-0104-042）。詳細は `agentdev-issue-management` を参照。委譲接続点: サブエージェントは子Issue本文候補とテンプレート充足検査のみを返し、親エージェントが `gh` 実行とVERIFYを行う

8. Epic Issue本文を更新。詳細は `agentdev-issue-management` を参照。委譲接続点: サブエージェントは置換漏れ検査のみを返し、親エージェントが本文更新とVERIFYを行う

8-1. **OU 結果の書き戻し**: ドラフトに `operation_units` セクションがある場合、作成した Issue / Epic 番号を当該 OU の `result` に書き戻す（REQ-0104-038）

**Epic flow 完了後、共通終了処理（Step 17〜18-2）を必ず実行すること。**

### Standard flow（Step 14〜16-1）

14. **[Standard]** `docs/adr/README.md` から関連ADRを特定（単一REQ Epic flowの内容反映にも活用）
15. **[Standard]** ラベル付与 → `agentdev-workflow-lifecycle` に従う
16. **[Standard]** GitHub Issue作成（`gh issue create`）→ `--body-file` → VERIFY

16-1. **[Standard] OU 結果の書き戻し**: ドラフトに `operation_units` セクションがある場合、作成した Issue 番号を当該 OU の `result` に書き戻す（REQ-0104-038）

### 共通終了処理（全フロー共通・Step 17〜18-2）

17. コメント追加: `agentdev-workflow-templates` の選定ルールに従いコメント用テンプレートを読み込む（Epic flowではEpic Issueにコメント追加）→ VERIFY

 18. ドラフトが存在する場合、`.agentdev/drafts/req-draft-{topic-slug}.md` を削除（Standard / Epic 全フロー共通）

 18-1. **RU ファイル削除**（Standard / Epic 全フロー共通）。詳細は `agentdev-req-file-manager` を参照。委譲接続点: 親エージェントのみが削除・同期確認を行う。サブエージェントへ委譲する場合は削除対象候補の抽出までとする

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
- G13: work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照

### 出力制約
- G17: 成果物本文（Issue本文・PR本文・commit message・保存対象ファイル本文・テンプレート成果物）はverbatimで返す。判定結果・調査過程・中間ログ・読解メモは要約・成果物パス・根拠・親判断事項・capture候補へ圧縮して返す

 ### Capture 非関与制約
- G18: case-open は intake / learning capture を行わない。capture 境界の詳細は `agentdev-workflow-orchestration` を参照

### OU 処理制約
- G19: case-open は自律的な要件分析に基づいて Epic Issue を作成すること（REQ-0104-040）。ただし機能要件・非機能要件・対象外・受け入れ条件を新規に作成しないこと（REQ-0132-009）
- G20: case-open は複数 OU が存在する場合、要件分析に基づいて Epic Issue および子 Issue 構造を生成すること（REQ-0104-041）。単一 Issue で完結する場合は Epic を作成しないこと
- G21: case-open の Issue 化単位は REQ doc 単位ではなく OU 単位とすること（REQ-0104-042）
- G22: case-open の capture 責務は非関与。intake / learning capture を行わない。境界の詳細は `agentdev-workflow-orchestration/references/capture-boundaries.md` 参照
