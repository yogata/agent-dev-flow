# Windows 環境の Node.js Dirent 種別判定は junction を symlink として報告しない

## 背景

Epic #4167（REQ-123 構造スリム化）Wave-4（Case #4172・PR #4176）の worktree 環境手順で、junction 復元スクリプトを Node.js readdirSync の Dirent ベースで実装したところ、実在する junction を 0 件と誤判定した（本実行環境 Node v26.12.1 で再現）。pre-push Step 1（鮮度チェック）の失敗実観測と PowerShell `Get-Item` の `LinkType -eq 'Junction'` による再判定での件数不一致で発覚し、訂正後に 55 件を正しく検出・復元した。誤検知ゼロ判定という「静かな失敗」であり、検知が別経路の失敗で行われたことが特徴的である。

## 問題

Windows の junction は readdir の Dirent 種別判定で symlink として報告されない実装差があり、`Dirent.isSymbolicLink()` の戻り値はプラットフォーム・Node 版数依存である。Dirent ベースの列挙で「対象 0 件」を正常系として扱う実装は Windows で静かに失敗する（誤検知ゼロ判定・復元スキップ）。この実装差は既存手順・知識に明示されていない（実測: worktree-operations.md と docs/knowledge/ への grep で Dirent / isSymbolicLink / LinkType の該当記述なし）。

## 望ましい変更

- Windows 環境での junction 判定・列挙は `Dirent.isSymbolicLink()` を使わず、PowerShell `Get-Item` の `LinkType -eq 'Junction'` または `fs.lstatSync` ベースの判定へ統一する規約・知識を整備する
- junction 列挙・復元系スクリプトには期待件数突合（0 件を異常扱いする fail-fast）を追加する観点を明示する
- この実装差を docs/knowledge/ の知識文書として固定する（または worktree-operations.md の junction 手順節への補記）

## 対象範囲

### 対象

- worktree の junction 復元・投影検査・ファイル走査系 checker・スクリプトの junction 判定実装
- docs/knowledge/ の Windows 環境系知識文書（新規作成または既存文書への追記）

### 対象外

- Linux/macOS 環境の symlink 判定
- junction 構造自体の変更（src 正本 → .opencode 投影モデル・b46ab1938 で試験投影は src 側単一正本へ整理済み）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/（新規知識文書・slug 例: windows-junction-detection-not-symlink-in-dirent.md） | `Dirent.isSymbolicLink()` が Windows junction を false と返す実装差、判定方法の統一規約（LinkType / lstatSync ベース）、期待件数突合（fail-fast）の手順 |
| 配布skill | src/common/skills/agentdev-git-worktree/references/worktree-operations.md | junction 作成・削除手順節への「Dirent ベース判定は使用不可・lstatSync / LinkType を使用」の補記 |

（元エントリの想定反映先にあった learning-pipeline は問題クラス分類基準の所有者であり本技術知見の受け皿でないため、adversarial-review accepted finding A-2 により反映先候補から除外した）

## 既存対策確認

- **確認結果**: なし（該当領域）
- **該当ファイル**: なし。worktree-operations.md に junction 作成・削除手順（node fs.symlinkSync 'junction' 型・fs.rmdirSync 正規手段）は存在するが、Dirent 誤判定の警告・判定方法規約はない。docs/knowledge/ にも該当知識なし
- **ギャップ分類**: fix gap
- **ギャップ詳細**: junction 判定方法の規約・誤判定警告が既存手順・知識に欠落

## 制約

- `Dirent.isSymbolicLink()` の戻り値は Node 版数・プラットフォーム依存であり、将来の Node 版数で挙動が変わる可能性がある（本実行環境 Node v26.12.1 での実観測が根拠）
- b46ab1938 により .opencode への試験投影は廃止済みだが、.opencode/skills 実行時表面の投影 junction 自体は実在するため、走査系 checker・スクリプトの junction 対象は残存する

## 受け入れ条件

- [ ] Windows 環境での junction 判定方法（LinkType / lstatSync ベース）が規約・知識として明文化されている
- [ ] junction 列挙・復元系のスクリプト手順に期待件数突合（0 件異常扱い）の観点が含まれている
- [ ] 既存の worktree-operations.md または docs/knowledge/ への反映が backlog-review → req-define 経路で確定している

## 元learning item / 根拠

- **要約**: Windows Node.js Dirent 種別判定の junction 実装差（Dirent.isSymbolicLink() が false を返す）による誤検知ゼロ判定
- **根拠**: Epic #4167 Wave-4（Case #4172・PR #4176）で junction 復元スクリプトの Dirent ベース実装が 0 件誤判定し、PowerShell `Get-Item` `LinkType -eq 'Junction'` による再判定で 55 件を正しく検出・復元した（成果物変更なし）
- **再発条件**: Windows 環境で Node.js readdir Dirent 種別により junction を判定・列挙する実装を書く場合
- **横展開可能性**: Windows + Node.js のファイル走査・リンク検出全般に適用可能な汎用実装差知見

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, knowledge
- **関連Issue**: なし（Root Case #4167 は完了済み・参照のみ）
