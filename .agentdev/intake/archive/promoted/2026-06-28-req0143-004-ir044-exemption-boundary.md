# REQ-0143-004 の IR-044 exemption 境界整理

## 観測

PR #1198（IR-044 Step-number direct-reference detection signals）で、REQ-0143-004 が既存の IR-044 Step number warning として検出されている。REQ-0143-004 は command-file-format SPEC↔command 定義の Step 一致原則を述べており、原本的には SPEC 詳細の列挙ではなく原則規定に近いが、META 規則行 exemption 機械判定には引っかからない。別途 inspect-docs で文脈免除判定が必要となる可能性がある。

## 根拠

PR #1198:

> - REQ-0143-004 が既存の IR-044 Step number warning として検出されている（"Step 0 使用、非連番 Step 番号…"）。本 PR の対象外（既存検出）。REQ-0143-004 は command-file-format SPEC↔command 定義の Step 一致原則を述べており、原本的には SPEC 詳細の列挙ではなく原則規定に近いが、META 規則行 exemption 機械判定には引っかからない。別途 inspect-docs で文脈免除判定が必要となる可能性あり（capture 候補: REQ-0143-004 の IR-044 exemption 境界整理）
