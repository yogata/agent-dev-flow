# intake: agentdev-project-extensions skill SPEC の旧契約記述残存

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2116 Findings / Capture候補（OU-006 Extension 原子切替の整合確認）

## 問題事象

`docs/specs/skills/agentdev-project-extensions.md` が旧配置（`.agentdev/extensions/commands/` 併記）と旧状態分類（不在 / 破損のみ）で記述されており、`docs/specs/foundations/project-extensions.md`（新3種 kind、5状態分類）と乖離している。

## 影響

- skill SPEC と foundations SPEC の交叉不一致。読む agent が旧配置・旧状態分類を正と誤認する恐れがある

## 発生局面

実装（OU-006 移行の SPEC 整合確認）

## 検知方法

`docs/specs/skills/agentdev-project-extensions.md` と foundations/project-extensions.md の内容照合（PR 2116 Findings 記載）。

## 想定される対応方向

- skill SPEC を新3種 kind・新配置・5状態分類へ UPDATE
- spec-save（UPDATE）または OU-007 での対応候補。選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2106（OU-006）, PR: 2116
- 対象ファイル: `docs/specs/skills/agentdev-project-extensions.md`

## 出典引用

PR 2116 本文 `## Findings / Capture候補` intake 節 2 より:

> agentdev-project-extensions skill SPEC の旧契約記述: `docs/specs/skills/agentdev-project-extensions.md` が旧配置（commands/ 併記）・旧状態分類（不在/破損のみ）で foundations SPEC と乖離。docs 編集禁止のため未修正。spec-save または OU-007 での UPDATE 候補

## タグ

#intake #stale-reference #spec-update #extension-migration #epic-2099
