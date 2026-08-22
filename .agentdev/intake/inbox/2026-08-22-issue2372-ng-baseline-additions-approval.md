# NG baseline 171 エントリの承認か是正かの判断（issue-2372-ir063/064/065-initial-baseline、既知違反 222 件）

## 観測

docs-check 新規機械検査クラス 4 種の導入（PR #2376、Issue #2372）に伴い、導入時点の既知違反 222 件を NG baseline additions manifest に登録した（provenance: issue-2372-ir063-initial-baseline 140 件、issue-2372-ir064-initial-baseline 48 件、issue-2372-ir065-initial-baseline 34 件の 3 provenance、計 171 エントリ。reason 記録あり）。baseline-known は info 降格しており、新規カテゴリの delta は 0 である。

## 今回扱わない理由

baseline の承認（info 降格の継続）か是正（一括解消）かは運用判断であり、検査実装の完了条件（REQ-010-064〜068）とは別件である。case-close の capture 責務は回収・保存のみである。

## 影響

承認しないまま放置すると baseline-known 222 件が承認痕跡なしの info のまま残存する（v2:REQ-0161-005 の承認痕跡要件との整合が未確定）。是正する場合は Gxx 140 件の再採番が B-01（採番規則の Design 確定）の解消を前提とする。

## レビューで決めること

- 3 provenance（ir063/064/065-initial-baseline）ごとの承認継続か是正計画の立案
- Gxx 140 件の再採番を B-01（採番規則 Design）の後続として紐付けるか
- baseline 承認の正規な承認痕跡（HITL 確定）の記録方法

## 根拠

- PR #2376 本文「Findings / Capture候補」intake 1、「baseline 運用」節（additions manifest の provenance 別内訳表）
- baselines/ng-baseline.json（.opencode/skills/repo-agentdev-integrity/baselines/）
