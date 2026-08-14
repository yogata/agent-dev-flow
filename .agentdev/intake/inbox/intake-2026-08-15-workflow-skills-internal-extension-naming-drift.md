# intake: 8 Workflow Skill の "internal Workflow Extension" 呼称ゆれ

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2116 Findings / Capture候補（OU-006 Extension 原子切替の配置照合）

## 問題事象

`agentdev-workflow-{case-run, case-open, case-close, case-auto, case-update, req-define, req-save, spec-save}` の extension 読込節が、フラットパス（= workflow-extension 配置）を「internal Workflow Extension」と呼称している（Wave 2 作成時の文言ゆれ）。配置・kind は OU-006 の移行結果（workflow-extension）と一致している。

## 影響

- 機能影響なし。ただし呼称が kind 名（internal-workflow-extension）と衝突し、読む agent が配置規則を誤解する恐れがある

## 発生局面

実装（OU-006 移行時の8 Workflow Skill 読み合わせ）

## 検知方法

8 Workflow Skill の extension 読込節と配置規則（`docs/specs/foundations/project-extensions.md`）の照合（PR 2116 Findings 記載）。

## 想定される対応方向

- 呼称を workflow-extension の正規名称へ是正
- OU-007（旧責務残存 cleanup）での文言是正候補。選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2106（OU-006）, PR: 2116
- 対象ファイル: `src/opencode/skills/agentdev-workflow-{case-run,case-open,case-close,case-auto,case-update,req-define,req-save,spec-save}/SKILL.md`

## 出典引用

PR 2116 本文 `## Findings / Capture候補` intake 節 5 より:

> 8 Workflow Skill の "internal Workflow Extension" 呼称: agentdev-workflow-{...} の extension 読込節がフラットパス（= workflow-extension 配置）を「internal Workflow Extension」と呼称（Wave 2 作成時の文言ゆれ）。配置・kind は本 PR の移行結果と一致するため機能影響なし。OU-007 での文言是正候補

## タグ

#intake #naming-drift #workflow-skill #extension-migration #epic-2099
