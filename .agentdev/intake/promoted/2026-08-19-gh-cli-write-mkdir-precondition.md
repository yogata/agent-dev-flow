# gh-cli WRITE 手続きに .agentdev/tmp/ 事前作成の mkdir 手順例が無い

## 観測

standard-procedures.md の WRITE 手続き（Section 2 Step 1）も `.agentdev/tmp/` 直書き時に親ディレクトリ不在で失敗し得る。READ 手続き（Section 3）には Issue 2247（OU-0028）で mkdir 手順例（New-Item -ItemType Directory -Force / mkdirSync(recursive:true)）が追加されたが、WRITE 側には同じ手順例が無い。

## 今回扱わない理由

Issue 2247（OU-0028）の対象範囲は READ 経路（gh-read-*）。WRITE 側の既存 cleanup 規定は維持対象外として扱われた。

## 影響

WRITE 手続きで `.agentdev/tmp/` が未作成の環境에서一時ファイル書き出しが失敗し得る。

## レビューで決めること

- READ 側に追加した mkdir 手順例の WRITE 側（Section 2 Step 1）への準用を実施するか

## 根拠

- PR 2283 本文「Findings / Capture候補」2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2283）
