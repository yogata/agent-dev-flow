---
id: learn-20261119-untracked-inspection-false-clean-catch-empty
created_at: 2026-11-19
source: case-close capture (PR #4158)
status: inbox
---
# 未追跡検査の「検査不能を合格とする」誤合格パターン（catch で空配列を返し上位が合格扱い）

- 問題事象: 未追跡残存検査の catch 節が空配列（違反0件＝合格）を返し、git コマンド実行不能などの検査不能事象が合格として扱われていた。検査の失敗と検査対象の清浄が区別されない false-clean である
- 発生局面: case-run STEP（Issue 4154・Case 4150 Wave-2・PR 4158。旧 check_integrity 由来の未追跡検査を新検証エンジンへ移行する際の実装確認）
- 検知方法: 移行対象コードの能力保持確認における検査系 catch 節の戻り値点検（実装レビュー）
- 根本原因: 検査系コードの例外発生時フォールバックを「違反なし」の正常系戻り値で実装しており、検査不能（fail-closed で停止すべき状態）と清浄（0件）の区別が戻り値の型に現れていなかった
- 自律対応内容: detectUntrackedResidue を検査不能時の例外 throw と CLI exit 2 へ修正し、実 Git 一時 fixture による回帰試験（未追跡検出・tracked/ignored 除外・インデックス破損時 exit 2）を新設した
- ユーザー確認有無: なし（REQ-010-084 の検査能力維持の範囲で修正）
- Decision/REQ/spec 影響: REQ-010-084（未追跡ファイル検出）、検証エンジンの rules/untracked-residue と builtin 検査の実装規約
- 横展開観点: 「catch で空配列・既定値を返す」実装は検査系コード全般の誤合格パターンとして汎化できる。検査不能は例外 throw または結果型の不明状態で表現し上位で fail-closed に扱う。レビュー観点として「この catch の戻り値は検査不能と清浄のどちらを意味するか」の点検を置くと同種欠陥を発見しやすい
- 再発条件: 検査・計測系コードの例外処理を正常系の戻り値型（配列・数値・boolean）で代替実装する場合
- 予防策候補: 検査系関数の戻り値に検査不能状態を型で表現する（throw または結果判別和）。catch 節で合格値を返さない規約を検査系コードへ適用する
- 想定反映先: docs/designs/integrity/integrity-engine-plugin-architecture.md（ルール実装規約）、docs/designs/integrity/checker-execution-contracts.md（検査不能の扱い）
- 関連: Case 4150、Issue 4154、PR 4158
- タグ: 検査系コード、誤合格、fail-closed、例外処理、レビュー観点
