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
- **promoted 直読み禁止**: `.agentdev/intake/promoted/` 及び `.agentdev/learning/promoted/` は直接読み込まない（MUST NOT）。backlog-review による RU 化を経由すること

## Output

- `.sisyphus/drafts/req-draft-{topic-slug}.md`（機能追加の場合のみ）
- セッション内要件doc（バグ修正・軽微変更の場合）

## Steps

0. **セッションコンテキスト検知**（引数なし単体実行時のみ）: `agentdev-req-analysis` の session-context-detection.md に従い、セッション履歴から6項目（要件内容・work_type・scale・ADR・構造化・適用範囲）を推論し、信頼度付きで表示。推論結果に応じて Step 1/9/10 へルーティング。引数ありの場合は Step 1 から開始

1. **明示入力ファイルの読み込み**（指定時）: Read tool で読み込み、壁打ちの初期コンテキストとして扱う。複数ファイル指定時は全て読み込む。引数なしの場合、`.agentdev/backlog/req-units/RU-*.md` の存在を確認し1件なら自動検出。0件なら Step 2 へ。2件以上なら候補一覧を表示

2. **壁打ち対話** → `agentdev-req-analysis` の壁打ちメソドロジーに従って深掘り。明示入力ファイルがある場合、その内容を開始点として活用

   **2a. upstream handoff 判定**: 入力が AgentDevFlow 本体・配布 command・配布 skill・配布 template・配布 script の不具合または改善点を対象とする場合、`agentdev-workflow-lifecycle/references/upstream-handoff.md` に従い upstream handoff 用 RU 入力として整理する。現在プロジェクトの通常要件docとして定義せず、出力に `handoff_target: agent-dev-flow` と `apply_in_current_project: false` を含める

3. **既存REQ照合** → `agentdev-req-file-manager` の照合方法論に従って実行。APPEND-first ルール: CREATE 前に APPEND/UPDATE 候補を必ず評価。SPLIT 検出時は保存操作ではなく requirements review 候補として扱う。操作分類結果は `draft-meta` に記録

4. **要件展開** → `agentdev-req-analysis` の分析観点に従って網羅
   - **4b. 関連ドキュメント更新候補抽出**: 変更種別判定 → キーワード抽出 → 限定探索（docs/specs/**, docs/requirements/**, docs/DOC-MAP.md, docs/adr/**, docs/README.md, .opencode/commands/**, .opencode/skills/**）→ 分類（直接矛盾/更新候補/影響なし）。REQだけでなく ADR/SPEC/guides/DOC-MAP/commands/skills への影響候補を明示する。ドラフトに保持
     - **局所予防の範囲**: この step は要求定義時の局所的な影響候補抽出であり、`/agentdev/docs-review` の全体意味レビューの代替ではない
       - **4c. 分類ゲート**: 各要件行候補を「変更後仕様」or「反映作業」に分類。反映作業のみの候補は移送候補としてマーク
    - **4d. 文書分類妥当性検証**: 各要件の対象ドキュメント種別が `docs/specs/document-model.md` の Document Classification Policy（REQ/ADR/SPEC/Guide/Report/DOC-MAP）に適合しているか検証する。不適合な文書種別を持つ要件は flag としてマークする。4c の反映作業分類（変更の種別）とは独立した文書種別の妥当性確認である

5. **ADR判断** → `agentdev-adr-guidelines`（manual reference）に従ってADR判断を記録（ADRファイル作成は req-save で実行）

   **5a. ADR禁止ゲート**: ADR候補を提示する前に、以下のREQ/SPEC相当判定を行うこと:

   **除外基準（該当する場合、ADR候補から除外しREQ/SPEC更新候補として整理）**:
   1. 仕様変更のみを含む（技術的決定なし）
   2. command動作仕様の定義
   3. workflow定義・状態遷移の記述
   4. 命名規約・directory規約の変更
   5. 運用ルールの変更
   6. template形式・入出力形式の変更
   7. 非技術的合意事項の記録

   **分類基準**:
   - 振る舞い・制約・状態 → REQ更新候補
   - schema・path・lifecycle → SPEC更新候補
   - 方針・ガイドライン → guide更新候補

   **5b. ADR判断根拠の記録**: ADR判断後、判断根拠をドラフトに保存すること（SHALL, REQ-0112-055）。記録項目は以下を含める:
   - 判断結果: ADR必要 / ADR不要
   - 適用基準: ADR閾値に達した理由、または除外基準に該当した理由
   - 根拠事実: 該当 / 非該当を判断した具体的な事実

6. **要件doc生成** → テンプレート: `.opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md` を Read → 目的/要件/適用範囲の構造に従って生成。【必須】セクションの欠落禁止。Requirement Source セクション・関連ドキュメント更新候補セクションを適宜追加

7. **work_type 判定**: ラベルに基づき4値分類（bugfix/feature/maintenance/docs_chore）。bugfix + ADR必要時は feature に昇格

8. **Scale判断**（feature のみ）: `agentdev-workflow-lifecycle` の並列実行パターン条件で standard/large を判定。large 時はユーザーと分解計画を協議

9. **ドラフト保存**:
   - 機能追加: `.sisyphus/drafts/req-draft-{topic-slug}.md` に保存。draft-meta セクション（work_type/req-operation/target-req/adr-required/topic-slug/scale/status 等）を追加
   - バグ修正・軽微変更/リファクタリング・保守/ドキュメント・雑務: ドラフト保存不要。セッション内で完結

10. **要件doc確認**: 生成した要件docをユーザーに提示（承認は求めず提示のみ）。差し戻し時は壁打ち継続（Step 1 へ）。次コマンド実行を確定の意思表示として扱う

   **10a. 複数RU同時入力受付**: Step 1 で 2 件以上の RU が検出・指定された場合、全ての RU を同時入力として扱う。単一の壁打ちセッションで複数 RU を一括処理対象とする

   **10b. 統合/分離判定**: 入力 RU 群の統合・分離を判定。同一トピック + 同一対象 REQ + 同一理由 → 1 つの req-save 操作に統合。上記のいずれかが異なる → 個別の req-save 操作に分離。判定結果は draft-meta に記録

   **10c. 操作単位ごとの出力生成**: 統合/分離判定後の各操作単位について、以下を req-save が消費可能な形式で出力: 対象 REQ、操作種別（CREATE/APPEND/UPDATE/SPLIT）、要件候補一覧、依存関係。ドラフト内に操作単位セクションとして保持

   **10d. Epic 規模検出時の記録**: Step 8 で scale:large かつ Epic 規模と判定された場合、`scale:large` と分解計画（decomposition）を draft-meta に記録。複数 RU にまたがる Epic の場合は、関係する RU 群を関連付けて記録

   **10e. Wave 候補・依存関係の記録**: 操作間に逐次制約（先行要件が必要など）が存在する場合、wave 候補および依存関係を draft-meta に記録。順序依存があれば明示

11. **完了報告**: 完了報告templateに従って出力。work_type に応じたvariantを選択:
      - feature standard → .opencode/commands/agentdev/templates/req-define/feature.md
      - feature large (Epic)規模 → .opencode/commands/agentdev/templates/req-define/feature-epic.md
      - bugfix / maintenance / docs_chore → .opencode/commands/agentdev/templates/req-define/lightweight.md

## Guardrails

- G01: 壁打ちフェーズのみ（実装コード禁止）
- G02: 関連ドキュメントの個別ファイル列挙をユーザーに求めない
- G03: ファイル編集スコープ: `.sisyphus/drafts/**` のみ作成・編集を許可
- G04: ユーザーが明示した入力ファイルは read-only。`.agentdev/backlog/req-units/RU-*.md` の削除は行わない（後続の case-open 成功後に実行）
- G05: `docs/` 配下の広範な探索禁止（例外: 明示入力ファイルと docs/requirements/** の read-only 参照、Step 4b の限定探索は許可）
- G06: inbox.md / archive/active.md を直接ロードしない
- G07: promoted artifact の直読み禁止
- G08: `git` コマンドは実行しない
- G09: チェックボックスは測定可能で一意（`agentdev-req-analysis` 品質基準）
- G10: 要件doc構造は doc_requirement.md テンプレートに厳密に従う
- G11: ADR閾値以上の判断は `agentdev-adr-guidelines` へ
- G12: work_type 判定基準は `agentdev-workflow-lifecycle` → workflow classification を参照
- G13: req-define は Issue 階層を決定しない。Issue 階層の決定は case-open の責務範囲
