---
title: `agentdev-backlog-integration` Design
status: accepted
created: 2026-06-21
updated: 2026-07-18
---

# `agentdev-backlog-integration` Design

## 目的

backlog-review における採用済み成果物の統合、分割判定、矛盾検出、RU 生成、depends_on 依存解決の知識ベース。

## 適用対象

- 採用済み成果物（`.agentdev/intake/promoted/`、`.agentdev/learning/promoted/`、`.agentdev/inspect/promoted/`）の統合、分割判定
- 矛盾検出
- RU 生成ルール
- depends_on 依存解決

## 提供する判断、操作

- N:1 統合判定 / 1:N 分割判定
- 矛盾検出（矛盾する artifact を RU 化せずユーザーに確認、矛盾しない artifact は通常通り RU 化、partial success）
- RU 生成（frontmatter、構成、採番）
- depends_on 依存解決基準（RU-ID のみ許容、採用済み成果物パス指定不可）

## 参照する references

- `references/integration-judgment.md`

## 現在の動作

- `promoted/` 配下の artifact を読み込み、分析、統合、矛盾検出を経て RU を生成
- 採用済み成果物の単純コピー（パススルー）は禁止（REQ-008）
- 矛盾検出時の自動解決は行わない（ユーザー確認）
- depends_on に RU-ID のみ許容

## 対象外

- intake 抽出、promote（`agentdev-intake-pipeline` 担当）
- REQ 構造診断（`agentdev-req-structure-diagnostics` 担当）
- work_type 判定（`agentdev-workflow-lifecycle` 担当）

## 検証観点

- 統合/分割ロジックの正確性（N:1 / 1:N）
- 矛盾検出の網羅性
- RU スキーマの適合性（frontmatter、構成、採番）
- depends_on に RU-ID のみが指定されているか

## See Also

- [agentdev-intake-pipeline.md](agentdev-intake-pipeline.md)
- [agentdev-learning-pipeline.md](agentdev-learning-pipeline.md)
- [commands/backlog-review.md](../commands/backlog-review.md)
- [../workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)
- REQ-008（RU lifecycle）
- REQ-039（バックログ統合）

## adversarial-review 候補判断と内部挿入

本節は backlog-review 経路E（REQ-015）における adversarial-review の候補判断基準と内部手続き（候補確定位置、呼出タイミング、矛盾検出への引き渡し）を正典として所有する（REQ-014-011）。
共通 caller integration 契約の正規所有者は adversarial-review Design であり（REQ-014-003）、本節は domain skill 固有の判断基準、内部手続きのみを所有する。
挿入境界（発動条件、Step 構造、順序）の正規所有者は backlog-review command Design であり、本節は再定義せず参照する。

### 候補判断基準

backlog-review の review 対象は構成完了時点の RU 構成案（統合・分割判定結果、depends_on 解決結果、暫定分類付与結果）である。
adversarial-review 候補は次のいずれかを満たす RU 構成案を対象とする。

- 複数採用済み成果物を統合する RU（N:1 統合）で、統合理由の妥当性が self-evident でないもの
- 1成果物を複数 RU へ分割する（1:N 分割）で、分割境界の妥当性が self-evident でないもの
- depends_on 依存を含み、依存順序、循環性、並べ替え可能性に判断余地があるもの
- 暫定分類（tentative_classification）が複数候補から迷い得るもの

候補判断基準は review 対象の意味的型を整理するための補助情報であり、自動発動の根拠ではない。
発動条件はユーザー明示指定のみ（REQ-015-002）を正とし、候補該当の有無は従来フロー維持（REQ-015-003）に影響しない。

### 内部手続き

#### 候補確定位置

review 対象の RU 構成案は backlog-review command Step 4（統合・分割判定 + depends_on 依存解決）の完了時点で確定する。
候補確定前の暫定分類、未解決依存、未確定統合判定は review 対象としない。

#### 呼出タイミング

adversarial-review の呼出は、Step 4 完了後、Step 5（矛盾検出）開始前に挿入する（REQ-015-008 構成→review→承認の順）。
ユーザー承認（Step 4 承認 / Step 5 矛盾検出時追加判断）の前に review を実行し、review 結果を踏まえて承認段階へ進む。
呼出タイミングの正規所有者は backlog-review command Design であり、本節は参照レベルに留める。

#### 矛盾検出への引き渡し

adversarial-review 審議で採用済み成果物間の矛盾が指摘された場合、当該矛盾は本 Design「提供する判断、操作」節の矛盾検出ロジック、reference `integration-judgment.md`「矛盾検出 + ユーザー承認」節（既存矛盾検出）へ引き渡す。
adversarial-review 自身は矛盾を自動解決せず（REQ-015-008）、矛盾の判定、partial success 扱い、ユーザー追加判断への委ね（REQ-003-009）は既存矛盾検出ロジックが正である。

### 副作用境界と委譲契約

adversarial-review は delegation-contracts Design の `semantic_review`（書き込み禁止型）として適用する。
許可操作は `read_files`、`inspect_content`、`return_summary`、`return_evidence`、`return_artifact_body_when_requested` に限定し、`file_write`、`issue_pr_update`、`commit`、`push`、`user_confirmation` を forbidden とする（REQ-014-004）。
審議結果は中間成果として呼出元へ返却し、新規正規 artifact を生成しない（REQ-014-005）。

呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し（REQ-014-010）、利用不能を報告した上で従来フローと既存 QG/HITL を維持する。

### 正規所有者マトリックス参照

本節と adversarial-review Design「adversarial-review caller integration 共通契約」節（REQ-014-011）、delegation-contracts Design「adversarial-review との委譲契約接続」節、backlog-review command Design「adversarial-review 挿入境界（経路E）」節との間で意味の重複、矛盾を生じない。
挿入境界、発動条件、順序は backlog-review command Design を正とし、本節は domain skill 固有の候補判断基準、内部手続き（候補確定位置、呼出タイミング、矛盾検出への引き渡し）のみを所有する。

