---
description: Command→Skill 参照妥当性と Skill 構造を read-only で診断する
agent: sisyphus
---

# skill-review

Command→Skill 参照妥当性と Skill 構造を read-only で診断し、finding、分類、根拠、推奨 route を提示する。

## 基本原則: 診断専用（Read-Only）

**診断のみを実行し、一切の副作用を伴わない。**

- 診断結果の提示
- 根拠と推奨 route の提示
- ファイル変更・Issue作成・PR作成・RU保存・commit・push の禁止

## Input

- Command 定義ファイル群
- Skill 定義ファイル群
- 必要に応じて関連する template / reference / script ファイル群

## Output

- 診断レポート（セッション内テキスト出力のみ、ファイル出力なし）
- finding リスト（対象、観点、分類、根拠、推奨 route）
- 必要に応じた追加確認候補

## Steps

1. **診断対象の読込**: Command / Skill 定義を読み込み、Command→Skill 参照、Skill frontmatter、本文構造、references 利用、template / script 参照を把握する
2. **各診断観点の評価**: `agentdev-skill-review` に従い、参照妥当性、粒度、段階的開示、責務境界、canonical name、内部構造依存を評価する
3. **分類**: finding ごとに `agentdev-skill-review` の診断分類ラベルを付与する
4. **route 提示**: 修正は実行せず、Command 側、Skill 側、template 側、script 側、または運用 Skill 参照のどこに寄せるべきかを提示する
5. **診断結果の出力**: finding、分類、根拠、推奨 route、残リスクを簡潔に報告する

## Guardrails

- G01: ファイルを変更・作成・削除しない。診断結果はセッション内テキスト出力のみ
- G02: GitHub Issue/PR を作成・更新しない
- G03: RU、intake、learning、backlog artifact を保存しない
- G04: commit / push / branch / worktree 操作を行わない
- G05: 自動修正せず、推奨 route の提示に留める
- G06: Command は公開 API と実行導線、Skill は再利用可能な判断基準という境界で判定する
- G07: Skill 内部の見出し名、Step 名、protocol 名への Command 依存を妥当な参照として扱わない

## Error Handling

| エラー | 対処 |
|--------|------|
| 対象ファイルが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| 参照先 Skill が存在しない | finding として報告し、canonical name の確認を推奨 |
| 判定根拠が不足 | 不確実性を明記し、追加確認 route を提示 |
