# intake: REQ-096 の verification 対応宣言不在（30行 missing-verification）と実現面残余（missing-implementation 8行残存）の正規成果物化・残余整理候補

- 観測日: 2026-10-01
- 観測元: Epic #3280 Wave 2 case-close Capture 回収（PR #3287・PR #3288 本文 Findings の統合。Issue #3283/#3284 で検出）
- 種別: 変更候補（検証スコープ設計判断を伴う REQ 整備）

## 内容

- REQ-096-001〜030 の全行が missing-verification（policy default required・verification 対応宣言なし）。恒常的な検証手段は Case #3278 側 durable state（draft test_strategy TS-001〜023・AC別記録）であり、正規成果物としての verification 対応宣言は存在しない（PR #3287 Findings 第1項・PR #3288 Findings 第3項の同一主題を統合）。
- Wave 2 case-close のトレーサビリティ独立再検査（agentdev-traceability check --req REQ-096-001〜030 + REQ-090-024）の実測: main baseline では missing-implementation 25行 / missing-verification 30行。Wave 2 の 3 PR 変更後（#3283 worktree 実測）では missing-implementation 8行（REQ-096-010/014/021/025/027/028/029/030・すべて baseline 既存・新規増分 0）/ missing-verification 30行（不変）。PR #3288 の sidecar 宣言により REQ-096-015/018/020/023/024 の missing-implementation は解消済み（main 実測 4行 → worktree 0行）。
- policy optional 登録（REQ-096 の検証スコープ設計判断）は REQ-096 の検証設計を伴うため Wave 2 スコープ外と判断されており、正規対応は後続の REQ 整備として実施する。
- 期待する状態: (1) REQ-096 全行の verification 対応の正規成果物化（AC別記録の恒久化または policy optional 登録の設計判断）を REQ 整備候補として起案する。Wave 3 検証フェーズ（AC-1〜23 集約・case-close QG-4）の結果を入力として扱う。(2) missing-implementation 残存 8行（010/014/021/025/027/028/029/030。case-run/case-revise/case-open 本体・T2 境界・横断原則行）の対応要否を Wave 3 最終 close の完了判定材料として整理する。

## 再導出手段

- PR #3287 本文「Findings / Capture候補」第1項・PR #3288 本文同セクション第2〜3項を参照。
- 再実験: `bun src/check.ts --root <repo-root> --req REQ-096-001,...,REQ-096-030,REQ-090-024`（agentdev-traceability scripts。--req はカンマ個別列挙）で missing 系の現在値を再取得可能。
- 関連: traceability/policy.yaml（default required）、REQ-096、Epic #3280 Wave 3（検証フェーズ）。
