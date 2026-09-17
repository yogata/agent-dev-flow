# inspect-docs finding 20260917T223426Z

## サマリ

- 実行種別: read-only-diagnostic（STEP-1〜STEP-4、resume point なし）
- スキャン対象: `docs/requirements/` 65 REQ（現行53・廃止12）、`docs/decisions/` 30（本文29・README）、`docs/designs/` 171、`docs/guides/` 12、`README.md`、`docs/README.md`、`docs/knowledge/`、`src/opencode/` 配布原本 232 Markdown
- 検出事項: 3件
- severity 内訳: high 1件、medium 1件、low 1件
- カテゴリ内訳: 横断契約矛盾/Design DRIFT 1件、第一参照導線・REQ 索引整合性 1件、文書分類一貫性（MOVE候補）1件
- source_type: `inspect`

## 検出事項リスト

### QG-4-1: quality-gates Design に廃止済みの検証対応要否カタログ・未分類モデルが残存

- **category**: 横断契約矛盾（Design DRIFT、REQ/Decision/Design 間の責務・契約不整合）
- **target**: `docs/designs/quality/quality-gates.md:174-181`
- **evidence**:
  - `quality-gates.md:176`: 「QG-4 の traceability check は Design ヘッダの ADF-COVERS 宣言と検証対応要否カタログという単一 PR の差分に閉じない横断 durable state を判定対象とする」
  - `quality-gates.md:179`: 「未分類（unclassified）行」および「検証対応要否カタログ登録 commit」の時系列を前提としている
  - `quality-gates.md:180`: 「検証対応要否カタログ不在時は全要件行を検証対応必須として扱う安全側既定は維持する」
  - 上位の `docs/decisions/DEC-030.md:25` は「検証対応要否カタログと未分類状態、およびその工程ゲートを廃止する」と決定し、`traceability/policy.yaml` を正規ポリシーとした。`DEC-030:32` は旧カタログの廃止と `traceability/policy.yaml` への移行を明記する。
  - `docs/designs/foundations/traceability-model.md:48-49` も「未分類」という中間状態は存在せず、旧カタログは廃止済みと明記する。配布スキル `src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md:356` は既に `traceability/policy.yaml` を参照しており、Design と配布スキルの記述が非対称である。
- **severity**: high
- **confidence**: high
- **source_of_truth**: 承認済み `DEC-030`（2026-09-17）および現行 `traceability-model.md` を正とする。`quality-gates.md` は下位の Design 記述として矛盾する。
- **recommended_route**: `UPDATE`。`quality-gates.md` の traceability check 節を `traceability/policy.yaml`、未指定=required、check の fail-closed 契約へ現行化する。意味判断を伴わない文書現行化として inspect-promote → backlog-review で処置する。
- **ng_classification**: 今回修正対象
- **notes**: DEC-030 の Definition PR/Case #2936 に伴う更新で対象 Design も変更されているが、本節に旧モデルの残置がある。L180 の安全側既定（ポリシー不在時は required）は現行モデルでも成立するため、概念名と工程ゲートのみを置換すべきである。req-define 再壁打ち案は不要。

### IDX-1: docs/README.md の現行 REQ 詳細一覧表に REQ-083・REQ-087 が欠落

- **category**: 第一参照導線・REQ 参照ID整合性（README 索引の実体整合）
- **target**: `docs/README.md:8-14,16-68`
- **evidence**:
  - `docs/README.md:9` は「現行 REQ: 53件」と表示するが、同ファイルの詳細表は REQ-082 で終わり、表の行数は51件である。
  - 実ファイルは現行53件であり、`docs/requirements/REQ-083.md`（2026-09-17 作成）と `docs/requirements/REQ-087.md`（2026-09-16 作成）を含む。
  - `docs/requirements/README.md:65-67` の AUTOGEN 表には REQ-082、REQ-083、REQ-087 が存在し、現行53件の第一参照先として整合している。従って欠落は `docs/README.md` の hand-curated 詳細表に限定される。
  - 既存の `.agentdev/intake/inbox/2026-09-17-req-detail-table-missing-new-req-rows.md:1-17` が同一事象（REQ-083・REQ-087 欠落）を既に起票している。
- **severity**: medium
- **confidence**: high
- **source_of_truth**: 現行 REQ 実ファイルおよび AUTOGEN 管理下の `docs/requirements/README.md` を正とする。`docs/README.md` の手動詳細表が下位の案内層として不足する。
- **recommended_route**: `UPDATE`。`docs/README.md` の REQ 詳細表へ REQ-083・REQ-087 を追記する。既存 intake と重複起票せず、inspect-promote で既存 intake との統合・重複処理を判定する。
- **ng_classification**: pre-existing
- **notes**: 事象は Case #2917 の実装時点から既知で、既存 intake に根拠と処置選択肢がある。ただし現在も欠落状態が継続している。req-define 再壁打ち案は不要。新規 REQ CREATE 後の hand-curated 表鮮度を docs-check で検出する route 候補でもある。

### REQ57-1: REQ-057-031/036 に作業履歴・書式詳細が混入している MOVE 候補

- **category**: 文書分類一貫性（MOVE 候補、REQ 要件行への Design 分離基準シグナル）
- **target**: `docs/requirements/REQ-057.md:46,51`（REQ-057-031、REQ-057-036）
- **evidence**:
  - `REQ-057-031` は要件の主目的（現行根拠文脈の旧行番号引用を0件にすること）に加え、「導入時点 318 件」「provenance issue-2383-ir067-initial-baseline」「診断基線 commit 92c8d28b」を記載する。provenance 名・commit hash は作業履歴／実装時点の内部証跡であり、REQ 要件行の主契約からは Design または Report へ分離できる候補である。
  - `REQ-057-036` は Design status 昇格時の記録要求に加え、標準形式の見出し名「対応記録」、必須項目（昇格日、評価契約根拠、対応 Case/PR、REQ 整合確認結果）、見送り記録との排他を要件行へ列挙する。これは report format / template variant の詳細を含む。
  - `docs/designs/authoring/command-file-format.md:16-18`、`src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md:69-76` は執筆・保存側の責務を既に保持する。REQ-057-036 の存在自体は必要な成果契約だが、書式詳細の正規所有境界は要確認である。
- **severity**: low
- **confidence**: low
- **source_of_truth**: 現行 `REQ-001` の文書種別責務・Design Separation Criteria と、関連する Design/Skill を基準とする。REQ-057 は docs corpus 整合バッチという特殊な一時性を持つため、単純な違反確定ではなく文脈審査を要する。
- **recommended_route**: `MOVE` 候補の観察継続。REQ-057 完了後 RETIRE 候補として既存 defer F-04（20260907）と統合し、書式の必達成果だけを REQ に残すか、詳細を Design/保存手順へ移すかを backlog-review で判断する。
- **ng_classification**: 要ヒューマンレビュー
- **notes**: high-specificity signal 候補はあるが、REQ-057 は一時的な整合バッチを所有し、再現可能な監査証跡を要件へ含める解釈も成立する。単独の req-define 入力案は作成しない。

## 推奨アクション

- QG-4-1: 承認済み DEC-030 と `traceability-model.md` に合わせ、quality-gates Design の旧カタログ／未分類ゲートを policy.yaml 前提へ更新する。
- IDX-1: 既存 intake `2026-09-17-req-detail-table-missing-new-req-rows.md` と統合し、REQ-083・REQ-087 の詳細表追記または hand-curated 表の鮮度管理方針を決定する。
- REQ57-1: 既存の REQ-057 RETIRE 観察（20260907 F-04）へ統合し、REQ の必達成果と Design/Report の内部証跡・書式詳細の境界を人手審査する。

## docs-check route 候補

1. `docs/README.md` の REQ 詳細表について、現行 `docs/requirements/REQ-*.md` の実体一覧（タイトル含む）との ID・件数突合を追加する。今回の IDX-1 を決定的に検出できる。
2. accepted Decision が廃止した旧概念（検証対応要否カタログ、未分類状態等）の活性 Design への残留を語彙・参照検査する。今回の QG-4-1 の候補抽出に使用できる（最終的な履歴文脈・説明目的の除外は意味診断で行う）。

## 未処理成果物（存在報告のみ、処理しない）

- `.agentdev/intake/inbox/`: 8 item（`.gitkeep` を除く、2026-09-16〜09-18）
- `.agentdev/learning/inbox.md`: 30 未整理エントリ（`deferred.md` も存在）
- `.agentdev/intake/promoted/`: 実質0件（`.gitkeep` のみ）
- `.agentdev/learning/promoted/`: 実質0件
- `.agentdev/backlog/req-units/`: 実質0件（`.gitkeep` のみ）
- `.agentdev/drafts/`: ディレクトリなし
- `.agentdev/inspect/inbox/`: 既存 finding 3ファイル（20260901、20260907、20260914）を保持。変更・削除していない。

## クリーン判定

- REQ frontmatter `id` ↔ ファイル名: 現行53 + 廃止12 = 65件すべて一致、重複なし。
- 現行/廃止境界: 二重存在なし。REQ-063〜REQ-081 の予約欠番は `numbering-policy.md`、`requirements/README.md`、`docs/README.md` に明記されている。
- Decision: 本文29件（accepted 27、superseded 2）、proposed 0件。`decisions/README.md` の AUTOGEN 件数・一覧と一致。DEC-018 欠番は既知の記録済み。
- Design: `status: draft` 0件。status なしは `docs/designs/README.md` の索引のみで、同 README の「status なしは accepted 相当」規定に該当。
- Design 状態乖離 DRIFT / Decision 状態乖離 DRIFT: 検出なし（draft Design 0、proposed Decision 0）。
- REQ 6観点: 新規 MERGE/DUPLICATE/RETIRE はなし。REQ-057 の MOVE 観察（REQ57-1）と既知 defer の継続のみ。新規 SPLIT/DRIFT はなし。
- 文書分類: DEC-030 反映対象 REQ-002/012/021/029/057/061 の sidecar・policy・producer/consumer 契約は現行化済み。REQ-057-031/036 の境界候補のみ要審査。
- guides/README: root README は18コマンドと主要導線を列挙し、`docs/guides/command-selection.md` の入口表・`src/opencode/commands/agentdev/README.md` と整合。既知 GUIDE-6/8 は原状継続。
- 配布物（`src/opencode/` 原本、232 Markdown）: UTF-8 BOM 0、CRLF/LF 混在0、frontmatter 重複0（コードフェンス内の既知例示を除外）、主要 H1 重複0、実在しない command 参照0（`/agentdev/templates/` は template パスであり false positive）、壊れた括弧0（`OU-{NNN}` プレースホルダー・診断パターン例示は false positive）。
- 配布物 ADF-COVERS 宣言: producer metadata の実宣言残留なし。検出された文字列は機構説明・解析コード・テストのみ。
- 責務整合: case-ready command 本体と command Design は Definition 受入、isDraft 確認、canonical 再取得、traceability check、ready 遷移の記述が一致。
- 既知 defer: F-04/F-05/GUIDE-6/GUIDE-8/DESIGN-3 は原状継続。既存の20260901/20260907 finding は未変更。

## 対象外（Out of Scope）

- docs 表層品質（textlint 共通基盤の責務）。
- `docs/reports/` の凍結監査記録の内容修正。
- `.agentdev/intake/`、`.agentdev/learning/`、RU、inspect finding の分類・採用・処分。
- GitHub Issue/PR 操作、worktree/branch 作成、対象 docs・配布物の直接修正。
- `src/opencode/` 内の ADF-COVERS 機構説明、テスト用汚染文字列、コードフェンス内の frontmatter 例示。いずれも実宣言ではない。
- 既存 inspect inbox の 20260901/20260907/20260914 finding。後段 inspect-promote の対象として保持した。

## 参照・診断証跡

- workflow: `src/opencode/skills/agentdev-workflow-inspect-docs/SKILL.md` および同 workflow の STEP-1〜STEP-4 reference。
- capability: `agentdev-req-structure-diagnostics`、`agentdev-doc-diagnostics`、`agentdev-project-extensions` の正規 reference。
- source-of-truth 判定: 現行 REQ > 承認済み Decision > Design > guides。
- 前回 baseline: `.agentdev/inspect/inbox/inspect-docs-finding-20260914T214425Z.md`（2026-09-15 診断）。
- 本スキャン時の作業ツリーは開始時点で clean。対象ファイルの変更は行っていない。
