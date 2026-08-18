# skill SPEC 36ファイル中31ファイルに一文一行是正対象行が存在する（corpus 一括是正候補）

## 観測

skill SPEC 36ファイルのうち31ファイルに、一文一行機械判定（mechanical-replacement-rules.md Section 4）の是正対象行（複数文 prose 行）が存在する。

## 今回扱わない理由

PR #2266（Issue #2224）は backlog-auto SPEC の該当1行のみ是正（TS-QC-001 対象分）。他ファイルへの一括是正はスコープ外。

## 影響

skill SPEC corpus の大部分が機械判定違反行を含む状態で、個別 PR のたびに是正判断のコストが発生する。

## レビューで決めること

- corpus 一括是正（31ファイル一括の機械是正 PR）を実施するか、個別 Issue 触抗時に順次是正するか
- 一括是正の場合の AUTOGEN 索引再生成・チェッカー影響の事前確認手順

## 根拠

- PR 2266 本文「Findings / Capture候補」intake 小見出し2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2266）
