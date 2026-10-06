# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 複数ファイル一括機械処理は全検証をメモリ完結後に一括原子書込する（部分書込後の検証 throw で中間状態が残存）

- **問題事象**: learning-promote STEP-6 の deferred 移動・prune を node スクリプトで実行した際、prune 判定の startsWith チェックがエントリ区切りの改行揺れで1件を誤除去と判定し検証 throw した。throw 時点で deferred.md への追記は未着手だったが、同スクリプト内の先行ステップで inbox.md は既にヘッダーのみへクリア済みだったため、30エントリが inbox から消え deferred にも存在しない中間状態が発生した（git 復元で回復、最終的に全処理成功）
- **発生局面**: 運用（learning-promote STEP-6 の原子的移動プロシージャ機械実行。同一リポジトリで workflow 内の複数ファイル書込）
- **検知方法**: スクリプト内の検証ステップ（prune 対象見出し数と staged+duplicate 数の突合）が throw。直後の git status と `git show HEAD:.agentdev/learning/inbox.md` で消失エントリを確認
- **根本原因**: 複数ファイルへの書込を段階的に実施し、各段階の後に検証を置く構成だった。検証 throw は書込済みファイルを巻き戻さないため、検証が「成功した書込の確認」ではなく「後続書込の gate」になっていない配置だと、throw 時点で中間状態が残る。加えて prune 判定の見出しマッチが文字列開始比較（startsWith）で改行揺れに脆かった
- **自律対応内容**: (1) `git show HEAD:.agentdev/learning/inbox.md` で直前 commit から30エントリを復元した。(2) スクリプトを、全ファイル内容をメモリ上で構築し全検証（見出し数・処分判定数・移動日数・文字化け・BOM/CRLF）を全て成功させてから3ファイルを一括書込する構成に修正し、再実行して成功した。(3) 検証失敗時は何も書込まないことを確認済み
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の原子的操作プロシージャの適用実装の改善。契約変更なし）
- **横展開観点**: 複数ファイルを同時に更新する機械処理（移動・prune・変換・リネーム一括適用等）では、ファイルシステムへの書込を成功判定の後ろに全て配置する。部分書込が発生する既存スクリプトは、検証 throw がどのタイミングでも「元の状態」または「完了状態」の二択になるかを点検する価値がある
- **再発条件**: 複数ファイルへの分割書込を伴う機械処理で、検証ステップが書込ステップの間に挟まれている構成。検証が throw する正当なケース（バグ・データ揺れ）で実際に中間状態が残る
- **予防策候補**: 複数ファイル一括処理の機械実行は「メモリで全構築→全検証→一括書込」の順を標準とする。既存プロシージャ（deferred-atomic-move-procedure 等）の機械実行例にこの順序設計を明記する
- **想定反映先**: agentdev-learning-pipeline の deferred 原子的移動プロシージャ reference（機械実行時の実装規律）、横断的には既存対策更新系（一括機械変更の write 規律）と同型
- **関連**: backlog-auto 2026-10-06 実行、commit f549e506（回復と最終成功を同一 commit に含む）
- **タグ**: `#atomic-write` `#learning-promote` `#node-script` `#partial-write`

---

## 構成検証を GitHub Issue 作成後に実行した（execution-structure 契約は作成前実行を要求）

- **問題事象**: case-ready STEP-5 の構成検証（Epic サイズ上限・必須依存維持・全割当）を、子 Issue 9 件の GitHub Issue 作成後に実施した。execution-structure 契約は「構成確定後かつ GitHub Issue 作成前に構成検証を実行する。上限超過または構成不備を検出した場合は停止する（Issue を作成しない）」を要求する。結果は合格（子 Issue 9 件で上限 10 未満・必須依存 0 エッジで前提列整合・21 OU + 13 RA + 16 TS 全割当）で構成不備は生じなかったが、不備検出時に Issue 作成を止める保護が機能しない順序だった
- **発生局面**: 運用（case-ready STEP-5 実行構造確定。Case #3507）
- **検知方法**: Epic Issue 本文更新の実装中に execution-structure reference の「GitHub Issue 作成前」条件を再確認し自検知
- **根本原因**: 構成確定と Issue 作成を連続実行する計画で、構成検証を独立した前置ステップとして組み込んでいなかった。上限計算・割当突合が決定的計算で済むため検証を後回しにした
- **自律対応内容**: 作成後に構成検証を実行し合格を確認。構成不備なしのため Issue 是正は不要と判断し、本 deviation を capture
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行順序の遵守漏れ。契約変更なし）
- **横展開観点**: 「X を実行する前に Y を検証し、不備なら X を行わない」型の契約では、Y を X と同一の作業ブロックに置かず前置ステップとして明示実行する。決定的計算で済む検証ほど後回しになりやすい
- **再発条件**: 作成系操作（Issue 作成・commit・push）の直前に要求される検証を、作成系操作と同一ブロックで後置実行する場合
- **予防策候補**: execution-structure 手順で構成検証を独立した前置ステップ（検証合格を Issue 作成の開始条件とする）として明記する
- **想定反映先**: agentdev-workflow-case-ready の execution-structure 運用（手順明記は case-ready Design 所有）
- **関連**: Case #3507 case-ready 実行（Definition merge ad22ea16 後）
- **タグ**: `#execution-structure` `#case-ready` `#ordering-violation` `#structure-verification`

---
