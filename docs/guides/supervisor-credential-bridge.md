# Supervisor 環境向け opencode credential 供給ブリッジ導入ガイド

Supervisor（Hermes 等、spawn する子プロセスから provider 資格情報を削除する実行環境）から dispatch された opencode 実行でも、実行側が自身の起動コンテキストで Windows User スコープ環境変数（AI_GATEWAY_API_KEY 等）を取得できるようにするブリッジ道具の導入手順である（REQ-091）。

道具の正本は agent-dev-flow リポジトリの `scripts/self/supervisor-bridge/` 配下（`ocenv` と `opencode` bridge shim）であり、機構の詳細は [知識文書](../knowledge/supervisor-bridge-credential-supply.md) を参照する。

## 前提

- Windows 環境（win32）で bash が実行できること（Git Bash / MSYS2 環境を想定する）。
- opencode 本体が導入済みであること（bun グローバル導入の標準配置は `$HOME/.bun/bin/opencode`。別の配置に導入した場合は「opencode 本体パスの調整」の手順に従う）。
- Windows User スコープ環境変数（HKCU\Environment）に供給対象の変数（AI_GATEWAY_API_KEY 等）が設定済みであること。設定方法は `setx` コマンドまたは Windows の「環境変数」設定 UI を使う。credential の値は本ガイドには記述しない（REQ-091-005）。

## インストール

正本配置物（`scripts/self/supervisor-bridge/` 配下の `ocenv` と `opencode`）を、PATH 上の優先ディレクトリへ配置する。両ファイルは同じディレクトリへ置く（shim は自身と同じディレクトリの `ocenv` を起動する）。

実証済みの構成は `~/bin` を PATH の先頭に置く構成である。Supervisor の spawn コンテキストでも解決される優先配置になる。

```bash
mkdir -p ~/bin
cp scripts/self/supervisor-bridge/ocenv scripts/self/supervisor-bridge/opencode ~/bin/
chmod +x ~/bin/ocenv ~/bin/opencode
```

`~/bin` を PATH の先頭へ追加する（`~/.bashrc` など）:

```bash
export PATH="$HOME/bin:$PATH"
```

リポジトリの `scripts/` 直下には配置しない（REQ-050 の公開入口境界。内部道具は `scripts/self/` 配下のみで正本管理する）。

## opencode 本体パスの調整

shim は起動する opencode 本体のパスを調整点（ADJUSTMENT POINT）として明示する。既定値は bun グローバル導入の標準配置 `$HOME/.bun/bin/opencode` である。

調整方法は次のいずれかである。

- 環境変数で上書きする（shim ファイルの変更は不要）:

  ```bash
  export OPENCODE_BODY="$HOME/.bun/bin/opencode"
  ```

- shim ファイル（配置先の `opencode`）の `OPENCODE_BODY=` の行を直接編集する。

本体の実在は次のコマンドで確認できる（値の例は配置例であり、環境ごとに読み替える）:

```bash
test -x "$OPENCODE_BODY" && echo exists
```

## 検証手順

検証は Supervisor の spawn コンテキストで行うことを明示する。Supervisor（Hermes 等）が opencode を spawn するのと同一の環境（PATH、shell、環境変数の継承）で検証する。手動で開いたデスクトップ shell は PATH が異なる場合があり、検証の代わりにならない。

1. opencode コマンドの解決先確認（spawn コンテキストの shell 内で実行する）:

   ```bash
   command -v opencode
   ```

   結果が配置した shim のパス（`~/bin/opencode` 等）であることを確認する。本体のパスが返った場合は「shim のサイレント bypass」の失敗署名を確認する。

2. scrub 模擬環境での変数 SET 実測。`env -u AI_GATEWAY_API_KEY` で scrub を模擬し、shim 経由で起動した子プロセス内で変数が SET になることを実測する:

   ```bash
   env -u AI_GATEWAY_API_KEY ocenv bash -c 'if [ -n "${AI_GATEWAY_API_KEY+set}" ]; then echo SET; else echo UNSET; fi'
   ```

   `SET` が出力されれば供給が成立している。対照として、`ocenv` を経由しない場合（`env -u AI_GATEWAY_API_KEY bash -c '...'`）は `UNSET` になることも確認する。

   shim 経由の等価性確認（shim が opencode 本体を ocenv 経由で起動できること）:

   ```bash
   env -u AI_GATEWAY_API_KEY opencode --version
   ```

3. 実 Workflow での Jev 観測の outcome 確認。Jev 対象の Workflow を 1 回以上実行した後、`.agentdev/jev-observations/` 配下の当該実行の観測 JSON を開き、`outcome` フィールドが `not_configured` 以外であることを確認する。

   `outcome` の読み分けは「失敗署名と対処」の節を参照する。

## 失敗署名と対処

| 失敗署名 | 読み分け | 対処 |
|---|---|---|
| 観測 JSON の `outcome` が `not_configured` | credential が opencode の子プロセスへ供給されていない。API は呼ばれていない | HKCU\Environment に変数が設定されているか確認する（`powershell.exe -NoProfile -Command "[Microsoft.Win32.Registry]::CurrentUser.OpenSubKey('Environment').GetValueNames()"`）。`command -v opencode` の解決先が shim か確認する。解決先が正しければ「opencode 本体パス不一致」を確認する |
| `outcome` が `jev_failed`、または timeout / 429 / 5xx 等の API failure | credential は供給されており API は呼ばれたが、API 側の障害またはレート制限が発生している | `not_configured` とは区別する。リトライやレート制限の解消を待つ。credential 供給の設定変更では解消しない |
| `command -v opencode` が shim 以外（本体直、Windows 側 `opencode.exe` 等）を返す | shim のサイレント bypass。PATH の優先順位で shim より先に本体が解決されている | PATH で shim 配置ディレクトリ（`~/bin` 等）が本体より先に来ているか確認する。Supervisor の spawn コンテキストの PATH も同様に確認する |
| shim 実行で本体が起動せず失敗する | opencode 本体パス不一致。`OPENCODE_BODY` が実在しないパスを指している | `test -x "$OPENCODE_BODY"` で本体の実在を確認し、実体のパスに調整する（bun のグローバル導入先は `bun pm bin -g` で確認できる） |
| `ocenv: failed to enumerate HKCU\Environment` が出力され終了コード 1 | HKCU\Environment の列挙失敗（fail-closed 動作。対象コマンドは実行されていない） | powershell.exe が実行可能か、レジストリ読取権限があるかを確認する |

### 再確認トリガ

次の事象が発生した場合は「検証手順」を再実行する。

- opencode 本体の更新（グローバル導入先のパスや実体が変わることがある）
- PATH の変更（`~/bin` の優先が崩れ、shim が解決されなくなることがある）
- shell 設定（`~/.bashrc` 等）や Supervisor 側 spawn 設定の変更
