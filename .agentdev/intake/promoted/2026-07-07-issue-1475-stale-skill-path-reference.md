# case-open テンプレートの src/opencode/skills/ ハードコード → .opencode/skills/repo-*/ 切替ロジック

## 観測内容

Epic #1472 Wave 3 子Issue #1475 の case-open 実行時に、`src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts` が対象範囲パスとして展開された。実際の配置は `.opencode/skills/repo-agentdev-integrity/scripts/` であり、`src/opencode/skills/repo-agentdev-integrity/` ディレクトリは存在しない（ADR-0104, ADR-0106 /repo/* namespace により配布対象外）。Issue #1475 および Epic #1472 は共に close 済み。

PR #1478（Wave 3）の実装は `.opencode/skills/repo-agentdev-integrity/scripts/` へ正しく新規配置した（558 行追加、26 テスト全て PASS）。パス表記のズレは PR #1478 Findings の stale-reference セクションに記録済み。

## 影響

- close済み Issue の履歴正確性（機能的影響なし）
- case-open テンプレートが repo-local skill の配置ルール（`.opencode/skills/repo-*/`）を考慮していない場合、再発リスク
- Issue #1475 / Epic #1472 は close 済みであり、ズレは履歴記録上の正確性の問題のみ

## 課題

case-open テンプレートが `src/opencode/skills/` を既定で展開し、repo-local skill の配置ルール（`.opencode/skills/repo-*/`、git 管理対象）を反映していない。repo-local skill 向けの case-open でパス表記がズレる。

## 既存要件との関連

- REQ-0130-031（staleness check）
- REQ-0130-034/035（case-update 連携）
- ADR-0104, ADR-0106（/repo/* namespace、配布対象外）

## 対応方針の方向性

case-open テンプレートにおいて、repo-local skill（`repo-*` 名前空間）の case-open 時に対象範囲パスを `src/opencode/skills/` から `.opencode/skills/repo-*/` へ切り替えるロジックを追加する。汎用 skill は従来通り `src/opencode/skills/` 展開を維持。

優先度: 低（履歴正確性のみ、機能的影響なし、Issue #1475 は close済み、PR #1478 Findings にズレ記録済み）。

## 根拠

- 観測元: PR #1478 の case-close 実行（Epic #1472 Wave 3 FINAL、2026-07-07）
- パスズレ: `src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts`（Issue #1475）vs `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts`（実測値、PR #1478 配置）
- ズレ原因: case-open テンプレートが `src/opencode/skills/` を既定展開し、repo-local skill 配置ルールを未反映
- 機能的影響: なし（テストファイルは正規パスへ配置済み、26 テスト全て PASS、QG-3 no-deviation, QG-4 pass）
