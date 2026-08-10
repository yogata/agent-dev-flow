---
title: learning-promote evaluation report
generated_at: 2026-08-10T09:55:00+09:00
generator: /agentdev/learning-promote
target_population:
  inbox: 6
  deferred: 32
  total: 38
adversarial_review:
  invoked: true
  route: D
  reviewer: oracle
  accepted_findings: 9
  unresolved_disputes: 2
  review_reflected: true
  return_loop_count: 1
---

# learning-promote evaluation report

本報告は `/agentdev/learning-promote` の内部評価フェーズ成果物である。inbox.md 6件と deferred.md 既存32件の全母集団で再分類・再評価した結果（adversarial-review 反映後）。

## 全体傾向と問題クラス分類

### 横断テーマ（参照用メモ、問題クラスではない）

inbox 6エントリには関連テーマとして観察可能な横断傾向がある。ただし問題クラス分類基準（根本原因・再発条件・予防策の3要素一致、最小2エントリ）を満たすクラスタは形成しない。テーマ記述にすぎない。

- **大規模 rename 移行時のスコープ管理**: エントリ2（skill rename SPEC 対称性）、エントリ3（docs/guides 配下参照）、エントリ4（IR-* 検出ルール ADR 残存）で観察。原因・再発条件・予防策は異なり、3要素一致基準では同一問題クラス不可。個別評価する。
- **Windows + PowerShell でのエンコーディング問題**: エントリ1（gh CLI --body-file 本文化け）と deferred.md にある PowerShell パイプライン経由読み取り、Issue 本文 LF 圧縮、スクリプトエンコーディング破損等の既存事例で観察。ただし根本原因（--body-file decode 経路 vs パイプライン経路 vs 文字列変数 vs ビルドパイプライン）は異なり、3要素一致基準では同一クラスタ不可。
- **worktree + Windows 環境**: エントリ5（worktree パス慣例）と deferred.md の worktree ジャンクション関連事例で観察。根本原因は異なる。

### 問題クラス分類結果

inbox 6エントリは全て「未分類（単独）」として個別評価する。deferred.md 32件の既存エントリと3要素一致する新クラスタは形成しない（個別照合済み）。

## エントリ1: Windows PowerShell で gh pr create --body-file が多重エンコード化け

### 正規化データ

- **ソース**: inbox.md entry 1
- **観察事実**: Windows PowerShell で `gh pr create --body-file` を実行した際、本文が多重エンコード化け。`gh api` PATCH で修復。
- **関連PR/Issue**: 未記録
- **タグ**: `#windows #encoding #gh-cli #write-procedure #verify`

### 問題クラス分類

- **分類**: 未分類（単独）
- **根本原因**: Windows 環境で `gh --body-file` 経路の本文が破損。破損層（PowerShell 文字コード, Node.js stdin, gh CLI decode 経路）は再現確認がなく未確定。
- **再発条件**: Windows PowerShell で本文 WRITE を実行する全手順。
- **予防策**: 既存 VERIFY（本文読み戻し必須、verify.md line 3/36）で検出可能。VERIFY 失敗時の復旧方針は未整備。

### 8軸評価（再採点）

| 軸 | スコア | 理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件観測 |
| 影響度 | 3/5 | 中（本文化けは PR 可読性低下、即座に気づけば修復可能）|
| 横展開性 | 3/5 | Windows 全 WRITE で発生し得るが、1件観測・1件非観測で中程度 |
| 反映先明確度 | 4/5 | 既存 VERIFY 特定済。復旧方針は agentdev-gh-cli retry.md / standard-procedures.md |
| 自動化適性 | 2/5 | 現行 retry.md は自動代替禁止（line 20）。復旧方針の文書化中心 |
| プロジェクト固有知識再利用性 | 4/5 | 高い（Windows + gh CLI 固有）|
| 再発可能性 | 3/5 | Windows 環境で継続的に発生し得るが、VERIFY で検出可能 |
| 費用対効果 | 3/5 | 復旧方針文書化は低コストだが効果は限定的 |
| **加重合計** | **23/40** | |

### 禁止条件フィルタリングゲート

- 通過。技術判断（復旧方針設計）を含み、運用ルール・command仕様のみではない。

### ADR 候補除外判定

- 除外。技術手順の整備であって、アーキテクチャ判断ではない。

### 廃棄判定

- **staged（限定版）** or **deferred（unresolved 1）**
- 限定内容: 「自動 API PATCH 導入」ではなく「再現条件確定と VERIFY 失敗時の復旧方針決定」へ限定
- 既存対策照合: verify.md（VERIFY 必須、既存）/ retry.md（代替手段自動実行禁止、停止・ユーザー報告要求、既存）
- ギャップ: fix gap（persistent failure の復旧方針未整備）
- 反映先候補: `src/opencode/skills/agentdev-gh-cli/references/retry.md`（復旧方針セクション）、`src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`

### unresolved 争点 1

現行「再試行後停止・報告」を維持するか、本文用 API PATCH を明示的な自動復旧経路として設計候補にするか。ユーザー判断事項。

## エントリ2: skill rename 時の src/ と docs/specs/skills/ の対称性担保

### 正規化データ

- **ソース**: inbox.md entry 2、Wave 2 #2034
- **観察事実**: skill rename 時、`src/opencode/skills/{old}` ↔ `docs/specs/skills/{old}` の対称性と frontmatter id, Artifact Graph node 関係の全体管理手順が不明瞭だった。
- **関連PR/Issue**: #2034
- **タグ**: `#skill-rename #spec-symmetry #inspect-skills #artifact-graph #migration`

### 問題クラス分類

- **分類**: 未分類（単独）
- **根本原因**: skill rename 実行時に `src/opencode/** ↔ docs/specs/**` の対称性検査が deterministic に走査されない。repo-local targeted docs guard の実装ギャップ。
- **再発条件**: skill rename を伴う作業。
- **予防策**: repo-local targeted docs guard（targeted-docs-guard-implementation.md）への観点追加。配布 skill への固定内部 path 持ち込みは境界（REQ-002）と衝突するため不可。

### 8軸評価

| 軸 | スコア | 理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（#2034）|
| 影響度 | 2/5 | rename 完了までに気づけば解消可能。targeted docs guard が既存 |
| 横展開性 | 3/5 | 将来の skill rename で再発 |
| 反映先明確度 | 3/5 | 候補: targeted-docs-guard-implementation.md, repo-agentdev-integrity |
| 自動化適性 | 3/5 | targeted docs guard への観点追加で自動化可能 |
| プロジェクト固有知識再利用性 | 4/5 | repo-local 固有 |
| 再発可能性 | 3/5 | 次回 skill rename で再発 |
| 費用対効果 | 3/5 | targeted docs guard 観点追加は低コスト |
| **加重合計** | **22/40** | |

### 禁止条件フィルタリングゲート

- 通過。deterministic な検査拡張（実装ギャップ）を含む。

### ADR 候補除外判定

- 除外。repo-local 検査仕様の拡張であってアーキテクチャ判断ではない。

### 廃棄判定

- **staged（repo-local）**
- 既存対策照合: `docs/specs/integrity/targeted-docs-guard-implementation.md`（repo-local targeted docs guard の契約、既存）
- ギャップ: guardrail insufficiency（skill rename 時の src ↔ docs/specs/skills 対称性走査が契約に明示されていない）
- 反映先候補: `docs/specs/integrity/targeted-docs-guard-implementation.md`、`src/opencode/skills/repo-agentdev-integrity/SKILL.md`

## エントリ3: docs/adr/ 削除時の guides/ 配下参照更新スコープの初期漏れ

### 正規化データ

- **ソース**: inbox.md entry 3、Wave 3a #2035
- **観察事実**: `docs/adr/` 削除時に案内層（`docs/guides/`）を独立 consumer としてスコープに入れておらず、broken link が残った。
- **関連PR/Issue**: #2035
- **タグ**: `#broken-link #guides-scope #案内層 #change-impact #migration`

### 問題クラス分類

- **分類**: 未分類（単独）
- **根本原因**: ディレクトリ削除・rename 実施時に、案内層（`docs/guides/**`）を独立 consumer としての網羅走査対象に入れていなかった。Wave 分解時の consumer 明示基準が不明瞭。
- **再発条件**: ディレクトリ削除・rename を伴う大規模移行。
- **予防策**: 旧参照（`docs/adr/` 等）の全体走査をディレクトリ削除前チェックとして標準化。ただし既存 `check-change-impact.ts` は「実際に変更された path が allowed list 外か」だけを検査し、未変更 path（`docs/guides/**`）は入力に現れないため、allowed list へ追加しても漏れを検出できない。代替予防策は旧参照全体走査、期待更新対象導出、IR-057 相当の obsolete path 検出のいずれか。

### 8軸評価

| 軸 | スコア | 理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（#2035）|
| 影響度 | 3/5 | 案内層 broken link は移行完了までに気づけば解消 |
| 横展開性 | 3/5 | ディレクトリ削除・rename で再発 |
| 反映先明確度 | 3/5 | 候補: IR-057, workflow-lifecycle, artifact-validation |
| 自動化適性 | 2/5 | check-change-impact では検出不可。旧参照走査の標準化が必要 |
| プロジェクト固有知識再利用性 | 3/5 | 中程度 |
| 再発可能性 | 3/5 | 次回ディレクトリ削除・rename で再発 |
| 費用対効果 | 3/5 | 旧参照走査の標準化は低コスト |
| **加重合計** | **21/40** | |

### 禁止条件フィルタリングゲート

- 通過。deterministic な検出拡張（旧参照走査標準化）を含む。

### ADR 候補除外判定

- 除外。検出・運用手順の拡張であってアーキテクチャ判断ではない。

### 廃棄判定

- **staged or deferred = unresolved 2**
- 既存対策照合: `check-change-impact.ts`（実際に変更された path が allowed list 外かのみ検査。未変更 path は入力に現れないため漏れ検出不可）
- ギャップ: fix gap（予防策の再設計が必要）
- 反映先候補: `docs/specs/integrity/rules/IR-057-*`（obsolete path 検出）、`src/opencode/skills/agentdev-workflow-lifecycle/`（Wave 分解時の consumer 明示基準）

### unresolved 争点 2

全母集団との再分類後も新規性を持つ場合、独立 staged とするか、既存検出策の application miss として deferred にするか。ユーザー判断事項。

## エントリ4: 横断 grep パターン設計の改善余地 — REQ/ADR ID 形式の多様性（IR-005/036/055 ADR 残存）

### 正規化データ

- **ソース**: inbox.md entry 4、Wave 3b/4
- **観察事実**: ADR → Decision 移行後も検証ルール IR-005, IR-036, IR-055 が ADR 語彙・旧責務のまま残存。IR-055 は Decision ID と説明しながら正規表現が `ADR-\d{4}` のまま。
- **関連PR/Issue**: 別 Issue で対応予定（残留リスクとして明記）
- **タグ**: `#grep-pattern #detection-rules #id-format #検証基盤 #migration`

### 問題クラス分類

- **分類**: 未分類（単独）
- **根本原因**: ADR → Decision の大規模 rename 移行時に、検証ルール（IR-*）自体の移行対象網羅を管理するチェックリストが不明瞭。現在進行中の検証基盤 false negative。
- **再発条件**: 現在進行中（IR-005/036/055 に ADR 残存、ADR 参照を検出できず）。
- **予防策**: IR-005/036/055 の Decision 移行。`check_integrity.ts` の対応。

### 8軸評価

| 軸 | スコア | 理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（ただし現在進行中のギャップ）|
| 影響度 | 4/5 | 検証基盤の false negative。ADR 参照残存を検出できず |
| 横展開性 | 4/5 | IR-* ルール網羅性は全 rename 移行で問題 |
| 反映先明確度 | 5/5 | 特定済: IR-005, IR-036, IR-055, check_integrity.ts |
| 自動化適性 | 4/5 | IR ルールファイルの修正 + checker テストで容易 |
| プロジェクト固有知識再利用性 | 4/5 | AgentDevFlow の integrity 基盤固有 |
| 再発可能性 | 4/5 | 現在進行中で未解決 |
| 費用対効果 | 5/5 | IR ルール修正は低コストで即効果 |
| **加重合計** | **31/40** | |

### 禁止条件フィルタリングゲート

- 通過。deterministic な検証ルール修正を含む。

### ADR 候補除外判定

- 除外。検証ルールの実装修正であってアーキテクチャ判断ではない。

### 廃棄判定

- **staged（高優先）**
- 既存対策照合: IR-005, IR-036, IR-055（共に ADR 残存中）、`check_integrity.ts`
- ギャップ: fix gap（現在進行中の false negative）
- 反映先候補: `docs/specs/integrity/rules/IR-005-adr-req-bidirectional-reference.md`、`docs/specs/integrity/rules/IR-036-adr-work-means-detection.md`、`docs/specs/integrity/rules/IR-055-runtime-unresolved-reference.md`、`src/opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`

## エントリ5: worktree パス慣例の明確化 — .worktrees/ vs .agentdev/worktrees/

### 正規化データ

- **ソース**: inbox.md entry 5
- **観察事実**: `.worktrees/`（repo root）と `.agentdev/worktrees/` のどちらが正規か慣例明確化の余地があった。実装上は誤認なく使用。
- **関連PR/Issue**: なし
- **タグ**: `#worktree #path-convention #harness-runtime #domain-state #charter`

### 問題クラス分類

- **分類**: 未分類（単独）、duplicate 候補
- **根本原因**: worktree 配置パスの慣例明確化（実害なし）。
- **再発条件**: 新規参加者が worktree 配置パスに迷う可能性。
- **予防策**: 既存（agentdev-git-worktree SKILL.md line 16、`.gitignore` line 10、REQ-002-024）で実質カバー済み。

### 既存対策との照合（duplicate 判定根拠）

| 既存対策 | 箋所 | 状態 |
|---|---|---|
| worktree 正規パス明記 | `src/opencode/skills/agentdev-git-worktree/SKILL.md` line 16（`.worktrees/{N}-{type}`）| 既存 |
| `.worktrees/` ignore 登録 | `.gitignore` line 10 | 既存 |
| runtime workspace 管理は harness 責務 | `docs/requirements/REQ-002.md` REQ-002-024 | 既存 |

DEC-001 自体は `.worktrees/` を直接規定しない（charter 原則という説明は撤回）。

### 廃棄判定

- **duplicate**
- 既存対策: SKILL.md / .gitignore / REQ-002-024 で実質カバー済み
- ギャップ: なし
- 新規付加価値（3層早見表）は単独昇華には軽微

## エントリ6: v2: 履歴参照保護の運用成功（AG-010、大規模 rename 移行事例）

### 正規化データ

- **ソース**: inbox.md entry 6
- **観察事実**: ADR → Decision 移行で v2:ADR-* 履歴参照52件を破壊なく維持。成功要因3点（v2: prefix 構文的分離、文字列一括置換禁止8分類、Artifact Graph node_type 区別）。
- **関連PR/Issue**: なし（成功事例の記録）
- **タグ**: `#v2-history #ag-010 #rename-migration #成功事例 #artifact-graph`

### 問題クラス分類

- **分類**: 未分類（単独）、成功事例
- **根本原因**: 該当なし（成功事例）
- **再発条件**: 将来の ID 形式変更を伴う大規模 rename 移行。
- **予防策**: REQ-001-008（識別子不変）、012〜015（廃止文書・履歴情報）、DEC-009 AG-010/016（移行固有契約）で本質カバー。docs/guides/project-docs-and-specs.md に v2 prefix と tag の案内あり。汎用移行 playbook（他 ID 形式変更時の再利用手順）は未整備。

### 8軸評価

| 軸 | スコア | 理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（成功事例）|
| 影響度 | 3/5 | 成功事例の再利用価値。軸定義（発生時の被害）とは異なるが low-pri 記録価値 |
| 横展開性 | 3/5 | 将来の ID 形式変更で再利用可能 |
| 反映先明確度 | 3/5 | 候補: docs/guides/artifacts-and-state.md（再利用手順未整備）|
| 自動化適性 | 1/5 | 成功事例の記録であり自動化対象外 |
| プロジェクト固有知識再利用性 | 4/5 | 高い（v2: 履歴保護パターンの再利用）|
| 再発可能性 | 3/5 | 将来の ID 形式変更で再利用機会 |
| 費用対効果 | 2/5 | playbook 整備はコスト対効果限定的（low-pri）|
| **加重合計** | **20/40** | |

### 禁止条件フィルタリングゲート

- 該当なし（成功事例の記録）。ただし ADR 候補除外。

### ADR 候補除外判定

- 除外。既存 DEC-009 AG-010/016 + REQ-001-008/012〜015 で本質カバー。playbook 整備は記録整備であってアーキテクチャ判断ではない。

### 廃棄判定

- **deferred（理由修正版）**
- 既存対策: REQ-001-008/012〜015（一般原則）+ DEC-009 AG-010/016（移行固有契約）。docs/guides/project-docs-and-specs.md に v2 prefix 案内あり。
- ギャップ: なし（本質カバー）。汎用移行 playbook は未整備だが low-priority。
- 旧評価の誤り訂正: REQ-001-056〜064 は accepted Decision の意味的不変性・関係・健全性であって v2 履歴保護そのものではない。正しくは REQ-001-008/012〜015。

## adversarial-review 反映記録

### 発動概要

- 経路: D（learning-promote 内部）
- 発動条件: inbox 6件、skip 条件（REQ-015-003）非該当、command は default-on（REQ-015-002）
- reviewer: oracle
- accepted findings: 9
- unresolved disputes: 2

### accepted findings の反映状況

| ID | 内容 | 反映 |
|---|---|---|
| F-01 | deferred.md を参照対象外とした Phase 2 違反 | 反映済み。全母集団（inbox 6 + deferred 32 = 38）で再分類・再評価 |
| F-02 | クラスタ1（エントリ2,3,4）の3要素不一致 | 反映済み。クラスタ解体、エントリ2,3,4 を個別評価。「全体傾向」セクションへ横断テーマ移動 |
| F-03 | エントリ1根本原因の限定 | 反映済み。根本原因「破損層未確定」へ限定。staged 内容を「自動 PATCH 導入」→「再現条件確定と復旧方針決定」へ変更 |
| F-04 | エントリ2の repo-local 反映先 | 反映済み。反映先を targeted-docs-guard-implementation.md / repo-agentdev-integrity へ |
| F-05 | エントリ3 check-change-impact 改修案撤回 | 反映済み。予防策を「旧参照全体走査、期待更新対象導出、IR-057 相当」へ差替 |
| F-06 | エントリ4の独立 staged | 反映済み。IR-005/036/055 + check_integrity.ts の Decision 移行残存を具体的ギャップとして記載 |
| F-07 | エントリ5 duplicate | 反映済み。.gitignore line 10 既登録、SKILL.md line 16 既明記、REQ-002-024 既存を根拠 |
| F-08 | エントリ6 REQ-001 行番号訂正 | 反映済み。REQ-001-008/012〜015 + DEC-009 AG-010/016 へ訂正 |
| F-09 | prune 証拠保存計画 | 反映済み。後述「prune 計画」で source entry ごとの証拠保存を明示 |

### unresolved disputes（既存 HITL Step 10 へ振向け）

1. **エントリ1**: 現行「再試行後停止・報告」を維持するか、本文用 API PATCH を明示的な自動復旧経路として設計候補にするか
2. **エントリ3**: 全母集団との再分類後も新規性を持つ場合、独立 staged とするか、既存検出策の application miss として deferred にするか

これらは既存 HITL（Step 9-10）のユーザー判断事項であり、adversarial-review を新規ゲート化するものではない。REQ-014-009 により、unresolved 解消前に prune・commit/push へは進まない。

## 廃棄判定サマリ

| エントリ | 加重合計 | 廃棄判定 | 既存対策 | ギャップ |
|---|---|---|---|---|
| 1（gh CLI 本文化け） | 23/40 | **deferred**（現行 retry.md 維持、再発時再評価）| verify.md / retry.md | なし（現行 retry.md で対応）|
| 2（skill rename SPEC 対称性） | 22/40 | staged（repo-local）| targeted-docs-guard-implementation.md | guardrail insufficiency |
| 3（docs/guides スコープ） | 21/40 | **deferred**（IR-057 拡張で対応候補、再評価時まで保留）| check-change-impact.ts（漏れ検出不可）| なし（IR-057 拡張で対応候補）|
| 4（IR-* ADR 残存） | 31/40 | staged（高優先）| IR-005/036/055（ADR 残存中）| fix gap（現在進行中 false negative）|
| 5（worktree パス慣例） | - | duplicate | SKILL.md / .gitignore / REQ-002-024 | なし（実質カバー済み）|
| 6（v2: 履歴参照保護成功事例） | 20/40 | deferred（理由修正）| REQ-001-008/012〜015 + DEC-009 AG-010/016 | なし（本質カバー。playbook 未整備は low-pri）|

### 処分件数（ユーザー承認済み、2026-08-10）

- staged: 2件（エントリ2, エントリ4）
- deferred: 3件（エントリ1, エントリ3, エントリ6）+ 既存32件 = 35件
- duplicate: 1件（エントリ5）
- rejected: 0件
- unresolved: 0件（ユーザー判定確定済み）

## prune 計画（source entry ごとの証拠保存）

prune 対象は staged / rejected / duplicate（F-09 要件: source entry ごとの証拠保存）。

### duplicate（エントリ5）の証拠保存

prune 前に promoted artifact は生成しないが、削除対象 source entry の根拠を evaluation-report の本セクションに保存する。

- **title**: worktree パス慣例の明確化 — .worktrees/ vs .agentdev/worktrees/
- **観測事実**: `.worktrees/`（repo root）と `.agentdev/worktrees/` のどちらが正規か慣例明確化の余地。実害なし。
- **関連PR/Issue**: なし
- **対象 path**: 該当なし（慣例明確化が目的）
- **再発条件**: 新規参加者が worktree 配置パスに迷う可能性
- **duplicate 根拠**: SKILL.md line 16 / .gitignore line 10 / REQ-002-024 で実質カバー済み

### staged（エントリ2, 4）の証拠保存

採用済み成果物（`.agentdev/learning/promoted/{category}-{name}.md`）の「元 learning item / 根拠」セクションに、各 source entry ごとの証拠を保存する。エントリ1, 3 はユーザー判定で deferred となったため本セクションの対象外（deferred.md へ移動）。

- **エントリ2**（採用済み成果物: `integrity-skill-rename-src-spec-symmetry-guard.md`）:
  - title: skill rename 時の src/ と docs/specs/skills/ の対称性担保
  - 観測事実: skill rename 時に src ↔ docs/specs/skills 対称性の全体管理手順が不明瞭
  - 関連PR/Issue: #2034
  - 対象 path: `docs/specs/integrity/targeted-docs-guard-implementation.md`, `src/opencode/skills/repo-agentdev-integrity/SKILL.md`
  - 再発条件: skill rename を伴う作業
- **エントリ4**（採用済み成果物: `integrity-ir-detection-rules-decision-migration.md`）:
  - title: 横断 grep パターン設計の改善余地 — IR-005/036/055 ADR 残存
  - 観測事実: ADR → Decision 移行後も IR-005/036/055 が ADR 語彙・旧責務のまま残存
  - 関連PR/Issue: 別 Issue で対応予定（残留リスク明記）
  - 対象 path: `docs/specs/integrity/rules/IR-005-*`, `IR-036-*`, `IR-055-*`, `src/opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
  - 再発条件: 現在進行中（未解決）

## 反映ルート（ステージング後）

```
promoted/ → /agentdev/backlog-review → /agentdev/req-define → /agentdev/req-save → /agentdev/spec-save（SPEC候補）→ /agentdev/case-open → /agentdev/case-run
```

- staged 3件（エントリ1, 2, 4）は `promoted/` へ採用済み成果物を生成後、`/agentdev/backlog-review` 経由で RU 化
- `case-run` への直接受け渡し禁止
- `.opencode/` や実装コードへの直接反映禁止（G01）
