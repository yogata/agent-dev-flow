# .agentdev/integrity/reports/ が .gitignore に未記載（設計判断と実装の乖離）

## 観測

`.agentdev/README.md` の状態表で `integrity/reports/*.md` の Retention が「非永続・git管理対象外（`.gitignore` で除外）」と記載されているが、リポジトリの `.gitignore` に `.agentdev/integrity/reports/` エントリが未記載。

## 影響

- `.agentdev/integrity/reports/*.md` が意図せず git 管理対象になる可能性がある
- 設計判断と実装の乖離は、docs-check 等の整合性検査で偽陽性または偽陰性を生む原因になる
- 利用者が `.agentdev/README.md` を信頼して運用した場合、commit されるべきでない検証レポートが commit されるリスク

## 課題

- `.gitignore` に `.agentdev/integrity/reports/` エントリを追加
- `.agentdev/README.md` の記載を維持するか、実態に合わせて表現を緩和するか
- 同様の「設計判断↔実装乖離」が他の `.agentdev/` サブディレクトリでも潜在しているか確認

## 既存要件との関連

- REQ-0101-022, 023（文書・REQ管理基準・`.agentdev/` は canonical domain state）
- `.agentdev/README.md` 状態表の記載

## 根拠

- 元 inbox item: `2026-06-21-issue1000-integrity-reports-gitignore-missing.md`
- Issue #1000
