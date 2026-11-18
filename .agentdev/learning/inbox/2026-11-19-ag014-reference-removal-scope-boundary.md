---
id: learn-20261119-ag014-reference-removal-scope-boundary
created_at: 2026-11-19
source: case-run deviation capture (Root Case #4150・PR #4161)
status: inbox
---
# AG-014 参照除去の判定を「現行案内の参照」に限定した結果、実装パス記述（B3-1 契約の機械検査対象）の現行化漏れが残った

- 問題事象: AG-014 の「参照除去」判定を「現行案内としての参照」に限定したため、IR docs の detection_method・regression_test の実装パス記述（B3-1 契約の機械検査対象）の現行化漏れが残った。旧 checker 名の現行案内の残存として発見され、40 ファイル超を現行化して解消した
- 発生局面: case-run（Issue 4156・Case 4150 Wave-4・PR 4161・TS-014）
- 検知方法: AG-014 対象全域（719 ファイル）の grep 分類
- 根本原因: 参照除去対象の判定基準で、「機械検査対象として記述される実装パス」と「履歴記録（Decision・REQ・knowledge・provenance）」の境界を区別せず、前者を現行案内としての参照のみの対象とした
- 自律対応内容: IR docs の実装パス記述を現行 rules レジストリへ整合する現行化を実施（40 ファイル超）。remediation-routing の旧 learning パス現行案内も現行化
- ユーザー確認有無: なし（現行化の範囲内で機械検査対象の記述整合を解消）
- Decision/REQ/spec 影響: 特になし（現行化の範囲内）
- 横展開観点: 現行化系の横断 grep は「現行案内としての参照」「機械検査対象の実装パス記述」「履歴記録」を別カテゴリとして分類する。実装パス記述は B3-1 契約（checker 実行契約）の検査対象として現行化義務を負い、履歴記録との境界は「現行の意味を持つ記述」の有無で判定する
- 再発条件: checker 実行契約（B3-1）を参照する実装パス記述を含む docs の横断現行化を行う場合
- 予防策候補: 現行化対象の grep 分類表に「実装パス記述（機械検査対象）」カテゴリを前置で設け、現行化義務の判定を分類時点で行う
- 想定反映先: checker-execution-contracts.md の現行化手順、AG 系検証手順の分類前置
- 関連: Case 4150、Issue 4156、PR 4161（Findings F4）
- タグ: 現行化、grep 分類、B3-1 契約、実装パス記述
