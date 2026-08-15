# Windows コンソールエンコーディング初期化の gh/git CLI 全経路適用（spec 候補）

## 背景

Windows PowerShell/pwsh 環境（既定コンソールコードページ cp932）で、gh CLI / git CLI の日本語を含む操作で mojibake が4件・3経路以上で反復発生した。現行 SPEC（`agentdev-gh-cli` Section 2 Step 0）は「gh CLI WRITE 手続き」にコンソールエンコーディング初期化3行（`[Console]::OutputEncoding` / `$OutputEncoding` / `chcp 65001`）を必須前置する規定を持つが、適用範囲が限定されており、次の3経路が未カバーである:

1. **git CLI 直接操作（message file 経由）**: `git commit -F <file>`、`git tag -F` 等で UTF-8 BOM なし file が cp932 二重エンコードで読み込まれ commit message が mojibake（Issue #2054 / PR #2055）
2. **`gh pr create --title --body-file` 複合呼び出し**: Step 0 を前置しても `--body-file` 側に cp932 影響が残る第3の経路。`gh api --input <JSON>` への切替で修復（Issue #2058 / PR #2059）
3. **READ 系パイプライン出力**: `git show`、`Get-Content`、`Select-String` 等の READ 出力も `[Console]::OutputEncoding` 既定値に依存し mojibake。Node.js execSync / fs.readFileSync、または Read tool が構造的に安全（Issue 2100 / PR 2110）

## 問題

エンコーディング初期化の必須前置が「gh CLI WRITE 手続き」のみに規定され、git CLI 直接操作・READ 経路・複合呼び出しでの保護が仕様上存在しない。このため (a) 運用時の初期化省略（Step 0 省略で `--body-file` mojibake、Issue #2050 / PR #2051 — application miss）、(b) 規定対象外経路での発生（fix gap）、(c) 複合呼び出しでの保護不十分（fix gap + 既存 AG-001 `--title` inline 禁止違反の混在）が区別なく再発している。

## 望ましい変更

コンソールエンコーディング初期化の適用範囲を次のとおり拡張して規範化する:

1. git CLI 直接操作の WRITE（`git commit -F`、`git tag -F`、`git merge` 等 message file 読み取り経路）にも Step 0 相当の初期化3行を必須前置する
2. `gh pr create` / `gh issue create` で `--title` と `--body-file` の同時渡しを避け、(a) ASCII 仮 title + `--body-file` のみ → (b) REST API PATCH による日本語 title 設定、の2段階シーケンスを標準とする（または `gh api --input <JSON>` 経由に統一）
3. PowerShell パイプライン経由の日本語 READ（git show / git log / checker スクリプト出力の受取）では `[Console]::OutputEncoding = UTF8` 前置、または Node.js execSync / fs.readFileSync 経路を指定する

## 対象範囲

### 対象

- `agentdev-gh-cli` SPEC（standard-procedures.md）Section 2 Step 0 の適用範囲定義
- git CLI 直接操作時の encoding 初期化要件の明文化先（`agentdev-gh-cli` 標準手続きへの追加、または `agentdev-git-worktree` 等の git 操作手順書）
- `gh pr create` 複合呼び出しの標準シーケンス規定

### 対象外

- Linux/macOS/WSL 環境（発生経路なし）
- ハーネス（OpenCode）ツール自体のエンコーディング挙動変更
- 既存 AG-001（`--title` inline 禁止）・AG-002（REST API PATCH 標準）の再定義（本変更は組合せ拡張のみ）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill reference | `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` | Section 2 Step 0 の適用範囲を gh CLI WRITE から「gh/git CLI の WRITE・file 読み取り経路」へ拡張。READ 手順に pwsh パイプライン経由の注意と安全経路（execSync/fs.readFileSync）を明記 |
| skill | `src/opencode/skills/agentdev-git-worktree/SKILL.md`（または references） | git CLI 直接操作（commit -F 等）時の encoding 初期化要件の注意喚起 |
| spec 候補 | `docs/specs/`（配置は req-define / spec-save で判断） | 2段階シーケンス（ASCII 仮 title → REST API PATCH）の標準化 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`（Section 2 Step 0、共通制約の `--title` inline 禁止・REST API PATCH 標準、Section 3 READ 手続きの execSync 規定）
- **ギャップ分類**: fix gap（主体）+ application miss（混在）
- **ギャップ詳細**: Step 0 は gh CLI WRITE に限定され、git CLI 直接操作・READ パイプライン・複合呼び出しの `--body-file` 保護が未規定（fix gap）。エントリ1（Issue #2050）は既存 Step 0 の適用省略による application miss、エントリ3（Issue #2058）は既存 AG-001 違反（`--title` inline）を含み、fix gap は2段階シーケンス未標準化の部分に限定される。成果物の証拠引用では両者を区別すること

## 制約

- 既存 SPEC・AG の文言と矛盾させない（拡張のみ。AG-001/AG-002 は前提として存置）
- 本変更は手続き規範の拡張であり、ハーネス側ツール仕様の変更を含まない
- `agentdev-gh-cli` はローカル版（`src/opencode-local/`）と通常版で参照先が分かれる構成に注意（REQ-009、DEC-004）

## 受け入れ条件

- [ ] Step 0 相当の初期化要件が git CLI 直接操作（message file 経由）に適用されることが手順書に明記されている
- [ ] `gh pr create --title --body-file` 複合呼び出しの回避シーケンス（2段階 or `gh api --input`）が標準手順として規定されている
- [ ] READ 系パイプライン出力の安全経路（OutputEncoding 前置 / execSync / Read tool）が明記されている
- [ ] Windows 環境での gh/git WRITE・READ 操作手順を参照する command/skill からの導線が確認されている

## 元learning item / 根拠

- **要約**: Windows cp932 環境での gh/git CLI 日本語操作の mojibake が4件・3経路以上で反復。現行 SPEC の初期化規定は gh CLI WRITE に限定され、git CLI 直接操作・READ 経路・複合呼び出しが未カバー
- **根拠**: Issue #2050/PR #2051（Step 0 省略で --body-file mojibake）、Issue #2054/PR #2055（git commit -F の cp932 二重エンコード）、Issue #2058/PR #2059（Step 0 前置でも複合呼び出しで body mojibake、`gh api --input` で修復）、Issue 2100/PR 2110（git show / Get-Content / Select-String の READ 出力 mojibake）。title は正常で body のみ化ける非対称症状が decode 経路差分を示す
- **再発条件**: Windows pwsh 環境で初期化なし（または不十分な形式）で日本語を含む gh/git CLI 操作を実行する場合
- **横展開可能性**: 高い。Windows 環境の gh/git CLI 操作全般。AgentDevFlow 導入プロジェクトでも同一発生

## 推奨Issue分類

- **分類**: chore（文書・手順規範拡張。実装コード変更は checker・手順書参照の更新のみ）
- **推奨ラベル**: documentation, windows, encoding
- **関連Issue**: #2050, #2054, #2058, 2100（いずれもクローズ済みの発生元）
