# intake: Workflow/Capability 機械分類規則の workflow-skill-model SPEC 明文化（SPEC確定候補 見送り）

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2116 `## SPEC確定候補` 1（case-close Step 3-2 SPEC 確定フロー 処置 (c) 見送り）

## 問題事象

deterministic checker（check_extensions.ts）が実装した機械判定規則「Workflow Skill = `agentdev-workflow-{X}`（`src/opencode/commands/agentdev/{X}.md` が存在するもの16件）／他の agentdev-* ディレクトリは Capability Skill（横断 `agentdev-workflow-{orchestration,routing,lifecycle,templates}` 例外を含む）」が、workflow-skill-model SPEC では「workflow-* プレフィックスを持つ Capability Skill 的スキル」例外表から暗黙に導出可能なのみで、分類表として明文所有されていない。

## 影響

- checker 実装と SPEC の間で分類規則が暗黙依存。SPEC 側の例外表変更が checker 挙動に暗黙反映される構造

## 発生局面

case-close（Step 3-2 SPEC 確定フローの確定判断）

## 検知方法

checker 実装（check #1/#2/#5）と `docs/specs/workflows/workflow-skill-model.md` 159-168行（例外表）の照合。

## 見送り根拠（case-close Step 3-2 処置 (c)）

- 本候補は既存 SPEC（workflow-skill-model.md、status: draft）への新規規範内容追加であり、case-close の SPEC 確定フローが許す編集は draft→accepted 昇格（status frontmatter）に限られる
- checker は当該規則を実装・検証済み（実 repo ok=true、シナリオ 9/9）のため実装との不整合はないが、明文化は SPEC 内容変更を伴うため spec-save（UPDATE）または OU-007 cleanup のスコープ
- draft→accepted 昇格も実施しない（明文化対象の規則が本文に未所有の状態での昇格は確定判定として不十分）

## 想定される対応方向

- workflow-skill-model SPEC へ機械分類表を明文化（spec-save UPDATE）
- 選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2106（OU-006）, PR: 2116
- 対象ファイル: `docs/specs/workflows/workflow-skill-model.md`, `.opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts`

## 出典引用

PR 2116 本文 `## SPEC確定候補` 1 より:

> Workflow/Capability 決定的分類規則の明文化: checker が実装した「Workflow Skill = agentdev-workflow-{X}（src/opencode/commands/agentdev/{X}.md が存在）／他の agentdev-* は Capability Skill（横断 agentdev-workflow-* 含む）」という機械判定規則を、workflow-skill-model SPEC が分類表として明文所有するか（現状は「workflow-* プレフィックスを持つ Capability Skill 的スキル」例外表から暗黙に導出可能なのみ）

## タグ

#intake #spec-candidate #workflow-skill-model #extension-migration #epic-2099
