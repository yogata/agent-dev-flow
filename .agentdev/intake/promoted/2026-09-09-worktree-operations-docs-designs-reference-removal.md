# 配布物からの docs/designs/ 参照除去（worktree-operations.md L146）

## 観測内容

- 発生源: PR 2745（Issue 2735 / Epic 2734 W1）の Findings を回収。PR 2749（Issue 2737 / W3）・PR 2750（Issue 2738 / W4）の Findings も同一対象のため統合
- capture 元: case-close Epic Wave 1（Epic 2734、delegation DEL-2734-close-w1）、同 Wave 3/4 境界（delegation DEL-2734-close-w34）
- captured_at: 2026-09-09（W3/W4 追記: 2026-09-10）

IR-055 既出違反: `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` L146 が `docs/designs/local/runtime-package-boundary.md`「本体リポジトリ sync」節を参照している（runtime-unresolved-reference、heuristic/warning）。2026-09-11 時点の現行突合で参照は現存を確認。

Wave 5（PR 2751 マージ 1b1678b1）で IR-055 baseline が最終状態へ再生成され、本参照は既知 delta（heuristic）として baseline 登録済みとなった（実行記録 req-053-textlint-wave5-final-verification.md 第 5.2 節の判断根拠: CR-001 表層是正禁止と対象範囲制約下での baseline 登録選択）。integrity suite の IR-055 new violations は 0。

## 影響・課題

- 配布物から repo 内部設計文書（docs/designs/）を参照しており、配布先プロジェクトでは解決不能な参照となる（IR-055 の趣旨に抵触）
- baseline 登録により検査は通過しているが、是正しない限り既知 delta として残存する

## 後続判断に残る選択肢

- 参照形式の是正（表現解消）を選ぶ場合: 対象行の書き換えと IR-055 baseline エントリの併せた除去が必要
- baseline 登録のまま維持する場合: 本 item の残処置なし（backlog-review で RU 化しない判断も含む）

## 既存要件・契約との関連

- REQ-002（配布成果物の責務境界）、REQ-053（文書と配布物の文章品質契約）
- docs/designs/integrity/docs-spec-rebuild-integrity.md、IR-055
