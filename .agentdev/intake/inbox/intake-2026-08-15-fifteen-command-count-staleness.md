# intake: 「15の agentdev command」計数 staleness

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2116 Findings / Capture候補（OU-006 移行の読み合わせ）

## 問題事象

`agentdev-project-extensions` SKILL.md「公開契約宣言と詳細契約の分離」節（および artifact-responsibilities SPEC 適用パターン1）の「15 command」が、現状の16 command と不一致している（pre-existing）。

## 影響

- 計数が実態と異なる。SPEC と SKILL.md が共通文言のため、片側のみ修正すると交叉不一致になる

## 発生局面

実装（OU-006 の文書読み合わせ）

## 検知方法

SKILL.md・SPEC の計数記述と `src/opencode/commands/agentdev/` 実ファイル数の照合（PR 2116 Findings 記載）。

## 想定される対応方向

- SKILL.md と artifact-responsibilities SPEC の両側を同一コミット粒度で 16 へ更新
- OU-007 での対応候補。選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2106（OU-006）, PR: 2116
- 対象ファイル: `src/opencode/skills/agentdev-project-extensions/SKILL.md`, `docs/specs/responsibilities/artifact-responsibilities.md`

## 出典引用

PR 2116 本文 `## Findings / Capture候補` intake 節 4 より:

> 「15の agentdev command」の計数 staleness: agentdev-project-extensions SKILL.md「公開契約宣言と詳細契約の分離」節（および artifact-responsibilities SPEC 適用パターン1）の「15 command」が現状の16 command と不一致（pre-existing。SPEC と共通の文言のため片側のみ修正すると交叉不一致になる）

## タグ

#intake #stale-reference #count-drift #epic-2099
