# verify-only case の PR-less closure 経路の workflow 契約明示化

## 概要

case 2768（docs_chore・実装突合検証）で、検証のみで完了し PR 差分 0 件（branch = main と同一 commit、PR 未作成）の case を PR を作らずにクローズする処分（PR-less closure / verify-only completion）が必要になった。case-auto が bounded parent decision として本案処分（carrier commit の捏造却下を含む）を確定し、case-close は PR-less closure としてクローズした。ただしこの経路は case-close workflow の PR なし特例フロー（docs_chore、main 直接 push 済み）の適用条件への解釈適合として扱ったものであり、verify-only case を第一級の closure 経路として明示する workflow 契約は存在しない。

## 内容

- verify-only case: case-run 委譲結果が全 success criteria 充足・branch = main 差分ゼロ・PR 未作成で終わるケース。Design 反映済み commit（design-save 等）が既に main へ配信済みで、case-run 相当工程が検証のみで完結する
- case-close workflow の特例フロー適用条件は「docs_chore、main 直接 push 済み」を前提とし、「PR 未作成・branch 差分ゼロで終わった検証完了 case」を正面から記述していないため、適用可否が実行時解釈に委ねられる
- carrier commit（差分捏造）による verify-only PR の作成は検証証跡の汚染であり禁止すべきだが、その禁止と PR-less 完了時の証拠ソース契約（検証証跡コメント等、PR 本文代替）が品質ゲート契約に未定義（quality-gates の「verify-only PR」節は PR 本文を証拠ソースとする前提）

## 根拠

- 観測元: case 2768 / Issue 2768（case-run 証跡コメント issuecomment-5633267203、case-close 完了コメント issuecomment-5633324373）、case-close（2026-09-11）で回収
- 元テキスト: case-auto working assumption「検証のみで完了する docs_chore case は、Design 反映済み commit を最終成果物として、QG-4 を直接 commit 内容と検証証跡コメントで判定し PR を伴わずにクローズできる」（carrier commit の捏造は明示却下）
- 処分経緯: case-run 委譲 DEL-2768-1 が `blocked`（全検証合格・PR 差分 0 件）で持ち帰り、case-auto が PR-less closure（verify-only completion）へ処分解決
