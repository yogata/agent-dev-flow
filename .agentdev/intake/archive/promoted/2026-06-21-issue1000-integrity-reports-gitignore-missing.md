# .agentdev/integrity/reports/ の .gitignore 未記載（設計判断と実装の乖離）

## 観測

PR #1010 (Issue #1000 / Epic #990 Wave 5 OU-010) の Stream C 横断検査で、`.agentdev/README.md` が「`integrity/reports/` は例外: 非永続・git管理対象外（`.gitignore` で除外）」と宣言している一方、リポジトリの `.gitignore` に当該エントリ（`.agentdev/integrity/reports/`）が未記載であることを検出した。

## 影響

- `.agentdev/integrity/reports/*.md` が意図せず git 管理対象になる可能性がある。
- 設計判断（非永続・git管理対象外）と実装（.gitignore 未記載）の乖離は、docs-check 等の整合性検査で偽陽性または偽陰性を生む原因になる。
- 利用者（AgentDevFlow 導入プロジェクト）が `.agentdev/README.md` を信頼して運用した場合、commit されるべきでない検証レポートがcommitされるリスクがある。

## レビューで決めること

- `.gitignore` に `.agentdev/integrity/reports/` エントリを追加する修正 Issue を起票するか。
- `.agentdev/README.md` の記載を維持するか、実態に合わせて「git管理対象外運用を推奨（各リポジトリの .gitignore で明示）」等の表現に緩和するか。
- 同様の「設計判断↔実装乖離」が他の `.agentdev/` サブディレクトリでも潜在していないか横展開確認するか。

## 根拠

- PR #1010: https://github.com/yogata/agent-dev-flow/pull/1010 (Issue #1000 / Epic #990 Wave 5 OU-010 Stream C)
- Issue #1000: https://github.com/yogata/agent-dev-flow/issues/1000
- 関連: `.agentdev/README.md` 状態表の `integrity/reports/*.md` 行（Retention: 非永続・git管理対象外）
- Epic #990: https://github.com/yogata/agent-dev-flow/issues/990
