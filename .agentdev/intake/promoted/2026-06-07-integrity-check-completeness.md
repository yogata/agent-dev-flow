---
discovered_at: 2026-06-07
source: intake-promote inbox scan（19件一括処理）
tags: [intake, integrity-check, regression-test, document-drift]
---

# Integrity Check 完了性ギャップ（未実装検査・regression test・retired REQ参照・bare path）

## 内容

integrity-check に関連する未完了検証・未実装検査が散在し、体系的な補完が必要。

### 1. 未実装検査（REQ-0108-111/112/126~127 + variant path）(from #7)

- REQ-0108-111, 112, 126~127 の integrity-check 検査が未実装
- integrity-check が command 定義の variant path と実際の template ファイルの一致を検査できない
- ADR retired REQ / broken links / implementation pattern mismatch の修正後、integrity-check で該当 finding が解消されることの確認が未完了（#503/#504 マージ後に確認が必要）
- 完了報告フォーマットの integrity-check 検査（case-run スコープ外として保留）
- REQ-0107 SSoT 化の移行後 integrity-check check (d) 検証が別途確認扱い
- コマンド・スキル肥大化是正（#511）の integrity-check 回帰テスト2項目未実施

**根拠**: PR #587, #571, #509、Issue #511, #468

### 2. Regression test fixture 未追加 (from #8, #12)

新規検査項目（ADR status 正規化/RU-ID 検出/6状態/Pattern 残存）に対する regression test fixture が未追加。frontmatter 検査反転（PR #558）でも regression test fixture の追加が別途対応推奨とされた。

- 各新検査項目に対する test fixture を追加し、regression を防止
- 旧検査関数の frontmatter 非依存版を将来の Case で再実装する可能性もある

**根拠**: PR #558、REQ-0108-055

### 3. Retired REQ の非 retired 文書での参照43件 (from #9)

retired（引退済み）REQ が非 retired 文書から参照されている事例が合計43件（LinkIntegrity 22件 + LifecycleBoundary 21件、内容はほぼ重複）検出。

**主な参照元ファイルと retired REQ:**

| 参照元 | retired REQ |
|--------|------------|
| `docs/adr/ADR-0003.md` | REQ-0007 |
| `docs/adr/ADR-0004.md` | REQ-0004 |
| `docs/adr/ADR-0005.md` | REQ-0017 |
| `docs/adr/ADR-0006.md` | REQ-0020 |
| `docs/adr/ADR-0007.md` | REQ-0004 |
| `docs/adr/ADR-0008.md` | REQ-0004 |
| `docs/adr/ADR-0009.md` | REQ-0001, REQ-0040, REQ-0023, REQ-0039, REQ-0041 |
| `docs/adr/README.md` | REQ-0016, REQ-0007, REQ-0004, REQ-0017, REQ-0020, REQ-0035, REQ-0041 |
| `docs/specs/patterns.md` | REQ-0001 |
| `docs/specs/system.md` | REQ-0001 |
| `docs/guides/project-docs-and-specs.md` | REQ-0001 |

**レビューで決めること:**
- ADR 内の retired REQ 参照を「歴史的参照」として残すか、注記を追加するか
- ADR README から retired REQ を削除するか
- specs/guides 内の retired REQ 参照（REQ-0001 等）を現行 REQ に置換するか

**根拠**: integrity-check report（LinkIntegrity / retired-req-as-current, LifecycleBoundary / retired-req-primary-ref）

### 4. Command 定義内 bare `references/` パス8件未解決 (from #10)

command 定義内の bare `references/` パス8件が、template パス正規化対応（#576）では pre-existing として扱われ、別 Issue での対応とされたまま未解決。integrity-check で検出されるが修正が行われていない。

**根拠**: Issue #576
