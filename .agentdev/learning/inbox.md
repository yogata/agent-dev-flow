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

---

## 境界 close 時の AUTOGEN 計測日 drift 再生成処置が直接 commit 禁止制約と競合（warn 先送り）

- **問題事象**: Case #3042 の case-close で実装 PR 3 件（#3047/#3048/#3049）squash merge 後の main HEAD @44cbd1b4 最終検査で、check_integrity IR-061（req-health-metrics 計測日 current=2026-09-20 / expected=2026-09-21）と check_autogen_freshness 違反 1 件を観測した。予測 NG 52 に対し実測 53（+1 = drift）。
- **発生局面**: デプロイ（case-close・Epic Wave クローズの merge 後最終検査）
- **検知方法**: check_integrity --json の NG セット両方向差分（baseline @60120646 detached worktree との集合比較）と check_autogen_freshness --json の機械実行
- **根本原因**: 計測日期待値は現行 REQ 群の最終 commit の committer date（%cI・local TZ 描画・generate_indexes.ts deriveReqMetricsMeasureDate）から導出される。#3047 の generate_indexes 実行時刻（JST 2026-09-20）と squash merge の committer date（JST 2026-09-21 00:11・日付跨ぎ）の間で計測日が 1 日ずれた。autogen-freshness-gate Design「計測日driftの発生機構」節（本 Case の ACT-DESIGN-004 で正典化）の機構3（squash merge による committer date 置換）+機構1（date rollover）の複合。一方で同規定の処置「境界 close では drift 検出時 generate_indexes で再生成してから green 判定」は、境界が main 直接 commit を禁止する局面（tag 作成を直後に控えた RC 境界等）では実行できないという運用ギャップが本観測で顕在化した。
- **自律対応内容**: 再生成を実施せず、drift の増減内訳（@c8d33c8e 56 → #3047 −1 IR-061 旧・−2 broken-file-link → #3048 −1 workflow-status-prohibition → コンテンツ上 52〔予測と一致〕→ +1 rollover drift = 53）を完全特定して warn 判定として対応記録コメントに記録した。main への直接 commit は実施せず tag 対象ツリーを不変に保った。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（drift 機構自体は autogen-freshness-gate Design に正典化済み。運用ギャップの反映可否は learning-promote の評価対象）
- **横展開観点**: tag 作成など直接 commit 禁止の境界 close では、freshness green 判定の前提として「再生成処置の実行可否」を判定材料に含める。最終実装 PR の generate_indexes 実行から merge 完了までの日付跨ぎ（local TZ 深夜 0 時）が close 検査に与える影響の事前確認で予測精度が向上する
- **再発条件**: squash merge を伴う境界 close が、最終実装 PR の AUTOGEN 再生成実行日とは異なる日付（local TZ）で完了する場合（とくに深夜跨ぎで merge が実行される場合）
- **予防策候補**: ① case-close の freshness 判定基準へ「再生成不能局面（直接 commit 禁止）では drift を時間依存の測定誤差として増減内訳記録付き warn 扱いとする」明文化 ② 境界 close の merge 実行を AUTOGEN 再生成と同一日内に完了させる運用 ③ tag 実施側への引継ぎとして次回 docs commit の generate_indexes で解消することの明記
- **想定反映先**: docs/designs/integrity/autogen-freshness-gate.md（drift 3 機構節の処置補遺）・src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md（AUTOGEN 鮮度 gate 節）
- **関連**: #3042・PR #3047（merge 6967bdc0）・docs/designs/quality/req-health-metrics.md・generate_indexes.ts deriveReqMetricsMeasureDate
- **タグ**: `#autogen` `#case-close` `#drift` `#squash-merge`
