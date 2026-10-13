# system.md Workflow Architecture Inventory の現行化（third-party-sync・phase 5コマンド）

- 出所: inspect-docs 20261011T033142Z DS08 + 20261013T090730Z DS12（backlog-auto stage 1。同一 Inventory 表の列挙漏れとして統合）
- 種別: 修正候補（システム仕様の Inventory 一覧表・件数宣言の現行化）
- 対象: docs/designs/foundations/system.md:104,119-139

## DS08: Inventory の列挙漏れ（20261011）

- category: Inventory の列挙漏れ
- target: `docs/designs/foundations/system.md:104,121-139`
- evidence: 104行目は公開 Command 13件を掲げるが、Inventory 表には12公開 Command と内部 lifecycle 5段階があり、`/agentdev/third-party-sync` の行がない。同ファイルには別節（365行目）で third-party-sync の記述がある。
- severity: low
- confidence: high
- source_of_truth: root README の13コマンド索引、コマンドリファレンス一覧
- recommended_route: 修正候補。Inventory 表に third-party-sync を追加する。
- ng_classification: pre-existing（今回の delta は用語置換）。
- notes: 文書全体での記述欠落ではなく Inventory 表の欠落。

## DS12: システム仕様の現行性欠落。機械検査 NG 裏付け・expanded-readme-sync（20261013）

- category: Design（システム仕様の現行性欠落。機械検査 NG 裏付け・expanded-readme-sync）
- target: `docs/designs/foundations/system.md:104,119-139`
- evidence: :104 が「公開 Command（13件）」と宣言する一方、src/common/commands/agentdev/ には phase-tasks-create / phase-tasks-update / phase-artifacts-update / phase-review / phase-transition の5配布コマンドが実在し（commit 69573879、2026-10-13）、root README の索引は18コマンド。system.md 全文中の `phase-` 記述は0件（grep 実証）、「工程駆動」の言及も foundations/ 配下では crosswalk のみで system.md に皆無。一覧表（:121-139）は12公開コマンド+内部5段階で、5 phase 行が不在かつ件数宣言13件が実態18件と不整合。
- severity: medium
- confidence: high
- source_of_truth: src/common/commands/agentdev/ 実在ファイル群、root README 配布コマンド索引（18件）、REQ-111-011（両版正規利用経路）
- recommended_route: 修正候補。system.md の Inventory 一覧表へ5コマンド行を追加し件数宣言を現行化する（工程駆動の節追加要否は owner 判断）。
- ng_classification: 今回修正対象候補（phase 5コマンド追加に対する system.md 未更新は今回 delta）。
- notes: 既知 DS08（third-party-sync 行の欠落、12対13）とは別件。本件は phase 5コマンド欠落と件数13対18の不整合。docs-check の expanded-readme-sync が検出済み。附随観察: phase 5コマンドには docs/designs/commands/ 配下の command Design も存在しない（glob 実証）。v51-phase-transition:14,50 の「後続設計で確定」との絡みで Design 未整備の現状が恒久化されないよう DS11 の処置と連動させること。

## 処置方針

1. system.md Inventory 一覧表へ third-party-sync 行を追加する（DS08）
2. Inventory 一覧表へ phase 5コマンド行（phase-tasks-create / phase-tasks-update / phase-artifacts-update / phase-review / phase-transition）を追加し、「公開 Command（13件）」の件数宣言を実態18件へ現行化する（DS12）
3. 工程駆動の節追加要否は owner 判断とする。phase 5コマンドの command Design 未整備は DS11（実装状態表現統一）の処置と連動

## 処置判断の根拠（inspect-promote 2026-10-13）

- system.md:104「公開 Command（13件）と内部 lifecycle 段階（case-* 5 段階）の Workflow Architecture Inventory を恒久カタログとして統合する。」を現物実読確認
- 機械検査（check_integrity expanded-readme-sync、Command 5 NG）の有効実行結果が裏付け
- DS08（third-party-sync 欠落・low/high）と DS12（phase 5コマンド欠落・件数不整合・medium/high）は同一 Inventory 表の同種列挙漏れであり統合成果物化する

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: system.md:104 現物実読で件数宣言を再確認。phase スキル投影不在（DB01 裏付け）と併せて実態18件の事実を確認。
- Jev 評価: DS08 promote（0.60）・DS12 promote（0.90）で最終判断と一致（観測 20261013T094553Z-2a11 d10、20261013T094827Z-5dc0 d11）。
