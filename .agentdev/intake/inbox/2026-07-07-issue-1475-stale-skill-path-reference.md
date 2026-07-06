# close済み Issue #1475 / Epic #1472 Wave 3 の対象範囲パス表記修正（src/opencode/skills/repo-agentdev-integrity -> .opencode/skills/repo-agentdev-integrity）

## 概要

Epic #1472 Wave 3 子Issue #1475 の本文（close済み）の「対象範囲」「完了条件」セクションに記載のテストファイルパス `src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts` が、実際の配置パス `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts` と乖離している。`src/opencode/skills/repo-agentdev-integrity/` ディレクトリは存在しない（後述）。両Issue ともに close 済みであり、機能的影響はなく情報正確性のみの問題。

## 詳細

- Issue #1475 は case-open テンプレート展開時に `src/opencode/skills/repo-agentdev-integrity/scripts/` を参照した。`repo-agentdev-integrity` は repo-local skill であり、`.gitignore` により `.opencode/skills/repo-*/` のみ git 管理対象。`src/opencode/skills/repo-agentdev-integrity/` は配布物除外（ADR-0104, ADR-0106 /repo/* namespace）のため存在しない
- PR #1478（Wave 3）の実装は正しく `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts` へ新規配置した（558 行追加、26 テスト、全て PASS）
- パス表記のズレは PR #1478 Findings の stale-reference セクションに記録済み。case-update での本文修正は本 PR では実施せず後続委譲とした
- Issue #1475 / Epic #1472 は本 case-close で close 済み。履歴記録上の正確性のみ

## 候補となる対応

優先度は低（情報正確性のみ、機能的影響なし、両Issue close済み）。以下のいずれか:

1. **見送り（推奨）**: close済みIssue の履歴修正は実施しない。PR #1478 Findings および本 intake item で乖離の事実記録は十分
2. **コメント追記**: Issue #1475 / Epic #1472 に「対象範囲・完了条件のパス表記は case-open 時点のテンプレート展開に基づく。実際の配置パスは `.opencode/skills/repo-agentdev-integrity/scripts/`（PR #1478 参照）」旨のコメントを追記して履歴正確性を補完
3. **テンプレート改善（別Issue）**: case-open テンプレートの `src/opencode/skills/` ハードコードを、repo-local skill の場合 `.opencode/skills/repo-*/` へ切り替えるロジック追加を検討。本 intake から backlog-review → RU → req-define 経由で対応可能

## 根拠

- 観測元: PR #1478 の case-close 実行（Epic #1472 Wave 3 FINAL、2026-07-07）
- パス乖離: `src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts`（Issue #1475 本文）vs `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts`（実測値、PR #1478 で配置）
- 乖離原因: case-open テンプレートが `src/opencode/skills/` を既定で展開し、repo-local skill の配置ルール（`.opencode/skills/repo-*/`）を反映していない
- 機能的影響: なし（テストファイルは正規パスへ配置済み、26 テスト全て PASS、QG-3 no-deviation、QG-4 pass）
- 関連 learning: 該当なし（テンプレート改善は intake item として対応、再発防止知見の昇華は学習対象外）
- 関連既知課題: `.agentdev/intake/inbox/2026-07-05-epic-1427-wave2-issue-1429-stale-count-reference.md`（同種の close済みIssue 陳腐化パターン、件数表記 vs パス表記で対象は異なる）
- 関連要件: REQ-0130-031（staleness check）、REQ-0130-034/035（case-update 連携）
- スコープ: Wave 3 (#1475) 対象外。PR 本文に "Recommended action: case-update to revise Issue #1475 path notation" と明記済み
