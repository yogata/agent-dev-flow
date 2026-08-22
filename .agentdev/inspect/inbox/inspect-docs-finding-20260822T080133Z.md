# inspect-docs finding 20260822T080133Z

## サマリ

- スキャン対象: docs 全体（現行 REQ 38件 / retired REQ 9件 / Decision 19件 / Design 約170件 / guides 12件 / README 2件）+ 配布物（src/opencode/commands/agentdev/ 18コマンド + templates 27 / src/opencode/skills/ 50スキル + .opencode/ 投影）
- 検出件数: 6件（high 1件 / medium 2件 / low 3件）
- 主なカテゴリ: 配布物整合性（source projection 乖離、孤立テンプレート）、Decision status 整合、参照整合（旧番号帯引用）、Design status 長期 draft の被参照
- 探索手段: README 索引、正規成果物の直接読取、rg による独立探索、並列 explore 3系統（REQ 構造 / Design・Decision・guides / 配布物）+ orchestrator 意味判定

## 検出事項リスト

### F-01: .opencode/skills 投影と src/opencode/skills の乖離（4スキル投影欠落 + 撤去済みスキルの stale junction 残存）

- **category**: 配布物統合性（source projection 整合）
- **target**: `.opencode/skills/`（junction 群）
- **evidence**: src 側に存在するのに投影なし: `agentdev-workflow-backlog-auto`、`agentdev-workflow-design-save`、`agentdev-design-file-manager`、`agentdev-traceability` の4スキル。逆に src 側に存在しない stale junction: `agentdev-artifact-graph`（DEC-017 で撤去済み）、`agentdev-spec-file-manager`、`agentdev-workflow-spec-save`（旧称残存）。実害として本環境では `agentdev-workflow-backlog-auto` が skill registry に未登録（backlog-auto コマンドが権威情報源スキルを解決できず、ファイル直接読取で代替実行した）
- **severity**: high
- **confidence**: high
- **source_of_truth**: src/opencode/skills/（配布原本）を正とし .opencode/ 投影の乖離を検出
- **recommended_route**: 運用対応（`install-consumer-opencode.ps1 -Mode apply` 再実行による junction 再構築）+ IR-016（source-projection-integrity）適用状況の確認。Command/Skill 参照妥当性の詳細は `/agentdev/inspect-skills` 独立実行を促す
- **ng_classification**: pre-existing
- **notes**: 撤去済み `agentdev-artifact-graph` への stale junction は DEC-017（Artifact Graph 廃止）との矛盾状態。機械検査候補: src/.opencode のスキル集合突合を docs-check 検査データ化（STEP-3-2 で docs-check route 候補として提示）

### F-02: proposed Decision（DEC-016/DEC-017）が実装済み現行基盤として被参照

- **category**: Decision status 整合
- **target**:
  - docs/requirements/REQ-012.md:51、docs/requirements/REQ-021.md（関連 Decision として DEC-017 を引用）
  - docs/designs/README.md（agentdev-traceability 行、traceability-model 行で「REQ-012、DEC-017」）
  - docs/designs/local/runtime-package-boundary.md:160（provisioning 責務の根拠として DEC-016 を引用）
- **evidence**: DEC-017 は status: proposed だが、当該判断（Artifact Graph 撤去、最小トレーサビリティモデル採用）は実装済み（commit a36589d9「旧 Artifact Graph 撤去」、`foundations/traceability-model.md` は status: accepted で DEC-017 を根拠表示）。DEC-016 も導入系スクリプトの現行動作の根拠として引用される。実態（実装・運用済み）と status（proposed）の間に権威づけのズレ
- **severity**: medium
- **confidence**: medium
- **source_of_truth**: docs/decisions/README.md（Decision status 追跡）を正とし、被参照の実態を矛盾候補として検出。status 昇格の要否は decision-lifecycle Design 管轄のため確定は Medium
- **recommended_route**: Decision status 昇格（proposed → accepted）の要否を decision-lifecycle 規則で評価。REQ 変更ではなく Decision 運用（maintenance 対応、case-open docs_chore 経由を想定）
- **ng_classification**: pre-existing
- **notes**: DEC-016〜019 が一括で proposed のまま維持されている経緯（バッチ昇格の意図的有無）の確認を含む

### F-03: 孤立テンプレート templates/integrity-check/standard.md の残存

- **category**: 配布物統合性（廃止名残存・参照元なしテンプレート）
- **target**: src/opencode/commands/agentdev/templates/integrity-check/standard.md
- **evidence**: integrity-check は docs-check の旧称（docs/guides/glossary.md:20「旧称: integrity-check」）。現行 docs-check は repo-local の `.opencode/commands/repo/templates/docs-check/standard.md` を使用しており、agentdev 配布物側の `templates/integrity-check/standard.md` を参照する command/skill は存在しない
- **severity**: low
- **confidence**: high
- **source_of_truth**: docs/guides/glossary.md（改称記録）を正とし、旧称テンプレートの残存を検出
- **recommended_route**: 削除対応（docs_chore、case-open 経由）。機械検査候補: templates 配下の被参照チェック（STEP-3-2 docs-check route 候補）
- **ng_classification**: pre-existing
- **notes**: req-045 監査（20260822）では A1 として pass 判定だが、監査の検査観点（存在しない command 参照）は参照元側の検出であり、参照される側の孤立は別観点

### F-04: design-save.md が旧番号帯 REQ-0136-029 を現行契約の根拠として引用

- **category**: REQ 参照ID整合性（旧番号帯の無印引用）
- **target**: docs/designs/commands/design-save.md:165
- **evidence**: 「target_area 見出し検索は `agentdev-design-file-manager/scripts/src/search-target-area.ts`（Design 固有決定的処理）へ委譲する（REQ-0136-029）」。REQ-0136 は docs/requirements に存在しない旧番号帯（v2: プレフィックスもなし）。同一文書内の他の根拠引用（REQ-008-058 等）は現行3桁形式で、旧番号帯と混在
- **severity**: medium
- **confidence**: high
- **source_of_truth**: docs/requirements/README.md（現行 REQ は3桁番号帯、過去版は v2: プレフィックスで区別、現行要件の根拠にしない）を正として検出
- **recommended_route**: 根拠の再同定（対応する現行要件行への置換、または当該契約の正規根拠が Design 側にあることの明示）を要する文書修正（docs_chore、case-open 経由）
- **ng_classification**: pre-existing
- **notes**: search-target-area.ts 契約自体は現行稼働（design-save が使用）。根拠表記のみの陳腐化

### F-05: draft Design 13件が正規所有者として被参照する状態の長期化

- **category**: Design status 整合（draft の正規所有者被参照）
- **target**: workflows 3件（workflow-skill-model.md、step-reference-contract.md、input-resolution-and-durable-state.md）+ 他ドメイン10件（foundations/decision-lifecycle.md、foundations/references/verification-scope-catalog.md、integrity/autogen-freshness-gate.md、integrity/test-impact-detection-gate.md、local/install-script-usability.md、authoring/dependency-version-compatibility.md、skills/agentdev-artifact-validation.md、skills/agentdev-doc-diagnostics.md、skills/agentdev-design-file-manager.md、skills/agentdev-git-worktree-test-fallback.md、responsibilities/artifact-quality-control-routing.md のうち11ファイル＋worksflows 3件）
- **evidence**: 被参照例: REQ-027:12「Design（docs/designs/workflows/workflow-skill-model.md）が正規所有者として定義する」（同 Design は status: draft）、document-model.md:254「decision-lifecycle.md が正規所有する」（draft）、artifact-responsibilities.md が draft の agentdev-design-file-manager を責務表に記載。既存 defer finding F-15〜17（20260815T082159Z）の再確認条件（Epic #2099 系 case-close 後の draft 継続）が今回スキャン時点でも未解消
- **severity**: low
- **confidence**: medium
- **source_of_truth**: docs/designs/README.md（Design status 追跡情報源。draft であることは追跡と整合し、index 不整合ではない）を正とし、「draft が正規所有者として被参照する」権限づけの揺れを意味候補として検出
- **recommended_route**: IR-054（draft 放置検出）による継続監視と case-close 工程での昇格判断。既存 defer finding F-15〜17 と統合した再評価（本検出は F-15〜17 のスコープ外の draft Design にも言及）
- **ng_classification**: pre-existing
- **notes**: draft → accepted 昇格は case-close 工程の正規経路であり、draft であること自体は不正状態ではない。観察継続対象

### F-06: docs/reports/local/ 未追跡レポート2件の管理方針未定義

- **category**: 探索順と索引の不整合（Report 配置・追跡方針）
- **target**: docs/reports/local/opencode-adf-execution-analysis-20260822.md、docs/reports/local/opencode-adf-execution-analysis-20260822.html
- **evidence**: git 未追跡（git status ?? 表示）、かつ .gitignore 対象外（check-ignore で非対象）。docs/designs/README.md「Report の分離」では docs/reports/ を Design インデックス管理対象外とするが、docs/reports/local/ 配下の git 追跡要否（integrity/ 配下は追跡、local/ は未追跡）の方針が文書化されていない
- **severity**: low
- **confidence**: high（未追跡・gitignore 対象外は機械的確定。方針欠落は観察）
- **source_of_truth**: docs/designs/README.md（Report 分離規定）を正とし、local/ の位置づけ不明を検出
- **recommended_route**: 追跡 or gitignore の方針確定（docs_chore）。`.agentdev/integrity/reports/`（非永続・git管理対象外）との類推から docs/reports/local/ を gitignore に追加する案、または Report として追跡する案のいずれか
- **ng_classification**: 要ヒューマンレビュー（本日生成されたファイルであり、作成者の意図（作業中か完成か）が判明していないため）

## 推奨アクション

| 検出事項 | 推奨 route | 次コマンド |
|---|---|---|
| F-01 投影乖離 | 運用対応（install 再実行）+ inspect-skills 独立実行 | `/agentdev/inspect-skills`（詳細診療）→ install-consumer-opencode.ps1 -Mode apply |
| F-02 proposed DEC 昇格評価 | Decision 運用（docs_chore） | `/agentdev/case-open` |
| F-03 孤立テンプレート削除 | docs_chore | `/agentdev/case-open` |
| F-04 旧番号帯引用修正 | docs_chore | `/agentdev/case-open` |
| F-05 draft 被参照の継続監視 | IR-054 経由の継続監視 + defer F-15〜17 と統合再評価 | 対応不要（次回 inspect-promote で分類判断） |
| F-06 Report 方針確定 | docs_chore | `/agentdev/case-open` |

docs-check route 候補（STEP-3-2、意味的疑いの機械検査化）:

- src/opencode/skills と .opencode/skills のスキル集合突合（F-01、IR-016 適用の確認を含む）
- templates 配下ファイルの被参照チェック（F-03）
- 旧番号帯（REQ-01XX）無印引用の検出（F-04、IR-018/IR-066 との重複確認を含む）

## 対象外（Out of Scope）

- 未解決プレースホルダー引用（`DEC-{N}`、`REQ-{NNNN}-{NNN}`）: 配布物 ID 除去方針（docs-spec-rebuild-integrity Design）に従う正規形式であり、機械検査 IR-064 の管轄
- SKILL.md の H1 複数検出候補5件（agentdev-traceability、agentdev-artifact-validation、agentdev-design-file-manager、agentdev-req-file-manager、agentdev-workflow-intake-capture）: コードブロック内 `#` 行の誤カウントによる false positive と確認（コードブロック外 H1 は各ファイル1件）
- REQ MERGE/SPLIT 候補（REQ-012/021、REQ-037〜039、REQ-045〜047 等）: H1 タイトル重類のみからの意味判断は確定不可。REQ-045〜047 による直近の網羅監査・横断正規化（2026-08-22 マージ）直後の再編提案は時期尚早
- retired REQ ファイルの現在形記述（REQ-020 等）: 廃止記録としての履歴文書であり、IR-040/IR-041 の管轄
- guides・README の規範的記述候補（req-case-flow.md、artifacts-and-state.md、diagnostics-and-maintenance.md、README.md:140 等）: いずれも REQ/Decision への参照説明の範囲内で、navigation 層の責務を超えていない
- エンコーディング不整合: src/opencode 配下で BOM 付き・CRLF/LF 混在ファイルの検出なし（node_modules は検査対象外）
- `.agentdev/tmp/` 配下の作業ファイル: .gitignore 対象済み
- PowerShell コンソール上の日本語表示崩れ: 表示環境の問題でありファイル破損ではない（byte-level 検査で LF 統一・BOM なしを確認済み）
