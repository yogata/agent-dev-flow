# workflow-templates SKILL.md の「Issue作成時のテンプレート選定（case-close）」が内容なし見出し

## 観測

配布 command・skill 70 ファイルの文章品質是正（REQ-053-013 履行、PR #2484）で、agentdev-workflow-templates SKILL.md の「### Issue作成時のテンプレート選定（case-close）」が内容を持たない見出し（直後に「### 共通ルール」が続く）であることが確認された。case-close は Issue を作成しないため、見出し自体の妥当性にも疑義がある。

意味を一義的に復元できないため、本件（AG-005 推測修正禁止）では保持して是正していない。

## 影響

- テンプレート選定規約の読者に空見出しが残り、選定ルールの所在が不明瞭
- case-close 由来のテンプレート選定規約の有無が文書上確定しない

## レビューで決めること

- 見出しの削除（case-close は Issue を作成しないため不要）か、対応する選定規約の新規記載か
- 「### 共通ルール」への統合を含む本文構造の整理方針

## 根拠

- PR #2484 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2484 ）
