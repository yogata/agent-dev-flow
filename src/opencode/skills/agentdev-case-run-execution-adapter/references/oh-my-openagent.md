# oh-my-openagent 起動実装ノート

AgentDevFlow 側（case-run）から oh-my-openagent を呼び出すための実装ノート。読者は AgentDevFlow の case-run 実装者。抽象IF（ハーネス非依存）は親の `SKILL.md` 参照。本ファイルは oh-my-openagent 固有の具象実装を扱う。

> **前提**: 本ファイルの記述は Issue #951 時点の設計意図に基づく。oh-my-openagent 側 CLI 仕様・終了コード・構造化結果出力の信頼性は実体に合わせて随時更新すること（後述「懸念点・未検証事項」参照）。

## 起動方式（CLI subprocess）

case-run は oh-my-openagent を CLI subprocess として起動する。

```bash
bunx oh-my-openagent run \
  --directory "$WORKTREE_PATH" \
  --on-complete "<結果書込みスクリプト>" \
  --json \
  "<Issue本文を含む指示プロンプト>"
```

`task(subagent_type="sisyphus")` 等 OpenCode 組込サブエージェント起動を使わない理由: oh-my-openagent 側でオーケストレーションが二重に走る問題（oh-my-openagent issue #4027）を回避するため。AgentDevFlow 側は worktree と Issue を用意して PR を受領するだけの薄いオーケストレーターに徹し、詳細実行計画策定〜実装〜PR 発行まではハーネス側に委譲する。

### bunx → npx フォールバック（OU-013 / REQ-0130）

bunx がモジュール解決エラー（`Cannot find module`・`ERR_MODULE_NOT_FOUND`・`error: module not found` 等）で失敗する場合がある（Windows 環境・bun 1.x の一部バージョンで実績あり）。この場合は直ちに `npx` にフォールバックする。

```bash
# 主経路（bunx）
if ! bunx oh-my-openagent run --directory "$WORKTREE_PATH" ... ; then
  # フォールバック（npx）
  npx oh-my-openagent run --directory "$WORKTREE_PATH" ...
fi
```

- フォールバックは1回のみ（npx でも失敗する場合は `failed`）
- bunx 失敗がモジュール解決エラー以外（ハーネス側の実行時エラー・タイムアウト等）の場合は npx フォールバックせず、エラー種別に応じた処理（`blocked`・`failed`・タイムアウト事後処理）を行う
- Windows 環境では npx フォールバック経路の利用頻度が高くなる想定（bunx の安定性課題）

## worktree 取り扱い

- `--directory "$WORKTREE_PATH"` で case-run が作成した worktree パス（`.worktrees/{N}-{type}/`）を渡す。メインリポジトリパスは渡さない。
- oh-my-openagent は worktree 内で作業する。`.omo/` 等のハーネス作業領域は worktree 配下に作成され、AgentDevFlow 側は関与しない。worktree 削除時に `.omo/` も破棄される（REQ-0139-007: 永続状態として扱わない）。

## PR 作成と URL 受領

### プロンプト指示

oh-my-openagent に渡す指示プロンプト内で `gh pr create` による PR 発行を明示的に指示する:

```
実装完了後、gh pr create で PR を作成すること。PR 本文には Issue 番号（Refs: #N）を含めること。
```

### URL 受領（主経路）

`--on-complete` に指定した結果書込みスクリプトが、PR URL を結果ファイルに書き込む。case-run は結果ファイルから PR URL を読み取る。

### フォールバック（PR URL 不在時）

結果ファイルから PR URL を取得できなかった場合、ブランチ名から PR を逆引きする:

```bash
gh pr list --head "$BRANCH_NAME" --json url --jq '.[0].url'
```

このフォールバックは oh-my-openagent が PR を発行したが URL を結果ファイルに書き込めなかった場合の救済措置。PR 自体が存在しない場合は `failed` として処理する。

## blocked / failed 通知

oh-my-openagent 側の結果を構造化して受領するため、結果書込みスクリプトで以下の構造化結果出力を生成させる:

```
<RESULT>
<status>completed|blocked|failed</status>
<pr_url>https://github.com/.../pull/N</pr_url>
<reason>blocked/failed の理由</reason>
</RESULT>
```

- **`completed`**: `<pr_url>` を含む。case-run は PR URL を result に格納
- **`blocked`**: `<reason>` に回答可能な blocker の内容。Issue コメント SSoT として記録
- **`failed`**: `<reason>` に repository context で回答不能な blocker の内容。Issue コメントに構造化記録

### 終了コード・stderr の活用

- oh-my-openagent の終了コード（0: 成功系・非0: 異常系）と stderr も結果判定の補助に用いる
- 構造化結果出力（`<RESULT>`）が取得できた場合はそちらを優先し、終了コードは補助情報とする
- 構造化結果出力が破損・不在の場合は終了コードと stderr から `completed` / `blocked` / `failed` を推定する

## タイムアウト・中断

```bash
timeout 3600 bunx oh-my-openagent run ...
```

- タイムアウトは **1時間（3600秒）** を既定値とする（REQ-0130-016 由来の運用想定）
- タイムアウト発生時: oh-my-openagent プロセスを強制終了し、**即 `failed` とせず** 親 SKILL.md の「ハーネスタイムアウト事後処理（OU-013 / REQ-0130）」セクションに従い事後処理（worktree git status 確認・未コミット変更の grep 検出・手動修正または PR 化）を行う
- 中断時の worktree クリーンアップは case-run 側の責務（ハーネス側にクリーンアップを期待しない）

## 完全起動スクリプト例

case-run 実行担当サブエージェントが使用する起動スクリプトの雛形。実環境のパス・ブランチ名に置き換えること。

```bash
#!/usr/bin/env bash
set -euo pipefail

WORKTREE_PATH="${1:?usage: $0 <worktree_path> <branch_name> <issue_body_file> <result_file> <branch_name_for_fallback}"
BRANCH_NAME="${2:?}"
ISSUE_BODY_FILE="${3:?}"
RESULT_FILE="${4:?}"

# 結果書込みスクリプト（--on-complete に渡す）
ON_COMPLETE_SCRIPT=$(cat <<'EOF'
#!/usr/bin/env bash
# oh-my-openagent 完了時に呼ばれる。標準入力/引数から結果を受け取り RESULT_FILE に書込む。
# 実装は oh-my-openagent 側の完了コールバック仕様に合わせる。
EOF
)

# 指示プロンプト構築
PROMPT=$(cat <<EOF
以下の Issue を実装し、gh pr create で PR を作成せよ。
PR 本文には Refs: #${BRANCH_NAME} を含めること。
完了後、<RESULT> 構造で結果を出力せよ。

--- Issue 本文 ---
$(cat "$ISSUE_BODY_FILE")
EOF
)

# 起動（1時間タイムアウト・bunx→npx フォールバック付き）
RUNNER="bunx"
if ! timeout 3600 $RUNNER oh-my-openagent run \
  --directory "$WORKTREE_PATH" \
  --on-complete "$ON_COMPLETE_SCRIPT" \
  --json \
  "$PROMPT" ; then
  # bunx のモジュール解決エラー等の場合は npx にフォールバック（OU-013）
  RUNNER="npx"
  timeout 3600 $RUNNER oh-my-openagent run \
    --directory "$WORKTREE_PATH" \
    --on-complete "$ON_COMPLETE_SCRIPT" \
    --json \
    "$PROMPT" || EXIT_CODE=$?
fi

# 結果ファイルから status / pr_url を読込
STATUS=$(grep -oP '(?<=<status>)[^<]+' "$RESULT_FILE" || echo "")
PR_URL=$(grep -oP '(?<=<pr_url>)[^<]+' "$RESULT_FILE" || echo "")

# PR URL 不在時のフォールバック
if [ "$STATUS" = "completed" ] && [ -z "$PR_URL" ]; then
  PR_URL=$(gh pr list --head "$BRANCH_NAME" --json url --jq '.[0].url' || echo "")
fi

echo "status=$STATUS pr_url=$PR_URL exit=$EXIT_CODE"
```

## 懸念点・未検証事項

本実装ノートは設計段階の記述であり、以下は実体検証が必要な項目である。実運用で判明した挙動は本ファイルに随時反映すること。

- **Sisyphus の PR 発行能力**: oh-my-openagent 配下の Sisyphus が `gh pr create` を確実に実行できるか。PR 本文品質・Refs 記述の確度は実証が必要。
- **CLI subprocess と OpenCode セッションの協調安定性**: OpenCode セッション内から `bunx` 経由で長時間プロセスを起動した場合の安定性・リソース消費・ログ可視性。
- **タイムアウト時の挙動**: `timeout` 強制終了時、worktree 内の未コミット変更・`.omo/` 状態・gh 認証状態がどう残るか。クリーンアップ手順の確定が必要。
- **構造化結果出力の信頼性**: `<RESULT>` 構造を oh-my-openagent 側が確実に出力するか。出力形式の変動・エスケープ・エンコーディング問題の確認が必要。`--on-complete` コールバック仕様の実体確認も必要。
