# intake: traceability malformed-declarations 検査の prose 内 ADF-COVERS 言及誤検出低減

- **発生源**: PR #2764（Issue #2757 / Epic #2755 W2）の Findings を回収
- **capture 元**: case-close Epic Wave 2（Epic #2755）
- **captured_at**: 2026-09-10

## 内容

traceability check の malformed-declarations 検査が、説明文中の ADF-COVERS 言及（宣言形式を満たさない説明文）を malformed として検出する。docs/designs/skills/agentdev-doc-diagnostics.md:104 の「対象要件: draft Design の ADF-COVERS(implementation) 宣言がカバーする REQ」のような prose 行が宣言と誤判定される。誤検出低減の対象外判定（説明文コンテキストの除外）候補。

## 補足

- Epic #2755 の case-run（PR #2763/#2764）と case-close の両検証で同一再現を確認済みの baseline 既知 finding。欠陥ではなく検査精度の改善候補として区分
- 対応時は宣言パーサの対象外判定条件（説明文コンテキストの識別方法）を agentdev-traceability の解析コア契約内で確定すること
