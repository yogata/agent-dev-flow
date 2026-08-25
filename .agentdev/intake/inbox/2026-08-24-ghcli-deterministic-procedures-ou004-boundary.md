# agentdev-gh-cli references の決定的処理手順残存（OU-004 境界棚上げ）

## 観測

PR #2432（Issue #2428、OU-001）の TS-003 検証により、`agentdev-gh-cli` references（standard-procedures.md、verify.md）に文字コード・シェル呼出・一時ファイル操作の実装手順（`[System.IO.File]::WriteAllText`、UTF8Encoding($false)、`$env:TEMP` 一時ファイル等）が残存していることが確認された。REQ-002-040 の配置基準では決定的処理の正規配置先は Custom Tool である。

## 今回扱わない理由

正規配置先の Custom Tool は OU-004（Issue #2431 管轄、Wave 3）の実装対象であり、OU-001 は対象外宣言（ガードレール識別体系の移行 OU-002、Custom Tool・Plugin/Hook 種別の実装 OU-003、GitHub I/O の Tool 移管 OU-004 は本 Issue 対象外）に基づき agentdev-gh-cli を境界スキルとして維持した。OU-001 の変更範囲に OU-004 の実装は含められない。

## 影響

REQ-002-040 の完全解消（配布成果物 Markdown からの決定的処理手順除去）は OU-004 マージ後の成立となる。OU-004 実装時に agentdev-gh-cli references の当該手順が削除・移管されない場合、REQ-002-040 の残存として再検出される。

## レビューで決めること

- OU-004（Issue #2431）実装時の削除対象ファイル・セクションの特定（standard-procedures.md、verify.md のどの範囲を Custom Tool へ移管するか）
- 移管後の agentdev-gh-cli スキルの扱い（役割廃止、縮小維持の別）

## 根拠

- PR #2432 本文「Findings / Capture候補」intake 1件目（発見元: TS-003 検証）
- Issue #2428「対象範囲」（本 Issue 対象外: GitHub I/O の Tool 移管（OU-004））
- Epic #2427 分解テーブル 3-1（#2431: GitHub I/O の Custom Tool 完全移管と agentdev-gh-cli の解消）
