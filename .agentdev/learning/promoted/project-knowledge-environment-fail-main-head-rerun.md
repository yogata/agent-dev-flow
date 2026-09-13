# main HEAD 再実行（対照実行）による環境起因 fail の切り分け

## 背景

高負荷環境で spawnSync 系テストがタイムアウト fail する等、環境負荷に依存して非確定的に fail するテストがある。fail が当該変更起因か環境起因かの切り分け手順として、main HEAD（PR 変更未適用・working tree clean）での再実行による対照実行が有効。既存の timeout 延長単独再実行手順（windows-bun-test-spawn-timeout-classification.md）と補完関係にある。

## 問題

- `timed out after 5000ms` 等のタイムアウト fail は機能的アサーション失敗ではなく環境性能要因だが、fail 出力だけでは区別できない
- タイムアウトで stdout が空になる場合 `JSON Parse error: Unexpected EOF` 等の二次エラーが混在し、判定を誤りやすい
- フル suite 実行時のみ fail する環境依存テスト（staging 系）も同様に、変更起因か既存起因かの分離が必要

## 望ましい変更

環境起因が疑われる fail について、(1) 既存手順（timeout 延長による単独再実行）に加え、(2) main HEAD（変更未適用）での同一テスト再実行による対照実行で再現するかを確認し、再現する場合は環境起因として記録する切り分け手順を知識化する。対照実行でも再現しない fail は変更起因として再評価する（環境由来と無条件に扱わない）。

## 対象範囲

- 対象: Windows + bun 環境の spawnSync 系テスト、フル suite 実行時のみ fail する環境依存テスト、fail 由来分類（QG-4 記録）
- 対象外: テスト自体の削除・timeout 無制限化（既存知識の禁止事項を維持）

## 反映先候補

| 種別 | パス | 変更内容 |
|---|---|---|
| knowledge | docs/knowledge/windows-bun-test-spawn-timeout-classification.md | 「単独再実行（timeout 延長）」への補完として main HEAD 対照実行による切り分け手順を追記 |
| knowledge | docs/knowledge/（本知識の新規文書化） | 対照実行による由来分類の一般手順（baseline 比較 delta 0 判定との関連付け） |
| Design | docs/designs/integrity/checker-execution-contracts.md | fail 由来分類手順への対照実行オプション追記 |

## 既存対策確認

- 確認結果: 部分的に既存（timeout 延長単独再実行による由来分類は windows-bun-test-spawn-timeout-classification.md で規定済み）
- 該当ファイル: docs/knowledge/windows-bun-test-spawn-timeout-classification.md
- ギャップ分類: application miss
- ギャップ詳細: timeout 延長では対応できない場合（suite 全体の負荷が要因等）の main HEAD 対照実行手法が未文書化。deferred 2026-09-05「基底 commit 再現比較で pre-existing 分離」と同根の手順の統合が必要

## 制約

- 環境由来と判定した記録には対照実行の実行条件（HEAD、working tree 状態、負荷状況）を含める
- 対照実行で再現しない fail を環境由来として扱わない（既存知識の「timeout 延長だけで無条件に環境由来と扱わない」を踏襲）

## 受け入れ条件

- [ ] main HEAD 対照実行による切り分け手順が既知知識と統合して文書化されている
- [ ] 環境由来判定の記録要件（実行条件）が定義されている
- [ ] 既存 timeout 系知識と矛盾しない

## 元learning item / 根拠

- 要約: 環境負荷依存の非確定的 fail を main HEAD 再実行の対照実行で環境起因と切り分ける
- 根拠: inbox 2026-09-12（spawnSync 回帰テスト 4 件が 5 秒タイムアウト fail、main HEAD で再現確認し環境起因と判定。Issue #1782/#2245 由来）+ deferred 2026-09-05（フル suite 時のみ fail する環境依存 staging テストを基底 commit 再現比較で pre-existing 分離）。発生3件相当
- 再発条件: 高負荷状態で spawnSync 系テストを含む suite を実行した場合
- 横展開可能性: spawnSync 外部実行テスト全般、環境依存 fail の由来分類が必要な全検証工程

## 推奨Issue分類

- 分類: feature（検証手順の知識化）
- 推奨ラベル: documentation, agentdev, verification
- 関連Issue: #1782, #2245（spawnSync 系テストの既知-issue）
