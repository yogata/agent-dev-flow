# requirements/README.md の REQ-0141 タイトル陳腐化（生成方式→導入方式）

## 発生源

- Issue: #1193（CLOSED, COMPLETED, case-close 完了）
- PR: #1195（merged, squash 8e66106b）
- 発生日: 2026-06-26

## 内容

PR #1195 の Findings セクションで指摘。`docs/requirements/README.md` の REQ-0141 エントリタイトルは「ローカル版 OpenCode 生成方式とローカルCaseファイル運用」と記載されているが、`docs/requirements/REQ-0141.md` frontmatter の title は「ローカル版 OpenCode 導入方式とローカルCaseファイル運用（link mode）」。README.md のみ ADR-0126 時代の旧語彙（「生成方式」）が残存し、frontmatter（「導入方式」+「link mode」）と陳腐化した状態になっている。

Issue #1193 は 4 ファイルスコープ（glossary.md, consumer-project-setup.md, DOC-MAP.md, local-case-file.md）に限定しており requirements/README.md は対象外のため、本 PR #1195 では対処せず。

## 推奨対応先

別 Issue（docs_chore）として切り出すことを推奨。作業候補:

- requirements/README.md の REQ-0141 エントリタイトルを frontmatter title と一致する表記へ更新（「生成方式」→「導入方式」, 「(link mode)」を付記するか否かは README 表記慣行に従う）
- 他 REQ エントリで README と frontmatter title のズレが無いか横展開確認

## 現在の追跡状態

- PR #1195 Findings: scope out（4 ファイルスコープ外）
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
- 本 intake の SPEC 確定候補: なし（データ整備作業）

## 備考

本ズレは ADR-0131 link mode 移行時に README.md が追従できなかった事例。REQ-0141.md frontmatter が SSoT であるため、README.md 側を frontmatter に合わせる形で解消する。REQ-0112-053（superseded_by 形容表的言及）の対象ではなく、現行語彙の陳腐化に分類される。
