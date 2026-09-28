# worktree・Windows 環境での integrity checker／bun スクリプト起動形の環境前提明記

## 背景
Case #3191・#3192 で3回、checker／検証スクリプトの起動が環境前提の把握不足で初回失敗した
（src 側不在パス指定・MSYS 形式パス・worktree 側 data/ 欠落）。

## 問題
(1) repo-agentdev-integrity の git 追跡実体は .opencode/skills/ 配下のみで worktree へ実ディレクトリ
checkout されるが、worktree-operations.md L173 は「repo-local 実体は worktree 側に存在しない」と
記載し実態と不一致。(2) worktree 側実体は data/ 一部（untracked 分）を欠く。(3) Windows の bun は
MSYS 形式パス（/c/...）を解決しない。

## 望ましい変更
起動形を統一明記する: 実体は .opencode/skills/repo-agentdev-integrity/scripts/、起動は host repo root
を cwd に `bun <path>`（Windows 形式パス C:/...・forward slash）、対象 worktree は `--root` で指定。
worktree の .opencode 状態（ジャンクション/実ディレクトリ/欠落）を前置確認項目とする。

## 対象範囲
### 対象
- src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md（L173 前提の修正・「main root 実体 + --root」節の補強）
- .opencode/skills/repo-agentdev-integrity/SKILL.md（worktree 検査実行手順の環境前提）
### 対象外
- checker 本体の data/ 配置変更

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| 配布skill reference | worktree-operations.md | repo-agentdev-integrity の tracking 実態・data/ 欠落・MSYS パス禁止の追記 |
| repo-local skill | repo-agentdev-integrity/SKILL.md | 起動形契約の環境前提補強 |

## 既存対策確認
- **確認結果**: あり
- **該当ファイル**: worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」・repo-agentdev-integrity SKILL.md「worktree 検査実行手順」
- **ギャップ分類**: fix gap
- **ギャップ詳細**: L173 の存在前提の不正確さ・bun 引数の MSYS 形式禁止・data/ 欠落の未記載

## 制約
--root の forward slash 統一規則（既存）と重複しない形で追記する。

## 受け入れ条件
- [ ] worktree-operations.md の前提記述が実態と一致している
- [ ] MSYS 形式パス禁止と起動形統一が明記されている

## 元learning item / 根拠
- **要約**: checker／bun 起動の環境前提（実体パス・パス形式・data/ リソース）把握不足
- **根拠**: #3192（src 側パスで Module not found→.opencode 側で解消）、#3191×2（/c/... 形式で
  Module not found→C:/... で解消、worktree cwd 起動不能→host root + --root で解消）
- **再発条件**: worktree・Windows+bun 環境での checker・検証スクリプト起動全般
- **横展開可能性**: 他 worktree 利用環境・checker 系全般

## 推奨Issue分類
- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: Case #3191・#3192
