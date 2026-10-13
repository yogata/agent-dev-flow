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

## prepare_definition_pr の check_integrity gate が base 起因の既存債務で fail した場合の対照救済と残ゲート消費の手順が reference にない

- **問題事象**: case-open STEP-4 の prepare_definition_pr 実行で、自 Case 変更と無関係の既存債務（base revision 起因の NG 16件）により check_integrity gate が exit 1 で fail し、後続抑止により traceability gate が未実行のまま script が終了した。設計PR 作成は失敗ではなく、手順上の扱いが reference に定義されていなかった
- **発生局面**: 実装（case-open STEP-4 機械工程の script 呼び出し。並行 case-open 委譲実行）
- **検知方法**: script 報告 JSON の step status（check_integrity: fail、exitCode 1、NG 明細）と、NG 16件の全件が本 Case 対象ファイル外（phase 系 skill・system.md 同期・frontmatter 鮮度）であることの突合
- **根本原因**: check_integrity はコーパス全体の既存債務を検出するため、base で既に NG があると本変更起因でなくても必ず fail する。traceability gate 判定仕様には対照救済（worktree HEAD と main HEAD の両方で check を実行し findings 完全一致を機械証明）の規定があるが、check_integrity 向けの対照救済と、後続抑止で止まった残ゲート（traceability check）の消費手順は reference（definition-pr-and-idempotency.md）に明文化されていない。script は one-shot 設計のため、再実行すると definitionEdits の再適用（旧文不在失敗）になる
- **自律対応内容**: base revision（branch 作成元 origin/main HEAD）の detached worktree で check_integrity を再実行し、NG findings 16件が完全一致・差分 0 件であることを機械証明して本変更起因の検出悪化 0 件を根拠づけ（traceability gate 判定仕様の対照救済を準用）、証拠を PR 本文へ記録した。残ゲートは消費関数 consumeDefinitionTraceability（script lib の単一実装）を checker 実行結果へ直接適用して判定（pass=11 fail=0、deferred なし）し、報告 JSON の check_integrity 提案本文「check_integrity: 本 script 実行内で成功」を意味レビューで訂正して PR 作成可と判断した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存契約の準用。手順の明文化は learning-promote での判断に委ねる）
- **横展開観点**: コーパス全体を検査する必須ゲート（check_integrity、docs-check 等）を Case 専用 machine 工程で実行する構成全般に、base 対照による既存債務分離と、後続抑止時の残ゲート消費手順（単一実装の消費関数の直接適用）が同様に適用可能
- **再発条件**: Case 変更と無関係の既存 NG が base に存在する状態で、prepare_definition_pr 等の one-shot machine 工程 script がコーパス全体検査を実行する場合
- **予防策候補**: definition-pr-and-idempotency.md へ、check_integrity gate の対照救済手順（base 対照の実施方法・証拠の PR 記録）と、後続抑止時の残ゲート消費手順（lib 消費関数の単一実装適用、definitionEdits 再適用の回避）を明文化する。あるいは script 側で base 対照比較を内蔵し報告に含める
- **想定反映先**: case-open スキル reference（definition-pr-and-idempotency.md の gate 判定仕様節）または prepare_definition_pr script の拡張。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、PR #3687、Issue #3679、scripts/lib/definition-traceability-gate.ts、Issue #3684（phase 系 NG の処遇 Case）、Issue #3675（frontmatter 鮮度 NG の処遇 Case）
- **タグ**: `#case-open` `#machine-gate` `#対照救済`

