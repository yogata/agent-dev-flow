# existing-countermeasure-update: check_changed_docs.ts --base-ref ヘルプ文言の正典不整合

## 背景

PR #3074 case-run（Case #3063・Issue #3068・DEL-3068-3）の worktree 実行で、targeted docs guard（check_changed_docs.ts）を `--base-ref origin/main` でコミット前に実行したところ、working tree の未コミット変更が対象にならず対象ファイル 0 件で warning となった。実行者はヘルプ文言の案内（コミット前 = --base-ref 標準）に従って実行した。その場ではコミット後の worktree HEAD で再実行して回収し、挙動を PR 本文に記録済み。

## 問題

check_changed_docs.ts のヘルプ文言（L54-55「--base-ref は worktree 環境（マージ前・コミット前、case-run 等）で git diff により変更ファイル検出するときに使用。モード使い分けの標準は コミット前（worktree 上での検証）= --base-ref、コミット後・PR 作成後（main 環境）= --files」、usage L188-190 同旨）が、次の3面すべてと矛盾する誤案内である。

1. **実挙動**: L215 `git diff --name-only <baseRef>...HEAD`、L589「--base-ref 時は baseRef...HEAD の committed range を見る」＝コミット済み差分のみで、コミット前 working tree の未コミット変更は非対象
2. **恒久契約 Design 正典**: `docs/designs/integrity/targeted-docs-guard-implementation.md` L25-26（「--base-ref: コミット済み差分に基づく変更ファイル検出。実行はコミット後・push 前に限定する（コミット前の worktree では未コミット差分が検出されず、files_checked 空の検査見逃しを生む）」）、L37（「コミット前（worktree 上での検証）は untracked ファイルを含む `--files` による明示指定を標準とする」）、L163（空 files_checked の確認促しに「--base-ref の実行タイミング違反（コミット前実行）」を列挙）
3. **正規手順**: case-run `single.md` L130（STEP-S3-4。--base-ref はコミット後・push 前に限定、コミット前は --files 明示指定標準）、`agentdev-git-worktree` worktree-operations.md L181

正規手順が存在しても、実行時に読まれる唯一の契約案内（checker ヘルプ）が誤っているため誤用が再現する。対象 0 件の空振りは docs 品質検査の見逃しに直結する（Design L163 の確認促し前提は、誤案内があると「対象が無い」と誤解させる）。

## 望ましい変更

checker ヘルプ文言（L54-55、usage L188-190）を正典契約（targeted-docs-guard-implementation.md L25-26・L37）と整合する文言へ修正する。具体的には「--base-ref はコミット済み差分ベースの検出でありコミット後・push 前の実行に限定。コミット前の worktree 上での検証は untracked ファイルを含む --files による明示指定を標準」とする案内へ改める。あわせて Design L37 の「起動時に対象ファイルが検出できる見込みを確認してから実行する」観点の案内をヘルプにも付すことを検討する。

## 対象範囲

### 対象

- `src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts` のヘルプ文言（L54-55、usage L188-190）

### 対象外

- checker の検出ロジック自体（`git diff base...HEAD` の挙動は正典契約どおりで正常）
- case-run STEP-S3-4・worktree-operations.md の手順（既に正規整備済み。本件では修正不要）
- REQ / Decision / Design の内容変更（正典側は矛盾なし。ヘルプ文言修正に伴う相互参照の要否判断のみ req-define が実施）
- check_distribution_boundary.ts 等の他 checker の同種文言確認（関連事例として次節に記録）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布script（実装面） | src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts | ヘルプ文言（L54-55、usage L188-190）を正典契約と整合（--base-ref = コミット後限定、コミット前 = --files 標準） |
| Design（確認のみ） | docs/designs/integrity/targeted-docs-guard-implementation.md | ヘルプ文言修正に伴う相互参照の整合確認（変更不要の可能性が高い。req-define が判断） |

## 既存対策確認

- **確認結果**: あり（3面で正典・手順が整備済み。残るギャップは checker ヘルプ文言1点）
- **該当ファイル**: docs/designs/integrity/targeted-docs-guard-implementation.md（L25-26、L37、L163）、src/opencode/skills/agentdev-workflow-case-run/references/single.md L130（STEP-S3-4）、src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md L181
- **ギャップ分類**: fix gap（checker ヘルプ文言の不整合）
- **ギャップ詳細**: ヘルプ文言が正典 Design・正規手順と正反対の案内をしており、実行時に読まれる唯一の契約案内が誤り。関連事例: check_distribution_boundary.ts への --base-ref 誤用事例が deferred pool に記録済み（根本原因は checker 間 CLI 契約の推測流用で別。実行前の usage / 契約コメント確認という共通の予防観点につながる）

## 制約

- 発生事例自体は PR #3074（case-run DEL-3068-3）でコミット後再実行により回収済み。本件は再発予防（ヘルプ文言是正）の反映である
- checker 実装面（配布 script）の変更を含むため、実現要否・方式・traceability 宣言は req-define と実行契約（case-open/run）が確定する
- `--files` と `--base-ref` の排他関係・PowerShell 引数形式等の既存規約（Design L40、STEP-S3-4）は変更しない

## 受け入れ条件

- [ ] check_changed_docs.ts のヘルプ文言（L54-55、usage L188-190）が targeted-docs-guard-implementation.md L25-26・L37 の正典契約と整合している
- [ ] コミット前検証での標準モード（--files 明示指定）と --base-ref の実行タイミング（コミット後・push 前限定）がヘルプから誤読できない文言になっている
- [ ] 正規手順（STEP-S3-4、worktree-operations.md L181）との文言の一貫性を確認している

## 元learning item / 根拠

- **要約**: targeted docs guard の --base-ref はコミット前 working tree 未コミット変更を検出しない（ヘルプ文言と実挙動の不整合）
- **根拠**: PR #3074 case-run 実測。対象ファイル 0 件 warning の観察 → コミット後 worktree HEAD での再実行で回収。ヘルプ文言（コミット前想定の案内）と実挙動（git diff ベース・コミット済み差分のみ）の不整合を本評価実行で機械確認（L54-55 vs L215/L589、Design L25-26/L37/L163、STEP-S3-4、worktree-operations.md L181）
- **再発条件**: case-run worktree でコミット前に targeted docs guard を --base-ref で実行した場合（ヘルプ文言現状のままでは正規手順が存在しても再現し得る）
- **横展開可能性**: check_changed_docs.ts を使用する全 workflow（case-run / case-close / docs-check）。ヘルプ文言を読む全利用者に適用

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, enhancement
- **関連Issue**: Issue #3068・Case #3063（PR #3074）。なしの場合は「なし」
