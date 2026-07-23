---
title: case-open SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-24
---

# case-open SPEC

## 目的

要件定義（req-define）の結果をもとに GitHub Issue を作成する。
壁打ち→構造的実行フェーズの境界。
Epic + 子 Issue 一括作成に対応する。

## 入力

- req-define で生成された要件doc（構造化 `draft-data` 形式: REQ-0138, ADR-0124、チェックボックス付き）
- draft 全体の `agreed_items`、`artifact_actions`、`operation_units` を処理対象。OU ごとにスライスせず draft 全体を取り扱う（REQ-0138-009）
- `auto_gate.auto_ready` が false、または未解決質問、未解決衝突、repo外操作、停止理由が残る場合は停止（REQ-0138-013）
- `conflict_resolutions` に記録済みの衝突は同じ内容をユーザーへ再確認しない（REQ-0138-014）

## 出力

- GitHub Issue（ラベル付き、要件doc埋め込み）
- Epic flow の場合は Epic Issue + 子 Issue 群（最大10件、G05/G15）
- ドラフト削除: `.agentdev/drafts/req-draft-{topic-slug}.md`
- RU ファイル削除: `.agentdev/backlog/req-units/RU-*.md`
- OU `result` 書き戻し: `operation_units` セクションに Issue / Epic 番号

## 副作用

- ファイル削除: `.agentdev/drafts/req-draft-*.md`, `.agentdev/backlog/req-units/RU-*.md`（Standard / Epic 全フロー共通、REQ-0137-003/006 Form Zero）
- git 操作: `git rm <path>` + `git commit -- <paths>` の即時ステージ、コミット（並列実行安全ステージング）
- GitHub API: `gh issue create`, `gh issue edit`, `gh issue comment`（`agentdev-gh-cli` VERIFY 付き）
- intake / learning capture: 非関与（G18, G22）

## 現在の動作

- Step 1: 前工程からの引き継ぎ停止判定（`agentdev_handoff: true` 含まれる場合は Issue 作成せず停止）
- Step 1-1: OU 選択ゲート（`operation_units` セクションがある場合、処理対象 OU を決定（OU ID 指定 / 自動選択 / 一覧表示停止））
- Step 2: 要件docからIssue本文生成（`agentdev-issue-management`）（REQ読解、テンプレート充足検査、完了条件候補抽出）
 - Step 2-1: 完了条件網羅性検証（QG-2）（Issue作成前に REQ/ADR/SPEC 必達要件の網羅性を検証）
- Step 3: マルチREQ入力判定（単一REQ / 複数REQ or `scale: large` で Epic flow へ分岐）
 - Step 3-1: 自律構成生成（OU モード、複数REQ時）（`operation_units` から Epic / Wave / Issue 構造を自律生成）
- Step 4: 規模判定（単一REQの場合）（`scale: large` → Epic flow / `scale: standard` → Standard flow）
- Epic flow（Steps 5-9-1）:
 - Step 5: テンプレート読込（`agentdev-workflow-templates`）
 - Step 6: Epic Issue本文生成（自律構成分析結果に基づき Epic 本文を構築）
 - Step 7: Epic Issue作成（ラベル: `enhancement`, `feature`, `epic`）（VERIFY）
 - Step 8: 子Issue作成（OU 単位、順次処理）（Issue化単位は REQ doc 単位ではなく OU 単位（REQ-0104-042））。各子 Issue 本文の「## 補足情報」セクションに「前工程完了度」属性を埋め込む（REQ-0146-011、`docs/specs/workflows/epic-wave-model.md` の前工程完了度3段階分類に従う）
 - Step 9: Epic Issue本文更新（ステータス追跡テーブル更新）
 - Step 9-1: OU `result` 書き戻し（Issue / Epic 番号）
- Standard flow（Steps 10-12-1）:
  - Step 10: 関連ADR特定
  - Step 11: ラベル付与（`agentdev-workflow-lifecycle`）
  - Step 12: GitHub Issue作成（VERIFY）
  - Step 12-1: OU `result` 書き戻し（Issue 番号）
- 共通終了処理（Steps 13-15）:
  - Step 13: コメント追加（`agentdev-workflow-templates`）
  - Step 14: ドラフト削除（`git rm` + `git commit` Form Zero）
  - Step 14-1: RU ファイル削除（`git rm` + `git commit` Form Zero）
- Step 14-2: draft / RU 削除残存検証（`git status --porcelain` で残存検出）
- Step 14-3: draft/RU 削除 commit 後の即時 push（REQ-0146-003）（Step 14 / 14-1 の削除コミット後に `git push` を即時実行する）。case-run 引き継ぎ時の `git pull --ff-only` 失敗防止のため
- Step 15: 完了報告（Standard / 単一REQ Epic / マルチREQ Epic テンプレート）

## 構成生成事前検証（preflight）

case-open は Standard flow、Epic flow、混在構成の全ルートで、GitHub Issue 作成前に共通の事前検証を実施する（REQ-0132-027）。検証は execution_unit 構成の確定後、最初の GitHub Issue 作成呼び出し（Epic Issue 作成、Standard Issue 作成、子 Issue 作成を含む）の前に完了する。

### 検証項目

- 各 Epic の子 Issue 数が10件以下であること（REQ-0148-009 ハード制約）
- 各 Wave の同時実行対象が5件以下であること（REQ-0130-026）
- 各 Standard Issue および各子 Issue が1つの OU と対応していること（REQ-0104-042）
- 必須依存関係（連結成分のエッジ）が維持されていること（REQ-0148-006）
- 全 OU がいずれか1つの execution_unit へ割り当てられ、欠落・重複がないこと

### 検証失敗時の扱い

検証で上限超過または構成不備を検出した場合、case-open は GitHub Issue 作成呼び出しを行わず停止する（REQ-0132-028）。Epic Issue、Standard Issue、子 Issue のいずれかを作成済みの状態での検証失敗を許容しない。検証失敗時は要件doc（draft）の削除、RU ファイルの削除を実施せず、再開可能な状態で停止する。

### 挿入位置の規範

本セクションは case-open SPEC の手順順序において、構成確定（Epic flow は Step 6、Standard flow は Step 11 相当）の直後、最初の Issue 作成（Epic flow は Step 7、Standard flow は Step 12）の前に挿入される。command reference 側の具体的ステップ番号は case-run 工程で確定する。

## 完了条件・事前状態記載ガイドライン（新規セクション）

case-open は Issue 本文の完了条件・事前状態セクションの記載を識別子中心とし、件数等の変動しやすい実測値スナップショットは補助値として扱う（REQ-0132-021）。本ガイドラインは case-run の QG-3 前置 staleness check（ファイルパス存在確認、検査結果件数再計測）が安定動作するための入力前提を整える目的で設定する。

### 識別子中心記載

完了条件・事前状態には、変動しやすい実測値ではなく安定識別子を主として記載する。

- **記載対象（識別子中心）**: ファイル相対パス（`src/opencode/commands/agentdev/case-run.md` 等）、NG 識別子（`NG-xxx`）、IR ID（`IR-NNN`）、REQ ID（`REQ-NNNN-MMM`）
- **補助値として許容する実測値**: NG 件数、IR 違反件数等の集計値。識別子リストに付随する参考情報として記載し、判定の主軸にはしない

### 記載例

```
## 完了条件（識別子中心）

- [ ] `src/opencode/commands/agentdev/case-run.md` に staleness check Step が追加されていること
- [ ] NG-123 が解消されていること
- [ ] IR-053 違反が 0 件であること（参考: 現行 3 件）
```

### 変動しやすい実測値の取扱い

件数・集計値は Issue 作成時点のスナップショットであり、実装進行中に変動する。そのため完了条件の判定主軸から外し、識別子リストの補助情報とする。case-run 側は staleness check で件数再計測を行い、Issue 本文記載値との差異を検出した場合は Findings 記録 + case-update 連携により本文更新を委譲する。

## 完了条件展開前の最新状態再確認（REQ-0132-022, REQ-0132-023）

case-open は完了条件を Issue 本文に展開する前に、対象パスで最新状態の再確認を行う。検出時点スナップショットと起票時点の最新状態に差異がある場合、最新状態を優先する。

### 再確認タイミング

以下のタイミングで完了条件展開前の再確認を必須とする:

- **同日内複数 PR マージ後の Issue 起票**: 同一日内に複数 PR がマージされた後、当該マージにより `docs/requirements/REQ-*.md`、`docs/adr/ADR-*.md`、`docs/specs/**/*.md` の内容が変動する可能性があるため、起票前に最新状態を再確認する
- **順次 Wave 実行時**: 複数 Wave が順次実行される場合、先行 Wave のマージ完了後に後続 Wave の Issue を起票する際、件数等の実測値が変動している可能性があるため再確認する

再確認は識別子（ファイルパス、REQ ID、NG ID、IR ID）の存在確認を主軸とし、件数等の実測値は補助値として扱う（既存「完了条件・事前状態記載ガイドライン」準拠）。

### review_dispositions evidence 再確認（AG-002、AG-005、AG-006）

draft-data に `review_dispositions` が含まれる場合、case-open は default branch 最新化後に各 disposition の `evidence.path` と `evidence.section` の実在性を再確認する。再確認時の commit SHA を当該 disposition の `evidence.checked_at_commit` へ記録し、Issue 本文の「レビュー判断」セクションへ転記する。

- evidence が実在し内容が最新である場合: `checked_at_commit` へ確認 commit SHA を記録し、証跡転記へ進む
- evidence の path または section が存在しない場合（失効）: Issue を作成せず停止する。当該 disposition の disposition を `stale_target` へ更新するか再評価対象として扱い、ユーザーへ停止理由を報告する
- `review_dispositions` が存在しない場合: 後方互換（AG-001）としてそのまま処理を継続する

記録済みの判断（disposition、reason）をユーザーへ再確認しない（AG-008）。case-open は evidence の実在性と最新性の確認のみを行う。

## review_dispositions の consumer 契約（AG-008）

case-open は `review_dispositions` の consumer である（AG-002）。consumer として以下を担う:

| 責務 | 内容 |
|---|---|
| 読取 | draft-data の `review_dispositions` を読み取る。フィールド欠落時は後方互換（AG-001）として処理を継続する |
| 根拠確認 | default branch 最新化後に各 disposition の evidence（path、section）の実在性と最新性を再確認する（前述「review_dispositions evidence 再確認」） |
| 停止条件 | evidence 失効を検出した場合、Issue を作成せず停止する。`covered` のまま失効した根拠で起票しない |
| 証跡転記 | 再確認した disposition を Issue 本文の「レビュー判断」セクションへ恒久証跡として転記する。転記時 `evidence.checked_at_commit` へ確認 commit SHA を記録する |

記録済みの判断（disposition、reason）をユーザーへ再確認しない。consumer は evidence の実在性と最新性の確認のみを行い、判断そのものを覆さない（AG-008）。

## review_dispositions の消費と証跡転記

case-open は `review_dispositions` を読み取り、Issue 本文の「レビュー判断」セクションへ恒久証跡として転記する。転記により req_draft 削除後も証跡が残る（AG-002、AG-005）。

### 転記規則（AG-011）

| 構成 | 転記先 | 転記内容 |
|---|---|---|
| 単一 Standard Issue | 当該 Issue | 全 disposition を当該 Issue へ転記する |
| Epic flow | Epic Issue | 全 disposition を Epic Issue へ転記する。子 Issue へは重複転記しない |
| 複数 Standard Issue | 各 Issue + ルート Issue | 各 Issue の OU、変更対象に関連する disposition を当該 Issue へ転記する。ドラフト全体の disposition はルート Issue（`recommended_order` 最小）へ転記する |

### レビュー判断セクションへの転記形式

転記先の Issue 本文「レビュー判断」セクションの構造は workflow-templates SPEC（`docs/specs/skills/agentdev-workflow-templates.md`「review_dispositions 証跡セクション」節）が正規所有する。各 disposition は id、disposition、reason_code、reason、evidence（path、section、checked_at_commit）を記載する。

### child Issue の取扱い

child Issue テンプレートの「レビュー判断」セクションは親 Epic Issue への参照のみを記載し、disposition 明細の重複転記を行わない（AG-009）。全 disposition は Epic Issue 本体へ転記済みである。

### 後方互換（AG-001）

`review_dispositions` を持たない旧ドラフトを case-open は入力として拒否しない（ADR-0124 準拠）。フィールド欠落時は「レビュー判断」セクションへ「該当なし」と記載する。

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、コマンド分類、workflow_route）
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md)（Epic / Wave / Issue 階層、子Issue 状態 enum、case-open 構成生成基準）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（RU 削除トリガー、draft lifecycle）
- [quality-gates.md](../quality/quality-gates.md)（QG-2）
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（Issue 本文品質検査）

### case-open が使用する検査ツール

case-open が使用する検査ツール（[integrity-contracts.md](../integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

- なし（case-open は GitHub Issue 作成を責務とし、docs 整合性検査・extensions 検査を実行しない。検査は後続工程の req-save/spec-save/case-run/case-close で実施）

※肯定表現のみ（REQ-0144-002, REQ-0144-003 準拠）。

## 対象外

- 機能要件、非機能要件、制約、対象外、受け入れ条件の新規作成（G19、REQ-0132-009）
- 実装順序、Issue分解についてのユーザー確認要求（G20、REQ-0132-008）
- 単一 Issue で完結する場合の Epic 作成（G20、REQ-0104-041）
- Wave単位のみの子Issue構造（G14、子Issue は OU 単位で作成し、対応 OU 経由で REQ/ADR/SPEC トレーサビリティを保持。子Issue を REQ 文書単位で対応付ける規定は廃止、REQ-0104-042 準拠）
- 子Issue最大10件超過時の作成続行（G05、エラー停止、REQ-0132-028）
- 構成生成事前検証を GitHub Issue 作成後に行う扱い（G05、REQ-0132-027）
- intake / learning capture の実施（G18, G22）
- Issue作成の gh CLI 安全手続き省略（G12、`agentdev-gh-cli` 参照）
- case-open は Issue 本文（Standard/Epic/子Issue/完了報告コメント全て）を文字列変数で持ち回らず、`[System.IO.File]::WriteAllText`（UTF8Encoding($false)）による UTF-8 BOM なし LF 一時ファイル経由で `gh --body-file` へ渡すこと（G25、REQ-0132-024）。テンプレート読込→変数置換→ファイル保存→gh CLI 渡しまでをファイル経由で固定し、親エージェントの本文再構成を禁止する（REQ-0132-025）
- スイープ操作（`git add -A` / `git add .` / `git commit -a` / `git checkout .` / `git reset --hard` / `git stash` 等）の実行（G23、REQ-0137-001）
- 明示パス指定以外のステージ、コミット（G24、REQ-0137-002/005）
- draft / RU 削除の未ステージ残存許可（G24、Form Zero、REQ-0137-003/006）

## 検証観点

- QG-2（Acceptance Criteria Coverage Gate）: Step 2-1 で完了条件が対象 REQ/ADR/SPEC の必達要件を網羅しているか検証。fail 時は Issue 作成前に req-define 差し戻し推奨
- 子Issue 先頭行 `Parent: #{epic_number}` 含有（G03、親子関係追跡用）
- 全子Issue作成完了後の Epic 本文ステータス追跡テーブル更新（G04、部分更新禁止）
- 子Issue数上限（G05、最大10件、Epic 1件あたり）
- テンプレート必須セクション完備確認（G09、G10、`完了条件` セクション含む）
- 出力制約: Issue 本文、commit message は verbatim で返す。「verbatim」とは LF・空行・インデントを含む行構造を byte 単位で保持することを指し、文字列の正規化、改行圧縮、空白挿入・削除をすべて禁止する。委譲接続点（Step 2/6/8/9）と最終 gh CLI 渡し（Step 12/13）の双方に適用する。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す（G17）
- draft / RU 削除残存検証（Step 14-2、`git status --porcelain` で空であること）

## case-auto 並列委譲モデル（REQ-0114-087〜093）

### 連結成分ベース複数 Standard/Epic 構成生成（REQ-0114-088 更新、REQ-0148）

case-open は OU 群の依存グラフの連結成分（必須依存のみをエッジとする）を Epic 候補の出発点とし、依存強度、Epic サイズ、機能的一貫性の3軸判断で複数 Standard Issue / 複数 Epic Issue / 混在を自律生成する（REQ-0148-005, REQ-0148-006, REQ-0148-007, REQ-0132-015/016）。

**単独根の Standard flow 扱い**: 連結成分が 1 OU だけ（単独根）の場合、Epic 化せず Standard flow とする（REQ-0148-008, REQ-0132-017）。

**3軸判断の判定基準**:

| 軸 | 判定基準 |
|---|---|
| 依存強度 | 必須依存で結合した OU 群は原則同一 Epic。弱依存、関連依存は連結成分のエッジにしない |
| Epic サイズ | 1 Epic あたり子 Issue 推奨 3-10、上限 10 ハード制約（REQ-0148-009）。上限超過時は必須依存があっても分割を検討 |
| 機能的一貫性 | 連結成分内の OU 群が単一の機能的主題を成すか。主題を欠く場合は複数 Epic へ分割、または Standard flow へ分散 |

case-open は無関係な OU 群を単一 Epic へ機械的に集約しない（REQ-0148-010）。
3軸判断の個別エッジケース（同機能独立、共通基盤等）は LLM 推論に委ねる。
REQ/SPEC で固定するのは不変の方針（依存強度3レベル定義、Epic サイズ上限、単独根 Standard flow）のみである。


case-open は Epic 構成推論の根拠を Epic Issue 本文または `case_open_hints` に記録する（REQ-0148-011, REQ-0138-020）。
連結成分アルゴリズム、3軸判断基準、Epic 分割例外（REQ-0148-023）の詳細は `docs/specs/workflows/epic-wave-model.md` の「連結成分ベース execution_unit 構成モデル」セクション参照。

### 子Issue 作成の並列化

- 子Issue 本文案作成、検査、Issue 作成は最大5件まで並列化できる（REQ-0114-089）
- Epic Issue 作成、Wave 1 配置、Epic 本文ステータス追跡テーブル更新は親が直列集約（REQ-0114-093）
- G04「全子Issue 作成完了後にテーブル更新（部分更新禁止）」は集約更新で維持

## See Also

- [req-define.md](req-define.md)（前段コマンド）
- [req-save.md](req-save.md)（前段コマンド（REQ/ADR 保存））
- [spec-save.md](spec-save.md)（前段コマンド（SPEC 保存））
- [case-run.md](case-run.md)（後続コマンド（実装））
- `agentdev-issue-management` skill（Issue 本文生成、テンプレート充足）
- `agentdev-workflow-templates` skill（テンプレート選定）
- `agentdev-workflow-lifecycle` skill（work_type、scale 判定、ラベル付与）
- `agentdev-gh-cli` skill（gh CLI 安全使用）
- `agentdev-git-worktree` skill（並列実行安全ステージング）
- `agentdev-quality-gates` skill（QG-2）
- `agentdev-epic-tracker` skill（ステータス追跡テーブル）
- REQ-0132（case-open / Issue作成）
- REQ-0137（並列実行安全 git 操作規律）
- REQ-0148（RU群バッチ処理と複数 execution_unit 並列実行）

