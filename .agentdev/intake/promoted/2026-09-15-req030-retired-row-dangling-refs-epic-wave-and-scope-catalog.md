# REQ-030 縮小後の dangling 参照（epic-wave-model・verification-scope-catalog）

※ 統合成果物: 2 intake item（epic-wave-model-req030-obsolete-refs、verification-scope-catalog-req030-dangling-range）を同一不整合（REQ-030 縮小後の廃止行参照）として整理

## 観測内容

REQ-030 縮小（REQ-030-012〜021 廃止）により、docs/designs 配下の 2 ファイルで dangling 参照が発生している:

- `docs/designs/workflows/epic-wave-model.md` L273 の `REQ-030-012` 参照、L280 の `REQ-030-018` 参照
- `docs/designs/foundations/references/verification-scope-catalog.md` L153 の範囲参照 `REQ-030-001..REQ-030-021`

本 promoted 成果物の生成時点（2026-09-15）で再検証済み:

- docs/designs 全域で `REQ-030-012..REQ-030-021` 参照は上記 2 ファイルのみ（grep 確認。網羅性確認済み）

## 影響

- 廃止 REQ 行への参照が Design 本体と検証対応要否カタログに残存し、REQ 体系の整合（現行行体系との一致）を崩している

## 課題（対応候補と判断材料）

- epic-wave-model.md L273 / L280 の廃止 REQ 行参照を、縮小後の REQ-030-001〜011 対応へ修正する
- verification-scope-catalog.md L153 の範囲参照を `REQ-030-001..REQ-030-011` へ縮小する
- いずれも case-ready 構成系 Design / 検証カタログのため、専属割当（OU-004 / OU-006 系）での整合が想定されていたが未実施

## 既存要件との関連

- REQ-030（Epic Wave 実行契約・縮小後行体系 REQ-030-001〜011）: 参照先の現行正典

## 根拠

- 観測元: case 2805 OU-003（DEL-2808-1、PR #2816）本文 Findings/Capture候補（intake 候補。両 item とも同一 PR で観測）、case-close（2026-09-14）で回収
- 処分経緯: intake-promote（2026-09-15）で残存と網羅性（2ファイルのみ）を grep により機械再確認し、採用と統合を確定（自律確定＋統合はユーザー承認）
