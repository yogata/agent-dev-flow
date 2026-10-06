# 採用済み成果物: temp 領域デバッグ残骸の削除基準・実施契機の合意（一時・退避先規律ファミリー）

## 観測内容

Case #3484（PR #3491）の case-run（TS-004 後片付け確認）で、`C:/WINDOWS/TEMP/opencode/` 配下に checker 証跡命名規約（`integrity-test-<uuid>`）に一致しない過去デバッグ作業由来の既存未追跡ファイル 13 件を確認（`ir071`、`ir071-debug`、`ir072-debug-*` 2 件、`ir072-final.{err,json}`、`ir072probe`、`ir072-rerun*` 系 6 件、`ra003-probe`、`ra004-final`）。実行担当は本 Case の生成物ではないため削除せず保持した。adversarial-review 時点の実測でも 13 件は現存し、領域全体は 2201 エントリに成長、規約外名前が多数残存する。

## 影響

- 証跡退避に使う領域の判別性が低下し、無関連ファイルが有用な証跡と混同するリスクがある
- Case 実行ごとの後片付け確認（TS-004 的確認）が、自己の生成物と他人の残骸の区別を毎回手作業で行うことになる
- **契約浸透のギャップが現在進行形**: worktree-operations.md「退避ファイルの統一配置（.agentdev/tmp/）」（:289-294）は既存だが、2026-10-05 の Case #3465 でも退避証跡が `C:/WINDOWS/TEMP/opencode/3465-close-evidence/` に置かれており、統一配置契約下でも現場運用が追随していない
- 恒久証跡退避の正規チャネルが未整備（.agentdev/tmp/ は worktree remove 前に削除されるため、worktree 外へ退避する恒久証跡は別チャネルが必要）

## 課題（統合先・現行状態の明記）

routing 注記（adversarial-review 反映）: 削除実行自体はリポジトリ外の一回限り環境作業であり req-define → case-auto の Case 実装対象に馴染まない。**backlog-review では docs/knowledge 直接保存（削除基準・provenance・保持期間の知識文書化）または小規模 docs 修正を第一候補とし、RU 化する場合は削除基準の機械化（命名規約強制・case-run TS-004 / case-close 組み込みの契機定義）に限定**すること。

1. temp 領域の削除基準（命名規約外ファイルの扱い、保持期間、provenance 記録の要否）の合意
2. 掃除の実施契機（case-run TS-004 / case-close 等への組み込み）と対象範囲（自己生成物のみか、規約外ファイルも含むか）
3. checker 証跡退避先の命名規約（`integrity-test-<uuid>` 等）の強制方法
4. 恒久証跡退避チャネルの明確化（.agentdev/tmp/ の生存期間と worktree 外退避の使い分け）

統合視点: 本 item は「一時・退避先の配置規律」ファミリー（extension yaml 文言競合・退避証跡運用と同根）であり、backlog-review でバンドル検討を推奨。

## 既存要件との関連

- worktree-operations.md「退避ファイルの統一配置（.agentdev/tmp/）」（:289-294、「OS の一時ディレクトリ等 workspace 外へ出力しない」）
- case-run TS-004（後片付け確認）、case-close 後片付け工程
- 一時ファイル配置規律（AGENTS.md ハーネス指示と guard 契約）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-05-temp-debug-residue-cleanup-criteria.md`（分類採用により削除済み）
- PR #3491 本文「Findings / Capture候補」（13 件の列挙と非削除判断の記録）、Issue #3484 対応記録コメント
- adversarial-review Stream B 実測（13 件現存・2201 エントリ、2026-10-07）
