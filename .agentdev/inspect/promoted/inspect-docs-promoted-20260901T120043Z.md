# inspect-docs promoted 20260901T120043Z（promote 採用分）

> 本ファイルは inspect-promote（2026-09-01 実施、/agentdev/backlog-auto 経由）の分類確定後、promote となった検出事項を保存する（28件: 新規27件 + 旧残置 F-16/F-17）。
> 元 finding ファイル（inspect-docs-finding-20260901T120043Z.md）は defer 残置分（F-08〜F-12, F-27, F-34, F-36）のみを残して整理済み。reject（旧 20260815 F-15）は即時削除済み。
> 判定根拠の詳細・証跡は各 finding の記載および review 記録（adversarial-review 2系統 stream、収束済み）を参照。
> backlog-review との統合マーカーを各 finding に記載（intake promoted との二重修正の回避）。

## バッチ構成

- **バッチA（dangling 行参照）**: F-02, F-03, F-04, F-05, F-06, F-07
- **バッチB（proposed DEC 権威引用是正）**: F-18, F-19, F-20, F-21（F-17 と F-20 の同一行競合は F-20 側から command-file-format.md:62 を除外し F-17 で解消）
- **バッチC（Design 混入除去・現行化）**: F-14, F-15, F-16, F-17
- **バッチD（不存在参照・名称訂正）**: F-30, F-31, F-32, F-33, F-35
- **バッチE（guides・README 現行化）**: F-13, F-22, F-23, F-24, F-25, F-26, F-28, F-29
- **旧残置**: F-16/F-17（20260815・Epic #2099 closed 確認により再確認条件充足、ユーザー承認で promote）

## promote 一覧

### F-01: REQ-001-067/068/069/079 未存在行への Design 群依存（high/high）
- **対象**: docs/designs/foundations/document-model.md:90,114、docs/designs/quality/req-health-metrics.md:165,171,173、docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md:22,70,77,129-132、docs/designs/integrity/rule-ownership.md、docs/designs/integrity/integrity-contracts.md、docs/designs/commands/req-define.md:532、docs/designs/skills/agentdev-req-analysis.md、docs/designs/responsibilities/*、docs/designs/workflows/backlog-artifact-lifecycle.md ほか
- **内容**: 判定本体を正当化する行番号（REQ/Design 文書種別境界・Design 分離基準・安定契約例外・ステークホルダー基準）が REQ-001 に一度も存在しない
- **決定事項**: 採番意図・正規所有の確定（新規採番 or 参照側修正 or 行追加）は req-define でユーザー判断。不整合自体の是正要求は確定
- **統合マーカー**: intake 2026-09-01-req046-004-phantom-reference-dec022（同型: 幻参照）

### F-02: REQ-006 旧番号参照 48ファイル残存（high/high）
- **対象**: 宣言元 docs/requirements/REQ-006.md:20-21。参照残存: case-auto.md:58,123,125,145,237,458,465-490 ほか 48ファイル、DEC-008.md:23-47 を含む
- **内容**: 移管先判明済み（REQ-006-110→REQ-034-031、REQ-006-112/113/114→REQ-034-032/033/034）。現行 REQ-006 は REQ-006-105〜109/111 の6行のみ
- **注意（review 指摘）**: 置換前に内容照合を行う（明示マッピング表は一部推論を含む）
- **統合マーカー**: intake promoted「配布物・docs の表記・参照・用語の現行化」（旧参照系と一体作業）

### F-03: REQ-004 旧番号（056〜088）参照残存（medium/high）
- **対象**: req-define.md:60,70,114,138,152、req-save.md:121、backlog-review.md:140、intake-promote.md:41、learning-promote.md:45、agentdev-workflow-lifecycle.md:28、IR-044:77
- **内容**: REQ-004 は REQ-004-001〜054 の連番完備。移管先は個別に特定して更新
- **統合マーカー**: intake「表記・参照・用語の現行化」の legacy-step-rowid（旧 Step N 参照）と同型

### F-04: REQ-005 旧番号（034/041/042/048/049）参照残存（medium/high）
- **対象**: workflow-contracts.md:35、case-open.md:70,102,333、design-principles.md:31
- **内容**: workflow-contracts L35「公開コマンド5分類（REQ-005-048）」の参照先が REQ-005 に存在しない。**REQ-001-053〜055 は「公開コマンド5分類」を所有しない**（作業種別四値・実行経路派生・入口表。review で確認済み）
- **受け入れ条件**: 公開コマンド5分類の現行所有行を特定し、参照を更新する（特定は機械的 grep で可能）

### F-05: REQ-002-022/163 への現行根拠参照（medium/high）
- **対象**: REQ-027.md:37、DEC-011.md:23、design-principles.md:164
- **内容**: MOVE 先 REQ-029-001..008 は catalog 記録済み、参照側未更新。DEC-011 は accepted のため非意味修正手順の適用対象

### F-06: 削除済み REQ-001-029/036/037 参照残存（medium/high）
- **対象**: design-principles.md:121、document-model.md:47、workflow-contracts.md、artifact-contracts.md、agentdev-artifact-validation.md
- **内容**: commit fafeb497 で削除済み。移管先 REQ-002-035（REQ-002.md L44、決定論的処理分離）は実在・内容一致を review で確認済み

### F-07: document-model の REQ-001-044/045 参照 DRIFT（high/high）
- **対象**: document-model.md:313-314 対 REQ-001.md:57
- **内容**: REQ-001-045 の内容の現行所有は REQ-001-056。REQ-001-044 は現行では別主題（定量化）。参照先訂正（REQ-001-056 等）

### F-13: req-health-metrics AUTOGEN 計測例の鮮度低下（low/high）
- **対象**: docs/designs/quality/req-health-metrics.md:91-140
- **内容**: 計測日 2026-08-30 のまま REQ-056 等追加分未反映、REQ-001 行数 61 vs 実測 62
- **対応**: generate_indexes.ts による機械的再生成
- **統合マーカー**: intake promoted「品質・検証ギャップ」（req-health-metrics-autogen-stale-regeneration）

### F-14: workflow-skill-model の将来計画セクション混入（low/high）
- **対象**: docs/designs/workflows/workflow-skill-model.md:211-225
- **内容**: 「新規 Capability Skill 抽出候補（将来対応）」7項目。document-model L40/L448 違反
- **対応**: セクションを Design から除去し、候補リストは backlog/RU 管理対象として本 promoted 経由で扱う

### F-15: patterns.md の移管候補記載（未確定事項の Design 混入）（low/high）
- **対象**: docs/designs/foundations/patterns.md:12、docs/designs/README.md:181
- **内容**: 「執筆規約寄り内容は authoring/ への移管候補とする」記載。document-model L59 違反
- **対応**: 未確定事項の記載を除去。**移管の実施判断は case-run 作業記録へ**（review で明示を追加）

### F-16: req-impact-map 配置の未確定事項が3文書重複（low/high）
- **対象**: req-impact-map.md:12、rule-ownership.md:22-23、docs/designs/README.md:195
- **内容**: 「配置は別途判断」の重複記載。document-model L59 違反
- **修正案（review で具体化）**: req-impact-map.md L12 を正本とし、rule-ownership.md と designs/README 備考は参照導線化（document-model L59 からの機械的帰結）
- **統合マーカー**: intake promoted「integrity・テスト基盤の期待値・契約整備」（req-impact-map-rule-ownership）

### F-17: command-file-format の判断文重複（low/high）
- **対象**: docs/designs/authoring/command-file-format.md:62
- **内容**: 「ガードレール番号 Gxx の連番制度は廃止する（DEC-022、REQ-051）」の判断宣告転記
- **対応**: 現行状態記述（「連番制度は廃止済み。現行は意味識別子で…」）へ置換（DEC-022 引用除去を含む）

### F-18〜F-21: proposed DEC の権威引用是正（バッチB、4件）
- **対象**: F-18: src/third-party/skills.yaml:3、agentdev-workflow-third-party-sync/SKILL.md:89（DEC-023）。F-19: src/opencode/plugins/agentdev-gh-tool/README.md:3（DEC-022 決定4）。F-20: workflow-skill-model.md:23、artifact-contracts.md:31,34、custom-tool-contracts.md:12、runtime-package-boundary.md:239、command-file-format.md:62（→F-17側で処理）、IR-063:44、docs/designs/README.md:198（DEC-022）。F-21: agentdev-issue-tracking.md:13、document-model.md:517、local-case-file.md:177、artifacts-and-state.md:19、glossary.md:41（DEC-020）、runtime-package-boundary.md:225、consumer-project-setup.md:215（DEC-021）、verification-scope-catalog.md:23（DEC-025）、REQ-012.md:56、REQ-021.md:43（DEC-019）
- **決定事項（req-define で判断）**: 修正モードは「現行 REQ への置換」or「(proposed) 注記付与」。F-18 は docs/README.md L96 が (proposed) 注記を行っており配布物側のみ欠落のため注記付与に寄る。F-20/F-21 は現行 REQ がすでに要求水準を所有するため置換可能
- **活用**: DEC-022/023 承認時の更新チェックリストとして使用可
- **統合マーカー**: intake promoted「配布依存境界と baseline 運用」（ir055-dec023・legacy-adr-terminology）

### F-22: diagnostics-and-maintenance の guides 範囲超過（low/high）
- **対象**: docs/guides/diagnostics-and-maintenance.md:100-113
- **内容**: 3層ゲート達成状況の正規記録先宣言・「Update Notes 不使用」規則の guides 側重複（正本 patterns.md L58）
- **対応**: 規範的宣言の除去、正本参照へ

### F-23: req-case-flow の stale Step 11-1/11-3（medium/high）
- **対象**: docs/guides/req-case-flow.md:84-96,159-172
- **内容**: 現行 case-run は STEP-S1〜S6/W1〜W5。「Step 11-1」「11-3」は全局 zero hit。停止条件10項目は REQ-034 等の正規所有重複
- **対応**: 現行 STEP モデル表記へ更新＋重複部の参照化

### F-24: ルート README の導入マニュアル全体重複（low/high）
- **対象**: README.md:78-156 対 docs/guides/consumer-project-setup.md:136-274
- **決定事項**: 削除範囲（全部除去 vs 部分残存）は req-define でユーザー判断。REQ-001-006 違反自体は確定

### F-25: README-INSTALL の欠落参照と履歴規範参照（low/high）
- **対象**: README-INSTALL.md:53,63
- **内容**: .omo/plans/agentdev-migration-2026-08-05.md（不所存・Test-Path False）への normative 引用
- **対応**: 参照除去・現行文書への付け替え

### F-26: docs/README の Design 欠落（low/high）
- **対象**: docs/README.md:159-171（integrity/ 節）、:173-177（local/ 節）
- **対応**: local/third-party-skill-management.md・content-corruption-checker.md の行追加

### F-28〜F-32（配布物の決定論的修正、バッチD+E）
- **F-28**: agentdev-workflow-lifecycle/references/upstream-handoff.md:30-37 の隣接重複見出し `### backlog-review`（マージ漏れ疑い）
- **F-29**: agentdev-workflow-templates/SKILL.md:221-223 の本文空見出し「### Issue作成時のテンプレート選定（case-close）」削除（正規は L206）。**統合マーカー: intake promoted「routing・運用明文化」**
- **F-30**: 不存在参照 requirements-review-finding-protocol.md（agentdev-req-file-manager/SKILL.md:156、references/req-save-procedure.md:38）→ 参照削除（実在対応物なし・review で確定）
- **F-31**: 不存在参照 close-report.md（command-authoring-standards.md:287,365）、command-map.md（:342）、artifact-boundaries.md（:597、対応実在は artifact-contracts.md）
- **F-32**: 不存在スキル名 agentdev-tracking（intake-extraction.md:17、agentdev-workflow-intake-from-github/SKILL.md:42）→ agentdev-issue-tracking へ訂正

### F-33: elevation-ledger.md 誤字疑い（low/medium）
- **対象**: src/opencode/commands/agentdev/learning-promote.md:48
- **対応**: evaluation 系への訂正（elevation 概念は全局不所存）

### F-35: 単独 contracts.md 曖昧参照（low/medium）
- **対象**: agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md:186
- **対応**: custom-tool-contracts.md への参照明確化

## 旧残置分の promote（20260815 F-16/F-17・ユーザー承認済み）

- **対象**: docs/designs/workflows/step-reference-contract.md、docs/designs/workflows/input-resolution-and-durable-state.md（status: draft 継続、updated 2026-08-15、17日停滞）
- **内容**: accepted Decision（DEC-011）の実装詳細を正規所有すると称する Design が draft のまま。再確認条件「Epic #2099 case-close 後も draft」が Epic #2099 closed（完了条件全 [x]・10子Issue completed・cutover 完了）により文字面通り充足
- **対応要求**: 昇格可否の判断（QG-4/検証対応評価を含む）を正式判断工程（backlog-review → req-define → case 経由の昇格）で実施する。IR-054 は30日未達で未発火（2026-09-14頃に到達）
- **関連**: 旧 20260815 F-15（workflow-skill-model draft）は accepted 昇格を確認済みのため reject（即時削除済み）。旧 20260822 F-05（draft Design 13件被参照）は defer 継続（現 draft 12件、観察継続）

## 審議記録（参照）

- 暫定分類（新規36件: promote 28 / defer 8 / reject 0 + 旧残置3件）→ adversarial-review 2系統独立 stream（Stream A: promote 根拠検証 / Stream B: 処分整合性検証）→ counter-challenge → convergence → convergence audit 完了
- accepted findings 反映: F-16 修正案具体化、F-18〜F-21 決定事項明記、F-04 受け入れ条件追加、F-06 移管先確認、F-15 移設明示、F-30 削除案確定、F-17/F-20 同一行競合解消、intake 重複の統合マーカー追加、旧F-16/F-17 の Epic #2099 完了確認
- HITL: 旧F-16/F-17 の promote をユーザー承認（2026-09-01）
- 全 promote 分の処理実行: promoted 保存 + inbox 元ファイル整理済み
