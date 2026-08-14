# intake: 16 Command 本文の旧 extension パス prose 宣言残存

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2116 Findings / Capture候補（OU-006 Extension 原子切替の grep 検査）

## 問題事象

`src/opencode/commands/agentdev/*.md` 各16件の「project extensions」節が旧パス `.agentdev/extensions/commands/{name}.yaml` の読込を宣言したまま残存している。Wave 2 thin Command 化時の残存。OU-006 では commands 編集禁止のため未修正。

## 影響

- 機能障害なし。ファイル不在時は boilerplate 自身の「存在しない場合は標準動作で続行」により missing 扱いで標準継続する
- 実態（`.agentdev/extensions/skills/agentdev-workflow-{name}.yaml`）と宣言（旧パス）が不一致しており、読む agent を誘導する恐れがある

## 発生局面

実装（OU-006 移行時の runtime dependency grep 証跡）

## 検知方法

`src/opencode/` 配下での `agentdev/extensions/commands` grep（PR 2116 実行、case-close で再確認: 16 command 本文に prose 残存）。

## 想定される対応方向

- 16 Command 本文の extension パス宣言を `.agentdev/extensions/skills/agentdev-workflow-{name}.yaml` へ更新
- OU-007「旧責務残存 cleanup」の対象候補。選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2106（OU-006）, PR: 2116
- 対象ファイル: `src/opencode/commands/agentdev/*.md`（16件）

## 出典引用

PR 2116 本文 `## Findings / Capture候補` intake 節 1 より:

> 16 command 本文の旧 extension パス参照残存: `src/opencode/commands/agentdev/*.md` 各16件の「project extensions」節が旧パス `.agentdev/extensions/commands/{name}.yaml` 読込を宣言したまま（Wave 2 thin Command 化時の残存。本 Issue では commands 編集禁止のため未修正）。ファイル不在時は boilerplate 自身の missing 扱いで標準継続するため機能障害なし。OU-007「旧責務残存 cleanup」の対象候補。

## タグ

#intake #stale-reference #extension-migration #epic-2099
