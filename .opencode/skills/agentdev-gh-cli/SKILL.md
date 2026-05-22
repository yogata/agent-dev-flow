---
name: agentdev-gh-cli
description: Enforces safe GitHub CLI usage on Windows (PowerShell/cmd) by routing all multi-line body content through temporary files to prevent encoding and escaping errors. Also provides post-write verification to detect encoding corruption, Markdown structure loss, and missing template sections. USE FOR: running gh issue/pr/release commands with --body or --body-file, reading gh command output safely on Windows, writing Issue/PR content, verifying Issue/PR content after writing. DO NOT USE FOR: basic gh commands without body content, non-Windows environments, or general git operations.
---

# agentdev-gh-cli

## 動作指針

Windows上の標準シェル（PowerShell/cmd.exe）の制約を回避するため、以下の手順を強制する。

## WRITE操作（書き込み安全性）

### 1. 禁止事項

- `gh` コマンドの引数として `--body "..."` を直接使用することを禁止する。
- `<<EOF` (HEREDOC) 構文によるファイル作成を禁止する。
- PowerShell のファイル書き込みコマンド（`Out-File`, `Set-Content`, `>` リダイレクト, `>>` 追記リダイレクト, `New-Item`（コンテンツ付き）, `[IO.File]::WriteAllLines`）による一時ファイル作成を禁止する。**例外**: `[System.IO.File]::WriteAllText` に `UTF8Encoding($false)` を指定する場合は許可する（Section 2 標準手順で使用）。
- **理由**: Windows環境では PowerShell のファイル書き込みコマンドがシステムデフォルトエンコーディング（Shift-JIS 等）を使用するため、UTF-8 での保存が保証されない。

### 2. 標準手順

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

### 6. リトライロジック

- 検証失敗時、同一内容で書き込みを再実行し、再度検証する
- 最大 **3回** までリトライ
- 3回リトライ後も失敗する場合、ユーザーに以下を報告して停止:
  - 失敗した操作（例: `gh issue edit #42`）
  - 検出された差分の内容
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
- `intake-from-github`: Epic本文更新、子Issue本文更新（通常検証）、抽出コメント（best-effort: 検証失敗時は警告のみでリトライなし）
