# Intake Item: references 分割基準へ「参照選択表の同一行複数掲載 = 頻用併用信号」の運用判断規則追記

## 発生源

- PR: #2187 (Issue #2182 / OU-005, Epic #2178 Wave 2)
- 発生 phase: case-run 実装
- capture 分類: intake（SPEC確定候補、backlog 化）

## 問題

agentdev-skill-authoring SPEC「skill 記述基準（層2）」の references 分割基準には、統合候補を機械的に審査するための運用判断規則が明記されていない。PR #2187 は「reference 選択表の同一行に複数ファイルを排げる構成は頻用併用の強い信号であり、統合候補として審査する」という判断根拠で rewrite-patterns + llm-expression-patterns を統合した。

## 推奨対応

上記運用判断規則を agentdev-skill-authoring SPEC「skill 記述基準（層2）」の references 分割基準へ追記する。SPEC 本文の確定は backlog 化する。

## 関連

- Issue: #2182 (CLOSED), Epic: #2178
- PR: #2187 (SPEC確定候補 セクション 1)