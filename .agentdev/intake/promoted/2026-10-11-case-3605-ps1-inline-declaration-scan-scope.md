# .ps1 の inline ADF-COVERS 宣言がトレーサビリティ機械走査の対象外であることの運用位置づけ明確化

## 観測内容

トレーサビリティコーパスの inline declaration 走査は拡張子 .md / .ts のみで、scripts/*.ps1 の inline ADF-COVERS(implementation) コメントは機械完全性検査（missing-implementation 等）に反映されない。Case #3605 で scripts/self-sync.ps1・scripts/install.ps1 の実装が支配する REQ 行（REQ-050-015、REQ-058-001/004/005/006/008/012）は、case-run 側で traceability/installer-host-projection.yaml sidecar への implementation 宣言追加（7 行）により初めて機械検査上充足した。既存の .ps1 inline 宣言コメント（runtime-package-boundary.md 側への移管を注記するコメントを含む。scripts/install.ps1・scripts/self-sync.ps1 に現存することを本 promote 実行時に確認済み）は参考表示なのか撤去対象なのか運用位置づけが未確定であり、宣言可能位置の正（sidecar）と .ps1 本文内コメントの関係が文書化されていない。

## 影響

.ps1 実装を含む Case で sidecar 宣言の追加漏れがあると missing-implementation が機械検査で表面化する（本件では case-run 側の検出で解消済み）。一方、.ps1 内の inline 宣言コメントが走査対象外のまま残ると、宣言の二重管理（Design .md 側宣言・sidecar・.ps1 コメント）が発生し、rename・移動時の追随漏れの温床になる。

## 課題（backlog-review → req-define 向け）

inline 宣言コメントの運用位置づけ（参考表示として維持するか、sidecar 正規配置への集約後に撤去するか）を決定し、トレーサビリティ走査スコープ（拡張子追加）か宣言配置規約（sidecar 集約の明示）かのどちらで解消するかを明文化する。REQ 行の新設は伴わない規約明確化のため、req-define 再合意を経る正規経路で評価する。

## 既存成果物との関連

- case-run 側の sidecar 追加（traceability/installer-host-projection.yaml）で機械検査上は解消済み。本件は宣言配置規約の明確化が課題
- PR #3612「Findings / Capture候補」（case-close STEP-6-4 Capture 回収。Case #3605、merge commit bec6fe53）

## 元 intake item（参照）

- .agentdev/intake/inbox/2026-10-11-case-3605-ps1-inline-declaration-scan-scope.md（本 promote 実行で削除）
- https://github.com/yogata/agent-dev-flow/pull/3612
