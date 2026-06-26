# REQ-0143-004 に対する IR-044 exemption 境界整理

## 発生源

- Issue: #1194 (CLOSED, COMPLETED)
- PR: #1198 (merged, squash ae3a2c66)
- 発生日: 2026-06-26

## 観測内容

PR #1198 で「REQ-0143-004 が既存の IR-044 Step number warning として検出されている」と明記した。

REQ-0143-004 は command-file-format SPEC↔command 定義の Step 一致原則を規定する。原本的には SPEC 詳細の列挙ではなく原則規定に近いが、IR-044 の META 規則行 exemption 機械判定（REQ-NNNN-MMM 形式 + SPEC 種別列挙の責務範囲規定行）には引っかからない。そのため `/repo/docs-check` 実行時に REQ-0143-004 が既存 IR-044 warning（10件の Step 番号直接参照）の一部として継続検出される。

OU-002（本 PR）は検出シグナル追加のみを扱い、既存 warning 群に対する exemption 境界整理は対象外とした。

## 影響

- REQ-0143-004 が IR-044 warning として継続検出され、exemption 境界が未整理

## 課題

- REQ-0143-004 の REQ 行が「SPEC 詳細に属する Step 番号」ではなく「原則規定」を指しているかを文脈判定
- IR-044 exemption 境界（META 規則行 exemption、文脈免除）を REQ-0143-004 の性質に合わせて拡張するか、文脈免除リスト（inspect-docs 責務、REQ-0145-002/012）への委譲を明文化
- REQ-0145 系既存の exemption 設計と整合する整理（OU-003 AG-004 で扱われる REQ-0143-004 APPEND / req-define.md SPEC Step 再採番 とも関連）

## 既存要件との関連

- REQ-0143-004（command-file-format SPEC↔command 定義 Step 一致原則）
- IR-044（Step number warning、META 規則行 exemption）
- REQ-0145-002/012（文脈免除リスト、inspect-docs 責務）
- OU-003 AG-004 RU-0004（REQ-0143-004 APPEND / req-define.md SPEC Step 再採番）

## 対応方針候補

- 別 Issue / inspect-docs で整理。exemption 設計の拡張か文脈免除委譲かを確定する
