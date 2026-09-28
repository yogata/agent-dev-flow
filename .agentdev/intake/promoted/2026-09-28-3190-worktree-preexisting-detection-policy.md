# worktree 内 checker 検出と main 側解消状況の突合規律（pre-existing AUTOGEN 陳腐化 4 件の解消記録に基づく）

- 元 item: .agentdev/intake/inbox/2026-09-28-3190-preexisting-autogen-staleness-resolved.md
- 観測元: case-close #3190（PR #3205）の Capture 回収
- 状態: 検出 4 件（docs/decisions/README.md 系 3 件・req-health-metrics 計測日 1 件）は PR #3207（merge 1fd42e08）で解消済み。case-close #3190 STEP-3 で merge 後 main（1084358d）の check_autogen_freshness 再実行 0 件を機械確認済み。2026-09-28 時点の静的検証でも req-health-metrics.md:152 計測日 2026-09-28・docs/decisions/README.md の DEC-046 反映を確認済み。新規再生成・修復対応は不要。

## 課題（残存する参照価値）

worktree で check_integrity full 走査等を実行する Case では、分岐以降に main 側で解消済みの pre-existing 違反が worktree 側に残留し得る。worktree 側検出を main 側の解消状況（並行 Case のマージ）と突合して pre-existing と解消済みを区別し、worktree 側で安易に再生成すると並行マージ済み修正と競合し得る。

## 既存知識との関連

- learning inbox #3211 IR-055 エントリ（host main 同一実測で pre-existing を証明する手順）と同型の帰属判定知見。本 item は AUTOGEN 再生成の競合リスクの側面を追加する。

## route 提示（backlog-review 判断用）

- docs/knowledge/ への知識文書化（docs-check 判定・worktree 検証運用）、または learning 系知見との統合。REQ 変更不要と推定。
