# 5コマンドに禁止frontmatter fieldが残存（load_skills / implementation_pattern）

## 観測

5件のコマンド定義ファイルに、REQ-0108-095〜097 で禁止された frontmatter field が残存している。`check_integrity.ts`（lines 2220-2298）の禁止field検出で継続的にNGとなる。

### 対象ファイルと違反内容

| ファイル | 禁止field | 違反REQ |
|----------|-----------|---------|
| `case-close.md` | `load_skills` | REQ-0108-097 |
| `case-open.md` | `load_skills` | REQ-0108-097 |
| `case-run.md` | `load_skills` | REQ-0108-097 |
| `case-update.md` | `load_skills` | REQ-0108-097 |
| `intake-promote.md` | `implementation_pattern` | REQ-0108-095/096 |
| `learning-promote.md` | `implementation_pattern` | REQ-0108-095/096 |

## 影響

- `check_integrity.ts` で継続NG。integrity check結果が恒常的に警告を含む
- command/skill責務分離の原則（judgment→skill, fixed wording→template）に抵触
- REQ-0108-095〜097 への準拠不完了状態が継続

## 課題

6ファイルの frontmatter から禁止fieldを削除し、削除後に `check_integrity.ts` でNGが解消することを確認する。

## 既存要件との関連

- REQ-0108-095: command frontmatter での `implementation_pattern` 禁止
- REQ-0108-096: `implementation_pattern` の prohibition 検出
- REQ-0108-097: command frontmatter での `load_skills` 禁止
- AGENTS.md「編集ガードレール」: frontmatter を command の責務に合わせて維持すること

## 対応方針

1. 対象6ファイルの frontmatter から `load_skills` / `implementation_pattern` を削除
2. 削除後、当該fieldが参照されていないことを確認
3. `check_integrity.ts` 実行で該当NGが0件になることを検証

## 根拠

- 元item: `.agentdev/intake/inbox/2026-06-14-command-frontmatter-prohibited-fields.md`
- 観測元: Issue #649 comment[0] G4検証レポート「Recommended Follow-up Actions」item 2
- 元テキスト: 「Clean frontmatter: Remove `load_skills` from case-close, case-open, case-run, case-update; remove `implementation_pattern` from intake-promote, learning-promote」
- 関連: Issue #582 criterion 1（5 commands still have prohibited frontmatter fields）
