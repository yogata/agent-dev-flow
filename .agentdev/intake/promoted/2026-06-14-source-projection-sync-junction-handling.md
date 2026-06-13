# source-projection-sync 検査が Windows junction を追従しない（21 件の false positive）

## 観測

`source-projection-sync` 検査が、`.opencode/skills/` 配下の agentdev-* スキル 20 件を「source にあるが projection にない」と報告する。実体検証の結果、全 20 件は junction（reparse point）として正しく投射されている。`repo-agentdev-integrity` は ADR-0020 により repo-local として src 配下に存在しないことが期待通り。

### 検証結果

- `dir /al .opencode\skills` → agentdev-* 20 件すべて `<JUNCTION>` として存在、リンク先は `src\opencode\skills\agentdev-*`
- `src/opencode/skills/` → agentdev-* 20 件が実在
- 結論: 21 件の NG はすべて false positive

### 根因（コード確認済）

`check_integrity.ts` の `listDirs()` (L107-119) は `fs.readdirSync(dir, {withFileTypes:true}).filter(d => d.isDirectory())` を使用。Windows junction は libuv において reparse point として `isSymbolicLink()` 扱いとなり、`isDirectory()` は false を返す。よって junction である agentdev-* ディレクトリは projection 側セットから漏れる。

一方 `checkBrokenJunctions` (L5561) は reparse point を正しく扱っており、check 間の実装不整合が存在する。

## 影響

Windows 環境で docs-check を実行するたびに 21 件の誤検出が発生し、シグナルノイズ比が著しく低下する。

## 課題

`listDirs()` または `checkSourceProjectionConsistency` (L5459) が junction / reparse point を有効な投射エントリとして扱うよう修正が必要。

## 既存要件との関連

- **REQ-0108-173**: source-projection-sync 検査
- **REQ-0108-210**: junction 配下の取りこぼし禁止
- **ADR-0020**: repo-agentdev-integrity の repo-local 扱い

## 対応方針の方向性

- **route**: req-define
- **category**: integrity-rule-gap
- 修正案: `fs.readdirSync` の `withFileTypes` で reparse point を directory として扱う、またはリンク先を解決して比較する

## 元 item 参照

- `.agentdev/intake/inbox/2026-06-14-source-projection-sync-ignores-windows-junctions.md`
