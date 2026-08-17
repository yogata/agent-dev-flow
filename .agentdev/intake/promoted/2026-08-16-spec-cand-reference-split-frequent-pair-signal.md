# references 分割基準へ「参照選択表の同一行複数掲載 = 頻用併用信号」の運用判断規則追記

## 観測内容

agentdev-skill-authoring SPEC「skill 記述基準（層2）」の references 分割基準には、統合候補を機械的に審査するための運用判断規則が明記されていない。PR #2187 は「reference 選択表の同一行に複数ファイルを排げる構成は頻用併用の強い信号であり、統合候補として審査する」という判断根拠で rewrite-patterns + llm-expression-patterns を統合した。

## 影響

- references の統合・分割判断が個別対応の裁量に委ねられており、審査根拠の再利用性が低い

## 課題

上記運用判断規則を agentdev-skill-authoring SPEC「skill 記述基準（層2）」の references 分割基準へ追記する。

## 既存要件・成果物との関連

- SPEC: agentdev-skill-authoring「skill 記述基準（層2）」references 分割基準
- 実績: PR #2187（rewrite-patterns + llm-expression-patterns 統合）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2187 (Issue #2182 / OU-005, Epic #2178 Wave 2) SPEC確定候補 セクション 1
- 元 item: intake-2026-08-16-spec-cand-reference-split-frequent-pair-signal.md
