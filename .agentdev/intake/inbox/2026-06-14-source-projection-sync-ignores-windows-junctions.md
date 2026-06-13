# source-projection-sync 検査が Windows junction を追従しない（21 件の false positive）

## 観測

`source-projection-sync` 検査が、`.opencode/skills/` 配下の agentdev-* スキル 20 件を「source にあるが projection にない」と報告している。しかし実体検証の結果、全 20 件は junction（reparse point）として `.opencode/skills/` へ投射されており `src/opencode/skills/` へ正しくリンクされている。また `repo-agentdev-integrity` は ADR-0020 により repo-local として src 配下に存在しないことが期待通りである。

### 検証結果

- `dir /al .opencode\skills` → agentdev-* 20 件すべて `<JUNCTION>` として存在、リンク先は `src\opencode\skills\agentdev-*`
- `src/opencode/skills/` → agentdev-* 20 件が実在
- `repo-agentdev-integrity` → `.opencode/skills/` 配下は実 DIR（repo-local、ADR-0020 準拠）
- 結論: 21 件の NG はすべて false positive

## 影響

Windows 環境で docs-check を実行するたびに 21 件の誤検出が発生し、シグナルノイズ比が著しく低下する。

## 推奨対応

projection-sync 検査が junction/reparse point を有効な投射エントリとして扱うよう修正する（例: `fs.readdirSync` の `withFileTypes` で reparse point を directory として扱う、またはリンク先を解決して比較する）。

## 分類

- finding category: integrity-rule-gap
- route: req-define
- 原因: 確認済（junction 実在を検証済み、検査側の Windows 対応不足が根因）

## 根拠

- 検査: `source-projection-sync`（strict）
- 副次影響: 約 21 件の false positive NG（同一根因）
- 環境: Windows（win32）、PowerShell 7+
