# intake: resolver 状態機械の二層実装構成の正規化（SPEC確定候補 見送り）

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2116 `## SPEC確定候補` 3（case-close Step 3-2 SPEC 確定フロー 処置 (c) 見送り）

## 問題事象

runtime（`agentdev-project-extensions` SKILL.md 手続き）と決定的検証（checker の `resolveExtensionState`）で Extension 読込状態機械を共有実装する構成が本 PR で実現済みだが、「runtime は LLM 手続き、機械検証は checker」という責務分離としての正規化が SPEC 上に明文化されていない。

## 影響

- 二層構成の意図が SPEC にないため、将来の再実装・分割時に単一実装の共有構成が暗黙前提として失われる恐れがある

## 発生局面

case-close（Step 3-2 SPEC 確定フローの確定判断）

## 検知方法

SKILL.md 状態分類節と checker `resolveExtensionState` 実装の照合（S1〜S9 シナリオで両者が一致することを検証済み）。

## 見送り根拠（case-close Step 3-2 処置 (c)）

- 本候補は project-extensions / workflow-skill-model 等 SPEC への新規規範内容追加であり、case-close の SPEC 確定フローが許す編集（draft→accepted 昇格）の範囲外
- docs 編集は本 remediation では OU-005（同期済み）・OU-007（cleanup）にスコープ分けされているため、spec-save（UPDATE）での対応が正規経路

## 想定される対応方向

- 責務分離（runtime = LLM 手続き、機械検証 = checker 共有実装）を project-extensions SPEC または workflow-skill-model SPEC へ明文化（spec-save UPDATE）
- 選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2106（OU-006）, PR: 2116
- 対象ファイル: `src/opencode/skills/agentdev-project-extensions/SKILL.md`, `.opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts`, `docs/specs/foundations/project-extensions.md`

## 出典引用

PR 2116 本文 `## SPEC確定候補` 3 より:

> resolver 状態機械の二層実装構成: runtime（SKILL.md 手続き）と決定的検証（checker の resolveExtensionState）で状態機械を共有実装する構成の正規化（runtime は LLM 手続き、機械検証は checker、という責務分離の明文化）

## タグ

#intake #spec-candidate #project-extensions #extension-migration #epic-2099
