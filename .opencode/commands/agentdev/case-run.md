---
description: 計画立案からコミットまでを一気通貫で実行する。3フェーズ構成でべき等性・再開ポイントを提供。複数Issueの並列実行に対応
agent: sisyphus
load_skills:
  - agentdev-req-analysis
  - agentdev-spec-compliance
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
  - agentdev-workflow-routing
  - agentdev-workflow-orchestration
  - agentdev-git-worktree
  - agentdev-gh-cli
  - agentdev-req-file-manager
  - agentdev-adr-file-manager
  - agentdev-conventional-commits
  - agentdev-epic-tracker
  - agentdev-workflow-templates
  - agentdev-no-ai-slop-writing
---

# 実装パイプライン

Caseに対して計画立案から実装・コミットまでを一気通貫で実行する。構造的実行フェーズ。常にgit worktreeを使用。

3フェーズ構成により、各フェーズは独立して再実行可能（べき等性）。フェーズ間でエラーが発生した場合、Step 0の再開判定から再開できる。

## Input

- Issue番号またはURL（要件doc埋め込み済み）
- ブランチ名（自動生成または指定）

## Output

- 実装済みブランチ、コミット履歴
- 乖離検出レポート（乖離があれば）
- GitHub PR（open状態、レビュー待ち）

## フェーズ構成

| フェーズ | Steps | 再開条件 |
|---|---|---|
| 準備フェーズ | 1-5 | worktree+ブランチが存在しない |
| 実装フェーズ | 6-7 | work planが未完了 または チェックボックス未完了 |
| 提出フェーズ | 8-12 | PRが未作成 |

## Steps

### Step 0: フェーズ判定（再開ポイント検出）

`agentdev-workflow-orchestration` の状態機械・再開ポイント検出に従い、再開が必要なフェーズを判定。Issue番号解決・引数パース・妥当性確認・実行パス分岐・成果物チェックの詳細は `agentdev-workflow-orchestration` に準拠。依存関係分析（多重Issueモード）およびWave スケジューリングも `agentdev-workflow-orchestration` に従い実行・構成。

- **再開ポイントの報告**: 再開が必要なフェーズをユーザーに通知。準備フェーズから開始する場合は省略

**Step 0 実行パス分岐**:

1. Issue番号を解決（既存）
2. 有効Issue ≥ 2件 → **多重Issueモード**（既存、変更なし）
3. 有効Issue = 1件 → Epic検出チェック:
   - Issue のラベルと本文を読み取り
   - `epic` ラベルが付与されている OR 本文に `## 実行順序` セクションと `Wave` 列を持つ Markdown テーブルが存在 → **Epic Orchestrator モード**
   - いずれにも該当しない → **単一 Issue パス**（既存、変更なし）
4. Epic Orchestrator モード → `agentdev-workflow-orchestration` の Epic Orchestrator 実行フローに従い実行

### 多重Issue実行フェーズ（多重Issueモード）

`agentdev-workflow-orchestration` のサブエージェント実行プロトコルに従い各Waveを実行。

### Epic Orchestrator 実行フェーズ（Epic Orchestratorモード）

`agentdev-workflow-orchestration` の Epic Orchestrator 実行フローに従い、Epic Issue を入力として子 Issue を Wave 順に subagent で実行する。

1. **Epic 本文読み取り・Wave 解析**: `agentdev-workflow-orchestration` の Epic検出ルール・Wave解析プロトコルに従い Wave テーブルを解析
2. **Wave 順次実行**: Wave 番号昇順で以下を繰り返す:
   - Epic ステータス一括更新（`agentdev-epic-tracker` 準拠）
   - 各子 Issue を subagent で起動（サブエージェント実行プロトコル準拠、specs 更新禁止）
   - Wave 完了待機 → 結果集約
   - `agentdev-workflow-orchestration` の Wave失敗時後続制御に従い後続 Wave の実行可否を判定
3. **全 Wave 完了後**: specs 更新（親エージェントのみ、直列）→ Epic Orchestrator 集約完了報告
4. **再開時**: Wave 1 から再評価。各子 Issue は既存 case-run のべき等性で再開ポイントを判定

### 準備フェーズ: 準備（Steps 1-5）

**べき等性**: worktreeとブランチが既に存在する場合、Step 5をスキップして実装フェーズへ移行。

**Step 1**: Issue本文から要件docと受け入れ基準を抽出 → `agentdev-req-analysis` のチェックボックス品質基準で検証

**Step 2**: `docs/specs/system.md` と `docs/specs/patterns.md` を読み込み、現在のシステム仕様と実装パターンを把握する。実装がspecsに矛盾しないことを確認する

**Step 3**: `docs/adr/README.md` を読み込み、要件と関連するADRを「対象領域」と「決定内容」でマッチングして特定する。関連ADRがあれば個別に読み込み、実装がADRの決定事項に矛盾しないことを確認する

**Step 4**: Pattern判定 → `agentdev-workflow-lifecycle` の Pattern Registry に従って Pattern A/B/C/D を判定し、以降のStepの分岐を決定（バグ修正・軽微変更/機能追加/リファクタリング・保守作業/ドキュメント・雑務）

**Step 5**: Worktree作成・ブランチ準備 → `agentdev-git-worktree` スキルに従って実行。`origin/main` をベースとして明示的に指定。べき等チェック: worktree既存時は作成スキップ

**Step 5b**: 親Epicステータス更新（`agentdev-epic-tracker` スキル参照）。子Issue本文から `Parent: #{N}` を検出し、該当行を `☐ 未着手` → `🔄 進行中` に更新。既に進行中/完了/対処不要の場合はスキップ。更新失敗時は警告表示して実装フェーズへ継続

### 実装フェーズ: 実装（Steps 6-7）

**べき等性**: work planが完了済みの場合、提出フェーズへ移行。部分的に完了している場合は未完了タスクから再開。

**Step 6**: work planを生成（@plan）→ 実行（/start-work）→ TDD実装
- 再開対応: `.sisyphus/plans/` に既存planファイルがある場合、plan再生成をスキップして未完了タスクから再開
- 関連ドキュメントの影響範囲探索を実装計画に含める（SHALL）
- `docs/DOC-MAP.md` を参照して関連ドキュメントを特定し、影響範囲探索に含める（REQ-0101）
- Issue本文に関連ドキュメント更新候補が存在する場合、それを実装計画および関連ドキュメント更新確認の対象に含める（SHALL — REQ-0102）
- 実装完了後、ローカル実装diff（`git diff origin/main...HEAD` または未コミット差分を含む作業差分）からキーワードを自動抽出し、`docs/specs/` で grep して矛盾する記述がないか自動確認すること（SHALL — REQ-0106, 008）
- 矛盾する記述が検出された場合、実装計画の関連ドキュメント更新確認の対象に含めること（SHALL — REQ-0106）

**Step 7**: 各タスク完了時にIssue本文のチェックボックスを `[ ]` → `[x]` に更新
- `gh issue edit --body-file` の実行結果を確認してから todo を completed にマークすること（SHALL — REQ-0106）
- todo の completed マークと `gh issue edit` の API 呼び出しを同一ツール呼び出しブロック内で実行すること（SHALL — REQ-0106）
- `gh issue edit` の実行が失敗した場合、該当チェックボックスを `[x]` に更新せず、エラーを表示して停止すること（SHALL — REQ-0106）
- テスト戦略検証・完了条件品質ゲートに基づき達成判定
- チェックボックス更新失敗時はエラー表示して停止
- 全チェックボックス完了確認後に提出フェーズへ移行
   - スコープ外の未完了チェックボックス（単一PR内で完結しない検証項目）をチェックボックス形式のまま残してはならない（MUST NOT — REQ-0105）
   - スコープ外項目を `> ℹ️ 別途確認: {項目名} — 今回の case-run 実装スコープ外。後続確認対象として残す。` に変換すること（SHALL — REQ-0105）

### 提出フェーズ: 提出（Steps 8-12）

**べき等性**: PR既存時はSteps 8-10をスキップし、Step 11cのみ再実行後Step 12へ。CI通過済みの場合はStep 12のみ実行。

**Step 8**: 実装完了後、乖離検出 → `agentdev-spec-compliance` に従ってチェック。品質メトリクス収集も併せて実行

**Step 9**: 乖離があれば報告 → `agentdev-spec-compliance` の報告フォーマットでユーザーに提示。乖離がある場合、ユーザーの指示を待機（自動修正禁止）。ユーザーが「継続」を選択した場合のみ次Stepへ

**Step 10**: specs更新・関連ドキュメント整合性確認（2つの独立した要件）:
   - **Pattern B（機能追加）専用要件**: `docs/specs/system.md` または `docs/specs/patterns.md` を更新する（SHALL）
   - **全パターン共通要件**: 実装によって仕様が変化した部分と矛盾する関連ドキュメントが存在する場合、同一Issue内で更新する（SHALL）
   - **DOC-MAP整合性**: `docs/DOC-MAP.md` を参照し、実装による仕様変更がDOC-MAPの記載と矛盾していないことを確認する（REQ-0101）
   - Issue本文に `## 関連ドキュメント更新候補` セクションが存在する場合、その候補を Step 10 の specs更新・関連ドキュメント整合性確認の対象に含める（REQ-0102）

**Step 10（多重Issueモード）**: `agentdev-workflow-orchestration` のSpecs更新直列化に従い、親エージェントのみが順次実行

**Step 10.5**: 本筋外 Finding の PR 本文記録（REQ-0106）
   - 実装・検証フェーズで発見した本筋外 Finding（intake 候補・learning 候補）を PR 本文の `## Findings / Intake候補` セクションに記録する（SHALL）
   - 各項目に以下を含める（SHALL）:
     - **発見元**: どの Step・どのファイルで発見したか
     - **内容**: 具体的な修正対象または再発防止知見
     - **分類**: intake 候補（具体的修正対象あり）/ learning 候補（再発防止知見）の区別
   - intake 候補と learning 候補を混ぜた単一エントリにしない（SHALL）— G17 に準拠
   - Finding が存在しない場合は「該当なし」とする（SHALL）
   - **直接変更禁止**: `.agentdev/intake/inbox/` を直接変更してはならない（SHALL）。永続化は PR 本文のみ（REQ-0106）

**Step 11**: ローカル検証 → PR作成 → デプロイ検証（3サブステップ構成）

- **11a: ローカル検証**（型チェック・Lint・ビルド・テスト・フォーマット・import不整合）
  - 検証成功時のみ11bへ進む
  - 検証失敗時: `agentdev-workflow-orchestration` のSelf-Healing Loopに従い自律修正

- **11b: PR作成**: `gh pr create` を `agentdev-gh-cli` に従って `--body-file` で実行。PR本文は `agentdev-workflow-templates` のPRテンプレートに従い、【必須】セクションが全て含まれることを確認。書き込み後にVERIFY操作で内容検証。べき等チェック: PR既存時は作成スキップして11cへ
  - **Findings / Intake候補セクションの非空検証**（REQ-0106）: PR本文の `## Findings / Intake候補` セクションが空でないことを確認してから `gh pr create` を実行する（SHALL）。「該当なし」または具体的な Finding 記述のいずれかが存在すること。セクション自体が欠落している場合はテンプレート不備としてエラー停止する
  - PR diff が取得可能な場合、ローカル diff 由来のキーワード抽出結果と矛盾しないかを確認してよい（MAY — REQ-0106）
  - PR diff で新規キーワードまたは未計画のスキーマ変更が見つかった場合、提出処理を進めず work plan / 関連ドキュメント確認へ戻すこと（SHALL — REQ-0106）

- **11c: デプロイ検証**: `agentdev-workflow-orchestration` のCI / Review 対応 Loopに従いデプロイ検証を実行。CI失敗時はSelf-Healing Loopに従い自律修正

**Step 11（多重Issueモード）**: 各サブエージェントがworktree内で11a〜11cを個別に実行。親エージェントは全サブエージェントのデプロイ検証完了を待機

**Step 11.5**: worktree クリーンアップ確認（SHALL, REQ-0106〜007）
   - worktree 内で `git status --short` を実行し、未コミット変更の有無を確認する
   - **未コミット変更あり**: 検出内容を報告し、ユーザーの指示に従う（SHALL, REQ-0106）。自動的な破棄・コミットは行わない
   - **未コミット変更なし**: そのまま Step 12 へ進む
   - .sisyphus/ の削除は行わない（SHALL, REQ-0106）— case-close で実施

**Step 12**: 完了報告 → `agentdev-workflow-reporting` の完了報告フォーマット（completion-reports.md → case-run 完了時）に従って出力

**Step 12（多重Issueモード）**: `agentdev-workflow-orchestration` の集約完了報告フォーマットで結果出力

## エラー処理

エラー発生時の対応は `agentdev-workflow-orchestration` のエラー回復マップに従う。各フェーズ境界が再開ポイントとなる。

- エラー発生時は即座に停止し、エラー内容と再開ポイントをユーザーに報告
- 自動リトライは同一入力の機械的再試行およびStep 11a/11cの自律修正ループのみ許可（要件変更・仕様判断を伴う修正は禁止）
- セッション途切れ時は再実行時にStep 0が自動的に再開ポイントを特定

## Guardrails

- G01: 壁打ち禁止（構造的実行フェーズ — 実装のみ）
- G02: 実装で判明した制約はREQを黙って変更せず、乖離として報告しユーザー承認後に反映する
- G03: 乖離の自動修正禁止（ユーザー決定）
- G04: 全ファイル操作はworktree内で実行
- G05: Issue番号省略は同一セッション内で作成済みの場合のみ
- G06: Issue番号の解決に `gh issue list` / `gh issue status` 等でopen issue一覧を取得することは禁止。番号はユーザー入力またはセッション内会話からのみ取得可能
- G07: Pattern B（機能追加）の場合、実装結果を `docs/specs/system.md` または `docs/specs/patterns.md` に反映すること — Step 10で更新
- G08: 全パターン共通: 関連ドキュメントの更新漏れは未完了事項と同等に扱う。変更後仕様と矛盾する関連ドキュメントが存在する場合、それを更新せずに提出フェーズへ移行してはならない（G07のspecs更新とは別条件）
- G09: 関連ドキュメントがreq-defineに明記されていないことを理由に、更新対象外としてはならない
- G10: Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → Pattern Registry を参照
- G11: 多重Issueユーザー入力上限は最大5 Issues/呼び出し（超過時は拒否メッセージを表示）。Epic Wave内同時実行上限は別ルール（G19）とする
- G12: specs更新は親エージェントのみ実行（サブエージェントはspecs更新禁止）
- PR本文・乖離検出報告のテンプレート【必須】セクション確認は各テンプレートに従う
- 完了判定はIssue本文の `完了条件` セクションを品質ゲートとして参照

### 本筋外発見の退避方針（REQ-0105 ~ 012）

実装・検証フェーズで本筋外の不整合・規約違反・小改善候補を発見した場合の取り扱い。`agentdev-workflow-lifecycle` → `reference/capture-boundaries.md` の Split Rule を SSoT とする。

- **G14: スコープ拡大禁止**: 作業中に本筋外の不整合・規約違反・小改善候補を見つけた場合、現在の完了条件を拡大して修正してはならない（SHOULD / MUST NOT）。発見は記録し、修正は後続処理に委ねる
- **G15: intake 候補の記録**: 本筋外の発見のうち、具体的な修正対象が特定できるものを intake 候補として記録する（SHOULD）。case-close の post-run capture または `/agentdev/intake-capture` が後続処理として拾える導線を持つ。**直接変更禁止**: `.agentdev/intake/inbox/` を直接変更せず、PR 本文の `## Findings / Intake候補` セクションに永続化する（SHALL, REQ-0106）
- **G16: learning 候補の区別**: 作業中の失敗・回避・判断ミス・手順漏れを learning 候補として intake 候補と区別して記録する（SHOULD）
- **G17: 成果物の分離**: intake 候補と learning 候補を混ぜた単一成果物にしてはならない（SHALL）。両方がある場合は `capture-boundaries.md` の Split Rule（具体的修正対象 → intake item、再発防止知見 → learning item、両方 → 分割）に従い別々の成果物とする
- G18: Epic Orchestrator モードは追加モードであり、既存の単一 Issue パスおよび多重 Issue モードを置き換えない（REQ-0106）
- G19: 1 Wave 内の同時実行子 Issue 上限は5件。超過時は Wave を自動分割する（REQ-0106）
