# 2026-10-27 IR-055 warning_total_cap 超過（49から60、cap 58）の処置判断

## 内容

- Case #3862（REQ-009-053）の合意済み対象範囲（IR-044 req-spec 行パターン dead check 解消）により、既存 REQ（REQ-001、REQ-008、REQ-010、REQ-014、REQ-034、REQ-061、REQ-094、REQ-103）の Design 候補行 11件が初めて warning 検出され、pre-demote warning total が 49 から 60 になり `ir-055-baseline.json` の warning_total_cap（58）を超えた
- 処置の選択肢（利用者判断事項）: (a) `--update-warning-cap --raise-warning-cap` による明示的増加受入（ratchet の新水準設定）、(b) 該当 REQ 行の Design 候補行の分離修正（後続 Case。REQ 文書変更は TS-009/010 の拘束により本 Case では不可）、(c) 記録残件として維持
- 本 Case では検出の黙殺・cap の無断変更・検出弱体化を行わず、PR 本文 Findings と Issue 工程記録コメントへ記録して完了した。本 item は処置判断の引き取り候補である

## 根拠

- 観測元: PR #3864 本文「Findings / Capture候補（2026-10-26 第2ラウンド）」セクション、Case #3862 工程記録コメント（6419252754、6419460990）
- 実測証跡: check_integrity.ts --json 本体実行（NG 4件のうち RuntimeReference 1件が warning-cap、IR-044 warning 11件、pre-demote warning total 60）。QA レーン独立再観測（.agentdev/tmp/case-3862-close/qa-review3-archived/check-integrity-full.json）

---
