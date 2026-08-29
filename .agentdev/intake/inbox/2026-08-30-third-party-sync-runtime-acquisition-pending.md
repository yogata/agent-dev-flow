# 取得本文の runtime 反映: 自己ホスト環境への実配置は /agentdev/third-party-sync の運用実行が必要

## 観測

Epic #2446 の検証（TS-008/TS-007）で実施した skills.yaml 宣言 + 機構経由の再取得は、worktree の `.opencode/skills/` への配置である。自己ホスト環境（メインリポジトリの実利用環境）への実配置は別途必要。

- 配置は `/agentdev/third-party-sync` の運用実行（または self-sync 後の再取得）で行う
- 取得本文（japanese-tech-writing）は git-ignored につき PR には非収録（Git 管理境界 REQ-002-043 の正常動作）

## 今回扱わない理由

運用操作は case-run/case-close のスコープ外（検証として worktree 配置で TS-008/TS-007 の pass_criteria は充足）。

## 影響

運用実行を行うまで、メインリポジトリ環境では agentdev-doc-writing の執筆規範参照（japanese-tech-writing）が解決しない。doc-writing 系コマンド実行時に参照欠落として顕在化しうる。

## レビューで決めること

- メインリポジトリ環境での `/agentdev/third-party-sync` 実行のタイミング（次回 util 時 or 早期）
- 実行結果の確認方法（provenance marker と配置内容の読み戻し）

## 根拠

- PR #2462 本文「Findings / Capture候補」intake 4件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2462 ）
