# REQ-0141 link mode 昇格に伴う語彙ズレ（local-generation.md / requirements README / rule-ownership.md）

## 発生源

- Issue: #1193 (CLOSED, COMPLETED)
- PR: #1195 (merged, squash 8e66106b)
- 発生日: 2026-06-26
- 元 item: local-generation.md 廃止候補表記ズレ、requirements README REQ-0141 タイトル陳腐化、rule-ownership.md L44 transform/ 参照

## 観測内容

PR #1195 で REQ-0141-004/009/028 を「確定廃止」へ昇格し `transform/` を完全削除した結果、3 ファイルで語彙ズレが発生した。Issue #1193 のスコープは 4 ファイル（glossary.md, consumer-project-setup.md, DOC-MAP.md, local-case-file.md）に限定され、以下は対象外。

1. **`docs/specs/local-generation.md` L52, L63**: `transform/` を「廃止候補」と記載していたが、REQ-0141 昇格で「確定廃止」状態となりズレ発生
2. **`docs/requirements/README.md` REQ-0141 エントリ**: タイトルが「ローカル版 OpenCode 生成方式とローカルCaseファイル運用」（ADR-0126 時代の旧語彙「生成方式」）。frontmatter title は「ローカル版 OpenCode 導入方式とローカルCaseファイル運用（link mode）」
3. **`docs/specs/rule-ownership.md` L44**: `transform/generate.md` パスを参照するが、`transform/` 削除でファイル不存在。local-transform.md SPEC は履歴参照として残置だが、字義通り読むと「現存しないファイルの要件」と誤読される余地

## 影響

- 読者が廃止状態を誤認（「廃止候補」と「確定廃止」のズレ）
- README と frontmatter のタイトル不一致で現行語彙を誤認
- 削除済みパス参照で読者が辿れない

## 課題

- local-generation.md の「廃止候補」表記を REQ-0141 確定廃止と整合する表記へ是正するか
- requirements/README.md の REQ-0141 タイトルを frontmatter に一致させるか。他 REQ エントリで README と frontmatter title のズレがないか横展開確認するか
- rule-ownership.md L44 を「歴史的参照」明示とするか、存続ファイルへの参照へ読み替えるか

## 既存要件との関連

- `docs/requirements/REQ-0141.md` frontmatter title（SSoT）
- ADR-0131（link mode 移行）、ADR-0126（旧語彙）
- REQ-0112-053（superseded_by 形容表的言及）の対象外、現行語彙の陳腐化に分類

## 対応方針候補

- 別 Issue（docs_chore）として 3 ファイルの語彙是正を一括処理。frontmatter を SSoT として README 側を合わせる
