# REQ-0143-004 に対する IR-044 exemption 境界整理

## 発生源

- Issue: #1194（CLOSED, COMPLETED, case-close 完了）
- PR: #1198（merged, squash ae3a2c66）
- 発生日: 2026-06-26

## 内容

PR #1198 の Findings / Capture候補 セクションで「REQ-0143-004 が既存の IR-044 Step number warning として検出されている（"Step 0 使用、非連番 Step 番号…"）。本 PR の対象外（既存検出）」と明記。

REQ-0143-004 は command-file-format SPEC↔command 定義の Step 一致原則を規定する。原本的には SPEC 詳細の列挙ではなく原則規定に近いが、IR-044 の META 規則行 exemption 機械判定（REQ-NNNN-MMM 形式 + SPEC 種別列挙の責務範囲規定行）には引っかからない。そのため、`/repo/docs-check` 実行時に REQ-0143-004 が既存 IR-044 warning（10件の Step 番号直接参照）の一部として継続検出される状態になっている。

OU-002（本 PR）は検出シグナル追加のみを扱い、既存の warning 群に対する exemption 境界整理は対象外とした。文脈免除判定が必要となる可能性があり、別途 inspect-docs での整理が推奨される。

## 推奨対応先

別 Issue / inspect-docs での整理を推奨。作業候補:

- REQ-0143-004 の REQ 行が「SPEC 詳細に属する Step 番号」ではなく「原則規定（command-file-format SPEC↔command 定義の Step 一致原則）」を指しているかを文脈判定
- IR-044 exemption 境界（META 規則行 exemption、文脈免除）を REQ-0143-004 の性質に合わせて拡張するか、文脈免除リスト（inspect-docs 責務、REQ-0145-002/012）への委譲を明文化
- REQ-0145 系既存の exemption 設計と整合する整理（OU-003 AG-004 で扱われる REQ-0143-004 APPEND / req-define.md SPEC Step 再採番 とも関連）

## 現在の追跡状態

- PR #1198 Findings / Capture候補: REQ-0143-004 既存 IR-044 warning 検出継続（スコープ外）
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
- 本 intake の SPEC 確定候補: なし（exemption 設計整理は inspect-docs / SPEC 改訂領域）

## 備考

OU-002 は検出シグナル追加（REQ-0136-031 自身を true positive から除外する機械的根拠の確立）に限定され、既存の IR-044 warning（Step 0 使用や非連番 Step 番号など）の exemption 整理は明示的に対象外とした（Issue #1194 「注意（対象外）」節にて明記: REQ-0143-004 の APPEND と req-define.md SPEC の Step 再採番は OU-003 AG-004 RU-0004 のスコープ）。本 intake は OU-002 完了後の残課題記録であり、OU-002 の成果を損なうものではない。
