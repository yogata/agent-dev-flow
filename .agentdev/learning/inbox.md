# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---
## 並行 case-open 実行下で共通 Jev 観測の先行 commit が兄弟 Case に先取され commit メッセージと実体が乖離した

- **問題事象**: case-open STEP-1 の先行明示パス commit で、draft と共通 Jev 観測（Batch 単位観測 2件）を add 後に commit したところ、commit 実体は draft のみ（1 file）で、メッセージ「RU-0210 由来 draft と req-define Jev 観測を永続化」と乖離した。Jev 観測 2件は並行兄弟 Case（RU-0208 由来、commit 8f224096）が先に commit しており、本 Case の commit 実行時点で既に tracked だった
- **発生局面**: 実装（case-open STEP-1 引き継ぎ判定。並行 case-open 委譲実行）
- **検知方法**: commit 後の git show --stat と git ls-files による実体確認（1 file changed と ls-files 登録の突合）
- **根本原因**: 複数の並行 Case が同一の Batch 単位 Jev 観測ファイルを消費対象として検出・commit する構造のため、add と commit の間に兄弟 Case の commit が挟まると、自 Case の commit pathspec から対象が外れる race 状態になる。先行 commit 手順は add 直後のステージ実体確認を含まない
- **自律対応内容**: commit 実体を git show --stat / git ls-files で確認し、Jev 観測は兄弟 Case の commit（8f224096）で既に永続化済みであることを確認して受け入れた。amend によるメッセージ修正は並行 push 競合の危険があるため実施せず、乖離を WARNING 記録として残した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Batch 単位の共通観測を複数 Case が消費する構成では、commit 実行直前にステージ内容（git diff --cached --stat 等）とメッセージの一致を確認する運用が同種 race 全般に有効
- **再発条件**: 並行 case-open で同一 Jev 観測（Batch 共通観測）を複数 Case が検出・commit 対象に含め、一方が先に commit した場合
- **予防策候補**: 先行明示パス commit 手順に、commit 実行直前のステージ実体確認（git diff --cached --name-only と意図対象の突合）と、実体が空になった対象の除外を組込む。あるいは共通観測の検出時に既に tracked な分を add 前に除外する
- **想定反映先**: case-open スキル reference（handoff.md の先行 commit 手順）または learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、commit 9f7c8ffe（draft のみ）、commit 8f224096（兄弟 Case による Jev 観測 commit）、Issue #3678
- **タグ**: `#case-open` `#git` `#並行実行`

