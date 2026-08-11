# intake: REQ-0030-009/010/011 pre-existing failure（case-close/case-open Steps 構造・ADR README.md 存在性）

## 発生日

2026-08-11

## 発生元

- Issue: #2083 (OU-007 Phase 6 全体再検証)
- PR: #2090 (feat(integrity): REQ-028 Phase 6 全体再検証 + Phase 3 §5.1 残り7件 detector 集約)
- Epic: #2076 (REQ-028: IR portfolio audit and existence-condition hardening)
- 取得元: PR #2090 本文「## Findings / Capture候補」> 継続課題4、Test Strategy TS-022 regression 結果
- 前Wave 由来: PR #2089 (Wave 6) Findings でも指摘、Phase 6 スコープとして分割 RU 候補に挙がっていた

## 問題事象

`bun test .opencode/skills/repo-agentdev-integrity/scripts/` を実行すると、main baseline (0aa41785) でも Phase 6 worktree でも同一に fail する 3件 の pre-existing failure が存在する。Phase 6 変更起因でないため TS-022 合格としたが、Epic #2076 完了後も継続する構造的課題。

3件 の内容:
- **REQ-0030-009**: case-close/case-open Steps section 構造、template skill coverage 関連
- **REQ-0030-010**: case-close body numbered step 関連
- **REQ-0030-011**: case-close/case-open full validation、ADR README.md 存在性関連

いずれも Phase 6 スコープ外（Phase 6 は REQ-028 完了領域）。構造的改善要求であり、独立 RU 候補。

## 影響

- TS-022 regression 評価時に pre-existing failure として都度除外判定が必要（ノイズ）
- REQ-0030（command/skill 構造）完了領域の品質低下
- 将来の Phase 6 的再検証（別 Epic）で同一 failure が再検出される

## 発生局面

実装（Phase 6 regression テスト実行）、完了処理（case-close QG-4 TS-022 評価）

## 検知方法

PR #2090 Test Strategy TS-022 regression 結果セクションで Phase 6 worktree 12 fail / main baseline (0aa41785) 11 fail の内訳分析。pre-existing 11件のうち 3件 が REQ-0030-009/010/011 由来と特定（残り 8件 は IR-055 baseline 関連、別 learning inbox 記録済）

## 想定される対応方向

- **独立 RU 化**: REQ-0030-009/010/011 の3件 を1 RU（または3 RU）にまとめて backlog-review で優先度判断
- **case-close/case-open command Steps 構造見直し**: REQ-0030-009/010 は command body の numbered step 構造と SKILL.md reference の対応関係の是正
- **ADR README.md 存在性**: REQ-0030-011 は case-close/case-open full validation で ADR README.md の存在を前提としている箇所の是正
- **backlog-review で優先度判断**: REQ-028 Epic 完了後（本 Wave 7 完了後）の独立 Issue 化を推奨

## 関連

- Epic: #2076 (REQ-028 IR portfolio audit)
- Issue: #2083 (OU-007 Phase 6)
- PR: #2090 (squash merge commit 3c63fb28)
- 関連要件: REQ-0030-009/010/011（command/skill 構造）
- 前Wave PR: #2089 (Wave 6、Phase 5 #2082、先送り元)
- 対象コマンド: `src/opencode/commands/agentdev/case-close.md`、`src/opencode/commands/agentdev/case-open.md`

## 出典引用

PR #2090 本文「## Findings / Capture候補」> 継続課題 より:

> 4. **REQ-0030-009/010/011 pre-existing failure**（3件）: case-close/case-open command の手順チェック、ADR README.md 読解領域。Phase 6 スコープ外、次期 RU で対応候補（intake inbox 候補）。

PR #2090 Test Strategy TS-022 regression 結果 より:

> 12 fail の内訳:
> - pre-existing failure（main でも同一発生）: 11件
>   - REQ-0030-009 case-close/case-open Steps section 構造、template skill coverage
>   - REQ-0030-010 case-close body numbered step
>   - REQ-0030-011 case-close/case-open full validation、ADR README.md 存在

## タグ

#intake #req-0030 #case-close #case-open #command-structure #adr-readme #pre-existing-failure #epic-2076 #phase-6 #post-epic-ru-candidate