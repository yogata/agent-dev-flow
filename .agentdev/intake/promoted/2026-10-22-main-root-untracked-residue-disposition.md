# main root の既存未追跡残存の運用処置（gitignore 追加 または 承認一覧登録）

## 観測内容

main root には `.tmp-jev-analysis/`、`src/common/tools/agentdev-gh/tests/tmp-runner-cli-*/`、`.local/` 等の未追跡かつ gitignore 管理対象外の残存が観測されている。IR-073（check_integrity 未追跡残存検査）の恒常運用が main root 起点で始まると NG 検出（exit 1）となる。

- 検査実行が承認を自動追加することはない（IR-073 契約）。承認登録には provenance（起因の由来、正当化の参照先、適用日）が必須

## 影響

- IR-073 恒常運用の main root 起点実行が NG（exit 1）となり、リリース前の「正常な検証」条件を満たさない。
- 未追跡残存の放置は domain state（Jev 観測等）の永続化漏れの温床になる。

## 確定した処置（パス別。HITL 代理回答 2026-10-27 確定）

1. **Jev 観測（既存2件 + learning-promote 新生成6件の8件）**: (1) コミット確定。**親 orchestrator が実行済み**（commit ece068dce、push 済み）。
   - 根拠: (i) `.agentdev/jev-observations/` に 430件が git 追跡済みであり「Jev 観測はコミット」がリポジトリの確立運用（`chore(agentdev): persist ... Jev observations` 系コミット多数）。Jev 観測契約（識別子安定性・再現可能性）が git 追跡を要求し、.gitignore 化は運用と矛盾、ng-baseline 登録は追跡対象の誤った例外化、(ii) 利用者指示「既存ファイルを保持」はコミット（保持の最強形態）で充足される、(iii) 前担当の「利用者がコミット禁止」主張は利用者原文未確認のため承認根拠にも不採用根拠にもしない（リポジトリ運用実績を正として中立判断）
2. **`src/common/tools/agentdev-gh/tests/tmp-runner-cli-*`（400+ ディレクトリ現存。テスト実行残骸・ランダム接尾辞）**: (2) `.gitignore` パターン追加を後続要求（RU）の内容とする（テンポラリテスト出力は正規の非追跡領域）。物理残骸の削除とテスト後クリーンアップ改善も同じ RU に含める。今回の物理削除は行わない（利用者指示により処置選択肢から削除が除外されているため）
3. **`.tmp-jev-analysis/`（単発の解析スクラッチ領域。現存確認済み）**: RU の削除対象とする。単発解析スクラッチであり恒久 ignore パターン化・コミットは不適切。削除により再発しない
4. **`.local/`**: 実測で不在のため対象外

## 課題

- 上記 2〜3 の後続要求（RU）を backlog-review 経由で RU 化する（`.gitignore` パターン追加 + `tmp-runner-cli-*` 物理削除 + テスト後クリーンアップ改善 + `.tmp-jev-analysis/` 削除）。

## 既存要件との関連

- REQ-010-084、docs/designs/integrity/rules/IR-073-untracked-residue.md、Issue #3841（closed）、PR #3843
- `.agentdev/jev-observations/` 状態表（.agentdev/README.md: git 管理対象の観測 domain state・削除条件は設定しない）

## 出典

- 観測元: PR #3843 本文 Findings（Case #3841 case-close 時の Capture 回収。実測は case-close 前回実行時の IR-073 関連観測）
- 分類確定: HITL 代理回答（利用者の権限付与による Hermes 監督・根拠記録済み。2026-10-27）
