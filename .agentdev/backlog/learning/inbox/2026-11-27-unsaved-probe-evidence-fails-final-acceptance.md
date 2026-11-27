---
id: 2026-11-27-unsaved-probe-evidence-fails-final-acceptance
created_at: 2026-11-27T23:58:00+09:00
source: case-close (Wave 1 #4229 の実行・最終受入 capture)
status: unreviewed
---

# 未保存の probe を証拠に挙げると最終受入で証拠不足になる（証拠はコミット済み試験か記録された実行で残す）

- **問題事象**: Wave 1 の初回委譲（DEL-4229-1）が実行したリリース ZIP 版 15 通りの検証（PR 本文では「ZIP smoke v3 21 assertion」「SW1-SW7」と呼称）はスクリプトも出力も保存されず、PR 本文の記述だけが残った。第 2 回最終受入（2026-11-27 13:09 JST、head 2fdcd8a3e）は完了条件 1・6 を証拠不足 (l) として判定保留にし、修正委譲（DEL-4229-2、ZIP 版コミット済み試験 43 件の追加）が発生した
- **発生局面**: case-run（実行委譲の検証実行）と case-close（最終受入の証拠評価）
- **検知方法**: case-close 第 2 回の反例 (l) と intake 項目 (f)（判定記録 findings-r3.md）。コミット済み試験の探索と .agentdev/integrity/reports/ の証跡探索で不在を確認
- **根本原因**: 検証をセッション内のアドホックな実行（保存されないスクリプトと出力）で済ませ、証拠方針（コミット済み試験または証跡ラベル付きの保存実行）を満たさなかった
- **自律対応内容**: 修正委譲 DEL-4229-2 で ZIP 版のコミット済み試験（archive-installer-selection.test.ts、43 試験）を追加し、PR 本文を実行記録付きに更新して第 3 回で合格した
- **ユーザー確認有無**: なし（差し戻しと修正は case-auto の自工程で判断）
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 実行委譲の検証は「コミット済み試験」か「証跡ラベル付きの保存実行」のどちらかで残す。PR 本文の主張だけでは最終受入を通らない
- **再発条件**: アドホックな probe の結果を PR 本文に記述して証拠として挙げる運用
- **予防策候補**: 実行委譲の契約に「保存されない実行を証拠に挙げない」を明記する（DEL-4230-1 の検証義務にある観測証跡の要求はこの形式化）
- **想定反映先**: agentdev-case-run-execution-adapter の委譲契約、agentdev-quality-gates の証拠要件
- **関連**: Issue #4229、PR #4231、findings-r3.md の (f)(l)、.agentdev/backlog/learning/inbox/2026-11-25-delegate-split-impl-and-pr-evidence-to-files.md
- **タグ**: `#evidence` `#case-run` `#case-close`
