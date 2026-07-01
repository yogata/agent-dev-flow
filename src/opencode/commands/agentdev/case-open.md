---
description: 要件定義をもとにGitHub Issueを作成する
agent: sisyphus
---

# Case登録

要件定義（req-define）の結果をもとにGitHub Issueを作成する。
①壁打ち→②構造的実行フェーズの境界。

**draft-data 入力**: case-open は構造化 `draft-data`（`# draft-data` fenced YAML block）を入力として読み取る。
draft 全体の `agreed_items`、`artifact_actions`、`operation_units` を処理対象とし、OU ごとにスライスせず draft 全体の合意結果を取り扱う。
`auto_gate.auto_ready` が false、または未解決質問、未解決衝突、repo外操作、停止理由が残る場合は停止する。
`conflict_resolutions` に記録済みの衝突については同じ内容をユーザーへ再確認しない。

## 入力

- req-defineで生成された要件doc（構造化 `draft-data` 形式。チェックボックス付き）

## 出力

- GitHub Issue（ラベル付き、要件doc埋め込み）

## project read contract

本コマンドは以下の6歩で docs を解決する（ADR-0133）。

1. `.agentdev/config.yaml` を読み込む
2. `.agentdev/read-contracts/commands/case-open.yaml` を読み込む
3. `must_read` に列挙された paths を読み込む
4. `conditional_read` の条件が該当する場合のみ、当該 paths を読み込む
5. read contract に列挙されていない `docs/specs/**` 内部パスを固定知識として読みに行かない
6. read contract が存在しない場合は `config.yaml` の `roots` と明示入力のみを使う

## 手順

### Step 1: 前工程からの引き継ぎ停止判定

要件docまたは RU に `agentdev_handoff: true` が含まれる場合、Issue を作成せず停止。
agent-dev-flow repository への手動取り込み対象として報告。
判定は `agentdev-workflow-lifecycle` に従う

**Step 1-1**: OU 選択ゲート（ドラフトに `operation_units` セクションがある場合、処理対象 OU を決定する）:
- OU ID が指定されている場合 → 指定された OU の req-save result を読み取り、その OU だけを Issue 化する
- OU ID 指定なし、OU 1 件 → その OU を自動選択して処理する
- OU ID 指定なし、OU 2 件以上 → OU 一覧（`ou_id`, `target_req`, `target_spec`, `operation`, `result`）を表示して停止する。ユーザーに OU ID の指定を求める。ただし独立 OU（`depends_on` 空、L0 相当）が複数含まれる場合は停止せず自動的に Epic Issue 化する（REQ-0114-088、Step 3-1 の自律構成生成へ分岐、独立 OU は Wave 1 に配置）
- `operation_units` セクションがない場合 → 従来どおり全要件docを処理する（後方互換）

### Step 2: 要件docからIssue本文を生成

詳細は `agentdev-issue-management` を参照。委譲接続点: サブエージェントはREQ読解、テンプレート充足検査、完了条件候補抽出のみを返し、親エージェントが本文確定とIssue作成を行う

**Step 2-1**: 完了条件網羅性検証（QG-2）。
Issue本文生成後、Issue作成前に、`agentdev-quality-gates` の QG-2（Acceptance Criteria Coverage Gate）に従い、完了条件が対象 REQ/ADR/SPEC の必達要件を網羅しているかを検証する。
判定基準、検査観点は同スキルの `.opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md` を参照。
fail 時は Issue 作成前に req-define 差し戻しを推奨

**Step 2-2**: test_strategy 埋め込み（REQ-0132-018）。
draft-data の `test_strategy` を読み取り、Issue 本文の「テスト戦略」セクションに埋め込む。
各項目を 3 要素構造（`verification`（検証手順）、`pass_criteria`（合格基準）、`on_failure`（不合格時の処置））で反映する。
3 要素のスキーマは req-define command SPEC（read contract 経由で解決）の「draft-data test_strategy フィールドスキーマ」に従う。
draft-data に `test_strategy` が未定義の場合は、テンプレートのプレースホルダをそのまま残す

### Step 3: マルチREQ入力判定

入力要件doc数を確認
- 単一REQ → Step 4
- 複数REQ または draft-meta `scale: large` → **マルチREQ Epic flow**（Step 5〜）
- **OU モード時**: Step 1-1 で選択した OU が複数または `scale: large` を含む場合 → Epic flow に分岐（Step 3-1 で自律的に構成を生成）

**Step 3-1**: 自律構成生成（OU モード、複数REQ時）。
ドラフトの `operation_units` セクションを読み取り、要件分析に基づいて Epic/ Wave/ Issue 構造を自律生成する。
req-define の出力（operation_units の `depends_on`, `recommended_order` 等）は参考情報とし、case-open が最終構造を決定する:
- 複数 OU が存在する場合、要件分析に基づいて Epic Issue および子 Issue 構造を生成する
- **独立 OU の自動 Epic 化（REQ-0114-088）**: 複数の独立 OU（`depends_on` 空、L0 相当）を検出した場合、自動的に Epic Issue 化し Wave 1 に全 OU を配置する。これにより Standard flow は「真に単一 OU のみ」に縮退し、Standard/Epic 二系統を単一 Wave 実行モデルに統一する。独立 OU が1件のみの場合は Standard flow（Epic 化しない、G20）
- **停止条件**: 要件が曖昧で Issue 構造を生成できない場合、または operation_units の要件に矛盾が含まれる場合は停止し、要件の明確化を求める
- **禁止事項**: 機能要件、非機能要件、制約、対象外、受け入れ条件を新規に作成しない。実装順序、Issue分解についてユーザー確認を求めない
- **Wave テーブル「実行方法」列の生成**: case-open は各子Issue の実行方法（並列/直列）を技術的依存関係レベルに基づいて Wave テーブルに明記する。判定基準は workflow-contracts SPEC（read contract 経由）Wave スケジューリングセクションの依存レベル定義に基づく:
 - L0（完全独立）、L1（Specs共有）→「並列」
 - L2（ファイル衝突）、L3（明示的依存）→「直列」

### Step 4: 規模判定（Step 3 で単一REQの場合）

- `scale: large` → **単一REQ Epic flow**（Step 5〜）
- `scale: standard`/ フィールドなし → **Standard flow**（Step 10〜）

**共通ルール**（全Step適用）:
- **VERIFY**: gh CLI書込後は毎回 `agentdev-gh-cli` の VERIFY操作に従い検証
- **テンプレート準拠**: テンプレート読込後は毎回【必須】セクションの完備を確認（【任意】は内容がある場合のみ含める）、欠落時は再生成

### Step 5: テンプレート読込（Epic flow）

`agentdev-workflow-templates` の選定ルールに従いテンプレートを読み込む。詳細は `agentdev-issue-management` を参照

Epic flow は Step 3 または Step 4 のルーティングにより開始。マルチREQ/ 単一REQ の差分:

| 差分項目 | マルチREQ | 単一REQ |
|----------|-----------|---------|
| 分解ソース | 各REQ doc単位 | draft-meta `decomposition` |
| Waveテーブル列 | Wave/Issue/実行方法/前提/対象REQ | Wave/Issue/実行方法/前提 |
| 子Issue数上限 | G15（最大10） | G05（最大10） |
| 子Issue内容ソース | 各REQ docから生成 | decomposition内容から生成 |
| 子Issue追加要素 | Wave番号+依存記載、REQ doc番号明示（traceability）、孫Issue判定 | なし |

### Step 6: Epic Issue本文を生成（Epic flow）

Step 3-1 の自律構成分析結果（Epic/ Wave/ Issue 構造、依存関係）に基づいて Epic 本文を構築する。
詳細は `agentdev-issue-management` を参照。
委譲接続点: サブエージェントは分解候補、依存候補、子Issue数検査を pass/warn/fail/partial で返し、親エージェントがEpic本文と停止判断を確定する

### Step 7: Epic Issueを作成（Epic flow）

- ラベル: `enhancement`, `feature`, `epic`
- Issue 作成手続き（`agentdev-gh-cli`）で本文を書き込み → VERIFY。Issue番号を `{epic_number}` として記録

### Step 8: 子Issueを作成（Epic flow）

Issue 化単位は REQ doc 単位ではなく OU 単位とする。
子Issue 本文案作成、検査、Issue 作成は最大5件まで並列化できる（REQ-0114-089、Epic Wave Model の最大5件上限に準拠）。
Epic Issue 作成、Wave 1 配置、Epic 本文ステータス追跡テーブル更新は親が直列集約する（REQ-0114-093）。
G04「全子Issue 作成完了後にテーブル更新（部分更新禁止）」は集約更新で維持する。
詳細は `agentdev-issue-management` を参照。
委譲接続点: サブエージェントは子Issue本文候補とテンプレート充足検査のみを返し、親エージェントが `gh` 実行とVERIFYを行う

**前工程完了度属性の埋め込み（REQ-0146-011）**: 各子 Issue 本文の「## 補足情報」セクションに「前工程完了度」属性を埋め込むこと。
属性値は epic-wave-model SPEC（read contract 経由）の「前工程完了度3段階分類（REQ-0146-010）」に従い、operation_units の `operation` 値（create/append/update/spec-create/spec-update）や artifact_actions の内容から判定する。
3段階: 完全完了（req-save/spec-save 完了、追加作業不要）/ 検証のみ（acceptance criteria 順位検証のみ実施）/ 補完あり（前工程に残余あり、補完実装の可能性）。

### Step 9: Epic Issue本文を更新（Epic flow）

詳細は `agentdev-issue-management` を参照。委譲接続点: サブエージェントは置換漏れ検査のみを返し、親エージェントが本文更新とVERIFYを行う

**Step 9-1**: OU 結果の書き戻し（ドラフトに `operation_units` セクションがある場合、作成した Issue/ Epic 番号を当該 OU の `result` に書き戻す）

**Epic flow 完了後、共通終了処理（Step 13〜15）を必ず実行すること。**

### Step 10: 関連ADR特定（Standard flow）

`docs/adr/README.md` から関連ADRを特定（単一REQ Epic flowの内容反映にも活用）

### Step 11: ラベル付与（Standard flow）

`agentdev-workflow-lifecycle` に従う

### Step 12: GitHub Issue作成（Standard flow）

Issue 作成手続き（`agentdev-gh-cli`）→ VERIFY

**Step 12-1**: OU 結果の書き戻し（Standard flow）。ドラフトに `operation_units` セクションがある場合、作成した Issue 番号を当該 OU の `result` に書き戻す

### Step 13: コメント追加（共通終了処理）

`agentdev-workflow-templates` の選定ルールに従いコメント用テンプレートを読み込む（Epic flowではEpic Issueにコメント追加）→ VERIFY

### Step 14: ドラフト削除（共通終了処理）

ドラフトが存在する場合、`.agentdev/drafts/req-draft-{topic-slug}.md` を削除（Standard/ Epic 全フロー共通）。
削除は並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、`git rm <draft-path>` で明示パスをステージし、同一ステップ内で `git commit -- <draft-path>` により即時コミットする（Form Zero）。
未ステージの削除を作業ツリーに残存させないこと

**Step 14-1**: RU ファイル削除（Standard/ Epic 全フロー共通）。
詳細は `agentdev-req-file-manager` を参照。
委譲接続点。
親エージェントのみが削除、同期確認を行う。
サブエージェントへ委譲する場合は削除対象候補の抽出までとする。
削除は並列実行安全ステージングプロシージャに従い `git rm <RU-path>` で明示パスをステージし、同一ステップ内で `git commit -- <RU-path>` により即時コミットする（Form Zero）

**Step 14-2**: draft/ RU 削除残存検証（Standard/ Epic 全フロー共通）。
Step 14/ 14-1 の削除後、当該ファイルが作業ツリー、index に残存していないことを検証する（`git status --porcelain -- <draft-path> <RU-path>` が空であること、またはファイル非存在確認）。
残存を検出した場合、即座に停止し残存ファイル一覧を報告する。
本検証は Standard flow と Epic flow の双方で実施する（Epic flow 限定のクリーンアップ検証ゲートを Standard flow にも拡張）

**Step 14-3**: draft/ RU 削除 commit 後の即時 push（REQ-0146-003）。
Step 14/ 14-1 の削除コミット後に `git push` を即時実行する。
case-run 引き継ぎ時の `git pull --ff-only` 失敗を防止するため、削除 commit と Issue 作成、完了報告の中間で作業ツリー状態を origin に確定させる。
push 失敗時は構造化エラーメッセージを表示して停止する

### Step 15: 完了報告（共通終了処理）

テンプレート種別:
- Standard → `templates/case-open/standard.md`
- 単一REQ Epic → `templates/case-open/epic.md`
- マルチREQ Epic → `templates/case-open/multi-req-epic.md`

## ガードレール

### フェーズ制約
- G01: ADR、specsの内容はIssue本文の生成に反映すること
- G02: Standard flowの動作、出力形式はEpic flow追加による影響を受けない

### 実行制約
- G03: 子Issue本文の先頭行に `Parent: #{epic_number}` を必ず含める（親子関係の追跡用）
- G04: 全子Issueの作成完了後にEpic本文のステータス追跡テーブルを更新する（部分更新は禁止）
- G05: 子Issueは最大10件まで（Epic 1件あたり）。Step 8 で子Issue数を確認し、超過時はEpic、子Issueいずれも作成せずエラーで停止
- G14: Wave単位のみの子Issue構造を作成してはならない。子Issueは必ずREQドキュメントと対応付けること
- G15: マルチREQ Epic flowは、複数REQドキュメント入力時またはdraft-metaに`scale: large`が設定されている場合にのみ実行する

### 品質ゲート
- G06: req-define未実行の場合は警告
- G07: 要件docのチェックボックスが空の場合は警告
- G08: featureの場合、対応するREQファイルが存在することを確認
- G09: テンプレートの【必須】セクションが全て本文に含まれていることを確認してから Issue 作成手続き（`agentdev-gh-cli`）を実行。欠落時は再生成
- G10: `完了条件` セクションはテンプレートの【必須】セクション。準拠検証で必ず確認

### 判断、承認制約
- G11: 単一REQ Epic flowは draft-metaの `scale: large` が明示的に設定されている場合のみ実行
- G16: マルチREQ Epic flowは複数REQドキュメント入力時またはdraft-metaに`scale: large`が設定されている場合のみ実行

### 委譲、参照制約
- G12: gh CLI出力を読み取る際は `agentdev-gh-cli` の安全な読み取り手順に従うこと
- G13: work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照

### 出力制約
- G17: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

 ### Capture 非関与制約
- G18: case-open は intake/ learning capture を行わない。capture 境界の詳細は `agentdev-workflow-orchestration` を参照

### OU 処理制約
- G19: case-open は自律的な要件分析に基づいて Epic Issue を作成すること。ただし機能要件、非機能要件、対象外、受け入れ条件を新規に作成しないこと
- G20: case-open は複数 OU が存在する場合、要件分析に基づいて Epic Issue および子 Issue 構造を生成すること。単一 Issue で完結する場合は Epic を作成しないこと
- G21: case-open の Issue 化単位は REQ doc 単位ではなく OU 単位とすること
- G22: case-open の capture 責務は非関与。intake/ learning capture を行わない。境界の詳細は `agentdev-workflow-orchestration/references/capture-boundaries.md` 参照

### 並列実行安全 git 操作制約
- G23: 共有作業ツリーでスイープ操作（`git add -A`/ `git add .`/ `git add --all`/ `git commit -a`/ `git checkout .`/ `git reset --hard`/ `git stash`/ 非所有パスへの `git checkout -- <path>`/ `git restore <path>`）を実行しないこと。`agentdev-git-worktree` の並列実行安全ステージングプロシージャに従うこと
- G24: ステージ、コミットは明示パス指定（`git add <path>`/ `git rm <path>`）+ `git commit -- <paths>`（--only pathspec 形式）で行い、共有 index の他セッション変更を排出しないこと。draft/ RU の削除は同一ステップで即時ステージ、コミットし未ステージ残存を許さないこと（Form Zero）。`git add` は `.agentdev/` 全体の一括スコープではなく明示パスに限定すること



