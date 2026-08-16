# Intake Item: テーブルセル em-dash 表記政策の未統一（パターン D vs 肯定表現マトリックス）

## 発生源

- PR: #2154 (Issue #2143 / OU-009, Epic #2134 Wave 3)
- 発生 phase: case-close QG-4 再検証（プレースホルダ残 grep の再実行で発見）
- capture 分類: intake（表記政策の検討候補。Epic 最終クローズ時の QG-4 由来）

## 問題

mechanical-replacement-rules.md §2 パターン D はテーブルセルのスタンドアロン em-dash（`| — |`）を N/A プレースホルダとして `| - |` へ置換する機械置換と定義する。
PR #2154 は配布 skill 4 ファイル 12 セルへ適用した一方、docs 側 SPEC 3 ファイル（inspect-promote.md 2 セル、project-extensions.md 1 セル、integrity-contracts.md 16 セル）には同種の `| — |` が残存する。
integrity-contracts.md の Workflow×使用ツールマトリックスは「全セル肯定表現（✓ または —）」を明文宣言しており、残る 2 ファイルも同種のマトリックス値表記とみなせる。
しかし PR #2154 の検証エビデンス行は「`| — |` プレースホルダ grep（docs + src/opencode）0 件」と記載しており、実態（docs 側残存）と記述が整合しない。

## 推奨対応

パターン D の適用対象（N/A プレースホルダ）と意図的マトリックス表記（肯定表現）の判別基準を mechanical-replacement-rules.md に明文化する。
併せて、docs 側残存セルの扱い（統一置換 or 肯定表現として保有）を確定し、PR #2154 エビデンス記述の補正方法も整理する。

## 関連

- Issue: #2143 (CLOSED), Epic: #2134
- PR: #2154 (検証エビデンス表、mechanical-replacement-rules.md §2 パターン D)
