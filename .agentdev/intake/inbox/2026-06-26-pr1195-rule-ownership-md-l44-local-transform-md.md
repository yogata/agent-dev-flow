# rule-ownership.md L44 の local-transform.md 行が削除済み transform/ パスを参照

## 発生源

- Issue: #1193（CLOSED, COMPLETED, case-close 完了）
- PR: #1195（merged, squash 8e66106b）
- 発生日: 2026-06-26

## 内容

PR #1195 の Findings セクションで指摘。`docs/specs/rule-ownership.md` L44 は local-transform.md SPEC の対象を「変換用プロンプト（`transform/generate.md`）...の要件」と記載しているが、本 PR #1195 で `transform/` ディレクトリを完全削除したため、当該パスにファイルが存在しなくなった。

local-transform.md SPEC は意図的な履歴ドキュメント（削除対象外）として残置されており、記述自体は履歴参照として成立する。ただし文面を字義通りに読むと「現存しないファイルの要件」として誤読される余地がある。Issue #1193 の 4 ファイルスコープ外のため本 PR #1195 では対処せず。

## 推奨対応先

別 Issue（docs_chore）として切り出すことを推奨。作業候補:

- rule-ownership.md L44 の記載を「歴史的参照」である旨を明示、または別の存続ファイルへの参照へ読み替え
- local-transform.md SPEC が現在も参照すべき対象（link mode 移行後の実体）が存在するか確認し、存在しない場合は当該行全体の整理を検討

## 現在の追跡状態

- PR #1195 Findings: scope out（4 ファイルスコープ外）
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
- 本 intake の SPEC 確定候補: なし（既存 SPEC の語彙整備作業）

## 備考

local-transform.md SPEC 自体は ADR-0131 link mode 移行後も履歴参照目的で残置が妥当（PR #1195 Findings で確認済み）。本 intake は rule-ownership.md 側の参照表記整合性に限定した課題であり、local-transform.md SPEC の廃止を意味しない。
