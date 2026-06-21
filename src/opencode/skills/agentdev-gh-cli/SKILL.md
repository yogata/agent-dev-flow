---
name: agentdev-gh-cli
description: Enforces safe GitHub CLI usage on Windows (PowerShell/cmd) by routing all multi-line body content through temporary files to prevent encoding and escaping errors. Also provides post-write verification to detect encoding corruption, Markdown structure loss, and missing template sections. USE FOR: running gh issue/pr/release commands with --body-file or -F, reading gh command output safely on Windows, writing Issue/PR content, verifying Issue/PR content after writing. DO NOT USE FOR: basic gh commands without body content, non-Windows environments, or general git operations.
---

# agentdev-gh-cli

## 動作指針

Windows上の標準シェル（PowerShell/cmd.exe）の制約を回避するため、以下の手順を強制する。

## 共通制約（全環境共通）

- `--body-file` / `-F` によるファイル指定を全環境で使用する（`--body` 直接指定は禁止）
- 書き込み後の VERIFY 操作（Section 5-8）を全環境で実行する
- 保存形式は **UTF-8 (BOMなし)**、改行コード **LF** とする

## Windows 固有の制約

### PowerShell エンコーディング問題

- PowerShell はネイティブコマンド（gh CLI）の UTF-8 出力をパイプライン経由でエンコーディング変換する。Windows PowerShell 5.x では Shift-JIS に変換、pwsh 7 でも日本語が破損する場合がある
- Windows PowerShell 5.x の `Out-File -Encoding utf8` は BOM 付き UTF-8 を生成し、要件に違反する

### BOM 問題

- PowerShell のファイル書き込みコマンド（`Out-File`, `Set-Content`, `>` リダイレクト, `>>` 追記リダイレクト, `New-Item`（コンテンツ付き）, `[IO.File]::WriteAllLines`）は BOM 付きまたは Shift-JIS になる可能性があるため使用禁止
- **例外**: `[System.IO.File]::WriteAllText` に `UTF8Encoding($false)` を指定する場合は許可する

### execSync バイパス

- `gh` コマンドの出力取得には Node.js `child_process.execSync` を使用する（pwsh パイプラインをバイパスして gh CLI の生の UTF-8 出力を直接取得するため）

## WRITE操作（書き込み安全性）

### 1. 禁止事項

- `gh` コマンドの引数として `--body "..."` を直接使用することを禁止する。
- `<<EOF` (HEREDOC) 構文によるファイル作成を禁止する。
- PowerShell のファイル書き込みコマンド（`Out-File`, `Set-Content`, `>` リダイレクト, `>>` 追記リダイレクト, `New-Item`（コンテンツ付き）, `[IO.File]::WriteAllLines`）による一時ファイル作成を禁止する。**例外**: `[System.IO.File]::WriteAllText` に `UTF8Encoding($false)` を指定する場合は許可する（Section 2 標準手順で使用）。
- **理由**: Windows環境では PowerShell のファイル書き込みコマンドがシステムデフォルトエンコーディング（Shift-JIS 等）を使用するため、UTF-8 での保存が保証されない。
- Shift-JIS コンソール環境（`chcp 932` 既定の Windows PowerShell 5.x 等）で、コンソールエンコーディング初期化（Section 2 Step 0）を実行せずに `gh` の WRITE 操作（`--body-file` / `--title` 等）を直接実行することを禁止する。
- **理由**: `--body-file` で UTF-8 ファイルを指定しても、gh CLI がコンソールのコードページ（Shift-JIS）を参照してメタデータや `--title` 引数を符号化するため、`--title` への日本語渡干渁・gh CLI 内部の文字列表記の文字化けが発生する。`[System.IO.File]::WriteAllText` によるファイル書き出し規定（UTF-8 BOM なし）と競合しないよう、ファイル書き出しは既存規定を維持し、コンソールエンコーディング初期化は独立した前置ステップとする（Section 2 Step 0）。

### 2. 標準手順

0. **コンソールエンコーディング初期化（Windows 環境では必須・Windows 以外では不要）**: Windows PowerShell / pwsh 環境では、`gh` の WRITE 操作（`--body-file` / `--title` 等）を実行する前に、現在のセッションで以下の 3 行を実行してコンソールエンコーディングを UTF-8 に初期化すること:
   ```powershell
   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
   $OutputEncoding = [System.Text.Encoding]::UTF8
   cmd /c chcp 65001 | Out-Null
   ```
   - **理由**: 既定の Shift-JIS コンソール（`chcp 932`）では、gh CLI が `--title` の日本語引数やメタデータを Shift-JIS として扱い文字化けが発生する。`[Console]::OutputEncoding` は gh CLI の標準出力・標準エラーの読み取りエンコーディング、`$OutputEncoding` は PowerShell からネイティブコマンドへパイプで渡す際のエンコーディング、`chcp 65001` はコンソールのコードページそのものを UTF-8 に設定する。3 行すべてが独立した役割を持つため省略不可。
   - **Windows 以外の環境（Linux / macOS / WSL 等）では不要**: 既定で UTF-8 コンソールのため実行不要。実行してもエラーになるため実行しないこと。
   - **既存の `[System.IO.File]::WriteAllText`（UTF-8 BOM なし）規定との両立関係**: Step 0 はコンソールエンコーディング初期化（新規ステップ）、Step 1 はファイル書き出し（既存規定）。両者は独立しており、Step 0 を実行しても Step 1 の `[System.IO.File]::WriteAllText` による UTF-8 BOM なし書き出し規定は変更されない。ファイル書き出しは引き続き `[System.IO.File]::WriteAllText` を使用し、`Out-File` / `Set-Content` / `>` 等の禁止コマンドは Step 0 の有無にかかわらず引き続き禁止（Section 1 参照）。
   - REQ-0107-034 が本ステップを要件化している。

1. テキスト（Issue本文、PR説明など）を一時ファイル `.sisyphus/tmp/gh-temp-{timestamp}.md` に書き出す。**PowerShell で `[System.IO.File]::WriteAllText` を使用すること**:
   ```
   [System.IO.File]::WriteAllText(".sisyphus/tmp/gh-temp-{timestamp}.md", $content, (New-Object System.Text.UTF8Encoding($false)))
   ```
   **OpenCode の Write tool も使用可能**（BOMなしUTF-8で書き出す）。PowerShell の `Out-File`, `Set-Content`, `>` 等は使用禁止（Section 1 参照）。
2. 保存形式は **UTF-8 (BOMなし)**、改行コードは **LF** とする。
3. `gh` コマンド実行時に該当ファイルを `--body-file` / `-F` オプションで指定する。

   **フラグ早見表**:

   | サブコマンド | テキスト直接 | ファイル指定 | 短縮形 |
   |---|---|---|---|
   | `gh issue create` | `--body` | `--body-file` | `-F` |
   | `gh issue edit` | `--body` | `--body-file` | `-F` |
   | `gh issue comment` | `--body` | `--body-file` | `-F` |
   | `gh pr create` | `--body` | `--body-file` | `-F` |

4. 実行完了後、一時ファイルを削除する。

## READ操作（読み取り安全性）

### 3. 安全な読み取り手順

1. `gh` コマンドの出力を **Node.js `child_process.execSync`** で取得し、一時ファイルに書き出す:
   ```
   node -e "const{execSync}=require('child_process');const{writeFileSync}=require('fs');const r=execSync('gh issue view {N} --json body -q .body',{encoding:'utf-8'});writeFileSync('.sisyphus/tmp/gh-read-{timestamp}.md',r)"
   ```
   **PowerShell の `>` リダイレクトは使用禁止**（pwsh 7 も含む。ネイティブコマンドのstdout出力がパイプライン経由でエンコーディング変換され、日本語が文字化けするため）。**理由**: Node.js の `execSync` は pwsh パイプラインをバイパスして gh CLI の生の UTF-8 出力を直接取得するため、エンコーディング変換による文字化けが発生しない。
2. Read tool で一時ファイルを読み取る。
3. 読み取り完了後、一時ファイルを削除する。
4. 保存形式は **UTF-8 (BOMなし)**、改行コード **LF** とする。

5. **クォート競合パターン**: `node -e` 内で gh CLI の `-q` にシングルクォートを含む JQ 式（例: `.comments[-1].body`）を渡すと、PowerShell・Node.js・JQ 式のクォート階層が競合しパースエラーになる。このパターンは `-q '.comments[-1].body'` のように JQ 式内に `[]` や `.property.subproperty` を含む場合に発生する。

6. **軽量回避策（第1段階）**: `--json` で JSON 全体を取得し、JS 内で `JSON.parse()` 後にフィルタする:
   ```
   node -e "const{execSync}=require('child_process');const{writeFileSync}=require('fs');const r=JSON.parse(execSync('gh issue view {N} --comments --json comments',{encoding:'utf-8'}));writeFileSync('.sisyphus/tmp/gh-read-{timestamp}.md',r.comments[r.comments.length-1].body)"
   ```
   この方法はインラインで解決可能なクォート競合向け。`-q` を使わず JSON 全体を取得することでクォート階層の競合を回避する。

7. **退避策（第2段階）**: パイプ `|`、変数 `$`、複数段階の条件式を含む場合は `.js` スクリプトファイル（Write tool で作成）への退避を推奨する。`.js` ファイル内であればクォートやシェル解釈の制約を受けない。一時スクリプトは `.sisyphus/tmp/` に配置し、使用後に削除する。

8. **禁止事項**: シングルクォート・パイプを含む式での `node -e` 使用を禁止する。ただし `-q .body` 等の単純なドットアクセス式は禁止しない。判定基準: JQ 式に `[`、`]`（配列インデックス）、`|`（パイプ）、`select()` 等の関数呼び出しが含まれる場合は `node -e` でインライン化してはならない。

9. **禁止事項**: `node -e` 内でのテンプレートリテラル（バッククォート `` ` ``）使用を禁止する。PowerShellがバッククォートをコマンド置換として解釈するため、パースエラーや意図しない動作を引き起こす。

10. **RECOMMEND**: 配列の `.join()` メソッドによる文字列連結を推奨する。

   ❌ 禁止される例（テンプレートリテラル使用）:
   ```
   node -e "const{execSync}=require('child_process');const{writeFileSync}=require('fs');const r=execSync('gh issue view {N} --json body -q .body',{encoding:'utf-8'});writeFileSync('.sisyphus/tmp/gh-read-{timestamp}.md', \`Body: ${r}\`)"
   ```

   ✅ 推奨される例（`.join()` 使用）:
   ```
   node -e "const{execSync}=require('child_process');const{writeFileSync}=require('fs');const r=execSync('gh issue view {N} --json body -q .body',{encoding:'utf-8'});writeFileSync('.sisyphus/tmp/gh-read-{timestamp}.md',['Body: ',r].join(''))"
   ```

   **注**: 退避策（Section 3 項目7）による `.js` スクリプトファイル内では、テンプレートリテラルの使用は許可される。

### 4. 読み取り禁止事項

- `gh` コマンドの出力をPowerShell変数に直接格納することを禁止（`$var = gh ...`）。
- `gh` コマンドの出力をサブ式で直接使用することを禁止（`$(gh ...)`）。
- **PowerShell 7 (pwsh) を含む全バージョンで** `>` リダイレクトによる `gh` コマンド出力の保存を禁止する（ネイティブコマンドの出力がパイプライン経由でエンコーディング変換され、日本語が文字化けするため）。
- Windows PowerShell 5.x での `Out-File -Encoding utf8` による出力保存を禁止する（BOM 付き UTF-8 になるため）。
- **理由**: PowerShell はネイティブコマンド（gh CLI）の UTF-8 出力をパイプライン経由でエンコーディング変換する。Windows PowerShell 5.x では Shift-JIS に変換、pwsh 7 でもネイティブコマンド出力のエンコーディング処理で日本語が破損する場合がある。Windows PowerShell 5.x の `Out-File -Encoding utf8` は BOM 付き UTF-8 を生成し、「UTF-8 (BOMなし)」の要件に違反するため。

## VERIFY操作（書き込み内容検証）

`gh issue create`, `gh issue edit`, `gh pr create`, `gh issue comment` 等の書き込み操作の **直後** に、内容が正しく反映されたかを検証する。各書き込み操作ごとに個別に実行すること（一括検証は不可）。

### 5. 検証手順

1. **読み戻し**: 対象リソース（Issue/PR/コメント）の本文を取得:
   - Issue本文: `gh issue view {N} --json body -q .body`
   - PR本文: `gh pr view {N} --json body -q .body`
   - コメント: `gh issue view {N} --comments --json comments -q '.comments[-1].body'`
   - **Node.js `-e` 内で使用する場合の注意**: 上記 JQ 式のうち `.comments[-1].body` のようにシングルクォートを含む式は `node -e` 内でクォート競合を起こす（Section 3 項目5-8 参照）。(a) 複雑式まで無理にインライン化しないこと。(b) `.js` スクリプトファイルへの退避は過剰抽象化ではなく、シェル解釈事故を回避するための限定的退避策である。
   - 読み取りは Section 3（安全な読み取り手順）に従うこと（一時ファイル経由でRead tool使用）
2. **3観点の比較検証**:

   **(a) エンコーディング検証**:
   - 書き込み元テキストと読み戻しテキストの日本語文字列が一致するか確認
   - 制御文字（U+0000-U+001F, U+007F-U+009F）が混入していないか確認（改行 U+000A, タブ U+0009 は除外）
   - 非Unicode文字への置換が発生していないか確認

   **(b) Markdown構造検証**:
   - テーブル: 行ごとの列数が一致しているか
   - チェックボックス: `- [ ]`, `- [x]` 構文が保持されているか
   - コードブロック: `` ``` `` の開閉ペアが一致しているか
   - リスト: インデント階層が保持されているか

   **(c) テンプレート必須セクション検証**:
   - 書き込み元テキスト内の `【必須】` マーカー付き見出しが、読み戻しテキスト内に全て存在するか確認
   - 検証対象は見出し行（`## ...`）の文字列一致
   - **検証ロジックの詳細**:
     - `<!-- 【必須】 -->` マーカーが見出し行の直後にある場合、そのマーカーの直前の見出し（`## ...`）が必須セクションとして扱われる
     - `<!-- 【必須】 -->` マーカーがない場合、見出し行の次の非空行を必須アンカーとして使用する
     - これにより、テンプレート内でどのセクションが必須かを明示的に制御できる

   **(d) リポジトリ参照リンク検証**:
   - 読み戻しテキスト内のMarkdownリンク `[text](url)` において、リポジトリ内パス（`docs/`, `.opencode/`等で始まる）が相対パスとして使用されていないか確認
   - 検出された相対パス・裸パスはNGとして報告（正しいGitHub URL形式: `https://github.com/{owner}/{repo}/blob/{branch}/{path}`）
   - コードブロック内・テンプレート変数プレースホルダー（`{xxx}`）は検証対象外
   - 詳細なURL形式・パス規則は `agentdev-workflow-templates` スキルの `リポジトリ参照リンク規約` セクションを参照

### 6. リトライロジック（検証失敗時の3段階分類）

検証失敗時、差分の種類に応じて以下の3段階で対応を分類する:

#### (a) 同一内容リトライ

- **適用条件**: エンコーディング変動、一時的なAPI不具合、ネットワーク揺れ等、同一内容の再送で解決する可能性がある差分
- **最大回数**: **2回**（初回 + 2回リトライ = 計3回）
- **手順**: 同一内容で書き込みを再実行し、再度検証する

#### (b) 内容再生成

- **適用条件**: テンプレート必須セクション欠落、Markdown構造崩れ等、書き込み内容自体に問題がある差分。同一内容リトライ (a) で解決しなかった場合も含む
- **手順**: 書き込み元テキストを再生成して書き込み直し、再度検証する
- **再生成後は (a) に戻さない** — 再生成しても失敗する場合は (c) へ移行

#### (c) 停止・ユーザー報告

- **適用条件**: (a) 同一内容リトライ上限到達、(b) 内容再生成後も失敗、または差分が上記以外の原因
- **手順**: ユーザーに以下を報告して停止する:
  - 失敗した操作（例: `gh issue edit #42`）
  - 検出された差分の内容
  - 実行した対応段階（(a)/(b)のどちらまで試行したか）
  - リトライ回数
  - ユーザーの指示を待つ（自動的な代替手段の実行は禁止）

### 7. 検証結果報告

完了報告に以下の形式で検証結果を含める:

```
検証結果: ✅ OK（N件の書き込み操作を検証済み）
```

リトライが発生した場合:

```
検証結果: ⚠️ リトライあり（操作: gh issue edit #42, リトライ: 2回目で成功, 差分: テーブル列ずれ）
```

### 8. 各コマンドでの適用

以下のコマンドの書き込み操作後に本セクション（Section 5-8）を適用すること。各コマンドファイルに記載された `agentdev-gh-cli` の VERIFY操作参照箇所で実行する。

- `case-open`: Issue作成、コメント追加、Epic本文更新
- `case-run`: PR作成
- `case-close`: コメント追記、Issue本文更新、Parent Issue本文更新
- `case-update`: Issue本文更新、コメント追加（通常検証）
- `backlog-review`: RU 生成時の git 永続化（Issue作成は行わない）

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

**重要**: 自動的なconflict解決は禁止。必ず手動解決をユーザーに依頼する。

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
