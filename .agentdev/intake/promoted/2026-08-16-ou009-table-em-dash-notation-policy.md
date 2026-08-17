# テーブルセル em-dash 表記政策の未統一（パターン D vs 肯定表現マトリックス）

## 観測内容

mechanical-replacement-rules.md §2 パターン D はテーブルセルのスタンドアロン em-dash（`| — |`）を N/A プレースホルダとして `| - |` へ置換する機械置換と定義する。PR #2154 は配布 skill 4 ファイル 12 セルへ適用した一方、docs 側 SPEC 3 ファイル（inspect-promote.md 2 セル、project-extensions.md 1 セル、integrity-contracts.md 16 セル）には同種の `| — |` が残存する。integrity-contracts.md の Workflow×使用ツールマトリックスは「全セル肯定表現（✓ または —）」を明文宣言しており、残る 2 ファイルも同種のマトリックス値表記とみなせる。しかし PR #2154 の検証エビデンス行は「`| — |` プレースホルダ grep（docs + src/opencode）0 件」と記載しており、実態（docs 側残存）と記述が整合しない。

## 影響

- パターン D の適用対象と意図的マトリックス表記の判別基準がないため、機械置換の適否が判定できない
- PR #2154 のエビデンス記述が実態と不一致のまま残る

## 課題

パターン D の適用対象（N/A プレースホルダ）と意図的マトリックス表記（肯定表現）の判別基準を mechanical-replacement-rules.md に明文化する。併せて、docs 側残存セルの扱い（統一置換 or 肯定表現として保有）を確定し、PR #2154 エビデンス記述の補正方法も整理する。

## 既存要件・成果物との関連

- SPEC: mechanical-replacement-rules.md §2 パターン D
- 対象: docs/specs/skills/inspect-promote.md、project-extensions.md、integrity-contracts.md
- 実績: PR #2154（配布 skill 4 ファイル 12 セル適用）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2154 (Issue #2143 / OU-009, Epic #2134 Wave 3) case-close QG-4 再検証
- 元 item: intake-2026-08-16-ou009-table-em-dash-notation-policy.md
