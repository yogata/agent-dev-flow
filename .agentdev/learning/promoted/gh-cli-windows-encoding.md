# gh CLI Windows 文字化け対策

## 背景

case-auto 自走中（Issue #932 / PR #933）に、Windows PowerShell 環境から gh CLI の `--body-file` / `--title` で日本語を含む Issue 本文を作成した際、GitHub 上の本文が文字化けする問題が発生した。原因調査の結果、一時ファイル自体は正しく UTF-8 (BOM なし) で書かれていたが、PowerShell のコンソール出力エンコーディングが shift_jis（chcp 932）だったため、gh CLI がファイル読み込み・引数渡し時にエンコーディング変換を起こしたことが判明。READ 操作（Node.js execSync）では再発せず（パイプラインをバイパスするため）、WRITE 操作（`--body-file` / `--title`）でのみ発生する。

agentdev-gh-cli SKILL は「OpenCode の Write tool も使用可能（BOMなしUTF-8で書き出す）」「`[System.IO.File]::WriteAllText` を使用すること」としているが、コンソールエンコーディング初期化については明記されていない。これだけでは文字化けを防げないことが実証された。

## 問題

`agentdev-gh-cli/SKILL.md` の Section 1（禁止事項）と Section 2（標準手順）には以下の規定はあるが、コンソールエンコーディング初期化手順が不在：

- Section 1: 「PowerShell のファイル書き込みコマンドは使用禁止」「`--body-file` / `-F` によるファイル指定を全環境で使用する（`--body` 直接指定は禁止）」
- Section 2: 「テキストを一時ファイルに書き出す。PowerShell で `[System.IO.File]::WriteAllText` を使用すること。UTF-8 (BOMなし)」

これにより、ファイルが UTF-8 で正しく書かれていても、PowerShell コンソールが shift_jis の場合に gh CLI 呼び出しで文字化けが発生する。Windows 環境のデフォルトコンソールエンコーディングが shift_jis（chcp 932）であるため、AgentDevFlow を Windows で利用する全ユーザーに影響する。

## 望ましい変更

`agentdev-gh-cli/SKILL.md` の Section 2（標準手順）の冒頭に、gh CLI 呼び出し前のコンソールエンコーディング初期化ステップを必須手順として追記する。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-gh-cli/SKILL.md` Section 1（禁止事項）・Section 2（標準手順）

### 対象外

- 他のスキル・コマンド（gh CLI 以外のツール呼び出しは対象外）
- gh CLI 本体（外部ツール）の改修
- OpenCode 側のエンコーディング設定

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-gh-cli/SKILL.md` | Section 1（禁止事項）に「Shift-JIS コンソール（chcp 932）環境での `--body-file` / `--title` 直接使用禁止」を追記。Section 2（標準手順）の冒頭（Step 0 または Step 1 の前）にコンソールエンコーディング初期化ステップを必須として追記 |

### 追記するコンソールエンコーディング初期化ステップ（Section 2）

```powershell
# gh CLI 呼び出し前に必ず実行（Windows PowerShell 環境）
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
cmd /c chcp 65001 | Out-Null
```

## 既存対策確認

- **確認結果**: 部分（application miss）
- **該当ファイル**: `src/opencode/skills/agentdev-gh-cli/SKILL.md:14-16, 43-51`
- **既存記述の要約**:
  - Section 1: `--body-file` / `-F` によるファイル指定を全環境で使用。`--body` 直接指定は禁止。UTF-8 (BOMなし)・LF
  - Section 2: `[System.IO.File]::WriteAllText` を使用して UTF-8 (BOMなし) で一時ファイルに書き出す手順
- **ギャップ分類**: application miss
- **ギャップ詳細**: ファイルの UTF-8 保存規定はあるが、コンソール自体のエンコーディング初期化手順が不在。「`--body-file` 使用時に Shift-JIS 文字化けを防ぐため、実行前にコンソールエンコーディングを UTF-8 に設定する」という明示的な手順が欠けている

## 制約

- AGENTS.md「編集ガードレール」に従い、長い詳細は references に置かず SKILL.md に簡潔に記載する
- 既存の `[System.IO.File]::WriteAllText` 規定と矛盾しないこと（両立する）
- Windows 以外の環境では不要な手順であることを明記し、環境分岐を明示すること
- source（`src/opencode/`）と projection（`.opencode/`）の両辺を編集すること

## 受け入れ条件

- [ ] `agentdev-gh-cli/SKILL.md` Section 1 に Shift-JIS コンソール環境での `--body-file` / `--title` 直接使用禁止が追記されている
- [ ] `agentdev-gh-cli/SKILL.md` Section 2 にコンソールエンコーディング初期化ステップ（`[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` / `cmd /c chcp 65001`）が必須手順として追記されている
- [ ] Windows 以外の環境での扱い（不要である旨、または環境分岐）が明記されている
- [ ] 既存の `[System.IO.File]::WriteAllText` 規定との関係が整理されている（両立する旨）
- [ ] source（`src/opencode/`）と projection（`.opencode/`）の両辺が編集されている

## 元learning item / 根拠

- **要約**: Windows PowerShell 環境で gh CLI の `--body-file` / `--title` で日本語を含む本文を作成すると、コンソールエンコーディングが shift_jis の場合に GitHub 上で文字化けする。ファイル自体が UTF-8 でも防げない。コンソールエンコーディング初期化が必須
- **根拠**:
  - **#6 (2026-06-19, Issue #932 / PR #933)**: case-auto 自走中に gh CLI の `--body-file` で Issue 本文を作成した際、本文が文字化け。原因調査: 一時ファイルは UTF-8 (BOMなし) で正しく書かれていた（先頭バイト `23 23 20 E8 AA AC E6 98 8E 0A` = `## 説明\n`）。PowerShell のコンソール出力エンコーディングが shift_jis（chcp 932）だったため、gh CLI がファイル読み込み・引数渡し時にエンコーディング変換を起こした。READ 操作（Node.js execSync）では再発せず、WRITE 操作（`--body-file` / `--title`）でのみ発生
- **再発条件**: Windows PowerShell 環境でコンソールエンコーディングが shift_jis（chcp 932）の状態で、gh CLI を `--body-file` / `--title` で日本語を含む本文を作成する全ケース
- **横展開可能性**: Windows PowerShell + gh CLI で日本語を含む Issue/PR を作成する全ユーザーに影響。AgentDevFlow の case-open / case-close 等、gh CLI を呼ぶ全コマンドで潜在的に発生

## 推奨Issue分類

- **分類**: fix（既存スキルの手順欠陥修正）または enhancement（手順追加）
- **推奨ラベル**: bug, enhancement, documentation, agentdev, windows
- **関連Issue**: Issue #932, PR #933
