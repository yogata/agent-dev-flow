---
description: Command→Skill 参照妥当性と Skill 構造を read-only で診断する
agent: sisyphus
---

# inspect-skills

Command→Skill 参照妥当性と Skill 構造を read-only で診断し、finding、分類、根拠、推奨 route を提示する。診断結果は `.agentdev/inspect/inbox/` へ出力する。

## 基本原則: 診断専用（Read-Only）

診断を基本とし、許可される side effect は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成のみ。

- 診断結果の提示
- 根拠と推奨 route の提示
- canonical docs 変更・REQ/ADR/SPEC 変更・Command/Skill/Template/Script 変更・Issue作成・PR作成・RU保存・commit・push の禁止

## Input

- Command 定義ファイル群
- Skill 定義ファイル群
- 必要に応じて関連する template / reference / script ファイル群

## Output

- 診断レポート（セッション内テキスト出力）
- finding リスト（対象、観点、分類、根拠、推奨 route）
- `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`（finding file 出力）

## Steps

1. **診断対象の読込**: Command / Skill 定義を読み込み、Command→Skill 参照、Skill frontmatter、本文構造、references 利用、template / script 参照を把握する
2. **各診断観点の評価**: `agentdev-inspect-skills` に従い、参照妥当性、粒度、段階的開示、責務境界、canonical name、内部構造依存を評価する
3. **分類**: finding ごとに診断分類ラベルを付与する
4. **route 提示**: 修正は実行せず、推奨 route を提示する
5. **finding 出力**: finding を `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md` へ出力
6. **完了報告**: 完了報告 template に従って出力

## Guardrails

- G01: ファイルを変更・作成・削除しない。ただし `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成は例外として許可する
- G02: GitHub Issue/PR を作成・更新しない
- G03: RU、intake、learning、backlog artifact を保存しない
- G04: commit / push / branch / worktree 操作を行わない
- G05: 自動修正せず、推奨 route の提示に留める

## Error Handling

| エラー | 対処 |
|--------|------|
| 対象ファイルが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| 参照先 Skill が存在しない | finding として報告し、canonical name の確認を推奨 |
