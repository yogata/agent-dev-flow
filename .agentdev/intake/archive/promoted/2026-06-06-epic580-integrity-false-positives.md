---
discovered_at: 2026-06-06
source: case-auto Epic #580 PR Findings回収
tags: [intake, integrity-check, false-positive]
---

# Epic #580 Findings回収 — Integrity Check False Positive改善

## 内容

integrity check (`check_integrity.ts`) の既存検査で false positive が発生する3パターンの改善候補。

### 1. parseMarkdownLinks inline code block 誤検出 (INC-0001)

`parseMarkdownLinks` が inline code block 内の `[text](href)` パターンをリンクとして誤検出する。REQ-0108-045 の「非リンク placeholder 記法」要件に照らしても改善候補。

**発見元**: PR #590 (#584 Strict Mechanical Cleanup)
**対象**: `check_integrity.ts` の `parseMarkdownLinks` 関数
**改善案**: code block / inline code 内のパターンをスキップ

### 2. cmd-deprecated-in-inventory 文脈区別なし (INC-0012)

`cmd-deprecated-in-inventory` 検査が `content.includes("deprecated")` で文脈区別なしにマッチする。検査カテゴリ説明文中の "deprecated" 単語に誤マッチ。

**発見元**: PR #590 (#584 Strict Mechanical Cleanup)
**対象**: `check_integrity.ts` の該当検査関数
**改善案**: コメント内・説明文内の "deprecated" を除外

### 3. legacy-namespace 正規表現 templates/ false positive

`legacy-namespace` 検査の正規表現が `.opencode/commands/agentdev/templates/` パスを false positive として検出する。

**発見元**: PR #591 (#585 Legacy Terminology)
**対象**: `check_integrity.ts` の `checkLegacyNamespace` 関数
**改善案**: templates/ パスの除外条件を正規表現に追加
