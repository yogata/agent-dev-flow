# 5コマンドに禁止frontmatter field が残存（load_skills / implementation_pattern）

## 観測

Issue #649（未検証クローズ検証: RU-07）のG4検証レポートで、5件のコマンド定義ファイルに REQ-0108-095〜097 で禁止された frontmatter field が残存していることが特定された。

### 対象

- `case-close.md`: `load_skills`（REQ-0108-097違反）
- `case-open.md`: `load_skills`（REQ-0108-097違反）
- `case-run.md`: `load_skills`（REQ-0108-097違反）
- `case-update.md`: `load_skills`（REQ-0108-097違反）
- `intake-promote.md`: `implementation_pattern`（REQ-0108-095/096違反）
- `learning-promote.md`: `implementation_pattern`（REQ-0108-095/096違反）

## 今回扱われなかった理由

Issue #649 は検証対象（RU-07）の完了基準を確認するG4検証Issueであり、検出された不整合の修正はスコープ外。Issue #657（G4検証残課題の修正）が broken junction・ガイド数・旧Pattern参照の修正を実施したが、frontmatter cleanup は #657 の対応方針に含まれていなかった。

## 影響

REQ-0108-095〜097 に違反する frontmatter field が残存し、`check_integrity.ts` の禁止field検出（lines 2220-2298）で継続的にNGとなる。command/skill責務分離の原則（judgment→skill, fixed wording→template）にも抵触する。

## 推奨対応

対象6ファイルの frontmatter から `load_skills` および `implementation_pattern` を削除する。削除後、`check_integrity.ts` でNGが解消することを確認する。

## 根拠

- 観測元: Issue #649 comment[0] G4検証レポート「Recommended Follow-up Actions」item 2
- 元テキスト: 「Clean frontmatter: Remove `load_skills` from case-close, case-open, case-run, case-update; remove `implementation_pattern` from intake-promote, learning-promote」
- 関連: Issue #582 criterion 1（「5 commands still have prohibited frontmatter fields」）
- Issue クローズ日: 2026-06-07
