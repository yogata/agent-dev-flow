# REQ-0114 に歴史的叙述（「従来〜」）が現行要件文中に残留

## 概要

`docs/requirements/REQ-0114.md` の L110 に歴史的文脈（「従来 depends_on ...」）が blockquote で記述されている。REQ-0108-205 は、歴史的文脈を retired 文書や mapping table に配置すべきとし、現行要件文中の記述を避けることを求める。

```
> - **運用メモ**: 従来 depends_on （技術的独立姓のみ）運用では、全 OU を Standard Issue として分散...
```

該当箇所は case-auto の Epic 運用に関する旧運用（独立 OU のみ Epic 対象）の説明であり、現行要件判断には不要な歴史的背景情報にあたる。

## 提案しなかった理由

本 finding は `/repo/docs-check`（機械的整合性検査）の検出結果であり、採否は `intake-promote` に委譲する前提のため。当該 blockquote が現行運用の理解に必要な文脈か、純粋な歴史情報かは要件担当者の判断が必要。

## テーマ

- 文書ドリフト・歴史的叙述の配置規律
- 関連 REQ: REQ-0108-205（historical narrative detection）

## レビューで決めること

- 当該「運用メモ」blockquote を mapping table または retired 文書へ移動するか、現行 REQ 文中に残す（必要な文脈と判断）か
- 残す場合、歴史情報であることを明示する修飾（「（廃止済み運用）」等）を付与するか

## 備考

- **Finding 分類**: WARNING / DocumentDrift / historical-narrative
- **Route**: intake
- **根拠**: `/repo/docs-check` 実行（2026-06-25）。`.agentdev/integrity/reports/2026-06-24-integrity-report.md`。対象行: `docs/requirements/REQ-0114.md:110`
- **原因分類**: 確認済（「従来 depends_on」の叙述を直接確認）
