# verify-only case の PR-less closure 経路の workflow 契約明示化

## 観測内容

case 2768（docs_chore・実装突合検証）で、検証のみで完了し PR 差分 0 件（branch = main と同一 commit、PR 未作成）の case を PR を作らずにクローズする処分（PR-less closure / verify-only completion）が必要になった。case-auto が bounded parent decision として本案処分（carrier commit の捏造却下を含む）を確定し、case-close は PR-less closure としてクローズした。

ただしこの経路は case-close workflow の PR なし特例フロー（docs_chore、main 直接 push 済み）の適用条件への解釈適合として扱われたものであり、verify-only case を第一級の closure 経路として明示する workflow 契約は存在しない。

## 影響

- verify-only case の closure が実行時解釈に委ねられ、適用条件の恒久性・再現性が保証されない
- carrier commit（差分捏造）による verify-only PR の作成は検証証跡の汚染として禁止すべきだが、その禁止と PR-less 完了時の証拠ソース契約（検証証跡コメント等、PR 本文代替）が品質ゲート契約に未定義（quality-gates の「verify-only PR」節は PR 本文を証拠ソースとする前提）

## 課題（対応候補と判断材料）

- verify-only case（case-run 委譲結果が全 success criteria 充足・branch = main 差分ゼロ・PR 未作成で終わるケース）を第一級 closure 経路として workflow 契約へ明示化する
- 明示化に含める要素: 適用条件（docs_chore 特例との関係整理）、証拠ソース契約（PR 本文代替の検証証跡）、carrier commit 捏造の禁止

## 既存要件との関連

- case-close workflow の PR なし特例フロー（docs_chore、main 直接 push 済み）: 現行の解釈拠点
- quality-gates「verify-only PR」節: 証拠ソース契約の現行定義（PR 本文前提）
- case-auto bounded parent decision: 処分確定の前例実績

## 根拠

- 観測元: case 2768 / Issue 2768（case-run 証跡コメント issuecomment-5633267203、case-close 完了コメント issuecomment-5633324373）、case-close（2026-09-11）で回収
- 元テキスト: case-auto working assumption「検証のみで完了する docs_chore case は、Design 反映済み commit を最終成果物として、QG-4 を直接 commit 内容と検証証跡コメントで判定し PR を伴わずにクローズできる」（carrier commit の捏造は明示却下）
- 処分経緯: case-run 委譲 DEL-2768-1 が `blocked`（全検証合格・PR 差分 0 件）で持ち帰り、case-auto が PR-less closure（verify-only completion）へ処分解決
- 処分経緯（intake）: intake-promote（2026-09-15）で採用を確定（ユーザー承認）
