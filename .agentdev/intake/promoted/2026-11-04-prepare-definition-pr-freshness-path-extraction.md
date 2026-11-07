# prepare_definition_pr.ts extractFreshnessTargets の REQ freshness 報告形式未捕捉

## 観測内容

case-open STEP-4 機械工程 script（`src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts`）の `extractFreshnessTargets` は、check_integrity の req-updated-freshness 報告から対象パスを `/for ((?:docs|src|scripts)[^\s:]*\.md):/g` で抽出する。check_integrity の REQ freshness 報告は REQ ファイルを `for REQ-105.md:` 形式（`docs/requirements/` プレフィックスなしのファイル名のみ）で報告するため一致せず、REQ ファイルの frontmatter updated 補正が script 内 measurement-convergence step で完結せず、script が fail 終了する。

実測: Case #3910（PR #3912）の初回 check_integrity で REQ-105.md を含む 5 件の NG を報告し、convergence の frontmatterUpdatedTargets は design 4 ファイルのみで REQ-105.md が欠落、手動 contingency（明示パス指定補正 commit 20a6eb9e8 + 新 HEAD での check_integrity・traceability check 完了）で救済した。

観測元: Case #3910（Root Case Issue #3910）case-open STEP-4 実行記録、PR #3912 本文検証欄。

## 影響

REQ ファイルの freshness 補正が script で完結せず、手動 contingency が同種 Case で再発する。REQ-117-011 の趣旨（機械工程実行で手動補正 commit を不要にする）に反する非適合状態が継続する。

## 課題

修正候補: (1) REQ ファイルの報告形式（ファイル名のみ）への対応追加、(2) NG 報告対象と補正適用対象の差分検査（補正漏れ検出）の script 組込み。

## 既存要件との関連

- REQ-117-011（実装済み: prepare_definition_pr.ts の measurement-convergence step）の受入条件に対する非適合（nonconformance fix）として扱うのが適切である。対論型レビュー（intake-promote STEP-2）で現在の main HEAD において正規表現の未対応状態を実在確認済み。
- 修正は REQ-117 系（機械工程の堅牢化）との突合の下で実施することを推奨（item 自身の推奨と対論型レビューの判定が一致）。
- 同一観測の再発防止知見は learning 線に記録済み（`.agentdev/learning/inbox.md` の Case #3910 workflow_deviation エントリ）であり、本 item は intake 側の修正候補のみを扱う（Split Rule に従う分割済み状態）。
