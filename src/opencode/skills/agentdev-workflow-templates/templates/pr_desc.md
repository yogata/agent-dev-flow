---
name: Pull Request Description
about: Pull Request作成時の本文テンプレート
---

# PR本文テンプレート

Pull Request作成時の本文テンプレート。

## 概要
<!-- 【必須】 -->

[Issueの要約]

## 実装内容
<!-- 【必須】 -->

[実装内容の概要]

## verify-only 根拠
<!-- 【任意】 verify-only PR（実装差分0件、検証のみで完了する PR）の場合のみ記入する。通常実装 PR では本セクションを省略する。
verify-only PR の場合、「実装内容」欄は空欄にせず「実装差分なし」と理由を記録し、本セクションで詳細根拠を示す。
根拠は姉妹実装 PR、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由のいずれかを許容する。
case-close と QG-4 は当該欄を完了条件の証拠ソースとして読む（[case-run.md](../../../../../case-run SPEC)「verify-only 根拠欄の記入規則」、[case-close.md](../../../../../case-close SPEC)「verification-only PR の files_checked 空確認」参照）。
-->

- **種別**: verify-only
- **実装差分を含まない理由**: [姉妹実装 PR で実装済み / 先行 commit で反映済み / main 反映済み commit / 既存成果物が要件を満たす / 検証のみで完結]
- **根拠成果物または commit**: [姉妹 PR #N / commit SHA / 対象ファイルパス 等]
- **検証対象**: [検証した対象（仕様、既存実装、文書 等）]
- **検証結果**: [検証手順と結果。受け入れ基準が検証のみで充足されたことの evidence]

## 完了条件
<!-- 【必須】 -->

- [ ] {completion_criteria}

## テスト結果
<!-- 【必須】 -->

[テスト結果の概要]

## 品質メトリクス
<!-- 【必須】 -->

| メトリクス | 結果 | 基準 | 判定 |
|---|---|---|---|
| {メトリクス名} | {値} | {基準値} | ✅/❌ |

## Findings/ Capture候補
<!-- 【必須】 -->

### intake

該当なし

### learning

該当なし

## SPEC確定候補
<!-- 【任意】 case-run/ driver が実装時に発見した SPEC レベルの詳細（SPEC に記載すべき schema、enum、判定表、内部アルゴリズム等）を記録する。
`## Findings / Capture候補` とは別セクション。
case-close Step 3 で SPEC 確定チェックの入力となり、draft → 承認済み 昇格または spec-save 再起動の判断材料となる。
SPEC確定候補がない場合はセクションごと省略する。
 -->

該当なし

## 決定事項
<!-- 【任意】 -->

- [PRで実現した決定事項のリンク（該当する場合）]

## 関連Issue
<!-- 【必須】 -->

Closes #$ISSUE_NUMBER


