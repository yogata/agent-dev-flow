# inspect-docs finding 20261004T162140Z（defer 残置分）

> 本ファイルは inspect-promote（2026-10-05 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）の分類確定後、defer となった検出事項のみを残置する。promote 採用分（8件: DC-01、DC-02、DS-01〜DS-05、RQ-01）は `.agentdev/inspect/promoted/finding-20261004-*.md` へ保存済み（うち DS-02 は 2026-10-05 ユーザー事前承認〔HITL〕、他7件は自律確定）。reject 0件（新規分）。既知 defer 子処分（解消確認 reject 6件のセクション削除）は各元ファイル側で実施。
>
> - GR-11: ガイドが learning 13項目形式を正規所有者への参照なしで列挙。参照 1 行追記で解消する軽微件（採否・時期は次サイクル判断）

- 実行日時: 2026-10-05T01:21 JST（backlog-auto stage 1 として実行）
- 診断体制: STEP-2 意味診断は3診断担当への並列委譲（REQ 体系 / Design / Decision・guides・README、いずれも読取専用）+ 親の fan-in 統合（6観点網羅確認・横断矛盾判定・重複排除・既知 defer・既出 intake item 照合を実施、担当間矛盾なし、REQ-102:24 は REQ/Design 両担当から重複候補として返り 1 件へ統合）
- 前回診断: 20260929T170714Z。今回の対象差分は 9/30〜10/5 の正規コミット群 266件（REQ-092/093/087 廃止・REQ-100/101/102 新設・DEC-050 受理・DEC-049/REQ-099 による src/common 共通正本化・Case #3391〜#3447 の workflow実行規律・受け入れ義務・工程記録系 Design/REQ 大量更新ほか）

## サマリ

- スキャン対象: docs/requirements/ 61現行 + retired 18 / docs/decisions/ 49 DEC（DEC-018 欠番）+ README / docs/designs/ 180 / docs/guides/ 13 + README / ルート README.md + THIRD-PARTY-NOTICES.md / 配布物（src/common commands 13 + skills 50）
- 機械的検査（STEP-2-0 候補収集）: check_integrity 新規 unmanaged NG 19（phantom REQ-003-055 ×3・req-updated-freshness ×16。いずれも既出 intake item 捕捉済み）、AUTOGEN 鮮度 0、command 形式 OK、extensions 0、配布境界 0、Design frontmatter 形式 0、knowledge 構造 6（2文書・既出 intake item 捕捉済み）、決定的破損 0、配布物 BOM/CRLF-LF 混在 0、存在しない command 参照 0（/agentdev/templates は path prefix）
- 検出事項（新規）: 9件
  - REQ 体系: 1件 / Design: 5件 / Decision・guides・README: 3件
  - severity: high 2件 / medium 2件 / low 5件
  - 推奨 route: docs-check 6件 / intake 2件 / defer 1件
- 既出 intake item 照合（新規起票せず状況確認のみ）: 6系統（後述）。intake inbox 21件中、本診断の機械的候補の大半が 10-03/10-04 の docs-check/case-close capture で既に捕捉済み
- 既知 defer 残置分: 31項目の状況更新（解消 6 / 実質解消 2 / 部分解消 2 / 残存 21）—「既知 defer 項目の状況更新」節参照

## 検出事項リスト（defer 残置分）

source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides。

### guides（defer 残置 1件）

#### GR-11: intake-learning-backlog-flow.md が Learning 13項目形式を参照なしで列挙
- category: guides（正規所有者の内容複製）
- target: `docs/guides/intake-learning-backlog-flow.md:86-87`
- evidence: 「13項目形式で記録する。問題事象、発生局面、…」— 13項目形式の正は agentdev-learning-capture（capture-boundaries.md:129 が参照点）であり、ガイドが項目一覧を複製し正への参照を置いていない。
- severity: low
- confidence: medium
- source_of_truth: agentdev-learning-capture スキル（learning 系 Design）
- recommended_route: defer（正への参照 1 行追記で解消）
- ng_classification: 新規（軽微）

## 既出 intake item 照合（新規起票せず、補完情報のみ）

| 項目 | 捕捉済み intake item | 今回の補完 |
|---|---|---|
| REQ-010-070 行 ID 重複（REQ-010.md:43/44） | 2026-10-04-retired-req087-092-093-wave3-remaining-refs-cleanup（pre-existing 分類済み） | 原因特定: 343d4661 の REQ-087 統合挿入行が既存 070 行（再走査→新規検査クラス追加）と採番衝突。旧 070 行の処置方針（新番号採番か統合か）は要ヒューマンレビュー |
| REQ-095.md:27・REQ-102.md:24 の REQ-093 現行時制参照 | 同上 | 現行所有は REQ-052-014/015（REQ-052.md:34-35 で確認）。REQ-095:27 の「旧 REQ-092 から分離済み」は過去形歴史記録として許容 |
| crosswalk-inventory.md:62 REQ-087 行の stale keep | 同上 | 「keep → retired」更新機構は REQ-016（:24）/REQ-057（:54）行で実証済みのため、機構欠如ではなく未適用。REQ-092/093 の行不在は crosswalk 範囲（移行判定時点 53 REQ）として適合 |
| phantom REQ-003-055 引用 ×3（REQ-003.md:56、v4-responsibility-boundaries.md:44/67） | 2026-10-04-req003-055-phantom…、2026-10-03-known-integrity-debts… | 意味診断で全 3 件とも過去形移行記録（「当時の行番号帯であり…廃止。移管記録」「旧 REQ-003-055 から委任されていた」）と判定。検査側の exemption パターン登録を docs-check route 候補へ |
| req-updated-freshness 16件（REQ-001,003,010,012,050,052,053,060,082,091,094,095,097,098,099） | 2026-10-04-req-updated-freshness-16-backlog | 原因構造: 343d4661（12 REQ 一括手段分離）は frontmatter updated を更新せず、082bb32a（Case #3440、6 REQ）は同時更新済み、の対比で systematic lapse（一括 Definition 適用経路の更新漏れ）と確定。サンプル 3件（REQ-053/099/001）で実在確認 |
| knowledge 必須セクション欠落 6件（structure-migration-followup-checklist、windows-rename-eperm-diagnosis-and-bounded-retry） | 2026-10-03-knowledge-required-sections-missing | 再発確認のみ（増減なし） |

## 既知 defer 項目の状況更新（前回 20260929T170714Z の 31項目）

| 項目 | 状況 | 証拠 |
|---|---|---|
| RQ-01: REQ-021-030 移行手順の行占有 | 残存 | REQ-021.md:39 |
| RQ-02: REQ-053-041/042 編集規律行 | **解消** | REQ-053 は 040 まで。手段分離編集で 041/042 行消滅（grep 非存在確認） |
| RQ-03: REQ-090-018/019/024 行間重複 | 残存（018↔024 間。019 は独立原則と判明） | REQ-090.md:33,39 |
| RQ-04: REQ-061-040 git コマンド詳細 | 残存（安全境界の安定契約例外候補） | REQ-061.md:59 |
| RQ-05: REQ-060-007 数値パラメータ | **解消** | REQ-060.md:22「timeout の標準値・上限値の所有は checker-execution-contracts.md が所有する」（数値は行から除去済み） |
| RQ-06: REQ-095-001/002 Tool 入力契約再述 | 残存（軽減。受理対応表の要約括弧のみ。REQ-092 廃止で運用文書分離は完了） | REQ-095.md:20-21 |
| RQ-07: REQ-092↔REQ-095 MERGE | **解消（廃止による）** | REQ-092 retired（requirements/README.md:99、numbering-policy.md:67） |
| GR-05: supervisor-credential-bridge.md 実測記録埋め込み | 残存 | supervisor-credential-bridge.md:115（docs/knowledge 側に同一実測の履歴があり複製に相当） |
| GR-06/GUIDE-6: 状態遷移モデル否定+frontmatter 状態管理否定 | 残存（行ズレ 141-143→143-145、145-153→147-155） | artifacts-and-state.md:143-155。v4-lifecycle-state-machine Design・DEC-033 と矛盾、「frontmatter や status フィールドによる状態管理は行わず」は Decision/Design の実 status 管理と事実矛盾で証拠強化 |
| GR-07: guides/README.md「正」語彙 | 残存（行ズレ :52→:65） | guides/README.md:65 |
| GR-08: consumer 導入ガイドの依存再生成手順欠落 | 残存（bun install/build:engine/vendor の言及 0 件。所有は plugin README+REQ-097-001 と解釈、配置責務は要ヒューマンレビュー） | consumer-project-setup.md 全文 grep |
| GR-10/DEC-031: superseded DEC-002 への relates-to 無注記 | 残存 | DEC-031.md:12-14（DEC-032:28 型の明示パターンが未適用） |
| REQ-038-006 2フェーズ読込 | 残存 | REQ-038.md:24 |
| REQ-050-016 実装パラメータ | **実質解消** | REQ-050.md:36「本行は固定数値を記載しない」（Design 委譲済み） |
| REQ-008-059 テーブル外見出し節+HOW 詳細 | 残存 | REQ-008.md:80-88 |
| REQ-036-029〜033 並列化受入条件 | 残存 | REQ-036.md:47-51 |
| REQ-036-002 移行記述 | 残存 | REQ-036.md:21 |
| REQ-036-022 schema 操作 | 残存 | REQ-036.md:40 |
| REQ-048 Legacy Baseline | 部分解消（015 で契約化。日付込み歴史記述は残留） | REQ-048.md:18-20、:40 |
| REQ-087-004 | **解消（廃止による）** | REQ-087 retired |
| REQ-092-003 | **解消（廃止による）** | REQ-092 retired |
| REQ-012/REQ-021 TIM 二重規定 | **実質解消**（REQ-012-030 で所有委譲明示。035 は要約残留のみ） | REQ-012.md:27,32、REQ-021.md:28 |
| v4-collaboration-loop 先送り記録 | 残存（明示ラベル+条件付きで適切） | v4-collaboration-loop.md:70 |
| inspect-docs Design ADF-COVERS 宣言 ID 重複 | 残存 | docs/designs/commands/inspect-docs.md:9-10（REQ-036-001/006/008/010 が implementation 型で 2 行に重複） |
| DEC-010 superseded DEC-002 現在形維持 | 残存（**DC-02 に昇格**: src/opencode 原本主張が REQ-099 受理後に現行矛盾化） | DEC-010.md:35-36 |
| DEC-022 superseded DEC-015 部分修正前提 | 残存 | DEC-022.md:47-49,86 |
| DEC-018 欠番の採番管理未記載 | 残存（REQ 廃止記録 :67-69 の追加は確認、DEC 分は未追加） | numbering-policy.md:58-70、decisions/README.md |
| 類推参照 3件（DEC-016/019/027） | 残存（類推明示あり、違反性低。Decision Map にも同一文言） | DEC-016.md:38、DEC-019.md:37、DEC-027.md:48 |
| GUIDE-6（command-selection 補足節の規範的記述） | 残存（quickstart.md:33 のガイド→ガイド「詳細」参照による階層逆転導線を追加確認） | command-selection.md:46-56、quickstart.md:33 |
| IR-044 ルール本文の作業履歴残存 | **解消（ルール再構成による）** | 現行 IR-044-req-spec-boundary-violation-detection.md に PR 番号記録・作業履歴なく、旧 detection.md サブファイルは消滅 |

## 6観点網羅確認（REQ 体系担当 fan-in 後）

- SPLIT: 候補なし（REQ-096/099 の複数成果物混在は目的節で所有範囲宣言済みの観察のみ。#3440 新規22行も違反なし）
- MERGE: REQ-102↔REQ-091 を評価し棄却（対象資産・手段・検証が異なる。REQ-091-005/REQ-102-004 は別対象への同一安全原則 = 1シグナル観察のみ）
- MOVE: 候補あり（DS-01 クラスタ + 残存 defer 群: REQ-008-059、REQ-036-029..033/002/022、REQ-038-006、REQ-021-030、REQ-061-040）
- DUPLICATE: 候補あり（RQ-03 残存。観察: #3440 投影不完全処置の3行記述〔REQ-017-021/030-020/032-038〕、REQ-101-014↔REQ-035-001）
- RETIRE: クリーン（現行61件はすべて現役。REQ-092/093/087 廃止済み・二重存在なし・retired 索引一致）
- DRIFT: 候補あり（DC-02、DS-01、DS-03、DS-05、RQ-01 + 既出系統: REQ-095:27/REQ-102:24、freshness 16）

## docs-check route 候補（STEP-3-2）

- Decision 索引 AUTOGEN 生成器の空 supersede_note レンダリング修正（`〔|〕` 出力防止）+ DEC-045 行再生成（DC-01）
- Design frontmatter updated 鮮度の Design 拡張検査または一括是正（DS-03。IR-072 の affected_artifacts 拡張候補）
- docs/designs 内パス実在性検査（DS-01 の機械化。IR-055 系パターンの Design 適用）
- phantom 移管記録の exemption パターン登録（「当時の行番号帯であり…廃止。移管記録」「旧 REQ-XXX-YYY から委任」の過去形形式。REQ-003.md:56/REQ-082.md:12 型）
- 「（…の直後に配置）」等の執筆メタ残渣検出（DS-04。低価値）
- REQ-036-002/022 の文言正規化（移行完了済み作業記述の現行形化）
- 完了済み変更指示語の陳腐化検出は文脈依存のため機械化困難 → inspect-docs（意味診断）継続扱いと明記

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 21件（2026-10-03〜10-04。本診断の機械的候補の大半を既に捕捉）
- `.agentdev/learning/inbox.md`: 未処理エントリ 71件
- `.agentdev/inspect/inbox/`: 既存 8件（前回診断分の defer 残置含む。本ファイルとあわせ inspect-promote の対象）
- `.agentdev/backlog/req-units/`: 0件
- 各 promoted/（intake / learning / inspect）: 0件
- `.agentdev/drafts/`: 0件

## 推奨アクション（defer 残置分）

- defer 1件（GR-11）は inbox 残置。次回以降の inspect サイクルで再評価（20260926 GD-03〔同一ファイルの基準参照欠落・defer 残置〕との合同修正候補）
- 残存 defer 群は原状継続（状況更新のみ、新規起票せず）
- promote 採用済み 8件は `.agentdev/inspect/promoted/finding-20261004-*.md` 参照

## 対象外（Out of Scope）

- 機械的検査クリーン項目（check_integrity baseline 管理 68件、AUTOGEN、command 形式、extensions、配布境界、Design frontmatter 形式、決定的破損、BOM・改行コード、command 参照実在、配布物構文）の再報告
- 既出 intake item 捕捉済み項目の新規起票（状況確認と補完のみ実施）
- intake / learning / RU の処理（intake-promote、learning-promote、backlog-review の責務）
- 配布物（command/skill）本文の詳細診断（inspect-skills の責務。STEP-3-1 の構文・エンコーディング・参照検査は実施済みでクリーン）
- 文章表層品質（textlint 共通基盤の責務）
- 診断担当が候補化しなかった観察メモ（REQ-032-032 の判定区分の安定契約扱い、REQ-090-011/027/029 の一期検証義務、#3440 投影不完全3行の DUPLICATE 観察、multi-host-operations.md の日付付き対応済み宣言〔REQ-099-011 適合〕、workflow-skill-model.md:207 の別 Issue ルーティング明示先送り）— 本ファイルの審議記録として参照可能

## 参照

- 診断担当: REQ 体系 / Design / Decision・guides・README の3並列委譲（読取専用、file:line 根拠付き戻り値、親が fan-in 統合）
- 機械的検査スクリプト: repo-agentdev-integrity（check_integrity --profile source、check_autogen_freshness、check_command_format、check_extensions、check_distribution_boundary、check_design_frontmatter、check_knowledge_docs、check_content_corruption、配布物 BOM/CRLF・command 参照実在の node 直接検査）
- source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides

## 処理記録

- 2026-10-05 実施（backlog-auto stage 2 inspect 系統、--auto なし、親直列化スロット）: promote 8件（DC-01、DC-02〔20260925 F-08 併合〕、DS-01〜DS-05、RQ-01）→ promoted/finding-20261004-*.md へ保存・本ファイルから削除。うち DS-02 は 2026-10-05 ユーザー事前承認（HITL。承認は候補昇格のみに適用し、恒久契約の帰属判断〔REQ-001 系へ要件化するか〕は req-define 壁打ちが所有）、他7件は自律確定（Jev 先行評価は evaluator 成功・観測永続化のみ digest 桁数不足で失敗し警告報告済み。in-context adversarial review 実施・unresolved 0件）。GR-11 は defer 残置。既知 defer 子処分: 解消確認 reject 6件（REQ-053-041/042、REQ-060-007 数値帯、REQ-092↔REQ-095 MERGE、REQ-087-004/REQ-092-003〔F-23〕、REQ-050-016〔F-05〕、REQ-012/REQ-021 TIM〔F-10〕）は各元ファイルでセクション削除・却下理由は commit message に記載。IR-044 作業履歴（20260925 F-06）は本診断の状況更新表「解消（ルール再構成による）」主張に対し、現行 IR-044-req-spec-boundary-violation-detection.md の :40/:64-65/:72/:79 に #1335/#1109 の PR 番号記録・是正経緯記述が実存することを反証として確認したため defer 継続（状況更新表の stage-1 記録は診断履歴として保持し、現在証拠は F-06 側に追記）。REQ-048 Legacy Baseline（F-17）は部分解消のため defer 継続。その他の残存 defer 21項目は原状継続
