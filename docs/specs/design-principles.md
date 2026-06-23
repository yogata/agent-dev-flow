# 設計原則

本プロジェクトの設計判断の根拠を集約した前方視の指針。どう考えるかを記述し、実装の背景にある意図を明らかにする。

---

## 1. work_type 分類の存在理由

Issue の種別に応じて異なるワークフローを適用する。work_type と scale の組み合わせで workflow_route を導出する（REQ-0104）。

**bugfix** は既存機能の不具合修正であり、要件定義書（REQ）の作成を不要とする。バグ修正は観察可能な事実（再現手順、期待動作、実際動作）に基づいて完結するため、壁打ちによる要件形成が不要である。ただし影響を受ける docs（REQ/ADR/SPEC/guide）の更新は完了条件に含まれる（REQ-0104-034）。最小限の経路（req-define → case-open → case-run → case-close）で処理する。

**feature** は新しい振る舞いをシステムに導入するため、WHAT（要件）と HOW（実装）の分離が必要である。壁打ちフェーズでの要件形成、REQ/ADR ファイルの保存、specs 更新など、複数の確認ポイントを経由する経路（req-define → req-save → spec-save（SPEC 候補がある場合）→ case-open → case-run → case-close）を辿る。

**maintenance** はリファクタリング、保守作業向けの軽量経路である。**docs_chore** はドキュメント、雑務向けの軽量経路である。

この分離の意図は、バグ修正のオーバーヘッドを最小化しつつ、機能追加の品質ゲートを確保することにある。

### work_type / scale / workflow_route 導出ルール

| work_type | scale | workflow_route | 経路 |
|---|---|---|---|
| bugfix | - | direct_case | req-define → case-open → case-run → case-close |
| feature | standard | req_backed_case | req-define → req-save → spec-save（SPEC 候補がある場合）→ case-open → case-run → case-close |
| feature | large | epic_case | req-define → req-save → spec-save（SPEC 候補がある場合）→ case-open（Epic）→ case-run（Wave）→ case-close |
| maintenance | - | direct_case | req-define → case-open → case-run → case-close |
| docs_chore | - | direct_case | req-define → case-open → case-run → case-close |

---

## 2. 要件と仕様の分離理由

本プロジェクトでは要件（Requirements: WHAT）と仕様（Specifications: HOW）を明確に分離して管理する。

**要件（REQ）** はユーザーの関心を記述する。システムに対して何が期待されるか、どの条件を満たすべきかを規定する。要件は領域別の総体として管理し、実装の変化に依存しない安定的な参照点を提供する。

**仕様（docs/specs/）** は実装の現在の姿を記述する。システムの構造（system.md）、アーティファクト規約（patterns.md）、品質基準（quality-specs.md）、設計方針（design-principles.md）で構成する。仕様は実装とともに変化する「生きた文書」である。

この分離の意図は、変更チケット方式（変更の都度 REQ を作成）の問題を解決することにある。旧来の方式では同一領域の変更が複数 REQ に分散し、トレーサビリティが低下していた。領域別総体管理により、各領域の要件の全体像を常に維持できる。

### ADR 判断漏れ（false negative）基準

ADR 対象となる判断を REQ/SPEC/guide のみとして扱う判断漏れ（false negative）を防ぐため、以下のリスク指標に該当する内容は ADR 必要性を再評価すること（推奨、REQ-0112-058）。

- REQ/SPEC 境界の曖昧な内容: WHAT と HOW の分離だけでは判断理由が保存されず、後続変更で根拠が失われる可能性がある
- 複数モジュールにまたがる判断: command / skill / script / docs など複数の責務境界に影響し、局所仕様だけではトレードオフを説明できない
- 長期間有効な技術選定: 一時的な仕様ではなく、将来の実装、運用判断を拘束する選定である

予防策として、req-define / req-save は ADR 不要と判断した場合でも除外基準と根拠事実を記録すること。上記リスク指標のいずれかに該当する場合、`agentdev-adr-guidelines` の閾値と除外基準を再適用し、ADR 不要の理由が技術判断不在、仕様変更のみ等に明確に該当することを確認すること。

---

## 3. バイブコーディングベースの設計判断

本プロジェクトは AI との対話による開発（バイブコーディング）を前提として設計されている。

**実装先行の原則**: 多くの場合、実装が先に存在し、要件は事後的に記録される。壁打ちフェーズで合意形成を行い、構造的実行フェーズで構造的に実行し、完了時に要件を更新する。この順序は、AI との対話的な開発で自然なフローである。

**SSoT の段階的遷移**: 唯一の情報源（SSoT）はフェーズごとに遷移する。壁打ちフェーズでは壁打ちの成果物、構造的実行フェーズでは Issue 本文と Work Plan、レビュー完了フェーズでは PR とレビュー結果が SSoT となる。固定的な SSoT ではなく、開発の進行に合わせて SSoT を移行する設計は、対話的開発の変動性に対応するためである。

**エージェント責務の分離**: Prometheus（対話系、Plan 策定）と Sisyphus（実行系、ファイル操作）の 2 エージェント体制は、壁打ちフェーズと実行フェーズの認知負荷を分離するためである。対話系コマンドに Plan エージェントを使用すると計画作成指向のシステムプロンプトが干渉する問題から、エージェントの適切な使い分けが必要となった。

---

## 4. ツール選定の根拠

本プロジェクトのツールアーキテクチャは OpenCode の Commands/Skills 体系に基づいている。

**Commands**: ユーザーが起動する操作のエントリポイント。frontmatter でエージェント指定、スキル参照を宣言し、本文に手順を記述する薄いディスパッチャーとして設計する。コマンドはスキルから知識を参照する薄いラッパーとし、ロジックは Command 本体に持たない。

**Skills**: 再利用可能な知識ベース。宣言的定義（フェーズ体系、判定基準、命名規則等）を提供し、手続き的ロジックは含まない。複数コマンドから参照可能な唯一の情報源として機能する。

この分離の意図は、**関心事の分離**にある。コマンドは「何を実行するか」の手順を定義し、スキルは「どう判断するか」の知識を提供する。これにより、新しいコマンドの追加時や既存コマンドの変更時に、スキル側の変更を最小限に抑えられる。

**gh CLI 安全性**: Windows PowerShell 環境での文字化け問題（UTF-8 出力を Shift-JIS として解釈）に対し、WRITE 操作は `--body-file` 経由、READ 操作は一時ファイル経由で Read tool を使用する安全手順を強制する。これは環境固有の制約に対する実用的な回避策である。

**git worktree**: 並列開発の基盤として採用。Issue 番号ベースの命名規則（`.worktrees/{N}-{type}`）により、複数 Issue の同時進行を安全に管理する。worktree により作業ディレクトリを分離し、メインリポジトリへの誤操作を防止する。

---

## 5. Command / Skill / Template / Script の責任分界

アーティファクトの責務を 4 種に明確に分けることで、各要素の役割を曖昧さのないものにする。

**Command** は公開 API と高レベル実行骨格を担う。Input/Output/Guardrails/Steps を定義し、詳細な判断は Skill へ、決定的処理は Script へ委譲する。原則 100 行以内、Steps 5〜12 個に抑える。150 行超は分割検討、200 行超は統率スキル（orchestration skill）/references/script への切り出しを必須検討する。

**Skill** は再利用可能な判断基準と大きな状態機械を担う。宣言的定義（判定基準、フォーマット、ポリシー、状態遷移）を提供し、Command から一方向に参照される。統率スキル（orchestration skill）は、大きな状態機械、再開ポイント、CI ループ、Wave スケジューリング、サブエージェントプロトコルを持つ場合にのみ作成を認める（`1 command = 1 orchestration skill` は原則としない）。

**Template** は出力構造とプレースホルダーを担う。変数置換で使用し、ロジックは含まない。責任範囲に基づいて分散配置する。

**Script** は決定的でテスト可能な処理を担う。validation、transformation、generation、formatting 等の純粋関数、決定的処理に限定し、非決定的な処理（API 呼び出し、ユーザー対話）は含めない。

この分離の意図は、**Command の肥大化防止**と**再利用性の最大化**にある。Command が薄いディスパッチャーに徹することで、新しい Command の追加、既存 Command の変更コストを最小化する。

### Command

**置くもの**:
- ユーザー向け入口
- Input / Output
- 高レベル Steps（5〜12 個）
- 使用する Skill（Steps 内参照）
- 成果物の読み書き対象
- command 固有 Guardrails

**置かないもの**:
- 大きな状態機械
- 詳細な判定表
- スキーマ
- テンプレート
- スクリプト
- 共通安全手順
- 複数 command で使う ワークフロープロトコル
- frontmatter の dev メタデータ

### Skill

**置くもの**:
- 再利用可能な判断基準
- ドメイン知識
- ワークフロープロトコル
- 安全プロトコル
- テンプレート選定ルール
- 所有アーティファクトの構造定義

### Template

**置くもの**:
- 出力構造
- 見出し
- 必須/任意マーカー
- プレースホルダー

### Script

**置くもの**:
- 採番
- 検証（validation）
- INDEX 生成
- Markdown 更新
- 整合性チェック

### 統率スキル（Orchestration skill）作成判断基準

統率スキルは、以下のいずれかを満たす場合にのみ作成する:

- 大きな状態機械を持つ
- 再開ポイント検出が必要
- CI ループを含む
- Wave スケジューリングを含む
- サブエージェントプロトコルを含む

詳細は `artifact-contracts.md`（REQ-0103）を参照。

---

## 6. 実行時、執筆関心分離（Runtime / Authoring）

AgentDevFlow の配布物は実行時（runtime: 個別プロジェクトで実行可能）と執筆（authoring: agent-dev-flow リポジトリ開発用）に明確に分離する（ADR-0102）。

**実行時配布物**は自己完結し、agent-dev-flow リポジトリの dev メタデータに依存しないことを保証する:
- Command frontmatter は `description` と `agent` のみ（REQ-0103-015, ADR-0102）
- Skill `references/` は実行時配布物のみを含める（ADR-0104）
- `docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書であり、実行時配布物の依存先ではない（ADR-0103, ADR-0104）

**執筆専用物**は agent-dev-flow リポジトリ内でのみ参照される:

- command-authoring / skill-authoring ガイド
- docs-check の検査ルール定義

この分離の意図は、**実行時配布物の移植性と安定性の確保**にある。個別プロジェクトが agent-dev-flow リポジトリの内部構造や開発用メタデータに依存することを防ぐ。
