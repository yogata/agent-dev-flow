# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## Definition PR 受入期待値（NG セット完全一致・autogen 0）が merge 後実測で乖離（+2 NG・+1 autogen 違反）

- **問題事象**: Case #3042 の Definition PR #3043 は PR 本文期待値として「check_integrity NG セット baseline 完全一致・autogen 0」を宣言していたが、case-ready の merge 後受入検査（@97953f3e）で NG 54→56（IR-061 AUTOGEN 不整合・workflow-status-prohibition ヒューリスティック NG の 2 件追加）と autogen 鮮度違反 0→1 を観測した。
- **発生局面**: レビュー（case-ready 受入検査・Definition PR merge 後）
- **検知方法**: check_integrity --json の NG セット両方向差分（merge 後 main HEAD と baseline @60120646 detached worktree）および check_autogen_freshness の機械実行
- **根本原因**: PR 作成時の品質検証は UTF-8 健全性・期待内容出現回数の検証にとどまり、構成済み tree（branch HEAD）全体に対する機械チェック（check_integrity・autogen gate・traceability）を実行していなかった。REQ 行追加（REQ-001-069 による req-health-metrics AUTOGEN 期待値 64→65）と Design 節追加文言（frontmatter キー列挙 title/status/created/updated の status...created 共起）が checker 検出パターンに掛かることを事前予測できていなかった。
- **自律対応内容**: 乖離を増減理由型（両方向差分: 除去 0・追加 2・総数 962 不変 = 2 check の ok→ng 反転）で記録し、解消責務を実行構造の子 Issue へ割当て（#3044: 索引再生成・#3045: checker 実装と文言調整）て ready 遷移した。Root Case 本文の「受入検査」節に数値を永続化した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（新規 REQ-061-037 が AUTOGEN 同一 commit 再生成を要求するのは今後の Definition 保存向け規則であり本 PR は適用前状態で merge。解消は case-run 実行契約へ反映済み）
- **横展開観点**: REQ 行追加・Design 節追加を伴う Definition PR の作成時検証では、PR 本文へ期待値を宣言する前に branch HEAD 実測で check_integrity・autogen・traceability を実行し期待値を実測確定すべき
- **再発条件**: REQ 行追加や Design frontmatter 言及を含む docs 変更の Definition PR で、PR 作成時検証が文字列検証のみにとどまる場合
- **予防策候補**: case-open の Definition PR 作成手順へ「PR 期待値は branch HEAD 実測で確定する」前置の追加（本 Case の RA-010/TS-010 配布反映と同系で case-run で対応予定）
- **想定反映先**: src/opencode/skills/agentdev-workflow-case-open/references/（Definition PR 作成手順）
- **関連**: #3042・PR #3043・docs/designs/quality/req-health-metrics.md・docs/designs/integrity/checker-execution-contracts.md L246
- **タグ**: `#definition-pr` `#acceptance` `#baseline-drift`
