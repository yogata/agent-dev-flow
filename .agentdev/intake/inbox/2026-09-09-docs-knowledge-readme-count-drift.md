# intake: docs/knowledge/README.md「現在の知識文書」件数記述の乖離

- **発生源**: PR #2717（Issue #2708 / OU-009）の Findings F-1 を回収
- **capture 元**: case-close Epic Wave 1（Epic #2704、delegation DEL-CLOSE-B1）
- **captured_at**: 2026-09-09

## 内容

`docs/knowledge/README.md`「現在の知識文書」節の「1件（windows-powershell-bulk-io-corruption.md）」記述が実態（2件。`checker-cli-stdout-loss-on-windows-bun.md` が未反映）と乖離している。索引記述の陳腐化候補。

## 補足

- backlog-review 実行時にも同一内容の観察が記録されているが、intake inbox への回収は今回が初回
- 正規化要否（件数記述の維持方針 vs 削除）は intake-promote の review で判定すること
