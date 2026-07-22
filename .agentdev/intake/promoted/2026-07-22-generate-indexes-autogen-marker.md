# generate_indexes.ts AUTOGEN marker backtick 認識 bug

## 観測内容

`generate_indexes.ts` が SPEC ファイル内の backtick 囲み AUTOGEN marker 記述を実 AUTOGEN marker と誤認し、実際の AUTOGEN block を認識せず途中停止する。PR #1717（Findings 記載）で発見し、PR #1718（case-close QG-4）で暫定対応した。

対象は `docs/specs/quality/spec-health-metrics.md`。L26 の説明文が backtick 囲みで AUTOGEN marker を言及している。L57 に実際の AUTOGEN block（`spec-metrics-measurement-example`）が存在するが、parser は L26 の backtick 囲み marker を先に認識し、正常な AUTOGEN block を検出できないまま停止する。

PR #1718 では L26 の HTML コメント構文を抽象化（意味変更なし）し parser の誤認を解消した。ただしこれは暫定対応であり、他の SPEC ファイルで同様の backtick 囲み AUTOGEN marker 記述がある場合、同様の停止が再発する。

## 影響

`generate_indexes.ts` が途中停止するため、全 AUTOGEN ブロックの再生成ができず手動更新が必要になる。REQ retire 時の索引 AUTOGEN 再生成が自動化できず、case-close で手動修正が発生した（PR #1718）。重要性は中〜高。発生頻度は、SPEC ファイル内で AUTOGEN marker を backtick 囲みで言及する記述が現れる度に再発する。

## 課題

parser が backtick 囲み（インラインコード）文脈を判別せず、説明文中の marker 文字列を実 marker として扱う。このため SPEC ファイル本文の記述方法に依存して索引再生成が停止する。

## 既存要件・仕様との関連

特になし。対象スクリプトは `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`。関連 PR は #1717（発見元）と #1718（暫定対応）、Epic #1711 の case-close QG-4。

## 対応方針の方向性

`generate_indexes.ts` 側で backtick 囲み（インラインコード）内の AUTOGEN marker 文字列を無視するロジックを実装する。AUTOGEN marker 検出時に前後の backtick 文字をチェックし、インラインコード文脈の場合はスキップする。暫定対応（PR #1718 の L26 抽象化）は残置してもよいが、根本解決により他 SPEC ファイルでの再発を防止できる。
