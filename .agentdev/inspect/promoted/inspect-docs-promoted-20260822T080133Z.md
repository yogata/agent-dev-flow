# inspect-docs promoted 20260822T080133Z

> 本ファイルは inspect-promote（2026-08-22 実施、/agentdev/backlog-auto 経由）の分類確定後、promote となった検出事項（F-01, F-02, F-03, F-04, F-06）を保存する。defer 分（F-05）は `.agentdev/inspect/inbox/inspect-docs-finding-20260822T080133Z.md` に残置。reject 0 件（却下理由記載対象なし）。

## 分類記録

- 分類: promote 5 / defer 1 / reject 0（本 finding ファイル分。旧 defer F-15〜17（20260815T082159Z）は再確認条件未解消のため defer 継続）
- 経路B adversarial-review: 不発動（ユーザー明示要求なし。backlog-auto 経由の自動起動であり発動条件不成立、従来フロー維持）
- 自律確定: F-01〜F-04（取得可能な根拠から promote が一意に確定: evidence が機械的に確定し、recommended_route が具体）
- HITL: F-06（ng_classification「要ヒューマンレビュー」により管理方針を確認。ユーザー回答: docs/reports/local/ を gitignore 対象とする。docs_chore 案件として promote、方針は「docs/reports/local/ を .gitignore に追加」に確定）
- HITL 不要理由（F-01〜F-04）: 投影乖離・孤立テンプレート・旧番号帯引用は存在確認で機械確定、DEC status ズレは実装済み実態（commit a36589d9 等）と status の対比で不整合が一意に確定。いずれも採否の実質的選択を残さない

## F-01: .opencode/skills 投影と src/opencode/skills の乖離（4スキル投影欠落 + 撤去済みスキルの stale junction 残存）

- **category**: 配布物統合性（source projection 整合）
- **target**: `.opencode/skills/`（junction 群）
- **evidence**: src 側に存在するのに投影なし: `agentdev-workflow-backlog-auto`、`agentdev-workflow-design-save`、`agentdev-design-file-manager`、`agentdev-traceability` の4スキル。逆に src 側に存在しない stale junction: `agentdev-artifact-graph`（DEC-017 で撤去済み）、`agentdev-spec-file-manager`、`agentdev-workflow-spec-save`（旧称残存）。実害として本環境では `agentdev-workflow-backlog-auto` が skill registry に未登録（backlog-auto コマンドが権威情報源スキルを解決できず、ファイル直接読取で代替実行した）
- **severity**: high
- **confidence**: high
- **source_of_truth**: src/opencode/skills/（配布原本）を正とし .opencode/ 投影の乖離を検出
- **recommended_route**: 運用対応（`install-consumer-opencode.ps1 -Mode apply` 再実行による junction 再構築）+ IR-016（source-projection-integrity）適用状況の確認。Command/Skill 参照妥当性の詳細は `/agentdev/inspect-skills` 独立実行を促す
- **ng_classification**: pre-existing
- **notes**: 撤去済み `agentdev-artifact-graph` への stale junction は DEC-017（Artifact Graph 廃止）との矛盾状態。機械検査候補: src/.opencode のスキル集合突合を docs-check 検査データ化（STEP-3-2 で docs-check route 候補として提示）

## F-02: proposed Decision（DEC-016/DEC-017）が実装済み現行基盤として被参照

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

## F-03: 孤立テンプレート templates/integrity-check/standard.md の残存

- **category**: 配布物統合性（廃止名残存・参照元なしテンプレート）
- **target**: src/opencode/commands/agentdev/templates/integrity-check/standard.md
- **evidence**: integrity-check は docs-check の旧称（docs/guides/glossary.md:20「旧称: integrity-check」）。現行 docs-check は repo-local の `.opencode/commands/repo/templates/docs-check/standard.md` を使用しており、agentdev 配布物側の `templates/integrity-check/standard.md` を参照する command/skill は存在しない
- **severity**: low
- **confidence**: high
- **source_of_truth**: docs/guides/glossary.md（改称記録）を正とし、旧称テンプレートの残存を検出
- **recommended_route**: 削除対応（docs_chore、case-open 経由）。機械検査候補: templates 配下の被参照チェック（STEP-3-2 docs-check route 候補）
- **ng_classification**: pre-existing
- **notes**: req-045 監査（20260822）では A1 として pass 判定だが、監査の検査観点（存在しない command 参照）は参照元側の検出であり、参照される側の孤立は別観点

## F-04: design-save.md が旧番号帯 REQ-0136-029 を現行契約の根拠として引用

- **category**: REQ 参照ID整合性（旧番号帯の無印引用）
- **target**: docs/designs/commands/design-save.md:165
- **evidence**: 「target_area 見出し検索は `agentdev-design-file-manager/scripts/src/search-target-area.ts`（Design 固有決定的処理）へ委譲する（REQ-0136-029）」。REQ-0136 は docs/requirements に存在しない旧番号帯（v2: プレフィックスもなし）。同一文書内の他の根拠引用（REQ-008-058 等）は現行3桁形式で、旧番号帯と混在
- **severity**: medium
- **confidence**: high
- **source_of_truth**: docs/requirements/README.md（現行 REQ は3桁番号帯、過去版は v2: プレフィックスで区別、現行要件の根拠にしない）を正として検出
- **recommended_route**: 根拠の再同定（対応する現行要件行への置換、または当該契約の正規根拠が Design 側にあることの明示）を要する文書修正（docs_chore、case-open 経由）
- **ng_classification**: pre-existing
- **notes**: search-target-area.ts 契約自体は現行稼働（design-save が使用）。根拠表記のみの陳腐化

## F-06: docs/reports/local/ 未追跡レポート2件の管理方針未定義

- **category**: 探索順と索引の不整合（Report 配置・追跡方針）
- **target**: docs/reports/local/opencode-adf-execution-analysis-20260822.md、docs/reports/local/opencode-adf-execution-analysis-20260822.html
- **evidence**: git 未追跡（git status ?? 表示）、かつ .gitignore 対象外（check-ignore で非対象）。docs/designs/README.md「Report の分離」では docs/reports/ を Design インデックス管理対象外とするが、docs/reports/local/ 配下の git 追跡要否（integrity/ 配下は追跡、local/ は未追跡）の方針が文書化されていない
- **severity**: low
- **confidence**: high（未追跡・gitignore 対象外は機械的確定。方針欠落は観察）
- **source_of_truth**: docs/designs/README.md（Report 分離規定）を正とし、local/ の位置づけ不明を検出
- **recommended_route**: 追跡 or gitignore の方針確定（docs_chore）。`.agentdev/integrity/reports/`（非永続・git管理対象外）との類推から docs/reports/local/ を gitignore に追加する案、または Report として追跡する案のいずれか
- **ng_classification**: 要ヒューマンレビュー → 確定済み（2026-08-22 HITL にてユーザー回答: gitignore 対象とする。方針: docs/reports/local/ を .gitignore に追加）
