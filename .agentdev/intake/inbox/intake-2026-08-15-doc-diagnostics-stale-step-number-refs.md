# intake: agentdev-doc-diagnostics 内部 reference が inspect 系旧 Command 手順番号を参照し陳腐化

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2112 Findings / Capture候補（OU-004 移行作業の grep 検査）

## 問題事象

`src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md`（「inspect-docs Step 11、inspect-skills Step 3 でルーティングし」）と `diagnostic-routing.md`（「ルーティング表と inspect-docs Step との対応」節）が、inspect-docs / inspect-skills の旧 Command 手順番号を参照している。OU-002 / OU-003 / OU-004 の Workflow Skill 移行（Wave 2）で手順番号は各 Workflow Skill 側へ移動したため、この参照は陳腐化している。

## 影響

- `agentdev-doc-diagnostics` を読む agent が旧手順番号（Command 本文側に既に存在しない）を辿って誤誘導される可能性がある
- OU-005（16 Command SPEC 同期）と OU-007（旧責務残存 cleanup）の横断是正対象と重なる

## 発生局面

実装（Wave 2 Workflow Skill 移行の検証工程）

## 検知方法

`agentdev-doc-diagnostics` 配下の grep 検査（PR 2112 Findings 記載の検証作業）。

## 想定される対応方向

- 参照を旧 Command 手順番号から Workflow Skill の工程名・節名参照へ decoupling（`agentdev-doc-diagnostics` は OU-004 の対象成果物外のため本 PR では未修正）
- OU-005（Command SPEC 同期）または OU-007（旧責務残存 cleanup）での対応候補。選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2104（OU-004）, PR: 2112
- 対象ファイル: `src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md`, `src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-routing.md`

## 出典引用

PR 2112 本文 `## Findings / Capture候補` intake 節より:

> `src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md`（「inspect-docs Step 11、inspect-skills Step 3 でルーティングし」）と `diagnostic-routing.md`（「ルーティング表と inspect-docs Step との対応」節）が inspect-docs / inspect-skills の旧 Command 手順番号を参照している。

## タグ

#intake #stale-reference #doc-diagnostics #workflow-skill-migration #epic-2099
