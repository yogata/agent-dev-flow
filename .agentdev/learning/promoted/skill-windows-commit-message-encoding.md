# Windows 環境での git commit メッセージ作成時のエンコーディング手順拡張

## 背景

Windows 環境で git commit メッセージに日本語を含める際、PowerShell の `Out-File -Encoding utf8` でメッセージファイルを作成すると BOM 付き UTF-8 となり、コミットメッセージ先頭に BOM 文字が混入して化けが発生した（#3）。agentdev-gh-cli WRITE 標準手続きは `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` を規定するが、git commit メッセージ作成時は同手続きの対象外として運用されていた。

## 問題

- Windows 環境で PowerShell の `Out-File`/`Set-Content`/`>` リダイレクトで commit メッセージファイルを作成すると、Windows PowerShell 5.x で BOM 付き UTF-8 が生成され、コミットメッセージ先頭に BOM 文字が混入する
- agentdev-gh-cli standard-procedures.md の WRITE 標準手順（Section 2 Step 1）は Issue/PR 本文作成を対象とし、**git commit メッセージ作成を明示的に対象外**として運用されていたため、commit メッセージ作成時は BOM 付き UTF-8 化けが発生し得る状態だった

## 望ましい変更

agentdev-gh-cli standard-procedures.md の WRITE 標準手順を git commit メッセージ作成時へも拡張適用する旨を明文化する。または別セクション「git commit メッセージ作成時」を新設し `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` を規定する。併せて `node -e` + `fs.writeFileSync(path, content, 'utf-8')` による代替手法（PR #1921 で実証済み）も併記する。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`（既存 WRITE 標準手順の対象拡張 または 新規セクション）

### 対象外

- AGENTS.md の既存の edit ツール優先・Write ツール制限の記述（既存のままで妥当、本件は commit メッセージ作成時の手順化）
- Issue/PR 本文作成手順（既に WRITE 標準手順でカバー済み）
- `git tag` 等の他ネイティブコマンド（横展開観点として参考記載は可能だが必須対象外）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` | 既存 WRITE 標準手順（Section 2 Step 1）の対象へ git commit メッセージ作成を含める旨を明文化。または別セクション「git commit メッセージ作成時」を新設し `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` と `node fs.writeFileSync(path, content, 'utf-8')` 代替手法を規定 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 1（`[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` 規定）、AGENTS.md（edit ツール優先・Write ツール cp932 化け実証の記述）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存 WRITE 標準手順は Issue/PR 本文（`--body-file`/`-F` 指定）を対象とし、git commit メッセージ作成（`git commit -F <file>`）は明示的に対象外として運用されていた。PR #1921 で commit メッセージ作成時に BOM 化けが発生し、`node fs.writeFileSync` で安定化した経緯があるが、手順化は未完了

## 制約

- 既存の WRITE 標準手順（Issue/PR 本文）と両立すること。既存規定を変更せず対象拡張または別セクション追加のいずれかを選択する
- `git commit -F <file>` を前提とし、`-m` 直接指定の日本語化け（コンソールコードページ問題）は別件として扱う（本件はファイル指定時の BOM 問題）
- PowerShell 5.x と PowerShell 7+ で挙動差がある点に注意し、`UTF8Encoding($false)` で両環境-safe な手順を維持する

## 受け入れ条件

- [ ] git commit メッセージ作成時に `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` を使用する手順が standard-procedures.md へ明文化されていること
- [ ] `node fs.writeFileSync(path, content, 'utf-8')` 代替手法が併記されていること（PR #1921 実証済み）
- [ ] 既存の Issue/PR 本文 WRITE 標準手順と矛盾しないこと

## 元learning item / 根拠

- **要約**: Windows 環境で PowerShell の `Out-File -Encoding utf8` が BOM 付き UTF-8 を生成し、commit メッセージ先頭に BOM 文字が混入する問題と、既存 WRITE 標準手順の対象外運用
- **根拠**: PR #1921 case-run 実装中、Windows 環境で commit メッセージファイルを `Out-File -Encoding utf8` で作成し BOM 化けが発生。`node -e` + `fs.writeFileSync(path, content, 'utf-8')` で commit メッセージファイルを作成後 `git commit -F <file>` でコミットする手法へ切替えて安定化した。agentdev-gh-cli WRITE 標準手続きは `[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` を規定するが commit メッセージ作成時は対象外として運用されていた
- **再発条件**: Windows 環境で PowerShell の `Out-File`/`Set-Content`/`>` リダイレクトで commit メッセージファイルを作成する場合
- **横展開可能性**: Windows 環境で `git commit`、`git tag`、その他ネイティブコマンドへ日本語ファイルを渡す全ケースで BOM 付き UTF-8 化けが発生し得る。AgentDevFlow で Windows + PowerShell + git を頻用する環境では再発可能性が高い

## 推奨Issue分類

- **分類**: feature（既存 skill 手順の対象拡張）
- **推奨ラベル**: documentation, enhancement, windows
- **関連Issue**: PR #1921、Issue #1918、agentdev-gh-cli WRITE 標準手順（`src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`）
