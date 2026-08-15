# inspect-docs finding 20260815T082159Z

## サマリ

- スキャン対象: docs/requirements（36ファイル）、docs/decisions（17ファイル）、docs/specs（約160ファイル、audits/baselines/rules の日付き履歴群は横断参照確認のみ）、docs/guides（13ファイル）、README.md / docs/README.md、配布物（src/opencode/commands/agentdev/**、src/opencode/skills/agentdev-*/**、node_modules 除外）
- 検出件数: 20件
  - 配布物: 存在しない command 参照 1件（high）
  - 横断契約矛盾（件数記述の陳腐化）: 1件（medium）
  - SPEC 分離基準違反候補（MOVE）: 11件（high 6件 / medium 5件、安定契約例外候補を含む）
  - REQ 構造（SPLIT/MERGE 候補）: 2件（medium/low、要ヒューマンレビュー）
  - SPEC status 整合（draft 放置）: 3件（medium）
  - SPEC 責務（spec-as-replacement 候補）: 2件（low、要ヒューマンレビュー）
- high severity: 7件（F-01、F-04〜F-08、F-19 のうち high 判定の SPEC分離違反 6件 + F-01）
- 未処理 artifact: intake inbox 43件、learning inbox.md 410行（F-03、報告のみ）

## 検出事項リスト

### F-01: 配布物に存在しない command 参照（実行主体分類の誤認を含む）

- **category**: 存在しない command 参照 / executor-misclassification
- **target**: src/opencode/commands/agentdev/intake-capture.md:53
- **evidence**: `- G06: learning item の保存、分類、昇華を担当しない。再発防止知見のみの観測は \`/agentdev/learning-capture\` に委ねる` — learning-capture は skill であり `/agentdev/*` command は存在しない（実在 command 16種と照合済み）
- **severity**: high
- **confidence**: high（README listing と command 本文の相互参照による機械的判定）
- **source_of_truth**: 実在 command 一覧（src/opencode/commands/agentdev/）
- **recommended_route**: 要件化（intake-capture command のガードレール修正。スキル参照はコマンド記法ではなくスキル名表記へ）
- **ng_classification**: pre-existing
- **notes**: 修正案: 「`agentdev-learning-capture`（スキル）に委ねる」等の表記修正。配布物のため利用者への誤導線となる。

### F-02: 現行 REQ 件数記述の陳腐化（横断契約矛盾）

- **category**: 横断契約矛盾（索引・件数記述の陳腐化）
- **target**: docs/specs/foundations/patterns.md:68
- **evidence**: `**新基準 REQ 群**（REQ-001〜0133、25 件、v2:REQ-0111, ... は廃止）を現行仕様の主参照とする。` — 現行は REQ-001〜035 の35件（docs/requirements/README.md AUTOGEN および docs/README.md AUTOGEN と不整合）
- **severity**: medium
- **confidence**: high（AUTOGEN ブロックとの機械的照合）
- **source_of_truth**: 現行 REQ（docs/requirements/README.md、35件）
- **recommended_route**: 要件化（patterns.md 当該行の修正。件数・範囲は docs/requirements/README.md を正とし複製しない方針との整合も確認）
- **ng_classification**: pre-existing
- **notes**: patterns.md は「現行 REQ の一覧、範囲は docs/requirements/README.md を正とし、本 SPEC では複製しない」と自称（:69）しており、:68 の件数記述がこの方針にも違反。

### F-03: 未処理 artifact の存在（報告のみ、処理対象外）

- **category**: 未処理 artifact
- **target**: .agentdev/intake/inbox/（43ファイル）、.agentdev/learning/inbox.md（410行）
- **evidence**: intake inbox 43件（2026-07-18〜2026-08-15 付）、learning inbox 410行。intake/promoted、learning/promoted、backlog/req-units、drafts は0件
- **severity**: low
- **confidence**: high
- **source_of_truth**: n/a
- **recommended_route**: `/agentdev/intake-promote`（intake 43件）、`/agentdev/learning-promote`（learning inbox）の実行検討。本診断では処理しない
- **ng_classification**: n/a
- **notes**: intake inbox に inspect 関連の古い item（2026-07-18、2026-08-11〜15）が蓄積しており、docs 修正と重複する検出内容（stale reference 系）が含まれる可能性。promote 時の重複確認を推奨。

### F-04: REQ-001 要件行の enum 一覧残留（非意味修正6分類）

- **category**: SPEC 分離基準違反（enum値一覧残留）
- **target**: docs/requirements/REQ-001.md:57（REQ-001-057）
- **evidence**: `直接更新可能な非意味修正は6件（誤字/文字化け修正、壊れたリンク/誤ったファイルパス修正、タイトル本文不一致修正、意味を変えない表記統一、移行時ラベル除去、補助情報修正）とすること`
- **severity**: high
- **confidence**: high
- **source_of_truth**: n/a（MOVE 判定）
- **recommended_route**: 要件化（document-model SPEC 等への移送検討。REQ 側は「非意味修正として直接更新できること」等の WHAT に留める）
- **ng_classification**: pre-existing
- **notes**: high-specificity signal（enum 一覧が要件行の主文意）。F-05 と同一 REQ 内のため統合移送可。

### F-05: REQ-001 要件行の enum 一覧残留（意味変更6分類）

- **category**: SPEC 分離基準違反（enum値一覧残留）
- **target**: docs/requirements/REQ-001.md:58（REQ-001-058）
- **evidence**: `後継 Decision を必要とする意味変更は6件（決定内容の追加/削除、適用範囲変更、必須条件/制約変更、正規所有者変更、採用方式変更、外部観測可能結果変更）とすること`
- **severity**: high
- **confidence**: high
- **source_of_truth**: n/a
- **recommended_route**: 要件化（F-04 と併せた SPEC 移送）
- **ng_classification**: pre-existing
- **notes**: F-04 と同一移送単位。

### F-06: REQ-002 要件行の種別定義残留（Extension 3種）

- **category**: SPEC 分離基準違反（enum値一覧残留）
- **target**: docs/requirements/REQ-002.md:40（REQ-002-030）
- **evidence**: `Project Extensions は workflow/capability responsibility 中心の単位で配置すること。Workflow Extension / internal Workflow Extension / Capability Skill Extension の3種を定義すること。`
- **severity**: high
- **confidence**: medium
- **source_of_truth**: n/a
- **recommended_route**: 要件化（project-extensions SPEC への移送検討）
- **ng_classification**: pre-existing
- **notes**: 安定契約例外候補（外部接続契約の大枠）に近い。DEC-012 が種別再編の Decision を持つため、REQ は「3種」の列挙ではなく種別基準の存在要求に留める案もあり。

### F-07: REQ-005 要件行の分類 enum 残留（command 5分類）

- **category**: SPEC 分離基準違反（route判定表・enum値一覧残留）
- **target**: docs/requirements/REQ-005.md:26（REQ-005-010）
- **evidence**: `全公開 command は主フロー、最大自走入口、補助フロー、検出フロー、repo-local 検査のいずれかに分類すること`
- **severity**: high
- **confidence**: medium
- **source_of_truth**: n/a
- **recommended_route**: 要件化（workflow-contracts SPEC 等への移送検討）
- **ng_classification**: pre-existing
- **notes**: 分類体系自体は公開 command 群の外部契約に近い（安定契約例外候補）。REQ-005-006（workflow_route 派生値、:22）も同種の内部パラメータ記述だが単独では観察メモ。

### F-08: REQ-012 要件行の node 種別定義残留

- **category**: SPEC 分離基準違反（schema field・enum値一覧残留）
- **target**: docs/requirements/REQ-012.md:18（REQ-012-003）
- **evidence**: `標準 node_types デフォルトは requirement, decision, specification の3種とし、command, skill, integrity_rule, extension, source_file は augmentation が追加すること`
- **severity**: high
- **confidence**: high
- **source_of_truth**: n/a
- **recommended_route**: 要件化（agentdev-artifact-graph SPEC への移送検討）
- **ng_classification**: pre-existing
- **notes**: デフォルト3種+拡張5種の列挙が要件行の主文意。スキーマ詳細は SPEC が所有。

### F-09: REQ-030 ローカルCaseファイルの enum・field 定義残留（安定契約例外候補）

- **category**: SPEC 分離基準違反（enum値一覧・schema field 残留）
- **target**: docs/requirements/REQ-030.md:28-31（REQ-030-028〜031）
- **evidence**: status 6値 enum（`open、running、blocked、review、closed、cancelled`、詳細遷移表は SPEC と明記）、YAML frontmatter 必須 field 列挙（`id、title、status、created_at、updated_at、closed_at、labels`）、必須セクション指定（`SPEC確定候補セクションと Findings/Capture候補セクション`）
- **severity**: medium
- **confidence**: medium
- **source_of_truth**: n/a
- **recommended_route**: 要件化（local-case-file SPEC との分担再編検討）
- **ng_classification**: pre-existing
- **notes**: 安定契約例外候補（ドメイン状態の位置づけ・外部接続契約）。「詳細遷移表は SPEC」と例外自覚があるため確信度を medium に調整。3行を1件に集約。

### F-10: REQ-034 実行パラメータ要件行の残留（安定契約例外候補）

- **category**: SPEC 分離基準違反（実装パラメータ残留）
- **target**: docs/requirements/REQ-034.md:27,30,33（同時起動数固定値・再実行回数上限・5種リポジトリ種別）
- **evidence**: `同時起動数は固定値とし実行安全境界として遵守すること（数値の詳細は SPEC）`、`再実行回数上限は SPEC`、`5種のリポジトリ種別（self-hosting、consumer-with-agentdev、consumer-local、consumer-generated、plugin-future）を定義すること`
- **severity**: medium
- **confidence**: medium
- **source_of_truth**: n/a
- **recommended_route**: 要件化（case-auto SPEC・distribution-boundary SPEC との分担再編検討）
- **ng_classification**: pre-existing
- **notes**: 安全境界の大枠は安定契約例外候補。「数値の詳細は SPEC」と例外自覚があるため medium。リポジトリ種別は REQ-029 配布依存境界と重複感もある（REQ 間整合の確認を含め要ヒューマンレビュー）。

### F-11: REQ-011 boolean 設定フラグの要件行残留

- **category**: SPEC 分離基離違反（実装パラメータ残留）
- **target**: docs/requirements/REQ-011.md:32-33（REQ-011-012/013）
- **evidence**: `agentdev_handoff: true は AgentDevFlow 本体向けの引き継ぎ標識とし、通常 RU または要件doc の必須 frontmatter ではないこと`、`agentdev_handoff: false も記載しないこと`
- **severity**: medium
- **confidence**: medium
- **source_of_truth**: n/a
- **recommended_route**: 要件化（SPEC 移送または要件文の抽象化）
- **ng_classification**: pre-existing
- **notes**: 2行で1件的扱い。特定 field 名の禁止規定は SPEC 分離基準違反だが、frontmatter の外部契約に近い側面もあり medium。

### F-12: REQ-016 停止条件の入力形式詳細残留

- **category**: SPEC 分離基準違反（内部契約詳細残留）
- **target**: docs/requirements/REQ-016.md:18（REQ-016-007）
- **evidence**: `case-auto は user-decision-required + decision_context を受領して自走を停止し...`（停止分類と入力 field 名の組み合わせが要件行の主文意）
- **severity**: medium
- **confidence**: medium
- **source_of_truth**: n/a
- **recommended_route**: 要件化（case-auto SPEC との分担再編検討）
- **ng_classification**: pre-existing
- **notes**: 停止条件の大枠は安定契約例外候補のため medium。

### F-13: REQ-010 複数ドメイン混在（SPLIT 候補）

- **category**: REQ 構造 SPLIT
- **target**: docs/requirements/REQ-010.md
- **evidence**: 目的において `本 REQ は本体リポジトリ専用の自己監査 command、配布対象の検出コマンド群、取り込みと学習の各 pipeline、backlog 統合を所有し、文書と配布物の検出、診断、是正候補抽出を担当する` と複数関心（自己監査 / 検出 / intake / learning / backlog 統合 / capture 境界）を単一 REQ が所有
- **severity**: medium
- **confidence**: medium
- **signal_count**: 2以上（複数 command family、複数 lifecycle 段階の混在）
- **source_of_truth**: n/a
- **recommended_route**: 要件化（req-define での再壁打ち。分割単位の協議）
- **ng_classification**: pre-existing
- **notes**: 一方で診断系の横断責務を1 REQ に束ねる意図（REQ-010 が「自己監査と診断・是正候補抽出」の包括契約）という設計判断も成立し得る。採否は要ヒューマンレビュー。

### F-14: REQ-012〜024 Artifact Graph 系 REQ 群の粒度（MERGE 候補観察）

- **category**: REQ 構造 MERGE（粒度過小の観察）
- **target**: docs/requirements/REQ-012, 013, 020, 021, 022, 023, 024
- **evidence**: 同一関心（Artifact Graph）が標準化 / DOC-MAP 依存除去 / 解析品質 / ワークフロー統合 / augmentation 配置先 / 問い合わせ関係拡張 / warning 分類の7ファイルに細分化。REQ-013 は完了済み依存除去（DOC-MAP 廃止済み）であり現行価値が履歴化している可能性
- **severity**: low
- **confidence**: low
- **signal_count**: 複数 REQ が同一対象成果物（Artifact Graph）を扱う
- **source_of_truth**: n/a
- **recommended_route**: 要件化（req-define での統合・RETIRE 単位の協議。特に REQ-013 は達成後の残置 REQ として RETIRE 観点の評価を推奨）
- **ng_classification**: pre-existing
- **notes**: 個別最適化された分割という設計判断の可能性があり、確信度は low。要ヒューマンレビュー。破壊的な統合は推奨しない。

### F-15〜F-17: 実装済み横断 SPEC の draft 放置（status 整合）

- **category**: SPEC status 整合（draft 放置）
- **target**:
  - F-15: docs/specs/workflows/workflow-skill-model.md（status: draft、DEC-010 実装詳細の正規所有者と自称）
  - F-16: docs/specs/workflows/step-reference-contract.md（status: draft、DEC-011 実装詳細の正規所有者と自称）
  - F-17: docs/specs/workflows/input-resolution-and-durable-state.md（status: draft、DEC-011 側面の正規所有者と自称）
- **evidence**: 各 SPEC は現行配布物・workflow が依存する契約（Workflow Skill model、STEP reference 構造、durable state 再構成）を正規所有するが、frontmatter status が draft のまま。docs/specs/README.md の status 列も draft
- **severity**: medium
- **confidence**: medium
- **source_of_truth**: docs/specs/README.md（SPEC status 追跡情報源）
- **recommended_route**: 要件化（case-close 工程での draft→accepted 昇格、または IR-054 draft 放置検出との突合）
- **ng_classification**: pre-existing
- **notes**: draft→accepted 昇格は case-close の責務。正規所有 SPEC が draft のまま運用されている実態が、文書体系の権限づけ（SPEC README の「現行アーキテクチャの正規文書」宣言）と揺れている。

### F-18〜F-19: SPEC が要件・判断内容を正規所有する状態（spec-as-replacement 候補）

- **category**: SPEC 責務（spec-as-replacement 候補）
- **target**:
  - F-18: docs/specs/foundations/decision-lifecycle.md:21（`Decision の関係モデル、粒度管理規則、健全性評価モデルを正規所有する（REQ-001-061〜064、AG-005、AG-006、AG-017）`）
  - F-19: docs/specs/responsibilities/artifact-quality-control-routing.md:12-16（品質能力の導出規則と execution contract 投影契約を「設計記録」として所有）
- **evidence**: いずれも REQ 行（REQ-001-061〜064、REQ-017）を引用してはいるが、判断内容の主体が SPEC 側に置かれている。文書間関係（REQ → Decision → SPEC）における WHAT/WHY の所在が逆転している可能性
- **severity**: low
- **confidence**: low
- **source_of_truth**: 現行 REQ（REQ-001、REQ-017）
- **recommended_route**: 要件化（req-define での WHAT/WHY の所在確認。移送の要否は協議）
- **ng_classification**: 要ヒューマンレビュー
- **notes**: REQ 側に対応要件行が実在する場合は SPEC 詳細化として正であり、誤検知の可能性が高い。確信度 low のため観察記録に留める。

## 推奨アクション

| 検出事項 | 推奨 route | 備考 |
|---|---|---|
| F-01 | `/agentdev/inspect-promote` で採否確定後、要件化（intake-capture command 修正） | 配布物修正は case 経由 |
| F-02 | 要件化（patterns.md 修正） | docs 修正は case 経由 |
| F-03 | `/agentdev/intake-promote` / `/agentdev/learning-promote` | 本診断の範囲外 |
| F-04〜F-12 | 要件化（SPEC 分離基準違反の移送。REQ 単位でまとめて協議） | 高確信度群から段階実施を推奨 |
| F-13, F-14 | `/agentdev/req-define` での再壁打ち（SPLIT/MERGE/RETIRE 単位） | 要ヒューマンレビュー |
| F-15〜F-17 | 要件化（SPEC status 昇格運用の見直し） | case-close 工程と IR-054 との整合 |
| F-18〜F-19 | `/agentdev/req-define` での所在確認 | 誤検知の可能性を含む観察記録 |

## 対象外（Out of Scope）

- 旧世代 ID（`v2:REQ-01XX`、`v2:ADR-01XX`）の出典表記・履歴参照 — 版管理履歴として適正（tag v2.11.0 の存在確認済み）
- `docs/specs/README.md` の `/agentdev/inspect-extensions` 記載 — superseded SPEC の管理登録として適正
- node_modules 配下の MIXED-EOL（@types/bun README 等） — 外部成果物のため対象外
- `docs/specs/commands/**`、`docs/specs/skills/**` の個別 SPEC 診断、Command/Skill 参照妥当性の詳細診断 — inspect-skills の対象領域
- `docs/specs/integrity/audits/**`、`baselines/**` の日付き監査ドキュメント — 履歴文書
- 機械的検査による確認済みクリーン項目: REQ frontmatter id↔ファイル名整合（35/35）、requirements/README・docs/README AUTOGEN 索引整合、配布物 BOM・CRLF/LF・内部 ID（REQ-/ADR-/SPEC-/IR-/DEC-）汚染、frontmatter 重複、見出し重複、ADR status と decisions/README 索引整合、guides リンク切れ、workflow skill ディレクトリ参照実在
- guides/README/ADR 意味診断（bg タスク）: 検出事項なし（導線・索引・ADR 引用は整合）
