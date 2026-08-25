# case-close cleanup-and-capture.md の一文一行違反3行の既存残存

## 観測

`src/opencode/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md` に一文一行違反3行（L39、L121、L172）が既存残存する（いずれも commit 7b63186c7 由来で当該ブランチ以前の発生）。

## 今回扱わない理由

Issue #2382 の (c) は agentdev-gh-cli ローカル版 references を対象としており、case-close workflow skill の references は対象外のため（PR #2393 Findings 記録のとおり）。

## 影響

文書品質規範（一文一行）への違反残存。横断是正対象。

## レビューで決めること

- 横断是正（docs X-4 系機械是正チャネル、OU-010 コーパス機械是正との整理）に含めるか、case-close 側の個別 chore で対応するか

## 根拠

- PR #2393 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2393 ）
