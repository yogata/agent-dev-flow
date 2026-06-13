---
description: 要件を整理・定義する（機能追加・バグ修正共通）
agent: prometheus
---

# 要件定義

機能追加またはバグ修正の要件を整理・定義する。壁打ちフェーズで使用。

## Input

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
 - エラーログ（バグ修正の場合）
 - **ユーザーが明示した入力ファイル**（Requirement Source）: 設計メモ、調査メモ、RU（`.agentdev/backlog/req-units/RU-*.md`）等。全て read-only（G04）
 - req-save SPLIT 検出時の finding（`.sisyphus/drafts/requirements-review-finding-{topic-slug}.md`）
 - **promoted 直読み禁止**: `.agentdev/intake/promoted/` 及び `.agentdev/learning/promoted/` は直接読み込まない。backlog-review による RU 化を経由すること

## Output

- `.sisyphus/drafts/req-draft-{topic-slug}.md`（機能追加の場合のみ）
- セッション内要件doc（バグ修正・軽微変更の場合）

## Steps

0. **セッションコンテキスト検知**（引数なし単体実行時のみ）: `agentdev-req-analysis` の session-context-detection.md に従い、セッション履歴から6項目（要件内容・work_type・scale・ADR・構造化・適用範囲）を推論し、信頼度付きで表示。推論結果に応じて Step 1/9/10 へルーティング。引数ありの場合は Step 1 から開始

1. **明示入力ファイルの読み込み**（指定時）: Read tool で読み込み、壁打ちの初期コンテキストとして扱う。複数ファイル指定時は全て読み込む。引数なしの場合、`.agentdev/backlog/req-units/RU-*.md` の存在を確認し1件なら自動検出。0件なら Step 2 へ。2件以上なら候補一覧を表示

2. **壁打ち対話** → `agentdev-req-analysis` の壁打ちメソドロジーに従って深掘り。明示入力ファイルがある場合、その内容を開始点として活用

   **2-1. upstream handoff 判定**: 入力が AgentDevFlow 本体・配布 command・配布 skill・配布 template・配布 script の不具合または改善点を対象とする場合、`agentdev-workflow-lifecycle` に従い upstream handoff 用 RU 入力として整理する。現在プロジェクトの通常要件docとして定義せず、出力に `handoff_target: agent-dev-flow` と `apply_in_current_project: false` を含める

3. **既存REQ照合** → `agentdev-req-file-manager` の照合方法論に従って実行。APPEND-first ルール: CREATE 前に APPEND/UPDATE 候補を必ず評価。SPLIT 検出時は保存操作ではなく requirements review 候補として扱う。操作分類結果は `draft-meta` に記録

4. **要件展開** → `agentdev-req-analysis` の分析観点に従って網羅。詳細ゲートは `agentdev-req-analysis` を参照
   - **4-1. 関連ドキュメント更新候補抽出**: 変更影響候補を抽出し、ドラフトに保持する。委譲接続点: サブエージェントは探索結果・分類候補・根拠のみを返し、親エージェントがドラフト反映を判断する
   - **4-2. 分類ゲート**: 各要件行候補を「変更後仕様」or「反映作業」に分類する。委譲接続点: サブエージェントは分類候補のみを返し、親エージェントが要件doc混入可否を判断する
   - **4-3. 文書分類妥当性検証**: 各要件の対象ドキュメント種別を検証する。委譲接続点: サブエージェントは不適合候補と根拠のみを返し、親エージェントがflag記録を判断する

5. **ADR判断** → `agentdev-adr-guidelines`（manual reference）に従ってADR判断を記録（ADRファイル作成は req-save で実行）

   **5-1. ADR禁止ゲート**: ADR候補を提示する前に、REQ/SPEC相当判定を行う。詳細は `agentdev-req-analysis` を参照。委譲接続点: サブエージェントは除外候補と根拠のみを返し、親エージェントがADR候補提示可否を判断する

   **5-2. ADR判断根拠の記録**: ADR判断後、判断根拠をドラフトに保存する。詳細は `agentdev-req-analysis` を参照。委譲接続点: 親エージェントのみがドラフトへ記録する

6. **要件doc生成** → テンプレート: `.opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md` を Read → 目的/要件/適用範囲の構造に従って生成。【必須】セクションの欠落禁止。Requirement Source セクション・関連ドキュメント更新候補セクションを適宜追加
   - **6-1. operation_units セクション生成**: 複数RU入力時の統合/分離結果（Step 10-2）を基に `operation_units` セクションを生成する。各 OU は `ou_id`, `source_ru`, `target_req`, `operation`, `scale`, `depends_on`, `recommended_order`, `issue_policy`, `result` フィールドを持つ（REQ-0102-033〜035）。単一REQ操作の場合も 1 件の OU として出力する
   - **6-2. execution_groups セクション生成**: OU 群を分析し、Epic 候補グループを `execution_groups` セクションに記録する。各 execution_group は `id`, `type`, `purpose`, `included_ou`, `rationale` を持つ（REQ-0102-036）。記録は提案であり、Issue 発行は行わない（REQ-0102-038）

7. **work_type 判定**: ラベルに基づき4値分類（bugfix/feature/maintenance/docs_chore）。bugfix + ADR必要時は feature に昇格

8. **Scale判断**（feature のみ）: `agentdev-workflow-lifecycle` で standard/large を判定。large 時はユーザーと分解計画を協議

9. **ドラフト保存**:
   - 機能追加: `.sisyphus/drafts/req-draft-{topic-slug}.md` に保存。draft-meta セクション（work_type/req-operation/target-req/adr-required/topic-slug/scale/status 等）を追加。Step 6-1 で生成した `operation_units` セクションと Step 6-2 で生成した `execution_groups` セクションを含める
   - バグ修正・軽微変更/リファクタリング・保守/ドキュメント・雑務: ドラフト保存不要。セッション内で完結

10. **要件doc確認**: 生成した要件docをユーザーに提示（承認は求めず提示のみ）。差し戻し時は壁打ち継続（Step 1 へ）。次コマンド実行を確定の意思表示として扱う

   **10-1. 複数RU同時入力受付**: 詳細は `agentdev-req-analysis` を参照

   **10-2. 統合/分離判定**: 詳細は `agentdev-req-analysis` を参照。委譲接続点: サブエージェントは統合/分離候補と根拠のみを返し、親エージェントがdraft-metaへ記録する

   **10-3. 操作単位ごとの出力生成**: 詳細は `agentdev-req-analysis` を参照。委譲接続点: 親エージェントがreq-save消費形式を確定する

   **10-4. Epic 規模検出時の記録**: 詳細は `agentdev-req-analysis` を参照。委譲接続点: サブエージェントは分解候補のみを返し、親エージェントがdraft-metaへ記録する

    **10-5. Wave 候補・依存関係の記録**: 詳細は `agentdev-req-analysis` を参照。委譲接続点: サブエージェントは依存候補のみを返し、親エージェントが順序依存を確定する

    **10-6. OU 構造検証**: 生成した `operation_units` セクションについて以下を確認する: (a) 各 OU に `ou_id`, `target_req`, `operation` が設定されている (b) `execution_groups` の `included_ou` が実在する `ou_id` を参照している (c) `depends_on` が実在する `ou_id` を参照している (d) `result` セクションが空である（req-save/case-open が書き戻すため）

11. **完了報告**: 完了報告templateに従って出力。work_type に応じたvariantを選択:
      - feature standard → .opencode/commands/agentdev/templates/req-define/feature.md
      - feature large (Epic)規模 → .opencode/commands/agentdev/templates/req-define/feature-epic.md
      - bugfix / maintenance / docs_chore → .opencode/commands/agentdev/templates/req-define/lightweight.md

## Guardrails

- G01: 壁打ちフェーズのみ（実装コード禁止）
- G02: 関連ドキュメントの個別ファイル列挙をユーザーに求めない
- G03: ファイル編集スコープ: `.sisyphus/drafts/**` のみ作成・編集を許可
- G04: ユーザーが明示した入力ファイルは read-only。`.agentdev/backlog/req-units/RU-*.md` の削除は行わない（後続の case-open 成功後に実行）
- G05: `docs/` 配下の広範な探索禁止（例外: 明示入力ファイルと docs/requirements/** の read-only 参照、Step 4-1 の限定探索は許可）
- G06: inbox.md / archive/active.md を直接ロードしない
- G07: promoted artifact の直読み禁止
- G08: `git` コマンドは実行しない
- G09: チェックボックスは測定可能で一意（`agentdev-req-analysis` 品質基準）
- G10: 要件doc構造は doc_requirement.md テンプレートに厳密に従う
- G11: ADR閾値以上の判断は `agentdev-adr-guidelines` へ
- G12: work_type 判定基準は `agentdev-workflow-lifecycle` を参照
- G13: req-define は Issue 階層を決定しない。Issue 階層の決定は case-open の責務範囲
- G14: req-define は draft に `operation_units` と `execution_groups` セクションを出力すること（REQ-0102-033, 036）。単一REQ操作の場合も 1 件の OU として出力する
