# intake: opencode-local agentdev-gh README の issue_comment「温存中」表記 stale

- **発生源**: PR #2713（Issue #2697 / OU-002）・PR #2712（Issue #2699 / OU-004）の Findings 重複記録を本 item に集約
- **capture 元**: case-close Epic Wave 1（Epic #2695、delegation DEL-CLOSE-A1）
- **captured_at**: 2026-09-09

## 内容

`src/opencode-local/agentdev-gh/` の説明文書が旧カタログ前提の stale 記述のまま:

- `src/opencode-local/agentdev-gh/README.md` L4: 「16操作 + 温存中の `issue_comment`」表記。Design `custom-tool-contracts.md` L39（廃止確定・いずれの実装にも issue_comment は存在せず）および実装（`runner-local.ts` に issue_comment なし）と矛盾
- `src/opencode-local/agentdev-gh/README.md` L26: 読み替え規則表の `issue_comment` 行。同表 L36 の Comment 操作4種の正規行と README 内部で矛盾
- `src/opencode-local/agentdev-gh/case-schema/case-file.md` L75: 「issue_comment の読み書きは…読み替え先を分岐する」の操作名参照

## 集約注記

- **#2701（OU-010 / RA-001「opencode-local agentdev-gh 説明文書2ファイルの16操作現行化」）の既定義スコープと同一**。3 PR（#2713・#2712・#2711 系統の同種 Findings）の重複記録を本 item 1件に集約した
- intake-promote 判定時は #2701 の実行による解消を確認し、二重対応を避けること。#2701 完了後は本 item を reject（既回収）扱いとする
