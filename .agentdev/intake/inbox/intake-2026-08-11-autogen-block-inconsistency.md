# intake: AUTOGEN ブロック不整合 4 件（IR-061 違反）の generate_indexes.ts 再実行による解消候補

## 発生日

2026-08-11

## 発生元

- Issue: #2077 (OU-001 Phase 0 IR audit baseline capture)
- PR: #2084 (feat(spec): REQ-028 Phase 0 IR audit baseline 追加)
- Epic: #2076 (REQ-028: IR portfolio audit and existence-condition hardening)
- 取得元: PR #2084 本文「## Findings / Capture候補」>「### baseline-snapshot-observations」セクション、および baseline ファイル §8 観察事項

## 問題事象

REQ-028 Phase 0 baseline 記録過程で、既存の AUTOGEN ブロック不整合 4 件を検出した。当該箇所は IR-061（index-generation-consistency）違反。`generate_indexes.ts`（`src/opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`）を再実行することで解消見込。

対象 AUTOGEN ブロック:
- `docs/specs/integrity/integrity-rule-catalog.md`（catalog IR エントリ一覧）
- `docs/specs/integrity/rule-ownership.md`（IR 別関連マッピング appendix）

## 影響

- IR-061 違反が持続する限り、`check_integrity.ts` の IR-061 検査が NG を返し続ける
- baseline 記録の正確性: Phase 0 baseline は現状スナップショットとして不整合を含んだ状態で固定される（意図的）。Phase 6（OU-007）での再検証時に同一不整合が残る場合、Phase 1..5 で解消されなかったことになる
- REQ-028 の存在条件ハード化（8 項目）に照らし、IR-061 自体が「executable detector + regression test + execution route」を満たす IR として残るため、自身の検査違反は IR の存在資格に関わる

## 発生局面

実装（REQ-028 Phase 0 baseline 記録、既存不整合の観察）

## 検知方法

Phase 0 baseline 記録過程で `check_integrity.ts` と `generate_indexes.ts` を実行し、AUTOGEN ブロック再生成差分を観察。PR #2084 の Findings > baseline-snapshot-observations に記録。

## 想定される対応方向

- **即時対応（Epic 外）**: `generate_indexes.ts`（auto-gen 実 commit 版）を実行し、AUTOGEN ブロックを再生成して IR-061 違反を解消。独立 PR として処理可能。Epic #2076 とは並行可能（Phase 1..6 は属性や IR 実体を変更するが AUTOGEN ブロック実体は自動生成対象）
- **Epic 内対応**: REQ-028 Phase 4/5（OU-005/006）で IR 管理モデル再設計・判定結果適用の過程で触れる可能性あり。ただし Epic #2076 補足情報や Phase 構成に AUTOGEN ブロック不整合の明示的言及は無く、未確定
- **要判断**: 即時対応か Epic 内対応か。backlog-review で Epic #2076 Phase 構成との重複・独立性を評価し優先度判断

## 関連

- Epic: #2076 (REQ-028 IR portfolio audit)
- Issue: #2077 (OU-001 Phase 0)
- PR: #2084 (squash merge 9c66d49d)
- 対象スクリプト: `src/opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`
- 対象 AUTOGEN ブロック保持ファイル: `docs/specs/integrity/integrity-rule-catalog.md`, `docs/specs/integrity/rule-ownership.md`
- 関連 IR: IR-061（index-generation-consistency、`docs/specs/integrity/rules/IR-061-index-generation-consistency.md`）
- baseline 観察事項: `docs/specs/integrity/baselines/pre-audit-baseline-20260811.md` §8

## 出典引用

PR #2084 本文「## Findings / Capture候補」>「### baseline-snapshot-observations」より:

> - AUTOGEN ブロック不整合 4 件（IR-061 違反、generate_indexes.ts 再実行で解消見込）

baseline ファイル §8 観察事項より:

> AUTOGEN ブロック不整合 4 件（IR-061 違反、generate_indexes.ts 再実行で解消見込）

## タグ

#intake #autogen #ir-061 #generate-indexes #index-regeneration #req-028 #epic-2076 #integrity
