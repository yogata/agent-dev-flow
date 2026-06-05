# Design Principles

本プロジェクトの設計判断の根拠を集約した前方視の指針。どう考えるかを記述し、実装の背景にある意図を明らかにする。

---

## 1. work_type 分類の存在理由

Issue の種別に応じて異なるワークフローを適用する。work_type と scale の組み合わせで workflow_route を導出する（REQ-0104）。

**bugfix** は既存機能の不具合修正であり、要件定義書（REQ）の作成を不要とする。バグ修正は観察可能な事実（再現手順・期待動作・実際動作）に基づいて完結するため、壁打ちによる要件形成が不要である。docs更新もスキップし、最小限の経路（req-define → case-open → case-run → case-close）で処理する。

**feature** は新しい振る舞いをシステムに導入するため、WHAT（要件）とHOW（実装）の分離が不可欠である。壁打ちフェーズでの要件形成、REQ/ADRファイルの保存、specs更新など、複数の確認ポイントを経由する経路（req-define → req-save → case-open → case-run → case-close）を辿る。

**maintenance** はリファクタリング・保守作業向けの軽量経路である。**docs_chore** はドキュメント・雑務向けの軽量経路である。

この分離の意図は、バグ修正のオーバーヘッドを最小化しつつ、機能追加の品質ゲートを確保することにある。

### work_type / scale / workflow_route 導出ルール

| work_type | scale | workflow_route | 経路 |
|---|---|---|---|
| bugfix | — | direct_case | req-define → case-open → case-run → case-close |
| feature | standard | req_backed_case | req-define → req-save → case-open → case-run → case-close |
| feature | large | epic_case | req-define → req-save → case-open（Epic）→ case-run（Wave）→ case-close |
| maintenance | — | direct_case | req-define → case-open → case-run → case-close |
| docs_chore | — | direct_case | req-define → case-open → case-run → case-close |

> **歴史的参照**: `Pattern A/B/C/D` は旧分類コード。新体系では `work_type`（bugfix/feature/maintenance/docs_chore）+ `scale` + `workflow_route` を使用する（REQ-0104, REQ-0112）。

---

## 2. 要件と仕様の分離理由

本プロジェクトでは要件（Requirements: WHAT）と仕様（Specifications: HOW）を明確に分離して管理する。

**要件（REQ）** はユーザーの関心を記述する。システムに対して何が期待されるか、どの条件を満たすべきかを規定する。要件は領域別の総体として管理し、実装の変化に依存しない安定的な参照点を提供する。

**仕様（docs/specs/）** は実装の現在の姿を記述する。システムの構造（system.md）、アーティファクト規約（patterns.md）、品質基準（quality-specs.md）、設計方針（design-principles.md）で構成する。仕様は実装とともに変化する「生きた文書」である。

この分離の意図は、変更チケット方式（変更の都度REQを作成）の問題を解決することにある。旧来の方式では同一領域の変更が複数REQに分散し、トレーサビリティが低下していた。領域別総体管理により、各領域の要件の全体像を常に維持できる。

---

## 3. バイブコーディングベースの設計判断

本プロジェクトはAIとの対話による開発（バイブコーディング）を前提として設計されている。

**実装先行の原則**: 多くの場合、実装が先に存在し、要件は事後的に記録される。壁打ちフェーズで合意形成を行い、構造的実行フェーズで構造的に実行し、完了時に要件を更新する。この順序は、AIとの対話的な開発において自然なフローである。

**SSoTの段階的遷移**: 情報の唯一の正しい源（SSoT）はフェーズごとに遷移する。壁打ちフェーズでは壁打ちの成果物、構造的実行フェーズではIssue本文とWork Plan、レビュー完了フェーズではPRとレビュー結果がSSoTとなる。固定的なSSoTではなく、開発の進行に合わせてSSoTを移行する設計は、対話的開発の変動性に対応するためである。

**エージェント責務の分離**: Prometheus（対話系・Plan策定）とSisyphus（実行系・ファイル操作）の2エージェント体制は、壁打ちフェーズと実行フェーズの認知負荷を分離するためである。対話系コマンドにPlanエージェントを使用すると計画作成指向のシステムプロンプトが干渉する問題から、エージェントの適切な使い分けが必要となった。

---

## 4. ツール選定の根拠

本プロジェクトのツールアーキテクチャはOpenCodeのCommands/Skills体系に基づいている。

**Commands**: ユーザーが起動する操作のエントリポイント。frontmatterでエージェント指定・スキル参照を宣言し、本文に手順を記述するスリムなdispatcherとして設計する。コマンド自体にロジックを持たせず、スキルから知識を参照する薄いラッパーとする。

**Skills**: 再利用可能な知識ベース。宣言的定義（フェーズ体系・判定基準・命名規則等）を提供し、手続き的ロジックは含まない。複数コマンドから参照可能な単一の真実の源として機能する。

この分離の意図は、**関心事の分離**にある。コマンドは「何を実行するか」の手順を定義し、スキルは「どう判断するか」の知識を提供する。これにより、新しいコマンドの追加時や既存コマンドの変更時に、スキル側の変更を最小限に抑えられる。

**gh CLI安全性**: Windows PowerShell環境での文字化け問題（UTF-8出力をShift-JISとして解釈）に対し、WRITE操作は`--body-file`経由、READ操作は一時ファイル経由でRead toolを使用する安全手順を強制する。これは環境固有の制約に対する実用的な回避策である。

**git worktree**: 並列開発の基盤として採用。Issue番号ベースの命名規則（`.worktrees/{N}-{type}`）により、複数Issueの同時進行を安全に管理する。worktreeにより作業ディレクトリを分離し、メインリポジトリへの誤操作を防止する。

---

## 5. Command / Skill / Template / Script の責任分界

アーティファクトの責務を4種に明確に分けることで、各要素の役割を曖昧さのないものにする。

**Command** は公開APIと高レベル実行骨格を担う。Input/Output/Guardrails/Stepsを定義し、詳細な判断はSkillへ、決定的処理はScriptへ委譲する。原則100行以内、Steps 5〜12個に抑える。150行超は分割検討、200行超はorchestration skill/references/scriptへの切り出しを必須検討する。

**Skill** は再利用可能な判断基準と大きな状態機械を担う。宣言的定義（判定基準・フォーマット・ポリシー・状態遷移）を提供し、Commandから一方向に参照される。`1 command = 1 orchestration skill` は原則とせず、大きな状態機械・再開ポイント・CI loop・Wave scheduling・サブエージェント protocol を持つ場合にのみ orchestration skill 化を認める。

**Template** は出力構造とプレースホルダーを担う。変数置換で使用し、ロジックは含まない。責任範囲に基づいて分散配置する。

**Script** は決定的でテスト可能な処理を担う。validation・transformation・generation・formatting等の純粋関数・決定的処理に限定し、非決定的な処理（API呼び出し・ユーザー対話）は含めない。

この分離の意図は、**Commandの肥大化防止**と**再利用性の最大化**にある。Commandが薄いdispatcherに徹することで、新しいCommandの追加・既存Commandの変更コストを最小化する。

### Command

**置くもの**:
- ユーザー向け入口
- Input / Output
- 高レベル Steps（5〜12個）
- 使用する Skill（Steps 内参照）
- 成果物の読み書き対象
- command 固有 Guardrails

**置かないもの**:
- 大きな状態機械
- 詳細な判定表
- schema
- template
- script
- 共通安全手順
- 複数 command で使う workflow protocol
- frontmatter の dev メタデータ（implementation_pattern, secondary_pattern, load_skills 等）

### Skill

**置くもの**:
- 再利用可能な判断基準
- domain knowledge
- workflow protocol
- safety protocol
- テンプレート選定ルール
- owner artifact の構造定義

### Template

**置くもの**:
- 出力構造
- 見出し
- 必須/任意マーカー
- プレースホルダー

### Script

**置くもの**:
- 採番
- validation
- INDEX 生成
- Markdown 更新
- 整合性チェック

### Orchestration skill 作成判断基準

`1 command = 1 orchestration skill` は原則としない。以下のいずれかを満たす場合にのみ orchestration skill 化を認める:

- 大きな状態機械を持つ
- 再開ポイント検出が必要
- CI loop を含む
- Wave scheduling を含む
- サブエージェント protocol を含む

詳細は `artifact-contracts.md`（REQ-0103）を参照。

---

## 6. Runtime / Authoring 関心分離

AgentDevFlow の配布物は runtime（個別プロジェクトで実行可能）と authoring（agent-dev-flow レポジトリ開発用）に明確に分離する（ADR-0013）。

**Runtime 配布物**は自己完結し、agent-dev-flow レポジトリの dev メタデータに依存しないことを保証する:
- Command frontmatter は `description` と `agent` のみ（REQ-0103-015, ADR-0013）
- Skill `references/` は runtime 配布物のみを含める（ADR-0018）
- `docs/specs/` は agent-dev-flow レポジトリ専用の repo-internal 設計文書であり、runtime 配布物の依存先ではない（ADR-0017, ADR-0018）

**Authoring 専用物**は agent-dev-flow レポジトリ内でのみ参照される:
- implementation_pattern 分類定義（design-principles.md）
- command-authoring / skill-authoring ガイド
- integrity-check の検査ルール定義

この分離の意図は、**runtime 配布物の移植性と安定性の確保**にある。個別プロジェクトが agent-dev-flow レポジトリの内部構造や開発用メタデータに依存することを防ぐ。
