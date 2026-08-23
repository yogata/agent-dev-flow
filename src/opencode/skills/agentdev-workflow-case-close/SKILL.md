---
name: agentdev-workflow-case-close
description: "case-close command の workflow 実装本体。PR マージ（squash merge 先の統合先解決、mergeable UNKNOWN ポーリング、先行 commit 検出、コンフリクト Level 1 rebase）、統合先ブランチ同期時のリスク事前検出、QG-4 最終完了判定ゲート（検証対応要否未分類残存・検証対応必須行の恒久検証対応欠落時の完了阻止を含む）、docs 検証・Design 確定（Design status 昇格）、Capture 回収（PR 本文→intake/learning 分離）、実証最終クローズ（最終評価結果の導出と Issue 最終コメント正規記録、正式化経路案内）、Epic Wave クローズを所有する。USE FOR: case-close 実行時の workflow 制御（単一 Issue クローズ・Epic Wave クローズ・PR マージ・QG-4・Design 確定・Capture 回収・実証最終クローズ）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# case-close workflow スキル

case-close command の workflow 実装本体。
PR マージから Issue クローズ、Capture 回収、ドメイン状態永続化、完了報告までの制御構造、QG-4 最終完了判定ゲート（完了条件チェックボックス評価・更新）、Design 確定（draft → accepted 昇格）、Epic Wave クローズ（E1〜E6、単一書き手）を所有する。
squash merge 先は当該 Case の統合先（通常Caseは既定 main、実証Caseは対象評価ブランチ）に解決し、統合先ブランチ同期時のリスク事前検出を行う。
実証全体の最終 case-close では新しい評価を始めず最終評価結果を導出して Issue 最終コメントへ正規記録し、正式化経路（req-define <実証Issue>）を案内する（実行詳細は case-close command Design（extension 経由）が所有する）。

case-close command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` Design が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-case-close.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と case-close command の公開契約のみを前提とする。Design ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **Design 内部パスの固定知識化の禁止**: extension に列挙されていない Design 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- case-close command から渡される Issue 番号（単一 Issue または Epic Issue）
- PR 番号（または自動検出、Epic Wave クローズ時は各子Issue の PR を Epic Issue 本文から特定）

## 出力

- **単一 Issue クローズ時**: マージ済みPR、クローズ済みCase、削除済みブランチ、worktree
- **Epic Wave クローズ時**: 現在 Wave の全子Issue マージ、クローズ、Epic status table 更新、最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## 副作用

- PR squash merge、Issue close、Issue コメント追加、Epic Issue 本文ステータステーブル更新（`agentdev-gh-cli` 経由、case-close 単一書き手）
- worktree/ ブランチ削除（local + remote）
- Design `status` frontmatter 昇格（draft → accepted、対象 Design が draft かつ今回の実装が Design 内容を検証済みの場合）
- `.agentdev/learning/inbox.md`、`.agentdev/intake/inbox/` への Capture 回収、`.agentdev/` 配下 commit/push
- 当該 Workflow Skill は worktree root 配下以外を編集しない（case-close command の worktree 隔離に従う）

## Control Plane（STEP 一覧）

case-close workflow は次の STEP で構成する。
Epic Wave クローズは STEP-1 のルーティングで分岐し、E1〜E6 として並列記述する。
各 STEP は resume point を持つ（DEC-{N}、`docs/designs/<workflows/step-reference-contract>.md`）。
会話コンテキストに依存せず、durable state（GitHub Issue/PR、`.agentdev/`、commit hash、Design status）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | Issue 番号解決・ルーティング | Issue 番号受領 | 単一 Issue クローズ or Epic Wave クローズのルート確定 | [references/issue-resolution-and-qg4.md](references/issue-resolution-and-qg4.md) |
| STEP-2 | QG-4 達成判定 | ルート確定（単一 Issue） | 完了条件チェックボックス評価・更新、観点8 評価スコープ確定 | [references/issue-resolution-and-qg4.md](references/issue-resolution-and-qg4.md) |
| STEP-3 | docs 検証・Design 確定（配布依存境界 最終 gate 含む） | QG-4 合格 | targeted docs guard、IR-{NNN} check_extensions.ts、配布依存境界 最終 gate、full integrity suite 実行（bun test 実行形態契約）、Design status 昇格 | [references/docs-and-design-promotion.md](references/docs-and-design-promotion.md) |
| STEP-4 | PR マージ・コンフリクト解消 | docs 検証合格（配布依存境界 最終 gate 含む） | マージ済みPR（squash merge 先は当該 Case の統合先）、HEAD commit hash 記録、コンフリクト Level 1 解消 or case-auto エスカレーション | [references/pr-merge-and-conflict.md](references/pr-merge-and-conflict.md) |
| STEP-5 | Post-merge・Issue クローズ | PR マージ完了 | CI 通過確認、Issue 本文更新、実証最終クローズ（最終評価結果導出・Issue 最終コメント正規記録）、Issue close | [references/cleanup-and-capture.md](references/cleanup-and-capture.md) |
| STEP-6 | クリーンアップ・Capture 回収・永続化 | Issue クローズ完了 | worktree/branch 削除、親Epic 自動クローズ、実行前同期、Capture 回収、学び検知、実証最終クローズの正式化案内、`.agentdev/` 永続化、tmp/ 残存確認、完了報告 | [references/cleanup-and-capture.md](references/cleanup-and-capture.md) |
| STEP-E1〜E6 | Epic Wave クローズ（E4-1 配布依存境界 最終 gate 含む） | Epic Issue 番号受領、ステータス追跡テーブル存在 | 現在 Wave の子Issue 一括マージ・クローズ（E4-1 gate 違反子Issue は `blocked` でマージ対象外）、Epic status table 更新、当該 Wave スコープの一時成果物残留確認（E6-1、残留時は完了扱いにしない）、最終 Wave 判定 | [references/epic-wave-close.md](references/epic-wave-close.md) |

### STEP 間の依存と分岐

- **単一 Issue クローズ**: STEP-1（単一 ルート）→ STEP-2 → STEP-3（配布依存境界 最終 gate 含む）→ STEP-4 → STEP-5 → STEP-6
- **Epic Wave クローズ**: STEP-1（Epic ルート、ステータス追跡テーブル存在時）→ STEP-E1〜E6（E4 内で配布依存境界 最終 gate を各子Issue に適用、single-Issue STEP-3-1 と同一 detector）
- **コンフリクトエスカレーション**: STEP-4 で Level 1 rebase 失敗時、case-auto Level 2/3 エスカレーションへ（本 workflow の対象外）

### 共通事前マージ gate（両ルート共通、DEC-{N}、配布依存境界 Design）

配布依存境界の最終 gate は single-Issue ルート（STEP-3-1）と Epic Wave ルート（STEP-E4-1）の両方で、PR マージ前に必ず経由する共用事前マージ seam である。
両ルートとも同一 detector（`check_distribution_boundary.ts` 経由の `lib/distribution-boundary.ts`、IR-{NNN}）を呼び出し、どちらかのルートだけ gate を省略しない（DEC-{N}「事前書き込み gate と最終 gate の契約」、case-run command STEP-S5 と case-close で同一 detector を再利用）。
gate 違反時は両ルートとも PR マージを停止する。

### resume protocol

- 再開点は durable state から再構成する: Issue 本文の完了条件チェックボックス状態、PR の mergeable/マージ済み状態、HEAD commit hash、Design `status` frontmatter、worktree・ブランチの存在、Capture 回収済みファイルの存在
- 各 STEP の再実行はべき等であり、マージ済み PR への再マージ、更新済みチェックボックスの再評価を発生させない

### termination

- 正常終了: 単一 Issue ルートはクリーンアップ・Capture 回収・永続化 STEP の完了報告まで。Epic Wave ルートは最終 Wave 判定（Epic クローズ または 残 Wave 通知）まで
- 一時ファイル残存: 単一 Issue ルートの正常終了の前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないこと（STEP-6-6 で確認。cleanup 規定は `agentdev-gh-cli`）
- 一時成果物残留（Epic Wave ルート）: Epic Wave クローズの正常終了の前提として、当該 Wave スコープの一時成果物（draft、RU、検出事項等のドメイン状態）残留と当該実行で `.agentdev/tmp/` に作成した一時ファイルの残存がないこと（E6-1 で確認。残留時は当該 Wave を完了扱いにしない）
- 停止終了: 未達チェックボックス残存（構造化エラー）、QG-4 不合格、対象要件行の検証対応要否未分類残存または検証対応必須行の恒久検証対応欠落（段階ゲートの完了阻止条件）、配布依存境界 最終 gate 違反、mergeable ポーリング上限超過、Level 1 rebase 失敗（case-auto エスカレーション）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-quality-gates`: QG-4 Final Acceptance Gate、観点8 PR対象範囲 vs 全体 判定マトリクス
- `agentdev-gh-cli`: PR merge / mergeable UNKNOWN ポーリング / Issue close / VERIFY
- `agentdev-git-worktree`: 重複ファイルチェック、squash merge 後分岐ハンドリング、コンフリクト解消 rebase パス、worktree 削除、実行前同期リスク検出
- `agentdev-epic-tracker`: Epic Issue 本文ステータス追跡テーブル、E1〜E6 詳細、子Issue 状態 enum、Epic 自動クローズ判定
- `agentdev-design-file-manager`: Design status 昇格（draft → accepted）、design-lifecycle-application
- `agentdev-workflow-templates`: 対応記録コメント、完了報告テンプレート
- `agentdev-learning-capture`: 学び検知・抽出（エージェント自律）
- `agentdev-learning-pipeline`: deferred ルール、採用済み成果物取り込み判定
- `agentdev-intake-pipeline`: intake inbox への Capture 回収
- `agentdev-workflow-orchestration`: capture 境界（intake/learning 分離）
- `agentdev-conventional-commits`: GitHub auto-close 回避ガイドライン
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- `agentdev-traceability`: トレーサビリティ能力（check。QG-4 の対応完全性の独立再検査。fail-open）
- integrity checker skill（リポジトリ固有・配布対象外）: check_changed_docs.ts（targeted docs guard）、check_extensions.ts（IR-{NNN}）

## トレーサビリティ能力の利用（QG-4 独立再検査）

本スキルは QG-4 の一部として、対象要件の実装対応と検証対応の完全性を `agentdev-traceability` の check で正規成果物から独立して再検査できる（STEP-3 docs 検証）。
case-run 側の事前検査とは独立に実施する。検証手段との対応関係と「今回その検証を実行して合格したか」という実行結果（Issue、PR、QG の記録）を分離して扱う。

- 対象要件に実装対応または検証対応の欠落が残る場合はマージせず停止する。不足する対応関係を自動追加または修正せず、検査失敗を case-run 側の修正対象として差し戻す
- **検証対応要否の段階ゲート（完了阻止面）**: 対象要件行に未分類の行（検証対応宣言なし かつ 検証対応要否カタログ未登録。導出定義はトレーサビリティモデル「対応関係の完全性規則」が所有）が残る場合、または検証対応必須行に恒久検証対応が存在しない場合、当該 Case を完了として扱わない。導出は `agentdev-traceability` の check（`--req` で対象要件行に限定）で機械的に行い、`missing-verification` の findings を未分類行・恒久検証対応欠落行として扱う。check が実行不能な場合はカタログ登録状態と検証対応宣言の有無を定義どおり手動確認する
- **検証対応任意行の保護**: 検証対応任意行（検証対応要否カタログに登録された要件行）に恒久的な検証手段が存在しないことだけを理由として完了を阻害しない。任意行は完全性の計上対象外である
- QG-4 の対応完全性検査は有効である。全現行要件の実装対応と検証対応必須行の検証対応が成立し、check の未解決不合格が0件であることを移行完了条件とする。検証対応の完全性判定は検証対応必須行のみを計上する（検証対応任意行はトレーサビリティモデルの検証対応要否カタログが宣言する）
- agentdev-traceability の不在、実行失敗、空結果、候補過多のみを理由に本 workflow を失敗させない（fail-open）。代替検証経路（既存の品質ゲート、targeted docs guard、`rg` 等の独立探索）で継続し、正規成果物そのものの異常とトレーサビリティ機能側の異常を区別する
- 正規成果物側の実不整合が確認された場合は、既存の品質ゲート、受け入れ条件に従って fail とする

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-close.yaml`、`kind: workflow-extension`）を読み込む場合がある（REQ-{NNNN}-{NNN}、DEC-{N}）。
必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-close/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。
いずれも Workflow Skill のみが読み、case-close command は直接読まない。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。

## 共通制約

- **完了条件チェックボックス評価・更新は case-close の専任責務**: case-run/ driver/ 外部実行バックエンドは更新しない。case-close は別コンテキストで Issue 本文を再読込し、PR 本文を capture 入力源として最終完了判定する
- **Epic Issue 本文ステータス追跡テーブルの更新は case-close 単一書き手**: case-run は読み取りのみ、case-auto は Wave 反復制御のみで直接書き込まない（last-write-wins 競合防止）
- **Capture 境界**: intake/ learning を別々の成果物として扱い、PR 本文のみを capture 入力源とする（一時会話コンテキスト不入力）
- **検証差分の記録**: case-close が実施した各検証（QG-4 完了条件評価、docs 検証・配布依存境界 最終 gate、トレーサビリティ独立再検査等）について、検証種別、検証結果、finding 差分（新規、修正済み、既出、撤回、無効の5分類）を対応記録コメントへ記録する。形式は `agentdev-workflow-templates` の検証差分セクション規約（PR テンプレート形式と同一のテーブル）に従い、前段階（case-run）の PR 本文検証差分セクションの記録との差分で finding を分類して工程間比較を可能にする。対論型レビューの審議中 finding 状態の追跡と品質ゲート完了報告の修正証跡の所有境界を変更しない
- **統合先基準（squash merge 先・同期基準）**: squash merge 先、統合先ブランチ同期の対象は当該 Case の統合先（通常Caseは既定 main、実証Caseは対象評価ブランチ）を参照する。統合先は Issue 本文の実証Case状態情報（対象評価ブランチ等の永続記録）から確定し、実証Case状態情報がない場合は通常Caseとして main を統合先とする。通常Case（評価を利用しない Standard / Epic Case）の squash merge 先は従来どおり main を基調とし、利用者向け操作と挙動を変更しない。QG-4 は Issue 完了条件の最終判定として意味を変更しない。統合先とブランチモデルの基盤契約は `agentdev-git-worktree` Design（extension 経由）を参照する
- **実証最終クローズ**: 実証全体の最終 case-close は新しい評価を始めず、事前の評価契約と蓄積済み証拠（Issue 本文の評価契約、各 PR 本文の実行条件・測定結果・証拠・評価結果）から最終結果を導出する。導出した最終評価結果は Issue 最終コメントを正規記録として記録する。実証Caseの最終 case-close の完了報告では正式化経路として req-define <実証Issue> を利用者へ明示する（Standard では Standard Issue、Epic では Epic Issue を指定）。Epic 中間Wave（残 Wave が存在する Wave クローズ）では正式化案内を出さない。case-close は後続 req-define を自動実行しない
- **`--delete-branch` 使用禁止**: PR マージ時に `--delete-branch` オプションを使用しない（アクティブ worktree で local 削除が失敗するため）。ブランチ削除は独立 STEP で実施
- **GitHub auto-close 回避**: commit message でコマンド名と Issue 番号を分離し、`#` 記号による近接参照を避ける

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-close command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
