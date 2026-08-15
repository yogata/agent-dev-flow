# intake: agentdev-doc-diagnostics「探索順」委譲先表記の残余曖昧さ（L60 再定義と不整合）

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2117 Findings / Capture候補（OU-007 cleanup における Wave 4 intake 指摘③対応時の読み合わせ）

## 問題事象

`src/opencode/skills/agentdev-doc-diagnostics/SKILL.md` 本文（L10/L47/L85）に「探索順」を専門 skill（`agentdev-doc-map`）への委譲先として挙げる記述が残る。agentdev-doc-map は OU-006（Wave 4）で削除済みであり、PR 2117 では description と `references/finding-output-contract.md` 表行からの直接言及を除去したが、本文の委譲先表記までは手が回っていない。一方 L60 は「README 索引の整合性は本スキルが、探索順序の詳細は README 群が担う」と再定義しており、委譲先表記（skill へ委譲）と責務再定義（README 群が担う）の間に残余曖昧さがある。

## 影響

- `agentdev-doc-diagnostics` を読む agent が、存在しない `agentdev-doc-map` への委譲先表記を辿って誤誘導される可能性がある
- 診断カテゴリ（探索順）の担当主体が SKILL.md 内で二重に表明されている状態が継続する

## 発生局面

実装（Wave 5 旧責務残存 cleanup。Wave 4 intake 指摘③の消費過程で隣接残余を検出）

## 検知方法

intake ③（doc-map 直接言及除去）対応時の SKILL.md 全文読み合わせ。機械検査（check_workflow_preventive.ts）の対象外（semantic 領域、AG-008 の管轄分離どおり）。

## 想定される対応方向

- L10/L47/L85 の委譲先表記を L60 の再定義（README 群が探索順序の詳細を担う）に整合するよう統一
- agentdev-doc-diagnostics は OU-007 の修正対象外として本 PR では未修正。選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2107（OU-007）, PR: 2117
- 対象ファイル: `src/opencode/skills/agentdev-doc-diagnostics/SKILL.md`
- 関連 intake: `intake-2026-08-15-doc-diagnostics-deleted-doc-map-mention.md`（③ 直接言及。PR 2117 で消費済み）

## 出典引用

PR 2117 本文 `## Findings / Capture候補` intake 節より:

> 本 PR で agentdev-doc-map への直接言及（description、finding-output-contract.md 表行）は除去したが、SKILL.md 本文（L10/L47/L85）に「探索順」を専門 skill への委譲先として挙げる記述が残る。L60 は「README 索引の整合性は本スキルが、探索順序の詳細は README 群が担う」と再定義しており、委譲先表記との間に残余曖昧さがある。

## タグ

#intake #doc-diagnostics #traversal-order #deleted-skill-residual #epic-2099
