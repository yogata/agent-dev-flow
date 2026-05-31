---
description: 要件を整理・定義する（機能追加・バグ修正共通）
agent: prometheus
implementation_pattern: wall-session
load_skills:
  - agentdev-req-analysis
  - agentdev-req-file-manager
  - agentdev-adr-guidelines
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
  - agentdev-no-ai-slop-writing
---

# 要件定義

機能追加またはバグ修正の要件を整理・定義します。壁打ちフェーズで使用。

## Input

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- エラーログ（バグ修正の場合）
- **ユーザーが明示した入力ファイル**（要件ソース — Requirement Source）:
  - 要件化前の設計メモ、調査メモ、反映指示書
  - learning-promote が生成した staging stub
  - その他変更内容・背景・制約・完了条件を含む source file
  - RU（`.agentdev/backlog/req-units/RU-*.md`）— backlog-save が生成した Requirement Unit
- req-save が SPLIT 検出時に作成した requirements review finding（`.sisyphus/drafts/requirements-review-finding-{topic-slug}.md`）
- finding ファイルを含め全てのユーザー明示入力ファイルは read-only の Requirement Source である（G04）。status や frontmatter の更新・上書きは行わない
- source file の種類に依存しない汎用的な入力扱いとする（elevation-staging 専用分岐は追加しない）
- **promoted 直読み禁止**（REQ-0105）: `.agentdev/intake/promoted/*.md` 及び `.agentdev/learning/promoted/*.md` を直接読み込んではならない（MUST NOT）。promoted artifact は backlog-review → backlog-save による RU 化を経由しなければならない

## Output

- `.sisyphus/drafts/req-draft-{topic-slug}.md`（機能追加の場合のみ）
- セッション内要件doc（バグ修正・軽微変更の場合）

## Steps

0. セッションコンテキスト検知（単体実行時のみ）:
    **前提**: ユーザーが引数なしで `/agentdev/req-define` を実行した場合にのみ実行。引数ありの場合は Step 1 から開始。
    
    a) **コンテキストスキャン**: 現在のセッションの会話履歴を分析し、以下の6項目の推論を試みる:
       - 推論順序（依存関係に従う）:
         1. 要件内容（何をやりたいか）→ セッション内で機能追加/バグ修正の説明が存在するか
         2. Pattern判定（A or B or C or D）→ 要件内容の性質から bug/critical=A, feature/enhancement=B, refactor/maintenance=C, docs/chore=D を推論
         3. Scale判定（Pattern B のみ）→ 複数モジュール跨ぎ、PR肥大化リスク、段階的リリースの有無から standard/large を推論
            ※ Pattern A の場合、Scale は推論不要（undefined）
         4. ADR判断（必要/不要）→ 技術判断の複雑さ・影響範囲から adr-required を推論
         5. 要件docの構造化 → セッション内でテーブル形式の要件が展開済みか
         6. 適用範囲（対象/対象外）→ セッション内で明示的に議論されているか
       
       - 各項目に信頼度（高/低）を付与:
         - **高**: セッション内で明示的に言及・合意されている
         - **低**: 暗黙的に推論可能だが明示的な言及がない
       
       - **マルチトピック検知**: セッション内で複数の異なる機能/バグが議論されている場合、直近のコンテキスト（最後の要件議論）を使用。ただし話題が混在して推論が困難な場合は Step 1 にフォールバック
    
    b) **draft ファイル確認**: `glob` で `.sisyphus/drafts/req-draft-*.md` の存在を確認
       - 存在する場合: ファイル名の topic-slug とセッションの要件内容の一致を確認
       - トピック不一致 → draft を無視（セッションコンテキスト優先）
       - トピック一致 → draft の `status` 値でルーティング:
         - `saved` → req-save 完了状態。case-open 待ち
         - `draft` → req-save 未実行。req-save 待ち
    
    c) **推論サマリー表示**: ルーティング前に以下の形式で推論結果をユーザーに表示（**陈述形式、質問ではない**）:
       ```
       📋 セッションコンテキスト検知結果:
         要件内容: {推論結果} [信頼度: 高/低]
         Pattern: {A/B} [信頼度: 高/低]
         {Pattern Bの場合} Scale: {standard/large} [信頼度: 高/低]
         ADR: {必要/不要} [信頼度: 高/低]
         要件構造化: {完了/未完了} [信頼度: 高/低]
         適用範囲: {確定/未確定} [信頼度: 高/低]
          {draft存在時} ドラフト: {ファイル名}（Step 9 完了と判定）
       ```
       **ユーザー訂正**: ユーザーが「違う」「やり直し」と応じた場合 → Step 1 から通常壁打ちを開始
       **ユーザー承認・黙示的同意**: ユーザーが内容に同意または先への指示をした場合 → 推論結果を採用
    
     d) **ルーティング判定**（推論サマリー表示後、ユーザーの同意を確認した後に実行）:
        - **全項目 高信頼度で推論済み（+ draft 存在）**:
          - Pattern B → Step 10（要件doc確認）へスキップ（要件doc + draft は既に存在）
          - Pattern A → Step 10（要件doc確認）へスキップ（要件doc はセッション内に存在）
        - **全項目 高信頼度で推論済み（draft なし）**:
          - Pattern B → Step 9（ドラフト保存）へスキップ
          - Pattern A → Step 10（要件doc確認）へスキップ
        - **一部項目が低信頼度または未推論**:
          - 推論済み項目（高信頼度）を継承し、不足項目のみを対象に Step 1（壁打ち）を開始
          - 壁打ちでは不足項目のみを深掘り（既に推論済みの項目は再確認しない）
        - **推論結果なし（セッションに要件情報が存在しない）**:
          - 通常の Step 1 から開始（既存動作と同じ）

 1. 明示入力ファイルの読み込み（指定された場合）:
    - ユーザーがファイルパスを指定した場合、Read tool で該当ファイルを読み込む
    - Requirement Source 形式（背景・問題・望ましい変更・対象範囲・反映先候補・既存対策確認・制約・完了条件を含む構造）を想定するが、任意のテキスト形式も受け入れる
    - 読み込んだ内容を壁打ちの初期コンテキストとして扱う（source file の種類による分岐は行わない）
     - 複数ファイルが指定された場合は全て読み込む
    - 引数なしの場合、`.agentdev/backlog/req-units/RU-*.md` の存在を確認し、1件なら自動検出して読み込む。0件なら通常の Step 2 へ。2件以上なら候補一覧を表示して指定を求める
    - **Finding ファイルの例**: `.sisyphus/drafts/requirements-review-finding-{topic-slug}.md` が指定された場合、finding の内容（検出概要・影響範囲・推奨アクション）を壁打ちの初期コンテキストとして扱い、正式な要件変更への変換を案内する
 2. ユーザーとの壁打ち対話を開始 → `agentdev-req-analysis` の壁打ちメソドロジーに従って深掘り
    - 明示入力ファイルが読み込まれている場合、その内容を壁打ちの開始点として活用（ファイル内容から要件の構造化を先行して進める）
 3. 既存REQ照合 → `agentdev-req-file-manager` の照合方法論に従って実行（REQ-0104〜011）:
    - `docs/requirements/REQ-*.md` をスキャンし、ユーザーの要件と既存REQの関連性を推論（タイトル・タグ・目的・要件内容の重み付けによる総合判定）
    - 関連REQがある場合: 該当REQの内容（目的・要件・適用範囲）を壁打ちコンテキストに即時反映し、ユーザーとともに変更点を深掘り
    - **APPEND-first ルール**（REQ-0104〜028）:
      - CREATE を選択する前に、APPEND/UPDATE 候補を必ず評価する（REQ-0104）
      - 同一コンポーネント・同一スコープの既存REQが存在する場合、APPEND をデフォルトの操作とする（REQ-0104）。判定は `agentdev-req-file-manager` の「操作分類の判定軸」に従う
      - 既存REQの要件行・目的・適用範囲の内容を修正する変更は UPDATE と判定する（REQ-0104）
      - CREATE を選択する場合、APPEND/UPDATE ではない理由を `draft-meta` の `create-rationale` フィールドに記録する（REQ-0104）
      - APPEND/UPDATE 候補があるにもかかわらず CREATE と判断する場合、ユーザーに判断根拠を提示する（REQ-0104）
    - 操作分類を確定: `CREATE`（該当REQなし）、`APPEND`（既存REQへの要件行追加）、`UPDATE`（既存REQの内容修正）
     - 複数REQが該当する場合、それぞれに対する操作を個別に指定
     - SPLIT（要件の分割）が検出された場合: SPLIT は保存操作ではなく requirements review / follow-up 候補として扱う。保存可能範囲（CREATE/APPEND/UPDATE）は通常通り実行する
     - 分類結果は `draft-meta` の `req-operation` と `target-req` に記録

 4. 要件を展開 → `agentdev-req-analysis` の分析観点に従って網羅（照合で取得した関連REQの内容を反映）
 4b. **関連ドキュメント更新候補抽出**（Step 4 の直後に実行）:
     - **変更種別判定**: Step 4 で展開済みの要件から、DBカラム、状態フラグ、判定条件、API仕様、画面表示、既存REQ/ADR/仕様の意味変更に該当する変更種別を自律的に判定する（REQ-0102）
     - **キーワード抽出**: 変更種別に該当する場合、要件本文・既存REQ照合結果・対象コンポーネント・API名・DBカラム名・状態名・表示文言から関連キーワードを抽出する（REQ-0102）
      - **限定探索**: 抽出キーワードを用いて、以下の範囲を read-only で限定探索する（REQ-0102, REQ-0102, REQ-0101）:
        - `docs/specs/**`
        - `docs/requirements/REQ-*.md`
        - `docs/DOC-MAP.md`
        - `docs/adr/**`
        - `docs/README.md`
        - `docs/requirements/README.md`
     - **分類**: 検出した候補ごとに、対象パス・検出語句・判定・必要対応を出力する（REQ-0102）。判定は以下に分類する（REQ-0102）:
       - `直接矛盾`: 既存記述が新要件と明示的に反対の内容を持つ
       - `更新候補`: 新要件の影響を受ける可能性が高いが、直接矛盾までは確認できない
       - `影響なし`: 検索ヒットしたが、更新不要と判断できる
     - **停止判断**（REQ-0102, REQ-0102）:
       - 既存REQ・ADR・仕様の記述を更新対象として扱えば新要件が成立する場合 → 停止せず、関連ドキュメント更新候補として後続工程へ引き渡す
        - 既存REQ・ADR・仕様のどれを優先するかの判断が必要な場合 → ユーザー判断を求める
       - ADRの決定と新要件が根本衝突する場合 → ユーザー判断を求める
     - **ドラフト保持**: 関連ドキュメント更新候補をドラフトまたはセッション内要件docに保持する（REQ-0102）。Step 6 の要件doc生成で `## 関連ドキュメント更新候補` セクションとして反映する
 4c. **分類ゲート**（Step 4b の直後に実行）（REQ-0109, REQ-0109）:
     - **分類対象**: Step 4 で展開した各要件行候補について、以下の2分類のいずれかに分類する:
       - **変更後仕様**: 変更後に満たすべき振る舞い・制約・状態を記述する要件行
       - **反映作業**: 既存成果物への更新・削除・移動・名称変更・廃止・置換・参照修正・インデックス修正・整合性修正そのものを記述する候補
     - **判定基準**: 要件行候補の述語が「〜すること（SHALL/SHOULD/MAY）」で表現される変更後仕様か、「〜を更新/削除/移動/改名/廃止/置換/修正すること」で表現される反映作業かを判定する
     - **処理**:
       - 反映作業のみの候補は、独立した要件行として扱わず、後続工程への移送候補としてマークする
       - 移送先: 対象REQ/ADR/SPEC等への UPDATE / APPEND、関連ドキュメント更新候補、または後続Caseの変更対象
       - 変更後仕様を含む候補は、通常の要件行として扱う
     - **結果**: 分類結果を要件docに保持し、Step 6 の要件doc生成で反映される
 5. ADR閾値以上の技術判断が発生した場合 → `agentdev-adr-guidelines` に従ってADR判断を記録（ADRファイルの作成は req-save で実行）
 6. 要件doc形式で生成 → テンプレート: `.opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md` を Read tool で読み込み、目的/要件/適用範囲の構造に従って内容を構造化
     **テンプレート準拠要件**: テンプレートの【必須】セクション（目的、要件、適用範囲）が全て要件docに含まれること。必須セクションが欠落している場合、生成をやり直すこと。
      **Requirement Source セクション**（REQ-0105, REQ-0105）: ユーザーが明示した入力ファイル（Requirement Source）が1件以上存在する場合、要件docの `## 適用範囲` の後に `## Requirement Source` セクションを追加する。セクションには全ての入力ファイルのパスをリスト形式（`- {filepath}`）で記録する。source file の種類（staging stub, promoted artifact, finding file 等）による条件分岐は行わず、全ての明示入力ファイルを統一的に扱う
      **関連ドキュメント更新候補セクション**（REQ-0102）: Step 4b で関連ドキュメント更新候補が検出された場合、`## 適用範囲`（または `## Requirement Source` が存在する場合はその後）に `## 関連ドキュメント更新候補` セクションを追加する。セクションには候補テーブル（パス/検出語句/判定/必要対応）を記録する
 7. パターン判定:
    - ラベルに基づいて Pattern 判定: `bug`, `critical` → Pattern A, `enhancement`, `feature` → Pattern B, `refactor`, `maintenance` → Pattern C, `docs`, `chore` → Pattern D
    - **Pattern A + ADR必要時の Pattern B 昇格**: Pattern A で ADR閾値以上の技術判断が発生した場合、Pattern B に昇格する（REQファイル・ADRファイルの作成が必要となるため）
 8. スケール判断（Pattern B のみ実行）:
    - Pattern B であっても、`agentdev-workflow-lifecycle` の並列実行パターンにおけるスケール判断条件を用いて `standard` または `large` を判定:
      - **large**: 以下のいずれか1つ以上の条件を満たす場合
        - 複数モジュールにまたがる (e.g., UI + API + DB)
        - 1 Issueで実装しきれない (PR肥大化リスク)
        - 段階的リリースが必要 (フェーズ分け・マイルストーン分割)
      - **standard**: 上記の条件を満たさない場合（デフォルト）
    - **large と判定された場合のみ**:
      - ユーザーと分解計画を協議: どのモジュールをどの子Issueに分割するか
      - 分解計画を次の形式で整理: `decomposition: [{scope, modules, description}]`
      - スケール判断結果と分解計画をユーザーに提示し、分解方針の確認を求める
    - **standard と判定された場合**: 分解不要、そのまま単一Issueで進む方針を提示する（確認停止しない）
 9. ドラフト保存:
    - **機能追加**: `.sisyphus/drafts/req-draft-{topic-slug}.md` にドラフトを保存。ドラフトは doc_requirement.md テンプレート構造（目的/要件/適用範囲）に以下のメタデータセクションを追加:
      ```markdown
      ## draft-meta（req-save 用）

      - **pattern**: B
      - **req-operation**: CREATE | APPEND | UPDATE
      - **target-req**: REQ-{NNNN}（APPEND/UPDATE の場合）
      - **adr-required**: true | false
      - **adr-decisions**: [{title, context, decision, status}]（adr-required が true の場合）
       - **topic-slug**: {ファイル名に使用するスラッグ}
       - **scale**: standard | large
       - **decomposition**: [{scope, modules, description}]（scale が large の場合のみ）
       - **create-rationale**: {CREATEを選択した理由}（req-operation が CREATE の場合に必須。APPEND/UPDATE候補があった場合はその理由も含む）
        - **status**: draft（初期値。req-save → saved, case-open → 削除）
       - **session-sourced RU の場合**（REQ-0105-017〜022）: `source_type: chat`, `generated_by: session`, `sources[].type: chat`, `sources[].path: session:YYYY-MM-DD-{topic}` を frontmatter に設定。本文は自足的で整理済みの内容に限定する
      ```
    - **バグ修正・軽微変更**: ドラフト保存不要。セッション内で要件docを完結させる
    - **リファクタリング・保守作業 / ドキュメント・雑務**: ドラフト保存不要。セッション内で要件docを完結させる（バグ修正・軽微変更と同等のlightweight workflow）
10. 要件doc確認: 生成した要件doc（機能追加: ドラフト内容、バグ修正・軽微変更/リファクタリング・保守作業/ドキュメント・雑務: セッション内要件doc）をユーザーに提示する。明示的な承認は求めず、提示のみを行う
    - **差し戻し**: ユーザーが修正・差し戻しを指示した場合、壁打ちを継続（Step 1に戻る）
    - **要件doc確定**: ユーザーが次のコマンド（`/agentdev/req-save` または `/agentdev/case-open`）を実行したことを要件doc確定の意思表示として扱う
 11. 完了報告 → `agentdev-workflow-reporting` の完了報告variantに従って出力。Pattern判定結果に応じたvariantを選択:
    - Pattern B standard → completion-reports/req-define/feature.md
    - Pattern B Epic規模 → completion-reports/req-define/feature-epic.md
    - Pattern A（バグ修正・軽微変更）→ completion-reports/req-define/bug-or-lightweight.md
    - Pattern C（リファクタリング・保守）→ completion-reports/req-define/maintenance.md
    - Pattern D（ドキュメント・雑務）→ completion-reports/req-define/docs-or-chore.md
    - 各variantに壁打ち結論ハイライトが含まれている（追加出力不要）

## Guardrails

### フェーズ制約
- G01: 壁打ちフェーズのみ（実装コード禁止）
- G02: 関連ドキュメントの個別ファイル列挙をユーザーに求めない。責務は要件の壁打ち・構造化に専念する

### ファイル操作制約
- G03: ファイル編集スコープ: `.sisyphus/drafts/**` のみ作成・編集を許可
- G04: ユーザーが明示した入力ファイルは read-only で参照可能（要件ソースとして扱うが、内容を変更・上書きしない）。`.agentdev/backlog/req-units/RU-*.md` の削除は req-define では行わず、後続の `case-open` の成功後に実行する（REQ-0105-015）
- G05: `docs/` 配下の広範な探索は禁止（例外: 明示入力ファイルと `docs/requirements/**` の read-only 参照は許可。既存REQ照合のため Step 3 で使用。Step 4b の抽出キーワードベース限定探索も許可）
- G06: `inbox.md` / `archive/active.md` を直接ロードしない（raw learning item は要件ソースとして扱わない。ただし昇華済みの staging stub や evaluation-report は明示入力ファイルとして read-only 参照を許可）
- G07: `.agentdev/intake/promoted/*.md` 及び `.agentdev/learning/promoted/*.md` を直接読み込んではならない（REQ-0105）。promoted artifact は backlog-review → backlog-save による RU 化を経由しなければならない

### 実行制約
- G08: `git` コマンドは実行しない

### 品質ゲート
- G09: チェックボックスは測定可能で一意であること → `agentdev-req-analysis` のチェックボックス品質基準
- G10: 要件doc構造は `doc_requirement.md` テンプレートに厳密に従うこと。【必須】セクションの欠落は禁止

### 判断・承認制約
- G11: ADR閾値以上の判断は `agentdev-adr-guidelines` へ（判断の記録のみ、ファイル作成は不可）

### 委譲・参照制約
- G12: Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → Pattern Registry を参照

### 出力制約
- G13: サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
