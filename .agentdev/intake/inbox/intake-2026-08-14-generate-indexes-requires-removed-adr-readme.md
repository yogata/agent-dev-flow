# intake: generate_indexes.ts が移行済み docs/adr/README.md を必須参照し dry-run が実行不能

## 発生日

2026-08-14

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: case-close 実行（Stage 3、Issue 2100 / PR 2110 クローズ）における自工程 deviation 観測（project extension check `autogen-index-regeneration-diff` 実行時）

## 問題事象

`bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts --dry-run` が exit 2 で終了し、`[generate_indexes] ADR README not found: <root>\docs\adr\README.md` を出力する。スクリプトが AG-008 用に `docs/adr/README.md` の AUTOGEN block 更新を必須処理としているが、`docs/adr/` は commit `9ea67084`（refactor(decisions): migrate ADR-001..008 to DEC-001..008 for OU-003）で DEC モデルへ移行済みであり、baseline commit `49f4db17`・origin/main のいずれにも存在しない。ADR README 更新処理の直前にある README/SPEC/rule-ownership 系の処理は通過するため、ADR README の必須参照のみが現行構成と不整合。

## 影響

- case-close の project extension check（AUTOGEN 索引再生成差分検出、Step 3-3）が dry-run 実行不能となり、差分検証（WOULD UPDATE 検出）が機能しない
- 本件事例（PR 2110）は変更ファイル 0 件のため索引ドリフトは構造的に発生しえず影響なし。ただし docs 変更を伴う以降の Wave（OU-001 以降）で同 check が使えないままになる
- `/repo/docs-check` 系の索引再生成運用全体にも同障害が及ぶ可能性

## 発生局面

運用（case-close Step 3-3 の dry-run 実行）

## 検知方法

`bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts --dry-run` の実行（exit 2、`ADR README not found`）。`git cat-file -e 49f4db17:docs/adr/README.md` / `git cat-file -e origin/main:docs/adr/README.md` で baseline・main の双方に不存在を確認済み。

## 想定される対応方向

- (a) ADR README 更新処理を `docs/decisions/README.md`（現行 DEC モデル）へ更新する
- (b) `docs/adr/README.md` 不存在時は ADR README 処理をスキップ（fail-soft）する
- (a)/(b) の選定は backlog-review で判断する。Epic 2099 の OU-007（cleanup / preventive checker 導入）または OU-008a（全受け入れ条件再検証）での処理候補

## 関連

- Epic: #2099
- Issue: 2100（OU-000）, PR: 2110
- 対象スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`（ADR README 更新 (AG-008) 処理）
- 移行元 commit: `9ea67084`（ADR→DEC 移行）
- 発見契機: project extension `.agentdev/extensions/commands/case-close.yaml` check `autogen-index-regeneration-diff`

## 出典引用

dry-run 実行出力より:

> [generate_indexes] ADR README not found: C:\Users\ogatay\work\agent-dev-flow\docs\adr\README.md

## タグ

#intake #autogen #generate-indexes #adr-dec-migration #stale-tooling #epic-2099
