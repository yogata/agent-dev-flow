# inspect-docs promoted 20260914T214425Z（promote 採用分）

> 本ファイルは inspect-promote（2026-09-15 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）の分類確定後、promote となった検出事項のみを保存する。22件。
> 採用元 finding ファイルは `inspect-docs-finding-20260914T214425Z.md`。本 promoted 保存後に inbox 側から promote 分を削除済み（defer 5件のみ同ファイルに残置）。
> reject 1件（DIST-02）は即時削除（却下理由は当該 commit message 参照）。旧 defer 残置分（20260901/20260907 の 2ファイル）は各元ファイルに原状維持。
> 判定根拠の詳細・証跡は各 finding の記載および adversarial-review 記録（2系統独立 stream、収束 convergence audit 完了）を参照。promote 22件・defer 5件は自律確定（HITL 対象なし）、DIST-02 は HITL によるユーザー確定（reject）。workflow-contracts Design「promote系判断確定とHITL境界」詳細判定表に従い判定。
> backlog-review との統合マーカーを各 finding に記載（intake promoted との二重修正の回避のため）。

## promote 一覧

### F-01: REQ-003-025/027 が case-open/case-ready 責務分割後の現行契約と矛盾（high/high）

- **対象**: docs/requirements/REQ-003.md:42（REQ-003-025）、:44（REQ-003-027）
- **根拠**: REQ-003-025「case-open は draft、RU 削除後に即時 push し」↔ REQ-030-007「case-open は draft / RU を削除しないこと」・REQ-061-025「case-ready は成功後に draft / RU を削除すること」・REQ-008-010「RU は case-ready 成功後にのみ削除」。REQ-003-027「case-open は子 Issue 本文に前工程完了度を記録し」↔ REQ-030-008「…Child Issue、Wave を作成しないこと」。`.agentdev/README.md` 状態表も case-ready 成功時削除で一致。REQ-030/061/008 + DEC-029（2026-09-14 accepted、状態遷移中心再構成）が多数・新規側
- **受け入れ条件**: REQ-003 当該行を現行の責務分割へ追随（UPDATE）または行自体を RETIRE。選択は req-define での設計判断に委ねる。req-define入力案: case-open の draft/RU 削除・即時 push、子 Issue 本文への完了度記述という旧責務を REQ-003 から除去し、draft/RU 削除は case-ready（REQ-061-025）、子 Issue 完了度記録は case-ready/case-close の現行契約へ集約する
- **統合マーカー**: DEC-029 波及クラスタ（README-1、GUIDE-1〜4、DRIFT-1〜3 と同一バッチ候補）

### F-02: docs/README.md の REQ-030 タイトルが旧題のまま（high/high）

- **対象**: docs/README.md 要件表 REQ-030 行（手動管理表）
- **根拠**: 表記「case-open 実行契約（Issue構成生成）」（最終更新 2026-08-15）↔ 実ファイル frontmatter title「case-open 実行契約（Root Case 確立と Definition Package）」（2026-09-14 改題）。requirements/README.md AUTOGEN 表は新題で一致、docs/README.md のみ陳腐化
- **受け入れ条件**: docs/README.md 表の文言を実ファイル frontmatter title へ修正（軽微表記修正）
- **統合マーカー**: docs/README.md 表記修正（F-01 と関連するが独立の軽微修正）

### F-03: 一時成果物・作業履歴識別子（RU/Issue/case 番号）の現行 REQ 残置（high/high、⑥のみ medium）

- **対象**: ① REQ-044.md:27-29（適用範囲「RU-0002/0003/0004」）② REQ-048.md:57（「RU-0002 由来」）③ REQ-057.md:45（「AG-009(a)（Issue #2386 由来）」）④ REQ-031.md:45（REQ-031-028「case 2769 で確立」）⑤ REQ-060.md:10（目的「case 2766/2768/2777/2779」）⑥ REQ-006.md:21-22（履歴文脈段落）
- **根拠**: REQ-001-030「永続文書の根拠参照は一時成果物の識別子を含まず」、REQ-008-012「RU は docs 永続文書の根拠参照対象外」、REQ-001-015「履歴情報は現行基準の本文では扱わない」。①②は RU 番号空間が再利用され現在の RU-0002（2026-09-15 別主題）と衝突し参照一意性を欠く
- **受け入れ条件**: ①〜⑤は識別子を機能的記述へ置換または削除（由来記録は追跡Issue・版管理履歴へ退避、REQ-001-015 準拠）。⑥は置換連鎖例外候補（REQ-001-013）と REQ-001-047 との緊張があるため、履歴文脈を置換連鎖の要点のみへ圧縮（例外適用の最終判断は req-define に委ねる）
- **統合マーカー**: 識別子除去バッチ（6箇所同一バッチ候補。2026-09-07 promoted F-03「配布物本文中の REQ 行 ID 直接引用」とは別対象）

### F-06: REQ-059-005 のテーブル外漏出散文（要件テーブル構造破損）（high/high）

- **対象**: docs/requirements/REQ-059.md:22-25
- **根拠**: REQ-059-005 のテーブル行直後にテーブルセルから漏出した散文 3行が表構造の外に存在。REQ-001-046・REQ-008-050 の標準構成から乖離（機械的シグナル）
- **受け入れ条件**: 漏出散文を REQ-059-005 行本文へ統合、または適用範囲へ要約（構造修正。保存工程の検査強化観点は本要件化方向の受け入れ条件に含める）
- **統合マーカー**: REQ 構造修正（F-01〜F-03 と同REQ 系バッチ候補）

### F-07: REQ-010-059 の旧ファイル名「spec-health-metrics.md」残存（high/high）

- **対象**: docs/requirements/REQ-010.md:31（REQ-010-059）
- **根拠**: 「AUTOGEN ブロック（spec-health-metrics.md 等）の鮮度を検出」— 実ファイルは docs/designs/quality/req-health-metrics.md（2度改名）。REQ-010-067（旧パス・削除済み名称検出）が本 REQ 自体の検査方針への自己違反
- **受け入れ条件**: 実ファイル名（`req-health-metrics.md` 等）へ置換（表記修正）
- **統合マーカー**: 表記修正単独（軽微）

### F-08: REQ-057-008 の参照注記「REQ-002-043（知識非保持原則）」ラベル不一致（medium/medium）

- **対象**: docs/requirements/REQ-057.md:23（REQ-057-008）
- **根拠**: REQ-002-043 の実内容は third-party Skill の配置・release 非同梱。「知識非保持原則」に対応するのは REQ-002-046。文脈（third-party 管理方針との並記）から ID 043 が意図されラベルが誤りと推定
- **受け入れ条件**: 注記ラベルを REQ-002-043 の実内容に合わせて修正（「third-party Skill 本体非同梱原則」等）、または ID を REQ-002-046 へ変更。選択は req-define での設計判断に委ねる
- **統合マーカー**: 表記修正単独

### README-1: 最小クイックスタートが現行フローと矛盾（case-ready 欠落）（high/high）

- **対象**: README.md L10-15（最小クイックスタートコードブロック）
- **根拠**: ブロックは `req-define → case-open → case-run → case-close` の4コマンドで、case-open 注釈「Issue を作成する」は旧責務表現。docs/guides/quickstart.md L19「case-ready をスキップしない」、docs/guides/req-case-flow.md L9 の5コマンドフロー、DEC-029（2026-09-14 accepted）と矛盾
- **受け入れ条件**: フローブロックを quickstart.md 参照へ縮約（索引の範囲へ戻す）、または5コマンドへ現行化。選択は req-define での設計判断に委ねる
- **統合マーカー**: DEC-029 波及クラスタ（F-01、GUIDE-1〜4、DRIFT-1〜3 と同一バッチ候補。GUIDE-1 と同時修正で README/guides 整合）

### GUIDE-1: quickstart.md に case-open 重複行（旧フロー編集残滓）（high/high）

- **対象**: docs/guides/quickstart.md L7 と L9
- **根拠**: L7 新注釈行（`/agentdev/case-open # Case Issue と Definition Package の作成`）と L9 旧注釈行（`/agentdev/case-open # Issue を作成する`）が同一ブロックに混在。正しい流れは5コマンド（機械的に一意）
- **受け入れ条件**: L9 の旧注釈行を削除
- **統合マーカー**: DEC-029 波及クラスタ（README-1 と同一ファイル群、同時修正推奨）

### GUIDE-2: RU 削除タイミングが自ファイル内で矛盾（旧 case-open 規定の残置）（high/high）

- **対象**: docs/guides/artifacts-and-state.md L119
- **根拠**: 「RU 削除は `/agentdev/case-open` の永続化成功に限定する。」↔ 同ファイル L112 の表「`/agentdev/case-ready` の Definition 確定 + VERIFY 成功時」。SSoT: designs/workflows/backlog-artifact-lifecycle.md L41「RU 削除を行う唯一の工程は case-ready」、REQ-008-010/011、`.agentdev/README.md` 状態表も同一
- **受け入れ条件**: L118-119 を case-ready 削除契約へ現行化
- **統合マーカー**: DEC-029 波及クラスタ（#2807 部分。GUIDE-3/GUIDE-4 と同種の RU 削除タイミング現行化バッチ）

### GUIDE-3: RU 削除表の case-open 行が現行契約と矛盾（high/high）

- **対象**: docs/guides/intake-learning-backlog-flow.md L114-117（RU の削除ルール表）
- **根拠**: 表行「RU の内容が Issue に永続化完了（Issue作成 + VERIFY 成功）| `/agentdev/case-open` | 該当 RU ファイル」↔ 同ファイル L119「`/agentdev/case-ready` は Definition 確定後に RU を削除」。SSoT は GUIDE-2 と同一
- **受け入れ条件**: 表行の実行コマンド/トリガーを case-ready へ現行化
- **統合マーカー**: DEC-029 波及クラスタ（GUIDE-2/GUIDE-4 と同一バッチ）

### GUIDE-4: トラブルシューティング項目全体が旧 RU 削除モデル前提（high/high）

- **対象**: docs/guides/troubleshooting.md L26-33（「case-open で RU が削除されない」節）
- **根拠**: 「Issue 作成後に RU ファイルが残っている」を症状とし「再度 case-open を実行する」を対処とする。現行契約では case-open 後の RU 残置は正常動作（削除は case-ready、REQ-008-010）。現行では発生し得ない「問題」への対処を案内
- **受け入れ条件**: 同節を case-ready の VERIFY 失敗/RU 残置契約へ書き換えまたは削除
- **統合マーカー**: DEC-029 波及クラスタ（GUIDE-2/GUIDE-3 と同一バッチ）

### GUIDE-5: 参照方向の記述が実際と逆方向（medium/high）

- **対象**: docs/guides/project-docs-and-specs.md L88
- **根拠**: 「REQ → Issue の一方向参照である。Issue から REQ への逆参照は行わない」。正規契約は逆: agentdev-req-file-manager/references/matching-and-merge.md L82「REQファイルはIssueから一方向参照（Issue本文にREQ番号を記載）」。実務も全 Case Issue が REQ 番号を標題に持つ（例: Issue #2809「REQ-061/017/035」）
- **受け入れ条件**: L88-89 を「Issue 本文に REQ 番号を記載（Issue→REQ の一方向参照）。REQ/Decision ファイルから Issue への逆参照は行わない」へ修正
- **統合マーカー**: 既存 defer 20260901 F-27（guides 間参照方向分岐、正本未確定のため defer）の project-docs 側を新証拠（配布 Capability Skill 正規契約記述 + 実務観測）で解決する関係。F-27 自体は本次実行で原状維持（artifacts-and-state 側の残存スコープも含むため。再評価は次回 inspect サイクル）

### GUIDE-7: 用語集の Decision 定義が拡張前の旧定義のまま（medium/high）

- **対象**: docs/guides/glossary.md L35
- **根拠**: 「Decision | 取り返しのつかない技術判断の記録」↔ document-model.md「Decision 定義拡張」の拡張後定義「将来の設計、運用、文書システムを制約する決定の記録」。現行 Decision 群（DEC-016、DEC-025 等）は旧定義では説明不能
- **受け入れ条件**: document-model.md の拡張後定義へ更新
- **統合マーカー**: GUIDE-9 と同ファイル（glossary 更新バッチ）

### GUIDE-9: 検出事項（Finding）の定義から inspect 系が漏落（low/medium）

- **対象**: docs/guides/glossary.md L67
- **根拠**: 「検出事項（Finding）| docs-check や case-run で検出された乖離、発見事項」。現行の主要な finding 供給源は inspect-docs / inspect-skills（REQ-036、`.agentdev/inspect/inbox/`、inspect lifecycle）
- **受け入れ条件**: 定義に inspect 系コマンドを追加
- **統合マーカー**: GUIDE-7 と同ファイル（glossary 更新バッチ）

### DESIGN-1: document-model.md が存在しない foundations/workflow-contracts.md を配置登録（medium/high）

- **対象**: docs/designs/foundations/document-model.md L537 + L549
- **根拠**: 両表とも `workflow-contracts.md | foundations/`（縮小済み旧版）を登録するが、実ファイルは docs/designs/workflows/workflow-contracts.md のみ（foundations/ 実在 9ファイル全数確認で不存在）。docs/designs/README.md の foundations 表にも掲載なし（ファイル不存在は機械的）
- **受け入れ条件**: 該当行の削除または実配置（workflows/）への参照修正
- **統合マーカー**: document-model.md 索引修正（cleanup モデル処置候補: REFERENCE）

### DESIGN-2: 廃止 REQ-028-007 の引用に (retired) 注記・後継併記がない（low/high）

- **対象**: docs/designs/authoring/vocabulary-registry.md L10/L32、docs/designs/integrity/integrity-rule-catalog.md L121/L123、docs/designs/README.md L244
- **根拠**: REQ-028（retired）配下の 007 を注記なしで引用。同一文書内の他箇所（integrity-rule-catalog L129-132、rule-ownership L177）は「retired REQ-028-007」と注記あり。参照規則（document-model）は廃止文書参照に `(retired)` 注記 + 現行後継文書の併記を要求
- **受け入れ条件**: 該当箇所に retired 注記 + 後継（DEC-006/REQ-036 系）併記
- **統合マーカー**: retired 注記バッチ（5箇所）

### DRIFT-1: 実装 Case 完了後も draft のままの Design — case-ready.md（medium/high）

- **対象**: docs/designs/commands/case-ready.md（status: draft、2026-09-14 保存）
- **根拠**: REQ-061 対応 Case #2809 closed・PR #2817 merged 後も draft のまま。見送り記録（見送り理由・再評価契機）なし（関連 Issue コメント・Design 本文中にもなし）。REQ-001-025（Design ライフサイクル: 確定時に accepted へ遷移、昇格は case-close の責務）違反。なお ADF-COVERS 宣言欠落自体は非違反（PR #2817 の記録により SKILL.md 側配置が正規配置規則に沿うため）
- **受け入れ条件**: case-close の Design 状態評価（棚卸し制、REQ-032-024..026）へ差し戻し — accepted 昇格または見送り記録（理由・再評価契機）の付与
- **統合マーカー**: DEC-029 波及クラスタ（DRIFT-2/DRIFT-3 と同一の棚卸しバッチ）

### DRIFT-2: 実装 Case 完了後も draft のままの Design — case-revise.md（medium/high）

- **対象**: docs/designs/commands/case-revise.md（status: draft、2026-09-14 保存）
- **根拠**: REQ-062 対応 Case #2810 closed・PR #2818 merged 後も draft のまま。見送り記録なし。REQ-001-025 違反（DRIFT-1 と同型。Case 標題が REQ を直接明示）
- **受け入れ条件**: DRIFT-1 と同一（棚卸し制への差し戻し — accepted 昇格または見送り記録の付与）
- **統合マーカー**: DEC-029 波及クラスタ（DRIFT-1/DRIFT-3 と同一の棚卸しバッチ）

### DRIFT-3: 実装 Case 完了後も draft のままの Design — definition-readiness.md（medium/medium）

- **対象**: docs/designs/workflows/definition-readiness.md（status: draft、2026-09-14 保存）
- **根拠**: REQ-061/REQ-005 対応（PR #2817 が対応を記録、Case #2806 closed）後も draft のまま。見送り記録なし。REQ-001-025 違反。ただし本 Design は ADF-COVERS 宣言を持たないため REQ ファイル単位の近似判定である（近似判定である旨を明示）
- **受け入れ条件**: DRIFT-1 と同一（棚卸し制への差し戻し — accepted 昇格または見送り記録の付与）
- **統合マーカー**: DEC-029 波及クラスタ（DRIFT-1/DRIFT-2 と同一の棚卸しバッチ）

### DEC-1: Decision Map が現在不存在の Design パスを後継として案内（low/high）

- **対象**: docs/decisions/README.md Decision Map 行「DEC-007 | supersedes-spec | docs/designs/local/artifact-graph.md」
- **根拠**: 「後継 Design は docs/designs/skills/agentdev-artifact-graph.md」と案内するが両パスとも実在しない（artifact-graph は DEC-017 により agentdev-traceability / traceability-model.md へ移管済み）。履歴 Map とはいえ現行後継の案内がなく読者が途切れる
- **受け入れ条件**: Map 行に現行後継（agentdev-traceability / foundations/traceability-model.md）を併記
- **統合マーカー**: 2026-09-07 偽陽性記録（DEC-007 行の旧 Design パス言及 = supersedes-spec の履歴記録として許容）とは別側面（現行後継案内の欠落）である点を backlog-review で留意

### ADJ-1: superseded DEC-005 が現行参照として無注記で引用（medium/high、範囲囲外隣接検出）

- **対象**: .agentdev/README.md L65「[DEC-005](../docs/decisions/DEC-005.md): Project Extensions Architecture」
- **根拠**: DEC-005 は status: superseded（superseded_by: DEC-006）。参照更新規則（document-model「廃止 Decision 参照更新」）は現行後継への更新か注記を要求。docs/README.md L81 は「（superseded by DEC-006）」と注記ありで適合
- **受け入れ条件**: 参照更新（注記 + 後継併記。DEC-006 の置換範囲は inspect-extensions 廃止に係る部分置換である点に注意）
- **統合マーカー**: 範囲囲外隣接検出（`.agentdev/README.md`）。参照更新単独

### DIST-01: case-run.md frontmatter 内の空行（他 command と不整合）（medium/high）

- **対象**: .opencode/commands/agentdev/case-run.md line 1-4（先頭バイト列: `---` / 空行 / `description:`。src/opencode 正本・.opencode 投影と内容同一）
- **根拠**: 開始デリミタ `---`（line 1）と `description:`（line 3）の間に空行（line 2）が存在。他の全18 command + README（計19ファイル）は `---` の直後に `description:` を置く形式で case-run.md のみ逸脱（機械検査確定）。YAML としては有効だが、frontmatter 先頭空行を許容しないパーサでは description 認識漏れ（コマンド一覧表示・検索劣化）のリスク
- **受け入れ条件**: frontmatter の空行削除（変更1行、意味判断不要）。docs-check route 候補 #1（frontmatter 先頭空行検出）は独立 route とせず本受け入れ条件に包含（検査契約への追加検討を本件の要件化方向に含める。既存 check_content_corruption.ts は frontmatter 破損を意図的に対象外）
- **統合マーカー**: 配布物修正（ng 分類は pre-existing、別途要件化/メンテナンス Case 候補）

## 参照

- 分類実行: /agentdev/inspect-promote（backlog-auto stage 2 inspect 系統）2026-09-15、--auto なし
- 判定: promote 22（自律確定）/ defer 5（自律確定、inbox 残置）/ reject 1（DIST-02、HITL ユーザー確定・即時削除。却下理由は commit message 参照）
- 後続: /agentdev/backlog-review
