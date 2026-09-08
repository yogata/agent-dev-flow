# runner-cli.test.ts:1034 の既知 TypeScript 型エラーの修正

## 観測内容

`src/opencode/tools/agentdev-gh/tests/runner-cli.test.ts:1034` に TypeScript 型エラー（typecheck で顕在化）が存在する。bun test は pass しており、当該エラーは PR #2693 の変更なしに main でも再現する pre-existing なものである。

## 影響

- agentdev-gh パッケージの typecheck が当該行で失敗し、型検証のノイズになる
- 型エラー残存により、本来検出したい新規型不整合の検出妨げになる

## 変更候補

- 当該行の型エラーを修正する（小規模 fix）
- 修正にあたり、テスト意図を変えない範囲での型アサーション整理または期待値型の是正を行う

## 既存要件・成果物との関連

- `src/opencode/tools/agentdev-gh/`（Epic #2686 で刷新された16操作カタログ実装）
- 修正はテストコードのみで契約型（contracts.ts）の変更を伴わない見込み

## 出所

- 元 intake item: `2026-09-08-runner-cli-type-error-preexisting-2693.md`（PR #2693 Findings/Capture候補由来、Issue #2689・Epic #2686 Wave 2）
