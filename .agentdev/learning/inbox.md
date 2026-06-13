# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 2026-06-13: integrity-rule-catalog SPEC の追記 lag

- **コンテキスト**: REQ-0108-244 APPEND時に `docs/specs/integrity-rule-catalog.md` への新規 catalog entry 追加を漏らした
- **学び**: REQ-0108 に新規要件を APPEND する際、対応する integrity-rule-catalog entry の追加をセットで行う必要がある。catalog は REQ-0108-150/151 時点の定義が基準であり、それ以降の APPEND分は手動追記が必要
- **再発防止**: req-save で REQ-0108 に APPEND する際、integrity-rule-catalog.md の該当 entry 有無を確認ステップに含めることを検討する

