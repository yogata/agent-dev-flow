---
title: case-open SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-15
---

# case-open SPEC

## 目的

要件定義（req-define）の結果をもとに GitHub Issue を作成する。
壁打ち→構造的実行フェーズの境界。
Epic + 子 Issue 一括作成に対応する。

## 承認・HITL 境界

- case-open 自身の承認点を持たない（req-define で壁打ち合意済みの要件 doc を入力とし、Issue 作成を自動実行する）。
- OU 選択ゲートで処理対象 OU を決定できない場合（OU ID 指定 / 自動選択 / 一覧表示停止のいずれにも該当しないとき）は、一覧を表示してユーザー判断を求める。

## 入力

- req-define で生成された要件doc（構造化 `draft-data` 形式: REQ-008, DEC-003、チェックボックス付き）
- draft 全体の `agreed_items`、`artifact_actions`、`operation_units` を処理対象。OU ごとにスライスせず draft 全体を取り扱う（REQ-008-009）
- `auto_gate.auto_ready` が false、または未解決質問、未解決衝突、repo外操作、停止理由が残る場合は停止（REQ-008-013）
- `conflict_resolutions` に記録済みの衝突は同じ内容をユーザーへ再確認しない（REQ-008-014）

## 出力

- GitHub Issue（ラベル付き、要件doc埋め込み）
- Epic flow の場合は Epic Issue + 子 Issue 群（最大10件、G05/G15）
- ドラフト削除: `.agentdev/drafts/req-draft-{topic-slug}.md`
- RU ファイル削除: `.agentdev/backlog/req-units/RU-*.md`
- OU `result` 書き戻し: `operation_units` セクションに Issue / Epic 番号

## 副作用

- ファイル削除: `.agentdev/drafts/req-draft-*.md`, `.agentdev/backlog/req-units/RU-*.md`（Standard / Epic 全フロー共通、v2:REQ-0137-003/006 Form Zero）
- git 操作: `git rm <path>` + `git commit -- <paths>` の即時ステージ、コミット（並列実行安全ステージング）
- GitHub API: `gh issue create`, `gh issue edit`, `gh issue comment`（`agentdev-gh-cli` VERIFY 付き）
- deviation capture: case-open 実行中に実観測した deviation を agentdev-learning-capture skill または
  agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存。
  保存先は capture-boundaries.md の Split Rule に従う。
- git 永続化: capture 成果物を case-open 自身の既存 commit/push 処理内で永続化。
- 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節（`結果` 内）に含める。

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-case-open`）が正規情報源である。

- 前工程からの引き継ぎ停止判定（`agentdev_handoff: true` 含まれる場合は Issue 作成せず停止）
- OU 選択ゲート（`operation_units` セクションがある場合、処理対象 OU を決定（OU ID 指定 / 自動選択 / 一覧表示停止））
- 要件docからIssue本文生成（`agentdev-issue-management`）（REQ読解、テンプレート充足検査、完了条件候補抽出）
  - 完了条件網羅性検証（QG-2）（Issue作成前に REQ/Decision/SPEC 必達要件の網羅性を検証）
- マルチREQ入力判定（単一REQ / 複数REQ or `scale: large` で Epic flow へ分岐）
  - 自律構成生成（OU モード、複数REQ時）（`operation_units` から Epic / Wave / Issue 構造を自律生成）
- 規模判定（単一REQの場合）（`scale: large` → Epic flow / `scale: standard` → Standard flow）
- Epic flow:
  - テンプレート読込（`agentdev-workflow-templates`）
  - Epic Issue本文生成（自律構成分析結果に基づき Epic 本文を構築）
  - Epic Issue作成（ラベル: `enhancement`, `feature`, `epic`）（VERIFY）
  - 子Issue作成（OU 単位、順次処理）（Issue化単位は REQ doc 単位ではなく OU 単位（REQ-005-042））。各子 Issue 本文の「## 補足情報」セクションに「前工程完了度」属性を埋め込む（REQ-003-011、`docs/specs/workflows/epic-wave-model.md` の前工程完了度3段階分類に従う）
  - Epic Issue本文更新（ステータス追跡テーブル更新）
  - OU `result` 書き戻し（Issue / Epic 番号）
- Standard flow:
  - 関連Decision特定
  - ラベル付与（`agentdev-workflow-lifecycle`）
  - GitHub Issue作成（VERIFY）
  - OU `result` 書き戻し（Issue 番号）
- 共通終了処理:
  - コメント追加（`agentdev-workflow-templates`）
  - ドラフト削除（`git rm` + `git commit` Form Zero）
  - RU ファイル削除（`git rm` + `git commit` Form Zero）
  - draft / RU 削除残存検証（`git status --porcelain` で残存検出）
  - draft/RU 削除 commit 後の即時 push（REQ-003-003）（削除コミット後に `git push` を即時実行する）。case-run 引き継ぎ時の `git pull --ff-only` 失敗防止のため
  - 完了報告（Standard / 単一REQ Epic / マルチREQ Epic テンプレート）

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 SPEC であり、command 定義（`src/opencode/commands/agentdev/case-open.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（STEP 構成、Standard flow / Epic flow の内部手順、reference 構成）は Workflow Skill（`agentdev-workflow-case-open`）が所有し、本 SPEC はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 構成生成事前検証（preflight）

case-open は Standard flow、Epic flow、混在構成の全ルートで、GitHub Issue 作成前に共通の事前検証を実施する（REQ-006-027）。
検証は execution_unit 構成の確定後、最初の GitHub Issue 作成呼び出し（Epic Issue 作成、Standard Issue 作成、子 Issue 作成を含む）の前に完了する。

### 検証項目

- 各 Epic の子 Issue 数が10件以下であること（REQ-006-009 ハード制約）
- 各 Wave の同時実行対象が5件以下であること（REQ-006-026）
- 各 Standard Issue および各子 Issue が1つの OU と対応していること（REQ-005-042）
- 必須依存関係（連結成分のエッジ）が維持されていること（REQ-006-006）
- 全 OU がいずれか1つの execution_unit へ割り当てられ、欠落・重複がないこと

### 検証失敗時の扱い

検証で上限超過または構成不備を検出した場合、case-open は GitHub Issue 作成呼び出しを行わず停止する（REQ-006-028）。
Epic Issue、Standard Issue、子 Issue のいずれかを作成済みの状態での検証失敗を許容しない。
検証失敗時は要件doc（draft）の削除、RU ファイルの削除を実施せず、再開可能な状態で停止する。

### 挿入位置の規範

本セクションは case-open の処理順序において、構成確定（Epic flow は Epic Issue 本文確定、Standard flow は規模判定・preflight 相当）の直後、最初の Issue 作成の前に挿入される。
Workflow Skill 側の具体的な挿入位置は Workflow Skill が確定する。

## 完了条件・事前状態記載ガイドライン（新規セクション）

case-open は Issue 本文の完了条件・事前状態セクションの記載を識別子中心とし、件数等の変動しやすい実測値スナップショットは補助値として扱う（REQ-006-021）。
本ガイドラインは case-run の QG-3 前置 staleness check（ファイルパス存在確認、検査結果件数再計測）が安定動作するための入力前提を整える目的で設定する。

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

件数・集計値は Issue 作成時点のスナップショットであり、実装進行中に変動する。
そのため完了条件の判定主軸から外し、識別子リストの補助情報とする。
case-run 側は staleness check で件数再計測を行い、Issue 本文記載値との差異を検出した場合は Findings 記録 + case-update 連携により本文更新を委譲する。

## 完了条件展開前の最新状態再確認（REQ-006-022, REQ-006-023）

case-open は完了条件を Issue 本文に展開する前に、対象パスで最新状態の再確認を行う。
検出時点スナップショットと起票時点の最新状態に差異がある場合、最新状態を優先する。

### 再確認タイミング

以下のタイミングで完了条件展開前の再確認を必須とする:

- **同日内複数 PR マージ後の Issue 起票**: 同一日内に複数 PR がマージされた後、当該マージにより `docs/requirements/REQ-*.md`、`docs/decisions/DEC-*.md`、`docs/specs/**/*.md` の内容が変動する可能性があるため、起票前に最新状態を再確認する
- **順次 Wave 実行時**: 複数 Wave が順次実行される場合、先行 Wave のマージ完了後に後続 Wave の Issue を起票する際、件数等の実測値が変動している可能性があるため再確認する

再確認は識別子（ファイルパス、REQ ID、NG ID、IR ID）の存在確認を主軸とし、件数等の実測値は補助値として扱う（既存「完了条件・事前状態記載ガイドライン」準拠）。

### review_dispositions evidence 再確認（AG-002、AG-005、AG-006）

draft-data に `review_dispositions` が含まれる場合、case-open は default branch 最新化後に各 disposition の `evidence.path` と `evidence.section` の実在性を再確認する。
再確認時の commit SHA を当該 disposition の `evidence.checked_at_commit` へ記録し、Issue 本文の「レビュー判断」セクションへ転記する。

- evidence が実在し内容が最新である場合: `checked_at_commit` へ確認 commit SHA を記録し、証跡転記へ進む
- evidence の path または section が存在しない場合（失効）: Issue を作成せず停止する。当該 disposition の disposition を `stale_target` へ更新するか再評価対象として扱い、ユーザーへ停止理由を報告する
- `review_dispositions` が存在しない場合: 後方互換（AG-001）としてそのまま処理を継続する

記録済みの判断（disposition、reason）をユーザーへ再確認しない（AG-008）。
case-open は evidence の実在性と最新性の確認のみを行う。

## review_dispositions の consumer 契約（AG-008）

case-open は `review_dispositions` の consumer である（AG-002）。consumer として以下を担う:

| 責務 | 内容 |
|---|---|
| 読取 | draft-data の `review_dispositions` を読み取る。フィールド欠落時は後方互換（AG-001）として処理を継続する |
| 根拠確認 | default branch 最新化後に各 disposition の evidence（path、section）の実在性と最新性を再確認する（前述「review_dispositions evidence 再確認」） |
| 停止条件 | evidence 失効を検出した場合、Issue を作成せず停止する。`covered` のまま失効した根拠で起票しない |
| 証跡転記 | 再確認した disposition を Issue 本文の「レビュー判断」セクションへ恒久証跡として転記する。転記時 `evidence.checked_at_commit` へ確認 commit SHA を記録する |

記録済みの判断（disposition、reason）をユーザーへ再確認しない。
consumer は evidence の実在性と最新性の確認のみを行い、判断そのものを覆さない（AG-008）。

## review_dispositions の消費と証跡転記

case-open は `review_dispositions` を読み取り、Issue 本文の「レビュー判断」セクションへ恒久証跡として転記する。
転記により req_draft 削除後も証跡が残る（AG-002、AG-005）。

### 転記規則（AG-011）

| 構成 | 転記先 | 転記内容 |
|---|---|---|
| 単一 Standard Issue | 当該 Issue | 全 disposition を当該 Issue へ転記する |
| Epic flow | Epic Issue | 全 disposition を Epic Issue へ転記する。子 Issue へは重複転記しない |
| 複数 Standard Issue | 各 Issue + ルート Issue | 各 Issue の OU、変更対象に関連する disposition を当該 Issue へ転記する。ドラフト全体の disposition はルート Issue（`recommended_order` 最小）へ転記する |

### レビュー判断セクションへの転記形式

転記先の Issue 本文「レビュー判断」セクションの構造は workflow-templates SPEC（`docs/specs/skills/agentdev-workflow-templates.md`「review_dispositions 証跡セクション」節）が正規所有する。
各 disposition は id、disposition、reason_code、reason、evidence（path、section、checked_at_commit）を記載する。

### child Issue の取扱い

child Issue テンプレートの「レビュー判断」セクションは親 Epic Issue への参照のみを記載し、disposition 明細の重複転記を行わない（AG-009）。
全 disposition は Epic Issue 本体へ転記済みである。

### 後方互換（AG-001）

`review_dispositions` を持たない旧ドラフトを case-open は入力として拒否しない（DEC-003 準拠）。
フィールド欠落時は「レビュー判断」セクションへ「該当なし」と記載する。

## Artifact Graph 利用

case-open は Issue の対象範囲, 完了条件, test strategy, 必須 skill, 検証事項を確定する前に Artifact Graph による変更影響候補を評価する。
候補には REQ, Decision, SPEC, command, skill, extension, integrity rule, 関連 source_file を含められる。
Graph 候補は正規成果物または独立した探索手段で確認した上で in scope, verification only, out of scope に分類する。

必須品質能力の導出は `artifact-quality-control-routing` SPEC が定める artifact type から品質能力キーへの変換に従い、Graph の delegates_to, governs 関係から必須 skill を直接決定しない。
Graph は変更成果物候補と関連規則候補の探索のみを担当する。
共通利用原則の防護事項は `agentdev-artifact-graph` SPEC「ワークフロー利用」を参照。

Graph 不在、stale、consumer 環境に対応 node type または relation type が存在しない場合は、従来の探索経路で継続し、workflow を停止しない（fail-open）。

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、コマンド分類、workflow_route）
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md)（Epic / Wave / Issue 階層、子Issue 状態 enum、case-open 構成生成基準）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（RU 削除トリガー、draft lifecycle）
- [quality-gates.md](../quality/quality-gates.md)（QG-2）
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（Issue 本文品質検査）

### case-open が使用する検査ツール

case-open が使用する検査ツール（[integrity-contracts.md](../integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

- なし（case-open は GitHub Issue 作成を責務とし、docs 整合性検査・extensions 検査を実行しない。検査は後続工程の req-save/spec-save/case-run/case-close で実施）

※肯定表現のみ（REQ-010-002, REQ-010-003 準拠）。

## execution contract 確定ステップ（新規セクション）

case-open は Issue 本文生成前に次の execution contract 確定ステップを実行する。

### EC-1: 変更対象成果物の確定

合意済み要件doc の artifact_actions から変更予定成果物を抽出し、Issue 本文の
「対象範囲」セクションへ確定する。

### EC-2: 必須品質統制の導出と test strategy 投影

artifact-quality-control-routing SPEC の合成規則に従い、変更予定成果物の種別から
必須品質能力を導出する。各能力について test strategy 項目を生成し、Issue 本文の
test strategy セクションへ投影する。

### EC-3: 完了条件の確定

合意内容から成果状態を抽出し、Issue 本文の完了条件セクションへ確定する。
実行手段、検証手段は test strategy へ分離する。必須品質能力の呼出自体が利用者要求
でない限り、Skill 呼出を完了条件化しない。

### EC-4: 関連 Decision 拘束条件の特定と反映

Issue の実装を拘束する関連 Decision を特定し、必要な制約を完了条件または test strategy
へ反映する。

### EC-5: 予定変更内容から事前判定可能な追加検証条件の展開

「関数削除時は全利用箇所を検査する」等、予定変更内容から事前判定可能な検証条件を
test strategy へ展開する。case-open が追加できる test strategy は合意済み変更対象と
共通ルールから決定的に導ける必須検証に限定し、新しい利用者要求を生成しない。

### EC-6: scope-affecting impact candidate の探索と反映

Issue 作成前に変更影響候補を探索し、scope、完了条件、test strategy に影響する候補を
execution contract へ反映する。

### EC-7: adversarial-review 発動契約の永続化

ユーザー明示指定による adversarial-review 発動契約が Issue 作成前に判明している場合、
Issue 本文の契約セクションへ永続化する（経路F 拡張）。

### EC-8: execution contract 必須セクションの付与

新規 Issue 作成時、新契約識別用の必須セクション（execution contract セクション、
必須品質統制セクション）を Issue 本文へ付与する。presence-based 判定により
新旧 Issue を識別する（AG-012、REQ-017-014）。

## 対象外

- 機能要件、非機能要件、制約、対象外、受け入れ条件の新規作成（G19、REQ-006-009）
- 実装順序、Issue分解についてのユーザー確認要求（G20、REQ-006-008）
- 単一 Issue で完結する場合の Epic 作成（G20、REQ-005-041）
- Wave単位のみの子Issue構造（G14、子Issue は OU 単位で作成し、対応 OU 経由で REQ/Decision/SPEC トレーサビリティを保持。子Issue を REQ 文書単位で対応付ける規定は廃止、REQ-005-042 準拠）
- 子Issue最大10件超過時の作成続行（G05、エラー停止、REQ-006-028）
- 構成生成事前検証を GitHub Issue 作成後に行う扱い（G05、REQ-006-027）
- intake / learning capture の実施（G18, G22）
- Issue作成の gh CLI 安全手続き省略（G12、`agentdev-gh-cli` 参照）
- case-open は Issue 本文（Standard/Epic/子Issue/完了報告コメント全て）を文字列変数で持ち回らず、`[System.IO.File]::WriteAllText`（UTF8Encoding($false)）による UTF-8 BOM なし LF 一時ファイル経由で `gh --body-file` へ渡すこと（G25、REQ-006-024）。テンプレート読込→変数置換→ファイル保存→gh CLI 渡しまでをファイル経由で固定し、親エージェントの本文再構成を禁止する（REQ-006-025）
- スイープ操作（`git add -A` / `git add .` / `git commit -a` / `git checkout .` / `git reset --hard` / `git stash` 等）の実行（G23、v2:REQ-0137-001）
- 明示パス指定以外のステージ、コミット（G24、v2:REQ-0137-002/005）
- draft / RU 削除の未ステージ残存許可（G24、Form Zero、v2:REQ-0137-003/006）

## 検証観点

- QG-2（Acceptance Criteria Coverage Gate）: 完了条件網羅性検証で完了条件が対象 REQ/Decision/SPEC の必達要件を網羅しているか検証。fail 時は Issue 作成前に req-define 差し戻し推奨
- 子Issue 先頭行 `Parent: #{epic_number}` 含有（G03、親子関係追跡用）
- 全子Issue作成完了後の Epic 本文ステータス追跡テーブル更新（G04、部分更新禁止）
- 子Issue数上限（G05、最大10件、Epic 1件あたり）
- テンプレート必須セクション完備確認（G09、G10、`完了条件` セクション含む）
- 出力制約: Issue 本文、commit message は verbatim で返す。「verbatim」とは LF・空行・インデントを含む行構造を byte 単位で保持することを指し、文字列の正規化、改行圧縮、空白挿入・削除をすべて禁止する。委譲接続点（Issue 本文生成、Epic Issue 本文生成、子Issue 本文生成、Epic Issue 本文更新）と最終 gh CLI 渡し（Issue 作成、コメント追加）の双方に適用する。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す（G17）
- draft / RU 削除残存検証（`git status --porcelain` で空であること）

## case-auto 並列委譲モデル（REQ-006-087〜093）

### 連結成分ベース複数 Standard/Epic 構成生成（REQ-006-088 更新、REQ-006）

case-open は OU 群の依存グラフの連結成分（必須依存のみをエッジとする）を Epic 候補の出発点とし、依存強度、Epic サイズ、機能的一貫性の3軸判断で複数 Standard Issue / 複数 Epic Issue / 混在を自律生成する（REQ-006-005, REQ-006-006, REQ-006-007, REQ-006-015/016）。

**単独根の Standard flow 扱い**: 連結成分が 1 OU だけ（単独根）の場合、Epic 化せず Standard flow とする（REQ-006-008, REQ-006-017）。

**3軸判断の判定基準**:

| 軸 | 判定基準 |
|---|---|
| 依存強度 | 必須依存で結合した OU 群は原則同一 Epic。弱依存、関連依存は連結成分のエッジにしない |
| Epic サイズ | 1 Epic あたり子 Issue 推奨 3-10、上限 10 ハード制約（REQ-006-009）。上限超過時は必須依存があっても分割を検討 |
| 機能的一貫性 | 連結成分内の OU 群が単一の機能的主題を成すか。主題を欠く場合は複数 Epic へ分割、または Standard flow へ分散 |

case-open は無関係な OU 群を単一 Epic へ機械的に集約しない（REQ-006-010）。
3軸判断の個別エッジケース（同機能独立、共通基盤等）は LLM 推論に委ねる。
REQ/SPEC で固定するのは不変の方針（依存強度3レベル定義、Epic サイズ上限、単独根 Standard flow）のみである。


case-open は Epic 構成推論の根拠を Epic Issue 本文または `case_open_hints` に記録する（REQ-006-011, REQ-008-020）。
連結成分アルゴリズム、3軸判断基準、Epic 分割例外（REQ-006-023）の詳細は `docs/specs/workflows/epic-wave-model.md` の「連結成分ベース execution_unit 構成モデル」セクション参照。

### 子Issue 作成の並列化

- 子Issue 本文案作成、検査、Issue 作成は最大5件まで並列化できる。最大5件は SPEC 所有の実行安全境界の数値であり（REQ-006 目的「実行安全境界の数値は SPEC を正規所有者とし、本 REQ は境界宣言へ縮約する」）、case-open 実装が遵守する。旧 v2 参照の REQ-006-089 は case-auto orchestration stage モデルを規定する別要件であり、本並列化上限の根拠ではないため参照を除去した（OU-008 整合）
- Epic Issue 作成、Wave 1 配置、Epic 本文ステータス追跡テーブル更新は Epic Issue 本文の単一書き手原則（REQ-006-095, REQ-006-101）に基づく親の直列集約である。旧 v2 参照の REQ-006-093 は case-auto background task 回復パターンを規定する別要件であり、本直列集約の根拠ではないため参照を除去した（OU-008 整合）
- G04「全子Issue 作成完了後にテーブル更新（部分更新禁止）」は集約更新で維持

## REQ-006-089/093 参照の整合

case-open SPEC 内の REQ-006-089、REQ-006-093 参照行と正規定義（REQ-006.md）との意味整合を確認する。

### 整合方針

- REQ-006.md の正規定義と case-open SPEC 内の参照が意味的に一致するか照合する
- ズレがある場合、次のいずれかで対応する
  - 参照先の修正
  - 別要件への置換
  - 注記の付与

原本ドラフトが挙げていた L239-240 は近似行であり、実施時に正確な行を再特定する。

## 停止状態

- 前工程からの引き継ぎ停止判定（`agentdev_handoff: true`）検出時（Issue 作成せず停止する）。
- `auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo外操作、停止理由が残る場合（REQ-008-013）。
- preflight 検証失敗時（Issue 作成呼び出しを実行せず停止する、REQ-006-028）。
- review_dispositions の evidence 失効検出時（Issue 作成を中止する。`covered` のまま失効した disposition は再利用しない）。
- adversarial-review 審議で unresolved なユーザー判断事項が残る場合（最初の GitHub Issue 作成へ進まない）。

## See Also

- [req-define.md](req-define.md)（前段コマンド）
- [req-save.md](req-save.md)（前段コマンド（REQ/Decision 保存））
- [spec-save.md](spec-save.md)（前段コマンド（SPEC 保存））
- [case-run.md](case-run.md)（後続コマンド（実装））
- `agentdev-workflow-case-open` skill（workflow 実装本体（STEP 構成、resume protocol））
- `agentdev-issue-management` skill（Issue 本文生成、テンプレート充足）
- `agentdev-workflow-templates` skill（テンプレート選定）
- `agentdev-workflow-lifecycle` skill（work_type、scale 判定、ラベル付与）
- `agentdev-gh-cli` skill（gh CLI 安全使用）
- `agentdev-git-worktree` skill（並列実行安全ステージング）
- `agentdev-quality-gates` skill（QG-2）
- `agentdev-epic-tracker` skill（ステータス追跡テーブル）
- REQ-006（case-open / Issue作成）
- v2:REQ-0137（並列実行安全 git 操作規律）
- REQ-006（RU群バッチ処理と複数 execution_unit 並列実行）

## adversarial-review 挿入境界（経路F）

本節は case-open への adversarial-review caller integration（経路F、REQ-015-009）の挿入境界を正典として所有する。
共通 caller integration 契約（任意性、QG/HITL 非代替、副作用禁止、accepted finding 反映責務、再 review 条件と停止条件、呼出失敗時取扱い）は [adversarial-review SPEC](../skills/agentdev-adversarial-review.md)「adversarial-review caller integration 共通契約」節が正であり、本節は経路F 固有の挿入位置、発動条件、変更影響別再実行ルール、最初の副作用との順序のみを規定する（REQ-014-011）。

### 挿入位置（REQ-015-009）

review 挿入位置は「execution structure / Issue 本文候補 / 完了条件構成後・最初の GitHub Issue 作成前」と一意に特定可能である。
execution structure（Epic flow の自律構成生成、Standard flow の単一 OU 構成）、Issue 本文候補（Epic Issue 本文、Standard Issue 本文）、完了条件（QG-2 で網羅性検証済み）の3者すべてが確定した後、最初の GitHub Issue 作成呼び出しの前に挿入する。
各 flow の対応付けを次に示す。

| flow | execution structure 確定 | Issue 本文候補確定 | 完了条件確定 | 最初の GitHub Issue 作成 | review 挿入位置 |
|---|---|---|---|---|---|
| Epic flow（マルチREQ、`scale: large`） | 自律構成生成 | Epic Issue 本文生成 | QG-2 | Epic Issue 作成 | Epic Issue 本文生成完了後、Epic Issue 作成の前 |
| Standard flow（`scale: standard`、フィールドなし） | 規模判定、preflight で単一 OU 構成を確定 | Issue 本文生成 | QG-2 | Standard Issue 作成 | preflight 完了後、Standard Issue 作成の前 |

Epic flow ではテンプレート読込、Epic Issue 本文生成の完了後に review を挿入し、Epic Issue 作成の前に実行する。
子 Issue 本文生成、子 Issue 作成は Epic Issue 作成完了後に実行するため、review 挿入時点では未確定であり review 対象外である。
子 Issue 構成は自律構成生成の execution structure（Epic/Wave/Issue 構成）として Epic Issue 本文に反映済みであるため、execution structure 経由で review 対象となる。
Standard flow では Issue 本文生成、QG-2、preflight の完了後に review を挿入し、Standard Issue 作成の前に実行する。

### 発動条件判定 Step（REQ-015-001、REQ-015-002、REQ-015-003）

発動条件判定と review 呼出を分離する（REQ-015-001）。
発動条件判定 Step は default-on 原則（REQ-015-002）と skip 条件（REQ-015-003）を評価する。

- **default-on（原則実行）**: case-open は adversarial-review を原則実行する（REQ-015-002）。ユーザー明示指定は通常発動の必須条件ではなく、execution structure、Issue 本文候補、完了条件のいずれかに意味的決定が存在する場合に発動する。
- **skip 条件**: 次のいずれかに該当する場合、adversarial-review を省略して従来フロー（review を挿入せず最初の GitHub Issue 作成へ進む）を継続できる（REQ-015-003）。Epic flow は Epic Issue 作成、Standard flow は Standard Issue 作成へそのまま進む。skip 判断のためだけの新規 HITL、承認点は追加しない。
  - Standard flow（`scale: standard`、単一 OU）で QG-2 必達要件の網羅性に懸念がなく、execution structure が機械的確定（Wave 分割なし、単一 Issue）の場合
- **ユーザー明示指定時の必須実行**: ユーザーが case-open 実行中に adversarial-review の実施を明示的に指定した場合、skip 条件の該当にかかわらず必ず発動する（REQ-015-002）。

### review 呼出 Step（REQ-015-001）

発動条件判定 Step で発動と判定された場合、review 呼出 Step で adversarial-review を呼び出す（REQ-015-001）。

- **委譲契約**: adversarial-review は `semantic_review`（書き込み禁止型）として適用する（[delegation-contracts SPEC](../workflows/delegation-contracts.md)「adversarial-review との委譲契約接続」節）。adversarial-review 自身は対象ファイル、Issue、PR、git 操作を行わない（REQ-014-004）。
- **review 対象**: execution structure（Epic/Wave/Issue 構成、自律構成生成または規模判定・preflight で確定）、Issue 本文候補（Epic Issue 本文、Standard Issue 本文）、完了条件（QG-2 で網羅性検証済み）の3者。
- **採用後戻り先**: accepted finding のうち execution structure に関わる finding は自律構成生成または規模判定へ戻し再評価する。Issue 本文、完了条件に関わる finding は Issue 本文生成、QG-2、Epic Issue 本文生成の該当段階へ戻す。accepted finding の対象候補への反映は case-open（呼出元）の責務である（REQ-014-006）。
- **unresolved 時の取扱い**: 未解決のユーザー判断事項が残る場合、最初の GitHub Issue 作成（Epic flow は Epic Issue 作成、Standard flow は Standard Issue 作成）へ進まない（REQ-014-009）。工程委譲起源であるため、既存 status（pass/warn/fail/partial）に unresolved 判断事項を付加し、case-auto 経由時は user-decision-required 停止理由分類として伝播する（REQ-014-012、[workflow-contracts SPEC](../workflows/workflow-contracts.md)「adversarial-review 由来の停止信号」節）。
- **呼出失敗時**: adversarial-review の呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持する（REQ-014-010）。

### 変更影響別の再実行ルール（REQ-015-009）

review の結果反映で review 対象の意味内容が変更された場合（REQ-014-007）、変更影響範囲に応じて次の4パターンのいずれかを実行する（REQ-015-009）。

| 変更影響 | 再実行対象 | 戻り先 | 根拠 |
|---|---|---|---|
| 完了条件のみ変更 | QG-2 | 完了条件網羅性検証 | 完了条件網羅性検証を再実行し、REQ/Decision/SPEC 必達要件の網羅性を再確認する |
| execution structure のみ変更 | preflight | preflight | 構成生成事前検証（子 Issue 数上限、Wave 同時実行上限、OU 対応、必須依存関係維持、OU 割当網羅）を再実行する |
| 完了条件と execution structure の両方が変更 | QG-2 + preflight | 完了条件網羅性検証、preflight | 両方を再実行する。実行順序は QG-2 → preflight を維持する |
| 意味内容変更なし | 再実行不要 | （なし） | review 対象の意味内容に変更がないため、既存検証結果をそのまま使用し、最初の GitHub Issue 作成へ進む |

4パターンのいずれかを完了した後、意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動できる（REQ-014-007）。
同一 finding を新証拠・新前提・異なる failure condition・未評価範囲なしに再起票しない。
再 review の停止条件（REQ-014-008）を満たした場合、最初の GitHub Issue 作成（Epic flow は Epic Issue 作成、Standard flow は Standard Issue 作成）へ進む。

### 最初の副作用（GitHub Issue 作成）との順序

review は最初の GitHub Issue 作成呼び出し（Epic flow は Epic Issue 作成、Standard flow は Standard Issue 作成）より前に実行する。
GitHub Issue 作成が case-open の最初の副作用（GitHub API 呼び出しによる Issue レコード生成）であるため、review は最初の副作用の前に挿入される。
review の結果、execution structure、Issue 本文候補、完了条件のいずれかが変更された場合は、変更影響別の再実行ルール（REQ-015-009）に従い、最初の GitHub Issue 作成前に反映を完了する。

### 正規所有者マトリックス参照

本節と adversarial-review SPEC「adversarial-review caller integration 共通契約」節（REQ-014-011）、delegation-contracts SPEC「adversarial-review との委譲契約接続」節、workflow-contracts SPEC「adversarial-review 由来の停止信号」節との間で意味の重複、矛盾を生じない。
case-open command 固有の挿入境界（発動条件、挿入構造、変更影響別再実行ルール、順序）のみを本節が所有し、共通 caller integration 契約、adversarial-review 自身の振る舞い契約、再 review 条件と停止条件の詳細は各正規所有者 SPEC を正とする。

