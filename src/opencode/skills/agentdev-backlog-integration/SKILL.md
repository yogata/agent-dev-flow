---
name: agentdev-backlog-integration
description: backlog-review の採用済み成果物（promoted artifact）統合、分割判定、矛盾検出、RU 生成、depends_on 依存解決、docs/knowledge/ 知識文書保存を含む backlog 自体の処置（重複・陳腐化した知識の削除、保留）の知識ベース。USE FOR: 採用済み成果物の統合・分割判定・矛盾検出、RU 生成ルール、depends_on 依存解決基準、分析メタデータ項目、docs/knowledge/ 知識文書保存の操作種別判定基準。DO NOT USE FOR: intake 抽出・promote、learning-promote の learning 固有の評価、REQ 構造診断、work_type 判定。
---

# バックログレビュー統合知識ベース（backlog-review）

backlog-review コマンドの統合判定知識ベースである。
採用済み成果物（promoted artifact）の読み込み、分析、RU への統合、分割判定、矛盾検出、RU 生成、depends_on 依存解決、docs/knowledge/ 知識文書保存を含む backlog 自体の処置（重複・陳腐化した知識の削除、保留）の判定基準と詳細構造を提供する。

## 対象コマンド

| コマンド | 目的 |
|----------|------|
| `.opencode/commands/agentdev/backlog-review.md` | 採用済み成果物を読み込み、分析し、統合、分割判定、矛盾検出を経て RU を生成する |

## 参考文献

| ファイル | 内容 |
|----------|------|
| `references/integration-judgment.md` | 成果物の読み込み、分析、統合分割判定、depends_on 依存解決、矛盾検出、RU 生成の判定ロジック。adversarial-review 候補判断と内部挿入（backlog-review）の実行時参照 |
| `references/learning-outcome-routing.md` | docs/knowledge/ 知識文書保存と backlog 自体の処置の契約（source type 非依存）。docs/knowledge/ 直接保存の手順、操作種別判定、ユーザー承認境界、git 永続化対象の副作用、成果物ライフサイクルの実行時参照 |

backlog-review コマンドの実行時投影先パスは `.opencode/commands/agentdev/backlog-review.md`。
command 本文内で backlog-review を参照する場合はこちらを使用。

## adversarial-review 候補判断と内部挿入（backlog-review）

本スキルは backlog-review（REQ-{NNNN}）における adversarial-review の候補判断基準と内部手続き（候補確定位置、呼出タイミング、矛盾検出への引き渡し）の実行時参照を提供する。
正規原本は `agentdev-backlog-integration` Design「adversarial-review 候補判断と内部挿入」節である（REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}）。
本 SKILL.md は重複定義せず、詳細は `references/integration-judgment.md`「adversarial-review 候補判断と内部挿入（backlog-review）」節を参照。

呼出元（backlog-review command）と本スキルの主な契約（詳細は Design と reference を正とする）:

| 契約 | 要件 | 概要 |
|---|---|---|
| 候補判断基準 | REQ-{NNNN}-{NNN} | review 対象は構成完了時点の RU 構成案。候補判断は補助情報であり自動発動根拠ではない |
| 候補確定位置 | REQ-{NNNN}-{NNN}/{NNN} | Step 4（統合・分割判定 + depends_on 解決）完了時点で RU 構成案を確定する |
| 呼出タイミング | REQ-{NNNN}-{NNN} | 構成（STEP-3）完了後、承認（STEP-5）前に挿入（順序の正は backlog-review command Design） |
| 矛盾検出への引き渡し | REQ-{NNNN}-{NNN} | review で指摘された矛盾は既存矛盾検出ロジックへ渡し、review 内で自動解決しない |
| 発動条件 | REQ-{NNNN}-{NNN} | ユーザー明示指定時のみ発動（順序、発動条件の正は backlog-review command Design） |
| 従来フロー維持 | REQ-{NNNN}-{NNN} | 条件非該当時、呼出失敗時は従来フローを維持（順序の正は backlog-review command Design） |
| 副作用境界 | REQ-{NNNN}-{NNN}/{NNN} | `semantic_review`（書き込み禁止型）、新規 artifact 非生成（正は adversarial-review Design、delegation-contracts Design） |
| accepted finding 反映 | REQ-{NNNN}-{NNN} | accepted finding の RU 構成案への反映は呼出元責務（正は adversarial-review Design） |
| 再 review 条件 | REQ-{NNNN}-{NNN} | 意味内容変更時のみ再発動可能、同一 finding 再起票禁止（正は adversarial-review Design） |
| unresolved 時の扱い | REQ-{NNNN}-{NNN} | unresolved 残時は不可逆処理へ進まない（正は adversarial-review Design） |
| 呼出失敗時の扱い | REQ-{NNNN}-{NNN} | silent skip 禁止、従来フロー維持（正は adversarial-review Design） |

## docs/knowledge/ 知識文書保存と backlog 自体の処置（backlog-review）

本スキルは backlog-review における docs/knowledge/ 知識文書保存と backlog 自体の処置（docs/knowledge/ 知識文書保存、重複・陳腐化した知識の削除、保留）の実行時参照を提供する。
backlog-review は promoted artifact を source type に依存しない共通モデルで分析し、docs/knowledge/ への知識文書保存へ処置すると判定した採用済み成果物（learning-promote が知識としての保存適否ありと判定して受け渡したものを含む。source type は問わない）を、利用者承認を経て docs/knowledge/ へ直接保存する正規昇華経路で処理する。当該書き込みは git 永続化対象の副作用である。
REQ / Decision / Design 反映、ガードレール移管、Project Extension 接続、通常の Issue による修正等の具体的実現先へのルーティングは learning 由来を含めて行わず、システム変更を必要とするものは RU として req-define へ渡す。source type をルーティング条件にしない。
正規原本はバックログ統合の要件が正規所有する backlog 自体の処置と docs/knowledge/ 直接保存の要件行であり、本節は配布物側の実行時参照である。詳細は `references/learning-outcome-routing.md` を参照。

## See Also

- **agentdev-workflow-lifecycle**: work_type 判定基準、フェーズ定義、前工程からの引き継ぎ（upstream handoff）判定
- **agentdev-intake-pipeline**: intake 抽出、promote 判定
- **agentdev-req-structure-diagnostics**: REQ 構造診断
