# integrity suite の zod 依存解決を整備する（改善候補）

## 観測

Case #2893（実装 PR #2924）の case-run で、bun test 3 分割のうち integrity suite と src 側 skill script テストが `zod` を解決できず fail/error になった。対象 scripts の package.json は存在するが、worktree へ node_modules が伝播しておらず、bun install 前の実行では `Cannot find package 'zod'` が発生した。case-close で次の依存パッケージ前置を実施したところ、分割1 は 2566 pass / 0 fail、分割2 は 102 pass / 0 fail となり、依存解決不備は解消した。

## 今回扱わない理由

本 Case の合意済み Definition は ADF-COVERS 除去可否判定の coverage 突合手順投影であり、依存配布・パッケージ境界の実装変更は対象範囲外。依存解決の恒久整備は別作業として扱う。

## 影響

worktree または依存パッケージ未導入環境で QG-4 の integrity suite を実行すると、実装変更と無関係な依存解決 fail/error が発生し、検証結果の由来分類と再実行が必要になる。正規の bun install 前置を契約として記録済みだが、依存の配布または自己完結化により環境依存 fail を減らせる可能性がある。

## レビューで決めること

(1) `agentdev-project-extensions/scripts` と `repo-agentdev-integrity/scripts` の依存を worktree 検証時に確実に復元する導入手順を強化するか。(2) zod 等の依存を配布・取得機構へ組み込むか、依存を除去して標準 API へ置換するか。(3) bun install 前置が必要なパッケージ境界と、未実施時の検出・報告を恒久 checker でどこまで強制するか。

## 根拠（任意）

PR #2924 本文「テスト結果」「Findings/ Capture候補」および case-close の正規形再実行記録。実行例: `bun install --cwd src/opencode/skills/agentdev-project-extensions/scripts`、`bun install --cwd .opencode/skills/repo-agentdev-integrity/scripts`（2026-09-17、worktree `.worktrees/2893-chore`）。

## intake-promote 確定注記（2026-09-18、adversarial-review 実施済み）

本 item は intake-promote の対論型レビューを経て「採用」で自律確定した（観測正確、依存所在は以下の通り精緻化）。

- zod への直接依存は agentdev-project-extensions の package.json のみ。integrity suite 側は extension_state.ts 経由の間接依存である（観測の主張である package.json 実在は真）。
- 同種事象の学び 2 件が learning-promote 2026-09-18 で採用済み成果物「countermeasure-update-worktree-dependency-resolution.md」として同時昇格している。依存解決の恒久整備（依存配布・除去検討を含む）は本 item と学習成果物の統合判定を backlog-review で実施すること。
