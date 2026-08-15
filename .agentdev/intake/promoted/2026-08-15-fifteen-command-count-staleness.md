# 「15の agentdev command」計数の陳腐化（実数は16）

## 観測内容

SKILL.md と artifact-responsibilities SPEC に記載された「15 command」という計数が、現状の 16 command と不一致している。両ファイルが共通文言のため、片側のみ修正すると交叉不一致になる。

intake-promote が実ファイル検証済み: `src/opencode/commands/agentdev/` 配下は 16 command + README.md（テンプレートファイルなし）。item の主張する「16」は正しい。

## 影響

- 読み手がコマンド数を誤認する
- 共通文言のため片側修正で SPEC/SKILL 間の不一致を生む

## 課題

SKILL.md と artifact-responsibilities SPEC の両方を同一コミット粒度で 16 へ更新する。

## 既存要件・成果物との関連

- 対象: 「15 command」記述を含む SKILL.md、artifact-responsibilities SPEC（2ファイル）
- 検証: 16 command（2026-08-15 時点、intake-promote 実測）

## 出典

- 発生日: 2026-08-15
- 取得元: 検証・観測
- 元 item: intake-2026-08-15-fifteen-command-count-staleness.md
