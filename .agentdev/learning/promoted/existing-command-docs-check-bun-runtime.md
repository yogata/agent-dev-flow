# docs-check / inspect-read-contracts への check_read_contracts.ts 実行ランタイム（Bun）明記

## 背景

`.opencode/skills/repo-agentdev-integrity/scripts/check_read_contracts.ts` は TypeScript + CommonJS require（`require() as typeof import()` 記法）を Bun 上で動かす前提で書かれている（併設テストは `import { expect, test } from "bun:test"`）。docs-check.md Step 1 と inspect-read-contracts SPEC は「check_read_contracts.ts を実行し」とだけ書き、ランナー（Bun）を明記していない。node --experimental-strip-types で実行すると ReferenceError: require is not defined in ES module scope で失敗する。

## 問題

check_read_contracts.ts を呼ぶ局面（docs-check Step 1、inspect-read-contracts、case-close Step 3-1 の QG-4 証拠取得）で、ランナーが未明記のため新規セッションや CI が node 系ランナーで実行を試み、ESM エラーで失敗する。docs-check が実行不能になると QG-4 証拠取得も失敗する。

## 望ましい変更

1. **docs-check.md Step 1**: 「check_read_contracts.ts を実行し」を「check_read_contracts.ts を Bun で実行し（`bun run` / `bun test`）」に修正。
2. **inspect-read-contracts SPEC**: 検証観点に「ランナーは Bun（node 系ランナーは require/ESM エラーで失敗）」を明記。
3. **スクリプト冒頭コメント（任意）**: check_read_contracts.ts 冒頭に実行方法のコメント（`// 実行: bun run check_read_contracts.ts` / `// テスト: bun test check_read_contracts.test.ts`）を追記。

## 対象範囲

### 対象

- `src/opencode/commands/repo/docs-check.md` Step 1
- `docs/specs/commands/inspect-read-contracts.md`（検証観点）
- 任意: `.opencode/skills/repo-agentdev-integrity/scripts/check_read_contracts.ts`（冒頭コメント）

### 対象外

- スクリプト本体の require/import 記法の変更（Bun 前提を維持、ランタイム変更しない）
- repo-agentdev-integrity 配下の他スクリプト（本件は check_read_contracts.ts 中心。同様の記法を採用する他スクリプトがあれば別途確認）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `src/opencode/commands/repo/docs-check.md` | Step 1 の「check_read_contracts.ts を実行し」に「Bun で実行し（bun run / bun test）」を明記 |
| spec | `docs/specs/commands/inspect-read-contracts.md` | 検証観点にランナー（Bun）を明記 |
| skill | `.opencode/skills/repo-agentdev-integrity/scripts/check_read_contracts.ts` | 任意: 冒頭に実行方法コメント追記 |

## 既存対策確認

- **確認結果**: 既存対策なし
- **該当ファイル**: なし（docs-check.md Step 1、inspect-read-contracts SPEC にランナー記述なし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 実行ランナー（Bun）が未明記。テストファイルの `import ... from "bun:test"` から Bun が想定ランタイムと判別できるが、command/SPEC 本文に明記がないため新規実行者が node 系ランナーを使用して失敗する。

## 制約

- スクリプトは Bun 前提を維持する。require/import 記法を純 ESM 化して node 対応する方向ではない（併設テストが bun:test に依存）。
- docs-check が他 integrity スクリプトも呼ぶ場合、それらのランナーも別途確認が必要（本件は check_read_contracts.ts に限定）。

## 受け入れ条件

- [ ] docs-check.md Step 1 に「Bun で実行（bun run / bun test）」が明記されている
- [ ] inspect-read-contracts SPEC の検証観点にランナー（Bun）が明記されている
- [ ] docs-check 実行時に check_read_contracts.ts が Bun で実行できる（node で ESM エラーになることが文書化されている）

## 元learning item / 根拠

- **要約**: check_read_contracts.ts を node --experimental-strip-types で実行し ReferenceError で失敗。Bun が想定ランタイムだが docs-check/SPEC に未明記。
- **根拠**: スクリプト冒頭が `const path = require("path") as typeof import("path")` のハイブリッド記法で Node のネイティブ ESM（package.json なし）では解釈不可。併設テスト check_read_contracts.test.ts が `import { expect, test, describe } from "bun:test"` を持ち Bun が想定ランタイムと判明。bun test で 2 pass、bun run 用ラッパで ok=true/direct_refs=0 を確認。docs-check.md Step 1 と inspect-read-contracts SPEC はランナーを明記していない。
- **再発条件**: 新規セッションや CI で check_read_contracts.ts を node 系ランナーで実行しようとした場合。
- **横展開可能性**: repo-agentdev-integrity 配下の他スクリプト群、docs-check/inspect-read-contracts/case-close Step 3-1 が同スクリプトを呼ぶ全局面で高い。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, bug
- **関連Issue**: Issue #1351、PR #1352（squash merge 0002cee2）
