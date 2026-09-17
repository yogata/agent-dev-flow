# REQ 行 APPEND の Definition PR 群が req-health-metrics 計測例 AUTOGEN ブロックを再生成せず docs-check AUTOGEN gate が main で失敗状態（整備候補）

## 観測

Case #2903（Definition PR #2910）の case-ready 品質検査で、main 上の `check_autogen_freshness.ts` が strict failure（exit 1）であることを確認した。`docs/designs/quality/req-health-metrics.md` の `req-metrics-measurement-example` ブロックは REQ-057 を 29 行と表示するが、現行 main の REQ-057.md は 34 行（001〜030、033〜036）。REQ 行 APPEND を merge した Definition PR 群（#2894〔REQ-057-030〕、#2907〔REQ-057-035〕、#2909〔REQ-057-034〕等）が同 commit での AUTOGEN 再生成を行っていない。最後の再生成は計測日再生成 commit 8ac79899。

## 今回扱わない理由

本 Case（#2903）の合意済み Definition は REQ-057-033 行追加のみであり、AUTOGEN ブロックの再生成は対象範囲外。当該陳腐化は先行する並行 merge（#2894 等）由来の既存不整合で、単独 case-ready での解消は共有領域（docs/designs/quality/req-health-metrics.md）への対象範囲外書き込みになる。

## 影響

docs-check STEP-1 の AUTOGEN 鮮度検出 gate が main の状態で恒常的に fail となり、REQ-010-059 / autogen-freshness-gate Design の strict failure 取り扱い（docs-check 全体 fail）と競合する。REQ-057-018（REQ 行 append の AUTOGEN 対象索引の同 commit 再生成前置）の「AUTOGEN 対象索引」に行数集計ブロックが含まれるかの解釈が、Definition PR 本文の AUTOGEN 索引影響分析（ファイル単位索引のみ分析し「再生成不要」と結論した実例: PR #2910）と gate 実装（行数集計ブロックを検査対象に含む）の間で非対称のまま残る。

## レビューで決めること

(1) 計測日再生成 commit（8ac79899 前例）による即時解消を先行整備 Case として切り出すか。(2) REQ-057-018 の「AUTOGEN 対象索引」の定義を行数集計ブロック（req-metrics-measurement-example）込みで明示するか、Definition PR 本文の AUTOGEN 索引影響分析に行数集計ブロックの評価を必須化するか。既存 intake（2026-09-17 req-define catalog registration、learning inbox 2026-09-16 docs_chore APPEND unclassified）との統合・分割判定。

## 根拠（任意）

`bun run .opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts --root .` exit 1（2026-09-17、main 03c58bf4 時点。block req-metrics-measurement-example、current 56 lines / expected 57 lines）。PR #2910 本文「AUTOGEN 索引影響」セクション。commit 21dfdd9c（#2894）・4373fce0（#2909）・03c58bf4（#2910）の各 diff（docs/requirements/REQ-057.md のみ変更で AUTOGEN 再生成なし）。

## intake-promote 確定注記（2026-09-18、adversarial-review 実施済み）

本 item は intake-promote の対論型レビューを経て「採用（対象限定）」で自律確定した。

- 対象限定: main の strict failure 即時解消（先行整備 Case）は現行 tree で解消済み（REQ-057.md 36 行と AUTOGEN 表示 36 行の一致、計測日 2026-09-18 を確認）。本 item の採用対象は、REQ-057-018 の「AUTOGEN 対象索引」定義の非対称解消と再発構造（日付跨ぎ・REQ 行変動で AUTOGEN が滞留し docs-check gate が fail する構造）の恒久対策である。
- 同一事象の学びが learning-promote 2026-09-18 で採用済み成果物「design-candidate-autogen-staleness-prevention.md」として同時昇格している。統合判定は backlog-review で実施すること。
- 観測内訳の「REQ-057-031/032 欠番」表現は検証未了のため、根拠の引用は commit ハッシュ付き実行記録ベースとすること（中核観測への影響なし）。
