# 標準版実装手順（GitHub 版）

`agentdev-gh-cli` の各手続きの標準版（GitHub 版）実装手順（REQ）。
ローカル版は本ファイルを差し替え、同一手続き名で Case ファイルの読み書きへ読み替える（REQ, ADR decision #4, #5）。

操作契約（手続き名、引数、戻り値）は [contracts.md](contracts.md) 参照。

## 共通制約（全環境共通）

- `--body-file`/ `-F` によるファイル指定を全環境で使用する（`--body` 直接指定は禁止）
- 書き込み後の VERIFY 操作（[verify.md](verify.md)）を全環境で実行する
- 保存形式は **UTF-8 (BOMなし)**、改行コード **LF** とする
- **Windows 環境での WRITE 手続きはコンソールエンコーディング初期化（Section 2 Step 0）を必須前置する（REQ）**: 全 WRITE 手続き（Issue 作成、Issue 本文更新、Issue コメント追加、PR 作成、PR merge、Issue close 等）は Section 2 の標準手順に従い、Step 0 を経由してコンソールエンコーディング初期化の恩恵を受ける。Linux/ macOS/ WSL 等の Windows 以外の環境では既定で UTF-8 コンソールのため実行不要
- **Windows 環境での引数渡し制約（cp932 化け対策、RU-0005 AG-001）**: Windows 環境では gh CLI への引数渡し経路が cp932 化けを生むため、以下を遵守する
 - **`--title "..."` の inline 使用禁止**: `gh issue create --title "日本語"`、`gh pr create --title "日本語"` 等、日本語を含む `--title` 引数の inline 渡しを禁止する。Section 2 Step 0 のコンソールエンコーディング初期化を実行しても `--title` 引数の decode 経路が独立して cp932 影響を受けるため、Step 0 は `--title` 化けの完全な対策にならない
 - **inline `--input` 使用禁止**: `gh api --input -`（stdin 経由）等の inline 入力を禁止する
 - **推奨**: 本文は `--body-file`/ `-F`、API 操作は `gh api --input @file.json`（UTF-8 JSON ファイル）を使用する
 - **title 修正**: 日本語 title を設定または修正する場合は `gh api -X PATCH` 経由（後述「title 修正 REST API PATCH 標準手続き」）を標準とする。ASCII 限定 title のみ inline `--title` を許容する

## Windows 固有の制約

### PowerShell エンコーディング問題

- PowerShell はネイティブコマンド（gh CLI）の UTF-8 出力をパイプライン経由でエンコーディング変換する。Windows PowerShell 5.x では Shift-JIS に変換、pwsh 7 でも日本語が破損する場合がある
- Windows PowerShell 5.x の `Out-File -Encoding utf8` は BOM 付き UTF-8 を生成し、要件に違反する

### BOM 問題

- PowerShell のファイル書き込みコマンド（`Out-File`, `Set-Content`, `>` リダイレクト, `>>` 追記リダイレクト, `New-Item`（コンテンツ付き）, `[IO.File]::WriteAllLines`）は BOM 付きまたは Shift-JIS になる可能性があるため使用禁止
- **例外**: `[System.IO.File]::WriteAllText` に `UTF8Encoding($false)` を指定する場合は許可する

### execSync バイパス

- `gh` コマンドの出力取得には Node.js `child_process.execSync` を使用する（pwsh パイプラインをバイパスして gh CLI の生の UTF-8 出力を直接取得するため）

### PowerShell 変数補間（regex backreference `$N`）

- PowerShell は文字列内の `$N`（N は数字）を変数補間の開始として解釈する。regex の backreference（`$1`, `$2` 等）を `-replace` 演算子の右辺にダブルクォート（`"..."`）で渡すと、PowerShell 変数として展開され空文字列になる等の破壊が発生する。
- **対策**: regex backreference を含む置換文字列はシングルクォート（`'...'`）で囲むこと。または `[regex]::Replace()` を直接使用し、`-replace` 演算子のダブルクォート右辺を避けること。
- **適用場面**: Issue/PR 本文やタイトルに対する regex 加工、Epic ステータス追跡テーブルの正規表現置換（`$1`, `$2` capture group 参照）等。
- **例（NG）**: `"pattern" -replace "(foo)", "$1-bar"`（`$1` が PowerShell 変数として展開され、空文字列になる）
- **例（OK）**: `"pattern" -replace "(foo)", '$1-bar'`（シングルクォートで backreference を保持）

### PowerShell regex MatchEvaluator 内 -replace 使用注意（RU-0005 AG-004）

`[regex]::Replace()` の MatchEvaluator（スクリプトブロック）内で `-replace` 演算子を使用すると、MatchEvaluator が返す文字列そのものが再度 `-replace` の対象となり、意図しない置換破壊を生じる。前節「PowerShell 変数補間（regex backreference `$N`）」とは発生原理が異なり、対策も異なるため両者を区別して扱う。

#### 発生原理

`[regex]::Replace(input, pattern, MatchEvaluator)` の MatchEvaluator は一致箇所ごとに呼ばれ、戻り値が置換結果となる。MatchEvaluator 内で `-replace` を使用すると、MatchEvaluator の戻り値（置換後文字列）がそのまま最終置換結果として採用されるはずが、`-replace` が MatchEvaluator の戻り値に対して再度パターンマッチを行い、予期せぬ二次置換を発生させる。

- **適用場面**: Issue/ PR 本文の行単位 regex 置換、Epic ステータステーブルの行編集、`-replace` を MatchEvaluator 内で組み合わせる処理等
- **例（NG）**: `[regex]::Replace($text, $pattern, { param($m) $m.Value -replace 'foo', 'bar' })`（MatchEvaluator 戻り値の `-replace` が二次置換を生じる）
- **例（NG）**: `'foo' -replace '(\w+)', { param($m) $m.Groups[1].Value -replace 'o', 'O' }`（`-replace` 右辺のスクリプトブロック内 `-replace` が意図しない置換破壊を生じる）

#### 回避策（前節 backreference `$N` 対策との区別）

backreference `$N` 対策は「`-replace` 演算子右辺の `$N` を PowerShell 変数補間から守る」ことが目的で、シングルクォート囲みで対応する。一方、MatchEvaluator 内 `-replace` 問題は「MatchEvaluator 内で `-replace` を使わない」ことが目的で、別の回避策をとる。

- **回避策1（Node.js `String.split`/ `join`）**: PowerShell ではなく Node.js 側で文字列置換を実行する。`String.split(pattern).join(replacement)` を使用し、regex 依存を避ける。READ 手続き（Section 3）の Node.js `execSync` 経由と親和性が高い
- **回避策2（PowerShell `[String]::Replace`）**: PowerShell 側で処理する場合は `[String]::Replace(oldValue, newValue)` を使用する。`[String]::Replace` は regex を解釈しないため、MatchEvaluator 内の二次置換問題が発生しない
- **例（OK、Node.js）**: `node -e "const s=require('fs').readFileSync('.agentdev/tmp/source.md','utf-8');require('fs').writeFileSync('.agentdev/tmp/out.md', s.split('foo').join('bar'))"`
- **例（OK、PowerShell）**: `[regex]::Replace($text, $pattern, { param($m) $m.Groups[1].Value.Replace('foo', 'bar') })`（MatchEvaluator 内で `[String]::Replace` を使用）

#### backreference `$N` との併発ケース

両者が同時に発生する場合は、MatchEvaluator 内での `-replace` 使用を避けた上で、`[String]::Replace` 内の置換文字列に `$N` が含まれないかを確認する。`[String]::Replace` は regex 解釈しないため `$N` もリテラル扱いとなり、backreference の問題は生じない。

## WRITE 手続き（書き込み安全性）

### 1. 禁止事項

- `gh` コマンドの引数として `--body "..."` を直接使用することを禁止する。
- `<<EOF` (HEREDOC) 構文によるファイル作成を禁止する。
- PowerShell のファイル書き込みコマンド（`Out-File`, `Set-Content`, `>` リダイレクト, `>>` 追記リダイレクト, `New-Item`（コンテンツ付き）, `[IO.File]::WriteAllLines`）による一時ファイル作成を禁止する。**例外**: `[System.IO.File]::WriteAllText` に `UTF8Encoding($false)` を指定する場合は許可する（Section 2 標準手順で使用）。
- **理由**: Windows環境では PowerShell のファイル書き込みコマンドがシステムデフォルトエンコーディング（Shift-JIS 等）を使用するため、UTF-8 での保存が保証されない。
- Shift-JIS コンソール環境（`chcp 932` 既定の Windows PowerShell 5.x 等）で、コンソールエンコーディング初期化（Section 2 Step 0）を実行せずに `gh` の WRITE 操作（`--body-file`/ `--title` 等）を直接実行することを禁止する。
- **理由**: `--body-file` で UTF-8 ファイルを指定しても、gh CLI がコンソールのコードページ（Shift-JIS）を参照してメタデータや `--title` 引数を符号化するため、`--title` への日本語渡干渉、gh CLI 内部の文字列表記の文字化けが発生する。`[System.IO.File]::WriteAllText` によるファイル書き出し規定（UTF-8 BOM なし）と競合しないよう、ファイル書き出しは既存規定を維持し、コンソールエンコーディング初期化は独立した前置ステップとする（Section 2 Step 0）。

### 2. 標準手順

0. **コンソールエンコーディング初期化（Windows 環境では必須、Windows 以外では不要）**: Windows PowerShell/ pwsh 環境では、`gh` の WRITE 操作（`--body-file`/ `--title` 等）を実行する前に、現在のセッションで以下の 3 行を実行してコンソールエンコーディングを UTF-8 に初期化すること（REQ）:
 ```powershell
 [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
 $OutputEncoding = [System.Text.Encoding]::UTF8
 cmd /c chcp 65001 | Out-Null
 ```
 - **理由**: 既定の Shift-JIS コンソール（`chcp 932`）では、gh CLI が `--title` の日本語引数やメタデータを Shift-JIS として扱い文字化けが発生する。`[Console]::OutputEncoding` は gh CLI の標準出力、標準エラーの読み取りエンコーディング、`$OutputEncoding` は PowerShell からネイティブコマンドへパイプで渡す際のエンコーディング、`chcp 65001` はコンソールのコードページそのものを UTF-8 に設定する。3 行すべてが独立した役割を持つため省略不可。
 - **Windows 以外の環境（Linux/ macOS/ WSL 等）では不要**: 既定で UTF-8 コンソールのため実行不要。実行してもエラーになるため実行しないこと。
 - **既存の `[System.IO.File]::WriteAllText`（UTF-8 BOM なし）規定との両立関係**: Step 0 はコンソールエンコーディング初期化（新規ステップ）、Step 1 はファイル書き出し（既存規定）。両者は独立しており、Step 0 を実行しても Step 1 の `[System.IO.File]::WriteAllText` による UTF-8 BOM なし書き出し規定は変更されない。ファイル書き出しは引き続き `[System.IO.File]::WriteAllText` を使用し、`Out-File`/ `Set-Content`/ `>` 等の禁止コマンドは Step 0 の有無にかかわらず引き続き禁止（Section 1 参照）。
 - **Step 0 と `--title` 引数 decode の別問題性（RU-0005 AG-001）**: Step 0 はコンソールコードページを UTF-8 へ切替える処理であり、`--title` 引数の inline 文字列が gh CLI 内部で decode される経路とは独立している。Step 0 を実行しても `--title` の inline 渡しが cp932 経路の影響を完全に回避できないため、日本語 `--title` の inline 使用は禁止し（共通制約参照）、title 修正は後述「title 修正 REST API PATCH 標準手続き」経由を標準とする。Step 0 と `--title` 禁止は補完関係にあり、Step 0 が `--title` 禁止を撤回するものではない。

1. テキスト（Issue本文、PR説明など）を一時ファイル `.agentdev/tmp/gh-temp-{timestamp}.md`（workspace-local）に書き出す（RU-0005 AG-003）。**PowerShell で `[System.IO.File]::WriteAllText` を使用すること**:
 ```
 [System.IO.File]::WriteAllText(".agentdev/tmp/gh-temp-{timestamp}.md", $content, (New-Object System.Text.UTF8Encoding($false)))
 ```
 **`.agentdev/tmp/` 配置の理由（RU-0005 AG-003）**: `$env:TEMP/agentdev/`（システム一時ディレクトリ）から `.agentdev/tmp/`（workspace-local）へ変更する。workspace 配下へ配置することで worktree 削除時に一時ファイルが確実に破棄され、かつ VERIFY や事後調査が同一 workspace 内で完結する。
 **OpenCode の Write tool は新規ファイル作成時に限定して使用可能**（BOMなしUTF-8で書き出す）。
既存 UTF-8（BOM なし）ファイル編集時は edit ツール（per-line string replace）を優先すること。
Windows 環境で Write tool が既存 UTF-8 ファイルを cp932 で書き出す事象が実証されているため、Write tool の全面上書きは新規作成時のみ許可する。
大規模構造変更で edit ツールが不向きな場合は `[System.IO.File]::WriteAllText` with `UTF8Encoding($false)` を使用すること。
PowerShell の `Out-File`, `Set-Content`, `>` 等は使用禁止（Section 1 参照）。
2. 保存形式は **UTF-8 (BOMなし)**、改行コードは **LF** とする。
3. `gh` コマンド実行時に該当ファイルを `--body-file`/ `-F` オプションで指定する。

 **フラグ早見表**:

 | サブコマンド | テキスト直接 | ファイル指定 | 短縮形 |
 |---|---|---|---|
 | `gh issue create` | `--body` | `--body-file` | `-F` |
 | `gh issue edit` | `--body` | `--body-file` | `-F` |
 | `gh issue comment` | `--body` | `--body-file` | `-F` |
 | `gh pr create` | `--body` | `--body-file` | `-F` |

4. **WRITE ユニットの完了と cleanup（RU-0005 AG-003、省略不可）**: WRITE 手続きは create（Step 1） → gh 実行（Step 3） → VERIFY（[verify.md](verify.md)） → cleanup を1ユニットとし、cleanup を省略不可ステップとする。VERIFY が PASS した後にのみ cleanup を実行する。VERIFY が FAIL の場合は cleanup を実行せず、一時ファイルを残して [retry.md](retry.md) のリトライロジックへ移行する（一時ファイルはリトライ時の比較、原因調査の情報源となる）。これにより「VERIFY を忘れて cleanup し、問題を事後検出できなくなる」事態を構造的に防止する。
 - **cleanup 対象**: `.agentdev/tmp/` 配下の当該 WRITE ユニットで生成した一時ファイル
 - **VERIFY FAIL 時の一時ファイル保管期間**: リトライまたは停止手続きの完了後、[retry.md](retry.md) に従い cleanup する

## READ 手続き（読み取り安全性）

### 3. 安全な読み取り手順

1. `gh` コマンドの出力を **Node.js `child_process.execSync`** で取得し、一時ファイルに書き出す:
 ```
 node -e "const{execSync}=require('child_process');const{writeFileSync}=require('fs');const r=execSync('gh issue view {N} --json body -q .body',{encoding:'utf-8'});writeFileSync('.agentdev/tmp/gh-read-{timestamp}.md',r)"
 ```
 **PowerShell の `>` リダイレクトは使用禁止**（pwsh 7 も含む。ネイティブコマンドのstdout出力がパイプライン経由でエンコーディング変換され、日本語が文字化けするため）。
**理由**: Node.js の `execSync` は pwsh パイプラインをバイパスして gh CLI の生の UTF-8 出力を直接取得するため、エンコーディング変換による文字化けが発生しない。
2. Read tool で一時ファイルを読み取る。
3. 読み取り完了後、一時ファイルを削除する。
4. 保存形式は **UTF-8 (BOMなし)**、改行コード **LF** とする。

5. **クォート競合パターン**: `node -e` 内で gh CLI の `-q` にシングルクォートを含む JQ 式（例: `.comments[-1].body`）を渡すと、PowerShell、Node.js、JQ 式のクォート階層が競合しパースエラーになる。
このパターンは `-q '.comments[-1].body'` のように JQ 式内に `[]` や `.property.subproperty` を含む場合に発生する。

6. **軽量回避策（第1段階）**: `--json` で JSON 全体を取得し、JS 内で `JSON.parse()` 後にフィルタする:
 ```
 node -e "const{execSync}=require('child_process');const{writeFileSync}=require('fs');const r=JSON.parse(execSync('gh issue view {N} --comments --json comments',{encoding:'utf-8'}));writeFileSync('.agentdev/tmp/gh-read-{timestamp}.md',r.comments[r.comments.length-1].body)"
 ```
 この方法はインラインで解決可能なクォート競合向け。
 `-q` を使わず JSON 全体を取得することでクォート階層の競合を回避する。

7. **退避策（第2段階）**: パイプ `|`、変数、複数段階の条件式を含む場合は `.js` スクリプトファイル（Write tool で作成）への退避を推奨する。
`.js` ファイル内であればクォートやシェル解釈の制約を受けない。
一時スクリプトは `.agentdev/tmp/`（workspace-local、RU-0005 AG-003）に配置し、使用後に削除する。

8. **禁止事項**: シングルクォート、パイプを含む式での `node -e` 使用を禁止する。
ただし `-q .body` 等の単純なドットアクセス式は禁止しない。
判定基準: JQ 式に `[`、`]`（配列インデックス）、`|`（パイプ）、`select` 等の関数呼び出しが含まれる場合は `node -e` でインライン化してはならない。

9. **禁止事項**: `node -e` 内でのテンプレートリテラル（バッククォート `` ` ``）使用を禁止する。
PowerShellがバッククォートをコマンド置換として解釈するため、パースエラーや意図しない動作を引き起こす。

10. **RECOMMEND**: 配列の `.join` メソッドによる文字列連結を推奨する。

 ❌ 禁止される例（テンプレートリテラル使用）:
 ```
 node -e "const{execSync}=require('child_process');const{writeFileSync}=require('fs');const r=execSync('gh issue view {N} --json body -q .body',{encoding:'utf-8'});writeFileSync('.agentdev/tmp/gh-read-{timestamp}.md', \`Body: ${r}\`)"
 ```

 ✅ 推奨される例（`.join()` 使用）:
 ```
 node -e "const{execSync}=require('child_process');const{writeFileSync}=require('fs');const r=execSync('gh issue view {N} --json body -q .body',{encoding:'utf-8'});writeFileSync('.agentdev/tmp/gh-read-{timestamp}.md',['Body: ',r].join(''))"
 ```

 **注**: 退避策（Section 3 項目7）による `.js` スクリプトファイル内では、テンプレートリテラルの使用は許可される。

### 4. 読み取り禁止事項

- `gh` コマンドの出力をPowerShell変数に直接格納することを禁止（`$var = gh ...`）。
- `gh` コマンドの出力をサブ式で直接使用することを禁止（`$(gh ...)`）。
- **PowerShell 7 (pwsh) を含む全バージョンで** `>` リダイレクトによる `gh` コマンド出力の保存を禁止する（ネイティブコマンドの出力がパイプライン経由でエンコーディング変換され、日本語が文字化けするため）。
- Windows PowerShell 5.x での `Out-File -Encoding utf8` による出力保存を禁止する（BOM 付き UTF-8 になるため）。
- **理由**: PowerShell はネイティブコマンド（gh CLI）の UTF-8 出力をパイプライン経由でエンコーディング変換する。Windows PowerShell 5.x では Shift-JIS に変換、pwsh 7 でもネイティブコマンド出力のエンコーディング処理で日本語が破損する場合がある。Windows PowerShell 5.x の `Out-File -Encoding utf8` は BOM 付き UTF-8 を生成し、「UTF-8 (BOMなし)」の要件に違反するため。

## 各手続きの標準版実装

### Issue 作成

```
gh issue create --title "{title}" --body-file {temp_body_file} [--label "{label1},{label2}"]
```

標準出力から Issue URL を取得し、Issue 番号を抽出する。
VERIFY を直後に実行。

### Issue 本文読込

```
gh issue view {N} --json body -q .body
```

READ 手続き（Section 3）に従い、Node.js `execSync` で取得し一時ファイル経由で読み取る。

### Issue 本文更新

```
gh issue edit {N} --body-file {temp_body_file}
```

WRITE 手続き（Section 2）に従い、`--body-file` で本文を指定。
VERIFY を直後に実行。
更新前後の本文比較のため、更新前に本文読込でスナップショットを取得することを推奨。

### Issue コメント追加

```
gh issue comment {N} --body-file {temp_body_file}
```

WRITE 手続き（Section 2）に従う。
VERIFY を直後に実行。

### PR 作成

```
gh pr create --title "{title}" --body-file {temp_body_file} --base {base_branch} --head {head_branch}
```

WRITE 手続き（Section 2）に従い、`--body-file` で本文を指定。
標準出力から PR URL を取得し、PR 番号を抽出する。
VERIFY を直後に実行。
PR 作成前に Merge Conflict 事前確認（後述「Merge Conflict 対応パターン」）を実施することを推奨。

### PR 本文読込

```
gh pr view {N} --json body -q .body
```

READ 手続き（Section 3）に従う。

### PR 補助データ読込

PR 本文以外のデータ（変更ファイル一覧、mergeable 状態、ラベル等）を取得する。
READ 手続き（Section 3）に従い Node.js `execSync` で取得し、一時ファイル経由で読み取る。
`-q` に配列インデックスやパイプを含む JQ 式を渡す場合はクォート競合回避（Section 3 項目5-8）に従うこと。

- 変更ファイル一覧: `gh pr view {N} --json files`
- mergeable 状態: `gh pr view {N} --json mergeable,mergeStateStatus`
- コメント一覧: `gh pr view {N} --json comments`

#### PR 変更ファイル一覧取得 / PR mergeable 状態取得

拡張手続きとして新設された2手続きの標準版（GitHub 版）実装は前段の gh CLI 例を使用する。いずれも READ 手続き（Section 3）に従い Node.js `execSync` で取得する。READ 手続きであるため Windows コンソールエンコーディング初期化（Section 2 Step 0）は不要。事後条件は SPEC `agentdev-gh-cli`.md「拡張手続き」参照。

- **PR 変更ファイル一覧取得**: `gh pr view {N} --json files` を実行し、`files[].path` を抽出して文字列配列を返す
- **PR mergeable 状態取得**: `gh pr view {N} --json mergeable,mergeStateStatus` を実行し、`mergeable` 値（`MERGEABLE` / `CONFLICTING` / `UNKNOWN`）をそのまま返す。`UNKNOWN` の取り扱い（squash merge 前のポーリング）は後述「squash merge 前の mergeable UNKNOWN ポーリング」セクション参照

### Issue 補助データ読込

Issue 本文以外のデータ（コメント一覧、ラベル、状態等）を取得する。
READ 手続き（Section 3）に従う。

- コメント一覧: `gh issue view {N} --json comments`
- 状態、ラベル: `gh issue view {N} --json state,labels`

### PR merge

```
gh pr merge {N} --{merge_method}
```

`{merge_method}` は `squash`、`merge`、`rebase` のいずれか。
merge 前に `git rev-parse HEAD` で HEAD commit hash を記録する。
Merge Conflict 発生時は後述「Merge Conflict 対応パターン」に従う。
**`--delete-branch` 非推奨**: `gh pr merge` で `--delete-branch` オプションを使用しない。アクティブ worktree に checkout されたブランチで `--delete-branch` を使用すると local 削除が失敗し remote 削除フェーズへ到達しない。ブランチ削除は case-close Step 7 で独立実施する（REQ）。

### squash merge リトライ手続き

squash merge が失敗した場合のリトライ戦略。ネットワーク揺れ、GitHub 側の一時的不具合等、同一内容の再試行で解決する可能性がある失敗を想定する（AG-001 に基づき case-close command 側には具体値を記載せず、本手続きが待機間隔・最大試行回数を所有する）。

- **待機間隔**: 5秒
- **最大試行回数**: 初期試行 + 5回リトライ（計6回）
- **各試行のログ記録**: 試行ごとに時刻、結果（成功/失敗）、エラーメッセージを記録する
- **全試行失敗時のフォールバック**: command 側の template（`.opencode/commands/agentdev/templates/case-close/standard.md`）が定義するフォールバック手順へ接続する
- **コンフリクト時の扱い**: コンフリクトによる失敗は本リトライの対象外。即座にコンフリクト解消パス（case-close Step 4-2 等）へ進む

VERIFY 失敗時の3段階リトライロジック（[retry.md](retry.md)）とは別手続き。retry.md は VERIFY 後の差分検出に対するリトライ、本手続きは `gh pr merge` コマンド自体の実行失敗に対するリトライ。

### squash merge 前の mergeable UNKNOWN ポーリング（REQ）

squash merge 実行前に、対象 PR の `mergeable` 状態を事前確認し、`UNKNOWN` の場合は mergeable になるまでポーリング待機する。連続 squash merge 時に GitHub が mergeable を `UNKNOWN` 状態で返し、マージが失敗する事象（バックエンドの mergeable 再計算未完了）を回避する。

- **状態取得**: PR 補助データ読込手続き（`gh pr view {N} --json mergeable,mergeStateStatus`）で `mergeable` 値を取得する
- **判定**: `mergeable` が `MERGEABLE` の場合は即時 squash merge（PR merge 手続き）へ進む。`UNKNOWN` の場合はポーリングへ移行。`CONFLICTING` の場合はコンフリクト解消パス（case-close Step 4-2 等）へ進む
- **ポーリング**: 最大60秒、10秒間隔で状態取得を再実行し `mergeable` が `MERGEABLE` になるのを待機する。各ポーリング試行（時刻、`mergeable`、`mergeStateStatus`）をログ記録すること
- **上限超過時**: 60秒経過しても `UNKNOWN` の場合はマージを中止し、構造化エラーとして報告して停止する。エラーには PR 番号、最終 `mergeable`/ `mergeStateStatus`、ポーリング試行回数を含める
- **待機中のコンフリクト遷移**: ポーリング中に `CONFLICTING` に遷移した場合は即時ポーリングを打ち切り、コンフリクト解消パス（case-close Step 4-2 等）へ進む

#### 構造化エラー: mergeable UNKNOWN ポーリング上限超過

```markdown
## mergeable UNKNOWN ポーリング上限超過エラー（REQ）

**PR番号**: #{pr_number}
**最終 mergeable**: UNKNOWN
**最終 mergeStateStatus**: {merge_state_status}
**ポーリング試行回数**: {attempts}
**経過時間**: {elapsed_seconds}秒（上限60秒）
**停止理由**: mergeable が60秒以内に UNKNOWN から遷移しなかったため、マージを中止した
**ユーザーアクション**: GitHub 側の mergeable 再計算の完了を待ってから再実行してください
```

#### 各 command の参照方法

command 側（case-close Step 4-0 等）には以下のように参照する:

- 「`agentdev-gh-cli` の mergeable UNKNOWN ポーリング手続き（REQ）に従い、squash merge 前の mergeable 状態事前確認、UNKNOWN ポーリング待機、上限超過時の構造化エラー停止を実行」

### Issue close

```
gh issue close {N} --reason {completed|not_planned}
```

`--reason` 省略時は `completed`。

### Issue/PR 一覧取得（補助）

検索条件を指定して Issue/PR の一覧を取得する。
READ 手続き（Section 3）に従い Node.js `execSync` で取得する。
intake-from-github 等の検索系操作で使用する。

- Issue 一覧: `gh issue list --state {state} --search "{query}" --limit {N} --json {fields}`
- PR 一覧: `gh pr list --state {state} --search "{query}" --limit {N} --json {fields}`

## title 修正 REST API PATCH 標準手続き（RU-0005 AG-002）

日本語 title を設定、修正する場合の標準手続き。Windows 環境での `--title` inline 使用禁止（共通制約参照）に伴い、`gh issue create --title "..."`、`gh pr create --title "..."` で日本語 title を渡せないため、REST API PATCH 経由で title を設定する。

### 適用条件

- 日本語を含む title を設定または修正する場合（Windows 環境）
- 既存 Issue/ PR の title 修正が必要な場合（全環境）
- ASCII 限定 title の初回作成は `--title` inline 使用を許容する（共通制約参照）

### 標準手順

1. **JSON ファイル作成**: title を含む JSON を `.agentdev/tmp/title-patch-{N}-{timestamp}.json` へ書き出す（Section 2 Step 1 と同一規定、`[System.IO.File]::WriteAllText` + `UTF8Encoding($false)`）:

 ```
 {"title": "日本語タイトル文字列"}
 ```

 ファイル配置は `.agentdev/tmp/`（workspace-local）へ統一（RU-0005 AG-003）。

2. **コンソールエンコーディング初期化（Windows 環境のみ）**: Section 2 Step 0 の3行を実行する。`gh api --input` 経由であっても Windows 環境では必須（gh CLI がコンソールコードページを参照するため）。

3. **REST API PATCH 実行**:

 ```
 gh api -X PATCH /repos/{owner}/{repo}/issues/{N} --input .agentdev/tmp/title-patch-{N}-{timestamp}.json
 ```

 Issue の場合は `/repos/{owner}/{repo}/issues/{N}`、PR の場合は `/repos/{owner}/{repo}/pulls/{N}` を使用する。

 - `--input` はファイルパスを指定し、inline `--input -`（stdin 経由）は使用禁止（共通制約参照）
 - `{owner}/{repo}` は `gh repo view --json owner,name` 等で取得するか、`--hostname` と組み合わせて既定値を使用する

4. **VERIFY**: title 更新後、`gh issue view {N} --json title -q .title` または `gh pr view {N} --json title -q .title` で読み戻し、JSON ファイルの title と一致することを確認する（READ 手続き Section 3 に従い Node.js `execSync` で取得）。

5. **cleanup**: VERIFY が PASS した後に `.agentdev/tmp/title-patch-{N}-{timestamp}.json` を削除する（WRITE ユニット cleanup 規定、RU-0005 AG-003）。VERIFY が FAIL の場合は [retry.md](retry.md) リトライロジックへ移行し、cleanup を実行しない。

### title 設定を伴う新規 Issue / PR 作成時のシーケンス

新規作成時に日本語 title を設定する場合、以下の2段階シーケンスを標準とする:

1. **仮 title で作成**: ASCII 文字列（例: `placeholder`）を `--title` で指定して `gh issue create` / `gh pr create` を実行し、Issue/ PR 番号を取得する
2. **REST API PATCH で正式 title を設定**: 取得した Issue/ PR 番号に対し、本手続きの標準手順で日本語 title を PATCH する

新規作成と PATCH を分離することで、Windows 環境の `--title` cp932 化けを構造的に回避する。

## Merge Conflict 対応パターン

### gh CLI操作中のmerge関連エラー対応

#### 1. PR merge時のconflict検出

`gh pr merge` 実行時にconflictが発生した場合:

**エラー検出**:
```
gh pr merge {pr_number} --squash
# Error: Pull request is not mergeable
```

**確認手順**:
```bash
gh pr view {pr_number} --json mergeable,mergeStateStatus -q '.mergeable, .mergeStateStatus'
```

**状況報告**:
```markdown
## PR Merge Conflict エラー

**PR番号**: #{pr_number}
**マージ可能状態**: {mergeable}
**マージ状態**: {merge_state_status}
**停止理由**: PRにconflictがあるため、mergeできません
**ユーザーアクション**: 手動でconflictを解決してください
1. `gh pr checkout {pr_number}` でブランチをチェックアウト
2. `git pull origin {base_branch}` で最新のbaseを取得
3. 手動でconflictを解決
4. `git push` で解決内容をpush
5. `gh pr merge {pr_number} --squash` で再試行
```

**重要**: 自動的なconflict解決は禁止。
必ず手動解決をユーザーに依頼する。

#### 2. PR作成時のbranch間conflict事前確認

PR作成前にbranch間のconflictを事前に確認する:

**確認手順**:
```bash
# 1. baseブランチの最新状態を取得
git fetch origin {base_branch}

# 2. diffを確認（conflict markersの検出）
git diff origin/{base_branch}...HEAD --check

# 3. conflictがある場合、詳細を表示
git diff origin/{base_branch}...HEAD --name-only
```

**conflictが検出された場合**:
```markdown
## PR作成前 Conflict 検出エラー

**ブランチ**: {current_branch}
**baseブランチ**: origin/{base_branch}
**conflictファイル**: {conflicted_files}
**停止理由**: baseブランチとの間にconflictがあるため、PRを作成できません
**ユーザーアクション**: 手動でconflictを解決してください
1. `git pull origin {base_branch} --rebase`
2. 手動でconflictを解決
3. `git rebase --continue`
4. `git push --force-with-lease`
5. PR作成を再試行
```

**PR作成コマンドの事前チェック**:
`gh pr create` 実行前に上記の手順でconflictを確認し、conflictがある場合はPR作成を停止する。

#### 3. merge失敗時のエラーメッセージ解釈

`gh pr merge` のエラーメッセージを解釈し、適切な対応を提示する:

| エラーメッセージ | 原因 | 対応 |
|----------------|------|------|
| `Pull request is not mergeable` | conflictがある | 手動conflict解決を依頼 |
| `Required status check "ci" is pending` | CIが実行中 | CI完了を待ってから再試行 |
| `Required status check "ci" is failing` | CI失敗 | CIの問題を修正してから再試行 |
| `Branch is behind the base branch` | ブランチが古い | `git pull --rebase` で更新 |
| `Protected branch update failed` | 保護ブランチのルール違反 | 管理者に確認を依頼 |

**エラー報告フォーマット**:
```markdown
## PR Merge 失敗エラー

**PR番号**: #{pr_number}
**エラー種別**: {error_type}
**エラーメッセージ**: {error_message}
**停止理由**: {failure_reason}
**ユーザーアクション**: {user_action}
**詳細手順**: {detailed_steps}
```
