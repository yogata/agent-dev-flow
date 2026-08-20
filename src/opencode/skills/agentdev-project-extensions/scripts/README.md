# agentdev-project-extensions scripts

Project Extensions の読込時状態機械（runtime resolver と deterministic checker の共有実装）。

YAML 構文解析は `Bun.YAML.parse` へ委譲し、構造検証は Zod へ委譲する。
状態分類（missing / malformed / migration-required / schema-violation / valid）と旧kind・未知kind の意味判定は ADF 側に残留する。

## 構成

| パス | 役割 |
|------|------|
| `lib/extension_state.ts` | 共有実装。`parseExtensionYaml`（Bun.YAML 委譲）、`resolveExtensionState`（状態機械）、`validateExtensionEntries`（配列要素の構造検証） |
| `tests/extension_state.test.ts` | 回帰ケース（構文エラー、必須フィールド欠落、旧kind、未知kind、有効、空入力、型不正、クォート内コロン・`#`、CRLF、入れ子、配列） |

保証 YAML 機能はマッピング、配列、文字列、数値、真偽値、null、入れ子構造、通常のクォート文字列に限定する。
anchor、alias、カスタムタグ、複数ドキュメントは保証対象外である。

## 依存

`zod` は本 `package.json` / `bun.lock` で管理する（実行時パッケージ境界、agentdev-artifact-graph scripts と同一経路）。
利用時は本ディレクトリで `bun install` を実行して `node_modules/` を生成する。

```powershell
cd src/opencode/skills/agentdev-project-extensions/scripts
bun install
bun test
```

repo-local deterministic checker（`.opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts`）は
本ディレクトリの `lib/extension_state.ts` を相対 import で参照する。配布側実装から repo-local 成果物への依存は持たない。
