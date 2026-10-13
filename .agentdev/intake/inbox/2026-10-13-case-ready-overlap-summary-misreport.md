# accept_definition_checks の overlap 要約生成が報告 JSON の condition_a.warnings を読まず常に warnings=0 と表示する

## 観測

case-ready STEP-1 受入検査 script（accept_definition_checks.ts）の overlap-cross-check step は、engine 報告 JSON を JSON.parse した上で top-level warnings フィールドの長さで要約文字列（warnings=N）を生成する。横断依存検査エンジンの報告契約（cross_dependency_types.ts CrossDependencyInspectionReport）は警告を condition_a.warnings にネストしており top-level warnings は存在しないため、要約は engine が警告を返しても常に warnings=0 になる。Case #3682 の受入検査で engine 報告に condition_a warnings=1（#3679 と #3686 の同一パス重複）が含まれる一方、summary は warnings=0 を表示した（step detail の stdout 全文で機械確認済み）。

## 影響

summary は step detail（stdout 全文・終了コード）と併存する補助情報であり、gate 判定（終了コード 0・警告はゲート遷移に影響しない）は正しく機能する。ただし summary を読む消費者は警告の存在を取り逃し、横断依存検査の警告提示記録（case-ready 完了報告の記載要件）が欠落し得る。

## レビューで決めること

- 修正方針: 要約生成を parsed.condition_a.warnings.length と parsed.detection_unavailable.length から構成する（要約文字列の契約を報告 JSON 構造に合わせる）
- テスト: warnings 1 件の engine 報告を入力した要約生成の回帰テストを accept_definition_checks.test.ts へ追加するか
- Issue #3680（同 script の git status 列解析修正）との同時取り扱い（同一ファイルのため競合調整）

## 根拠（任意）

- 観測元: Case #3682（case-ready STEP-1 受入検査、2026-10-13）
- 証拠: 受入検査報告 JSON の overlap-cross-check step detail（summary: warnings=0、stdout 全文の condition_a.count: 1）
- 関連: src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（overlap 要約生成）、src/common/skills/agentdev-workflow-case-open/scripts/lib/cross_dependency_types.ts（報告契約）、Issue #3680
