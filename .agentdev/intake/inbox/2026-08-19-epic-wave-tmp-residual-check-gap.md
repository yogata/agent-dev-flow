# case-close Epic Wave ルート（E1〜E6）に .agentdev/tmp/ 残存確認が無い

## 観測

case-run（STEP-S6/W5）、case-close single ルート（STEP-6-6）、case-auto（STEP-8）へ tmp/ 残存確認が追加された一方、case-close の Epic Wave ルート（E1〜E6）には同種の tmp 残存確認を置く STEP が存在しない。

## 今回扱わない理由

Issue 2247（OU-0028）の対象範囲は single ルートの完了判定・終了条件系 STEP。Epic Wave ルートは対象外だった。

## 影響

Epic Wave クローズ実行時に .agentdev/tmp/ へ一時ファイルを作成した場合、残存確認の実施枠が workflow 定義上に無い。

## レビューで決めること

- Epic Wave ルート（E6 の Wave 完了報告前段等）へ tmp/ 残存確認を追加するか

## 根拠

- PR 2283 本文「Findings / Capture候補」3件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2283）
