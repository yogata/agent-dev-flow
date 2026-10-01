<!-- ADF-COVERS(implementation): REQ-096-023 -->
# Wave 2: RA-002 配布command定義の HITL・自律確定表現更新（Case #3278 OU-004）

## 実行識別情報

- adf_case: #3280
- adf_execution_unit: standard
- adf_delegation: DEL-3284-1
- 対象 Issue: #3284
- ブランチ: `docs/issue-3284`
- worktree: `.worktrees/3284-docs`
- PR base: `main`
- 実装 commit: `258f9f6e`（9ファイル、+43/-21）

## 概要

Issue #3284（Epic #3280 Wave 2-3、RA-002）の実行契約に従い、6件の配布 command 定義とコマンドリファレンス索引の判断境界表現を正典（REQ-096 判定表・v4-responsibility-boundaries Design「ADF判断アーキテクチャ詳細基準」節）の新モデル語彙（判断方法3分類・確定権限3分類・原因別処理）へ更新した。工程構造・frontmatter・入出力契約は無変更（表現更新のみ）。

## 変更内容（9ファイル、+43/-21）

### 配布 command 定義（6件）

- `intake-promote.md`: 自律確定基準を「一意に確定」から確定権限3分類（正規契約からの導出・委譲された裁量）へ更新。HITL 対象を「人間に留保された判断が必要な item」へ統一（6箇所）。判定表参照を実在節「ADF判断アーキテクチャ詳細基準」節へ更新
- `learning-promote.md`: 同上（概要・不変条件・ガードレール・HITL確認ポイントの4箇所）。実在しない「横断契約 Design『promote系判断確定とHITL境界』節」への stale 参照を実在節へ解消
- `inspect-promote.md`: 「一意に確定」中心の自律確定規則を確定権限3分類へ更新。「意味判断・曖昧な分類を理由にした手動分類回し」をカテゴリ合致ベースの確定境界へ更新（TS-003 対象行の解消）。`--auto` 説明の「高確信度」を「自動 promote 対象カテゴリに合致する」へ統一（本文6箇所。frontmatter は無変更）
- `backlog-review.md`: 矛盾検出時の処置を原因別処理語彙（正規情報源間の解決可能な不一致=意味的な自動マージ禁止、未解決規範矛盾=人間判断へ移行）へ更新。REQ-096-020 に対応する統合・分割の判断境界（委譲された裁量と人間判断への移行条件）を不変条件へ追加
- `case-auto.md`: 停止条件「新しい意味判断が必要となった場合」を原因別処理語彙（正規情報源間の未解決規範矛盾の解消・人間に留保された新しい判断）へ更新（REQ-096 判定表基準。REQ-034-038 更新〔#3282〕合流後の語彙一致を担保）
- `req-define.md`: REQ-096-024（要件そのものの人間判断と、合意済み要件を具体化する委譲された裁量の分離）を不変条件へ明示

### 索引・トレーサビリティ

- `commands/agentdev/README.md`: inspect-promote 行の `--auto` 説明語彙を本文定義（カテゴリ合致）と整合
- `traceability/ra002-commands-correction.yaml`: 新規。commands 変更の implementation 対応（REQ-096-015/018/020/023/024。配布物境界により inline 直書き禁止・sidecar 宣言）
- `traceability/src-opencode-correction.yaml`: case-auto.md へ REQ-096-015 を追記（artifact パス × role 単位の単一情報源規約により既存 sidecar へ統合）

## 検証差分

| 実行工程 | 検証種別 | 検証結果 | finding 差分 |
|---|---|---|---|
| case-run | TS-003 スライス（rg、6 command 定義）: 難易度・確信度・結果状態・意味判断・一意解でないことを理由にした人間判断要求規則の残存検索 | pass（状態のみを理由とする人間判断要求規則 0件。frontmatter description の「高確信度」は人間判断要求規則に非該当・frontmatter 無変更制約対象。Findings 記載） | 新規: なし |
| case-run | TS-021 スライス (a)（rg、6 command 定義）: REQ-003-055/056 残存参照検索 | pass（残存 0件） | 新規: なし |
| case-run | TS-021 スライス (c)（rg、6 command 定義）: 「一意に確定」中心の自律確定語彙残存検索 | pass（残存 0件） | 新規: なし |
| case-run | UTF-8 健全性（node、6 command 定義）: BOM なし・CR なし・U+FFFD なし | pass（3条件とも 0件） | 新規: なし |
| case-run | textlint final gate（agentdev-textlint-guard gate.ts） | PASS（544 対象、hard violations 0件） | 新規: なし |
| case-run | targeted docs guard（check_changed_docs.ts --workflow case-run、--files 9件〔コミット前〕・--base-ref origin/main〔コミット後・push 前〕の2回実行） | pass（failures 0・warnings 0） | 新規: なし |
| case-run | content corruption checker（配布 command・skill 全体） | 検出 0件（invalid-unicode / foreign-script / simplified-chinese / stale-reference） | 新規: なし |
| case-run | check_command_format（配布 command 全体） | OK | 新規: なし |
| case-run | 配布依存境界 checker source profile（最終 gate） | pass（failures 0。scanned 286、concrete_id / concrete_path / fixed_url / producer_metadata hits すべて 0件） | 新規: なし |
| case-run | 配布依存境界 checker link profile（最終 gate） | worktree 構造制約により zero-targets（`.opencode/` に配布 junction 未配置）。REQ-018 worktree fallback 契約に従い source profile（source projection 全走査・failures 0）で代替成立 | 無効: link profile は環境制約により本実行では検査不能（メインリポジトリ側での別途実行候補。Findings 記載） |
| case-run | agentdev-traceability check --req REQ-096（本変更関連 10 行スコープ） | missing-design 増分 0件（0件維持）・missing-implementation 6件→2件（REQ-096-015/018/020/023/024 を implementation 宣言追加で解消）・duplicate-inconsistencies 1件→0件（情報源統合で解消）・malformed / unknown-roles / unknown-req-refs / invalid-artifact-paths / policy-invalid 0件 | 修正済み: REQ-096-015/018/020/023/024 の missing-implementation（sidecar 宣言追加）・duplicate-inconsistencies（単一情報源へ統合） |
| case-run | 同 check の main baseline 比較 | REQ-096-019/021 の missing-implementation（2件）と missing-verification（10件）は baseline から不変（pre-existing・増分 0件） | 既出: REQ-096 missing-implementation（#3283 スコープ分）・missing-verification（Findings 記載） |

## adversarial-review 非発動記録

- 判定理由: Issue #3284「adversarial-review 発動契約（任意）: 該当なし（ユーザー明示指定なし）」により非発動。発動条件はユーザー明示指定のみで、本委譲にも明示指定なし
- 代替自己反証（却下案）: promote系の RU 承認工程の自律確定範囲拡大（REQ-096-020 の許容活用）— 「工程構造・入出力契約は無変更」の実行契約に反するため却下（現行のユーザー承認工程を維持し、判断境界語彙のみ更新）
- unresolved な本質的争点・ユーザー判断事項: なし

## Findings / Capture候補

- `inspect-promote.md` frontmatter description に「高確信度」語彙が残存（frontmatter 無変更制約のため未更新）。本文・README は「自動 promote 対象カテゴリに合致する」へ統一済み。#3282 合流後の docs 側語彙統一（command Design・system.md 含む）で description を含めて統一する候補
- REQ-096-019・REQ-096-021 の missing-implementation が残置（実現面は `src/opencode/skills/**` 側 = #3283 スコープ）。`src/opencode/skills/**` にも「一意に確定」語彙が残存（10ファイル程度、同スコープ）
- REQ-096 全行（現行30行）の missing-verification 10行分が main baseline で既出（pre-existing）。policy optional 登録は REQ-096 の検証スコープ設計判断を伴うため本 Issue スコープ外
- REQ-034-038（main 現行は旧語彙「新しい意味判断が必要となった場合」）と case-auto.md 更新後語彙は REQ-096 判定表（原因別処理対応表）基準で一致するため、#3282 合流後に不整合なし
- `traceability/src-opencode-correction.yaml` は REQ-094 用 component に REQ-096-015 が混在（単一情報源規約による統合の結果）。component 名と内容の再編は後続 sidecar 整理候補

## Design確定候補

- なし（表現更新のみで Design レベルの schema・判定表・内部アルゴリズムの新規確定候補は生じていない）

## 関連

- Parent: #3280（Epic Wave 2-3）/ Root Case: #3278（OU-004 実現面）
- 前提: #3281（Wave 1、PR #3285 merge 済み a6954a6f）
- 並行: #3282（docs/**・REQ-034-038 更新）、#3283（src/opencode/skills/**）
