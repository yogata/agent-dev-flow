---
title: `agentdev-gh-cli` Design
status: accepted
created: "2026-08-15"
updated: "2026-09-02"
---
<!-- ADF-COVERS(implementation): REQ-011-001, REQ-011-003, REQ-011-004, REQ-011-005, REQ-011-009, REQ-011-013, REQ-011-015 -->
<!-- ADF-COVERS(implementation): REQ-011-001, REQ-011-002, REQ-011-003, REQ-011-004, REQ-011-005, REQ-011-008, REQ-011-009, REQ-011-013, REQ-011-014, REQ-011-015 -->

# `agentdev-gh-cli` Design

## 目的

`agentdev-gh-cli` は AgentDevFlow の GitHub I/O を一箇所に集約する中央集権的な I/O 境界である（REQ-011, DEC-004）。
command と skill は GitHub CLI（gh）コマンドを直接記述せず、Custom Tool `agentdev_gh` の操作契約（gh CLI 手続きの委譲先、REQ-011-022〜024）へ委譲する。
ローカル版は Custom Tool `agentdev_gh` の実行ディレクトリを差し替えることで GitHub 非依存の運用を実現する（v2:REQ-0150, DEC-004）。

## 責務定義

gh CLI 手続きの実行主体は Custom Tool `agentdev_gh` であり、実装詳細（gh CLI フラグ、エンコーディング制御、一時ファイル扱い）は Tool 内部に隠蔽される（REQ-011、custom-tool-contracts Design）。
`agentdev-gh-cli`（本 skill の Design）は GitHub Issue / PR に対する I/O 手続きと VERIFY の安全手順を Design として所有する参照点であり、手続きのみを提供し判断基準は持たない（REQ-011, DEC-004 decision #2）。
本文生成、完了判定、Epic 依存判定、capture 分類は担当しない。
これらは domain skill の責務である。

### 担当

| 区分 | 内容 |
|---|---|
| I/O 手続き | Issue 作成、Issue 本文読込、Issue 本文更新、Issue コメント追加、PR 本文読込、PR merge、Issue close |
| VERIFY | 書き込み後の読み戻し検証（エンコーディング、Markdown 構造、テンプレート必須セクション、リポジトリ参照リンク正規化） |

### 非担当

| 区分 | 担当 |
|---|---|
| 本文生成 | domain skill（`agentdev-issue-management`、`agentdev-epic-tracker` 等） |
| 完了判定 | command（case-close 等） |
| Epic 依存判定 | domain skill（`agentdev-epic-tracker`） |
| capture 分類 | domain skill（`agentdev-intake-pipeline`、`agentdev-learning-pipeline`） |

## 操作契約

`agentdev-gh-cli` は以下の手続きを提供する（REQ-011, DEC-004 decision #3）。
各手続きの引数、戻り値、エラー扱いの詳細は references を参照。

| 手続き | 入力 | 出力 |
|---|---|---|
| Issue 作成 | タイトル、本文、ラベル | Issue 番号、Issue URL |
| Issue 本文読込 | Issue 番号 | Issue 本文（Markdown） |
| Issue 本文更新 | Issue 番号、本文 | なし（VERIFY で確認） |
| Issue コメント追加 | Issue 番号、コメント本文 | なし（VERIFY で確認） |
| PR 作成 | タイトル、本文、ベースブランチ、ヘッドブランチ | PR 番号、PR URL |
| PR 本文読込 | PR 番号 | PR 本文（Markdown） |
| PR merge | PR 番号、merge 方式 | merge コミットハッシュ |
| Issue close | Issue 番号、close 理由（`completed` / `not_planned`、省略時 `completed`） | なし |
| VERIFY | 操作対象の識別子 | 検証結果（PASS / FAIL、検証観点別結果） |

### 拡張手続き（REQ-011-011）

基盤手続き一覧（REQ-011-002）を UPDATE せず、拡張手続きとして新設する2手続き（REQ-011-011）。
case-close 等、PR のメタデータを読み取る command から委譲される。

| 手続き | 入力 | 出力 | 事後条件 |
|---|---|---|---|
| PR 変更ファイル一覧取得 | PR 番号 | 変更ファイルパス一覧（文字列配列） | 出力配列の各要素が PR の変更ファイルパスと一致すること |
| PR mergeable 状態取得 | PR 番号 | `MERGEABLE` / `CONFLICTING` / `UNKNOWN` | gh CLI が返した `mergeable` 値をそのまま enum に写すこと |

事後条件は READ 手続き（VERIFY 4観点の対象外）であるため、上記出力検証条件を適用する。
本文生成、完了判定を含まない（REQ-011-004 準拠）。
標準版（GitHub 版）の gh CLI 実行例、Windows 環境での READ 手続き扱いは `references/standard-procedures.md` 参照。

### VERIFY の観点

VERIFY は以下の観点で実施する（REQ-011, REQ-011-010）。

- エンコーディング（UTF-8 BOM なし、LF）
- LF 数一致（書き込み元テキストと読み戻しテキストの LF 出現数が一致すること）
- Markdown 構造（見出し行の前が空行またはファイル先頭であること、見出し `##` は行頭から始まること、テーブル列数、チェックボックス、コードブロック開閉、リストインデント）
- テンプレート必須セクション
- リポジトリ参照リンク正規化

リポジトリ参照リンク正規化は裸パス、相対パスを検出する。
LF 数一致、見出し空行・行頭検証は Markdown 構造破壊（事実上の1行化、見出しの見出しとしての認識消失）を機械検出する。

## WRITE 手続きの Windows encoding 初期化必須化（REQ-011-009）

`agentdev-gh-cli` の WRITE 手続き（Issue 作成、Issue 本文更新、Issue コメント追加、PR 作成、PR merge、Issue close 等）は、Windows 環境においてコンソールエンコーディング初期化（standard-procedures Section 2 Step 0）を**必須前置**する（REQ-011-009）。

### 要件

- **対象**: 全 WRITE 手続き（gh CLI に `--body-file`/ `-F`/ `--title` 等の引数を渡す操作）、および git CLI 直接操作の WRITE（`git commit -F`、`git tag -F` 等のファイル引数に日本語を含む操作）
- **対象外環境**: Linux/ macOS/ WSL 等の Windows 以外の環境（既定で UTF-8 コンソール）
- **必須前置内容**: WRITE 操作前に以下の3行を実行してコンソールエンコーディングを UTF-8 に初期化する

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
cmd /c chcp 65001 | Out-Null
```

- **READ 手続きのパイプライン拡張**: PowerShell パイプライン経由で日本語出力を読み取る READ 操作（`git show`、`Get-Content`、`Select-String` 等）は、パイプライン前に `[Console]::OutputEncoding` の前置を行うか、Node.js `execSync` / `fs.readFileSync` 経路で取得する。Node.js 経由の READ はコンソールエンコーディングに依存しないため前置を要しない

### title と本文の同時渡し回避シーケンス

- gh pr create / gh issue create で `--title` と `--body-file` を同時渡ししない。日本語 title を伴う作成は、ASCII 仮 title + `--body-file` による作成後、REST API PATCH（title 修正標準手続き）により日本語 title を設定する2段階シーケンス、または `gh api --input` による統一を標準とする
- 既存の `--title` inline 禁止・REST API PATCH 標準の規則（Windows 環境固有手続き 項目1〜2）は存置し、本節は適用範囲を拡張する

### 委譲時の一時ファイル代替配置先

- 実行担当サブエージェント委譲など、worktree 隔離境界により `.agentdev/**` への書き込みが禁止される場面では、WRITE 標準手続きの一時ファイル配置先をリポジトリ外の一時領域（`$env:TEMP` 配下）とする
- 代替配置時も create → gh 実行 → VERIFY → cleanup の1手順ユニットと cleanup 省略不可ステップを維持する
- 委譲プロンプトの MUST NOT（`.agentdev/**` 全域を触らない）側は変更しない

### 理由

既定の Shift-JIS コンソール（`chcp 932`）では、gh CLI が `--title` の日本語引数やメタデータを Shift-JIS として扱い、`--body-file` で UTF-8 BOM なしファイルを指定しても mojibake が発生する。
3行はそれぞれ独立した役割（gh CLI の標準出力/ 標準エラー読み取りエンコーディング、PowerShell からネイティブコマンドへのパイプ渡しエンコーディング、コンソールコードページ）を持つため省略不可。
git CLI 直接操作も同一のコードページ依存を持つため、WRITE 全経路へ適用を拡張する。

### 委譲基盤との関係

gh WRITE 操作を行う全 command/ skill（case-open、case-run、case-close、case-update 等）は `agentdev-gh-cli` 手続き（Section 2 標準手順）経由で Step 0 の恩恵を受ける（REQ-011-001/006/007）。
command/ skill 側での個別実装は不要であり、委譲基盤が本要件を一括して担保する。

### ローカル版の扱い

ローカル版は Case ファイル読み書きへ差し替えられるため、gh CLI 系の本要件は対象外である。
git CLI 直接操作の初期化要件はローカル版にも適用する（ローカル版も git 操作を行うため）。

ローカル版 references の実体構成を次のとおり明示する。

- ローカル版の標準手続きの正は `local-procedures.md`（1ファイル）であり、git CLI 直接操作の初期化要件（Windows コードページ初期化等）を含めて本件要件を記載する
- 通常版の `standard-procedures.md` をローカル版向けに新設しない。参照実体を1ファイルへ維持し、二重管理を回避する
- 「委譲時の一時ファイル代替配置先」節はローカル版へも適用できる。ただしローカル版は Case ファイル読み書きが主経路であるため、gh CLI 系の WRITE 手続き（一時ファイル配置先を含む）が必要になる場面は、ローカル版から gh CLI を直接利用する補助経路に限る

## Windows 環境固有手続き

Windows 環境（Windows PowerShell 5.x / pwsh 7）での gh CLI 実行に特有の手続きを以下5項目として定義する。
本 Design は各手続きの存在と `references/standard-procedures.md` への参照関係のみを定め、詳細実装（gh CLI フラグ、PowerShell 式、ファイル配置、cleanup 手順）は同ファイルへ委譲する（REQ-011、DEC-004 decision #3）。
ローカル版は Case ファイル読み書きへ差し替えるため本要件の対象外（gh CLI を使用しない）。

### 対象手続き（5項目）

| # | 項目 | 概要 | 詳細参照 |
|---|------|------|---------|
| 1 | cp932 化け対策 | Windows 環境での `--title` / inline `--input` 引数の使用禁止、`--body-file` / `gh api --input` 推奨。コンソールエンコーディング初期化（Section 2 Step 0）と `--title` 引数 decode を別問題として扱う | `references/standard-procedures.md`「共通制約」「Section 2 Step 0」。REQ-011-009 詳細は前節「WRITE 手続きの Windows encoding 初期化必須化」参照 |
| 2 | title 修正 REST API PATCH 標準手続き | title 修正が必要な場合の `gh api -X PATCH /repos/{owner}/{repo}/issues/{N}` + UTF-8 JSON `--input` file 標準手続き | `references/standard-procedures.md`「title 修正 REST API PATCH 標準手続き」 |
| 3 | 一時ファイル配置（`.agentdev/tmp/`）と cleanup 一体化 | 一時ファイル配置を `.agentdev/tmp/`（workspace-local）へ統一。create → gh 実行 → VERIFY → cleanup を1手順ユニットとし、cleanup を省略不可ステップ化 | `references/standard-procedures.md`「Section 2 標準手順」「Section 3 安全な読み取り手順」 |
| 4 | PowerShell regex MatchEvaluator 内 -replace 注意と回避策 | PowerShell regex MatchEvaluator 内での `-replace` 演算子使用による意図しない置換破壊と回避策（Node.js `String.split/join` または PowerShell `[String]::Replace`） | `references/standard-procedures.md`「PowerShell regex MatchEvaluator 内 -replace 使用注意」 |
| 5 | backreference `$N` 対策との区別 | 項目4とは別件。`-replace` 演算子右辺での regex backreference `$N` を PowerShell 変数補間から守るシングルクォート囲み規則 | `references/standard-procedures.md`「PowerShell 変数補間（regex backreference `$N`）」 |

### cp932 化け対策と「WRITE 手続きの Windows encoding 初期化必須化」の関係

前節「WRITE 手続きの Windows encoding 初期化必須化（REQ-011-009）」は項目1（cp932 化け対策）のうちコンソールエンコーディング初期化を REQ-011-009 として正規化した詳細要件である。
本節は5項目カタログの文脈で cp932 化け対策の全体像（`--title` / inline `--input` 使用禁止、`--body-file` / `gh api --input` 推奨、コンソール初期化）を整理し、REQ-011-009 節と両立する。
項目1が指す「コンソールエンコーディング初期化と `--title` 引数 decode の別問題性」とは、Section 2 Step 0（コンソールコードページ切替）が `--title` 引数の文字列出力経路とは独立していることを指す。
Step 0 を実行しても `--title` の inline 渡しは cp932 経路のリスクを完全に除去しないため、`--title` / inline `--input` は原則使用禁止とし、title 修正は項目2の REST API PATCH 経由を標準とする。

## 薄いルーティング入口と references 分離

`agentdev-gh-cli` の SKILL.md は薄いルーティング入口とする（REQ-011, DEC-004 decision #3）。
操作契約の詳細、標準版（GitHub 版）の具体的実装手順、VERIFY 観点、リトライロジックは references 配下に分離する。

### references 構成

| ファイル | 内容 |
|---|---|
| references/contracts.md | 操作契約（手続き名、引数、戻り値、エラー扱い） |
| references/standard-procedures.md | 標準版の具体的実装手順（gh CLI のフラグ、`--body-file`、`chcp 65001` 等） |
| references/verify.md | VERIFY の実装観点と検査項目 |
| references/retry.md | 3 段階リトライロジック（同一内容リトライ、内容再生成、停止、ユーザー報告） |

### SKILL.md の役割

SKILL.md は各手続きのルーティングのみを記述する。
具体的な gh CLI フラグ、一時ファイル扱い、エンコーディング初期化は SKILL.md に直接記述しない。

## gh 直接記述の検出スコープ（inspect-skills 連携）

command/skill 配下で gh コマンド直接記述を検出する `/agentdev/inspect-skills` 診断のスキャン対象と除外対象を定義する（REQ-011, Issue #1104）。
委譲基盤確立後も新規 command/skill が gh 直接記述を導入しないよう、検出辞書が自動担保する。

### スキャン対象

| 対象 | パス | 理由 |
|------|------|------|
| command 配下 | `src/opencode/commands/agentdev/*.md` | 公開コマンド定義。gh 直接記述は `agentdev-gh-cli` 手続きへの委譲が必須 |
| skill 配下 | `src/opencode/skills/agentdev-*/**/*.md` | 公開スキル定義（references 配下を含む）。gh 直接記述は `agentdev-gh-cli` 手続きへの委譲が必須 |

検出パターン: `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)`

コードブロック内、インラインコード内の記述も検出対象とする。
許容ファイル（除外対象）に該当しない限り、委譲漏れとして報告する。

### 除外対象（許容範囲）

| 除外対象 | 理由 | 根拠 |
|-------------|------|------|
| `src/opencode/tools/agentdev-gh/`（Custom Tool `agentdev_gh` 実装。runner-cli.ts 等） | スキャン対象は command/skill 配下のみであり、Custom Tool 実装はスキャン対象外。GitHub I/O を集約する Tool 実装が gh コマンドを直接保持することは委譲の目的と矛盾しない（Tool 内実装として呼び出し側へ隠蔽する） | REQ-011-003, REQ-011-013 |

command/skill 配下のファイルが gh 直接記述（gh WRITE 直接実行）を保持する場合は委譲漏れとして検出する。読み取り系は Design custom-tool-contracts「迂回防止」の許容範囲に従う。

### 検出時の推奨 route

gh 直接記述を検出した場合、`gh-direct-invocation-leak` 分類で報告し、`agentdev-gh-cli` 手続き（references/contracts.md の操作契約）への委譲を推奨する。

## 差し替え可能性（ローカル版）

ローカル版は Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）を `src/opencode-local/agentdev-gh-cli/`（Local 実装）へ差し替え、同一操作契約でローカルIssue（`.agentdev/issues/issue-{NNNN}.md`）の読み書きへ読み替える（v2:REQ-0150, DEC-004 decision #4, #5、REQ-011-006）。
PR 関連操作はスキップせず、role: case のローカルIssueが持つ PR 相当セクションで代替する（DEC-004 decision #5）。
GitHub 非依存の抽象 backend は新設せず、GitHub 前提の操作契約を保ったまま実装を差し替える方式とする（DEC-004 decision #6）。

### 操作とローカルIssueの対応

| 通常版操作 | ローカル版での読み替え先 |
|---|---|
| Issue 作成 | ローカルIssue新規作成（role に応じた本文標準構造） |
| Issue 本文読込 | ローカルIssue読込 |
| Issue 本文更新 | ローカルIssue本文更新 |
| Issue コメント追加 | role: tracking は `## 検討経過`（日時エントリ）へ、role: case は `## 作業ログ` へ追記（コメント読み替えの role 分岐） |
| 追跡Issue操作（role: tracking） | ローカルIssue（role: tracking）の状態遷移、kind、本文標準構造への読み替え（論理スキーマの正は agentdev-issue-tracking Design） |
| PR 作成 | role: case のローカルIssue更新（PR 相当セクション: `## マージ前確認`、`## Design確定候補`、`## Findings / Capture候補`） |
| PR 本文読込 | role: case のローカルIssue読込（PR 相当セクション） |
| PR merge | `## マージ結果` へ記録 |
| Issue close | `status` 終端値 + `closed_at` 更新 |
| VERIFY | ローカルIssue読み戻し検証（frontmatter、必須セクション、role 条件付きスキーマ） |

詳細は [ローカルIssue共通スキーマ](../local/local-case-file.md) 参照。

## 適用対象

- GitHub Issue / PR を操作するすべての command と skill（REQ-011）
- Windows PowerShell 環境での gh CLI 実行（標準版）
- ローカル版でのローカルIssue読み書き（ローカル版）

## 対象外

- 一般的な git 操作（`agentdev-git-worktree` 担当）
- 本文生成、完了判定、Epic 依存判定、capture 分類（domain skill 担当）

## commit メッセージ作成の BOM なし UTF-8 契約

WRITE 標準手順（Windows encoding 指定必須、REQ-011-009）を commit メッセージ作成へ拡張する。

### 契約

- Windows 環境で commit メッセージ作成時に `Out-File -Encoding utf8` が BOM 付き UTF-8 を生成し化ける問題へ対処する
- BOM なし UTF-8 書き出しを契約として明示する
- 実装手段: `node fs.writeFileSync` 等の BOM なし UTF-8 書き出し機能を使用する
- commit メッセージ作成時にも WRITE 標準手順と同等の encoding 制御を適用する

## 関連項目

- [agentdev-issue-management.md](agentdev-issue-management.md)
- [agentdev-inspect-skills.md](agentdev-inspect-skills.md)（gh 直接記述の検出辞書を参照）
- [ローカルIssue共通スキーマ](../local/local-case-file.md)
- [REQ-011](../../requirements/REQ-011.md)（`agentdev-gh-cli` 手続き委譲基盤）
- v2:REQ-0150（tag `v2.11.0`、ローカル版 `agentdev-gh-cli` 実装）
- [DEC-004](../../decisions/DEC-004.md)（`agentdev-gh-cli` を差し替え可能な I/O 境界として確立）
