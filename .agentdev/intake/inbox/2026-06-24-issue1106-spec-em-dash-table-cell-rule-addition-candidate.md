# em-dash 表格置換ルールの SPEC document-type-responsibilities.md 反映候補

## 発生源

- Issue: #1106
- PR: #1117 (merged, squash 9d692b8)
- 発生日: 2026-06-24

## 内容

PR #1117 で `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 2 に em-dash 置換の機械判定アルゴリズムを明文化した。半角空白挟みの ` — ` パターン検出で本文中の em-dash を cover し、テーブルセル N/A プレースホルダ `| — |` は `| - |` へ機械置換する。

うち `| — |` → `| - |` のテーブルセル置換ルールは SPEC `document-type-responsibilities.md`「em-dash 置換形式」節への追記候補。SPEC 側にテーブルセル専用の置換形式が明記されていない状態が継続している。

PR では skill reference への集約までとし、SPEC 昇格は case-close Step 3 の判断に委ねた。本候補は SPEC 昇格 (draft → accepted) ではなく既存 accepted SPEC への追記であり、かつ本 Issue は docs_chore で spec-save flow の対象外のため、見送りとして intake 化する。

## 推奨対応先

別 Issue として切り出すことを推奨。作業候補:

- SPEC `document-type-responsibilities.md`「em-dash 置換形式」節にテーブルセル `| — |` → `| - |` の機械置換ルールを追記
- `mechanical-replacement-rules.md` section 2 との二重管理を避けるため、SPEC 側は参照先として最小化するかを併せて検討

## 現在の追跡状態

- PR #1117 SPEC確定候補に記録済み
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
