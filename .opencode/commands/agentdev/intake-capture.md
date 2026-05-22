---
description: 未分類の変更候補を手動入力から intake item として保存する
agent: sisyphus
load_skills:
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
---

# Intake Capture（手動入力）

ユーザーの手動入力から、未分類の作業候補・不整合・規約違反・未回収課題を intake item として作成し、`.agentdev/intake/inbox/` に保存する（REQ-0019-024）。

**このコマンドは保存専用である。** GitHub Issue の作成・採用可否の判断は行わない（REQ-0017-024）。作業知見だけの内容は対象外である（capture-boundaries.md 参照）。

## Input

- ユーザーの自然言語による変更候補の記述
- 任意で観測元・影響・判断保留事項の指定

## Output

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` に保存された intake item

## Intake Item 形式

intake item は以下の Markdown artifact とする（REQ-0017-032）。workflow 管理用の frontmatter・状態フィールド・重複排除キーは持たない（REQ-0017-033, REQ-0017-035, REQ-0017-039）。

```markdown
# {タイトル}

## 観測
{何が観測されたか}

## 今回扱わない理由
{なぜ今すぐ対応しないのか}

## 影響
{影響の評価}

## レビューで決めること
{レビューで判断すべき点}

## 根拠（任意）
{補足情報・証拠}
```

**セクションに関する制約**:
- 各セクションの見出し名は固定しない。ユーザーの入力に合わせて適切に整理する
- 必須セクション・省略不可セクションを設けない（REQ-0017-037）
- frontmatter・状態値・メタデータフィールドを必須にしない（REQ-0017-038, REQ-0017-039）

## Steps

1. **入力の受領**: ユーザーから変更候補の内容を受け取る。自然言語で記述された内容をそのまま取り扱う。

2. **intake item の生成**: ユーザーの入力を上記 intake item 形式に整理する。ユーザーが明示的に指定していないセクションは、入力内容から推測して記載する。推測不能な場合は空セクションとして残す。

3. **ファイル名の生成**:
   - 日付: 実行時のシステム日付（`YYYY-MM-DD`）
   - topic-slug: タイトルから生成（小文字英数字・ハイフン区切り、30文字以内）
   - 形式: `YYYY-MM-DD-{topic-slug}.md`

4. **保存**:
   - 保存先: `.agentdev/intake/inbox/`
   - ディレクトリが存在しない場合は作成する
   - 同名ファイルが存在する場合は `{topic-slug}-2`, `{topic-slug}-3` のように連番を付与する

5. **完了報告** → `agentdev-workflow-reporting` の完了報告フォーマットに従って出力:
   ```
   ✅ intake item を保存しました。
     タイトル: {タイトル}
     ファイル: .agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md
     次のステップ: /agentdev/intake-review
   ```

## Guardrails

### 責務境界（REQ-0017-024, REQ-0019-024）
- G01: GitHub Issue の作成を行わない（`intake-open` が担当）
- G02: 採用可否の判断を行わない（`intake-review` が担当）
- G03: intake item の変更・更新を行わない（保存のみ）
- G04: review・整形・分類を行わない（後続コマンドの責務）
- G05: 対象は「未分類の作業候補・不整合・規約違反・未回収課題」に限定する（REQ-0019-024）。作業知見だけの内容（再発防止知見のみで具体的修正対象がないもの）は対象外
- G06: learning item の保存・分類・昇華を担当しない（REQ-0019-023）。再発防止知見のみの観測は `/agentdev/learning-capture` に委ねる

### 形式制約（REQ-0017-032〜039）
- G05: workflow 管理 artifact として扱わない（REQ-0017-033）
- G06: frontmatter・状態値・重複排除キー・後続 artifact 参照を必須にしない（REQ-0017-035, REQ-0017-039）
- G07: 特定セクションを必須セクションとして扱わない（REQ-0017-037）
- G08: review 結果を item に書き込まない（REQ-0017-038）

### 実行制約
- G09: ユーザーの入力内容を過度に解釈・変形しない（元の意図を保ったまま整理する）
- G10: 保存先は `.agentdev/intake/inbox/` のみ（他ディレクトリへの保存は禁止）
