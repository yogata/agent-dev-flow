---
topic: generate_indexes.ts AUTOGEN marker backtick 認識 bug
date: 2026-07-22
source: PR #1717 Findings, PR #1718 case-close QG-4
---

## 問題

`generate_indexes.ts` が SPEC ファイル内の backtick 囲み AUTOGEN marker 記述を実 AUTOGEN marker と誤認し、実際の AUTOGEN block を認識せず途中停止する。

## 発生事象

- 対象: `docs/specs/quality/spec-health-metrics.md` L26
- L26 説明文: `` AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から対応する`<!-- AUTOGEN:END -->`までを除外する。 ``
- L57 に実際の AUTOGEN block (`spec-metrics-measurement-example`) が存在するが、L26 の backtick 囲み marker を先に認識し、正常な AUTOGEN block を検出できず途中停止

## 影響

- `generate_indexes.ts` が途中停止するため、全 AUTOGEN ブロックの再生成ができず手動更新が必要になる
- REQ retire 時の索引 AUTOGEN 再生成が自動化できず、case-close で手動修正が発生（PR #1718）

## 暫定対応

PR #1718 で L26 の HTML コメント構文を抽象化（意味変更なし）し parser 誤認を解消。しかし他の SPEC ファイルで同様の backtick 囲み AUTOGEN marker 記述がある場合、同様の停止が発生する可能性がある。

## 推奨対応

`generate_indexes.ts` 側で backtick 囲み（インラインコード）内の AUTOGEN marker 文字列を無視するロジックを実装する。具体的には AUTOGEN marker 検出時に前後の backtick 文字をチェックし、インラインコード文脈の場合はスキップする。

## 再現手順

1. SPEC ファイルの説明文中に `` `<!-- AUTOGEN:BEGIN:id=... -->` `` のように backtick 囲みで AUTOGEN marker を言及する
2. `bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` を実行
3. 対象 SPEC ファイルの処理で「AUTOGEN marker not found」エラーで停止

## 関連

- PR #1717 (発見元、Findings 記載)
- PR #1718 (暫定対応)
- Epic #1711 case-close QG-4
- 対象スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`
