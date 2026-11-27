# 先行作業の投入・取り込み

stage 3 の Wave 境界で前工程の case-close を委譲する時点で、後続 Issue の確定済み Definition と前工程の未統合差分を突き合わせる。現在の基点で独立に作業・個別試験が可能な範囲を候補にする。担当別の読取・書込範囲と共有ファイルを列挙し、未確定のインターフェース、範囲不明、統合や共有成果物の作業は正式担当に残す。

## 投入

この経路では case-close・正式 case-run・先行作業の新規起動をすべて下記の投入判定で調整する。現行の工程・受入・権限ゲートは先に適用する。

1. 親が stage 3 の現在状態を観測し、スキル配下の `scripts/src/preparation.ts` を Bun で起動する。引数は `plan`、標準入力は下表の JSON オブジェクト。

   | 項目 | 指定する観測 |
   |---|---|
   | `nowMs`, `lastStartMs` | 親の現在時刻と最後の委譲起動の時刻。初回を確認できた場合だけ後者を null にする |
   | `observationComplete`, `baseSha` | 対象・起動時刻・稼働枠を照合できたか、検証した現在の基点 |
   | `active`, `closing` | 稼働中・未確認の委譲と、既存ゲートを通過した次の case-close 候補。各項目に kind・id・issue・実測した readPaths / writePaths を持つ。case-close は対象子 Issue を coveredIssues に含める |
   | `formal`, `records`, `dependentMergeInFlight` | 既存キューと同じ正式候補と観測レコード。formal に合意変更の反映確認と読取・書込範囲を持たせる |
   | `preparations`, `attemptedPreparations` | 安定した id、issue、baseSha、definitionConfirmed、contractReflectionConfirmed、independentOfUnmergedChanges、writePaths、readPaths、tests を持つ候補と、同じ実行ですでに試した id |
   | `protectedPaths` | 可変の共有ファイル、配布一覧、共有試験など候補へ所有を渡さない範囲 |

2. `case-close`・`case-run`・`preparation` が返れば、その1件だけを既存の背景委譲で起動する。起動直前に観測が変わっていれば判定をやり直す。親を単一の起動者とし、起動前の予約、起動結果の task ID、作業ID、起動時刻を同じ実行の一時記録に残す。受付結果が不明なら起動済みの可能性がある枠として計上し、同じ作業を再送しない。
3. `wait` なら空き枠や前工程の完了通知で再評価する。起動間隔中は返された retryAtMs より前に起動せず、既存の集約待機を使う。親は結果を回収し、待機専用モデル往復を作らない。混在経路は case-close を含めて同時5本以内。正式 case-run は依存ゲートと同じ Issue の稼働中先行作業の照合を通してから起動する。

## 実行と取り込み

先行作業は親が別 worktree・別ローカルブランチを用意して背景委譲する。先行担当には基点 SHA、許可パス、個別試験、対象外の共有範囲を渡す。個別試験とローカルコミットまでを担当し、GitHub 書込み、共有成果物の編集、正式完了判定、追加委譲は行わない。返却は基点・コミット・差分ファイル・個別試験証跡。親は起動・終了の観測時刻を記録し、Issue や Wave の完了には算入しない。

正式担当は依存充足後に、Git の実測値から同じスクリプトの `verify` へ `{preparation, receipt}` を渡す。receipt に verifiedBaseSha（Git の祖先関係から確認）、commitSha、changedPaths（基点からコミットまでの実 diff）、passedTests、officialBaseSha、protectedPaths を入れる。基点が進んだ場合は baseChangedPaths を基点間の Git 差分から追加する。結果が reusable の場合に限り、正式ブランチに適用して個別試験を再実行する。競合、範囲外、証拠不足、試験失敗は採用を見送り、正式担当が通常経路で残件を行う。最終 HEAD の品質ゲートと共有成果物の更新は正式担当が実施する。
