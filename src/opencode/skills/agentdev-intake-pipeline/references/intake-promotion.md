# Intake Promote 詳細手順

intake-promote が `.agentdev/intake/inbox/` 内の item を review、分類、整形、振り分けする際の詳細手順を定義する。
親エージェントは分類確定、保存、移動、commit、push、完了報告を担当する。
サブエージェントへ委譲する場合は item 読解、分類候補、根拠、capture 候補の抽出のみを依頼する。

## Inbox 確認

1. `.agentdev/intake/inbox/` 内のファイル一覧を取得する。
2. item 数をカウントする。
3. inbox が空の場合はその旨を報告して終了する。
4. 各 intake item を読み込み、内容を把握する。

## Review 観点

各 item を以下の観点で評価する。

- 観測内容の妥当性、重要性
- 影響の程度
- 対応の緊急度、優先度
- 既存要件、仕様との関連
- 対応方針の方向性
- intake ではなく learning に分けるべきか

learning 分岐は `agentdev-workflow-orchestration` の intake/learning 境界判定を参照する。
具体的な修正対象がなく再発防止知見のみの場合は learning に委ねる。

## 分類提示形式

分類結果は採用/ 保留/ 却下で提示する。

```markdown
## Findings / Capture候補

| # | タイトル | 分類 | 後続 | 備考 |
|---|----------|------|------|------|
| 1 | ... | 採用 | backlog-review | ... |
| 2 | ... | 保留 | - | ... |
| 3 | ... | 却下 | - | ... |
```

## ユーザー確認

1. 各 item の分類と理由を提示する。
2. ユーザーの追加コンテキストを受け付ける。
3. 分類の修正指示を受け付ける。
4. ユーザーの明示的な承認なしに保存、移動へ進まない。
5. 全 item の分類が確定するまで対話を継続する。

## 採用 item 整形

1. 観測内容、影響、課題を整理する。
2. backlog-review が分析しやすい形式に構造化する。
3. 既存要件との関連、差分を明記する。
4. 複数 item を束ねる場合は統合内容を整理する。
5. 成果物は `.agentdev/intake/promoted/` 直下にフラット配置する。
6. 成果物の frontmatter に route や status を記録しない。

## 保存と振り分け

1. `.agentdev/intake/promoted/` が存在しない場合は作成する。
2. ファイル名は `YYYY-MM-DD-{topic-slug}.md` とする。
元 item 名を維持するか、束ねた内容に応じた名前にする。
3. 採用 item の元 inbox item は `.agentdev/intake/archive/promoted/` に移動する。
4. 保留 item は `.agentdev/intake/inbox/` に残す。
5. 却下 item は `.agentdev/intake/archive/rejected/` に移動する。
6. `archive/promoted/` または `archive/rejected/` が存在しない場合は作成する。

## Git 永続化

1. `git pull --ff-only` を実行する。
2. pull が失敗した場合は構造化エラーメッセージを表示して停止し、自動解消しない。
3. `git diff --name-only` で `.agentdev/intake/` 配下の変更ファイルを確認する。
4. 変更なしの場合は commit/push せず、完了報告で「変更なし」と報告する。
5. 変更ありの場合、`git add` は `.agentdev/intake/` 配下の変更ファイルのみを対象とする。
6. commit message は `chore(agentdev): review and promote intake items` とする。
7. `git push` を実行する。
8. push が失敗した場合は構造化エラーメッセージを表示し、完了扱いにしない。

