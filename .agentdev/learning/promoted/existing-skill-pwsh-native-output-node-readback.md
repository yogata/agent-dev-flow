# pwsh 経由ネイティブコマンド出力の破損と Node.js 実行経路への統一（既存 skill 反映）

## 背景

Windows 環境の pwsh パイプライン・リダイレクト経由でネイティブコマンド出力を受け取る構成の破損が3経路で反復した。前回 learning-promote（2026-08-15）で living pool に残していた同根2エントリ（gh CLI パイプライン UTF-8 損傷、check_integrity subprocess 空 stdout）と、今回の PR #2172（OU-006）の1エントリが同一の根本原因（pwsh 経由の出力変換・execSync の非ゼロ exit 例外）に集約されるため、本 run の living pool 再評価で3件反復のクラスとして昇華する。

## 問題

agentdev-gh-cli 標準手続きの READ 安全手順（Node.js execSync / fs.readFileSync 経由）は gh CLI 向けに限定して規定されている。bun/node 系検証スクリプト（`check_integrity.ts --json` 等）の JSON 出力を pwsh リダイレクトでファイル化する経路、および exit code が意味を持つ検証コマンドの stdout を `execSync` で取得する経路が未カバーであり、(a) UTF-8 → cp932 化け・不正制御文字による JSON 破損、(b) exit 1 時の例外で stdout が後続処理に渡せない、が反復する。

## 望ましい変更

1. JSON 出力する検証スクリプトの呼出しは `spawnSync`（status と stdout の分離取得）+ `fs.writeFileSync`（UTF-8 明示）へ統一する
2. agentdev-gh-cli 標準手続きの適用範囲解説を「gh CLI」から「gh CLI・bun/node 系検証スクリプトを含むネイティブコマンド全般」へ拡張する
3. exit code が意味を持つ検証コマンド（check_integrity 等）の stdout 利用では、非ゼロ exit 時も stdout を取得できる実行形式（spawnSync または `err.stdout` 退避）を明記する

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`（READ 安全手順の適用範囲解説の拡張）
- `src/opencode/skills/agentdev-gh-cli/references/verify.md`（検証観点への JSON 読み取り経路の追加）
- 検証スクリプト呼出を実装する case-run / case-close の検証手順

### 対象外

- pwsh 本体のエンコーディング仕様変更（前提として扱う）
- チェッカー実装側の出力形式変更（`--json` 等のインターフェースは維持）
- Linux/macOS 環境（既定 UTF-8 コンソールのため発生しない）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill reference | `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` | READ 安全手順の適用範囲を検証スクリプト（bun/node 系）出力へ拡張し、spawnSync + fs.writeFileSync 統一を追記 |
| skill reference | `src/opencode/skills/agentdev-gh-cli/references/verify.md` | mojibake 検出観点へ JSON ファイル読み取り経路の注意を追記 |
| skill reference | case-run / case-close 検証手順 references | exit code が意味を持つコマンドの stdout 取得形式（spawnSync 分離）を追記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 3「安全な読み取り手順」（gh CLI WRITE/READ 向け）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 適用範囲が gh CLI に限定され、bun/node 系検証スクリプト（check_integrity --json 等）の JSON 出力読み取りと、exit code が意味を持つコマンドの stdout 取得（spawnSync による status/stdout 分離）が未カバー

## 制約

- agentdev-gh-cli はローカル版（`src/opencode-local/`）と通常版で参照先が分かれる構成に注意する（REQ-009、DEC-004）
- execSync を全面禁止としない（gh CLI の単発 READ など成功が見込める呼び出しは維持し、失敗しうる検証コマンドを spawnSync 対象とする境界を明確化する）

## 受け入れ条件

- [ ] 検証スクリプトの JSON 出力読み取りに spawnSync + fs.writeFileSync（UTF-8）統一が明記されていること
- [ ] READ 安全手順の適用範囲がネイティブコマンド全般（gh/git/bun/node 系）へ拡張明記されていること
- [ ] exit code が意味を持つコマンドの stdout 取得形式（非ゼロ exit 時の stdout 退避）が明記されていること

## 元learning item / 根拠

- **要約**: pwsh のパイプライン・リダイレクト経由のネイティブコマンド出力はエンコーディング変換・破損を受け、execSync は非ゼロ exit で stdout を失う。検証証拠の読み取り経路を Node.js（spawnSync）へ統一する
- **根拠**: (1) PR #2172（OU-006、Issue #2163）case-close QG-4 再検証: `check_integrity.ts --json` の出力を pwsh リダイレクトでファイル化したところ UTF-8 が cp932 化け JSON が不正コントロール文字で破損。ng 残存時の exit 1 で execSync が例外を投ぎ stdout を後続に渡せず。spawnSync で r.stdout を status に関わらず取得し、ファイル書き出しも Node fs.writeFileSync に統一して解消。【living pool 由来（prune 済み）】(2) gh CLI 出力の PowerShell パイプライン経由読み取りによる UTF-8 損傷（PR #1600 系。LF 数計測不正・日本語化け。Node.js execSync 経由で解消）。(3) Windows worktree 環境で check_integrity.ts の subprocess JSON が空 stdout を返す問題（Epic #1719 Wave 4。child_process 経由 stdout の codepage 依存。pre-existing 判定されたが同一根因の反復観測）
- **再発条件**: pwsh でネイティブコマンド出力をリダイレクトやパイプで受け取る場合、失敗しうるコマンド（exit code が意味を持つ検証スクリプト）の stdout を execSync で使う場合
- **横展開可能性**: 高い。Windows 環境のネイティブコマンド出力扱い全般

## 推奨Issue分類

- **分類**: chore（配布 skill 手続の適用範囲拡張）
- **推奨ラベル**: documentation, windows, encoding, verification
- **関連Issue**: #2163 (CLOSED)
