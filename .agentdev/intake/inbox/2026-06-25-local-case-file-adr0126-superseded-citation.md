# local-case-file.md の関連項目が superseded ADR-0126 を引用

## 概要

`docs/specs/local-case-file.md` の「関連項目」セクション（L242）が `ADR-0126`（status: superseded, superseded_by: ADR-0131）を現行基準として引用している。

```
- ADR-0126（ローカル版 OpenCode 生成基盤の source model 拡張と生成安全性制約）
```

ADR-0126 は ADR-0131（link model）に superseded 済み。現行基準としての引用は `accepted` status の ADR-0131 に差し替えるか、supersession 关系を明記すべき。

## 提案しなかった理由

本 finding は `/repo/docs-check`（機械的整合性検査）の検出結果であり、採否は `intake-promote` に委譲する前提のため。

## テーマ

- ADR lifecycle・accepted ADR のみ引用規律
- 関連 REQ: REQ-0112（ADR ライフサイクル標準化・文書体系正規化）、REQ-0108-125（accepted 以外の ADR 引用検出）

## レビューで決めること

- `ADR-0126` の引用を `ADR-0131`（link model）へ差し替えるか、両者を併記して supersession 关系を明記するか
- 同種の ADR-0126 残存引用を一括で処理する Issue を起票するか（後述の既存 inbox item との統合を含む）

## 備考

- **Finding 分類**: WARNING / ADR / accepted-adr-only-citation
- **Route**: intake
- **根拠**: `/repo/docs-check` 実行（2026-06-25）。`.agentdev/integrity/reports/2026-06-24-integrity-report.md`。対象行: `docs/specs/local-case-file.md:242`
- **原因分類**: 確認済（ADR-0126 status: superseded, superseded_by: ADR-0131 を直接確認）
- **重複確認**: 同じ ADR-0126 superseded 引用のうち `docs/guides/glossary.md:82` は既存 inbox item `2026-06-24-issue1114-residual-adr0126-generation-mode-terms.md` が網羅済み。本 item は `local-case-file.md` のみを対象とする（既存 item のスコープ外）。`intake-promote` で両者を統合した Issue 化を検討してもよい
