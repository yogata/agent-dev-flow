# AgentDevFlow Git Hooks

3層ゲート（事前予防）のうち、commit / push 時に自動実行される Delta Guard と Impact Guard を提供する (REQ-0136-004, REQ-0136-005, REQ-0136-008)。

## Hooks

| Hook | Gate | 起動タイミング | ブロック条件 |
|------|------|---------------|-------------|
| `pre-commit` | Delta Guard | `git commit` 実行時 | staged files に対する strict 違反 |
| `pre-push` | Impact Guard | `git push` 実行時 | 未push範囲の変更 REQ/ADR に関連する strict 違反 |

いずれの hook も `--strict-only` 付きで `check_integrity.ts` を起動する。heuristic / observation finding は警告表示のみで commit / push をブロックしない。

## Setup

### Windows (PowerShell 7+)

```powershell
./.githooks/setup-hooks.ps1
```

### Unix / macOS / Linux / Git Bash

```sh
./.githooks/setup-hooks.sh
```

両スクリプトとも `git config core.hooksPath .githooks` を設定するだけで、hook 本体は変更しない。冪等であり、何度実行しても安全。

## Enable / Disable / Status

```powershell
# Windows
./.githooks/setup-hooks.ps1 -Action status
./.githooks/setup-hooks.ps1 -Action disable
./.githooks/setup-hooks.ps1 -Action enable
```

```sh
# Unix
./.githooks/setup-hooks.sh status
./.githooks/setup-hooks.sh disable
./.githooks/setup-hooks.sh enable
```

## Bypass (一時的)

環境変数 `DEVFLOW_SKIP_HOOKS` を設定すると、その1回の commit / push で hook をスキップできる。

```sh
DEVFLOW_SKIP_HOOKS=1 git commit -m "..."
DEVFLOW_SKIP_HOOKS=1 git push
```

> 日常的な回避ではなく、merge や automated commit など例外的な場面でのみ使用すること。

## Prerequisites

- **bun**: 両 hook は `bun run check_integrity.ts` を起動する。bun が PATH にない場合、hook は警告を出してスキップする（ブロックしない）。
- **Git 2.9+**: `core.hooksPath` のサポートに必要。

## 動作の詳細

### Delta Guard (pre-commit)

1. `git diff --cached --name-only --diff-filter=ACM` で staged files を取得
2. カンマ区切り CSV に変換
3. `bun run check_integrity.ts --gate delta-guard --paths <csv> --strict-only` を実行
4. exit code 1 (strict 違反) → commit block。exit code 0 → 許可。

### Impact Guard (pre-push)

1. pre-push 引数 (`local_ref local_sha remote_ref remote_sha`) から未push範囲を算出
2. `git diff --name-only <range>` で変更ファイルを取得
3. 変更 REQ/ADR ファイルから REQ ID を抽出 (例: `docs/requirements/REQ-0101.md` → `REQ-0101`)
4. `bun run check_integrity.ts --gate impact-guard --reqs <req_csv> --strict-only` を実行
5. exit code 1 (strict 違反) → push block。exit code 0 → 許可。

## Troubleshooting

### hook が実行されない

1. `setup-hooks.ps1` / `setup-hooks.sh` を実行して `core.hooksPath` が `.githooks` に設定されているか確認:
   ```sh
   git config core.hooksPath
   ```
2. `.githooks/pre-commit` / `.githooks/pre-push` に実行権限があるか確認 (Unix):
   ```sh
   chmod +x .githooks/pre-commit .githooks/pre-push
   ```

### bun not found

bun がインストールされていない場合、hook は警告を出してスキップする。bun をインストールすること:
   ```sh
   curl -fsSL https://bun.sh/install | bash   # Unix
   powershell -c "irm bun.sh/install.ps1|iex"  # Windows
   ```

### strict 違反で commit / push がブロックされる

該当 finding を修正することが推奨される。どうしても回避が必要な場合は `DEVFLOW_SKIP_HOOKS=1` を使用する。ただし、strict 違反は「即時修正が必要」な機械検証可能な不整合であるため (gate-levels.md)、放置しないこと。

### hook 実行エラー (exit code 2)

`check_integrity.ts` が入力エラーや実行エラーで終了した場合、hook は非ブロックでスキップする。エラーの詳細は stderr を確認すること。

## Related

- REQ-0136: REQ/SPEC/ADR 適正運用の自動化（3層ゲート + 新ワークフロー）
- [gate-levels.md](../.opencode/skills/repo-agentdev-integrity/references/gate-levels.md): strict / heuristic / observation 水準定義
- [integrity-rule-catalog.md](../docs/specs/integrity-rule-catalog.md): 全 integrity rule 定義
