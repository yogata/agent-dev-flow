# REQ-011-006 Local 実装 Tool の細目を Design へ記載する候補

## 観測

PR 2435 で Local 実装 Tool（`src/opencode-local/agentdev-gh-cli/runner-local.ts`）を実装した。操作契約は GitHub 実装と同一だが、Local 実装固有の細目が Design に未記載である:

- `pr_create` の対象が最新 Case ファイル（新規採番ではない）
- `issue_update` が全文置換であり、updated_at の更新は呼び出し側の責務
- status → state の写像規則
- 出力 URL = 絶対パス識別子（GitHub 実装の https URL と対応）

## 今回扱わない理由

runtime-package-boundary.md / local-case-file.md への細目追記は Design 内容の変更（APPEND）であり、case-close の docs 編集範囲（status 昇格のみ）の外側。design-save 工程（または後続 Case）での対応が正規の手順。

## 影響

Local 実装の細目は runner-local.ts のコードと README からのみ把握可能。Design が操作契約の正規所有者である原則に対して、Local 固有の保証・失敗時意味が文書化されていない。

## レビューで決めること

- 記載先の配分（runtime-package-boundary.md か local-case-file.md か両方）
- 各細目の Design 記載レベル（契約として正規所有するか、実装詳細への参照にとどめるか）

## 根拠

- PR 2435 本文「Findings / Capture候補 > intake」item 2
- `src/opencode-local/agentdev-gh-cli/README.md`（実装側記述）
