---
description: 要件を整理・定義する（機能追加・バグ修正共通）
agent: prometheus
load_skills:
  - req-analysis
  - req-file-manager
  - adr-guidelines
  - issue-lifecycle
  - issue-completion-reporting
---

# 要件定義

機能追加またはバグ修正の要件を整理・定義します。①バイブス壁打ちフェーズで使用。

## Input

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- エラーログ（バグ修正の場合）

## Output

- `.sisyphus/drafts/req-draft-{topic-slug}.md`（パターンBの場合のみ）
- セッション内要件doc（パターンAの場合）

## Steps

0. セッションコンテキスト検知（単体実行時のみ）:
    **前提**: ユーザーが引数なしで `/issue/issue-req` を実行した場合にのみ実行。引数ありの場合は Step 1 から開始。
    
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
         - `saved` → issue-save-req 完了状態。issue-create 待ち
         - `draft` → issue-save-req 未実行。issue-save-req 待ち
    
    c) **推論サマリー表示**: ルーティング前に以下の形式で推論結果をユーザーに表示（**陈述形式、質問ではない**）:
       ```
       📋 セッションコンテキスト検知結果:
         要件内容: {推論結果} [信頼度: 高/低]
         Pattern: {A/B} [信頼度: 高/低]
         {Pattern Bの場合} Scale: {standard/large} [信頼度: 高/低]
         ADR: {必要/不要} [信頼度: 高/低]
         要件構造化: {完了/未完了} [信頼度: 高/低]
         適用範囲: {確定/未確定} [信頼度: 高/低]
         {draft存在時} ドラフト: {ファイル名}（Step 7 完了と判定）
       ```
       **ユーザー訂正**: ユーザーが「違う」「やり直し」と応じた場合 → Step 1 から通常壁打ちを開始
       **ユーザー承認・黙示的同意**: ユーザーが内容に同意または先への指示をした場合 → 推論結果を採用
    
    d) **ルーティング判定**（推論サマリー表示後、ユーザーの同意を確認した後に実行）:
       - **全項目 高信頼度で推論済み（+ draft 存在）**:
         - Pattern B → Step 9（要件doc確認）へスキップ（要件doc + draft は既に存在）
         - Pattern A → Step 9（要件doc確認）へスキップ（要件doc はセッション内に存在）
       - **全項目 高信頼度で推論済み（draft なし）**:
         - Pattern B → Step 7（ドラフト保存）へスキップ
         - Pattern A → Step 9（要件doc確認）へスキップ
       - **一部項目が低信頼度または未推論**:
         - 推論済み項目（高信頼度）を継承し、不足項目のみを対象に Step 1（壁打ち）を開始
         - 壁打ちでは不足項目のみを深掘り（既に推論済みの項目は再確認しない）
       - **推論結果なし（セッションに要件情報が存在しない）**:
         - 通常の Step 1 から開始（既存動作と同じ）

1. ユーザーとの壁打ち対話を開始 → `req-analysis` の壁打ちメソッドロジーに従って深掘り
2. 既存REQ照合 → `req-file-manager` の照合方法論に従って実行（REQ-0002-009〜011）:
   - `docs/requirements/REQ-*.md` をスキャンし、ユーザーの要件と既存REQの関連性を推論（タイトル・タグ・目的・要件内容の重み付けによる総合判定）
   - 関連REQがある場合: 該当REQの内容（目的・要件・適用範囲）を壁打ちコンテキストに即時反映し、ユーザーとともに変更点を深掘り
   - 操作分類を確定: `CREATE`（該当REQなし）、`APPEND`（既存REQへの要件行追加）、`UPDATE`（既存REQの内容修正）
   - 複数REQが該当する場合、それぞれに対する操作を個別に指定
   - 分類結果は `draft-meta` の `req-operation` と `target-req` に記録
3. 要件を展開 → `req-analysis` の分析観点に従って網羅（照合で取得した関連REQの内容を反映）
4. ADR閾値以上の技術判断が発生した場合 → `adr-guidelines` に従ってADR判断を記録（ADRファイルの作成は issue-save-req で実行）
5. 要件doc形式で生成 → テンプレート: `.opencode/skills/req-file-manager/templates/doc_requirement.md` を Read tool で読み込み、目的/要件/適用範囲の構造に従って内容を構造化
   **テンプレート準拠要件**: テンプレートの【必須】セクション（目的、要件、適用範囲）が全て要件docに含まれること。必須セクションが欠落している場合、生成をやり直すこと。
6. パターン判定:
    - ラベルに基づいて Pattern 判定: `bug`, `critical` → Pattern A, `enhancement`, `feature` → Pattern B, `refactor`, `maintenance` → Pattern C, `docs`, `chore` → Pattern D
    - **Pattern A + ADR必要時の Pattern B 昇格**: Pattern A で ADR閾値以上の技術判断が発生した場合、Pattern B に昇格する（REQファイル・ADRファイルの作成が必要となるため）
7. スケール判断（Pattern B のみ実行）:
    - Pattern B であっても、`issue-lifecycle` の並列実行パターンにおけるスケール判断条件を用いて `standard` または `large` を判定:
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
8. ドラフト保存:
    - **パターンB（機能追加）**: `.sisyphus/drafts/req-draft-{topic-slug}.md` にドラフトを保存。ドラフトは doc_requirement.md テンプレート構造（目的/要件/適用範囲）に以下のメタデータセクションを追加:
      ```markdown
      ## draft-meta（issue-save-req 用）

      - **pattern**: B
      - **req-operation**: CREATE | APPEND | UPDATE
      - **target-req**: REQ-{NNNN}（APPEND/UPDATE の場合）
      - **adr-required**: true | false
      - **adr-decisions**: [{title, context, decision, status}]（adr-required が true の場合）
      - **topic-slug**: {ファイル名に使用するスラッグ}
      - **scale**: standard | large
      - **decomposition**: [{scope, modules, description}]（scale が large の場合のみ）
       - **status**: draft（初期値。issue-save-req → saved, issue-create → issued + 削除）
      ```
    - **パターンA（バグ修正・軽微変更）**: ドラフト保存不要。セッション内で要件docを完結させる
    - **パターンC（リファクタリング・保守作業）/ パターンD（ドキュメント・雑務）**: ドラフト保存不要。セッション内で要件docを完結させる（Pattern Aと同等のlightweight workflow）
9. 要件doc確認: 生成した要件doc（パターンB: ドラフト内容、パターンA/C/D: セッション内要件doc）をユーザーに提示する。明示的な承認は求めず、提示のみを行う
    - **差し戻し**: ユーザーが修正・差し戻しを指示した場合、壁打ちを継続（Step 1に戻る）
    - **要件doc確定**: ユーザーが次のコマンド（`/issue/issue-save-req` または `/issue/issue-create`）を実行したことを要件doc確定の意思表示として扱う
10. 完了報告 → `issue-reporting` の完了報告フォーマットに従って出力（壁打ち結論ハイライトの表示を必ず含めること）:
    - パターンB: `次のステップ: /issue/issue-save-req`
    - パターンA/C/D: `次のステップ: /issue/issue-create`

## Guardrails

- バイブスフェーズのみ（実装コード禁止）
- **ファイル編集スコープ**: `.sisyphus/drafts/**` のみ作成・編集を許可
- **docs/ 配下のファイルは一切参照・書き込みしない**（例外: `docs/requirements/**` は Read-only 参照を許可。既存REQ照合のため Step 2 で使用）
- **git コマンドは実行しない**
- チェックボックスは測定可能で一意であること → `req-analysis` のチェックボックス品質基準
- ADR閾値以上の判断は `adr-guidelines` へ（判断の記録のみ、ファイル作成は不可）
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- Pattern分岐の判定基準と固有ルールは `issue-lifecycle` → Pattern Registry を参照
- 要件doc構造は `doc_requirement.md` テンプレートに厳密に従うこと。【必須】セクションの欠落は禁止
