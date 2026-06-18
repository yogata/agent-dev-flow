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

## Findings / Capture候補
<!-- 【必須】 -->

### intake

該当なし

### learning

該当なし

## SPEC確定候補
<!-- 【任意】 case-run / driver が実装時に発見した SPEC レベルの詳細（SPEC に記載すべき schema・enum・判定表・内部アルゴリズム等）を記録する（ADR-0123 Decision #4）。`## Findings / Capture候補` とは別セクション。case-close Step 3 で SPEC 確定チェックの入力となり、draft → accepted 昇格または spec-save 再起動の判断材料となる。SPEC確定候補がない場合はセクションごと省略する。 -->

該当なし

## 決定事項
<!-- 【任意】 -->

- [PRで実現した決定事項のリンク（該当する場合）]

## 関連Issue
<!-- 【必須】 -->

Closes #$ISSUE_NUMBER
