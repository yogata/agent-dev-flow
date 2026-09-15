# verification-scope-catalog.md・epic-wave-model.md の REQ-030-022〜025 参照が現行 REQ-030 行体系に存在しない

## 内容

docs/designs/foundations/references/verification-scope-catalog.md「REQ-030（case-open 実行契約）」節の REQ-030-022 行と REQ-030-023..REQ-030-025 行、および docs/designs/workflows/epic-wave-model.md「execution_unit 構成の依存ヒントと Wave 構成の重複前置検出契約（REQ-030-022、REQ-031-027、REQ-035-012）」節見出しの REQ-030-022 が参照する要件行は、現行 docs/requirements/REQ-030.md（REQ-030-001〜011。DEC-029 公開ワークフローの状態遷移中心再構成による縮小後体系）に存在せず dangling 参照である。

同 catalog 節の REQ-030-001..REQ-030-021 範囲参照は RU-0009（Case #2834、PR #2839）で縮小後体系へ修正されるが、REQ-030-022〜025 参照は同 draft の合意対象（REQ-030-012〜021 参照の解消。TS-003 の機械検索対象も同範囲）の範囲外のため未修正のまま残る。

## 提案

当該参照を現行体系における対応所有行（候補: Wave 構成重複前置検出は REQ-061-019、Decision 状態評価は REQ-061-005 系。対応関係は採用時に確定）または Design 本体記述への参照へ修正する。RU-0009 と同一の「対応する所有行または Design 本体記述への置換」パターンで解消可能である。

## 根拠

- 観測元: case-open Batch 2 実行（Case #2834 RU-0009 の実変更判定時・adversarial-review 審議 B3）
- 観測時 commit: 9bd3ef874b8f234abfeb025e9ceb3522e6236b21（main）
- 根拠 1: docs/requirements/REQ-030.md の要件テーブルは REQ-030-001〜011 のみ（表 13 行中データ行 11 行）
- 根拠 2: verification-scope-catalog.md「REQ-030（case-open 実行契約）」節に REQ-030-022・REQ-030-023..REQ-030-025 のエントリ行が残存
- 根拠 3: epic-wave-model.md の節見出し（REQ-030-022、REQ-031-027、REQ-035-012）にも REQ-030-022 が残存
- 根拠 4: RU-0009 draft の合意対象は REQ-030-012〜021 参照の解消に限定されており、022〜025 は対象外（スコープ逸脱して修正しない方針を PR #2839 本文に明記済み）

## 分類

- 分類: intake（具体的修正対象あり: verification-scope-catalog.md・epic-wave-model.md）
- 変更種別: docs（REQ 参照の現行体系整合。REQ-057-002（不存在参照の残存禁止）系）
- 優先度: 中（REQ-030 縮小後体系への参照整合の取り残し。RU-0009 と同一パターンで解消可能）
