---
description: inbox 内の intake item をレビュー・分類し、採用 item を backlog-review 向け promoted artifact に整形する
agent: sisyphus
implementation_pattern: file-pipeline
---

# Intake Promote

`.agentdev/intake/inbox/` 内の intake item を直接読み込み、内部 review フェーズで分類したのち、採用 item を `backlog-review` に渡せる promoted artifact に整形する（REQ-0105-046, REQ-0105-047）。

**このコマンドは review・分類・整形を行う。** GitHub Issue の作成は行わない（REQ-0103）。`intake-review` は廃止済みであり、本コマンドが review 機能を吸収している。

## Input

- intake item 群（`.agentdev/intake/inbox/` 内の Markdown ファイル）（REQ-0105-046）
- ユーザーによる追加コンテキスト・分類修正指示（対話的に）

## Output

- 採用 item の promoted artifact（`backlog-review` 用）
- 整形済み item は `.agentdev/intake/promoted/*.md` に保存（フラット構造）
- 分類結果レポート（採用 / 保留 / 却下）

## 分類値

intake-promote の内部 review フェーズにおける分類値は以下の 3 値とする（REQ-0105-047）:

| 分類 | 意味 | 後続 |
|------|------|------|
| `採用` | 対応すべきと判断。promoted artifact に整形 | `/agentdev/backlog-review` |
| `保留` | 判断を保留。inbox に残す | 再度 `/agentdev/intake-promote` |
| `却下` | 対応不要と判断 | `.agentdev/intake/archive/rejected/` |

## 整形の方向性

採用 item の後続ルートに応じて整形内容が異なる（REQ-0103）:

| 後続ルート | 条件 | 整形内容 |
|------------|------|----------|
| `backlog-review` | 採用 item 全て | backlog-review が分析しやすい形式に整理（観測内容・影響・課題・既存要件との関連を構造化） |

## Steps

### Phase 1: Inbox Scan

1. **inbox の確認**: `.agentdev/intake/inbox/` 内の intake item を一覧表示する（REQ-0105-046）:
   - ファイル一覧の取得
   - item 数のカウント
   - inbox が空の場合はその旨を報告して終了

2. **item の読み込み**: 各 intake item を読み込み、内容を把握する。

### Phase 2: Internal Review

3. **レビュー・評価**: 各 item について以下の観点で評価する（REQ-0105-047）:
   - 観測内容の妥当性・重要性
   - 影響の程度
   - 対応の緊急度・優先度
   - 既存要件・仕様との関連
   - 対応方針の方向性（要件定義が必要か、既に Issue 化可能か）
   - **learning 分岐判断**: item は intake ではなく learning に分けるべきものではないか（`docs/specs/workflow-contracts.md` Split Rule セクション参照）。具体的な修正対象がなく再発防止知見のみの場合は learning に委ねることを推奨

4. **分類の提示**: 各 item の評価結果を分類（採用 / 保留 / 却下）と共に提示する:
   ```markdown
   ## Intake Review 結果

   | # | タイトル | 分類 | 後続 | 備考 |
   |---|----------|------|------|------|
   | 1 | ... | 採用 | backlog-review | ... |
   | 2 | ... | 採用 | backlog-review | ... |
   | 3 | ... | 保留 | - | ... |
   | 4 | ... | 却下 | - | ... |
   ```

### Phase 3: HITL Confirmation

5. **ユーザー確認**: 評価・分類結果をユーザーに提示し、明示的な承認を得る（REQ-0105-048）:
   - 各 item の分類と理由を提示
   - ユーザーの追加コンテキストを受け付ける
   - 分類の修正指示を受け付ける
   - **ユーザーの明示的な承認なしに次フェーズに進んではならない（MUST NOT）**
   - 全 item の分類が確定するまで対話を継続

### Phase 4: Distribution

6. **採用 item の整形**: 採用と判定された item を backlog-review 向けに整形する:
   - 観測内容・影響・課題を整理
   - backlog-review が分析しやすい形式に構造化
   - 既存要件との関連・差分を明記
   - 複数 item を束ねる場合は統合内容を整理
   - **artifact を `.agentdev/intake/promoted/` 直下にフラット配置する。artifact の frontmatter には route/status を記録しない（REQ-0105）**

7. **保存**:
   - 保存先: `.agentdev/intake/promoted/`（フラット構造）
   - `promoted/` ディレクトリが存在しない場合は作成する
   - ファイル名: `YYYY-MM-DD-{topic-slug}.md`（元 item 名を維持、または束ねた内容に応じた名前）
   - artifact の frontmatter に route や status を記録しない（REQ-0105）

8. **振り分け**: 確定した分類に基づいて item を振り分ける:
   - `採用` → promoted artifact を `.agentdev/intake/promoted/` に保存済み（Step 7）。元の inbox item は `.agentdev/intake/archive/promoted/` に移動
   - `保留` → `.agentdev/intake/inbox/` に残す（移動しない）
   - `却下` → `.agentdev/intake/archive/rejected/` に移動
   - `archive/promoted/` または `archive/rejected/` ディレクトリが存在しない場合は作成する

### Phase 5: Git & Completion

9. **実行前同期（git pull）**:
   - `git pull --ff-only` を実行する
   - **失敗時**: 以下の構造化エラーメッセージを表示して停止する（自動解消しない）:
     ```
     ## Git 同期エラー

     **エラー種別**: pull --ff-only 失敗
     **停止理由**: リモートに未取り込みの変更があり、fast-forward マージできない
     **対象ブランチ**: {current_branch}
     **ユーザーアクション**: 手動で `git pull --rebase` または `git stash && git pull --ff-only && git stash pop` を実行してください
     **raw git output**:
     {git_error_output}
     ```

10. **.agentdev/intake 変更の commit と push**:
    - `git diff --name-only` で `.agentdev/intake/` 配下の変更ファイルを確認する
    - **変更なし時**: commit/push せず、Step 11 の完了報告で「変更なし」と報告
    - **変更あり時**:
      1. `git add` は `.agentdev/intake/` 配下の変更ファイルのみを対象とする（SHALL）。他のパスを巻き込まない
      2. commit message: `chore(agentdev): review and promote intake items`（Conventional Commits 形式）（SHALL）
      3. `git push` を実行する
      4. **push 失敗時**: 以下の構造化エラーメッセージを表示し、完了扱いにしない（SHALL）:
         ```
         ## Git Push エラー

         **エラー種別**: push 失敗
         **停止理由**: リモートへのプッシュに失敗
         **対象ブランチ**: {current_branch}
         **変更ファイル**: {changed_files}
         **ユーザーアクション**: 手動で `git push` を実行してください
         **raw git output**:
         {git_error_output}
         ```

11. **完了報告** → 完了報告templateに従って出力。template: .opencode/commands/agentdev/templates/intake-promote/standard.md。分類結果（採用・保留・却下の件数・一覧）と git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含める（REQ-0105-049）

## Error Handling

| エラー | 対処 |
|--------|------|
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## Guardrails

### 責務境界（REQ-0103, REQ-0105）
- G01: GitHub Issue の作成を行わない（`backlog-save` / `case-open` が担当）
- G02: intake item の元の内容を改変しない（整理・構造化のみ）
- G03: `backlog-review` を自動起動しない（次ステップの提示のみ）
- G04: learning pipeline の入力を生成しない（MUST NOT）。採用 item の後続ルートは `backlog-review` のみ（REQ-0105）
- G05: learning item の保存・分類・昇華を担当しない（REQ-0105）

### HITL 制約（REQ-0105-048）
- G06: ユーザーの明示的な承認なしに promoted artifact を生成してはならない（MUST NOT）
- G07: 分類結果は必ずユーザーに提示し、確認・修正の機会を与えること（SHALL）
- G08: 自動確定・自動進行は行わない。ユーザーが「確定」を明示的に指示してから次フェーズに進む

### 形式制約（REQ-0103〜039）
- G09: workflow 管理 artifact として扱わない（REQ-0103）
- G10: 整形結果に frontmatter（route/status 等）を含めてはならない（MUST NOT）（REQ-0103, REQ-0105）
- G11: 整形結果に重複排除キー・後続 artifact 参照を含めない（REQ-0103）
- G12: 元 item の本文に整形結果を書き込まない（REQ-0103）

### accepted/ 廃止（REQ-0105-050）
- G13: `.agentdev/intake/accepted/` を参照・使用してはならない（MUST NOT）
- G14: `accepted/` への移動・読み込み・存在確認を行わない

### 実行制約
- G15: review・整形はユーザーとの対話を通じて行う
- G16: 保存先は `.agentdev/intake/promoted/` 直下のみ（フラット構造）
- G17: 採用 item の inbox 元ファイルは artifact 保存後に `.agentdev/intake/archive/promoted/` に移動する
