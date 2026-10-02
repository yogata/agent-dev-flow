# inspect-docs finding 20261002T154006Z

## サマリ

- スキャン対象: REQ 63件（現行61 + retired 15 は参照確認）/ Decision 49件 / Design 179件 / guides 14件 / README.md（ルート）/ 配布物（.opencode/ 投影、src/common 正本）
- 検出件数: 11件（高severity 1件 / medium 2件 / low 8件）
- 診断体制: 3診断担当の並列委譲（REQ 体系 / Design / Decision・guides・README）+ 親 fan-in + docs-check 機械的検査結果の取り込み（check_integrity / check_command_format / check_extensions / check_distribution_boundary / check_autogen_freshness / check_content_corruption / check_knowledge_docs / check_design_frontmatter）
- 既知重複: 33件以上を排除（intake inbox 18件・既存 inspect finding 8件と照合。内訳は「対象外」節）

## 検出事項リスト

### F-01: guides 3ファイルの旧 `src/opencode/` 原本記述が DEC-049（共通正本分離）と矛盾

- **id**: F-01
- **category**: 横断契約矛盾（下位文書の上位文書への矛盾）
- **target**: `docs/guides/artifacts-and-state.md` / `docs/guides/troubleshooting.md` / `docs/guides/glossary.md`
- **evidence**:
  - `artifacts-and-state.md:24-25`「Command 配置先 `src/opencode/commands/agentdev/`、Skill `src/opencode/skills/agentdev-*`」
  - `artifacts-and-state.md:63-76` ディレクトリ構造で「`src/opencode/` # 原本（正規の定義ファイル）」（:68）
  - `troubleshooting.md:13`「原本は `src/opencode/commands/agentdev/`」
  - `glossary.md:83-84`「Command … 原本は `src/opencode/commands/agentdev/`」「Skill … 原本は `src/opencode/skills/agentdev-*`」、:87「原本（source）| `src/opencode/` 配下の正規の定義ファイル」
  - 実体: `src/opencode/commands/agentdev/` は存在しない（正本は `src/common/commands/agentdev/`、`src/common/skills/agentdev-*/`）
- **severity**: high（承認済み Decision を正とし下位文書が矛盾。読者を実在しないパスへ誘導する導線破綻）
- **confidence**: high（実パス不在を直接確認済み）
- **source_of_truth**: 承認済み DEC-049（2026-10-02 accepted、共通正本 `src/common/` 分離）+ REQ-099 + accepted Design `multi-host-canonical-model.md`（`src/common/README.md` も一致）
- **recommended_route**: intake（intake `2026-10-02-3318-wave1-remainder-installer-projection-and-archive-gates` は consumer-project-setup.md のみ明示対象のため本3ファイルは新規。同一主題〔旧 src/opencode 前提残存〕の統合判定は backlog-review 側）
- **ng_classification**: pre-existing（DEC-049 移行に伴う guides 更新漏れ残置）
- **notes**: multi-host-operations.md（新設ガイド）は新構成に整合しており問題なし

### F-02: `docs/README.md` ガイド一覧に multi-host-operations.md が欠落

- **id**: F-02
- **category**: 探索順と索引の不整合
- **target**: `docs/README.md`（ガイド一覧節）
- **evidence**: docs/README.md のガイド一覧は12ガイド（charter、quickstart、command-selection、req-case-flow、intake-learning-backlog-flow、diagnostics-and-maintenance、artifacts-and-state、project-docs-and-specs、consumer-project-setup、troubleshooting、supervisor-credential-bridge、glossary）。実ガイドは13（`multi-host-operations.md` が guides/README.md:54 には掲載済みだが docs/README.md 一覧にない）
- **severity**: low
- **confidence**: medium（docs/README.md のガイド一覧が AUTOGEN ではなく手動記述のため、検出は手動照合。AUTOGEN ルールの対象外）
- **source_of_truth**: guides/README.md（13ガイド全掲載）を正とし、docs/README.md の一覧欠落を検出事項とする
- **recommended_route**: intake（docs-check route 候補: docs/README.md ガイド一覧は AUTOGEN 対象外のため手動整合チェックのルール化候補）
- **ng_classification**: pre-existing（multi-host-operations.md 新設〔2026-10-02 PR #3331〕時点の反映漏れ）

### F-03: REQ-082.md:12 の「現行の REQ-003 は …029 → 055」記述が現状と乖離（phantom citation の温床）

- **id**: F-03
- **category**: DRIFT（REQ 体系・世代境界）
- **target**: `docs/requirements/REQ-082.md:12`
- **evidence**: 「（REQ-003-030〜054 は当時の行番号帯であり、現行の REQ-003 は …029 → 055。）」— REQ-003-055/056 は 2026-10-01 に REQ-096 へ移管され廃止済み。「現行の」という語を使いながら旧状態を記述しており、REQ-003-055 が現行であると誤認させる
- **severity**: low
- **confidence**: medium（REQ-087-001 採番例外記録としての意図的保持の可能性は残る。ただし「現行の」語の使用が現状記述と矛盾している点は確定）
- **source_of_truth**: 現行 REQ-003.md（:56 の廃止記録）を正とし、REQ-082.md の記述を検出事項とする
- **recommended_route**: intake（intake `2026-10-01-3293` の REQ-003-055 citation 現行化と同一バッチでの文面更新候補）
- **ng_classification**: pre-existing

### F-04: workflow-skill-model.md:102 の「現行の責務体制は DEC-036」刻印が DEC-049 部分置換後も残留

- **id**: F-04
- **category**: 横断契約矛盾（Decision 権威参照の陳腐化）
- **target**: `docs/designs/workflows/workflow-skill-model.md:102`
- **evidence**: 「原本と投影: 原本は `src/common/skills/`、実行時投影先は `.opencode/skills/`（REQ-002-007。現行の責務体制は DEC-036）」— 記述内容自体は新構成に整合するが、権威参照の「正本配置・投影モデル」面は DEC-049.md relations が「配備形態（正本配置・投影モデル）に関する部分を本 Decision が置換する」と宣言済み
- **severity**: low
- **confidence**: high（DEC-036 は accepted 維持のため IR-065 系機械検査では不検出。意味診断による検出）
- **source_of_truth**: 承認済み DEC-049 を正とし、Design 側の権威参照刻印を検出事項とする
- **recommended_route**: intake（「現行の責務体制は DEC-036」→「配備形態の正は DEC-049」への刻印更新。既知 defer DS-22〔harness-separation-model.md:72〕と同型パターンで一括判断が自然）
- **ng_classification**: pre-existing

### F-05: vocabulary-registry.md:30 に同型の「DEC-036 現行」刻印 + src/opencode 単一前提の投影記述

- **id**: F-05
- **category**: 横断契約矛盾（Decision 権威参照の陳腐化）/ 将来計画の旧構造前提
- **target**: `docs/designs/authoring/vocabulary-registry.md:30`
- **evidence**: 「配布物に含まれる語彙レジストリ（将来追加される場合）は `src/opencode/` 配下に配置し `.opencode/` へ投射する（現行の責務体制は DEC-036）」— 将来追加時の投影記述が OpenCode 単一ホスト前提であり、DEC-049 / multi-host-canonical-model.md:25 の「src/opencode/、src/senpi/ をホスト別接続領域として並列」を反映していない
- **severity**: low
- **confidence**: high
- **source_of_truth**: 承認済み DEC-049 + accepted Design multi-host-canonical-model.md を正とする
- **recommended_route**: intake（F-04 と同一バッチ）
- **ng_classification**: pre-existing

### F-06: third-party-skill-management.md:81-82 の cli.ts 配置記述が実ファイル配置と乖離

- **id**: F-06
- **category**: 横断契約矛盾（現行実装との矛盾）
- **target**: `docs/designs/local/third-party-skill-management.md:81-82`
- **evidence**: 「配置: `src/opencode/tools/agentdev-third-party/cli.ts`」「実行形式: bun `src/opencode/tools/agentdev-third-party/cli.ts`」— 実ファイルは `src/common/tools/agentdev-third-party/cli.ts` に存在し、`src/opencode/tools/` 配下には Tool 登録面のみで cli.ts を含まない
- **severity**: low
- **confidence**: high（実ファイル配置を直接確認済み）
- **source_of_truth**: 承認済み DEC-049 決定(1)（共通正本 src/common/ 集約）+ 実ファイル配置を正とする
- **recommended_route**: intake（intake `2026-10-02-3332-local-design-docs-modernization-pending` は本行を明示していないため実質新規 delta。同 intake の Design 現行化パスと同バッチ処理が自然）
- **ng_classification**: pre-existing

### F-07: IR-055 warning total 57 が warning_total_cap 53 を超過（ratchet 違反）

- **id**: F-07
- **category**: 配布物統合性（検査ゲート運用）
- **target**: `.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json`（cap 53）と IR-055 検出実績（57）
- **evidence**: check_integrity.ts 実行結果「[NG] warning-total-cap: IR-055 warning total (57) exceeds warning_total_cap (53) in ir-055-baseline.json (ratchet: increases require --raise-warning-cap)」。IR-055 の走査対象は src/opencode 配下のみのため、docs/ 配下の用語掃除（intake 3316）は直接原因になり得ない。直近 REQ-099 Wave 1〜3（PR #3326/#3330/#3331/#3332）の src/opencode 配下変更で heuristic warning 対象行が増加した可能性が高い（要明細確認）
- **severity**: medium（docs-check 全体が fail し続ける検査ゲートの機能不全状態）
- **confidence**: high（機械的検出。起因の特定は medium）
- **source_of_truth**: integrity-contracts.md「IR-055 warning 総数 ratchet」節（cap は純減方向のみ更新可能。増加は --raise-warning-cap 明示フラグ経由のみ）
- **recommended_route**: intake（増加が true positive なら該当箇所の是正、baseline-known なら provenance 付き baseline 追加が契約上の正規手順）
- **ng_classification**: pre-existing
- **notes**: integrity-contracts.md:365-367 の契約に基づき、cap 引上げは無条件に行わない

### F-08: SkillProjection 不整合 6件（src-only 1件・stale junction 4件）

- **id**: F-08
- **category**: 配布物統合性（投影整合）
- **target**: skill 投影（`src/common/skills/` ↔ `.opencode/skills/`）と `skill-projection-manifest.yaml`
- **evidence**: check_integrity.ts（IR-068）検出:
  - `agentdev-skill-resolution` が src/common/skills に存在するが manifest と .opencode/skills 投影の両方に無い（src-only ×2）
  - `explainer` / `explainer-book` / `first-reader` / `yomiyasu` が .opencode/skills 投影に存在するが src/common/skills に無い（stale junction ×4）
- **severity**: medium（新規 skill の投影漏れは実行環境からの欠落リスク。stale junction 側は repo-local skill のため consumer 影響なし）
- **confidence**: high（機械的検出）
- **source_of_truth**: IR-068（skill-projection-manifest）と src/common/skills の実一覧を正とする
- **recommended_route**: intake（manifest 追加と junction 再構築: `install-consumer-opencode.ps1 -Mode apply`）
- **ng_classification**: pre-existing

### F-09: unresolved-placeholder 新規 2件（agentdev-workflow-case-ready）

- **id**: F-09
- **category**: 配布物統合性（ID プレースホルダ）
- **target**: `src/common/skills/agentdev-workflow-case-ready/SKILL.md:57` / `src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md:41`
- **evidence**: check_integrity.ts（IR-064）で baseline 未登録の新規 WARNING「ID placeholder 'REQ-{NNNN}' appears bare in body text (not in code span, parentheses, or template)」
- **severity**: low
- **confidence**: high（機械的検出）
- **source_of_truth**: REQ-010-065（IR-064）
- **recommended_route**: intake（backtick または括弧委譲表記への括り、または baseline 登録）
- **ng_classification**: pre-existing

### F-10: docs/knowledge/README.md「現在の知識文書」一覧の列挙欠落（recursive-copy-root-relative-skip.md）

- **id**: F-10
- **category**: 探索順と索引の不整合（knowledge README 列挙整合）
- **target**: `docs/knowledge/README.md:22`
- **evidence**: README 記載「20件。」+ 列挙20件 vs 実知識文書21件。`recursive-copy-root-relative-skip.md`（frontmatter title/created/updated 完備の正規知識文書）が列挙されていない。check_knowledge_docs.ts も同一検出（REQ-056-010）
- **severity**: low
- **confidence**: high（機械的検出 + 意味確認済み: 当該ファイルは正規の知識文書）
- **source_of_truth**: docs/knowledge/ の実ファイル一覧を正とする
- **recommended_route**: intake（README 列挙への追加）
- **ng_classification**: pre-existing

### F-11: intake-learning-backlog-flow.md:87 の廃止語彙「spec」残置

- **id**: F-11
- **category**: 廃止語彙残置（横断契約矛盾の旧概念残存）
- **target**: `docs/guides/intake-learning-backlog-flow.md:87`
- **evidence**: Learning エントリ13項目形式の列挙内「Decision/REQ/spec 影響」—「spec」は v3→v4 移行で Design に統合された廃止文書種別
- **severity**: low
- **confidence**: low（REQ-038（Learning エントリ形式の正本）が同列挙をどう定義しているかの突合が必要。慣用表現の可能性を含む）
- **source_of_truth**: REQ-038（Learning エントリ形式の正）の突合を要する
- **recommended_route**: intake（REQ-038 との突合を経た語彙更新）
- **ng_classification**: pre-existing

## 推奨アクション

- F-01（high）: guides 3ファイルの原本パス記述を DEC-049 新構成（`src/common/` 正本）へ更新。intake 3318 の installer 投影系残務と同一主題のため backlog-review での統合判定を推奨
- F-02〜F-06, F-08〜F-11（low/medium）: intake route として inspect-promote の分類待ち。F-04/F-05 は DS-22 と同型パターンで一括是正候補
- F-07: IR-055 warning 明細の再取得（docs-check）と増加起因の特定（true positive 是正 or provenance 付き baseline 追加）
- 状態更新情報（intake-promote 側の再評価条件）:
  - intake `2026-10-01-3282`（REQ-034-032 語彙）: 現行行（REQ-034.md:48）は REQ-096 語彙へ移行済みの様子 → 解消確認候補
  - intake `2026-10-01-3293` 発見事象2（REQ-032 frontmatter updated 陳腐化）: REQ-032.md:5 は 2026-10-01 に更新済み → 解消確認候補
  - intake `2026-09-27-3139` 保留1（REQ-038-002/003 HITL 確定重複）: REQ-038-002 は REQ-096 語彙参照形式へ改められ REQ-038-003 行は消滅 → 解消確認候補
  - 前回 finding DC-14（docs/README.md DEC-028 行 superseded 注記未導出）: 現行 docs/README.md は導出済み → 解消済み
- req-define 入力案: 0件（今回の検出事項はいずれも既存 REQ 体系の矛盾解消・文書現行化であり、新規要件を要しない）

## 対象外（Out of Scope）

- 機械的検査 baseline-known 群（approved additions 66件・baseline-known 2件、provenance-tracked）: 既知管理対象のため本 finding では再掲しない
- REQ-003-055 phantom citation 3箇所（REQ-003.md:56、v4-responsibility-boundaries.md:44/:67）: intake `2026-10-01-3293` 発見事象1の既知重複。REQ-003.md:56 は廃止記録の履歴参照形式。v4-responsibility-boundaries.md は「旧 REQ-003-055」前置の履歴説明形式で diagnostic-categories.md「履歴参照は対象外」に該当する可能性。IR-067 の前置一致除外仕様との構造的緊張は intake 3293 の是正時に併せ判断
- REQ-046 retired status 値混在（migrated）: 既知 defer RQ-20（20260927）への増分情報（retired 5件 / migrated 10件。新規独立起票しない）
- Design 状態乖離 DRIFT: 対象なし（draft Design は _template.md ×2 のみ、実 Design は全件 accepted）
- Decision 状態乖離 DRIFT: 対象なし（proposed Decision 0件）
- 既知 defer 群（REQ 体系約30行・Design 約15件・guides 12件）: 各担当が原状残存を確認済み。新規起票せず
- 文章表層品質（textlint 系）: 共通 textlint 基盤の管轄
- `docs/README.md` の REQ 欠番説明（REQ-063〜081 等）: 意図的予約欠番の正規記録
- DEC-018 欠番: v3-v4-crosswalk.md:48 に記録済み（numbering-policy 未記載は既知 defer）
