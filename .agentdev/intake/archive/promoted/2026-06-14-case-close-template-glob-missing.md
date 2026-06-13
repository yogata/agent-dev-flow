# case-close.md が存在しない template glob `issue_comment_*.md` を参照

## 観測

`docs/commands/agentdev/case-close.md`（投射先 `.opencode/commands/agentdev/case-close.md`）が `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md` を参照しているが、該当 glob に合致するファイルが存在しない。

### 対象箇所

- `.opencode/commands/agentdev/case-close.md`
- 件数: NG 1（`template-path-integrity`）

## 影響

存在しない template 参照は、case-close 実行時の template 探索を失敗させる可能性がある。

## 推奨対応

該当 template を作成する、または正しい既存 template へ参照を修正する。glob 参照が意図的なものかどうかも併せて確認する。

## 分類

- finding category: workflow-gap
- route: req-define
- 原因: 仮説（template 未作成の可能性、または glob 表記の不正の可能性）

## 根拠

- 検査: `template-path-integrity`（strict）
