# inspect-docs finding 20260929T170714Z

- 実行日時: 2026-09-30T02:07 JST（backlog-auto stage 1 として実行）
- 診断体制: STEP-2 意味診断は3診断担当への並列委譲（REQ 体系 / Design / Decision・guides・README、いずれも読取専用）+ 親の fan-in 統合（6観点網羅確認・横断矛盾判定・重複排除・既知 defer 照合を実施、矛盾・重複なし）
- 前回診断: 20260928T145126Z。今回の対象差分は 9/28〜9/30 の正規 PR 群（602b8601 運用規律整備・4dafa2e0 RA-002・bd666243 REQ-090 純化・d0c02fe0 Jev 実装・adc84579 textlint vendor 除外ほか）

## サマリ

- スキャン対象: docs/requirements/ 58現行 + retired 14 / docs/decisions/ 46 DEC（DEC-018 欠番）+ README / docs/designs/ 178 / docs/guides/ 13 / ルート README.md + THIRD-PARTY-NOTICES.md / 配布物（src/opencode/ commands 13 + skills 50）
- 機械的検査（STEP-2-0 候補収集）: check_integrity 0 新規 unmanaged NG、AUTOGEN 鮮度 0、command 形式 OK、extensions 0、配布境界 0、Design frontmatter 0、knowledge 構造 0、決定的破損 0、BOM/CRLF-LF 混在 0、存在しない command 参照 0（廃止コマンド移行案内は意図的記載）
- 検出事項: 19件（新規候補）
  - REQ 体系: 7件 / Design: 2件 / Decision・guides・README: 10件
  - severity: high 0件 / medium 9件 / low 10件
  - 推奨 route: docs-check 10件 / intake 5件 / defer 4件
- 既知 defer 残置分: 19項目の状況更新（すべて残存、うち1項目は部分解消、1項目は移動先で残存）—「既知 defer 項目の状況更新」節参照

## 検出事項リスト

source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides。

### REQ 体系（defer 残置 4件）

#### RQ-01: REQ-021-030 — 移行作業手順が要件行を占有
- category: MOVE（文書分類: 作業履歴・内部アルゴリズム残留）
- target: `docs/requirements/REQ-021.md:39`
- evidence: 「配布物本体に残存するADF-COVERS宣言の除去は、producer側対応とtraceability sidecarのcoverageを、implementation役割・producer側パスの役割フィルタで突合してから行う。除去後はrole別coverage不変と新規missing-implementation 0件を確認し…」— 除去作業（移行）の手順・突合アルゴリズム・確認条件が行の主文意。
- severity: medium（REQ/Design 境界違反シグナルだが安定契約例外候補〔配布 strip 安全手順〕のため medium に低下）
- confidence: medium
- source_of_truth: REQ-001-014（現行文書の本文は移行経緯を含まない）、REQ-004-009（作業手段は要件行の対象外）
- recommended_route: docs-check（手順詳細は case-run 側 skill/Design へ移送し、REQ 行は恒久不変条件のみ残す案）
- ng_classification: pre-existing（97953f3e 由来）
- notes: 要ヒューマンレビュー（安定契約読みの可能性）

#### RQ-03: REQ-090-018/019/024 — 同一規範の行間重複
- category: DUPLICATE（同一 REQ 内）
- target: `docs/requirements/REQ-090.md:32,33,38`
- evidence: 019「当該評価入力だけで判断可能な形に閉じて構成」≡ 024-(5)「与えられた入力だけで判断できること」、018 末尾と 024 末尾が「決定的処理として確定できないという理由のみで対象にしない」でほぼ逐語重複など3組。
- severity: low
- confidence: medium
- source_of_truth: REQ-047（規則所有権の一方向化・正規所有者一意化）の趣旨
- recommended_route: docs-check（024 を適格条件の正本とし、018/019 は参照に置換する案）
- ng_classification: 今回修正対象候補（024 は前回診断後の PR #3240 で追加。重複の一部は既存行由来のため要ヒューマンレビュー）
- notes: 024 を自己完結的チェックリストとする意図的重複の可能性が高い

#### RQ-04: REQ-061-040 — git コマンド形式詳細の要件行残留
- category: MOVE（文書分類: CLI 詳細の抽象化漏れ）
- target: `docs/requirements/REQ-061.md:59`
- evidence: 「明示パス指定の commit（git commit -m "..." -- <path>、--only pathspec 形式）と同一ステップで完結させること（Form Zero）。commit 実行前に git status --short でステージ全体を確認し…」— git フラグ・形式レベルの HOW が行を占有。
- severity: low
- confidence: medium
- source_of_truth: Design 分離基準（CLI 詳細の抽象化漏れ）
- recommended_route: defer
- ng_classification: 今回修正対象候補（602b8601 追加行。要ヒューマンレビュー）
- notes: 「Form Zero」はステージ混入防御の安全境界の安定契約候補。同型既許容行（REQ-030-017、REQ-007-011、REQ-092-003）とパターン単位で統一判断が望ましい

#### RQ-06: REQ-095-001/002 — Tool 入力契約・CLI 詳細の再記述
- category: MOVE + DUPLICATE（文書分類）
- target: `docs/requirements/REQ-095.md:12,19-20`
- evidence: 001 括弧内「role は issue_create/issue_list 専用、kind は role 'tracking' 専用…」は REQ-011-033/REQ-049-008 が所有する Tool 入力契約の再記述。002「ラベルなし列挙＋タイトル・本文確認…」は gh CLI 手順詳細。目的節に「kind requires role 'tracking'」というエラーメッセージ文言も存在。
- severity: low
- confidence: medium
- source_of_truth: REQ-095.md:14 自身の所有権宣言（Tool 入力契約は REQ-011-033、本 REQ は呼出側の運用規律のみ）
- recommended_route: defer（既知 defer REQ-092-003 と同型・同時処置が自然）
- ng_classification: 今回修正対象候補（602b8601 追加 REQ。要ヒューマンレビュー）
- notes: 「運用文書から参照できること」形式自体は REQ-092 で確立済みの形式

### Design（新規 2件）

#### GR-05: 案内層ガイドへの日付・Case 番号付き観測記録の混在
- category: guides（Report 混入）
- target: `docs/guides/supervisor-credential-bridge.md:115`
- evidence: 「実測記録（2026-09-28、Case #3190 実行時）: 本ガイドと配布物（src/opencode/ 配下）の旧変数名の言及は 0 件であり…」— 監査・観測記録がガイド本文に埋め込まれている。
- severity: low
- confidence: medium
- source_of_truth: docs/README.md「Report」節（監査・評価・観測記録は docs/reports/ へ分離）、guides/README.md:3-5（案内層）
- recommended_route: docs-check（Report または knowledge への移動とガイド側は導線化）
- ng_classification: pre-existing
- notes: 再検証手順の一部として運用価値があり、全文移動ではなく要約+導線化が適切かもしれない

#### GR-06: 「全体横断の状態遷移モデルを持たない」記述が v4 状態機械と矛盾
- category: guides（正規 Design と矛盾する現在形記述）
- target: `docs/guides/artifacts-and-state.md:141-143`
- evidence: 「6 マイクロフェーズは説明用ラベルであり、状態管理モデルではない。AgentDevFlow は全体横断の状態遷移モデルを持たない。」— accepted Design v4-lifecycle-state-machine.md（二層状態モデル・階層合成・内部 lifecycle 対応）および DEC-033（内部 lifecycle）が正確に全体横断の状態モデルを定義する。
- severity: medium
- confidence: medium
- source_of_truth: v4-lifecycle-state-machine.md、DEC-033
- recommended_route: docs-check
- ng_classification: pre-existing
- notes: 「docs の進行管理に限定した意図的表現」（直後の「各コマンドの入出力契約とディレクトリ配置が実際の状態表現」）との解釈も可能。GUIDE-6 と同ファイルのため統合是正候補

#### GR-07: guides/README.md が案内層ガイドを「正」と表記
- category: guides（README 索引の案内層原則違反）
- target: `docs/guides/README.md:52`
- evidence: 成果物・状態モデル行の説明「（状態モデル制約、`.agentdev/` の位置づけの正）」。同一ファイル 3-5 行は「基準は各 REQ/Decision/Design ファイルであり、ガイドは基準への導線を提供する」と宣言。`.agentdev/` の位置づけの正は .agentdev/README.md（domain state）および REQ-001/REQ-002/DEC-001。
- severity: low
- confidence: medium
- source_of_truth: guides/README.md:3-5、docs/designs/README.md 文書間関係節（Guides は規範的権限を持たない）
- recommended_route: docs-check
- ng_classification: pre-existing
- notes: 「探すならまずここ」程度の意味の可能性があり軽微。GR-06/GUIDE-6 と合わせた一括是正が効率的

#### GR-08: consumer 導入ガイドに DEC-047 の導入時依存生成の記載なし（追随漏れ候補）
- category: guides（新契約への導線追随漏れ）
- target: `docs/guides/consumer-project-setup.md`（全文 grep で vendor / bun install / build:engine の言及 0 件）
- evidence: DEC-047.md:46「consumer 導入には導入時の依存再生成手順（ネットワーク取得を含む）が必要になる」。ルート README には 2026-09-29 追加の「開発者セットアップ（textlint 依存の生成）」節があるが、適用プロジェクト導入の案内文書には当該前提の導線がない。
- severity: low
- confidence: medium
- source_of_truth: DEC-047 決定2・結果と影響、REQ-053-033
- recommended_route: docs-check
- ng_classification: 今回修正対象候補（DEC-047 フォローアップ。要ヒューマンレビュー）
- notes: 手順の正は plugin README「導入時の依存生成手順」（実在確認済み）が所有し、実行時は fail-closed 案内で補償される設計のため、導線欠如が許容範囲かは要判断。優先度低

#### GR-10: DEC-031 の superseded DEC-002 への relates-to が既知「類推3件」と同パターン
- category: Decision 意味整合（類推参照の追加候補）
- target: `docs/decisions/DEC-031.md:13-14`
- evidence: relations reason「プロセス・実装責務分離におけるソース・プロジェクション分離の位置づけ」— DEC-002 は superseded（by DEC-036、DEC-031 と同日 2026-09-18 成立）。既知の類推3件（DEC-016/019/027）と同じ形状。
- severity: low
- confidence: low
- source_of_truth: DEC-002.md:4-5
- recommended_route: defer（既知 defer 項目「類推参照」の拡張として扱うのが自然）
- ng_classification: pre-existing
- notes: 置換と同日成立のため当時は現行だった可能性が高く、意図的歴史参照とも解せる

## 既知 defer 項目の状況更新（前回診断の defer 残置分）

| 項目 | 状況 | 証拠 |
|---|---|---|
| REQ-038-006（2フェーズ読込の内部アルゴリズム混入） | 残存 | REQ-038.md:24 |
| REQ-050-016（スコープ外関心＋実装パラメータ） | 部分解消 | 固定数値は排除済み（REQ-050.md:36）。skill description 予算方針という別関心の在置は残存 |
| REQ-008-059（表外見出し節＋HOW 詳細） | 残存 | REQ-008.md:80-88 |
| REQ-036-029〜033（STEP-2 並列化受入条件） | 残存 | REQ-036.md:47-51（032/033 は変更時測定設計） |
| REQ-036-002（移行記述・スキーマ操作） | 残存 | REQ-036.md:21 |
| REQ-036-022（スキーマ操作記述） | 残存 | REQ-036.md:40 |
| REQ-048（移行履歴 / Legacy Baseline 所有） | 残存 | REQ-048.md:18-20、:40 |
| REQ-087-004（実装詳細参照・安定契約例外候補） | 残存 | REQ-087.md:19 |
| REQ-092-003（実装詳細参照・安定契約例外候補） | 残存 | REQ-092.md:26 |
| REQ-012/REQ-021（TIM 検証結果格納規範の二重規定） | 残存 | REQ-012.md:32、REQ-021.md:28 |
| v4-collaboration-loop Design の先送り記録 | 残存 | v4-collaboration-loop.md:70（明示ラベル付き。同 :89 の Issue B 参照は REQ-090 適用範囲宣言と整合し新規対象外） |
| inspect-docs Design の ADF-COVERS 宣言 ID 重複 | 残存 | docs/designs/commands/inspect-docs.md:9-10（REQ-036-001/006/008/010 が2行に重複） |
| DEC-010 が superseded DEC-002 を現在形で「維持する」 | 残存 | DEC-010.md:35-36 |
| DEC-022 が superseded DEC-015 決定4 を部分修正前提とする | 残存 | DEC-022.md:47-48、:86 |
| DEC-018 欠番が採番管理に明記されない | 残存 | numbering-policy.md:57-66 は REQ 欠番のみ。docs/decisions/README.md にも明記なし（numbering-policy.md:55 に反する） |
| accepted Decision による superseded Decision への類推参照（3件） | 残存 | DEC-016.md:38、DEC-019.md:37、DEC-027.md:48（+類似候補 GR-10） |
| GUIDE-6（状態モデル制約が frontmatter 状態管理と矛盾） | 残存（移動） | guides/README.md からは消滅。実体は artifacts-and-state.md:145-153 へ移動し :149/:151 が Design/Decision frontmatter status 管理と矛盾 |
| command-selection 補足節の規範的記述 | 残存 | command-selection.md:46-56 |
| IR-044 ルール本文の作業履歴残存 | 残存 | IR-044…detection.md:40、:64-65、:72、:79（:78 が追記様式として PR 番号記録を自己規定し、意図的記録と残存が混在） |

## 6観点網羅確認（REQ 体系担当 fan-in 後）

- SPLIT: 候補あり（RQ-02）。行数シグナル（REQ-001/008/004/009）は req-health-metrics 管理値と一致の既知管理状態
- MERGE: 候補あり（RQ-07）
- MOVE: 候補あり（RQ-01、RQ-04、RQ-06 + 既知 defer 残存群）
- DUPLICATE: 候補あり（RQ-03、RQ-02 の一部 + 既知 defer REQ-012/021）
- RETIRE: クリーン（全58 REQ が現行表に索引済み、retired 14 件と二重存在なし。消極証拠に基づく判断）
- DRIFT: クリーン（優先領域の重点照合: REQ-090↔agentdev_jev 公開契約、REQ-095/092↔agentdev_gh 公開契約、REQ-036-029/030↔本診断委譲の構成、いずれも一致）

## docs-check route 候補（STEP-3-2）

- docs/README.md Decision 索引 AUTOGEN 注記の生成ロジック（後継側 relations reason に由来する注記が前任の最新 supersede_note を反映しない問題。GR-01）
- document-model.md ドメインディレクトリ表の実在 Design 突合（または AUTOGEN 化・代表例示への文言明示。DS-02）
- superseded Decision を「有効のまま保持」とする現在形記述の陳腐化検出（機械化は困難だが横断 grep「有効のまま保持」+ status 突合の候補。GR-03）
- 文書間の歴史事実（削除範囲等）の表記統一（GR-04。低価値）

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 4件（2026-09-27〜09-29、#3233/#3236 系）
- `.agentdev/learning/inbox.md`: 未処理エントリ 4件
- `.agentdev/inspect/inbox/`: 既存検出事項 6件（前回診断分、本ファイルとあわせ inspect-promote の対象）
- `.agentdev/backlog/req-units/`: RU-0136.md 1件
- 各 promoted/: 0件（intake / learning / inspect とも空）

## 推奨アクション

- docs-check route 10件（RQ-01、RQ-02、RQ-03、GR-01、GR-03、GR-04、GR-05、GR-06、GR-07、GR-08）: 文書整備系の是正候補。inspect-promote での分類時に docs-check / intake へ振り分け
- intake route 5件（RQ-07、DS-01、DS-02、GR-02、GR-09）: 統合判断・規則ギャップ・文書更新案。GR-09 は既存 intake item（2026-09-29-3236）への対象追加候補
- defer route 4件（RQ-04、RQ-05、RQ-06、GR-10）: 安定契約例外候補・低確実性。パターン単位の統一判断待ち
- req-define 入力案: 2件（RQ-07 の MERGE 統合判断、GR-02 の部分置換規則の明確化）
- 既知 defer 19項目は原状継続（状況更新のみ。新規起票せず）

## 対象外（Out of Scope）

- 機械的検査クリーン項目（check_integrity / AUTOGEN / command 形式 / extensions / 配布境界 / Design frontmatter / knowledge 構造 / 決定的破損 / BOM・改行コード / command 参照実在）の再報告
- 既知 defer 残置分の新規起票（状況更新のみ実施）
- intake / learning / RU の処理（intake-promote、learning-promote、backlog-review の責務）
- 配布物（command/skill）本文の詳細診断（inspect-skills の責務。STEP-3-1 の構文・エンコーディング・参照検査は実施済みでクリーン）
- 診断担当が候補化しなかった観察メモ（REQ-090-006↔026 の緊張、checker-execution-contracts.md:143 の判断履歴引用、runtime-package-boundary.md:459 の日時記録、textlint-quality-runtime.md:105 の実績件数、明示的先送り宣言群、REQ-051-009 の配置、REQ-044-005 の費消可能性）— 本ファイルの審議記録として参照可能
- 文章表層品質（textlint 共通基盤の責務）

## 参照

- 診断担当: REQ 体系 / Design / Decision・guides・README の3並列委譲（読取専用、file:line 根拠付き戻り値）
- 機械的検査スクリプト: repo-agentdev-integrity（check_integrity --profile source、check_autogen_freshness、check_command_format、check_extensions、check_distribution_boundary、check_design_frontmatter、check_knowledge_docs、check_content_corruption）
- source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides

## 処理記録

- 2026-09-30 実施（backlog-auto stage 2 inspect 系統、--auto なし）: promote 7件（GR-01/02/03/04/09・DS-01/02）→ promoted/inspect-docs-promoted-20260929T170714Z.md へ原状保存・本ファイルから削除。うち GR-03 は 20260929T165249Z DS-21 と、DS-01 は同 DS-23/24 と、GR-01 は同 DC-14 と対象統合。GR-09 は intake promoted 2026-09-29-3236-decision-numbering-timing-clarification.md への対象追加候補（numbering-policy.md:40-41）。defer 12件（RQ-01〜07〔RQ-05 は 165249Z RQ-34 と統合〕・GR-05〜08・GR-10）は本ファイルに残置。RQ-07 は REQ-095（2026-09-29 追加）の安定後に次回サイクルで MERGE 判断を再評価。GR-06/07 は既知 defer GUIDE-6（artifacts-and-state.md・同ファイル）との統合是正時に一括処理。HITL 承認: GR-02（2026-09-30 ユーザー承認）
- 2026-10-05 実施（backlog-auto stage 2 inspect 系統、--auto なし、親直列化スロット）再評価: RQ-02 は解消確認により reject・即時削除（自律確定）: REQ-053-041/042 は手段分離編集で消滅（REQ-053 の行 ID は 040 まで・REQ-053-041/042 の出現 0 件を実確認。20260926 RQ-14 と同一対象で同日削除。親診断 20261004T162140Z の解消判定と一致、Jev 分類 reject 意見一致）。RQ-05 は解消確認により reject・即時削除（自律確定）: REQ-060.md:22 から 300〜600 秒の数値帯は除去済みで checker-execution-contracts.md への所有委譲を明記（20260929T165249Z RQ-34 と統合 defer だった対象。同ファイル側でも同日削除）。RQ-07 は解消確認により reject・即時削除（自律確定）: REQ-092 の retired 移管（retired/REQ-092.md で status: migrated を実確認）により MERGE 対象が消滅（親診断 20261004T162140Z の解消判定と一致、Jev 分類 reject 意見一致）。RQ-01/RQ-03/RQ-04/RQ-06/GR-05〜08/GR-10 は再評価条件未充足のため defer 継続（自律確定）。既知 defer 状況更新表の DEC-010 行は 20261004T162140Z DC-02（promote）へ昇格併合（20260925 F-08 系譜は DC-02 成果物側に保存）。却下理由の詳細は commit message に記録
