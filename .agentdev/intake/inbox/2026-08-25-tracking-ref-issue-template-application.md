# Tracking: #N 参照形式の Case Issue テンプレート反映（Design確定候補の見送り）

## 観測

case-open Design に Case Issue 本文の元追跡Issue参照形式（`Tracking: #N`、`Parent: #N` と別形式）が定義された（PR 2441、docs/designs/commands/case-open.md「Case Issue 本文の元追跡Issue参照形式」節）が、Case Issue 記述テンプレート本体（src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_{feature,bug,epic,child}.md の4種）には Tracking 行の挿入規定・プレースホルダーが仍未反映。

## 今回扱わない理由

case-close（Wave 2 境界クローズ）の Design 確定チェックは最小限の確定事項反映が範囲。対象は配布物テンプレート4ファイル横断で、検証済み PR へのスコープ外追加（配布依存境界 gate・契約テストの再検証が必要）となるため範囲を超える。PR 2441 本文も「追跡Issue起点の req-define → case-open が初回動作する時点で design-save または case 側で確定する候補」と申し送り済み。なお委譲時に想定されていた templates/issue/standard.md は `/agentdev/issue` コマンドの完了報告テンプレートであり、当候補の対象ではない（対象不適合を確認済み）。

## 影響

追跡Issue起点の要件化（req-define → case-open）が初回動作するまでの間、Case Issue 本文の Tracking 行は Design 規定のみで運用される（テンプレートに挿入規定がないため、case-open が Design を直接参照して記載する必要がある）。

## レビューで決めること

- 4テンプレートへ追記する際の挿入位置（補足情報セクション等）と、追跡Issueを起源としない通常 Case Issue にプレースホルダーを残さない条件付き記述の形式（Design の記載対象規定に従う）

## 根拠

- PR 2441 本文「Design確定候補」1項目
- docs/designs/commands/case-open.md「Case Issue 本文の元追跡Issue参照形式」節（PR 2441 で追加、マージ 5b82687c）
- case-close Design 確定チェック結果（Issue 2439 対応記録コメント、見送り理由記録）
