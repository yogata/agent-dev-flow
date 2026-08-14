# intake: agentdev-doc-diagnostics による削除済み agentdev-doc-map スキルの言及残存

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2116 Findings / Capture候補（OU-006 doc-map extension 削除判断の副産物）

## 問題事象

`agentdev-doc-diagnostics` の description と `references/finding-output-contract.md` が agentdev-doc-map を「探索順」担当として言及している。当該スキルは REQ-013 段階4a（commit 87f00c48）で削除済みであり、参照先が存在しない（pre-existing 残存）。

## 影響

- 読む agent が存在しないスキルを辿る恐れがある

## 発生局面

実装（OU-006 の doc-map 死残存削除判断時）

## 検知方法

`agentdev-doc-diagnostics` 配下の grep 検査（PR 2116 Findings 記載）。

## 想定される対応方向

- description・references から agentdev-doc-map 言及を除去
- OU-007（旧責務残存 cleanup）の対象候補。選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2106（OU-006）, PR: 2116
- 対象ファイル: `src/opencode/skills/agentdev-doc-diagnostics/SKILL.md`, `src/opencode/skills/agentdev-doc-diagnostics/references/finding-output-contract.md`

## 出典引用

PR 2116 本文 `## Findings / Capture候補` intake 節 3 より:

> agentdev-doc-diagnostics による削除済み agentdev-doc-map スキルの言及残存: description と references/finding-output-contract.md が agentdev-doc-map を「探索順」担当として言及（REQ-013 段階4a でスキル削除済みの pre-existing 残存）

## タグ

#intake #stale-reference #doc-diagnostics #extension-migration #epic-2099
