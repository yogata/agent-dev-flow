# .sisyphus/ の .gitignore 追加未完了

docs/guides/specs/state/gitignore 全体整合（Case 5）で、`.sisyphus/` を .gitignore に追加することが完了条件 AC-9 に含まれていたが、未チェックのままクローズされている。`.sisyphus/` は runtime 一時作業領域（ADR-0018）であり、git 管理対象外化が必要。

## 根拠

- Issue #553: Case 5: docs/guides/specs/state/gitignore全体整合
  - 完了条件「`.sisyphus/` が gitignore に追加されている（AC-9）」が未チェック
  - 他の完了条件（docs/specs repo-internal 明記、docs/guides 人間向け navigation 層明記）は [x] 済み
