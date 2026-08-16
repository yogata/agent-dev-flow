# STEP-1〜4: Issue番号解決・状態取得・更新分岐・報告（update-flows）

> 本 reference は `agentdev-workflow-case-update` SKILL.md の STEP-1〜STEP-4 詳細である。Issue番号解決、現在状態取得、更新内容分岐（--body / --comment / --req / --review-ng）、完了報告を提供する。

## 目次

- STEP-1: Issue番号解決
- STEP-2: 現在のIssue状態を取得
- STEP-3: 更新内容に応じて分岐
- STEP-4: 完了報告

## STEP-1: Issue番号解決

### Purpose

対象 Issue を特定する。

### Input Resolution

1. SSoT 再構成: なし（番号はユーザー入力またはセッション内会話からのみ取得）
2. identifier 保持: Issue番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- case-update command が起動している

### Procedure

詳細は `agentdev-workflow-routing` を参照。委譲接続点: サブエージェントは候補番号抽出のみを返し、親エージェントが確認、停止を判断する。Issue/PR 一覧取得手続き（`agentdev-gh-cli`）等で open issue 一覧を取得することは禁止（command 不変条件）。

### Result

- Issue番号確定

### Evidence

- 番号の入手経路（ユーザー入力 or セッション会話）

### Completion Verification

- 番号が一意に確定していること（解決不能時はユーザーに指定を求めて停止）

### Resume-Idempotency

- 読取のみで副作用を持たない

## STEP-2: 現在のIssue状態を取得

### Purpose

対象 Issue の現在フェーズを判定する。

### Input Resolution

1. SSoT 再構成: Issue 本文（`agentdev-gh-cli` の安全な読み取り手順）
2. identifier 保持: Issue番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-1 で Issue番号が確定している

### Procedure

`agentdev-workflow-lifecycle` で現在フェーズを判定する。

### Result

- 現在フェーズ判定結果

### Evidence

- Issue 本文読取結果、フェーズ判定根拠

### Completion Verification

- フェーズが判定済みであること

### Resume-Idempotency

- 読取のみで副作用を持たない

## STEP-3: 更新内容に応じて分岐

### Purpose

更新種別（--body / --comment / --req / --review-ng）に応じた更新を実行する。

### Input Resolution

1. SSoT 再構成: Issue 本文、対象 REQ ファイル、直前のレビュー結果
2. identifier 保持: Issue番号、REQ番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-2 で現在状態が取得されている

### Procedure

- **`--body`**: Issue作成時に使用されたテンプレートに従って更新する。詳細は `agentdev-workflow-routing` を参照。委譲接続点: サブエージェントは本文案と必須セクション検査のみを返し、親エージェントが Issue 本文更新手続き（`agentdev-gh-cli`）を行う
- **`--comment`**: 更新コメントを追加する。詳細は `agentdev-workflow-routing` を参照。委譲接続点: サブエージェントはコメント案と必須セクション検査のみを返し、親エージェントが投稿する
- **`--req`**: REQファイル更新を行う。case-update --req は直接 commit+push を行う（req-save への委譲は行わない）。詳細は `agentdev-workflow-routing` を参照。委譲接続点: サブエージェントは関連REQ候補、APPEND/UPDATE候補、根拠のみを返し、親エージェントがファイル更新と commit/push を行う。APPEND vs UPDATE 判定基準: APPEND は要件テーブルへの行追加、適用範囲の拡張（例: 受け入れ基準の追加、新規要件の追加）。UPDATE は既存セクションの内容修正（例: テキスト置換、要件の文言修正、適用範囲の変更）
- **`--review-ng`**: レビューNG時の専用フローを実行する。必ず QG-3（`agentdev-quality-gates`）の乖離検出結果を引用する（command 不変条件）。詳細は `agentdev-workflow-routing` を参照。委譲接続点: サブエージェントは乖離タイプ候補、推奨アクション、更新漏れ候補のみを返し、親エージェントがコメント投稿とREQ更新判断を行う

### Result

- 更新実行（Issue本文 / コメント / REQファイル+commit / レビューNGコメント）

### Evidence

- 更新後の Issue 本文/コメント（`agentdev-gh-cli` VERIFY 結果）、REQ ファイルの commit hash

### Completion Verification

- テンプレート【必須】セクションが全て含まれていることを確認してから投稿していること（command 不変条件）。SSoT 整合が維持されていること（command 不変条件）

### Resume-Idempotency

- 更新後の Issue 本文・コメントの読戻しで適用済みを検出し、重複適用を回避する。`--req` は REQ ファイルの git log で commit 済み否かを判定する

## STEP-4: 完了報告

### Purpose

更新種別に応じた完了報告を出力する。

### Input Resolution

1. SSoT 再構成: STEP-3 の更新結果
2. identifier 保持: Issue番号、REQ番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-3 の更新が完了している

### Procedure

完了報告 template に従って出力する。更新種別に応じた種別を選択する:

- `--body` → `.opencode/commands/agentdev/templates/case-update/body.md`
- `--comment` → `.opencode/commands/agentdev/templates/case-update/comment.md`
- `--req` → `.opencode/commands/agentdev/templates/case-update/req.md`（変数: {APPEND/UPDATE}, {REQ番号}, {セクション名}）
- `--review-ng` → `.opencode/commands/agentdev/templates/case-update/review-ng.md`（変数: {乖離タイプ}, {REQ番号}, {推奨アクション}）

更新種別の推論: ユーザー入力、直前のレビュー結果、対象Issue/REQ、会話文脈から推論する。推論不能時のみユーザーに指定を求めて停止する。

### Result

- 完了報告出力

### Evidence

- 完了報告本文（種別、更新対象）

### Completion Verification

- 選択種別が更新内容と一致していること

### Resume-Idempotency

- 報告のみで副作用を持たない

## 関連 STEP

- 前: なし（workflow 開始）
- 次: なし（workflow 終了）

## 関連 Capability Skill

- `agentdev-workflow-routing`: 各更新種別フローの詳細、委譲接続点
- `agentdev-workflow-lifecycle`: フェーズ判定
- `agentdev-gh-cli`: Issue 更新・コメント追加の I/O 手続きと VERIFY
- `agentdev-quality-gates`: QG-3 乖離検出結果の引用

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（フェーズ維持、管轄外の明確化）
- 不変条件（Issue番号解決に一覧取得禁止）
- 不変条件（SSoT 整合、QG-3 引用、テンプレート構造維持、【必須】セクション確認）
- G08・不変条件（gh CLI 委譲、安全な読み取り手順）
