# Windows junction 操作の処理系差分を既存手順へ追記する

## 背景

fs.symlinkSync の相対 target 誤解決で TIM 7件 fail。Git Bash rmdir は拒否され、Remove-Item は NonInteractive で確認プロンプトが生じ得る。

## 問題

worktree 依存整備の junction 操作は実行処理系（cmd mklink / node fs.symlinkSync / Git Bash rmdir / PowerShell Remove-Item / node fs.rmdirSync）によりパス解決基準と削除挙動が異なり、手順例（cmd /c mklink /J の cwd 相対指定・Remove-Item）が node / bash 経由の実行に転記できない

## 望ましい変更

node 経由の fs.symlinkSync は dest ディレクトリ基準解決のため絶対パス指定、junction 削除は node fs.rmdirSync を標準手段化（Remove-Item は NonInteractive で確認プロンプトが出る場合がある）

## 対象範囲

### 対象

- worktree-operations.md「bun test 実行の環境前提」の junction 作成・削除例

### 対象外

- learning-promote による実現先の確定・直接反映

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 候補 | worktree-operations.md「bun test 実行の環境前提」の junction 作成・削除例 | 処理系別の注意と node の正規手段が未記載。 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: worktree-operations.md「bun test 実行の環境前提」の junction 作成・削除例
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 処理系別の注意と node の正規手段が未記載。

## 制約

実現先の最終選択は req-define の変更影響分析が行う。恒久契約候補は backlog-review → req-define 経由で確定する。

## 受け入れ条件

- [ ] 問題クラスの根拠と再発条件を保持する
- [ ] 推奨反映先候補を下流で再調査できる
- [ ] 元 learning item の証拠が本成果物内に保存されている

## 元learning item / 根拠

- **要約**: Windows junction 操作の処理系差分を既存手順へ追記する
- **根拠**: fs.symlinkSync の相対 target 誤解決で TIM 7件 fail。Git Bash rmdir は拒否され、Remove-Item は NonInteractive で確認プロンプトが生じ得る。
- **再発条件**: evaluation-report の問題クラス7および原エントリを参照
- **横展開可能性**: worktree 依存整備全般

### 原エントリ（証跡）

### Inbox 原文 1

## worktree での bun test 依存整備は junction 2 ディレクトリで足りる（削除は node fs.rmdirSync が確実）

- **問題事象**: worktree での bun test 実行には gitignore 対象 node_modules が未伝播のため依存解決失敗が発生する。また検証後の junction 削除は Git Bash の rmdir では「Not a directory」で拒否され、PowerShell Remove-Item は NonInteractive モードで確認プロンプトが出て失敗する
- **発生局面**: 実装（TS-001 bun test 実行の依存整備。Case #3080 case-run / case-close 実行中）
- **検知方法**: 依存解決失敗の fail、junction 削除コマンドの失敗応答
- **根本原因**: 依存解決に必要な package 境界は 2 箇所（agentdev-project-extensions/scripts と repo-* プレフィックス検査基盤 scripts）に限られる。Windows junction の削除はファイルシステム種別に依存したコマンド差分がある
- **自律対応内容**: junction 2 ディレクトリ（`.opencode/skills/repo-agentdev-integrity/scripts/node_modules` と `src/opencode/skills/agentdev-project-extensions/scripts/node_modules`、いずれも main 側実体への junction）の作成で整備し、検証後の削除は node `fs.rmdirSync` を使用（main 側実体は不変）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（QG-4 依存パッケージ前置契約の許容手段 2〔junction 作成〕の実運用確認）
- **横展開観点**: worktree 上で bun test を実行する全 Case の依存整備・後始末の標準手順として横展開可能
- **再発条件**: worktree で bun test を依存未整備のまま実行した場合、または junction を Git Bash / PowerShell 標準コマンドで削除しようとした場合
- **予防策候補**: junction 削除は node `fs.rmdirSync` を標準手段とする旨を agentdev-git-worktree の worktree 構造的制約 reference へ追記する
- **想定反映先**: .opencode/skills/agentdev-git-worktree/references/worktree-operations.md（worktree 構造的制約・依存整備の節）
- **関連**: PR #3082 検証差分、QG-4 依存パッケージ前置
- **タグ**: `#bun-test` `#worktree` `#junction` `#依存整備`

---

### Inbox 原文 2

## Windows node fs.symlinkSync の相対 target は dest ディレクトリ基準で解決される（worktree junction 依存整備の誤リンク）

- **問題事象**: Windows + node での junction 作成（worktree 依存整備の正規手段）で fs.symlinkSync に相対パス target を渡すと、cwd 基準ではなく dest ディレクトリ基準で絶対パス解決され、二重ネストの誤リンク先になる。本実行では worktree 側 junction が誤解決し stat ENOENT → TIM テスト 7 件 fail を一時的に誘発した（絶対パス指定で解消）
- **発生局面**: 実装（Case #3084。PR #3096 Findings learning 候補から回収）
- **検知方法**: worktree 側 junction の stat ENOENT と TIM テスト 7 件 fail の発生確認
- **根本原因**: fs.symlinkSync の相対 target は dest ディレクトリ基準で解決される。worktree 依存整備手順の junction 作成例は cwd 基準相対指定（cmd /c mklink /J）で書かれており、node 経由の場合の解決基準差異が手順記述にない
- **自律対応内容**: 絶対パス指定で junction を再作成し、同一 worktree で TIM テストを再実行して 7 件 fail の解消を確認（整備前後の結果は混在させていない）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存手順の実行形態差異の知見記録のみ）
- **横展開観点**: node 経由で junction/symlink を作る手順は dest ディレクトリ基準の解決を前提に絶対パス指定する。cmd /c mklink /J と fs.symlinkSync の解決基準差異は手順記述時に明記する
- **再発条件**: fs.symlinkSync に相対パス target を渡して junction を作成した場合
- **予防策候補**: worktree 依存整備手順の junction 作成例に node 経由の場合の絶対パス指定を追記
- **想定反映先**: agentdev-git-worktree references worktree-operations.md の bun test 実行環境前提（junction 作成例）
- **関連**: Case #3084、PR #3096、worktree 依存整備
- **タグ**: `#junction` `#symlink` `#windows` `#worktree`

---

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: 原エントリおよび evaluation-report の記載に従う

## 評価スコア（evaluation-report 2026-09-24 抄録）

- **問題クラス**: 7
- **確定処分**: 既存対策の更新 (category 5)
- **加重合計**: 27/40

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（Case #3080・#3084） |
| 影響度 | 3/5 | TIM テスト7件 fail、削除不能による後始末滞留 |
| 横展開性 | 3/5 | worktree 依存整備全般 |
| 反映先明確度 | 5/5 | worktree-operations.md の節を特定 |
| 自動化適性 | 3/5 | 正規コマンドの固定で機械化可能 |
| プロジェクト固有知識再利用性 | 4/5 | Windows worktree 運用の常設知識 |
| 再発可能性 | 3/5 | node / bash 経由実行は頻出 |
| 費用対効果 | 4/5 | 例示補足のみ |

### 判定基礎（evaluation-report verbatim）

### 問題クラス7: Windows junction 操作の処理系差分（作成のパス解決・削除コマンド）
- **根本原因**: worktree 依存整備の junction 操作は実行処理系（cmd mklink / node fs.symlinkSync / Git Bash rmdir / PowerShell Remove-Item / node fs.rmdirSync）によりパス解決基準と削除挙動が異なり、手順例（cmd /c mklink /J の cwd 相対指定・Remove-Item）が node / bash 経由の実行に転記できない
- **再発条件**: 依存整備の junction 作成・削除を手順例と異なる処理系（node・非対話 bash）で実行した場合
- **予防策**: node 経由の fs.symlinkSync は dest ディレクトリ基準解決のため絶対パス指定、junction 削除は node fs.rmdirSync を標準手段化（Remove-Item は NonInteractive で確認プロンプトが出る場合がある）

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（Case #3080・#3084） |
| 影響度 | 3/5 | 誤リンクによる TIM テスト7件 fail、削除不能による後始末滞留 |
| 横展開性 | 3/5 | worktree 依存整備の全 Case |
| 反映先明確度 | 5/5 | worktree-operations.md「bun test 実行の環境前提」の junction 作成・削除例（行番号特定済み） |
| 自動化適性 | 3/5 | 正規コマンドの固定で機械化可能 |
| プロジェクト固有知識再利用性 | 4/5 | Windows worktree 運用の常設知識 |
| 再発可能性 | 3/5 | node / bash 経由実行は頻出 |
| 費用対効果 | 4/5 | 例示補足のみ |
| **加重合計** | **27/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— worktree-operations.md の junction 例は cmd mklink /J（cwd 相対 target）と Remove-Item -LiteralPath で記載され、(a) node fs.symlinkSync 相対 target は dest ディレクトリ基準で解決されること、(b) Git Bash rmdir は「Not a directory」で拒否、Remove-Item は NonInteractive で確認プロンプトが出る場合があること、(c) node fs.rmdirSync が確実な削除手段であること、が未記載（fix gap）。gap 分類: fix gap（処理系別の注意と node 正規手段の追記候補）。Jev は category 4 を示唆したが、当該節は worktree 依存整備の正規手順そのものであり、その手順が node / bash 実行で不成立になる記述欠落は既存手順の不備（category 5）と判定
- **エントリ一覧**: worktree での bun test 依存整備は junction 2 ディレクトリで足りる（削除は node fs.rmdirSync が確実） [inbox] / Windows node fs.symlinkSync の相対 target は dest ディレクトリ基準で解決される [inbox]

