# Windows 環境での検証コマンド実行・証跡取得の環境前提ずれ・符号化破壊

## 背景

Windows + PowerShell + bun 環境で checker・検証コマンドを実行する際、出力退避・依存解決・終了コード取得の環境固有の失敗モードが反復している。case-run / case-close の各 gate・QG 検証で証跡欠落・gate 不能・誤判定として発覚し、blocked 再作業を生んできた。8観測が蓄積し、既存知識文書も「規定化待ち」と明記していた。

## 問題

検証・証跡取得の実行契約が、環境固有の失敗モードを明示していない。結果として以下が反復する:

- PowerShell の `>` / `*>` リダイレクト・パイプ受信が UTF-8 出力を cp932 系で再符号化し、JSON 証跡・文字列検索を破壊する
- bun test のレポータ出力が stderr に流れ、stdout 単独の証跡退避で記録がゼロになる
- Bun ランタイム API（Bun.YAML 等）に依存する checker を node 安定実行経路で実行できず fail-closed する
- worktree では node_modules が伝播せず、外部依存（zod 等）を持つ検証スクリプトが bun install 前置なしに実行できない
- pwsh のパイプライン後は $LASTEXITCODE が最終コマンドの終了コードで上書きされ、検証コマンドの成否を読み誤る
- PowerShell の一括読み書き（Get-Content → 加工 → Set-Content）が部分失敗で空書き込みに到達しうる

## 望ましい変更

検証コマンド実行・証跡取得の環境前提を、契約文書へ集約する:

- checker stdout の退避は spawnSync（UTF-8 明示）+ fs.writeFileSync("utf8") を標準とし、PowerShell リダイレクト・パイプ受信を使わない
- bun test の証跡退避は stderr も併退避する
- Bun 依存 checker（Bun.YAML 等 import を持つもの）は bun 経路で実行する
- worktree での検証スクリプト実行は bun install 前置を手順に明記する
- 終了コード判定はパイプを挟まず直接参照する
- 配布物・複数ファイルへの一括書き出しは per-line edit ツール・node スクリプトに限定する

## 対象範囲

### 対象

- checker 実行契約（repo-agentdev-integrity の checker 実行手順・安定実行経路の規定）
- QG-4 bun test 実行形態契約（証跡退避手順）
- worktree 検証手順（bun install 前置・依存前提）
- case-run / case-close の各検証実行手順

### 対象外

- checker・ツールの実装改修そのもの（実装修正は個別 Case の判断）
- Linux/macOS 環境の挙動

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | .opencode/skills/repo-agentdev-integrity 配下の checker 実行契約文書（安定実行経路節） | Bun 依存 checker の bun 実行・stdout 退避形式（spawnSync UTF-8）の環境前提注記 |
| Design | docs/designs/quality/ 配下 QG-4 関連（bun test 実行形態契約） | stderr 併退避・worktree bun install 前置の証跡手順補完 |
| knowledge | docs/knowledge/windows-powershell-bulk-io-corruption.md | 項3（コンソール出力退避）の規定化。checker stdout 面の適用を明記 |
| Design | .opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 依存前置の対象ディレクトリ集合明記（前回 C1 指摘の fix gap） |
| AGENTS.md | AGENTS.md | 既存の PowerShell 一括読み書き警告へのリダイレクト・パイプ面の補記候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（整備不備）
- **該当ファイル**: docs/knowledge/windows-powershell-bulk-io-corruption.md（項3が「規定化に至らず living pool 再評価待ち」と明記）、worktree-operations.md L130・qg-4-final-acceptance.md L244（依存前置規定は agentdev-project-extensions/scripts 1 ディレクトリのみ）、AGENTS.md（一括読み書き警告）
- **ギャップ分類**: fix gap / application miss
- **ギャップ詳細**: 知識文書項3の規定化条件が今回の観測増分で充足された。依存前置の対象ディレクトリ集合が不完全。checker stdout 退避の標準形式が契約に未反映

## 制約

- Windows + junction + bun 環境固有の知識であり、配布物（ADF core）への直接埋め込みは技術固有知識非保持の原則に従う
- 知識文書・Design 注記はプロジェクト側の所有物であれば制約なし

## 受け入れ条件

- [ ] checker stdout の証跡退避手順が spawnSync + UTF-8 writeFileSync 標準として契約文書に明記される
- [ ] bun test の証跡退避に stderr 併退避が含まれる
- [ ] Bun 依存 checker の実行経路区別が checker 実行契約に明記される
- [ ] worktree 検証の依存前置対象が明示される

## 元learning item / 根拠

- **要約**: Windows 環境での検証実行・証跡取得の環境前提ずれが 8 観測で反復（符号化破壊・stderr 流出・実行経路不能・依存未整備・終了コード誤読・一括書き込み破壊）
- **根拠**: PR #2677（Bun.YAML node 不能）、PR #2691（PS リダイレクト符号化破損）、PR #2198（PS 一括読み書き破壊）ほか deferred 6件
- **再発条件**: 新 checker・新 worktree 検証の追加時に暗黙前提で実行する場合
- **横展開可能性**: Windows 環境で checker・検証コマンドを実行する全工程

## 推奨Issue分類

- **分類**: docs_chore（契約・手順文書への注記集約）
- **推奨ラベル**: documentation
- **関連Issue**: なし（Epic #2686 の PR #2691/#2694 由来の学びを含む）
