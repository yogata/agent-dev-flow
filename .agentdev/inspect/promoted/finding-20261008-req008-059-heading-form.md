# REQ-008-059 のテーブル外見出し形式と fixture・内部アルゴリズム残留

- 出所: inspect-docs 20261008T025952Z F-04（backlog-auto stage 1）
- 種別: 構造整理（テーブル行形式復帰 + Design 分離）
- 対象 REQ: REQ-008

## F-04: REQ-008-059 が要件テーブル外の見出し形式で存在

- target: `docs/requirements/REQ-008.md:80-88`
- evidence: 要件テーブルは `| REQ-008-058 |`（:75）の次が `| REQ-008-060 |`（:76）に飛び、REQ-008-059 だけが `### REQ-008-059: 未確定内容の auto_ready 抑止` 見出し＋散文で記述される。行 ID の機械解決が不能（本次診断の走査でも NOT FOUND として検出）。本文は「決定的マーカー検査（"TBD"、"TODO"、"未定"、"後続工程で確定"、"case-run で確定" 等の代表 fixture）」「auto_gate.stop_reasons へ記録」等のテストデータ詳細・内部アルゴリズム・field 名が主たる文意。
- severity: medium / confidence: high（形式不整合の事実は確定的）
- source_of_truth: 現行 REQ の要件テーブル形式慣行、document-model.md 分離基準（テストデータ詳細・内部アルゴリズム→Design）

## 処置方針

1. テーブル行形式への復帰（REQ-008-059 を `| REQ-008-059 |` 行として要件テーブルに戻す）
2. fixture・内部アルゴリズム・field 名（代表マーカー列挙、auto_gate.stop_reasons）の Design 分離（契約本体は REQ 行に残す）

## defer からの転換根拠（review 再構成版）

- 本件は過去 8 回以上検出・再評価されている: 20260901 F-12 初出 → 20260914 原状継続 → 20260921〜24 内容不変 defer 継続 → 20260925 F-05【同一・継続】→ 20260929 ×2 残存 → 20261004:67 残存＋:88「MOVE: 候補あり」→ 今回 F-04。
- 過去の defer 理由は「採否の意味判断・移管先判断は残存、再評価条件に変化なし」（20260924 再評価）。今回の転換根拠は検出回数そのものではなく、(a) 機械走査で行 ID 解決不能（NOT FOUND）の実害が今回の診断で観測された（20260925 の check_integrity phantom 扱い指摘の再実証）、(b) 20261004 に「MOVE: 候補あり（DS-01 クラスタ + 残存 defer 群）」の前進記録が確定済み、の 2 点である。移管先判断（REQ 残置か Design 移動か）は req-define 壁打ちで確定する。

## review 検証記録（adversarial-review 2026-10-08）

- Stream A: 過去 defer 履歴（20260901 F-12・20260925 F-05 ほか）と REQ-008.md:75-88 の現状を実測確認。flip 根拠の再構成を指摘（本成果物に反映済み）。
- Stream B: 3rd detection の痕跡（20260929T165249Z:92）を確認。
