# main リポジトリ .opencode/skills/ junction セットの stale 状態（再構築が必要）

## 観測

main リポジトリの .opencode/skills/ junction セットが stale になっている。

- junction 未構築: agentdev-design-file-manager、agentdev-traceability、agentdev-workflow-design-save、agentdev-workflow-backlog-auto
- stale junction 残存: agentdev-artifact-graph、agentdev-spec-file-manager、agentdev-workflow-spec-save

この状態の main 環境（環境 B）で bun test の skills_structure に 1 fail が発生する（PR #2391 の fail 由来分類で環境依存と確認）。

## 今回扱わない理由

install-consumer-opencode.ps1 -Mode apply 再実行による junction 再構築は、.opencode/skills/* が .gitignore 対象の局所運用タスクであり PR 成果外（Epic #2378 レビュー判断 RD-002 と同根）。

## 影響

main 環境で bun test フル suite が環境依存 fail を含む状態が続き、N/M 件数突合や QG-4 判定にノイズが残る。

## レビューで決めること

- 局所運用タスクとして junction 再構築（install-consumer-opencode.ps1 -Mode apply 再実行）をいつ実施するか（RU 化せず運用対応とするか）

## 根拠

- PR #2391 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2391 ）
- Epic #2378 レビュー判断 RD-002
