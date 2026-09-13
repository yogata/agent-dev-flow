# inspect-docs finding 20260913T145842Z（縮小実施: knowledge README 乖離優先診断）

> 本ファイルは /agentdev/inspect-docs の検出事項出力である。前回セッションで委譲した4領域の探索タスク（knowledge / REQ・Decision / Design / guides・配布物）がセッション終了で消失（Task not found: bg_c5d38453 / bg_e949ecbb / bg_fa2a4032 / bg_d33bb024）したため、収集済み確定証拠に基づく優先事項（docs/knowledge/README.md の知識文書一覧乖離）の診断と未処理成果物確認に限定した縮小実施である。未実施領域は Out of Scope に明記する（診断は冪等なため全領域は次回 inspect-docs で再実行可能）。

## サマリ

- スキャン対象（実施分）: docs/knowledge/（README + 知識文書8ファイル）、docs/requirements/REQ-056.md・REQ-057.md、docs/README.md、ルート README.md、docs/guides/（件数確認）、.agentdev/（未処理成果物確認）、既存 finding 2件（重複確認）
- 検出件数: 1件（high 0 / medium 1 / low 0）
- 優先確認事項（ユーザー指摘の既知問題）: knowledge README の知識文書一覧が実態（8ファイル）から 5ファイル分乖離していることを確定証拠で確認

## 検出事項リスト

### F-01: docs/knowledge/README.md の知識文書一覧が実態から乖離（3件記載 vs 実態8ファイル）

- **category**: 索引の不整合（stale 索引、README 索引診断）
- **target**: docs/knowledge/README.md:18-24（「## 現在の知識文書」節）
- **evidence**: README は「3件。」と記載し3ファイルのみ列挙する（windows-powershell-bulk-io-corruption / checker-cli-stdout-loss-on-windows-bun / external-dependency-major-version-compatibility）。実態は docs/knowledge/ 配下に知識文書8ファイルが存在し、差分5ファイル（baseline-substitution-vocabulary-crosscheck / bun-offline-bundle-placement-independent-build / bun-test-junit-reporter-evidence / distribution-concrete-id-placement / windows-bun-test-spawn-timeout-classification）が件数・列挙のいずれからも漏れている。先行 intake item（.agentdev/intake/inbox/2026-09-11-knowledge-readme-missing-bun-offline-entry.md、case 2775 / PR #2776 Findings 由来、case-close 2026-09-11 回収）は bun-offline-bundle-placement-independent-build.md の1件のみ指摘であり、その後の知識追加4ファイル分の乖離拡大は未指摘であった
- **severity**: medium（索引・案内の参照整合性の局所的破綻。REQ-056-002 の workflow 利用（docs/knowledge/ を正規知識領域として探索能力で利用）は README 列挙に依存しないため現行判断への直接影響はない）
- **confidence**: high（ディレクトリ実在ファイル一覧と README 列挙の機械的突合で確定）
- **source_of_truth**: 実態の知識文書8ファイル（REQ-056-001 の配置契約に従う正規成果物）を正とする。README の一覧は領域の案内（README 自身の宣言）であり実態に追随すべき導線情報である。docs/README.md「知識（Knowledge）」セクション（knowledge/ へのリンクのみ、件数・列挙なし）は REQ-057-016 に整合し問題なし
- **recommended_route**: inspect-promote（promote 候補）→ knowledge README 一覧の現行化（8件へ、件数表記含む）。既存 intake item 2026-09-11-knowledge-readme-missing-bun-offline-entry との統合解決（範囲拡張または一括回収）。恒久対策候補: ①REQ-056-010 の機械検査範囲（frontmatter + 本体5項目）への「README 列挙整合」拡張（docs-check route 候補）、②knowledge README 一覧の AUTOGEN 化（index-auto-generation Design 準拠）
- **ng_classification**: pre-existing（2026-09-11 時点で intake item 化済みの既知問題。今回の変更で導入されたものではない）
- **notes**: ユーザー指摘の優先確認事項。知識追加経路は learning 昇華（REQ-056-004: backlog-review が利用者承認後に docs/knowledge/ へ直接保存）が最有力で、保存承認時に README 一覧更新が組み込まれていない運用ギャップが再発構造。README は知識文書ではないため REQ-056-006 の承認対象外（通常の docs 変更扱い）。defer 残置 F-04（REQ-057 RETIRE 候補性、20260907T012032Z）とも関連: 本乖離は REQ-057-002（broken link・不存在参照の残存禁止）がカバーしない逆方向（実在するが列挙漏れ）であり、REQ-057 バッチの補完観点として記録する

## 推奨アクション

- F-01: /agentdev/inspect-promote での分類後に knowledge README 一覧を現行化（既存 intake item との統合解決）。再発防止の docs-check route 候補（README 列挙整合の機械検査化または AUTOGEN 化）の採用判断を inspect-promote / backlog-review に付託

## 対象外（Out of Scope）

- REQ/Decision 構造診断（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT の横断比較）、Design 意味診断（将来計画混入・実行時依存の不適切扱い）、Design 状態乖離 DRIFT、Decision 状態乖離 DRIFT、guides 意味診断、配布物整合性検査（構文健全性・文意保持・責務整合）: 委譲探索タスクの消失により今回未実施。次回 inspect-docs で全領域再実行を推奨（診断は冪等）
- src/opencode/skills/agentdev-doc-diagnostics/SKILL.md の参考文献表が挙げる「探索順と索引の不整合」カテゴリが references/diagnostic-categories.md 本文のカテゴリ一覧に存在しない点: 配布物（skills）の記述整合は inspect-skills の検出範囲（inspect-docs command の routing 表）のため本コマンドでは検出しない
- 既存 defer 検出事項（F-04、F-08〜F-12/F-27/F-34: .agentdev/inspect/inbox/ の2ファイル残置分）の再評価: 2026-09-07 実施済み。今回の縮小実施では前提条件変化の確認を行わない
- 20260907T012032Z finding の既存 Out of Scope（vendored node_modules、docs/reports/ リンク切れ、偽陽性リスト等）を継承

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 15 item（2026-09-11〜2026-09-13 付。knowledge README 関連の先行 item 1件を含む）
- `.agentdev/learning/`: inbox.md・deferred.md・evaluation-report.md が存在（未整理エントリの詳細集計は未実施）
- `.agentdev/backlog/req-units/`: RU-0001〜RU-0004 の4件（2026-09-07 時点の空状態から増加）
- `.agentdev/drafts/`: 空
- `.agentdev/inspect/inbox/`: 既存 defer 2ファイル（20260901T120043Z、20260907T012032Z）+ 本ファイル

## クリーン判定（問題なしと確認した観点）

- docs/README.md「知識（Knowledge）」セクション: knowledge/ へのリンクのみで件数・列挙を持たず、REQ-057-016（ルート README は索引と参照リンクで足りる）に整合
- docs/README.md AUTOGEN ブロック（現行 REQ: 48件、廃止済み: 11件）と docs/requirements/README.md の現行テーブル（48行）・retired テーブル（11行）: 一致を確認（2026-09-07 時点の47件から REQ-059 追加に伴い更新済み）
- REQ-056 / REQ-057 の knowledge 関連契約: knowledge README の一覧更新義務は REQ 上明文化されておらず、列挙する以上は実態整合が要請される構造（REQ-056-010 の機械検査範囲は frontmatter + 本体5項目であり README 列挙は含まない）であることを確認
- docs/knowledge/ の知識文書8ファイルの frontmatter・本体5項目適合の個別検査: 委譲タスク消失により未実施（次回実施対象。F-01 の README 現行化とは独立した検査項目）

## 参照

- 診断実行: /agentdev/inspect-docs 2026-09-13（縮小実施）
- 探索手段: README 索引・正規成果物の直接読取・glob による実ファイル突合
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）
