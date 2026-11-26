---
id: 2026-11-27-completion-condition-count-breakdown-self-contained
created_at: 2026-11-27T02:22:00+09:00
source: case-ready (Root Case #4227 の自工程 deviation capture)
status: unreviewed
---

# 完了条件に書く件数と内訳は、削除する draft や RU だけを根拠にしない（本文に内訳を展開し、対応する REQ 行を明示する）

- **問題事象**: 子 Issue #4229 の完了条件の 1 つが「新規導入と更新の7通りの起動」とだけ書いており、7 通りの内訳が要件ドラフト（`.agentdev/drafts/req-draft-new-host-full-workflows-and-consumer-host-selection.md` 852 行）にしかなかった。REQ-099.md と RU-0308 に「7 通り」の記述はない。case-ready は STEP-7 で draft と RU を削除するため、削除後は子 Issue 本文だけでは検証義務を確定できない。ほかに、対応づける完了条件がない対象要件行が 3 行あった（REQ-002-007、REQ-002-047、REQ-009-002）
- **発生局面**: レビュー（Root Case #4227 の case-ready、STEP-5 で作成した子 Issue 本文の QG-2 確認。2026-11-27 01:53 JST）
- **検知方法**: QG-2 の観点6（数値閾値の到達可能性）と観点9（受け入れ義務の投影と検証義務の確定）の確認。完了条件ごとの REQ 対応を機械的に数え（対象 30 行）、数値の出所を REQ・RU・draft で検索した
- **根本原因**: 完了条件を受け入れ基準の単位でまとめ、件数はラベルとして書いた。draft の削除後も本文だけで検証義務が確定するという要件を、数値の内訳にまで適用していなかった
- **自律対応内容**: 検証ゲートの前に子 Issue 本文を修正した（#4229 は 01:54:52、#4230 は 01:56:46）。7 通りを本文に列挙して REQ-009-040 を対応づけた。REQ-002-007 と REQ-002-047 を #4229 の収録の完了条件に、REQ-009-002 を #4230 の公開入口の完了条件に加えた。読み戻した本文との機械的な比較で一致を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（完了条件の文言と REQ 行の対応づけの修正であり、要件と受け入れ条件の省略・弱化・反転はない）
- **横展開観点**: draft や RU を削除する工程の前に確定する完了条件は、削除対象だけを根拠とする記述を持たない。件数と閾値は本文に内訳を展開するか、削除後も残る正規成果物の行を引用する
- **再発条件**: 完了条件に件数をラベルとして書き、内訳を draft や RU に置いたまま case-ready の STEP-7 でそれらを削除するとき
- **予防策候補**: QG-2 の実施時に、完了条件内の数値のうち出所が削除対象の draft や RU だけのものを検出する。子 Issue 本文の作成基準に「件数は内訳を本文に展開する」を明記する
- **想定反映先**: `agentdev-quality-gates` の QG-2 reference（観点9）、`agentdev-workflow-case-ready` の execution-structure reference（子 Issue 本文の作成基準）
- **関連**: Root Case #4227、子 Issue #4229・#4230、REQ-009-040
- **タグ**: `#completion-criteria` `#qg-2` `#epic`
