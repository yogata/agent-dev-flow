# IR-055 warning total 57 が warning_total_cap 53 を超過（ratchet 違反・検査ゲート機能不全）

- **分類**: inspect finding promote（F-07・severity medium・confidence high〔起因特定は medium〕）
- **由来**: inspect-docs finding 20261002T154006Z（backlog-auto stage 1・check_integrity.ts 機械的検出）

## 観測（evidence・機械的検出）

- check_integrity.ts 実行結果: 「[NG] warning-total-cap: IR-055 warning total (57) exceeds warning_total_cap (53) in ir-055-baseline.json (ratchet: increases require --raise-warning-cap)」
- IR-055 の走査対象は src/opencode 配下のみのため、docs/ 配下の用語掃除（intake 3316）は直接原因になり得ない
- 直近 REQ-099 Wave 1〜3（PR #3326/#3330/#3331/#3332）の src/opencode 配下変更で heuristic warning 対象行が増加した可能性が高い（要明細確認）

## 影響課題

docs-check 全体が fail し続ける検査ゲートの機能不全状態。放置すると NG 検出のシグナル価値が失われる。

## 対応候補（契約上の正規手順）

1. IR-055 warning 明細の再取得（docs-check）と増加起因の特定
2. 増加が true positive なら該当箇所の是正、baseline-known なら provenance 付き baseline 追加
3. **cap 引上げは無条件に行わない**（integrity-contracts.md:365-367 契約: cap は純減方向のみ更新可能。増加は --raise-warning-cap 明示フラグ経由のみ）

## 既存要件関連

integrity-contracts.md「IR-055 warning 総数 ratchet」節・`.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json`

## 統合注記（backlog-review での統合判定候補）

なし（起因特定を含む単独対応。docs-check 系 baseline の取り扱いは「docs-check ルール／検査データ追加候補は独立 route とせず、採用済み成果物の要件化方向または受け入れ条件に含める」不変条件に従い RU 内で処理）。
