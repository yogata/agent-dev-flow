# docs/README.md の REQ 詳細一覧表（hand-curated）が新規 REQ CREATE 後の行追記を欠き、陳腐化し得る運用の明確化候補

## 観測

Case #2917（実装 PR #2923）の case-run で、`docs/README.md` の REQ 詳細一覧表（hand-curated、`generate_indexes` 管理外）が REQ-083・REQ-087 の行を欠いていることを確認した。表は REQ-082 までで止まり、件数 AUTOGEN は53件を表示する。新規 REQ CREATE を含む Definition PR（#2919〔REQ-087〕等）と実装 PR 群が詳細表の追記を行っていない。

## 今回扱わない理由

本 Case（#2917）の合意済み Definition（REQ-087-001〜003）は詳細表の編集を対象範囲に含まず、hand-curated 表の運用変更は新しい意味判断となるため対象範囲外。

## 影響

新規 REQ CREATE のたびに hand-curated 詳細表が取り残され、README の案内層としての完全性が陳腐化する。REQ 行 APPEND では req-health-metrics AUTOGEN 再生成の gate が存在するが（REQ-057-018、intake 2026-09-17 req-row-append-autogen-metrics-block-stale との関連）、詳細表には相当する鮮度 gate が存在しない。

## レビューで決めること

(1) REQ 詳細一覧表を AUTOGEN 管理対象へ移行するか、hand-curated のまま Definition 品質検査（case-open/case-ready）への追記チェック組込みとするか。(2) REQ-083・REQ-087 の既存欠落行の即時補完を先行整備 Case として切り出すか。既存 intake（req-row-append-autogen-metrics-block-stale）との統合・分割判定。

## 根拠（任意）

PR #2923 本文「Findings/Capture 候補」セクション。`docs/README.md` の REQ 詳細一覧表（現行 main `c6198313` 時点で REQ-082 まで）。Definition PR #2919 の変更ファイル一覧（docs/README.md は欠番明記1行のみ）。

## intake-promote 確定注記（2026-09-18、adversarial-review 実施済み）

本 item は intake-promote の対論型レビューを経て「採用」で自律確定した（現行も未解決、REQ-083/087 実在・docs/README.md 表の欠落を再確認済み）。

- 同一事象が inspect-docs 検出事項 IDX-1（2026-09-17）としても検出されており、inspect-promote 2026-09-18 実行で IDX-1 が「既存 intake item との統合必須（統合は backlog-review 責務）」の注記付きで promote されている。本 item と IDX-1 の統合は backlog-review で実施すること。
- AUTOGEN 移行か手動チェックかの運用決定は item 本文「レビューで決めること」どおり backlog-review 以降で判断。
