# 既存配布物の concrete-id baseline 11件の除去整備（distribution-boundary）

## 観測

distribution boundary check（`--profile source`）の baseline 11件が main に残存している。

- unclassified-entry 1件: `src/opencode/skills/agentdev-inspect-skills/SKILL.md:59`（IR-053 関連の記述）
- concrete-id 10件: `src/opencode/tools/agentdev-gh/`（runner-cli.ts:6、specs-issue.ts:101、specs-pr.ts:27）、`src/opencode/plugins/agentdev-gh-tool/`（plugin.ts:7 x2、README.md:3 x3、README.md:13 x2）

Epic 2446 Wave 1 の4 PR（2456/2457/2458/2459）の case-close E4-1 最終 gate で、PR HEAD と main HEAD の failure セットが完全一致（新規違反ゼロ）であることを確認済み。新規配布物（third-party-sync command、agentdev-third-party、agentdev-third-party-tool、agentdev-workflow-third-party-sync）は ID を含まない表現で新規違反ゼロを達成済み。

## 今回扱わない理由

baseline 11件は third-party 機構と無関係の既存配布物（agentdev-gh 系・inspect-skills）の記述であり、Epic 2446 の子 Issue の変更対象成果物外。

## 影響

- package-release-archive.ps1 の archive profile 事前境界検査が concrete-id 10件で失敗し、zip 公開が継続的にブロックされる（別 intake で整理）
- 新規配布物追加のたびに baseline 比較が必要になり、gate の失敗が常態化すると新規違反の検出感度が落ちる

## レビューで決めること

- 既存配布物の REQ-ID・DEC-NNN・AG-NNN・TS-NNN 等の直参照を Design パス参照・ID なし表現へ置換する整備の着手時期と担当
- unclassified-entry（inspect-skills SKILL.md:59）の分類解消方針

## 根拠

- PR 2457 本文「Findings / Capture候補」intake 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2457 ）
- PR 2458 本文「検証差分」distribution boundary check 行・learning 2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2458 ）
- PR 2459 本文「検証差分」distribution-boundary 行（回収元: https://github.com/yogata/agent-dev-flow/pull/2459 ）
