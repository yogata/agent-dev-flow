---
description: inbox.mdから正規化、分類、8軸評価、自律確定・HITL確定を経て採用済み成果物を生成する
---

# 学びの正規化、評価、昇華判定と採用済み成果物生成

`.agentdev/learning/inbox.md` の学びエントリを読み込み、正規化、問題クラス分類、8軸評価、廃棄判定、既存対策確認、自律確定判定（一意に確定できる項目の自律確定）とユーザー判断が必要な項目のみの HITL 承認を経て採用済み成果物を生成する。

**重要**: `.opencode/` への直接配置、直接反映は行わない。
反映ルート: promoted → `/agentdev/backlog-review`（RU 生成）→ `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`。
旧 `learning-refine` の全機能を吸収済み（事前実行不要）。

## 入力

- `.agentdev/learning/inbox.md`（必須。未処理の学びエントリ）
- `.agentdev/learning/deferred.md`（任意。過去エントリ参照用）

## 出力

- `.agentdev/learning/evaluation-report.md`（8軸評価レポート、評価根拠中間成果物）
- `.agentdev/learning/promoted/{category}-{name}.md`（採用済み成果物）
- `.agentdev/learning/deferred.md`（inbox からの移動分を追記）
- `.agentdev/learning/inbox.md`（ヘッダーのみにクリア）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-learning-promote` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- `evaluation-report.md` は本コマンドが生成・管理する（外部コマンドの事前生成に依存しない）
- 採用済み成果物の受け渡しは `/agentdev/backlog-review` 経由とする（case-run への直接受け渡しは行わない。反映ルート: promoted → `/agentdev/backlog-review`（RU 生成）→ `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`）
- 主入力は `inbox.md` とし、raw learning item の再分類は行わない
- 既存対策を優先する（「新規X化」より「既存Xへ反映」を優先）
- 学びは直接 REQ 化せず、恒久契約（REQ/Decision/Design）への昇華可能性を判定工程で評価し、昇華可能なもののみ `promoted/` へ出力する。昇華不能な知見は保留プール（`deferred.md`）で維持する
- 一意に確定できる項目は自律確定し、ユーザー判断が必要な項目のみ HITL 対象とする。自律確定可否の詳細判定表は横断契約 Design「promote系判断確定とHITL境界」節が集約所有し、本コマンド定義と Workflow Skill は判定表を複製しない。自律確定はユーザー承認の擬制ではなく、deferred・未処理項目を自動削除しない安全境界は維持する
- adversarial-review は default-on（REQ-{NNNN}-{NNN}）: workflow の review STEP（発動条件判定 → review 呼出）を経て原則発動する。skip 条件（inbox.md 1件で重複確実、inbox.md 空）該当時は HITL へ従来フローを維持し、ユーザー明示要求時は skip 条件にかかわらず必ず発動する。共通契約（任意性、副作用禁止、再 review 条件、停止条件、呼出失敗時取扱い）は `agentdev-adversarial-review` Design（REQ-{NNNN}）が正規所有する

## ガードレール

否定規則は承認境界・state 破壊・書き込みスコープ等の硬い境界に限定する:

- `.opencode/` 直接反映は行わない（採用済み成果物は `.agentdev/learning/promoted/` のみに生成）
- ユーザー判断が必要な項目の判定、prune ともにユーザー承認なしには実行しない。一意に確定できる項目（横断契約 Design の詳細判定表に従う）はユーザー承認なしで自律確定する（`POL-promoted-artifact-requires-approval`）
- 旧昇格台帳等の管理用ファイルは生成しない
- 破壊的変更（inbox.md 全体強制クリア、大量エントリ一括削除等）は判定確定の承認とは別に明示承認を維持する（REQ）。自律確定によっても迂回されない（`POL-destructive-change-explicit-approval`）

## ユーザー確認ポイント、エラー処理

ユーザー確認ポイント、エラー処理表、各成果物のライフサイクルは `agentdev-learning-pipeline` を参照。主要項目のみ本節に抜粋する:

- **HITL（判定確定）**: ユーザー判断が必要な項目の廃棄判定結果、8軸評価スコアの確認、修正、承認（判断の確定、REQ）。一意に確定できる項目はユーザー承認なしで自律確定し、HITL 対象としない（判断確定の境界は横断契約 Design「promote系判断確定とHITL境界」節の詳細判定表に従う）
- **prune（永続化）**: prune は判定確定（自律確定またはユーザー承認）と同時に承認済みとみなし自動実行（REQ）。staged/rejected/duplicate の追加確認は不要
- **inbox.md 不在**: エラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」
- **git pull/push 失敗**: 構造化エラー表示して停止（push 失敗時は完了扱いにしない）
- **learning-promote の責務**: 正規化 → 分類 → 8軸評価 → 評価レポート生成 → 廃棄判定 → 自律確定判定（ユーザー判断が必要な項目のみ HITL）→ 採用済み成果物生成 → 移動処理 → prune。採用済み成果物は `/agentdev/backlog-review` 経由で RU 化後に `/agentdev/req-define` に合流する


